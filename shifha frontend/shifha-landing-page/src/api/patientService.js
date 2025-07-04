// Bu fonksiyon, bir dosyayı alıp backend'e gönderir ve 
// işlenmiş hasta verisini veya bir hata nesnesini döndürür.
export async function uploadPdfAndParsePatient(file) {
    const formData = new FormData();
    formData.append('file', file);
  
    // Backend'e API isteğini gönderiyoruz
    const response = await fetch('/api/pdf/parse', {
      method: 'POST',
      body: formData,
    });
  
    // Eğer istek başarısız olursa (örn: 404, 500), hatayı yakalayıp fırlatıyoruz
    if (!response.ok) {
      // Sunucudan gelen hata mesajını okumaya çalışıyoruz
      const errorData = await response.json().catch(() => {
        // Eğer sunucudan JSON formatında bir hata gelmezse, genel bir mesaj veriyoruz
        return { details: `Sunucu ${response.status} koduyla yanıt verdi.` };
      });
      // Teknik detayı konsola yaz, kullanıcıya sade mesaj göster
      console.error('PDF yükleme API hata detayı:', errorData.details || errorData);
      throw new Error('PDF yüklenemedi, lütfen tekrar deneyin.');
    }
  
    // İstek başarılıysa, gelen JSON verisini (yani hasta objesini) döndürüyoruz
    return response.json();
  }
  
  // Yeni hasta ekle
  export async function addPatient(patientData) {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Hasta eklenemedi.');
    }
    return response.json();
  }

  // Hasta güncelle
  export async function updatePatient(tc, patientData) {
    const response = await fetch(`/api/patients/${tc}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Hasta güncellenemedi.');
    }
    return response.json();
  }

  // Hasta sil
  export async function deletePatient(tc) {
    const response = await fetch(`/api/patients/${tc}`, {
      method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Hasta silinemedi.');
    }
    return { success: true };
  }