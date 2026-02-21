// API Configuration
// Uses VITE_API_URL environment variable for production
// Falls back to relative path /api for production (when frontend and backend are on same domain)
// Falls back to localhost:5004 for development (when VITE_API_URL is not set)

const getApiUrl = () => {
  // If VITE_API_URL is explicitly set, use it (for production with separate domains)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In development, use localhost (or rely on Vite proxy)
  // In production without VITE_API_URL, use relative path (same origin)
  return import.meta.env.MODE === 'development' 
    ? 'http://localhost:5004/api' 
    : '/api';
};

export const API_URL = getApiUrl();

// Export base URL without /api suffix for media URLs
export const BASE_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : (import.meta.env.MODE === 'development' ? 'http://localhost:5004' : '');

export default API_URL;
