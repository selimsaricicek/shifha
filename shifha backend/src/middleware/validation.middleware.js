const { z } = require('zod');

const patientSchema = z.object({
  tc_kimlik_no: z.string().length(11, 'TC Kimlik No 11 haneli olmalı'),
  ad_soyad: z.string().min(2, 'Ad Soyad en az 2 karakter olmalı'),
  // Diğer alanlar opsiyonel
  dogum_tarihi: z.string().optional(),
  yas: z.union([z.string(), z.number()]).optional(),
  cinsiyet: z.string().optional(),
  boy: z.union([z.string(), z.number()]).optional(),
  kilo: z.union([z.string(), z.number()]).optional(),
  kan_grubu: z.string().optional(),
  tibbi_gecmis: z.any().optional(),
  laboratuvar: z.any().optional(),
  tani: z.any().optional(),
  plan: z.any().optional(),
  // ... diğer alanlar da eklenebilir ...
});

function validatePatient(req, res, next) {
  try {
    patientSchema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Geçersiz veri', details: err.errors });
  }
}

module.exports = { validatePatient }; 