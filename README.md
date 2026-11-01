# Nexus Terminal — Creator Terminal for Whop

By **Elite Software Studio**.

Nexus Terminal is a Whop app for creators who sell digital products, courses,
communities, and software licenses. A creator installs it on their Whop
company and gets:

- **Storefront / Marketplace view** — presents the creator's products and
  plans inside Whop (embedded) or on the web.
- **Member passes** — buyers see their passes, plan, status, and license
  keys in one portal.
- **Embedded member apps** — course player, community lounge, download
  vault, and license views delivered per pass.
- **License & membership validation** — server endpoints that check a
  license key or membership with Whop before answering, so a creator's
  software can gate access on a real purchase.
- **Webhook automation** — signature-verified Whop webhooks provision
  access when a membership becomes valid and revoke it when it ends,
  is cancelled, or is deleted. Duplicate events are ignored.
- **Creator Studio** — product management, analytics dashboards,
  affiliate/coupon managers, an AI copy helper (Gemini), and webhook /
  API testing tools.

Payments, checkout, balances, and payouts are always handled by Whop.
Nexus Terminal never collects card details and never holds or moves funds.

## Honesty rules baked into this codebase

- The shipped catalog is **sample templates only** (course, community,
  software license, download vault). They are labeled SAMPLE, have no
  reviews, no member counts, and no performance or income claims.
- **Checkout stays disabled** until a plan carries a real Whop plan ID
  (`whopPlanId` on the plan, set after the plan exists in the creator's
  Whop dashboard). Sample plan IDs can never open checkout.
- Creator Studio analytics ship with **sample data, labeled as sample**.
  Real revenue/member figures live in the creator's Whop dashboard.
- There are **no built-in Whop App ID / Company ID defaults**. Both come
  from environment configuration; the config endpoint reports them as
  unset until configured.
- AI helpers draft copy and alert *formats* for the creator to review.
  They must not promise income, returns, or win rates, and the signals
  draft endpoint adds a not-financial-advice disclaimer.

## Stack

- React 19 + Vite + Tailwind CSS 4 (frontend)
- Express (server, `server.ts`) with Vercel serverless bridges in `api/`
- `@whop/sdk` + Whop REST for membership/license verification
- Postgres (`pg`) for passes, reviews, webhook logs, processed events —
  tables `nexus_passes`, `nexus_reviews`, `nexus_webhook_logs`,
  `nexus_processed_events`
- Gemini (`@google/genai`), server-side only

## Configuration

Copy `.env.example` to `.env` (or set the same variables in your host):

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | AI copy / chat / draft helpers (server-side) |
| `APP_URL` | Public URL of this deployment |
| `WHOP_API_KEY` | Verify memberships and licenses with Whop |
| `WHOP_WEBHOOK_SECRET` | Verify webhook signatures (shown once in Whop — capture it when created) |
| `WHOP_APP_ID` | Your Whop App ID (also `NEXT_PUBLIC_WHOP_APP_ID` / `VITE_WHOP_APP_ID` if your setup uses them) |
| `WHOP_COMPANY_ID` | Your Whop Company ID |
| `DATABASE_URL` | Postgres connection string — **required in production**; without it the server boots with a warning but database operations fail |

## Run locally

```bash
npm install
npm run dev        # tsx server.ts (Vite middleware in development)
npm run build      # vite build + esbuild server bundle to dist/
npm start          # node dist/server.cjs
npm test           # guardrail tests (catalog honesty, checkout gating, no hardcoded IDs)
npm run lint       # tsc --noEmit (run after a build; api/ bridges import dist/server.cjs)
```

Health/config checks once running:

- `GET /api/health`
- `GET /api/v1/config/status` — shows which integrations are configured
  (booleans only, never secret values)

## Going live (creator checklist)

1. Create the real products and plans in Whop; attach each plan's real
   Whop plan ID (`whopPlanId`) to the matching catalog plan, and replace
   the sample templates with your real products.
2. Set all environment variables above in the deployment (Vercel).
3. Point the Whop webhook to `POST /api/v1/webhooks/receive` and store
   the webhook secret in `WHOP_WEBHOOK_SECRET`.
4. Run a sandbox purchase for each plan: buy → pass activates → cancel →
   pass revokes. Test a license validation and a refund path.
5. Set the price of Nexus Terminal itself in Whop (the in-app Sell on
   Whop guide suggests $29/mo as a starting point — final pricing is
   Elite Software Studio's decision, it is not enforced in code).

## Known production blockers (found in the 2026-11-01 saleable pass)

- **Buyer identity on pass claim:** the member-passes claim flow still
  sends a placeholder `x-whop-user-id` (`usr_demo_placeholder`, marked
  with a TODO in `MemberPassesView.tsx`). Wire the real Whop user
  identity from the Whop iframe/session before live sales so passes are
  tied to the actual buyer.
- **Gemini model string:** the server requests `gemini-3.6-flash`.
  Confirm that model name is available on the production Gemini account
  at deploy time; the endpoints degrade to honest sample responses when
  no key is configured.
- **Analytics are presentational:** Creator Studio charts use labeled
  sample data. A live Whop reporting integration is a post-launch item,
  not a launch claim.

## Repository notes

- No secrets live in this repo. `.env*` is gitignored except
  `.env.example`, which contains placeholders only.
- Local browser storage keys are versioned (`nexus_*_v2`) so older demo
  data saved by earlier builds does not leak into this version.
