<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_response('Only POST method allowed', 405);
}

$recipeId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$recipeId) {
    error_response('Recipe ID is required', 400);
}

$body = read_json_body();
$rating = isset($body['rating']) ? (int)$body['rating'] : 0;

if ($rating < 1 || $rating > 5) {
    error_response('Rating must be between 1 and 5', 422);
}

$checkStmt = $pdo->prepare('SELECT recipe_id FROM recipe WHERE recipe_id = ?');
$checkStmt->execute([$recipeId]);
if (!$checkStmt->fetch()) {
    error_response('Recipe not found', 404);
}

$insertStmt = $pdo->prepare('INSERT INTO recipe_ratings (recipe_id, rating) VALUES (?, ?)');
$insertStmt->execute([$recipeId, $rating]);

success_response('Rating added successfully', [
    'recipe_id' => $recipeId,
    'rating' => $rating
], 201);