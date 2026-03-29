// Fake Keycloak instance used when DEV_MODE = true.
// Satisfies every call App.js makes against the real keycloak object.
// All roles are granted so every tab and the chat are visible in dev mode.
const mockKeycloak = {
  authenticated: true,
  token: 'mock-dev-token',
  clientId: 'wealth-dashboard',
  tokenParsed: {
    preferred_username: 'dev.user',
    email: 'dev@example.com',
    sub: 'mock-user-id',
    realm_access: {
      roles: [
        'wealth-portfolio',
        'wealth-watchlist',
        'wealth-subscriptions',
        'wealth-fundamentals',
        'wealth-technical',
        'wealth-chat',
      ],
    },
  },
  // Called before each API request — resolves instantly, no-op
  updateToken: () => Promise.resolve(true),
  // Reload the page to simulate logout in dev mode
  logout: () => window.location.reload(),
};

export default mockKeycloak;
