import React, { useState } from 'react';

// JSON şemasına uygun otomatik ve manuel doldurulabilir form
export default function PatientDataForm({ initialData, onChange }) {
  const [form, setForm] = useState(initialData);

  // Alan güncelleme fonksiyonu
  const handleField = (section, field, value) => {
    setForm(prev => {
      const updated = { ...prev, [section]: { ...prev[section], [field]: value } };
      onChange && onChange(updated);
      return updated;
    });
  };

  // Dizi alanlar için
  const handleArrayField = (section, field, value) => {
    setForm(prev => {
      const updated = { ...prev, [section]: { ...prev[section], [field]: value.split(',').map(s => s.trim()) } };
      onChange && onChange(updated);
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold mb-2">Kimlik ve Demografik Bilgiler</h4>
          <input className="input" placeholder="Ad Soyad" value={form.kimlik_bilgileri.ad_soyad} onChange={e => handleField('kimlik_bilgileri', 'ad_soyad', e.target.value)} />
          <input className="input" placeholder="T.C. Kimlik No" value={form.kimlik_bilgileri.tc_kimlik_no} onChange={e => handleField('kimlik_bilgileri', 'tc_kimlik_no', e.target.value)} />
          <input className="input" placeholder="Doğum Tarihi" value={form.kimlik_bilgileri.dogum_tarihi} onChange={e => handleField('kimlik_bilgileri', 'dogum_tarihi', e.target.value)} />
          <input className="input" placeholder="Yaş" value={form.kimlik_bilgileri.yas} onChange={e => handleField('kimlik_bilgileri', 'yas', e.target.value)} />
          <input className="input" placeholder="Cinsiyet" value={form.kimlik_bilgileri.cinsiyet} onChange={e => handleField('kimlik_bilgileri', 'cinsiyet', e.target.value)} />
          <input className="input" placeholder="Boy" value={form.kimlik_bilgileri.boy} onChange={e => handleField('kimlik_bilgileri', 'boy', e.target.value)} />
          <input className="input" placeholder="Kilo" value={form.kimlik_bilgileri.kilo} onChange={e => handleField('kimlik_bilgileri', 'kilo', e.target.value)} />
          <input className="input" placeholder="VKİ" value={form.kimlik_bilgileri.vki} onChange={e => handleField('kimlik_bilgileri', 'vki', e.target.value)} />
          <input className="input" placeholder="Kan Grubu" value={form.kimlik_bilgileri.kan_grubu} onChange={e => handleField('kimlik_bilgileri', 'kan_grubu', e.target.value)} />
          <input className="input" placeholder="Medeni Durum" value={form.kimlik_bilgileri.medeni_durum} onChange={e => handleField('kimlik_bilgileri', 'medeni_durum', e.target.value)} />
          <input className="input" placeholder="Meslek" value={form.kimlik_bilgileri.meslek} onChange={e => handleField('kimlik_bilgileri', 'meslek', e.target.value)} />
          <input className="input" placeholder="Eğitim Durumu" value={form.kimlik_bilgileri.egitim_durumu} onChange={e => handleField('kimlik_bilgileri', 'egitim_durumu', e.target.value)} />
        </div>
        <div>
          <h4 className="font-bold mb-2">Başvuru Bilgileri</h4>
          <input className="input" placeholder="Başvuru Tarihi" value={form.basvuru_bilgileri.tarih} onChange={e => handleField('basvuru_bilgileri', 'tarih', e.target.value)} />
          <input className="input" placeholder="Başvuru Nedeni" value={form.basvuru_bilgileri.nedeni} onChange={e => handleField('basvuru_bilgileri', 'nedeni', e.target.value)} />
          <input className="input" placeholder="Şikayet Süresi" value={form.basvuru_bilgileri.sikayet_suresi} onChange={e => handleField('basvuru_bilgileri', 'sikayet_suresi', e.target.value)} />
          <input className="input" placeholder="Başlangıç Şekli" value={form.basvuru_bilgileri.baslangic_sekli} onChange={e => handleField('basvuru_bilgileri', 'baslangic_sekli', e.target.value)} />
          <input className="input" placeholder="Öncesi İşlemler" value={form.basvuru_bilgileri.oncesi_islemler} onChange={e => handleField('basvuru_bilgileri', 'oncesi_islemler', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold mb-2">Tıbbi Geçmiş</h4>
          <input className="input" placeholder="Kronik Hastalıklar (virgülle ayır)" value={form.tibbi_gecmis.kronik_hastaliklar.join(', ')} onChange={e => handleArrayField('tibbi_gecmis', 'kronik_hastaliklar', e.target.value)} />
          <input className="input" placeholder="Ameliyatlar (virgülle ayır)" value={form.tibbi_gecmis.ameliyatlar.join(', ')} onChange={e => handleArrayField('tibbi_gecmis', 'ameliyatlar', e.target.value)} />
          <input className="input" placeholder="Allerjiler (virgülle ayır)" value={form.tibbi_gecmis.allerjiler.join(', ')} onChange={e => handleArrayField('tibbi_gecmis', 'allerjiler', e.target.value)} />
          <input className="input" placeholder="Aile Öyküsü (virgülle ayır)" value={form.tibbi_gecmis.aile_oykusu.join(', ')} onChange={e => handleArrayField('tibbi_gecmis', 'aile_oykusu', e.target.value)} />
          <input className="input" placeholder="Enfeksiyonlar (virgülle ayır)" value={form.tibbi_gecmis.enfeksiyonlar.join(', ')} onChange={e => handleArrayField('tibbi_gecmis', 'enfeksiyonlar', e.target.value)} />
        </div>
        <div>
          <h4 className="font-bold mb-2">Kullandığı İlaçlar</h4>
          <input className="input" placeholder="Düzenli İlaçlar (virgülle ayır)" value={form.ilaclar.duzenli.join(', ')} onChange={e => handleArrayField('ilaclar', 'duzenli', e.target.value)} />
          <input className="input" placeholder="Düzensiz İlaçlar (virgülle ayır)" value={form.ilaclar.duzensiz.join(', ')} onChange={e => handleArrayField('ilaclar', 'duzensiz', e.target.value)} />
          <input className="input" placeholder="Alternatif Tedaviler (virgülle ayır)" value={form.ilaclar.alternatif.join(', ')} onChange={e => handleArrayField('ilaclar', 'alternatif', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold mb-2">Yaşam Tarzı / Sosyal Bilgiler</h4>
          <input className="input" placeholder="Meslek" value={form.yasam_tarzi.meslek} onChange={e => handleField('yasam_tarzi', 'meslek', e.target.value)} />
          <input className="input" placeholder="Hareket" value={form.yasam_tarzi.hareket} onChange={e => handleField('yasam_tarzi', 'hareket', e.target.value)} />
          <input className="input" placeholder="Uyku" value={form.yasam_tarzi.uyku} onChange={e => handleField('yasam_tarzi', 'uyku', e.target.value)} />
          <input className="input" placeholder="Sigara/Alkol" value={form.yasam_tarzi.sigara_alkol} onChange={e => handleField('yasam_tarzi', 'sigara_alkol', e.target.value)} />
          <input className="input" placeholder="Beslenme" value={form.yasam_tarzi.beslenme} onChange={e => handleField('yasam_tarzi', 'beslenme', e.target.value)} />
          <input className="input" placeholder="Psikoloji" value={form.yasam_tarzi.psikoloji} onChange={e => handleField('yasam_tarzi', 'psikoloji', e.target.value)} />
          <input className="input" placeholder="Uyku Bozukluğu" value={form.yasam_tarzi.uyku_bozuklugu} onChange={e => handleField('yasam_tarzi', 'uyku_bozuklugu', e.target.value)} />
          <input className="input" placeholder="Sosyal Destek" value={form.yasam_tarzi.sosyal_destek} onChange={e => handleField('yasam_tarzi', 'sosyal_destek', e.target.value)} />
        </div>
        <div>
          <h4 className="font-bold mb-2">Fizik Muayene</h4>
          <input className="input" placeholder="Vital Bulgular" value={form.fizik_muayene.vital_bulgular} onChange={e => handleField('fizik_muayene', 'vital_bulgular', e.target.value)} />
          <input className="input" placeholder="Sistem Bulguları" value={form.fizik_muayene.sistem_bulgulari} onChange={e => handleField('fizik_muayene', 'sistem_bulgulari', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold mb-2">Laboratuvar Sonuçları</h4>
          <input className="input" placeholder="Biyokimya (virgülle ayır)" value={form.laboratuvar.biyokimya.join(', ')} onChange={e => handleArrayField('laboratuvar', 'biyokimya', e.target.value)} />
          <input className="input" placeholder="Hematoloji (virgülle ayır)" value={form.laboratuvar.hematoloji.join(', ')} onChange={e => handleArrayField('laboratuvar', 'hematoloji', e.target.value)} />
          <input className="input" placeholder="Hormonlar (virgülle ayır)" value={form.laboratuvar.hormonlar.join(', ')} onChange={e => handleArrayField('laboratuvar', 'hormonlar', e.target.value)} />
          <input className="input" placeholder="Koagülasyon (virgülle ayır)" value={form.laboratuvar.koagulasyon.join(', ')} onChange={e => handleArrayField('laboratuvar', 'koagulasyon', e.target.value)} />
          <input className="input" placeholder="İdrar (virgülle ayır)" value={form.laboratuvar.idrar.join(', ')} onChange={e => handleArrayField('laboratuvar', 'idrar', e.target.value)} />
          <input className="input" placeholder="Görüntüleme (virgülle ayır)" value={form.laboratuvar.goruntuleme.join(', ')} onChange={e => handleArrayField('laboratuvar', 'goruntuleme', e.target.value)} />
        </div>
        <div>
          <h4 className="font-bold mb-2">Tanı / Ön Tanı / İzlenim</h4>
          <input className="input" placeholder="ICD-10" value={form.tani.icd10} onChange={e => handleField('tani', 'icd10', e.target.value)} />
          <input className="input" placeholder="Doktor Tanı" value={form.tani.doktor_tani} onChange={e => handleField('tani', 'doktor_tani', e.target.value)} />
          <input className="input" placeholder="Ayırıcı Tanılar (virgülle ayır)" value={form.tani.ayirici_tani.join(', ')} onChange={e => handleArrayField('tani', 'ayirici_tani', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold mb-2">Plan ve Öneriler</h4>
          <input className="input" placeholder="Tetkik (virgülle ayır)" value={form.plan_oneri.tetkik.join(', ')} onChange={e => handleArrayField('plan_oneri', 'tetkik', e.target.value)} />
          <input className="input" placeholder="İzlem" value={form.plan_oneri.izlem} onChange={e => handleField('plan_oneri', 'izlem', e.target.value)} />
          <input className="input" placeholder="Eğitim" value={form.plan_oneri.egitim} onChange={e => handleField('plan_oneri', 'egitim', e.target.value)} />
          <input className="input" placeholder="Yönlendirme (virgülle ayır)" value={form.plan_oneri.yonlendirme.join(', ')} onChange={e => handleArrayField('plan_oneri', 'yonlendirme', e.target.value)} />
        </div>
      </div>
    </div>
  );
}
