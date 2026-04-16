<?php
/**
 * TerminyBHP - GUS (REGON/BIR 1.1) Proxy
 *
 * Robust cURL-based implementation that avoids the PHP SoapClient extension,
 * which is often unstable on shared hosting (LH.pl, etc.) and was the source
 * of the recurring "Błąd połączenia z GUS (SOAP): Internal Server Error".
 *
 * Flow:
 *  1. Zaloguj      -> returns session id (SID)
 *  2. DaneSzukajPodmioty (by NIP) with sid: header -> returns XML-in-XML
 *  3. Parse the inner XML, return JSON to the frontend
 *  4. Wyloguj (best-effort)
 *
 * Environment:
 *  - GUS_ENV=test (default) uses the public test endpoint + test key,
 *    which works out-of-the-box. Test data only contains a small set of
 *    fictional NIPs.
 *  - GUS_ENV=prod requires a real API key from https://api.stat.gov.pl.
 *    Set GUS_API_KEY env variable on the hosting panel.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ---------- Configuration ----------------------------------------------------
//
// Konfigurację (środowisko + klucz) można podać na trzy sposoby - proxy bierze
// pierwszą dostępną w tej kolejności:
//
//   1. Plik `regon_config.php` obok tego pliku (np. wgrany przez FTP, nie
//      commituj go do repo!). Przykładowa zawartość:
//
//          <?php
//          return [
//              'env'     => 'prod',
//              'api_key' => 'twoj-klucz-z-api.stat.gov.pl',
//          ];
//
//   2. Zmienne środowiskowe GUS_ENV i GUS_API_KEY - panel LH.pl albo
//      wpis `SetEnv GUS_ENV prod` / `SetEnv GUS_API_KEY ...` w .htaccess.
//
//   3. Brak konfiguracji => środowisko testowe GUS z publicznym kluczem
//      (działa od ręki, ale tylko dla fikcyjnych NIP-ów z bazy testowej).

$env    = '';
$apiKey = '';

$configFile = __DIR__ . '/regon_config.php';
if (is_file($configFile)) {
    $cfg = @include $configFile;
    if (is_array($cfg)) {
        $env    = isset($cfg['env'])     ? (string) $cfg['env']     : '';
        $apiKey = isset($cfg['api_key']) ? (string) $cfg['api_key'] : '';
    }
}

if ($env === '')    { $env    = getenv('GUS_ENV')     ?: ''; }
if ($apiKey === '') { $apiKey = getenv('GUS_API_KEY') ?: ''; }
if ($env === '')    { $env    = 'test'; }

if ($env === 'prod') {
    $wsdlUrl    = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/wsdl/UslugaBIRzewnPubl-ver11-prod.wsdl';
    $serviceUrl = 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';
    if ($apiKey === '') {
        http_response_code(500);
        echo json_encode([
            'error' => 'Brak klucza produkcyjnego GUS. Utwórz regon_config.php obok proxy lub ustaw zmienną GUS_API_KEY.',
        ]);
        exit;
    }
} else {
    // Publiczne środowisko testowe GUS BIR 1.1 (klucz ogólnodostępny).
    $wsdlUrl    = 'https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/wsdl/UslugaBIRzewnPubl-ver11-test.wsdl';
    $serviceUrl = 'https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';
    if ($apiKey === '') {
        $apiKey = 'abcde12345abcde12345'; // publiczny klucz testowy
    }
}

// ---------- Input validation -------------------------------------------------

$nip = isset($_GET['nip']) ? preg_replace('/\D+/', '', $_GET['nip']) : '';

if (strlen($nip) !== 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Podaj poprawny 10-cyfrowy NIP.']);
    exit;
}

// ---------- SOAP helpers -----------------------------------------------------

/**
 * Wysyła zapytanie SOAP 1.2 do usługi GUS BIR.
 *
 * @param string      $url        Endpoint usługi
 * @param string      $soapAction Pełna wartość akcji WS-Addressing (np. .../Zaloguj)
 * @param string      $xml        Koperta SOAP
 * @param string|null $sid        Identyfikator sesji (dla zapytań po zalogowaniu)
 *
 * @return string Treść odpowiedzi HTTP
 * @throws Exception przy błędach sieciowych / HTTP >= 400
 */
function gus_soap_call($url, $soapAction, $xml, $sid = null) {
    $ch = curl_init($url);

    // SOAP 1.2 => Content-Type z parametrem action (zamiast nagłówka SOAPAction).
    $headers = [
        'Content-Type: application/soap+xml; charset=utf-8; action="' . $soapAction . '"',
        'Accept: application/soap+xml, text/xml, */*',
    ];
    if ($sid) {
        $headers[] = 'sid: ' . $sid;
    }

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $xml,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
        CURLOPT_USERAGENT      => 'TerminyBHP/1.0 (+https://terminybhp.pl)',
    ]);

    $response = curl_exec($ch);
    $errno    = curl_errno($ch);
    $error    = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($errno) {
        throw new Exception('Błąd sieci (' . $errno . '): ' . $error);
    }
    if ($httpCode >= 400) {
        // GUS potrafi zwrócić SOAP Fault z HTTP 500 - wyciągamy <faultstring>, jeśli jest.
        $fault = '';
        if ($response && preg_match('#<(?:[a-z0-9]+:)?faultstring[^>]*>(.*?)</(?:[a-z0-9]+:)?faultstring>#is', $response, $m)) {
            $fault = ': ' . trim(html_entity_decode($m[1], ENT_QUOTES | ENT_XML1, 'UTF-8'));
        }
        throw new Exception('GUS odrzucił żądanie (HTTP ' . $httpCode . ')' . $fault);
    }
    if ($response === false || $response === '') {
        throw new Exception('Pusta odpowiedź z GUS.');
    }

    return $response;
}

/**
 * Wyciąga pojedynczy węzeł z (poprawnego) XML-a GUS.
 */
function gus_pick($xml, $tag) {
    if (preg_match('#<' . $tag . '[^>]*>(.*?)</' . $tag . '>#s', $xml, $m)) {
        return trim(html_entity_decode($m[1], ENT_QUOTES | ENT_XML1, 'UTF-8'));
    }
    return '';
}

// ---------- Main flow --------------------------------------------------------

try {
    // 1) ZALOGUJ
    $loginEnvelope = '<?xml version="1.0" encoding="UTF-8"?>'
        . '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" '
        . ' xmlns:wsa="http://www.w3.org/2005/08/addressing" '
        . ' xmlns:dat="http://CIS/BIR/PUBL/2014/07">'
        . '<soap:Header>'
        .   '<wsa:To>' . htmlspecialchars($serviceUrl, ENT_XML1) . '</wsa:To>'
        .   '<wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj</wsa:Action>'
        . '</soap:Header>'
        . '<soap:Body>'
        .   '<dat:Zaloguj><dat:pKluczUzytkownika>' . htmlspecialchars($apiKey, ENT_XML1) . '</dat:pKluczUzytkownika></dat:Zaloguj>'
        . '</soap:Body>'
        . '</soap:Envelope>';

    $loginResponse = gus_soap_call(
        $serviceUrl,
        'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Zaloguj',
        $loginEnvelope
    );

    if (!preg_match('#<(?:[a-z0-9]+:)?ZalogujResult[^>]*>(.*?)</(?:[a-z0-9]+:)?ZalogujResult>#s', $loginResponse, $m)) {
        throw new Exception('Nie udało się odnaleźć identyfikatora sesji (ZalogujResult) w odpowiedzi GUS.');
    }
    $sid = trim($m[1]);
    if ($sid === '' || strlen($sid) < 4) {
        throw new Exception('GUS zwrócił pusty identyfikator sesji. Klucz API może być nieaktywny.');
    }

    // 2) SZUKAJ PO NIP
    $searchEnvelope = '<?xml version="1.0" encoding="UTF-8"?>'
        . '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" '
        . ' xmlns:wsa="http://www.w3.org/2005/08/addressing" '
        . ' xmlns:dat="http://CIS/BIR/PUBL/2014/07">'
        . '<soap:Header>'
        .   '<wsa:To>' . htmlspecialchars($serviceUrl, ENT_XML1) . '</wsa:To>'
        .   '<wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty</wsa:Action>'
        . '</soap:Header>'
        . '<soap:Body>'
        .   '<dat:DaneSzukajPodmioty>'
        .     '<dat:pParametryWyszukiwania>'
        .       '<dat:Nip>' . htmlspecialchars($nip, ENT_XML1) . '</dat:Nip>'
        .     '</dat:pParametryWyszukiwania>'
        .   '</dat:DaneSzukajPodmioty>'
        . '</soap:Body>'
        . '</soap:Envelope>';

    $searchResponse = gus_soap_call(
        $serviceUrl,
        'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/DaneSzukajPodmioty',
        $searchEnvelope,
        $sid
    );

    if (!preg_match('#<(?:[a-z0-9]+:)?DaneSzukajPodmiotyResult[^>]*>(.*?)</(?:[a-z0-9]+:)?DaneSzukajPodmiotyResult>#s', $searchResponse, $m)) {
        throw new Exception('GUS nie zwrócił wyniku wyszukiwania.');
    }

    // GUS zwraca XML zaszyty jako encje w XML-u. Dekodujemy.
    $innerXml = html_entity_decode($m[1], ENT_QUOTES | ENT_XML1, 'UTF-8');

    if ($innerXml === '') {
        // 4) WYLOGUJ - best-effort
        @gus_soap_call(
            $serviceUrl,
            'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj',
            buildWylogujEnvelope($serviceUrl, $sid),
            $sid
        );
        http_response_code(404);
        echo json_encode(['error' => 'GUS nie znalazł firmy o podanym NIP.']);
        exit;
    }

    if (stripos($innerXml, '<ErrorCode>') !== false) {
        $errCode = gus_pick($innerXml, 'ErrorCode');
        $errMsg  = gus_pick($innerXml, 'ErrorMessagePl');
        if ($errCode === '4') {
            // "Nie znaleziono podmiotów..." - traktujemy jako 404
            http_response_code(404);
            echo json_encode(['error' => $errMsg ?: 'Nie znaleziono podmiotu o podanym NIP.']);
            exit;
        }
        throw new Exception('GUS: ' . ($errMsg ?: 'kod błędu ' . $errCode));
    }

    $name   = gus_pick($innerXml, 'Nazwa');
    $street = gus_pick($innerXml, 'Ulica');
    $num    = gus_pick($innerXml, 'NrNieruchomosci');
    $apt    = gus_pick($innerXml, 'NrLokalu');
    $zip    = gus_pick($innerXml, 'KodPocztowy');
    $city   = gus_pick($innerXml, 'Miejscowosc');
    $regon  = gus_pick($innerXml, 'Regon');

    $streetLine = trim($street . ' ' . $num . ($apt !== '' ? '/' . $apt : ''));
    $cityLine   = trim($zip . ' ' . $city);
    $address    = trim(($streetLine !== '' ? $streetLine . ', ' : '') . $cityLine, ", \t\n\r\0\x0B");

    // 3) WYLOGUJ - best-effort (ignorujemy błędy)
    try {
        gus_soap_call(
            $serviceUrl,
            'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj',
            buildWylogujEnvelope($serviceUrl, $sid),
            $sid
        );
    } catch (Exception $ignored) { /* sesja wygaśnie sama */ }

    echo json_encode([
        'success' => true,
        'data'    => [
            'name'    => $name,
            'address' => $address,
            'regon'   => $regon,
        ],
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Błąd połączenia z GUS: ' . $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}

function buildWylogujEnvelope($serviceUrl, $sid) {
    return '<?xml version="1.0" encoding="UTF-8"?>'
        . '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" '
        . ' xmlns:wsa="http://www.w3.org/2005/08/addressing" '
        . ' xmlns:dat="http://CIS/BIR/PUBL/2014/07">'
        . '<soap:Header>'
        .   '<wsa:To>' . htmlspecialchars($serviceUrl, ENT_XML1) . '</wsa:To>'
        .   '<wsa:Action>http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/Wyloguj</wsa:Action>'
        . '</soap:Header>'
        . '<soap:Body>'
        .   '<dat:Wyloguj><dat:pIdentyfikatorSesji>' . htmlspecialchars($sid, ENT_XML1) . '</dat:pIdentyfikatorSesji></dat:Wyloguj>'
        . '</soap:Body>'
        . '</soap:Envelope>';
}
