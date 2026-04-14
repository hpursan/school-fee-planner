import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const svgPath = join(__dirname, 'og-image.svg')
const outPath = join(__dirname, '..', 'public', 'og-image.png')

const svg = readFileSync(svgPath, 'utf-8')

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
})

const pngData = resvg.render()
const pngBuffer = pngData.asPng()

writeFileSync(outPath, pngBuffer)
console.log(`✅ og:image generated → public/og-image.png (${(pngBuffer.length / 1024).toFixed(1)} KB)`)
