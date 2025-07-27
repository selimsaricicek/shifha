// Mock hasta verileri
export const mockPatientsData = [
  {
    id: '12345678901',
    name: 'Ayşe Yılmaz',
    age: 45,
    gender: 'Kadın',
    profileImageUrl: 'https://avatar.iran.liara.run/public/girl?username=AyseYilmaz',
    allergies: ['Penicillin', 'Latex'],
    chronicDiseases: ['Hipertansiyon', 'Diyabet'],
    appointments: [
      {
        date: new Date().toLocaleDateString('tr-TR'),
        time: '09:00',
        type: 'Kontrol',
        urgency: 'normal'
      }
    ],
    labResults: [],
    radiologyReports: [],
    pathologyReports: [],
    epikriz: 'Hasta rutin kontrol için gelmiştir.',
    doctorNotes: [],
    referrals: []
  },
  {
    id: '98765432109',
    name: 'Mehmet Öztürk',
    age: 58,
    gender: 'Erkek',
    profileImageUrl: 'https://avatar.iran.liara.run/public/boy?username=MehmetOzturk',
    allergies: [],
    chronicDiseases: ['Koroner Arter Hastalığı'],
    appointments: [
      {
        date: new Date().toLocaleDateString('tr-TR'),
        time: '14:30',
        type: 'Kardiyoloji Konsültasyonu',
        urgency: 'acil'
      }
    ],
    labResults: [],
    radiologyReports: [],
    pathologyReports: [],
    epikriz: 'Kardiyoloji konsültasyonu gereklidir.',
    doctorNotes: [],
    referrals: []
  },
  {
    id: '24681357902',
    name: 'Zeynep Kaya',
    age: 34,
    gender: 'Kadın',
    profileImageUrl: 'https://avatar.iran.liara.run/public/girl?username=ZeynepKaya',
    allergies: ['Sulfa'],
    chronicDiseases: [],
    appointments: [
      {
        date: new Date().toLocaleDateString('tr-TR'),
        time: '11:15',
        type: 'Yeni Değerlendirme',
        urgency: 'normal'
      }
    ],
    labResults: [],
    radiologyReports: [],
    pathologyReports: [],
    epikriz: 'Yeni hasta değerlendirmesi.',
    doctorNotes: [],
    referrals: []
  },
  // Acil servis hastaları
  {
    id: '11111111111',
    name: 'Ahmet Demir',
    age: 28,
    gender: 'Erkek',
    profileImageUrl: 'https://avatar.iran.liara.run/public/boy?username=AhmetDemir',
    emergencyCase: {
      arrivalTime: '08:30',
      chiefComplaint: 'Göğüs ağrısı',
      triage: 'kirmizi',
      status: 'Müdahale',
      vitals: { bp: '140/90', pulse: 95, rr: 22, temp: 37.2, spo2: 96 }
    },
    relatives: [
      { name: 'Ayşe Demir', relation: 'Eşi', phone: '555-123-4567' },
      { name: 'Mehmet Demir', relation: 'Babası', phone: '555-987-6543' }
    ],
    allergies: [],
    chronicDiseases: [],
    appointments: []
  },
  {
    id: '22222222222',
    name: 'Fatma Şahin',
    age: 52,
    gender: 'Kadın',
    profileImageUrl: 'https://avatar.iran.liara.run/public/girl?username=FatmaSahin',
    emergencyCase: {
      arrivalTime: '09:15',
      chiefComplaint: 'Baş dönmesi',
      triage: 'sari',
      status: 'Bekliyor',
      vitals: { bp: '160/100', pulse: 88, rr: 18, temp: 36.8, spo2: 98 }
    },
    relatives: [
      { name: 'Ali Şahin', relation: 'Eşi', phone: '555-456-7890' }
    ],
    allergies: [],
    chronicDiseases: ['Hipertansiyon'],
    appointments: []
  },
  {
    id: '33333333333',
    name: 'Ali Yıldız',
    age: 19,
    gender: 'Erkek',
    profileImageUrl: 'https://avatar.iran.liara.run/public/boy?username=AliYildiz',
    emergencyCase: {
      arrivalTime: '10:00',
      chiefComplaint: 'Kol yaralanması',
      triage: 'yesil',
      status: 'Bekliyor',
      vitals: { bp: '120/80', pulse: 72, rr: 16, temp: 36.9, spo2: 99 }
    },
    relatives: [
      { name: 'Zeynep Yıldız', relation: 'Annesi', phone: '555-789-0123' }
    ],
    allergies: [],
    chronicDiseases: [],
    appointments: []
  },
  {
    id: '44444444444',
    name: 'Elif Gezgin',
    age: 65,
    gender: 'Kadın',
    profileImageUrl: 'https://avatar.iran.liara.run/public/girl?username=ElifGezgin',
    emergencyCase: {
      arrivalTime: '15:05',
      chiefComplaint: 'Nefes darlığı ve göğüs sıkışması',
      triage: 'kirmizi',
      status: 'Müdahale',
      vitals: { bp: '100/60', pulse: 110, rr: 28, temp: 36.9, spo2: 89 }
    },
    relatives: [
      { name: 'Ahmet Gezgin', relation: 'Eşi', phone: '555-123-4567' },
      { name: 'Selin Gezgin', relation: 'Kızı', phone: '555-987-6543' }
    ],
    allergies: ['Aspirin'],
    chronicDiseases: ['KOAH'],
    appointments: []
  },
  {
    id: '55555555555',
    name: 'Can Tekin',
    age: 19,
    gender: 'Erkek',
    profileImageUrl: 'https://avatar.iran.liara.run/public/boy?username=CanTekin',
    emergencyCase: {
      arrivalTime: '15:12',
      chiefComplaint: 'Spor yaralanması, ayak bileği burkulması',
      triage: 'yesil',
      status: 'Bekliyor',
      vitals: { bp: '120/80', pulse: 80, rr: 16, temp: 37.1, spo2: 99 }
    },
    relatives: [
      { name: 'Merve Tekin', relation: 'Annesi', phone: '555-456-7890' }
    ],
    allergies: [],
    chronicDiseases: [],
    appointments: []
  }
];

// Yatak durumu verisi
export const mockBedData = [
    { id: 'Kardiyoloji Yoğun Bakım', name: 'Kardiyoloji Yoğun Bakım', total: 8, occupied: 8 },
    { id: 'Genel Yoğun Bakım', name: 'Genel Yoğun Bakım', total: 12, occupied: 10 },
    { id: 'Kardiyoloji', name: 'Kardiyoloji Servisi', total: 20, occupied: 18 },
    { id: 'Dahiliye', name: 'Dahiliye Servisi', total: 30, occupied: 29 },
    { id: 'Genel Cerrahi', name: 'Genel Cerrahi Servisi', total: 25, occupied: 15 },
    { id: 'Nöroloji', name: 'Nöroloji Servisi', total: 15, occupied: 15 },
];

export default mockPatientsData; 