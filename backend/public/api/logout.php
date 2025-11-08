<?php

require_once __DIR__ . '/../../api/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

$token = bearer_token();

if ($token) {
    try {
        revoke_session_token($token);
    } catch (Exception $e) {
    }
}

success_response('Logged out successfully');