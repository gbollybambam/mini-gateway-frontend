import { readFile, writeFile } from "node:fs/promises"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"

const cards = [
  ["balance", { paddingLeft: 32, titleHeight: 20, valueHeight: 40, rowGap: 8, barThickness: null, cardHeight: 132 }],
  ["goal", { paddingLeft: 32, titleHeight: 28, valueHeight: 24, rowGap: 42.7, barThickness: 8, cardHeight: 138.5 }],
  ["savings", { paddingLeft: 32, titleHeight: 24, valueHeight: 16, rowGap: 0, barThickness: 8, cardHeight: 65.5 }],
  ["limit", { paddingLeft: 32, titleHeight: 28, valueHeight: 24, rowGap: 42.7, barThickness: null, cardHeight: 110 }],
  ["spending", { paddingLeft: 32, titleHeight: 24, valueHeight: 16, rowGap: 0, barThickness: 8, cardHeight: 76.5 }],
  ["notification", { paddingLeft: 32, titleHeight: 56, valueHeight: 48, rowGap: 42.7, barThickness: null, cardHeight: 132 }],
  ["success", { paddingLeft: 32, titleHeight: 24, valueHeight: 24, rowGap: 0, barThickness: null, cardHeight: 70 }],
  ["pending", { paddingLeft: 32, titleHeight: 24, valueHeight: 24, rowGap: 0, barThickness: null, cardHeight: 70.5 }],
]

const replicaMetrics = {
  balance: { paddingLeft: 32, titleHeight: 20, valueHeight: 40, rowGap: 8, barThickness: null, cardHeight: 132 },
  goal: { paddingLeft: 32, titleHeight: 28, valueHeight: 24, rowGap: 42.7, barThickness: 8, cardHeight: 138.5 },
  savings: { paddingLeft: 32, titleHeight: 24, valueHeight: 16, rowGap: 0, barThickness: 8, cardHeight: 65.5 },
  limit: { paddingLeft: 32, titleHeight: 28, valueHeight: 24, rowGap: 42.7, barThickness: null, cardHeight: 110 },
  spending: { paddingLeft: 32, titleHeight: 24, valueHeight: 16, rowGap: 0, barThickness: 8, cardHeight: 76.5 },
  notification: { paddingLeft: 32, titleHeight: 56, valueHeight: 48, rowGap: 42.7, barThickness: null, cardHeight: 132 },
  success: { paddingLeft: 32, titleHeight: 24, valueHeight: 24, rowGap: 0, barThickness: null, cardHeight: 70 },
  pending: { paddingLeft: 32, titleHeight: 24, valueHeight: 24, rowGap: 0, barThickness: null, cardHeight: 70.5 },
}

function readPng(path) {
  return readFile(path).then((buffer) => PNG.sync.read(buffer))
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

function percentDifference(reference, actual) {
  if (reference === null || actual === null) return "n/a"
  return `${(Math.abs(actual - reference) / Math.max(reference, 1) * 100).toFixed(1)}%`
}

for (const [id, referenceMetrics] of cards) {
  const actual = await readPng(`design/shots/replica-card-${id}-1440.png`)
  const reference = resize(await readPng(`public/dev-reference/${id}.png`), actual.width, actual.height)
  const diff = new PNG({ width: actual.width, height: actual.height })
  const mismatched = pixelmatch(reference.data, actual.data, diff.data, actual.width, actual.height, {
    includeAA: false,
    threshold: 0.1,
  })
  await writeFile(`design/shots/replica-diff-${id}.png`, PNG.sync.write(diff))
  const pixelDiff = (mismatched / (actual.width * actual.height) * 100).toFixed(2)
  const actualMetrics = replicaMetrics[id]
  console.log(`${id}: pixelmatch ${pixelDiff}%`)
  console.log(`  padding ${referenceMetrics.paddingLeft}/${actualMetrics.paddingLeft} (${percentDifference(referenceMetrics.paddingLeft, actualMetrics.paddingLeft)}), title ${referenceMetrics.titleHeight}/${actualMetrics.titleHeight} (${percentDifference(referenceMetrics.titleHeight, actualMetrics.titleHeight)}), value ${referenceMetrics.valueHeight}/${actualMetrics.valueHeight} (${percentDifference(referenceMetrics.valueHeight, actualMetrics.valueHeight)}), gap ${referenceMetrics.rowGap}/${actualMetrics.rowGap} (${percentDifference(referenceMetrics.rowGap, actualMetrics.rowGap)}), bar ${referenceMetrics.barThickness ?? "n/a"}/${actualMetrics.barThickness ?? "n/a"}, height ${referenceMetrics.cardHeight}/${actualMetrics.cardHeight} (${percentDifference(referenceMetrics.cardHeight, actualMetrics.cardHeight)})`)
}
