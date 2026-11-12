# DESIGN.md: Design tokens (source of truth)

Brand direction: Naija-first green fintech. Mobile-first app UI (dark green hero card, soft white cards, green progress bars, Pidgin microcopy). The marketing/campaign page uses the same green as primary, with PayFlow-style orange/yellow as accents only. Colors below are eyeballed from the reference images. Verify each with an eyedropper on the originals in /design/reference and correct them here. Never hardcode a color anywhere else.

## Colors
| Token | Hex | Use |
|---|---|---|
| --bg | #FAFAFA | App background |
| --surface | #FFFFFF | Cards |
| --surface-muted | #F2F1EF | Landing section bands |
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
- Font: Plus Jakarta Sans (fallback Inter, system-ui). Verify against the reference; swap the single token if wrong.
- Balance amount: 40px / 700. Section title: 20px / 600. Body: 16px / 400. Label/caption: 14px / 400. Micro (legend, timestamps): 12-13px.
- Currency: always ₦ (Naira sign), thousands separators, 2 decimals on balances (₦2,480.00).
- Landing hero H1: 64-72px / 700, tight leading (1.05), letter-spacing -0.02em.

## Spacing and shape
- Spacing scale (px): 4, 8, 12, 16, 20, 24, 32, 48, 64, 96.
- Card padding: 20-24px. Gap between cards: 16px (mobile), 24px (desktop).
- Radius: card 24px, hero card 24px, input 14px, pill/button 999px, icon circle 50%.
- Shadow: soft, e.g. `0 4px 24px rgba(0,0,0,0.06)`. No hard borders on app cards.
- Landing tiles: radius 28px.

## Motion
- 150-200ms ease-out for hover/press. Progress bars animate width on mount (600ms). Respect prefers-reduced-motion.

## Voice (microcopy)
Light Nigerian Pidgin in the app UI, e.g. "Your balance na", "Account details na", "You don save", "You don send {name} money", "Japa saving". Keep error and security messages in plain English for clarity.

## Owner rules
- Banned: uppercase or tracked labels, icon chips or tinted circles, tinted banners, gradients, glows, dotted patterns, top accent bars, status pills, the `"NGN "` prefix, duplicate titles, more than one primary button per screen, and inline-expanding or tinted rows.
- Money always uses the shared `formatMoney` helper: `₦` with thousands separators; credits use green `+₦`, debits use ink `-₦`.
- Card anatomy: title left, quiet value or link right, hairline divider, then content. Cards have 24px radius, no border, and a soft shadow.
- Navigation hover darkens text only. Active navigation uses muted fill only. Keep the existing navigation icons and search bar.