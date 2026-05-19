const fs = require('node:fs')
const path = require('node:path')

const root = path.join(__dirname, '..')
const binDir = path.join(root, 'node_modules', '.bin')
const source = path.join(__dirname, 'react-static.cjs')
const target = path.join(binDir, 'react-static')

fs.mkdirSync(binDir, { recursive: true })

const launcher = `#!/usr/bin/env node
require(${JSON.stringify(source)});
`

fs.writeFileSync(target, launcher)
fs.chmodSync(target, 0o755)
