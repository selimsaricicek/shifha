const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getStructuredDataFromText(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // ----> YENİ VE DAHA AKILLI TALİMAT (PROMPT) <----
    const prompt = `
      Sen, tıbbi belgelerden veri çıkaran bir asistansın. Görevin, aşağıda verilen hasta değerlendirme metnindeki TÜM bilgileri analiz edip, mantıksal olarak gruplandırılmış bir JSON nesnesi oluşturmaktır.
      Çıktın SADECE ve SADECE geçerli bir JSON objesi olmalı. Başka hiçbir açıklama, metin veya "json" etiketi ekleme.
      Metindeki her başlığı (örneğin "Kimlik Bilgileri", "Başvuru Bilgileri", "Tıbbi Geçmiş", "Laboratuvar", "Tanı", "Plan & Öneri") JSON içinde bir anahtar olarak kullan.
      Eğer bir alan metinde bulunmuyorsa, o alanı JSON'a hiç ekleme. Değerleri temiz ve anlaşılır bir şekilde yaz.

      Örnek Çıktı Yapısı:
      {
        "kimlikBilgileri": {
          "adSoyad": "...",
          "tcKimlikNo": "..."
        },
        "basvuruBilgileri": {
          "tarih": "...",
          "nedeni": "..."
        },
        "tibbiGecmis": {
          "kronikHastaliklar": "...",
          "ameliyatlar": "..."
        },
        "laboratuvar": {
            "biyokimya": { "glukoz": "90 mg/dL", "kreatinin": "0.68 mg/dL" },
            "hematoloji": { "hb": "13.5 g/dL" }
        },
        "tani": {
            "icd10": "...",
            "doktorTanisi": "..."
        },
        "planVeOneri": {
            "tetkik": "...",
            "izlem": "..."
        }
      }

      İşlenecek Metin:
      ---
      ${text}
      ---
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Gelen yanıtın temiz bir JSON olduğundan emin oluyoruz.
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const structuredData = JSON.parse(jsonString);

    console.log("Gemini'den başarıyla ve daha detaylı yapılandırılmış veri alındı.");
    
    // Kodun geri kalanının doğru çalışması için, anahtar alanları kök düzeye kopyalıyoruz.
    const rootData = {
        ad_soyad: structuredData.kimlikBilgileri?.adSoyad || '',
        tc_kimlik_no: structuredData.kimlikBilgileri?.tcKimlikNo || '',
        ...structuredData // Geri kalan tüm zengin veriyi de ekliyoruz
    };

    return rootData;

  } catch (error) {
    console.error("Gemini Servis Hatası:", error);
    throw new Error("Yapay zeka veriyi işlerken bir hata oluştu.");
  }
}

module.exports = { getStructuredDataFromText };