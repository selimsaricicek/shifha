const supabase = require('./supabaseClient');
const { getStructuredDataFromText } = require('./gemini.service');
const pdfParse = require('pdf-parse');

/**
 * PDF dosyasından hasta verisi çıkarır ve Supabase'e kaydeder
 * @param {Buffer} buffer - PDF dosya içeriği
 * @returns {Promise<object>} - Kaydedilen hasta verisi
 * @throws {Error} - PDF veya Supabase hatası
 */
function extractField(text, label, options = {}) {
  const regex = new RegExp(label + ':\\s*(.*)', 'i');
  const match = text.match(regex);
  if (!match) return options.default || '';
  let value = match[1].trim();
  if (options.type === 'number') {
    value = value.replace(/[^\d.,-]/g, '').replace(',', '.');
    return value ? Number(value) : '';
  }
  if (options.type === 'array') {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return value;
}
function arrToString(arr) {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.join(', ');
  return arr;
}

async function parsePatientPdf(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error('Geçersiz PDF verisi');
    }
    
    const data = await pdfParse(buffer);
    const text = data.text;
    console.log("PDF'ten ham metin başarıyla çıkarıldı. Yapay zekaya gönderiliyor...");

    // 1. ADIM: Yapay zekadan yapılandırılmış, iç içe geçmiş veriyi alıyoruz.
    const structuredData = await getStructuredDataFromText(text);

    // 2. ADIM: Kolay erişim için tüm alt nesneleri tek bir düz nesnede birleştiriyoruz.
    const flatData = {
      ...(structuredData.kimlikBilgileri || {}),
      ...(structuredData.tibbiGecmis || {}),
      ...(structuredData.ilaclar || {}),
      ...(structuredData.yasamTarzi || {}),
      // AI'dan gelebilecek diğer ana seviye alanları da ekleyelim.
      ...structuredData, 
    };
    
    // TC No'yu her iki olası yerden de güvenli bir şekilde alalım.
    const tc = flatData.tcKimlikNo || flatData.tc_kimlik_no;
    if (!tc) {
      throw new Error('Yapay zeka metinden bir T.C. Kimlik Numarası çıkaramadı.');
    }
    
    // 3. ADIM: Veritabanındaki ana sütunları bu düz nesneden dolduruyoruz.
    const upsertData = {
      tc_kimlik_no: tc,
      ad_soyad: flatData.adSoyad,
      dogum_tarihi: flatData.dogumTarihi,
      yas: flatData.yas ? parseInt(flatData.yas, 10) : null,
      cinsiyet: flatData.cinsiyet,
      boy: flatData.boy,
      kilo: flatData.kilo,
      vki: flatData.vki,
      kan_grubu: flatData.kanGrubu,
      medeni_durum: flatData.medeniDurum,
      meslek: flatData.meslek,
      egitim_durumu: flatData.egitimDurumu,
      kronik_hastaliklar: arrToString(flatData.kronikHastaliklar),
      ameliyatlar: arrToString(flatData.ameliyatlar),
      allerjiler: arrToString(flatData.allerjiler),
      aile_oykusu: arrToString(flatData.aileOykusu),
      enfeksiyonlar: arrToString(flatData.enfeksiyonlar),
      ilac_duzenli: arrToString(flatData.duzenli),
      ilac_duzensiz: arrToString(flatData.duzensiz),
      ilac_alternatif: arrToString(flatData.alternatif),
      hareket: flatData.hareket,
      uyku: flatData.uyku,
      sigara_alkol: flatData.sigaraAlkol,
      beslenme: flatData.beslenme,
      psikoloji: flatData.psikoloji,
      uyku_bozuklugu: flatData.uykuBozuklugu,
      sosyal_destek: flatData.sosyalDestek,
      updated_at: new Date().toISOString(),
    };

    // 4. ADIM: Ana sütunlara zaten yazdığımız verileri orijinal AI çıktısından çıkarıp,
    // geri kalan "ekstra" veriyi patient_data için hazırlıyoruz.
    const extraData = { ...structuredData };
    // Ana grupları ve tekrar eden alanları siliyoruz.
    delete extraData.kimlikBilgileri;
    delete extraData.tibbiGecmis;
    delete extraData.ilaclar;
    delete extraData.yasamTarzi;
    delete extraData.tc_kimlik_no; // Ana seviyedeki tekrarı da siliyoruz
    delete extraData.ad_soyad;   // Bu da siliniyor

    upsertData.patient_data = extraData; // Temizlenmiş ekstra veriyi atıyoruz.
    
    // Veritabanı işlemi
    const { data: patient, error } = await supabase
      .from('patients')
      .upsert(upsertData, { onConflict: 'tc_kimlik_no' })
      .select()
      .single();

    if (error) {
      console.error("Supabase Upsert Hatası:", error);
      throw new Error('Hasta kaydı oluşturulamadı/güncellenemedi: ' + error.message);
    }

    console.log("Nihai ve temiz veri başarıyla kaydedildi:", patient.id);
    
    // 5. ADIM: Kan tahlili verilerini çıkar ve kaydet
    await extractAndSaveBloodTestResults(text, tc);
    
    return patient;
}

/**
 * PDF'ten kan tahlili değerlerini çıkarır ve blood_test_results tablosuna kaydeder
 * @param {string} text - PDF'ten çıkarılan ham metin
 * @param {string} patientTc - Hasta TC kimlik numarası
 */
async function extractAndSaveBloodTestResults(text, patientTc) {
    try {
        // Kan tahlili değerlerini çıkarmak için regex pattern'ları
        const bloodTestPatterns = {
            // Hemogram
            hemoglobin: /(?:hemoglobin|hgb|hb)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl|mg\/dl)?/i,
            hematokrit: /(?:hematokrit|hct|htc)\s*:?\s*([0-9]+\.?[0-9]*)\s*%?/i,
            eritrosit: /(?:eritrosit|rbc|alyuvar)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:milyon|m)?/i,
            lökosit: /(?:lökosit|wbc|akyuvar|beyaz)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:bin|k)?/i,
            trombosit: /(?:trombosit|plt|platelet)\s*:?\s*([0-9]+)\s*(?:bin|k)?/i,
            mcv: /(?:mcv)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:fl)?/i,
            mch: /(?:mch)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:pg)?/i,
            mchc: /(?:mchc)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl)?/i,
            rdw: /(?:rdw)\s*:?\s*([0-9]+\.?[0-9]*)\s*%?/i,
            
            // Biyokimya - Karaciğer Fonksiyonları
            alanin_aminotransferaz: /(?:alanin\s*aminotransferaz|alt|sgpt)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l)?/i,
            aspartat_aminotransferaz: /(?:aspartat\s*aminotransferaz|ast|sgot)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l)?/i,
            alkalen_fosfataz: /(?:alkalen\s*fosfataz|alp)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l)?/i,
            gama_glutamil: /(?:gama\s*glutamil|gamma\s*glutamil|ggt)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l)?/i,
            total_bilirubin: /(?:total\s*bilirubin|toplam\s*bilirubin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            
            // Biyokimya - Böbrek Fonksiyonları
            kan_üre_azotu: /(?:kan\s*üre\s*azotu|bun|blood\s*urea\s*nitrogen)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            kreatinin: /(?:kreatinin|creatinine)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            tahmini_glomerüler: /(?:tahmini\s*glomerüler|egfr|estimated\s*gfr)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ml\/dk|ml\/min)?/i,
            
            // Biyokimya - Genel
            glukoz: /(?:glukoz|glucose|şeker)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            üre: /(?:üre|urea|ure)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            ürik_asit: /(?:ürik\s*asit|uric\s*acid)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            
            // Lipid Profili
            total_kolesterol: /(?:total\s*kolesterol|toplam\s*kolesterol|cholesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            ldl_kolesterol: /(?:ldl\s*kolesterol|ldl|kötü\s*kolesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            hdl_kolesterol: /(?:hdl\s*kolesterol|hdl|iyi\s*kolesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            trigliserit: /(?:trigliserit|triglyceride)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            
            // Elektrolit Paneli
            sodyum: /(?:sodyum|sodium|na)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l)?/i,
            potasyum: /(?:potasyum|potassium|k)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l)?/i,
            klor: /(?:klor|chloride|cl)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l)?/i,
            bikarbonat: /(?:bikarbonat|bicarbonate|hco3)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l)?/i,
            kalsiyum: /(?:kalsiyum|calcium|ca)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            fosfor: /(?:fosfor|phosphorus|p)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            magnezyum: /(?:magnezyum|magnesium|mg)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl)?/i,
            
            // Protein
            total_protein: /(?:total\s*protein|toplam\s*protein)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl)?/i,
            albumin: /(?:albumin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl)?/i,
            
            // Tiroid
            tsh: /(?:tsh)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:miu\/l|μiu\/ml)?/i,
            t3: /(?:t3)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/ml|ng\/dl)?/i,
            t4: /(?:t4)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/dl|μg\/dl)?/i,
            
            // Vitamin
            vitamin_b12: /(?:vitamin\s*b12|b12|cobalamin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/ml|pmol\/l)?/i,
            vitamin_d: /(?:vitamin\s*d|25\s*oh\s*d)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|nmol\/l)?/i,
            folik_asit: /(?:folik\s*asit|folic\s*acid|folate)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|nmol\/l)?/i,
            
            // İnflamasyon
            crp: /(?:crp|c\s*reaktif\s*protein)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/l|mg\/dl)?/i,
            sedimentasyon: /(?:sedimentasyon|esr|sed)\s*:?\s*([0-9]+)\s*(?:mm\/saat|mm\/h)?/i,
            
            // Demir
            demir: /(?:demir|iron|fe)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:μg\/dl|mcg\/dl)?/i,
            tibc: /(?:tibc|total\s*iron)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:μg\/dl|mcg\/dl)?/i,
            ferritin: /(?:ferritin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|μg\/l)?/i,
            
            // Hormon
            insulin: /(?:insulin|insülin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:μiu\/ml|miu\/l)?/i,
            hba1c: /(?:hba1c|hemoglobin\s*a1c)\s*:?\s*([0-9]+\.?[0-9]*)\s*%?/i,
            
            // Kardiyak
            troponin_i: /(?:troponin\s*i|trop\s*i)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|μg\/l)?/i,
            ck_mb: /(?:ck\s*mb|ck-mb)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|u\/l)?/i
        };
        
        // Değerleri çıkar
        const bloodTestData = {
            patient_tc: patientTc,
            test_date: new Date().toISOString().split('T')[0], // Bugünün tarihi
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Her pattern için değer çıkar
        Object.keys(bloodTestPatterns).forEach(key => {
            const match = text.match(bloodTestPatterns[key]);
            if (match && match[1]) {
                const value = parseFloat(match[1].replace(',', '.'));
                if (!isNaN(value)) {
                    bloodTestData[key] = value;
                }
            }
        });
        
        // İdrar değerleri için özel pattern'lar
        const urinePatterns = {
            idrar_protein: /(?:idrar\s*protein|urine\s*protein)\s*:?\s*(negatif|pozitif|\+|\-|trace)/i,
            idrar_glukoz: /(?:idrar\s*glukoz|urine\s*glucose)\s*:?\s*(negatif|pozitif|\+|\-|trace)/i,
            idrar_keton: /(?:idrar\s*keton|urine\s*ketone)\s*:?\s*(negatif|pozitif|\+|\-|trace)/i,
            idrar_lökosit: /(?:idrar\s*lökosit|urine\s*wbc)\s*:?\s*([0-9]+\-?[0-9]*\s*\/hpf)/i,
            idrar_eritrosit: /(?:idrar\s*eritrosit|urine\s*rbc)\s*:?\s*([0-9]+\-?[0-9]*\s*\/hpf)/i
        };
        
        Object.keys(urinePatterns).forEach(key => {
            const match = text.match(urinePatterns[key]);
            if (match && match[1]) {
                bloodTestData[key] = match[1].trim();
            }
        });
        
        // Eğer hiç kan tahlili değeri bulunamadıysa kaydetme
        const hasBloodTestData = Object.keys(bloodTestData).some(key => 
            key !== 'patient_tc' && key !== 'test_date' && key !== 'created_at' && key !== 'updated_at'
        );
        
        if (hasBloodTestData) {
            const { data, error } = await supabase
                .from('blood_test_results')
                .insert(bloodTestData)
                .select()
                .single();
                
            if (error) {
                console.error('Kan tahlili kaydı hatası:', error);
            } else {
                console.log('Kan tahlili başarıyla kaydedildi:', data.id);
            }
        } else {
            console.log('PDF\'te kan tahlili değeri bulunamadı');
        }
        
    } catch (error) {
        console.error('Kan tahlili çıkarma hatası:', error);
    }
}

module.exports = { parsePatientPdf };