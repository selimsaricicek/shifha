// patientService.js
// PDF upload ve hasta ekleme işlemleri için API fonksiyonları

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function uploadPdfAndParsePatient(file) {
    const formData = new FormData();
    formData.append('pdf', file);
    const response = await fetch(`${API_BASE}/api/pdf/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('PDF yüklenemedi.');
    }
    return await response.json();
}
