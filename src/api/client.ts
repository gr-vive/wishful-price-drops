// API Client for backend communication
// This will be implemented when backend is ready

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
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
async function apiFetch(endpoint: string, options: RequestInit = {}) {
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
      throw new Error(`API error: ${response.status}`);
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

// API methods (to be implemented)
export const api = {
  // GET /items
  getItems: async () => {
    return apiFetch('/items');
  },

  // POST /items
  createItem: async (data: any) => {
    return apiFetch('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PATCH /items/:id
  updateItem: async (id: string, data: any) => {
    return apiFetch(`/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE /items/:id
  deleteItem: async (id: string) => {
    return apiFetch(`/items/${id}`, {
      method: 'DELETE',
    });
  },

  // POST /prices/refresh
  refreshPrices: async (ids?: string[]) => {
    return apiFetch('/prices/refresh', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  // POST /items/:id/simulate-drop (demo)
  simulateDrop: async (id: string) => {
    return apiFetch(`/items/${id}/simulate-drop`, {
      method: 'POST',
    });
  },
};
