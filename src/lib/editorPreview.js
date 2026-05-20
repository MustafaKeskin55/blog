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

function buildHtmlPreview(html, css, js) {
  const safeCss = escapeStyle(css)
  const safeJs = escapeScript(js)
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${safeCss}</style>
</head>
<body>
${html}
${ERROR_BOOT}
<script>${safeJs}<\/script>
</body>
</html>`
}

/** UMD React — import gerekmez, sandbox'ta daha güvenilir */
function buildReactUmdPreview(html, css, js) {
  const safeCss = escapeStyle(css)
  const safeJs = escapeScript(js)
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.development.js"><\/script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"><\/script>
<script src="https://unpkg.com/@babel/standalone@7.26.2/babel.min.js"><\/script>
<style>${safeCss}</style>
</head>
<body>
${html}
${ERROR_BOOT}
<script type="text/babel" data-presets="react">
const { useState, useEffect, useRef, useMemo, useCallback } = React;
${safeJs}
<\/script>
</body>
</html>`
}

/** ESM + import map — npm kütüphaneleri için */
function buildReactEsmPreview(html, css, js, deps) {
  const safeCss = escapeStyle(css)
  const safeJs = escapeScript(js)
  const importMap = buildImportMap(parseDeps(deps))
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script type="importmap">${importMap}<\/script>
<script src="https://unpkg.com/@babel/standalone@7.26.2/babel.min.js"><\/script>
<style>${safeCss}</style>
</head>
<body>
${html}
${ERROR_BOOT}
<script type="text/babel" data-type="module" data-presets="react">
${safeJs}
<\/script>
</body>
</html>`
}

function buildPythonPreview(html, css, python) {
  const safeCss = escapeStyle(css)
  const bodyHtml = html.trim() || '<pre id="py-out" class="py-out"></pre>'
  const defaultCss = `.py-out{font:13px/1.5 ui-monospace,monospace;color:#e8edf5;background:#0e1117;padding:1rem;margin:0;min-height:100vh;white-space:pre-wrap}
#py-loading{font:13px monospace;color:#5a6a8a;padding:1rem}`
  const mergedCss = `${defaultCss}\n${safeCss}`
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<style>${mergedCss}</style>
</head>
<body>
${bodyHtml}
<div id="py-loading">Python yükleniyor…</div>
${ERROR_BOOT}
<script src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"><\/script>
<script>
(async function(){
  var loading=document.getElementById('py-loading');
  var out=document.getElementById('py-out');
  if(!out){out=document.createElement('pre');out.id='py-out';out.className='py-out';document.body.appendChild(out);}
  try{
    var pyodide=await loadPyodide();
    if(loading)loading.style.display='none';
    pyodide.setStdout({batched:function(s){out.textContent+=s+'\\n';}});
    pyodide.setStderr({batched:function(s){out.textContent+=s+'\\n';}});
    await pyodide.runPythonAsync(${JSON.stringify(python)});
  }catch(e){
    if(loading)loading.style.display='none';
    var el=document.getElementById('__preview-error');
    if(el){el.style.display='block';el.textContent=e.message||String(e);}
  }
})();
<\/script>
</body>
</html>`
}

/**
 * @param {{ html: string, css: string, js: string, python?: string, mode?: 'html'|'react'|'python', deps?: string }} opts
 */
export function buildPreviewDocument({ html, css, js, python = '', mode = 'html', deps = '' }) {
  if (mode === 'python') return buildPythonPreview(html, css, python || js)
  if (mode === 'react') {
    const extra = parseDeps(deps)
    return extra.length > 0
      ? buildReactEsmPreview(html, css, js, deps)
      : buildReactUmdPreview(html, css, js)
  }
  return buildHtmlPreview(html, css, js)
}
