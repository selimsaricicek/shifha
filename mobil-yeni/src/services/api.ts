/**
 * API Service Layer
 * Backend ile iletişim için merkezi servis katmanı
 */

import { User, Patient, Doctor, LabResult, Appointment, Medication, Symptom } from '@/components/shifha/types';

// API Base URL - environment variable'dan alınır, yoksa localhost kullanılır
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface PatientData {
  id: string;
  tc: string;
  ad: string;
  soyad: string;
  yas: number;
  cinsiyet: string;
  telefon: string;
  email: string;
  adres: string;
  allerjiler?: string;
  kronik_hastaliklar?: string;
  created_at: string;
  updated_at: string;
}

// HTTP Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    this.token = localStorage.getItem('shifha_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication Methods
  async login(email: string, password: string, role: 'patient' | 'doctor'): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (response.success && response.data?.token) {
      this.token = response.data.token;
      localStorage.setItem('shifha_token', this.token);
    }

    return response;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'patient' | 'doctor';
    phone?: string;
    birthDate?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('shifha_token');
    localStorage.removeItem('shifha_user');
  }

  // Patient Methods
  async getPatientByTC(tc: string): Promise<ApiResponse<PatientData>> {
    return this.request<PatientData>(`/patients/${tc}`);
  }

  async updatePatient(tc: string, data: Partial<PatientData>): Promise<ApiResponse<PatientData>> {
    return this.request<PatientData>(`/patients/${tc}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAllPatients(): Promise<ApiResponse<PatientData[]>> {
    return this.request<PatientData[]>('/patients');
  }

  // Lab Results Methods
  async getLabResults(patientTC: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/patients/${patientTC}/blood-tests`);
  }

  async uploadLabResults(patientTC: string, file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch(`${this.baseURL}/pdf/upload/${patientTC}`, {
        method: 'POST',
        headers: {
          'Authorization': this.token ? `Bearer ${this.token}` : '',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // Medical Analysis Methods
  async getMedicalAnalysis(patientTC: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/medical-analysis/patient/${patientTC}`);
  }

  async generateMedicalAnalysis(patientTC: string): Promise<ApiResponse<any>> {
    return this.request<any>('/medical-analysis/blood-test', {
      method: 'POST',
      body: JSON.stringify({ patientTC }),
    });
  }

  // Medication Methods (Future implementation)
  async getMedications(patientId: string): Promise<ApiResponse<Medication[]>> {
    return this.request<Medication[]>(`/medications/patient/${patientId}`);
  }

  async addMedication(medication: Omit<Medication, 'id'>): Promise<ApiResponse<Medication>> {
    return this.request<Medication>('/medications', {
      method: 'POST',
      body: JSON.stringify(medication),
    });
  }

  // Symptoms Methods (Future implementation)
  async getSymptoms(patientId: string): Promise<ApiResponse<Symptom[]>> {
    return this.request<Symptom[]>(`/symptoms/patient/${patientId}`);
  }

  async addSymptom(symptom: Omit<Symptom, 'id'>): Promise<ApiResponse<Symptom>> {
    return this.request<Symptom>('/symptoms', {
      method: 'POST',
      body: JSON.stringify(symptom),
    });
  }

  // Appointments Methods (Future implementation)
  async getAppointments(userId: string, role: 'patient' | 'doctor'): Promise<ApiResponse<Appointment[]>> {
    const endpoint = role === 'patient' 
      ? `/appointments/patient/${userId}`
      : `/appointments/doctor/${userId}`;
    return this.request<Appointment[]>(endpoint);
  }

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<ApiResponse<Appointment>> {
    return this.request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Convenience exports
export const authAPI = {
  login: (email: string, password: string, role: 'patient' | 'doctor') => 
    apiClient.login(email, password, role),
  register: (userData: any) => apiClient.register(userData),
  logout: () => apiClient.logout(),
};

export const patientAPI = {
  getByTC: (tc: string) => apiClient.getPatientByTC(tc),
  update: (tc: string, data: any) => apiClient.updatePatient(tc, data),
  getAll: () => apiClient.getAllPatients(),
};

export const labAPI = {
  getResults: (patientTC: string) => apiClient.getLabResults(patientTC),
  upload: (patientTC: string, file: File) => apiClient.uploadLabResults(patientTC, file),
};

export const medicalAnalysisAPI = {
  get: (patientTC: string) => apiClient.getMedicalAnalysis(patientTC),
  generate: (patientTC: string) => apiClient.generateMedicalAnalysis(patientTC),
};

export default apiClient;