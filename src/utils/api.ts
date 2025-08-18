// API utility functions for making calls to our REST endpoints

import { Post } from '@/types/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

// Helper function to get auth token from Supabase
const getAuthToken = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Import Supabase client and get current session
      const { supabase } = await import('../../supabase/Supabase')
      const { data: { session }, error } = await supabase.auth.getSession()

      console.log('Current session:', session);
      console.log('Session error:', error);

      if (error) {
        console.error('Error getting session:', error);
        return null;
      }

      return session?.access_token || null;
    } catch (error) {
      console.error('Error importing Supabase or getting session:', error);
      return null;
    }
  }
  return null
}

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken()
  const url = `${API_BASE_URL}${endpoint}`

  console.log('Request URL:', url);
  console.log('Authorization Token:', token ? 'Present' : 'Missing');

  if (!token) {
    throw new Error('No authentication token available. Please log in.');
  }

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    // Log response details for debugging
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    console.log('Response data:', data);

    if (!response.ok) {
      console.error('API error response:', data)
      throw new Error(data.details || data.error || `API request failed with status ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API request error:', error)
    throw error instanceof Error ? error : new Error(String(error))
  }
}

// Authentication API calls
export const authAPI = {
  signup: async (email: string, password: string) => {
    return apiRequest('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'signup', email, password }),
    })
  },

  signin: async (email: string, password: string) => {
    return apiRequest('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'signin', email, password }),
    })
  },

  getCurrentUser: async () => {
    return apiRequest('/api/auth?action=user', {
      method: 'GET',
    })
  },
}


export const questionsAPI = {
  getQuestions: async (limit: number = 10) => {
    return apiRequest(`/api/questions?limit=${limit}`, {
      method: 'GET',
    })
  }, 
}

export const resultsAPI = {
  getResults: async (userId: string) => {
    return apiRequest(`/api/results?userId=${userId}`, {
      method: 'GET',
    })
  },
  saveResult: async (result: any) => {
    return apiRequest('/api/results', {
      method: 'POST',
      body: JSON.stringify(result),
    })
  },
}


export const responsesAPI = {
  getResponses: async (userId: string) => {
    return apiRequest(`/api/responses?userId=${userId}`, {
      method: 'GET',
    })
  },
  saveResponses: async (responses: any) => {
    return apiRequest('/api/responses', {    
      method: 'POST', 
      body: JSON.stringify(responses),
    })
  },
} 

export const api = {
  auth: authAPI,
  questions: questionsAPI,
  results: resultsAPI,
  responses: responsesAPI
}