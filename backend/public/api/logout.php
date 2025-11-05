<?php
/**
 * Logout user by revoking session token
 * POST /api/logout.php
 * Token is optional - if provided, it will be revoked
 * If no token provided, still returns success (already logged out)
 */
require_once __DIR__ . '/../../api/bootstrap.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

// Get token from request (optional)
$token = bearer_token();

// Revoke token if provided (no error if token is missing)
if ($token) {
    try {
        revoke_session_token($token);
    } catch (Exception $e) {
        // Ignore errors - logout should always succeed
    }
}

// Always return success (even if no token provided)
success_response('Logged out successfully');