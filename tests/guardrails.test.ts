// Nexus Terminal saleable-product guardrails.
// Run with: npm test
// These tests lock in the honesty rules from README.md so a future edit
// cannot quietly reintroduce fake products, fake proof, unsafe checkout,
// or hardcoded Whop IDs.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { INITIAL_PRODUCTS, INITIAL_USER_PASSES } from '../src/data/whopProducts';

const root = join(import.meta.dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(join(root, dir))) {
    const rel = join(dir, name);
    const full = join(root, rel);
    if (statSync(full).isDirectory()) sourceFiles(rel, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(rel);
  }
  return out;
}

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`ok ${passed} - ${name}`);
}

// 1. The shipped catalog is sample templates only, with no fake proof.
check('catalog ships only labeled sample templates', () => {
  assert.ok(INITIAL_PRODUCTS.length > 0, 'catalog should not be empty');
  for (const product of INITIAL_PRODUCTS) {
    assert.equal(product.isSample, true, `${product.id} must be marked isSample`);
    assert.match(product.badge ?? '', /SAMPLE/i, `${product.id} must carry a SAMPLE badge`);
    assert.equal(product.rating, 0, `${product.id} must not invent a rating`);
    assert.equal(product.reviewCount, 0, `${product.id} must not invent reviews`);
    assert.equal(product.totalMembers, 0, `${product.id} must not invent member counts`);
    assert.equal(product.sampleReviews.length, 0, `${product.id} must not ship fake reviews`);
    for (const plan of product.plans) {
      assert.equal(plan.whopPlanId, undefined, `${product.id}/${plan.id} sample plan must not carry a live Whop plan ID`);
    }
  }
});

// 2. No passes are seeded — real passes come only from verified purchases.
check('no seeded user passes', () => {
  assert.deepEqual(INITIAL_USER_PASSES, []);
});

// 3. Banned claim phrases must not appear in shipped source copy.
//    (Negated/educational mentions such as "does not generate a win rate"
//    are checked by hand; the phrases below are unambiguous marketing claims.)
check('no banned marketing claims in source', () => {
  const banned = [
    /86\.2%/,
    /84% win/i,
    /win-rate of/i,
    /\$0 to \$100k/i,
    /spots left/i,
    /first 50 reviewers/i,
    /review = free lifetime/i,
    /guaranteed income/i,
    /passive income/i,
    /made back my monthly fee/i,
    /bankroll growth/i,
    /sub-millisecond/i,
    /1099\/VAT compliance/i,
  ];
  const files = [...sourceFiles('src'), 'server.ts'];
  for (const rel of files) {
    const text = read(rel);
    for (const pattern of banned) {
      assert.ok(!pattern.test(text), `${rel} contains banned claim ${pattern}`);
    }
  }
});

// 4. No hardcoded Whop App/Company IDs anywhere in source.
check('no hardcoded Whop app or company IDs', () => {
  const idPattern = /\b(app|biz)_[A-Za-z0-9]{10,}\b/;
  const files = [...sourceFiles('src'), 'server.ts', ...sourceFiles('api')];
  for (const rel of files) {
    assert.ok(!idPattern.test(read(rel)), `${rel} contains a hardcoded Whop ID`);
  }
});

// 5. Checkout gating: the modal must key off whopPlanId, never the
//    internal catalog plan id, and sample plans (checked in test 1)
//    therefore can never open checkout.
check('checkout requires a configured whopPlanId', () => {
  const modal = read('src/components/CheckoutModal.tsx');
  assert.match(modal, /plan\.whopPlanId/, 'checkout must check plan.whopPlanId');
  assert.match(modal, /encodeURIComponent\(plan\.whopPlanId!\)/, 'checkout URL must use whopPlanId');
  assert.ok(!/encodeURIComponent\(plan\.id\)/.test(modal), 'checkout must not use the internal plan id');
});

// 6. The fake payout simulator and fake-urgency countdown stay removed.
check('no fake payout simulator or countdown component', () => {
  const creator = read('src/components/CreatorStudioView.tsx');
  assert.ok(!/Payout Withdrawal|Confirm Direct Deposit/.test(creator), 'payout simulator must stay removed');
  const allSrc = sourceFiles('src').map(read).join('\n');
  assert.ok(!/OfferCountdownTimer/.test(allSrc), 'countdown timer must stay removed');
});

// 7. Config status endpoints must not fall back to built-in IDs.
check('config status has no built-in ID fallbacks', () => {
  for (const rel of ['server.ts', 'api/v1/config/status.ts']) {
    const text = read(rel);
    assert.ok(!/WHOP_COMPANY_ID \|\| "biz_/.test(text), `${rel} must not default the company ID`);
    assert.ok(!/\|\| "app_/.test(text), `${rel} must not default the app ID`);
  }
});

// 8. Buyer identity: no placeholder ID and no client-supplied identity
//    header anywhere in shipped source. Identity must come from the
//    verified Whop iframe token, never from a header the client invents.
check('no placeholder buyer identity or trusted client ID header', () => {
  const files = [...sourceFiles('src'), 'server.ts', 'server_whop_auth.ts'];
  for (const rel of files) {
    const text = read(rel);
    assert.ok(!/usr_demo_placeholder/.test(text), `${rel} still contains the placeholder buyer ID`);
    assert.ok(
      !/headers\[["']x-whop-user-id["']\]/.test(text),
      `${rel} must not read identity from a client-supplied user-ID header`
    );
  }
  const passesView = read('src/components/MemberPassesView.tsx');
  assert.ok(
    !/['"]x-whop-user-id['"]\s*:/.test(passesView),
    'claim request must not send a client-invented user ID'
  );
});

// 9. Server identity wiring: the claim, passes, and auth/me endpoints
//    resolve identity through the JWKS token verifier.
check('server derives identity from the verified Whop user token', () => {
  const server = read('server.ts');
  assert.match(server, /resolveWhopUserIdentity\(req\.headers\)/, 'server must resolve identity via the token verifier');
  assert.ok(
    (server.match(/resolveWhopUserIdentity\(req\.headers\)/g) || []).length >= 3,
    'auth/me, passes list, and pass claim must all use the verified identity'
  );
  const auth = read('server_whop_auth.ts');
  assert.match(auth, /api\.whop\.com\/\.well-known\/jwks\.json/, 'verifier must use Whop\'s official JWKS endpoint');
  assert.match(auth, /jwtVerify/, 'verifier must cryptographically verify the JWT');
  // The dev fallback must stay gated off in production.
  assert.match(auth, /NODE_ENV !== "production"/, 'dev identity fallback must be gated to non-production');
});

// 10. Cryptographic round-trip: a token signed by a test RS256 key is
//     accepted via a local JWKS; tampered and expired tokens are not.
async function checkTokenVerification() {
  const { generateKeyPair, exportJWK, createLocalJWKSet, SignJWT } =
    await import('jose');
  const { verifyWhopUserToken, resolveWhopUserIdentity } =
    await import('../server_whop_auth.ts');

  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = await exportJWK(publicKey);
  jwk.kid = 'test-key-1';
  jwk.alg = 'RS256';
  const localJwks = createLocalJWKSet({ keys: [jwk] });

  const sign = (claims: Record<string, unknown>, exp: string) =>
    new SignJWT(claims)
      .setProtectedHeader({ alg: 'RS256', kid: 'test-key-1' })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(privateKey);

  const good = await sign({ sub: 'user_buyer123' }, '5m');
  const okResult = await verifyWhopUserToken(good, localJwks);
  assert.equal(okResult.valid, true, 'valid RS256 token must verify');
  assert.equal(okResult.userId, 'user_buyer123', 'user ID must come from the token subject');

  const expired = await sign({ sub: 'user_buyer123' }, '-5m');
  const expiredResult = await verifyWhopUserToken(expired, localJwks);
  assert.equal(expiredResult.valid, false, 'expired token must be rejected');

  const tampered = `${good.slice(0, -2)}xx`;
  const tamperedResult = await verifyWhopUserToken(tampered, localJwks);
  assert.equal(tamperedResult.valid, false, 'tampered token must be rejected');

  // No token and no dev header → no identity (fail closed).
  assert.equal(await resolveWhopUserIdentity({}), null);

  passed += 1;
  console.log(`ok ${passed} - Whop user token verification round-trip`);
}

// 11. Database failure hardening: server_db.ts throws when DATABASE_URL
//     is unset (or Postgres is unreachable), and Express 4 does not catch
//     async handler rejections — an unguarded DB call crashes the whole
//     process. Every DB-backed handler must route that throw through the
//     503 responder instead.
check('database failures degrade to 503, not a process crash', () => {
  const server = read('server.ts');
  assert.match(
    server,
    /status\(503\)\.json\(\{\s*\.\.\.extra,\s*error: "DATABASE_UNAVAILABLE"/,
    'server must define a 503 DATABASE_UNAVAILABLE responder'
  );
  const guarded = (server.match(/return databaseUnavailable\(res, error/g) || []).length;
  assert.ok(
    guarded >= 6,
    `auth/me, passes, pass claim (x2), webhook receive, and webhook history must all guard their DB calls (found ${guarded})`
  );
  assert.ok(
    !/const passes = await getPassesForUser/.test(server),
    'passes lookups must be wrapped so a DB throw cannot crash the process'
  );
  assert.ok(
    !/const store = loadStore\(\)/.test(server),
    'webhook history must await loadStore inside a guarded block'
  );
});

await checkTokenVerification();

console.log(`\n${passed} guardrail checks passed`);
