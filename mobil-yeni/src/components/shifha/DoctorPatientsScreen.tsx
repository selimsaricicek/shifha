/**
 * Doktor Hasta Listesi ve Hasta Detayları
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  User, 
  Phone, 
  MessageSquare,
  FileText,
  Calendar,
  Activity,
  AlertTriangle,
  Mail,
  MapPin,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  TestTube,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Send
} from 'lucide-react';
import { mockPatients } from './mockData';
import { Patient } from './types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

// SimpleChart bileşeni
const SimpleChart: React.FC<{ 
  data: { date: Date; value: number }[]; 
  referenceRange: { min: number; max: number };
  testName?: string;
}> = ({ data, referenceRange, testName }) => {
  if (data.length === 0) return null;

  const yAxisLabels = 5;
  const maxValue = Math.max(...data.map(d => d.value), referenceRange.max);
  const minValue = Math.min(...data.map(d => d.value), referenceRange.min);
  const range = maxValue - minValue;
  const padding = range * 0.2;
  const chartMax = Math.ceil(maxValue + padding);
  const chartMin = Math.floor(Math.max(0, minValue - padding));
  const chartRange = chartMax - chartMin;

  return (
    <div className="w-full bg-white rounded-lg p-4 font-sans">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <TestTube className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="font-semibold text-gray-800">{testName}</h3>
        </div>
        <div className="flex items-center">
          <button className="text-xs text-gray-500 font-medium px-3 py-1 rounded-md hover:bg-gray-100">AY</button>
          <button className="text-xs text-gray-500 font-medium px-3 py-1 rounded-md hover:bg-gray-100">YIL</button>
          <button className="text-gray-400 hover:text-gray-600 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative h-48">
        <svg className="w-full h-full" viewBox="0 0 500 150">
          {/* Y-axis labels and grid lines */}
          {[...Array(yAxisLabels)].map((_, i) => {
            const y = 130 - (i / (yAxisLabels - 1)) * 110;
            const value = chartMin + (i / (yAxisLabels - 1)) * chartRange;
            return (
              <g key={i}>
                <text x="0" y={y + 3} className="text-xs fill-gray-400" fontSize="10">
                  {Math.round(value)}
                </text>
                <line x1="30" y1={y} x2="500" y2={y} className="stroke-gray-200" strokeWidth="1" strokeDasharray="3,3" />
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => {
            const x = 40 + (index / (data.length - 1)) * 450;
            return (
              <text key={index} x={x} y="145" className="text-xs fill-gray-500" textAnchor="middle" fontSize="10">
                {format(point.date, 'MMM dd', { locale: tr })}
              </text>
            );
          })}

          {/* Data line */}
          <polyline
            fill="none"
            stroke="#00BCD4"
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = 40 + (index / (data.length - 1)) * 450;
              const y = 130 - ((point.value - chartMin) / chartRange) * 110;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = 40 + (index / (data.length - 1)) * 450;
            const y = 130 - ((point.value - chartMin) / chartRange) * 110;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#00BCD4"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-center items-center mt-4">
        <span className="flex items-center text-sm text-cyan-600">
          <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
          Değer
        </span>
      </div>
    </div>
  );
};

export const DoctorPatientsScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageText, setMessageText] = useState('');

  // Mock hasta verileri
  const patients = [
    {
      id: 1,
      name: 'Ayşe Demir',
      age: 67,
      tcNo: '12345678901',
      phone: '+90 532 123 4567',
      lastVisit: '2024-01-20',
      condition: 'Kalp Yetmezliği',
      priority: 'critical',
      avatar: null,
      bloodType: 'A+',
      allergies: ['Penicillin', 'Aspirin'],
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: '1x1' },
        { name: 'Metoprolol', dosage: '50mg', frequency: '2x1' }
      ],
      recentVitals: {
        bloodPressure: '160/95',
        heartRate: 95,
        temperature: 36.8,
        weight: 72,
        date: '2024-01-20'
      },
      labResults: [
        { name: 'Hemoglobin', value: 11.2, unit: 'g/dL', referenceRange: '12-15.5', status: 'low' },
        { name: 'Kreatinin', value: 1.8, unit: 'mg/dL', referenceRange: '0.6-1.2', status: 'high' }
      ]
    },
    {
      id: 2,
      name: 'Mehmet Kaya',
      age: 45,
      tcNo: '98765432109',
      phone: '+90 532 987 6543',
      lastVisit: '2024-01-18',
      condition: 'Tip 2 Diyabet',
      priority: 'urgent',
      avatar: null,
      bloodType: 'B+',
      allergies: ['Latex'],
      medications: [
        { name: 'Metformin', dosage: '500mg', frequency: '2x1' },
        { name: 'Insulin', dosage: '10 unit', frequency: 'Öğün öncesi' }
      ],
      recentVitals: {
        bloodSugar: 380,
        bloodPressure: '140/90',
        heartRate: 88,
        weight: 85,
        date: '2024-01-18'
      },
      labResults: [
        { name: 'HbA1c', value: 9.2, unit: '%', referenceRange: '<7', status: 'high' },
        { name: 'Açlık Şekeri', value: 380, unit: 'mg/dL', referenceRange: '70-110', status: 'critical' }
      ]
    },
    {
      id: 3,
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
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.tcNo.includes(searchTerm) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'urgent': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-medical-green text-white';
      default: return 'bg-muted text-muted-foreground';
    }
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
              ← Hasta Listesine Dön
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
                    Kronik kalp yetmezliği tedavisi devam ediyor. Düzenli kontrol gerekli.
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
            {selectedPatient.labResults.map((lab: any, index: number) => {
              // Her lab result için geçmiş veriler oluştur
               const generateHistoryData = (currentValue: number, count: number = 6) => {
                 const data = [];
                 const today = new Date();
                 let previousValue = currentValue;
                 
                 for (let i = count - 1; i >= 0; i--) {
                   const date = new Date(today);
                   date.setDate(date.getDate() - (i * 7)); // Her hafta bir veri
                   
                   // Daha gerçekçi trend oluştur
                   const trendFactor = Math.sin(i * 0.5) * 0.15; // Sinüs dalgası ile trend
                   const randomVariation = (Math.random() - 0.5) * 0.2; // %20 rastgele varyasyon
                   const smoothTransition = (previousValue - currentValue) * 0.1; // Önceki değere yumuşak geçiş
                   
                   const value = currentValue * (1 + trendFactor + randomVariation) + smoothTransition;
                   const finalValue = Math.max(0, value);
                   
                   data.push({ date, value: finalValue });
                   previousValue = finalValue;
                 }
                 
                 // Son değeri mevcut değere yaklaştır
                 data[data.length - 1].value = currentValue;
                 return data;
               };

              // Referans aralığını parse et
              const parseReferenceRange = (range: string) => {
                if (range.includes('-')) {
                  const [min, max] = range.split('-').map(s => parseFloat(s.trim()));
                  return { min: min || 0, max: max || 100 };
                } else if (range.includes('<')) {
                  const max = parseFloat(range.replace('<', '').trim());
                  return { min: 0, max };
                } else if (range.includes('>')) {
                  const min = parseFloat(range.replace('>', '').trim());
                  return { min, max: min * 2 };
                }
                return { min: 0, max: 100 };
              };

              const historyData = generateHistoryData(lab.value);
              const referenceRange = parseReferenceRange(lab.referenceRange);

              return (
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
                    
                    {/* Trend Grafiği */}
                    <div className="mt-4">
                      <SimpleChart 
                        data={historyData}
                        referenceRange={referenceRange}
                        testName={lab.name}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 to-medical-green/5 p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-medical-blue" />
            <span>Hasta Listesi</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Hasta adı, TC kimlik no veya tanı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hasta Listesi */}
      <div className="space-y-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={patient.avatar || undefined} />
                    <AvatarFallback className="bg-medical-blue/10 text-medical-blue">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{patient.name}</h3>
                      <Badge className={getPriorityColor(patient.priority)}>
                        {patient.priority === 'critical' ? 'KRİTİK' : 
                         patient.priority === 'urgent' ? 'ACİL' : 'NORMAL'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {patient.age} yaş • {patient.condition}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Son ziyaret: {patient.lastVisit}
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
                    <FileText className="w-4 h-4 mr-1" />
                    Detay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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