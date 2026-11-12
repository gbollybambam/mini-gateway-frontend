import {
  Badge,
  StatusBadge,
} from "@/components/ui/badge"
import {
  Button,
} from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const colors = [
  ["bg", "bg-bg"],
  ["surface", "bg-surface"],
  ["surface-muted", "bg-surface-muted"],
  ["ink", "bg-ink"],
  ["ink-muted", "bg-ink-muted"],
  ["line", "bg-line"],
  ["track", "bg-track"],
  ["brand-900", "bg-brand-900"],
  ["brand-800", "bg-brand-800"],
  ["brand-500", "bg-brand-500"],
  ["success", "bg-success"],
  ["success-tint", "bg-success-tint"],
  ["danger", "bg-danger"],
  ["danger-tint", "bg-danger-tint"],
  ["pending", "bg-pending"],
  ["cat-food", "bg-cat-food"],
  ["cat-tfare", "bg-cat-tfare"],
  ["cat-data", "bg-cat-data"],
  ["cat-transfer", "bg-cat-transfer"],
] as const

function TokenLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-semibold tracking-wide text-ink-muted">{children}</span>
}

export default function TokensPage() {
  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px] space-y-12">
        <header className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-500">Payflow design system</p>
          <h1 className="text-4xl font-bold tracking-[-0.03em] sm:text-5xl">Tokens and shared primitives</h1>
          <p className="max-w-2xl text-base leading-7 text-ink-muted">
            The green fintech foundation for wallet tasks, merchant operations, and payment flows.
          </p>
        </header>

        <section className="space-y-5" aria-labelledby="colors-heading">
          <div>
            <h2 id="colors-heading" className="text-2xl font-semibold">Color tokens</h2>
            <p className="mt-1 text-sm text-ink-muted">Every swatch is backed by a DESIGN.md variable.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {colors.map(([name, color]) => (
              <div key={name} className="overflow-hidden rounded-card bg-surface shadow-card">
                <div className={`h-20 ${color}`} />
                <div className="p-3">
                  <TokenLabel>--{name}</TokenLabel>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]" aria-labelledby="type-heading">
          <Card>
            <CardHeader>
              <CardTitle id="type-heading">Type scale</CardTitle>
              <TokenLabel>Plus Jakarta Sans</TokenLabel>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <TokenLabel>Balance amount · 40 / 700</TokenLabel>
                <p className="mt-1 text-[40px] font-bold leading-none tracking-[-0.03em]">₦2,480.00</p>
              </div>
              <div>
                <TokenLabel>Section title · 20 / 600</TokenLabel>
                <p className="mt-1 text-xl font-semibold">Your balance na</p>
              </div>
              <div>
                <TokenLabel>Body · 16 / 400</TokenLabel>
                <p className="mt-1 text-base leading-7">Move money with clarity and confidence.</p>
              </div>
              <div>
                <TokenLabel>Label · 14 / 400</TokenLabel>
                <p className="mt-1 text-sm text-ink-muted">Account details na</p>
              </div>
              <div>
                <TokenLabel>Micro · 12 / 400</TokenLabel>
                <p className="mt-1 text-xs text-ink-muted">27th Jan, 2025. | 7:18PM</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shape and depth</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="rounded-card bg-surface-muted p-4">
                <TokenLabel>Card · 24px</TokenLabel>
                <div className="mt-4 h-16 rounded-card bg-surface shadow-card" />
              </div>
              <div className="rounded-input bg-surface-muted p-4">
                <TokenLabel>Input · 14px</TokenLabel>
                <div className="mt-4 h-16 rounded-input bg-surface shadow-card" />
              </div>
              <div className="col-span-2 rounded-pill bg-brand-900 p-4 text-surface">
                <TokenLabel>Pill · 999px</TokenLabel>
                <div className="mt-4 h-8 rounded-pill bg-brand-500" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5" aria-labelledby="primitives-heading">
          <div>
            <h2 id="primitives-heading" className="text-2xl font-semibold">Shared primitives</h2>
            <p className="mt-1 text-sm text-ink-muted">States shown here are the contract pages can safely reuse.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Button</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary" arrow={false}>Secondary</Button>
                <Button variant="ghost-link" arrow={false}>See details</Button>
                <Button variant="destructive" arrow={false}>Delete</Button>
                <Button disabled arrow={false}>Disabled</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Input</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <Input aria-label="Account name" placeholder="Account name" />
                <Input aria-label="Disabled account name" placeholder="Disabled input" disabled />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Badge and status</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3">
                <Badge>Default</Badge>
                <StatusBadge status="success" />
                <StatusBadge status="pending" />
                <StatusBadge status="failed" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Dialog</CardTitle></CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger className="rounded-pill bg-ink px-5 py-3 text-sm font-semibold text-surface transition hover:bg-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    Open dialog
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm transfer</DialogTitle>
                      <DialogDescription>Review the amount before you send it.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="secondary" arrow={false}>Cancel</Button>
                      <Button variant="primary">Send money</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Table</CardTitle><StatusBadge status="success" /></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold">Wallet top up</TableCell>
                    <TableCell>₦12,400.00</TableCell>
                    <TableCell><StatusBadge status="success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Merchant payout</TableCell>
                    <TableCell>₦7,000.00</TableCell>
                    <TableCell><StatusBadge status="pending" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
