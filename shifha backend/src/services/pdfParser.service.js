const pdfParse = require('pdf-parse');
const supabase = require('./supabaseClient');

function extractField(text, label, options = {}) {
  const regex = new RegExp(label + ':\s*(.*)', 'i');
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

    console.log("------- PDF'ten Çıkarılan Ham Metin -------")
    console.log(text)
    console.log("------------------------------------------")

    // Temel alanları çıkar
    const kimlik_bilgileri = {
      ad_soyad: extractField(text, 'Ad Soyad'),
      tc_kimlik_no: extractField(text, 'T.C. Kimlik No'),
      dogum_tarihi: extractField(text, 'Doğum Tarihi'),
      yas: extractField(text, 'Yaş'),
      cinsiyet: extractField(text, 'Cinsiyet'),
      boy: extractField(text, 'Boy'),
      kilo: extractField(text, 'Kilo'),
      vki: extractField(text, 'VKİ'),
      kan_grubu: extractField(text, 'Kan Grubu'),
      medeni_durum: extractField(text, 'Medeni Durum'),
      meslek: extractField(text, 'Meslek'),
      egitim_durumu: extractField(text, 'Eğitim Durumu'),
    };
    const tibbi_gecmis = {
      kronik_hastaliklar: extractField(text, 'Kronik Hastalıklar', {type:'array'}),
      ameliyatlar: extractField(text, 'Ameliyatlar', {type:'array'}),
      allerjiler: extractField(text, 'Allerjiler', {type:'array'}),
      aile_oykusu: extractField(text, 'Aile Öyküsü', {type:'array'}),
      enfeksiyonlar: extractField(text, 'Enfeksiyonlar', {type:'array'}),
    };
    const ilaclar = {
      duzenli: extractField(text, 'Düzenli', {type:'array'}),
      duzensiz: extractField(text, 'Düzensiz', {type:'array'}),
      alternatif: extractField(text, 'Alternatif', {type:'array'}),
    };
    const yasam_tarzi = {
      meslek: extractField(text, 'Meslek'),
      hareket: extractField(text, 'Hareket'),
      uyku: extractField(text, 'Uyku'),
      sigara_alkol: extractField(text, 'Sigara/Alkol'),
      beslenme: extractField(text, 'Beslenme'),
      psikoloji: extractField(text, 'Psikoloji'),
      uyku_bozuklugu: extractField(text, 'Uyku Bozukluğu'),
      sosyal_destek: extractField(text, 'Sosyal Destek'),
    };

    const tc = kimlik_bilgileri.tc_kimlik_no;
    if (!tc) throw new Error('PDF içinde TC Kimlik No bulunamadı!');
    const upsertData = {
      tc_kimlik_no: tc,
      ad_soyad: kimlik_bilgileri.ad_soyad,
      dogum_tarihi: kimlik_bilgileri.dogum_tarihi,
      yas: kimlik_bilgileri.yas ? Number(kimlik_bilgileri.yas) : null,
      cinsiyet: kimlik_bilgileri.cinsiyet,
      boy: kimlik_bilgileri.boy,
      kilo: kimlik_bilgileri.kilo,
      vki: kimlik_bilgileri.vki,
      kan_grubu: kimlik_bilgileri.kan_grubu,
      medeni_durum: kimlik_bilgileri.medeni_durum,
      meslek: kimlik_bilgileri.meslek,
      egitim_durumu: kimlik_bilgileri.egitim_durumu,
      kronik_hastaliklar: arrToString(tibbi_gecmis.kronik_hastaliklar),
      ameliyatlar: arrToString(tibbi_gecmis.ameliyatlar),
      allerjiler: arrToString(tibbi_gecmis.allerjiler),
      aile_oykusu: arrToString(tibbi_gecmis.aile_oykusu),
      enfeksiyonlar: arrToString(tibbi_gecmis.enfeksiyonlar),
      ilac_duzenli: arrToString(ilaclar.duzenli),
      ilac_duzensiz: arrToString(ilaclar.duzensiz),
      ilac_alternatif: arrToString(ilaclar.alternatif),
      hareket: yasam_tarzi.hareket,
      uyku: yasam_tarzi.uyku,
      sigara_alkol: yasam_tarzi.sigara_alkol,
      beslenme: yasam_tarzi.beslenme,
      psikoloji: yasam_tarzi.psikoloji,
      uyku_bozuklugu: yasam_tarzi.uyku_bozuklugu,
      sosyal_destek: yasam_tarzi.sosyal_destek,
      patient_data: {
        kimlik_bilgileri,
        tibbi_gecmis,
        ilaclar,
        yasam_tarzi,
      },
      updated_at: new Date().toISOString(),
    };
    // await supabase.from('patients').upsert(upsertData, { onConflict: 'tc_kimlik_no' });
    // const { data: patient, error } = await supabase.from('patients').select('*').eq('tc_kimlik_no', tc).single();
    // if (error || !patient) throw new Error('Hasta kaydı alınamadı: ' + (error?.message || 'Bilinmeyen hata'));
    // return patient;
    {const { data, error } = await supabase
    .from('patients')
    .upsert(upsertData, { onConflict: 'tc_kimlik_no' })
    .select()
    .single();
    if (error) throw new Error('Hasta kaydı oluşturulamadı/güncellenemedi: ' + error.message);
    return data;
    if (error){
      throw new Error('Hasta kaydı oluşturulamadı/güncellenemedi: ' + error.message);
    }
    return data;}
    
}

module.exports = { parsePatientPdf };
