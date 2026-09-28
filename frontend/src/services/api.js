import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('km_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  googleAuth: (data) => api.post('/auth/google', data),
  getMe: () => api.get('/auth/me'),
};

export const itemApi = {
  getFeed: (params) => api.get('/items/feed', { params }),
  getItem: (id) => api.get(`/items/${id}`),
  createItem: (data) => api.post('/items', data),
  reportFound: (id, data) => api.post(`/items/${id}/report-found`, data),
  getMyItems: () => api.get('/items/my'),
  deleteItem: (id) => api.delete(`/items/${id}`),
};

export const claimApi = {
  submitQuiz: (data) => api.post('/claims/quiz', data),
  confirmByFinder: (claimId) => api.post(`/claims/${claimId}/confirm`),
  getMyClaims: () => api.get('/claims/my'),
  getFinderClaims: () => api.get('/claims/finder'),
  getClaim: (id) => api.get(`/claims/${id}`),
};

export const chatApi = {
  getMessages: (claimId) => api.get(`/chat/${claimId}`),
  sendMessage: (claimId, content) => api.post(`/chat/${claimId}`, { content }),
};

export const rewardApi = {
  submitReward: (data) => api.post('/rewards', data),
  getReward: (claimId) => api.get(`/rewards/claim/${claimId}`),
};

export const adminApi = {
  getPending: () => api.get('/admin/pending'),
  approveItem: (id) => api.post(`/admin/items/${id}/approve`),
  rejectItem: (id) => api.post(`/admin/items/${id}/reject`),
  readyForPickup: (id) => api.post(`/admin/items/${id}/ready-for-pickup`),
  handoverComplete: (id) => api.post(`/admin/items/${id}/handover`),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getMetrics: () => api.get('/admin/metrics'),
};

export default api;
