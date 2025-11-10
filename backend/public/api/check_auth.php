<?php

require_once __DIR__ . '/../../api/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_response('Only GET method allowed', 405);
}

$user = get_authenticated_user();

if (!$user) {
    error_response('Not authenticated', 401);
}

$csrf_token = generate_csrf_token();

success_response('Authenticated', [
    'user' => $user,
    'csrf_token' => $csrf_token
]);



