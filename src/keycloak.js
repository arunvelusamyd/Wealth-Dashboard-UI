import Keycloak from 'keycloak-js';

// Keycloak configuration for local development
// Make sure these values match your Keycloak setup.
const keycloak = new Keycloak({
  url: 'http://localhost:8080', // Keycloak base URL
  realm: 'myrealm',
  clientId: 'Wealth-Dashboard',
});

export default keycloak;

