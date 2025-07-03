import { z } from 'zod';

export const patientSchema = z.object({
  kimlik_bilgileri: z.object({
    ad_soyad: z.string().min(1, 'Ad soyad zorunlu'),
    tc_kimlik_no: z.string().min(11, 'TC Kimlik No 11 haneli olmalı'),
    dogum_tarihi: z.string().min(1, 'Doğum tarihi zorunlu'),
    yas: z.string().min(1, 'Yaş zorunlu'),
    cinsiyet: z.string().min(1, 'Cinsiyet zorunlu'),
    boy: z.string().optional(),
    kilo: z.string().optional(),
    vki: z.string().optional(),
    kan_grubu: z.string().optional(),
    medeni_durum: z.string().optional(),
    meslek: z.string().optional(),
    egitim_durumu: z.string().optional(),
  }),
  // Diğer alanlar da eklenebilir
});
