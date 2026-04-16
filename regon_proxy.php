<?php
/**
 * TerminyBHP - GUS (REGON) Proxy
 * Robust cURL implementation to avoid SoapClient dependency issues.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Adjust for production security if needed
header('Access-Control-Allow-Methods: GET');

$nip = filter_input(INPUT_GET, 'nip', FILTER_SANITIZE_STRING);

if (!$nip || strlen($nip) !== 10) {
    echo json_encode(['error' => 'Podaj 10-cyfrowy NIP']);
    exit;
}

$apiKey = 'abcde12345abcde12345'; 
$url = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc'; 

/**
 * Perform a cURL SOAP request
 */
function gus_request($url, $xml, $sid = null) {
    $ch = curl_init($url);
    $headers = [
        'Content-Type: application/soap+xml; charset=utf-8',
        'SOAPAction: "http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj"', // Default action
    ];
    
    if ($sid) {
        $headers[] = "sid: $sid";
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $xml);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Some hostings have SSL issues

    $response = curl_exec($ch);
    $error = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($error) throw new Exception("cURL Error: $error");
    if ($httpCode >= 400) throw new Exception("GUS Server Error (HTTP $httpCode)");

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

    $loginRes = gus_request($url, $loginXml);
    
    if (preg_match('/<ZalogujResult>(.*?)<\/ZalogujResult>/', $loginRes, $matches)) {
        $sid = $matches[1];
    } else {
        throw new Exception("Błąd logowania do GUS (nie znaleziono SID)");
    }

    if (!$sid || strlen($sid) < 4) {
        throw new Exception("GUS zwrócił pusty identyfikator sesji. Klucz API może być nieaktywny.");
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

    $searchRes = gus_request($url, $searchXml, $sid);

    // 3. PARSE RESULT
    // GUS returns XML inside XML as a string. We need to decode it.
    if (preg_match('/<DaneSzukajPodmiotyResult>(.*?)<\/DaneSzukajPodmiotyResult>/', $searchRes, $matches)) {
        $innerXml = html_entity_decode($matches[1]);
        
        if (strpos($innerXml, '<ErrorCode>') !== false) {
             preg_match('/<ErrorMessagePl>(.*?)<\/ErrorMessagePl>/', $innerXml, $errMatches);
             throw new Exception("Błąd GUS: " . ($errMatches[1] ?? 'Nieznany błąd danych'));
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
                'name' => $name,
                'address' => trim("$street $num, $post $city"),
                'raw' => $innerXml // For debugging
            ]
        ]);
    } else {
        throw new Exception("GUS nie zwrócił wyników dla podanego NIP.");
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Błąd połączenia z GUS (cURL/Proxy): ' . $e->getMessage()
    ]);
}
