import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import MobileApp from './components/Mobileapp';
import HowItWorks from './components/HowItWorks';
import Vision from './components/Vision';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <MobileApp />
        <HowItWorks />
        <Vision />
      </main>
      <Footer />
    </div>
  );
}

export default App;