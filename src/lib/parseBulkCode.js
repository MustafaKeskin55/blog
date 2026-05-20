/** @returns {'html'|'react'|'python'} */
export function detectCodeMode(js, html = '') {
  const code = `${js}\n${html}`
  if (looksLikePython(js) && !/<[A-Z][a-zA-Z]*[\s/>]/.test(js)) return 'python'
  if (
    /from\s+['"]react|import\s+React|ReactDOM\.|createRoot\s*\(|useState\s*\(|useEffect\s*\(/i.test(code) ||
    /type\s*=\s*["']text\/babel/i.test(code) ||
    /<[A-Z][a-zA-Z][\w.-]*[\s/>]/.test(js)
  ) {
    return 'react'
  }
  return 'html'
}

function looksLikePython(code) {
  if (!code?.trim()) return false
  return /^\s*(print\s*\(|def\s+\w|import\s+\w|from\s+\w+\s+import|for\s+\w|while\s+|class\s+\w|if\s+.+:)/m.test(code)
}

/** import satırlarından react dışı paketleri çıkar */
export function extractDepsFromJs(js) {
  if (!js?.trim()) return ''
  const deps = new Set()
  for (const m of js.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const spec = m[1]
    const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]
    if (pkg && pkg !== 'react' && pkg !== 'react-dom') deps.add(pkg)
  }
  return [...deps].join(', ')
}

/**
 * Toplu yapıştırılan kodu HTML / CSS / JS / Python + mod olarak ayırır.
 * @returns {{ html: string, css: string, js: string, py: string, mode: 'html'|'react'|'python', deps: string, react: boolean, python: boolean }}
 */
export function parseBulkCode(raw) {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { html: '', css: '', js: '', py: '', mode: 'html', deps: '', react: false, python: false }
  }

  // --- Sadece Python (HTML etiketi yok) ---
  const hasHtmlTags = /<(?:html|head|body|div|style|script|!DOCTYPE)/i.test(trimmed)
  if (!hasHtmlTags && looksLikePython(trimmed)) {
    return {
      html: '',
      css: '',
      js: '',
      py: trimmed,
      mode: 'python',
      deps: '',
      react: false,
      python: true,
    }
  }

  let html = trimmed
  let css = ''
  let js = ''
  let py = ''

  // --- <style> blokları (hepsi) ---
  const cssParts = []
  for (const m of trimmed.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    cssParts.push(m[1].trim())
    html = html.replace(m[0], '')
  }
  css = cssParts.join('\n\n')

  // --- Python script ---
  const pyScript = trimmed.match(/<script[^>]*type\s*=\s*["']text\/python["'][^>]*>([\s\S]*?)<\/script>/i)
  if (pyScript) {
    py = pyScript[1].trim()
    html = html.replace(pyScript[0], '')
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
    if (bodyMatch) html = bodyMatch[1].trim()
    else html = html.replace(/<\/?(html|head|body|meta|title|link|!DOCTYPE)[^>]*>/gi, '').trim()
    return {
      html,
      css,
      js: '',
      py,
      mode: 'python',
      deps: '',
      react: false,
      python: true,
    }
  }

  // --- Script: önce text/babel (React), sonra diğer inline ---
  const babelScript = trimmed.match(/<script[^>]*type\s*=\s*["']text\/babel[^"']*["'][^>]*>([\s\S]*?)<\/script>/i)
  const inlineScripts = [...trimmed.matchAll(/<script(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)]

  if (babelScript) {
    js = babelScript[1].trim()
    html = html.replace(babelScript[0], '')
  } else if (inlineScripts.length > 0) {
    js = inlineScripts.map(m => m[1].trim()).join('\n\n')
    for (const m of inlineScripts) html = html.replace(m[0], '')
  }

  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) html = bodyMatch[1].trim()
  else html = html.replace(/<\/?(html|head|body|meta|title|link|!DOCTYPE)[^>]*>/gi, '').trim()

  const mode = detectCodeMode(js, html)
  const deps = mode === 'react' ? extractDepsFromJs(js) : ''

  if (mode === 'python' && looksLikePython(js)) {
    py = js
    js = ''
  }

  return {
    html,
    css,
    js,
    py,
    mode,
    deps,
    react: mode === 'react',
    python: mode === 'python',
  }
}
