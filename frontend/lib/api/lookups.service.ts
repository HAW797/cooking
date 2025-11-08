import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface Cuisine {
  cuisine_type_id: number
  cuisine_name: string
}

export interface Dietary {
  dietary_id: number
  dietary_name: string
}

export interface Difficulty {
  difficulty_id: number
  difficulty_level: string
}

export interface Subject {
  subject_id: number
  subject_name: string
}

export interface LookupsResponse {
  cuisines: Cuisine[]
  dietaries: Dietary[]
  difficulties: Difficulty[]
  subjects: Subject[]
}

export interface SubjectsResponse {
  subjects: Subject[]
  count: number
}

export const lookupsService = {
  async getLookups(): Promise<ApiResponse<LookupsResponse>> {
    return apiClient.get<LookupsResponse>(API_CONFIG.endpoints.lookups)
  },
  async getSubjects(): Promise<ApiResponse<SubjectsResponse>> {
    return apiClient.get<SubjectsResponse>(API_CONFIG.endpoints.subjects)
  },
}

