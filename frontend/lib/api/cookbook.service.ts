import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface CookbookRecipe {
  post_id: number
  recipe_title: string
  description: string
  image_url?: string
  cuisine_type_id?: number
  dietary_id?: number
  difficulty_id?: number
  prep_time?: number
  cook_time?: number
  servings?: number
  instructions?: string
  cuisine_name?: string
  dietary_name?: string
  difficulty_level?: string
  user_id?: number
  created_at?: string
  updated_at?: string
  likes_count?: number
  is_liked?: boolean
}

export interface CookbookResponse {
  items: CookbookRecipe[]
  count: number
}

export interface CreateCookbookRecipeRequest {
  recipe_title: string
  description: string
  image_url?: string
  cuisine_type_id?: number
  dietary_id?: number
  difficulty_id?: number
  prep_time?: number
  cook_time?: number
  servings?: number
  instructions?: string
}

export interface UpdateCookbookRecipeRequest extends Partial<CreateCookbookRecipeRequest> {
  recipe_title: string
}

export interface CreateRecipeResponse {
  post_id: number
}

export interface LikeResponse {
  liked: boolean
  likes_count: number
}

export const cookbookService = {
  async getCookbookRecipes(): Promise<ApiResponse<CookbookResponse>> {
    return apiClient.get<CookbookResponse>(API_CONFIG.endpoints.cookbook)
  },

  async getAllCookbookRecipes(): Promise<ApiResponse<CookbookResponse>> {
    return apiClient.get<CookbookResponse>(API_CONFIG.endpoints.cookbook)
  },

  async getCookbookRecipeById(id: number): Promise<ApiResponse<CookbookRecipe>> {
    return apiClient.get<CookbookRecipe>(`${API_CONFIG.endpoints.cookbook}?id=${id}`)
  },

  async createRecipe(data: CreateCookbookRecipeRequest): Promise<ApiResponse<CreateRecipeResponse>> {
    return apiClient.post<CreateRecipeResponse>(API_CONFIG.endpoints.cookbook, data)
  },

  async updateRecipe(id: number, data: UpdateCookbookRecipeRequest): Promise<ApiResponse> {
    return apiClient.put(`${API_CONFIG.endpoints.cookbook}?id=${id}`, data)
  },

  async deleteRecipe(id: number): Promise<ApiResponse> {
    return apiClient.delete(`${API_CONFIG.endpoints.cookbook}?id=${id}`)
  },

  async toggleLike(postId: number): Promise<ApiResponse<LikeResponse>> {
    return apiClient.post<LikeResponse>(API_CONFIG.endpoints.cookbookLike, { post_id: postId })
  },
}

