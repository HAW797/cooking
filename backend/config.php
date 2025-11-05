<?php
// Database configuration using PDO (MySQL)
// Update credentials if needed.

const DB_HOST = '127.0.0.1';
const DB_NAME = 'cooking_app';
const DB_USER = 'root';
const DB_PASS = 'root';
const DB_CHARSET = 'utf8mb4';

function get_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    return $pdo;
}

// Simple helpers
function is_post(): bool
{
    return $_SERVER['REQUEST_METHOD'] === 'POST';
}
function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

// Start session for auth
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
