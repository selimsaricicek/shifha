/**
 * Shifha Sağlık Uygulaması - Type Definitions
 * Uygulama genelinde kullanılan tüm TypeScript type'ları
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
  birthDate?: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Patient extends User {
  role: 'patient';
  doctorId?: string;
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  license: string;
  hospital?: string;
  patients?: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // "günde 2 kez", "sabah-akşam" vb.
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  sideEffects?: string[];
  isActive: boolean;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  takenAt: Date;
  taken: boolean;
  notes?: string;
  reminderTime?: Date;
}

export interface Symptom {
  id: string;
  patientId: string;
  date: Date;
  symptoms: string[];
  severity: 1 | 2 | 3 | 4 | 5; // 1: Hafif, 5: Şiddetli
  mood: 'happy' | 'sad' | 'tired' | 'stressed' | 'anxious' | 'normal';
  notes?: string;
  triggers?: string[];
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  testCode?: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  date: Date;
  status: 'normal' | 'high' | 'low' | 'critical';
  doctorNotes?: string;
  labName?: string;
  category: 'blood' | 'urine' | 'imaging' | 'other';
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: Date;
  duration: number; // dakika
  type: 'consultation' | 'checkup' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  symptoms?: string[];
  diagnosis?: string;
  prescription?: string[];
}

export interface QRCodeData {
  type: 'patient-access' | 'doctor-login';
  patientId?: string;
  doctorId?: string;
  timestamp: Date;
  expiresAt: Date;
  sessionId: string;
}

export interface HealthStats {
  patientId: string;
  period: 'week' | 'month' | 'quarter' | 'year';
  medicationCompliance: number; // 0-100 arası yüzde
  symptomFrequency: { [key: string]: number };
  moodTrends: { [key: string]: number };
  labTrends: { [key: string]: { value: number; date: Date }[] };
  lastUpdated: Date;
}

export type MoodEmoji = {
  mood: Symptom['mood'];
  emoji: string;
  label: string;
  color: string;
};

export type SeverityLevel = {
  level: Symptom['severity'];
  label: string;
  color: string;
  description: string;
};

// Randevu Sistemi Type'ları
export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
  code: string;
}

export interface Hospital {
  id: string;
  name: string;
  districtId: string;
  address: string;
  phone: string;
  type: 'devlet' | 'özel' | 'üniversite';
  specialties: string[];
}

export interface Clinic {
  id: string;
  name: string;
  hospitalId: string;
  specialty: string;
  description?: string;
}

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  clinicId: string;
  dayOfWeek: number; // 0-6 (Pazar-Cumartesi)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  appointmentDuration: number; // dakika
  isActive: boolean;
}

export interface AppointmentSlot {
  id: string;
  doctorId: string;
  clinicId: string;
  date: Date;
  time: string; // "09:00"
  isAvailable: boolean;
  isBooked: boolean;
  patientId?: string;
}

export interface AppointmentBooking {
  id: string;
  patientId: string;
  doctorId: string;
  clinicId: string;
  hospitalId: string;
  appointmentSlotId: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}