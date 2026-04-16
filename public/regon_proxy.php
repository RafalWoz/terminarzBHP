<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$nip = $_GET['nip'] ?? '';
$key = 'b8abef9133434c1a90c3';
$url = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

function callGus($url, $action, $body) {
    global $sid;
    $envelope = <<<XML
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://www.w3.org/2005/08/addressing">
    <soap:Header>
        <a:Action soap:mustUnderstand="1">$action</a:Action>
        <a:To soap:mustUnderstand="1">$url</a:To>
    </soap:Header>
    <soap:Body>$body</soap:Body>
</soap:Envelope>
XML;

    $ch = curl_init();
    $headers = [
        "Content-Type: application/soap+xml; charset=utf-8; action=\"$action\"",
        'Content-Length: ' . strlen($envelope)
    ];
    if (isset($sid)) {
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

// 1. LOGIN
$loginAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj';
$loginBody = '<Zaloguj xmlns="http://CIS/BIR/PUBL/2014/07"><pKluczUzytkownika>' . $key . '</pKluczUzytkownika></Zaloguj>';
$loginResp = callGus($url, $loginAction, $loginBody);

if (preg_match('/<ZalogujResult[^>]*>(.*)<\/ZalogujResult>/', $loginResp, $matches)) {
    $sid = $matches[1];
    
    // 2. SEARCH
    $searchAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty';
    // Kluczowa zmiana: używamy domyślnego namespace bez prefiksów ns/dat
    $searchBody = <<<XML
<DaneSzukajPodmioty xmlns="http://CIS/BIR/PUBL/2014/07">
    <pParametryWyszukiwania>
        <Nip>$nip</Nip>
    </pParametryWyszukiwania>
</DaneSzukajPodmioty>
XML;

    $searchResp = callGus($url, $searchAction, $searchBody);
    $log .= "SEARCH RESPONSE: $searchResp\n";
    
    if (preg_match('/<DaneSzukajPodmiotyResult[^>]*>(.*)<\/DaneSzukajPodmiotyResult>/s', $searchResp, $matches) && !empty($matches[1])) {
        $xmlData = html_entity_decode($matches[1]);
        $xml = @simplexml_load_string($xmlData);
        if ($xml && $xml->dane) {
             $d = $xml->dane;
             echo json_encode(['success' => true, 'data' => [
                 'name' => (string)$d->Nazwa,
                 'address' => trim((string)$d->Ulica . ' ' . (string)$d->NrNieruchomosci . ((string)$d->NrLokalu ? '/'.(string)$d->NrLokalu : '') . ', ' . (string)$d->KodPocztowy . ' ' . (string)$d->Miejscowosc)
             ]]);
             exit;
        }
    }
}

file_put_contents('gus_debug.txt', $log, FILE_APPEND);
echo json_encode(['error' => 'GUS nie zwrócił danych dla tego NIP.', 'debug_hint' => 'Sprawdź logi na serwerze.']);
