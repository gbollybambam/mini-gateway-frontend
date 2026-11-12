# PAGES.md: Page map (page -> reference image -> components)

Put the reference images in /design/reference with these names. Crop big screenshots into one file per section before giving them to the AI.

| Page | Reference images | Components |
|---|---|---|
| Home / Wallet (mobile-first) | mobile-cards.png | BalanceCard, TrackerCard x2, NotificationCard, TransactionRow list |
| Savings / Japa saving | mobile-cards.png (Japa saving card), group-saving.png | GoalCard, ProgressBar, saving plan card (Frequency / Amount / Next due + Auto-save toggle), savings area chart with "See leaderboard" link |
| Group saving (e.g. "December party") | group-saving.png | Header with back arrow + emoji avatar, total amount, GoalCard, Saving plan card, Savings chart card (smooth green area line with a tooltip bubble, Monthly dropdown) |
| Limits / Settings | mobile-cards.png | LimitCard |
| Overview | dashboard-full.png, dashboard-sidebar.png, dashboard-table.png | Canvas-first Overview: BalanceCard hero, four inline stats, chart section, recent activity rows, and pending clearance key/value list. |
| Transactions | dashboard-table.png | Sortable table + StatusBadge + TransactionRow on mobile |
| Landing / Campaign | landing-hero.png, landing-features.png, landing-footer.png | All "Landing components". Green is primary, orange/yellow/cream are accents only. 3D illustrations must be original assets (generate your own or use licensed ones). Do not reuse the reference illustrations. |

## Consistency rules
1. The landing page and the app import the same Button, Section, StatusText, and BalanceCard primitives. Only layout differs.
2. Mobile (390px) and desktop (1440px) must both match the reference for every page that has one.
3. Copy: Pidgin microcopy in the in-app UI, plain English on the landing page and in error/security text.
4. Brand name, logo, and placeholder names must be this project's own, not the reference designers' or companies' names. Replace "Fincai", "PayFlow", and personal names in the mockups with this project's brand and fictional demo users.