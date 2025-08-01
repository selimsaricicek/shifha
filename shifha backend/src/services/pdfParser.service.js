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

async function parsePatientPdf(buffer, patientId = null) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error('Geçersiz PDF verisi');
    }
    
    const data = await pdfParse(buffer);
    const text = data.text;
    console.log("PDF'ten ham metin başarıyla çıkarıldı. Yapay zekaya gönderiliyor...");
    console.log("Ham metin:", text.substring(0, 500) + "...");

    // Eğer patientId verilmişse, mevcut hastanın bilgilerini güncelle
    if (patientId) {
        // Önce hastanın mevcut olup olmadığını kontrol et
        const { data: existingPatient, error: fetchError } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();
            
        if (fetchError || !existingPatient) {
            throw new Error('Hasta bulunamadı.');
        }
        
        // Kan tahlili verilerini çıkar ve kaydet
        await extractAndSaveBloodTestResults(text, existingPatient.tc_kimlik_no, patientId);
        
        // Güncellenmiş hasta verilerini döndür
        return existingPatient;
    }

    // Önce manuel pattern'larla hasta bilgilerini çıkarmaya çalış
    const manualPatientData = extractPatientDataManually(text);
    
    if (manualPatientData && manualPatientData.tc_kimlik_no) {
        console.log("Manuel pattern'larla hasta bilgileri çıkarıldı:", manualPatientData);
        
        // Veritabanı işlemi
        const { data: patient, error } = await supabase
            .from('patients')
            .upsert(manualPatientData, { onConflict: 'tc_kimlik_no' })
            .select()
            .single();

        if (error) {
            console.error("Supabase Upsert Hatası:", error);
            throw new Error('Hasta kaydı oluşturulamadı/güncellenemedi: ' + error.message);
        }

        console.log("Manuel çıkarılan veri başarıyla kaydedildi:", patient.id);
        
        // Kan tahlili verilerini çıkar ve kaydet
        await extractAndSaveBloodTestResults(text, manualPatientData.tc_kimlik_no, patient.id);
        
        return patient;
    }

    // Eğer manuel pattern'lar başarısız olursa, eski AI yöntemini kullan
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
    await extractAndSaveBloodTestResults(text, tc, patient.id);
    
    return patient;
}

/**
 * Fotoğraftaki hasta raporu formatını manuel olarak çıkarır
 * @param {string} text - PDF'ten çıkarılan ham metin
 * @returns {object|null} - Çıkarılan hasta verileri veya null
 */
function extractPatientDataManually(text) {
    try {
        console.log("Manuel pattern'larla hasta bilgilerini çıkarıyor...");
        
        // Fotoğraftaki format için özel pattern'lar
        const patterns = {
            // T.C. Kimlik No - fotoğraftaki format: "56789012345"
            tc_kimlik_no: /(?:T\.?C\.?\s*Kimlik\s*No|TC\s*No)\s*:?\s*([0-9]{11})/i,
            
            // Adı Soyadı - fotoğraftaki format: "Hasan Vural"
            ad_soyad: /(?:Adı?\s*Soyadı?|Ad\s*Soyad|Hasta\s*Adı?)\s*:?\s*([A-ZÇĞIİÖŞÜa-zçğıiöşü\s]+)/i,
            
            // Doğum Tarihi - fotoğraftaki format: "12.04.1982"
            dogum_tarihi: /(?:Doğum\s*Tarihi?)\s*:?\s*([0-9]{1,2}\.?[0-9]{1,2}\.?[0-9]{4})/i,
            
            // Yaş - fotoğraftaki format: "43"
            yas: /(?:Yaş)\s*:?\s*([0-9]{1,3})/i,
            
            // Cinsiyet - fotoğraftaki format: "Erkek"
            cinsiyet: /(?:Cinsiyet)\s*:?\s*(Erkek|Kadın|E|K)/i,
            
            // Boy/Kilo - fotoğraftaki format: "180 cm / 88 kg"
            boy_kilo: /(?:Boy\s*\/?\s*Kilo)\s*:?\s*([0-9]+)\s*cm\s*\/?\s*([0-9]+)\s*kg/i,
            
            // VKİ - fotoğraftaki format: "27.2 (Fazla Kilolu)"
            vki: /(?:Vücut\s*Kitle\s*İndeksi|VKİ)\s*:?\s*([0-9]+\.?[0-9]*)/i,
            
            // Kan Grubu - fotoğraftaki format: "A Rh(-)"
            kan_grubu: /(?:Kan\s*Grubu)\s*:?\s*([ABO]{1,2}\s*Rh?\s*[\(\+\-\)]+)/i,
            
            // Meslek - fotoğraftaki format: "İnşaat Mühendisi"
            meslek: /(?:Meslek)\s*:?\s*([A-ZÇĞIİÖŞÜa-zçğıiöşü\s]+)/i
        };
        
        const extractedData = {};
        
        // Her pattern için değer çıkar
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = text.match(pattern);
            if (match) {
                if (key === 'boy_kilo') {
                    extractedData.boy = parseInt(match[1]);
                    extractedData.kilo = parseInt(match[2]);
                } else if (key === 'yas') {
                    extractedData.yas = parseInt(match[1]);
                } else if (key === 'vki') {
                    extractedData.vki = parseFloat(match[1]);
                } else if (key === 'cinsiyet') {
                    // Cinsiyet normalizasyonu
                    const gender = match[1].toLowerCase();
                    if (gender.includes('e') || gender === 'erkek') {
                        extractedData.cinsiyet = 'Erkek';
                    } else if (gender.includes('k') || gender === 'kadın') {
                        extractedData.cinsiyet = 'Kadın';
                    }
                } else {
                    extractedData[key] = match[1].trim();
                }
                console.log(`${key} bulundu:`, match[1]);
            }
        }
        
        // Şikayet bilgilerini çıkar
        const sikayetMatch = text.match(/(?:Şikayet|Şikayeti?)\s*:?\s*([^\.]+)/i);
        if (sikayetMatch) {
            extractedData.sikayet = sikayetMatch[1].trim();
        }
        
        // Kronik hastalıklar bilgisini çıkar
        const kronikMatch = text.match(/(?:Kronik\s*Hastalıklar?)\s*:?\s*([^\.]+)/i);
        if (kronikMatch) {
            extractedData.kronik_hastaliklar = kronikMatch[1].trim();
        }
        
        // Aile öyküsü bilgisini çıkar
        const aileMatch = text.match(/(?:Aile\s*Öyküsü)\s*:?\s*([^\.]+)/i);
        if (aileMatch) {
            extractedData.aile_oykusu = aileMatch[1].trim();
        }
        
        // Sigara/Alkol bilgisini çıkar
        const sigaraAlkolMatch = text.match(/(?:Sigara|Alkol)\s*[\/]?\s*(?:Alkol)?\s*:?\s*([^\.]+)/i);
        if (sigaraAlkolMatch) {
            extractedData.sigara_alkol = sigaraAlkolMatch[1].trim();
        }
        
        // Eğer TC kimlik no bulunamadıysa null döndür
        if (!extractedData.tc_kimlik_no) {
            console.log("TC Kimlik No bulunamadı, manuel çıkarma başarısız");
            return null;
        }
        
        // Timestamp'leri ekle
        extractedData.created_at = new Date().toISOString();
        extractedData.updated_at = new Date().toISOString();
        
        console.log("Manuel çıkarılan hasta verileri:", extractedData);
        return extractedData;
        
    } catch (error) {
        console.error("Manuel hasta verisi çıkarma hatası:", error);
        return null;
    }
}

/**
 * PDF'ten kan tahlili değerlerini çıkarır ve blood_test_results tablosuna kaydeder
 * @param {string} text - PDF'ten çıkarılan ham metin
 * @param {string} patientTc - Hasta TC kimlik numarası
 * @param {string} patientId - Hasta ID'si
 */
async function extractAndSaveBloodTestResults(text, patientTc, patientId = null) {
    try {
        // Kan tahlili değerlerini çıkarmak için regex pattern'ları
        const bloodTestPatterns = {
            // Hemogram
            hemoglobin: /(?:hemoglobin|hgb|hb)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl|mg\/dl|g\/dL)?/i,
            hematokrit: /(?:hematokrit|hct|htc)\s*:?\s*([0-9]+\.?[0-9]*)\s*%?/i,
            eritrosit: /(?:eritrosit|rbc|alyuvar)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:milyon|m|x10\^6)?/i,
            lökosit: /(?:lökosit|wbc|akyuvar|beyaz|leukosit)(?:\s*\(wbc\))?\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:bin|k|x10\^3)?/i,
            trombosit: /(?:trombosit|plt|platelet)(?:\s*\(plt\))?\s*:?\s*([0-9]+)\s*(?:bin|k|x10\^3)?/i,
            mcv: /(?:mcv)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:fl)?/i,
            mch: /(?:mch)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:pg)?/i,
            mchc: /(?:mchc)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl|g\/dL)?/i,
            rdw: /(?:rdw)\s*:?\s*([0-9]+\.?[0-9]*)\s*%?/i,
            
            // Biyokimya - Karaciğer Fonksiyonları (ALT, AST, GGT gibi)
            alt_sgpt: /(?:alanin\s*aminotransferaz|alt|sgpt|ALT)\s*\(?(?:SGPT)?\)?\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l|U\/L)?/i,
            ast_sgot: /(?:aspartat\s*aminotransferaz|ast|sgot|AST)\s*\(?(?:SGOT)?\)?\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l|U\/L)?/i,
            alp: /(?:alkalen\s*fosfataz|alp)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l|U\/L)?/i,
            ggt: /(?:gama\s*glutamil|gamma\s*glutamil|ggt|GGT)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:u\/l|iu\/l|U\/L)?/i,
            total_bilirubin: /(?:total\s*bilirubin|toplam\s*bilirubin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            
            // Biyokimya - Böbrek Fonksiyonları
            kan_üre_azotu: /(?:kan\s*üre\s*azotu|bun|blood\s*urea\s*nitrogen)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            kreatinin: /(?:kreatinin|creatinine)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            egfr: /(?:tahmini\s*glomerüler|egfr|estimated\s*gfr)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ml\/dk|ml\/min)?/i,
            
            // Biyokimya - Genel
            glukoz: /(?:glukoz|glucose|şeker)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            üre: /(?:üre|urea|ure)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            ürik_asit: /(?:ürik\s*asit|uric\s*acid)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            
            // Lipid Profili
            total_kolesterol: /(?:total\s*kolesterol|toplam\s*kolesterol|cholesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            ldl_kolesterol: /(?:ldl\s*kolesterol|ldl|kötü\s*kolesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            hdl_kolesterol: /(?:hdl\s*kolesterol|hdl|iyi\s*kolesterol)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            trigliserit: /(?:trigliserit|triglyceride)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            
            // Elektrolit Paneli
            sodyum: /(?:sodyum|sodium|na)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l|mEq\/L)?/i,
            potasyum: /(?:potasyum|potassium|k)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l|mEq\/L)?/i,
            klor: /(?:klor|chloride|cl)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l|mEq\/L)?/i,
            bikarbonat: /(?:bikarbonat|bicarbonate|hco3)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:meq\/l|mmol\/l|mEq\/L)?/i,
            kalsiyum: /(?:kalsiyum|calcium|ca)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            fosfor: /(?:fosfor|phosphorus|p)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            magnezyum: /(?:magnezyum|magnesium|mg)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/dl|mg\/dL)?/i,
            
            // Protein
            total_protein: /(?:total\s*protein|toplam\s*protein)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl|g\/dL)?/i,
            albumin: /(?:albumin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:g\/dl|g\/dL)?/i,
            
            // Tiroid
            tsh: /(?:tsh)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:miu\/l|μiu\/ml|mIU\/L)?/i,
            t3: /(?:t3)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/ml|ng\/dl|pg\/mL)?/i,
            t4: /(?:t4)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/dl|μg\/dl|ng\/dL)?/i,
            
            // Vitamin
            vitamin_b12: /(?:vitamin\s*b12|b12|cobalamin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:pg\/ml|pmol\/l|pg\/mL)?/i,
            vitamin_d: /(?:vitamin\s*d|25\s*oh\s*d)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|nmol\/l|ng\/mL)?/i,
            folik_asit: /(?:folik\s*asit|folic\s*acid|folate)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|nmol\/l|ng\/mL)?/i,
            
            // İnflamasyon
            crp: /(?:crp|c\s*reaktif\s*protein)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:mg\/l|mg\/dl|mg\/L)?/i,
            sedimentasyon: /(?:sedimentasyon|esr|sed)\s*:?\s*([0-9]+)\s*(?:mm\/saat|mm\/h)?/i,
            
            // Demir
            demir: /(?:demir|iron|fe)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:μg\/dl|mcg\/dl|μg\/dL)?/i,
            tibc: /(?:tibc|total\s*iron)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:μg\/dl|mcg\/dl|μg\/dL)?/i,
            ferritin: /(?:ferritin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|μg\/l|ng\/mL)?/i,
            
            // Hormon
            insulin: /(?:insulin|insülin)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:μiu\/ml|miu\/l|μIU\/mL)?/i,
            hba1c: /(?:hba1c|hemoglobin\s*a1c)\s*:?\s*([0-9]+\.?[0-9]*)\s*%?/i,
            
            // Kardiyak
            troponin_i: /(?:troponin\s*i|trop\s*i)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|μg\/l|ng\/mL)?/i,
            ck_mb: /(?:ck\s*mb|ck-mb)\s*:?\s*([0-9]+\.?[0-9]*)\s*(?:ng\/ml|u\/l|ng\/mL)?/i,
            
            // Viral Belirteçler (Hepatit)
            hbsag: /(?:HBSAG|HBsAg|HBs Ag)[\s.:]*([a-zA-Z0-9.,()\s+-]+)/i,
            anti_hcv: /(?:ANTI-HCV|Anti-HCV|Anti HCV)[\s.:]*([a-zA-Z0-9.,()\s+-]+)/i,
            
            // Fotoğraftaki özel değerler
            mcv_fl: /mcv\s*([0-9]+\.?[0-9]*)\s*fl/i,
            mch_pg: /mch\s*([0-9]+\.?[0-9]*)\s*pg/i,
            mchc_gdl: /mchc\s*([0-9]+\.?[0-9]*)\s*g\/dl/i,
            rdw_cv: /rdw\s*cv\s*([0-9]+\.?[0-9]*)\s*%/i
        };
        
        // Değerleri çıkar
        console.log("--- Raw PDF Text Start ---");
        console.log(text);
        console.log("--- Raw PDF Text End ---");
        const extractedValues = {};
        
        for (const [testName, pattern] of Object.entries(bloodTestPatterns)) {
            const match = text.match(pattern);
            if (testName === 'hbsag' || testName === 'anti_hcv') {
                console.log(`Matching for ${testName}:`, text.match(pattern));
            }
            if (match && match[1]) {
                let value = match[1].trim();
                
                // Pozitif/Negatif değerler için
                if (value.toLowerCase().includes('pozitif') || value === '+') {
                    extractedValues[testName] = 'Pozitif';
                } else if (value.toLowerCase().includes('negatif') || value === '-') {
                    extractedValues[testName] = 'Negatif';
                } else if (!isNaN(value)) {
                    // Sayısal değerleri parse et
                    extractedValues[testName] = parseFloat(value);
                } else {
                    extractedValues[testName] = value;
                }
            }
        }
        
        // Özel durumlar için ek kontroller
        // ALT (SGPT) formatı için
        const altMatch = text.match(/alt\s*\(sgpt\)\s*([0-9]+)/i);
        if (altMatch && !extractedValues.alt_sgpt) {
            extractedValues.alt_sgpt = parseFloat(altMatch[1]);
        }
        
        // AST (SGOT) formatı için
        const astMatch = text.match(/ast\s*\(sgot\)\s*([0-9]+)/i);
        if (astMatch && !extractedValues.ast_sgot) {
            extractedValues.ast_sgot = parseFloat(astMatch[1]);
        }
        
        // GGT formatı için
        const ggtMatch = text.match(/ggt\s*([0-9]+)/i);
        if (ggtMatch && !extractedValues.ggt) {
            extractedValues.ggt = parseFloat(ggtMatch[1]);
        }
        
        // Total Bilirubin formatı için
        const bilirubinMatch = text.match(/total\s*bilirubin\s*([0-9]+\.?[0-9]*)/i);
        if (bilirubinMatch && !extractedValues.total_bilirubin) {
            extractedValues.total_bilirubin = parseFloat(bilirubinMatch[1]);
        }
        
        // Hemoglobin formatı için
        const hgbMatch = text.match(/hemoglobin\s*([0-9]+\.?[0-9]*)/i);
        if (hgbMatch && !extractedValues.hemoglobin) {
            extractedValues.hemoglobin = parseFloat(hgbMatch[1]);
        }
        
        // Lökosit (WBC) formatı için
        const wbcMatch = text.match(/lökosit\s*\(wbc\)\s*([0-9]+\.?[0-9]*)/i);
        if (wbcMatch && !extractedValues.lökosit) {
            extractedValues.lökosit = parseFloat(wbcMatch[1]);
        }
        
        // Trombosit (PLT) formatı için
        const pltMatch = text.match(/trombosit\s*\(plt\)\s*([0-9]+)/i);
        if (pltMatch && !extractedValues.trombosit) {
            extractedValues.trombosit = parseFloat(pltMatch[1]);
        }
        
        console.log('Çıkarılan kan tahlili değerleri:', extractedValues);
        
        // Tarih çıkarma
        const dateMatch = text.match(/(?:Tarih|Test Tarihi|Numune Tarihi)\s*:\s*([0-9]{1,2}[.\/][0-9]{1,2}[.\/][0-9]{4})/i);
        let testDate = new Date(); // Varsayılan olarak bugünün tarihi
        if (dateMatch && dateMatch[1]) {
            const dateParts = dateMatch[1].split(/[.\/]/);
            if (dateParts.length === 3) {
                // Format: DD.MM.YYYY veya MM/DD/YYYY
                testDate = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
            }
        }

        const bloodTestData = {
            patient_tc: patientTc,
            test_date: testDate.toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...extractedValues
        };
        
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
        
        console.log('Prepared blood test data for saving:', JSON.stringify(bloodTestData, null, 2));

        if (hasBloodTestData) {
            console.log(`Checking for existing blood test for TC: ${patientTc} on date: ${bloodTestData.test_date}`);
            // Aynı hasta için aynı gün kayıt var mı kontrol et
            const { data: existingTest, error: fetchError } = await supabase
                .from('blood_test_results')
                .select('id')
                .eq('patient_tc', patientTc)
                .eq('test_date', bloodTestData.test_date)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: 'No rows found'
                console.error('Error fetching existing blood test:', fetchError);
            }

            if (existingTest && !fetchError) {
                // Mevcut kaydı güncelle
                const { data, error } = await supabase
                    .from('blood_test_results')
                    .update(bloodTestData)
                    .eq('id', existingTest.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Kan tahlili güncelleme hatası:', error);
                } else {
                    console.log('Kan tahlili başarıyla güncellendi:', data.id);
                }
            } else if (fetchError && fetchError.code !== 'PGRST116') {
                console.log('Skipping update due to fetch error.');
            } else {
                // Yeni kayıt oluştur
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
            }
        } else {
            console.log('PDF\'te kan tahlili değeri bulunamadı');
        }
        
    } catch (error) {
        console.error('Kan tahlili çıkarma hatası:', error);
    }
}

module.exports = { parsePatientPdf };