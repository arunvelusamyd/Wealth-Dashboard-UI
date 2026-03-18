import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import keycloak from './keycloak';

function Root() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required', checkLoginIframe: false })
      .then(() => setInitialized(true))
      .catch(console.error);
  }, []);

  if (!initialized) {
    return null;
  }

  return <App keycloak={keycloak} />;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
