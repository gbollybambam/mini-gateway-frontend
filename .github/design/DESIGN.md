# DESIGN.md: Design tokens (source of truth)

Brand direction: Naija-first green fintech. The app is a flat canvas with one dark balance hero and restrained green status accents. Marketing may use the campaign accents below; app surfaces may not.

## Colors
| Token | Hex | Use |
|---|---|---|
| --bg | #FAFAFA | App background |
| --surface | #FFFFFF | Cards |
| --surface-muted | #F2F1EF | Quiet controls and skeletons |
| --ink | #111111 | Primary text, black pill buttons |
| --ink-muted | #6B7280 | Secondary text, labels |
| --line | #ECECEC | Dividers, card borders |
| --track | #E8ECEA | Progress bar track |
| --brand-900 | #0F2A14 | Dark hero balance card |
| --brand-800 | #163A1C | Hero card pattern overlay (slightly lighter) |
| --brand-500 | #5CC76A | Accent text/progress ("47% completed", "Edit", "See details") |
| --success | #1DB954 | Successful status, success icon bg tint |
| --success-tint | #E6F7EA | Success icon circle |
| --danger | #E5191B | Spending total, failed/outgoing icon |
| --danger-tint | #FDE7E7 | Outgoing icon circle |
| --pending | #E8B923 | Pending status text |
| --cat-food | #1F5EE6 | Spending tracker: Food |
| --cat-tfare | #F58233 | Spending tracker: T-fare |
| --cat-data | #1DB954 | Spending tracker: Data |
| --cat-transfer | #F5B73B | Spending tracker: Transfer |
| --accent-mint | #52E8A8 | Landing only (PayFlow) |
| --accent-orange | #F58233 | Landing only |
| --accent-yellow | #FFD966 | Landing only |
| --accent-cream | #FDF3E7 | Landing only |

## Typography
- Font: Plus Jakarta Sans (fallback Inter, system-ui).
- App scale is exactly 12 / 14 / 16 / 20 / 28px, with 40px reserved for the balance hero amount. Weights are 400, 500, and 600 only.
- Page H1: 28px / 600. Section title: 14px / 600 with a hairline below. Body: 14px / 400. Use tabular numerals for money and counts. No tracking or all-caps labels.
- Currency: always ₦ (Naira sign), thousands separators, 2 decimals on balances (₦2,480.00).
- Landing hero H1: 64-72px / 700, tight leading (1.05), letter-spacing -0.02em.

## Spacing and shape
- Spacing scale: 8px grid. Page padding is 32px desktop and 16px mobile. Section gap is 40px. App content max-width is 1120px; tables may reach 1280px.
- Radius: card 12px, dark hero 16px, controls/inputs/buttons 8px, tables 0. Avatars alone are circular. No pill tokens.
- The page background is the canvas. Filled surfaces are allowed only for the BalanceCard hero, a Sheet/Dialog, and at most one other elevated surface per screen. Maximum three filled surfaces per screen.
- Hairlines separate sections and rows. Avoid card chrome for tables, lists, forms, and settings.

## Motion
- Hover/focus transitions use 120ms. Sheets and dialogs enter in 200ms ease-out. Only the hero balance may roll numbers; charts may draw in. Respect prefers-reduced-motion.

## Voice (microcopy)
Light Nigerian Pidgin in the app UI, e.g. "Your balance na", "Account details na", "You don save", "You don send {name} money", "Japa saving". Keep error and security messages in plain English for clarity.

## Owner rules
- Banned: `rounded-full` except avatars, `rounded-2xl`, `rounded-3xl`, uppercase or tracked labels, gradients, glows, dotted patterns, tinted banners, icon chips, status pills, the `"NGN "` prefix, duplicate titles, more than one `variant="primary"` per route, and inline-expanding or tinted rows.
- Status is colored sentence-case text with a 6px dot. The only filled surfaces in a screen are the BalanceCard hero, a Sheet/Dialog, and at most one other elevated surface.
- Money always uses the shared `formatMoney` helper: `₦` with thousands separators; credits use green `+₦`, debits use ink `-₦`.
- Card anatomy where a surface is justified: title left, quiet value or link right, hairline divider, then content. Cards use the radius token above; no default shadow on canvas sections.
- Navigation hover darkens text only. Active navigation uses muted fill only. Keep the existing navigation icons and search bar.