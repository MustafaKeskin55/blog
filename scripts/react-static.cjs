#!/usr/bin/env node

const { execSync } = require('node:child_process')
const path = require('node:path')

const [command] = process.argv.slice(2)
const root = path.join(__dirname, '..')

if (command === 'build') {
  execSync('npx vite build', { stdio: 'inherit', shell: true, cwd: root })
  process.exit(0)
}

console.error(`Unknown react-static command: ${command || '(none)'}`)
process.exit(1)
