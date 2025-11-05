<?php
/**
 * Like/Unlike a cookbook recipe
 * POST /api/cookbook_like.php?id=123
 * Toggles like - if already liked, removes like; if not liked, adds like
 * Requires authentication token
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Require authentication
$user = require_auth();
$userId = (int)$user['user_id'];

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

// Get post ID from query parameter
$postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$postId) {
    error_response('Post ID is required', 400);
}

// Check if recipe exists
$checkStmt = $pdo->prepare('SELECT post_id FROM community_cookbook WHERE post_id = ?');
$checkStmt->execute([$postId]);
if (!$checkStmt->fetch()) {
    error_response('Recipe not found', 404);
}

// Check if user already liked this recipe
$likeStmt = $pdo->prepare('SELECT like_id FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
$likeStmt->execute([$postId, $userId]);
$existingLike = $likeStmt->fetch();

if ($existingLike) {
    // Unlike - remove like
    $deleteStmt = $pdo->prepare('DELETE FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
    $deleteStmt->execute([$postId, $userId]);
    
    success_response('Recipe unliked successfully', [
        'liked' => false,
        'post_id' => $postId
    ]);
} else {
    // Like - add like
    $insertStmt = $pdo->prepare('INSERT INTO cookbook_likes (post_id, user_id) VALUES (?, ?)');
    $insertStmt->execute([$postId, $userId]);
    
    success_response('Recipe liked successfully', [
        'liked' => true,
        'post_id' => $postId
    ]);
}
