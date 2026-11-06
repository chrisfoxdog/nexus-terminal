// Whop iframe identity — client side.
//
// When Nexus Terminal runs inside the Whop iframe, Whop's proxy attaches
// the buyer's short-lived JWT (`x-whop-user-token`) to every same-origin
// request automatically. Browser code cannot read that token and must
// never invent an identity: same-origin fetches simply carry it, and the
// server verifies it against Whop's JWKS and derives the user ID.
//
// This helper covers the two cases where the client legitimately has
// something to add:
// 1. A token explicitly stashed for this session (e.g. by a future
//    @whop/iframe integration) is forwarded as `x-whop-user-token`.
// 2. Local development only: a dev user ID set in localStorage is sent
//    as `x-whop-dev-user-id`. The server honours that header only when
//    NODE_ENV is not "production", and production builds never send it.

const TOKEN_STORAGE_KEY = 'nexus_whop_user_token';
const DEV_USER_STORAGE_KEY = 'nexus_dev_whop_user_id';

export function getWhopUserToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function whopAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  const token = getWhopUserToken();
  if (token) {
    headers['x-whop-user-token'] = token;
  }

  if (import.meta.env.DEV) {
    try {
      const devUserId = window.localStorage.getItem(DEV_USER_STORAGE_KEY);
      if (devUserId) {
        headers['x-whop-dev-user-id'] = devUserId;
      }
    } catch {
      // Storage unavailable — the server will simply require Whop auth.
    }
  }

  return headers;
}
