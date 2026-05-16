import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AnomalyUXProvider } from './context/AnomalyUXContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AnomalyUXProvider>
          <App />
        </AnomalyUXProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
