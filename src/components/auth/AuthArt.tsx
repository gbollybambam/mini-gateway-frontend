"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";

export type Art3D = "card" | "shield" | "check" | "lock";
export type ArtVariant = "mint" | "orange" | "cream" | "yellow";
type Tone = "mint" | "orange" | "yellow" | "ink";
type ChipIcon = "check" | "mail" | "device" | "user" | "lock";
export type ArtChip = { icon: ChipIcon; tone: Tone; title: string; sub: string };
export type ArtProps = { variant: ArtVariant; title: string; sub: string; hero: Art3D; accent: Art3D; chips: [ArtChip, ArtChip] };

// Files live in /public/auth/3d (see README).
const SRC: Record<Art3D, string> = {
  card: "/auth/3d/credit-card.png",
  shield: "/auth/3d/shield-lock.png",
  check: "/auth/3d/check-shield.png",
  lock: "/auth/3d/lock.png",
};

const THEME: Record<ArtVariant, { bg: string; ring: string; fill: string }> = {
  mint:   { bg: "linear-gradient(155deg,#6CF0BA 0%,#46DDA0 55%,#35CC91 100%)", ring: "rgba(255,255,255,.38)", fill: "rgba(255,255,255,.12)" },
  orange: { bg: "linear-gradient(155deg,#FF9A56 0%,#F47C30 55%,#EC6A1B 100%)", ring: "rgba(255,255,255,.34)", fill: "rgba(255,255,255,.10)" },
  cream:  { bg: "linear-gradient(155deg,#FFF8EC 0%,#FAEBD3 60%,#F5DFBF 100%)", ring: "rgba(120,80,20,.14)", fill: "rgba(255,255,255,.6)" },
  yellow: { bg: "linear-gradient(155deg,#FFE680 0%,#FFD95A 55%,#FFC93C 100%)", ring: "rgba(255,255,255,.45)", fill: "rgba(255,255,255,.16)" },
};

const TONE: Record<Tone, string> = { mint: "#5BE6AE", orange: "#F47C30", yellow: "#FFD95A", ink: "#09090B" };

const css = `
@keyframes pm-enter{from{opacity:0;transform:translateY(44px) scale(.9)}to{opacity:1;transform:none}}
@keyframes pm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes pm-pop{from{opacity:0;transform:translateY(12px) scale(.94)}to{opacity:1;transform:none}}
@keyframes pm-shadow{0%,100%{transform:translateX(-50%) scale(1);opacity:.24}50%{transform:translateX(-50%) scale(.84);opacity:.15}}
.pm-par{transform:translate3d(calc(var(--mx,0)*var(--d,0)*1px),calc(var(--my,0)*var(--d,0)*1px),0);transition:transform .4s ease-out}
.pm-enter{animation:pm-enter 1s cubic-bezier(.2,.8,.2,1) both}
.pm-bob{animation:pm-bob 7s ease-in-out 1s infinite}
.pm-pop{animation:pm-pop .5s cubic-bezier(.2,.8,.2,1) both}
.pm-shadow{animation:pm-shadow 7s ease-in-out 1s infinite;transform:translateX(-50%)}
@media (hover:none){.pm-par{transform:none}}
@media (prefers-reduced-motion:reduce){.pm-par{transform:none}.pm-enter,.pm-bob,.pm-pop,.pm-shadow{animation:none}}
`;

function Par({ d, className, children }: { d: number; className?: string; children: ReactNode }) {
  return <div className={`pm-par ${className ?? ""}`} style={{ "--d": d } as CSSProperties}>{children}</div>;
}

const ICONS: Record<ChipIcon, ReactNode> = {
  check: <path d="M5 12.5 10 17l9-10" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  device: <><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18.5h2" /></>,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
};

function ChipCard({ icon, tone, title, sub }: ArtChip) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[0_20px_44px_-18px_rgba(0,0,0,.4)]">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl text-[#09090B]" style={{ background: TONE[tone] }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[icon]}</svg>
      </span>
      <span className="grid gap-0.5">
        <span className="text-[13px] font-semibold leading-none text-[#09090B]">{title}</span>
        <span className="text-[12px] leading-none text-[#71717A]">{sub}</span>
      </span>
    </div>
  );
}

export default function AuthArt({ variant, title, sub, hero, accent, chips }: ArtProps) {
  const t = THEME[variant];
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", String(((e.clientX - r.left) / r.width - 0.5) * 2));
    el.style.setProperty("--my", String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--mx", "0");
    ref.current?.style.setProperty("--my", "0");
  };

  return (
    <aside className="h-full">
      <style>{css}</style>
      <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className="relative h-[236px] rounded-[28px] sm:h-full lg:h-full lg:rounded-[32px]">
        {/* colour field and rings are clipped; objects are not, so they can overhang the edge */}
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]" style={{ background: t.bg }}>
          <div className="absolute left-1/2 top-[60%] hidden aspect-square w-[96%] -translate-x-1/2 -translate-y-1/2 lg:block">
            {[0, 13, 26].map((inset) => (
              <span key={inset} className="absolute rounded-[22%] border" style={{ inset: `${inset}%`, borderColor: t.ring, background: t.fill }} />
            ))}
          </div>
        </div>

        <div className="relative z-10 p-6 lg:p-12 xl:p-14">
          <h2 className="auth-art-copy max-w-[58%] font-[family-name:var(--font-display)] text-[24px] font-bold leading-[1.05] tracking-[-0.035em] text-[#09090B] lg:max-w-[12ch] lg:text-[clamp(38px,3.6vw,60px)] lg:leading-[1]">
            {title}
          </h2>
          <p className="auth-art-copy mt-4 hidden max-w-[34ch] text-[16px] leading-relaxed text-[#09090B]/65 lg:block">{sub}</p>
        </div>

        {/* accent object */}
        <div className="pointer-events-none absolute left-[5%] top-[46%] z-[5] hidden w-[21%] lg:block xl:left-[-2.5%]">
          <Par d={28}>
            <div className="pm-enter" style={{ animationDelay: ".15s" }}>
              <div className="pm-bob relative aspect-square" style={{ animationDelay: "-3s", rotate: "-14deg" }}>
                <Image src={SRC[accent]} alt="" fill sizes="20vw" className="object-contain [filter:drop-shadow(0_18px_22px_rgba(0,0,0,.2))]" />
              </div>
            </div>
          </Par>
        </div>

        {/* hero object */}
        <div className="pointer-events-none absolute bottom-0 right-3 z-10 w-[42%] lg:inset-x-0 lg:bottom-[5%] lg:right-auto lg:mx-auto lg:w-[min(64%,56vh)]">
          <Par d={14} className="relative">
            <div className="pm-shadow absolute bottom-[3%] left-1/2 hidden h-[7%] w-[60%] rounded-full bg-black blur-xl lg:block" />
            <div className="pm-enter">
              <div className="pm-bob relative aspect-square">
                <Image src={SRC[hero]} alt="" fill priority sizes="(min-width:1024px) 40vw, 42vw" className="object-contain [filter:drop-shadow(0_26px_28px_rgba(0,0,0,.22))]" />
              </div>
            </div>
          </Par>
        </div>

        {/* product moments */}
        {chips.map((c, i) => (
          <div key={c.title} className={`absolute z-20 hidden lg:block ${i === 0 ? "bottom-[9%] left-[5%]" : "right-[5%] top-[40%]"}`}>
            <Par d={i === 0 ? 34 : 22}>
              <div className="pm-pop" style={{ animationDelay: `${0.8 + i * 0.25}s` }}>
                <ChipCard {...c} />
              </div>
            </Par>
          </div>
        ))}
      </div>
    </aside>
  );
}