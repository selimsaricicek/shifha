/**
 * Shifha Login Screen
 * Hasta ve Doktor girişi için ana ekran
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, User, Stethoscope, Lock, Mail, QrCode, Camera, X, Info } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CapacitorQRScanner } from './CapacitorQRScanner';

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [patientForm, setPatientForm] = useState({
    email: '',
    password: ''
  });
  
  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: ''
  });

  // QR Scanner state'leri
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRInstructions, setShowQRInstructions] = useState(false);

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientForm.email || !patientForm.password) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen e-posta ve şifrenizi giriniz.",
        variant: "destructive"
      });
      return;
    }

    const success = await login(patientForm.email, patientForm.password, 'patient');
    
    if (success) {
      toast({
        title: "Hoş Geldiniz!",
        description: "Shifha'ya başarıyla giriş yaptınız.",
      });
    } else {
      toast({
        title: "Giriş Hatası",
        description: "E-posta veya şifre hatalı.",
        variant: "destructive"
      });
    }
  };

  const handleDoctorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctorForm.email || !doctorForm.password) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen e-posta ve şifrenizi giriniz.",
        variant: "destructive"
      });
      return;
    }

    const success = await login(doctorForm.email, doctorForm.password, 'doctor');
    
    if (success) {
      toast({
        title: "Hoş Geldiniz Doktor!",
        description: "Shifha'ya başarıyla giriş yaptınız.",
      });
    } else {
      toast({
        title: "Giriş Hatası",
        description: "E-posta veya şifre hatalı.",
        variant: "destructive"
      });
    }
  };

  const fillDemoData = (role: 'patient' | 'doctor') => {
    if (role === 'patient') {
      setPatientForm({
        email: 'ahmet.yilmaz@email.com',
        password: 'demo123'
      });
    } else {
      setDoctorForm({
        email: 'dr.mehmet@hastane.com',
        password: 'demo123'
      });
    }
  };

  // QR kod tarama işlemi
  const handleQRScan = (data: string) => {
    try {
      const qrData = JSON.parse(data);
      
      // Doktor giriş QR kodu kontrolü
      if (qrData.type === 'doctor-login') {
        // QR kod verilerini form'a doldur
        setDoctorForm({
          email: qrData.doctorEmail || '',
          password: '' // Güvenlik için şifre QR'da saklanmaz
        });
        
        toast({
          title: "QR Kod Okundu",
          description: "Doktor bilgileri yüklendi. Şifrenizi girin ve giriş yapın.",
        });
        
        setShowQRScanner(false);
      } else {
        toast({
          title: "Geçersiz QR Kod",
          description: "Bu QR kod doktor girişi için uygun değil.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "QR Kod Hatası",
        description: "QR kod okunamadı veya geçersiz format.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo ve Başlık */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">Shifha</h1>
            <p className="text-muted-foreground">Sağlık Takip Sistemi</p>
          </div>
        </div>

        {/* Giriş Formları */}
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Giriş Yapın</CardTitle>
            <CardDescription>
              Sağlık verilerinizi güvenle takip edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patient" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="patient" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Hasta
                </TabsTrigger>
                <TabsTrigger value="doctor" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Doktor
                </TabsTrigger>
              </TabsList>

              {/* Hasta Girişi */}
              <TabsContent value="patient" className="space-y-4">
                <form onSubmit={handlePatientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-posta
                    </Label>
                    <Input
                      id="patient-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={patientForm.email}
                      onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Şifre
                    </Label>
                    <Input
                      id="patient-password"
                      type="password"
                      placeholder="••••••••"
                      value={patientForm.password}
                      onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Giriş yapılıyor...' : 'Hasta Girişi'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fillDemoData('patient')}
                      disabled={isLoading}
                    >
                      Demo Veri Doldur
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Doktor Girişi */}
              <TabsContent value="doctor" className="space-y-4">
                <form onSubmit={handleDoctorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-posta
                    </Label>
                    <Input
                      id="doctor-email"
                      type="email"
                      placeholder="doktor@hastane.com"
                      value={doctorForm.email}
                      onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Şifre
                    </Label>
                    <Input
                      id="doctor-password"
                      type="password"
                      placeholder="••••••••"
                      value={doctorForm.password}
                      onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-secondary hover:bg-secondary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Giriş yapılıyor...' : 'Doktor Girişi'}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fillDemoData('doctor')}
                      disabled={isLoading}
                    >
                      Demo Veri Doldur
                    </Button>

                    {/* QR Kod Tarama Butonu */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowQRScanner(true)}
                        disabled={isLoading}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Okut
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowQRInstructions(true)}
                        disabled={isLoading}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Demo Açıklaması */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                <strong>Demo Hesaplar:</strong><br />
                Hasta: ahmet.yilmaz@email.com<br />
                Doktor: dr.mehmet@hastane.com<br />
                Şifre: demo123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <CapacitorQRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />

      {/* QR Kullanım Talimatları Modal */}
      <Dialog open={showQRInstructions} onOpenChange={setShowQRInstructions}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Kod Nasıl Kullanılır?
            </DialogTitle>
            <DialogDescription>
              Web sitenizdeki QR kodu telefonunuzla okutarak hızlı giriş yapabilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="text-sm font-medium">Web sitenizde doktor giriş sayfasını açın</p>
                  <p className="text-xs text-muted-foreground">Bilgisayarınızda web tarayıcısından doktor panelinize gidin</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="text-sm font-medium">QR kod oluşturun</p>
                  <p className="text-xs text-muted-foreground">Web sayfasında "QR Kod Oluştur" butonuna tıklayın</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="text-sm font-medium">Telefonunuzla QR kodu okutun</p>
                  <p className="text-xs text-muted-foreground">Bu uygulamada "QR Okut" butonuna basın ve web'deki QR kodu tarayın</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <p className="text-sm font-medium">Otomatik giriş yapın</p>
                  <p className="text-xs text-muted-foreground">QR kod okunduktan sonra şifrenizi girerek giriş yapın</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Güvenlik Notu</p>
                  <p className="text-xs text-blue-600 mt-1">
                    QR kodlar 10 dakika süreyle geçerlidir ve sadece sizin tarafınızdan kullanılabilir. 
                    Güvenlik için QR kodları başkalarıyla paylaşmayın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};