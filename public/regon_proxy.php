<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$nip = $_GET['nip'] ?? '';
$key = 'b8abef9133434c1a90c3';
$url = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

function callGus($url, $action, $body, $sid = null) {
    $envelope = <<<XML
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://CIS/BIR/PUBL/2014/07">
    <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
        <wsa:Action>$action</wsa:Action>
        <wsa:To>$url</wsa:To>
    </soap:Header>
    <soap:Body>$body</soap:Body>
</soap:Envelope>
XML;

    $ch = curl_init();
    $headers = [
        "Content-Type: application/soap+xml; charset=utf-8; action=\"$action\"",
        'Content-Length: ' . strlen($envelope)
    ];
    if ($sid) {
        $headers[] = "sid: $sid";
    }

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $envelope);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

$log = "--- START LOG " . date('Y-m-d H:i:s') . " ---\n";
$log .= "NIP: $nip\n";

// 1. LOGIN
$loginAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj';
$loginBody = "<ns:Zaloguj><ns:pKluczUzytkownika>$key</ns:pKluczUzytkownika></ns:Zaloguj>";
$loginResp = callGus($url, $loginAction, $loginBody);

$log .= "LOGIN RESPONSE: $loginResp\n";

if (preg_match('/<ZalogujResult[^>]*>(.*)<\/ZalogujResult>/', $loginResp, $matches)) {
    $sid = $matches[1];
    $log .= "SID: $sid\n";
    
    // 2. SEARCH
    $searchAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty';
    $searchBody = <<<XML
<ns:DaneSzukajPodmioty>
    <ns:pParametryWyszukiwania>
        <dat:Nip xmlns:dat="http://CIS/BIR/PUBL/2014/07/datacontract">$nip</dat:Nip>
    </ns:pParametryWyszukiwania>
</ns:DaneSzukajPodmioty>
XML;

    $searchResp = callGus($url, $searchAction, $searchBody, $sid);
    $log .= "SEARCH RESPONSE: $searchResp\n";
    
    if (preg_match('/<DaneSzukajPodmiotyResult[^>]*>(.*)<\/DaneSzukajPodmiotyResult>/s', $searchResp, $matches)) {
        $xmlData = html_entity_decode($matches[1]);
        $xml = @simplexml_load_string($xmlData);
        if ($xml && $xml->dane) {
             $d = $xml->dane;
             echo json_encode(['success' => true, 'data' => ['name' => (string)$d->Nazwa]]);
        } else {
             echo json_encode(['error' => 'No data found in XML', 'xml' => $xmlData]);
        }
    } else {
        echo json_encode(['error' => 'No DaneSzukajPodmiotyResult found']);
    }

} else {
    echo json_encode(['error' => 'Login failed']);
}

file_put_contents('gus_debug.txt', $log, FILE_APPEND);
echo "\n--- LOG SAVED TO gus_debug.txt ---"; 
