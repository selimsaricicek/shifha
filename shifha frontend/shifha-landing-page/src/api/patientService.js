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
      // Anlaşılır bir hata mesajı oluşturuyoruz
      throw new Error(errorData.details || 'Bilinmeyen bir sunucu hatası oluştu.');
    }
  
    // İstek başarılıysa, gelen JSON verisini (yani hasta objesini) döndürüyoruz
    return response.json();
  }
  
  // updatePatient fonksiyonu şimdilik boş kalabilir veya mevcut haliyle durabilir
  export async function updatePatient(tc, data) {
    // Bu fonksiyonun implementasyonu şimdilik önemli değil
    console.log('updatePatient çağrıldı:', tc, data);
    return { success: true };
  }