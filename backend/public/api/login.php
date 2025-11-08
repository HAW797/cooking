<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

$body = read_json_body();
$email = trim($body['email'] ?? '');
$password = (string)($body['password'] ?? '');

// Check if email is provided
if (empty($email)) {
    error_response('Email is required', 400);
}

// Check if account is locked out
check_login_lockout($email);

// Verify user credentials
$stmt = $pdo->prepare('SELECT user_id, first_name, last_name, email, password_hash 
                       FROM user 
                       WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Check if user exists and password is correct
if (!$user || !password_verify($password, $user['password_hash'])) {
    // Record failed login attempt (will lock account after 3 attempts and exit)
    record_failed_login($email);
    // If we reach here, account is not locked yet, show invalid credentials
    error_response('Invalid email or password', 401);
}

// Login successful - clear any previous failed attempts
clear_login_attempts($email);

$token = create_session_token((int)$user['user_id']);

success_response('Login successful', [
    'token' => $token,
    'user' => [
        'user_id' => (int)$user['user_id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email']
    ]
]);
