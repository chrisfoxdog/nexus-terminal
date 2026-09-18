import React, { useState } from 'react';
import { Code, Key, Copy, Play, CheckCircle2, AlertTriangle, ShieldCheck, Terminal, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface DevApiPlaygroundProps {
  darkMode: boolean;
}

export const DevApiPlayground: React.FC<DevApiPlaygroundProps> = ({ darkMode }) => {
  const [testKey, setTestKey] = useState('whop_live_key_998124_apex_vip_trader');
  const [testProductId, setTestProductId] = useState('prod_apex_signals');
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [httpStatus, setHttpStatus] = useState<number | null>(null);
  const [copiedCodeTab, setCopiedCodeTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showApiGuide, setShowApiGuide] = useState(false);

  const handleValidateKey = async () => {
    setIsLoading(true);
    setApiResponse(null);

    try {
      const res = await fetch('/api/v1/licenses/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer whop_live_secret_99812',
        },
        body: JSON.stringify({
          license_key: testKey,
          product_id: testProductId,
        }),
      });

      setHttpStatus(res.status);
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setHttpStatus(500);
      setApiResponse({ error: 'NETWORK_ERROR', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlSnippet = () => `curl -X POST "${window.location.origin}/api/v1/licenses/validate" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_WHOP_APP_SECRET" \\
  -d '{
    "license_key": "${testKey}",
    "product_id": "${testProductId}"
  }'`;

  const getNodeSnippet = () => `const fetch = require('node-fetch');

async function validateWhopLicense(licenseKey) {
  const res = await fetch('${window.location.origin}/api/v1/licenses/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.WHOP_APP_SECRET
    },
    body: JSON.stringify({
      license_key: licenseKey,
      product_id: '${testProductId}'
    })
  });

  const data = await res.json();
  if (data.valid) {
    console.log('✅ License Valid for user:', data.user.email);
  } else {
    console.log('❌ License Invalid or Expired:', data.message);
  }
}

validateWhopLicense('${testKey}');`;

  const getPythonSnippet = () => `import requests

def validate_whop_license(license_key):
    url = "${window.location.origin}/api/v1/licenses/validate"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_WHOP_APP_SECRET"
    }
    payload = {
        "license_key": license_key,
        "product_id": "${testProductId}"
    }

    response = requests.post(url, json=payload, headers=headers)
    data = response.json()

    if data.get("valid"):
        print(f"✅ Access granted to {data['user']['username']}")
    else:
        print(f"❌ Access denied: {data.get('message')}")

validate_whop_license("${testKey}")`;

  const [configStatus, setConfigStatus] = useState<any>(null);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookCopied, setWebhookCopied] = useState(false);

  React.useEffect(() => {
    fetch('/api/v1/config/status')
      .then((r) => r.json())
      .then((data) => setConfigStatus(data))
      .catch((e) => console.error('Error fetching config status:', e));

    fetch('/api/v1/webhooks/history')
      .then((r) => r.json())
      .then((data) => setWebhookLogs(data.logs || []))
      .catch((e) => console.error('Error fetching webhook history:', e));
  }, []);

  const [selectedEventType, setSelectedEventType] = useState<'membership.went_valid' | 'membership.went_invalid' | 'payment.succeeded'>('membership.went_valid');

  const handleSimulateWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      await fetch('/api/v1/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: selectedEventType,
          user_id: 'usr_whop_77812',
          membership_id: 'mem_live_99214',
          product_id: testProductId || 'prod_apex_signals',
        }),
      });

      const res = await fetch('/api/v1/webhooks/history');
      const data = await res.json();
      setWebhookLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleRefreshWebhookHistory = async () => {
    try {
      const res = await fetch('/api/v1/webhooks/history');
      const data = await res.json();
      setWebhookLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch webhook logs:', err);
    }
  };

  const handleCopySnippet = () => {
    let snippet = getCurlSnippet();
    if (copiedCodeTab === 'node') snippet = getNodeSnippet();
    if (copiedCodeTab === 'python') snippet = getPythonSnippet();

    navigator.clipboard.writeText(snippet);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleCopyWebhookUrl = () => {
    const url = `${window.location.origin}/api/v1/webhooks/receive`;
    navigator.clipboard.writeText(url);
    setWebhookCopied(true);
    setTimeout(() => setWebhookCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
          <Code className="w-3.5 h-3.5" />
          Whop Developer API Tester
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
          License Key Validation API
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Validate Whop access pass license keys (`whop_live_key_...`) and test API integration endpoints.
        </p>
      </div>

      {/* Quick How to Use Guide */}
      <div className={`p-4 rounded-2xl border transition-all ${
        darkMode ? 'bg-zinc-900/80 border-purple-500/30' : 'bg-purple-50/60 border-purple-200'
      }`}>
        <button
          onClick={() => setShowApiGuide(!showApiGuide)}
          className="w-full flex items-center justify-between text-xs font-bold text-purple-400 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>How to Use License Validation & Code Snippets</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-400 font-normal">{showApiGuide ? 'Hide Guide' : 'Show Instructions'}</span>
            {showApiGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showApiGuide && (
          <div className="mt-3 pt-3 border-t border-purple-500/20 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-300 animate-fade-in">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-white block mb-0.5">Enter Test License Key</strong>
                Paste any key (e.g. <code className="text-purple-300 font-mono">whop_live_key_998124_apex_vip_trader</code>) or select a product ID.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-white block mb-0.5">Test API Execution</strong>
                Click <strong>"Test License Validation API"</strong> to send an HTTP POST request and view real-time JSON responses and status codes.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-white block mb-0.5">Copy Code Snippets</strong>
                Switch snippet tabs between <strong>cURL</strong>, <strong>Node.js</strong>, and <strong>Python</strong> to copy production integration code.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Tester Form */}
        <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold font-mono text-[#FF6243]">
              <span className="px-2 py-0.5 rounded bg-[#FF6243]/20 text-[#FF6243]">POST</span>
              <span>/api/v1/licenses/validate</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Whop API v1</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-zinc-400 block mb-1">License Key string to validate</label>
              <input
                type="text"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="e.g. whop_live_key_998124_apex_vip_trader"
                className={`w-full px-3.5 py-2 rounded-xl border font-mono ${
                  darkMode ? 'bg-black border-zinc-800 text-amber-400' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                } focus:outline-none focus:border-[#FF6243]`}
              />
              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                <span>Preset keys:</span>
                <button
                  onClick={() => setTestKey('E-8486F8-99B79479-E306C0W')}
                  className="text-emerald-400 font-bold underline hover:text-emerald-300"
                  title="Real Whop production member license from Elite Software Studio"
                >
                  Live Whop Key
                </button>
                <span>•</span>
                <button
                  onClick={() => setTestKey('whop_live_key_998124_apex_vip_trader')}
                  className="text-amber-400 underline hover:text-amber-300"
                >
                  Store Key
                </button>
                <span>•</span>
                <button
                  onClick={() => setTestKey('expired_key_000')}
                  className="text-rose-400 underline hover:text-rose-300"
                >
                  Invalid Key
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-zinc-400 block mb-1">Product ID</label>
              <input
                type="text"
                value={testProductId}
                onChange={(e) => setTestProductId(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border font-mono ${
                  darkMode ? 'bg-black border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200'
                }`}
              />
            </div>

            <button
              onClick={handleValidateKey}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#FF6243] hover:bg-[#FF7A00] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF6243]/20 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing API Request...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Execute License Validation Request</span>
                </>
              )}
            </button>
          </div>

          {/* Response Inspector */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-400">API Response Payload</span>
              {httpStatus && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    httpStatus === 200
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  HTTP {httpStatus}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-black border border-zinc-800 font-mono text-xs overflow-x-auto min-h-36 max-h-64">
              {apiResponse ? (
                <pre className={apiResponse.valid ? 'text-emerald-400' : 'text-rose-400'}>
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="text-zinc-600 text-center py-8">
                  Click "Execute License Validation Request" to test API response.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Snippets Section */}
        <div className={`p-6 rounded-2xl border space-y-4 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Integration Code Snippets</span>
            </div>

            <div className="flex items-center gap-1 bg-black p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setCopiedCodeTab('curl')}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                  copiedCodeTab === 'curl' ? 'bg-[#FF6243] text-white' : 'text-zinc-400'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setCopiedCodeTab('node')}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                  copiedCodeTab === 'node' ? 'bg-[#FF6243] text-white' : 'text-zinc-400'
                }`}
              >
                Node.js
              </button>
              <button
                onClick={() => setCopiedCodeTab('python')}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold ${
                  copiedCodeTab === 'python' ? 'bg-[#FF6243] text-white' : 'text-zinc-400'
                }`}
              >
                Python
              </button>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={handleCopySnippet}
              className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center gap-1 z-10"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSuccess ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <pre className="p-4 rounded-xl bg-black border border-zinc-800 text-zinc-200 font-mono text-xs overflow-x-auto min-h-64 pt-10">
              {copiedCodeTab === 'curl' && getCurlSnippet()}
              {copiedCodeTab === 'node' && getNodeSnippet()}
              {copiedCodeTab === 'python' && getPythonSnippet()}
            </pre>
          </div>
        </div>
      </div>

      {/* Webhook & Server Environment Section */}
      <div className={`p-6 rounded-2xl border space-y-6 ${darkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Whop Webhooks Receiver & System Status</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Paste this Webhook Endpoint URL into your Whop Developer Dashboard (`whop.com/dashboard/settings/webhooks`) to receive real-time purchase & cancellation events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedEventType}
              onChange={(e: any) => setSelectedEventType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-black border border-zinc-700 text-xs text-white font-mono focus:outline-none"
            >
              <option value="membership.went_valid">membership.went_valid (Grant Access)</option>
              <option value="membership.went_invalid">membership.went_invalid (Revoke Access)</option>
              <option value="payment.succeeded">payment.succeeded (Payment Complete)</option>
            </select>

            <button
              onClick={handleCopyWebhookUrl}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{webhookCopied ? 'Copied URL!' : 'Copy Webhook URL'}</span>
            </button>

            <button
              onClick={handleSimulateWebhook}
              disabled={isTestingWebhook}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Event</span>
            </button>

            <button
              onClick={handleRefreshWebhookHistory}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
              title="Refresh webhook logs"
            >
              ↻
            </button>
          </div>
        </div>

        {/* System Environment Checklist */}
        {configStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              configStatus.gemini_api_configured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <span className="font-semibold">Gemini AI API</span>
              <span className="font-bold">{configStatus.gemini_api_configured ? 'CONFIGURED ✅' : 'SECRET NEEDED ⚠️'}</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              configStatus.whop_api_configured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              <span className="font-semibold">Whop API Key</span>
              <span className="font-bold">{configStatus.whop_api_configured ? 'CONNECTED ✅' : 'OPTIONAL (.env)'}</span>
            </div>

            <div className="p-3 rounded-xl border bg-purple-500/10 border-purple-500/30 text-purple-300 flex items-center justify-between">
              <span className="font-semibold">Whop App ID</span>
              <span className="font-bold font-mono text-[11px]">{configStatus.whop_app_id || 'app_gzeMFmZKMcOdbA'}</span>
            </div>

            <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-300 flex items-center justify-between">
              <span className="font-semibold">Whop Company</span>
              <span className="font-bold font-mono text-[11px]">{configStatus.whop_company_id || 'biz_DcAqjfC3rHB0s1'}</span>
            </div>
          </div>
        )}

        {/* Webhook Event History Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
            <span>Webhook History Log ({webhookLogs.length} events)</span>
            <span className="text-[10px] text-zinc-500 font-mono">Listening on /api/v1/webhooks/receive</span>
          </div>

          <div className="p-4 rounded-xl bg-black border border-zinc-800 font-mono text-xs overflow-x-auto max-h-56 space-y-2">
            {webhookLogs.length > 0 ? (
              webhookLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{log.action}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-purple-300 border border-zinc-700">
                        {log.status || 'VERIFIED'}
                      </span>
                    </div>
                    <span className="text-zinc-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <pre className="text-[10px] text-zinc-400 overflow-x-auto">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <div className="text-zinc-600 text-center py-6">
                No webhook events received yet. Click "Simulate Webhook Event" or trigger a webhook from Whop!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
