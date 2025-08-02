/**
 * Shifha Ana Uygulama Komponenti
 * Tüm ekranları yöneten ana konteyner
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LoginScreen } from './LoginScreen';
import { HomeScreen } from './HomeScreen';
import { TrackingScreen } from './TrackingScreen';
import { LabResultsScreen } from './LabResultsScreen';
import { AIChatScreen } from './AIChatScreen';
import { BlogScreen } from './BlogScreen';
import { ProfileScreen } from './ProfileScreen';
import { DoctorHomeScreen } from './DoctorHomeScreen';
import { DoctorPatientsScreen } from './DoctorPatientsScreen';
import { DoctorAppointmentsScreen } from './DoctorAppointmentsScreen';
import { QRScannerScreen } from './QRScannerScreen';
import { QRCodeDisplayScreen } from './QRCodeDisplayScreen';
import AppointmentBookingScreen from './AppointmentBookingScreen';
import AppointmentListScreen from './AppointmentListScreen';
import AppointmentRescheduleScreen from './AppointmentRescheduleScreen';
import { Navigation } from './Navigation';
import { DoctorNavigation } from './DoctorNavigation';
import { useToast } from '@/hooks/use-toast';
import { mockAppointmentBookings } from './mockData';

type ActiveScreen = 'home' | 'tracking' | 'lab-results' | 'ai-chat' | 'blog' | 'profile' | 'doctor-home' | 'doctor-patients' | 'doctor-appointments' | 'qr-scanner' | 'qr-display' | 'appointments' | 'appointment-booking' | 'appointment-reschedule' | 'community';

const ShifhaMainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(user?.role === 'doctor' ? 'doctor-home' : 'home');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>(mockAppointmentBookings);

  // Randevu güncelleme fonksiyonu
  const handleUpdateBooking = (bookingId: string, newDate: Date, newTime: string) => {
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              appointmentDate: newDate,
              appointmentTime: newTime,
              updatedAt: new Date()
            }
          : booking
      )
    );
  };

  // Tab değiştirme fonksiyonu
  const handleTabChange = (tab: string) => {
    setActiveScreen(tab as ActiveScreen);
  };

  // Event listener for navigation from lab results
  React.useEffect(() => {
    const handleNavigateToAppointment = (event: CustomEvent) => {
      setActiveScreen(event.detail.screen as ActiveScreen);
    };

    window.addEventListener('navigateToAppointment', handleNavigateToAppointment as EventListener);
    
    return () => {
      window.removeEventListener('navigateToAppointment', handleNavigateToAppointment as EventListener);
    };
  }, []);

  // QR kod tarama işleyicisi
  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'patient-access') {
        toast({
          title: "Hasta Verisi Erişimi",
          description: `Hasta ID: ${qrData.patientId} - Erişim sağlandı`,
        });
      } else if (qrData.type === 'doctor-login') {
        toast({
          title: "Doktor Panel Girişi",
          description: "Web panele yönlendiriliyor...",
        });
        // Gerçek uygulamada web panele yönlendir
        window.open('https://shifha-doctor-panel.com/login', '_blank');
      } else {
        toast({
          title: "Bilinmeyen QR Kod",
          description: "Bu QR kod tanınmıyor.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "QR Kod Hatası",
        description: "QR kod verisi okunamadı.",
        variant: "destructive"
      });
    }
  };

  // Yükleme durumu
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl shadow-lg animate-pulse mx-auto" />
          <div>
            <h1 className="text-2xl font-bold text-primary">Shifha</h1>
            <p className="text-muted-foreground">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Giriş yapılmamışsa login ekranını göster
  if (!user) {
    return <LoginScreen />;
  }

  // Ana uygulama ekranları
  const renderScreen = () => {
    // QR Scanner ekranı (hem doktor hem hasta için)
    if (activeScreen === 'qr-scanner') {
      return <QRScannerScreen onBack={() => setActiveScreen(user?.role === 'doctor' ? 'doctor-home' : 'home')} />;
    }

    // QR Display ekranı (hasta için)
    if (activeScreen === 'qr-display') {
      return <QRCodeDisplayScreen onBack={() => setActiveScreen('home')} />;
    }

    // Doktor ekranları
    if (user?.role === 'doctor') {
      switch (activeScreen) {
        case 'doctor-home':
          return <DoctorHomeScreen />;
        case 'doctor-patients':
          return <DoctorPatientsScreen />;
        case 'doctor-appointments':
          return <DoctorAppointmentsScreen />;
        case 'profile':
          return <ProfileScreen showQRCode={activeScreen === 'profile'} />;
        default:
          return <DoctorHomeScreen />;
      }
    }
    
    // Hasta ekranları
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onTabChange={handleTabChange} />;
      case 'tracking':
        return <TrackingScreen />;
      case 'appointments':
        return <AppointmentListScreen 
          onTabChange={handleTabChange} 
          onReschedule={(booking) => {
            setSelectedBooking(booking);
            setActiveScreen('appointment-reschedule');
          }}
          bookings={bookings}
          onUpdateBookings={setBookings}
        />;
      case 'appointment-booking':
        return <AppointmentBookingScreen onTabChange={handleTabChange} onUpdateBookings={setBookings} />;
      case 'appointment-reschedule':
        return <AppointmentRescheduleScreen 
          onTabChange={handleTabChange} 
          booking={selectedBooking}
          onUpdateBooking={handleUpdateBooking}
        />;
      case 'lab-results':
        return <LabResultsScreen />;
      case 'ai-chat':
        return <AIChatScreen />;
      case 'blog':
        return <BlogScreen />;
      case 'community':
        return <BlogScreen />;
      case 'profile':
        return <ProfileScreen showQRCode={activeScreen === 'profile'} />;
      default:
        return <HomeScreen onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ana İçerik */}
      <main className="pb-20">
        {renderScreen()}
      </main>

      {/* Alt Navigasyon */}
      {user?.role === 'doctor' ? (
        <DoctorNavigation 
          activeTab={activeScreen as 'doctor-home' | 'doctor-patients' | 'doctor-appointments' | 'profile'}
          onTabChange={setActiveScreen}
          onQRScan={handleQRScan}
        />
      ) : (
        <Navigation 
          activeTab={activeScreen as 'home' | 'tracking' | 'lab-results' | 'ai-chat' | 'blog' | 'profile' | 'appointments' | 'appointment-booking' | 'community' | 'qr-display'}
          onTabChange={setActiveScreen}
          onQRScan={handleQRScan}
        />
      )}
    </div>
  );
};

export const ShifhaApp: React.FC = () => {
  return (
    <AuthProvider>
      <ShifhaMainApp />
    </AuthProvider>
  );
};