// patientService.js
// PDF upload ve hasta ekleme işlemleri için API fonksiyonları

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function uploadPdfAndParsePatient(file) {
    const formData = new FormData();
    formData.append('file', file); // 'file' olmalı
    const response = await fetch(`${API_BASE}/api/pdf/parse`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('PDF yüklenemedi.');
    }
    return await response.json();
}

export async function updatePatient(tcKimlikNo, updateFields) {
    const response = await fetch(`${API_BASE}/api/patient/${tcKimlikNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFields),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Hasta güncellenemedi.');
    }
    return await response.json();
}
