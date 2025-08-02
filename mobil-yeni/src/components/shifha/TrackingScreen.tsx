/**
 * Shifha Takip Ekranı
 * Günlük semptom, ruh hali ve ilaç takibi
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Pill, 
  Heart,
  Plus,
  Check,
  X,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './hooks/useAuth';
import { 
  mockMedications, 
  MOOD_EMOJIS, 
  SEVERITY_LEVELS, 
  COMMON_SYMPTOMS,
  mockMedicationLogs 
} from './mockData';
import { Symptom, MedicationLog } from './types';

export const TrackingScreen: React.FC = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  
  // State yönetimi
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [selectedMood, setSelectedMood] = useState<Symptom['mood'] | null>(null);
  const [severity, setSeverity] = useState<Symptom['severity']>(1);
  const [notes, setNotes] = useState('');
  const [medicationStatus, setMedicationStatus] = useState<Record<string, boolean>>({});
  
  // Kaydedilen veriler için state'ler
  const [savedSymptoms, setSavedSymptoms] = useState<Symptom[]>([]);
  const [savedMedicationLogs, setSavedMedicationLogs] = useState<MedicationLog[]>([]);

  // Semptom ekleme/çıkarma
  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  // Özel semptom ekleme
  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
      setCustomSymptom('');
    }
  };

  // İlaç durumu değiştirme
  const toggleMedicationStatus = (medicationId: string) => {
    setMedicationStatus(prev => ({
      ...prev,
      [medicationId]: !prev[medicationId]
    }));
  };

  // Semptom kaydetme
  const saveSymptomEntry = () => {
    if (selectedSymptoms.length === 0 || !selectedMood) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen en az bir semptom ve ruh halinizi seçiniz.",
        variant: "destructive"
      });
      return;
    }

    // Mock veri kaydetme - gerçek uygulamada Firebase'e kaydedilecek
    const newSymptom: Symptom = {
      id: `symptom-${Date.now()}`,
      patientId: 'patient-1',
      date: new Date(),
      symptoms: selectedSymptoms,
      severity,
      mood: selectedMood,
      notes: notes.trim() || undefined
    };

    console.log('Yeni semptom kaydı:', newSymptom);

    // Kaydedilen semptomları state'e ekle
    setSavedSymptoms(prev => [newSymptom, ...prev]);

    toast({
      title: "Kayıt Başarılı",
      description: "Semptom bilgileriniz başarıyla kaydedildi.",
    });

    // Formu temizle
    setSelectedSymptoms([]);
    setSelectedMood(null);
    setSeverity(1);
    setNotes('');
  };

  // İlaç kayıtlarını kaydetme
  const saveMedicationLogs = () => {
    const logs: MedicationLog[] = Object.entries(medicationStatus).map(([medicationId, taken]) => ({
      id: `log-${medicationId}-${Date.now()}`,
      medicationId,
      patientId: 'patient-1',
      takenAt: new Date(),
      taken
    }));

    console.log('İlaç kayıtları:', logs);

    // Kaydedilen ilaç kayıtlarını state'e ekle
    setSavedMedicationLogs(prev => [...prev, ...logs]);

    toast({
      title: "İlaç Kayıtları Güncellendi",
      description: "İlaç alım durumlarınız başarıyla kaydedildi.",
    });

    setMedicationStatus({});
  };

  const activeMedications = mockMedications.filter(med => med.isActive);

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      logout();
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Sağlık Takibi
        </h1>
        <p className="text-muted-foreground">
          Günlük semptom ve ilaç durumunuzu kaydedin
        </p>
      </div>

      <Tabs defaultValue="symptoms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="symptoms" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Semptomlar
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-2">
            <Pill className="w-4 h-4" />
            İlaçlar
          </TabsTrigger>
        </TabsList>

        {/* Semptom Takibi */}
        <TabsContent value="symptoms" className="space-y-6">
          {/* Ruh Hali Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bugün Nasıl Hissediyorsunuz?</CardTitle>
              <CardDescription>Ruh halinizi seçiniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MOOD_EMOJIS.map((mood) => (
                  <Button
                    key={mood.mood}
                    variant={selectedMood === mood.mood ? "default" : "outline"}
                    className="h-16 flex-col space-y-1"
                    onClick={() => setSelectedMood(mood.mood)}
                  >
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Semptom Seçimi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Yaşadığınız Semptomlar</CardTitle>
              <CardDescription>Bugün yaşadığınız semptomları seçiniz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {COMMON_SYMPTOMS.map((symptom) => (
                  <Button
                    key={symptom}
                    variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                    size="sm"
                    className="justify-start text-left h-auto py-2 px-3"
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {selectedSymptoms.includes(symptom) && (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {symptom}
                  </Button>
                ))}
              </div>

              {/* Özel Semptom Ekleme */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Başka bir semptom..."
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomSymptom()}
                />
                <Button
                  size="sm"
                  onClick={addCustomSymptom}
                  disabled={!customSymptom.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Seçili Semptomlar */}
              {selectedSymptoms.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Seçili Semptomlar:</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {symptom}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 ml-1"
                          onClick={() => toggleSymptom(symptom)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Şiddet Derecesi */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Şiddet Derecesi</CardTitle>
              <CardDescription>Semptomlarınızın şiddet derecesini belirleyiniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {SEVERITY_LEVELS.map((level) => (
                  <Button
                    key={level.level}
                    variant={severity === level.level ? "default" : "outline"}
                    className="h-16 flex-col space-y-1"
                    onClick={() => setSeverity(level.level)}
                  >
                    <span className="font-bold">{level.level}</span>
                    <span className="text-xs text-center">{level.label}</span>
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {SEVERITY_LEVELS.find(l => l.level === severity)?.description}
              </p>
            </CardContent>
          </Card>

          {/* Notlar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ek Notlar</CardTitle>
              <CardDescription>İsteğe bağlı detay bilgileri</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Semptomlarınız hakkında ek bilgiler (opsiyonel)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Kaydet Butonu */}
          <Button
            onClick={saveSymptomEntry}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Semptom Kaydını Kaydet
          </Button>

          {/* Kaydedilen Semptomlar */}
          {savedSymptoms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kaydedilen Semptomlar</CardTitle>
                <CardDescription>Bugün kaydettiğiniz semptomlar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedSymptoms.map((symptom) => (
                  <div key={symptom.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{MOOD_EMOJIS.find(m => m.mood === symptom.mood)?.emoji}</span>
                        <span className="text-sm font-medium">
                          {new Date(symptom.date).toLocaleDateString('tr-TR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <Badge variant="outline">
                        Şiddet: {symptom.severity}/5
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {symptom.symptoms.map((symptomName, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {symptomName}
                        </Badge>
                      ))}
                    </div>
                    
                    {symptom.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        "{symptom.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* İlaç Takibi */}
        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bugünkü İlaçlarım</CardTitle>
              <CardDescription>
                İlaçlarınızı aldınız mı? Durumunu işaretleyiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeMedications.length > 0 ? (
                activeMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`med-${medication.id}`}
                        checked={medicationStatus[medication.id] || false}
                        onCheckedChange={() => toggleMedicationStatus(medication.id)}
                      />
                      <div>
                        <Label 
                          htmlFor={`med-${medication.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {medication.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        {medication.instructions && (
                          <p className="text-xs text-muted-foreground italic">
                            {medication.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {medicationStatus[medication.id] ? (
                        <Badge variant="secondary" className="bg-health-success/20 text-health-success">
                          <Check className="w-3 h-3 mr-1" />
                          Alındı
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Beklemede
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aktif ilaç kaydınız bulunmamaktadır</p>
                </div>
              )}
            </CardContent>
          </Card>

          {Object.keys(medicationStatus).length > 0 && (
            <Button
              onClick={saveMedicationLogs}
              className="w-full bg-secondary hover:bg-secondary/90"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              İlaç Durumlarını Kaydet
            </Button>
          )}

          {/* Kaydedilen İlaç Kayıtları */}
          {savedMedicationLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kaydedilen İlaç Kayıtları</CardTitle>
                <CardDescription>Bugün kaydettiğiniz ilaç alım durumları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedMedicationLogs.map((log) => {
                  const medication = activeMedications.find(med => med.id === log.medicationId);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {log.taken ? (
                          <Check className="w-5 h-5 text-health-success" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{medication?.name || 'Bilinmeyen İlaç'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.takenAt).toLocaleDateString('tr-TR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={log.taken ? "secondary" : "outline"}>
                        {log.taken ? 'Alındı' : 'Alınmadı'}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};