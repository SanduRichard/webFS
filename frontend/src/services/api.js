import axios from 'axios';

// Detectăm automat URL-ul API-ului bazat pe cum e accesat site-ul
const getApiUrl = () => {
  // Dacă e accesat prin localhost, folosim proxy-ul Vite (/api)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return '/api';
  }
  // Altfel, folosim IP-ul din env sau construim din hostname-ul curent
  return import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000/api`;
};

// Creare instanță Axios
const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor pentru adăugarea token-ului de autentificare
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

// Interceptor pentru gestionarea răspunsurilor și erorilor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestionare eroare 401 (neautorizat)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data)
};

// Activities API
export const activitiesAPI = {
  getAll: (status = 'all') => api.get(`/activities?status=${status}`),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  join: (accessCode) => api.post('/activities/join', { accessCode }),
  stop: (id) => api.post(`/activities/${id}/stop`)
};

// Feedback API
export const feedbackAPI = {
  send: (data) => api.post('/feedback', data),
  getByActivity: (activityId) => api.get(`/feedback/${activityId}`),
  getTimeline: (activityId) => api.get(`/feedback/${activityId}/timeline`),
  getStats: (activityId) => api.get(`/feedback/${activityId}/stats`)
};

export default api;
