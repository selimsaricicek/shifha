const express = require('express');
const router = express.Router();
const supabase = require('../services/supabaseClient');
const geminiService = require('../services/gemini.service');

/**
 * Kan tahlili sonuçlarını AI ile analiz eder
 * POST /api/medical-analysis/blood-test
 */
router.post('/blood-test', async (req, res) => {
  try {
    const { patient_tc, blood_test_results } = req.body;

    if (!patient_tc || !blood_test_results) {
      return res.status(400).json({
        success: false,
        message: 'Hasta TC kimlik numarası ve kan tahlili sonuçları gereklidir'
      });
    }

    console.log('AI analiz başlatılıyor...', { patient_tc, blood_test_results });

    // Hasta bilgilerini al
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('tc_kimlik_no', patient_tc)
      .single();

    if (patientError) {
      console.error('Hasta bilgileri alınamadı:', patientError);
      return res.status(404).json({
        success: false,
        message: 'Hasta bulunamadı'
      });
    }

    // Kan tahlili verilerini formatla
    const bloodTestText = Object.entries(blood_test_results)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Hasta bilgilerini formatla
    const patientInfo = `
Hasta Bilgileri:
- Ad Soyad: ${patient.ad_soyad}
- Yaş: ${patient.yas}
- Cinsiyet: ${patient.cinsiyet}
- Kronik Hastalıklar: ${patient.kronik_hastaliklar || 'Yok'}

Kan Tahlili Sonuçları:
${bloodTestText}
    `;

    console.log('Gemini AI\'ya gönderilen veri:', patientInfo);

    // Gemini AI ile analiz yap
    const aiAnalysis = await geminiService.getStructuredDataFromText(patientInfo);
    
    console.log('Gemini AI yanıtı:', aiAnalysis);

    // Kan tahlili kaydını veritabanına ekle
    const { data: bloodTest, error: bloodTestError } = await supabase
      .from('blood_test_results')
      .insert({
        patient_tc,
        test_date: new Date().toISOString().split('T')[0],
        ...blood_test_results,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bloodTestError) {
      console.error('Kan tahlili kaydedilemedi:', bloodTestError);
    }

    // AI analiz sonucunu veritabanına kaydet (RLS bypass için service_role kullan)
    try {
      console.log('AI analiz sonucu başarıyla oluşturuldu:', aiAnalysis?.patient_data?.hastaVeriAnaliziOzeti);
      
      // Veritabanı kaydetme ve diğer işlemler burada yapılabilir.
      
      // const { data: analysisRecord, error: analysisError } = await supabase
      //   .from('blood_test_analysis')
      //   .insert({
      //     user_id: null, // NULL değer ile RLS bypass
      //     patient_tc_kimlik_no: patient_tc,
      //     results: JSON.stringify(blood_test_results),
      //     gemini_response: JSON.stringify(aiAnalysis),
      //     created_at: new Date().toISOString()
      //   })
      //   .select()
      //   .single();

      // if (analysisError) {
      //   console.error('AI analiz sonucu kaydedilemedi:', analysisError);
      //   // RLS hatası olsa bile devam et
      // } else {
      //   console.log('AI analiz sonucu başarıyla kaydedildi:', analysisRecord?.id);
      // }
    } catch (insertError) {
      console.error('Insert hatası:', insertError);
      // Hata olsa bile devam et
    }

    res.json({
      success: true,
      data: aiAnalysis
    });

  } catch (error) {
    console.error('Kan tahlili analizi hatası:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kan tahlili analizi sırasında bir hata oluştu'
    });
  }
});

/**
 * Hasta için tüm tıbbi analizleri getirir
 * GET /api/medical-analysis/patient/:tc
 */
router.get('/patient/:tc', async (req, res) => {
  try {
    const { tc } = req.params;

    console.log('Hasta için AI analizleri getiriliyor:', tc);

    // Hasta için tüm AI analizlerini getir
    const { data: analyses, error } = await supabase
      .from('blood_test_analysis')
      .select(`
        *
      `)
      .eq('patient_tc_kimlik_no', tc)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('AI analizleri getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'AI analizleri getirilemedi'
      });
    }

    console.log('Bulunan AI analizleri:', analyses?.length || 0);

    res.json({
      success: true,
      data: analyses || []
    });

  } catch (error) {
    console.error('AI analizleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI analizleri getirilirken bir hata oluştu'
    });
  }
});

/**
 * Belirli bir analizi getirir
 * GET /api/medical-analysis/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: analysis, error } = await supabase
      .from('blood_test_analysis')
      .select(`
        *,
        patients!blood_test_analysis_patient_tc_kimlik_no_fkey (ad_soyad, yas, cinsiyet, kronik_hastaliklar)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Tıbbi analiz getirme hatası:', error);
      return res.status(500).json({
        success: false,
        message: 'Tıbbi analiz getirilemedi'
      });
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Tıbbi analiz bulunamadı'
      });
    }

    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Tıbbi analiz getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Tıbbi analiz getirilirken bir hata oluştu'
    });
  }
});

module.exports = router;