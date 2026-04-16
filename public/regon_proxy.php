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
        // Kluczowe dla SOAP 1.2: Action musi być w Content-Type
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
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);
    
    return $response ?: "CURL_ERROR: $error";
}

// 1. Zaloguj
$loginAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj';
$loginBody = "<ns:Zaloguj><ns:pKluczUzytkownika>$key</ns:pKluczUzytkownika></ns:Zaloguj>";
$loginResp = callGus($url, $loginAction, $loginBody);

if (preg_match('/<ZalogujResult>(.*)<\/ZalogujResult>/', $loginResp, $matches)) {
    $sid = $matches[1];
} else {
    echo json_encode(['error' => 'Błąd logowania do GUS.', 'debug' => strip_tags($loginResp)]);
    exit;
}

// 2. Szukaj
$searchAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty';
$searchBody = <<<XML
<ns:DaneSzukajPodmioty>
    <ns:pParametryWyszukiwania>
        <ns:Nip>$nip</ns:Nip>
    </ns:pParametryWyszukiwania>
</ns:DaneSzukajPodmioty>
XML;

$searchResp = callGus($url, $searchAction, $searchBody, $sid);

// Parsowanie wyniku
if (preg_match('/<DaneSzukajPodmiotyResult>(.*)<\/DaneSzukajPodmiotyResult>/s', $searchResp, $matches)) {
    $xmlData = html_entity_decode($matches[1]);
    $xml = @simplexml_load_string($xmlData);
    
    if ($xml && $xml->dane) {
        $d = $xml->dane;
        
        if (isset($d->ErrorCode)) {
            echo json_encode(['error' => 'GUS zwrócił błąd: ' . (string)$d->ErrorMessagePl]);
            exit;
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'name' => (string)$d->Nazwa,
                'nip' => (string)$d->Nip,
                'address' => trim((string)$d->Ulica . ' ' . (string)$d->NrNieruchomosci . ((string)$d->NrLokalu ? '/'.(string)$d->NrLokalu : '') . ', ' . (string)$d->KodPocztowy . ' ' . (string)$d->Miejscowosc)
            ]
        ]);
    } else {
        echo json_encode(['error' => 'GUS nie zwrócił danych podmiotu.', 'debug' => strip_tags($searchResp)]);
    }
} else {
    // Diagnostyka błędu SOAP
    $debugInfo = strip_tags($searchResp);
    if (strpos($searchResp, 'faultstring') !== false) {
        preg_match('/<faultstring>(.*)<\/faultstring>/', $searchResp, $fMatches);
        $debugInfo = 'SOAP Fault: ' . ($fMatches[1] ?? 'Unknown');
    }
    echo json_encode(['error' => 'Błąd wyszukiwania w GUS.', 'debug' => $debugInfo]);
}

// 3. Wyloguj
$logoutAction = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj';
$logoutBody = "<ns:Wyloguj><ns:pIdSesji>$sid</ns:pIdSesji></ns:Wyloguj>";
callGus($url, $logoutAction, $logoutBody, $sid);
