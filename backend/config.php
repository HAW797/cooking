<?php

const DB_HOST = '127.0.0.1';
const DB_NAME = 'cooking_app';
const DB_USER = 'root';
const DB_PASS = '';
const DB_CHARSET = 'utf8mb4';

const SESSION_LIFETIME = 1800;
const SESSION_ABSOLUTE_TIMEOUT = 86400;
const REMEMBER_ME_LIFETIME = 2592000;

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

function is_post(): bool
{
    return $_SERVER['REQUEST_METHOD'] === 'POST';
}

function e(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function configure_session(): void
{
    $sessionPath = __DIR__ . '/sessions';
    if (!is_dir($sessionPath)) {
        mkdir($sessionPath, 0777, true);
    }
    ini_set('session.save_path', $sessionPath);
    
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    ini_set('session.gc_maxlifetime', (string)SESSION_LIFETIME);
    ini_set('session.cookie_lifetime', (string)SESSION_ABSOLUTE_TIMEOUT);
    ini_set('session.sid_length', '48');
    ini_set('session.sid_bits_per_character', '6');
    ini_set('session.cookie_domain', '');
    ini_set('session.cookie_path', '/');
    session_name('FOODFUSION_SESSION');
}

function init_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        configure_session();
        session_start();
        
        if (isset($_SESSION['LAST_ACTIVITY'])) {
            $inactive = time() - $_SESSION['LAST_ACTIVITY'];
            if ($inactive > SESSION_LIFETIME) {
                session_unset();
                session_destroy();
                session_start();
            }
        }
        $_SESSION['LAST_ACTIVITY'] = time();
        
        if (isset($_SESSION['CREATED_AT'])) {
            $age = time() - $_SESSION['CREATED_AT'];
            if ($age > SESSION_ABSOLUTE_TIMEOUT) {
                session_unset();
                session_destroy();
                session_start();
            }
        }
        
        if (!isset($_SESSION['REGENERATED_AT'])) {
            $_SESSION['REGENERATED_AT'] = time();
        } elseif (time() - $_SESSION['REGENERATED_AT'] > 900) {
            session_regenerate_id(true);
            $_SESSION['REGENERATED_AT'] = time();
        }
    }
}

init_session();
