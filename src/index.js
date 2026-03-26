import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import keycloak from './keycloak';
import mockKeycloak from './mockKeycloak';
import { DEV_MODE } from './devConfig';

function Root() {
  // In dev mode we are already "initialized" — no Keycloak round-trip needed
  const [initialized, setInitialized] = useState(DEV_MODE);

  useEffect(() => {
    if (DEV_MODE) return; // skip real Keycloak init
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then(() => setInitialized(true))
      .catch(console.error);
  }, []);

  if (!initialized) {
    return null;
  }

  return <App keycloak={DEV_MODE ? mockKeycloak : keycloak} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
