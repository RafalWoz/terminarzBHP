<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$nip = $_GET['nip'] ?? '';
$key = 'b8abef9133434c1a90c3';
$url = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

if (!$nip || strlen($nip) !== 10) {
    echo json_encode(['error' => 'Podaj poprawny 10-cyfrowy NIP.']);
    exit;
}

function callGus($url, $action, $body, $sid = null) {
    $envelope = <<<XML
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ns="http://CIS/BIR/PUBL/2014/07" xmlns:dat="http://CIS/BIR/PUBL/2014/07/datacontract">
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
        "SOAPAction: \"$action\"", // Dla kompatybilności hybrydowej
        "Content-Length: " . strlen($envelope),
        "Accept: application/xop+xml"
    ];
    if ($sid) {
        $headers[] = "sid: $sid";
        $headers[] = "Sid: $sid";
        $headers[] = "Cookie: sid=$sid"; // Niektóre load-balancery GUS tego wymagają
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

// 1. LOGIN
$loginAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj';
$loginBody = '<ns:Zaloguj><ns:pKluczUzytkownika>' . $key . '</ns:pKluczUzytkownika></ns:Zaloguj>';
$loginResp = callGus($url, $loginAction, $loginBody);

if (preg_match('/<ZalogujResult[^>]*>(.*)<\/ZalogujResult>/', $loginResp, $matches)) {
    $sid = trim($matches[1]);
    
    // 2. SEARCH
    $searchAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty';
    $searchBody = <<<XML
<ns:DaneSzukajPodmioty>
    <ns:pParametryWyszukiwania>
        <dat:Nip>$nip</dat:Nip>
    </ns:pParametryWyszukiwania>
</ns:DaneSzukajPodmioty>
XML;

    $searchResp = callGus($url, $searchAction, $searchBody, $sid);
    
    if (preg_match('/<DaneSzukajPodmiotyResult[^>]*>(.*)<\/DaneSzukajPodmiotyResult>/s', $searchResp, $matches)) {
        $resultStr = html_entity_decode($matches[1]);
        if (!empty($resultStr) && strpos($resultStr, '<dane>') !== false) {
            $xml = @simplexml_load_string($resultStr);
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
}

echo json_encode(['error' => 'GUS nie zwrócił danych. Możliwa przerwa techniczna lub błędny klucz.']);
