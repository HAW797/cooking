<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

// For GET requests (viewing all posts), allow without auth
// For POST/PUT/DELETE, require auth
if ($method !== 'GET') {
    $user = require_auth();
    $userId = (int)$user['user_id'];
}

function formatRecipeWithRelatedData($recipe, $pdo = null, $currentUserId = null)
{
    $formatted = [
        'post_id' => (int)$recipe['post_id'],
        'post_title' => $recipe['post_title'],
        'title' => $recipe['post_title'], // Alias for frontend compatibility
        'description' => $recipe['description'],
        'image_url' => $recipe['image_url'],
        'created_at' => $recipe['created_at'],
    ];
    
    if ($pdo && $currentUserId) {
        $postId = (int)$recipe['post_id'];
        
        $likeCountStmt = $pdo->prepare('SELECT COUNT(*) as like_count FROM cookbook_likes WHERE post_id = ?');
        $likeCountStmt->execute([$postId]);
        $likeCount = $likeCountStmt->fetch();
        $formatted['like_count'] = (int)$likeCount['like_count'];
        
        $userLikedStmt = $pdo->prepare('SELECT like_id FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
        $userLikedStmt->execute([$postId, $currentUserId]);
        $formatted['user_liked'] = (bool)$userLikedStmt->fetch();
    }
    
    return $formatted;
}

if ($method === 'GET') {
    // Get optional user_id from auth if logged in (for like status)
    $currentUserId = null;
    try {
        $user = get_authenticated_user();
        $currentUserId = $user ? (int)$user['user_id'] : null;
    } catch (Exception $e) {
        // Not logged in - that's okay for viewing posts
    }
    
    // Fetch all community cookbook posts with user information
    $stmt = $pdo->prepare('
        SELECT 
            c.post_id, 
            c.post_title, 
            c.description, 
            c.image_url, 
            c.created_at,
            u.user_id,
            CONCAT(u.first_name, " ", u.last_name) as author_name
        FROM community_cookbook c
        INNER JOIN user u ON c.user_id = u.user_id
        ORDER BY c.created_at DESC
    ');
    
    $stmt->execute();
    $postsRaw = $stmt->fetchAll();
    
    $posts = [];
    foreach ($postsRaw as $post) {
        $postId = (int)$post['post_id'];
        
        // Get like count
        $likeCountStmt = $pdo->prepare('SELECT COUNT(*) as like_count FROM cookbook_likes WHERE post_id = ?');
        $likeCountStmt->execute([$postId]);
        $likeCount = $likeCountStmt->fetch();
        
        // Check if current user liked this post (if logged in)
        $userLiked = false;
        if ($currentUserId) {
            $userLikedStmt = $pdo->prepare('SELECT like_id FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
            $userLikedStmt->execute([$postId, $currentUserId]);
            $userLiked = (bool)$userLikedStmt->fetch();
        }
        
        $posts[] = [
            'id' => (string)$postId,
            'post_id' => $postId,
            'title' => $post['post_title'],
            'post_title' => $post['post_title'],
            'description' => $post['description'],
            'image' => $post['image_url'],
            'image_url' => $post['image_url'],
            'author' => $post['author_name'],
            'authorId' => (string)$post['user_id'],
            'likes' => (int)$likeCount['like_count'],
            'like_count' => (int)$likeCount['like_count'],
            'createdAt' => $post['created_at'],
            'created_at' => $post['created_at'],
            'reactions' => [
                'heart' => (int)$likeCount['like_count']
            ],
            'userLiked' => $userLiked,
            'user_liked' => $userLiked
        ];
    }

    success_response('Posts retrieved successfully', [
        'items' => $posts,
        'count' => count($posts)
    ]);
}

if ($method === 'POST') {
    // Auth is required for POST
    if (!isset($userId)) {
        error_response('Authentication required', 401);
    }
    
    $body = read_json_body();
    $title = trim($body['title'] ?? $body['post_title'] ?? '');
    $description = trim($body['description'] ?? '');
    $imageUrl = $body['image_url'] ?? $body['image'] ?? null;

    if ($title === '') {
        error_response('Title is required', 422);
    }
    
    if ($description === '') {
        error_response('Description is required', 422);
    }

    try {
        $stmt = $pdo->prepare('INSERT INTO community_cookbook 
                              (user_id, post_title, description, image_url) 
                              VALUES (?, ?, ?, ?)');
        
        $stmt->execute([
            $userId,
            $title,
            $description,
            $imageUrl,
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() == '22001') {
            error_response('Image is too large. Please use a smaller image or URL.', 413);
        }
        throw $e;
    }

    $postId = (int)$pdo->lastInsertId();
    
    // Fetch the created post with user info
    $fetchStmt = $pdo->prepare('
        SELECT 
            c.post_id, 
            c.post_title, 
            c.description, 
            c.image_url, 
            c.created_at,
            u.user_id,
            CONCAT(u.first_name, " ", u.last_name) as author_name
        FROM community_cookbook c
        INNER JOIN user u ON c.user_id = u.user_id
        WHERE c.post_id = ?
    ');
    $fetchStmt->execute([$postId]);
    $createdPost = $fetchStmt->fetch();
    
    if ($createdPost) {
        $post = [
            'id' => (string)$postId,
            'post_id' => $postId,
            'title' => $createdPost['post_title'],
            'post_title' => $createdPost['post_title'],
            'description' => $createdPost['description'],
            'image' => $createdPost['image_url'],
            'image_url' => $createdPost['image_url'],
            'author' => $createdPost['author_name'],
            'authorId' => (string)$createdPost['user_id'],
            'likes' => 0,
            'like_count' => 0,
            'createdAt' => $createdPost['created_at'],
            'created_at' => $createdPost['created_at'],
            'reactions' => [
                'heart' => 0
            ],
            'userLiked' => false,
            'user_liked' => false
        ];
        
        success_response('Post created successfully', [
            'post_id' => $postId,
            'post' => $post
        ], 201);
    } else {
        success_response('Post created successfully', [
            'post_id' => $postId
        ], 201);
    }
}

// For PUT and DELETE, need post ID and auth
if ($method === 'PUT' || $method === 'DELETE') {
    if (!isset($userId)) {
        error_response('Authentication required', 401);
    }
    
    $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if (!$postId) {
        error_response('Post ID is required', 400);
    }

    $ownershipStmt = $pdo->prepare('SELECT post_id FROM community_cookbook WHERE post_id = ? AND user_id = ?');
    $ownershipStmt->execute([$postId, $userId]);

    if (!$ownershipStmt->fetch()) {
        error_response('Post not found or access denied', 404);
    }
}

if ($method === 'PUT') {
    $body = read_json_body();
    $title = trim($body['title'] ?? $body['post_title'] ?? '');
    $description = trim($body['description'] ?? '');
    $imageUrl = $body['image_url'] ?? $body['image'] ?? null;

    if ($title === '') {
        error_response('Title is required', 422);
    }

    $stmt = $pdo->prepare('UPDATE community_cookbook 
                          SET post_title = ?, 
                              description = ?, 
                              image_url = ? 
                          WHERE post_id = ? AND user_id = ?');
    
    $stmt->execute([
        $title,
        $description,
        $imageUrl,
        $postId,
        $userId
    ]);
    
    success_response('Post updated successfully', [
        'post_id' => $postId
    ]);
}

if ($method === 'DELETE') {
    $deleteStmt = $pdo->prepare('DELETE FROM community_cookbook WHERE post_id = ? AND user_id = ?');
    $deleteStmt->execute([$postId, $userId]);

    success_response('Post deleted successfully', [
        'post_id' => $postId
    ]);
}

error_response('Method not allowed', 405);