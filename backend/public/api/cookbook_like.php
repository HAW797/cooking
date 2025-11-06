<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

$user = require_auth();
$userId = (int)$user['user_id'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

$postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$postId) {
    error_response('Post ID is required', 400);
}

$checkStmt = $pdo->prepare('SELECT post_id FROM community_cookbook WHERE post_id = ?');
$checkStmt->execute([$postId]);
if (!$checkStmt->fetch()) {
    error_response('Recipe not found', 404);
}

$likeStmt = $pdo->prepare('SELECT like_id FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
$likeStmt->execute([$postId, $userId]);
$existingLike = $likeStmt->fetch();

if ($existingLike) {
    $deleteStmt = $pdo->prepare('DELETE FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
    $deleteStmt->execute([$postId, $userId]);
    
    success_response('Recipe unliked successfully', [
        'liked' => false,
        'post_id' => $postId
    ]);
} else {
    $insertStmt = $pdo->prepare('INSERT INTO cookbook_likes (post_id, user_id) VALUES (?, ?)');
    $insertStmt->execute([$postId, $userId]);
    
    success_response('Recipe liked successfully', [
        'liked' => true,
        'post_id' => $postId
    ]);
}
