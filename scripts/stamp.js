#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Accept an optional package directory argument (relative to cwd or absolute).
// Falls back to the repo root for backwards compatibility.
const packageDir = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(__dirname, '..')
const { version } = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
const year = new Date().getFullYear()

const files = ['loadgo.js', 'dist/loadgo.min.js', 'loadgo-vanilla.js', 'dist/loadgo-vanilla.min.js']

for (const file of files) {
  const filePath = join(packageDir, file)
  if (!existsSync(filePath)) continue

  let content = readFileSync(filePath, 'utf8')
  content = content.replace(
    /LoadGo\s+v[^\s]+\s+\(https:\/\/github\.com\/franverona\/loadgo\)/,
    `LoadGo v${version} (https://github.com/franverona/loadgo)`,
  )
  content = content.replace(/\d{4}\s+-\s+Fran Verona/, `${year} - Fran Verona`)
  writeFileSync(filePath, content, 'utf8')
  console.log(`Stamped ${file}`)
}
