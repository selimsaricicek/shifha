import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Users, Stethoscope, Building, TrendingUp, AlertTriangle } from 'lucide-react';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const InteractiveMap = ({ selectedLayer = 'hospitals', onLocationClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Türkiye'nin başlıca şehirleri ve koordinatları
  const turkeyLocations = [
    {
      id: 1,
      city: 'İstanbul',
      lat: 41.0082,
      lng: 28.9784,
      hospitals: 45,
      doctors: 1250,
      patients: 25000,
      population: 15519267,
      region: 'Marmara',
      growth: '+12%',
      specialties: ['Kardiyoloji', 'Nöroloji', 'Onkoloji', 'Pediatri'],
      emergencyLevel: 'normal'
    },
    {
      id: 2,
      city: 'Ankara',
      lat: 39.9334,
      lng: 32.8597,
      hospitals: 32,
      doctors: 890,
      patients: 18000,
      population: 5663322,
      region: 'İç Anadolu',
      growth: '+8%',
      specialties: ['Dahiliye', 'Cerrahi', 'Göz Hastalıkları'],
      emergencyLevel: 'normal'
    },
    {
      id: 3,
      city: 'İzmir',
      lat: 38.4192,
      lng: 27.1287,
      hospitals: 28,
      doctors: 720,
      patients: 15000,
      population: 4394694,
      region: 'Ege',
      growth: '+15%',
      specialties: ['Kardiyoloji', 'Ortopedi', 'Dermatoloji'],
      emergencyLevel: 'high'
    },
    {
      id: 4,
      city: 'Bursa',
      lat: 40.1826,
      lng: 29.0665,
      hospitals: 22,
      doctors: 580,
      patients: 12000,
      population: 3194720,
      region: 'Marmara',
      growth: '+10%',
      specialties: ['Dahiliye', 'Pediatri'],
      emergencyLevel: 'normal'
    },
    {
      id: 5,
      city: 'Antalya',
      lat: 36.8969,
      lng: 30.7133,
      hospitals: 18,
      doctors: 420,
      patients: 9000,
      population: 2619832,
      region: 'Akdeniz',
      growth: '+18%',
      specialties: ['Turizm Tıbbı', 'Plastik Cerrahi'],
      emergencyLevel: 'normal'
    },
    {
      id: 6,
      city: 'Adana',
      lat: 37.0000,
      lng: 35.3213,
      hospitals: 16,
      doctors: 380,
      patients: 8500,
      population: 2258718,
      region: 'Akdeniz',
      growth: '+5%',
      specialties: ['Dahiliye', 'Cerrahi'],
      emergencyLevel: 'normal'
    },
    {
      id: 7,
      city: 'Konya',
      lat: 37.8667,
      lng: 32.4833,
      hospitals: 14,
      doctors: 320,
      patients: 7200,
      population: 2232374,
      region: 'İç Anadolu',
      growth: '+7%',
      specialties: ['Dahiliye', 'Ortopedi'],
      emergencyLevel: 'normal'
    },
    {
      id: 8,
      city: 'Gaziantep',
      lat: 37.0662,
      lng: 37.3833,
      hospitals: 12,
      doctors: 280,
      patients: 6800,
      population: 2154051,
      region: 'Güneydoğu Anadolu',
      growth: '+22%',
      specialties: ['Dahiliye', 'Pediatri'],
      emergencyLevel: 'critical'
    },
    {
      id: 9,
      city: 'Samsun',
      lat: 41.2928,
      lng: 36.3313,
      hospitals: 10,
      doctors: 240,
      patients: 5500,
      population: 1348542,
      region: 'Karadeniz',
      growth: '+3%',
      specialties: ['Dahiliye', 'Göz Hastalıkları'],
      emergencyLevel: 'normal'
    },
    {
      id: 10,
      city: 'Trabzon',
      lat: 41.0015,
      lng: 39.7178,
      hospitals: 8,
      doctors: 180,
      patients: 4200,
      population: 811901,
      region: 'Karadeniz',
      growth: '+1%',
      specialties: ['Dahiliye', 'Kardiyoloji'],
      emergencyLevel: 'normal'
    }
  ];

  // Marker renkleri ve boyutları
  const getMarkerStyle = (location) => {
    let color = '#3B82F6'; // Default blue
    let size = 'medium';

    switch (selectedLayer) {
      case 'hospitals':
        if (location.hospitals > 30) {
          color = '#EF4444'; // Red for high
          size = 'large';
        } else if (location.hospitals > 15) {
          color = '#F97316'; // Orange for medium
          size = 'medium';
        } else {
          color = '#22C55E'; // Green for low
          size = 'small';
        }
        break;
      case 'doctors':
        if (location.doctors > 800) {
          color = '#8B5CF6'; // Purple for high
          size = 'large';
        } else if (location.doctors > 400) {
          color = '#3B82F6'; // Blue for medium
          size = 'medium';
        } else {
          color = '#10B981'; // Emerald for low
          size = 'small';
        }
        break;
      case 'patients':
        if (location.patients > 20000) {
          color = '#DC2626'; // Dark red for high
          size = 'large';
        } else if (location.patients > 10000) {
          color = '#EA580C'; // Orange for medium
          size = 'medium';
        } else {
          color = '#059669'; // Green for low
          size = 'small';
        }
        break;
      case 'density':
        const density = (location.patients / location.population) * 100000;
        if (density > 1000) {
          color = '#991B1B'; // Very dark red
          size = 'large';
        } else if (density > 500) {
          color = '#DC2626'; // Dark red
          size = 'medium';
        } else {
          color = '#16A34A'; // Green
          size = 'small';
        }
        break;
      default:
        color = '#3B82F6';
        size = 'medium';
    }

    return { color, size };
  };

  // Custom marker oluşturma
  const createCustomMarker = (location) => {
    const { color, size } = getMarkerStyle(location);
    const sizeMap = { small: 20, medium: 30, large: 40 };
    const markerSize = sizeMap[size];

    const emergencyBorder = location.emergencyLevel === 'critical' ? '3px solid #DC2626' : 
                           location.emergencyLevel === 'high' ? '2px solid #F59E0B' : 'none';

    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${markerSize}px;
          height: ${markerSize}px;
          background-color: ${color};
          border: ${emergencyBorder};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
          <svg width="${markerSize * 0.6}" height="${markerSize * 0.6}" fill="white" viewBox="0 0 24 24">
            ${selectedLayer === 'hospitals' ? 
              '<path d="M12 2L13.09 8.26L22 9L17 14L18.18 22L12 19L5.82 22L7 14L2 9L10.91 8.26L12 2Z"/>' :
              selectedLayer === 'doctors' ?
              '<path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.1 14.1 11 13 11V22H11V16H9V22H7V11C5.9 11 5 10.1 5 9V7H3V9C3 11.2 4.8 13 7 13V22H17V13C19.2 13 21 11.2 21 9Z"/>' :
              '<path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z"/>'
            }
          </svg>
        </div>
      `,
      iconSize: [markerSize, markerSize],
      iconAnchor: [markerSize / 2, markerSize / 2],
      popupAnchor: [0, -markerSize / 2]
    });

    return customIcon;
  };

  // Popup içeriği oluşturma
  const createPopupContent = (location) => {
    const density = ((location.patients / location.population) * 100000).toFixed(1);
    
    return `
      <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="border-bottom: 2px solid #3B82F6; padding-bottom: 8px; margin-bottom: 12px;">
          <h3 style="margin: 0; color: #1F2937; font-size: 18px; font-weight: bold;">${location.city}</h3>
          <p style="margin: 4px 0 0 0; color: #6B7280; font-size: 14px;">${location.region} Bölgesi</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div style="background: #F3F4F6; padding: 8px; border-radius: 6px;">
            <div style="color: #3B82F6; font-weight: bold; font-size: 20px;">${location.hospitals}</div>
            <div style="color: #6B7280; font-size: 12px;">Hastane</div>
          </div>
          <div style="background: #F3F4F6; padding: 8px; border-radius: 6px;">
            <div style="color: #10B981; font-weight: bold; font-size: 20px;">${location.doctors}</div>
            <div style="color: #6B7280; font-size: 12px;">Doktor</div>
          </div>
          <div style="background: #F3F4F6; padding: 8px; border-radius: 6px;">
            <div style="color: #F59E0B; font-weight: bold; font-size: 20px;">${location.patients.toLocaleString()}</div>
            <div style="color: #6B7280; font-size: 12px;">Hasta</div>
          </div>
          <div style="background: #F3F4F6; padding: 8px; border-radius: 6px;">
            <div style="color: #8B5CF6; font-weight: bold; font-size: 20px;">${density}</div>
            <div style="color: #6B7280; font-size: 12px;">Yoğunluk/100K</div>
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="color: #374151; font-weight: 600; margin-bottom: 4px;">Büyüme Oranı</div>
          <div style="color: ${location.growth.startsWith('+') ? '#10B981' : '#EF4444'}; font-weight: bold;">
            ${location.growth}
          </div>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="color: #374151; font-weight: 600; margin-bottom: 4px;">Başlıca Uzmanlıklar</div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${location.specialties.map(specialty => 
              `<span style="background: #E5E7EB; color: #374151; padding: 2px 6px; border-radius: 12px; font-size: 11px;">${specialty}</span>`
            ).join('')}
          </div>
        </div>

        ${location.emergencyLevel !== 'normal' ? `
          <div style="background: ${location.emergencyLevel === 'critical' ? '#FEE2E2' : '#FEF3C7'}; 
                      border: 1px solid ${location.emergencyLevel === 'critical' ? '#FECACA' : '#FDE68A'}; 
                      padding: 8px; border-radius: 6px; margin-top: 8px;">
            <div style="color: ${location.emergencyLevel === 'critical' ? '#DC2626' : '#D97706'}; 
                        font-weight: 600; font-size: 12px;">
              ${location.emergencyLevel === 'critical' ? '🚨 Kritik Durum' : '⚠️ Yüksek Yoğunluk'}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Harita oluştur
    const map = L.map(mapRef.current, {
      center: [39.9334, 32.8597], // Türkiye merkezi (Ankara)
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true
    });

    // Tile layer ekle
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Markerları güncelle
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Eski markerları temizle
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Yeni markerları ekle
    turkeyLocations.forEach(location => {
      const marker = L.marker([location.lat, location.lng], {
        icon: createCustomMarker(location)
      });

      marker.bindPopup(createPopupContent(location), {
        maxWidth: 300,
        className: 'custom-popup'
      });

      marker.on('click', () => {
        setSelectedLocation(location);
        if (onLocationClick) {
          onLocationClick(location);
        }
      });

      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });
  }, [selectedLayer, onLocationClick]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
        className="shadow-md"
      />
      
      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border">
        <h4 className="font-semibold text-sm text-gray-800 mb-2">
          {selectedLayer === 'hospitals' ? 'Hastane Sayısı' :
           selectedLayer === 'doctors' ? 'Doktor Sayısı' :
           selectedLayer === 'patients' ? 'Hasta Sayısı' :
           'Hasta Yoğunluğu'}
        </h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Düşük</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>Orta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Yüksek</span>
          </div>
        </div>
      </div>

      {/* Emergency Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md border">
        <h4 className="font-semibold text-sm text-gray-800 mb-2">Acil Durum</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-red-600"></div>
            <span>Kritik</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-yellow-500"></div>
            <span>Yüksek</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;