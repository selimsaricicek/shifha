import React from 'react';
import './HowItWorks.css';
import { FaFileUpload, FaBrain, FaBell } from 'react-icons/fa';

const HowItWorks = () => {
    return (
        <div id="howitworks" className="how-it-works-section">
            <h2>Üç Basit Adımda Shifha ile Tanışın</h2>
            <div className="steps-container">
                <div className="step">
                    <div className="step-icon-wrapper"><FaFileUpload size={40} /></div>
                    <h3>1. Kaydet ve Yükle</h3>
                    <p>Hasta öyküsünü, notlarınızı ve tahlil sonuçlarını sisteme kolayca kaydedin veya yükleyin.</p>
                </div>
                <div className="step">
                    <div className="step-icon-wrapper"><FaBrain size={40} /></div>
                    <h3>2. Analiz ve Yorumlama</h3>
                    <p>Shifha'nın yapay zeka motoru verileri saniyeler içinde analiz eder ve size ön rapor sunar.</p>
                </div>
                <div className="step">
                    <div className="step-icon-wrapper"><FaBell size={40} /></div>
                    <h3>3. Bildirim ve İş Birliği</h3>
                    <p>Sonuçları değerlendirin, mobil bildirimlerle haberdar olun ve meslektaşlarınızla fikir alışverişi yapın.</p>
                </div>
            </div>
        </div>
    );
}

export default HowItWorks;