import { readFile, writeFile } from "node:fs/promises"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"

const ids = ["balance", "goal", "savings", "limit", "spending", "notification", "success", "pending"]

function readPng(path) {
  return new Promise((resolve, reject) => {
    readFile(path).then((buffer) => resolve(PNG.sync.read(buffer))).catch(reject)
  })
}

function resize(source, width, height) {
  const output = new PNG({ width, height })
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = Math.min(source.width - 1, Math.floor((x * source.width) / width))
      const sourceY = Math.min(source.height - 1, Math.floor((y * source.height) / height))
      const sourceIndex = (sourceY * source.width + sourceX) * 4
      const outputIndex = (y * width + x) * 4
      output.data[outputIndex] = source.data[sourceIndex]
      output.data[outputIndex + 1] = source.data[sourceIndex + 1]
      output.data[outputIndex + 2] = source.data[sourceIndex + 2]
      output.data[outputIndex + 3] = source.data[sourceIndex + 3]
    }
  }
  return output
}

for (const id of ids) {
  const actual = await readPng(`design/shots/replica-card-${id}-1440.png`)
  const reference = resize(await readPng(`public/dev-reference/${id}.png`), actual.width, actual.height)
  const diff = new PNG({ width: actual.width, height: actual.height })
  const mismatched = pixelmatch(reference.data, actual.data, diff.data, actual.width, actual.height, {
    includeAA: false,
    threshold: 0.4,
  })
  await writeFile(`design/shots/replica-diff-${id}.png`, PNG.sync.write(diff))
  console.log(`${id}: ${((mismatched / (actual.width * actual.height)) * 100).toFixed(2)}%`)
}
