import React, { useState, useRef, useEffect } from 'react';
import { WhopProduct } from '../types';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  Zap,
  ShoppingBag,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProductId?: string;
}

interface GeminiProductChatWidgetProps {
  products: WhopProduct[];
  darkMode: boolean;
  onSelectProduct: (product: WhopProduct) => void;
}

export const GeminiProductChatWidget: React.FC<GeminiProductChatWidgetProps> = ({
  products,
  darkMode,
  onSelectProduct,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      text: "👋 Hi! I'm your Whop AI Marketplace Advisor. Ask me anything about our access passes, pricing tiers, Discord role sync, or feature comparisons!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsThinking(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome_1')
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/gemini/product-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history,
          selectedProductId: selectedProductId !== 'all' ? selectedProductId : undefined,
          products,
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: data.reply || "I'm here to help you find the best Whop access pass!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedProductId: data.recommendedProductId,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: 'I had trouble connecting to the Gemini server. Please check your network or try asking again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const activeFocusProduct = products.find((p) => p.id === selectedProductId);

  // Helper renderer for simple markdown-style bolding and bullets
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} className="font-bold text-slate-900 dark:text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </span>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-indigo-600" />
          </div>
          <span className="tracking-wide">Ask Whop AI</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] uppercase font-extrabold text-indigo-100">
            24/7 Advisor
          </span>
        </button>
      )}

      {/* Expanded Chat Box Window */}
      {isOpen && (
        <div
          className={`w-[340px] sm:w-[400px] h-[520px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Chat Window Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-bold text-sm leading-tight text-slate-900 dark:text-white">
                  <span>Whop AI Advisor</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Gemini 3.6
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  Ask about passes, signals, pricing & features
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Focus Selector Dropdown */}
          <div className="px-4 py-2 bg-indigo-50/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Focus Product:
            </span>

            <div className="relative flex-1">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className={`w-full py-1 pl-2 pr-6 rounded-md text-[11px] font-semibold border appearance-none truncate focus:outline-none ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="all">🌟 All Marketplace Products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.title} (${p.plans[0]?.price})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Chat Messages Log Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const recProduct = msg.recommendedProductId
                ? products.find((p) => p.id === msg.recommendedProductId)
                : null;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className={`max-w-[82%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-xs font-medium'
                          : darkMode
                          ? 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/80'
                          : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                      }`}
                    >
                      {renderFormattedText(msg.text)}
                    </div>

                    {/* Inline Recommended Product Card CTA */}
                    {recProduct && (
                      <div className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                        darkMode ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50/80 border-indigo-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{recProduct.icon}</span>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">{recProduct.title}</div>
                            <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              ${recProduct.plans[0]?.price} / {recProduct.plans[0]?.interval}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectProduct(recProduct)}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span>View Product Pass</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium text-slate-400 ml-1">Analyzing Whop catalog...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips (Shown if messages are few) */}
          {messages.length < 5 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-indigo-500" /> Popular Questions
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  onClick={() => handleQuickQuestion("Which pass is best for crypto signals?")}
                  className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white transition-colors shrink-0 text-slate-700 dark:text-slate-300"
                >
                  ⚡ Best crypto signals?
                </button>
                <button
                  onClick={() => handleQuickQuestion("What's included in SaaS Starter Kit?")}
                  className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white transition-colors shrink-0 text-slate-700 dark:text-slate-300"
                >
                  💻 SaaS Starter Kit details
                </button>
                <button
                  onClick={() => handleQuickQuestion("How do Discord roles sync with Whop?")}
                  className="px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800/80 hover:bg-indigo-600 hover:text-white transition-colors shrink-0 text-slate-700 dark:text-slate-300"
                >
                  💬 How Discord roles sync
                </button>
              </div>
            </div>
          )}

          {/* Input Bar Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={activeFocusProduct ? `Ask about ${activeFocusProduct.title}...` : "Ask Whop AI Advisor..."}
              className={`flex-1 px-3.5 py-2 text-xs rounded-xl border transition-all focus:outline-none ${
                darkMode
                  ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isThinking}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 shadow-xs disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
