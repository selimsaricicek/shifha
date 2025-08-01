const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// KONSÜLTASYON YÖNETİMİ
// =====================================================

// Konsültasyon isteği oluştur
const createConsultation = async (req, res) => {
  try {
    const {
      organizationId,
      consultingDoctorId,
      patientTc,
      departmentId,
      title,
      description,
      urgencyLevel = 'normal',
      consultationType = 'opinion'
    } = req.body;
    const userId = req.user.id;

    // İstek yapan doktorun bilgilerini al
    const { data: requestingDoctor, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (doctorError || !requestingDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Doktor profili bulunamadı'
      });
    }

    // Kullanıcının organizasyona erişimi var mı kontrol et
    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg) {
      return res.status(403).json({
        success: false,
        message: 'Bu organizasyona erişim yetkiniz yok'
      });
    }

    // Hastanın bu organizasyonda erişim yetkisi var mı kontrol et
    const { data: patientAccess, error: accessError } = await supabase
      .from('patient_access_permissions')
      .select('*')
      .eq('patient_tc', patientTc)
      .eq('doctor_id', requestingDoctor.id)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (accessError || !patientAccess) {
      return res.status(403).json({
        success: false,
        message: 'Bu hastaya erişim yetkiniz yok'
      });
    }

    // Konsültasyon isteği oluştur
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .insert({
        organization_id: organizationId,
        requesting_doctor_id: requestingDoctor.id,
        consulting_doctor_id: consultingDoctorId,
        patient_tc: patientTc,
        department_id: departmentId,
        title,
        description,
        urgency_level: urgencyLevel,
        consultation_type: consultationType
      })
      .select(`
        *,
        requesting_doctor:doctor_profiles!consultations_requesting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization
        ),
        consulting_doctor:doctor_profiles!consultations_consulting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization
        ),
        patients (
          tc_kimlik_no,
          first_name,
          last_name,
          birth_date
        ),
        departments (
          id,
          name
        )
      `)
      .single();

    if (consultationError) throw consultationError;

    // Konsültan doktora bildirim gönder
    if (consultingDoctorId) {
      const { data: consultingDoctorProfile } = await supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('id', consultingDoctorId)
        .single();

      if (consultingDoctorProfile) {
        await supabase
          .from('notifications')
          .insert({
            user_id: consultingDoctorProfile.user_id,
            organization_id: organizationId,
            type: 'consultation',
            title: 'Yeni Konsültasyon İsteği',
            content: `${consultation.requesting_doctor.first_name} ${consultation.requesting_doctor.last_name} tarafından "${title}" konulu konsültasyon isteği`,
            reference_id: consultation.id
          });
      }
    }

    res.status(201).json({
      success: true,
      data: consultation,
      message: 'Konsültasyon isteği başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Konsültasyon oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konsültasyon isteği oluşturulamadı',
      error: error.message
    });
  }
};

// Doktorun konsültasyonlarını getir
const getDoctorConsultations = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { status, type = 'all' } = req.query; // type: 'requested', 'received', 'all'
    const userId = req.user.id;

    // Doktor profilini al
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (doctorError || !doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Doktor profili bulunamadı'
      });
    }

    let query = supabase
      .from('consultations')
      .select(`
        *,
        requesting_doctor:doctor_profiles!consultations_requesting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization,
          profile_image_url
        ),
        consulting_doctor:doctor_profiles!consultations_consulting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization,
          profile_image_url
        ),
        patients (
          tc_kimlik_no,
          first_name,
          last_name,
          birth_date
        ),
        departments (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId);

    // Konsültasyon tipine göre filtrele
    if (type === 'requested') {
      query = query.eq('requesting_doctor_id', doctorProfile.id);
    } else if (type === 'received') {
      query = query.eq('consulting_doctor_id', doctorProfile.id);
    } else {
      query = query.or(`requesting_doctor_id.eq.${doctorProfile.id},consulting_doctor_id.eq.${doctorProfile.id}`);
    }

    // Durum filtresi
    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('requested_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Konsültasyonları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konsültasyonlar getirilemedi',
      error: error.message
    });
  }
};

// Konsültasyon detaylarını getir
const getConsultationDetails = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const userId = req.user.id;

    // Doktor profilini al
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (doctorError || !doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Doktor profili bulunamadı'
      });
    }

    // Konsültasyon detaylarını getir
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select(`
        *,
        requesting_doctor:doctor_profiles!consultations_requesting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization,
          profile_image_url,
          email,
          phone
        ),
        consulting_doctor:doctor_profiles!consultations_consulting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization,
          profile_image_url,
          email,
          phone
        ),
        patients (
          tc_kimlik_no,
          first_name,
          last_name,
          birth_date,
          gender,
          phone,
          email
        ),
        departments (
          id,
          name
        ),
        consultation_attachments (
          id,
          file_name,
          file_url,
          file_type,
          uploaded_at
        )
      `)
      .eq('id', consultationId)
      .single();

    if (consultationError) throw consultationError;

    // Kullanıcının bu konsültasyona erişimi var mı kontrol et
    if (consultation.requesting_doctor_id !== doctorProfile.id && 
        consultation.consulting_doctor_id !== doctorProfile.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu konsültasyona erişim yetkiniz yok'
      });
    }

    res.json({
      success: true,
      data: consultation
    });
  } catch (error) {
    console.error('Konsültasyon detayları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konsültasyon detayları getirilemedi',
      error: error.message
    });
  }
};

// Konsültasyon isteğini yanıtla
const respondToConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { status, consultationNotes, recommendations } = req.body;
    const userId = req.user.id;

    // Doktor profilini al
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (doctorError || !doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Doktor profili bulunamadı'
      });
    }

    // Konsültasyonun konsültan doktoru mu kontrol et
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .eq('consulting_doctor_id', doctorProfile.id)
      .single();

    if (consultationError || !consultation) {
      return res.status(403).json({
        success: false,
        message: 'Bu konsültasyona yanıt verme yetkiniz yok'
      });
    }

    // Konsültasyonu güncelle
    const updateData = {
      status,
      responded_at: new Date().toISOString()
    };

    if (consultationNotes) updateData.consultation_notes = consultationNotes;
    if (recommendations) updateData.recommendations = recommendations;
    if (status === 'completed') updateData.completed_at = new Date().toISOString();

    const { data: updatedConsultation, error: updateError } = await supabase
      .from('consultations')
      .update(updateData)
      .eq('id', consultationId)
      .select(`
        *,
        requesting_doctor:doctor_profiles!consultations_requesting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          user_id
        )
      `)
      .single();

    if (updateError) throw updateError;

    // İstek yapan doktora bildirim gönder
    await supabase
      .from('notifications')
      .insert({
        user_id: updatedConsultation.requesting_doctor.user_id,
        organization_id: updatedConsultation.organization_id,
        type: 'consultation',
        title: 'Konsültasyon Yanıtlandı',
        content: `Konsültasyon isteğiniz yanıtlandı: ${status}`,
        reference_id: consultationId
      });

    res.json({
      success: true,
      data: updatedConsultation,
      message: 'Konsültasyon başarıyla yanıtlandı'
    });
  } catch (error) {
    console.error('Konsültasyon yanıtlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konsültasyon yanıtlanamadı',
      error: error.message
    });
  }
};

// Konsültasyon dosyası yükle
const uploadConsultationAttachment = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { fileName, fileUrl, fileType } = req.body;
    const userId = req.user.id;

    // Doktor profilini al
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (doctorError || !doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Doktor profili bulunamadı'
      });
    }

    // Konsültasyona erişim kontrolü
    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', consultationId)
      .or(`requesting_doctor_id.eq.${doctorProfile.id},consulting_doctor_id.eq.${doctorProfile.id}`)
      .single();

    if (consultationError || !consultation) {
      return res.status(403).json({
        success: false,
        message: 'Bu konsültasyona dosya yükleme yetkiniz yok'
      });
    }

    // Dosyayı kaydet
    const { data: attachment, error: attachmentError } = await supabase
      .from('consultation_attachments')
      .insert({
        consultation_id: consultationId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        uploaded_by: userId
      })
      .select()
      .single();

    if (attachmentError) throw attachmentError;

    res.status(201).json({
      success: true,
      data: attachment,
      message: 'Dosya başarıyla yüklendi'
    });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dosya yüklenemedi',
      error: error.message
    });
  }
};

// Konsültasyon için uygun doktorları getir
const getAvailableDoctorsForConsultation = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { departmentId, specialization } = req.query;
    const userId = req.user.id;

    // Kullanıcının organizasyona erişimi var mı kontrol et
    const { data: userOrg, error: userOrgError } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    if (userOrgError || !userOrg) {
      return res.status(403).json({
        success: false,
        message: 'Bu organizasyona erişim yetkiniz yok'
      });
    }

    let query = supabase
      .from('user_organizations')
      .select(`
        user_id,
        role,
        doctor_profiles (
          id,
          first_name,
          last_name,
          specialization,
          years_of_experience,
          consultation_fee,
          available_for_consultation,
          profile_image_url
        ),
        departments (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId)
      .in('role', ['doctor', 'head_doctor'])
      .eq('is_active', true)
      .eq('doctor_profiles.available_for_consultation', true)
      .neq('user_id', userId); // Kendisini hariç tut

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    if (specialization) {
      query = query.eq('doctor_profiles.specialization', specialization);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Uygun doktorları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Uygun doktorlar getirilemedi',
      error: error.message
    });
  }
};

// Hasta konsültasyonlarını getir
const getPatientConsultations = async (req, res) => {
  try {
    const { patientTc } = req.params;
    const userId = req.user.id;

    // Doktor profilini al
    const { data: doctorProfile, error: doctorError } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (doctorError || !doctorProfile) {
      return res.status(403).json({
        success: false,
        message: 'Doktor profili bulunamadı'
      });
    }

    // Doktorun bu hastaya erişim yetkisi var mı kontrol et
    const { data: patientAccess, error: accessError } = await supabase
      .from('patient_access_permissions')
      .select('organization_id')
      .eq('patient_tc', patientTc)
      .eq('doctor_id', doctorProfile.id)
      .eq('is_active', true);

    if (accessError || !patientAccess || patientAccess.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bu hastaya erişim yetkiniz yok'
      });
    }

    // Erişim yetkisi olan organizasyonların ID'lerini al
    const organizationIds = patientAccess.map(access => access.organization_id);

    // Hasta konsültasyonlarını getir
    const { data: consultations, error: consultationsError } = await supabase
      .from('consultations')
      .select(`
        *,
        requesting_doctor:doctor_profiles!consultations_requesting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization,
          profile_image_url
        ),
        consulting_doctor:doctor_profiles!consultations_consulting_doctor_id_fkey (
          id,
          first_name,
          last_name,
          specialization,
          profile_image_url
        ),
        departments (
          id,
          name
        )
      `)
      .eq('patient_tc', patientTc)
      .in('organization_id', organizationIds)
      .order('requested_at', { ascending: false });

    if (consultationsError) throw consultationsError;

    res.json({
      success: true,
      data: consultations || []
    });
  } catch (error) {
    console.error('Hasta konsültasyonlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Hasta konsültasyonları getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  createConsultation,
  getDoctorConsultations,
  getConsultationDetails,
  respondToConsultation,
  uploadConsultationAttachment,
  getAvailableDoctorsForConsultation,
  getPatientConsultations
};