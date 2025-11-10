<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body = read_json_body();
    $recipeId = isset($body['recipe_id']) ? (int)$body['recipe_id'] : 0;
    $rating = isset($body['rating']) ? (int)$body['rating'] : 0;
    
    if (!$recipeId) {
        error_response('Recipe ID is required', 400);
    }
    
    if ($rating < 1 || $rating > 5) {
        error_response('Rating must be between 1 and 5', 422);
    }
    
    $checkStmt = $pdo->prepare('SELECT recipe_id FROM recipe WHERE recipe_id = ?');
    $checkStmt->execute([$recipeId]);
    if (!$checkStmt->fetch()) {
        error_response('Recipe not found', 404);
    }
    
    $stmt = $pdo->prepare('INSERT INTO recipe_ratings (recipe_id, rating) VALUES (?, ?)');
    $stmt->execute([$recipeId, $rating]);
    
    $ratingId = (int)$pdo->lastInsertId();
    
    $avgStmt = $pdo->prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count 
                              FROM recipe_ratings WHERE recipe_id = ?');
    $avgStmt->execute([$recipeId]);
    $stats = $avgStmt->fetch();
    
    success_response('Rating submitted successfully', [
        'rating_id' => $ratingId,
        'average_rating' => round((float)$stats['avg_rating'], 2),
        'total_ratings' => (int)$stats['count']
    ], 201);
}

if ($method === 'GET') {
    $recipeId = isset($_GET['recipe_id']) ? (int)$_GET['recipe_id'] : 0;
    
    if (!$recipeId) {
        error_response('Recipe ID is required', 400);
    }
    
    $stmt = $pdo->prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as count 
                           FROM recipe_ratings WHERE recipe_id = ?');
    $stmt->execute([$recipeId]);
    $stats = $stmt->fetch();
    
    success_response('Rating statistics retrieved successfully', [
        'recipe_id' => $recipeId,
        'average_rating' => round((float)$stats['avg_rating'], 2),
        'total_ratings' => (int)$stats['count']
    ]);
}

error_response('Method not allowed', 405);



