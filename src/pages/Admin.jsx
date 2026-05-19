import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Analytics from '../components/Analytics'
import '../components/Analytics.css'
import './Admin.css'

const PASS = 'admin123'
const CATS = ['React', 'Go', 'CSS', 'JavaScript', 'Python', 'PHP', 'Genel']
const BLANK = { title: '', titleEn: '', category: 'React', excerpt: '', excerptEn: '', content: '', tags: '', readTime: '5 dk' }

function getPosts() { return JSON.parse(localStorage.getItem('mk_blog_posts') || '[]') }
function savePosts(p) { localStorage.setItem('mk_blog_posts', JSON.stringify(p)) }

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [pass, setPass] = useState('')
  const [passErr, setPassErr] = useState('')
  const [posts, setPosts] = useState([])
  const [view, setView] = useState('list') // list | new | edit | analytics
  const [form, setForm] = useState(BLANK)
  const [editId, setEditId] = useState(null)
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('mk_admin') === '1') { setAuth(true); setPosts(getPosts()) }
  }, [])

  const login = (e) => {
    e.preventDefault()
    if (pass === PASS) { sessionStorage.setItem('mk_admin', '1'); setAuth(true); setPosts(getPosts()) }
    else { setPassErr('Yanlış şifre.'); setPass('') }
  }
  const logout = () => { sessionStorage.removeItem('mk_admin'); setAuth(false) }
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const startNew = () => { setForm(BLANK); setEditId(null); setView('new'); setSidebarOpen(false) }
  const startEdit = (p) => { setForm({ ...p, tags: p.tags?.join(', ') || '', titleEn: p.titleEn || '', excerptEn: p.excerptEn || '' }); setEditId(p.id); setView('edit') }

  const deletePost = (id) => {
    if (!window.confirm('Bu yazıyı silmek istediğinden emin misin?')) return
    const updated = posts.filter(p => p.id !== id)
    savePosts(updated); setPosts(updated); showToast('Yazı silindi.')
  }

  const submit = (e) => {
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

  // ── LOGIN SCREEN ──
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
          <button className={view === 'list' ? 'active' : ''} onClick={() => { setView('list'); setSidebarOpen(false) }}>
            <i className="fas fa-list" /> Yazılar
            <span className="nav-badge">{posts.length}</span>
          </button>
          <button className={view === 'new' ? 'active' : ''} onClick={startNew}>
            <i className="fas fa-plus" /> Yeni Yazı
          </button>
          <button className={view === 'analytics' ? 'active' : ''} onClick={() => { setView('analytics'); setSidebarOpen(false) }}>
            <i className="fab fa-google" /> Analitik
          </button>
          <div className="nav-divider" />
          <button onClick={() => navigate('/blog')}>
            <i className="fas fa-eye" /> Blogu Gör
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

        {/* LIST */}
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

        {/* NEW / EDIT */}
        {(view === 'new' || view === 'edit') && (
          <>
            <div className="admin-header">
              <div>
                <h2>{view === 'new' ? 'Yeni Yazı' : 'Yazıyı Düzenle'}</h2>
                <p className="admin-sub">TR + EN içerik girebilirsin</p>
              </div>
              <button className="btn-sm btn-sm--ghost" onClick={() => setView('list')}><i className="fas fa-arrow-left" /> Geri</button>
            </div>
            <form className="post-form" onSubmit={submit}>
              {/* Türkçe */}
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

              {/* İngilizce */}
              <div className="form-section-label" style={{ marginTop: '.5rem' }}><i className="fas fa-globe" /> English Content <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></div>
              <div className="form-group">
                <label>Title (EN)</label>
                <input value={form.titleEn} onChange={e => setForm(f => ({ ...f, titleEn: e.target.value }))} placeholder="Post title in English..." />
              </div>
              <div className="form-group">
                <label>Excerpt (EN)</label>
                <input value={form.excerptEn} onChange={e => setForm(f => ({ ...f, excerptEn: e.target.value }))} placeholder="Short excerpt in English..." />
              </div>

              {/* İçerik */}
              <div className="form-section-label" style={{ marginTop: '.5rem' }}><i className="fas fa-pen-nib" /> İçerik</div>
              <div className="form-group">
                <label>İçerik * <span className="label-hint">(Markdown: ## Başlık · **bold** · `kod` · ```blok```)</span></label>
                <textarea
                  required rows={16}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder={`## Giriş\n\nYazına buradan başla...\n\n**Kalın metin** ve \`inline kod\` kullanabilirsin.\n\n\`\`\`js\nconsole.log('Merhaba!')\n\`\`\``}
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

        {/* ANALYTICS */}
        {view === 'analytics' && (
          <>
            <div className="admin-header">
              <div>
                <h2>Analitik</h2>
                <p className="admin-sub">Google Analytics 4 kurulum rehberi</p>
              </div>
            </div>
            <Analytics lang="tr" />
          </>
        )}
      </main>
    </div>
  )
}
