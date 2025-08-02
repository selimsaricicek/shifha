/**
 * Doktor QR Kod Okuyucu Ekranı
 * Hasta QR kodlarını okuyarak bilgilerine erişim sağlar
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  User,
  Phone,
  Calendar,
  Heart,
  Shield,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BrowserMultiFormatReader } from '@zxing/library';
import { PatientDetailModal } from './PatientDetailModal';

interface QRScannerScreenProps {
  onBack?: () => void;
}

interface PatientQRData {
  type: 'patient-access';
  patientId: string;
  patientName: string;
  patientTC: string;
  basicInfo: {
    age?: number;
    bloodType?: string;
    allergies?: string[];
    chronicDiseases?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
    };
  };
  timestamp: string;
  expiresAt: string;
  sessionId: string;
  securityHash: string;
}

export const QRScannerScreen: React.FC<QRScannerScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<PatientQRData | null>(null);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Kamera izni kontrolü
  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state);
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state);
      });
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  // QR kod taramayı başlat
  const startScanning = async () => {
    try {
      setError(null);
      setScannedData(null);
      
      // Kamera erişimi iste
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Arka kamera tercih et
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // QR kod okuyucu başlat
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      setIsScanning(true);
      setCameraPermission('granted');

      // QR kod tarama
      codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current!, (result, error) => {
        if (result) {
          handleQRCodeScanned(result.getText());
        }
        if (error && !(error.name === 'NotFoundException')) {
          console.error('QR kod okuma hatası:', error);
        }
      });

      toast({
        title: "Kamera Açıldı",
        description: "QR kodu kameranın önüne tutun",
      });

    } catch (error) {
      console.error('Kamera erişim hatası:', error);
      setCameraPermission('denied');
      setError('Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarından kamera iznini verin.');
      
      toast({
        title: "Kamera Hatası",
        description: "Kamera erişimi sağlanamadı",
        variant: "destructive"
      });
    }
  };

  // QR kod taramayı durdur
  const stopScanning = () => {
    setIsScanning(false);
    
    // Video stream'i durdur
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    // QR kod okuyucuyu durdur
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
  };

  // QR kod verilerini işle
  const handleQRCodeScanned = (qrText: string) => {
    try {
      const qrData: PatientQRData = JSON.parse(qrText);
      
      // QR kod formatını kontrol et
      if (qrData.type !== 'patient-access') {
        throw new Error('Geçersiz QR kod formatı');
      }

      // Süre kontrolü
      const now = new Date();
      const expiresAt = new Date(qrData.expiresAt);
      
      if (now > expiresAt) {
        throw new Error('QR kod süresi dolmuş');
      }

      // Güvenlik hash kontrolü (basit kontrol)
      const expectedHash = generateSecurityHash(`${qrData.patientId}_${qrData.sessionId}_${qrData.timestamp}`);
      if (qrData.securityHash !== expectedHash) {
        throw new Error('QR kod güvenlik doğrulaması başarısız');
      }

      setScannedData(qrData);
      stopScanning();
      setShowPatientDetail(true);
      
      toast({
        title: "QR Kod Okundu",
        description: `${qrData.patientName} hasta bilgileri alındı`,
      });

    } catch (error) {
      console.error('QR kod işleme hatası:', error);
      setError(error instanceof Error ? error.message : 'QR kod okunamadı');
      
      toast({
        title: "QR Kod Hatası",
        description: error instanceof Error ? error.message : 'QR kod okunamadı',
        variant: "destructive"
      });
    }
  };

  // Güvenlik hash oluşturma
  const generateSecurityHash = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  // Hasta bilgilerini web panelde aç
  const openPatientInWebPanel = () => {
    if (!scannedData) return;
    
    // Web panel URL'si - gerçek uygulamada backend'den gelecek
    const webPanelUrl = `http://localhost:3000/patient/${scannedData.patientId}?session=${scannedData.sessionId}`;
    
    // Yeni sekmede aç
    window.open(webPanelUrl, '_blank');
    
    toast({
      title: "Web Panel Açıldı",
      description: "Hasta bilgileri yeni sekmede açıldı",
    });
  };

  // Yeni tarama başlat
  const resetScanner = () => {
    setScannedData(null);
    setError(null);
    stopScanning();
  };

  if (!user || user.role !== 'doctor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Bu özellik sadece doktor kullanıcıları için kullanılabilir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Başlık */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <QrCode className="w-12 h-12 text-primary" />
          </div>
          <Badge className="absolute -bottom-2 -right-2 bg-blue-500">
            Doktor
          </Badge>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">QR Kod Okuyucu</h1>
          <p className="text-muted-foreground">Hasta QR kodlarını okuyarak bilgilerine erişin</p>
        </div>
      </div>

      {/* QR Kod Tarayıcı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="w-5 h-5 mr-2" />
            QR Kod Tarayıcı
          </CardTitle>
          <CardDescription>
            Hastanızın mobil uygulamasından oluşturduğu QR kodu okutun
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kamera Görüntüsü */}
          <div className="relative">
            <div className="w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover"
                style={{ display: isScanning ? 'block' : 'none' }}
              />
              
              {/* Kamera Kapalı Durumu - QR Logo ile */}
              {!isScanning && (
                <div className="w-full h-64 flex items-center justify-center bg-white">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                      <QrCode className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-blue-700">QR Kod Tarayıcı</p>
                    <p className="text-xs text-blue-500 mt-1">Taramayı başlatmak için butona tıklayın</p>
                  </div>
                </div>
              )}

              {/* Tarama Çerçevesi */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-primary rounded-lg">
                    <div className="w-full h-full border-2 border-white/50 rounded-lg animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Kontrol Butonları */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!isScanning ? (
              <Button 
                onClick={startScanning}
                disabled={cameraPermission === 'denied'}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Camera className="w-4 h-4 mr-2" />
                Taramayı Başlat
              </Button>
            ) : (
              <Button 
                onClick={stopScanning}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Taramayı Durdur
              </Button>
            )}
            
            {(scannedData || error) && (
              <Button 
                onClick={resetScanner}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Yeni Tarama
              </Button>
            )}
          </div>

          {/* Kamera İzni Uyarısı */}
          {cameraPermission === 'denied' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Kamera erişimi reddedildi. QR kod okuyabilmek için tarayıcı ayarlarından kamera iznini verin.
              </AlertDescription>
            </Alert>
          )}

          {/* Hata Mesajı */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Taranan Hasta Bilgileri */}
      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Hasta Bilgileri
            </CardTitle>
            <CardDescription>
              QR kod başarıyla okundu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hasta Temel Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Hasta Adı</p>
                  <p className="font-medium">{scannedData.patientName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">TC Kimlik</p>
                  <p className="font-medium">{scannedData.patientTC}</p>
                </div>
              </div>
              
              {scannedData.basicInfo.age && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Yaş</p>
                    <p className="font-medium">{scannedData.basicInfo.age}</p>
                  </div>
                </div>
              )}
              
              {scannedData.basicInfo.bloodType && (
                <div className="flex items-center space-x-3">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Kan Grubu</p>
                    <p className="font-medium">{scannedData.basicInfo.bloodType}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Alerjiler */}
            {scannedData.basicInfo.allergies && scannedData.basicInfo.allergies.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Alerjiler</p>
                <div className="flex flex-wrap gap-2">
                  {scannedData.basicInfo.allergies.map((allergy, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Acil Durum İletişim */}
            {scannedData.basicInfo.emergencyContact && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-orange-600" />
                  Acil Durum İletişim
                </h4>
                <div className="space-y-1">
                  <p className="font-medium">{scannedData.basicInfo.emergencyContact.name}</p>
                  <p className="text-sm text-muted-foreground">{scannedData.basicInfo.emergencyContact.phone}</p>
                </div>
              </div>
            )}

            {/* Oturum Bilgileri */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                Oturum Bilgileri
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-blue-600">
                <p>Oturum ID: {scannedData.sessionId}</p>
                <p>Oluşturulma: {new Date(scannedData.timestamp).toLocaleString('tr-TR')}</p>
                <p>Geçerlilik: {new Date(scannedData.expiresAt).toLocaleString('tr-TR')}</p>
                <p>Hash: {scannedData.securityHash}</p>
              </div>
            </div>

            {/* Web Panel Butonu */}
            <div className="text-center">
              <Button 
                onClick={openPatientInWebPanel}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Web Panelde Aç
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Hasta bilgileri web panelinde yeni sekmede açılacak
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kullanım Talimatları */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">QR Kod Okuyucu Nasıl Kullanılır?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <p className="text-sm">Hastanızdan mobil uygulamasından QR kod oluşturmasını isteyin</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <p className="text-sm">"Taramayı Başlat" butonuna tıklayarak kamerayı açın</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <p className="text-sm">Hastanın QR kodunu kamera çerçevesinin içine getirin</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <p className="text-sm">"Web Panelde Aç" butonuyla hasta bilgilerini bilgisayarınızda görüntüleyin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hasta Detay Modal */}
      <PatientDetailModal
        isOpen={showPatientDetail}
        onClose={() => setShowPatientDetail(false)}
        qrData={scannedData}
      />
    </div>
  );
};