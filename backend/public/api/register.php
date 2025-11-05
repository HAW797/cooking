<?php
/**
 * Register a new user
 * POST /api/register.php
 * Body: { "first_name": "John", "last_name": "Doe", "email": "john@example.com", "password": "secret123" }
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

// Read request body
$body = read_json_body();

// Extract and validate input
$firstName = trim($body['first_name'] ?? '');
$lastName = trim($body['last_name'] ?? '');
$email = trim($body['email'] ?? '');
$password = (string)($body['password'] ?? '');

// Validation errors
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

if (strlen($password) < 6) {
    $errors[] = 'Password must be at least 6 characters';
}

// Return validation errors if any
if (!empty($errors)) {
    json_response([
        'message' => 'Validation failed',
        'errors' => $errors
    ], 422);
}

// Check if email already exists
$checkStmt = $pdo->prepare('SELECT user_id FROM user WHERE email = ?');
$checkStmt->execute([$email]);
if ($checkStmt->fetch()) {
    error_response('Email already registered', 409);
}

// Hash password and create user
$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$insertStmt = $pdo->prepare('INSERT INTO user (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)');
$insertStmt->execute([$firstName, $lastName, $email, $passwordHash]);

$userId = (int)$pdo->lastInsertId();

// Return success response
success_response('User registered successfully', [
    'user_id' => $userId,
    'email' => $email
], 201);