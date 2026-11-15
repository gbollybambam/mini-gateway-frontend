"use client";

import { useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/public/SiteHeader";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Terminal,
  Webhook,
} from "@/components/icons";

type CodeLang = "curl" | "node" | "php";

const LANGUAGES: { value: CodeLang; label: string }[] = [
  { value: "curl", label: "cURL" },
  { value: "node", label: "Node.js" },
  { value: "php", label: "PHP" },
];

const NAV_GROUPS = [
  {
    title: "Getting started",
    items: [
      { label: "Introduction", href: "#introduction" },
      { label: "Authentication & scopes", href: "#authentication" },
    ],
  },
  {
    title: "Payments API",
    items: [{ label: "Initialize payment", href: "#initialize-payment" }],
  },
  {
    title: "Webhooks",
    items: [{ label: "HMAC verification", href: "#webhook-verification" }],
  },
];

const SCOPE_CLS =
  "inline-flex items-center rounded-[5px] border border-[#DDD6FE] bg-[#F5F3FF] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6D28D9]";

function CodeBlock({
  id,
  code,
  lang,
  activeLang,
  copied,
  onCopy,
}: {
  id: string;
  code: string;
  lang?: string;
  activeLang: CodeLang;
  copied: boolean;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="group relative my-4 overflow-hidden rounded-[12px] border border-[#27272A] bg-[#0B0B0E] shadow-[0_16px_36px_-20px_rgba(9,9,11,0.55)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#A1A1AA]">
          {lang || activeLang}
        </span>
        <button
          type="button"
          onClick={() => onCopy(code, id)}
          className="inline-flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px] font-medium text-[#A1A1AA] transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[#34D399]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="custom-scrollbar overflow-x-auto p-4 text-[12px] leading-[1.75] text-[#E4E4E7]">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionCard({
  id,
  icon,
  title,
  subtitle,
  right,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E5E7EB] bg-[#F8F8F6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-[8px] border border-[#E5E7EB] bg-white text-[#52525B] shadow-sm">
            {icon}
          </span>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-[#09090B]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[12px] text-[#71717A]">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

export default function ApiDocsPage() {
  const [activeLang, setActiveLang] = useState<CodeLang>("curl");
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((current) => ({ ...current, [id]: true }));
      setTimeout(() => {
        setCopiedStates((current) => ({ ...current, [id]: false }));
      }, 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#09090B] antialiased">
      <SiteHeader active="Docs" />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[236px_minmax(0,1fr)] xl:gap-14">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="custom-scrollbar sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10 pr-2">
              <nav aria-label="Documentation navigation" className="space-y-7">
                {NAV_GROUPS.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA]">
                      {group.title}
                    </p>
                    <ul className="space-y-0.5">
                      {group.items.map((item) => (
                        <li key={item.href}>
                          <a
                            href={item.href}
                            className="flex min-h-9 items-center rounded-[8px] px-3 py-2 text-[13px] font-medium text-[#71717A] transition-colors hover:bg-[#F8F8F6] hover:text-[#09090B]"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="mt-8 rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#09090B]">
                  <KeyRound className="h-4 w-4 text-[#71717A]" />
                  API keys
                </div>
                <p className="mt-2 text-[12px] leading-[1.6] text-[#71717A]">
                  Create keys and configure scopes from your dashboard.
                </p>
                <Link
                  href="/login"
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[8px] bg-gradient-to-b from-[#27272A] to-[#09090B] px-3 text-[12px] font-semibold text-white shadow-sm ring-1 ring-black/10 transition hover:brightness-125"
                >
                  Open dashboard
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 pb-28 pt-8 lg:pt-10">
            {/* Mobile section nav */}
            <div className="custom-scrollbar -mx-4 mb-6 flex gap-1.5 overflow-x-auto border-b border-[#E5E7EB] px-4 pb-3 lg:hidden">
              {NAV_GROUPS.flatMap((group) => group.items).map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-full border border-[#E5E7EB] bg-[#F8F8F6] px-3 py-1.5 text-[12px] font-medium text-[#52525B]"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Intro */}
            <section id="introduction" className="scroll-mt-32">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#A1A1AA]">
                Docs
                <span aria-hidden="true">/</span>
                <span className="text-[#52525B]">API reference</span>
              </p>
              <h1 className="mt-3 text-[34px] font-bold leading-[1.1] tracking-[-0.035em] text-[#09090B] sm:text-[42px]">
                API reference
              </h1>
              <p className="mt-4 max-w-[680px] text-[15px] leading-[1.75] text-[#52525B]">
                The PayMesh API is organized around REST. It has predictable resource-oriented URLs, accepts
                form-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes,
                authentication, and verbs.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#BBF7D0] bg-[#ECFDF5] px-3 py-1.5 text-[12px] font-medium text-[#047857]">
                  <Terminal className="h-4 w-4" />
                  <span className="font-mono">Base URL: https://api.yourdomain.com/v1</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-3 py-1.5 text-[12px] font-medium text-[#52525B] shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-[#059669]" />
                  REST · JSON · HTTPS
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { label: "Authenticate", detail: "Bearer keys & scopes", href: "#authentication", icon: <Shield className="h-4 w-4" /> },
                  { label: "Create a payment", detail: "Get a checkout URL", href: "#initialize-payment", icon: <CreditCard className="h-4 w-4" /> },
                  { label: "Verify webhooks", detail: "HMAC SHA512", href: "#webhook-verification", icon: <Webhook className="h-4 w-4" /> },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D4D4D8] hover:shadow-[0_10px_24px_-16px_rgba(9,9,11,0.25)]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid size-8 place-items-center rounded-[8px] border border-[#E5E7EB] bg-[#F8F8F6] text-[#52525B] transition-colors group-hover:bg-[#09090B] group-hover:text-white">
                        {item.icon}
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-[#A1A1AA] transition-colors group-hover:text-[#09090B]" />
                    </div>
                    <p className="mt-3 text-[13px] font-semibold text-[#09090B]">{item.label}</p>
                    <p className="mt-0.5 text-[12px] text-[#71717A]">{item.detail}</p>
                  </a>
                ))}
              </div>
            </section>

            {/* Language toolbar */}
            <div className="sticky top-16 z-30 mt-8 flex items-center justify-between gap-3 rounded-[10px] border border-[#E5E7EB] bg-white/90 px-2.5 py-2 shadow-sm backdrop-blur-xl sm:px-3">
              <span className="pl-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA]">
                Code samples
              </span>
              <div
                className="inline-flex items-center gap-0.5 rounded-[8px] border border-[#E5E7EB] bg-[#F8F8F6] p-0.5"
                role="tablist"
                aria-label="Code language"
              >
                {LANGUAGES.map((language) => (
                  <button
                    key={language.value}
                    type="button"
                    role="tab"
                    aria-selected={activeLang === language.value}
                    onClick={() => setActiveLang(language.value)}
                    className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium transition-all ${
                      activeLang === language.value
                        ? "border border-[#E5E7EB] bg-white text-[#09090B] shadow-sm"
                        : "border border-transparent text-[#71717A] hover:text-[#09090B]"
                    }`}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* AUTHENTICATION */}
              <SectionCard
                id="authentication"
                icon={<Shield className="h-5 w-5" />}
                title="Authentication & scopes"
                subtitle="Secure every request with a bearer key."
              >
                <p className="text-[14px] leading-[1.75] text-[#52525B]">
                  Authenticate your API requests by including your secret API key in the{" "}
                  <code className="rounded-[5px] border border-[#E5E7EB] bg-[#F8F8F6] px-1.5 py-0.5 font-mono text-[12px] text-[#09090B]">
                    Authorization
                  </code>{" "}
                  header. You can generate and manage your API keys in the{" "}
                  <Link href="/login" className="font-semibold text-[#047857] underline-offset-2 hover:underline">
                    Developer Dashboard
                  </Link>
                  .
                </p>

                <div className="mt-5 rounded-[12px] border border-[#E5E7EB] bg-[#F8F8F6] p-5">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#09090B]">
                    <Lock className="h-4 w-4 text-[#71717A]" />
                    Understanding API key scopes
                  </div>
                  <p className="mt-2 text-[13px] leading-[1.7] text-[#52525B]">
                    For enhanced security, PayMesh lets you restrict API keys to specific permissions (scopes). When
                    making a request, ensure the key you are using has the required scope for that endpoint, otherwise
                    the request fails with a{" "}
                    <code className="rounded-[5px] border border-[#FECACA] bg-[#FEF2F2] px-1.5 py-0.5 font-mono text-[12px] text-[#DC2626]">
                      403 Forbidden
                    </code>{" "}
                    error.
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
                    <div className="flex flex-wrap items-center gap-2.5 rounded-[9px] border border-[#E5E7EB] bg-white px-3 py-2.5 shadow-sm">
                      <span className={SCOPE_CLS}>payments:write</span>
                      <span className="min-w-0 text-[12px] text-[#71717A]">Create payments</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 rounded-[9px] border border-[#E5E7EB] bg-white px-3 py-2.5 shadow-sm">
                      <span className={SCOPE_CLS}>withdrawals:write</span>
                      <span className="min-w-0 text-[12px] text-[#71717A]">Request payouts</span>
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
              </SectionCard>

              {/* INITIALIZE PAYMENT */}
              <SectionCard
                id="initialize-payment"
                icon={<CreditCard className="h-5 w-5" />}
                title="Initialize payment"
                subtitle="Create a transaction and get a checkout URL."
                right={
                  <div className="flex items-center gap-2 rounded-[8px] border border-[#E5E7EB] bg-white px-2.5 py-1.5 shadow-sm">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA]">
                      Required scope
                    </span>
                    <span className={SCOPE_CLS}>payments:write</span>
                  </div>
                }
              >
                <p className="text-[14px] leading-[1.75] text-[#52525B]">
                  Initialize a transaction to get a checkout URL. Redirect your customer to this URL to complete
                  their payment.
                </p>

                <div className="mt-5 grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                  {/* Parameters */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-[5px] border border-[#BBF7D0] bg-[#ECFDF5] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#047857]">
                        POST
                      </span>
                      <code className="font-mono text-[13px] font-medium text-[#09090B]">/payments</code>
                    </div>

                    <div className="mt-3 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-white shadow-sm">
                      <div className="border-b border-[#E5E7EB] bg-[#F8F8F6] px-4 py-3">
                        <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">
                          Body parameters
                        </h3>
                      </div>
                      <div className="divide-y divide-[#F1F1F0]">
                        <div className="px-4 py-4 transition-colors hover:bg-[#FAFAF9]">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-[13px] font-semibold text-[#09090B]">amount</code>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#DC2626]">
                              Required
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] leading-[1.6] text-[#71717A]">
                            Amount in the lowest denomination (e.g. kobo or cents). 10000 = NGN 100.00.
                          </p>
                        </div>
                        <div className="px-4 py-4 transition-colors hover:bg-[#FAFAF9]">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-[13px] font-semibold text-[#09090B]">email</code>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#DC2626]">
                              Required
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] leading-[1.6] text-[#71717A]">
                            The customer&apos;s email address.
                          </p>
                        </div>
                        <div className="px-4 py-4 transition-colors hover:bg-[#FAFAF9]">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-[13px] font-semibold text-[#09090B]">reference</code>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                              Optional
                            </span>
                          </div>
                          <p className="mt-1 text-[12px] leading-[1.6] text-[#71717A]">
                            Unique transaction reference. If omitted, we generate one for you.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Code */}
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
      Authorization: \`Bearer \${process.env.PAYMESH_SECRET_KEY}\`
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

                    <div className="mt-5">
                      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA]">
                        Response
                      </h3>
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
              </SectionCard>

              {/* WEBHOOKS */}
              <SectionCard
                id="webhook-verification"
                icon={<Webhook className="h-5 w-5" />}
                title="Webhook verification"
                subtitle="Make sure every event really came from PayMesh."
              >
                <p className="text-[14px] leading-[1.75] text-[#52525B]">
                  We send events to your webhook URL when asynchronous operations like successful payments occur. To
                  ensure the request genuinely came from us, verify the{" "}
                  <code className="rounded-[5px] border border-[#E5E7EB] bg-[#F8F8F6] px-1.5 py-0.5 font-mono text-[12px] text-[#09090B]">
                    x-gateway-signature
                  </code>{" "}
                  header.
                </p>

                <div className="mt-5 grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
                  <div className="space-y-4">
                    <p className="text-[13px] leading-[1.7] text-[#52525B]">
                      The signature is an <strong className="font-semibold text-[#09090B]">HMAC SHA512</strong> hash
                      generated using your webhook secret (available in your dashboard) and the raw JSON payload body
                      of the request.
                    </p>
                    <div className="space-y-3 rounded-[12px] border border-[#E5E7EB] bg-[#F8F8F6] p-4">
                      {[
                        "Read the raw request body.",
                        "Hash it using HMAC SHA512 and your secret.",
                        "Compare it to the x-gateway-signature header.",
                      ].map((step, index) => (
                        <div key={step} className="flex items-start gap-2.5 text-[13px] leading-[1.6] text-[#52525B]">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
                          <span>
                            <span className="font-semibold text-[#09090B]">{index + 1}.</span> {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {activeLang === "curl" && (
                      <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 text-center text-[13px] italic leading-[1.7] text-[#71717A] shadow-sm">
                        Verification happens on your backend server, so cURL is not applicable here. Select Node.js or
                        PHP above.
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
              </SectionCard>
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-[12px] border border-[#E5E7EB] bg-[#F8F8F6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-[#71717A]">
                Need a hand integrating? We are happy to help you get to your first payment.
              </p>
              <a
                href="mailto:support@paymesh.com"
                className="inline-flex h-9 w-fit items-center gap-1.5 rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#09090B] shadow-sm transition-colors hover:bg-[#F1F1EE]"
              >
                Contact support
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
