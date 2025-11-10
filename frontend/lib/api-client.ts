import { API_CONFIG } from './config'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface ApiError {
  message: string
  status: number
  error?: string
}

let csrfToken: string | null = null

export function getCsrfToken(): string | null {
  return csrfToken
}

export function setCsrfToken(token: string): void {
  csrfToken = token
}

export function removeCsrfToken(): void {
  csrfToken = null
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(API_CONFIG.storageKeys.authToken)
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(API_CONFIG.storageKeys.authToken, token)
}

export function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(API_CONFIG.storageKeys.authToken)
}

class ApiClient {
  private baseURL: string
  private timeout: number

  constructor() {
    this.baseURL = API_CONFIG.baseURL
    this.timeout = API_CONFIG.timeout
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (options.headers) {
      const existingHeaders = new Headers(options.headers)
      existingHeaders.forEach((value, key) => {
        headers[key] = value
      })
    }

    const csrf = getCsrfToken()
    if (csrf && (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE')) {
      headers['X-CSRF-Token'] = csrf
    }

    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data: ApiResponse<T> = await response.json()

      if (data.data && typeof data.data === 'object' && 'csrf_token' in data.data) {
        setCsrfToken((data.data as any).csrf_token)
      }

      if (!response.ok) {
        throw {
          message: data.message || data.error || 'An error occurred',
          status: response.status,
          error: data.error,
        } as ApiError
      }

      return data
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please try again.',
          status: 408,
          error: 'timeout',
        } as ApiError
      }

      if (error instanceof TypeError) {
        throw {
          message: 'Network error. Please check your connection.',
          status: 0,
          error: 'network_error',
        } as ApiError
      }

      if (error.status !== undefined) {
        throw error
      }

      throw {
        message: error.message || 'An unexpected error occurred',
        status: 500,
        error: 'unknown_error',
      } as ApiError
    }
  }

  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = endpoint

    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return this.request<T>(url, { method: 'GET' })
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {}

    const token = getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include',
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data: ApiResponse<T> = await response.json()

      if (!response.ok) {
        throw {
          message: data.message || data.error || 'Upload failed',
          status: response.status,
          error: data.error,
        } as ApiError
      }

      return data
    } catch (error: any) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw {
          message: 'Upload timeout. Please try again.',
          status: 408,
          error: 'timeout',
        } as ApiError
      }

      throw error
    }
  }
}

export const apiClient = new ApiClient()
export default apiClient

export { authService } from './api/auth.service'

