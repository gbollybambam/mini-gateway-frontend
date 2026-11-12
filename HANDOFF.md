# HANDOFF.md: read this FIRST in every new session

## Project
Payflow: Nigerian payment gateway. Next.js 16 App Router, TypeScript, Tailwind 4, shadcn/ui (Radix), Phosphor icons via src/components/icons.tsx. Portfolio piece for international employers. Currency: ₦ only (never "NGN 5,000.00").
Route groups: (auth), (dashboard), (public) docs, admin, pay, payment-success.
Backend contracts, auth, API calls and data flow are OFF LIMITS: presentation only.

## Branch state
- `redesign` has: tokens, restyled shadcn primitives, checkout redesign, first dashboard pass (owner REJECTED the dashboard pass: it was a recolor of the old layouts and looks busy and unprofessional).
- Work now happens on `redesign-v2`. Do not stage unrelated deletions/generated files (never `git add -A`; add files by path).

## Session start checklist (do these before anything else, report in 6 lines)
1. Run /skills and /mcp. List what is available and what failed to connect.
2. Describe /design/reference/mobile-cards.png in detail (every element, size, color). If you cannot see images, STOP and tell me to switch to a vision-capable model with /model.
3. Read DESIGN.md, COMPONENTS.md, PAGES.md, copilot-instructions.md and this file.

## Skills contract (apply on every UI task, and name the ones you used)
Installed: emil-design-eng, apple-design, animate, animation-performance, review-animations, choreograph, mobile-native, break-ui, gestures, pick-ui-library, prototype, web-design-guidelines, frontend-design, impeccable (use its commands via the SKILL and its reference files, e.g. critique, audit, polish, layout, typeset, distill; the CLI only supports `npx impeccable detect <paths>`), stageshow (landing hero demo only).
Tools: Playwright MCP for screenshots (approve its permission prompts; if it fails, say so, do not claim a visual check happened). Other MCPs per /mcp.
Honesty rule: never report a visual comparison unless you actually looked at both images. Do not self-score pass/fail; show me the images.

## Design language (the owner's standard)
Reference = crisp, calm, few elements. Quality comes from what is left out. One idea per card.
BANNED: all-caps/tracked labels; icon chips/colored icon circles; tinted banners/callouts; gradients, glows, dotted patterns; top accent bars on cards; status pills (status = plain colored text); "NGN" prefix; duplicate page titles; more than ONE primary button per screen; green AND black primary buttons together (primary = black pill); colored panels on row expand.
Card anatomy: title left, quiet value/link right, hairline divider, content. 24px radius, no border, soft shadow. Controls 14px radius with 1px --line. Dividers hairline --line. One icon style: Phosphor Regular, thin, 20px.
Nav: hover = text darkens only. Active = muted fill only. Keep current nav icons and the search bar as they are (owner likes them).
Top bar: search, notifications, profile only. The page title lives once, in the content, never also in the top bar.
Spacing: generous. 32px between sections, 20-24px card padding, content max-width 1120px centered on desktop.
Data honesty: no fabricated data. Money via the ₦ formatter, tabular numerals.

## Page layouts (less busy; restructure freely)
- Overview: H1 + one primary button. Row 1: dark BalanceCard (2/3 width) + one "Pending" card (3 label/value rows, no banner). Row 2: ONE "Summary" card with 4 stats as columns separated by hairlines (not 4 icon cards). Row 3: chart card (2/3) + "Recent activity" list (1/3) using TransactionRows. Nothing else.
- Transactions: H1 + quiet record count. One toolbar row: search + two inline filters (no caps labels, no wrapping card). Table with no card chrome: hairline rows, columns reference (mono, truncated with tooltip), customer, amount, status (colored text), date. Row click opens a right-side Sheet with settlement/metadata (no inline pink panel).
- Payment links: H1 + the ONE primary "Create link". List of rows styled like TransactionRow (name + reference left, amount right, status text under it). Detail in a Sheet (hosted URL with copy, expiry, payer). Create page: single column form max 560px, live preview card only at >=1280px, one primary button.
- Wallet: same BalanceCard as Overview. Ledger = rows with signed ₦ amount colored (green in, red out), balance-after muted. No movement pills.
- Withdrawals / API Keys / Team: same list pattern; destructive actions are quiet text buttons until confirmed.
- Webhooks / Settings: single column max 640px, sections separated by a heading + hairline, no card per field. Settings sub-navigation = simple text tabs across the top, not stacked cards.
- Mobile 390px: bottom tab bar (max 5), same cards stacked, tables become row lists.
- Auth/public/admin: same rules; auth = one centered card, one primary button.

## Current task: Prompt 5, replica gate (touch no pages)
1. Add the banned list and layouts above to DESIGN.md and copilot-instructions.md. Add a check (npm script + CI) failing on: uppercase/tracking classes, gradients, "NGN " formatting, icon-chip wrappers in app routes.
2. ₦ money formatter, used everywhere.
3. Build /dev/replica: the 8 cards from mobile-cards.png rebuilt with real components, plus an ORIGINAL subtle pattern for the dark card (own SVG, not a trace). Crop the reference into public/dev-reference/ (git-ignored, local only) so the browser can show each reference crop beside its replica at the same scale, with an overlay toggle.
4. Compare with Playwright + pixelmatch; report diff % per card; iterate until each is under 8%, and show me the screenshots.
5. Nav hover/active per rules above. Keep icons and search.
6. /dev/* must 404 in production builds. Never commit third-party reference crops. Save shots to design/shots/replica-*.png, run lint and build, commit changed files by path.
Stop after this task and wait for my review of /dev/replica.

## Next tasks (only after owner approves /dev/replica; one page per prompt, owner approves each)
Overview > Transactions > Payment links (+create) > Wallet > Withdrawals/API Keys/Team > Webhooks/Settings > mobile pass > auth/public/admin > landing page (Stageshow hero demo) > README with architecture diagram.
