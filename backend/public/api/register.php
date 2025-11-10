<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

$body = read_json_body();

$firstName = trim($body['first_name'] ?? '');
$lastName = trim($body['last_name'] ?? '');
$email = trim($body['email'] ?? '');
$password = (string)($body['password'] ?? '');

$errors = [];

if ($firstName === '') {
    $errors[] = 'First name is required';
}

if ($lastName === '') {
    $errors[] = 'Last name is required';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

// Password validation - matching frontend rules
if (strlen($password) < 8) {
    $errors[] = 'Password must be at least 8 characters';
}

if (!preg_match('/[A-Z]/', $password)) {
    $errors[] = 'Password must contain at least one uppercase letter';
}

if (!preg_match('/[a-z]/', $password)) {
    $errors[] = 'Password must contain at least one lowercase letter';
}

if (!preg_match('/[0-9]/', $password)) {
    $errors[] = 'Password must contain at least one number';
}

if (!preg_match('/[^A-Za-z0-9]/', $password)) {
    $errors[] = 'Password must contain at least one special character';
}

if (!empty($errors)) {
    json_response([
        'message' => 'Validation failed',
        'errors' => $errors
    ], 422);
}

$checkStmt = $pdo->prepare('SELECT user_id FROM user WHERE email = ?');
$checkStmt->execute([$email]);
if ($checkStmt->fetch()) {
    error_response('Email already registered', 422);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$insertStmt = $pdo->prepare('INSERT INTO user (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)');
$insertStmt->execute([$firstName, $lastName, $email, $passwordHash]);

$userId = (int)$pdo->lastInsertId();

// Auto-login after registration
$user = [
    'user_id' => $userId,
    'first_name' => $firstName,
    'last_name' => $lastName,
    'email' => $email
];

login_user($user, true); // Auto-remember for 30 days

// Generate and return CSRF token
$csrf_token = generate_csrf_token();

success_response('User registered successfully', [
    'user_id' => $userId,
    'email' => $email,
    'csrf_token' => $csrf_token
], 201);
