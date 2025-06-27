const supabase = require('../services/supabaseClient');

// Get patient by TC Kimlik No
exports.getPatient = async (req, res) => {
  const tc = req.params.tc_kimlik_no;
  if (!tc) return res.status(400).json({ error: 'TC Kimlik No gerekli.' });
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('tc_kimlik_no', tc)
    .single();
  if (error || !patient) return res.status(404).json({ error: error?.message || 'Hasta bulunamadı.' });
  res.json({ patient });
};

// Update patient by TC Kimlik No
exports.updatePatient = async (req, res) => {
  const tc = req.params.tc_kimlik_no;
  if (!tc) return res.status(400).json({ error: 'TC Kimlik No gerekli.' });
  const updateFields = req.body;
  if (!updateFields || Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: 'Güncellenecek veri yok.' });
  }
  // Güncelleme işlemi
  const { error: updateError } = await supabase
    .from('patients')
    .update(updateFields)
    .eq('tc_kimlik_no', tc);
  if (updateError) return res.status(500).json({ error: updateError.message });
  // Güncel hasta kaydını tekrar çek
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('tc_kimlik_no', tc)
    .single();
  if (error || !patient) return res.status(404).json({ error: error?.message || 'Hasta bulunamadı.' });
  res.json({ success: true, patient });
};
