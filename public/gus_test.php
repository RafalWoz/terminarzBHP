<?php
/**
 * GUS BIR 1.1 — Skrypt diagnostyczny
 * Wgraj na serwer obok regon_proxy.php, uruchom w przeglądarce:
 *   https://terminybhp.pl/gus_test.php?nip=7712676720
 * Skopiuj CAŁY wynik i wklej do chata.
 * PO TESTACH USUŃ TEN PLIK Z SERWERA (zawiera klucz API w logach).
 */
header('Content-Type: text/plain; charset=utf-8');

$configFile = __DIR__ . '/regon_config.php';
$config = is_file($configFile) ? (require $configFile) : [];
$apiKey = $config['api_key'] ?? 'abcde12345abcde12345';
$env    = $config['env']     ?? 'test';
$endpoint = ($env === 'prod')
    ? 'https://wyszukiwarkaregon.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc'
    : 'https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc';

$nip = preg_replace('/[^0-9]/', '', $_GET['nip'] ?? '');

echo "=== GUS DIAGNOSTICS ===\n";
echo "ENV: $env\n";
echo "ENDPOINT: $endpoint\n";
echo "API_KEY length: " . strlen($apiKey) . "\n";
echo "NIP: $nip\n";
echo "PHP: " . phpversion() . "\n";
echo "cURL: " . (function_exists('curl_version') ? curl_version()['version'] : 'NOT AVAILABLE') . "\n\n";

function testCall($endpoint, $action, $body, $sid = null) {
    $actionUrl = 'http://CIS/BIR/PUBL/2014/07/IUslugaBIRzewnPubl/' . $action;

    $xml = '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"'
         . ' xmlns:wsa="http://www.w3.org/2005/08/addressing"'
         . ' xmlns:bir="http://CIS/BIR/PUBL/2014/07">'
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
    if ($sid) $headers[] = 'sid: ' . $sid;

    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => $xml,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HEADER         => true,
    ]);

    $full = curl_exec($ch);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $respHeaders = substr($full, 0, $headerSize);
    $respBody    = substr($full, $headerSize);
    curl_close($ch);

    return [$httpCode, $respHeaders, $respBody];
}

// === STEP 1: LOGIN ===
echo "========== STEP 1: LOGIN ==========\n";
$loginBody = '<bir:Zaloguj><bir:pKluczUzytkownika>' . htmlspecialchars($apiKey) . '</bir:pKluczUzytkownika></bir:Zaloguj>';
[$code, $rh, $rb] = testCall($endpoint, 'Zaloguj', $loginBody);

echo "HTTP Code: $code\n";
echo "Response Headers:\n$rh\n";
echo "Response Body (first 1500 chars):\n" . substr($rb, 0, 1500) . "\n";
echo "Body length: " . strlen($rb) . "\n";

// Extract envelope
$envelope = '';
if (preg_match('/<\w*:?Envelope[^>]*>[\s\S]*<\/\w*:?Envelope>/i', $rb, $m)) {
    $envelope = $m[0];
    echo "\n>> Envelope extracted OK, length: " . strlen($envelope) . "\n";
} else {
    echo "\n>> ENVELOPE EXTRACTION FAILED\n";
    echo "First 50 bytes hex: " . bin2hex(substr($rb, 0, 50)) . "\n";
    // Try alternate approach
    $start = strpos($rb, '<');
    if ($start !== false) {
        echo "First '<' at position: $start\n";
        echo "Content from first '<' (200 chars): " . substr($rb, $start, 200) . "\n";
    }
}

// Extract SID
$sid = '';
if (preg_match('/<(?:[a-z0-9]+:)?ZalogujResult[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?ZalogujResult>/i', $envelope ?: $rb, $m)) {
    $sid = trim($m[1]);
}
echo "\nSID: '$sid' (length: " . strlen($sid) . ")\n";

if (strlen($nip) !== 10) {
    echo "\nSkipping search - provide ?nip=XXXXXXXXXX\n";
    exit;
}

if (strlen($sid) < 10) {
    echo "\nERROR: Login failed, cannot search.\n";
    exit;
}

// === STEP 2: SEARCH ===
echo "\n========== STEP 2: SEARCH NIP=$nip ==========\n";
$searchBody = '<bir:DaneSzukajPodmioty><bir:pParametryWyszukiwania><bir:Nip>' . $nip . '</bir:Nip></bir:pParametryWyszukiwania></bir:DaneSzukajPodmioty>';
[$code2, $rh2, $rb2] = testCall($endpoint, 'DaneSzukajPodmioty', $searchBody, $sid);

echo "HTTP Code: $code2\n";
echo "Response Headers:\n$rh2\n";
echo "Response Body (first 2000 chars):\n" . substr($rb2, 0, 2000) . "\n";
echo "Body length: " . strlen($rb2) . "\n";

// Extract envelope
$envelope2 = '';
if (preg_match('/<\w*:?Envelope[^>]*>[\s\S]*<\/\w*:?Envelope>/i', $rb2, $m2)) {
    $envelope2 = $m2[0];
    echo "\n>> Envelope extracted OK, length: " . strlen($envelope2) . "\n";
    echo ">> Envelope content:\n$envelope2\n";
} else {
    echo "\n>> ENVELOPE EXTRACTION FAILED\n";
    echo "First 100 bytes hex: " . bin2hex(substr($rb2, 0, 100)) . "\n";
    $start = strpos($rb2, '<');
    if ($start !== false) {
        echo "First '<' at position: $start\n";
        echo "Content from first '<' (500 chars): " . substr($rb2, $start, 500) . "\n";
    }
}

// Extract result
$target = $envelope2 ?: $rb2;
if (preg_match('/<(?:[a-z0-9]+:)?DaneSzukajPodmiotyResult[^>]*>([\s\S]*?)<\/(?:[a-z0-9]+:)?DaneSzukajPodmiotyResult>/i', $target, $m3)) {
    $resultRaw = $m3[1];
    $decoded = html_entity_decode($resultRaw, ENT_QUOTES | ENT_XML1, 'UTF-8');
    echo "\n>> DaneSzukajPodmiotyResult FOUND\n";
    echo ">> Raw (first 500): " . substr($resultRaw, 0, 500) . "\n";
    echo ">> Decoded (first 500): " . substr($decoded, 0, 500) . "\n";
} else {
    echo "\n>> DaneSzukajPodmiotyResult NOT FOUND in response\n";
}

echo "\n=== DONE ===\n";
