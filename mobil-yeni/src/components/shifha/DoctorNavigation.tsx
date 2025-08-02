/**
 * Doktor Bottom Navigation
 * Doktor paneli için özel navigasyon
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  Calendar,
  QrCode,
  User,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoctorNavigationProps {
  activeTab: 'doctor-home' | 'doctor-patients' | 'doctor-appointments' | 'profile';
  onTabChange: (tab: 'doctor-home' | 'doctor-patients' | 'doctor-appointments' | 'profile' | 'qr-scanner') => void;
  onQRScan?: (data: string) => void;
}

export const DoctorNavigation: React.FC<DoctorNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  onQRScan 
}) => {

  const tabs = [
    {
      id: 'doctor-home' as const,
      label: 'Ana Sayfa',
      icon: Home,
      badge: null
    },
    {
      id: 'doctor-patients' as const,
      label: 'Hastalar',
      icon: Users,
      badge: '3' // kritik hasta sayısı
    },
    {
      id: 'doctor-appointments' as const,
      label: 'Randevular',
      icon: Calendar,
      badge: '8' // bugünkü randevu sayısı
    },
    {
      id: 'profile' as const,
      label: 'Profil',
      icon: User,
      badge: null
    }
  ];

  const handleQRScan = (data: string) => {
    console.log('Doktor QR Kod tarandı:', data);
    onQRScan?.(data);
    
    // QR kod tipine göre işlem yap
    try {
      const qrData = JSON.parse(data);
      if (qrData.type === 'patient-access') {
        // Hasta verisine erişim - hasta detay sayfasına yönlendir
        console.log('Hasta verisine erişim:', qrData.patientId);
        // Hasta detay ekranını aç
      } else if (qrData.type === 'web-login') {
        // Web panel girişi için QR kod
        console.log('Web panel giriş QR kodu tarandı');
        // Web panel giriş işlemi
      }
    } catch (error) {
      console.error('QR kod verisi parse edilemedi:', error);
    }
  };

  return (
    <>
      {/* Ana Navigasyon */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="grid grid-cols-4 relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  "h-16 flex-col space-y-1 rounded-none relative text-xs",
                  isActive && "text-medical-blue bg-medical-blue/10"
                )}
                onClick={() => onTabChange(tab.id)}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {tab.badge && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 w-4 h-4 text-xs p-0 flex items-center justify-center"
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium leading-tight">{tab.label}</span>
                
                {/* Aktif sekme göstergesi */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-medical-blue rounded-b-full" />
                )}
              </Button>
            );
          })}
        </div>

        {/* QR Tarayıcı FAB */}
        <Button
          size="lg"
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-10"
          onClick={() => onTabChange('qr-scanner')}
        >
          <QrCode className="w-5 h-5 text-white fill-white" />
        </Button>
      </div>
    </>
  );
};