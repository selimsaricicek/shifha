import api from '../api/api';

export const getAdminProfile = async () => {
  try {
    const response = await api.get('/admin/profile');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

export const updateAdminProfile = async (profileData) => {
  try {
    const response = await api.put('/admin/profile', profileData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating admin profile:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getAllAdmins = async () => {
  try {
    const response = await api.get('/admin/admins');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

export const createAdmin = async (adminData) => {
  try {
    const response = await api.post('/admin/admins', adminData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};

export const updateAdmin = async (id, adminData) => {
  try {
    const response = await api.put(`/admin/admins/${id}`, adminData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await api.delete(`/admin/admins/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
};

// Mock function for notifications until backend endpoint is ready
export const getNotifications = async () => {
  try {
    // This is a mock implementation
    // Replace with actual API call when backend endpoint is ready
    return [
      {
        id: 1,
        title: 'Yeni hasta kaydı',
        message: 'Ahmet Yılmaz adlı hasta sisteme kaydoldu',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 2,
        title: 'Sistem güncellemesi',
        message: 'Sistem başarıyla güncellendi',
        type: 'success',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false
      }
    ];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};