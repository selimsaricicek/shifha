const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Kan tahlili referans değerleri
const bloodTestReferenceRanges = {
  // Hemogram
  hemoglobin: { min: 12.0, max: 15.5, unit: 'g/dL' },
  hematokrit: { min: 36.0, max: 46.0, unit: '%' },
  eritrosit: { min: 4.2, max: 5.4, unit: 'milyon/μL' },
  lökosit: { min: 4.0, max: 10.0, unit: 'bin/μL' },
  trombosit: { min: 150, max: 450, unit: 'bin/μL' },
  mcv: { min: 80, max: 100, unit: 'fL' },
  mch: { min: 27, max: 32, unit: 'pg' },
  mchc: { min: 32, max: 36, unit: 'g/dL' },
  rdw: { min: 11.5, max: 14.5, unit: '%' },
  
  // Biyokimya - Karaciğer Fonksiyonları
  alanin_aminotransferaz: { min: 7, max: 56, unit: 'U/L' },
  aspartat_aminotransferaz: { min: 10, max: 40, unit: 'U/L' },
  alkalen_fosfataz: { min: 44, max: 147, unit: 'U/L' },
  gama_glutamil: { min: 9, max: 48, unit: 'U/L' },
  total_bilirubin: { min: 0.3, max: 1.2, unit: 'mg/dL' },
  
  // Biyokimya - Böbrek Fonksiyonları
  kan_üre_azotu: { min: 7, max: 20, unit: 'mg/dL' },
  kreatinin: { min: 0.7, max: 1.3, unit: 'mg/dL' },
  tahmini_glomerüler: { min: 90, max: 120, unit: 'mL/dk' },
  
  // Biyokimya - Genel
  glukoz: { min: 70, max: 100, unit: 'mg/dL' },
  üre: { min: 17, max: 43, unit: 'mg/dL' },
  ürik_asit: { min: 3.5, max: 7.2, unit: 'mg/dL' },
  
  // Lipid Profili
  total_kolesterol: { min: 0, max: 200, unit: 'mg/dL' },
  ldl_kolesterol: { min: 0, max: 100, unit: 'mg/dL' },
  hdl_kolesterol: { min: 40, max: 60, unit: 'mg/dL' },
  trigliserit: { min: 0, max: 150, unit: 'mg/dL' },
  
  // Elektrolit Paneli
  sodyum: { min: 135, max: 145, unit: 'mEq/L' },
  potasyum: { min: 3.5, max: 5.1, unit: 'mEq/L' },
  klor: { min: 98, max: 107, unit: 'mEq/L' },
  bikarbonat: { min: 22, max: 29, unit: 'mEq/L' },
  kalsiyum: { min: 8.5, max: 10.5, unit: 'mg/dL' },
  fosfor: { min: 2.5, max: 4.5, unit: 'mg/dL' },
  magnezyum: { min: 1.7, max: 2.2, unit: 'mg/dL' },
  
  // Protein
  total_protein: { min: 6.3, max: 8.2, unit: 'g/dL' },
  albumin: { min: 3.5, max: 5.2, unit: 'g/dL' },
  
  // Tiroid
  tsh: { min: 0.27, max: 4.2, unit: 'μIU/mL' },
  t3: { min: 2.0, max: 4.4, unit: 'pg/mL' },
  t4: { min: 0.93, max: 1.7, unit: 'ng/dL' },
  
  // Vitamin
  vitamin_b12: { min: 197, max: 771, unit: 'pg/mL' },
  vitamin_d: { min: 20, max: 50, unit: 'ng/mL' },
  folik_asit: { min: 3.1, max: 17.5, unit: 'ng/mL' },
  
  // İnflamasyon
  crp: { min: 0, max: 3.0, unit: 'mg/L' },
  sedimentasyon: { min: 0, max: 20, unit: 'mm/h' },
  
  // Demir
  demir: { min: 60, max: 170, unit: 'μg/dL' },
  tibc: { min: 250, max: 450, unit: 'μg/dL' },
  ferritin: { min: 15, max: 150, unit: 'ng/mL' },
  
  // Hormon
  insulin: { min: 2.6, max: 24.9, unit: 'μIU/mL' },
  hba1c: { min: 4.0, max: 6.0, unit: '%' },
  
  // Kardiyak
  troponin_i: { min: 0, max: 0.04, unit: 'ng/mL' },
  ck_mb: { min: 0, max: 25, unit: 'ng/mL' }
};

/**
 * Kan tahlili sonuçlarını analiz eder ve AI yorumu üretir
 * @param {Object} bloodTestResult - Kan tahlili sonucu
 * @param {Object} patientInfo - Hasta bilgileri
 * @returns {Object} - AI analizi ve önerileri
 */
async function analyzeBloodTestResults(bloodTestResult, patientInfo = {}, maxRetries = 3, retryDelay = 2000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Kan tahlili AI analizi - Deneme ${attempt}/${maxRetries}`);
      
      const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest" });

      // Anormal değerleri tespit et
      const abnormalValues = [];
      const normalValues = [];
      const criticalValues = [];

      Object.keys(bloodTestReferenceRanges).forEach(testName => {
        const value = bloodTestResult[testName];
        if (value !== null && value !== undefined) {
          const range = bloodTestReferenceRanges[testName];
          const numValue = parseFloat(value);
          
          if (numValue < range.min || numValue > range.max) {
            const severity = calculateSeverity(testName, numValue, range);
            const abnormalData = {
              test: testName,
              value: numValue,
              unit: range.unit,
              normalRange: `${range.min}-${range.max}`,
              severity: severity,
              status: numValue < range.min ? 'düşük' : 'yüksek'
            };
            
            if (severity === 'kritik') {
              criticalValues.push(abnormalData);
            } else {
              abnormalValues.push(abnormalData);
            }
          } else {
            normalValues.push({
              test: testName,
              value: numValue,
              unit: range.unit
            });
          }
        }
      });

      // AI analizi için prompt oluştur
      const prompt = `
## TIBBİ KAN TAHLİLİ ANALİZ UZMANI ##

Sen deneyimli bir dahiliye uzmanısın. Aşağıdaki kan tahlili sonuçlarını analiz et ve kapsamlı bir değerlendirme yap.

### HASTA BİLGİLERİ ###
- Yaş: ${patientInfo.yas || 'Belirtilmemiş'}
- Cinsiyet: ${patientInfo.cinsiyet || 'Belirtilmemiş'}
- Boy: ${patientInfo.boy || 'Belirtilmemiş'}
- Kilo: ${patientInfo.kilo || 'Belirtilmemiş'}
- VKİ: ${patientInfo.vki || 'Hesaplanmamış'}
- Kronik Hastalıklar: ${patientInfo.kronik_hastaliklar || 'Yok'}
- Kullandığı İlaçlar: ${patientInfo.ilac_duzenli || 'Yok'}
- Aile Öyküsü: ${patientInfo.aile_oykusu || 'Belirtilmemiş'}
- Alerjiler: ${patientInfo.allerjiler || 'Yok'}
- Sigara Kullanımı: ${patientInfo.sigara_kullanimi || 'Belirtilmemiş'}
- Alkol Kullanımı: ${patientInfo.alkol_kullanimi || 'Belirtilmemiş'}
- Beslenme Alışkanlıkları: ${patientInfo.beslenme_aliskanliklari || 'Belirtilmemiş'}
- Fiziksel Aktivite: ${patientInfo.fiziksel_aktivite || 'Belirtilmemiş'}
- Geçirilmiş Ameliyatlar: ${patientInfo.ameliyatlar || 'Yok'}
- Şikayetler: ${patientInfo.sikayetler || 'Belirtilmemiş'}

### ANORMAL DEĞERLER ###
${abnormalValues.map(val => 
  `- ${getTestDisplayName(val.test)}: ${val.value} ${val.unit} (Normal: ${val.normalRange}) - ${val.status.toUpperCase()}`
).join('\n')}

### KRİTİK DEĞERLER ###
${criticalValues.map(val => 
  `- ${getTestDisplayName(val.test)}: ${val.value} ${val.unit} (Normal: ${val.normalRange}) - ${val.status.toUpperCase()} - KRİTİK!`
).join('\n')}

### NORMAL DEĞERLER ###
${normalValues.slice(0, 10).map(val => 
  `- ${getTestDisplayName(val.test)}: ${val.value} ${val.unit}`
).join('\n')}
${normalValues.length > 10 ? `\n... ve ${normalValues.length - 10} değer daha normal aralıkta` : ''}

### GÖREV ###
Aşağıdaki JSON formatında detaylı bir analiz yap. Hasta öyküsü, yaşam tarzı ve laboratuvar bulgularını birlikte değerlendirerek kapsamlı bir teşhis yaklaşımı sun:

{
  "genel_durum": "hastanın genel durumu hakkında 2-3 cümle",
  "kritik_uyarilar": ["acil müdahale gerektiren durumlar"],
  "anormal_bulgular": [
    {
      "test_adi": "test adı",
      "deger": "değer ve birim",
      "durum": "yüksek/düşük",
      "olasi_nedenler": ["neden1", "neden2", "neden3"],
      "onem_derecesi": "düşük/orta/yüksek/kritik",
      "klinik_anlam": "bu bulgunun klinik anlamı"
    }
  ],
  "potansiyel_teshisler": [
    {
      "teshis": "olası teşhis adı",
      "olasilik": "düşük/orta/yüksek",
      "destekleyen_bulgular": ["laboratuvar bulgusu", "anamnez bilgisi", "risk faktörü"],
      "aciklama": "teşhisin gerekçesi ve klinik yaklaşım",
      "ayirici_teshis": ["benzer durumlar"],
      "prognoz": "hastalığın olası seyri"
    }
  ],
  "risk_faktoru_analizi": {
    "mevcut_risk_faktorleri": ["tespit edilen risk faktörleri"],
    "yasam_tarzi_riskleri": ["yaşam tarzından kaynaklanan riskler"],
    "genetik_predispozisyon": ["aile öyküsünden kaynaklanan riskler"],
    "cevre_faktorleri": ["çevresel risk faktörleri"]
  },
  "oneriler": {
    "acil_mudahale": ["acil durumlar için öneriler"],
    "takip_testleri": ["önerilen ek testler ve sıklığı"],
    "yasam_tarzi": ["beslenme, egzersiz, alışkanlık önerileri"],
    "doktor_konsultasyonu": ["hangi uzmanlık dallarına yönlendirilmeli"],
    "ilac_onerileri": ["önerilen ilaç grupları (sadece genel)"],
    "kontrol_sikligi": "ne sıklıkla kontrol edilmeli"
  },
  "risk_skorlari": {
    "kardiyovaskuler_risk": "düşük/orta/yüksek",
    "diyabet_riski": "düşük/orta/yüksek", 
    "enfeksiyon_riski": "düşük/orta/yüksek",
    "anemik_durum": "yok/hafif/orta/şiddetli",
    "karaciger_fonksiyon_riski": "düşük/orta/yüksek",
    "bobrek_fonksiyon_riski": "düşük/orta/yüksek",
    "tiroid_fonksiyon_riski": "düşük/orta/yüksek"
  },
  "beslenme_onerileri": {
    "onerilen_besinler": ["faydalı besinler"],
    "kacinilmasi_gerekenler": ["zararlı besinler"],
    "vitamin_mineral_destegi": ["önerilen takviyeler"],
    "su_tuketimi": "günlük su ihtiyacı"
  },
  "egzersiz_onerileri": {
    "uygun_aktiviteler": ["önerilen egzersiz türleri"],
    "kacinilmasi_gerekenler": ["zararlı aktiviteler"],
    "siklik_ve_sure": "egzersiz sıklığı ve süresi",
    "dikkat_edilmesi_gerekenler": ["egzersiz sırasında dikkat edilecekler"]
  },
  "izlem_plani": {
    "kisa_donem": "1-3 ay içinde yapılacaklar",
    "orta_donem": "3-6 ay içinde yapılacaklar", 
    "uzun_donem": "6-12 ay içinde yapılacaklar",
    "yasam_boyu": "sürekli takip edilmesi gerekenler"
  },
  "ozet": "3-4 cümlelik genel değerlendirme, en önemli bulgular ve öneriler"
}

SADECE JSON formatında yanıt ver, başka hiçbir metin ekleme.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // JSON'u temizle ve parse et
      const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const analysisResult = JSON.parse(jsonString);

      console.log("Kan tahlili AI analizi başarıyla tamamlandı.");
      
      // Ek bilgileri ekle
      analysisResult.analiz_tarihi = new Date().toISOString();
      analysisResult.toplam_test_sayisi = Object.keys(bloodTestResult).filter(key => 
        bloodTestResult[key] !== null && bloodTestResult[key] !== undefined && key !== 'patient_tc' && key !== 'test_date'
      ).length;
      analysisResult.anormal_test_sayisi = abnormalValues.length + criticalValues.length;
      analysisResult.kritik_test_sayisi = criticalValues.length;

      return analysisResult;

    } catch (error) {
      lastError = error;
      console.error(`Kan tahlili AI analizi hatası (Deneme ${attempt}/${maxRetries}):`, error.message);
      
      // 503 Service Unavailable veya rate limit hatalarında retry yap
      if (error.status === 503 || error.status === 429 || error.message.includes('overloaded')) {
        if (attempt < maxRetries) {
          console.log(`${retryDelay}ms bekleyip tekrar deneniyor...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
          continue;
        }
      }
      
      // Diğer hatalar için hemen çık
      if (attempt === maxRetries || (error.status !== 503 && error.status !== 429 && !error.message.includes('overloaded'))) {
        break;
      }
    }
  }
  
  // Tüm denemeler başarısız oldu
  console.error("Tüm kan tahlili AI analizi denemeleri başarısız oldu:", lastError?.message);
  throw new Error(`Kan tahlili analizi şu anda yapılamıyor. Lütfen birkaç dakika sonra tekrar deneyin. (${lastError?.message})`);
}

/**
 * Test değerinin kritiklik derecesini hesaplar
 */
function calculateSeverity(testName, value, range) {
  const deviation = Math.abs(value - (range.min + range.max) / 2) / ((range.max - range.min) / 2);
  
  // Kritik testler için özel kurallar
  const criticalTests = {
    'glukoz': { criticalHigh: 400, criticalLow: 40 },
    'potasyum': { criticalHigh: 6.0, criticalLow: 2.5 },
    'sodyum': { criticalHigh: 160, criticalLow: 120 },
    'kreatinin': { criticalHigh: 3.0, criticalLow: 0.3 },
    'troponin_i': { criticalHigh: 1.0, criticalLow: 0 },
    'hemoglobin': { criticalHigh: 20, criticalLow: 7 }
  };

  if (criticalTests[testName]) {
    const critical = criticalTests[testName];
    if (value >= critical.criticalHigh || value <= critical.criticalLow) {
      return 'kritik';
    }
  }

  if (deviation > 2) return 'yüksek';
  if (deviation > 1) return 'orta';
  return 'düşük';
}

/**
 * Test adını görüntüleme formatına çevirir
 */
function getTestDisplayName(testName) {
  const nameMap = {
    hemoglobin: 'Hemoglobin',
    hematokrit: 'Hematokrit',
    eritrosit: 'Eritrosit Sayısı',
    lökosit: 'Lökosit Sayısı',
    trombosit: 'Trombosit Sayısı',
    mcv: 'MCV',
    mch: 'MCH',
    mchc: 'MCHC',
    rdw: 'RDW',
    alanin_aminotransferaz: 'ALT',
    aspartat_aminotransferaz: 'AST',
    alkalen_fosfataz: 'Alkalen Fosfataz',
    gama_glutamil: 'GGT',
    total_bilirubin: 'Total Bilirubin',
    kan_üre_azotu: 'BUN',
    kreatinin: 'Kreatinin',
    tahmini_glomerüler: 'eGFR',
    glukoz: 'Glukoz',
    üre: 'Üre',
    ürik_asit: 'Ürik Asit',
    total_kolesterol: 'Total Kolesterol',
    ldl_kolesterol: 'LDL Kolesterol',
    hdl_kolesterol: 'HDL Kolesterol',
    trigliserit: 'Trigliserit',
    sodyum: 'Sodyum',
    potasyum: 'Potasyum',
    klor: 'Klor',
    bikarbonat: 'Bikarbonat',
    kalsiyum: 'Kalsiyum',
    fosfor: 'Fosfor',
    magnezyum: 'Magnezyum',
    total_protein: 'Total Protein',
    albumin: 'Albumin',
    tsh: 'TSH',
    t3: 'T3',
    t4: 'T4',
    vitamin_b12: 'Vitamin B12',
    vitamin_d: 'Vitamin D',
    folik_asit: 'Folik Asit',
    crp: 'CRP',
    sedimentasyon: 'Sedimentasyon',
    demir: 'Demir',
    tibc: 'TIBC',
    ferritin: 'Ferritin',
    insulin: 'İnsülin',
    hba1c: 'HbA1c',
    troponin_i: 'Troponin-I',
    ck_mb: 'CK-MB'
  };
  return nameMap[testName] || testName;
}

module.exports = {
  analyzeBloodTestResults,
  bloodTestReferenceRanges,
  calculateSeverity,
  getTestDisplayName
};