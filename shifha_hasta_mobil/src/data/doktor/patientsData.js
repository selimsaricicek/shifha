// Doktor paneli için hasta verileri
const patientsData = {
  "12345678901": {
    profile: {
      id: "12345678901",
      name: "Ayşe Yılmaz",
      age: 45,
      gender: "Kadın",
      bloodType: "A+",
      avatar: "AY"
    },
    criticalAlerts: ["WBC: 11.5 (Yüksek)", "HbA1c: 7.2% (Yüksek)"],
    aiSummary: "Hastanın son tahlillerinde yüksek WBC ve HbA1c değerleri dikkat çekmektedir. Enfeksiyon ve diyabet regülasyonu açısından değerlendirilmesi önerilir. Hastanın son günlerde bildirdiği yorgunluk ve baş ağrısı semptomları bu bulgularla ilişkili olabilir.",
    symptomHistory: [
      { date: '2024-07-11', mood: 'Orta', symptoms: ['Halsizlik', 'Baş Ağrısı'] },
      { date: '2024-07-10', mood: 'Kötü', symptoms: ['Mide Bulantısı', 'Yorgunluk'] },
      { date: '2024-07-09', mood: 'İyi', symptoms: ['Enerjik'] },
    ],
    labResults: [
      { name: "WBC", value: 11.5, unit: "10^9/L", range: "4.0-10.0", status: "high" },
      { name: "RBC", value: 4.8, unit: "10^12/L", range: "4.2-5.4", status: "normal" },
      { name: "HbA1c", value: 7.2, unit: "%", range: "< 5.7", status: "high" },
      { name: "Glikoz (Açlık)", value: 135, unit: "mg/dL", range: "70-100", status: "high" },
    ],
    notes: [
      { date: "2024-05-10", doctor: "Dr. Zeynep Kaya", text: "Efor testi sonuçları normal sınırlar içinde. Mevcut tansiyon tedavisine devam edilecek." }
    ]
  },
  "98765432109": {
    profile: {
      id: "98765432109",
      name: "Mehmet Öztürk",
      age: 58,
      gender: "Erkek",
      bloodType: "0+",
      avatar: "MÖ"
    },
    criticalAlerts: [],
    aiSummary: "Hastanın genel durumu stabil. Son tahlil sonuçları referans aralıklarında. Hasta son günlerde hafif yorgunluk bildirse de, bu durum tahlillere yansımamıştır. Tansiyon takibine devam edilmesi önerilir.",
    symptomHistory: [
        { date: '2024-07-11', mood: 'İyi', symptoms: [] },
        { date: '2024-07-10', mood: 'İyi', symptoms: ['Hafif eklem ağrısı'] },
        { date: '2024-07-09', mood: 'Orta', symptoms: ['Yorgunluk'] },
    ],
    labResults: [
      { name: "WBC", value: 6.7, unit: "10^9/L", range: "4.0-10.0", status: "normal" },
      { name: "Kolesterol", value: 180, unit: "mg/dL", range: "< 200", status: "normal" },
      { name: "Kreatinin", value: 1.1, unit: "mg/dL", range: "0.6-1.2", status: "normal" },
    ],
    notes: [
      { date: "2024-06-20", doctor: "Dr. Ahmet Çelik", text: "Yıllık kontrol yapıldı. Herhangi bir şikayeti yok." }
    ]
  }
};

export default patientsData; 