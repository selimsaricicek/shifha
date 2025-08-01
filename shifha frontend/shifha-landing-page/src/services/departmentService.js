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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllDepartments = async () => {
  try {
    const response = await api.get('/departments');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export const addDepartment = async (departmentData) => {
  try {
    const response = await api.post('/departments', departmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding department:', error);
    throw error;
  }
};

export const updateDepartment = async (id, departmentData) => {
  try {
    const response = await api.put(`/departments/${id}`, departmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating department:', error);
    throw error;
  }
};

export const deleteDepartment = async (id) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting department:', error);
    throw error;
  }
};

export const getDepartmentDoctors = async (id) => {
  try {
    const response = await api.get(`/departments/${id}/doctors`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching department doctors:', error);
    throw error;
  }
};