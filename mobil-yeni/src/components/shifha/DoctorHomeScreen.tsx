/**
 * Doktor Ana Sayfa - Acil durumlar ve kritik hastalar
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Heart, 
  Activity, 
  Clock,
  Phone,
  MessageSquare,
  TrendingUp,
  Users,
  FileText,
  TestTube,
  Thermometer,
  Weight,
  Ruler,
  Send,
  X
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const DoctorHomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageText, setMessageText] = useState('');

  // Mock kritik hasta verileri
  const criticalPatients = [
    {
      id: 1,
      name: 'Ayşe Demir',
      age: 67,
      tcNo: '11223344558',
      phone: '+90 532 333 4455',
      lastVisit: '2024-01-20',
      condition: 'Kalp Yetmezliği',
      priority: 'critical',
      avatar: null,
      bloodType: 'AB+',
      allergies: ['Penicillin'],
      medications: [
        { name: 'Furosemide', dosage: '40mg', frequency: '1x1' },
        { name: 'Carvedilol', dosage: '25mg', frequency: '2x1' }
      ],
      recentVitals: {
        bloodPressure: '160/95',
        heartRate: 95,
        temperature: 36.8,
        weight: 72,
        date: '2024-01-20'
      },
      labResults: [
        { name: 'BNP', value: 850, unit: 'pg/mL', referenceRange: '<100', status: 'critical' },
        { name: 'Kreatinin', value: 1.8, unit: 'mg/dL', referenceRange: '0.6-1.2', status: 'high' }
      ]
    },
    {
      id: 2,
      name: 'Mehmet Kaya',
      age: 45,
      tcNo: '99887766555',
      phone: '+90 532 444 5566',
      lastVisit: '2024-01-20',
      condition: 'Diyabet Koması Riski',
      priority: 'urgent',
      avatar: null,
      bloodType: 'O-',
      allergies: [],
      medications: [
        { name: 'Insulin Glargine', dosage: '30 units', frequency: '1x1' },
        { name: 'Metformin', dosage: '1000mg', frequency: '2x1' }
      ],
      recentVitals: {
        bloodSugar: 380,
        bloodPressure: '140/90',
        heartRate: 88,
        temperature: 37.2,
        weight: 85,
        date: '2024-01-20'
      },
      labResults: [
        { name: 'Açlık Şekeri', value: 380, unit: 'mg/dL', referenceRange: '70-110', status: 'critical' },
        { name: 'HbA1c', value: 9.2, unit: '%', referenceRange: '<7', status: 'critical' }
      ]
    }
  ];

  const recentAlerts = [
    {
      id: 1,
      patient: 'Fatma Özkan',
      alert: 'Anormal kan değerleri',
      time: '10 dk önce',
      type: 'lab',
      details: {
        title: 'Laboratuvar Sonuçları Anormal',
        description: 'Hastanın LDL kolesterol değeri 165 mg/dL olarak ölçülmüştür. Normal değer aralığı 100 mg/dL altında olmalıdır.',
        severity: 'high',
        recommendations: [
          'Hasta ile iletişime geçilmesi önerilir',
          'Diyet değişikliği önerisi verilmeli',
          '2 hafta sonra tekrar kontrol edilmeli'
        ],
        labValues: [
          { name: 'LDL Kolesterol', value: '165 mg/dL', normal: '<100 mg/dL', status: 'high' },
          { name: 'HDL Kolesterol', value: '38 mg/dL', normal: '>40 mg/dL', status: 'low' }
        ]
      }
    },
    {
      id: 2,
      patient: 'Ali Yılmaz',
      alert: 'İlaç alamadı bildirimi',
      time: '25 dk önce',
      type: 'medication',
      details: {
        title: 'İlaç Tedavisi Kesintisi',
        description: 'Hasta Metformin ilacını alamadığını bildirmiştir. Eczane problemi yaşanmıştır.',
        severity: 'urgent',
        recommendations: [
          'Hasta ile acil iletişime geçilmeli',
          'Alternatif eczane önerisi verilmeli',
          'İlaç temini sağlanmalı'
        ],
        medicationInfo: {
          drug: 'Metformin 1000mg',
          frequency: 'Günde 2 kez',
          lastTaken: 'Dün akşam',
          reason: 'Eczane problemi'
        }
      }
    },
    {
      id: 3,
      patient: 'Zeynep Ak',
      alert: 'Yüksek tansiyon ölçümü',
      time: '1 saat önce',
      type: 'vitals',
      details: {
        title: 'Yüksek Tansiyon Uyarısı',
        description: 'Hastanın tansiyon ölçümü 155/98 mmHg olarak kaydedilmiştir. Normal değerlerin üzerindedir.',
        severity: 'medium',
        recommendations: [
          'Hasta ile iletişime geçilmeli',
          'Tuz alımını azaltması önerilmeli',
          '1 hafta sonra tekrar ölçüm yapılmalı'
        ],
        vitalSigns: {
          bloodPressure: '155/98 mmHg',
          normalRange: '120/80 mmHg',
          heartRate: '88 bpm',
          measurementTime: 'Bugün 14:30'
        }
      }
    }
  ];

  const todayStats = {
    totalPatients: 127,
    criticalCases: 3,
    pendingReviews: 8,
    appointments: 12
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'lab': return <Activity className="w-4 h-4" />;
      case 'medication': return <Clock className="w-4 h-4" />;
      case 'vitals': return <Heart className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Hasta detay verilerini oluştur
  const getPatientDetails = (patientName: string) => {
    const patientData = {
      'Fatma Özkan': {
        id: 1,
        name: 'Fatma Özkan',
        age: 34,
        tcNo: '11223344556',
        phone: '+90 532 111 2233',
        lastVisit: '2024-01-19',
        condition: 'Hipertansiyon',
        priority: 'normal',
        avatar: null,
        bloodType: 'O+',
        allergies: [],
        medications: [
          { name: 'Amlodipine', dosage: '5mg', frequency: '1x1' }
        ],
        recentVitals: {
          bloodPressure: '145/92',
          heartRate: 76,
          temperature: 36.5,
          weight: 68,
          date: '2024-01-19'
        },
        labResults: [
          { name: 'LDL Kolesterol', value: 165, unit: 'mg/dL', referenceRange: '<100', status: 'high' },
          { name: 'HDL Kolesterol', value: 38, unit: 'mg/dL', referenceRange: '>40', status: 'low' }
        ]
      },
      'Ali Yılmaz': {
        id: 2,
        name: 'Ali Yılmaz',
        age: 52,
        tcNo: '99887766554',
        phone: '+90 532 998 7766',
        lastVisit: '2024-01-17',
        condition: 'Tip 2 Diyabet',
        priority: 'urgent',
        avatar: null,
        bloodType: 'A-',
        allergies: ['Sulfa'],
        medications: [
          { name: 'Metformin', dosage: '1000mg', frequency: '2x1' },
          { name: 'Gliclazide', dosage: '80mg', frequency: '1x1' }
        ],
        recentVitals: {
          bloodSugar: 280,
          bloodPressure: '150/95',
          heartRate: 82,
          weight: 78,
          date: '2024-01-17'
        },
        labResults: [
          { name: 'HbA1c', value: 8.5, unit: '%', referenceRange: '<7', status: 'high' },
          { name: 'Açlık Şekeri', value: 280, unit: 'mg/dL', referenceRange: '70-110', status: 'critical' }
        ]
      },
      'Zeynep Ak': {
        id: 3,
        name: 'Zeynep Ak',
        age: 28,
        tcNo: '11223344557',
        phone: '+90 532 112 3344',
        lastVisit: '2024-01-18',
        condition: 'Hipertansiyon',
        priority: 'normal',
        avatar: null,
        bloodType: 'B+',
        allergies: [],
        medications: [
          { name: 'Losartan', dosage: '50mg', frequency: '1x1' }
        ],
        recentVitals: {
          bloodPressure: '155/98',
          heartRate: 88,
          temperature: 36.8,
          weight: 65,
          date: '2024-01-18'
        },
        labResults: [
          { name: 'Kreatinin', value: 0.9, unit: 'mg/dL', referenceRange: '0.6-1.2', status: 'normal' },
          { name: 'Üre', value: 25, unit: 'mg/dL', referenceRange: '7-20', status: 'high' }
        ]
      }
    };
    
    return patientData[patientName as keyof typeof patientData] || null;
  };

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'low': return 'text-orange-500';
      case 'normal': return 'text-medical-green';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-medical-green text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleCallClick = (patient: any) => {
    setSelectedPatientForAction(patient);
    setPhoneNumber(patient.phone);
    setShowCallModal(true);
  };

  const handleMessageClick = (patient: any) => {
    setSelectedPatientForAction(patient);
    setMessageText('');
    setShowMessageModal(true);
  };

  const handleCall = () => {
    // Telefon uygulamasını aç
    window.open(`tel:${phoneNumber}`, '_blank');
    setShowCallModal(false);
  };

  const handleSendMessage = () => {
    // Mesaj gönderme işlemi (gerçek uygulamada API çağrısı yapılır)
    console.log('Mesaj gönderildi:', {
      to: selectedPatientForAction?.phone,
      message: messageText
    });
    setShowMessageModal(false);
    setMessageText('');
  };

  if (selectedAlert) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 to-medical-green/5 p-4">
        {/* Bildirim Detay Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-medical-blue/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedAlert(null)}
              className="text-medical-blue"
            >
              ← Ana Sayfaya Dön
            </Button>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Hasta Ara
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Mesaj Gönder
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500/10 rounded-full text-orange-500">
              {getAlertIcon(selectedAlert.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-medical-blue">{selectedAlert.details.title}</h1>
                <Badge className={getSeverityColor(selectedAlert.details.severity)}>
                  {selectedAlert.details.severity === 'critical' ? 'KRİTİK' : 
                   selectedAlert.details.severity === 'urgent' ? 'ACİL' : 
                   selectedAlert.details.severity === 'high' ? 'YÜKSEK' :
                   selectedAlert.details.severity === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Hasta</p>
                  <p className="font-medium">{selectedAlert.patient}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bildirim Zamanı</p>
                  <p className="font-medium">{selectedAlert.time}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bildirim Türü</p>
                  <p className="font-medium">
                    {selectedAlert.type === 'lab' ? 'Laboratuvar' : 
                     selectedAlert.type === 'medication' ? 'İlaç' : 'Vital Bulgular'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bildirim Detay İçeriği */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{selectedAlert.details.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Öneriler</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedAlert.details.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-medical-blue rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {selectedAlert.type === 'lab' && selectedAlert.details.labValues && (
            <Card>
              <CardHeader>
                <CardTitle>Laboratuvar Değerleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedAlert.details.labValues.map((lab: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h3 className="font-semibold">{lab.name}</h3>
                        <p className="text-sm text-muted-foreground">Normal: {lab.normal}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getLabStatusColor(lab.status)}`}>
                          {lab.value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lab.status === 'high' ? 'Yüksek' : 
                           lab.status === 'low' ? 'Düşük' : 'Normal'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {selectedAlert.type === 'medication' && selectedAlert.details.medicationInfo && (
            <Card>
              <CardHeader>
                <CardTitle>İlaç Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">İlaç</p>
                    <p className="font-medium">{selectedAlert.details.medicationInfo.drug}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kullanım Sıklığı</p>
                    <p className="font-medium">{selectedAlert.details.medicationInfo.frequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Son Alınan</p>
                    <p className="font-medium">{selectedAlert.details.medicationInfo.lastTaken}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sebep</p>
                    <p className="font-medium">{selectedAlert.details.medicationInfo.reason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedAlert.type === 'vitals' && selectedAlert.details.vitalSigns && (
            <Card>
              <CardHeader>
                <CardTitle>Vital Bulgular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-medical-blue">
                      {selectedAlert.details.vitalSigns.bloodPressure}
                    </p>
                    <p className="text-sm text-muted-foreground">Tansiyon</p>
                    <p className="text-xs text-muted-foreground">Normal: {selectedAlert.details.vitalSigns.normalRange}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-medical-green">
                      {selectedAlert.details.vitalSigns.heartRate}
                    </p>
                    <p className="text-sm text-muted-foreground">Nabız</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground">
                      {selectedAlert.details.vitalSigns.measurementTime}
                    </p>
                    <p className="text-sm text-muted-foreground">Ölçüm Zamanı</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 to-medical-green/5 p-4">
        {/* Hasta Detay Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-medical-blue/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedPatient(null)}
              className="text-medical-blue"
            >
              ← Ana Sayfaya Dön
            </Button>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Ara
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Mesaj
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={selectedPatient.avatar || undefined} />
              <AvatarFallback className="bg-medical-blue/10 text-medical-blue text-lg">
                {selectedPatient.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-medical-blue">{selectedPatient.name}</h1>
                <Badge className={getPriorityColor(selectedPatient.priority)}>
                  {selectedPatient.priority === 'critical' ? 'KRİTİK' : 
                   selectedPatient.priority === 'urgent' ? 'ACİL' : 'NORMAL'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Yaş</p>
                  <p className="font-medium">{selectedPatient.age}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kan Grubu</p>
                  <p className="font-medium">{selectedPatient.bloodType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Telefon</p>
                  <p className="font-medium">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Son Ziyaret</p>
                  <p className="font-medium">{selectedPatient.lastVisit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hasta Detay Sekmeleri */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="vitals">Vital Bulgular</TabsTrigger>
            <TabsTrigger value="medications">İlaçlar</TabsTrigger>
            <TabsTrigger value="labs">Tahliller</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tanı ve Durum</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium mb-2">{selectedPatient.condition}</p>
                  <p className="text-muted-foreground">
                    Hasta durumu takip ediliyor. Düzenli kontrol gerekli.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alerjiler</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPatient.allergies.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.allergies.map((allergy: string, index: number) => (
                        <Badge key={index} variant="outline" className="mr-2">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Bilinen alerji yok</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Son Vital Bulgular</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-medical-blue">
                      {selectedPatient.recentVitals.bloodPressure}
                    </p>
                    <p className="text-sm text-muted-foreground">Tansiyon (mmHg)</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-medical-green">
                      {selectedPatient.recentVitals.heartRate}
                    </p>
                    <p className="text-sm text-muted-foreground">Nabız (bpm)</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-medical-blue">
                      {selectedPatient.recentVitals.temperature}°C
                    </p>
                    <p className="text-sm text-muted-foreground">Vücut Sıcaklığı</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-medical-green">
                      {selectedPatient.recentVitals.weight}
                    </p>
                    <p className="text-sm text-muted-foreground">Kilo (kg)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            {selectedPatient.medications.map((med: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} - {med.frequency}
                      </p>
                    </div>
                    <Badge variant="outline">Aktif</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="labs" className="space-y-4">
            {selectedPatient.labResults.map((lab: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{lab.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Referans: {lab.referenceRange} {lab.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getLabStatusColor(lab.status)}`}>
                        {lab.value} {lab.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lab.status === 'high' ? 'Yüksek' : 
                         lab.status === 'low' ? 'Düşük' : 
                         lab.status === 'critical' ? 'Kritik' : 'Normal'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 to-medical-green/5 p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-medical-blue/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-medical-blue">
              Merhaba, Dr. {user?.name}
            </h1>
            <p className="text-muted-foreground">
              Bugünkü hasta durumları ve acil bildirimler
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm font-medium text-medical-blue">
              {new Date().toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-medical-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-medical-blue" />
              <div>
                <p className="text-2xl font-bold text-medical-blue">{todayStats.totalPatients}</p>
                <p className="text-xs text-muted-foreground">Toplam Hasta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{todayStats.criticalCases}</p>
                <p className="text-xs text-muted-foreground">Kritik Durum</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-500">{todayStats.pendingReviews}</p>
                <p className="text-xs text-muted-foreground">İnceleme Bekleyen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-medical-green/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-medical-green" />
              <div>
                <p className="text-2xl font-bold text-medical-green">{todayStats.appointments}</p>
                <p className="text-xs text-muted-foreground">Bugünkü Randevu</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kritik Hastalar */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span>Kritik Hastalar</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criticalPatients.map((patient) => (
            <div key={patient.id} className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/10">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={patient.avatar || undefined} />
                  <AvatarFallback className="bg-destructive/10 text-destructive">
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{patient.name}</h3>
                    <Badge className={getPriorityColor(patient.priority)}>
                      {patient.priority === 'critical' ? 'KRİTİK' : 'ACİL'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.age} yaş • {patient.condition}
                  </p>
                                     <p className="text-xs text-muted-foreground">
                     Son vital: {patient.recentVitals?.date || 'Bilinmiyor'}
                   </p>
                </div>
              </div>
                             <div className="flex items-center space-x-2">
                 <Button 
                   size="sm" 
                   variant="outline"
                   onClick={() => handleCallClick(patient)}
                 >
                   <Phone className="w-4 h-4 mr-1" />
                   Ara
                 </Button>
                 <Button 
                   size="sm" 
                   variant="outline"
                   onClick={() => handleMessageClick(patient)}
                 >
                   <MessageSquare className="w-4 h-4 mr-1" />
                   Mesaj Gönder
                 </Button>
                 <Button 
                   size="sm" 
                   className="bg-blue-600 hover:bg-blue-700 text-white"
                   onClick={() => setSelectedPatient(patient)}
                 >
                   Detay
                 </Button>
               </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Son Bildirimler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-medical-blue" />
            <span>Son Bildirimler</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
                  {getAlertIcon(alert.type)}
                </div>
                <div>
                  <p className="font-medium">{alert.patient}</p>
                  <p className="text-sm text-muted-foreground">{alert.alert}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{alert.time}</p>
                                 <Button 
                   size="sm" 
                   className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                   onClick={() => setSelectedAlert(alert)}
                 >
                   İncele
                 </Button>
              </div>
            </div>
          ))}
                 </CardContent>
       </Card>

       {/* Arama Modal */}
       <Dialog open={showCallModal} onOpenChange={setShowCallModal}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center space-x-2">
               <Phone className="w-5 h-5 text-medical-blue" />
               <span>Hasta Ara</span>
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
               <Avatar className="w-10 h-10">
                 <AvatarImage src={selectedPatientForAction?.avatar || undefined} />
                 <AvatarFallback className="bg-medical-blue/10 text-medical-blue">
                   {selectedPatientForAction?.name?.split(' ').map((n: string) => n[0]).join('')}
                 </AvatarFallback>
               </Avatar>
               <div>
                 <p className="font-medium">{selectedPatientForAction?.name}</p>
                 <p className="text-sm text-muted-foreground">{selectedPatientForAction?.condition}</p>
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium">Telefon Numarası</label>
               <Input
                 value={phoneNumber}
                 onChange={(e) => setPhoneNumber(e.target.value)}
                 placeholder="Telefon numarası"
                 className="text-lg"
               />
             </div>

                           <div className="flex space-x-2">
                <Button 
                  onClick={handleCall}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ara
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCallModal(false)}
                >
                  İptal
                </Button>
              </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* Mesaj Modal */}
       <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center space-x-2">
               <MessageSquare className="w-5 h-5 text-medical-blue" />
               <span>Mesaj Gönder</span>
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
               <Avatar className="w-10 h-10">
                 <AvatarImage src={selectedPatientForAction?.avatar || undefined} />
                 <AvatarFallback className="bg-medical-blue/10 text-medical-blue">
                   {selectedPatientForAction?.name?.split(' ').map((n: string) => n[0]).join('')}
                 </AvatarFallback>
               </Avatar>
               <div>
                 <p className="font-medium">{selectedPatientForAction?.name}</p>
                 <p className="text-sm text-muted-foreground">{selectedPatientForAction?.phone}</p>
               </div>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium">Mesaj</label>
               <Textarea
                 value={messageText}
                 onChange={(e) => setMessageText(e.target.value)}
                 placeholder="Mesajınızı yazın..."
                 rows={4}
                 className="resize-none"
               />
             </div>

                           <div className="flex space-x-2">
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Gönder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMessageModal(false)}
                >
                  İptal
                </Button>
              </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 };