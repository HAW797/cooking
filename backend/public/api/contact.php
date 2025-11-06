<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

$body = read_json_body();
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$subject = trim($body['subject'] ?? '');
$subjectId = isset($body['subject_id']) ? (int)$body['subject_id'] : null;
$message = trim($body['message'] ?? '');

$errors = [];

if ($name === '') {
    $errors[] = 'Name is required';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

if ($subject === '') {
    $errors[] = 'Subject is required';
}

if ($message === '') {
    $errors[] = 'Message is required';
}

if (!empty($errors)) {
    json_response([
        'message' => 'Validation failed',
        'errors' => $errors
    ], 422);
}

if ($subjectId) {
    $subjectStmt = $pdo->prepare('SELECT subject_name FROM contact_subject WHERE subject_id = ?');
    $subjectStmt->execute([$subjectId]);
    $subjectData = $subjectStmt->fetch();
    if ($subjectData) {
        $subject = $subjectData['subject_name'];
    }
}

$stmt = $pdo->prepare('INSERT INTO contact_message (name, email, subject, subject_id, message) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$name, $email, $subject, $subjectId, $message]);

$messageId = (int)$pdo->lastInsertId();

success_response('Message sent successfully', [
    'message_id' => $messageId
], 201);
