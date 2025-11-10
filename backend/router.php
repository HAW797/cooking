<?php

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

$filePath = __DIR__ . '/public' . $requestPath;

if ($requestPath !== '/' && file_exists($filePath) && is_file($filePath)) {
    return false;
}

if (strpos($requestPath, '/api/') === 0) {
    $apiFile = __DIR__ . '/public' . $requestPath;
    if (file_exists($apiFile)) {
        require $apiFile;
        return true;
    }
}

$indexFile = __DIR__ . '/public/index.php';
if (file_exists($indexFile)) {
    require $indexFile;
    return true;
}

http_response_code(404);
echo '404 - File not found';
return true;

