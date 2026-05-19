import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Admin.css'

const GA_KEY = 'mk_ga_id'

function AnalyticsTab() {
  const [gaId, setGaId] = useState(() => localStorage.getItem(GA_KEY) || '')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const save = (e) => {
    e.preventDefault()
    localStorage.setItem(GA_KEY, gaId.trim())
    setSaved(true); setTimeout(() => setSaved(false), 2000)
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

      {/* GA4 ID input */}
      <div className="ga-setup-card">
        <div className="ga-setup-title"><i className="fas fa-key" /> Measurement ID Gir</div>
        <p className="ga-setup-desc">
          Google Analytics panelinden aldığın <b>Measurement ID</b>'yi buraya yaz.
          Alttaki kod snippet'i otomatik oluşturulacak — kopyalayıp <code>index.html</code> dosyasının <code>&lt;head&gt;</code> kısmına yapıştır.
        </p>
        <form className="ga-id-form" onSubmit={save}>
          <div className="ga-id-wrap">
            <i className="fas fa-chart-line" />
            <input
              value={gaId}
              onChange={e => setGaId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              spellCheck={false}
            />
          </div>
          <button type="submit" className="btn-sm">
            <i className={`fas fa-${saved ? 'check' : 'save'}`} />
            {saved ? 'Kaydedildi!' : 'Kaydet'}
          </button>
        </form>

        <div className="ga-steps">
          <div className="ga-step"><span className="step-num-sm">1</span> analytics.google.com → Yönetici → Veri Akışları → Web</div>
          <div className="ga-step"><span className="step-num-sm">2</span> Ölçüm Kimliği'ni (G-XXXXXXX) kopyala, yukarıya yapıştır, Kaydet</div>
          <div className="ga-step"><span className="step-num-sm">3</span> Aşağıdaki kodu kopyala → <code>index.html</code> → <code>&lt;head&gt;</code> içine yapıştır</div>
          <div className="ga-step"><span className="step-num-sm">4</span> Vercel'e deploy et — 24 saat içinde veri gelmeye başlar</div>
        </div>
      </div>

      {/* Generated snippet */}
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
        <p><b>Not:</b> GA4 verileri Google sunucularında tutulur. Localhost'ta çalışırken veri gelmez — Vercel'e deploy ettikten sonra görürsün.</p>
      </div>
    </>
  )
}

const PASS = 'admin123'
const CATS = ['React', 'Go', 'CSS', 'JavaScript', 'Python', 'PHP', 'Genel']
const BLANK_POST = { title: '', titleEn: '', category: 'React', excerpt: '', excerptEn: '', content: '', tags: '', readTime: '5 dk' }
const BLANK_SNIP = { title: '', lang: 'html', code: '', note: '' }
const BLANK_NOTE = { title: '', content: '', category: 'Genel', pinned: false }
const BLANK_TPL = { label: '', category: 'UI', icon: 'fas fa-square', html: '', css: '', js: '' }
const NOTE_CATS = ['Genel', 'Fikir', 'Kaynak', 'Yapılacak', 'Kod Notu']
const TPL_CATS = ['UI', 'Layout', 'Form', 'Animation', 'Other']

const POSTS_KEY = 'mk_blog_posts'
const SNIPPETS_KEY = 'mk_snippets'
const NOTES_KEY = 'mk_editor_notes'
const TEMPLATES_KEY = 'mk_editor_templates'

function getPosts() { return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]') }
function savePosts(p) { localStorage.setItem(POSTS_KEY, JSON.stringify(p)) }
function getSnippets() { return JSON.parse(localStorage.getItem(SNIPPETS_KEY) || '[]') }
function saveSnippets(s) { localStorage.setItem(SNIPPETS_KEY, JSON.stringify(s)) }
function getNotes() { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]') }
function saveNotes(n) { localStorage.setItem(NOTES_KEY, JSON.stringify(n)) }
function getTemplates() { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || '[]') }
function saveTemplates(t) { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(t)) }

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState('')
  const [view, setView] = useState('list') // list | new | edit | snippets | notes | templates | analytics
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState(BLANK_POST)
  const [editId, setEditId] = useState(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Snippets
  const [snippets, setSnippets] = useState([])
  const [snipForm, setSnipForm] = useState(null)
  const [editSnipId, setEditSnipId] = useState(null)

  // Notes
  const [notes, setNotes] = useState([])
  const [noteForm, setNoteForm] = useState(null)
  const [editNoteId, setEditNoteId] = useState(null)

  // Templates
  const [templates, setTemplates] = useState([])
  const [tplForm, setTplForm] = useState(null)
  const [editTplId, setEditTplId] = useState(null)
  const [tplTab, setTplTab] = useState('html')

  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('mk_admin') === '1') {
      setAuth(true)
      setPosts(getPosts())
      setSnippets(getSnippets())
      setNotes(getNotes())
      setTemplates(getTemplates())
    }
  }, [])

  const login = (e) => {
    e.preventDefault()
    if (pass === PASS) {
      sessionStorage.setItem('mk_admin', '1')
      setAuth(true)
      setPosts(getPosts())
      setSnippets(getSnippets())
      setNotes(getNotes())
      setTemplates(getTemplates())
    } else { setPassErr('Yanlış şifre.'); setPass('') }
  }
  const logout = () => { sessionStorage.removeItem('mk_admin'); setAuth(false) }
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }
  const nav = (v) => { setView(v); setSidebarOpen(false) }

  // ── POSTS ──
  const startNew = () => { setForm(BLANK_POST); setEditId(null); nav('new') }
  const startEdit = (p) => { setForm({ ...p, tags: p.tags?.join(', ') || '', titleEn: p.titleEn || '', excerptEn: p.excerptEn || '' }); setEditId(p.id); setView('edit') }
  const deletePost = (id) => {
    if (!window.confirm('Bu yazıyı silmek istediğinden emin misin?')) return
    const updated = posts.filter(p => p.id !== id)
    savePosts(updated); setPosts(updated); showToast('Yazı silindi.')
  }
  const submitPost = (e) => {
    e.preventDefault()
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const today = new Date().toISOString().split('T')[0]
    if (view === 'new') {
      const post = { ...form, id: Date.now().toString(), date: today, tags }
      const updated = [post, ...posts]
      savePosts(updated); setPosts(updated); showToast('Yazı yayınlandı!')
    } else {
      const updated = posts.map(p => p.id === editId ? { ...form, id: editId, date: p.date, tags } : p)
      savePosts(updated); setPosts(updated); showToast('Yazı güncellendi.')
    }
    setView('list')
  }

  // ── SNIPPETS ──
  const submitSnippet = (e) => {
    e.preventDefault()
    const today = new Date().toLocaleDateString('tr-TR')
    let updated
    if (editSnipId) {
      updated = snippets.map(s => s.id === editSnipId ? { ...snipForm, id: editSnipId } : s)
    } else {
      updated = [{ ...snipForm, id: Date.now(), date: today }, ...snippets]
    }
    saveSnippets(updated); setSnippets(updated); setSnipForm(null); setEditSnipId(null); showToast('Snippet kaydedildi.')
  }
  const deleteSnippet = (id) => {
    if (!window.confirm('Snippeti sil?')) return
    const updated = snippets.filter(s => s.id !== id)
    saveSnippets(updated); setSnippets(updated); showToast('Snippet silindi.')
  }

  // ── NOTES ──
  const submitNote = (e) => {
    e.preventDefault()
    const today = new Date().toLocaleDateString('tr-TR')
    let updated
    if (editNoteId) {
      updated = notes.map(n => n.id === editNoteId ? { ...noteForm, id: editNoteId } : n)
    } else {
      updated = [{ ...noteForm, id: Date.now(), date: today }, ...notes]
    }
    saveNotes(updated); setNotes(updated); setNoteForm(null); setEditNoteId(null); showToast('Not kaydedildi.')
  }
  const deleteNote = (id) => {
    if (!window.confirm('Notu sil?')) return
    const updated = notes.filter(n => n.id !== id)
    saveNotes(updated); setNotes(updated); showToast('Not silindi.')
  }
  const togglePin = (id) => {
    const updated = notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n)
    saveNotes(updated); setNotes(updated)
  }

  // ── TEMPLATES ──
  const submitTemplate = (e) => {
    e.preventDefault()
    let updated
    if (editTplId) {
      updated = templates.map(t => t.id === editTplId ? { ...tplForm, id: editTplId } : t)
    } else {
      updated = [{ ...tplForm, id: Date.now() }, ...templates]
    }
    saveTemplates(updated); setTemplates(updated); setTplForm(null); setEditTplId(null); showToast('Şablon kaydedildi.')
  }
  const deleteTemplate = (id) => {
    if (!window.confirm('Şablonu sil?')) return
    const updated = templates.filter(t => t.id !== id)
    saveTemplates(updated); setTemplates(updated); showToast('Şablon silindi.')
  }

  // ── LOGIN ──
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

  // ── MAIN ADMIN ──
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
            <i className="fas fa-list" /> Yazılar
            <span className="nav-badge">{posts.length}</span>
          </button>
          <button className={view === 'new' ? 'active' : ''} onClick={startNew}>
            <i className="fas fa-plus" /> Yeni Yazı
          </button>

          <div className="nav-divider" />
          <div className="nav-section-label">Editör</div>
          <button className={view === 'snippets' ? 'active' : ''} onClick={() => nav('snippets')}>
            <i className="fas fa-bookmark" /> Snippetler
            <span className="nav-badge">{snippets.length}</span>
          </button>
          <button className={view === 'notes' ? 'active' : ''} onClick={() => nav('notes')}>
            <i className="fas fa-sticky-note" /> Notlar
            <span className="nav-badge">{notes.length}</span>
          </button>
          <button className={view === 'templates' ? 'active' : ''} onClick={() => nav('templates')}>
            <i className="fas fa-layer-group" /> Şablonlar
            <span className="nav-badge">{templates.length}</span>
          </button>

          <div className="nav-divider" />
          <div className="nav-section-label">Site</div>
          <button className={view === 'analytics' ? 'active' : ''} onClick={() => nav('analytics')}>
            <i className="fab fa-google" /> Analitik
          </button>
          <button onClick={() => navigate('/blog')}>
            <i className="fas fa-eye" /> Blogu Gör
          </button>
          <button onClick={() => navigate('/editor')}>
            <i className="fas fa-code" /> Editörü Gör
          </button>
          <button onClick={() => navigate('/')}>
            <i className="fas fa-home" /> Ana Sayfa
          </button>
        </nav>
        <button className="logout-btn" onClick={logout}>
          <i className="fas fa-sign-out-alt" /> Çıkış Yap
        </button>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="admin-mobile-bar">
        <button className="hamburger-admin" onClick={() => setSidebarOpen(o => !o)}>
          <i className={`fas fa-${sidebarOpen ? 'times' : 'bars'}`} />
        </button>
        <span className="admin-logo" style={{ fontSize: '.9rem' }}>MK<span>.</span>Admin</span>
        <span />
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN CONTENT */}
      <main className="admin-main">

        {/* ── POSTS LIST ── */}
        {view === 'list' && (
          <>
            <div className="admin-header">
              <div>
                <h2>Yazılar</h2>
                <p className="admin-sub">{posts.length} yazı · LocalStorage</p>
              </div>
              <button className="btn-sm" onClick={startNew}><i className="fas fa-plus" /> Yeni Yazı</button>
            </div>
            <div className="posts-table">
              {posts.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-inbox" />
                  <p>Henüz yazı yok.</p>
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
                    <span className="tr-date">
                      <i className="fas fa-calendar-alt" /> {p.date}
                      &nbsp;·&nbsp;<i className="fas fa-clock" /> {p.readTime}
                    </span>
                  </div>
                  <div className="tr-actions">
                    <button className="act-btn act-view" onClick={() => navigate(`/blog/post/${p.id}`)} title="Görüntüle"><i className="fas fa-eye" /></button>
                    <button className="act-btn act-edit" onClick={() => startEdit(p)} title="Düzenle"><i className="fas fa-pen" /></button>
                    <button className="act-btn act-delete" onClick={() => deletePost(p.id)} title="Sil"><i className="fas fa-trash" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── POST FORM ── */}
        {(view === 'new' || view === 'edit') && (
          <>
            <div className="admin-header">
              <div>
                <h2>{view === 'new' ? 'Yeni Yazı' : 'Yazıyı Düzenle'}</h2>
                <p className="admin-sub">TR + EN içerik girebilirsin</p>
              </div>
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
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
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
                <textarea
                  required rows={16}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={`## Giriş\n\nYazına buradan başla...`}
                />
              </div>
              <div className="form-group">
                <label>Etiketler <span className="label-hint">(virgülle ayır)</span></label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, JavaScript, Frontend" />
              </div>
              <div className="form-submit">
                <button type="submit" className="btn-sm">
                  <i className={`fas fa-${view === 'new' ? 'paper-plane' : 'save'}`} />
                  {view === 'new' ? 'Yayınla' : 'Güncelle'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── SNIPPETS ── */}
        {view === 'snippets' && (
          <>
            <div className="admin-header">
              <div>
                <h2><i className="fas fa-bookmark" /> Snippetler</h2>
                <p className="admin-sub">Editörde görünecek kod parçacıkları</p>
              </div>
              <button className="btn-sm" onClick={() => { setSnipForm(BLANK_SNIP); setEditSnipId(null) }}>
                <i className="fas fa-plus" /> Yeni Snippet
              </button>
            </div>

            {snipForm && (
              <form className="post-form" onSubmit={submitSnippet} style={{ marginBottom: '1.5rem' }}>
                <div className="form-section-label"><i className="fas fa-bookmark" /> {editSnipId ? 'Snippet Düzenle' : 'Yeni Snippet'}</div>
                <div className="form-row">
                  <div className="form-group" style={{ flex: 2 }}>
                    <label>Başlık *</label>
                    <input required value={snipForm.title} onChange={e => setSnipForm(f => ({ ...f, title: e.target.value }))} placeholder="Snippet adı..." />
                  </div>
                  <div className="form-group">
                    <label>Dil</label>
                    <select value={snipForm.lang} onChange={e => setSnipForm(f => ({ ...f, lang: e.target.value }))}>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="js">JavaScript</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Not (opsiyonel)</label>
                  <input value={snipForm.note} onChange={e => setSnipForm(f => ({ ...f, note: e.target.value }))} placeholder="Kısa açıklama..." />
                </div>
                <div className="form-group">
                  <label>Kod *</label>
                  <textarea required rows={10} value={snipForm.code} onChange={e => setSnipForm(f => ({ ...f, code: e.target.value }))} placeholder="Kodu buraya yaz..." style={{ fontFamily: 'var(--mono)', fontSize: '.82rem' }} />
                </div>
                <div className="form-submit" style={{ display: 'flex', gap: '.7rem' }}>
                  <button type="submit" className="btn-sm"><i className="fas fa-save" /> Kaydet</button>
                  <button type="button" className="btn-sm btn-sm--ghost" onClick={() => { setSnipForm(null); setEditSnipId(null) }}><i className="fas fa-times" /> İptal</button>
                </div>
              </form>
            )}

            <div className="posts-table">
              {snippets.length === 0 && !snipForm ? (
                <div className="empty-state">
                  <i className="fas fa-bookmark" />
                  <p>Henüz snippet yok.</p>
                </div>
              ) : snippets.map(s => (
                <div key={s.id} className="table-row">
                  <div className="tr-info">
                    <div className="tr-cats">
                      <span className="tr-cat">{s.lang.toUpperCase()}</span>
                      {s.date && <span className="tr-date"><i className="fas fa-calendar-alt" /> {s.date}</span>}
                    </div>
                    <h3>{s.title}</h3>
                    {s.note && <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.2rem' }}>{s.note}</p>}
                  </div>
                  <div className="tr-actions">
                    <button className="act-btn act-edit" onClick={() => { setSnipForm({ ...s }); setEditSnipId(s.id) }} title="Düzenle"><i className="fas fa-pen" /></button>
                    <button className="act-btn act-delete" onClick={() => deleteSnippet(s.id)} title="Sil"><i className="fas fa-trash" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── NOTES ── */}
        {view === 'notes' && (
          <>
            <div className="admin-header">
              <div>
                <h2><i className="fas fa-sticky-note" /> Notlar</h2>
                <p className="admin-sub">Editörde görünecek notlar</p>
              </div>
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
                    <select value={noteForm.category} onChange={e => setNoteForm(f => ({ ...f, category: e.target.value }))}>
                      {NOTE_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
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
                <div className="empty-state">
                  <i className="fas fa-sticky-note" />
                  <p>Henüz not yok.</p>
                </div>
              ) : [...notes].sort((a, b) => b.pinned - a.pinned).map(n => (
                <div key={n.id} className={`note-admin-card ${n.pinned ? 'pinned' : ''}`}>
                  <div className="note-admin-top">
                    <span className="tr-cat">{n.category}</span>
                    <div className="tr-actions">
                      <button className={`act-btn ${n.pinned ? 'act-view' : ''}`} onClick={() => togglePin(n.id)} title="Sabitle"><i className="fas fa-thumbtack" /></button>
                      <button className="act-btn act-edit" onClick={() => { setNoteForm({ ...n }); setEditNoteId(n.id) }} title="Düzenle"><i className="fas fa-pen" /></button>
                      <button className="act-btn act-delete" onClick={() => deleteNote(n.id)} title="Sil"><i className="fas fa-trash" /></button>
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

        {/* ── TEMPLATES ── */}
        {view === 'templates' && (
          <>
            <div className="admin-header">
              <div>
                <h2><i className="fas fa-layer-group" /> Editör Şablonları</h2>
                <p className="admin-sub">Editörde görünecek HTML/CSS/JS tasarımlar</p>
              </div>
              <button className="btn-sm" onClick={() => { setTplForm(BLANK_TPL); setEditTplId(null); setTplTab('html') }}>
                <i className="fas fa-plus" /> Yeni Şablon
              </button>
            </div>

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
                    <select value={tplForm.category} onChange={e => setTplForm(f => ({ ...f, category: e.target.value }))}>
                      {TPL_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Code tabs for template */}
                <div className="form-section-label" style={{ marginTop: '.5rem' }}><i className="fas fa-code" /> Kod</div>
                <div className="tpl-code-tabs">
                  {['html', 'css', 'js'].map(t => (
                    <button key={t} type="button" className={`tpl-code-tab ${tplTab === t ? 'active' : ''}`} onClick={() => setTplTab(t)}>
                      <i className={t === 'html' ? 'fab fa-html5' : t === 'css' ? 'fab fa-css3-alt' : 'fab fa-js'} /> {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                {tplTab === 'html' && (
                  <div className="form-group">
                    <label>HTML</label>
                    <textarea rows={12} value={tplForm.html} onChange={e => setTplForm(f => ({ ...f, html: e.target.value }))} placeholder="HTML içeriği..." style={{ fontFamily: 'var(--mono)', fontSize: '.82rem' }} />
                  </div>
                )}
                {tplTab === 'css' && (
                  <div className="form-group">
                    <label>CSS</label>
                    <textarea rows={12} value={tplForm.css} onChange={e => setTplForm(f => ({ ...f, css: e.target.value }))} placeholder="CSS stilleri..." style={{ fontFamily: 'var(--mono)', fontSize: '.82rem' }} />
                  </div>
                )}
                {tplTab === 'js' && (
                  <div className="form-group">
                    <label>JavaScript</label>
                    <textarea rows={12} value={tplForm.js} onChange={e => setTplForm(f => ({ ...f, js: e.target.value }))} placeholder="JavaScript kodu..." style={{ fontFamily: 'var(--mono)', fontSize: '.82rem' }} />
                  </div>
                )}

                <div className="form-submit" style={{ display: 'flex', gap: '.7rem' }}>
                  <button type="submit" className="btn-sm"><i className="fas fa-save" /> Kaydet</button>
                  <button type="button" className="btn-sm btn-sm--ghost" onClick={() => { setTplForm(null); setEditTplId(null) }}><i className="fas fa-times" /> İptal</button>
                </div>
              </form>
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
                    <div className="tr-cats">
                      <span className="tr-cat">{t.category}</span>
                    </div>
                    <h3>{t.label}</h3>
                    <span className="tr-date" style={{ gap: '1rem' }}>
                      <span><i className="fab fa-html5" /> {t.html ? `${t.html.split('\n').length}L` : '—'}</span>
                      <span><i className="fab fa-css3-alt" /> {t.css ? `${t.css.split('\n').length}L` : '—'}</span>
                      <span><i className="fab fa-js" /> {t.js ? `${t.js.split('\n').length}L` : '—'}</span>
                    </span>
                  </div>
                  <div className="tr-actions">
                    <button className="act-btn act-edit" onClick={() => { setTplForm({ ...t }); setEditTplId(t.id); setTplTab('html') }} title="Düzenle"><i className="fas fa-pen" /></button>
                    <button className="act-btn act-delete" onClick={() => deleteTemplate(t.id)} title="Sil"><i className="fas fa-trash" /></button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── ANALYTICS ── */}
        {view === 'analytics' && <AnalyticsTab />}
      </main>
    </div>
  )
}
