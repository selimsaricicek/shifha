import React from 'react';
import './MobileApp.css';
// Gerçek bir uygulama görseli için bu URL'i değiştirin.
const mobileAppImg = "https://cdn.dribbble.com/users/1787323/screenshots/11310632/media/e4f41c738aa82d24497e883253b3aa7f.png?compress=1&resize=1200x900";

const MobileApp = () => {
    return (
        <div id="mobile" className="mobile-app-section">
            <div className="mobile-app-container">
                <div className="mobile-app-text">
                    <h2>Kritik Bilgiler Anında Cebinizde</h2>
                    <p>Shifha mobil uygulaması ile hastalarınızın durumu her an kontrolünüz altında. Laboratuvardan gelen acil bir sonuç veya sistemdeki önemli bir güncelleme, anında bildirim olarak telefonunuza düşer.</p>
                    <ul>
                        <li>✓ Anlık Bildirimler: Kritik tahlil sonuçları ve aciliyet gerektiren durumlar için anında uyarı alın.</li>
                        <li>✓ Hasta Takibi: Nerede olursanız olun, hastalarınızın güncel verilerine ve geçmişine erişin.</li>
                        <li>✓ Güvenli Erişim: Biyometrik ve şifreli giriş ile hasta verilerinin güvenliğini sağlayın.</li>
                    </ul>
                    <div className="store-buttons">
                        <button className="store-button">App Store'dan İndirin</button>
                        <button className="store-button">Google Play'den Edinin</button>
                    </div>
                </div>
                <div className="mobile-app-image">
                    <img src={mobileAppImg} alt="Shifha Mobil Uygulaması" />
                </div>
            </div>
        </div>
    );
}

export default MobileApp;