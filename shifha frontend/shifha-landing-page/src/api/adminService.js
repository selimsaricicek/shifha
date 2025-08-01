import axios from 'axios';

const API_URL = 'http://localhost:3001/api/admin';

// Create axios instance with default config
const adminAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
adminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin Profile
export const getAdminProfile = async () => {
  try {
    const response = await adminAPI.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Get admin profile error:', error);
    throw error;
  }
};

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const response = await adminAPI.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    throw error;
  }
};

// Admin Management
export const getAllAdmins = async () => {
  try {
    const response = await adminAPI.get('/admins');
    return response.data;
  } catch (error) {
    console.error('Get all admins error:', error);
    throw error;
  }
};

export const createAdmin = async (adminData) => {
  try {
    const response = await adminAPI.post('/admins', adminData);
    return response.data;
  } catch (error) {
    console.error('Create admin error:', error);
    throw error;
  }
};

export const updateAdmin = async (id, adminData) => {
  try {
    const response = await adminAPI.put(`/admins/${id}`, adminData);
    return response.data;
  } catch (error) {
    console.error('Update admin error:', error);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await adminAPI.delete(`/admins/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete admin error:', error);
    throw error;
  }
};

// Notifications (mock for now - can be extended)
export const getNotifications = async () => {
  try {
    // This can be replaced with real API call when notifications endpoint is ready
    return {
      success: true,
      data: [
        {
          id: 1,
          message: "Yeni hasta kaydı oluşturuldu",
          time: "2 dakika önce",
          type: "info"
        },
        {
          id: 2,
          message: "Sistem güncellemesi tamamlandı",
          time: "1 saat önce",
          type: "success"
        },
        {
          id: 3,
          message: "Yedekleme işlemi başarılı",
          time: "3 saat önce",
          type: "success"
        }
      ]
    };
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

export default {
  getAdminProfile,
  getDashboardStats,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getNotifications
};