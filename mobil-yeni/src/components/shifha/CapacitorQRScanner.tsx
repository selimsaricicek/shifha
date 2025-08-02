/**
 * Gerçek QR Kod Tarayıcı - Capacitor Camera Plugin
 * Mobil cihazlarda gerçek kamera ile QR kod tarama
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  X, 
  AlertTriangle,
  CheckCircle,
  Smartphone,
  QrCode
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Capacitor imports
import { BarcodeScanner, BarcodeFormat, LensFacing } from '@capacitor-mlkit/barcode-scanning';
import { Capacitor } from '@capacitor/core';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const CapacitorQRScanner: React.FC<QRScannerProps> = ({ 
  isOpen, 
  onClose, 
  onScan 
}) => {
  const { toast } = useToast();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<string>('unknown');
  const [isScanning, setIsScanning] = useState(false);

  // Platform desteği kontrolü
  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    if (Capacitor.isNativePlatform()) {
      const supported = await BarcodeScanner.isSupported();
      setIsSupported(supported.supported);
      
      if (supported.supported) {
        checkPermissions();
      }
    } else {
      setIsSupported(false);
    }
  };

  // Kamera izni kontrolü
  const checkPermissions = async () => {
    try {
      const status = await BarcodeScanner.checkPermissions();
      setPermission(status.camera);
    } catch (error) {
      console.error('İzin kontrolü hatası:', error);
      setPermission('denied');
    }
  };

  // Kamera izni isteme
  const requestPermissions = async () => {
    try {
      const status = await BarcodeScanner.requestPermissions();
      setPermission(status.camera);
      
      if (status.camera === 'granted') {
        startScanning();
      } else {
        toast({
          title: "Kamera İzni Gerekli",
          description: "QR kod taramak için kamera izni vermeniz gerekiyor.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('İzin isteme hatası:', error);
      toast({
        title: "İzin Hatası",
        description: "Kamera izni alınamadı.",
        variant: "destructive"
      });
    }
  };

  // QR kod taramayı başlat
  const startScanning = async () => {
    if (!isSupported) {
      toast({
        title: "Desteklenmiyor",
        description: "QR kod tarama bu cihazda desteklenmiyor.",
        variant: "destructive"
      });
      return;
    }

    if (permission !== 'granted') {
      await requestPermissions();
      return;
    }

    try {
      setIsScanning(true);

      // Tarama ayarları
      const options = {
        formats: [BarcodeFormat.QrCode],
        lensFacing: LensFacing.Back,
      };

      // HTML elementini gizle (kamera overlay için)
      document.body.style.background = 'transparent';
      
      // QR kod taramayı başlat
      const result = await BarcodeScanner.scan(options);

      if (result.barcodes.length > 0) {
        const qrData = result.barcodes[0].rawValue;
        
        toast({
          title: "QR Kod Tarandı!",
          description: "QR kod başarıyla okundu.",
        });

        onScan(qrData);
        onClose();
      }
    } catch (error: any) {
      console.error('QR tarama hatası:', error);
      
      if (error.message !== 'User cancelled the scan.') {
        toast({
          title: "Tarama Hatası",
          description: "QR kod taranamadı. Lütfen tekrar deneyin.",
          variant: "destructive"
        });
      }
    } finally {
      setIsScanning(false);
      document.body.style.background = '';
      
      // Taramayı durdur
      try {
        await BarcodeScanner.stopScan();
      } catch (error) {
        console.error('Tarama durdurma hatası:', error);
      }
    }
  };

  // Taramayı durdur
  const stopScanning = async () => {
    try {
      await BarcodeScanner.stopScan();
      setIsScanning(false);
      onClose();
    } catch (error) {
      console.error('Tarama durdurma hatası:', error);
    }
  };

  // Mock tarama (web ortamı için)
  const mockScan = () => {
    const mockQRData = JSON.stringify({
      type: 'patient-access',
      patientId: 'patient-1',
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Demo QR Tarandı",
      description: "Bu demo bir QR kod taramasıdır.",
    });
    
    onScan(mockQRData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white z-10">
        <h1 className="text-lg font-semibold">QR Kod Tarayıcı</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={isScanning ? stopScanning : onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 flex items-center justify-center p-4">
        {!isSupported ? (
          // Web ortamı - Mock tarama
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            
            <div className="text-white space-y-2">
              <h2 className="text-xl font-semibold">Web Ortamı</h2>
              <p className="text-sm opacity-80">
                Gerçek QR kod tarama için mobil cihazınızda çalıştırın
              </p>
            </div>

            <Alert className="bg-white/10 border-white/20 text-white">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Bu demo versiyonu web tarayıcısında çalışıyor. Gerçek kamera tabanlı QR tarama için uygulamayı mobil cihazda çalıştırın.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={mockScan}
              className="bg-primary hover:bg-primary/90 w-full"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Demo QR Tarama
            </Button>
          </div>
        ) : permission === 'denied' ? (
          // İzin reddedildi
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            
            <div className="text-white space-y-2">
              <h2 className="text-xl font-semibold">Kamera İzni Gerekli</h2>
              <p className="text-sm opacity-80">
                QR kod taramak için kamera erişimi gerekiyor
              </p>
            </div>

            <Button 
              onClick={requestPermissions}
              className="bg-primary hover:bg-primary/90 w-full"
            >
              <Camera className="w-4 h-4 mr-2" />
              Kamera İzni Ver
            </Button>
          </div>
        ) : permission === 'granted' && !isScanning ? (
          // İzin var, tarama başlatılabilir
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10 text-primary" />
            </div>
            
            <div className="text-white space-y-2">
              <h2 className="text-xl font-semibold">QR Kod Taramaya Hazır</h2>
              <p className="text-sm opacity-80">
                Kamerayı QR koda doğrultun
              </p>
            </div>

            <Button 
              onClick={startScanning}
              className="bg-primary hover:bg-primary/90 w-full"
              disabled={isScanning}
            >
              <Camera className="w-4 h-4 mr-2" />
              Taramayı Başlat
            </Button>
          </div>
        ) : (
          // Tarama aktif
          <div className="text-center space-y-6">
            <div className="text-white space-y-4">
              <div className="w-64 h-64 border-4 border-primary rounded-lg relative mx-auto">
                {/* Köşe işaretleri */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white" />
                
                {/* Tarama çizgisi */}
                <div 
                  className="absolute left-0 right-0 h-1 bg-primary animate-pulse"
                  style={{
                    animation: 'scan 2s linear infinite',
                    background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)'
                  }}
                />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold">Taranıyor...</h2>
                <p className="text-sm opacity-80">
                  QR kodu tarama alanına yerleştirin
                </p>
              </div>
            </div>

            <Button 
              onClick={stopScanning}
              variant="outline"
              className="border-white text-white hover:bg-white/20"
            >
              Taramayı Durdur
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: calc(100% - 4px); }
        }
      `}</style>
    </div>
  );
};