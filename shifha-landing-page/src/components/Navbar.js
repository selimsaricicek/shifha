import React from 'react';
import './Navbar.css';
import { FaStethoscope } from 'react-icons/fa'; // Örnek bir logo ikonu

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          <FaStethoscope className="navbar-icon" />
          Shifha
        </a>
        <ul className="nav-menu">
          <li className="nav-item">
            <a href="#features" className="nav-links">Özellikler</a>
          </li>
          <li className="nav-item">
            <a href="#mobile" className="nav-links">Mobil Uygulama</a>
          </li>
          <li className="nav-item">
            <a href="#howitworks" className="nav-links">Nasıl Çalışır?</a>
          </li>
          <li className="nav-item">
            <a href="#footer" className="nav-links">İletişim</a>
          </li>
        </ul>
        <button className="nav-button">Demo Talep Edin</button>
      </div>
    </nav>
  );
};

export default Navbar;