<?php

class RecipeController extends BaseController
{
    private RecipeRepository $recipeRepo;
    
    public function __construct()
    {
        $this->recipeRepo = new RecipeRepository();
    }
    
    protected function get(): void
    {
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        
        if ($id) {
            $this->getRecipeById($id);
        } else {
            $this->getAllRecipes();
        }
    }
    
    private function getRecipeById(int $id): void
    {
        $recipe = $this->recipeRepo->getRecipesWithDetails(['id' => $id]);
        
        if (empty($recipe)) {
            $this->errorResponse('Recipe not found', 404);
        }
        
        $this->successResponse('Recipe retrieved successfully', [
            'recipe' => $recipe[0]
        ]);
    }
    
    private function getAllRecipes(): void
    {
        $filters = [];
        
        if (!empty($_GET['cuisine_type_id'])) {
            $filters['cuisine_type_id'] = (int)$_GET['cuisine_type_id'];
        }
        
        if (!empty($_GET['dietary_id'])) {
            $filters['dietary_id'] = (int)$_GET['dietary_id'];
        }
        
        if (!empty($_GET['difficulty_id'])) {
            $filters['difficulty_id'] = (int)$_GET['difficulty_id'];
        }
        
        if (!empty($_GET['featured'])) {
            $filters['featured'] = true;
        }
        
        $recipes = $this->recipeRepo->getRecipesWithDetails($filters);
        
        $this->successResponse('Recipes retrieved successfully', [
            'items' => $recipes,
            'count' => count($recipes)
        ]);
    }
}


