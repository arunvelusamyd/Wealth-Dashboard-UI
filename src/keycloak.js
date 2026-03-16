import Keycloak from 'keycloak-js';

export const keycloakConfig = {
  url: 'http://localhost:8080',
  realm: 'myrealm',
  clientId: 'Wealth-Dashboard',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;

