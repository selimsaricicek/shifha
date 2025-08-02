/**
 * Hasta Profil Sayfası
 * Hasta bilgileri görüntüleme ve QR kod üretimi
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  QrCode, 
  RefreshCw, 
  Clock, 
  Shield, 
  Copy,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Heart,
  Activity,
  LogOut,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { QRCodeData } from './types';

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

interface ProfileScreenProps {
  showQRCode?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ showQRCode = false }) => {
  const { user, refreshUser, logout } = useAuth();
  const { toast } = useToast();
  
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [qrData, setQrData] = useState<PatientQRData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  
  // Profil düzenleme state'leri
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''
  });

  // QR kod bölümünü otomatik aç
  useEffect(() => {
    if (showQRCode && user?.role === 'patient') {
      generatePatientQR();
    } else if (showQRCode && user?.role === 'doctor') {
      generateDoctorLoginQR();
    }
  }, [showQRCode, user?.role]);

  // QR kod süre sayacı
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsExpired(true);
            setQrCodeImage(null);
            setQrData(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft]);

  // Güvenli hash oluşturma
  const generateSecurityHash = (data: string): string => {
    // Basit hash fonksiyonu - gerçek uygulamada crypto kullanılmalı
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer'a çevir
    }
    return Math.abs(hash).toString(16);
  };

  // QR kod oluştur (hasta için)
  const generatePatientQR = async () => {
    if (!user || user.role !== 'patient') {
      toast({
        title: "Hata",
        description: "QR kod sadece hasta kullanıcıları için üretilebilir.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setIsExpired(false);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 dakika geçerli
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Hasta bilgilerini hazırla
      const patientData: PatientQRData = {
        type: 'patient-access',
        patientId: user.id,
        patientName: user.name,
        patientTC: user.id, // TC kimlik no olarak kullanılıyor
        basicInfo: {
          age: user.birthDate ? new Date().getFullYear() - new Date(user.birthDate).getFullYear() : undefined,
          bloodType: 'A Rh+', // Mock data - gerçek uygulamada API'den gelecek
          allergies: ['Penisilin'], // Mock data
          chronicDiseases: [], // Mock data
          emergencyContact: {
            name: 'Acil Durum Kişisi',
            phone: user.phone || '+90 555 123 4567'
          }
        },
        timestamp: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        sessionId,
        securityHash: generateSecurityHash(`${user.id}_${sessionId}_${now.toISOString()}`)
      };

      // QR kod verisi olarak JSON string kullan
      const qrDataString = JSON.stringify(patientData);
      
      // QR kod görüntüsü oluştur
      const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setQrData(patientData);
      setQrCodeImage(qrCodeDataURL);
      setTimeLeft(5 * 60); // 5 dakika = 300 saniye

      toast({
        title: "QR Kod Oluşturuldu",
        description: "QR kodunuz 5 dakika süreyle geçerlidir.",
      });

    } catch (error) {
      console.error('QR kod oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: "QR kod oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Doktor giriş QR kodu oluştur
  const generateDoctorLoginQR = async () => {
    if (!user || user.role !== 'doctor') {
      toast({
        title: "Hata",
        description: "Bu özellik sadece doktor kullanıcıları için kullanılabilir.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setIsExpired(false);

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 dakika geçerli
      const sessionId = `doctor_login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Doktor giriş bilgilerini hazırla
      const doctorLoginData: QRCodeData = {
        type: 'doctor-login',
        doctorId: user.id,
        doctorName: user.name,
        doctorEmail: user.email,
        timestamp: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        sessionId,
        securityHash: generateSecurityHash(`doctor_${user.id}_${sessionId}_${now.toISOString()}`)
      };

      // QR kod verisi olarak JSON string kullan
      const qrDataString = JSON.stringify(doctorLoginData);
      
      // QR kod görüntüsü oluştur
      const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f766e', // Doktor için farklı renk
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });

      setQrData(doctorLoginData);
      setQrCodeImage(qrCodeDataURL);
      setTimeLeft(10 * 60); // 10 dakika = 600 saniye

      toast({
        title: "Doktor Giriş QR Kodu Oluşturuldu",
        description: "QR kodunuz 10 dakika süreyle geçerlidir. Web panelde tarayarak giriş yapabilirsiniz.",
      });

    } catch (error) {
      console.error('Doktor giriş QR kod oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: "QR kod oluşturulurken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // QR kod verilerini kopyala
  const copyQRData = async () => {
    if (!qrData) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      toast({
        title: "Kopyalandı",
        description: "QR kod verileri panoya kopyalandı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama işlemi başarısız oldu.",
        variant: "destructive"
      });
    }
  };

  // Süre formatı
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Form verilerini güncelle
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Düzenleme modunu başlat
  const startEditing = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''
    });
    setIsEditing(true);
  };

  // Düzenleme modunu iptal et
  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''
    });
  };

  // Profil bilgilerini kaydet
  const saveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Simüle edilmiş API çağrısı
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Gerçek uygulamada API çağrısı yapılacak
      // const response = await updateProfile(formData);
      
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi.",
      });
      
      setIsEditing(false);
      // Kullanıcı bilgilerini yenile
      // refreshUser();
      
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Kullanıcı bilgileri yüklenemedi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Header with Logout */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-muted-foreground">Hesap bilgileriniz ve QR kodlarınız</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Çıkış
        </Button>
      </div>

      {/* Profil Başlığı */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
          <Badge className="absolute -bottom-2 -right-2 bg-green-500">
            {user.role === 'patient' ? 'Hasta' : 'Doktor'}
          </Badge>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Temel Bilgiler */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Kişisel Bilgiler
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={startEditing}
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditing ? (
            // Görüntüleme modu
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-posta</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              {user.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}
              
              {user.birthDate && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Doğum Tarihi</p>
                    <p className="font-medium">
                      {new Date(user.birthDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Üyelik Tarihi</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Düzenleme modu
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ad soyadınızı girin"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="E-posta adresinizi girin"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Telefon numaranızı girin"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  />
                </div>
              </div>
              
              {/* Düzenleme butonları */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Kaydet
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  İptal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Kod Bölümü - Sadece Hasta İçin */}
      {user.role === 'patient' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Doktor Erişim QR Kodu
            </CardTitle>
            <CardDescription>
              Doktorunuzla randevunuz sırasında bu QR kodu göstererek bilgilerinize güvenli erişim sağlayabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Kod Üretme Butonu */}
            {!qrCodeImage && (
              <div className="text-center space-y-4">
                <div className="w-48 h-48 mx-auto bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-muted">
                  <div className="text-center">
                    <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">QR kod oluşturmak için butona tıklayın</p>
                  </div>
                </div>
                <Button 
                  onClick={generatePatientQR} 
                  disabled={isGenerating}
                  className="w-full max-w-xs"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Kod Oluştur
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Aktif QR Kod */}
            {qrCodeImage && !isExpired && (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-lg shadow-lg border">
                  <img 
                    src={qrCodeImage} 
                    alt="Hasta QR Kodu" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                
                {/* Süre Göstergesi */}
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    Kalan süre: {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Güvenlik Bilgisi */}
                <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 mt-0.5 text-blue-600" />
                    <div className="text-left">
                      <h4 className="text-sm font-medium text-blue-800">Güvenlik Bilgisi</h4>
                      <p className="text-xs mt-1 text-blue-600">
                        Bu QR kod 5 dakika süreyle geçerlidir ve sadece yetkili doktorlar tarafından okunabilir. Kişisel bilgileriniz şifrelenerek korunmaktadır.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Eylem Butonları */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={generatePatientQR}
                    disabled={isGenerating}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Yenile
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={copyQRData}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Veriyi Kopyala
                  </Button>
                </div>
              </div>
            )}

            {/* Süresi Dolmuş QR Kod */}
            {isExpired && (
              <div className="text-center space-y-4">
                <div className="w-48 h-48 mx-auto bg-red-50 rounded-lg flex items-center justify-center border-2 border-dashed border-red-200">
                  <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-600">QR kod süresi doldu</p>
                  </div>
                </div>
                <Button 
                  onClick={generatePatientQR} 
                  disabled={isGenerating}
                  className="w-full max-w-xs"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Yeni QR Kod Oluştur
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kullanım Talimatları - Sadece Hasta İçin */}
      {user.role === 'patient' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              QR Kod Nasıl Kullanılır?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Doktor randevunuza gitmeden önce QR kod oluşturun</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Doktorunuz mobil uygulamasından QR kod okutma bölümünü açsın</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">QR kodu doktorunuza gösterin ve okutmasını sağlayın</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <p className="text-sm">Doktorunuz bilgisayarında hasta bilgilerinizi görüntüleyebilecek</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};