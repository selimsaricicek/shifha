import api from '../api/api';

export const getAllDoctors = async (organizationId) => {
  try {
    const response = await api.get('/admin/doctors', { params: { organizationId } });
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