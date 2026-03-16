import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import keycloak from './keycloak';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Initialize Keycloak before rendering the app
keycloak
  .init({
    onLoad: 'login-required',
    checkLoginIframe: false, // simplifies local development
  })
  .then((authenticated) => {
    if (!authenticated) {
      keycloak.login();
      return;
    }

    root.render(
      <React.StrictMode>
        <BrowserRouter basename="/wealth">
          <Routes>
            <Route path="/home" element={<App keycloak={keycloak} />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Keycloak initialization failed:', error);
  });
