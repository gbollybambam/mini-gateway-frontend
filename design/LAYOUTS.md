# LAYOUTS.md: Page layouts (save as /design/LAYOUTS.md)

Goal: calm, crisp, few elements. The references look professional because of what they leave out.
If a page feels busy, remove things, do not restyle them.

## Global rules
- Content max-width 1120px, centered. Tables may reach 1280px. Page padding 32px desktop, 16px mobile. Section gap 40px. Use an 8px spacing grid.
- Top bar: search (with ⌘K hint), notifications, profile menu. NOTHING else. No page title, no "Merchant workspace" label, no global "Create link" button.
- Page header (inside the page): title 28px/600 on the left, one black 8px-radius primary button on the right when needed. Optional one-line muted subtitle. No eyebrow labels.
- One primary action per screen. Everything else is a text link ("See details", "Edit") or secondary button.
- Max 3 content blocks above the fold. If a page has more, split into tabs or put it behind "View all".
- No more than 2 font sizes inside a card (title, value) plus one muted size.
- Lists = canvas rows (name + muted line left, value + status right, 1px --line dividers, 64px row height). No per-row cards, no zebra, no vertical column lines.
- Details open in a right-side drawer (480px wide; bottom sheet on mobile). Never expand rows inline, never tint a row.
- Status = plain colored text with a 6px dot; no pill, no uppercase.
- Filled surfaces: BalanceCard hero, Sheet/Dialog, and at most one other elevated surface per screen; maximum three.
- Money: ₦ with thousands separators. Credits +₦ in green text. Debits -₦ in ink (not red). Red only for Failed and errors.
- Labels above inputs: sentence case, 14px, --ink-muted. No uppercase, no tracking.
- Icons: one set, one weight, 20px, ink-muted. No colored chips or tinted circles behind them.
- Empty states: one line of text and one action. No illustrations in the app.

## Nav
- Sidebar 240px: logo, then items grouped Operations / Developers / Settings. Icon + label.
- Hover: text turns --ink (no background). Active: muted fill only.
- Mobile: bottom tab bar, 4 items (Overview, Transactions, Links, More). "More" opens a sheet with the rest.

## Overview
Row 1 (2 columns, 2fr / 1fr): BalanceCard (dark, hide/show, copy account number) | one white card "This month" with 3 label-value rows (Pending clearance, Total withdrawals, Transactions), divider between rows.
Row 2: Payment volume, one full-width chart card, Line/Bar toggle, single highlighted bar.
Row 3: Recent activity: one card of 5 transaction rows + "View all" text link.
Mobile: BalanceCard, then the "This month" card, then Recent activity. Chart goes below, collapsed to a smaller height.
No KPI icon cards. No banner "Your account is ready".

## Transactions
Header: "Transactions" + muted count text ("22 records"). No primary button.
Toolbar (no card around it): search input (flex-1), Status select, Date range. One row; wraps on mobile.
One card containing the table: Customer (email, with the reference muted below), Amount, Status, Date. Row click opens the drawer (settlement breakdown, provider reference, Verify button).
Mobile: transaction rows instead of a table.

## Payment links
Header: "Payment links" + primary "Create link". Subtitle one line.
One card of rows: title + reference muted | amount | status text | date. Row click opens a drawer: hosted URL with copy text-link, expiry, payer, "Open payment page".

## Create link
Single-column form, max 560px, in one card. Fields: description, amount, currency (inline), customer email (optional). "More options" collapsed section for reference and redirects. Primary "Create link" at the bottom.
Live preview card only on screens ≥1280px, to the right, quiet and unbranded. No numbered sections, no gradients.

## Wallet
BalanceCard (the same component as Overview). Below it ONE card "Ledger": columns Reference, Movement (text + signed amount), Balance after, Date. Row click opens the drawer. Remove the "System status" card and "Ready for withdrawal" lines.

## Withdrawals
Header: "Withdrawals" + primary "Withdraw". The withdraw form lives in a dialog. List = transaction rows.

## Webhooks
Two stacked cards, each with title left and action text-link right:
1) Endpoint: URL input, secret (masked, with Copy and Rotate text links), Save button, "Send test ping" as a text link.
2) Delivery history: rows with event name, status text, time. Row click opens the drawer with the payload.

## API keys
Header + primary "Create key". Rows: name, masked key, created, "Revoke" text link. Create in a dialog; show the secret once with a copy button.

## Team
Header + primary "Invite". Rows: neutral initials avatar, name + email, role text, "Remove" text link.

## Settings
Horizontal text tabs (Profile, Security, Webhooks). Single-column form, max 640px, grouped with dividers, sticky Save bar on mobile. Do not repeat Webhooks here if the Webhooks page exists; link to it.

## Auth pages
Centered 400px card on --bg, logo above, one heading, form, one primary button, one text link. No side illustrations, no gradients.

## Admin
Same rules as the merchant app. Reuse the same table/row/drawer components. No new styles.

## Checkout (pay, payment-success)
Keep the current structure. Apply the same rules (no uppercase labels, no tinted chips, status as text).
