// Whop iframe user identity — server-side verification.
//
// How Whop identity actually works for an embedded app (Whop developer
// docs, "Authentication"): when the app renders inside the Whop iframe,
// Whop's proxy attaches a short-lived JWT to every same-origin request in
// the `x-whop-user-token` header. The browser JavaScript never sees this
// token — it arrives on the request itself — so the ONLY safe way to learn
// who the buyer is is to verify that JWT on the server and derive the user
// ID from its claims. A client-supplied user-ID header is forgeable by
// anyone who can reach this server directly, so it is never trusted here.
//
// Verification mirrors the AutoCash AI server (server/whop.ts): RS256
// signature + expiry checked against Whop's public JWKS via `jose`.
// (The @whop/sdk version pinned by this repo ships no user-token
// verifier, so — as Whop's own docs advise for TypeScript — the JWT is
// verified directly.)
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";

// Remote JWKS set pointing to Whop's official public keys.
const WHOP_JWKS_URL = "https://api.whop.com/.well-known/jwks.json";
const remoteJWKSet = createRemoteJWKSet(new URL(WHOP_JWKS_URL));

export type WhopIdentitySource = "whop_token" | "dev_fallback";

export interface WhopIdentity {
  userId: string;
  source: WhopIdentitySource;
}

/**
 * Validates a Whop iframe user token (JWT) against Whop's JWKS.
 * `getKey` is injectable so tests can verify against a local JWKS.
 */
export async function verifyWhopUserToken(
  token: string,
  getKey: JWTVerifyGetKey = remoteJWKSet
): Promise<{ valid: boolean; userId?: string; error?: string }> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing authentication token" };
  }

  const cleanToken = token.startsWith("Bearer ")
    ? token.slice(7).trim()
    : token.trim();
  if (!cleanToken) {
    return { valid: false, error: "Empty token string" };
  }

  try {
    // Verify cryptographic signature and expiration against Whop JWKS.
    const { payload } = await jwtVerify(cleanToken, getKey, {
      algorithms: ["RS256"],
    });

    // Whop token payload carries the user ID in `sub` (or `user_id`).
    const userId = (payload.sub || (payload as any).user_id) as
      | string
      | undefined;

    if (!userId) {
      return { valid: false, error: "Token missing user identity subject claim" };
    }

    return { valid: true, userId };
  } catch (err: any) {
    return {
      valid: false,
      error: `Invalid or expired Whop user token: ${err?.message || "unknown error"}`,
    };
  }
}

/**
 * Resolves the authenticated Whop user identity for a request.
 *
 * Order of resolution:
 * 1. `x-whop-user-token` header (or an `Authorization: Bearer …` token) —
 *    the JWT injected by Whop's iframe proxy. If a token is present its
 *    verdict is final: an invalid token never falls through to a fallback.
 * 2. Development only (NODE_ENV !== "production"): an explicit
 *    `x-whop-dev-user-id` header, so the claim flow can be exercised
 *    locally / with the Whop dev proxy before the app is published.
 *    This header is ignored entirely in production.
 *
 * Returns null when no trustworthy identity is available; callers must
 * fail closed with 401.
 */
export async function resolveWhopUserIdentity(
  headers: Record<string, string | string[] | undefined>
): Promise<WhopIdentity | null> {
  const tokenHeader =
    (headers["x-whop-user-token"] as string | undefined) ||
    (headers["authorization"] as string | undefined);

  if (tokenHeader) {
    const verification = await verifyWhopUserToken(tokenHeader);
    if (verification.valid && verification.userId) {
      return { userId: verification.userId, source: "whop_token" };
    }
    return null;
  }

  if (process.env.NODE_ENV !== "production") {
    const devUserId = headers["x-whop-dev-user-id"] as string | undefined;
    if (devUserId && devUserId.trim()) {
      return { userId: devUserId.trim(), source: "dev_fallback" };
    }
  }

  return null;
}

/**
 * Diagnostic breakdown of the identity check, used by the temporary
 * /api/v1/passes/diag probe: separates "Whop sent no token" from
 * "token arrived but did not verify" from "identity resolved".
 * Returns no secret material — only booleans and a 4-char user suffix.
 */
export async function diagnoseWhopUserToken(
  headers: Record<string, string | string[] | undefined>
): Promise<{
  tokenPresent: boolean;
  tokenVerifies: boolean;
  userTail: string | null;
  verifyError: string | null;
  tokenAlg: string | null;
  tokenIss: string | null;
  tokenExp: number | null;
}> {
  const tokenHeader =
    (headers["x-whop-user-token"] as string | undefined) ||
    (headers["authorization"] as string | undefined);
  if (!tokenHeader) {
    return {
      tokenPresent: false,
      tokenVerifies: false,
      userTail: null,
      verifyError: null,
      tokenAlg: null,
      tokenIss: null,
      tokenExp: null,
    };
  }
  const verification = await verifyWhopUserToken(tokenHeader);
  if (!verification.valid || !verification.userId) {
    // Peek at the UNVERIFIED header/claims to name the mismatch (alg,
    // issuer, expiry) — diagnostic only, never trusted for identity.
    let alg: string | null = null;
    let iss: string | null = null;
    let exp: number | null = null;
    try {
      const clean = tokenHeader.startsWith("Bearer ")
        ? tokenHeader.slice(7).trim()
        : tokenHeader.trim();
      const parts = clean.split(".");
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
        const claims = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        alg = typeof header?.alg === "string" ? header.alg : null;
        iss = typeof claims?.iss === "string" ? claims.iss : null;
        exp = typeof claims?.exp === "number" ? claims.exp : null;
      }
    } catch {
      /* peek is best-effort */
    }
    return {
      tokenPresent: true,
      tokenVerifies: false,
      userTail: null,
      verifyError: (verification.error || "unknown").slice(0, 140),
      tokenAlg: alg,
      tokenIss: iss,
      tokenExp: exp,
    };
  }
  return {
    tokenPresent: true,
    tokenVerifies: true,
    userTail: verification.userId.slice(-4),
    verifyError: null,
    tokenAlg: null,
    tokenIss: null,
    tokenExp: null,
  };
}
