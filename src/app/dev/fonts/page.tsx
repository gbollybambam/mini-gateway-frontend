import { Figtree, Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google"

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap" })
const figtree = Figtree({ subsets: ["latin"], display: "swap" })
const manrope = Manrope({ subsets: ["latin"], display: "swap" })
const inter = Inter({ subsets: ["latin"], display: "swap" })

const samples = [
  ["Plus Jakarta Sans", plusJakarta.className],
  ["Figtree", figtree.className],
  ["Manrope", manrope.className],
  ["Inter", inter.className],
] as const

export default function FontsPage() {
  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-brand-500">Font check</p>
          <h1 className="text-4xl font-bold tracking-[-0.03em]">One voice for the wallet</h1>
          <p className="max-w-2xl text-ink-muted">Compare the candidate families against the two product phrases used in the mobile reference.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {samples.map(([name, className]) => (
            <section key={name} className="rounded-card bg-surface p-6 shadow-card" aria-labelledby={`${name}-heading`}>
              <h2 id={`${name}-heading`} className="text-sm font-semibold text-ink-muted">{name}</h2>
              <p className={`${className} mt-6 text-3xl font-bold tracking-[-0.03em]`}>Your balance na ₦2,480.00</p>
              <p className={`${className} mt-4 text-base text-ink-muted`}>Account details na</p>
            </section>
          ))}
        </div>
        <aside className="rounded-card bg-brand-900 p-6 text-surface">
          <h2 className="text-sm font-semibold text-surface/70">Reference crop</h2>
          <p className="mt-2 text-sm leading-6 text-surface/80">The local reference image is gitignored and is not available to the browser in this checkout. Plus Jakarta Sans remains selected because it is already loaded globally and best matches the rounded, compact fintech lettering.</p>
        </aside>
      </div>
    </main>
  )
}
