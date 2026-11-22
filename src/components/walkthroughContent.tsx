import React from 'react';
import {
  Sparkles,
  CreditCard,
  RefreshCw,
  Key,
  Layers,
  PlayCircle,
  Compass,
  LucideIcon,
} from 'lucide-react';
import { NavMode } from './HeaderNav';

// Shared "how to use Nexus" steps. The first-run walkthrough modal and
// the permanent Help section render the same content from this list, so
// the two can never drift apart. Copy rules: describe only what the app
// really does — checkout happens on Whop, passes come from verified
// memberships or verified license keys, and the shipped catalog is
// labeled sample templates. No income claims, no invented numbers.
export interface WalkthroughStep {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: React.ReactNode;
  actionLabel?: string;
  actionMode?: NavMode;
}

export const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'welcome',
    icon: Sparkles,
    eyebrow: 'Welcome',
    title: 'What Nexus Terminal is',
    body: (
      <>
        <p>
          Nexus Terminal is the member terminal for your Whop purchases. It
          keeps your access passes, membership status, and embedded member
          apps in one place, so you can see exactly what you own and launch
          it without digging through Whop.
        </p>
        <p>
          This quick tour covers how a pass gets activated, the backup key
          claim, what the catalog templates are, and where everything lives.
          You can reopen it any time from <strong>How to Use</strong> in the
          top bar.
        </p>
      </>
    ),
    actionLabel: 'Go to your Dashboard',
    actionMode: 'dashboard',
  },
  {
    id: 'buy',
    icon: CreditCard,
    eyebrow: 'Step 1',
    title: 'Buy on Whop',
    body: (
      <>
        <p>
          Everything starts with a purchase on Whop. Checkout always happens
          on Whop itself — Nexus Terminal never takes your card details.
        </p>
        <p>
          Buy with the Whop account you plan to use, because your pass is
          tied to that account's memberships. When the purchase completes,
          come back here: activation is automatic, as the next step shows.
        </p>
      </>
    ),
  },
  {
    id: 'sync',
    icon: RefreshCw,
    eyebrow: 'Step 2',
    title: 'Open Nexus and your pass syncs',
    body: (
      <>
        <p>
          Open Nexus Terminal from inside Whop, signed in with the same
          Whop account you bought with. Nexus reads your memberships
          (<code className="font-mono text-[11px]">member:basic:read</code>)
          to find your purchase and confirms your subscription is active
          (<code className="font-mono text-[11px]">payment:basic:read</code>),
          then activates your pass automatically.
        </p>
        <p>
          Most Whop products never issue a license key, so sync is the
          normal route. Passes refresh from your memberships whenever you
          open <strong>My Passes</strong> — if you renew, cancel, or buy
          something new, the pass status follows your real membership.
        </p>
      </>
    ),
    actionLabel: 'Open My Passes',
    actionMode: 'passes',
  },
  {
    id: 'key-claim',
    icon: Key,
    eyebrow: 'Backup route',
    title: 'Claim a license key instead',
    body: (
      <>
        <p>
          A few Whop products — mainly software licensing — hand you a
          license key rather than relying on membership sync. If you were
          given a key, it works as a backup way in.
        </p>
        <p>
          Open <strong>My Passes</strong> and choose{' '}
          <strong>"Have a license key instead?"</strong>, enter the key, and
          Nexus verifies it with Whop before the pass activates. A key that
          cannot be verified never creates a pass.
        </p>
      </>
    ),
    actionLabel: 'Go to key claim',
    actionMode: 'passes',
  },
  {
    id: 'catalog',
    icon: Layers,
    eyebrow: 'The catalog',
    title: 'Marketplace items are sample templates',
    body: (
      <>
        <p>
          The Marketplace catalog ships as clearly labeled{' '}
          <strong>SAMPLE templates</strong>. They show creators how a
          storefront, product page, and plans can be arranged — each
          creator replaces them with their own real Whop products.
        </p>
        <p>
          Sample items are not live offers: they carry no ratings, reviews,
          or member counts, and checkout stays disabled on them until a real
          Whop plan is configured. Your own passes, by contrast, always come
          from real verified purchases.
        </p>
      </>
    ),
    actionLabel: 'Browse the Marketplace',
    actionMode: 'marketplace',
  },
  {
    id: 'perks',
    icon: PlayCircle,
    eyebrow: 'Your perks',
    title: 'Launch member apps from your pass',
    body: (
      <>
        <p>
          Every active pass carries its perks. Open{' '}
          <strong>My Passes</strong>, find the pass, and choose{' '}
          <strong>"Launch Embedded Whop App"</strong> to open its member
          app — a course vault, file downloads, a signals feed, or a
          community chat, depending on the product.
        </p>
        <p>
          The pass card also shows your license key or Whop membership ID,
          your plan, and your renewal date, with a copy button for the
          reference. Expired or canceled memberships show as expired passes
          after the next sync.
        </p>
      </>
    ),
    actionLabel: 'View My Passes',
    actionMode: 'passes',
  },
  {
    id: 'sections',
    icon: Compass,
    eyebrow: 'Finding your way',
    title: 'Where everything lives',
    body: (
      <ul className="space-y-1.5">
        <li>
          <strong>Dashboard</strong> — your pass status at a glance, plus
          the next step if nothing is synced yet.
        </li>
        <li>
          <strong>Marketplace</strong> — the catalog of sample templates
          described in the previous step.
        </li>
        <li>
          <strong>My Passes</strong> — synced passes, key claim, and the
          launch buttons for embedded member apps.
        </li>
        <li>
          <strong>Creator Studio</strong> — where creators arrange their
          own catalog content and listing material.
        </li>
        <li>
          <strong>API Validator</strong> — developer tools for testing
          webhook events and API wiring.
        </li>
        <li>
          <strong>How to Use</strong> — this guide, always available from
          the top bar and the Help section.
        </li>
      </ul>
    ),
  },
];
