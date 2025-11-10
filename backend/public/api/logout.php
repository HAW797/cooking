<?php

require_once __DIR__ . '/../../api/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

logout_user();

success_response('Logged out successfully');
