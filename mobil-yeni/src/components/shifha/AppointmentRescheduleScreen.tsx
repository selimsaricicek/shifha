import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Clock, X, Calendar as CalendarIcon } from 'lucide-react';
import { AppointmentBooking, AppointmentSlot } from './types';
import { generateAppointmentSlots } from './mockData';

interface AppointmentRescheduleScreenProps {
  onTabChange?: (tab: string) => void;
  booking?: AppointmentBooking;
  onUpdateBooking?: (bookingId: string, newDate: Date, newTime: string) => void;
}

export default function AppointmentRescheduleScreen({ onTabChange, booking, onUpdateBooking }: AppointmentRescheduleScreenProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [loading, setLoading] = useState(false);

  // Seçilen tarih için müsait saatler
  useEffect(() => {
    if (selectedDate && booking) {
      setLoading(true);
      
      // Simüle edilmiş API çağrısı
      setTimeout(() => {
        const slots = generateAppointmentSlots(
          booking.doctorId,
          booking.clinicId,
          selectedDate,
          '09:00',
          '17:00',
          30
        );
        setAvailableSlots(slots.filter(slot => slot.isAvailable && !slot.isBooked));
        setLoading(false);
      }, 1000);
    }
  }, [selectedDate, booking]);

  const handleReschedule = () => {
    if (!selectedTime || !selectedDate || !booking) {
      return;
    }

    // Gerçek uygulamada API'ye randevu değiştirme isteği gönderilir
    console.log('Randevu değiştirildi:', {
      bookingId: booking.id,
      newDate: selectedDate,
      newTime: selectedTime
    });

    // State güncellemesi
    onUpdateBooking?.(booking.id, selectedDate, selectedTime);

    alert('Randevunuz başarıyla değiştirildi!');
    
    // Randevu listesi ekranına dön
    onTabChange?.('appointments');
  };

  if (!booking) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Randevu Bulunamadı</h1>
          <Button onClick={() => onTabChange?.('appointments')}>
            Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
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
              <h1 className="text-2xl font-bold">Randevu Değiştir</h1>
              <p className="text-muted-foreground">Yeni tarih ve saat seçin</p>
            </div>
          </div>
        </div>

        {/* Mevcut Randevu Bilgisi */}
        <Card>
          <CardHeader>
            <CardTitle>Mevcut Randevu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {new Date(booking.appointmentDate).toLocaleDateString('tr-TR')}
                </span>
                <Clock className="h-4 w-4 text-muted-foreground ml-4" />
                <span className="font-medium">{booking.appointmentTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Yeni Tarih Seçimi */}
        <Card>
          <CardHeader>
            <CardTitle>Yeni Tarih Seçin</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                // Bugünden önceki tarihleri devre dışı bırak
                return date < new Date();
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Yeni Saat Seçimi */}
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>Yeni Saat Seçin</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        {/* Onay Butonu */}
        {selectedDate && selectedTime && (
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => onTabChange?.('appointments')}
            >
              İptal
            </Button>
            <Button onClick={handleReschedule}>
              Randevuyu Değiştir
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 