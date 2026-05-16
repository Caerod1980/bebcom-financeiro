import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  getMe: () => api.get('/auth/me'),
};

// Entry services
export const entryService = {
  create: (data) => api.post('/entries', data),
  getAll: (params) => api.get('/entries', { params }),
  getById: (id) => api.get(`/entries/${id}`),
  update: (id, data) => api.put(`/entries/${id}`, data),
  delete: (id) => api.delete(`/entries/${id}`),
};

// DRE services
export const dreService = {
  getMonthly: (month, year) => api.get('/dre/monthly', { params: { month, year } }),
  closeMonth: (month, year) => api.post('/dre/close-month', { month, year }),
  getDashboard: (month, year) => api.get('/dre/dashboard', { params: { month, year } }),
};

export default api;
