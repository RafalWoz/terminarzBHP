<?php
/**
 * TerminyBHP - GUS (REGON) Proxy (Production Version)
 * Located in public/ so it gets bundled with Vite build.
 * Uses cURL to avoid SoapClient dependency issues on shared hosting.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: GET');

$nip = filter_input(INPUT_GET, 'nip', FILTER_SANITIZE_STRING);

if (!$nip || strlen($nip) !== 10) {
    echo json_encode(['error' => 'Podaj 10-cyfrowy NIP']);
    exit;
}

// --- CONFIGURATION ---
$configFile = __DIR__ . '/regon_config.php';
$config = file_exists($configFile) ? require($configFile) : [];

$apiKey = $config['api_key'] ?? 'abcde12345abcde12345';
$env = $config['env'] ?? 'test';

$url = $env === 'prod' 
    ? 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc' 
    : 'https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

/**
 * Perform a cURL SOAP request
 */
function gus_request($url, $xml, $action, $sid = null) {
    $ch = curl_init($url);
    $headers = [
        'Content-Type: application/soap+xml; charset=utf-8; action="http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/' . $action . '"',
    ];

    if ($sid) {
        $headers[] = "sid: $sid";
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($error) throw new Exception("cURL Error: $error");
    if ($httpCode >= 400) {
        $fault = strip_tags($response);
        throw new Exception("GUS Server Error (HTTP $httpCode): " . substr($fault, 0, 500));
    }

    // GUS may return MTOM/XOP multipart response — extract the SOAP XML part
    if (strpos($response, '--uuid:') === 0 || strpos($response, "\r\n--uuid:") !== false) {
        // Find the XML body between MIME headers and boundary
        $parts = preg_split('/\r?\n\r?\n/', $response, 3);
        if (isset($parts[1])) {
            $xmlPart = $parts[1];
            // Remove trailing MIME boundary
            $boundaryPos = strrpos($xmlPart, "\r\n--uuid:");
            if ($boundaryPos === false) $boundaryPos = strrpos($xmlPart, "\n--uuid:");
            if ($boundaryPos !== false) {
                $xmlPart = substr($xmlPart, 0, $boundaryPos);
            }
            $response = trim($xmlPart);
        }
    }

    return $response;
}

try {
    // 1. LOGIN
    $loginXml = '<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                   xmlns:wsa="http://www.w3.org/2005/08/addressing"
                   xmlns:dat="http://CIS/BIR/PUBL/2014/07">
       <soap:Header>
          <wsa:To>' . $url . '</wsa:To>
          <wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj</wsa:Action>
       </soap:Header>
       <soap:Body>
          <dat:Zaloguj>
             <dat:pKluczUzytkownika>' . $apiKey . '</dat:pKluczUzytkownika>
          </dat:Zaloguj>
       </soap:Body>
    </soap:Envelope>';

    $loginRes = gus_request($url, $loginXml, 'Zaloguj');

    if (preg_match('/<(?:[a-z0-9]+:)?ZalogujResult[^>]*>(.*?)<\/(?:[a-z0-9]+:)?ZalogujResult>/si', $loginRes, $matches)) {
        $sid = $matches[1];
    } else {
        throw new Exception("Błąd logowania do GUS (nie znaleziono SID). Info: " . substr(strip_tags($loginRes), 0, 300));
    }

    if (!$sid || strlen($sid) < 4) {
        throw new Exception("GUS zwrócił pusty identyfikator sesji. Sprawdź poprawność klucza API.");
    }

    // 2. SEARCH
    $searchXml = '<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:dat="http://CIS/BIR/PUBL/2014/07">
       <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
          <wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty</wsa:Action>
          <wsa:To>' . $url . '</wsa:To>
       </soap:Header>
       <soap:Body>
          <dat:DaneSzukajPodmioty>
             <dat:pParametryWyszukiwania>
                <dat:Nip>' . $nip . '</dat:Nip>
             </dat:pParametryWyszukiwania>
          </dat:DaneSzukajPodmioty>
       </soap:Body>
    </soap:Envelope>';

    $searchRes = gus_request($url, $searchXml, 'DaneSzukajPodmioty', $sid);

    // 3. PARSE RESULT
    if (preg_match('/<(?:[a-z0-9]+:)?DaneSzukajPodmiotyResult[^>]*>(.*?)<\/(?:[a-z0-9]+:)?DaneSzukajPodmiotyResult>/si', $searchRes, $matches)) {
        $innerXml = html_entity_decode($matches[1], ENT_QUOTES | ENT_XML1, 'UTF-8');

        if (strpos($innerXml, '<ErrorCode>') !== false) {
             preg_match('/<ErrorMessagePl>(.*?)<\/ErrorMessagePl>/s', $innerXml, $errMatches);
             throw new Exception("GUS: " . ($errMatches[1] ?? 'Nieznany błąd danych'));
        }

        if (trim($innerXml) === '') {
            throw new Exception("GUS nie znalazł firmy o podanym NIP (wynik pusty).");
        }

        $name = ''; if (preg_match('/<Nazwa>(.*?)<\/Nazwa>/s', $innerXml, $m)) $name = $m[1];
        $city = ''; if (preg_match('/<Miejscowosc>(.*?)<\/Miejscowosc>/s', $innerXml, $m)) $city = $m[1];
        $street = ''; if (preg_match('/<Ulica>(.*?)<\/Ulica>/s', $innerXml, $m)) $street = $m[1];
        $num = ''; if (preg_match('/<NrNieruchomosci>(.*?)<\/NrNieruchomosci>/s', $innerXml, $m)) $num = $m[1];
        $post = ''; if (preg_match('/<KodPocztowy>(.*?)<\/KodPocztowy>/s', $innerXml, $m)) $post = $m[1];

        echo json_encode([
            'success' => true,
            'data' => [
                'name' => htmlspecialchars_decode($name, ENT_QUOTES),
                'address' => trim(htmlspecialchars_decode("$street $num, $post $city", ENT_QUOTES)),
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        throw new Exception("GUS nie zwrócił wyników. Odpowiedź: " . substr(strip_tags($searchRes), 0, 300));
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Błąd Proxy GUS: ' . $e->getMessage()
    ]);
}
