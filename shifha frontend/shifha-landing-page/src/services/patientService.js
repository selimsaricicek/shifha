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
  // Token'ı al ve header'a ekle
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔍 API isteği gönderiliyor:', config.url, 'Token var:', !!token);
  } else {
    console.warn('⚠️ Token bulunamadı!');
  }
  
  return config;
});

export const getAllPatients = async () => {
  try {
    // Doctor rolü için /patients endpoint'ini kullan
    const response = await api.get('/patients');
    console.log('✅ Hasta listesi API yanıtı:', response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error('❌ Hasta listesi alınırken hata:', error);
    console.error('❌ Hata detayları:', error.response?.data);
    throw error;
  }
};

export const getPatientByTC = async (tc) => {
  try {
    const response = await api.get(`/patients/${tc}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching patient by TC:', error);
    throw error;
  }
};

export const addPatient = async (patientData) => {
  try {
    const response = await api.post('/patients', patientData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

export const updatePatient = async (id, patientData) => {
  try {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

export const deletePatient = async (id) => {
  try {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

export const getBloodTestResults = async (patientId) => {
  try {
    const response = await api.get(`/patients/${patientId}/blood-test-results`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching blood test results:', error);
    throw error;
  }
};

export const getDoctorNotes = async (patientId) => {
  try {
    const response = await api.get(`/patients/${patientId}/notes`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching doctor notes:', error);
    throw error;
  }
};

export const addDoctorNote = async (patientId, noteData) => {
  try {
    const response = await api.post(`/patients/${patientId}/notes`, noteData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding doctor note:', error);
    throw error;
  }
};