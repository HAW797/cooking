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
