import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface Resource {
  resource_id: number
  title: string
  description: string
  topic: string | null
  resource_type: 'Culinary' | 'Educational'
  file_url: string
  created_at: string
}

export interface ResourcesResponse {
  items: Resource[]
  count: number
}

export interface CreateResourceRequest {
  title: string
  description: string
  topic?: string
  resource_type: 'Culinary' | 'Educational'
  file_url: string
}

export const resourcesService = {
  async getResources(type?: 'Culinary' | 'Educational'): Promise<ApiResponse<ResourcesResponse>> {
    const endpoint = type ? `${API_CONFIG.endpoints.resources}?type=${type}` : API_CONFIG.endpoints.resources
    return apiClient.get<ResourcesResponse>(endpoint)
  },

  async createResource(data: CreateResourceRequest): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.endpoints.resources, data)
  },
}
