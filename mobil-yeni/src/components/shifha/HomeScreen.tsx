/**
 * Shifha Ana Sayfa
 * Kullanıcıya özel dashboard ve özet bilgiler
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Pill, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle,
  Heart,
  TrendingUp,
  User,
  RefreshCw,
  TestTube
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { 
  getTodaysMedicationReminders, 
  getUpcomingAppointments,
  mockSymptoms,
  MOOD_EMOJIS
} from './mockData';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { labAPI, patientAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface HomeScreenProps {
  onTabChange?: (tab: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onTabChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [healthStats, setHealthStats] = useState({
    totalLabResults: 0,
    abnormalResults: 0,
    lastLabDate: null as Date | null,
    criticalResults: 0
  });
  
  // Ana sayfa verileri
  const todaysMedications = useMemo(() => getTodaysMedicationReminders(), []);
  const upcomingAppointments = useMemo(() => getUpcomingAppointments(), []);
  const recentSymptoms = useMemo(() => 
    mockSymptoms.slice(0, 3).sort((a, b) => b.date.getTime() - a.date.getTime()), 
    []
  );

  // Sağlık istatistiklerini yükle
  const loadHealthStats = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await labAPI.getResults(user.id);
      if (response.success && response.data) {
        const results = response.data;
        const abnormalCount = results.filter((result: any) => {
          // Basit anormal değer kontrolü - gerçek uygulamada daha detaylı olacak
          return Object.keys(result).some(key => {
            if (key.includes('hemoglobin') && (result[key] < 12 || result[key] > 16)) return true;
            if (key.includes('glukoz') && (result[key] < 70 || result[key] > 100)) return true;
            // Diğer parametreler için de kontrol eklenebilir
            return false;
          });
        }).length;

        const criticalCount = results.filter((result: any) => {
          return Object.keys(result).some(key => {
            if (key.includes('hemoglobin') && (result[key] < 8 || result[key] > 20)) return true;
            if (key.includes('glukoz') && (result[key] < 50 || result[key] > 200)) return true;
            return false;
          });
        }).length;

        setHealthStats({
          totalLabResults: results.length,
          abnormalResults: abnormalCount,
          lastLabDate: results.length > 0 ? new Date(results[0].created_at) : null,
          criticalResults: criticalCount
        });
      }
    } catch (error) {
      console.error('Health stats loading error:', error);
      // Hata durumunda varsayılan değerler
      setHealthStats({
        totalLabResults: 0,
        abnormalResults: 0,
        lastLabDate: null,
        criticalResults: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthStats();
  }, [user?.id]);

  // İlaç uyum oranı hesaplama
  const medicationCompliance = useMemo(() => {
    const takenCount = todaysMedications.filter(med => med.taken).length;
    return todaysMedications.length > 0 ? (takenCount / todaysMedications.length) * 100 : 0;
  }, [todaysMedications]);

  // Günün zamanına göre selamlama
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 17) return 'İyi öğlenler';
    return 'İyi akşamlar';
  };

  const nextAppointment = upcomingAppointments[0];
  const recentMood = recentSymptoms[0];
  const currentMoodEmoji = MOOD_EMOJIS.find(m => m.mood === recentMood?.mood);

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      // logout(); // Removed as per edit hint
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Selamlama ve Özet */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Kullanıcı'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Sağlığınızı takip etmeye devam edin
        </p>
      </div>

      {/* Hızlı Durum Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* İlaç Uyumu */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-primary">
                İlaç Uyumu
              </CardTitle>
              <Pill className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold">
              {Math.round(medicationCompliance)}%
            </div>
            <Progress value={medicationCompliance} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {todaysMedications.filter(m => m.taken).length} / {todaysMedications.length} ilaç alındı
            </p>
          </CardContent>
        </Card>

        {/* Tahlil Sonuçları */}
        <Card className="border-l-4 border-l-health-info">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-health-info">
                Tahlil Sonuçları
              </CardTitle>
              <TestTube className="w-4 h-4 text-health-info" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {healthStats.totalLabResults}
                </div>
                <p className="text-xs text-muted-foreground">
                  {healthStats.abnormalResults > 0 && (
                    <span className="text-health-warning">
                      {healthStats.abnormalResults} anormal değer
                    </span>
                  )}
                  {healthStats.criticalResults > 0 && (
                    <span className="text-health-danger ml-1">
                      ({healthStats.criticalResults} kritik)
                    </span>
                  )}
                  {healthStats.abnormalResults === 0 && "Tüm değerler normal"}
                </p>
                {healthStats.lastLabDate && (
                  <p className="text-xs text-muted-foreground">
                    Son: {format(healthStats.lastLabDate, 'dd MMM yyyy', { locale: tr })}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Sonraki Randevu */}
        <Card className="border-l-4 border-l-secondary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-secondary">
                Sonraki Randevu
              </CardTitle>
              <Calendar className="w-4 h-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {nextAppointment ? (
              <>
                <div className="text-sm font-medium">
                  {formatDistanceToNow(nextAppointment.date, { 
                    addSuffix: true,
                    locale: tr 
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextAppointment.type === 'checkup' ? 'Kontrol' : 'Muayene'}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Yakın zamanda randevu yok
              </div>
            )}
          </CardContent>
        </Card>

        {/* Güncel Ruh Hali */}
        <Card className="border-l-4 border-l-health-success">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-health-success">
                Ruh Halim
              </CardTitle>
              <Activity className="w-4 h-4 text-health-success" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentMoodEmoji ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentMoodEmoji.emoji}</span>
                  <span className="text-sm font-medium">
                    {currentMoodEmoji.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(recentMood.date, { 
                    addSuffix: true,
                    locale: tr 
                  })}
                </p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Henüz kayıt yok
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bugünkü İlaçlar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-primary" />
            Bugünkü İlaçlarım
          </CardTitle>
          <CardDescription>
            Günlük ilaç takibi ve hatırlatmalar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaysMedications.length > 0 ? (
            todaysMedications.map((medication, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  medication.taken 
                    ? 'bg-health-success/10 border-health-success/30' 
                    : 'bg-muted/50 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    medication.taken ? 'bg-health-success' : 'bg-muted-foreground'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{medication.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {medication.frequency} • {medication.dosage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {medication.taken ? (
                    <Badge variant="secondary" className="text-xs bg-health-success/20 text-health-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Alındı
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Beklemede
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Pill className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Bugün için ilaç kaydı yok</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Son Semptomlar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-health-info" />
            Son Semptom Kayıtları
          </CardTitle>
          <CardDescription>
            Son 3 günlük semptom takibi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentSymptoms.length > 0 ? (
            recentSymptoms.map((symptom) => {
              const moodEmoji = MOOD_EMOJIS.find(m => m.mood === symptom.mood);
              return (
                <div key={symptom.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{moodEmoji?.emoji}</span>
                    <div>
                      <p className="font-medium text-sm">
                        {symptom.symptoms.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(symptom.date, { 
                          addSuffix: true,
                          locale: tr 
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Şiddet: {symptom.severity}/5
                  </Badge>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Henüz semptom kaydı yok</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hızlı Eylemler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Hızlı İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => onTabChange?.('tracking')}
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-health-info" />
                <div className="text-left">
                  <p className="font-medium">Semptom Kaydet</p>
                  <p className="text-xs text-muted-foreground">
                    Bugünkü durumunuzu kaydedin
                  </p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => onTabChange?.('profile')}
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">QR Kodu Göster</p>
                  <p className="text-xs text-muted-foreground">
                    Profilde QR kod oluştur
                  </p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => onTabChange?.('appointment-booking')}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-secondary" />
                <div className="text-left">
                  <p className="font-medium">Randevu Al</p>
                  <p className="text-xs text-muted-foreground">
                    MHRS benzeri randevu sistemi
                  </p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-auto p-4"
              onClick={() => onTabChange?.('appointments')}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-health-success" />
                <div className="text-left">
                  <p className="font-medium">Randevularım</p>
                  <p className="text-xs text-muted-foreground">
                    Tüm randevularınızı görüntüleyin
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};