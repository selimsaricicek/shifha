import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { AppWithProviders } from './MainApp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppWithProviders />
  </React.StrictMode>
); 