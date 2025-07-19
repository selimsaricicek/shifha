import axios from 'axios';

// Backend port 3001'de çalışıyor
const API_URL = 'http://localhost:3001/api/auth';

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
  try {
    const res = await axios.post(`${API_URL}/login`, data);
    return res.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};
