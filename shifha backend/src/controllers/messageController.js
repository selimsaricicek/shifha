const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// KONUŞMA YÖNETİMİ
// =====================================================

// Yeni konuşma başlat
const createConversation = async (req, res) => {
  try {
    const { organizationId, type, title, participantIds } = req.body;
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

    // Konuşma oluştur
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        organization_id: organizationId,
        type,
        title,
        created_by: userId
      })
      .select()
      .single();

    if (convError) throw convError;

    // Katılımcıları ekle (kendini de dahil et)
    const allParticipants = [...new Set([userId, ...participantIds])];
    const participantInserts = allParticipants.map(participantId => ({
      conversation_id: conversation.id,
      user_id: participantId
    }));

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert(participantInserts);

    if (participantError) throw participantError;

    res.status(201).json({
      success: true,
      data: conversation,
      message: 'Konuşma başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Konuşma oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konuşma oluşturulamadı',
      error: error.message
    });
  }
};

// Kullanıcının konuşmalarını getir
const getUserConversations = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        conversations (
          id,
          organization_id,
          type,
          title,
          created_by,
          created_at,
          updated_at,
          messages (
            id,
            content,
            sender_id,
            created_at
          )
        )
      `)
      .eq('user_id', userId)
      .eq('conversations.organization_id', organizationId)
      .order('conversations.updated_at', { ascending: false });

    if (error) throw error;

    // Son mesajları ve okunmamış mesaj sayılarını hesapla
    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (item) => {
        const conversation = item.conversations;
        
        // Son mesajı getir
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Okunmamış mesaj sayısını getir
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .gt('created_at', item.last_read_at || '1970-01-01');

        return {
          ...conversation,
          last_message: lastMessage,
          unread_count: unreadCount || 0,
          last_read_at: item.last_read_at
        };
      })
    );

    res.json({
      success: true,
      data: conversationsWithDetails
    });
  } catch (error) {
    console.error('Konuşmaları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konuşmalar getirilemedi',
      error: error.message
    });
  }
};

// Konuşma detaylarını getir
const getConversationDetails = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Kullanıcının bu konuşmaya erişimi var mı kontrol et
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (participantError || !participant) {
      return res.status(403).json({
        success: false,
        message: 'Bu konuşmaya erişim yetkiniz yok'
      });
    }

    // Konuşma detaylarını getir
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants (
          user_id,
          joined_at,
          last_read_at,
          doctor_profiles (
            id,
            first_name,
            last_name,
            email,
            profile_image_url
          )
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convError) throw convError;

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Konuşma detayları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Konuşma detayları getirilemedi',
      error: error.message
    });
  }
};

// =====================================================
// MESAJ YÖNETİMİ
// =====================================================

// Mesaj gönder
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, messageType = 'text', fileUrl, patientReference } = req.body;
    const userId = req.user.id;

    // Kullanıcının bu konuşmaya erişimi var mı kontrol et
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (participantError || !participant) {
      return res.status(403).json({
        success: false,
        message: 'Bu konuşmaya mesaj gönderme yetkiniz yok'
      });
    }

    // Mesaj gönder
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content,
        message_type: messageType,
        file_url: fileUrl,
        patient_reference: patientReference
      })
      .select(`
        *,
        doctor_profiles!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .single();

    if (messageError) throw messageError;

    // Konuşmanın updated_at'ini güncelle
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    res.status(201).json({
      success: true,
      data: message,
      message: 'Mesaj başarıyla gönderildi'
    });
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilemedi',
      error: error.message
    });
  }
};

// Konuşma mesajlarını getir
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    // Kullanıcının bu konuşmaya erişimi var mı kontrol et
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (participantError || !participant) {
      return res.status(403).json({
        success: false,
        message: 'Bu konuşmaya erişim yetkiniz yok'
      });
    }

    const offset = (page - 1) * limit;

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        doctor_profiles!messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (messagesError) throw messagesError;

    // Son okunma zamanını güncelle
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    res.json({
      success: true,
      data: messages?.reverse() || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        has_more: messages?.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesajlar getirilemedi',
      error: error.message
    });
  }
};

// Mesaj düzenle
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // Mesajın sahibi mi kontrol et
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .eq('sender_id', userId)
      .single();

    if (messageError || !message) {
      return res.status(403).json({
        success: false,
        message: 'Bu mesajı düzenleme yetkiniz yok'
      });
    }

    // Mesajı güncelle
    const { data: updatedMessage, error: updateError } = await supabase
      .from('messages')
      .update({
        content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      data: updatedMessage,
      message: 'Mesaj başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Mesaj düzenleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj düzenlenemedi',
      error: error.message
    });
  }
};

// =====================================================
// DOKTOR ARAMA VE LİSTELEME
// =====================================================

// Organizasyondaki doktorları ara (mesajlaşma için)
const searchDoctorsForMessaging = async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { search = '' } = req.query;
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
          email,
          specialization,
          profile_image_url,
          available_for_consultation
        ),
        departments (
          id,
          name
        )
      `)
      .eq('organization_id', organizationId)
      .in('role', ['doctor', 'head_doctor'])
      .eq('is_active', true)
      .neq('user_id', userId); // Kendisini hariç tut

    if (search) {
      query = query.or(`doctor_profiles.first_name.ilike.%${search}%,doctor_profiles.last_name.ilike.%${search}%,doctor_profiles.specialization.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Doktor arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Doktorlar aranamadı',
      error: error.message
    });
  }
};

module.exports = {
  createConversation,
  getUserConversations,
  getConversationDetails,
  sendMessage,
  getConversationMessages,
  editMessage,
  searchDoctorsForMessaging
};