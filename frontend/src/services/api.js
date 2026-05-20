import axios from 'axios';

// ⭐ CONFIGURAÇÃO DE AMBIENTE
// Desenvolvimento: http://localhost:5000/api
// Produção: URL do Azure
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ⭐ URLS POR AMBIENTE (fallback)
const getApiUrl = () => {
  // Se for produção (build), usa Azure
  if (import.meta.env.PROD) {
    return 'https://bebcom-financeiro-api-cdbve8b7ffctc2ck.brazilsouth-01.azurewebsites.net/api';
  }
  // Desenvolvimento local
  return API_URL;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos timeout
});

// ⭐ LOG DE REQUISIÇÕES (apenas desenvolvimento)
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}

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
    // ⭐ LOG DE ERROS (apenas desenvolvimento)
    if (import.meta.env.DEV) {
      console.error('❌ [API Error]:', error.response?.status, error.response?.data);
    }
    
    // Token expirado ou inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      
      // Redirecionar para login apenas se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // ⭐ ERRO DE CONEXÃO
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('❌ Erro de conexão com o servidor');
      // Opcional: mostrar toast de erro
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH SERVICES
// ============================================
export const authService = {
  login: (email, password) => {
    // ⭐ Normalizar email antes de enviar
    const normalizedEmail = email?.toLowerCase().trim();
    return api.post('/auth/login', { email: normalizedEmail, password });
  },
  
  register: (name, email, password) => {
    const normalizedEmail = email?.toLowerCase().trim();
    return api.post('/auth/register', { name: name?.trim(), email: normalizedEmail, password });
  },
  
  getMe: () => api.get('/auth/me'),
  
  // ⭐ NOVOS MÉTODOS ADMIN
  createUser: (name, email, password, role) => 
    api.post('/auth/admin/create-user', { name, email, password, role }),
  
  deactivateUser: (userId) => 
    api.put(`/auth/admin/deactivate/${userId}`),
};

// ============================================
// ENTRY SERVICES
// ============================================
export const entryService = {
  create: (data) => api.post('/entries', data),
  
  getAll: (params) => {
    // ⭐ SANITIZAR PARAMS (remover undefined/vazio)
    const cleanParams = {};
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] && params[key] !== '') {
          cleanParams[key] = params[key];
        }
      });
    }
    return api.get('/entries', { params: cleanParams });
  },
  
  getById: (id) => api.get(`/entries/${id}`),
  
  update: (id, data) => {
    // ⭐ Remover campos sensíveis que não podem ser alterados
    const { createdBy, deleted, deletedAt, _id, ...safeData } = data;
    return api.put(`/entries/${id}`, safeData);
  },
  
  delete: (id) => api.delete(`/entries/${id}`),
};

// ============================================
// DRE SERVICES
// ============================================
export const dreService = {
  getMonthly: (month, year) => {
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return Promise.reject(new Error('Mês inválido'));
    }
    
    return api.get('/dre/monthly', { params: { month: parsedMonth, year: parsedYear } });
  },
  
  closeMonth: (month, year) => {
    const parsedMonth = parseInt(month);
    const parsedYear = parseInt(year);
    return api.post('/dre/close-month', { month: parsedMonth, year: parsedYear });
  },
  
  getDashboard: (month, year) => {
    if (month && year) {
      const parsedMonth = parseInt(month);
      const parsedYear = parseInt(year);
      return api.get('/dre/dashboard', { params: { month: parsedMonth, year: parsedYear } });
    }
    return api.get('/dre/dashboard');
  },
  
  // ⭐ NOVOS MÉTODOS
  compareMonths: (month1, year1, month2, year2) => 
    api.get('/dre/compare', { params: { month1, year1, month2, year2 } }),
  
  getYearSummary: (year) => 
    api.get('/dre/year-summary', { params: { year } }),
};
// ============================================
// BALANCE SHEET SERVICES
// ============================================
export const balanceSheetService = {
  getByYear: (year) => {
    const parsedYear = parseInt(year);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return Promise.reject(new Error('Ano inválido'));
    }

    return api.get(`/balance-sheet/${parsedYear}`);
  },

  save: (year, data) => {
    const parsedYear = parseInt(year);

    if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
      return Promise.reject(new Error('Ano inválido'));
    }

    return api.put(`/balance-sheet/${parsedYear}`, data);
  },
};

// ============================================
// HEALTH CHECK SERVICE
// ============================================
export const healthService = {
  check: () => api.get('/health'),
  getApiUrl: () => getApiUrl(),
};

export default api;
