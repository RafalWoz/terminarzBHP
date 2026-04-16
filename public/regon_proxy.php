<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$nip = $_GET['nip'] ?? '';
$key = 'b8abef9133434c1a90c3';
$url = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

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

// 1. Zaloguj
$loginAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj';
$loginBody = '<ns:Zaloguj><ns:pKluczUzytkownika>' . $key . '</ns:pKluczUzytkownika></ns:Zaloguj>';
$loginResp = callGus($url, $loginAction, $loginBody);

if (preg_match('/<ZalogujResult[^>]*>(.*)<\/ZalogujResult>/', $loginResp, $matches)) {
    $sid = $matches[1];
    
    // 2. Szukaj (Precyzyjna struktura dla BIR 1.1)
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
        $xmlData = html_entity_decode($matches[1]);
        $xml = @simplexml_load_string($xmlData);
        if ($xml && $xml->dane) {
             $d = $xml->dane;
             
             // Parsowanie wyniku zależnie od typu (osoba fizyczna vs firma)
             $name = (string)$d->Nazwa;
             $street = (string)$d->Ulica;
             $house = (string)$d->NrNieruchomosci;
             $flat = (string)$d->NrLokalu;
             $zip = (string)$d->KodPocztowy;
             $city = (string)$d->Miejscowosc;
             
             $address = "$street $house" . ($flat ? "/$flat" : "") . ", $zip $city";

             echo json_encode(['success' => true, 'data' => [
                 'name' => $name,
                 'address' => trim($address, ' ,')
             ]]);
             
             // Wyloguj
             $logoutAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj';
             $logoutBody = '<ns:Wyloguj><ns:pIdSesji>' . $sid . '</ns:pIdSesji></ns:Wyloguj>';
             callGus($url, $logoutAction, $logoutBody, $sid);
             exit;
        }
    }
}

echo json_encode(['error' => 'Nie znaleziono danych w bazie GUS.']);
