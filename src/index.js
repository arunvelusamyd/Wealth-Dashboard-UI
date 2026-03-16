import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import LoginPage from './LoginPage';
import keycloak from './keycloak';

function Root() {
  const [authenticated, setAuthenticated] = useState(keycloak.authenticated);

  return (
    <BrowserRouter basename="/wealth">
      <Routes>
        <Route
          path="/login"
          element={
            authenticated
              ? <Navigate to="/home" replace />
              : <LoginPage onLoginSuccess={() => setAuthenticated(true)} />
          }
        />
        <Route
          path="/home"
          element={
            authenticated
              ? <App keycloak={keycloak} />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="*" element={<Navigate to={authenticated ? '/home' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

// Skip keycloak.init() — auth is handled via Direct Access Grants in LoginPage.
// The keycloak instance is used only to store tokens after successful login.
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
