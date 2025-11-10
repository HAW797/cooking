import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface ContactRequest {
  name: string
  email: string
  subject_id: number
  message: string
}

export interface Subject {
  subject_id: number
  subject_name: string
}

export interface SubjectsResponse {
  subjects: Subject[]
  count: number
}

export const contactService = {
  async sendMessage(data: ContactRequest): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.endpoints.contact, data)
  },

  async getSubjects(): Promise<ApiResponse<SubjectsResponse>> {
    return apiClient.get<SubjectsResponse>(API_CONFIG.endpoints.subjects)
  },
}
