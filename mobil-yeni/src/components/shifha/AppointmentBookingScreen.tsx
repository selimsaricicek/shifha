import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Clock, MapPin, Building, User, Calendar as CalendarIcon, X } from 'lucide-react';
import { 
  Province, 
  District, 
  Hospital, 
  Clinic, 
  Doctor, 
  AppointmentSlot, 
  AppointmentBooking 
} from './types';
import { 
  mockProvinces, 
  mockDistricts, 
  mockHospitals, 
  mockClinics, 
  mockDoctorSchedules,
  mockDoctors,
  mockAppointmentSlots,
  mockAppointmentBookings,
  generateAppointmentSlots
} from './mockData';

interface BookingStep {
  id: 'province' | 'district' | 'hospital' | 'clinic' | 'doctor' | 'date' | 'time' | 'confirm';
  title: string;
  description: string;
}

const bookingSteps: BookingStep[] = [
  { id: 'province', title: 'İl Seçimi', description: 'Randevu almak istediğiniz ili seçin' },
  { id: 'district', title: 'İlçe Seçimi', description: 'İlçeyi seçin' },
  { id: 'hospital', title: 'Hastane Seçimi', description: 'Hastaneyi seçin' },
  { id: 'clinic', title: 'Poliklinik Seçimi', description: 'Polikliniği seçin' },
  { id: 'doctor', title: 'Doktor Seçimi', description: 'Doktoru seçin' },
  { id: 'date', title: 'Tarih Seçimi', description: 'Randevu tarihini seçin' },
  { id: 'time', title: 'Saat Seçimi', description: 'Randevu saatini seçin' },
  { id: 'confirm', title: 'Onay', description: 'Randevu bilgilerini onaylayın' }
];

interface AppointmentBookingScreenProps {
  onTabChange?: (tab: string) => void;
  onUpdateBookings?: (bookings: AppointmentBooking[]) => void;
}

export default function AppointmentBookingScreen({ onTabChange, onUpdateBookings }: AppointmentBookingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtrelenmiş veriler
  const filteredDistricts = selectedProvince 
    ? mockDistricts.filter(d => d.provinceId === selectedProvince.id)
    : [];

  const filteredHospitals = selectedDistrict
    ? mockHospitals.filter(h => h.districtId === selectedDistrict.id)
    : [];

  const filteredClinics = selectedHospital
    ? mockClinics.filter(c => c.hospitalId === selectedHospital.id)
    : [];

  const filteredDoctors = selectedClinic
    ? mockDoctorSchedules
        .filter(schedule => schedule.clinicId === selectedClinic.id && schedule.isActive)
        .map(schedule => mockDoctors.find(d => d.id === schedule.doctorId))
        .filter(Boolean) as Doctor[]
    : [];

  // Tarih seçimi için müsait günler
  const getAvailableDates = () => {
    if (!selectedDoctor) return [];
    
    const dates: Date[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Doktorun çalıştığı günleri kontrol et
      const dayOfWeek = date.getDay();
      const hasSchedule = mockDoctorSchedules.some(s => 
        s.doctorId === selectedDoctor.id && 
        s.clinicId === selectedClinic?.id && 
        s.dayOfWeek === dayOfWeek &&
        s.isActive
      );
      
      if (hasSchedule) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  // Seçilen tarih için müsait saatler
  useEffect(() => {
    if (selectedDate && selectedDoctor && selectedClinic) {
      setLoading(true);
      
      // Simüle edilmiş API çağrısı
      setTimeout(() => {
        const slots = generateAppointmentSlots(
          selectedDoctor.id,
          selectedClinic.id,
          selectedDate,
          '09:00',
          '17:00',
          30
        );
        setAvailableSlots(slots.filter(slot => slot.isAvailable && !slot.isBooked));
        setLoading(false);
      }, 1000);
    }
  }, [selectedDate, selectedDoctor, selectedClinic]);

  const handleNext = () => {
    if (currentStep < bookingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedTime || !selectedDate || !selectedDoctor || !selectedClinic || !selectedHospital) {
      return;
    }

    const newBooking: AppointmentBooking = {
      id: `booking-${Date.now()}`,
      patientId: 'patient-1', // Gerçek uygulamada giriş yapmış kullanıcının ID'si
      doctorId: selectedDoctor.id,
      clinicId: selectedClinic.id,
      hospitalId: selectedHospital.id,
      appointmentSlotId: `slot-${selectedDoctor.id}-${selectedClinic.id}-${selectedDate.toISOString().split('T')[0]}-${selectedTime}`,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Yeni randevuyu bookings listesine ekle
    onUpdateBookings?.((prevBookings) => [newBooking, ...prevBookings]);

    // Gerçek uygulamada API'ye gönderilir
    console.log('Randevu oluşturuldu:', newBooking);
    alert('Randevunuz başarıyla oluşturuldu!');
    
    // Randevu listesi ekranına dön
    onTabChange?.('appointments');
  };

  const renderStepContent = () => {
    const step = bookingSteps[currentStep];

    switch (step.id) {
      case 'province':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProvinces.map((province) => (
                <Card 
                  key={province.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProvince?.id === province.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedProvince(province)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{province.name}</h3>
                        <p className="text-sm text-muted-foreground">Kod: {province.code}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'district':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDistricts.map((district) => (
                <Card 
                  key={district.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDistrict?.id === district.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDistrict(district)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">{district.name}</h3>
                        <p className="text-sm text-muted-foreground">Kod: {district.code}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'hospital':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHospitals.map((hospital) => (
                <Card 
                  key={hospital.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedHospital?.id === hospital.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{hospital.name}</h3>
                          <p className="text-sm text-muted-foreground">{hospital.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant={hospital.type === 'devlet' ? 'default' : 'secondary'}>
                          {hospital.type === 'devlet' ? 'Devlet' : hospital.type === 'özel' ? 'Özel' : 'Üniversite'}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{hospital.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'clinic':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClinics.map((clinic) => (
                <Card 
                  key={clinic.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedClinic?.id === clinic.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedClinic(clinic)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold">{clinic.name}</h3>
                        <p className="text-sm text-muted-foreground">{clinic.description}</p>
                      </div>
                      <Badge variant="outline">{clinic.specialty}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'doctor':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doctor) => (
                <Card 
                  key={doctor.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDoctor?.id === doctor.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Lisans:</span> {doctor.license}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Telefon:</span> {doctor.phone}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {doctor.specialization}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {mockDoctorSchedules.filter(s => s.doctorId === doctor.id && s.isActive).length} gün çalışıyor
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredDoctors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bu poliklinik için müsait doktor bulunmuyor</p>
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                const dayOfWeek = date.getDay();
                return !mockDoctorSchedules.some(s => 
                  s.doctorId === selectedDoctor?.id && 
                  s.clinicId === selectedClinic?.id && 
                  s.dayOfWeek === dayOfWeek &&
                  s.isActive
                );
              }}
              className="rounded-md border"
            />
          </div>
        );

      case 'time':
        return (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedTime === slot.time ? 'default' : 'outline'}
                    className="h-12"
                    onClick={() => setSelectedTime(slot.time)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Randevu Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Konum</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedProvince?.name} / {selectedDistrict?.name}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Hastane</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedHospital?.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Doktor</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedDoctor?.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tarih & Saat</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate?.toLocaleDateString('tr-TR')} - {selectedTime}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedProvince;
      case 1: return selectedDistrict;
      case 2: return selectedHospital;
      case 3: return selectedClinic;
      case 4: return selectedDoctor;
      case 5: return selectedDate;
      case 6: return selectedTime;
      case 7: return true;
      default: return false;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTabChange?.('appointments')}
              className="p-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Randevu Al</h1>
              <p className="text-muted-foreground">MHRS benzeri randevu sistemi</p>
            </div>
          </div>
          <Badge variant="outline">
            Adım {currentStep + 1} / {bookingSteps.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex space-x-2">
            {bookingSteps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className={`h-2 rounded-full transition-all ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`} />
              </div>
            ))}
          </div>
        </div>

        {/* Step Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{bookingSteps[currentStep].title}</span>
            </CardTitle>
            <p className="text-muted-foreground">{bookingSteps[currentStep].description}</p>
          </CardHeader>
        </Card>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>

          {currentStep === bookingSteps.length - 1 ? (
            <Button onClick={handleConfirmBooking} disabled={!canProceed()}>
              Randevu Oluştur
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              İleri
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 