import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillnest_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected action, clear stored token
      const isAuthEndpoint = error.config.url.includes('/auth/login') || error.config.url.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('skillnest_token');
        localStorage.removeItem('skillnest_user');
      }
    }
    return Promise.reject(error);
  }
);

/* ------------------- Auth API ------------------- */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  updatePassword: (passwordData) => api.put('/auth/password', passwordData),
};

/* ----------------- Resources API ---------------- */
export const resourceAPI = {
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  getFeatured: () => api.get('/resources/featured'),
  getTrending: () => api.get('/resources/trending'),
  getRecommendations: () => api.get('/resources/recommendations'),
  getMyResources: () => api.get('/resources/user/me'),
  getCategories: () => api.get('/resources/meta/categories'),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

/* ---------------- Favourites API ---------------- */
export const favouriteAPI = {
  getAll: () => api.get('/favourites'),
  add: (resourceId) => api.post(`/favourites/${resourceId}`),
  remove: (resourceId) => api.delete(`/favourites/${resourceId}`),
  check: (resourceId) => api.get(`/favourites/check/${resourceId}`),
};

/* ------------------ Reviews API ----------------- */
export const reviewAPI = {
  getByResource: (resourceId) => api.get(`/resources/${resourceId}/reviews`),
  create: (resourceId, reviewData) => api.post(`/resources/${resourceId}/reviews`, reviewData),
  update: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

/* ------------------ Reports API ----------------- */
export const reportAPI = {
  create: (resourceId, reportData) => api.post(`/resources/${resourceId}/reports`, reportData),
};

/* ------------------- Admin API ------------------ */
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getResources: (params) => api.get('/admin/resources', { params }),
  updateResourceStatus: (id, data) => api.patch(`/admin/resources/${id}/status`, data),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, data) => api.patch(`/admin/reports/${id}/status`, data),
};

/* ------------------- Stats API ------------------ */
export const statsAPI = {
  getSummary: () => api.get('/stats/summary'),
};

export default api;
