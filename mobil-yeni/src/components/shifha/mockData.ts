/**
 * Shifha Sağlık Uygulaması - Mock Data
 * Geliştirme ve test için örnek veriler
 */

import { User, Patient, Doctor, Medication, MedicationLog, Symptom, LabResult, Appointment, MoodEmoji, SeverityLevel, Province, District, Hospital, Clinic, DoctorSchedule, AppointmentSlot, AppointmentBooking } from './types';

// Mock Users
export const mockPatient: Patient = {
  id: 'patient-1',
  email: 'ahmet.yilmaz@email.com',
  name: 'Ahmet Yılmaz',
  role: 'patient',
  birthDate: '1985-03-15',
  phone: '+90 532 123 45 67',
  createdAt: new Date('2024-01-15'),
  doctorId: 'doctor-1',
  allergies: ['Penisilin', 'Fıstık'],
  emergencyContact: {
    name: 'Ayşe Yılmaz',
    phone: '+90 532 765 43 21',
    relation: 'Eş'
  }
};

export const mockDoctor: Doctor = {
  id: 'doctor-1',
  email: 'dr.mehmet@hastane.com',
  name: 'Dr. Mehmet Demir',
  role: 'doctor',
  specialization: 'Kardiyoloji',
  license: 'TR123456789',
  hospital: 'Şehir Hastanesi',
  phone: '+90 212 123 45 67',
  createdAt: new Date('2020-05-10'),
  patients: ['patient-1']
};

// Mock Medications
export const mockMedications: Medication[] = [
  {
    id: 'med-1',
    name: 'Aspirin 100mg',
    dosage: '100mg',
    frequency: 'Günde 1 kez',
    startDate: new Date('2024-01-01'),
    instructions: 'Yemek sonrası alınız',
    isActive: true,
    sideEffects: ['Mide rahatsızlığı', 'Kanama riski']
  },
  {
    id: 'med-2',
    name: 'Lisinopril 10mg',
    dosage: '10mg',
    frequency: 'Günde 1 kez',
    startDate: new Date('2024-01-01'),
    instructions: 'Sabah aç karnına',
    isActive: true
  },
  {
    id: 'med-3',
    name: 'Metformin 500mg',
    dosage: '500mg',
    frequency: 'Günde 2 kez',
    startDate: new Date('2024-01-01'),
    instructions: 'Yemek ile birlikte',
    isActive: true,
    sideEffects: ['Mide bulantısı', 'İshal']
  }
];

// Mock Medication Logs
export const mockMedicationLogs: MedicationLog[] = [
  {
    id: 'log-1',
    medicationId: 'med-1',
    patientId: 'patient-1',
    takenAt: new Date(),
    taken: true
  },
  {
    id: 'log-2',
    medicationId: 'med-2',
    patientId: 'patient-1',
    takenAt: new Date(Date.now() - 86400000), // dün
    taken: true
  },
  {
    id: 'log-3',
    medicationId: 'med-3',
    patientId: 'patient-1',
    takenAt: new Date(),
    taken: false,
    notes: 'Unutmuşum'
  }
];

// Mock Symptoms
export const mockSymptoms: Symptom[] = [
  {
    id: 'symptom-1',
    patientId: 'patient-1',
    date: new Date(),
    symptoms: ['Baş ağrısı', 'Yorgunluk'],
    severity: 3,
    mood: 'tired',
    notes: 'Çok yorgun hissediyorum'
  },
  {
    id: 'symptom-2',
    patientId: 'patient-1',
    date: new Date(Date.now() - 86400000),
    symptoms: ['Mide bulantısı'],
    severity: 2,
    mood: 'normal',
    notes: 'Hafif mide bulantısı'
  },
  {
    id: 'symptom-3',
    patientId: 'patient-1',
    date: new Date(Date.now() - 2 * 86400000),
    symptoms: ['Baş ağrısı'],
    severity: 4,
    mood: 'stressed',
    notes: 'İş stresi yüzünden'
  }
];

// Mock Lab Results
export const mockLabResults: LabResult[] = [
  // HbA1c - Multiple entries for trend
  {
    id: 'lab-hba1c-1',
    patientId: 'patient-1',
    testName: 'HbA1c',
    testCode: 'HBA1C',
    value: 6.0,
    unit: '%',
    referenceRange: { min: 4.0, max: 5.6 },
    date: new Date('2023-01-15'),
    status: 'high',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-hba1c-2',
    patientId: 'patient-1',
    testName: 'HbA1c',
    testCode: 'HBA1C',
    value: 6.5,
    unit: '%',
    referenceRange: { min: 4.0, max: 5.6 },
    date: new Date('2023-08-20'),
    status: 'high',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-hba1c-3',
    patientId: 'patient-1',
    testName: 'HbA1c',
    testCode: 'HBA1C',
    value: 5.8,
    unit: '%',
    referenceRange: { min: 4.0, max: 5.6 },
    date: new Date('2024-07-10'),
    status: 'high',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // Hemoglobin - Multiple entries
  {
    id: 'lab-hgb-1',
    patientId: 'patient-1',
    testName: 'Hemoglobin',
    testCode: 'HGB',
    value: 13.5,
    unit: 'g/dL',
    referenceRange: { min: 12.0, max: 16.0 },
    date: new Date('2023-06-15'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-hgb-2',
    patientId: 'patient-1',
    testName: 'Hemoglobin',
    testCode: 'HGB',
    value: 14.2,
    unit: 'g/dL',
    referenceRange: { min: 12.0, max: 16.0 },
    date: new Date('2024-01-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // Glukoz - Multiple entries
  {
    id: 'lab-glukoz-1',
    patientId: 'patient-1',
    testName: 'Açlık Kan Şekeri',
    testCode: 'FBG',
    value: 125,
    unit: 'mg/dL',
    referenceRange: { min: 70, max: 100 },
    date: new Date('2023-09-10'),
    status: 'high',
    category: 'blood',
    doctorNotes: 'Diyete dikkat edilmeli'
  },
  {
    id: 'lab-glukoz-2',
    patientId: 'patient-1',
    testName: 'Açlık Kan Şekeri',
    testCode: 'FBG',
    value: 110,
    unit: 'mg/dL',
    referenceRange: { min: 70, max: 100 },
    date: new Date('2024-01-20'),
    status: 'high',
    category: 'blood',
    doctorNotes: 'Diyete dikkat edilmeli'
  },
  
  // Kolesterol - Multiple entries
  {
    id: 'lab-chol-1',
    patientId: 'patient-1',
    testName: 'Kolesterol',
    testCode: 'CHOL',
    value: 190,
    unit: 'mg/dL',
    referenceRange: { min: 0, max: 200 },
    date: new Date('2023-03-15'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-chol-2',
    patientId: 'patient-1',
    testName: 'Kolesterol',
    testCode: 'CHOL',
    value: 180,
    unit: 'mg/dL',
    referenceRange: { min: 0, max: 200 },
    date: new Date('2024-01-15'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // Üre - Multiple entries
  {
    id: 'lab-ure-1',
    patientId: 'patient-1',
    testName: 'Üre',
    testCode: 'BUN',
    value: 28,
    unit: 'mg/dL',
    referenceRange: { min: 7, max: 20 },
    date: new Date('2023-11-10'),
    status: 'high',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-ure-2',
    patientId: 'patient-1',
    testName: 'Üre',
    testCode: 'BUN',
    value: 25,
    unit: 'mg/dL',
    referenceRange: { min: 7, max: 20 },
    date: new Date('2024-01-10'),
    status: 'high',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // Kreatinin - Multiple entries
  {
    id: 'lab-kreatinin-1',
    patientId: 'patient-1',
    testName: 'Kreatinin',
    testCode: 'CREA',
    value: 1.1,
    unit: 'mg/dL',
    referenceRange: { min: 0.6, max: 1.2 },
    date: new Date('2023-07-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-kreatinin-2',
    patientId: 'patient-1',
    testName: 'Kreatinin',
    testCode: 'CREA',
    value: 1.0,
    unit: 'mg/dL',
    referenceRange: { min: 0.6, max: 1.2 },
    date: new Date('2024-01-15'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // TSH - Multiple entries
  {
    id: 'lab-tsh-1',
    patientId: 'patient-1',
    testName: 'TSH',
    testCode: 'TSH',
    value: 3.2,
    unit: 'μIU/mL',
    referenceRange: { min: 0.27, max: 4.2 },
    date: new Date('2023-05-12'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-tsh-2',
    patientId: 'patient-1',
    testName: 'TSH',
    testCode: 'TSH',
    value: 2.8,
    unit: 'μIU/mL',
    referenceRange: { min: 0.27, max: 4.2 },
    date: new Date('2024-01-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // Trigliserit - Multiple entries
  {
    id: 'lab-trig-1',
    patientId: 'patient-1',
    testName: 'Trigliserit',
    testCode: 'TRIG',
    value: 160,
    unit: 'mg/dL',
    referenceRange: { min: 0, max: 150 },
    date: new Date('2023-08-05'),
    status: 'high',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-trig-2',
    patientId: 'patient-1',
    testName: 'Trigliserit',
    testCode: 'TRIG',
    value: 145,
    unit: 'mg/dL',
    referenceRange: { min: 0, max: 150 },
    date: new Date('2024-01-15'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // ALT - Multiple entries
  {
    id: 'lab-alt-1',
    patientId: 'patient-1',
    testName: 'ALT',
    testCode: 'ALT',
    value: 45,
    unit: 'U/L',
    referenceRange: { min: 7, max: 56 },
    date: new Date('2023-10-15'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-alt-2',
    patientId: 'patient-1',
    testName: 'ALT',
    testCode: 'ALT',
    value: 38,
    unit: 'U/L',
    referenceRange: { min: 7, max: 56 },
    date: new Date('2024-01-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // AST - Multiple entries
  {
    id: 'lab-ast-1',
    patientId: 'patient-1',
    testName: 'AST',
    testCode: 'AST',
    value: 35,
    unit: 'U/L',
    referenceRange: { min: 10, max: 40 },
    date: new Date('2023-09-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-ast-2',
    patientId: 'patient-1',
    testName: 'AST',
    testCode: 'AST',
    value: 32,
    unit: 'U/L',
    referenceRange: { min: 10, max: 40 },
    date: new Date('2024-01-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // Vitamin D - Multiple entries
  {
    id: 'lab-vitd-1',
    patientId: 'patient-1',
    testName: 'Vitamin D',
    testCode: 'VITD',
    value: 25,
    unit: 'ng/mL',
    referenceRange: { min: 30, max: 100 },
    date: new Date('2023-12-10'),
    status: 'low',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-vitd-2',
    patientId: 'patient-1',
    testName: 'Vitamin D',
    testCode: 'VITD',
    value: 32,
    unit: 'ng/mL',
    referenceRange: { min: 30, max: 100 },
    date: new Date('2024-01-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  
  // Vitamin B12 - Multiple entries
  {
    id: 'lab-b12-1',
    patientId: 'patient-1',
    testName: 'Vitamin B12',
    testCode: 'B12',
    value: 280,
    unit: 'pg/mL',
    referenceRange: { min: 200, max: 900 },
    date: new Date('2023-06-25'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  },
  {
    id: 'lab-b12-2',
    patientId: 'patient-1',
    testName: 'Vitamin B12',
    testCode: 'B12',
    value: 320,
    unit: 'pg/mL',
    referenceRange: { min: 200, max: 900 },
    date: new Date('2024-01-20'),
    status: 'normal',
    category: 'blood',
    labName: 'Merkez Laboruvar'
  }
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 'app-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    date: new Date(Date.now() + 2 * 86400000), // 2 gün sonra
    duration: 30,
    type: 'checkup',
    status: 'scheduled',
    notes: 'Rutin kontrol'
  },
  {
    id: 'app-2',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    date: new Date(Date.now() - 7 * 86400000), // 1 hafta önce
    duration: 45,
    type: 'consultation',
    status: 'completed',
    diagnosis: 'Hipertansiyon',
    prescription: ['Lisinopril 10mg']
  }
];

// Mood Constants
export const MOOD_EMOJIS: MoodEmoji[] = [
  { mood: 'happy', emoji: '😊', label: 'Mutlu', color: 'text-health-success' },
  { mood: 'normal', emoji: '😐', label: 'Normal', color: 'text-muted-foreground' },
  { mood: 'tired', emoji: '😴', label: 'Yorgun', color: 'text-health-info' },
  { mood: 'stressed', emoji: '😰', label: 'Stresli', color: 'text-health-warning' },
  { mood: 'anxious', emoji: '😟', label: 'Endişeli', color: 'text-health-warning' },
  { mood: 'sad', emoji: '😢', label: 'Üzgün', color: 'text-health-danger' }
];

// Severity Levels
export const SEVERITY_LEVELS: SeverityLevel[] = [
  { level: 1, label: 'Çok Hafif', color: 'text-green-500', description: 'Günlük yaşamı etkilemiyor' },
  { level: 2, label: 'Hafif', color: 'text-yellow-500', description: 'Az rahatsızlık veriyor' },
  { level: 3, label: 'Orta', color: 'text-orange-500', description: 'Günlük aktiviteleri etkiliyor' },
  { level: 4, label: 'Şiddetli', color: 'text-red-500', description: 'Ciddi rahatsızlık veriyor' },
  { level: 5, label: 'Çok Şiddetli', color: 'text-red-700', description: 'Günlük yaşamı çok etkiliyor' }
];

// Common Symptoms List
export const COMMON_SYMPTOMS = [
  'Baş ağrısı', 'Mide bulantısı', 'Yorgunluk', 'Uykusuzluk', 'İştahsızlık',
  'Baş dönmesi', 'Öksürük', 'Boğaz ağrısı', 'Nefes darlığı', 'Göğüs ağrısı',
  'Karın ağrısı', 'İshal', 'Kabızlık', 'Ateş', 'Titreme', 'Kas ağrısı',
  'Eklem ağrısı', 'Cilt döküntüsü', 'Kaşıntı', 'Çarpıntı'
];

// Today's medication reminders for home screen
export const getTodaysMedicationReminders = () => {
  return mockMedications.filter(med => med.isActive).map(med => ({
    ...med,
    nextDose: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000), // 0-4 saat içinde
    taken: Math.random() > 0.5
  }));
};

// Upcoming appointments for home screen
export const getUpcomingAppointments = () => {
  return mockAppointments.filter(app => 
    app.status === 'scheduled' && 
    app.date > new Date()
  ).sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Randevu Sistemi Mock Data
export const mockProvinces: Province[] = [
  { id: 'province-1', name: 'İstanbul', code: '34' },
  { id: 'province-2', name: 'Ankara', code: '06' },
  { id: 'province-3', name: 'İzmir', code: '35' },
  { id: 'province-4', name: 'Bursa', code: '16' },
  { id: 'province-5', name: 'Antalya', code: '07' }
];

export const mockDistricts: District[] = [
  { id: 'district-1', name: 'Kadıköy', provinceId: 'province-1', code: '3401' },
  { id: 'district-2', name: 'Beşiktaş', provinceId: 'province-1', code: '3402' },
  { id: 'district-3', name: 'Şişli', provinceId: 'province-1', code: '3403' },
  { id: 'district-4', name: 'Çankaya', provinceId: 'province-2', code: '0601' },
  { id: 'district-5', name: 'Keçiören', provinceId: 'province-2', code: '0602' },
  { id: 'district-6', name: 'Konak', provinceId: 'province-3', code: '3501' },
  { id: 'district-7', name: 'Nilüfer', provinceId: 'province-4', code: '1601' },
  { id: 'district-8', name: 'Muratpaşa', provinceId: 'province-5', code: '0701' }
];

export const mockHospitals: Hospital[] = [
  {
    id: 'hospital-1',
    name: 'İstanbul Şehir Hastanesi',
    districtId: 'district-1',
    address: 'Kadıköy Mahallesi, Sağlık Caddesi No:123',
    phone: '+90 216 123 45 67',
    type: 'devlet',
    specialties: ['Kardiyoloji', 'Nöroloji', 'Ortopedi', 'Göz Hastalıkları', 'Dahiliye']
  },
  {
    id: 'hospital-2',
    name: 'Beşiktaş Devlet Hastanesi',
    districtId: 'district-2',
    address: 'Beşiktaş Mahallesi, Hastane Sokak No:45',
    phone: '+90 212 234 56 78',
    type: 'devlet',
    specialties: ['Cerrahi', 'Kadın Doğum', 'Çocuk Sağlığı', 'Dahiliye']
  },
  {
    id: 'hospital-3',
    name: 'Şişli Etfal Eğitim ve Araştırma Hastanesi',
    districtId: 'district-3',
    address: 'Şişli Mahallesi, Tıp Caddesi No:67',
    phone: '+90 212 345 67 89',
    type: 'devlet',
    specialties: ['Kardiyoloji', 'Nöroloji', 'Psikiyatri', 'Dahiliye', 'Cerrahi']
  },
  {
    id: 'hospital-4',
    name: 'Ankara Şehir Hastanesi',
    districtId: 'district-4',
    address: 'Çankaya Mahallesi, Sağlık Bulvarı No:89',
    phone: '+90 312 456 78 90',
    type: 'devlet',
    specialties: ['Kardiyoloji', 'Nöroloji', 'Ortopedi', 'Göz Hastalıkları', 'Dahiliye']
  },
  {
    id: 'hospital-5',
    name: 'İzmir Atatürk Eğitim ve Araştırma Hastanesi',
    districtId: 'district-6',
    address: 'Konak Mahallesi, Hastane Caddesi No:12',
    phone: '+90 232 567 89 01',
    type: 'devlet',
    specialties: ['Kardiyoloji', 'Nöroloji', 'Cerrahi', 'Dahiliye']
  }
];

export const mockClinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Kardiyoloji Polikliniği',
    hospitalId: 'hospital-1',
    specialty: 'Kardiyoloji',
    description: 'Kalp ve damar hastalıkları tedavisi'
  },
  {
    id: 'clinic-2',
    name: 'Nöroloji Polikliniği',
    hospitalId: 'hospital-1',
    specialty: 'Nöroloji',
    description: 'Sinir sistemi hastalıkları tedavisi'
  },
  {
    id: 'clinic-3',
    name: 'Ortopedi Polikliniği',
    hospitalId: 'hospital-1',
    specialty: 'Ortopedi',
    description: 'Kemik ve eklem hastalıkları tedavisi'
  },
  {
    id: 'clinic-4',
    name: 'Göz Hastalıkları Polikliniği',
    hospitalId: 'hospital-1',
    specialty: 'Göz Hastalıkları',
    description: 'Göz hastalıkları tedavisi'
  },
  {
    id: 'clinic-5',
    name: 'Dahiliye Polikliniği',
    hospitalId: 'hospital-1',
    specialty: 'Dahiliye',
    description: 'İç hastalıkları tedavisi'
  },
  {
    id: 'clinic-6',
    name: 'Cerrahi Polikliniği',
    hospitalId: 'hospital-2',
    specialty: 'Cerrahi',
    description: 'Cerrahi hastalıklar tedavisi'
  },
  {
    id: 'clinic-7',
    name: 'Kadın Doğum Polikliniği',
    hospitalId: 'hospital-2',
    specialty: 'Kadın Doğum',
    description: 'Kadın hastalıkları ve doğum'
  },
  {
    id: 'clinic-8',
    name: 'Çocuk Sağlığı Polikliniği',
    hospitalId: 'hospital-2',
    specialty: 'Çocuk Sağlığı',
    description: 'Çocuk hastalıkları tedavisi'
  },
  {
    id: 'clinic-9',
    name: 'Psikiyatri Polikliniği',
    hospitalId: 'hospital-3',
    specialty: 'Psikiyatri',
    description: 'Ruh sağlığı hastalıkları tedavisi'
  },
  {
    id: 'clinic-10',
    name: 'Dermatoloji Polikliniği',
    hospitalId: 'hospital-3',
    specialty: 'Dermatoloji',
    description: 'Cilt hastalıkları tedavisi'
  }
];

export const mockDoctorSchedules: DoctorSchedule[] = [
  // Dr. Mehmet Demir - Kardiyoloji
  {
    id: 'schedule-1',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    dayOfWeek: 1, // Pazartesi
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-2',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    dayOfWeek: 2, // Salı
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-3',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    dayOfWeek: 3, // Çarşamba
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-4',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    dayOfWeek: 4, // Perşembe
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-5',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    dayOfWeek: 5, // Cuma
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },

  // Dr. Ayşe Yılmaz - Nöroloji
  {
    id: 'schedule-6',
    doctorId: 'doctor-2',
    clinicId: 'clinic-2',
    dayOfWeek: 1, // Pazartesi
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-7',
    doctorId: 'doctor-2',
    clinicId: 'clinic-2',
    dayOfWeek: 2, // Salı
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-8',
    doctorId: 'doctor-2',
    clinicId: 'clinic-2',
    dayOfWeek: 3, // Çarşamba
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-9',
    doctorId: 'doctor-2',
    clinicId: 'clinic-2',
    dayOfWeek: 4, // Perşembe
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-10',
    doctorId: 'doctor-2',
    clinicId: 'clinic-2',
    dayOfWeek: 5, // Cuma
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },

  // Dr. Ali Kaya - Ortopedi
  {
    id: 'schedule-11',
    doctorId: 'doctor-3',
    clinicId: 'clinic-3',
    dayOfWeek: 1, // Pazartesi
    startTime: '10:00',
    endTime: '18:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-12',
    doctorId: 'doctor-3',
    clinicId: 'clinic-3',
    dayOfWeek: 2, // Salı
    startTime: '10:00',
    endTime: '18:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-13',
    doctorId: 'doctor-3',
    clinicId: 'clinic-3',
    dayOfWeek: 3, // Çarşamba
    startTime: '10:00',
    endTime: '18:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-14',
    doctorId: 'doctor-3',
    clinicId: 'clinic-3',
    dayOfWeek: 4, // Perşembe
    startTime: '10:00',
    endTime: '18:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-15',
    doctorId: 'doctor-3',
    clinicId: 'clinic-3',
    dayOfWeek: 5, // Cuma
    startTime: '10:00',
    endTime: '18:00',
    appointmentDuration: 45,
    isActive: true
  },

  // Dr. Fatma Özkan - Göz Hastalıkları
  {
    id: 'schedule-16',
    doctorId: 'doctor-4',
    clinicId: 'clinic-4',
    dayOfWeek: 1, // Pazartesi
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-17',
    doctorId: 'doctor-4',
    clinicId: 'clinic-4',
    dayOfWeek: 2, // Salı
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-18',
    doctorId: 'doctor-4',
    clinicId: 'clinic-4',
    dayOfWeek: 3, // Çarşamba
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-19',
    doctorId: 'doctor-4',
    clinicId: 'clinic-4',
    dayOfWeek: 4, // Perşembe
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-20',
    doctorId: 'doctor-4',
    clinicId: 'clinic-4',
    dayOfWeek: 5, // Cuma
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },

  // Dr. Hasan Yıldız - Dahiliye
  {
    id: 'schedule-21',
    doctorId: 'doctor-5',
    clinicId: 'clinic-5',
    dayOfWeek: 1, // Pazartesi
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-22',
    doctorId: 'doctor-5',
    clinicId: 'clinic-5',
    dayOfWeek: 2, // Salı
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-23',
    doctorId: 'doctor-5',
    clinicId: 'clinic-5',
    dayOfWeek: 3, // Çarşamba
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-24',
    doctorId: 'doctor-5',
    clinicId: 'clinic-5',
    dayOfWeek: 4, // Perşembe
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-25',
    doctorId: 'doctor-5',
    clinicId: 'clinic-5',
    dayOfWeek: 5, // Cuma
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },

  // Dr. Elif Çelik - Psikiyatri
  {
    id: 'schedule-26',
    doctorId: 'doctor-6',
    clinicId: 'clinic-9',
    dayOfWeek: 1, // Pazartesi
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-27',
    doctorId: 'doctor-6',
    clinicId: 'clinic-9',
    dayOfWeek: 2, // Salı
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-28',
    doctorId: 'doctor-6',
    clinicId: 'clinic-9',
    dayOfWeek: 3, // Çarşamba
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-29',
    doctorId: 'doctor-6',
    clinicId: 'clinic-9',
    dayOfWeek: 4, // Perşembe
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 45,
    isActive: true
  },
  {
    id: 'schedule-30',
    doctorId: 'doctor-6',
    clinicId: 'clinic-9',
    dayOfWeek: 5, // Cuma
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 45,
    isActive: true
  },

  // Dr. Mustafa Özkan - Dermatoloji
  {
    id: 'schedule-31',
    doctorId: 'doctor-7',
    clinicId: 'clinic-10',
    dayOfWeek: 1, // Pazartesi
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-32',
    doctorId: 'doctor-7',
    clinicId: 'clinic-10',
    dayOfWeek: 2, // Salı
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-33',
    doctorId: 'doctor-7',
    clinicId: 'clinic-10',
    dayOfWeek: 3, // Çarşamba
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-34',
    doctorId: 'doctor-7',
    clinicId: 'clinic-10',
    dayOfWeek: 4, // Perşembe
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-35',
    doctorId: 'doctor-7',
    clinicId: 'clinic-10',
    dayOfWeek: 5, // Cuma
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },

  // Dr. Zeynep Arslan - Cerrahi
  {
    id: 'schedule-36',
    doctorId: 'doctor-8',
    clinicId: 'clinic-6',
    dayOfWeek: 1, // Pazartesi
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 60,
    isActive: true
  },
  {
    id: 'schedule-37',
    doctorId: 'doctor-8',
    clinicId: 'clinic-6',
    dayOfWeek: 2, // Salı
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 60,
    isActive: true
  },
  {
    id: 'schedule-38',
    doctorId: 'doctor-8',
    clinicId: 'clinic-6',
    dayOfWeek: 3, // Çarşamba
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 60,
    isActive: true
  },
  {
    id: 'schedule-39',
    doctorId: 'doctor-8',
    clinicId: 'clinic-6',
    dayOfWeek: 4, // Perşembe
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 60,
    isActive: true
  },
  {
    id: 'schedule-40',
    doctorId: 'doctor-8',
    clinicId: 'clinic-6',
    dayOfWeek: 5, // Cuma
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 60,
    isActive: true
  },

  // Dr. Ahmet Koç - Kadın Doğum
  {
    id: 'schedule-41',
    doctorId: 'doctor-9',
    clinicId: 'clinic-7',
    dayOfWeek: 1, // Pazartesi
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-42',
    doctorId: 'doctor-9',
    clinicId: 'clinic-7',
    dayOfWeek: 2, // Salı
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-43',
    doctorId: 'doctor-9',
    clinicId: 'clinic-7',
    dayOfWeek: 3, // Çarşamba
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-44',
    doctorId: 'doctor-9',
    clinicId: 'clinic-7',
    dayOfWeek: 4, // Perşembe
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-45',
    doctorId: 'doctor-9',
    clinicId: 'clinic-7',
    dayOfWeek: 5, // Cuma
    startTime: '09:00',
    endTime: '17:00',
    appointmentDuration: 30,
    isActive: true
  },

  // Dr. Selin Demir - Çocuk Sağlığı
  {
    id: 'schedule-46',
    doctorId: 'doctor-10',
    clinicId: 'clinic-8',
    dayOfWeek: 1, // Pazartesi
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-47',
    doctorId: 'doctor-10',
    clinicId: 'clinic-8',
    dayOfWeek: 2, // Salı
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-48',
    doctorId: 'doctor-10',
    clinicId: 'clinic-8',
    dayOfWeek: 3, // Çarşamba
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-49',
    doctorId: 'doctor-10',
    clinicId: 'clinic-8',
    dayOfWeek: 4, // Perşembe
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  },
  {
    id: 'schedule-50',
    doctorId: 'doctor-10',
    clinicId: 'clinic-8',
    dayOfWeek: 5, // Cuma
    startTime: '08:00',
    endTime: '16:00',
    appointmentDuration: 30,
    isActive: true
  }
];

// Doktor verileri
export const mockDoctors: Doctor[] = [
  {
    id: 'doctor-1',
    email: 'dr.mehmet@hastane.com',
    name: 'Dr. Mehmet Demir',
    role: 'doctor',
    specialization: 'Kardiyoloji',
    license: 'TR123456789',
    hospital: 'İstanbul Şehir Hastanesi',
    phone: '+90 212 123 45 67',
    createdAt: new Date('2020-05-10'),
    patients: ['patient-1']
  },
  {
    id: 'doctor-2',
    email: 'dr.ayse@hastane.com',
    name: 'Dr. Ayşe Yılmaz',
    role: 'doctor',
    specialization: 'Nöroloji',
    license: 'TR987654321',
    hospital: 'İstanbul Şehir Hastanesi',
    phone: '+90 212 234 56 78',
    createdAt: new Date('2019-03-15'),
    patients: []
  },
  {
    id: 'doctor-3',
    email: 'dr.ali@hastane.com',
    name: 'Dr. Ali Kaya',
    role: 'doctor',
    specialization: 'Ortopedi',
    license: 'TR456789123',
    hospital: 'İstanbul Şehir Hastanesi',
    phone: '+90 212 345 67 89',
    createdAt: new Date('2021-08-20'),
    patients: []
  },
  {
    id: 'doctor-4',
    email: 'dr.fatma@hastane.com',
    name: 'Dr. Fatma Özkan',
    role: 'doctor',
    specialization: 'Göz Hastalıkları',
    license: 'TR789123456',
    hospital: 'İstanbul Şehir Hastanesi',
    phone: '+90 212 456 78 90',
    createdAt: new Date('2018-11-05'),
    patients: []
  },
  {
    id: 'doctor-5',
    email: 'dr.hasan@hastane.com',
    name: 'Dr. Hasan Yıldız',
    role: 'doctor',
    specialization: 'Dahiliye',
    license: 'TR321654987',
    hospital: 'İstanbul Şehir Hastanesi',
    phone: '+90 212 567 89 01',
    createdAt: new Date('2022-01-12'),
    patients: []
  },
  {
    id: 'doctor-6',
    email: 'dr.elif@hastane.com',
    name: 'Dr. Elif Çelik',
    role: 'doctor',
    specialization: 'Psikiyatri',
    license: 'TR147258369',
    hospital: 'Şişli Etfal Eğitim ve Araştırma Hastanesi',
    phone: '+90 212 678 90 12',
    createdAt: new Date('2020-09-25'),
    patients: []
  },
  {
    id: 'doctor-7',
    email: 'dr.mustafa@hastane.com',
    name: 'Dr. Mustafa Özkan',
    role: 'doctor',
    specialization: 'Dermatoloji',
    license: 'TR963852741',
    hospital: 'Şişli Etfal Eğitim ve Araştırma Hastanesi',
    phone: '+90 212 789 01 23',
    createdAt: new Date('2019-06-18'),
    patients: []
  },
  {
    id: 'doctor-8',
    email: 'dr.zeynep@hastane.com',
    name: 'Dr. Zeynep Arslan',
    role: 'doctor',
    specialization: 'Cerrahi',
    license: 'TR852963741',
    hospital: 'Beşiktaş Devlet Hastanesi',
    phone: '+90 212 890 12 34',
    createdAt: new Date('2021-04-30'),
    patients: []
  },
  {
    id: 'doctor-9',
    email: 'dr.ahmet@hastane.com',
    name: 'Dr. Ahmet Koç',
    role: 'doctor',
    specialization: 'Kadın Doğum',
    license: 'TR741852963',
    hospital: 'Beşiktaş Devlet Hastanesi',
    phone: '+90 212 901 23 45',
    createdAt: new Date('2018-12-03'),
    patients: []
  },
  {
    id: 'doctor-10',
    email: 'dr.selin@hastane.com',
    name: 'Dr. Selin Demir',
    role: 'doctor',
    specialization: 'Çocuk Sağlığı',
    license: 'TR369258147',
    hospital: 'Beşiktaş Devlet Hastanesi',
    phone: '+90 212 012 34 56',
    createdAt: new Date('2020-03-22'),
    patients: []
  }
];

// Randevu slot'larını oluşturan yardımcı fonksiyon
export const generateAppointmentSlots = (doctorId: string, clinicId: string, date: Date, startTime: string, endTime: string, duration: number) => {
  const slots: AppointmentSlot[] = [];
  const start = new Date(date);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date(date);
  end.setHours(endHour, endMinute, 0, 0);
  
  while (start < end) {
    const timeString = start.toTimeString().slice(0, 5);
    slots.push({
      id: `slot-${doctorId}-${clinicId}-${date.toISOString().split('T')[0]}-${timeString}`,
      doctorId,
      clinicId,
      date: new Date(date),
      time: timeString,
      isAvailable: Math.random() > 0.3, // %70 ihtimalle müsait
      isBooked: false
    });
    start.setMinutes(start.getMinutes() + duration);
  }
  
  return slots;
};

// Örnek randevu slot'ları
export const mockAppointmentSlots: AppointmentSlot[] = [
  ...generateAppointmentSlots('doctor-1', 'clinic-1', new Date(Date.now() + 86400000), '09:00', '17:00', 30), // Yarın
  ...generateAppointmentSlots('doctor-1', 'clinic-1', new Date(Date.now() + 2 * 86400000), '09:00', '17:00', 30), // 2 gün sonra
  ...generateAppointmentSlots('doctor-1', 'clinic-1', new Date(Date.now() + 3 * 86400000), '09:00', '17:00', 30), // 3 gün sonra
];

export const mockAppointmentBookings: AppointmentBooking[] = [
  {
    id: 'booking-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    clinicId: 'clinic-1',
    hospitalId: 'hospital-1',
    appointmentSlotId: 'slot-1',
    appointmentDate: new Date(Date.now() + 2 * 86400000),
    appointmentTime: '10:00',
    status: 'confirmed',
    notes: 'Rutin kontrol',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];