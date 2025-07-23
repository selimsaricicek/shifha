import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle } from 'lucide-react';

function ChatBot({ patientData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // ChatBot açıldığında önceki mesajları ve hasta bilgisini sıfırla
  useEffect(() => {
    if (open) {
      if (patientData) {
        setSelectedPatient(patientData);
        setMessages([{ sender: 'bot', text: `Hasta: ${patientData.adSoyad || patientData.name || patientData.tc_kimlik_no || 'Bilinmeyen'} ile ilgili klinik analiz ve öneriler için verileri paylaşabilirsiniz.` }]);
      } else {
        setSelectedPatient(null);
        setMessages([{ sender: 'bot', text: 'Merhaba! Size nasıl yardımcı olabilirim?' }]);
      }
      setInput('');
    }
  }, [open, patientData]);

  // ChatBot açıldığında önceki mesajları ve hasta bilgisini sıfırla
  useEffect(() => {
    if (open) {
      let initialMsg = { sender: 'bot', text: 'Merhaba! Size nasıl yardımcı olabilirim?' };
      if (selectedPatient) {
        initialMsg = { sender: 'bot', text: `Hasta: ${selectedPatient.adSoyad || selectedPatient.name || selectedPatient.tc_kimlik_no || 'Bilinmeyen'} ile ilgili klinik analiz ve öneriler için verileri paylaşabilirsiniz.` };
      }
      setMessages([initialMsg]);
      setInput('');
    }
  }, [open, selectedPatient]);

  // Hasta paneline girince veya hasta değişince bilgiyi güncelle
  useEffect(() => {
    if (!open && !patientData) {
      setSelectedPatient(null);
      setMessages([]);
    }
  }, [patientData, open]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    // Hasta bilgisi kaldırıldıysa sadece input gönder
    try {
      let payload;
      if (selectedPatient) {
        payload = { text: JSON.stringify(selectedPatient) + '\n' + input };
      } else {
        payload = { text: input };
      }
      const res = await fetch('http://localhost:3001/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      let geminiMsg = '';
      if (typeof data === 'string') {
        geminiMsg = data;
      } else if (data?.patient_data?.hastaVeriAnaliziOzeti) {
        geminiMsg = data.patient_data.hastaVeriAnaliziOzeti;
      } else if (
        (!data?.adSoyad || data?.adSoyad === 'null') &&
        (!data?.tcKimlikNo || data?.tcKimlikNo === 'null') &&
        (!data?.patient_data?.potansiyelTanilar || data?.patient_data?.potansiyelTanilar.length === 0)
      ) {
        geminiMsg = 'Merhaba, ben Shifha asistanı. Sağlıkla ilgili sorularınızı veya danışmak istediğiniz konuları bana iletebilirsiniz.';
      } else if (data?.message) {
        geminiMsg = data.message;
      } else if (data?.response) {
        geminiMsg = data.response;
      } else {
        geminiMsg = JSON.stringify(data);
      }
      setMessages(prev => [...prev, { sender: 'bot', text: geminiMsg }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'AI servisine erişilemedi.' }]);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      <button
        className="chatbot-toggle"
        style={{ width: 48, height: 48, borderRadius: 24, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: open ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={() => setOpen(true)}
        title="AI ChatBot"
      >
        <MessageCircle size={28} color="#4F46E5" />
      </button>
      {open && (
        <div className="chatbot-window" style={{ width: 340, height: 420, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: 16, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <button
            style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}
            onClick={() => setOpen(false)}
            title="Kapat"
          >×</button>
          {selectedPatient && (
            <div className="chatbot-patient-badge" style={{ background: '#EEF2FF', color: '#3730A3', borderRadius: 8, padding: '4px 12px', fontSize: 15, fontWeight: 500, marginBottom: 8, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', position: 'relative' }}>
              {`Hasta: ${selectedPatient.adSoyad || selectedPatient.name || selectedPatient.tc_kimlik_no || 'Bilinmeyen'}`}
              <button
                style={{ position: 'absolute', top: 2, right: 6, background: 'transparent', border: 'none', color: '#3730A3', fontSize: 18, cursor: 'pointer', padding: 0 }}
                title="Hasta bilgisini kaldır"
                onClick={() => setSelectedPatient(null)}
              >×</button>
            </div>
          )}
          <div className="chatbot-messages" style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: 6, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <span style={{ display: 'inline-block', background: msg.sender === 'user' ? '#E0E7FF' : '#F3F4F6', color: '#111', borderRadius: 8, padding: '6px 12px', maxWidth: '80%', fontSize: 14 }}>{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input-row" style={{ display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Mesajınızı yazın..."
              style={{ flex: 1, borderRadius: 8, border: '1px solid #DDD', padding: '8px 12px', fontSize: 15 }}
            />
            <button
              onClick={handleSend}
              style={{ background: '#4F46E5', color: '#fff', borderRadius: 8, padding: '0 16px', fontWeight: 500, fontSize: 15, border: 'none', cursor: 'pointer' }}
            >Gönder</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBot;
