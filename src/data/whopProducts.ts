import { WhopProduct, AccessPass, SignalAlert, CourseLesson } from '../types';

// Nexus Terminal ships with SAMPLE TEMPLATE products only.
// They show a creator what kinds of offers the terminal can present and
// deliver (courses, communities, software licenses, download vaults).
// They are not real offers: they have no reviews, no member counts, no
// performance claims, and no live Whop plan attached, so checkout stays
// disabled until the creator replaces them with their own real Whop
// products and plans (set `whopPlanId` on a plan once it exists in Whop).
export const INITIAL_PRODUCTS: WhopProduct[] = [
  {
    isSample: true,
    id: 'sample_course_template',
    title: 'Sample Template — Video Course',
    creatorName: 'Your Brand Here',
    creatorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    category: 'education',
    rating: 0,
    reviewCount: 0,
    totalMembers: 0,
    coverImage: '/academy_masterclass_pro.jpg',
    icon: '🎓',
    badge: 'SAMPLE TEMPLATE',
    shortTagline: 'Template for selling a video course with lessons delivered inside your member portal.',
    fullDescription: 'Replace this sample with your own course. Nexus Terminal presents your lessons in the member portal, tracks lesson progress for each pass holder, and grants or revokes access automatically from your Whop membership webhooks.',
    plans: [
      { id: 'sample_plan_course_full', name: 'Example — Full Course Access', price: 99, interval: 'one_time', description: 'Example price only. Attach your real Whop plan to enable checkout.' }
    ],
    features: [
      'Lesson list with per-member progress tracking',
      'Access granted and revoked by Whop membership webhooks',
      'Member portal view inside Whop (embedded app view)',
      'Replaceable sample lessons — add your own titles and summaries'
    ],
    perks: {
      hasAppWidget: true,
      appType: 'course',
      lessonsCount: 3
    },
    sampleReviews: []
  },
  {
    isSample: true,
    id: 'sample_community_template',
    title: 'Sample Template — Community Access Pass',
    creatorName: 'Your Brand Here',
    creatorAvatar: 'https://images.unsplash.com/photo-1614680376593-902f749f702f?auto=format&fit=crop&w=150&q=80',
    category: 'coaching',
    rating: 0,
    reviewCount: 0,
    totalMembers: 0,
    coverImage: '/creator_crm_pro.jpg',
    icon: '💬',
    badge: 'SAMPLE TEMPLATE',
    shortTagline: 'Template for a paid community pass with a member lounge delivered in the portal.',
    fullDescription: 'Replace this sample with your own community offer. Nexus Terminal shows pass holders a member lounge in the portal and keeps access in sync with each member\u2019s Whop membership status.',
    plans: [
      { id: 'sample_plan_community_mo', name: 'Example — Monthly Community Pass', price: 29, interval: 'monthly', description: 'Example price only. Attach your real Whop plan to enable checkout.' }
    ],
    features: [
      'Member lounge view for active pass holders',
      'Access synced to Whop membership status via webhooks',
      'Pass details, plan name, and renewal date shown to the member',
      'Works alongside your existing Discord or chat tooling'
    ],
    perks: {
      hasAppWidget: true,
      appType: 'chat'
    },
    sampleReviews: []
  },
  {
    isSample: true,
    id: 'sample_software_template',
    title: 'Sample Template — Software License',
    creatorName: 'Your Brand Here',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    category: 'saas',
    rating: 0,
    reviewCount: 0,
    totalMembers: 0,
    coverImage: '/digital_vault_pro.jpg',
    icon: '🔑',
    badge: 'SAMPLE TEMPLATE',
    shortTagline: 'Template for selling software with a license key validated by the Nexus Terminal API.',
    fullDescription: 'Replace this sample with your own software offer. Buyers receive a license key with their pass, and your software can validate that key against the Nexus Terminal server, which checks it with Whop before answering.',
    plans: [
      { id: 'sample_plan_software_mo', name: 'Example — Monthly License', price: 19, interval: 'monthly', description: 'Example price only. Attach your real Whop plan to enable checkout.' },
      { id: 'sample_plan_software_yr', name: 'Example — Annual License', price: 190, interval: 'yearly', description: 'Example price only. Attach your real Whop plan to enable checkout.' }
    ],
    features: [
      'License key issued with each verified pass',
      'Server-side license validation endpoint (checks with Whop)',
      'Membership validation endpoint for in-app access checks',
      'Keys stop validating when the Whop membership ends'
    ],
    perks: {
      hasAppWidget: true,
      appType: 'license_api'
    },
    sampleReviews: []
  },
  {
    isSample: true,
    id: 'sample_vault_template',
    title: 'Sample Template — Digital Download Vault',
    creatorName: 'Your Brand Here',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    category: 'saas',
    rating: 0,
    reviewCount: 0,
    totalMembers: 0,
    coverImage: '/trading_terminal_pro.jpg',
    icon: '🗂️',
    badge: 'SAMPLE TEMPLATE',
    shortTagline: 'Template for delivering downloadable files and resources to paying members.',
    fullDescription: 'Replace this sample with your own download offer — templates, spreadsheets, prompt packs, design files, or resource libraries. Pass holders open the vault from their member portal; access follows their Whop membership status.',
    plans: [
      { id: 'sample_plan_vault_full', name: 'Example — Vault Access', price: 49, interval: 'one_time', description: 'Example price only. Attach your real Whop plan to enable checkout.' }
    ],
    features: [
      'Download vault view for active pass holders',
      'Organize files by product and plan',
      'Access granted and revoked by Whop membership webhooks',
      'No card data handled by the app — checkout stays on Whop'
    ],
    perks: {
      hasAppWidget: true,
      appType: 'file_vault',
      downloadFilesCount: 0
    },
    sampleReviews: []
  }
];

// No passes are seeded. Real passes are created only after a buyer's
// Whop membership or license is verified by the server.
export const INITIAL_USER_PASSES: AccessPass[] = [];

// Example entries that only demonstrate the alert format a creator
// could publish in a signals-style app view. They are not predictions,
// recommendations, or performance claims.
export const SAMPLE_SIGNALS: SignalAlert[] = [
  {
    id: 'example_sig_1',
    asset: 'EXAMPLE / DEMO',
    action: 'BUY / LONG',
    entry_zone: 'Example format only',
    target_1: '—',
    target_2: '—',
    stop_loss: '—',
    risk_reward: '—',
    reasoning: 'Sample entry showing how an alert is laid out in the terminal. Replace with your own content if you run a signals app — Nexus Terminal does not generate investment advice.',
    timestamp: 'Sample'
  }
];

export const SAMPLE_COURSE_LESSONS: CourseLesson[] = [
  {
    id: 'les_1',
    title: '1. Welcome — How This Course Template Works',
    duration: '—',
    completed: false,
    summary: 'Sample lesson. Replace this list with your own lesson titles, durations, and summaries.'
  },
  {
    id: 'les_2',
    title: '2. Adding Your Own Lessons',
    duration: '—',
    completed: false,
    summary: 'Each lesson you add appears here for pass holders, with progress tracked per member.'
  },
  {
    id: 'les_3',
    title: '3. Keeping Access in Sync with Whop',
    duration: '—',
    completed: false,
    summary: 'When a membership ends, the webhook receiver revokes the pass and the lessons lock again automatically.'
  }
];
