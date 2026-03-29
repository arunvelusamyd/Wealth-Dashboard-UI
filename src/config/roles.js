/**
 * Role constants — these must match the role names configured in Keycloak.
 *
 * In Keycloak Admin:
 *   Realm Roles  →  Create each name below
 *   Then assign roles to users/groups as needed.
 *
 * The JWT token will contain them under:
 *   tokenParsed.realm_access.roles   (realm-level roles)
 *   tokenParsed.resource_access.<clientId>.roles  (client-level roles)
 */
export const ROLES = {
  TAB_PORTFOLIO:     'wealth-portfolio',
  TAB_WATCHLIST:     'wealth-watchlist',
  TAB_SUBSCRIPTIONS: 'wealth-subscriptions',
  TAB_FUNDAMENTALS:  'wealth-fundamentals',
  TAB_TECHNICAL:     'wealth-technical',
  CHAT:              'wealth-chat',
};

/**
 * Maps each tab label to the role required to see it.
 * Tabs without an entry here would be visible to everyone (not used currently).
 */
export const TAB_ROLES = {
  'Portfolio Overview': ROLES.TAB_PORTFOLIO,
  'Watchlist':          ROLES.TAB_WATCHLIST,
  'Subscriptions':      ROLES.TAB_SUBSCRIPTIONS,
  'Fundamentals':       ROLES.TAB_FUNDAMENTALS,
  'Technical Analysis': ROLES.TAB_TECHNICAL,
};

/** Full ordered list — filtering happens at runtime based on roles. */
export const ALL_TABS = ['Portfolio Overview', 'Watchlist', 'Subscriptions', 'Fundamentals', 'Technical Analysis'];

/**
 * Returns true if the user's token contains the given role.
 * Checks both realm-level and client-level roles so it works
 * regardless of how roles are assigned in Keycloak.
 */
export function hasRole(keycloak, role) {
  if (!keycloak?.tokenParsed) return false;
  const realmRoles  = keycloak.tokenParsed.realm_access?.roles  ?? [];
  const clientId    = keycloak.clientId ?? '';
  const clientRoles = keycloak.tokenParsed.resource_access?.[clientId]?.roles ?? [];
  return realmRoles.includes(role) || clientRoles.includes(role);
}
