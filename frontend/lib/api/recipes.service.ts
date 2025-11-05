import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface Recipe {
  recipe_id: number
  recipe_title: string
  description: string | null
  image_url: string | null
  prep_time: number
  cook_time: number
  servings: number
  instructions: string | null
  created_at?: string
  updated_at?: string
  cuisine: {
    cuisine_type_id: number
    cuisine_name: string
  } | null
  dietary: {
    dietary_id: number
    dietary_name: string
  } | null
  difficulty: {
    difficulty_id: number
    difficulty_level: string
  } | null
  rating: {
    average_rating: number
    rating_count: number
  }
}

export interface RecipesResponse {
  items: Recipe[]
  count: number
}

export interface RecipeFilters {
  cuisine_type_id?: number
  dietary_id?: number
  difficulty_id?: number
  featured?: number
}

export interface RecipeRatingRequest {
  recipe_id: number
  rating: number
  comment?: string
}

export interface RecipeRatingResponse {
  rating_id: number
}

export const recipesService = {
  async getRecipes(filters?: RecipeFilters): Promise<ApiResponse<RecipesResponse>> {
    return apiClient.get<RecipesResponse>(API_CONFIG.endpoints.recipes, filters)
  },

  async getFeaturedRecipes(): Promise<ApiResponse<RecipesResponse>> {
    return apiClient.get<RecipesResponse>(API_CONFIG.endpoints.recipes, { featured: 1 })
  },

  async getRecipeById(id: number): Promise<ApiResponse<Recipe>> {
    return apiClient.get<Recipe>(`${API_CONFIG.endpoints.recipes}?id=${id}`)
  },

  async rateRecipe(data: RecipeRatingRequest): Promise<ApiResponse<RecipeRatingResponse>> {
    return apiClient.post<RecipeRatingResponse>(API_CONFIG.endpoints.recipeRating, data)
  },
}

