/**
 * Doktor Randevu Bildirimleri ve Yönetimi
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  Bell, 
  CheckCircle,
  XCircle,
  Phone,
  MessageSquare,
  AlertTriangle,
  MapPin,
  User
} from 'lucide-react';

export const DoctorAppointmentsScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock randevu verileri
  const appointments = [
    {
      id: 1,
      patient: {
        name: 'Ayşe Demir',
        age: 67,
        phone: '+90 532 123 4567',
        avatar: null
      },
      date: '2024-01-25',
      time: '09:00',
      duration: 30,
      type: 'Kontrol',
      status: 'confirmed',
      notes: 'Kalp yetmezliği kontrol randevusu',
      priority: 'normal',
      location: 'Kardiyoloji Kliniği'
    },
    {
      id: 2,
      patient: {
        name: 'Mehmet Kaya',
        age: 45,
        phone: '+90 532 987 6543',
        avatar: null
      },
      date: '2024-01-25',
      time: '09:30',
      duration: 45,
      type: 'İlk Muayene',
      status: 'pending',
      notes: 'Diyabet ön tanısı, laboratuvar sonuçları ile gelecek',
      priority: 'urgent',
      location: 'Endokrinoloji Kliniği'
    },
    {
      id: 3,
      patient: {
        name: 'Fatma Özkan',
        age: 34,
        phone: '+90 532 111 2233',
        avatar: null
      },
      date: '2024-01-25',
      time: '10:15',
      duration: 30,
      type: 'Kontrol',
      status: 'confirmed',
      notes: 'Hipertansiyon ilaç dozu ayarlaması',
      priority: 'normal',
      location: 'Kardiyoloji Kliniği'
    },
    {
      id: 4,
      patient: {
        name: 'Ali Yılmaz',
        age: 28,
        phone: '+90 532 444 5566',
        avatar: null
      },
      date: '2024-01-25',
      time: '11:00',
      duration: 30,
      type: 'Acil',
      status: 'urgent',
      notes: 'Göğüs ağrısı şikayeti',
      priority: 'critical',
      location: 'Acil Servis'
    },
    {
      id: 5,
      patient: {
        name: 'Zeynep Ak',
        age: 52,
        phone: '+90 532 777 8888',
        avatar: null
      },
      date: '2024-01-25',
      time: '11:30',
      duration: 45,
      type: 'Kontrol',
      status: 'confirmed',
      notes: 'Tiroid fonksiyon testi sonuçları değerlendirmesi',
      priority: 'normal',
      location: 'Endokrinoloji Kliniği'
    },
    {
      id: 6,
      patient: {
        name: 'Hasan Aydın',
        age: 39,
        phone: '+90 532 999 0000',
        avatar: null
      },
      date: '2024-01-25',
      time: '12:00',
      duration: 30,
      type: 'İlk Muayene',
      status: 'pending',
      notes: 'Yüksek tansiyon şikayeti',
      priority: 'urgent',
      location: 'Kardiyoloji Kliniği'
    },
    {
      id: 7,
      patient: {
        name: 'Elif Yıldız',
        age: 29,
        phone: '+90 532 555 6666',
        avatar: null
      },
      date: '2024-01-25',
      time: '12:30',
      duration: 30,
      type: 'Kontrol',
      status: 'confirmed',
      notes: 'Gebelik takibi - 24. hafta',
      priority: 'normal',
      location: 'Kadın Doğum Kliniği'
    },
    {
      id: 8,
      patient: {
        name: 'Mustafa Özkan',
        age: 61,
        phone: '+90 532 333 4444',
        avatar: null
      },
      date: '2024-01-25',
      time: '13:00',
      duration: 45,
      type: 'Kontrol',
      status: 'confirmed',
      notes: 'Diyabet komplikasyonları kontrolü',
      priority: 'urgent',
      location: 'Endokrinoloji Kliniği'
    },
    {
      id: 9,
      patient: {
        name: 'Selin Demir',
        age: 23,
        phone: '+90 532 222 3333',
        avatar: null
      },
      date: '2024-01-25',
      time: '13:30',
      duration: 30,
      type: 'İlk Muayene',
      status: 'pending',
      notes: 'Baş dönmesi ve halsizlik şikayeti',
      priority: 'normal',
      location: 'Dahiliye Kliniği'
    },
    {
      id: 10,
      patient: {
        name: 'Ahmet Korkmaz',
        age: 48,
        phone: '+90 532 888 9999',
        avatar: null
      },
      date: '2024-01-25',
      time: '14:00',
      duration: 30,
      type: 'Kontrol',
      status: 'confirmed',
      notes: 'Kolesterol düşürücü ilaç kontrolü',
      priority: 'normal',
      location: 'Kardiyoloji Kliniği'
    },
    {
      id: 11,
      patient: {
        name: 'Meryem Çelik',
        age: 56,
        phone: '+90 532 666 7777',
        avatar: null
      },
      date: '2024-01-25',
      time: '14:30',
      duration: 45,
      type: 'Acil',
      status: 'urgent',
      notes: 'Şiddetli karın ağrısı',
      priority: 'critical',
      location: 'Acil Servis'
    },
    {
      id: 12,
      patient: {
        name: 'Burak Şahin',
        age: 31,
        phone: '+90 532 444 5555',
        avatar: null
      },
      date: '2024-01-25',
      time: '15:00',
      duration: 30,
      type: 'Kontrol',
      status: 'confirmed',
      notes: 'Astım kontrolü ve ilaç dozu ayarlaması',
      priority: 'normal',
      location: 'Göğüs Hastalıkları Kliniği'
    }
  ];

  // Mock bildirimler
  const notifications = [
    {
      id: 1,
      type: 'appointment_reminder',
      message: 'Ayşe Demir - 15 dakika sonra randevunuz',
      time: '8 dk önce',
      priority: 'normal'
    },
    {
      id: 2,
      type: 'appointment_cancelled',
      message: 'Hasan Aydın randevuyu iptal etti',
      time: '25 dk önce',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'emergency_appointment',
      message: 'Ali Yılmaz - Acil randevu talebi',
      time: '1 saat önce',
      priority: 'urgent'
    },
    {
      id: 4,
      type: 'late_patient',
      message: 'Zeynep Ak 20 dakika gecikme bildirdi',
      time: '2 saat önce',
      priority: 'normal'
    },
    {
      id: 5,
      type: 'appointment_reminder',
      message: 'Mehmet Kaya - 30 dakika sonra randevunuz',
      time: '35 dk önce',
      priority: 'normal'
    },
    {
      id: 6,
      type: 'emergency_appointment',
      message: 'Meryem Çelik - Acil servis randevu talebi',
      time: '1.5 saat önce',
      priority: 'urgent'
    },
    {
      id: 7,
      type: 'appointment_confirmed',
      message: 'Elif Yıldız randevusunu onayladı',
      time: '2 saat önce',
      priority: 'normal'
    },
    {
      id: 8,
      type: 'late_patient',
      message: 'Mustafa Özkan 15 dakika gecikme bildirdi',
      time: '3 saat önce',
      priority: 'normal'
    },
    {
      id: 9,
      type: 'appointment_reminder',
      message: 'Fatma Özkan - 1 saat sonra randevunuz',
      time: '4 saat önce',
      priority: 'normal'
    },
    {
      id: 10,
      type: 'emergency_appointment',
      message: 'Burak Şahin - Acil astım krizi şikayeti',
      time: '5 saat önce',
      priority: 'urgent'
    },
    {
      id: 11,
      type: 'appointment_cancelled',
      message: 'Selin Demir randevuyu iptal etti',
      time: '6 saat önce',
      priority: 'normal'
    },
    {
      id: 12,
      type: 'appointment_confirmed',
      message: 'Ahmet Korkmaz randevusunu onayladı',
      time: '1 gün önce',
      priority: 'normal'
    }
  ];

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-medical-green text-white';
      case 'pending': return 'bg-orange-500 text-white';
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-destructive';
      case 'urgent': return 'text-orange-500';
      case 'normal': return 'text-medical-blue';
      default: return 'text-muted-foreground';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_reminder': return <Clock className="w-4 h-4" />;
      case 'appointment_cancelled': return <XCircle className="w-4 h-4" />;
      case 'appointment_confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'emergency_appointment': return <AlertTriangle className="w-4 h-4" />;
      case 'late_patient': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Onaylandı';
      case 'pending': return 'Bekliyor';
      case 'urgent': return 'Acil';
      case 'cancelled': return 'İptal';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue/5 to-medical-green/5 p-4 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-medical-blue" />
              <span>Randevu Yönetimi</span>
            </div>
            <Badge className="bg-medical-blue text-white">
              {todayAppointments.length} Bugünkü Randevu
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Bugünkü Randevular</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="calendar">Takvim</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {/* Günlük Özet */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-medical-blue">
                  {todayAppointments.filter(apt => apt.status === 'confirmed').length}
                </div>
                <div className="text-sm text-muted-foreground">Onaylanmış</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-500">
                  {todayAppointments.filter(apt => apt.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Bekleyen</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {todayAppointments.filter(apt => apt.priority === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Acil</div>
              </CardContent>
            </Card>
          </div>

          {/* Randevu Listesi */}
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <Card key={appointment.id} className="border-l-4 border-l-medical-blue">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-medical-blue">
                          {appointment.time}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.duration} dk
                        </div>
                      </div>
                      
                      <Avatar>
                        <AvatarImage src={appointment.patient.avatar || undefined} />
                        <AvatarFallback className="bg-medical-blue/10 text-medical-blue">
                          {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">{appointment.patient.name}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                          {appointment.priority === 'critical' && (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {appointment.patient.age} yaş • {appointment.type}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {appointment.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.notes}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        Ara
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Mesaj
                      </Button>
                      {appointment.status === 'pending' && (
                        <Button size="sm" className="bg-medical-green hover:bg-medical-green/90">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Onayla
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-medical-blue" />
                <span>Son Bildirimler</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      notification.priority === 'urgent' ? 'bg-orange-500/10 text-orange-500' : 'bg-medical-blue/10 text-medical-blue'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div>
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-sm text-muted-foreground">{notification.time}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    İşaretle
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

                 <TabsContent value="calendar" className="space-y-4">
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center justify-between">
                 <span>Takvim Görünümü</span>
                 <div className="flex items-center space-x-4 text-sm">
                   <div className="flex items-center space-x-2">
                     <div className="w-3 h-3 bg-medical-blue rounded-full"></div>
                     <span>Normal Randevu</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                     <span>Bekleyen</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <div className="w-3 h-3 bg-destructive rounded-full"></div>
                     <span>Acil</span>
                   </div>
                 </div>
               </CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-4">
                 {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
                   <div key={day} className="p-2 text-muted-foreground">
                     {day}
                   </div>
                 ))}
               </div>
               
                               <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 5; // Mock günler
                    const dayString = day > 0 && day <= 31 ? `2024-01-${day.toString().padStart(2, '0')}` : '';
                    
                    // Rastgele randevu dağılımı için önceden tanımlanmış günler
                    const randomAppointmentDays = [3, 5, 8, 12, 15, 18, 20, 22, 25, 27, 29]; // Toplam 11 gün
                    const randomPendingDays = [7, 14, 21]; // 3 bekleyen
                    const randomUrgentDays = [10, 16]; // 2 acil
                    
                    let dayAppointments = [];
                    let hasAppointment = false;
                    let hasUrgent = false;
                    let hasPending = false;
                    
                    if (day > 0 && day <= 31) {
                      // Rastgele randevu dağılımı
                      if (randomAppointmentDays.includes(day)) {
                        dayAppointments = [
                          {
                            id: day * 10,
                            patient: { name: `Hasta ${day}`, age: 30 + (day % 20), phone: '+90 532 000 0000', avatar: null },
                            date: dayString,
                            time: `${9 + (day % 8)}:${(day % 4) * 15}`,
                            duration: 30,
                            type: 'Kontrol',
                            status: 'confirmed',
                            notes: 'Rutin kontrol randevusu',
                            priority: 'normal',
                            location: 'Genel Poliklinik'
                          }
                        ];
                        hasAppointment = true;
                      } else if (randomPendingDays.includes(day)) {
                        dayAppointments = [
                          {
                            id: day * 10 + 1,
                            patient: { name: `Hasta ${day}`, age: 25 + (day % 15), phone: '+90 532 000 0000', avatar: null },
                            date: dayString,
                            time: `${10 + (day % 6)}:${(day % 3) * 20}`,
                            duration: 45,
                            type: 'İlk Muayene',
                            status: 'pending',
                            notes: 'Bekleyen randevu',
                            priority: 'normal',
                            location: 'Genel Poliklinik'
                          }
                        ];
                        hasAppointment = true;
                        hasPending = true;
                      } else if (randomUrgentDays.includes(day)) {
                        dayAppointments = [
                          {
                            id: day * 10 + 2,
                            patient: { name: `Hasta ${day}`, age: 40 + (day % 10), phone: '+90 532 000 0000', avatar: null },
                            date: dayString,
                            time: `${8 + (day % 4)}:${(day % 2) * 30}`,
                            duration: 60,
                            type: 'Acil',
                            status: 'urgent',
                            notes: 'Acil randevu',
                            priority: 'critical',
                            location: 'Acil Servis'
                          }
                        ];
                        hasAppointment = true;
                        hasUrgent = true;
                      }
                    }
                    
                    let appointmentColor = '';
                    if (hasUrgent) {
                      appointmentColor = 'bg-destructive';
                    } else if (hasPending) {
                      appointmentColor = 'bg-orange-500';
                    } else if (hasAppointment) {
                      appointmentColor = 'bg-medical-blue';
                    }
                    
                    return (
                      <div
                        key={i}
                        className={`
                          aspect-square p-2 text-center text-sm rounded-lg cursor-pointer relative
                          ${day > 0 && day <= 31 ? 'hover:bg-medical-blue/10' : 'text-muted-foreground'}
                          ${hasAppointment ? 'bg-medical-blue/5' : ''}
                        `}
                      >
                        {day > 0 && day <= 31 ? day : ''}
                        {hasAppointment && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                            <div className={`w-2 h-2 ${appointmentColor} rounded-full`}></div>
                          </div>
                        )}
                        {dayAppointments.length > 1 && (
                          <div className="absolute top-1 right-1">
                            <div className="w-4 h-4 bg-medical-blue text-white text-xs rounded-full flex items-center justify-center">
                              {dayAppointments.length}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
               
               {/* Haftalık Özet */}
               <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                 <h4 className="font-medium mb-3">Bu Hafta Özeti</h4>
                 <div className="grid grid-cols-3 gap-4 text-sm">
                   <div className="text-center">
                     <div className="text-lg font-bold text-medical-blue">24</div>
                     <div className="text-muted-foreground">Toplam Randevu</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-orange-500">3</div>
                     <div className="text-muted-foreground">Bekleyen</div>
                   </div>
                   <div className="text-center">
                     <div className="text-lg font-bold text-destructive">2</div>
                     <div className="text-muted-foreground">Acil</div>
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>

           
         </TabsContent>
      </Tabs>
    </div>
  );
};