import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"

const root = join(process.cwd(), "src", "app")
const failures = []

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await walk(path)
    else if (/\.(css|ts|tsx)$/.test(entry.name) && entry.name !== "globals.css") {
      const source = await readFile(path, "utf8")
      if (/\baccent-(?:mint|orange|yellow|cream)\b/.test(source)) failures.push(relative(process.cwd(), path))
    }
  }
}

await walk(root)
if (failures.length) {
  console.error(`Marketing accent tokens referenced by app routes:\n${failures.join("\n")}`)
  process.exit(1)
}
console.log("App palette check passed.")
