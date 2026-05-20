import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setToken, clearToken, isLoggedIn } from '../lib/api'
import { buildPreviewDocument } from '../lib/editorPreview'
import { parseBulkCode } from '../lib/parseBulkCode'
import './Admin.css'

function AnalyticsTab() {
  const [gaId, setGaId] = useState('')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api.getSettings().then(s => setGaId(s.gaMeasurementId || '')).catch(() => {})
  }, [])

  const save = async (e) => {
    e.preventDefault()
    try {
      await api.updateSettings({ gaMeasurementId: gaId.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaved(false)
    }
  }

  const id = gaId.trim() || 'G-XXXXXXXXXX'
  const snippet = `<!-- Google Analytics 4 — index.html <head> içine ekle -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${id}');
</script>`

  const copy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h2><i className="fab fa-google" /> Analitik</h2>
          <p className="admin-sub">Google Analytics 4 bağlantısı</p>
        </div>
      </div>
      <div className="ga-setup-card">
        <div className="ga-setup-title"><i className="fas fa-key" /> Measurement ID Gir</div>
        <p className="ga-setup-desc">
          Google Analytics panelinden aldığın <b>Measurement ID</b>'yi buraya yaz.
          Alttaki kod snippet'i otomatik oluşturulacak — kopyalayıp <code>index.html</code> dosyasının <code>&lt;head&gt;</code> kısmına yapıştır.
        </p>
        <form className="ga-id-form" onSubmit={save}>
          <div className="ga-id-wrap">
            <i className="fas fa-chart-line" />
            <input value={gaId} onChange={e => setGaId(e.target.value)} placeholder="G-XXXXXXXXXX" spellCheck={false} />
          </div>
          <button type="submit" className="btn-sm">
            <i className={`fas fa-${saved ? 'check' : 'save'}`} /> {saved ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </form>
        <div className="ga-steps">
          <div className="ga-step"><span className="step-num-sm">1</span> analytics.google.com → Yönetici → Veri Akışları → Web</div>
          <div className="ga-step"><span className="step-num-sm">2</span> Ölçüm Kimliği'ni (G-XXXXXXX) kopyala, yukarıya yapıştır, Kaydet</div>
          <div className="ga-step"><span className="step-num-sm">3</span> Aşağıdaki kodu kopyala → <code>index.html</code> → <code>&lt;head&gt;</code> içine yapıştır</div>
          <div className="ga-step"><span className="step-num-sm">4</span> Cloudflare'e deploy et — 24 saat içinde veri gelmeye başlar</div>
        </div>
      </div>
      <div className="ga-snippet-card">
        <div className="ga-snippet-header">
          <span><i className="fas fa-code" /> index.html Script</span>
          <button className="copy-code-btn" onClick={copy}>
            <i className={`fas fa-${copied ? 'check' : 'copy'}`} /> {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>
        <pre className="ga-snippet-pre">{snippet}</pre>
      </div>
      <div className="an-note" style={{ marginTop: '1rem' }}>
        <i className="fas fa-info-circle" />
        <p><b>Not:</b> GA4 verileri Google sunucularında tutulur. Localhost'ta çalışırken veri gelmez — deploy ettikten sonra görürsün.</p>
      </div>
    </>
  )
}

const BLANK_POST = { title: '', titleEn: '', category: '', excerpt: '', excerptEn: '', content: '', tags: '', readTime: '5 dk' }
const BLANK_NOTE = { title: '', content: '', category: '', pinned: false }
const BLANK_TPL = { label: '', category: '', icon: 'fas fa-square', html: '', css: '', js: '', mode: 'html', py: '', deps: '' }

function autoDetectTemplate(html, css, js, mode = 'html') {
  if (mode === 'react') {
    return { label: guessLabel(html, css, 'React Şablon'), category: 'React' }
  }
  if (mode === 'python') {
    return { label: 'Python Şablon', category: 'Python' }
  }
  const all = (html + css + js).toLowerCase()

  const rules = [
    { cat: 'Navigasyon', name: 'Navbar', keywords: ['nav', 'navbar', 'menu', 'hamburger', 'sidebar'] },
    { cat: 'Hero', name: 'Hero Bölümü', keywords: ['hero', 'landing', 'banner', 'jumbotron', 'showcase'] },
    { cat: 'Form', name: 'Form', keywords: ['form', 'input', 'login', 'register', 'signup', 'contact', 'submit'] },
    { cat: 'Buton', name: 'Buton Seti', keywords: ['btn', 'button', 'neon', 'glow', 'ripple'] },
    { cat: 'Kart', name: 'Kart', keywords: ['card', 'glass', 'profile', 'pricing', 'plan', 'team', 'product'] },
    { cat: 'Animasyon', name: 'Animasyon', keywords: ['animation', 'keyframe', 'transition', 'particle', 'canvas', 'loader', 'spinner'] },
    { cat: 'Dashboard', name: 'Dashboard', keywords: ['dashboard', 'chart', 'stat', 'metric', 'table', 'admin', 'panel'] },
    { cat: 'Galeri', name: 'Galeri', keywords: ['gallery', 'grid', 'masonry', 'lightbox', 'carousel', 'slider', 'portfolio'] },
  ]

  for (const rule of rules) {
    if (rule.keywords.some(k => all.includes(k))) {
      const label = guessLabel(html, css, rule.name)
      return { label, category: rule.cat }
    }
  }
  return { label: 'Yeni Şablon', category: 'Diğer' }
}

function guessLabel(html, css, fallback) {
  const h1 = html.match(/<h1[^>]*>([^<]{2,40})<\/h1>/i)
  if (h1) return h1[1].trim()
  const title = html.match(/<title[^>]*>([^<]{2,40})<\/title>/i)
  if (title) return title[1].trim()
  const cls = css.match(/\.([a-z][a-z0-9-]{2,20})\s*\{/i)
  if (cls) return cls[1].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return fallback
}


export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState('')
  const [view, setView] = useState('list')
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState(BLANK_POST)
  const [editId, setEditId] = useState(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [notes, setNotes] = useState([])
  const [noteForm, setNoteForm] = useState(null)
  const [editNoteId, setEditNoteId] = useState(null)

  const [templates, setTemplates] = useState([])
  const [tplForm, setTplForm] = useState(null)
  const [editTplId, setEditTplId] = useState(null)
  const [previewTpl, setPreviewTpl] = useState(null)
  const [bulkRaw, setBulkRaw] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)

  const navigate = useNavigate()

  const loadAll = async () => {
    try {
      let [p, n, t] = await Promise.all([
        api.adminGetPosts(),
        api.getNotes(),
        api.adminGetTemplates(),
      ])
      if (p.length === 0) {
        await api.seed()
        p = await api.adminGetPosts()
      }
      setPosts(p)
      setNotes(n)
      setTemplates(t)
    } catch (e) {
      if (e.message === 'Unauthorized') {
        clearToken()
        setAuth(false)
      }
    }
  }

  useEffect(() => {
    if (isLoggedIn()) {
      setAuth(true)
      loadAll()
    }
  }, [])

  const login = async (e) => {
    e.preventDefault()
    try {
      const { token } = await api.login(pass)
      setToken(token)
      setAuth(true)
      setPassErr('')
      await loadAll()
    } catch {
      setPassErr('Yanlış şifre.')
      setPass('')
    }
  }
  const logout = async () => {
    try { await api.logout() } catch { /* ignore */ }
    clearToken()
    setAuth(false)
  }
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const nav = (v) => { setView(v); setSidebarOpen(false) }

  // POSTS
  const startNew = () => { setForm(BLANK_POST); setEditId(null); nav('new') }
  const startEdit = (p) => { setForm({ ...p, tags: p.tags?.join(', ') || '', titleEn: p.titleEn || '', excerptEn: p.excerptEn || '' }); setEditId(p.id); setView('edit') }
  const deletePost = async (id) => {
    if (!window.confirm('Bu yazıyı silmek istediğinden emin misin?')) return
    try {
      await api.deletePost(id)
      setPosts(u => u.filter(p => p.id !== id))
      showToast('Yazı silindi.')
    } catch (e) { showToast(e.message) }
  }
  const submitPost = async (e) => {
    e.preventDefault()
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { ...form, tags }
    try {
      if (view === 'new') {
        const post = await api.createPost(payload)
        setPosts(u => [post, ...u])
        showToast('Yazı yayınlandı!')
      } else {
        const existing = posts.find(p => p.id === editId)
        const post = await api.updatePost(editId, { ...payload, date: existing?.date })
        setPosts(u => u.map(p => p.id === editId ? post : p))
        showToast('Yazı güncellendi.')
      }
      setView('list')
    } catch (e) { showToast(e.message) }
  }

  // NOTES
  const submitNote = async (e) => {
    e.preventDefault()
    try {
      if (editNoteId) {
        const note = await api.updateNote(editNoteId, noteForm)
        setNotes(u => u.map(n => n.id === editNoteId ? note : n))
      } else {
        const note = await api.createNote(noteForm)
        setNotes(u => [note, ...u])
      }
      setNoteForm(null)
      setEditNoteId(null)
      showToast('Not kaydedildi.')
    } catch (e) { showToast(e.message) }
  }
  const deleteNote = async (id) => {
    if (!window.confirm('Notu sil?')) return
    try {
      await api.deleteNote(id)
      setNotes(u => u.filter(n => n.id !== id))
      showToast('Not silindi.')
    } catch (e) { showToast(e.message) }
  }
  const togglePin = async (id) => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    try {
      const updated = await api.updateNote(id, { ...note, pinned: !note.pinned })
      setNotes(u => u.map(n => n.id === id ? updated : n))
    } catch (e) { showToast(e.message) }
  }

  // TEMPLATES
  const submitTemplate = async (e) => {
    e.preventDefault()
    try {
      if (editTplId) {
        const tpl = await api.updateTemplate(editTplId, tplForm)
        setTemplates(u => u.map(t => t.id === editTplId ? tpl : t))
      } else {
        const tpl = await api.createTemplate(tplForm)
        setTemplates(u => [tpl, ...u])
      }
      setTplForm(null)
      setEditTplId(null)
      showToast('Şablon kaydedildi.')
    } catch (e) { showToast(e.message) }
  }
  const deleteTemplate = async (id) => {
    if (!window.confirm('Şablonu sil?')) return
    try {
      await api.deleteTemplate(id)
      setTemplates(u => u.filter(t => t.id !== id))
      showToast('Şablon silindi.')
    } catch (e) { showToast(e.message) }
  }

  // LOGIN
  if (!auth) return (
    <div className="admin-login">
      <div className="grid-bg" />
      <form className="login-card" onSubmit={login}>
        <div className="login-icon"><i className="fas fa-shield-halved" /></div>
        <h1>Admin Paneli</h1>
        <p>Bu sayfa gizlidir. Devam etmek için şifreyi girin.</p>
        <div className="login-field">
          <i className="fas fa-lock" />
          <input type="password" placeholder="Şifre" value={pass} onChange={e => setPass(e.target.value)} autoFocus />
        </div>
        {passErr && <span className="err-msg"><i className="fas fa-triangle-exclamation" /> {passErr}</span>}
        <button type="submit" className="btn-sm" style={{ justifyContent: 'center', padding: '.7rem' }}>
          <i className="fas fa-sign-in-alt" /> Giriş Yap
        </button>
        <button type="button" className="btn-sm btn-sm--ghost" style={{ justifyContent: 'center' }} onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left" /> Ana Sayfaya Dön
        </button>
      </form>
    </div>
  )

  return (
    <div className="admin-page">
      <div className="grid-bg" />
      {toast && <div className="toast"><i className="fas fa-check-circle" /> {toast}</div>}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">MK<span>.</span>Admin</div>
        <nav className="admin-nav">
          <div className="nav-section-label">Blog</div>
          <button className={view === 'list' ? 'active' : ''} onClick={() => nav('list')}>
            <i className="fas fa-list" /> Yazılar <span className="nav-badge">{posts.length}</span>
          </button>
          <button className={view === 'new' ? 'active' : ''} onClick={startNew}>
            <i className="fas fa-plus" /> Yeni Yazı
          </button>

          <div className="nav-divider" />
          <div className="nav-section-label">Editör</div>
          <button className={view === 'templates' ? 'active' : ''} onClick={() => nav('templates')}>
            <i className="fas fa-layer-group" /> Şablonlar <span className="nav-badge">{templates.length}</span>
          </button>
          <button className={view === 'notes' ? 'active' : ''} onClick={() => nav('notes')}>
            <i className="fas fa-sticky-note" /> Notlar <span className="nav-badge">{notes.length}</span>
          </button>

          <div className="nav-divider" />
          <div className="nav-section-label">Site</div>
          <button className={view === 'analytics' ? 'active' : ''} onClick={() => nav('analytics')}>
            <i className="fab fa-google" /> Analitik
          </button>
          <button onClick={() => navigate('/blog')}><i className="fas fa-eye" /> Blogu Gör</button>
          <button onClick={() => navigate('/editor')}><i className="fas fa-code" /> Editörü Gör</button>
          <button onClick={() => navigate('/')}><i className="fas fa-home" /> Ana Sayfa</button>
        </nav>
        <button className="logout-btn" onClick={logout}><i className="fas fa-sign-out-alt" /> Çıkış Yap</button>
      </aside>

      {/* MOBILE BAR */}
      <div className="admin-mobile-bar">
        <button className="hamburger-admin" onClick={() => setSidebarOpen(o => !o)}>
          <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`} />
        </button>
        <span className="admin-logo" style={{ fontSize: '.9rem' }}>MK<span>.</span>Admin</span>
        <span />
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="admin-main">

        {/* POSTS LIST */}
        {view === 'list' && (
          <>
            <div className="admin-header">
              <div><h2>Yazılar</h2><p className="admin-sub">{posts.length} yazı · Cloudflare D1</p></div>
              <button className="btn-sm" onClick={startNew}><i className="fas fa-plus" /> Yeni Yazı</button>
            </div>
            <div className="posts-table">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox" /><p>Henüz yazı yok.</p>
                  <button className="btn-sm" onClick={startNew}><i className="fas fa-plus" /> İlk yazını ekle</button>
                </div>
              ) : posts.map(p => (
                <div key={p.id} className="table-row">
                  <div className="tr-info">
                    <div className="tr-cats">
                      <span className="tr-cat">{p.category}</span>
                      {p.titleEn && <span className="tr-bilingual"><i className="fas fa-globe" /> EN</span>}
                    </div>
                    <h3>{p.title}</h3>
                    <span className="tr-date"><i className="fas fa-calendar-alt" /> {p.date} &nbsp;·&nbsp; <i className="fas fa-clock" /> {p.readTime}</span>
                  </div>
                  <div className="tr-actions">
                    <button className="act-btn act-view" onClick={() => navigate(`/blog/post/${p.id}`)}><i className="fas fa-eye" /></button>
                    <button className="act-btn act-edit" onClick={() => startEdit(p)}><i className="fas fa-pen" /></button>
                    <button className="act-btn act-delete" onClick={() => deletePost(p.id)}><i className="fas fa-trash" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* POST FORM */}
        {(view === 'new' || view === 'edit') && (
          <>
            <div className="admin-header">
              <div><h2>{view === 'new' ? 'Yeni Yazı' : 'Yazıyı Düzenle'}</h2><p className="admin-sub">TR + EN içerik girebilirsin</p></div>
              <button className="btn-sm btn-sm--ghost" onClick={() => setView('list')}><i className="fas fa-arrow-left" /> Geri</button>
            </div>
            <form className="post-form" onSubmit={submitPost}>
              <div className="form-section-label"><i className="fas fa-flag" /> Türkçe İçerik</div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Başlık (TR) *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Yazı başlığı..." />
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <input
                    list="post-cats-list"
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    placeholder="React, Go, CSS... veya yeni yaz"
                  />
                  <datalist id="post-cats-list">
                    {[...new Set(posts.map(p => p.category).filter(Boolean))].map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 0.5, minWidth: 100 }}>
                  <label>Okuma Süresi</label>
                  <input value={form.readTime} onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))} placeholder="5 dk" />
                </div>
              </div>
              <div className="form-group">
                <label>Özet (TR) *</label>
                <input required value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Blog listesinde görünecek kısa özet..." />
              </div>
              <div className="form-section-label" style={{ marginTop: '.5rem' }}><i className="fas fa-globe" /> English Content <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></div>
              <div className="form-group">
                <label>Title (EN)</label>
                <input value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))} placeholder="Post title in English..." />
              </div>
              <div className="form-group">
                <label>Excerpt (EN)</label>
                <input value={form.excerptEn} onChange={e => setForm(f => ({ ...f, excerptEn: e.target.value }))} placeholder="Short excerpt in English..." />
              </div>
              <div className="form-section-label" style={{ marginTop: '.5rem' }}><i className="fas fa-pen-nib" /> İçerik</div>
              <div className="form-group">
                <label>İçerik * <span className="label-hint">(Markdown: ## Başlık · **bold** · `kod` · ```blok```)</span></label>
                <textarea required rows={16} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="## Giriş&#10;&#10;Yazına buradan başla..." />
              </div>
              <div className="form-group">
                <label>Etiketler <span className="label-hint">(virgülle ayır)</span></label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, JavaScript, Frontend" />
              </div>
              <div className="form-submit">
                <button type="submit" className="btn-sm">
                  <i className={`fas fa-${view === 'new' ? 'paper-plane' : 'save'}`} /> {view === 'new' ? 'Yayınla' : 'Güncelle'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* TEMPLATES */}
        {view === 'templates' && (
          <>
            <div className="admin-header">
              <div><h2><i className="fas fa-layer-group" /> Editör Şablonları</h2><p className="admin-sub">Editörde görünecek HTML/CSS/JS tasarımlar</p></div>
              <div style={{ display: 'flex', gap: '.6rem' }}>
                <button className="btn-sm btn-sm--ghost" onClick={() => { setBulkOpen(o => !o); setTplForm(null) }}>
                  <i className="fas fa-file-import" /> Toplu Ekle
                </button>
                <button className="btn-sm" onClick={() => { setTplForm(BLANK_TPL); setEditTplId(null); setPreviewTpl(null); setBulkOpen(false) }}>
                  <i className="fas fa-plus" /> Yeni Şablon
                </button>
              </div>
            </div>

            {/* TOPLU GİRİŞ */}
            {bulkOpen && (
              <div className="bulk-card">
                <div className="form-section-label"><i className="fas fa-file-import" /> Toplu Kod Yapıştır</div>
                <p className="bulk-desc">
                  HTML, React (JSX / <code>text/babel</code>) veya Python (<code>text/python</code> veya sadece <code>.py</code> kodu) yapıştır.
                  Sistem <b>HTML / CSS / JS / Python</b> alanlarına ve <b>moda</b> (HTML · React · Python) otomatik ayırır.
                </p>
                <textarea
                  className="bulk-textarea"
                  rows={16}
                  value={bulkRaw}
                  onChange={e => setBulkRaw(e.target.value)}
                  placeholder={`<!-- HTML şablonu -->\n<style>/* CSS */</style>\n<div>...</div>\n<script>// JS</script>\n\n<!-- React: type="text/babel" -->\n<!-- Python: <script type="text/python"> veya sadece print("...") -->`}
                />
                <div style={{ display: 'flex', gap: '.7rem', marginTop: '.8rem' }}>
                  <button className="btn-sm" onClick={() => {
                    if (!bulkRaw.trim()) return
                    const parsed = parseBulkCode(bulkRaw)
                    const detected = autoDetectTemplate(parsed.html, parsed.css, parsed.js, parsed.mode)
                    const icon = parsed.mode === 'react' ? 'fab fa-react' : parsed.mode === 'python' ? 'fab fa-python' : 'fas fa-square'
                    setTplForm({ ...BLANK_TPL, ...parsed, icon, label: detected.label, category: detected.category })
                    setEditTplId(null)
                    setBulkOpen(false)
                    setBulkRaw('')
                  }}>
                    <i className="fas fa-wand-magic-sparkles" /> Ayır & Forma Aktar
                  </button>
                  <button className="btn-sm btn-sm--ghost" onClick={() => { setBulkOpen(false); setBulkRaw('') }}>
                    <i className="fas fa-times" /> İptal
                  </button>
                </div>
              </div>
            )}

            {tplForm && (
              <form className="post-form" onSubmit={submitTemplate} style={{ marginBottom: '1.5rem' }}>
                <div className="form-section-label"><i className="fas fa-layer-group" /> {editTplId ? 'Şablonu Düzenle' : 'Yeni Şablon'}</div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Şablon Adı *</label>
                    <input required value={tplForm.label} onChange={e => setTplForm(f => ({ ...f, label: e.target.value }))} placeholder="Örn: Hero Section" />
                  </div>
                  <div className="form-group">
                    <label>Kategori</label>
                    <input
                      list="tpl-cats-list"
                      value={tplForm.category}
                      onChange={e => setTplForm(f => ({ ...f, category: e.target.value }))}
                      placeholder="Kart, Hero, Form... veya yeni yaz"
                    />
                    <datalist id="tpl-cats-list">
                      {[...new Set(templates.map(t => t.category).filter(Boolean))].map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>

                <div className="form-section-label" style={{ marginTop: '.5rem' }}>
                  <i className="fas fa-code" /> Kod Alanları
                  <span className={`tpl-mode-badge tpl-mode-badge--${tplForm.mode || 'html'}`}>
                    {tplForm.mode === 'react' && <><i className="fab fa-react" /> React</>}
                    {tplForm.mode === 'python' && <><i className="fab fa-python" /> Python</>}
                    {(!tplForm.mode || tplForm.mode === 'html') && <><i className="fab fa-html5" /> HTML</>}
                  </span>
                </div>
                {tplForm.mode === 'react' && (
                  <div className="form-group" style={{ marginBottom: '.8rem' }}>
                    <label>NPM kütüphaneleri <span className="label-hint">(virgülle — editörde otomatik import)</span></label>
                    <input
                      value={tplForm.deps || ''}
                      onChange={e => setTplForm(f => ({ ...f, deps: e.target.value }))}
                      placeholder="framer-motion, lodash-es"
                      spellCheck={false}
                      style={{ fontFamily: 'var(--mono)', fontSize: '.85rem' }}
                    />
                  </div>
                )}
                <div className="tpl-code-grid">
                  <div className="form-group">
                    <label><i className="fab fa-html5" style={{ color: '#e34c26' }} /> HTML</label>
                    <textarea
                      rows={14} value={tplForm.html}
                      onChange={e => setTplForm(f => ({ ...f, html: e.target.value }))}
                      placeholder="<div class=&quot;wrapper&quot;>&#10;  <!-- HTML burada -->&#10;</div>"
                      style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', resize: 'vertical' }}
                    />
                  </div>
                  <div className="form-group">
                    <label><i className="fab fa-css3-alt" style={{ color: '#264de4' }} /> CSS</label>
                    <textarea
                      rows={14} value={tplForm.css}
                      onChange={e => setTplForm(f => ({ ...f, css: e.target.value }))}
                      placeholder="* { margin: 0; padding: 0; }&#10;body { background: #080b11; }"
                      style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', resize: 'vertical' }}
                    />
                  </div>
                  {tplForm.mode !== 'python' && (
                    <div className="form-group">
                      <label>
                        <i className={tplForm.mode === 'react' ? 'fab fa-react' : 'fab fa-js'} style={{ color: tplForm.mode === 'react' ? '#61dafb' : '#f7df1e' }} />
                        {tplForm.mode === 'react' ? 'JSX / React' : 'JavaScript'}
                      </label>
                      <textarea
                        rows={14} value={tplForm.js}
                        onChange={e => setTplForm(f => ({ ...f, js: e.target.value }))}
                        placeholder={tplForm.mode === 'react' ? "function App() {\n  return <div>Merhaba</div>\n}\nReactDOM.createRoot(...).render(<App />)" : "// JavaScript"}
                        style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', resize: 'vertical' }}
                      />
                    </div>
                  )}
                  {tplForm.mode === 'python' && (
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label><i className="fab fa-python" style={{ color: '#ffd43b' }} /> Python</label>
                      <textarea
                        rows={14} value={tplForm.py || ''}
                        onChange={e => setTplForm(f => ({ ...f, py: e.target.value }))}
                        placeholder={'print("Merhaba")\nfor i in range(3):\n    print(i)'}
                        style={{ fontFamily: 'var(--mono)', fontSize: '.8rem', resize: 'vertical' }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-submit" style={{ display: 'flex', gap: '.7rem' }}>
                  <button type="submit" className="btn-sm"><i className="fas fa-save" /> Kaydet</button>
                  <button type="button" className="btn-sm btn-sm--ghost" onClick={() => { setTplForm(null); setEditTplId(null) }}><i className="fas fa-times" /> İptal</button>
                </div>
              </form>
            )}

            {/* Preview modal */}
            {previewTpl && (
              <div className="modal-overlay" onClick={() => setPreviewTpl(null)}>
                <div className="tpl-preview-modal" onClick={e => e.stopPropagation()}>
                  <div className="tpl-preview-bar">
                    <span><i className="fas fa-eye" /> {previewTpl.label}</span>
                    <button onClick={() => setPreviewTpl(null)}><i className="fas fa-times" /></button>
                  </div>
                  <iframe
                    className="tpl-preview-frame"
                    title="preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                    srcDoc={buildPreviewDocument({
                      html: previewTpl.html,
                      css: previewTpl.css,
                      js: previewTpl.js,
                      python: previewTpl.py,
                      mode: previewTpl.mode || 'html',
                      deps: previewTpl.deps,
                    })}
                  />
                </div>
              </div>
            )}

            <div className="posts-table">
              {templates.length === 0 && !tplForm ? (
                <div className="empty-state">
                  <i className="fas fa-layer-group" />
                  <p>Henüz özel şablon yok. Varsayılan şablonlar editörde görünüyor.</p>
                </div>
              ) : templates.map(t => (
                <div key={t.id} className="table-row">
                  <div className="tr-info">
                    <div className="tr-cats"><span className="tr-cat">{t.category}</span></div>
                    <h3>{t.label}</h3>
                    <span className="tr-date" style={{ gap: '1rem' }}>
                      <span className={`tpl-mode-pill tpl-mode-pill--${t.mode || 'html'}`}>
                        {t.mode === 'react' ? 'React' : t.mode === 'python' ? 'Python' : 'HTML'}
                      </span>
                      <span><i className="fab fa-html5" /> {t.html ? `${t.html.split('\n').length}L` : '—'}</span>
                      <span><i className="fab fa-css3-alt" /> {t.css ? `${t.css.split('\n').length}L` : '—'}</span>
                      {t.mode === 'python'
                        ? <span><i className="fab fa-python" /> {t.py ? `${t.py.split('\n').length}L` : '—'}</span>
                        : <span><i className="fab fa-js" /> {t.js ? `${t.js.split('\n').length}L` : '—'}</span>}
                    </span>
                  </div>
                  <div className="tr-actions">
                    <button className="act-btn act-view" onClick={() => setPreviewTpl(t)} title="Önizle"><i className="fas fa-eye" /></button>
                    <button className="act-btn act-edit" onClick={() => { setTplForm({ ...t }); setEditTplId(t.id) }} title="Düzenle"><i className="fas fa-pen" /></button>
                    <button className="act-btn act-delete" onClick={() => deleteTemplate(t.id)} title="Sil"><i className="fas fa-trash" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* NOTES */}
        {view === 'notes' && (
          <>
            <div className="admin-header">
              <div><h2><i className="fas fa-sticky-note" /> Notlar</h2><p className="admin-sub">Kişisel notlarını buradan yönet</p></div>
              <button className="btn-sm" onClick={() => { setNoteForm(BLANK_NOTE); setEditNoteId(null) }}>
                <i className="fas fa-plus" /> Yeni Not
              </button>
            </div>

            {noteForm && (
              <form className="post-form" onSubmit={submitNote} style={{ marginBottom: '1.5rem' }}>
                <div className="form-section-label"><i className="fas fa-sticky-note" /> {editNoteId ? 'Notu Düzenle' : 'Yeni Not'}</div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Başlık *</label>
                    <input required value={noteForm.title} onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))} placeholder="Not başlığı..." />
                  </div>
                  <div className="form-group">
                    <label>Kategori</label>
                    <input
                      list="note-cats-list"
                      value={noteForm.category}
                      onChange={e => setNoteForm(f => ({ ...f, category: e.target.value }))}
                      placeholder="Genel, Fikir, Kaynak... veya yeni yaz"
                    />
                    <datalist id="note-cats-list">
                      {[...new Set(notes.map(n => n.category).filter(Boolean))].map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </div>
                <div className="form-group">
                  <label>İçerik *</label>
                  <textarea required rows={8} value={noteForm.content} onChange={e => setNoteForm(f => ({ ...f, content: e.target.value }))} placeholder="Not içeriği..." />
                </div>
                <div className="form-submit" style={{ display: 'flex', gap: '.7rem' }}>
                  <button type="submit" className="btn-sm"><i className="fas fa-save" /> Kaydet</button>
                  <button type="button" className="btn-sm btn-sm--ghost" onClick={() => { setNoteForm(null); setEditNoteId(null) }}><i className="fas fa-times" /> İptal</button>
                </div>
              </form>
            )}

            <div className="notes-admin-grid">
              {notes.length === 0 && !noteForm ? (
                <div className="empty-state"><i className="fas fa-sticky-note" /><p>Henüz not yok.</p></div>
              ) : [...notes].sort((a, b) => b.pinned - a.pinned).map(n => (
                <div key={n.id} className={`note-admin-card ${n.pinned ? 'pinned' : ''}`}>
                  <div className="note-admin-top">
                    <span className="tr-cat">{n.category}</span>
                    <div className="tr-actions">
                      <button className={`act-btn ${n.pinned ? 'act-view' : ''}`} onClick={() => togglePin(n.id)}><i className="fas fa-thumbtack" /></button>
                      <button className="act-btn act-edit" onClick={() => { setNoteForm({ ...n }); setEditNoteId(n.id) }}><i className="fas fa-pen" /></button>
                      <button className="act-btn act-delete" onClick={() => deleteNote(n.id)}><i className="fas fa-trash" /></button>
                    </div>
                  </div>
                  <h3>{n.title}</h3>
                  <p className="note-admin-body">{n.content}</p>
                  {n.date && <span className="tr-date"><i className="fas fa-calendar-alt" /> {n.date}</span>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ANALYTICS */}
        {view === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  )
}
