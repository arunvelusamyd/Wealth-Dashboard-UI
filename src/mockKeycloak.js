// Fake Keycloak instance used when DEV_MODE = true.
// Satisfies every call App.js makes against the real keycloak object.
const mockKeycloak = {
  authenticated: true,
  token: 'mock-dev-token',
  tokenParsed: {
    preferred_username: 'dev.user',
    email: 'dev@example.com',
    sub: 'mock-user-id',
  },
  // Called before each API request — resolves instantly, no-op
  updateToken: () => Promise.resolve(true),
  // Reload the page to simulate logout in dev mode
  logout: () => window.location.reload(),
};

export default mockKeycloak;
