const PKG_RE = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(\/[a-z0-9][\w.-]*)?$/i

const CORE_IMPORTS = {
  react: 'https://esm.sh/react@18.3.1?dev',
  'react-dom': 'https://esm.sh/react-dom@18.3.1?dev',
  'react-dom/client': 'https://esm.sh/react-dom@18.3.1/client?dev',
  'react/jsx-runtime': 'https://esm.sh/react@18.3.1/jsx-runtime?dev',
}

export function parseDeps(input) {
  if (!input?.trim()) return []
  return [...new Set(
    input.split(',').map(s => s.trim()).filter(Boolean).filter(p => PKG_RE.test(p))
  )]
}

function escapeStyle(css) {
  return css.replace(/<\/style/gi, '<\\/style')
}

function escapeScript(code) {
  return code.replace(/<\/script/gi, '<\\/script')
}

function buildImportMap(extraDeps) {
  const imports = { ...CORE_IMPORTS }
  for (const pkg of extraDeps) {
    if (!imports[pkg]) imports[pkg] = `https://esm.sh/${pkg}?dev`
  }
  return JSON.stringify({ imports }, null, 2)
}

const ERROR_BOOT = `
<div id="__preview-error" style="display:none;font:12px/1.45 monospace;color:#ffb4b4;background:#1a0808;padding:10px 12px;border-top:1px solid #ff5f57;white-space:pre-wrap;max-height:40vh;overflow:auto;"></div>
<script>
window.addEventListener('error',function(e){
  var el=document.getElementById('__preview-error');
  if(el){el.style.display='block';el.textContent=(e.error&&e.error.stack)||e.message;}
});
window.addEventListener('unhandledrejection',function(e){
  var el=document.getElementById('__preview-error');
  if(el){el.style.display='block';el.textContent=String(e.reason&&(e.reason.stack||e.reason)||e);}
});
<\/script>`

/** @param {{ html: string, css: string, js: string, mode?: 'vanilla'|'react', deps?: string }} opts */
export function buildPreviewDocument({ html, css, js, mode = 'vanilla', deps = '' }) {
  const safeCss = escapeStyle(css)
  const safeHtml = html
  const safeJs = escapeScript(js)

  if (mode === 'react') {
    const importMap = buildImportMap(parseDeps(deps))
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script src="https://unpkg.com/@babel/standalone@7.26.2/babel.min.js"><\/script>
<script type="importmap">${importMap}<\/script>
<style>${safeCss}</style>
</head>
<body>
${safeHtml}
${ERROR_BOOT}
<script type="text/babel" data-type="module" data-presets="react">
${safeJs}
<\/script>
</body>
</html>`
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${safeCss}</style>
</head>
<body>
${safeHtml}
${ERROR_BOOT}
<script>${safeJs}<\/script>
</body>
</html>`
}
