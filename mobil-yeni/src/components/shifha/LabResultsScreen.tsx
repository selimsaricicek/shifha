// LabResultsScreen.tsx
// Hasta tahlil sonuçları ekranı - Her değer için grafik ve motivasyon mesajları ile

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  Filter,
  RefreshCw,
  LogOut,
  Play,
  Heart,
  Info
} from 'lucide-react';
import { mockLabResults } from './mockData';
import { LabResult } from './types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from './hooks/useAuth';
import { labAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

// Kan tahlili referans aralıkları
const bloodTestReferenceRanges: Record<string, { min: number; max: number; unit: string }> = {
  hemoglobin: { min: 12.0, max: 16.0, unit: 'g/dL' },
  hematokrit: { min: 36.0, max: 46.0, unit: '%' },
  eritrosit: { min: 4.2, max: 5.4, unit: 'M/μL' },
  lökosit: { min: 4.5, max: 11.0, unit: 'K/μL' },
  trombosit: { min: 150, max: 450, unit: 'K/μL' },
  glukoz: { min: 70, max: 100, unit: 'mg/dL' },
  kreatinin: { min: 0.6, max: 1.2, unit: 'mg/dL' },
  üre: { min: 15, max: 45, unit: 'mg/dL' },
  total_kolesterol: { min: 0, max: 200, unit: 'mg/dL' },
  ldl_kolesterol: { min: 0, max: 100, unit: 'mg/dL' },
  hdl_kolesterol: { min: 40, max: 60, unit: 'mg/dL' },
  trigliserit: { min: 0, max: 150, unit: 'mg/dL' },
  alanin_aminotransferaz: { min: 7, max: 56, unit: 'U/L' },
  aspartat_aminotransferaz: { min: 10, max: 40, unit: 'U/L' },
  tsh: { min: 0.27, max: 4.2, unit: 'μIU/mL' },
  vitamin_d: { min: 30, max: 100, unit: 'ng/mL' },
  vitamin_b12: { min: 200, max: 900, unit: 'pg/mL' },
  hba1c: { min: 4.0, max: 5.6, unit: '%' }
};

// Backend verilerini LabResult formatına dönüştürme
const convertBackendDataToLabResults = (backendData: any[]): LabResult[] => {
  return backendData.map(item => {
    const testKey = item.test_name?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
    const referenceRange = bloodTestReferenceRanges[testKey] || { min: 0, max: 100, unit: item.unit || '' };
    
    let status: LabResult['status'] = 'normal';
    const value = parseFloat(item.value);
    
    if (value < referenceRange.min) {
      status = 'low';
    } else if (value > referenceRange.max) {
      status = 'high';
    }
    
    // Kritik değerler için özel kontrol
    if (testKey === 'glukoz' && (value < 50 || value > 250)) {
      status = 'critical';
    } else if (testKey === 'hemoglobin' && (value < 8 || value > 20)) {
      status = 'critical';
    }
    
    return {
      id: item.id || Math.random().toString(),
      patientId: item.patient_id || '',
      testName: item.test_name || 'Bilinmeyen Test',
      testCode: item.test_code || '',
      value: value,
      unit: item.unit || referenceRange.unit,
      referenceRange: referenceRange,
      date: new Date(item.date || Date.now()),
      status: status,
      category: item.category || 'blood',
      labName: item.lab_name || '',
      doctorNotes: item.doctor_notes || ''
    };
  });
};

// Test adını formatla
const formatTestName = (testKey: string): string => {
  const nameMap: Record<string, string> = {
    hemoglobin: 'Hemoglobin',
    hematokrit: 'Hematokrit',
    eritrosit: 'Eritrosit',
    lökosit: 'Lökosit',
    trombosit: 'Trombosit',
    glukoz: 'Glukoz',
    kreatinin: 'Kreatinin',
    üre: 'Üre',
    total_kolesterol: 'Total Kolesterol',
    ldl_kolesterol: 'LDL Kolesterol',
    hdl_kolesterol: 'HDL Kolesterol',
    trigliserit: 'Trigliserit',
    hba1c: 'HbA1c'
  };
  
  return nameMap[testKey] || testKey;
};

// Motivasyon mesajı oluşturma fonksiyonu
const getMotivationMessage = (testName: string, status: LabResult['status'], value: number, referenceRange: { min: number; max: number }): string => {
  const testKey = testName.toLowerCase().replace(/\s+/g, '_');
  
  const messages: Record<string, Record<string, string>> = {
    hemoglobin: {
      normal: "🌟 Harika! Hemoglobin değeriniz mükemmel aralıkta. Kan taşıma kapasitiniz optimal seviyede. Sağlıklı yaşam tarzınızın meyvelerini topluyorsunuz! 💪",
      high: "🔍 Hemoglobin değeriniz referans aralığının üzerinde. Bol su tüketimi ve düzenli doktor kontrolü ile dengeleyebilirsiniz. Endişelenmeyin, kontrol altına alınabilir! 💧",
      low: "🍎 Hemoglobin seviyeniz düşük ama pes etmeyin! Demir açısından zengin besinler (kırmızı et, ıspanak, mercimek) tüketerek güçlenebilirsiniz. Her adım bir iyileşme! 🌱",
      critical: "⚡ Hemoglobin değeriniz acil müdahale gerektiriyor. Hemen doktorunuzla iletişime geçin. Sağlığınız bizim önceliğimiz, geç kalmayın! 🏥"
    },
    glukoz: {
      normal: "🎯 Mükemmel! Kan şeker seviyeniz ideal aralıkta. Metabolizmanız dengede çalışıyor. Bu başarıyı korumak için sağlıklı beslenmeye devam edin! ✨",
      high: "🏃‍♂️ Kan şekeriniz yüksek ama panik yok! Düzenli yürüyüş, az şekerli beslenme ve porsiyon kontrolü ile normale döndürebilirsiniz. Siz yapabilirsiniz! 💪",
      low: "🥗 Kan şekeriniz düşük. Düzenli aralıklarla sağlıklı atıştırmalıklar tüketin. Vücudunuzun enerjiye ihtiyacı var, onu dinleyin! 🔋",
      critical: "🚨 Kan şekeriniz kritik seviyede! Acil tıbbi müdahale gerekli. Hemen en yakın sağlık kuruluşuna başvurun. Zaman çok değerli! ⏰"
    },
    hba1c: {
      normal: "🏆 Fantastik! HbA1c değeriniz mükemmel. Son 3 aylık kan şeker ortalamanız ideal seviyede. Disiplininizin karşılığını alıyorsunuz! 🌟",
      high: "📈 HbA1c değeriniz yüksek ama umut var! Küçük adımlarla büyük değişimler yaratabilirsiniz. Her gün yeni bir başlangıç! 🌅",
      low: "💎 HbA1c değeriniz düşük - bu harika bir durum! Kan şeker kontrolünüz mükemmel. Bu başarıyı korumaya devam edin! 🎉",
      critical: "⚠️ HbA1c değeriniz kritik yükseklikte. Diyabet uzmanı ile acil görüşme gerekli. Sağlığınız için hemen harekete geçin! 🏥"
    },
    kreatinin: {
      normal: "💧 Mükemmel! Böbrek fonksiyonlarınız optimal seviyede. Su içme alışkanlığınız ve sağlıklı yaşamınız meyvelerini veriyor! 🌿",
      high: "🥤 Kreatinin seviyeniz yüksek. Günde 2-3 litre su için, tuz ve protein alımını azaltın. Böbrekleriniz size minnettarlık duyacak! 💚",
      low: "✨ Kreatinin değeriniz düşük - bu genellikle pozitif bir durum! Kas kütleniz ve böbrek fonksiyonlarınız dengede. Böyle devam! 💪",
      critical: "🆘 Kreatinin değeriniz kritik seviyede! Böbrek fonksiyonlarınız tehlikede. Acil nefroloji konsültasyonu gerekli! ⚡"
    },
    eritrosit: {
      normal: "🔴 Harika! Kırmızı kan hücreleriniz mükemmel durumda. Oksijen taşıma sisteminiz optimal çalışıyor. Vücudunuz size teşekkür ediyor! 🌬️",
      high: "📊 Eritrosit sayınız referans değerinin üzerinde. Hidrasyon önemli - bol su için ve doktor kontrolünden geçin. Dengelenebilir! 💧",
      low: "🥩 Eritrosit sayınız düşük ama endişe yok! Demir, B12 ve folat açısından zengin besinlerle güçlenebilirsiniz. Sabır ve doğru beslenme anahtarı! 🗝️",
      critical: "🆘 Eritrosit sayınız kritik seviyede! Anemi riski var. Acil hematoloji konsültasyonu gerekli. Hemen doktorunuza başvurun! ⚡"
    },
    lökosit: {
      normal: "🛡️ Mükemmel! Bağışıklık ordunuz tam güçte. Lökosit sayınız ideal seviyede. Vücudunuz hastalıklara karşı hazır! 💪",
      high: "🔥 Lökosit sayınız yüksek - vücudunuz savaşçı modunda! Enfeksiyon veya inflamasyon olabilir. Dinlenin ve doktor kontrolünden geçin. 🏥",
      low: "🌱 Lökosit sayınız düşük. Bağışıklığınızı güçlendirme zamanı! Vitamin C, D ve çinko alın, bol uyuyun. Vücudunuz toparlanacak! 😴",
      critical: "⚡ Lökosit sayınız kritik derecede düşük! Bağışıklık sisteminiz tehlikede. Acil immünoloji konsültasyonu şart! 🚨"
    },
    üre: {
      normal: "✅ Harika! Üre seviyeniz normal aralıkta. Böbrek fonksiyonlarınız ve protein metabolizmanız mükemmel çalışıyor! 🌟",
      high: "🥩 Üre değeriniz yüksek. Protein alımını azaltın, bol su için ve böbreklerinizi dinlendirin. Onlar sizin filtreleme kahramanlarınız! 💧",
      low: "💚 Üre değeriniz düşük - bu genellikle iyi haber! Protein metabolizmanız dengede. Sağlıklı beslenmenizi sürdürün! 🥗",
      critical: "🆘 Üre değeriniz kritik yükseklikte! Böbrek fonksiyonları tehlikede. Acil nefroloji müdahalesi gerekli! ⚡"
    },
    tsh: {
      normal: "🦋 Mükemmel! Tiroid hormonunuz ideal seviyede. Metabolik dengeniz harika - enerji seviyeniz optimal! ⚡",
      high: "🐌 TSH değeriniz yüksek - tiroidiniz biraz yavaş çalışıyor. İyot açısından zengin besinler tüketin ve endokrinoloji kontrolü yaptırın! 🌊",
      low: "🚀 TSH değeriniz düşük - tiroidiniz hızlı çalışıyor! Kalp çarpıntısı varsa dikkat edin. Doktor kontrolü önemli! 💓",
      critical: "⚠️ TSH değeriniz kritik seviyede! Tiroid fonksiyonları ciddi şekilde etkilenmiş. Acil endokrinoloji konsültasyonu şart! 🏥"
    },
    trigliserit: {
      normal: "💚 Fantastik! Trigliserit seviyeniz ideal aralıkta. Kalp ve damar sağlığınız mükemmel durumda. Bu başarıyı koruyun! ❤️",
      high: "🏃‍♂️ Trigliserit değeriniz yüksek ama panik yok! Düzenli yürüyüş, balık tüketimi ve şeker kısıtlaması ile düşürebilirsiniz. Kalbiniz size teşekkür edecek! 🐟",
      low: "✨ Trigliserit değeriniz düşük - bu kalp sağlığınız için harika haber! Sağlıklı yaşam tarzınızın mükemmel sonucu! 🌟",
      critical: "🚨 Trigliserit değeriniz kritik yükseklikte! Kalp krizi riski var. Acil kardiyoloji konsültasyonu ve yaşam tarzı değişikliği şart! ⚡"
    },
    alanin_aminotransferaz: {
      normal: "💚 Mükemmel! ALT değeriniz normal seviyede. Karaciğeriniz - vücudunuzun laboratuvarı - harika çalışıyor! 🧪",
      high: "🍃 ALT değeriniz yüksek - karaciğeriniz biraz yorgun. Alkol ve yağlı yiyecekleri azaltın, yeşil çay için. Karaciğeriniz kendini yenileyecek! 🌿",
      low: "✅ ALT değeriniz düşük - karaciğer sağlığınız için pozitif bir işaret! Sağlıklı yaşam tarzınızı sürdürün! 💪",
      critical: "🆘 ALT değeriniz kritik yükseklikte! Karaciğer hasarı riski var. Acil hepatoloji konsültasyonu ve detoks gerekli! ⚡"
    },
    aspartat_aminotransferaz: {
      normal: "💎 Harika! AST değeriniz mükemmel aralıkta. Karaciğer ve kalp sağlığınız optimal seviyede. İkili koruma aktif! ❤️🫀",
      high: "🌿 AST değeriniz yüksek - karaciğer veya kalp biraz stresli olabilir. Sağlıklı beslenme ve egzersizle düzelebilir. Organlarınız size güveniyor! 💪",
      low: "🌟 AST değeriniz düşük - bu genellikle mükemmel bir durum! Organ sağlığınız için pozitif işaret! ✨",
      critical: "⚡ AST değeriniz kritik yükseklikte! Kalp veya karaciğer hasarı riski var. Acil kardiyoloji/hepatoloji konsültasyonu şart! 🚨"
    }
  };
  
  const testMessages = messages[testKey];
  if (testMessages && testMessages[status]) {
    return testMessages[status];
  }
  
  // Varsayılan mesajlar
  const defaultMessages: Record<string, string> = {
    normal: "🎉 Değeriniz normal aralıkta! Sağlıklı yaşam tarzınızı sürdürmeye devam edin!",
    high: "⚠️ Değeriniz referans aralığının üzerinde. Doktorunuzla görüşerek gerekli önlemleri alabilirsiniz.",
    low: "💪 Değeriniz referans aralığının altında. Uygun beslenme ve yaşam tarzı değişiklikleri ile iyileştirilebilir.",
    critical: "🚨 Değeriniz kritik seviyede. Acil doktor kontrolü gerekli. Sağlığınız bizim önceliğimiz!"
  };
  
  return defaultMessages[status] || "Değeriniz değerlendirildi. Doktorunuzla görüşmenizi öneririz.";
};

// Gelişmiş grafik bileşeni - HbA1c tarzı
const EnhancedChart: React.FC<{ 
  data: { date: Date; value: number }[]; 
  referenceRange: { min: number; max: number };
  testName?: string;
  unit?: string;
}> = ({ data, referenceRange, testName, unit }) => {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value), referenceRange.max);
  const minValue = Math.min(...data.map(d => d.value), referenceRange.min);
  const range = maxValue - minValue;
  const padding = range * 0.2;
  const chartMax = Math.ceil(maxValue + padding);
  const chartMin = Math.floor(Math.max(0, minValue - padding));
  const chartRange = chartMax - chartMin;

  // Y ekseni etiketleri
  const yAxisLabels = [];
  for (let i = 0; i <= 4; i++) {
    const value = chartMin + (i / 4) * chartRange;
    yAxisLabels.push(Math.round(value * 10) / 10);
  }

  return (
    <div className="w-full bg-white rounded-lg p-4 font-sans shadow-sm border">
      {/* Başlık ve Kontroller */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <TestTube className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">{testName}</h3>
            {testName === 'HbA1c' && (
              <p className="text-sm text-gray-500">(Hemoglobin A1c)</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-xs text-gray-500 font-medium px-3 py-1 rounded-md hover:bg-gray-100">
            AY
          </button>
          <button className="text-xs text-gray-500 font-medium px-3 py-1 rounded-md hover:bg-gray-100">
            YIL
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <Info className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grafik Alanı */}
      <div className="relative h-48 mb-4">
        <svg className="w-full h-full" viewBox="0 0 500 150">
          {/* Y-axis labels and grid lines */}
          {yAxisLabels.map((value, i) => {
            const y = 130 - (i / (yAxisLabels.length - 1)) * 110;
            return (
              <g key={i}>
                <text x="0" y={y + 3} className="text-xs fill-gray-400" fontSize="10">
                  {value}{unit}
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
                {format(point.date, 'MMM yy', { locale: tr })}
              </text>
            );
          })}

          {/* Area fill */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#00BCD4" stopOpacity="0.1"/>
            </linearGradient>
          </defs>

          {/* Area path */}
          <path
            d={data.map((point, index) => {
              const x = 40 + (index / (data.length - 1)) * 450;
              const y = 130 - ((point.value - chartMin) / chartRange) * 110;
              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ') + ` L ${40 + ((data.length - 1) / (data.length - 1)) * 450} 130 L 40 130 Z`}
            fill="url(#areaGradient)"
          />

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

      {/* Legend */}
      <div className="flex justify-center items-center">
        <span className="flex items-center text-sm text-cyan-600">
          <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
          → Değer
        </span>
      </div>
    </div>
  );
};

// Motivasyon mesajı kartı
const MotivationCard: React.FC<{
  testName: string;
  status: LabResult['status'];
  value: number;
  referenceRange: { min: number; max: number };
}> = ({ testName, status, value, referenceRange }) => {
  const getMotivationMessage = (testName: string, status: LabResult['status'], value: number, referenceRange: { min: number; max: number }): string => {
    const testKey = testName.toLowerCase().replace(/\s+/g, '_');
    
    const messages: Record<string, Record<string, string>> = {
      hba1c: {
        normal: "Harika bir ilerleme kaydettiniz! Sağlıklı alışkanlıklarınız meyvesini veriyor.",
        high: "Küçük adımlarla büyük değişimler yaratabilirsiniz. Her gün yeni bir başlangıç!",
        low: "HbA1c değeriniz düşük - bu harika bir durum! Kan şeker kontrolünüz mükemmel.",
        critical: "HbA1c değeriniz kritik yükseklikte. Diyabet uzmanı ile acil görüşme gerekli."
      },
      glukoz: {
        normal: "Mükemmel! Kan şeker seviyeniz ideal aralıkta. Metabolizmanız dengede çalışıyor.",
        high: "Kan şekeriniz yüksek ama panik yok! Düzenli yürüyüş ve az şekerli beslenme ile normale döndürebilirsiniz.",
        low: "Kan şekeriniz düşük. Düzenli aralıklarla sağlıklı atıştırmalıklar tüketin.",
        critical: "Kan şekeriniz kritik seviyede! Acil tıbbi müdahale gerekli."
      },
      hemoglobin: {
        normal: "Harika! Hemoglobin değeriniz mükemmel aralıkta. Kan taşıma kapasitiniz optimal seviyede.",
        high: "Hemoglobin değeriniz referans aralığının üzerinde. Bol su tüketimi ve düzenli doktor kontrolü ile dengeleyebilirsiniz.",
        low: "Hemoglobin seviyeniz düşük ama pes etmeyin! Demir açısından zengin besinler tüketerek güçlenebilirsiniz.",
        critical: "Hemoglobin değeriniz acil müdahale gerektiriyor. Hemen doktorunuzla iletişime geçin."
      }
    };
    
    const testMessages = messages[testKey];
    if (testMessages && testMessages[status]) {
      return testMessages[status];
    }
    
    // Varsayılan mesajlar
    const defaultMessages: Record<string, string> = {
      normal: "Değeriniz normal aralıkta! Sağlıklı yaşam tarzınızı sürdürmeye devam edin!",
      high: "Değeriniz referans aralığının üzerinde. Doktorunuzla görüşerek gerekli önlemleri alabilirsiniz.",
      low: "Değeriniz referans aralığının altında. Uygun beslenme ve yaşam tarzı değişiklikleri ile iyileştirilebilir.",
      critical: "Değeriniz kritik seviyede. Acil doktor kontrolü gerekli. Sağlığınız bizim önceliğimiz!"
    };
    
    return defaultMessages[status] || "Değeriniz değerlendirildi. Doktorunuzla görüşmenizi öneririz.";
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-l-blue-400 relative">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-semibold text-blue-800 text-sm">
            Günlük Motivasyon Mesajı
          </h4>
        </div>
        <p className="text-sm text-blue-600 leading-relaxed">
          {getMotivationMessage(testName, status, value, referenceRange)}
        </p>
      </div>
    </div>
  );
};

export const LabResultsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'blood' | 'urine' | 'imaging' | 'other'>('all');
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Randevu alma fonksiyonu
  const handleAppointmentBooking = () => {
    closeDetailModal();
    // Ana uygulamada randevu alma ekranına yönlendir
    const event = new CustomEvent('navigateToAppointment', {
      detail: { screen: 'appointment-booking' }
    });
    window.dispatchEvent(event);
  };



  // Tahlil sonuçlarını yükle
  const loadLabResults = async () => {
    if (!user?.id) {
      setLabResults(mockLabResults);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await labAPI.getResults(user.id);
      
      if (response.success && response.data) {
        const convertedResults = convertBackendDataToLabResults(response.data);
        setLabResults(convertedResults);
      } else {
        // Backend'den veri gelmezse mock data kullan
        setLabResults(mockLabResults);
      }
    } catch (error) {
      console.error('Tahlil sonuçları yüklenirken hata:', error);
      // Hata durumunda mock data kullan
      setLabResults(mockLabResults);
      toast({
        title: "Bilgi",
        description: "Demo veriler gösteriliyor. Gerçek veriler için giriş yapın.",
        variant: "default"
      });
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    loadLabResults();
  }, [user?.id]);

  // Filtrelenmiş sonuçlar
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'all') return labResults;
    return labResults.filter(result => result.category === selectedCategory);
  }, [labResults, selectedCategory]);

  // Test adına göre gruplandırılmış sonuçlar
  const groupedResults = useMemo(() => {
    const grouped: Record<string, LabResult[]> = {};
    
    filteredResults.forEach(result => {
      if (!grouped[result.testName]) {
        grouped[result.testName] = [];
      }
      grouped[result.testName].push(result);
    });
    
    // Her grup içinde tarihe göre sırala (en yeni önce)
    Object.keys(grouped).forEach(testName => {
      grouped[testName].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
    
    return grouped;
  }, [filteredResults]);

  // Durum rengini al
  const getStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'high': return 'text-orange-600';
      case 'low': return 'text-blue-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Durum rozeti
  const getStatusBadge = (status: LabResult['status']) => {
    const configs = {
      normal: { label: 'Normal', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      high: { label: 'Yüksek', variant: 'secondary' as const, icon: TrendingUp, color: 'text-orange-600' },
      low: { label: 'Düşük', variant: 'outline' as const, icon: TrendingDown, color: 'text-blue-600' },
      critical: { label: 'Kritik', variant: 'destructive' as const, icon: AlertTriangle, color: 'text-red-600' }
    };
    
    const config = configs[status] || configs.normal;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Kategoriler
  const categories = [
    { key: 'all', label: 'Tümü', icon: TestTube },
    { key: 'blood', label: 'Kan', icon: Activity },
    { key: 'urine', label: 'İdrar', icon: TestTube },
    { key: 'imaging', label: 'Görüntüleme', icon: Calendar },
    { key: 'other', label: 'Diğer', icon: Filter }
  ] as const;

  // Modal açma/kapama
  const openDetailModal = (result: LabResult) => {
    setSelectedResult(result);
  };

  const closeDetailModal = () => {
    setSelectedResult(null);
  };

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
          <TestTube className="w-6 h-6 text-primary" />
          Tahlil Sonuçlarım
        </h1>
        <p className="text-muted-foreground">
          Laboratuvar sonuçlarınız ve zaman içindeki değişimler
        </p>
      </div>



      {/* Kategori filtreleri */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sonuçlar */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Tahlil Sonuçları Yükleniyor...
          </h3>
          <p className="text-sm text-muted-foreground">
            Lütfen bekleyin, verileriniz getiriliyor.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedResults).map(([testName, results]) => {
            const latestResult = results[0];
            const hasHistory = results.length > 1;
            
            return (
              <Card key={testName} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDetailModal(latestResult)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{latestResult.testName}</CardTitle>
                      <CardDescription>
                        {format(latestResult.date, 'dd MMMM yyyy HH:mm', { locale: tr })}
                        {latestResult.labName && ` • ${latestResult.labName}`}
                      </CardDescription>
                    </div>
                    {getStatusBadge(latestResult.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-bold ${getStatusColor(latestResult.status)}`}>
                          {latestResult.value}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {latestResult.unit}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Referans: {latestResult.referenceRange.min}-{latestResult.referenceRange.max} {latestResult.unit}
                      </p>
                    </div>
                    
                    {hasHistory && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Activity className="w-4 h-4" />
                          {results.length} kayıt
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Trend görüntülemek için tıklayın
                        </p>
                      </div>
                    )}
                  </div>
                  
                                     {/* Motivasyon mesajı kartı - her zaman göster */}
                   <MotivationCard
                     testName={latestResult.testName}
                     status={latestResult.status}
                     value={latestResult.value}
                     referenceRange={latestResult.referenceRange}
                   />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredResults.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Tahlil Sonucu Bulunamadı
          </h3>
          <p className="text-sm text-muted-foreground">
            Seçili kategoride henüz tahlil sonucunuz bulunmamaktadır.
          </p>
        </div>
      )}

      {/* Detay Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedResult.testName}</CardTitle>
                  <CardDescription>
                    {selectedResult.testCode && `${selectedResult.testCode} • `}
                    {format(selectedResult.date, 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                  ✕
                </Button>
              </div>
            </CardHeader>
                         <CardContent className="space-y-4">
               {/* Trend Grafiği */}
               {(() => {
                 const historyData = groupedResults[selectedResult.testName]?.map(result => ({
                   date: result.date,
                   value: result.value
                 })).reverse() || [];
                 
                 if (historyData.length > 1) {
                   return (
                     <div>
                       <EnhancedChart 
                         data={historyData} 
                         referenceRange={selectedResult.referenceRange}
                         testName={selectedResult.testName}
                         unit={selectedResult.unit}
                       />
                       <MotivationCard
                         testName={selectedResult.testName}
                         status={selectedResult.status}
                         value={selectedResult.value}
                         referenceRange={selectedResult.referenceRange}
                       />
                     </div>
                   );
                 } else {
                   return (
                     <div className="text-center py-8">
                       <TestTube className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                       <h3 className="text-lg font-medium text-muted-foreground mb-2">
                         Trend Verisi Yok
                       </h3>
                       <p className="text-sm text-muted-foreground">
                         Bu test için henüz trend verisi bulunmamaktadır.
                       </p>
                     </div>
                   );
                 }
               })()}

               {/* İşlemler */}
               <div className="flex gap-2 pt-4">
                 <Button 
                   variant="outline" 
                   className="flex-1"
                   onClick={handleAppointmentBooking}
                 >
                   <Calendar className="w-4 h-4 mr-2" />
                   Randevu Al
                 </Button>
               </div>
             </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};