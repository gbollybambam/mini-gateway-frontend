"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Terminal, Shield, Webhook, CreditCard, CheckCircle2, Copy, Check, Lock
} from "lucide-react";

type CodeLang = "curl" | "node" | "php";

function CodeBlock({ id, code, lang, activeLang, copied, onCopy }: {
  id: string;
  code: string;
  lang?: string;
  activeLang: CodeLang;
  copied: boolean;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="relative group rounded-xl bg-[#0a0f16] border border-white/10 overflow-hidden my-4 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
        <span className="text-[10px] uppercase tracking-widest font-bold text-[#8995a3]">{lang || activeLang}</span>
        <button
          onClick={() => onCopy(code, id)}
          className="text-[#8995a3] hover:text-white transition-colors p-1"
        >
          {copied ? <Check className="h-4 w-4 text-[#35d5a4]" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-[#e8edf2] leading-relaxed custom-scrollbar">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState<CodeLang>("curl");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-[#e8edf2] font-sans selection:bg-[#2f9d78]/30">
      
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#090d14]/80 backdrop-blur-xl px-6 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#b9f3e5] to-[#2f9d78] text-sm font-black text-[#090d14] shadow-[0_0_15px_rgba(47,157,120,0.3)]">P</div>
          <span className="font-bold text-white tracking-tight">Payflow Docs</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-[#8995a3] hover:text-white transition-colors">Developer Dashboard</Link>
          <Link href="/register" className="text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors border border-white/5">Get API Keys</Link>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto flex pt-16">
        
        {/* Left Sidebar (Sticky) */}
        <aside className="hidden lg:block w-[280px] shrink-0 border-r border-white/5 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto custom-scrollbar p-6">
          <div className="space-y-8">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-4">Getting Started</h4>
              <ul className="space-y-2.5 text-sm font-medium text-[#68747e]">
                <li><a href="#introduction" className="hover:text-white transition-colors">Introduction</a></li>
                <li><a href="#authentication" className="hover:text-white transition-colors">Authentication & Scopes</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-4">Payments API</h4>
              <ul className="space-y-2.5 text-sm font-medium text-[#68747e]">
                <li><a href="#initialize-payment" className="hover:text-white transition-colors">Initialize Payment</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-4">Webhooks</h4>
              <ul className="space-y-2.5 text-sm font-medium text-[#68747e]">
                <li><a href="#webhook-verification" className="hover:text-white transition-colors">HMAC Verification</a></li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          
          {/* Language Switcher Sticky Bar */}
          <div className="sticky top-16 z-40 bg-[#090d14]/90 backdrop-blur-md border-b border-white/5 px-6 lg:px-12 py-3 flex items-center justify-end gap-2">
            <span className="text-xs text-[#8995a3] mr-2">Code Language:</span>
            {(["curl", "node", "php"] as CodeLang[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeLang === lang ? "bg-[#2f9d78] text-white shadow-[0_0_10px_rgba(47,157,120,0.4)]" : "bg-white/5 text-[#8995a3] hover:bg-white/10 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="p-6 lg:p-12 max-w-[900px] space-y-24 pb-32">
            
            {/* INTRODUCTION */}
            <section id="introduction" className="space-y-4 pt-8 scroll-mt-24">
              <h1 className="text-4xl font-bold text-white tracking-tight">API Reference</h1>
              <p className="text-lg text-[#8995a3] leading-relaxed">
                The Payflow API is organized around REST. Our API has predictable resource-oriented URLs, accepts form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
              </p>
              <div className="flex items-center gap-2 text-sm text-[#35d5a4] bg-[#2f9d78]/10 border border-[#2f9d78]/20 px-4 py-2 rounded-lg w-fit shadow-inner">
                <Terminal className="h-4 w-4" />
                <span className="font-mono font-bold">Base URL: https://api.yourdomain.com/v1</span>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* AUTHENTICATION & SCOPES */}
            <section id="authentication" className="space-y-6 scroll-mt-24">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400"><Shield className="h-5 w-5" /></div>
                <h2 className="text-2xl font-bold text-white">Authentication & Scopes</h2>
              </div>
              <p className="text-[#8995a3] leading-relaxed">
                Authenticate your API requests by including your secret API key in the `Authorization` header. You can generate and manage your API keys in the <Link href="/login" className="text-[#35d5a4] hover:underline font-bold">Developer Dashboard</Link>.
              </p>
              
              {/* Premium Scope Explanation */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <h3>Understanding API Key Scopes</h3>
                </div>
                <p className="text-sm text-[#8995a3] leading-relaxed">
                  For enhanced security, Payflow allows you to restrict API keys to specific permissions (Scopes). When making a request, ensure the API key you are using possesses the required scope for that endpoint, otherwise the request will fail with a <code className="bg-black/30 px-1 py-0.5 rounded text-red-400 font-mono">403 Forbidden</code> error.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="bg-[#0a0f16] border border-white/5 p-3 rounded-xl flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest">payments:write</span>
                    <span className="text-xs text-[#8995a3]">Required to create payments</span>
                  </div>
                  <div className="bg-[#0a0f16] border border-white/5 p-3 rounded-xl flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest">withdrawals:write</span>
                    <span className="text-xs text-[#8995a3]">Required to request payouts</span>
                  </div>
                </div>
              </div>

              <CodeBlock 
                id="auth_example"
                lang="http"
                activeLang={activeLang}
                copied={!!copiedStates.auth_example}
                onCopy={copyToClipboard}
                code={`Authorization: Bearer sk_test_YOUR_SECRET_KEY\nContent-Type: application/json`}
              />
            </section>

            <hr className="border-white/5" />

            {/* INITIALIZE PAYMENT */}
            <section id="initialize-payment" className="space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><CreditCard className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-white">Initialize Payment</h2>
                </div>
                {/* PREMIUM ENDPOINT SCOPE BADGE */}
                <div className="flex items-center gap-2 bg-[#0a0f16] border border-white/5 px-3 py-1.5 rounded-lg w-fit">
                  <span className="text-[10px] text-[#68747e] uppercase font-bold tracking-widest">Required Scope:</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-bold uppercase tracking-widest">payments:write</span>
                </div>
              </div>
              
              <p className="text-[#8995a3] leading-relaxed">
                Initialize a transaction to get a checkout URL. Redirect your customer to this URL to complete their payment.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* Left: Params */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/30 shadow-inner">POST</span>
                    <span className="font-mono text-sm text-white">/payments</span>
                  </div>

                  <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0f16] shadow-xl">
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#8995a3]">Body Parameters</h4>
                    </div>
                    <div className="divide-y divide-white/5">
                      <div className="p-4 hover:bg-white/2 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-white font-bold">amount</span>
                          <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">Required</span>
                        </div>
                        <p className="text-xs text-[#8995a3]">Amount in lowest denomination (e.g. kobo or cents). 10000 = NGN 100.00.</p>
                      </div>
                      <div className="p-4 hover:bg-white/2 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-white font-bold">email</span>
                          <span className="text-[10px] text-red-400 uppercase font-bold tracking-wider">Required</span>
                        </div>
                        <p className="text-xs text-[#8995a3]">The customer&apos;s email address.</p>
                      </div>
                      <div className="p-4 hover:bg-white/2 transition-colors">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-white font-bold">reference</span>
                          <span className="text-[10px] text-[#68747e] uppercase font-bold tracking-wider">Optional</span>
                        </div>
                        <p className="text-xs text-[#8995a3]">Unique transaction reference. If not provided, we will generate one for you.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Code */}
                <div>
                  {activeLang === "curl" && (
                    <CodeBlock 
                      id="init_curl"
                      activeLang={activeLang}
                      copied={!!copiedStates.init_curl}
                      onCopy={copyToClipboard}
                      code={`curl -X POST https://api.yourdomain.com/v1/payments \\
  -H "Authorization: Bearer sk_test_12345" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 500000,
    "email": "customer@example.com",
    "currency": "NGN",
    "reference": "txn_898989"
  }'`}
                    />
                  )}
                  {activeLang === "node" && (
                    <CodeBlock 
                      id="init_node"
                      activeLang={activeLang}
                      copied={!!copiedStates.init_node}
                      onCopy={copyToClipboard}
                      code={`const axios = require('axios');

const response = await axios.post(
  'https://api.yourdomain.com/v1/payments', 
  {
    amount: 500000,
    email: 'customer@example.com',
    currency: 'NGN',
    reference: 'txn_898989'
  },
  {
    headers: {
      Authorization: \`Bearer \${process.env.PAYFLOW_SECRET_KEY}\`
    }
  }
);

console.log(response.data.data.checkout_url);`}
                    />
                  )}
                  {activeLang === "php" && (
                    <CodeBlock 
                      id="init_php"
                      activeLang={activeLang}
                      copied={!!copiedStates.init_php}
                      onCopy={copyToClipboard}
                      code={`$ch = curl_init();

curl_setopt_array($ch, [
  CURLOPT_URL => "https://api.yourdomain.com/v1/payments",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode([
    "amount" => 500000,
    "email" => "customer@example.com",
    "currency" => "NGN",
    "reference" => "txn_898989"
  ]),
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer sk_test_12345",
    "Content-Type: application/json"
  ],
]);

$response = curl_exec($ch);
echo $response;`}
                    />
                  )}

                  <div className="mt-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#8995a3] mb-2">Response</h5>
                    <CodeBlock 
                      id="init_res"
                      lang="json"
                      activeLang={activeLang}
                      copied={!!copiedStates.init_res}
                      onCopy={copyToClipboard}
                      code={`{
  "status": "success",
  "message": "Payment initialized",
  "data": {
    "authorization_url": "https://checkout.yourdomain.com/pay/chr_1234abc",
    "access_code": "chr_1234abc",
    "reference": "txn_898989"
  }
}`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-white/5" />

            {/* WEBHOOKS */}
            <section id="webhook-verification" className="space-y-6 scroll-mt-24">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400"><Webhook className="h-5 w-5" /></div>
                  <h2 className="text-2xl font-bold text-white">Webhook Verification</h2>
                </div>
              </div>
              <p className="text-[#8995a3] leading-relaxed">
                We send events to your webhook URL when asynchronous operations like successful payments occur. To ensure the request genuinely came from us, you must verify the <code className="font-mono bg-white/10 px-1 py-0.5 rounded text-white text-sm">x-gateway-signature</code> header.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <p className="text-sm text-[#8995a3] leading-relaxed">
                    The signature is an <strong>HMAC SHA512</strong> hash generated using your Webhook Secret (available in your dashboard) and the raw JSON payload body of the request.
                  </p>
                  <div className="border border-white/10 bg-[#0a0f16] rounded-xl p-4 space-y-3 shadow-xl">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#35d5a4]" />
                      <span className="text-white">1. Read the raw request body.</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#35d5a4]" />
                      <span className="text-white">2. Hash it using HMAC SHA512 & your secret.</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#35d5a4]" />
                      <span className="text-white">3. Compare it to <code className="text-[#35d5a4]">x-gateway-signature</code>.</span>
                    </div>
                  </div>
                </div>

                <div>
                  {activeLang === "curl" && (
                    <div className="bg-[#0a0f16] border border-white/10 rounded-xl p-6 text-sm text-[#8995a3] text-center italic shadow-xl">
                      Verification happens on your backend server, so cURL is not applicable here. Please select Node.js or PHP above.
                    </div>
                  )}
                  {activeLang === "node" && (
                    <CodeBlock 
                      id="wh_node"
                      activeLang={activeLang}
                      copied={!!copiedStates.wh_node}
                      onCopy={copyToClipboard}
                      code={`const crypto = require('crypto');
const express = require('express');
const app = express();

const secret = process.env.WEBHOOK_SECRET;

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const hash = crypto.createHmac('sha512', secret)
                     .update(req.body)
                     .digest('hex');

  if (hash === req.headers['x-gateway-signature']) {
    // Valid request! Parse JSON and process event
    const event = JSON.parse(req.body);
    console.log(event.event);
  } else {
    // Invalid signature
    res.status(401).send('Invalid signature');
  }
  
  res.send(200);
});`}
                    />
                  )}
                  {activeLang === "php" && (
                    <CodeBlock 
                      id="wh_php"
                      activeLang={activeLang}
                      copied={!!copiedStates.wh_php}
                      onCopy={copyToClipboard}
                      code={`// Retrieve the raw body
$payload = @file_get_contents("php://input");
$secret = getenv('WEBHOOK_SECRET');

// Validate signature
$signature = (isset($_SERVER['HTTP_X_GATEWAY_SIGNATURE']) ? $_SERVER['HTTP_X_GATEWAY_SIGNATURE'] : '');

if (!$signature || ($signature !== hash_hmac('sha512', $payload, $secret))) {
    // Invalid signature
    http_response_code(401);
    exit();
}

// Valid request! Process event
$event = json_decode($payload);
if ($event->event === 'payment.successful') {
    // Give value to customer
}

http_response_code(200);`}
                    />
                  )}
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}