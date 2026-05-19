import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar({ lang, setLang }) {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const t = lang === 'tr'
    ? { portfolio: 'portfolio', editor: 'editör', blog: 'blog' }
    : { portfolio: 'portfolio', editor: 'editor', blog: 'blog' }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">MK<span>.</span></Link>
      <ul className={menuOpen ? 'open' : ''}>
        <li><Link to="/" className={pathname === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>{t.portfolio}</Link></li>
        <li><Link to="/editor" className={pathname === '/editor' ? 'active' : ''} onClick={() => setMenuOpen(false)}><i className="fas fa-code"/> {t.editor}</Link></li>
        <li><Link to="/blog" className={pathname.startsWith('/blog') ? 'active' : ''} onClick={() => setMenuOpen(false)}><i className="fas fa-pen-nib"/> {t.blog}</Link></li>
      </ul>
      <div className="nav-right">
        <button className="lang-toggle" onClick={() => setLang(l => l === 'tr' ? 'en' : 'tr')}>
          <i className="fas fa-globe"/> {lang === 'tr' ? 'EN' : 'TR'}
        </button>
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
          <span className={menuOpen ? 'open' : ''}/>
        </button>
      </div>
    </nav>
  )
}
