<?php
// Router script for PHP built-in server
// Routes requests to the public directory

$requestUri = $_SERVER['REQUEST_URI'];
$requestPath = parse_url($requestUri, PHP_URL_PATH);

// Remove query string for file checking
$filePath = __DIR__ . '/public' . $requestPath;

// If the requested file exists in public directory, serve it
if ($requestPath !== '/' && file_exists($filePath) && is_file($filePath)) {
    return false; // Let PHP serve the file directly
}

// Route API requests
if (strpos($requestPath, '/api/') === 0) {
    $apiFile = __DIR__ . '/public' . $requestPath;
    if (file_exists($apiFile)) {
        require $apiFile;
        return true;
    }
}

// Route to index.php if it exists
$indexFile = __DIR__ . '/public/index.php';
if (file_exists($indexFile)) {
    require $indexFile;
    return true;
}

// 404 for everything else
http_response_code(404);
echo '404 - File not found';
return true;

