import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, MapPin, User, Building, Phone, AlertCircle, CheckCircle, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { AppointmentBooking } from './types';
import { mockAppointmentBookings, mockHospitals, mockClinics } from './mockData';

const statusConfig = {
  confirmed: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: XCircle },
  completed: { label: 'Tamamlandı', color: 'bg-blue-100 text-blue-800', icon: CheckCircle }
};

interface AppointmentListScreenProps {
  onTabChange?: (tab: string) => void;
  onReschedule?: (booking: AppointmentBooking) => void;
  bookings?: AppointmentBooking[];
  onUpdateBookings?: (bookings: AppointmentBooking[]) => void;
}

export default function AppointmentListScreen({ 
  onTabChange, 
  onReschedule, 
  bookings: externalBookings,
  onUpdateBookings 
}: AppointmentListScreenProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<AppointmentBooking | null>(null);
  const [bookings, setBookings] = useState<AppointmentBooking[]>(
    externalBookings || mockAppointmentBookings
  );

  // External bookings değiştiğinde state'i güncelle
  useEffect(() => {
    if (externalBookings) {
      setBookings(externalBookings);
    }
  }, [externalBookings]);

  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.appointmentDate) > new Date() && booking.status !== 'cancelled'
  );

  const pastBookings = bookings.filter(booking => 
    new Date(booking.appointmentDate) <= new Date() || booking.status === 'cancelled'
  );

  const getHospitalName = (hospitalId: string) => {
    return mockHospitals.find(h => h.id === hospitalId)?.name || 'Bilinmeyen Hastane';
  };

  const getClinicName = (clinicId: string) => {
    return mockClinics.find(c => c.id === clinicId)?.name || 'Bilinmeyen Poliklinik';
  };

  const handleCancelBooking = (booking: AppointmentBooking) => {
    if (confirm('Bu randevuyu iptal etmek istediğinizden emin misiniz?')) {
      // Gerçek uygulamada API'ye iptal isteği gönderilir
      console.log('Randevu iptal edildi:', booking.id);
      
      // State'i güncelle
      const updatedBookings = bookings.map(b => 
        b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
      );
      
      setBookings(updatedBookings);
      onUpdateBookings?.(updatedBookings);
      
      alert('Randevu başarıyla iptal edildi.');
    }
  };

  const handleRescheduleBooking = (booking: AppointmentBooking) => {
    // Randevu değiştirme ekranına yönlendir
    console.log('Randevu değiştirilecek:', booking.id);
    
    // onReschedule prop'unu kullan
    onReschedule?.(booking);
  };

  const renderBookingCard = (booking: AppointmentBooking) => {
    const status = statusConfig[booking.status];
    const StatusIcon = status.icon;
    const isUpcoming = new Date(booking.appointmentDate) > new Date();

    return (
      <Card key={booking.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {new Date(booking.appointmentDate).toLocaleDateString('tr-TR')}
                </span>
                <Clock className="h-4 w-4 text-muted-foreground ml-4" />
                <span className="font-medium">{booking.appointmentTime}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getHospitalName(booking.hospitalId)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getClinicName(booking.clinicId)}</span>
                </div>
              </div>

              {booking.notes && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Not:</span> {booking.notes}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end space-y-2">
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>

              {isUpcoming && booking.status === 'confirmed' && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRescheduleBooking(booking)}
                  >
                    Değiştir
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelBooking(booking)}
                  >
                    İptal Et
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Randevularım</h1>
            <p className="text-muted-foreground">Tüm randevularınızı buradan yönetebilirsiniz</p>
          </div>
          <Button onClick={() => onTabChange?.('appointment-booking')}>
            <Calendar className="h-4 w-4 mr-2" />
            Yeni Randevu
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('upcoming')}
            className="flex-1"
          >
            Yaklaşan Randevular ({upcomingBookings.length})
          </Button>
          <Button
            variant={activeTab === 'past' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('past')}
            className="flex-1"
          >
            Geçmiş Randevular ({pastBookings.length})
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'upcoming' ? (
            upcomingBookings.length > 0 ? (
              upcomingBookings.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Yaklaşan Randevunuz Yok</h3>
                  <p className="text-muted-foreground mb-4">
                    Henüz bir randevunuz bulunmuyor. Yeni randevu almak için aşağıdaki butona tıklayın.
                  </p>
                  <Button onClick={() => onTabChange?.('appointment-booking')}>
                    Randevu Al
                  </Button>
                </CardContent>
              </Card>
            )
          ) : (
            pastBookings.length > 0 ? (
              pastBookings.map(renderBookingCard)
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Geçmiş Randevunuz Yok</h3>
                  <p className="text-muted-foreground">
                    Henüz tamamlanmış veya iptal edilmiş randevunuz bulunmuyor.
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Randevu İstatistikleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {upcomingBookings.filter(b => b.status === 'confirmed').length}
                </div>
                <div className="text-sm text-muted-foreground">Onaylı Randevu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {upcomingBookings.filter(b => b.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Bekleyen Randevu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {pastBookings.filter(b => b.status === 'completed').length}
                </div>
                <div className="text-sm text-muted-foreground">Tamamlanan Randevu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {pastBookings.filter(b => b.status === 'cancelled').length}
                </div>
                <div className="text-sm text-muted-foreground">İptal Edilen Randevu</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 