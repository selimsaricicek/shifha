import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  // Admin paneli için adminToken, normal kullanıcı için token kullan
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');
  const token = adminToken || userToken;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const orgId = localStorage.getItem('organizationId');
  if (orgId) {
    config.headers['x-organization-id'] = orgId;
  }
  return config;
});

export const getAllDoctors = async () => {
  try {
    const response = await api.get('/admin/doctors');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export const getDoctorById = async (id) => {
  try {
    const response = await api.get(`/doctors/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching doctor:', error);
    throw error;
  }
};

export const addDoctor = async (doctorData) => {
  try {
    const response = await api.post('/doctors', doctorData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding doctor:', error);
    throw error;
  }
};

export const updateDoctor = async (id, doctorData) => {
  try {
    const response = await api.put(`/doctors/${id}`, doctorData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
};

export const deleteDoctor = async (id) => {
  try {
    const response = await api.delete(`/doctors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting doctor:', error);
    throw error;
  }
};