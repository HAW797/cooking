<?php
/**
 * Login user and get authentication token
 * POST /api/login.php
 * Body: { "email": "john@example.com", "password": "secret123" }
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

// Read request body
$body = read_json_body();
$email = trim($body['email'] ?? '');
$password = (string)($body['password'] ?? '');

// Find user by email
$stmt = $pdo->prepare('SELECT user_id, first_name, last_name, email, password_hash 
                       FROM user 
                       WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// Verify password
if (!$user || !password_verify($password, $user['password_hash'])) {
    error_response('Invalid email or password', 401);
}

// Create session token
$token = create_session_token((int)$user['user_id']);

// Return success with token and user data
success_response('Login successful', [
    'token' => $token,
    'user' => [
        'user_id' => (int)$user['user_id'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'email' => $user['email']
    ]
]);