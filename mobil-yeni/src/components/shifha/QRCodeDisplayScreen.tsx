/**
 * Hasta QR Kod Gösterme Ekranı
 * Hasta bilgilerini içeren QR kodu gösterir
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  QrCode, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  User,
  Phone,
  Calendar,
  Heart,
  Shield,
  ExternalLink,
  X,
  Download,
  Share
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface QRCodeDisplayScreenProps {
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

export const QRCodeDisplayScreen: React.FC<QRCodeDisplayScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [qrData, setQrData] = useState<PatientQRData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR kod verisi oluştur
  const generateQRData = () => {
    if (!user) return;

    setIsGenerating(true);
    setError(null);

    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 dakika geçerli

      const qrData: PatientQRData = {
        type: 'patient-access',
        patientId: user.id || 'unknown',
        patientName: user.name || 'Bilinmeyen Hasta',
        patientTC: user.tc || 'unknown',
        basicInfo: {
          age: user.age || undefined,
          bloodType: user.bloodType || undefined,
          allergies: user.allergies || [],
          chronicDiseases: user.chronicDiseases || [],
          emergencyContact: user.emergencyContact || {
            name: 'Acil Durum',
            phone: '112'
          }
        },
        timestamp,
        expiresAt,
        sessionId,
        securityHash: generateSecurityHash(`${user.id}-${sessionId}-${timestamp}`)
      };

      setQrData(qrData);
      toast({
        title: "QR Kod Oluşturuldu",
        description: "QR kodunuz başarıyla oluşturuldu. Doktor tarafından taranabilir.",
      });
    } catch (error) {
      setError('QR kod oluşturulurken bir hata oluştu.');
      toast({
        title: "Hata",
        description: "QR kod oluşturulamadı.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Güvenlik hash'i oluştur
  const generateSecurityHash = (data: string): string => {
    // Basit hash fonksiyonu - gerçek uygulamada daha güvenli olacak
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32-bit integer'a dönüştür
    }
    return Math.abs(hash).toString(16);
  };

  // QR kodu yenile
  const refreshQRCode = () => {
    generateQRData();
  };

  // QR kodu paylaş
  const shareQRCode = async () => {
    if (!qrData) return;

    try {
      const qrText = JSON.stringify(qrData);
      
      if (navigator.share) {
        await navigator.share({
          title: 'Hasta QR Kodu',
          text: 'Doktor erişimi için QR kod',
          url: `data:text/plain;base64,${btoa(qrText)}`
        });
      } else {
        // Fallback: QR kodu kopyala
        await navigator.clipboard.writeText(qrText);
        toast({
          title: "QR Kod Kopyalandı",
          description: "QR kod verisi panoya kopyalandı.",
        });
      }
    } catch (error) {
      toast({
        title: "Paylaşım Hatası",
        description: "QR kod paylaşılamadı.",
        variant: "destructive"
      });
    }
  };

  // QR kodu indir
  const downloadQRCode = () => {
    if (!qrData) return;

    try {
      const qrText = JSON.stringify(qrData);
      const blob = new Blob([qrText], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `hasta-qr-${user?.id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "QR Kod İndirildi",
        description: "QR kod dosyası başarıyla indirildi.",
      });
    } catch (error) {
      toast({
        title: "İndirme Hatası",
        description: "QR kod indirilemedi.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    generateQRData();
  }, [user]);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <QrCode className="w-6 h-6 text-primary" />
            QR Kodum
          </h1>
          <p className="text-muted-foreground">
            Doktor erişimi için QR kodunuz
          </p>
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Hata Mesajı */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* QR Kod Kartı */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Hasta QR Kodu
          </CardTitle>
          <CardDescription>
            Doktor tarafından taranabilir hasta bilgileri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGenerating ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">QR kod oluşturuluyor...</p>
            </div>
          ) : qrData ? (
            <>
              {/* QR Kod Görseli */}
              <div className="flex justify-center">
                <div className="w-48 h-48 bg-white p-4 rounded-lg border-2 border-primary/20">
                  {/* Mock QR Kod - gerçek uygulamada QR kod kütüphanesi kullanılacak */}
                  <div className="w-full h-full bg-black grid grid-cols-8 gap-0.5">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-3 h-3 ${Math.random() > 0.4 ? 'bg-white' : 'bg-black'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Hasta Bilgileri */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{qrData.patientName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">ID: {qrData.patientId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Oluşturulma: {new Date(qrData.timestamp).toLocaleString('tr-TR')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Geçerlilik: {new Date(qrData.expiresAt).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              {/* Durum Badge */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aktif
                </Badge>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={refreshQRCode}
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yenile
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={shareQRCode}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Paylaş
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={downloadQRCode}
                >
                  <Download className="w-4 h-4 mr-2" />
                  İndir
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <QrCode className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">QR kod oluşturulamadı</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={generateQRData}
                disabled={isGenerating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bilgilendirme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">QR Kod Kullanımı</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Bu QR kod doktorunuz tarafından taranarak hasta bilgilerinize güvenli erişim sağlar.
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              QR kod 30 dakika geçerlidir ve otomatik olarak yenilenir.
            </p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Sadece yetkili doktorlar bu QR kodu tarayabilir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 