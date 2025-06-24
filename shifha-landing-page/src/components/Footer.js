import React from 'react';
import './Footer.css';
import { FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer id="footer" className="footer-section">
            <div className="footer-container">
                <div className="footer-about">
                    <h4>Shifha Hakkında</h4>
                    <p>Shifha, yapay zeka destekli medikal asistan platformu olarak doktorların teşhis ve takip süreçlerini kolaylaştırmayı hedefler.</p>
                </div>
                <div className="footer-links">
                    <h4>Hızlı Linkler</h4>
                    <ul>
                        <li><a href="#">Gizlilik Politikası</a></li>
                        <li><a href="#">Kullanım Koşulları</a></li>
                        <li><a href="#">Sıkça Sorulan Sorular</a></li>
                    </ul>
                </div>
                <div className="footer-contact">
                    <h4>İletişim</h4>
                    <p>E-posta: destek@shifha.com</p>
                    <p>Telefon: +90 XXX XXX XX XX</p>
                    <div className="social-icons">
                        <a href="#"><FaTwitter /></a>
                        <a href="#"><FaLinkedin /></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© 2025 Shifha. Tüm Hakları Saklıdır.</p>
            </div>
        </footer>
    );
}

export default Footer;