// Pass-sync decision logic tests.
// Run with: npm test
// Covers POST /api/v1/passes/sync's brain (server_pass_sync.ts) with the
// Whop client and the pass store mocked: a valid membership must create
// (or reactivate) a pass, an invalid or vanished membership must expire
// its pass, another user's memberships must be ignored, and a Whop API
// failure must revoke nothing.
import assert from 'node:assert/strict';

import {
  normalizeMembership,
  planPassSync,
  syncPassesForUser,
  type PassSyncDeps,
} from '../server_pass_sync.ts';
import type { StoredPass } from '../server_db.ts';

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
}
async function checkAsync(name: string, fn: () => Promise<void>) {
  await fn();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
}

const USER = 'user_buyer_1';

function rawMembership(overrides: Record<string, unknown> = {}) {
  return {
    id: 'mem_test_valid',
    user_id: USER,
    product_id: 'prod_test_1',
    variant_id: 'plan_test_1',
    license_key: null,
    status: 'completed',
    product: { id: 'prod_test_1', title: 'Test Product' },
    created_at: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

function storedPass(overrides: Partial<StoredPass> = {}): StoredPass {
  return {
    id: 'pass_existing',
    userId: USER,
    productId: 'prod_test_1',
    productTitle: 'Test Product',
    creatorName: 'Whop Creator',
    icon: '⚡',
    coverImage: '',
    licenseKey: '',
    status: 'active',
    planName: 'Verified Whop Membership',
    pricePaid: 0,
    createdAt: '2026-11-01T00:00:00.000Z',
    expiresAt: '',
    discordConnected: false,
    appType: 'signals',
    whopMembershipId: 'mem_test_valid',
    verifiedOnWhop: true,
    ...overrides,
  };
}

// --- normalizeMembership -------------------------------------------------

check('normalizes a v1 membership with no license key', () => {
  const m = normalizeMembership(rawMembership());
  assert.ok(m);
  assert.equal(m.id, 'mem_test_valid');
  assert.equal(m.userId, USER);
  assert.equal(m.productId, 'prod_test_1');
  assert.equal(m.planId, 'plan_test_1', 'plan comes from variant_id');
  assert.equal(m.licenseKey, null, 'app-type products carry no key');
  assert.equal(m.isValid, true, 'completed memberships are valid');
  assert.equal(m.productTitle, 'Test Product');
});

check('normalizes the SDK membership shape and keeps a real key', () => {
  const m = normalizeMembership(
    rawMembership({
      plan_id: 'plan_sdk_1',
      variant_id: undefined,
      license_key: 'REAL-KEY-123',
      status: 'active',
      current_period_end: '2027-01-01T00:00:00.000Z',
    })
  );
  assert.ok(m);
  assert.equal(m.planId, 'plan_sdk_1');
  assert.equal(m.licenseKey, 'REAL-KEY-123');
  assert.equal(m.expiresAt, '2027-01-01T00:00:00.000Z');
});

check('invalid statuses are not valid; the valid flag wins', () => {
  assert.equal(normalizeMembership(rawMembership({ status: 'canceled' }))?.isValid, false);
  assert.equal(normalizeMembership(rawMembership({ status: 'expired' }))?.isValid, false);
  assert.equal(normalizeMembership(rawMembership({ status: 'past_due' }))?.isValid, false);
  assert.equal(
    normalizeMembership(rawMembership({ status: 'past_due', valid: true }))?.isValid,
    true,
    'an explicit Whop valid flag overrides the status string'
  );
  assert.equal(normalizeMembership({ status: 'active' }), null, 'no ID, no membership');
});

// --- planPassSync ----------------------------------------------------------

check('a valid membership with no pass creates one keyed by membership ID', () => {
  const m = normalizeMembership(rawMembership())!;
  const plan = planPassSync(USER, [m], []);
  assert.equal(plan.creates.length, 1);
  assert.equal(plan.reactivations.length, 0);
  assert.equal(plan.membershipIdsToExpire.length, 0);
  const pass = plan.creates[0];
  assert.equal(pass.status, 'active');
  assert.equal(pass.whopMembershipId, 'mem_test_valid');
  assert.equal(
    pass.licenseKey,
    'mem_test_valid',
    'with no license key issued, the membership ID is the key reference'
  );
});

check('a membership with a real license key keeps that key on the pass', () => {
  const m = normalizeMembership(rawMembership({ license_key: 'REAL-KEY-9' }))!;
  const plan = planPassSync(USER, [m], []);
  assert.equal(plan.creates[0].licenseKey, 'REAL-KEY-9');
});

check('an already-active pass for a valid membership is left alone', () => {
  const m = normalizeMembership(rawMembership())!;
  const plan = planPassSync(USER, [m], [storedPass()]);
  assert.equal(plan.creates.length, 0);
  assert.equal(plan.reactivations.length, 0);
  assert.equal(plan.membershipIdsToExpire.length, 0);
});

check('an expired pass is reactivated when its membership is valid again', () => {
  const m = normalizeMembership(rawMembership())!;
  const plan = planPassSync(USER, [m], [storedPass({ status: 'expired' })]);
  assert.equal(plan.reactivations.length, 1);
  assert.equal(plan.reactivations[0].status, 'active');
  assert.equal(plan.membershipIdsToExpire.length, 0);
});

check('a pass expires when its membership comes back invalid', () => {
  const m = normalizeMembership(rawMembership({ status: 'canceled' }))!;
  const plan = planPassSync(USER, [m], [storedPass()]);
  assert.deepEqual(plan.membershipIdsToExpire, ['mem_test_valid']);
  assert.equal(plan.creates.length, 0);
});

check('a pass expires when its membership is no longer returned', () => {
  const plan = planPassSync(USER, [], [storedPass()]);
  assert.deepEqual(plan.membershipIdsToExpire, ['mem_test_valid']);
});

check('passes with no membership link are never expired by sync', () => {
  const legacy = storedPass({ id: 'pass_legacy', whopMembershipId: undefined });
  const plan = planPassSync(USER, [], [legacy]);
  assert.equal(plan.membershipIdsToExpire.length, 0);
});

// --- syncPassesForUser (mocked Whop client + store) ------------------------

interface MockStore {
  passes: StoredPass[];
  saved: StoredPass[];
  expiredIds: string[];
  deps: PassSyncDeps;
}

function mockDeps(listResult: any[] | Error, initial: StoredPass[]): MockStore {
  const store: MockStore = {
    passes: [...initial],
    saved: [],
    expiredIds: [],
    deps: null as unknown as PassSyncDeps,
  };
  store.deps = {
    listMemberships: async () => {
      if (listResult instanceof Error) throw listResult;
      return listResult;
    },
    getPasses: async (userId) => store.passes.filter((p) => p.userId === userId),
    savePass: async (pass) => {
      store.saved.push(pass);
      const idx = store.passes.findIndex(
        (p) =>
          p.id === pass.id ||
          (pass.whopMembershipId && p.whopMembershipId === pass.whopMembershipId)
      );
      if (idx >= 0) store.passes[idx] = { ...store.passes[idx], ...pass, id: store.passes[idx].id };
      else store.passes.push(pass);
      return pass;
    },
    expirePassByMembershipId: async (membershipId) => {
      store.expiredIds.push(membershipId);
      const target = store.passes.find((p) => p.whopMembershipId === membershipId);
      if (target) target.status = 'expired';
      return Boolean(target);
    },
  };
  return store;
}

await checkAsync('sync creates, reactivates, expires, and ignores other users', async () => {
  const store = mockDeps(
    [
      rawMembership({ id: 'mem_test_new' }),
      rawMembership({ id: 'mem_test_ended', status: 'canceled' }),
      rawMembership({ id: 'mem_test_other', user_id: 'user_someone_else' }),
    ],
    [
      storedPass({ id: 'pass_ended', whopMembershipId: 'mem_test_ended' }),
      storedPass({ id: 'pass_new', whopMembershipId: 'mem_test_new', status: 'expired' }),
    ]
  );

  const result = await syncPassesForUser(USER, store.deps);

  assert.equal(result.created, 0, 'the new membership already had a pass');
  assert.equal(result.reactivated, 1, 'its expired pass reactivates');
  assert.equal(result.expired, 1, 'the canceled membership pass expires');
  assert.deepEqual(store.expiredIds, ['mem_test_ended']);
  assert.ok(
    !result.passes.some((p) => p.whopMembershipId === 'mem_test_other'),
    "another user's membership must never create a pass here"
  );
  assert.equal(
    result.passes.find((p) => p.whopMembershipId === 'mem_test_new')?.status,
    'active'
  );
  assert.equal(
    result.passes.find((p) => p.whopMembershipId === 'mem_test_ended')?.status,
    'expired'
  );
});

await checkAsync('sync creates a pass for a first-time buyer', async () => {
  const store = mockDeps([rawMembership()], []);
  const result = await syncPassesForUser(USER, store.deps);
  assert.equal(result.created, 1);
  assert.equal(result.passes.length, 1);
  assert.equal(result.passes[0].licenseKey, 'mem_test_valid');
});

await checkAsync('a Whop API failure is fail-safe: stored passes, warning, no revocation', async () => {
  const store = mockDeps(new Error('whop unreachable'), [storedPass()]);
  const result = await syncPassesForUser(USER, store.deps);
  assert.equal(result.syncWarning, 'WHOP_SYNC_UNAVAILABLE');
  assert.equal(store.saved.length, 0, 'nothing is created on API failure');
  assert.equal(store.expiredIds.length, 0, 'nothing is revoked on API failure');
  assert.equal(result.passes.length, 1);
  assert.equal(result.passes[0].status, 'active', 'the stored pass is untouched');
});

console.log(`\n${passed} pass-sync checks passed`);
