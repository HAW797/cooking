<?php
/**
 * Get recipes collection with optional filters
 * GET /api/recipes.php
 * GET /api/recipes.php?cuisine_type_id=1&dietary_id=2&difficulty_id=1
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Build WHERE clause for filters
$whereConditions = [];
$params = [];

// Filter by cuisine type
if (!empty($_GET['cuisine_type_id'])) {
    $whereConditions[] = 'r.cuisine_type_id = ?';
    $params[] = (int)$_GET['cuisine_type_id'];
}

// Filter by dietary preference
if (!empty($_GET['dietary_id'])) {
    $whereConditions[] = 'r.dietary_id = ?';
    $params[] = (int)$_GET['dietary_id'];
}

// Filter by difficulty
if (!empty($_GET['difficulty_id'])) {
    $whereConditions[] = 'r.difficulty_id = ?';
    $params[] = (int)$_GET['difficulty_id'];
}

// Build SQL query - include all IDs and related data
$sql = 'SELECT r.recipe_id, 
               r.recipe_title, 
               r.description, 
               r.image_url, 
               r.prep_time, 
               r.cook_time, 
               r.servings, 
               r.instructions,
               r.created_at,
               r.updated_at,
               r.cuisine_type_id,
               ct.cuisine_name,
               r.dietary_id,
               d.dietary_name,
               r.difficulty_id,
               df.difficulty_level
        FROM recipe r
        LEFT JOIN cuisine_type ct ON r.cuisine_type_id = ct.cuisine_type_id
        LEFT JOIN dietary d ON r.dietary_id = d.dietary_id
        LEFT JOIN difficulty df ON r.difficulty_id = df.difficulty_id';

// Add WHERE clause if filters exist
if (!empty($whereConditions)) {
    $sql .= ' WHERE ' . implode(' AND ', $whereConditions);
}

$sql .= ' ORDER BY r.created_at DESC';

// Execute query
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$recipesRaw = $stmt->fetchAll();

// Format recipes with structured related data
$recipes = [];
foreach ($recipesRaw as $recipe) {
    $recipeId = (int)$recipe['recipe_id'];
    
    $formattedRecipe = [
        'recipe_id' => $recipeId,
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
        $formattedRecipe['cuisine'] = [
            'cuisine_type_id' => (int)$recipe['cuisine_type_id'],
            'cuisine_name' => $recipe['cuisine_name']
        ];
    } else {
        $formattedRecipe['cuisine'] = null;
    }
    
    // Add dietary data with ID
    if ($recipe['dietary_id']) {
        $formattedRecipe['dietary'] = [
            'dietary_id' => (int)$recipe['dietary_id'],
            'dietary_name' => $recipe['dietary_name']
        ];
    } else {
        $formattedRecipe['dietary'] = null;
    }
    
    // Add difficulty data with ID
    if ($recipe['difficulty_id']) {
        $formattedRecipe['difficulty'] = [
            'difficulty_id' => (int)$recipe['difficulty_id'],
            'difficulty_level' => $recipe['difficulty_level']
        ];
    } else {
        $formattedRecipe['difficulty'] = null;
    }
    
    // Add rating data (no user_id - just aggregate ratings)
    $ratingStmt = $pdo->prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as rating_count FROM recipe_ratings WHERE recipe_id = ?');
    $ratingStmt->execute([$recipeId]);
    $ratingData = $ratingStmt->fetch();
    
    $formattedRecipe['rating'] = [
        'average_rating' => $ratingData['avg_rating'] ? round((float)$ratingData['avg_rating'], 2) : 0,
        'rating_count' => (int)$ratingData['rating_count']
    ];
    
    $recipes[] = $formattedRecipe;
}

// Return success response
success_response('Recipes retrieved successfully', [
    'items' => $recipes,
    'count' => count($recipes)
]);