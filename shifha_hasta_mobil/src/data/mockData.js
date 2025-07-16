import { Droplets, HeartPulse, Activity } from 'lucide-react';

// --- Mock Data (Gerçek uygulamada API'den veya Firestore'dan gelecek) ---
export const initialSymptomData = [
  { date: '01/07', mood: 'İyi', symptoms: ['Enerjik'] },
  { date: '02/07', mood: 'Orta', symptoms: ['Baş Ağrısı', 'Yorgunluk'] },
  { date: '03/07', mood: 'İyi', symptoms: ['Enerjik'] },
  { date: '04/07', mood: 'Kötü', symptoms: ['Mide Bulantısı', 'Yorgunluk'] },
  { date: '05/07', mood: 'Orta', symptoms: ['Halsizlik'] },
];

export const labResultsData = {
  hba1c: { 
    name: "HbA1c (Hemoglobin A1c)", 
    icon: <Droplets className="text-red-500" size={24} />, 
    description: "Bu test, son 2-3 aydaki ortalama kan şekeri seviyenizi gösterir. Diyabet yönetimi ve risk takibi için kritik bir değerdir.", 
    history: [
      { date: 'Ocak 23', value: 7.2, note: "Diyet ve egzersiz programına başlandı." },
      { date: 'Nisan 23', value: 6.8, note: "İyiye gidiş var, programa devam." },
      { date: 'Ağustos 23', value: 6.5, note: "Hedefe yaklaşıldı, motivasyonu koruyalım." },
      { date: 'Ocak 24', value: 6.1, note: "Hedef aralığa ulaşıldı. Çok iyi gidiyorsunuz!" },
      { date: 'Temmuz 24', value: 5.8, note: "Değerleriniz kontrol altında, harika!" }
    ],
    currentValue: 5.8, 
    unit: '%', 
    referenceRange: { low: 4.0, high: 5.6 }, 
    motivation: "Harika bir ilerleme kaydettiniz! Sağlıklı alışkanlıklarınız meyvesini veriyor." 
  },
  cholesterol: { 
    name: "Toplam Kolesterol", 
    icon: <HeartPulse className="text-orange-500" size={24} />, 
    description: "Kanınızdaki toplam kolesterol miktarını ölçer. Kalp ve damar sağlığınız için önemli bir göstergedir.", 
    history: [
      { date: 'Ocak 23', value: 240, note: "Beslenme düzeni gözden geçirilecek." },
      { date: 'Temmuz 23', value: 215, note: "Düşüş başladı, Akdeniz diyetine devam." },
      { date: 'Ocak 24', value: 205, note: "Sınırda, egzersiz artırılabilir." },
      { date: 'Temmuz 24', value: 195, note: "Hedef aralığa girdiniz, tebrikler!" }
    ],
    currentValue: 195, 
    unit: 'mg/dL', 
    referenceRange: { low: 125, high: 200 }, 
    motivation: "Kolesterolünüzü kontrol altına almanız, kalp sağlığınız için attığınız büyük bir adım." 
  },
  tsh: { 
    name: "TSH (Tiroid Uyarıcı Hormon)", 
    icon: <Activity className="text-purple-500" size={24} />, 
    description: "Tiroid bezinizin ne kadar iyi çalıştığını kontrol eder. Metabolizma ve enerji seviyeniz üzerinde etkilidir.", 
    history: [
      { date: 'Mart 23', value: 4.8, note: "Hafif yüksek, takip edilecek." },
      { date: 'Eylül 23', value: 4.2, note: "Değerler stabil." },
      { date: 'Mart 24', value: 3.5, note: "Normal aralıkta." },
      { date: 'Temmuz 24', value: 2.8, note: "Değerleriniz ideal seviyede." }
    ],
    currentValue: 2.8, 
    unit: 'mIU/L', 
    referenceRange: { low: 0.4, high: 4.0 }, 
    motivation: "Tiroid değerlerinizin dengede olması, genel sağlığınız için çok önemli." 
  }
};

export const medicationData = [
    { id: 1, name: "Metformin", dosage: "500mg", time: "08:00", taken: true },
    { id: 2, name: "Lisinopril", dosage: "10mg", time: "08:00", taken: true },
    { id: 3, name: "Atorvastatin", dosage: "20mg", time: "20:00", taken: false },
];

export const appointmentData = [
    { id: 1, doctor: "Dr. Elif Yılmaz", specialty: "Kardiyoloji", date: "15 Temmuz 2024", time: "14:30" },
    { id: 2, doctor: "Dr. Ahmet Kaya", specialty: "Endokrinoloji", date: "22 Ağustos 2024", time: "11:00" },
]; 