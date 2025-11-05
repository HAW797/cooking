<?php
/**
 * Community Cookbook - CRUD operations for user's own recipes
 * Requires authentication token
 * 
 * GET /api/cookbook.php - List user's recipes
 * POST /api/cookbook.php - Create new recipe
 * PUT /api/cookbook.php?id=123 - Update recipe
 * DELETE /api/cookbook.php?id=123 - Delete recipe
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Require authentication
$user = require_auth();
$userId = (int)$user['user_id'];

$method = $_SERVER['REQUEST_METHOD'];

/**
 * Format recipe with structured related data
 */
function formatRecipeWithRelatedData($recipe, $pdo = null, $currentUserId = null)
{
    $formatted = [
        'post_id' => (int)$recipe['post_id'],
        'recipe_title' => $recipe['recipe_title'],
        'description' => $recipe['description'],
        'image_url' => $recipe['image_url'],
        'prep_time' => (int)$recipe['prep_time'],
        'cook_time' => (int)$recipe['cook_time'],
        'servings' => (int)$recipe['servings'],
        'instructions' => $recipe['instructions'],
        'created_at' => $recipe['created_at'],
        'updated_at' => $recipe['updated_at'],
    ];
    
    // Add cuisine data with ID
    if ($recipe['cuisine_type_id']) {
        $formatted['cuisine'] = [
            'cuisine_type_id' => (int)$recipe['cuisine_type_id'],
            'cuisine_name' => $recipe['cuisine_name']
        ];
    } else {
        $formatted['cuisine'] = null;
    }
    
    // Add dietary data with ID
    if ($recipe['dietary_id']) {
        $formatted['dietary'] = [
            'dietary_id' => (int)$recipe['dietary_id'],
            'dietary_name' => $recipe['dietary_name']
        ];
    } else {
        $formatted['dietary'] = null;
    }
    
    // Add difficulty data with ID
    if ($recipe['difficulty_id']) {
        $formatted['difficulty'] = [
            'difficulty_id' => (int)$recipe['difficulty_id'],
            'difficulty_level' => $recipe['difficulty_level']
        ];
    } else {
        $formatted['difficulty'] = null;
    }
    
    // Add like count and user_liked status if pdo and userId provided
    if ($pdo && $currentUserId) {
        $postId = (int)$recipe['post_id'];
        
        // Get like count
        $likeCountStmt = $pdo->prepare('SELECT COUNT(*) as like_count FROM cookbook_likes WHERE post_id = ?');
        $likeCountStmt->execute([$postId]);
        $likeCount = $likeCountStmt->fetch();
        $formatted['like_count'] = (int)$likeCount['like_count'];
        
        // Check if current user liked this recipe
        $userLikedStmt = $pdo->prepare('SELECT like_id FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
        $userLikedStmt->execute([$postId, $currentUserId]);
        $formatted['user_liked'] = (bool)$userLikedStmt->fetch();
    }
    
    return $formatted;
}

// ============================================
// GET - List user's recipes
// ============================================
if ($method === 'GET') {
    $stmt = $pdo->prepare('SELECT c.post_id, 
                                  c.recipe_title, 
                                  c.description, 
                                  c.image_url, 
                                  c.cuisine_type_id,
                                  ct.cuisine_name,
                                  c.dietary_id,
                                  d.dietary_name,
                                  c.difficulty_id,
                                  df.difficulty_level,
                                  c.prep_time, 
                                  c.cook_time, 
                                  c.servings, 
                                  c.instructions, 
                                  c.created_at, 
                                  c.updated_at 
                           FROM community_cookbook c
                           LEFT JOIN cuisine_type ct ON c.cuisine_type_id = ct.cuisine_type_id
                           LEFT JOIN dietary d ON c.dietary_id = d.dietary_id
                           LEFT JOIN difficulty df ON c.difficulty_id = df.difficulty_id
                           WHERE c.user_id = ? 
                           ORDER BY c.created_at DESC');
    $stmt->execute([$userId]);
    $recipesRaw = $stmt->fetchAll();
    
    // Format recipes with structured related data (including likes)
    $recipes = [];
    foreach ($recipesRaw as $recipe) {
        $recipes[] = formatRecipeWithRelatedData($recipe, $pdo, $userId);
    }

    success_response('Recipes retrieved successfully', [
        'items' => $recipes,
        'count' => count($recipes)
    ]);
}

// ============================================
// POST - Create new recipe
// ============================================
if ($method === 'POST') {
    $body = read_json_body();
    $recipeTitle = trim($body['recipe_title'] ?? '');

    // Validate required field
    if ($recipeTitle === '') {
        error_response('Recipe title is required', 422);
    }

    // Insert new recipe
    $stmt = $pdo->prepare('INSERT INTO community_cookbook 
                          (user_id, recipe_title, description, image_url, 
                           cuisine_type_id, dietary_id, difficulty_id, 
                           prep_time, cook_time, servings, instructions) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    
    $stmt->execute([
        $userId,
        $recipeTitle,
        $body['description'] ?? null,
        $body['image_url'] ?? null,
        $body['cuisine_type_id'] ?? null,
        $body['dietary_id'] ?? null,
        $body['difficulty_id'] ?? null,
        (int)($body['prep_time'] ?? 0),
        (int)($body['cook_time'] ?? 0),
        (int)($body['servings'] ?? 0),
        $body['instructions'] ?? null,
    ]);

    $postId = (int)$pdo->lastInsertId();
    
    // Fetch created recipe with related data
    $fetchStmt = $pdo->prepare('SELECT c.post_id, 
                                       c.recipe_title, 
                                       c.description, 
                                       c.image_url, 
                                       c.cuisine_type_id,
                                       ct.cuisine_name,
                                       c.dietary_id,
                                       d.dietary_name,
                                       c.difficulty_id,
                                       df.difficulty_level,
                                       c.prep_time, 
                                       c.cook_time, 
                                       c.servings, 
                                       c.instructions, 
                                       c.created_at, 
                                       c.updated_at 
                                FROM community_cookbook c
                                LEFT JOIN cuisine_type ct ON c.cuisine_type_id = ct.cuisine_type_id
                                LEFT JOIN dietary d ON c.dietary_id = d.dietary_id
                                LEFT JOIN difficulty df ON c.difficulty_id = df.difficulty_id
                                WHERE c.post_id = ? AND c.user_id = ?');
    $fetchStmt->execute([$postId, $userId]);
    $createdRecipe = $fetchStmt->fetch();
    
    if ($createdRecipe) {
        $formattedRecipe = formatRecipeWithRelatedData($createdRecipe, $pdo, $userId);
        success_response('Recipe created successfully', [
            'post_id' => $postId,
            'recipe' => $formattedRecipe
        ], 201);
    } else {
        success_response('Recipe created successfully', [
            'post_id' => $postId
        ], 201);
    }
}

// ============================================
// PUT/DELETE - Require post ID
// ============================================
$postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$postId) {
    error_response('Post ID is required', 400);
}

// Verify ownership
$ownershipStmt = $pdo->prepare('SELECT post_id FROM community_cookbook WHERE post_id = ? AND user_id = ?');
$ownershipStmt->execute([$postId, $userId]);

if (!$ownershipStmt->fetch()) {
    error_response('Recipe not found or access denied', 404);
}

// ============================================
// PUT - Update recipe
// ============================================
if ($method === 'PUT') {
    $body = read_json_body();
    $recipeTitle = trim($body['recipe_title'] ?? '');

    // Validate required field
    if ($recipeTitle === '') {
        error_response('Recipe title is required', 422);
    }

    // Update recipe
    $stmt = $pdo->prepare('UPDATE community_cookbook 
                          SET recipe_title = ?, 
                              description = ?, 
                              image_url = ?, 
                              cuisine_type_id = ?, 
                              dietary_id = ?, 
                              difficulty_id = ?, 
                              prep_time = ?, 
                              cook_time = ?, 
                              servings = ?, 
                              instructions = ?, 
                              updated_at = NOW() 
                          WHERE post_id = ? AND user_id = ?');
    
    $stmt->execute([
        $recipeTitle,
        $body['description'] ?? null,
        $body['image_url'] ?? null,
        $body['cuisine_type_id'] ?? null,
        $body['dietary_id'] ?? null,
        $body['difficulty_id'] ?? null,
        (int)($body['prep_time'] ?? 0),
        (int)($body['cook_time'] ?? 0),
        (int)($body['servings'] ?? 0),
        $body['instructions'] ?? null,
        $postId,
        $userId
    ]);
    
    // Fetch updated recipe with related data
    $fetchStmt = $pdo->prepare('SELECT c.post_id, 
                                       c.recipe_title, 
                                       c.description, 
                                       c.image_url, 
                                       c.cuisine_type_id,
                                       ct.cuisine_name,
                                       c.dietary_id,
                                       d.dietary_name,
                                       c.difficulty_id,
                                       df.difficulty_level,
                                       c.prep_time, 
                                       c.cook_time, 
                                       c.servings, 
                                       c.instructions, 
                                       c.created_at, 
                                       c.updated_at 
                                FROM community_cookbook c
                                LEFT JOIN cuisine_type ct ON c.cuisine_type_id = ct.cuisine_type_id
                                LEFT JOIN dietary d ON c.dietary_id = d.dietary_id
                                LEFT JOIN difficulty df ON c.difficulty_id = df.difficulty_id
                                WHERE c.post_id = ? AND c.user_id = ?');
    $fetchStmt->execute([$postId, $userId]);
    $updatedRecipe = $fetchStmt->fetch();
    
    if ($updatedRecipe) {
        $formattedRecipe = formatRecipeWithRelatedData($updatedRecipe, $pdo, $userId);
        success_response('Recipe updated successfully', [
            'recipe' => $formattedRecipe
        ]);
    } else {
        success_response('Recipe updated successfully');
    }
}

// ============================================
// DELETE - Delete recipe
// ============================================
if ($method === 'DELETE') {
    $deleteStmt = $pdo->prepare('DELETE FROM community_cookbook WHERE post_id = ? AND user_id = ?');
    $deleteStmt->execute([$postId, $userId]);

    success_response('Recipe deleted successfully');
}

// If method not handled above
error_response('Method not allowed', 405);