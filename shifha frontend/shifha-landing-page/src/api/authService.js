import axios from 'axios';
import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/auth';

export const register = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data;
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    throw error;
  }
};

export const login = async (data) => {
  const res = await api.post('/auth/login', data);
  if (res.data.token) {
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('organizationId', res.data.organizationId);
  }
  return res.data;
};

export const adminLogin = async (data) => {
  const res = await api.post('/auth/admin-login', data);
  if (res.data.token) {
    localStorage.setItem('adminToken', res.data.token);
    localStorage.setItem('organizationId', res.data.organizationId);
  }
  return res.data;
};
