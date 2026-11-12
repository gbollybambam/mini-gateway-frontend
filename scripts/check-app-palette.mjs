import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"

const root = join(process.cwd(), "src", "app", "dev", "replica")
const failures = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (/\.(css|ts|tsx)$/.test(entry.name) && entry.name !== "globals.css") {
      const source = await readFile(path, "utf8")
      const rules = [
        [/\baccent-(?:mint|orange|yellow|cream)\b/, "marketing accent token"],
        [/\b(?:uppercase|tracking-(?:wide|wider|widest)|tracking-\[[^\]]+\])\b/, "uppercase or tracked label class"],
        [/\b(?:bg|from|via|to)-[^\s"'`]*gradient\b|\bgradient-/, "gradient"],
        [/\bNGN\s/, '"NGN " prefix'],
        [/rounded-full[\s\S]{0,80}bg-(?:success|danger|pending)-tint/, "icon-chip or tinted circle"],
      ]
      const matched = rules.filter(([pattern, label]) => {
        if (label === "icon-chip or tinted circle" && /(?:TransactionRow|NotificationCard|ReplicaTransactionCard|ReplicaNotificationCard)/.test(entry.name)) return false
        return pattern.test(source)
      }).map(([, label]) => label)
      if (matched.length) failures.push(`${relative(process.cwd(), path)} (${matched.join(", ")})`)
    }
  }
}

await walk(root)
if (failures.length) {
  console.error(`Marketing accent tokens referenced by app routes:\n${failures.join("\n")}`)
  process.exit(1)
}
console.log("App palette check passed.")
