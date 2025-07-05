import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <>
      <Router>
        <div className="App bg-gradient-to-b from-cyan-50 via-white to-gray-50 min-h-screen animate-fadeInApp">
          <style>{`
            @keyframes fadeInApp {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            .animate-fadeInApp { animation: fadeInApp 0.7s cubic-bezier(.23,1.01,.32,1) both; }
          `}</style>
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/Calendar/*" element={<DashboardPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{ borderRadius: '1.5rem', background: '#f0f6ff', color: '#222', boxShadow: '0 2px 16px 0 #e0e7ef', fontSize: '1rem' }}
      />
    </>
  );
}

export default App;