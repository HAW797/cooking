<?php

// Recipe Model extends BaseModel
class Recipe extends BaseModel
{
    protected string $table = 'recipe';
    protected string $primaryKey = 'recipe_id';
    protected array $fillable = [
        'recipe_title',
        'description',
        'image_url',
        'cuisine_type_id',
        'dietary_id',
        'difficulty_id',
        'prep_time',
        'cook_time',
        'servings',
        'instructions'
    ];
    
    public function getWithDetails(int $recipeId): ?array
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
                LEFT JOIN recipe_ratings rr ON r.recipe_id = rr.recipe_id
                WHERE r.recipe_id = ?
                GROUP BY r.recipe_id";
        
        $stmt = $this->query($sql, [$recipeId]);
        $result = $stmt->fetch();
        return $result ?: null;
    }
    
    public function getAllWithDetails(array $filters = []): array
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
        $sql .= ' ORDER BY r.created_at DESC';
        
        $stmt = $this->query($sql, $params);
        return $stmt->fetchAll();
    }
}


