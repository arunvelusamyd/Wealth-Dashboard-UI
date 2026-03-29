// ── Development mode toggle ───────────────────────────────────────────────────
// Set DEV_MODE = true to skip Keycloak login AND use mock portfolio data.
// Flip back to false before pushing to any shared / production environment.
export const DEV_MODE = true;
//export const DEV_MODE = false;

// Backend WebSocket URL for live stock price streaming (STOMP over plain WS).
// Only used when DEV_MODE = false.
export const WS_URL = 'ws://localhost:8080/ws-plain';
