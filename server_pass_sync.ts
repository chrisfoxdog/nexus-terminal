// Pass sync — materialize access passes from real Whop memberships.
//
// Why this exists: the original member flow asked buyers to paste a Whop
// license key, but Whop only issues license keys for products with a
// software licensing experience. Memberships of app-type products (the
// common case, including Nexus Terminal itself) carry `license_key =
// null`, so key-based claiming can never work for their buyers. Sync is
// the primary door instead: given the buyer's verified Whop identity, it
// reads that buyer's real memberships in the company from the Whop API
// and makes the stored passes match — creating a pass for every valid
// membership and expiring passes whose membership is gone or no longer
// valid.
//
// The decision logic (normalize + plan) is pure and unit-tested in
// tests/pass-sync.test.ts; the orchestration takes its I/O as injected
// dependencies so tests can drive it with a mocked Whop client and store.
import type { StoredPass } from "./server_db";

// Mirrors the validity rule used by /api/v1/memberships/validate and
// /api/v1/licenses/validate: the membership's explicit `valid` flag, or
// one of these billing states. Per Whop's Membership docs, `active` and
// `trialing` grant access and `completed` one-time purchases keep it.
export const VALID_MEMBERSHIP_STATUSES = [
  "completed",
  "active",
  "valid",
  "trialing",
] as const;

export function isValidMembershipStatus(
  status: string,
  validFlag?: unknown
): boolean {
  if (validFlag === true) return true;
  return (VALID_MEMBERSHIP_STATUSES as readonly string[]).includes(
    String(status || "").toLowerCase()
  );
}

export interface NormalizedMembership {
  id: string;
  userId: string | null;
  productId: string;
  planId: string;
  /** The real Whop license key, or null when the product issues none. */
  licenseKey: string | null;
  status: string;
  isValid: boolean;
  isTrial: boolean;
  productTitle: string;
  planName: string;
  creatorName: string;
  pricePaid: number;
  createdAt: string;
  expiresAt: string;
}

// Whop timestamps arrive as ISO 8601 strings on the v1 API and as epoch
// seconds in older payload shapes; accept both (and epoch-ish strings).
function toIsoTimestamp(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^\d+$/.test(trimmed)) return toIsoTimestamp(Number(trimmed));
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }
  return "";
}

// Whop money arrives either as cents (`amount_total`) or as a v1 money
// object `{ amount: "29.99" }` in dollars on initial/renewal price.
function toPricePaid(raw: any): number {
  if (typeof raw?.amount_total === "number") return raw.amount_total / 100;
  const money = raw?.initial_price ?? raw?.renewal_price;
  if (money && typeof money === "object" && money.amount != null) {
    const amount = Number(money.amount);
    return Number.isFinite(amount) ? amount : 0;
  }
  if (typeof raw?.amount === "number") return raw.amount;
  return 0;
}

/**
 * Defensively extracts the fields sync needs from a raw Whop membership,
 * accepting both the SDK/v1 shape (flat `product_id`, `plan_id`,
 * `current_period_end`) and nested shapes (`product.id`, `variant_id`)
 * seen in real webhook/API payloads. Returns null without an ID.
 */
export function normalizeMembership(raw: any): NormalizedMembership | null {
  if (!raw || typeof raw !== "object") return null;

  const id = raw.id || raw.membership_id || "";
  if (!id) return null;

  const status = String(raw.status || "").toLowerCase();

  return {
    id,
    userId: raw.user_id || raw.user?.id || null,
    productId: raw.product_id || raw.product?.id || "",
    planId:
      raw.plan_id || raw.variant_id || raw.plan?.id || raw.variant?.id || "",
    licenseKey: raw.license_key || raw.licenseKey || null,
    status,
    isValid: isValidMembershipStatus(status, raw.valid),
    isTrial: status === "trialing",
    productTitle:
      raw.product?.title || raw.product_name || "Verified Whop Access",
    planName:
      raw.plan?.title ||
      raw.plan_name ||
      raw.variant?.title ||
      "Verified Whop Membership",
    creatorName: raw.company?.title || raw.account?.title || "Whop Creator",
    pricePaid: toPricePaid(raw),
    createdAt: toIsoTimestamp(raw.created_at),
    expiresAt:
      toIsoTimestamp(raw.current_period_end) ||
      toIsoTimestamp(raw.expires_at),
  };
}

/**
 * Builds the StoredPass for a valid membership, in the same shape the
 * claim endpoint builds. Because most memberships have no license key,
 * the pass's key reference falls back to the membership ID; a real
 * license key is kept whenever the membership actually carries one.
 */
export function buildPassFromMembership(
  membership: NormalizedMembership,
  userId: string
): StoredPass {
  return {
    id: `pass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    productId: membership.productId,
    productTitle: membership.productTitle,
    creatorName: membership.creatorName,
    icon: "⚡",
    coverImage: "",
    licenseKey: membership.licenseKey || membership.id,
    status: "active",
    planName: membership.planName,
    pricePaid: membership.pricePaid,
    createdAt: membership.createdAt || new Date().toISOString(),
    expiresAt: membership.expiresAt,
    discordConnected: false,
    appType: "signals",
    ...(membership.isTrial ? { isTrialActive: true } : {}),
    whopMembershipId: membership.id,
    verifiedOnWhop: true,
  };
}

export interface PassSyncPlan {
  creates: StoredPass[];
  reactivations: StoredPass[];
  /** Membership IDs whose stored active pass must be expired. */
  membershipIdsToExpire: string[];
}

/**
 * Pure decision step: given the user's normalized Whop memberships and
 * their stored passes, decide what to create, reactivate, and expire.
 *
 * Expiry rule: a stored pass that is keyed to a membership
 * (`whopMembershipId`) is expired when that membership is not currently
 * valid — whether Whop returned it with an invalid status or did not
 * return it at all. Passes with no membership link (e.g. a legacy
 * license-key claim Whop could not attribute) are left untouched: sync
 * never revokes what it cannot attribute.
 */
export function planPassSync(
  userId: string,
  memberships: NormalizedMembership[],
  existingPasses: StoredPass[]
): PassSyncPlan {
  const validById = new Map<string, NormalizedMembership>();
  for (const membership of memberships) {
    if (membership.isValid) validById.set(membership.id, membership);
  }

  const creates: StoredPass[] = [];
  const reactivations: StoredPass[] = [];

  for (const membership of validById.values()) {
    const existing = existingPasses.find(
      (pass) => pass.whopMembershipId === membership.id
    );

    if (!existing) {
      creates.push(buildPassFromMembership(membership, userId));
    } else if (existing.status !== "active") {
      reactivations.push({
        ...existing,
        status: "active",
        // Adopt the real license key if Whop has started issuing one;
        // otherwise keep what the pass already references.
        licenseKey:
          membership.licenseKey || existing.licenseKey || membership.id,
        verifiedOnWhop: true,
      });
    }
  }

  const membershipIdsToExpire: string[] = [];
  for (const pass of existingPasses) {
    if (pass.status !== "active" || !pass.whopMembershipId) continue;
    if (!validById.has(pass.whopMembershipId)) {
      membershipIdsToExpire.push(pass.whopMembershipId);
    }
  }

  return { creates, reactivations, membershipIdsToExpire };
}

export interface PassSyncDeps {
  /** Raw memberships for the user in the company, from the Whop API. */
  listMemberships: () => Promise<any[]>;
  getPasses: (userId: string) => Promise<StoredPass[]>;
  savePass: (pass: StoredPass) => Promise<StoredPass>;
  expirePassByMembershipId: (membershipId: string) => Promise<boolean>;
}

export interface PassSyncResult {
  passes: StoredPass[];
  /** Set when the Whop API could not be read; passes are then the
   *  untouched stored set and nothing was created or revoked. */
  syncWarning?: string;
  created: number;
  reactivated: number;
  expired: number;
}

/**
 * Runs one sync for a verified user. Database failures propagate (the
 * caller maps them to 503 DATABASE_UNAVAILABLE); a Whop API failure is
 * fail-safe — it returns the stored passes with a warning and revokes
 * nothing, so a Whop outage can never strip a buyer of access.
 */
export async function syncPassesForUser(
  userId: string,
  deps: PassSyncDeps
): Promise<PassSyncResult> {
  const existingPasses = await deps.getPasses(userId);

  let rawMemberships: any[];
  try {
    rawMemberships = await deps.listMemberships();
  } catch (error) {
    console.error("[Whop Pass Sync] Membership list failed:", error);
    return {
      passes: existingPasses,
      syncWarning: "WHOP_SYNC_UNAVAILABLE",
      created: 0,
      reactivated: 0,
      expired: 0,
    };
  }

  // The list call is already scoped to the company and user, but the
  // verified identity is the only authority: drop anything Whop returns
  // that is not attributed to this user, whatever the API was asked for.
  const memberships = (Array.isArray(rawMemberships) ? rawMemberships : [])
    .map(normalizeMembership)
    .filter((m): m is NormalizedMembership => m !== null && m.userId === userId);

  const plan = planPassSync(userId, memberships, existingPasses);

  for (const pass of [...plan.creates, ...plan.reactivations]) {
    await deps.savePass(pass);
  }

  let expired = 0;
  for (const membershipId of plan.membershipIdsToExpire) {
    if (await deps.expirePassByMembershipId(membershipId)) expired += 1;
  }

  return {
    passes: await deps.getPasses(userId),
    created: plan.creates.length,
    reactivated: plan.reactivations.length,
    expired,
  };
}
