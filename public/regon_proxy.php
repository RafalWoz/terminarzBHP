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
    // BIR 1.1 Action Header is different from To Header often
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
        'Content-Type: application/soap+xml; charset=utf-8',
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
$loginBody = "<ns:Zaloguj><ns:pKluczUzytkownika>$key</ns:pKluczUzytkownika></ns:Zaloguj>";
$loginResp = callGus($url, 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj', $loginBody);

if (preg_match('/<ZalogujResult>(.*)<\/ZalogujResult>/', $loginResp, $matches)) {
    $sid = $matches[1];
} else {
    echo json_encode(['error' => 'Błąd logowania do GUS. Serwer zwrócił: ' . strip_tags($loginResp)]);
    exit;
}

// 2. Szukaj (Zmieniony format dla BIR 1.1)
$searchBody = <<<XML
<ns:DaneSzukajPodmioty>
    <ns:pParametryWyszukiwania>
        <ns:Nip>$nip</ns:Nip>
    </ns:pParametryWyszukiwania>
</ns:DaneSzukajPodmioty>
XML;

$searchResp = callGus($url, 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty', $searchBody, $sid);

// Parsowanie wyniku
if (preg_match('/<DaneSzukajPodmiotyResult>(.*)<\/DaneSzukajPodmiotyResult>/s', $searchResp, $matches)) {
    $xmlData = html_entity_decode($matches[1]);
    $xml = @simplexml_load_string($xmlData);
    
    if ($xml && $xml->dane) {
        $d = $xml->dane;
        
        // Sprawdzenie czy nie ma błędu wewnątrz danych (np. brak podmiotu)
        if (isset($d->ErrorCode)) {
            echo json_encode(['error' => 'Błąd GUS: ' . (string)$d->ErrorMessagePl]);
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
        echo json_encode(['error' => 'GUS nie zwrócił danych. Surowa odpowiedź: ' . strip_tags($searchResp)]);
    }
} else {
    // Zwracamy więcej info o błędzie jeśli regex zawiedzie
    $errorMsg = 'Błąd wyszukiwania w GUS.';
    if (strpos($searchResp, 'faultstring') !== false) {
        preg_match('/<faultstring>(.*)<\/faultstring>/', $searchResp, $fMatches);
        $errorMsg .= ' Powód: ' . ($fMatches[1] ?? 'Nieznany SOAP Fault');
    }
    echo json_encode(['error' => $errorMsg, 'debug' => strip_tags($searchResp)]);
}

// 3. Wyloguj
$logoutBody = "<ns:Wyloguj><ns:pIdSesji>$sid</ns:pIdSesji></ns:Wyloguj>";
callGus($url, 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj', $logoutBody, $sid);
