<?php
/**
 * TerminyBHP - GUS BIR 1.1 Proxy (cURL + SOAP 1.2)
 *
 * Wymagania GUS BIR 1.1:
 * - SOAP 1.2 z action= w Content-Type (nie SOAPAction header)
 * - WS-Addressing (<wsa:To> + <wsa:Action>) w kopercie SOAP
 * - SID jako nagłówek HTTP (nie w SOAP envelope)
 * - Accept: application/soap+xml (żeby uniknąć odpowiedzi MTOM)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --- CONFIG ---
$configFile = __DIR__ . '/regon_config.php';
$config = is_file($configFile) ? (require $configFile) : [];

$apiKey = $config['api_key'] ?? getenv('GUS_API_KEY') ?: 'abcde12345abcde12345';
$env    = $config['env']     ?? getenv('GUS_ENV')     ?: 'test';

$endpoint = ($env === 'prod')
    ? 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc'
    : 'https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

// --- INPUT ---
$nip = isset($_GET['nip']) ? preg_replace('/[^0-9]/', '', $_GET['nip']) : '';

if (strlen($nip) !== 10) {
    http_response_code(400);
    echo json_encode(['error' => 'Podaj poprawny 10-cyfrowy NIP.']);
    exit;
}

// --- SOAP HELPER ---
function soapCall($endpoint, $action, $body, $sid = null) {
    $actionUrl = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/' . $action;

    $xml = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"'
         . ' xmlns:wsa="http://www.w3.org/2005/08/addressing"'
         . ' xmlns:bir="http://CIS/BIR/PUBL/2014/07"'
         . ' xmlns:dat="http://CIS/BIR/PUBL/2014/07/DataContract">'
         . '<soap:Header>'
         . '<wsa:To>' . $endpoint . '</wsa:To>'
         . '<wsa:Action>' . $actionUrl . '</wsa:Action>'
         . '</soap:Header>'
         . '<soap:Body>' . $body . '</soap:Body>'
         . '</soap:Envelope>';

    $headers = [
        'Content-Type: application/soap+xml; charset=utf-8; action="' . $actionUrl . '"',
        'Accept: application/soap+xml, text/xml',
    ];
    if ($sid) {
        $headers[] = 'sid: ' . $sid;
    }

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $xml,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_FOLLOWLOCATION => true,
    ]);

    $response = curl_exec($ch);
    $err      = curl_error($ch);
    $code     = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($err) throw new Exception("cURL: $err");

    // GUS production ALWAYS returns MTOM multipart despite Accept header.
    // Extract the SOAP Envelope regardless of response format.
    if (preg_match('/<\w*:?Envelope[^>]*>[\s\S]*<\/\w*:?Envelope>/i', $response, $m)) {
        $response = $m[0];
    }

    if ($code >= 400) {
        $detail = strip_tags($response);
        throw new Exception("HTTP $code: " . mb_substr($detail, 0, 300));
    }

    return $response;
}

function xmlValue($xml, $tag) {
    if (preg_match('/<(?:[a-z0-9]+:)?' . $tag . '[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?' . $tag . '>/i', $xml, $m)) {
        return trim($m[1]);
    }
    return '';
}

// --- MAIN ---
try {
    // 1. LOGIN
    $loginBody = '<bir:Zaloguj><bir:pKluczUzytkownika>' . htmlspecialchars($apiKey) . '</bir:pKluczUzytkownika></bir:Zaloguj>';
    $loginRes  = soapCall($endpoint, 'Zaloguj', $loginBody);
    $sid       = xmlValue($loginRes, 'ZalogujResult');

    if (strlen($sid) < 10) {
        throw new Exception('Logowanie nie powiodło się. Sprawdź klucz API. Odpowiedź: ' . mb_substr(strip_tags($loginRes), 0, 200));
    }

    // 2. SEARCH
    $searchBody = '<bir:DaneSzukajPodmioty>'
                . '<bir:pParametryWyszukiwania>'
                . '<dat:Nip>' . $nip . '</dat:Nip>'
                . '</bir:pParametryWyszukiwania>'
                . '</bir:DaneSzukajPodmioty>';

    $searchRes  = soapCall($endpoint, 'DaneSzukajPodmioty', $searchBody, $sid);
    $resultRaw  = xmlValue($searchRes, 'DaneSzukajPodmiotyResult');

    if ($resultRaw === '') {
        // GUS returns a self-closing nil tag when NIP is not in the registry
        if (stripos($searchRes, 'nil="true"') !== false || stripos($searchRes, "nil='true'") !== false) {
            http_response_code(404);
            echo json_encode(['error' => 'Nie znaleziono podmiotu o NIP ' . $nip . ' w rejestrze GUS.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        throw new Exception('Brak danych dla NIP ' . $nip . '. Odpowiedź: ' . mb_substr(strip_tags($searchRes), 0, 300));
    }

    // GUS returns XML encoded as HTML entities inside the result node
    $innerXml = html_entity_decode($resultRaw, ENT_QUOTES | ENT_XML1, 'UTF-8');

    if (strpos($innerXml, '<ErrorCode>') !== false) {
        $errMsg = xmlValue($innerXml, 'ErrorMessagePl');
        $errCode = xmlValue($innerXml, 'ErrorCode');
        if ($errCode === '4') {
            http_response_code(404);
            echo json_encode(['error' => 'Nie znaleziono podmiotu o NIP ' . $nip], JSON_UNESCAPED_UNICODE);
            exit;
        }
        throw new Exception('GUS: ' . ($errMsg ?: 'Błąd ' . $errCode));
    }

    // 3. PARSE
    $name   = xmlValue($innerXml, 'Nazwa');
    $street = xmlValue($innerXml, 'Ulica');
    $num    = xmlValue($innerXml, 'NrNieruchomosci');
    $apt    = xmlValue($innerXml, 'NrLokalu');
    $zip    = xmlValue($innerXml, 'KodPocztowy');
    $city   = xmlValue($innerXml, 'Miejscowosc');

    $addr = trim($street . ' ' . $num . ($apt ? '/' . $apt : ''));
    $addr = trim($addr . ', ' . $zip . ' ' . $city, ", \t\n\r");

    echo json_encode([
        'success' => true,
        'data' => [
            'name'    => html_entity_decode($name, ENT_QUOTES, 'UTF-8'),
            'address' => html_entity_decode($addr, ENT_QUOTES, 'UTF-8'),
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['error' => 'Błąd GUS: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
