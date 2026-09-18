import React, { useState } from 'react';
import { AccessPass, SignalAlert, CourseLesson, ChatMessage } from '../types';
import { SAMPLE_SIGNALS, SAMPLE_COURSE_LESSONS } from '../data/whopProducts';
import { PlayCircle, Download, Send, CheckCircle2, Copy, Zap, ArrowLeft, ShieldCheck, RefreshCw, MessageSquare, TrendingUp, Key, FileText, Loader2 } from 'lucide-react';

interface EmbeddedAppViewerProps {
  pass: AccessPass;
  darkMode: boolean;
  onBack: () => void;
}

export const EmbeddedAppViewer: React.FC<EmbeddedAppViewerProps> = ({
  pass,
  darkMode,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'app' | 'license' | 'community'>('app');

  // State for Trading Signals App
  const [signals, setSignals] = useState<SignalAlert[]>(SAMPLE_SIGNALS);
  const [filterAsset, setFilterAsset] = useState('ALL');

  // State for Course App
  const [lessons, setLessons] = useState<CourseLesson[]>(SAMPLE_COURSE_LESSONS);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson>(SAMPLE_COURSE_LESSONS[0]);

  // State for Community Chat App
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Whop Bot', avatar: '🤖', text: 'Welcome to the exclusive VIP member area!', timestamp: '12:00 PM', isCreator: true },
    { id: '2', sender: 'Alex (Creator)', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=100&q=80', text: 'Hey everyone, new market signal dropped in the terminal tab!', timestamp: '12:05 PM', isCreator: true },
    { id: '3', sender: 'Marcus T.', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', text: 'Checked it out! Thanks Alex!', timestamp: '12:08 PM' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Key Copy state
  const [copiedKey, setCopiedKey] = useState(false);

  // File Vault download state
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadSuccessFile, setDownloadSuccessFile] = useState<string | null>(null);

  const handleDownloadFile = (fileName: string) => {
    setDownloadingFile(fileName);
    setTimeout(() => {
      setDownloadingFile(null);
      setDownloadSuccessFile(fileName);
      try {
        const element = document.createElement('a');
        const fileContent = `=====================================================
WHOP VERIFIED PRODUCT ASSET DELIVERABLE
Product: ${pass.productTitle}
Authorized License Key: ${pass.licenseKey}
Package Name: ${fileName}
Timestamp: ${new Date().toISOString()}
Cryptographic Checksum: SHA256-${Math.random().toString(36).substring(2, 12)}
=====================================================
Status: Verified & Validated on Whop Infrastructure.
`;
        const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(blob);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } catch (err) {
        console.error('Download error:', err);
      }
      setTimeout(() => setDownloadSuccessFile(null), 3500);
    }, 600);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(pass.licenseKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const toggleLessonComplete = (lessonId: string) => {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You (Alex Vance)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulated response
    setTimeout(() => {
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: `${pass.creatorName} Support`,
        avatar: pass.icon,
        text: 'Thanks for reaching out! A team member will assist you shortly in this Whop app thread.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCreator: true,
      };
      setMessages(prev => [...prev, reply]);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar mimicking Embedded Whop App Frame */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
        darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Passes</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{pass.icon}</span>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span>{pass.productTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FF6243]/10 text-[#FF6243] font-extrabold border border-[#FF6243]/20">
                  WHOP APP
                </span>
              </div>
              <div className="text-xs text-zinc-400">Created by {pass.creatorName}</div>
            </div>
          </div>
        </div>

        {/* Tab Switcher inside Embedded App */}
        <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('app')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'app' ? 'bg-[#FF6243] text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            App Dashboard
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'license' ? 'bg-[#FF6243] text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            License & Keys
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'community' ? 'bg-[#FF6243] text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lounge Chat
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: APP SPECIFIC DASHBOARD */}
      {activeTab === 'app' && (
        <>
          {/* A. TRADING SIGNALS TERMINAL APP */}
          {pass.appType === 'signals' && (
            <div className="space-y-6">
              {/* Professional Terminal Feature Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 group shadow-2xl">
                <img
                  src="/trading_terminal_pro.jpg"
                  alt="Trading Terminal Pro"
                  referrerPolicy="no-referrer"
                  className="w-full h-48 sm:h-60 object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      LIVE QUANTITATIVE TERMINAL
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">
                      SUB-MILLISECOND EXECUTION
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                      86.2% WIN RATE
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Institutional Trading Intelligence Feed</h3>
                  <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                    Proprietary quantitative algorithms scanning perpetual futures and spot liquidity pools across Binance, Bybit, and Coinbase.
                  </p>
                </div>
              </div>

              {/* Live Ticker & Status Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div className="text-xs text-zinc-400 font-medium">BTC/USDT Live</div>
                  <div className="text-xl font-extrabold text-emerald-400">$91,480.00 <span className="text-xs text-emerald-500 font-semibold">+3.4%</span></div>
                  <div className="text-[10px] text-zinc-500 mt-1">4h EMA Trend: Bullish • 12ms Latency</div>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div className="text-xs text-zinc-400 font-medium">Monthly Signal Win-Rate</div>
                  <div className="text-xl font-extrabold text-[#FF6243]">86.2%</div>
                  <div className="text-[10px] text-zinc-500 mt-1">28 Institutional Signals Delivered</div>
                </div>

                <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div className="text-xs text-zinc-400 font-medium">Whop Discord Alert Bot</div>
                  <div className="text-sm font-bold text-indigo-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Connected & Active
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">Push alerts routed to VIP Channel</div>
                </div>
              </div>

              {/* Signals Stream List */}
              <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#FF6243]" />
                    <h3 className="font-bold text-sm">Live Institutional Signals Stream</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {['ALL', 'BTC', 'ETH', 'SOL'].map(a => (
                      <button
                        key={a}
                        onClick={() => setFilterAsset(a)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold cursor-pointer ${
                          filterAsset === a ? 'bg-[#FF6243] text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {signals
                    .filter(s => filterAsset === 'ALL' || s.asset.includes(filterAsset))
                    .map((sig) => (
                      <div
                        key={sig.id}
                        className={`p-4 rounded-xl border space-y-3 ${
                          darkMode ? 'bg-black/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-white bg-zinc-800 px-2.5 py-1 rounded-lg">
                            {sig.asset}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase ${
                              sig.action.includes('BUY')
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {sig.action}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Entry Zone</span>
                            <span className="font-bold">{sig.entry_zone}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Risk / Reward</span>
                            <span className="font-bold text-amber-400">{sig.risk_reward}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Target 1 & 2</span>
                            <span className="font-bold text-emerald-400">{sig.target_1} / {sig.target_2}</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px]">Stop Loss</span>
                            <span className="font-bold text-rose-400">{sig.stop_loss}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 italic pt-1 border-t border-zinc-800">
                          "{sig.reasoning}"
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* B. COURSE & VIDEO MASTERCLASS APP */}
          {pass.appType === 'course' && (
            <div className="space-y-6">
              {/* Academy Feature Header Card */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 group shadow-2xl">
                <img
                  src="/academy_masterclass_pro.jpg"
                  alt="Academy Masterclass Pro"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 sm:h-56 object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FF6243]/20 text-[#FF6243] font-extrabold text-[10px] border border-[#FF6243]/30">
                      4K ULTRA HD CURRICULUM
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                      ACCREDITED CERTIFICATION
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">Whop Accelerator & Scaling Masterclass</h3>
                  <p className="text-xs text-zinc-300 mt-1 max-w-xl">
                    Comprehensive step-by-step masterclass on acquiring customers, automating fulfillment, and scaling past $50k/mo on Whop.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Video Player & Lesson Notes */}
                <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-zinc-800 group">
                    <img
                      src="/academy_masterclass_pro.jpg"
                      alt="Lesson video thumbnail"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                      <button className="w-16 h-16 rounded-full bg-[#FF6243] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer">
                        <PlayCircle className="w-8 h-8 fill-white text-[#FF6243]" />
                      </button>
                      <div className="text-center">
                        <span className="text-xs text-white font-bold block">Click to Stream Lesson Video (4K)</span>
                        <span className="text-[10px] text-zinc-300">Instructor: Senior Whop Partner Specialist</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold">{selectedLesson.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1">{selectedLesson.summary}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-800 space-y-2 text-xs">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      Downloadable Course Resources
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleDownloadFile('Store_Launch_Checklist.pdf')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FF6243]" />
                        Store_Launch_Checklist.pdf
                      </button>
                      <button
                        onClick={() => handleDownloadFile('Supplier_Contract_Template.docx')}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#FF6243]" />
                        Supplier_Contract_Template.docx
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lesson Module Sidebar */}
                <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">Course Syllabus</h4>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {lessons.filter(l => l.completed).length} / {lessons.length} Done
                    </span>
                  </div>

                  <div className="space-y-2">
                    {lessons.map((les) => (
                      <button
                        key={les.id}
                        onClick={() => setSelectedLesson(les)}
                        className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          selectedLesson.id === les.id
                            ? 'border-[#FF6243] bg-[#FF6243]/10'
                            : 'border-zinc-800 bg-black/40 hover:border-zinc-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={les.completed}
                          onChange={() => toggleLessonComplete(les.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 rounded text-[#FF6243] cursor-pointer"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <div className="font-semibold truncate">{les.title}</div>
                          <div className="text-[10px] text-zinc-400">{les.duration}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. FILE VAULT / SAAS APP */}
          {pass.appType === 'file_vault' && (
            <div className="space-y-6">
              {/* Digital Vault Feature Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 group shadow-2xl">
                <img
                  src="/digital_vault_pro.jpg"
                  alt="Digital Vault Pro"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 sm:h-56 object-cover brightness-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      AES-256 ENCRYPTED DELIVERABLES
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                      4 REPOSITORIES READY
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">VIP Member Code Vault & API Assets</h3>
                  <p className="text-xs text-zinc-300 mt-1">
                    Authorized download channel for Whop license key <code className="text-amber-400 font-mono">{pass.licenseKey}</code>
                  </p>
                </div>
              </div>

              {/* Download Feedback Toast */}
              {downloadSuccessFile && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 text-xs animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold block">Asset Download Initiated: {downloadSuccessFile}</span>
                    <span className="text-[11px] text-emerald-300/80">License authorization verified against Whop server. File saved to downloads.</span>
                  </div>
                </div>
              )}

              <div className={`p-6 rounded-2xl border space-y-6 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold">Whop Developer Code Vault & API Templates</h3>
                    <p className="text-xs text-zinc-400">Download production-ready templates authorized for key: {pass.licenseKey}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                    License Valid
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Whop_App_Node_Boilerplate.zip', size: '4.2 MB', desc: 'Express + Vite server setup with Whop SDK integration' },
                    { name: 'Gemini_Prompt_Library_2026.json', size: '1.8 MB', desc: '500+ structured prompts for AI app building' },
                    { name: 'Discord_Bot_Whop_Sync.py', size: '850 KB', desc: 'Python bot script for auto-assigning Discord VIP roles' },
                    { name: 'TradingView_PineScript_v5.txt', size: '120 KB', desc: 'Proprietary buy/sell signal indicator source code' },
                  ].map((file, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/60 border border-zinc-800 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs text-white">{file.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{file.desc} • {file.size}</div>
                      </div>
                      <button
                        onClick={() => handleDownloadFile(file.name)}
                        disabled={downloadingFile === file.name}
                        className="px-3 py-2 rounded-xl bg-[#FF6243] hover:bg-[#FF7A00] text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50 shrink-0"
                      >
                        {downloadingFile === file.name ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT 2: LICENSE & KEYS */}
      {activeTab === 'license' && (
        <div className={`p-6 rounded-2xl border space-y-6 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="space-y-1">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Whop License Management
            </h3>
            <p className="text-xs text-zinc-400">
              Use this license key to authenticate inside external desktop apps, Discord bots, or Python scripts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2">
            <div className="text-[10px] font-bold text-zinc-400 uppercase">Active Key Token</div>
            <div className="flex items-center justify-between gap-3 font-mono text-xs text-amber-400">
              <span className="truncate">{pass.licenseKey}</span>
              <button
                onClick={handleCopyKey}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedKey ? 'Copied!' : 'Copy Key'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">Status</span>
              <span className="font-bold text-emerald-400 uppercase">{pass.status}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">Plan Type</span>
              <span className="font-bold text-white">{pass.planName}</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <span className="text-zinc-500 block text-[10px]">Expiration</span>
              <span className="font-bold text-white">
                {new Date(pass.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LOUNGE CHAT */}
      {activeTab === 'community' && (
        <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF6243]" />
              <h3 className="font-bold text-sm">Pass Holders Live Lounge</h3>
            </div>
            <span className="text-xs text-emerald-400">● 14 Members Online</span>
          </div>

          <div className="h-64 overflow-y-auto space-y-3 p-2 bg-black/40 rounded-xl border border-zinc-800">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-2.5 text-xs">
                {m.avatar.startsWith('http') ? (
                  <img src={m.avatar} alt={m.sender} className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-sm">{m.avatar}</span>
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.sender}</span>
                    {m.isCreator && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#FF6243] text-white font-extrabold">CREATOR</span>
                    )}
                    <span className="text-[10px] text-zinc-500">{m.timestamp}</span>
                  </div>
                  <p className="text-zinc-300">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send a message to pass holders..."
              className={`flex-1 px-4 py-2 text-xs rounded-xl border ${
                darkMode ? 'bg-black border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              } focus:outline-none focus:border-[#FF6243]`}
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#FF6243] hover:bg-[#FF7A00] text-white font-bold text-xs flex items-center gap-1">
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
