const PKG_RE = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(\/[a-z0-9][\w.-]*)?$/i

const REACT_CDN = 'https://cdn.jsdelivr.net/npm'
const BABEL_URL = `${REACT_CDN}/@babel/standalone@7.26.2/babel.min.js`

const CORE_IMPORTS = {
  react: `${REACT_CDN}/react@18.3.1/+esm`,
  'react-dom': `${REACT_CDN}/react-dom@18.3.1/+esm`,
  'react-dom/client': `${REACT_CDN}/react-dom@18.3.1/client/+esm`,
  'react/jsx-runtime': `${REACT_CDN}/react@18.3.1/jsx-runtime/+esm`,
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

/** UMD modunda import satırlarını kaldır (React global olarak gelir) */
export function stripImportsForUmd(js) {
  return js
    .replace(/^import\s+.+?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^import\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/createRoot\s*\(/g, 'ReactDOM.createRoot(')
    .trim()
}

function hasEsmImports(js) {
  return /^\s*import\s+/m.test(js) || /https:\/\/esm\.sh\//.test(js)
}

/** esm.sh URL import → 'react' gibi bare specifier + import map URL */
function parseEsmShSpecifier(spec) {
  const re = /^(@[^/]+\/[^@]+|[^@/]+)@([\d][\d.]*)(\/.*)?$/
  const m = spec.match(re)
  if (m) {
    const sub = m[3] ? m[3].replace(/^\//, '') : ''
    const bare = sub ? `${m[1]}/${sub}` : m[1]
    return { bare, url: `https://esm.sh/${spec}?dev` }
  }
  return { bare: spec, url: `https://esm.sh/${spec}?dev` }
}

/**
 * Kullanıcı kodunu önizleme için normalize eder.
 * - https://esm.sh/... import → 'paket-adı'
 * - root.render() → root.render(<App />)
 */
export function normalizeReactUserCode(js) {
  const urlImports = new Map()
  let code = js

  code = code.replace(
    /import\s+([\s\S]*?)\s+from\s+['"]https:\/\/esm\.sh\/([^'"]+)['"]\s*;?/g,
    (_, imports, spec) => {
      const { bare, url } = parseEsmShSpecifier(spec)
      urlImports.set(bare, url)
      return `import ${imports} from '${bare}';`
    },
  )

  code = code.replace(
    /import\s+ReactDOM\s+from\s+['"]react-dom\/client['"]\s*;?/g,
    "import * as ReactDOM from 'react-dom/client';",
  )

  if (/createRoot\s*\(/.test(code) && !/\.render\s*\(\s*</.test(code) && !/\.render\s*\(\s*React\.createElement/.test(code)) {
    code = code.replace(/\.render\s*\(\s*\)\s*;?/g, '.render(<App />);')
  }

  return { code: code.trim(), urlImports }
}

function buildImportMap(extraDeps, urlImports = new Map()) {
  const imports = { ...CORE_IMPORTS }
  for (const [bare, url] of urlImports) {
    imports[bare] = url
  }
  for (const pkg of extraDeps) {
    if (!imports[pkg]) imports[pkg] = `https://esm.sh/${pkg}?dev`
  }
  return JSON.stringify({ imports }, null, 2)
}

const ERROR_BOOT = `
<div id="__preview-error" style="display:none;font:12px/1.45 monospace;color:#ffb4b4;background:#1a0808;padding:10px 12px;border-top:1px solid #ff5f57;white-space:pre-wrap;max-height:40vh;overflow:auto;"></div>
<script>
function __showPreviewError(msg){
  var el=document.getElementById('__preview-error');
  if(el){el.style.display='block';el.textContent=msg;}
}
window.addEventListener('error',function(e){
  __showPreviewError((e.error&&e.error.stack)||e.message);
});
window.addEventListener('unhandledrejection',function(e){
  __showPreviewError(String(e.reason&&(e.reason.stack||e.reason)||e));
});
<\/script>`

const REACT_RUNNER = (userCodeJson) => `
<script>
(function(){
  var USER_CODE = ${userCodeJson};
  function run(){
    if(!window.Babel){ __showPreviewError('Babel yüklenemedi. İnternet / CDN engeli olabilir.'); return; }
    if(!window.React||!window.ReactDOM){ __showPreviewError('React yüklenemedi. CDN (jsdelivr) erişimini kontrol et.'); return; }
    try {
      var prelude = 'const {useState,useEffect,useRef,useMemo,useCallback}=React;';
      var compiled = Babel.transform(prelude + USER_CODE, { presets: ['react'] }).code;
      new Function('React','ReactDOM', compiled)(React, ReactDOM);
    } catch(e) {
      __showPreviewError(e.stack || e.message || String(e));
    }
  }
  if(document.readyState==='complete') run();
  else window.addEventListener('load', run);
})();
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

/** UMD React + Babel.transform (en güvenilir önizleme) */
function buildReactUmdPreview(html, css, js) {
  const safeCss = escapeStyle(css)
  const code = stripImportsForUmd(js)
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script crossorigin src="${REACT_CDN}/react@18.3.1/umd/react.development.js"><\/script>
<script crossorigin src="${REACT_CDN}/react-dom@18.3.1/umd/react-dom.development.js"><\/script>
<script src="${BABEL_URL}"><\/script>
<style>${safeCss}</style>
</head>
<body>
${html}
<div id="__preview-loading" style="font:12px monospace;color:#5a6a8a;padding:8px;">React yükleniyor…</div>
${ERROR_BOOT}
${REACT_RUNNER(JSON.stringify(code))}
<script>
window.addEventListener('load',function(){
  var l=document.getElementById('__preview-loading');
  if(l) setTimeout(function(){ l.style.display='none'; }, 800);
});
<\/script>
</body>
</html>`
}

/** ESM + import map — npm paketleri, import veya esm.sh URL */
function buildReactEsmPreview(html, css, js, deps, urlImports = new Map()) {
  const safeCss = escapeStyle(css)
  const safeJs = escapeScript(js)
  const importMap = buildImportMap(parseDeps(deps), urlImports)
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<script type="importmap">${importMap}<\/script>
<script src="${BABEL_URL}"><\/script>
<style>${safeCss}</style>
</head>
<body>
${html}
${ERROR_BOOT}
<script type="text/babel" data-type="module" data-presets="react" id="__user-react">
${safeJs}
<\/script>
<script>
function __runEsmBabel(){
  if(!window.Babel){ __showPreviewError('Babel yüklenemedi'); return; }
  try { Babel.transformScriptTags(); } catch(e) { __showPreviewError(e.stack||e.message); }
}
if(window.Babel) __runEsmBabel();
else window.addEventListener('load', __runEsmBabel);
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
<script src="https://cdn.jsdelivr.net/pyodide@0.26.4/full/pyodide.js"><\/script>
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
    __showPreviewError(e.message||String(e));
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
    const { code, urlImports } = normalizeReactUserCode(js)
    const extra = parseDeps(deps)
    if (extra.length > 0 || hasEsmImports(code) || urlImports.size > 0) {
      return buildReactEsmPreview(html, css, code, deps, urlImports)
    }
    return buildReactUmdPreview(html, css, code)
  }
  return buildHtmlPreview(html, css, js)
}
