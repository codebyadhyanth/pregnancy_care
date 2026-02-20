import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_URL } from '../config/api.js';

// Uses environment variable VITE_API_URL for production deployment
// Falls back to localhost for development or relative path for same-origin production
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';

        // Handle 401 Unauthorized (e.g., token expired)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Only redirect if not already on login page to avoid loops or bad UX
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        } else {
            // Toast handled by component or here? 
            // The existing code has toast.error(message).
            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export const communityService = {
    getPosts: () => api.get('/community/posts'),
    createPost: (formData) => api.post('/community/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    likePost: (id) => api.put(`/community/post/${id}/like`),
    replyPost: (id, content) => api.post(`/community/post/${id}/reply`, { content }),
    deletePost: (id) => api.delete(`/community/post/${id}`)
};

export default api;
