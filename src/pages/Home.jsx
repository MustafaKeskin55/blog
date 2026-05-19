import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const SKILLS = {
  Languages: [
    { icon: 'fab fa-js', label: 'JavaScript' },
    { icon: 'fab fa-python', label: 'Python' },
    { icon: 'fab fa-php', label: 'PHP' },
    { icon: 'fas fa-code', label: 'C#' },
    { icon: 'fas fa-code', label: 'Go' },
    { icon: 'fab fa-html5', label: 'HTML5' },
    { icon: 'fab fa-css3-alt', label: 'CSS3' },
  ],
  'Tools & Frameworks': [
    { icon: 'fab fa-bootstrap', label: 'Bootstrap' },
    { icon: 'fab fa-react', label: 'React' },
    { icon: 'fab fa-git-alt', label: 'Git' },
    { icon: 'fab fa-github', label: 'GitHub' },
    { icon: 'fas fa-database', label: 'MySQL' },
    { icon: 'fas fa-database', label: 'PostgreSQL' },
  ],
  'Creative & Hardware': [
    { icon: 'fab fa-figma', label: 'Figma' },
    { icon: 'fas fa-cube', label: 'Blender' },
    { icon: 'fas fa-gamepad', label: 'Unreal' },
    { icon: 'fas fa-microchip', label: 'Arduino' },
    { icon: 'fas fa-image', label: 'Photoshop' },
  ],
}

const PROJECTS = [
  { icon: 'fas fa-tooth', title: 'Diş Randevu Sistemi', desc: 'PHP ile geliştirilmiş tam kapsamlı web tabanlı diş kliniği randevu yönetim sistemi.', lang: 'PHP', langColor: '#4f5d95', tags: ['Web App', 'Backend'], url: 'https://github.com/MustafaKeskin55/Dis-Randavu-Sistemi-Web' },
  { icon: 'fas fa-chart-line', title: 'Halka Arz Hesaplama', desc: 'Halka arz hisselerinden elde edilecek kazancı otomatik hesaplayan yatırımcı aracı.', lang: 'JavaScript', langColor: '#f1e05a', tags: ['Finance', 'Tool'], url: 'https://github.com/MustafaKeskin55/HalkaArzHisseKazancHesaplama' },
  { icon: 'fas fa-shield-alt', title: 'Admin Panel', desc: 'Modern, responsive yönetici panel arayüzü. Temiz CSS mimarisi ve kullanıcı dostu tasarım.', lang: 'CSS', langColor: '#563d7c', tags: ['UI/UX', 'Dashboard'], url: 'https://github.com/MustafaKeskin55/Admin-site' },
  { icon: 'fas fa-palette', title: 'Frontend Design', desc: 'Modern frontend bileşenleri ve UI/UX tasarım denemeleri koleksiyonu.', lang: 'HTML/CSS', langColor: '#e34c26', tags: ['Frontend', 'Design'], url: 'https://github.com/MustafaKeskin55/Frontend-Design' },
  { icon: 'fas fa-star', title: 'Particles Animation', desc: 'Canvas API ile oluşturulan interaktif parçacık animasyonu. Saf JavaScript.', lang: 'HTML', langColor: '#e34c26', tags: ['Animation', 'Canvas'], url: 'https://github.com/MustafaKeskin55/Particles-Animation' },
]

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1 })
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function ParticlesCanvas() {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current
    const ctx = c.getContext('2d')
    let W, H, anim
    const particles = []
    function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    class P {
      constructor() { this.reset() }
      reset() { this.x = Math.random() * W; this.y = Math.random() * H; this.r = Math.random() * 1.5 + .3; this.vx = (Math.random() - .5) * .4; this.vy = (Math.random() - .5) * .4; this.a = Math.random(); this.da = Math.random() * .005 + .002 }
      update() { this.x += this.vx; this.y += this.vy; this.a += this.da; if (this.a > 1 || this.a < 0) this.da *= -1; if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset() }
      draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fillStyle = `rgba(0,212,255,${this.a * .4})`; ctx.fill() }
    }
    for (let i = 0; i < 120; i++) particles.push(new P())
    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) { ctx.beginPath(); ctx.strokeStyle = `rgba(0,212,255,${.15 * (1 - d / 120)})`; ctx.lineWidth = .5; ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke() }
        }
      }
    }
    function animate() { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw() }); drawLines(); anim = requestAnimationFrame(animate) }
    animate()
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}

export default function Home() {
  useReveal()
  return (
    <>
      <ParticlesCanvas />
      <div className="grid-bg" />

      {/* HERO */}
      <header className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-eyebrow">Merhaba, ben</div>
            <h1>Mustafa<br /><span className="name-accent">Keskin</span></h1>
            <p className="hero-desc">
              <b>Full Stack Yazılım Geliştirici</b> — Türkiye'den. Web uygulamaları,
              backend sistemleri ve yaratıcı dijital deneyimler üretiyorum.
              Kod yazmak benim için sadece iş değil, <b>tutku</b>.
            </p>
            <div className="hero-btns">
              <a href="#projeler" className="btn btn-primary"><i className="fas fa-code" /> Projelerimi Gör</a>
              <a href="https://github.com/MustafaKeskin55" target="_blank" rel="noopener" className="btn btn-ghost"><i className="fab fa-github" /> GitHub</a>
              <Link to="/blog" className="btn btn-ghost"><i className="fas fa-pen-nib" /> Blog</Link>
            </div>
            <div className="hero-stats">
              <div><span className="stat-num">22+</span><span className="stat-label">Repository</span></div>
              <div><span className="stat-num">7+</span><span className="stat-label">Teknoloji</span></div>
              <div><span className="stat-num">∞</span><span className="stat-label">Öğrenme İsteği</span></div>
            </div>
          </div>
          <div className="terminal">
            <div className="terminal-bar">
              <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
              <span className="terminal-title">mustafa@dev:~</span>
            </div>
            <div className="terminal-body">
              <div><span className="t-prompt">❯</span> <span className="t-cmd">whoami</span></div>
              <div className="t-accent">mustafa_keskin</div><br />
              <div><span className="t-prompt">❯</span> <span className="t-cmd">cat about.json</span></div>
              <div className="t-out">{'{'}</div>
              <div className="t-out">&nbsp;&nbsp;<span className="t-accent">"role"</span>: <span className="t-str">"Full Stack Dev"</span>,</div>
              <div className="t-out">&nbsp;&nbsp;<span className="t-accent">"location"</span>: <span className="t-str">"Türkiye 🇹🇷"</span>,</div>
              <div className="t-out">&nbsp;&nbsp;<span className="t-accent">"repos"</span>: <span className="t-num">22</span>,</div>
              <div className="t-out">&nbsp;&nbsp;<span className="t-accent">"status"</span>: <span className="t-str">"open_to_work"</span></div>
              <div className="t-out">{'}'}</div><br />
              <div><span className="t-prompt">❯</span> <span className="t-cmd">npm run dev</span> <span className="cursor" /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="glow-divider" />

      {/* HAKKIMDA */}
      <section className="section" id="hakkimda">
        <div className="reveal">
          <div className="section-label">01. about_me</div>
          <h2 className="section-title-big">Hakkımda<span>.</span></h2>
        </div>
        <div className="about-grid">
          <div className="about-text reveal">
            <p>Merhaba! Ben <b>Mustafa Keskin</b> — yazılıma olan tutkusuyla kendini geliştirmeye devam eden bir Full Stack Geliştiricisiyim.</p>
            <p><b>JavaScript, Python, PHP, C# ve Go</b> başta olmak üzere birçok dil ile web uygulamaları, yönetim panelleri ve backend sistemleri geliştiriyorum.</p>
            <p>Sadece kod yazmıyorum — <b>Figma</b> ile UI tasarlıyor, <b>Blender</b> ile 3D çalışmalar yapıyor, <b>Arduino</b> ile donanım projeleri geliştiriyorum.</p>
            <div className="about-highlights">
              {['Web Geliştirme', 'Backend Sistemleri', 'UI/UX Tasarım', '3D & Oyun', 'Arduino / IoT', 'Veritabanı'].map(h => (
                <div key={h} className="highlight-item"><i className="fas fa-chevron-right" /> {h}</div>
              ))}
            </div>
          </div>
          <div className="code-window reveal">
            <div className="code-window-bar">
              <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
              <span className="file-label">developer.ts</span>
            </div>
            <div className="code-window-body">
              <span className="c-kw">interface</span> <span className="c-fn">Developer</span> {'{'}<br />
              &nbsp;&nbsp;<span className="c-prop">name</span>: <span className="c-kw">string</span>;<br />
              &nbsp;&nbsp;<span className="c-prop">location</span>: <span className="c-kw">string</span>;<br />
              &nbsp;&nbsp;<span className="c-prop">skills</span>: <span className="c-kw">string</span>[];<br />
              {'}'}<br /><br />
              <span className="c-kw">const</span> <span className="c-prop">mustafa</span>: <span className="c-fn">Developer</span> = {'{'}<br />
              &nbsp;&nbsp;<span className="c-prop">name</span>: <span className="c-str">"Mustafa Keskin"</span>,<br />
              &nbsp;&nbsp;<span className="c-prop">location</span>: <span className="c-str">"Türkiye 🇹🇷"</span>,<br />
              &nbsp;&nbsp;<span className="c-prop">skills</span>: [<span className="c-str">"JS"</span>, <span className="c-str">"Python"</span>, <span className="c-str">"Go"</span>],<br />
              {'}'};<br /><br />
              <span className="c-cm">{'// Always learning 🚀'}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="glow-divider" />

      {/* BECERİLER */}
      <section className="section" id="beceriler">
        <div className="reveal">
          <div className="section-label">02. tech_stack</div>
          <h2 className="section-title-big">Beceriler<span>.</span></h2>
        </div>
        {Object.entries(SKILLS).map(([cat, items]) => (
          <div key={cat} className="skill-cat reveal">
            <h3>{cat}</h3>
            <div className="skills-wrapper">
              {items.map(s => (
                <div key={s.label} className="skill-pill">
                  <i className={s.icon} /><span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="glow-divider" />

      {/* PROJELER */}
      <section className="section" id="projeler">
        <div className="reveal">
          <div className="section-label">03. featured_work</div>
          <h2 className="section-title-big">Projeler<span>.</span></h2>
        </div>
        <div className="projects-grid">
          {PROJECTS.map(p => (
            <article key={p.title} className="project-card reveal">
              <div className="project-top">
                <div className="project-icon"><i className={p.icon} /></div>
                <div className="project-links">
                  <a href={p.url} target="_blank" rel="noopener"><i className="fab fa-github" /></a>
                </div>
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <div className="project-footer">
                <span className="lang-label">
                  <span className="lang-dot" style={{ background: p.langColor }} />{p.lang}
                </span>
                <div className="project-tags">
                  {p.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                </div>
              </div>
            </article>
          ))}
          <article className="project-card project-card--dashed reveal">
            <i className="fab fa-github" style={{ fontSize: '2.5rem', color: 'var(--muted)', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--muted)' }}>22+ Proje</h3>
            <p style={{ color: 'var(--muted)' }}>GitHub profilimde tüm projeleri görebilirsiniz.</p>
            <a href="https://github.com/MustafaKeskin55?tab=repositories" target="_blank" rel="noopener" className="btn btn-ghost" style={{ marginTop: '1rem', fontSize: '.78rem' }}>
              Tümünü Gör <i className="fas fa-arrow-right" />
            </a>
          </article>
        </div>
      </section>

      <div className="glow-divider" />

      {/* İLETİŞİM */}
      <section className="section" id="iletisim">
        <div className="reveal">
          <div className="section-label">04. get_in_touch</div>
          <h2 className="section-title-big">İletişim<span>.</span></h2>
        </div>
        <div className="contact-inner">
          <div className="contact-text reveal">
            <h2>Birlikte bir şeyler<br />inşa edelim.</h2>
            <p>Yeni bir proje fikrin mi var? İş birliği yapmak mı istiyorsun? Her türlü mesajına açığım.</p>
            <a href="https://github.com/MustafaKeskin55" target="_blank" rel="noopener" className="contact-link">
              <div className="contact-link-icon"><i className="fab fa-github" /></div>
              <div><span className="cl-label">GitHub</span><span className="cl-val">@MustafaKeskin55</span></div>
              <i className="fas fa-arrow-right" style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: '.8rem' }} />
            </a>
          </div>
          <div className="social-grid reveal">
            {[
              { icon: 'fab fa-github', label: 'GitHub', url: 'https://github.com/MustafaKeskin55' },
              { icon: 'fab fa-codepen', label: 'CodePen', url: 'https://codepen.io' },
              { icon: 'fab fa-linkedin-in', label: 'LinkedIn', url: 'https://linkedin.com' },
              { icon: 'fab fa-instagram', label: 'Instagram', url: 'https://instagram.com' },
              { icon: 'fab fa-behance', label: 'Behance', url: 'https://behance.net' },
              { icon: 'fab fa-youtube', label: 'YouTube', url: 'https://youtube.com' },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener" className="social-card">
                <i className={s.icon} /><span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <p>Designed & Built by <b>Mustafa Keskin</b> — © 2026 · Türkiye 🇹🇷</p>
      </footer>
    </>
  )
}
