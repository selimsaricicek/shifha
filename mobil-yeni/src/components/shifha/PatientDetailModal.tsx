/**
 * Hasta Detay Modal Bileşeni
 * QR kod tarama sonrası hasta bilgilerini görüntüler
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Activity, 
  Thermometer,
  Weight,
  Ruler,
  Clock,
  AlertTriangle,
  ExternalLink,
  X
} from 'lucide-react';
import { QRCodeData } from './types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: QRCodeData | null;
}

// Mock hasta verisi - gerçek uygulamada API'den gelecek
const getMockPatientData = (patientId: string) => {
  return {
    id: patientId,
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    tcNo: '12345678901',
    dateOfBirth: '1985-03-15',
    gender: 'Erkek',
    phone: '+90 532 123 45 67',
    email: 'ahmet.yilmaz@email.com',
    address: 'Atatürk Mah. Cumhuriyet Cad. No:123 Kadıköy/İstanbul',
    bloodType: 'A+',
    height: 175,
    weight: 78,
    emergencyContact: {
      name: 'Fatma Yılmaz',
      relation: 'Eş',
      phone: '+90 532 987 65 43'
    },
    vitals: {
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 36.5,
      oxygenSaturation: 98
    },
    allergies: ['Penisilin', 'Fıstık'],
    chronicDiseases: ['Hipertansiyon'],
    currentMedications: [
      { name: 'Ramipril 5mg', dosage: '1x1', frequency: 'Günde 1 kez' },
      { name: 'Aspirin 100mg', dosage: '1x1', frequency: 'Günde 1 kez' }
    ],
    lastVisit: '2024-01-10',
    notes: 'Düzenli kontrol gereken hasta. Kan basıncı takibi önemli.'
  };
};

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  qrData
}) => {
  if (!qrData || qrData.type !== 'patient-access') {
    return null;
  }

  const patient = getMockPatientData(qrData.patientId);

  const handleOpenWebPanel = () => {
    // Gerçek uygulamada web panelde hasta detayını aç
    const webUrl = `https://shifha-doctor-panel.com/patients/${patient.id}`;
    window.open(webUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-bold text-medical-blue">
            Hasta Bilgileri
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Hasta Temel Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Kişisel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-medical-blue text-white text-lg">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{patient.firstName} {patient.lastName}</h3>
                  <p className="text-muted-foreground">TC: {patient.tcNo}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline">{patient.gender}</Badge>
                    <Badge variant="outline">{patient.bloodType}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Doğum Tarihi: {new Date(patient.dateOfBirth).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{patient.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vital Bulgular */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Vital Bulgular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Nabız</p>
                  <p className="font-semibold">{patient.vitals.heartRate} bpm</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Tansiyon</p>
                  <p className="font-semibold">{patient.vitals.bloodPressure} mmHg</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Thermometer className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Ateş</p>
                  <p className="font-semibold">{patient.vitals.temperature}°C</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">SpO2</p>
                  <p className="font-semibold">{patient.vitals.oxygenSaturation}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fiziksel Ölçümler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Fiziksel Ölçümler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Boy: {patient.height} cm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Kilo: {patient.weight} kg</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sağlık Durumu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alerjiler */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Alerjiler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="mr-2">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Kronik Hastalıklar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-orange-500" />
                  Kronik Hastalıklar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.chronicDiseases.map((disease, index) => (
                    <Badge key={index} variant="secondary" className="mr-2">
                      {disease}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mevcut İlaçlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Mevcut İlaçlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.currentMedications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{medication.name}</p>
                      <p className="text-sm text-muted-foreground">{medication.frequency}</p>
                    </div>
                    <Badge variant="outline">{medication.dosage}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Acil Durum İletişim */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-500" />
                Acil Durum İletişim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{patient.emergencyContact.name}</p>
                  <p className="text-sm text-muted-foreground">{patient.emergencyContact.relation}</p>
                </div>
                <Badge variant="outline">{patient.emergencyContact.phone}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Son Ziyaret ve Notlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Son Ziyaret ve Notlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Son Ziyaret: {new Date(patient.lastVisit).toLocaleDateString('tr-TR')}</span>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Doktor Notları:</p>
                  <p className="text-sm text-muted-foreground">{patient.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Kod Bilgileri */}
          <Card className="border-medical-blue">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-medical-blue">
                <Activity className="w-5 h-5" />
                QR Kod Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Oturum ID:</p>
                  <p className="font-mono">{qrData.sessionId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Oluşturulma:</p>
                  <p>{new Date(qrData.timestamp).toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Geçerlilik:</p>
                  <p>{new Date(qrData.expiresAt).toLocaleString('tr-TR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Durum:</p>
                  <Badge variant={new Date() < new Date(qrData.expiresAt) ? "default" : "destructive"}>
                    {new Date() < new Date(qrData.expiresAt) ? "Geçerli" : "Süresi Dolmuş"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aksiyon Butonları */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleOpenWebPanel} className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Web Panelde Aç
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};