import api from '../api/api';

export const getAllDepartments = async (organizationId) => {
  try {
    const response = await api.get('/departments', { params: { organizationId } });
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