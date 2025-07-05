import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from 'lucide-react';

const Calendar = ({ appointments = [], onDateSelect, onAppointmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Ayın ilk günü ve son günü
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Takvimin başlangıç ve bitiş günleri (önceki ayın son günleri + sonraki ayın ilk günleri dahil)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
  
  const endDate = new Date(lastDayOfMonth);
  endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

  // Ay isimleri
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Gün isimleri
  const dayNames = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

  // Takvim günlerini oluştur
  const generateCalendarDays = () => {
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Belirli bir günün randevularını getir
  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  // Önceki ay
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Sonraki ay
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Bugün
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Gün seçimi
  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Günün bugün olup olmadığını kontrol et
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Günün seçili olup olmadığını kontrol et
  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Günün bu ayın günü olup olmadığını kontrol et
  const isCurrentMonth = (date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Takvim Başlığı */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <CalendarIcon className="h-6 w-6 text-cyan-600" />
          <h2 className="text-xl font-bold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors text-sm font-medium"
          >
            Bugün
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Gün İsimleri */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Takvim Günleri */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day);
          const hasAppointments = dayAppointments.length > 0;
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-all duration-200
                ${isToday(day) ? 'bg-cyan-50 border-cyan-300' : ''}
                ${isSelected(day) ? 'bg-cyan-100 border-cyan-400 ring-2 ring-cyan-200' : ''}
                ${!isCurrentMonth(day) ? 'text-gray-400 bg-gray-50' : 'text-gray-800'}
                ${hasAppointments ? 'bg-blue-50 border-blue-300' : ''}
                hover:bg-gray-50 hover:border-gray-300
              `}
            >
              {/* Gün Numarası */}
              <div className="text-sm font-medium mb-1">
                {day.getDate()}
              </div>
              
              {/* Randevular */}
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map((apt, aptIndex) => (
                  <div
                    key={aptIndex}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAppointmentClick) onAppointmentClick(apt);
                    }}
                    className={`
                      text-xs p-1 rounded cursor-pointer transition-colors
                      ${apt.urgency === 'acil' 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }
                    `}
                    title={`${apt.time} - ${apt.patientName} (${apt.type})`}
                  >
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span className="truncate">{apt.time}</span>
                    </div>
                    <div className="truncate font-medium">{apt.patientName}</div>
                  </div>
                ))}
                
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - 2} daha
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seçili Gün Detayları */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">
            {selectedDate.toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {getAppointmentsForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getAppointmentsForDate(selectedDate).map((apt, index) => (
                <div
                  key={index}
                  onClick={() => onAppointmentClick && onAppointmentClick(apt)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${apt.urgency === 'acil' 
                      ? 'bg-red-100 border border-red-200 hover:bg-red-200' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-full
                        ${apt.urgency === 'acil' ? 'bg-red-200' : 'bg-blue-200'}
                      `}>
                        <User className={`h-4 w-4 ${apt.urgency === 'acil' ? 'text-red-600' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{apt.patientName}</div>
                        <div className="text-sm text-gray-600">{apt.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-800">{apt.time}</div>
                      <div className={`
                        text-xs px-2 py-1 rounded-full
                        ${apt.urgency === 'acil' 
                          ? 'bg-red-200 text-red-800' 
                          : 'bg-blue-200 text-blue-800'
                        }
                      `}>
                        {apt.urgency === 'acil' ? 'Acil' : 'Normal'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Bu gün için planlanmış randevu bulunmamaktadır.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar; 