import { WhopProduct, AccessPass, SignalAlert, CourseLesson } from '../types';

export const INITIAL_PRODUCTS: WhopProduct[] = [
  {
    id: 'prod_apex_signals',
    title: 'Apex Trading Signals & VIP Pass',
    creatorName: 'Apex Quantitative Labs',
    creatorAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
    category: 'trading',
    rating: 4.9,
    reviewCount: 384,
    totalMembers: 2450,
    coverImage: '/trading_terminal_pro.jpg',
    icon: '📈',
    badge: '🔥 BESTSELLER',
    shortTagline: 'Institutional crypto & stock signals powered by 84% win-rate quantitative algorithms.',
    fullDescription: 'Gain instant access to real-time institutional buy/sell alerts, custom TradingView indicators, private Discord trading floors, and daily live market breakdown sessions hosted by top quantitative traders.',
    plans: [
      { id: 'plan_apex_mo', name: 'Monthly VIP Pass', price: 49, interval: 'monthly', trialDays: 3, description: '3-day free trial, cancel anytime.' },
      { id: 'plan_apex_lifetime', name: 'Lifetime Inner Circle', price: 499, interval: 'one_time', description: 'One-time payment for permanent access.' }
    ],
    features: [
      'Real-time automated Discord & Telegram push alerts',
      'Exclusive Whop App live signal dashboard widget',
      'Proprietary TradingView PineScript indicator script key',
      'Daily live voice chat streams during London & NY open',
      'Risk management spreadsheets and position sizing calculator'
    ],
    perks: {
      discordServer: 'https://discord.gg/whop-apex-trading',
      hasAppWidget: true,
      appType: 'signals',
      downloadFilesCount: 8
    },
    sampleReviews: [
      { userName: 'Marcus T.', userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', rating: 5, comment: 'Made back my monthly fee in 2 days. The entry and stop loss zones are surgical.', date: 'Yesterday' },
      { userName: 'Elena R.', userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', rating: 5, comment: 'The Whop app widget embedded in my dashboard makes checking alerts super seamless!', date: '3 days ago' }
    ]
  },
  {
    id: 'prod_promptcraft_ai',
    title: 'PromptCraft Pro & Gemini API Key Vault',
    creatorName: 'AITools Studio',
    creatorAvatar: 'https://images.unsplash.com/photo-1614680376593-902f749f702f?auto=format&fit=crop&w=150&q=80',
    category: 'saas',
    rating: 4.8,
    reviewCount: 219,
    totalMembers: 1820,
    coverImage: '/digital_vault_pro.jpg',
    icon: '🤖',
    badge: '⚡ POPULAR SAAS',
    shortTagline: 'Curated library of 500+ production AI prompts, custom agents & API key license validator.',
    fullDescription: 'The ultimate AI developer toolkit for creators building automated micro-SaaS, marketing workflows, and LLM-powered apps. Includes downloadable prompt templates, Node.js boilerplates, and private Discord developer support.',
    plans: [
      { id: 'plan_prompt_mo', name: 'Pro Developer Pass', price: 29, interval: 'monthly', description: 'Includes continuous prompt updates and API keys.' },
      { id: 'plan_prompt_yr', name: 'Annual Builder Pass', price: 249, interval: 'yearly', description: 'Save 30% with annual billing.' }
    ],
    features: [
      '500+ battle-tested Gemini & OpenAI prompt templates',
      'Whop SDK License Key integration code snippets',
      'Weekly newly deployed AI agent blueprints',
      'Direct developer Q&A channel on Discord'
    ],
    perks: {
      discordServer: 'https://discord.gg/whop-promptcraft',
      hasAppWidget: true,
      appType: 'file_vault',
      downloadFilesCount: 24
    },
    sampleReviews: [
      { userName: 'David K.', userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', rating: 5, comment: 'The code templates saved me at least 40 hours building my Whop custom app.', date: '5 days ago' }
    ]
  },
  {
    id: 'prod_ecom_masterclass',
    title: 'E-Com Scaling Playbook 2026',
    creatorName: 'GrowthX Academy',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    category: 'education',
    rating: 4.9,
    reviewCount: 512,
    totalMembers: 3900,
    coverImage: '/academy_masterclass_pro.jpg',
    icon: '🎓',
    badge: '🏆 TOP COURSE',
    shortTagline: 'Step-by-step video masterclass on scaling e-commerce brands from $0 to $100k/mo.',
    fullDescription: 'Comprehensive 12-module course covering winning product research, Meta & TikTok ad strategies, high-converting store funnels, supplier negotiation, and automated fulfillment systems.',
    plans: [
      { id: 'plan_ecom_full', name: 'Full Masterclass Access', price: 199, interval: 'one_time', description: 'Lifetime access to all video lessons & updates.' }
    ],
    features: [
      '12 HD Video Modules with interactive lesson player',
      'Downloadable supplier outreach scripts & Excel spreadsheets',
      'Bi-weekly live Q&A webinars with 7-figure brand founders',
      'Access to private Whop member community lounge'
    ],
    perks: {
      discordServer: 'https://discord.gg/whop-growthx',
      hasAppWidget: true,
      appType: 'course',
      lessonsCount: 14
    },
    sampleReviews: [
      { userName: 'Sarah L.', userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', rating: 5, comment: 'Module 4 alone changed my entire Meta ads strategy. Unbelievable value!', date: '1 week ago' }
    ]
  },
  {
    id: 'prod_edgepicks_sports',
    title: 'EdgePicks VIP Sports Analytics',
    creatorName: 'EdgePicks Media',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    category: 'sports',
    rating: 4.7,
    reviewCount: 142,
    totalMembers: 1100,
    coverImage: '/creator_crm_pro.jpg',
    icon: '⚽',
    shortTagline: 'Mathematical EV+ sports models & daily statistical predictions across NBA, NFL & Premier League.',
    fullDescription: 'Data-driven sports betting analysis based on expected value models, player prop correlations, and line movement tracking.',
    plans: [
      { id: 'plan_edge_wk', name: 'Weekly Pass', price: 19, interval: 'monthly', description: 'Billed weekly, cancel anytime.' },
      { id: 'plan_edge_mo', name: 'Monthly VIP Pass', price: 59, interval: 'monthly', description: 'Full access to all league picks & bots.' }
    ],
    features: [
      'Daily positive EV picks sent via Discord bot',
      'Bankroll tracking spreadsheet integration',
      'Live in-play injury & line shift notifications'
    ],
    perks: {
      hasAppWidget: true,
      appType: 'chat'
    },
    sampleReviews: [
      { userName: 'Brian P.', userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', rating: 5, comment: 'Consistent bankroll growth week after week.', date: '4 days ago' }
    ]
  }
];

export const INITIAL_USER_PASSES: AccessPass[] = [
  {
    id: 'pass_apex_001',
    productId: 'prod_apex_signals',
    productTitle: 'Apex Trading Signals & VIP Pass',
    creatorName: 'Apex Quantitative Labs',
    icon: '📈',
    coverImage: '/trading_terminal_pro.jpg',
    licenseKey: 'whop_live_key_998124_apex_vip_trader',
    status: 'active',
    planName: 'Monthly VIP Pass',
    pricePaid: 49,
    createdAt: '2026-07-10T14:20:00Z',
    expiresAt: '2026-08-10T14:20:00Z',
    discordConnected: true,
    appType: 'signals'
  },
  {
    id: 'pass_ecom_002',
    productId: 'prod_ecom_masterclass',
    productTitle: 'E-Com Scaling Playbook 2026',
    creatorName: 'GrowthX Academy',
    icon: '🎓',
    coverImage: '/academy_masterclass_pro.jpg',
    licenseKey: 'whop_live_key_771829_ecom_master',
    status: 'active',
    planName: 'Full Masterclass Access',
    pricePaid: 199,
    createdAt: '2026-06-15T09:12:00Z',
    expiresAt: '2099-01-01T00:00:00Z',
    discordConnected: false,
    appType: 'course'
  }
];

export const SAMPLE_SIGNALS: SignalAlert[] = [
  {
    id: 'sig_101',
    asset: 'BTC/USDT',
    action: 'BUY / LONG',
    entry_zone: '$91,200 - $91,600',
    target_1: '$93,500',
    target_2: '$95,800',
    stop_loss: '$89,800',
    risk_reward: '1 : 2.8',
    reasoning: 'Holding key 4h exponential moving average support with strong spot buying volume on Coinbase.',
    timestamp: '10 mins ago'
  },
  {
    id: 'sig_102',
    asset: 'ETH/USDT',
    action: 'BUY / LONG',
    entry_zone: '$3,420 - $3,450',
    target_1: '$3,600',
    target_2: '$3,780',
    stop_loss: '$3,350',
    risk_reward: '1 : 3.1',
    reasoning: 'Breached falling wedge pattern on 1h chart. DeFi TVL inflows accelerating.',
    timestamp: '2 hours ago'
  },
  {
    id: 'sig_103',
    asset: 'SOL/USDT',
    action: 'SELL / SHORT',
    entry_zone: '$218 - $222',
    target_1: '$204',
    target_2: '$192',
    stop_loss: '$228',
    risk_reward: '1 : 2.4',
    reasoning: 'Bearish divergence at local supply channel resistant ceiling.',
    timestamp: '5 hours ago'
  }
];

export const SAMPLE_COURSE_LESSONS: CourseLesson[] = [
  {
    id: 'les_1',
    title: '1. Foundation & Whop Marketplace Setup',
    duration: '14:20',
    completed: true,
    summary: 'Learn how to construct your digital product storefront on Whop, optimize pricing plans, and link custom apps.'
  },
  {
    id: 'les_2',
    title: '2. Product Research: Finding Unmet $10k/mo Demand',
    duration: '22:15',
    completed: true,
    summary: 'Analyzing high-converting niches in sports analytics, SaaS license tools, and private Discord hubs.'
  },
  {
    id: 'les_3',
    title: '3. Building High-Converting Sales Pages on Whop',
    duration: '18:45',
    completed: true,
    summary: 'Typography, social proof, video openers, and frictionless checkout setup.'
  },
  {
    id: 'les_4',
    title: '4. Integrating Whop License API with your Software',
    duration: '28:10',
    completed: false,
    summary: 'Using server-side REST validation endpoints to secure your software and micro-SaaS apps.'
  },
  {
    id: 'les_5',
    title: '5. Organic TikTok & Twitter/X Growth Funnels',
    duration: '19:30',
    completed: false,
    summary: 'Short-form content playbooks that drive zero-CAC traffic directly to your Whop link.'
  }
];
