import { API_BASE_URL, ENDPOINTS, getApiUrl } from '../constants/api';

// Generic fetch wrapper with error handling
const fetchApi = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error.message === 'Network request failed') {
      throw new Error('Please check your connection and try again');
    }
    throw error;
  }
};

// Content API
export const contentApi = {
  // Scan a title for content
  scan: async (title, contentType) => {
    return fetchApi(ENDPOINTS.scan, {
      method: 'POST',
      body: JSON.stringify({
        title,
        content_type: contentType,
      }),
    });
  },

  // Get recent scans
  getRecent: async (limit = 5) => {
    return fetchApi(`${ENDPOINTS.recent}?limit=${limit}`);
  },

  // Get cached result
  getCached: async (title, contentType) => {
    const params = new URLSearchParams({ title });
    if (contentType) {
      params.append('content_type', contentType);
    }
    return fetchApi(`${ENDPOINTS.cached}?${params}`);
  },
};

// Autocomplete API
export const autocompleteApi = {
  // Search titles
  search: async (query, contentType, limit = 10) => {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    if (contentType) {
      params.append('content_type', contentType);
    }
    return fetchApi(`${ENDPOINTS.autocompleteSearch}?${params}`);
  },

  // Get popular titles
  getPopular: async (contentType, limit = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (contentType) {
      params.append('content_type', contentType);
    }
    return fetchApi(`${ENDPOINTS.autocompletePopular}?${params}`);
  },
};

// Health check
export const checkApiHealth = async () => {
  try {
    const data = await fetchApi(ENDPOINTS.health);
    return data.status === 'ok';
  } catch {
    return false;
  }
};
