/**
 * Authentication Hook
 * Kullanıcı kimlik doğrulama ve oturum yönetimi
 */

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Patient, Doctor } from '../types';
import { mockPatient, mockDoctor } from '../mockData';
import { authAPI, patientAPI } from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'patient' | 'doctor') => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Uygulama başlatıldığında oturum kontrolü
    const savedUser = localStorage.getItem('shifha_user');
    const savedToken = localStorage.getItem('shifha_token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Kaydedilmiş kullanıcı verisi okunamadı:', error);
        localStorage.removeItem('shifha_user');
        localStorage.removeItem('shifha_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'patient' | 'doctor'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Önce gerçek API'yi dene
      const response = await authAPI.login(email, password, role);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('shifha_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      }
      
      // API başarısız olursa mock data ile devam et (development için)
      console.warn('API login failed, using mock data for development');
      
      // Mock authentication - development için
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let userData: User;
      
      if (role === 'patient' && email === mockPatient.email) {
        userData = mockPatient;
      } else if (role === 'doctor' && email === mockDoctor.email) {
        userData = mockDoctor;
      } else {
        // Kayıt olmayanlar için demo kullanıcı oluştur
        if (role === 'patient') {
          userData = {
            ...mockPatient,
            email,
            name: email.split('@')[0],
            id: 'demo-patient-' + Date.now()
          };
        } else {
          userData = {
            ...mockDoctor,
            email,
            name: 'Dr. ' + email.split('@')[0],
            id: 'demo-doctor-' + Date.now()
          };
        }
      }
      
      setUser(userData);
      localStorage.setItem('shifha_user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
      
    } catch (error) {
      console.error('Giriş hatası:', error);
      setIsLoading(false);
      return false;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    
    try {
      // Hasta ise TC ile güncel bilgileri çek
      if (user.role === 'patient' && user.id) {
        const response = await patientAPI.getByTC(user.id);
        if (response.success && response.data) {
          const updatedUser: User = {
            ...user,
            name: `${response.data.ad} ${response.data.soyad}`,
            email: response.data.email || user.email,
            phone: response.data.telefon,
          };
          setUser(updatedUser);
          localStorage.setItem('shifha_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri güncellenirken hata:', error);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('shifha_user');
      localStorage.removeItem('shifha_token');
    }
  };

  return React.createElement(
    AuthContext.Provider,
    { value: { user, login, logout, isLoading, refreshUser } },
    children
  );
};