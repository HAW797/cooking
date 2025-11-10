import { apiClient, ApiResponse } from '../api-client'
import { API_CONFIG } from '../config'

export interface Event {
  event_id: number
  title: string
  event_title: string
  date: string
  event_date: string
  location: string | null
  description: string | null
  image: string | null
  image_url: string | null
  created_at: string
}

export interface EventsResponse {
  items: Event[]
  count: number
}

export interface CreateEventRequest {
  title?: string
  event_title?: string
  event_date: string
  location?: string
  description?: string
  image_url?: string
}

export const eventsService = {
  async getEvents(upcoming: boolean = false, limit?: number): Promise<ApiResponse<EventsResponse>> {
    let endpoint = API_CONFIG.endpoints.events
    const params: string[] = []
    
    if (upcoming) params.push('upcoming=1')
    if (limit) params.push(`limit=${limit}`)
    
    if (params.length > 0) {
      endpoint += '?' + params.join('&')
    }
    
    return apiClient.get<EventsResponse>(endpoint)
  },

  async createEvent(data: CreateEventRequest): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.endpoints.events, data)
  },
}



