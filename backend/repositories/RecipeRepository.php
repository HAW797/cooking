<?php

class RecipeRepository extends BaseRepository
{
    protected string $table = 'recipe';
    protected string $primaryKey = 'recipe_id';
    
    public function getRecipesWithDetails(array $filters = []): array
    {
        $sql = "SELECT r.*, 
                       ct.cuisine_name,
                       d.dietary_name,
                       df.difficulty_level,
                       COALESCE(AVG(rr.rating), 0) as avg_rating,
                       COUNT(rr.rating_id) as rating_count
                FROM {$this->table} r
                LEFT JOIN cuisine_type ct ON r.cuisine_type_id = ct.cuisine_type_id
                LEFT JOIN dietary d ON r.dietary_id = d.dietary_id
                LEFT JOIN difficulty df ON r.difficulty_id = df.difficulty_id
                LEFT JOIN recipe_ratings rr ON r.recipe_id = rr.recipe_id";
        
        $whereConditions = [];
        $params = [];
        
        if (!empty($filters['cuisine_type_id'])) {
            $whereConditions[] = 'r.cuisine_type_id = ?';
            $params[] = $filters['cuisine_type_id'];
        }
        
        if (!empty($filters['dietary_id'])) {
            $whereConditions[] = 'r.dietary_id = ?';
            $params[] = $filters['dietary_id'];
        }
        
        if (!empty($filters['difficulty_id'])) {
            $whereConditions[] = 'r.difficulty_id = ?';
            $params[] = $filters['difficulty_id'];
        }
        
        if (!empty($whereConditions)) {
            $sql .= ' WHERE ' . implode(' AND ', $whereConditions);
        }
        
        $sql .= ' GROUP BY r.recipe_id, r.recipe_title, r.description, r.image_url, r.prep_time, r.cook_time, r.servings, r.instructions, r.created_at, r.updated_at, r.cuisine_type_id, ct.cuisine_name, r.dietary_id, d.dietary_name, r.difficulty_id, df.difficulty_level';
        
        if (!empty($filters['featured'])) {
            $sql .= ' ORDER BY avg_rating DESC, rating_count DESC LIMIT 5';
        } else {
            $sql .= ' ORDER BY r.created_at DESC';
        }
        
        return $this->query($sql, $params)->fetchAll();
    }
    
    public function getRecipeWithIngredients(int $recipeId): ?array
    {
        $recipe = $this->findById($recipeId);
        if (!$recipe) return null;
        
        $sql = "SELECT i.ingredient_name, ri.quantity
                FROM recipe_ingredients ri
                JOIN ingredient i ON ri.ingredient_id = i.ingredient_id
                WHERE ri.recipe_id = ?";
        
        $stmt = $this->query($sql, [$recipeId]);
        $recipe['ingredients'] = $stmt->fetchAll();
        
        return $recipe;
    }
}


