<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

$body = read_json_body();
$email = trim($body['email'] ?? '');
$password = (string)($body['password'] ?? '');
$rememberMe = (bool)($body['remember_me'] ?? false);

$errors = [];

// Check if all required fields are provided
if (empty($email)) {
    $errors[] = 'Email is required';
}

if (empty($password)) {
    $errors[] = 'Password is required';
}

if (!empty($errors)) {
    json_response([
        'message' => 'All fields are required',
        'errors' => $errors
    ], 400);
}

// Email format validation
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_response('Valid email is required', 400);
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

// Use session-based authentication (cookies)
login_user($user, $rememberMe);

// Generate and return CSRF token
$csrf_token = generate_csrf_token();

success_response('Login successful', [
    'csrf_token' => $csrf_token,
    'user' => [
        'user_id' => (int)$user['user_id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email']
    ]
]);
