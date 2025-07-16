import React, { useState } from 'react';

const cities = ['İstanbul', 'Ankara', 'İzmir'];
const districts = {
  'İstanbul': ['Kadıköy', 'Beşiktaş'],
  'Ankara': ['Çankaya', 'Keçiören'],
  'İzmir': ['Konak', 'Bornova'],
};
const hospitals = {
  'Kadıköy': ['Kadıköy Devlet Hastanesi'],
  'Beşiktaş': ['Beşiktaş Eğitim Hastanesi'],
  'Çankaya': ['Çankaya Devlet Hastanesi'],
  'Keçiören': ['Keçiören Araştırma Hastanesi'],
  'Konak': ['Konak Devlet Hastanesi'],
  'Bornova': ['Bornova Eğitim Hastanesi'],
};
const clinics = ['Dahiliye', 'Kardiyoloji', 'Göz', 'Cildiye', 'Ortopedi'];
const doctors = {
  'Dahiliye': [
    { name: 'Dr. Ayşe Yılmaz', gender: 'F' },
    { name: 'Dr. Mehmet Kaya', gender: 'M' },
  ],
  'Kardiyoloji': [
    { name: 'Dr. Elif Demir', gender: 'F' },
    { name: 'Dr. Ahmet Şahin', gender: 'M' },
  ],
  'Göz': [
    { name: 'Dr. Zeynep Aksoy', gender: 'F' },
  ],
  'Cildiye': [
    { name: 'Dr. Burak Can', gender: 'M' },
  ],
  'Ortopedi': [
    { name: 'Dr. Selin Korkmaz', gender: 'F' },
  ],
};
const times = ['09:00', '09:20', '09:40', '10:00', '10:20', '10:40', '11:00', '11:20', '11:40', '14:00', '14:20', '14:40', '15:00', '15:20', '15:40'];

const steps = [
  'city',
  'district',
  'hospital',
  'clinic',
  'doctor',
  'date',
  'time',
];

const stepLabels = {
  city: 'İl Seçiniz',
  district: 'İlçe Seçiniz',
  hospital: 'Hastane Seçiniz',
  clinic: 'Poliklinik Seçiniz',
  doctor: 'Doktor Seçiniz',
  date: 'Tarih Seçiniz',
  time: 'Saat Seçiniz',
};

const RandevuScreen = () => {
  const [form, setForm] = useState({
    city: '',
    district: '',
    hospital: '',
    clinic: '',
    doctor: '',
    date: '',
    time: '',
  });
  const [step, setStep] = useState(0);
  const [appointments, setAppointments] = useState([]);

  // Adım ilerletici
  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  // Seçim değişikliği
  const handleSelect = (name, value) => {
    let reset = {};
    if (name === 'city') reset = { district: '', hospital: '', clinic: '', doctor: '', date: '', time: '' };
    else if (name === 'district') reset = { hospital: '', clinic: '', doctor: '', date: '', time: '' };
    else if (name === 'hospital') reset = { clinic: '', doctor: '', date: '', time: '' };
    else if (name === 'clinic') reset = { doctor: '', date: '', time: '' };
    else if (name === 'doctor') reset = { date: '', time: '' };
    else if (name === 'date') reset = { time: '' };
    setForm((prev) => ({ ...prev, [name]: value, ...reset }));
    if (value) nextStep();
  };

  // Randevu kaydet
  const handleBook = () => {
    if (!form.city || !form.district || !form.hospital || !form.clinic || !form.doctor || !form.date || !form.time) return;
    setAppointments([{ ...form, id: Date.now() }, ...appointments]);
    setForm({ city: '', district: '', hospital: '', clinic: '', doctor: '', date: '', time: '' });
    setStep(0);
  };

  // Adım adım seçimler
  return (
    <div className="w-full max-w-2xl mx-auto pt-4 pb-24 px-2">
      <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-6">
        <div className="font-bold text-lg text-cyan-700 mb-4">Randevu Al</div>
        <div className="flex flex-col gap-4">
          {step === 0 && (
            <div>
              <label className="block font-medium mb-1">İl</label>
              <div className="flex gap-2 flex-wrap">
                {cities.map((c) => (
                  <button key={c} onClick={() => handleSelect('city', c)} className={`px-4 py-2 rounded-lg border ${form.city === c ? 'bg-cyan-500 text-white' : 'bg-gray-50 hover:bg-cyan-100'} transition`}>{c}</button>
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div>
              <label className="block font-medium mb-1">İlçe</label>
              <div className="flex gap-2 flex-wrap">
                {form.city && districts[form.city].map((d) => (
                  <button key={d} onClick={() => handleSelect('district', d)} className={`px-4 py-2 rounded-lg border ${form.district === d ? 'bg-cyan-500 text-white' : 'bg-gray-50 hover:bg-cyan-100'} transition`}>{d}</button>
                ))}
              </div>
              <button onClick={prevStep} className="mt-2 text-xs text-gray-500 underline">Geri</button>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className="block font-medium mb-1">Hastane</label>
              <div className="flex gap-2 flex-wrap">
                {form.district && hospitals[form.district].map((h) => (
                  <button key={h} onClick={() => handleSelect('hospital', h)} className={`px-4 py-2 rounded-lg border ${form.hospital === h ? 'bg-cyan-500 text-white' : 'bg-gray-50 hover:bg-cyan-100'} transition`}>{h}</button>
                ))}
              </div>
              <button onClick={prevStep} className="mt-2 text-xs text-gray-500 underline">Geri</button>
            </div>
          )}
          {step === 3 && (
            <div>
              <label className="block font-medium mb-1">Poliklinik</label>
              <div className="flex gap-2 flex-wrap">
                {clinics.map((c) => (
                  <button key={c} onClick={() => handleSelect('clinic', c)} className={`px-4 py-2 rounded-lg border ${form.clinic === c ? 'bg-cyan-500 text-white' : 'bg-gray-50 hover:bg-cyan-100'} transition`}>{c}</button>
                ))}
              </div>
              <button onClick={prevStep} className="mt-2 text-xs text-gray-500 underline">Geri</button>
            </div>
          )}
          {step === 4 && (
            <div>
              <label className="block font-medium mb-1">Doktor</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {form.clinic && doctors[form.clinic].map((d) => (
                  <div key={d.name} className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${form.doctor === d.name ? 'bg-cyan-100 border-cyan-400' : 'bg-gray-50 hover:bg-cyan-50'} transition`}>
                    <div className="text-2xl">
                      {d.gender === 'F' ? '👩‍⚕️' : '👨‍⚕️'}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{d.name}</div>
                    </div>
                    <button onClick={() => handleSelect('doctor', d.name)} className={`px-3 py-1 rounded-lg border ${form.doctor === d.name ? 'bg-cyan-500 text-white' : 'bg-white hover:bg-cyan-100'} transition text-sm`}>Seç</button>
                  </div>
                ))}
              </div>
              <button onClick={prevStep} className="mt-2 text-xs text-gray-500 underline">Geri</button>
            </div>
          )}
          {step === 5 && (
            <div>
              <label className="block font-medium mb-1">Tarih</label>
              <input type="date" value={form.date} onChange={e => handleSelect('date', e.target.value)} className="border rounded-lg px-2 py-1 text-sm" min={new Date().toISOString().split('T')[0]} />
              <button onClick={prevStep} className="mt-2 text-xs text-gray-500 underline">Geri</button>
            </div>
          )}
          {step === 6 && (
            <div>
              <label className="block font-medium mb-1">Saat</label>
              <div className="flex gap-2 flex-wrap">
                {times.map((t) => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, time: t }))} className={`px-4 py-2 rounded-lg border ${form.time === t ? 'bg-cyan-500 text-white' : 'bg-gray-50 hover:bg-cyan-100'} transition`}>{t}</button>
                ))}
              </div>
              <button onClick={prevStep} className="mt-2 text-xs text-gray-500 underline">Geri</button>
              <button onClick={handleBook} disabled={!form.time} className="block mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50">Randevu Al</button>
            </div>
          )}
        </div>
      </div>
      {appointments.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <div className="font-semibold text-cyan-700 mb-2">Alınan Randevular</div>
          <ul className="space-y-2">
            {appointments.map(app => (
              <li key={app.id} className="text-sm text-gray-700 flex flex-col gap-1 border-b pb-2 last:border-b-0 last:pb-0">
                <span><b>İl:</b> {app.city}</span>
                <span><b>İlçe:</b> {app.district}</span>
                <span><b>Hastane:</b> {app.hospital}</span>
                <span><b>Poliklinik:</b> {app.clinic}</span>
                <span><b>Doktor:</b> {app.doctor}</span>
                <span><b>Tarih:</b> {app.date}</span>
                <span><b>Saat:</b> {app.time}</span>
                <button
                  onClick={() => setAppointments(appointments.filter(a => a.id !== app.id))}
                  className="mt-2 self-end bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                >
                  İptal Et
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RandevuScreen; 