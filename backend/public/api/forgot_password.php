<?php
/**
 * Reset user password
 * POST /api/forgot_password.php
 * Body: { "email": "john@example.com", "new_password": "newpass123" }
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
$newPassword = (string)($body['new_password'] ?? '');

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    error_response('Valid email is required', 422);
}

// Validate password length
if (strlen($newPassword) < 6) {
    error_response('Password must be at least 6 characters', 422);
}

// Check if user exists
$checkStmt = $pdo->prepare('SELECT user_id FROM user WHERE email = ?');
$checkStmt->execute([$email]);
if (!$checkStmt->fetch()) {
    error_response('Email not found', 404);
}

// Update password
$passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
$updateStmt = $pdo->prepare('UPDATE user SET password_hash = ?, updated_at = NOW() WHERE email = ?');
$updateStmt->execute([$passwordHash, $email]);

// Return success response
success_response('Password updated successfully');