import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Rocket,
  ShieldCheck,
  DollarSign,
  Store,
  Layers,
  Code,
  CheckCircle2,
  Image as ImageIcon,
  Download,
  Eye,
  Sparkles,
  Link,
  Radio,
  FileText
} from 'lucide-react';
import appIconImg from '../assets/images/whop_app_icon_1789343978933.jpg';
import appBannerImg from '../assets/images/whop_app_banner_1789343990737.jpg';
import appFeatureImg from '../assets/images/whop_app_feature_1789344001937.jpg';

interface WhopAppStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSwitchMode: (mode: 'marketplace' | 'passes' | 'creator' | 'developer') => void;
}

export const WhopAppStoreModal: React.FC<WhopAppStoreModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onSwitchMode,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [activeWhopTab, setActiveWhopTab] = useState<'details' | 'views' | 'images' | 'webhooks' | 'pricing' | 'permissions'>('details');

  if (!isOpen) return null;

  const currentOrigin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-xndhbaojvi4xamux5py45l-141760590254.us-east5.run.app';
  
  const baseAppUrl = currentOrigin.includes('localhost')
    ? 'https://ais-pre-xndhbaojvi4xamux5py45l-141760590254.us-east5.run.app'
    : currentOrigin;

  // Exact Whop Dashboard Wording & URLs
  const whopFields = {
    appName: 'Nexus Hub & Member Terminal',
    tagline: 'All-in-one membership management, digital content delivery, and live member signals for Whop creators.',
    category: 'Creator Tools & Software',
    baseAppUrl: baseAppUrl,
    customerViewUrl: `${baseAppUrl}/?view=passes&embedded=true`,
    adminViewUrl: `${baseAppUrl}/?view=creator&embedded=true`,
    webhookUrl: `${baseAppUrl}/api/v1/webhooks/receive`,
    recommendedPrice: '$29 / month',
    description: `### Nexus Hub & Member Terminal for Whop

Nexus is a complete, production-grade Whop app designed for communities, course creators, and trading hubs.

#### What it includes:
- **Customer View (Member Portal):** Real-time signal terminal, video academy player, community chat, and secure digital vault access.
- **Admin View (Creator Studio):** Live revenue analytics, MRR tracking, active member CRM, AI marketing generator, and license management.
- **Automated Webhooks:** Instant access provisioning on purchase and immediate revocation on cancellation or refund.
- **Server Verification:** HMAC-SHA256 authenticated webhook processing with zero exposed secrets.`,
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2200);
  };

  // Multi-strategy bulletproof download for images in iframe/container
  const handleDownloadAsset = async (type: 'icon' | 'banner' | 'feature', filename: string, fallbackUrl: string) => {
    setDownloadStatus(`Downloading ${filename}...`);
    try {
      // Direct download API endpoint on the server with Content-Disposition: attachment
      const serverDownloadUrl = `/api/v1/assets/download/${type}`;
      
      const res = await fetch(serverDownloadUrl);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', filename);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadStatus(`Saved ${filename} to your downloads!`);
      setTimeout(() => setDownloadStatus(null), 3500);
    } catch (error) {
      console.warn('Direct blob download fallback to new tab:', error);
      // Fallback: Open file directly in new tab or trigger static download
      const publicPath = type === 'icon' 
        ? '/whop_app_icon.jpg' 
        : type === 'banner' 
        ? '/whop_cover_banner.jpg' 
        : '/whop_feature_screenshot.jpg';
      
      const win = window.open(publicPath, '_blank');
      if (!win) {
        window.location.href = publicPath;
      }
      setDownloadStatus(`Opened ${filename} — right click and select "Save Image As"`);
      setTimeout(() => setDownloadStatus(null), 5000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className={`relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border my-6 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Whop Portal Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Whop Developer Dashboard Ready
                </span>
                <span className="text-xs text-white/85 font-medium hidden sm:inline">
                  Step-by-Step Whop Setup
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Sell on Whop App Store
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Download / Copy Toast Banner */}
        {downloadStatus && (
          <div className="px-5 py-2.5 bg-emerald-600 text-white text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{downloadStatus}</span>
            </div>
            <button
              onClick={() => setDownloadStatus(null)}
              className="text-emerald-100 hover:text-white text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6 max-h-[76vh] overflow-y-auto">
          {/* Quick Action: Open dash.whop.com/developer */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-white">Whop Developer Portal</h3>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Open <strong className="text-slate-200">dash.whop.com/developer</strong>, click <strong className="text-slate-200">"Create App"</strong>, and match each tab below word-for-word.
              </p>
            </div>
            <a
              href="https://dash.whop.com/developer"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-2 whitespace-nowrap shadow-lg shadow-orange-600/20 transition-all shrink-0 cursor-pointer"
            >
              <span>Go to dash.whop.com/developer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Navigation Tabs (Worded Exactly as in Whop Dashboard) */}
          <div className="flex items-center gap-1 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveWhopTab('details')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeWhopTab === 'details'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. App Details
            </button>
            <button
              onClick={() => setActiveWhopTab('images')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeWhopTab === 'images'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>2. App Images & Banner</span>
            </button>
            <button
              onClick={() => setActiveWhopTab('views')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeWhopTab === 'views'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>3. App Views (Customer & Admin)</span>
            </button>
            <button
              onClick={() => setActiveWhopTab('webhooks')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeWhopTab === 'webhooks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>4. Webhooks</span>
            </button>
            <button
              onClick={() => setActiveWhopTab('pricing')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeWhopTab === 'pricing'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>5. Pricing</span>
            </button>
            <button
              onClick={() => setActiveWhopTab('permissions')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeWhopTab === 'permissions'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>6. Permissions & Scopes</span>
            </button>
          </div>

          {/* TAB 1: APP DETAILS */}
          {activeWhopTab === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Whop Field: "General Information" / "App Details"
                </span>
                <span className="text-[11px] text-indigo-400">Click any box to copy</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* App Name */}
                <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">App name</label>
                    <span className="text-[10px] text-slate-500">Required</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-white">
                    <span>{whopFields.appName}</span>
                    <button
                      onClick={() => handleCopy('appName', whopFields.appName)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copy App Name"
                    >
                      {copiedField === 'appName' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Whop App ID */}
                <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Whop App ID</label>
                    <span className="text-[10px] text-emerald-400 font-bold">Configured Active</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-purple-800/50 text-xs font-mono font-bold text-purple-300">
                    <span>app_gzeMFmZKMcOdbA</span>
                    <button
                      onClick={() => handleCopy('appId', 'app_gzeMFmZKMcOdbA')}
                      className="text-purple-400 hover:text-white p-1"
                      title="Copy Whop App ID"
                    >
                      {copiedField === 'appId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Category */}
                <div className={`p-4 rounded-xl border space-y-2 md:col-span-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Category</label>
                    <span className="text-[10px] text-slate-500">Select in Whop dropdown</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-medium text-white">
                    <span>{whopFields.category}</span>
                    <button
                      onClick={() => handleCopy('category', whopFields.category)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copy Category"
                    >
                      {copiedField === 'category' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Short Description */}
                <div className={`p-4 rounded-xl border space-y-2 md:col-span-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Short description / Tagline</label>
                    <span className="text-[10px] text-slate-500">Shows under title on Whop store</span>
                  </div>
                  <div className="flex items-start justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200">
                    <span className="leading-relaxed">{whopFields.tagline}</span>
                    <button
                      onClick={() => handleCopy('tagline', whopFields.tagline)}
                      className="text-slate-400 hover:text-white p-1 shrink-0 ml-2"
                      title="Copy Short Description"
                    >
                      {copiedField === 'tagline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Full Description */}
                <div className={`p-4 rounded-xl border space-y-2 md:col-span-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Description (Markdown Supported)</label>
                    <button
                      onClick={() => handleCopy('description', whopFields.description)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      {copiedField === 'description' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Full Description</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap max-h-36">
                    {whopFields.description}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGES & BANNER */}
          {activeWhopTab === 'images' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-500" />
                    Whop Field: "App Icon" and "Cover Image"
                  </h3>
                  <p className="text-xs text-slate-400">
                    If one-click download is blocked by your browser, click <strong>"Open Full Image"</strong> and right-click to save.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg w-fit">
                  High-Resolution JPG
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* 1. App Icon */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">1. App icon</span>
                      <span className="text-[10px] text-indigo-400 font-mono">512 x 512 (1:1)</span>
                    </div>
                    
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 bg-black group shadow-md">
                      <img
                        src={appIconImg}
                        alt="Whop App Store Official Icon"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Upload under Whop <strong>App icon</strong>. Displayed in Whop search, recommendations, and dashboard sidebar.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <a
                      href="/api/v1/assets/download/icon"
                      download="whop_app_icon_512x512.jpg"
                      className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download App Icon (Direct File)</span>
                    </a>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href="/whop_app_icon.jpg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Full (Save As)</span>
                      </a>
                      <button
                        onClick={() => handleCopy('iconUrl', `${whopFields.baseAppUrl}/whop_app_icon.jpg`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                        title="Copy Icon Public URL"
                      >
                        {copiedField === 'iconUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Cover Image / Banner */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between border-amber-500/30 ${
                  darkMode ? 'bg-slate-950/50' : 'bg-slate-50'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        2. Cover image
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">1920 x 1080 (16:9)</span>
                    </div>

                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-amber-500/40 bg-black group shadow-md">
                      <img
                        src={appBannerImg}
                        alt="Whop App Store Cover Banner"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Upload under Whop <strong>Cover image</strong>. The wide landscape banner displayed at the top of your listing page.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <a
                      href="/api/v1/assets/download/banner"
                      download="whop_cover_banner_1920x1080.jpg"
                      className="w-full py-2.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-600/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Cover Banner (Direct File)</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <a
                        href="/whop_cover_banner.jpg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Full (Save As)</span>
                      </a>
                      <button
                        onClick={() => handleCopy('bannerUrl', `${whopFields.baseAppUrl}/whop_cover_banner.jpg`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                        title="Copy Banner Public URL"
                      >
                        {copiedField === 'bannerUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Feature Screenshot Graphic */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">3. Screenshots / Gallery</span>
                      <span className="text-[10px] text-emerald-400 font-mono">1920 x 1080 (16:9)</span>
                    </div>

                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-700 bg-black group shadow-md">
                      <img
                        src={appFeatureImg}
                        alt="Whop App Member Experience Feature"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Upload under Whop <strong>Screenshots</strong>. Showcases the live trading signal feed and course player.
                    </p>
                  </div>

                  <div className="pt-4 space-y-2">
                    <a
                      href="/api/v1/assets/download/feature"
                      download="whop_feature_screenshot_1920x1080.jpg"
                      className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Screenshot (Direct File)</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <a
                        href="/whop_feature_screenshot.jpg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Full (Save As)</span>
                      </a>
                      <button
                        onClick={() => handleCopy('featureUrl', `${whopFields.baseAppUrl}/whop_feature_screenshot.jpg`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                        title="Copy Feature Screenshot Public URL"
                      >
                        {copiedField === 'featureUrl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APP VIEWS */}
          {activeWhopTab === 'views' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Whop Field: "App Views" / "Experiences"
                </span>
                <span className="text-[11px] text-indigo-400">Copy these URLs into Whop</span>
              </div>

              <div className="space-y-4">
                {/* Customer View URL */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white block">Customer View URL</label>
                      <span className="text-[11px] text-slate-400">
                        In Whop: "The view your customers will see inside their member portal"
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      Member Terminal
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-400 overflow-hidden">
                    <span className="truncate pr-2">{whopFields.customerViewUrl}</span>
                    <button
                      onClick={() => handleCopy('customerView', whopFields.customerViewUrl)}
                      className="text-slate-400 hover:text-white shrink-0 p-1 cursor-pointer"
                      title="Copy Customer View URL"
                    >
                      {copiedField === 'customerView' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Company / Admin View URL */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white block">Admin View URL (Company View)</label>
                      <span className="text-[11px] text-slate-400">
                        In Whop: "The view the creator / company owner will see to manage the app"
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      Creator Studio
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-indigo-300 overflow-hidden">
                    <span className="truncate pr-2">{whopFields.adminViewUrl}</span>
                    <button
                      onClick={() => handleCopy('adminView', whopFields.adminViewUrl)}
                      className="text-slate-400 hover:text-white shrink-0 p-1 cursor-pointer"
                      title="Copy Admin View URL"
                    >
                      {copiedField === 'adminView' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Base URL */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white block">Base URL / App URL</label>
                      <span className="text-[11px] text-slate-400">
                        In Whop: "The root URL where your app is hosted"
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 overflow-hidden">
                    <span className="truncate pr-2">{whopFields.baseAppUrl}</span>
                    <button
                      onClick={() => handleCopy('baseUrl', whopFields.baseAppUrl)}
                      className="text-slate-400 hover:text-white shrink-0 p-1 cursor-pointer"
                      title="Copy Base URL"
                    >
                      {copiedField === 'baseUrl' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEBHOOKS */}
          {activeWhopTab === 'webhooks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Whop Field: "Webhooks" Tab
                </span>
                <span className="text-[10px] text-purple-400 font-mono">HMAC-SHA256 Protected</span>
              </div>

              <div className="space-y-4">
                {/* Endpoint URL */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white block">Webhook Endpoint URL</label>
                      <span className="text-[11px] text-slate-400">Whop will send POST requests here when memberships update</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-purple-300 overflow-hidden">
                    <span className="truncate pr-2">{whopFields.webhookUrl}</span>
                    <button
                      onClick={() => handleCopy('webhookUrl', whopFields.webhookUrl)}
                      className="text-slate-400 hover:text-white shrink-0 p-1 cursor-pointer"
                      title="Copy Webhook URL"
                    >
                      {copiedField === 'webhookUrl' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Events to select */}
                <div className={`p-4 rounded-xl border space-y-2.5 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <label className="text-xs font-bold text-white block">Events to listen for (Check these in Whop):</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-xs font-mono text-emerald-400">
                      <span>membership.went_valid</span>
                      <button onClick={() => handleCopy('evt1', 'membership.went_valid')} className="text-slate-400 hover:text-white">
                        {copiedField === 'evt1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-xs font-mono text-rose-400">
                      <span>membership.went_invalid</span>
                      <button onClick={() => handleCopy('evt2', 'membership.went_invalid')} className="text-slate-400 hover:text-white">
                        {copiedField === 'evt2' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-between text-xs font-mono text-indigo-300">
                      <span>payment.succeeded</span>
                      <button onClick={() => handleCopy('evt3', 'payment.succeeded')} className="text-slate-400 hover:text-white">
                        {copiedField === 'evt3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRICING */}
          {activeWhopTab === 'pricing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Whop Field: "Pricing" / "App Store Monetization"
                </span>
                <span className="text-[11px] text-emerald-400">How Whop charges creators for you</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-xs font-bold text-slate-400">Starter Plan</div>
                  <div className="text-2xl font-black text-white mt-1">Free</div>
                  <p className="text-xs text-slate-400 mt-2">
                    Let creators install your app for free up to 25 members to gain initial reviews and adoption.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-500/60 bg-indigo-950/20 relative shadow-lg">
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-black uppercase text-white">
                    Recommended
                  </span>
                  <div className="text-xs font-bold text-indigo-400">Pro Creator</div>
                  <div className="text-2xl font-black text-white mt-1">$29 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                  <p className="text-xs text-slate-300 mt-2">
                    Charge creators $29/mo for unlimited community members, automated signals, and AI assistant.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="text-xs font-bold text-purple-400">Enterprise Hub</div>
                  <div className="text-2xl font-black text-white mt-1">$79 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                  <p className="text-xs text-slate-400 mt-2">
                    For high-volume trading floors and masterminds requiring dedicated support and custom branding.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PERMISSIONS & SCOPES */}
          {activeWhopTab === 'permissions' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Whop Field: "Permissions" / "OAuth Scopes"
                </span>
                <span className="text-[11px] text-purple-400">Click any box to copy justification</span>
              </div>

              {/* Clarification Callout Box */}
              <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs">⚠️ Important Whop Note:</span>
                  <span className="text-[11px]">Only select the permissions that appear in your Whop dropdown.</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  Whop <strong>does not have separate permissions</strong> for <em>licenses</em>, <em>user profiles</em>, or <em>products</em>. 
                  In Whop's architecture, <strong><code className="px-1 py-0.5 rounded bg-black/40 font-mono text-amber-300">memberships:read</code> automatically includes license keys</strong>, and user IDs are passed securely via embedded headers. You only need the 4 permissions listed below!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. memberships:read */}
                <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        memberships:read
                      </span>
                      <span className="text-[11px] font-bold text-slate-200">Read Memberships</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Required</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-start justify-between gap-2">
                    <p className="leading-relaxed">
                      Verifies paying member status, license keys, and subscription tiers to unlock the terminal, signals, and video courses.
                    </p>
                    <button
                      onClick={() => handleCopy('perm_mem_read', 'Verifies paying member status, license keys, and subscription tiers to unlock the terminal, signals, and video courses.')}
                      className="text-slate-400 hover:text-white p-1 shrink-0"
                      title="Copy Justification"
                    >
                      {copiedField === 'perm_mem_read' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 2. payments:read */}
                <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        payments:read
                      </span>
                      <span className="text-[11px] font-bold text-slate-200">Read Payments</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Analytics</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-start justify-between gap-2">
                    <p className="leading-relaxed">
                      Calculates real-time MRR, recurring revenue trends, and renewal stats for creator business intelligence reports.
                    </p>
                    <button
                      onClick={() => handleCopy('perm_pay_read', 'Calculates real-time MRR, recurring revenue trends, and renewal stats for creator business intelligence reports.')}
                      className="text-slate-400 hover:text-white p-1 shrink-0"
                      title="Copy Justification"
                    >
                      {copiedField === 'perm_pay_read' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 3. companies:read */}
                <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        companies:read
                      </span>
                      <span className="text-[11px] font-bold text-slate-200">Read Company</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-bold">Store Info</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-start justify-between gap-2">
                    <p className="leading-relaxed">
                      Loads company branding, store name, and settings into the Creator Studio admin dashboard.
                    </p>
                    <button
                      onClick={() => handleCopy('perm_comp_read', 'Loads company branding, store name, and settings into the Creator Studio admin dashboard.')}
                      className="text-slate-400 hover:text-white p-1 shrink-0"
                      title="Copy Justification"
                    >
                      {copiedField === 'perm_comp_read' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 4. webhooks:manage */}
                <div className={`p-4 rounded-xl border space-y-2 ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        webhooks:manage
                      </span>
                      <span className="text-[11px] font-bold text-slate-200">Manage Webhooks</span>
                    </div>
                    <span className="text-[10px] text-rose-400 font-bold">Sync</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 flex items-start justify-between gap-2">
                    <p className="leading-relaxed">
                      Subscribes to live purchase, renewal, and cancellation events to guarantee instant database synchronization.
                    </p>
                    <button
                      onClick={() => handleCopy('perm_web_manage', 'Subscribes to live purchase, renewal, and cancellation events to guarantee instant database synchronization.')}
                      className="text-slate-400 hover:text-white p-1 shrink-0"
                      title="Copy Justification"
                    >
                      {copiedField === 'perm_web_manage' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Why Others Aren't Needed Accordion / List */}
              <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2 text-xs`}>
                <span className="font-bold text-slate-300">Why You Don't See The Other Permissions in Whop:</span>
                <ul className="space-y-1.5 text-slate-400 text-[11px] list-disc list-inside">
                  <li><strong>No "licenses" permission:</strong> In Whop, licenses are stored inside the membership object. <code className="text-indigo-400">memberships:read</code> automatically gives full access to license keys.</li>
                  <li><strong>No "users" permission:</strong> Whop apps embedded in an iframe automatically receive the member's user ID via the <code className="text-indigo-400">x-whop-user-id</code> header without requiring an extra scope.</li>
                  <li><strong>No "memberships:write":</strong> Whop's native checkout handles all creation and billing securely. Apps do not manually generate memberships.</li>
                  <li><strong>No "products" permission:</strong> Handled under <code className="text-indigo-400">companies:read</code> or public store listings.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Quick Experience Preview Buttons */}
          <div className={`p-4 rounded-xl border space-y-2.5 ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              Test Live Views in this Browser
            </h4>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => {
                  onSwitchMode('creator');
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Open Creator Studio (Admin View)
              </button>
              <button
                onClick={() => {
                  onSwitchMode('passes');
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Open Member Passes (Customer View)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="text-xs text-slate-400">
            Submit your app at <span className="text-white font-semibold">dash.whop.com/developer</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
