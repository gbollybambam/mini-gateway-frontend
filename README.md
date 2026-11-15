# PayMesh

PayMesh is a payment gateway frontend — a complete merchant dashboard, admin console, hosted checkout, and public landing page built with Next.js, TypeScript, and Tailwind CSS.

Accept payments with hosted checkout links, track every transaction, manage withdrawals, and withdraw to your bank from one simple platform.

## Features

- **Hosted checkout** — share a payment link or tokenised URL; customers pay on a branded, secure frame.
- **Merchant dashboard** — overview, transactions, payment links, wallet, withdrawals, team, API keys, webhooks, and settings.
- **Admin console** — provider management, global ledger, merchant directory, withdrawals, and audit logs.
- **Public landing** — responsive marketing site with docs and an interactive API reference.
- **Auth flow** — registration, email OTP verification, password reset, and team invitation acceptance.
- **Theme support** — light/dark mode persisted via a theme init script.
- **Design system** — shared motion, skeleton, and surface tokens with reduced-motion support.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

```
src/
  app/
    (auth)/              # login, register, OTP, password reset, invite
    (dashboard)/         # merchant dashboard routes
    (public)/            # docs page
    admin/               # admin console routes
    pay/[token]/         # hosted checkout page
    payment-success/     # receipt page
    layout.tsx           # root layout and metadata
  components/
    checkout/            # checkout frame, form, summary, success
    dashboard/           # shared dashboard UI kit
    auth/                # auth shell, logo, OTP input
    admin/               # admin sidebar shell
    public/              # site header, launch button
  lib/                   # API client, theme, money helpers
public/
  landing/               # standalone marketing HTML
```

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the development server         |
| `npm run build`      | Build the production bundle          |
| `npm run start`      | Serve the production bundle locally  |
| `npm run lint`       | Run ESLint                           |

## Environment

The API base URL and any secret keys are configured through environment variables. See the docs page (`/docs`) for the API reference, authentication, and webhook verification guides.

## Deploy

Deploy on Vercel:

```bash
vercel deploy
```