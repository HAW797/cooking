import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface ContactRequest {
  name: string
  email: string
  subject?: string
  subject_id?: number
  message: string
}

export interface ContactResponse {
  message_id: number
}

export const contactService = {
  async sendMessage(data: ContactRequest): Promise<ApiResponse<ContactResponse>> {
    return apiClient.post<ContactResponse>(API_CONFIG.endpoints.contact, data)
  },
}

