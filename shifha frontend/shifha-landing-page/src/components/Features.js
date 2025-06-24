import React from 'react';
import './Features.css';
import { FaVials, FaNotesMedical, FaUserFriends, FaLaptopMedical } from 'react-icons/fa';

const FeatureCard = ({ icon, title, text }) => {
    return (
        <div className="feature-card">
            <div className="feature-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{text}</p>
        </div>
    );
}

const Features = () => {
  return (
    <div id="features" className="features-section">
      <h2>Teşhisten Takibe, Tıbbi Zekanın Gücünü Keşfedin</h2>
      <div className="features-container">
        <FeatureCard 
          icon={<FaVials size={50} />}
          title="Anormal Değerleri Saniyeler İçinde Yakalayın"
          text="Yapay zeka motorumuz, kan tahlillerindeki anormal değerleri anında tespit eder ve potansiyel riskler hakkında ön bilgi sunarak inceleme sürenizi kısaltır."
        />
        <FeatureCard 
          icon={<FaNotesMedical size={50} />}
          title="Diyabet Teşhisinde Bütünsel Yaklaşım"
          text="Shifha, hasta öyküsü ve semptomlarını birleştirerek diyabet teşhisi için size kapsamlı bir yorum sunar, kararınıza rehberlik eder."
        />
        <FeatureCard 
          icon={<FaUserFriends size={50} />}
          title="Merkezi ve Paylaşımcı Hasta Geçmişi"
          text="Hasta öyküsü ve önceki doktor notları güvenli bir profilde saklanır. Farklı doktorlar arasında bütünsel bir bakım mümkün olur."
        />
        <FeatureCard 
          icon={<FaLaptopMedical size={50} />}
          title="Doktorlar Arası Konsültasyon Platformu"
          text="Karmaşık vakalar için platform üzerinden diğer uzmanlarla kolayca iletişim kurun, güvenli veri paylaşımı ile konsültasyonları hızlandırın."
        />
      </div>
    </div>
  );
};

export default Features;