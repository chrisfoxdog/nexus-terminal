import React from 'react';
import { ShoppingBag, Key, Zap, Code, Moon, Sun, Bell, HelpCircle, RefreshCw, Rocket } from 'lucide-react';

export type NavMode = 'marketplace' | 'passes' | 'creator' | 'developer';

interface HeaderNavProps {
  currentMode: NavMode;
  onSelectMode: (mode: NavMode) => void;
  activePassesCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCart?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenHowToUse?: () => void;
  onResetCatalog?: () => void;
  onOpenWhopAppStore?: () => void;
  isEmbedded?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentMode,
  onSelectMode,
  activePassesCount,
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  onOpenHowToUse,
  onResetCatalog,
  onOpenWhopAppStore,
  isEmbedded,
}) => {
  return (
    <header className={`sticky top-0 z-40 border-b ${
      darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100' : 'bg-white/90 border-slate-200 text-slate-900'
    } backdrop-blur-md transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Whop Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onSelectMode('marketplace')} 
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg italic shadow-sm group-hover:scale-105 transition-transform">
                W
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5 font-bold tracking-tight text-lg leading-none">
                  whop <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">BUSINESS</span>
                </div>
                <span className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Digital Marketplace & Studio</span>
              </div>
            </button>

            {/* Mode Tabs Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <button
                onClick={() => onSelectMode('marketplace')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentMode === 'marketplace'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Marketplace
              </button>

              <button
                onClick={() => onSelectMode('passes')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentMode === 'passes'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                My Passes
                {activePassesCount > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-600 text-white font-bold">
                    {activePassesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectMode('creator')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentMode === 'creator'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Creator Studio
                <span className="hidden lg:inline text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                  Analytics
                </span>
              </button>

              <button
                onClick={() => onSelectMode('developer')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentMode === 'developer'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                API Validator
              </button>
            </nav>
          </div>

          {/* Search Input for Marketplace Mode */}
          {currentMode === 'marketplace' && (
            <div className="flex-1 max-w-xs relative hidden lg:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search memberships..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border transition-all ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                } focus:outline-none`}
              />
              <ShoppingBag className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            </div>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Embedded in Whop Badge */}
            {isEmbedded && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Whop Embedded Mode
              </span>
            )}

            {/* Sell on Whop / App Store Guide Button */}
            {onOpenWhopAppStore && (
              <button
                onClick={onOpenWhopAppStore}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
                title="Whop App Store Setup Guide & Permissions"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Sell on Whop / Guide</span>
              </button>
            )}

            {/* How to Use Guide Button */}
            {onOpenHowToUse && (
              <button
                onClick={onOpenHowToUse}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                title="How to Use Each Feature"
              >
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span className="hidden sm:inline">How to Use</span>
              </button>
            )}

            {/* Notifications */}
            <div className="relative p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </div>

            {/* Reset Catalog Data */}
            {onResetCatalog && (
              <button
                onClick={onResetCatalog}
                className={`p-2 rounded-lg border text-xs transition-colors ${
                  darkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900'
                }`}
                title="Reset local storage data to initial Whop catalog defaults"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Account Info */}
            <div className={`hidden sm:flex items-center gap-3 pl-3 border-l ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="hidden xl:block text-right">
                <div className="text-xs font-semibold leading-none">Alex Rivera</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Owner Account</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sub Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => onSelectMode('marketplace')}
            className={`flex flex-col items-center gap-1 ${currentMode === 'marketplace' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Store</span>
          </button>
          <button
            onClick={() => onSelectMode('passes')}
            className={`flex flex-col items-center gap-1 relative ${currentMode === 'passes' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
          >
            <Key className="w-4 h-4" />
            <span>My Passes</span>
            {activePassesCount > 0 && (
              <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </button>
          <button
            onClick={() => onSelectMode('creator')}
            className={`flex flex-col items-center gap-1 ${currentMode === 'creator' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
          >
            <Zap className="w-4 h-4" />
            <span>Creator</span>
          </button>
          <button
            onClick={() => onSelectMode('developer')}
            className={`flex flex-col items-center gap-1 ${currentMode === 'developer' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'}`}
          >
            <Code className="w-4 h-4" />
            <span>API</span>
          </button>
        </div>
      </div>
    </header>
  );
};
