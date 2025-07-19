import React, { useState, useEffect } from 'react'; // useEffect'i importlara ekledim
import doctorAppointments from '../../data/doktor/doctorAppointments';
import patientsData from '../../data/doktor/patientsData';
import Card from './Card';

// ## DEĞİŞİKLİK 1: 'QrReader' yerine 'useZxing' hook'unu import ediyoruz.
import { useZxing } from 'react-zxing';
import { AlertTriangle, QrCode } from 'lucide-react';

// QR kod okuma sonrası doğrulama fonksiyonu
async function verifyQrLogin(loginAttemptId, doctorId, setFeedback) {
  try {
    const res = await fetch('http://localhost:3001/api/auth/verify-qr-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginAttemptId, doctorId })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setFeedback({ type: 'success', message: 'Başarılı! Web paneline yönlendiriliyorsunuz.' });
      // Haptic feedback veya yönlendirme burada eklenebilir
    } else {
      setFeedback({ type: 'error', message: data.message || 'Giriş başarısız.' });
    }
  } catch (err) {
    setFeedback({ type: 'error', message: 'Sunucuya ulaşılamadı.' });
  }
}

export default function DashboardScreen({ onSelectPatient, onLogout }) {
  const [view, setView] = useState('qr');
  // ## DEĞİŞİKLİK 2: 'qrScan' state'inin başlangıç değerini boş string yaptım.
  const [qrScan, setQrScan] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date('2025-07-12'));
  const [selectedDate, setSelectedDate] = useState(new Date('2025-07-12'));
  const today = new Date();
  const [feedback, setFeedback] = useState(null);

  // ## DEĞİŞİKLİK 3: Yeni QR okuyucu hook'unu burada tanımlıyoruz.
  const { ref } = useZxing({
    // Kamera sadece 'showCamera' true olduğunda aktif olacak. Bu performansı artırır.
    paused: !showCamera,
    // QR kod okunduğunda bu fonksiyon çalışacak
    onResult(result) {
      const qrCodeText = result.getText();
      console.log('QR Kodu Okundu:', qrCodeText);
      setQrScan(qrCodeText);
      setShowCamera(false); // Okuma sonrası kamerayı otomatik kapat
    },
  });

  // QR okuma sonrası hasta id'si ile hasta detayına yönlendir
  useEffect(() => {
    if (qrScan && patientsData[qrScan]) {
      onSelectPatient(qrScan);
    }
  }, [qrScan, onSelectPatient]);

  const appointmentsByDate = doctorAppointments.reduce((acc, appt) => {
    (acc[appt.date] = acc[appt.date] || []).push(appt);
    return acc;
  }, {});

  const changeMonth = (amount) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-200"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = date.toDateString() === selectedDate.toDateString();
      const hasAppointment = appointmentsByDate[dateString];
      let dayClass = "h-20 md:h-28 flex flex-col items-center justify-center cursor-pointer transition-colors border-r border-b border-gray-200 relative text-lg font-semibold";
      if(isSelected) dayClass += " bg-cyan-500 text-white";
      else if(isToday) dayClass += " bg-cyan-100";
      else dayClass += " hover:bg-gray-100";
      days.push(
        <div key={day} className={dayClass} onClick={() => setSelectedDate(date)}>
          <span>{day}</span>
          {hasAppointment && <span className={`absolute bottom-2 w-3 h-3 rounded-full ${isSelected ? 'bg-white' : 'bg-cyan-500'}`}></span>}
        </div>
      );
    }
    return days;
  };

  const selectedDayAppointments = appointmentsByDate[selectedDate.toISOString().split('T')[0]] || [];

  // QR ekranı
  if (view === 'qr') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo-symbol.png" alt="Shifha Logo" className="h-12 mb-2" />
          <img src="/logo-text.png" alt="Shifha" className="h-6 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Doktor Paneli</h1>
          <p className="text-gray-600 mb-8">Hasta verilerine erişmek veya randevuları görmek için giriş yapın.</p>
        </div>
        <div className="w-80 h-80 bg-white rounded-3xl shadow-lg flex flex-col items-center justify-center mb-8">
          <button
            onClick={() => setShowCamera(true)}
            className="flex flex-col items-center justify-center w-full h-full group"
          >
            <QrCode className="text-cyan-500 mb-4" size={80} />
            <span className="mt-4 text-lg font-semibold text-gray-700">QR Kodu Tara</span>
          </button>
          
          {/* ## DEĞİŞİKLİK 4: QR Kamera alanı tamamen yeniden yazıldı. */}
          {showCamera && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-white/90 z-10 rounded-3xl p-4">
              {/* Hook'tan aldığımız 'ref'i bir video elementine bağlıyoruz. */}
              <video ref={ref} className="w-full h-auto rounded-lg shadow-inner bg-gray-900" />
              <button onClick={() => setShowCamera(false)} className="mt-4 px-4 py-2 bg-gray-300 rounded-lg">Kapat</button>
            </div>
          )}

        </div>
        <button
          className="mt-4 w-80 py-3 bg-cyan-500 text-white font-semibold rounded-xl hover:bg-cyan-600 transition-colors shadow-md"
          onClick={() => setView('dashboard')}
        >
          Randevu Listesine Git
        </button>
        {feedback && (
          <div className={`mt-4 p-3 rounded-lg text-center ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{feedback.message}</div>
        )}
      </div>
    );
  }

  // Eski dashboard görünümü
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="!p-0 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-xl">
          <div className="flex justify-between items-center p-6">
            <h3 className="font-bold text-2xl text-gray-800 flex items-center">
              Takvim
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={() => changeMonth(-1)} className="p-3 rounded-md hover:bg-gray-200 text-xl">&lt;</button>
              <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-base font-semibold rounded-md border border-gray-300 hover:bg-gray-100">Bugün</button>
              <button onClick={() => changeMonth(1)} className="p-3 rounded-md hover:bg-gray-200 text-xl">&gt;</button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center font-semibold text-base text-gray-600 border-b border-t border-gray-200">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => <div key={day} className="py-3">{day}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
          <div className="p-6 border-t border-gray-200">
            <h4 className="font-bold text-lg text-gray-700">{selectedDate.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
            {selectedDayAppointments.length === 0 && <p className="text-base text-gray-500 mt-2">Bu gün için planlanmış randevu bulunmamaktadır.</p>}
          </div>
        </Card>
      </div>
      <div>
        <Card className="bg-gradient-to-br from-red-50 to-cyan-50 shadow-xl">
          <h3 className="text-2xl font-bold text-gray-800 mb-5">Bugünün Hasta Akışı</h3>
          <div className="space-y-5">
            {selectedDayAppointments.length > 0 ? selectedDayAppointments.map(appt => {
              const patient = patientsData[appt.patientId];
              const isCritical = patient.criticalAlerts.length > 0;
              return (
                <button
                  key={appt.time}
                  onClick={() => onSelectPatient(patient.profile.id)}
                  className={`w-full p-6 rounded-2xl flex items-center transition-all duration-300 text-left transform hover:scale-[1.03] hover:shadow-lg ${isCritical ? 'border-2 border-red-400 bg-red-50' : 'bg-gray-50 hover:bg-cyan-50'}`}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                    {patient.profile.avatar}
                  </div>
                  <div className="ml-6 flex-grow">
                    <p className="font-bold text-lg text-gray-800">{patient.profile.name}</p>
                    <p className="text-base text-gray-600">Randevu Saati: {appt.time}</p>
                  </div>
                  {isCritical && <AlertTriangle className="w-10 h-10 ml-4 text-red-500 animate-pulse" />}
                </button>
              );
            }) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Seçili gün için randevu yok.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}