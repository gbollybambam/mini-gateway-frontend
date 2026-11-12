# Copilot instructions (save as .github/copilot-instructions.md)

Read HANDOFF.md first in every session.
 
## Frontend rules
- Before any UI work, read /design/DESIGN.md, /design/COMPONENTS.md and /design/PAGES.md, then look at the matching image in /design/reference.
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + @phosphor-icons/react icons. Map every token in DESIGN.md to a CSS variable and a Tailwind theme key. Never hardcode hex values, font sizes or radii in components.
- Before any UI task, read and apply the emil-design-eng, apple-design, web-design-guidelines, frontend-design, and impeccable skills.
- Reuse shared components from /components/ui. Do not create one-off styled elements when a shared component exists. If a needed component is missing, add it to the design system first, then use it.
- Mobile-first. Test at 390px and 1440px.
- Accessibility: semantic HTML, labeled icon buttons, visible focus, AA contrast.
- Owner bans: no `rounded-full` except avatars, `rounded-2xl`/`rounded-3xl`, uppercase/tracked labels, gradients/glows/dotted patterns, tinted banners, icon chips, status pills, `"NGN "` prefixes, duplicate titles, more than one `variant="primary"` per route, or inline-expanding/tinted rows.
- Surface hierarchy: the page background is the canvas. Filled surfaces are limited to the BalanceCard hero, a Sheet/Dialog, and at most one other elevated surface per screen; maximum three. Tables, lists, forms, and settings sit directly on the page.
- Radii: card 12px, dark hero 16px, controls/inputs/buttons 8px, tables 0. No pill tokens. Status is colored sentence-case text with a 6px dot.
- Type: Plus Jakarta Sans, exactly 12/14/16/20/28px plus 40px hero balance, weights 400/500/600, tabular numerals, no tracking.
- Card anatomy where applicable: title left, quiet value or link right, hairline divider, content. Use the shared `formatMoney` helper for all money.
## Verification loop (mandatory for every UI task)
1. Run the dev server.
2. Use the Playwright MCP to screenshot the page at 390px and 1440px.
3. Compare to the reference image. List every difference (spacing, font size/weight, color, radius, shadow, alignment, icon style, copy).
4. Fix all differences and repeat until none remain. Then report what you compared and the remaining known gaps honestly.
## Working style
- One section or component per task. Do not rebuild whole pages in one pass.
- Check library APIs with the Context7 MCP before using them.
- Do not copy brand names, logos, illustrations or personal names from reference images. Use this project's own.
.
 
