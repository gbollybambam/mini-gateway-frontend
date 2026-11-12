# COMPONENTS.md: Shared component specs

Rule: both the app and the landing page import from the same components and tokens in DESIGN.md. App components prefer the page canvas, hairlines, and shared rows over filled cards.

1. **Button**: `primary` is black with white text, `secondary` is an outline, and `ghost-link` is text-only. All use 8px radius, no pill treatment, one primary per route.
2. **Section**: canvas section with a 14px/600 title, hairline below, and content below. Do not wrap tables, lists, forms, or settings in a filled card.
3. **BalanceCard (hero)**: the one dark elevated surface permitted for Overview and Wallet. It uses 16px radius, a subtle original pattern, 40px balance text, eye toggle, and copy account action.
4. **ProgressBar**: 8px high, rounded, track --track, fill --brand-500, animated width. Variant `segmented` for Spending tracker: segments colored by --cat-* tokens with a dot legend beneath.
5. **TrackerCard** (Savings tracker, Spending tracker): title left, "You don save: ₦7,000" (amount in --brand-500) or "You don spend: ₦12,400" (amount in --danger) right, ProgressBar under.
6. **GoalCard** (Japa saving): title with chevron, divider, "Saved: ₦1,200,400" left and "47% completed" right (--brand-500), ProgressBar, italic muted encouragement text, gold medal icon bottom right.
7. **LimitCard** (Daily limit): title left, "Edit" link right, divider, rows of label (muted) and value (bold) such as Transfer limit ₦30,000, Bill payment limit ₦10,000.
8. **TransactionRow**: plain row with customer/reference left, amount right, and status text with a 6px dot. No tinted icon circles.
9. **KeyValueList**: label/value rows separated by hairlines for pending clearance, settlement, and metadata.
10. **StatusText**: colored sentence-case text plus a 6px dot; never a pill.
11. **Dashboard shell (desktop)**: sidebar with grouped nav items, top bar with search/notifications/profile only, and a canvas-first content area. On mobile, use the bottom tab bar and 44px targets.
12. **Landing components** (marketing only): Navbar (logo, links, black pill CTA), Hero (eyebrow pill, big H1, subtext, black pill CTA, floating sticker pills), FeatureTile (colored tile + black label bar with arrow), TrustStrip (slightly rotated gray band with 4 icons + stats), AlternatingFeatureSection (text + 3D illustration, 2 sub-features with icon chips), CTA cards (cream + mint), ResourceCard grid, Footer with giant wordmark.

## Accessibility
Contrast AA minimum; all icon buttons have aria-labels; the balance hide toggle is announced; status is never conveyed by color alone (include the text).