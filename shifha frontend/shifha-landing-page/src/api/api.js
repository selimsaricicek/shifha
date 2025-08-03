import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const organizationId = localStorage.getItem('organizationId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (organizationId) {
    config.headers['X-Organization-Id'] = organizationId;
    // Also send as query param fallback for older backend
    if (!config.params) config.params = {};
    config.params.organizationId = organizationId;
  }

  return config;
});

export default api;