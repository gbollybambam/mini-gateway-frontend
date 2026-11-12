# Copilot instructions (save as .github/copilot-instructions.md)
 
## Frontend rules
- Before any UI work, read /design/DESIGN.md, /design/COMPONENTS.md and /design/PAGES.md, then look at the matching image in /design/reference.
- Stack: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + @phosphor-icons/react icons. Map every token in DESIGN.md to a CSS variable and a Tailwind theme key. Never hardcode hex values, font sizes or radii in components.
- Before any UI task, read and apply the emil-design-eng, apple-design, web-design-guidelines, frontend-design, and impeccable skills.
- Reuse shared components from /components/ui. Do not create one-off styled elements when a shared component exists. If a needed component is missing, add it to the design system first, then use it.
- Mobile-first. Test at 390px and 1440px.
- Accessibility: semantic HTML, labeled icon buttons, visible focus, AA contrast.
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
 
