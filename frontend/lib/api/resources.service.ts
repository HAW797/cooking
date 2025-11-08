import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface Resource {
  resource_id: number
  title: string
  description: string
  resource_type: 'Culinary' | 'Educational'
  file_url?: string
  external_url?: string
  created_at?: string
}

export interface ResourcesResponse {
  items: Resource[]
  count: number
}

export interface ResourceFilters {
  type?: 'Culinary' | 'Educational'
}

export const resourcesService = {
  async getResources(filters?: ResourceFilters): Promise<ApiResponse<ResourcesResponse>> {
    return apiClient.get<ResourcesResponse>(API_CONFIG.endpoints.resources, filters)
  },

  async getResourceById(id: number): Promise<ApiResponse<Resource>> {
    return apiClient.get<Resource>(`${API_CONFIG.endpoints.resources}?id=${id}`)
  },

  getDownloadUrl(fileUrl: string): string {
    if (fileUrl.startsWith('http')) {
      return fileUrl
    }
    return `${API_CONFIG.baseURL}${fileUrl}`
  },
}

