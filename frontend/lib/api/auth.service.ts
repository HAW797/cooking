import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    user_id: number
    first_name: string
    last_name: string
    email: string
  }
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface RegisterResponse {
  user_id: number
  email: string
}

export interface ForgotPasswordRequest {
  email: string
  new_password: string
}

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_CONFIG.endpoints.login, credentials)
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>(API_CONFIG.endpoints.register, userData)
  },

  async logout(): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.endpoints.logout)
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.endpoints.forgotPassword, data)
  },
}

