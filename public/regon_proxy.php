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
        'Content-Type: application/soap+xml; charset=utf-8',
        'SOAPAction: "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/' . $action . '"', 
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

    return $response;
}

try {
    // 1. LOGIN
    $loginXml = '<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:dat="http://CIS/BIR/PUBL/2014/07">
       <soap:Header/>
       <soap:Body>
          <dat:Zaloguj>
             <dat:pKluczUzytkownika>' . $apiKey . '</dat:pKluczUzytkownika>
          </dat:Zaloguj>
       </soap:Body>
    </soap:Envelope>';

    $loginRes = gus_request($url, $loginXml, 'Zaloguj');
    
    if (preg_match('/<ZalogujResult>(.*?)<\/ZalogujResult>/', $loginRes, $matches)) {
        $sid = $matches[1];
    } else {
        throw new Exception("Błąd logowania do GUS (nie znaleziono SID). Info: " . substr(strip_tags($loginRes), 0, 200));
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
    if (preg_match('/<DaneSzukajPodmiotyResult>(.*?)<\/DaneSzukajPodmiotyResult>/', $searchRes, $matches)) {
        $innerXml = html_entity_decode($matches[1]);
        
        if (strpos($innerXml, '<ErrorCode>') !== false) {
             preg_match('/<ErrorMessagePl>(.*?)<\/ErrorMessagePl>/', $innerXml, $errMatches);
             throw new Exception("GUS: " . ($errMatches[1] ?? 'Nieznany błąd danych'));
        }

        // Basic mapping for the UI
        $name = ''; if (preg_match('/<Nazwa>(.*?)<\/Nazwa>/', $innerXml, $m)) $name = $m[1];
        $city = ''; if (preg_match('/<Miejscowosc>(.*?)<\/Miejscowosc>/', $innerXml, $m)) $city = $m[1];
        $street = ''; if (preg_match('/<Ulica>(.*?)<\/Ulica>/', $innerXml, $m)) $street = $m[1];
        $num = ''; if (preg_match('/<NrNieruchomosci>(.*?)<\/NrNieruchomosci>/', $innerXml, $m)) $num = $m[1];
        $post = ''; if (preg_match('/<KodPocztowy>(.*?)<\/KodPocztowy>/', $innerXml, $m)) $post = $m[1];

        echo json_encode([
            'success' => true,
            'data' => [
                'name' => htmlspecialchars_decode($name, ENT_QUOTES),
                'address' => trim(htmlspecialchars_decode("$street $num, $post $city", ENT_QUOTES)),
            ]
        ]);
    } else {
        throw new Exception("GUS nie zwrócił wyników dla podanego NIP.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Błąd Proxy GUS: ' . $e->getMessage()
    ]);
}
