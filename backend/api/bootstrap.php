<?php
require_once __DIR__ . '/../config.php';

$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function success_response(string $message, $data = null, int $status = 200): void
{
    $response = [
        'success' => true,
        'message' => $message
    ];
    if ($data !== null) {
        $response['data'] = $data;
    }
    json_response($response, $status);
}

function error_response(string $message, int $status = 400): void
{
    json_response([
        'success' => false,
        'message' => $message,
        'error' => $message
    ], $status);
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function bearer_token(): ?string
{
    $hdr = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (stripos($hdr, 'Bearer ') === 0) {
        return trim(substr($hdr, 7));
    }
    if (!empty($_GET['token'])) return (string)$_GET['token'];
    return null;
}

function create_session_token(int $userId): string
{
    $pdo = get_pdo();
    $token = bin2hex(random_bytes(24));
    $stmt = $pdo->prepare('INSERT INTO user_session (session_token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))');
    $stmt->execute([$token, $userId]);
    return $token;
}

function revoke_session_token(string $token): void
{
    $pdo = get_pdo();
    $stmt = $pdo->prepare('DELETE FROM user_session WHERE session_token = ?');
    $stmt->execute([$token]);
}

function require_auth(): array
{
    $pdo = get_pdo();
    $token = bearer_token();
    if (!$token) {
        error_response('Authentication token required', 401);
    }
    $stmt = $pdo->prepare('SELECT u.user_id, u.first_name, u.last_name, u.email 
                           FROM user_session s 
                           JOIN user u ON u.user_id=s.user_id 
                           WHERE s.session_token=? 
                           AND (s.expires_at IS NULL OR s.expires_at > NOW())');
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if (!$user) {
        error_response('Invalid or expired token', 401);
    }
    return $user;
}

function check_login_lockout(string $email): void
{
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT attempts, locked_until FROM login_attempts WHERE email = ?');
    $stmt->execute([$email]);
    $attempt = $stmt->fetch();

    if ($attempt && $attempt['locked_until']) {
        $lockedUntil = new DateTime($attempt['locked_until']);
        $now = new DateTime();

        if ($lockedUntil > $now) {
            $minutesRemaining = ceil(($lockedUntil->getTimestamp() - $now->getTimestamp()) / 60);
            error_response("Account locked due to too many failed login attempts. Please try again in {$minutesRemaining} minute(s).", 423);
        } else {
            // Lockout expired, clear it
            clear_login_attempts($email);
        }
    }
}

function record_failed_login(string $email): void
{
    $pdo = get_pdo();
    $maxAttempts = 3;
    $lockoutMinutes = 3;

    // Get current attempts
    $stmt = $pdo->prepare('SELECT attempts FROM login_attempts WHERE email = ?');
    $stmt->execute([$email]);
    $attempt = $stmt->fetch();

    if ($attempt) {
        $newAttempts = (int)$attempt['attempts'] + 1;

        if ($newAttempts >= $maxAttempts) {
            // Lock the account for 3 minutes
            $lockedUntil = date('Y-m-d H:i:s', strtotime("+{$lockoutMinutes} minutes"));
            $stmt = $pdo->prepare('UPDATE login_attempts SET attempts = ?, locked_until = ?, last_attempt_at = NOW() WHERE email = ?');
            $stmt->execute([$newAttempts, $lockedUntil, $email]);
            error_response("Too many failed login attempts. Your account has been locked for {$lockoutMinutes} minutes.", 423);
        } else {
            // Increment attempts
            $stmt = $pdo->prepare('UPDATE login_attempts SET attempts = ?, last_attempt_at = NOW() WHERE email = ?');
            $stmt->execute([$newAttempts, $email]);
        }
    } else {
        // First failed attempt
        $stmt = $pdo->prepare('INSERT INTO login_attempts (email, attempts, last_attempt_at) VALUES (?, 1, NOW())');
        $stmt->execute([$email]);
    }
}

function clear_login_attempts(string $email): void
{
    $pdo = get_pdo();
    $stmt = $pdo->prepare('DELETE FROM login_attempts WHERE email = ?');
    $stmt->execute([$email]);
}
