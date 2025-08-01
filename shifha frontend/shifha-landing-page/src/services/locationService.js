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

// Cities
export const getAllCities = async () => {
  try {
    const response = await api.get('/locations/cities');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    throw error;
  }
};

export const addCity = async (cityData) => {
  try {
    const response = await api.post('/locations/cities', cityData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding city:', error);
    throw error;
  }
};

// Districts
export const getDistrictsByCity = async (cityId) => {
  try {
    const response = await api.get(`/locations/cities/${cityId}/districts`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
};

export const addDistrict = async (districtData) => {
  try {
    const response = await api.post('/locations/districts', districtData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding district:', error);
    throw error;
  }
};

// Hospitals
export const getAllHospitals = async () => {
  try {
    const response = await api.get('/locations/hospitals');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw error;
  }
};

export const getHospitalsByDistrict = async (districtId) => {
  try {
    const response = await api.get(`/locations/districts/${districtId}/hospitals`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hospitals by district:', error);
    throw error;
  }
};

export const addHospital = async (hospitalData) => {
  try {
    const response = await api.post('/locations/hospitals', hospitalData);
    return response.data.data;
  } catch (error) {
    console.error('Error adding hospital:', error);
    throw error;
  }
};

export const updateHospital = async (id, hospitalData) => {
  try {
    const response = await api.put(`/locations/hospitals/${id}`, hospitalData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating hospital:', error);
    throw error;
  }
};

export const deleteHospital = async (id) => {
  try {
    const response = await api.delete(`/locations/hospitals/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting hospital:', error);
    throw error;
  }
};