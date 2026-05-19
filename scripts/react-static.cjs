#!/usr/bin/env node

const { execSync } = require('node:child_process')

const [command] = process.argv.slice(2)

if (command === 'build') {
  execSync('vite build', { stdio: 'inherit', shell: true })
  process.exit(0)
}

console.error(`Unknown react-static command: ${command || '(none)'}`)
process.exit(1)
