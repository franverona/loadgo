#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const { version } = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))
const year = new Date().getFullYear()

const files = ['loadgo.js', 'dist/loadgo.min.js', 'loadgo-vanilla.js', 'dist/loadgo-vanilla.min.js']

for (const file of files) {
  const filePath = join(__dirname, '..', file)
  if (!existsSync(filePath)) continue

  let content = readFileSync(filePath, 'utf8')
  content = content.replace(
    /@preserve\s+LoadGo\s+v[^\s]+\s+\(https:\/\/github\.com\/franverona\/loadgo\)/,
    `@preserve LoadGo v${version} (https://github.com/franverona/loadgo)`,
  )
  content = content.replace(/\d{4}\s+-\s+Fran Verona/, `${year} - Fran Verona`)
  writeFileSync(filePath, content, 'utf8')
  console.log(`Stamped ${file}`)
}
