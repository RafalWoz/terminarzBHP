<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

$nip = $_GET['nip'] ?? '';
if (!$nip || !preg_match('/^[0-9]{10}$/', $nip)) {
    echo json_encode(['error' => 'Niepoprawny numer NIP.']);
    exit;
}

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

$debug = [];

// 1. ZALOGUJ
$loginAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj';
$loginBody = "<ns:Zaloguj><ns:pKluczUzytkownika>$key</ns:pKluczUzytkownika></ns:Zaloguj>";
$loginResp = callGus($url, $loginAction, $loginBody);

$debug['login_raw'] = $loginResp;

// Elastyczny regex dla sid (GUS często dodaje xmlns do taga)
if (preg_match('/<ZalogujResult[^>]*>(.*)<\/ZalogujResult>/', $loginResp, $matches)) {
    $sid = $matches[1];
} else {
    echo json_encode(['error' => 'Błąd logowania (SID).', 'debug' => $debug]);
    exit;
}

// 2. SZUKAJ
$searchAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty';
// Używamy precyzyjnego namespace dla parametrów wyszukiwania (datacontract)
$searchBody = <<<XML
<ns:DaneSzukajPodmioty>
    <ns:pParametryWyszukiwania>
        <dat:Nip xmlns:dat="http://CIS/BIR/PUBL/2014/07/datacontract">$nip</dat:Nip>
    </ns:pParametryWyszukiwania>
</ns:DaneSzukajPodmioty>
XML;

$searchResp = callGus($url, $searchAction, $searchBody, $sid);
$debug['search_raw'] = $searchResp;

// Próba odczytu wyniku
if (preg_match('/<DaneSzukajPodmiotyResult[^>]*>(.*)<\/DaneSzukajPodmiotyResult>/s', $searchResp, $matches)) {
    $xmlData = html_entity_decode($matches[1]);
    $xml = @simplexml_load_string($xmlData);
    
    if ($xml && $xml->dane) {
        $d = $xml->dane;
        if (isset($d->ErrorCode)) {
            echo json_encode(['error' => 'GUS ErrorCode: ' . (string)$d->ErrorCode, 'msg' => (string)$d->ErrorMessagePl]);
            exit;
        }
        echo json_encode([
            'success' => true,
            'data' => [
                'name' => (string)$d->Nazwa,
                'address' => trim((string)$d->Ulica . ' ' . (string)$d->NrNieruchomosci . ((string)$d->NrLokalu ? '/'.(string)$d->NrLokalu : '') . ', ' . (string)$d->KodPocztowy . ' ' . (string)$d->Miejscowosc)
            ]
        ]);
        // Wyloguj w tle (nie sprawdzamy wyniku)
        $logoutBody = "<ns:Wyloguj><ns:pIdSesji>$sid</ns:pIdSesji></ns:Wyloguj>";
        callGus($url, 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj', $logoutBody, $sid);
        exit;
    }
}

// Jeśli tu dotarliśmy, coś poszło nie tak - zwracamy pełny debug
echo json_encode([
    'error' => 'Błąd wyszukiwania (DEBUG).',
    'debug' => $debug
]);
