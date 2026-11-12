const nairaFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const wholeNairaFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 0,
})

export function formatMoney(
  value: number | string | null | undefined,
  options: { decimals?: 0 | 2; signed?: boolean } = {},
) {
  const amount = Number(value) || 0
  const decimals = options.decimals ?? 2
  const formatted = decimals === 0
    ? wholeNairaFormatter.format(Math.abs(amount))
    : nairaFormatter.format(Math.abs(amount))

  if (!options.signed) return `₦${formatted}`
  if (amount > 0) return `+₦${formatted}`
  if (amount < 0) return `-₦${formatted}`
  return `₦${formatted}`
}
