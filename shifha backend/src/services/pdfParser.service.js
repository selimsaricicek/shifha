const pdfParse = require('pdf-parse');

async function parsePatientPdf(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error('Geçersiz PDF verisi');
    }

  const data = await pdfParse(buffer);
  const text = data.text;

  return {
    kimlik_bilgileri: {
      ad_soyad: '', tc_kimlik_no: '', dogum_tarihi: '', yas: '', cinsiyet: '', boy: '', kilo: '', vki: '', kan_grubu: '', medeni_durum: '', meslek: '', egitim_durumu: ''
    },
    basvuru_bilgileri: { tarih: '', nedeni: '', sikayet_suresi: '', baslangic_sekli: '', oncesi_islemler: '' },
    tibbi_gecmis: { kronik_hastaliklar: [], ameliyatlar: [], allerjiler: [], aile_oykusu: [], enfeksiyonlar: [] },
    ilaclar: { duzenli: [], duzensiz: [], alternatif: [] },
    yasam_tarzi: { meslek: '', hareket: '', uyku: '', sigara_alkol: '', beslenme: '', psikoloji: '', uyku_bozuklugu: '', sosyal_destek: '' },
    fizik_muayene: { vital_bulgular: '', sistem_bulgulari: '' },
    laboratuvar: { biyokimya: [], hematoloji: [], hormonlar: [], koagulasyon: [], idrar: [], goruntuleme: [] },
    tani: { icd10: '', doktor_tani: '', ayirici_tani: [] },
    plan_oneri: { tetkik: [], izlem: '', egitim: '', yonlendirme: [] }
  };
}

module.exports = { parsePatientPdf };
