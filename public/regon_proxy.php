<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if (!class_exists('SoapClient')) {
    echo json_encode(['error' => 'Serwer nie posiada zainstalowanego modułu SoapClient. Skontaktuj się z administratorem LH.pl.']);
    exit;
}

$nip = $_GET['nip'] ?? '';
$key = 'b8abef9133434c1a90c3';
$wsdl = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/wsdl/UslugaBIRzewnPubl-ver11-prod.wsdl';
$url = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

if (!$nip || strlen($nip) !== 10) {
    echo json_encode(['error' => 'Podaj poprawny 10-cyfrowy NIP.']);
    exit;
}

try {
    // Inicjalizacja klienta SOAP
    $client = new SoapClient($wsdl, [
        'soap_version' => SOAP_1_2,
        'trace' => true,
        'location' => $url,
        'stream_context' => stream_context_create([
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
        ])
    ]);

    // 1. ZALOGUJ
    $loginResult = $client->Zaloguj(['pKluczUzytkownika' => $key]);
    $sid = $loginResult->ZalogujResult;

    if (!$sid) {
        throw new Exception("Błąd autoryzacji w GUS (brak SID).");
    }

    // Dodanie SID do nagłówków dla kolejnych zapytań
    $client->__setSoapHeaders([
        new SoapHeader('http://CIS/BIR/2014/07', 'sid', $sid)
    ]);
    
    // PHP SoapClient nie zawsze dodaje sid do HTTP headers automatycznie, 
    // dla GUS BIR1.1 musimy go dodać ręcznie do kontekstu streamu lub przez __setCookie
    // Jednak najprostszą metodą dla wielu jest po prostu wysłanie go w __setSoapHeaders (niektóre wersje)
    // ALE GUS BIR1.1 wymaga go w nagłówku HTTP SID.
    
    // Re-inicjalizacja z nagłówkiem profilu SID
    $client = new SoapClient($wsdl, [
        'soap_version' => SOAP_1_2,
        'trace' => true,
        'location' => $url,
        'stream_context' => stream_context_create([
            'http' => ['header' => "sid: $sid\r\n"],
            'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
        ])
    ]);

    // 2. SZUKAJ
    $params = [
        'pParametryWyszukiwania' => [
            'Nip' => $nip
        ]
    ];
    
    $searchResult = $client->DaneSzukajPodmioty($params);
    $xmlStr = $searchResult->DaneSzukajPodmiotyResult;

    if (empty($xmlStr)) {
        echo json_encode(['error' => 'GUS nie zwrócił danych dla tego NIP (wynik pusty).']);
    } else {
        $xml = simplexml_load_string($xmlStr);
        if ($xml && $xml->dane) {
            $d = $xml->dane;
            
            if (isset($d->ErrorCode)) {
                echo json_encode(['error' => 'GUS: ' . (string)$d->ErrorMessagePl]);
            } else {
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'name' => (string)$d->Nazwa,
                        'address' => trim((string)$d->Ulica . ' ' . (string)$d->NrNieruchomosci . ((string)$d->NrLokalu ? '/'.(string)$d->NrLokalu : '') . ', ' . (string)$d->KodPocztowy . ' ' . (string)$d->Miejscowosc)
                    ]
                ]);
            }
        } else {
            echo json_encode(['error' => 'Błąd parsowania danych z GUS.', 'raw' => $xmlStr]);
        }
    }

    // 3. WYLOGUJ
    $client->Wyloguj(['pIdSesji' => $sid]);

} catch (Exception $e) {
    echo json_encode([
        'error' => 'Błąd połączenia z GUS (SOAP): ' . $e->getMessage()
    ]);
}
