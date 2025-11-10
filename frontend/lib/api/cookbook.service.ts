import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface CookbookRecipe {
  post_id: number
  post_title: string
  title?: string
  description: string
  image_url?: string
  user_id?: number
  author?: string
  created_at?: string
  likes_count?: number
  like_count?: number
  is_liked?: boolean
  user_liked?: boolean
}

export interface CookbookResponse {
  items: CookbookRecipe[]
  count: number
}

export interface CreateCookbookRecipeRequest {
  title?: string
  post_title?: string
  description: string
  image_url?: string
}

export interface UpdateCookbookRecipeRequest extends Partial<CreateCookbookRecipeRequest> {
  title?: string
  post_title?: string
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

