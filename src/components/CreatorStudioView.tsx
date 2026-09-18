import React, { useState } from 'react';
import { WhopProduct, WebhookLog } from '../types';
import {
  Zap,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Send,
  Plus,
  RefreshCw,
  Copy,
  CheckCircle2,
  BarChart3,
  ArrowUpRight,
  Calendar,
  Filter,
  CreditCard,
  UserPlus,
  Download,
  Eye,
  ShoppingCart,
  Target,
  Activity,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';

interface CreatorStudioViewProps {
  products: WhopProduct[];
  darkMode: boolean;
  onAddProduct: (newProduct: WhopProduct) => void;
}

const MONTHLY_ANALYTICS = [
  { time: 'Jan', revenue: 18400, members: 420, newSignups: 85, payouts: 16200, churnRate: 2.4, aov: 82 },
  { time: 'Feb', revenue: 22100, members: 580, newSignups: 110, payouts: 19800, churnRate: 2.1, aov: 84 },
  { time: 'Mar', revenue: 27900, members: 730, newSignups: 145, payouts: 25100, churnRate: 1.9, aov: 86 },
  { time: 'Apr', revenue: 31200, members: 890, newSignups: 160, payouts: 28400, churnRate: 1.7, aov: 87 },
  { time: 'May', revenue: 36800, members: 1040, newSignups: 180, payouts: 33500, churnRate: 1.5, aov: 88 },
  { time: 'Jun', revenue: 39500, members: 1180, newSignups: 195, payouts: 36200, churnRate: 1.3, aov: 89 },
  { time: 'Jul', revenue: 42850, members: 1284, newSignups: 210, payouts: 39100, churnRate: 1.1, aov: 91 },
];

const DAILY_ANALYTICS = [
  { time: 'Mon', revenue: 1420, members: 1240, newSignups: 28, payouts: 1200, churnRate: 1.2, aov: 88 },
  { time: 'Tue', revenue: 1850, members: 1252, newSignups: 32, payouts: 1600, churnRate: 1.2, aov: 89 },
  { time: 'Wed', revenue: 2100, members: 1265, newSignups: 38, payouts: 1900, churnRate: 1.1, aov: 90 },
  { time: 'Thu', revenue: 1950, members: 1271, newSignups: 31, payouts: 1800, churnRate: 1.1, aov: 89 },
  { time: 'Fri', revenue: 2840, members: 1279, newSignups: 42, payouts: 2500, churnRate: 1.0, aov: 92 },
  { time: 'Sat', revenue: 3100, members: 1282, newSignups: 45, payouts: 2800, churnRate: 1.0, aov: 93 },
  { time: 'Sun', revenue: 3450, members: 1284, newSignups: 48, payouts: 3100, churnRate: 0.9, aov: 94 },
];

const ACQUISITION_CHANNELS = [
  { time: 'Jan', organic: 180, affiliates: 140, socials: 70, ads: 30 },
  { time: 'Feb', organic: 220, affiliates: 190, socials: 110, ads: 60 },
  { time: 'Mar', organic: 290, affiliates: 250, socials: 130, ads: 60 },
  { time: 'Apr', organic: 340, affiliates: 310, socials: 160, ads: 80 },
  { time: 'May', organic: 410, affiliates: 380, socials: 170, ads: 80 },
  { time: 'Jun', organic: 460, affiliates: 430, socials: 190, ads: 100 },
  { time: 'Jul', organic: 500, affiliates: 480, socials: 200, ads: 104 },
];

const CONVERSION_FUNNEL_DATA = [
  { stage: 'Storefront Impressions', count: 48500, pct: '100%', fill: '#6366f1' },
  { stage: 'Pass Page Views', count: 18400, pct: '37.9%', fill: '#3b82f6' },
  { stage: 'Checkout Inits', count: 4920, pct: '10.1%', fill: '#06b6d4' },
  { stage: 'Purchases Completed', count: 1284, pct: '2.6%', fill: '#10b981' },
];

const PRODUCT_SALES_BREAKDOWN = [
  { name: 'Apex Algo VIP', revenue: 22400, members: 480, color: '#4f46e5' },
  { name: 'Quant Crypto Alpha', revenue: 11200, members: 350, color: '#0284c7' },
  { name: 'SaaS Starter Kit', revenue: 6450, members: 290, color: '#059669' },
  { name: 'Notion Vault', revenue: 2800, members: 164, color: '#d97706' },
];

const RECENT_TRANSACTIONS = [
  { id: 'tx_101', member: 'Jordan Davis', avatar: 'JD', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300', plan: 'Elite Trading Hub', amount: 199.00, status: 'PAID' },
  { id: 'tx_102', member: 'Sarah Chen', avatar: 'SC', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', plan: 'Basic Mentorship', amount: 49.99, status: 'PAID' },
  { id: 'tx_103', member: 'Marcus Bell', avatar: 'MB', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300', plan: 'Elite Trading Hub', amount: 199.00, status: 'PENDING' },
  { id: 'tx_104', member: 'Elena Rostova', avatar: 'ER', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', plan: 'Quant Crypto Alpha', amount: 149.00, status: 'PAID' },
  { id: 'tx_105', member: 'David Miller', avatar: 'DM', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300', plan: 'SaaS Starter Kit', amount: 89.00, status: 'PAID' },
];

export const CreatorStudioView: React.FC<CreatorStudioViewProps> = ({
  products,
  darkMode,
  onAddProduct,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'affiliates' | 'coupons' | 'ai' | 'products' | 'webhooks'>('analytics');
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '6M' | '1Y'>('6M');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'signups' | 'churn'>('revenue');
  const [exportSuccessNotice, setExportSuccessNotice] = useState(false);
  const [showStudioGuide, setShowStudioGuide] = useState(false);

  // Gemini AI Assistant Form State
  const [productType, setProductType] = useState('Trading Signals & Indicators');
  const [productTitle, setProductTitle] = useState('Apex Algo VIP');
  const [targetAudience, setTargetAudience] = useState('Crypto & Options Traders');
  const [tone, setTone] = useState('Authoritative & High-Energy');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Webhook Simulator State
  const [webhookEvent, setWebhookEvent] = useState('membership.went_valid');
  const [webhookLog, setWebhookLog] = useState<WebhookLog | null>(null);
  const [isFiringWebhook, setIsFiringWebhook] = useState(false);

  // New Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newPrice, setNewPrice] = useState('49');

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isPayoutProcessing, setIsPayoutProcessing] = useState(false);
  const [payoutSuccessMessage, setPayoutSuccessMessage] = useState('');

  // Affiliate State
  const [affiliatePartners, setAffiliatePartners] = useState([
    { id: 'aff_1', name: 'Alex Rivera', handle: '@alex_rivera', clicks: 1420, conversions: 128, revenue: 24500, commissionRate: 25, payout: 6125 },
    { id: 'aff_2', name: 'Crypto Daily', handle: '@cryptodaily', clicks: 2890, conversions: 210, revenue: 31200, commissionRate: 20, payout: 6240 },
    { id: 'aff_3', name: 'SaaS Founder Hub', handle: '@saashub', clicks: 840, conversions: 74, revenue: 6580, commissionRate: 30, payout: 1974 },
  ]);
  const [newAffiliateName, setNewAffiliateName] = useState('');
  const [newAffiliateRate, setNewAffiliateRate] = useState('25');

  // Coupon State
  const [coupons, setCoupons] = useState([
    { code: 'WHOP2026', discount: '20% OFF', type: 'percentage', value: 20, uses: 342, status: 'Active' },
    { code: 'VIP50', discount: '50% OFF', type: 'percentage', value: 50, uses: 89, status: 'Active' },
    { code: 'SUMMER2026', discount: '30% OFF', type: 'percentage', value: 30, uses: 120, status: 'Active' },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponValue, setNewCouponValue] = useState('25');

  const chartData = timeRange === '7D' ? DAILY_ANALYTICS : MONTHLY_ANALYTICS;

  const handleGenerateAiCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAi(true);

    try {
      const res = await fetch('/api/gemini/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: productType,
          product_title: productTitle,
          target_audience: targetAudience,
          tone: tone,
        }),
      });

      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleFireWebhook = async () => {
    setIsFiringWebhook(true);
    try {
      const res = await fetch('/api/v1/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: webhookEvent,
          membership_id: `mem_${Math.random().toString(36).substring(2, 8)}`,
          user_id: 'usr_998124',
        }),
      });
      const data = await res.json();

      setWebhookLog({
        id: data.payload?.id || 'evt_101',
        event: webhookEvent,
        timestamp: new Date().toLocaleTimeString(),
        status: '200 OK',
        payload: data,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsFiringWebhook(false);
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Period', 'Gross Revenue ($)', 'Net Payouts ($)', 'New Signups', 'Active Subscribers', 'Churn Rate (%)'];
      const rows = chartData.map(row => [
        row.time,
        (row as any).revenue || 0,
        (row as any).payouts || 0,
        (row as any).newSignups || 0,
        (row as any).members || 0,
        (row as any).churnRate || 0
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `whop_creator_analytics_${timeRange.toLowerCase()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportSuccessNotice(true);
      setTimeout(() => setExportSuccessNotice(false), 3000);
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newProd: WhopProduct = {
      id: `prod_${Date.now()}`,
      title: newTitle,
      creatorName: 'Alex Rivera (You)',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      category: 'saas',
      rating: 5.0,
      reviewCount: 1,
      totalMembers: 1,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      icon: '🚀',
      badge: 'NEW APP',
      shortTagline: newTagline || 'Custom Whop digital access pass.',
      fullDescription: newTagline || 'Custom Whop digital product built with Whop App SDK.',
      plans: [
        { id: `plan_${Date.now()}`, name: 'Monthly Access', price: Number(newPrice), interval: 'monthly', description: 'Billed monthly' }
      ],
      features: ['Whop License Key integration', 'Discord Role auto-assign', 'Live support access'],
      perks: { hasAppWidget: true, appType: 'signals' },
      sampleReviews: []
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    setNewTitle('');
    setNewTagline('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 mb-2">
            <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Whop Creator Business Hub
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Creator Studio & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time sales charts, member sign-up trends, Gemini AI copy generator, and Whop Webhooks.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm self-start sm:self-auto transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Whop Product
        </button>
      </div>

      {/* Quick How to Use Guide */}
      <div className={`p-4 rounded-2xl border transition-all ${
        darkMode ? 'bg-slate-900/80 border-indigo-500/30' : 'bg-indigo-50/60 border-indigo-200'
      }`}>
        <button
          onClick={() => setShowStudioGuide(!showStudioGuide)}
          className="w-full flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>How to Use Creator Analytics, Affiliates & AI Copy Generator</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 font-normal">{showStudioGuide ? 'Hide Guide' : 'Show Instructions'}</span>
            {showStudioGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showStudioGuide && (
          <div className="mt-3 pt-3 border-t border-indigo-500/20 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-300 animate-fade-in">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Recharts Focus Modes</strong>
                Toggle between Sales Revenue ($), Member Sign-ups, and Churn Rate (%) focus views on the Recharts diagram.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Affiliate Partners</strong>
                Switch to <strong className="text-indigo-400">Affiliates</strong> tab to copy referral links (<code className="text-indigo-400 font-mono">?aff=@handle</code>) & customize commission splits.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Gemini AI Studio</strong>
                Switch to <strong className="text-indigo-400">Gemini AI Studio</strong> tab to auto-generate product descriptions, emails, and tweets.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Simulate ACH Payouts</strong>
                Click <strong>"Withdraw Earnings"</strong> in the stats bar to simulate instant direct deposit payouts to your bank account.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Overview Row (Sleek Theme Card Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Monthly Revenue</p>
          <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>$42,850.12</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>↑ 12.5% from last month</span>
          </p>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Members</p>
          <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>1,284</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>↑ 48 new today</span>
          </p>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Churn Rate</p>
          <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>2.4%</h3>
          <p className="text-xs text-slate-400 font-medium mt-2">Industry avg: 4.8%</p>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending Payout</p>
          <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>$8,122.00</h3>
          <button
            onClick={() => {
              setPayoutSuccessMessage('');
              setShowPayoutModal(true);
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-2 uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer"
          >
            Withdraw now →
          </button>
        </div>
      </div>

      {/* Creator Studio Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-white" />
          Creator Analytics & Recharts
        </button>

        <button
          onClick={() => setActiveSubTab('affiliates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'affiliates'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-400" />
          Affiliate Program ({affiliatePartners.length})
        </button>

        <button
          onClick={() => setActiveSubTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'coupons'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-400" />
          Coupons & Discounts ({coupons.length})
        </button>

        <button
          onClick={() => setActiveSubTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'ai'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Gemini AI Copy Generator
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'products'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          My Products ({products.length})
        </button>

        <button
          onClick={() => setActiveSubTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'webhooks'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Webhook Event Simulator
        </button>
      </div>

      {/* SUB TAB: CREATOR ANALYTICS (RECHARTS VISUALIZATIONS) */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Executive Analytics & Settlement Showcase Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 group shadow-2xl">
            <img
              src="/creator_crm_pro.jpg"
              alt="Creator CRM Operating System"
              referrerPolicy="no-referrer"
              className="w-full h-44 sm:h-52 object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-extrabold text-[10px] border border-indigo-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  WHOP SETTLEMENT & CRM ENGINE
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                  AUTO-SETTLEMENT ON
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  GLOBAL 135+ CURRENCIES
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Whop Enterprise Creator Operating System</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Real-time Cohort Retention, Churn Analytics, Automated 1099/VAT compliance, and Global Merchant Payout Ledger.
              </p>
            </div>
          </div>

          {/* Top Bar with Export & Metric Focus Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">View Focus:</span>
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setSelectedMetric('revenue')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedMetric === 'revenue'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  Sales & Revenue
                </button>
                <button
                  onClick={() => setSelectedMetric('signups')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedMetric === 'signups'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  Member Acquisition
                </button>
                <button
                  onClick={() => setSelectedMetric('churn')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedMetric === 'churn'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  Churn & ARPU
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {exportSuccessNotice && (
                <span className="text-xs text-emerald-500 font-bold animate-fade-in flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> CSV Report Downloaded
                </span>
              )}
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Report</span>
              </button>
            </div>
          </div>

          {/* Main Chart Card Header Controls */}
          <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {selectedMetric === 'revenue' && 'Product Sales & Revenue Trend ($)'}
                  {selectedMetric === 'signups' && 'Member Acquisition & Subscriber Volume'}
                  {selectedMetric === 'churn' && 'Subscriber Churn Rate (%) & Average Order Value ($)'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedMetric === 'revenue' && 'Gross product sales revenue ($) vs net creator payouts over selected period.'}
                  {selectedMetric === 'signups' && 'Monthly new pass activations vs cumulative active Whop pass holders.'}
                  {selectedMetric === 'churn' && 'Monthly churn percentage drop-off alongside Average Revenue Per User (ARPU).'}
                </p>
              </div>

              {/* Timeframe Selector Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                {(['7D', '30D', '6M', '1Y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                      timeRange === range
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Primary Dynamic Chart */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {selectedMetric === 'revenue' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="time" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '12px',
                      }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Gross Sales Revenue ($)"
                      stroke="#4f46e5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="payouts"
                      name="Net Payouts ($)"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPayouts)"
                    />
                  </AreaChart>
                ) : selectedMetric === 'signups' ? (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="time" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="newSignups" name="New Pass Activations" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="members" name="Total Active Pass Holders" fill="#0284c7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="time" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis yAxisId="left" stroke="#ef4444" fontSize={11} tickFormatter={(v) => `${v}%`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="churnRate" name="Monthly Churn Rate (%)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="aov" name="Avg Order Value ($)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid Row 2: Member Acquisition Channels & Storefront Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Acquisition Channels Stacked Bar Chart */}
            <div className={`lg:col-span-7 p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Member Acquisition Channels
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Breakdown of how pass holders discover your Whop store.
                  </p>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ACQUISITION_CHANNELS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="time" stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        color: darkMode ? '#f8fafc' : '#0f172a',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="organic" name="Whop Marketplace" stackId="a" fill="#4f46e5" />
                    <Bar dataKey="affiliates" name="Affiliate Referrals" stackId="a" fill="#0284c7" />
                    <Bar dataKey="socials" name="Socials / YouTube" stackId="a" fill="#059669" />
                    <Bar dataKey="ads" name="Paid Ads" stackId="a" fill="#d97706" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Storefront Conversion Funnel Card */}
            <div className={`lg:col-span-5 p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    Storefront Conversion Funnel
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    2.6% CR
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  From storefront discovery to completed Whop pass checkout.
                </p>

                <div className="space-y-3">
                  {CONVERSION_FUNNEL_DATA.map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          {item.stage}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{item.count.toLocaleString()}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({item.pct})</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.count / CONVERSION_FUNNEL_DATA[0].count) * 100}%`,
                            backgroundColor: item.fill,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Avg Checkout Speed: <strong>14s</strong></span>
                <span className="text-indigo-500 font-bold">Whop One-Click Enabled</span>
              </div>
            </div>

          </div>

          {/* Grid Row 3: Product Share PieChart & Recent Sales History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Product Popularity Breakdown (Pie Chart) */}
            <div className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">Product Revenue Share</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribution across pass tiers</p>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PRODUCT_SALES_BREAKDOWN}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="revenue"
                      >
                        {PRODUCT_SALES_BREAKDOWN.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => `$${Number(val).toLocaleString()}`}
                        contentStyle={{
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Custom Legend */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {PRODUCT_SALES_BREAKDOWN.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">${item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales History Table */}
            <div className={`col-span-2 rounded-2xl border shadow-sm flex flex-col overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 dark:text-white text-base">Recent Sales Transactions</h4>
                <button className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                  View all history →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] text-slate-400 uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-6 py-3">Member</th>
                      <th className="px-6 py-3">Product Plan</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800/60">
                    {RECENT_TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3.5 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${tx.color} flex items-center justify-center font-bold text-xs shrink-0`}>
                            {tx.avatar}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{tx.member}</span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 italic text-xs">{tx.plan}</td>
                        <td className="px-6 py-3.5 text-right font-semibold text-slate-900 dark:text-white">${tx.amount.toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            tx.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUB TAB: AFFILIATE PROGRAM MANAGEMENT */}
      {activeSubTab === 'affiliates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Affiliate-Driven Revenue</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">$62,280.00</h3>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Commissions Paid Out</span>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">$14,339.00</h3>
            </div>
            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Partners</span>
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{affiliatePartners.length} Partners</h3>
            </div>
          </div>

          {/* Add Partner Card */}
          <div className={`p-5 rounded-2xl border space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-500" />
              Invite New Affiliate Partner
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                placeholder="Partner Name (e.g. Alex Rivera)"
                value={newAffiliateName}
                onChange={(e) => setNewAffiliateName(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
              />
              <input
                type="number"
                placeholder="Commission % (e.g. 25)"
                value={newAffiliateRate}
                onChange={(e) => setNewAffiliateRate(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
              />
              <button
                onClick={() => {
                  if (!newAffiliateName) return;
                  const newPartner = {
                    id: `aff_${Date.now()}`,
                    name: newAffiliateName,
                    handle: `@${newAffiliateName.toLowerCase().replace(/\s+/g, '_')}`,
                    clicks: 0,
                    conversions: 0,
                    revenue: 0,
                    commissionRate: Number(newAffiliateRate) || 25,
                    payout: 0,
                  };
                  setAffiliatePartners([newPartner, ...affiliatePartners]);
                  setNewAffiliateName('');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Create Partner Referral Link
              </button>
            </div>
          </div>

          {/* Affiliate Partners Table */}
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">Active Affiliate Partners</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Partner</th>
                    <th className="p-3">Referral Link</th>
                    <th className="p-3 text-center">Clicks</th>
                    <th className="p-3 text-center">Sales</th>
                    <th className="p-3 text-right">Revenue</th>
                    <th className="p-3 text-right">Commission Split</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {affiliatePartners.map((aff) => (
                    <tr key={aff.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{aff.name}</div>
                        <div className="text-[11px] text-slate-400">{aff.handle}</div>
                      </td>
                      <td className="p-3">
                        <div className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-950 font-mono text-[11px] flex items-center justify-between gap-2 max-w-[200px]">
                          <span className="truncate">whop.com/checkout?ref={aff.handle.replace('@', '')}</span>
                          <button
                            onClick={() => navigator.clipboard.writeText(`https://whop.com/checkout?ref=${aff.handle.replace('@', '')}`)}
                            className="text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center font-semibold">{aff.clicks.toLocaleString()}</td>
                      <td className="p-3 text-center font-bold text-emerald-600 dark:text-emerald-400">{aff.conversions}</td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">${aff.revenue.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{aff.commissionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: COUPONS & DISCOUNTS */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-6">
          {/* Create Coupon Card */}
          <div className={`p-5 rounded-2xl border space-y-3 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" />
              Create Custom Whop Promo Code
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                placeholder="Coupon Code (e.g. VIP50)"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                className={`px-3 py-2 rounded-lg border uppercase ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
              />
              <input
                type="number"
                placeholder="Discount % (e.g. 50)"
                value={newCouponValue}
                onChange={(e) => setNewCouponValue(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
              />
              <button
                onClick={() => {
                  if (!newCouponCode) return;
                  const newC = {
                    code: newCouponCode.toUpperCase(),
                    discount: `${newCouponValue}% OFF`,
                    type: 'percentage',
                    value: Number(newCouponValue) || 20,
                    uses: 0,
                    status: 'Active',
                  };
                  setCoupons([newC, ...coupons]);
                  setNewCouponCode('');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-colors"
              >
                Publish Coupon Code
              </button>
            </div>
          </div>

          {/* Coupons Table */}
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm">Active Whop Coupon Codes</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Discount</th>
                    <th className="p-3 text-center">Total Uses</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {coupons.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.code}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{c.discount}</td>
                      <td className="p-3 text-center font-bold">{c.uses} redemptions</td>
                      <td className="p-3 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB: GEMINI AI COPYWRITING GENERATOR */}
      {activeSubTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="space-y-1">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                AI Whop Product Creator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Uses server-side Gemini 3.6 Flash model to auto-generate high-converting Whop store copy, bullet points, and pricing models.
              </p>
            </div>

            <form onSubmit={handleGenerateAiCopy} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Product Category / Type</label>
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Product Title / Brand Name</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Target Audience</label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Brand Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <option value="Authoritative & High-Energy">Authoritative & High-Energy</option>
                  <option value="Exclusive & Premium VIP">Exclusive & Premium VIP</option>
                  <option value="Friendly & Community-focused">Friendly & Community-focused</option>
                  <option value="Developer & Tech-first">Developer & Tech-first</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isGeneratingAi}
                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isGeneratingAi ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini AI Generating Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Whop Storefront Copy</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Result View */}
          <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Generated Product Profile</h3>

            {aiResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Optimized Title</div>
                  <div className="font-bold text-sm text-indigo-400">{aiResult.title}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Tagline</div>
                  <div className="text-slate-200 italic">{aiResult.tagline}</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Description</div>
                  <p className="text-slate-300 leading-relaxed">{aiResult.description}</p>
                </div>

                {aiResult.bullet_points && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Feature Bullet Points</div>
                    <ul className="space-y-1 text-slate-300">
                      {aiResult.bullet_points.map((pt: string, idx: number) => (
                        <li key={idx}>• {pt}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiResult.pricing_strategy && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <span className="font-bold block text-[10px] uppercase">Recommended Pricing Strategy</span>
                    <span className="font-semibold">{aiResult.pricing_strategy}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
                <Sparkles className="w-8 h-8 text-slate-700 mb-2" />
                <p>Fill out the form and click "Generate Whop Storefront Copy" to generate optimized AI content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB: PRODUCTS MANAGER */}
      {activeSubTab === 'products' && (
        <div className={`p-6 rounded-2xl border space-y-4 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base">Active Storefront Products</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Product
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-2">Product</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Members</th>
                  <th className="py-3 px-2">Price Plan</th>
                  <th className="py-3 px-2">App Extension</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{p.title}</div>
                        <div className="text-[10px] text-slate-400">{p.creatorName}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 uppercase font-semibold text-slate-400">{p.category}</td>
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{p.totalMembers.toLocaleString()}</td>
                    <td className="py-3 px-2 font-bold text-indigo-600 dark:text-indigo-400">
                      ${p.plans[0]?.price}
                      <span className="text-[10px] font-normal text-slate-400">/{p.plans[0]?.interval}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-500 font-mono text-[11px]">{p.perks.appType}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB: WEBHOOK EVENT SIMULATOR */}
      {activeSubTab === 'webhooks' && (
        <div className={`p-6 rounded-2xl border space-y-6 shadow-sm ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="space-y-1">
            <h3 className="text-base font-bold">Whop Webhook Event Tester</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate triggering Whop SDK Webhook payloads (`membership.went_valid`, `membership.went_invalid`, `payment.succeeded`).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={webhookEvent}
              onChange={(e) => setWebhookEvent(e.target.value)}
              className={`px-3.5 py-2 text-xs rounded-lg border font-mono ${
                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <option value="membership.went_valid">membership.went_valid</option>
              <option value="membership.went_invalid">membership.went_invalid</option>
              <option value="payment.succeeded">payment.succeeded</option>
            </select>

            <button
              onClick={handleFireWebhook}
              disabled={isFiringWebhook}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Fire Webhook Event</span>
            </button>
          </div>

          {webhookLog && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>Status: {webhookLog.status} • Time: {webhookLog.timestamp}</span>
                <span className="text-emerald-400">Signature Verified</span>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 overflow-x-auto text-[11px]">
                {JSON.stringify(webhookLog.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* CREATE PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="font-bold text-base">Create New Whop Product</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Apex Options Signals"
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="Institutional signals & daily updates"
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 dark:text-slate-400 block mb-1">Monthly Price ($)</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Publish Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSTANT PAYOUT WITHDRAWAL MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Whop Creator Payout Withdrawal
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {!payoutSuccessMessage ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 space-y-1">
                  <div className="text-slate-500 dark:text-slate-400">Available Whop Creator Balance</div>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">$8,122.00</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ✓ Next scheduled payout window: Today (Same Day Deposit)
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-500 dark:text-slate-400">Payout Destination Bank / Wallet</label>
                  <select className={`w-full px-3 py-2 rounded-xl border ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <option>Chase Bank Direct ACH (•••• 8821)</option>
                    <option>Stripe Connect Express Wallet</option>
                    <option>Coinbase USDC Crypto Transfer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-500 dark:text-slate-400">Withdrawal Amount ($ USD)</label>
                  <input
                    type="number"
                    defaultValue={8122}
                    className={`w-full px-3 py-2 rounded-xl border font-bold text-sm ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={isPayoutProcessing}
                    onClick={() => {
                      setIsPayoutProcessing(true);
                      setTimeout(() => {
                        setIsPayoutProcessing(false);
                        setPayoutSuccessMessage('Payout of $8,122.00 successfully transferred to Chase Bank (•••• 8821). Reference ID: WHP_ACH_99214.');
                      }, 1200);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isPayoutProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing ACH Transfer...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Confirm Direct Deposit ($8,122.00)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                  {payoutSuccessMessage}
                </p>
                <button
                  onClick={() => setShowPayoutModal(false)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
