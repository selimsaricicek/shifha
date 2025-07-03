const pdfParse = require('pdf-parse');
const supabase = require('./supabaseClient');
const { getStructuredDataFromText } = require('./gemini.service');

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
    return patient;
}

module.exports = { parsePatientPdf };