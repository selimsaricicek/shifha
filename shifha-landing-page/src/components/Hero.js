import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <div className="hero-container">
      <h1>Tıbbi Kararlarınızda Hız ve Derinlik: Shifha ile Tanışın</h1>
      <p>Doktorlar için geliştirildi. Yapay zeka destekli tahlil analizi, merkezi hasta yönetimi ve anlık mobil bildirimlerle teşhis süreçlerinizi optimize edin, değerli zamanınızı hastalarınıza ayırın.</p>
      <div className="hero-btns">
        <button className="btn btn--primary">Ücretsiz Deneyin</button>
        <button className="btn btn--outline">Daha Fazla Bilgi</button>
      </div>
    </div>
  );
};

export default Hero;