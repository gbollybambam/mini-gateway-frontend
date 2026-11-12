# COMPONENTS.md: Shared component specs

Rule: both the app and the landing page import from the same components and tokens in DESIGN.md. Build these first, in this order, each with a Storybook-style preview page at /dev/components.

1. **Button**: variants: `primary` (black pill, white text, trailing arrow icon, height 48px, padding 0 24px), `secondary` (white pill, 1px --line border), `ghost-link` (--brand-500 text, e.g. "Edit", "See details >"). Hover: slight lift. Focus: 2px visible ring.
2. **Card**: white surface, radius 24px, soft shadow, padding 20-24px. Optional header row with title (20px/600) and right slot, separated by a 1px --line divider.
3. **BalanceCard (hero)**: --brand-900 background with a subtle swirl pattern overlay in --brand-800. Top: label "Your balance na" (muted light), amount ₦2,480.00 (40px/700 white), eye-off icon top right toggles hide (show ••••). Bottom: "Account details na", then "Name (account number)" with a copy icon button (copies number, shows "Copied" toast).
4. **ProgressBar**: 8px high, rounded, track --track, fill --brand-500, animated width. Variant `segmented` for Spending tracker: segments colored by --cat-* tokens with a dot legend beneath.
5. **TrackerCard** (Savings tracker, Spending tracker): title left, "You don save: ₦7,000" (amount in --brand-500) or "You don spend: ₦12,400" (amount in --danger) right, ProgressBar under.
6. **GoalCard** (Japa saving): title with chevron, divider, "Saved: ₦1,200,400" left and "47% completed" right (--brand-500), ProgressBar, italic muted encouragement text, gold medal icon bottom right.
7. **LimitCard** (Daily limit): title left, "Edit" link right, divider, rows of label (muted) and value (bold) such as Transfer limit ₦30,000, Bill payment limit ₦10,000.
8. **TransactionRow**: circular icon (success tint or danger tint with arrow icon), name (18px/500), date line "27th Jan, 2025. | 7:18PM" (muted), amount right (bold), status below amount: Successful (--success), Pending (--pending), Failed (--danger).
9. **NotificationCard**: small icon chip + headline "You don send {name} money.", divider, body text, footer with timestamp left and "See details >" link right.
10. **StatusBadge**: pill, tinted background + matching text color (success/pending/failed).
11. **Dashboard shell (desktop)**: left sidebar with grouped nav items (icon + label, active item has muted fill only), top bar with search ("What do you want to do today?" with ⌘K hint), KPI card row (4 cards), chart card with Line/Bar toggle (highlighted bar uses --brand-500, others --track), sortable data table with StatusBadge and a "..." actions menu. On mobile: sidebar becomes a bottom tab bar.
12. **Landing components** (marketing only): Navbar (logo, links, black pill CTA), Hero (eyebrow pill, big H1, subtext, black pill CTA, floating sticker pills), FeatureTile (colored tile + black label bar with arrow), TrustStrip (slightly rotated gray band with 4 icons + stats), AlternatingFeatureSection (text + 3D illustration, 2 sub-features with icon chips), CTA cards (cream + mint), ResourceCard grid, Footer with giant wordmark.

## Accessibility
Contrast AA minimum; all icon buttons have aria-labels; the balance hide toggle is announced; status is never conveyed by color alone (include the text).