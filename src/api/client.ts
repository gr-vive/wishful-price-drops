// API Client for backend communication
import { ItemDTO } from '@/types/item';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const TIMEOUT = 6000; // 6 seconds

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Base fetch with timeout and session ID
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Id': getSessionId(),
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Try to parse error message from JSON
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          throw new Error(errorData.error.message);
        }
      } catch {
        // If JSON parsing fails, use status text
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - consider enabling Demo Mode');
    }
    throw error;
  }
}

// API methods
export const api = {
  // GET /health
  health: async (): Promise<{ ok: boolean; version: string }> => {
    return request('/health');
  },

  // GET /items
  listItems: async (): Promise<ItemDTO[]> => {
    return request('/items');
  },

  // POST /items
  createItem: async (body: any): Promise<ItemDTO> => {
    return request('/items', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // PATCH /items/:id
  patchItem: async (id: string, body: any): Promise<ItemDTO> => {
    return request(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  // DELETE /items/:id
  deleteItem: async (id: string): Promise<{ ok: true }> => {
    return request(`/items/${id}`, {
      method: 'DELETE',
    });
  },

  // POST /prices/refresh
  refreshPrices: async (ids?: string[]): Promise<{ updated: ItemDTO[] }> => {
    return request('/prices/refresh', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  // POST /items/:id/simulate-drop (demo)
  simulateDrop: async (id: string): Promise<ItemDTO> => {
    return request(`/items/${id}/simulate-drop`, {
      method: 'POST',
    });
  },

  // POST /alerts/email
  sendEmail: async (itemId: string, email: string): Promise<{ ok: true }> => {
    return request('/alerts/email', {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, email }),
    });
  },
};
