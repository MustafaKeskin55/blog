import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import './Blog.css'

function useSEO({ title, description, url }) {
  useEffect(() => {
    document.title = title
    let desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', description)
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)
    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description)
    let ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) ogUrl.setAttribute('content', url)
    let canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute('href', url)
  }, [title, description, url])
}


const T = {
  tr: { hero: "Yazılar", heroSub: "Yazılım, tasarım ve teknoloji üzerine düşüncelerim.", search: "Yazı ara...", readMore: "Oku", min: "dk", all: "Tümü", notFound: "Yazı bulunamadı." },
  en: { hero: "Blog", heroSub: "My thoughts on software, design and technology.", search: "Search posts...", readMore: "Read", min: "min", all: "All", notFound: "No posts found." }
}

export default function Blog({ lang = 'tr' }) {
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const t = T[lang]

  useEffect(() => {
    api.getPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
  }, [])
  useEffect(() => { setActiveCategory('all') }, [lang])

  const dynamicCats = [...new Set(posts.map(p => p.category))].sort()
  const allLabel = lang === 'tr' ? 'Tümü' : 'All'
  const cats = [allLabel, ...dynamicCats]

  // Aktif kategoriye göre SEO dinamik güncelle
  useEffect(() => {
    const isAll = activeCategory === 'all'
    const catName = isAll ? null : activeCategory
    const title = catName
      ? (lang === 'en' ? `${catName} Posts | Mustafa Keskin` : `${catName} Yazıları | Mustafa Keskin`)
      : (lang === 'en' ? 'Blog | Mustafa Keskin — Full Stack Developer' : 'Blog | Mustafa Keskin — Yazılım & Teknoloji')
    const description = catName
      ? (lang === 'en'
          ? `Mustafa Keskin's posts about ${catName}. Hands-on articles with code examples.`
          : `Mustafa Keskin'in ${catName} üzerine yazdığı yazılar. Kodlu, pratik içerikler.`)
      : (lang === 'en'
          ? "Mustafa Keskin's blog about React, Go, JavaScript, CSS and modern web development."
          : "Mustafa Keskin'in React, Go, JavaScript, CSS ve modern web geliştirme üzerine yazıları.")
    document.title = title
    const set = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val) }
    set('meta[name="description"]', 'content', description)
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:description"]', 'content', description)
    const url = catName
      ? `https://mustafakeskin.pages.dev/blog?kategori=${encodeURIComponent(catName)}`
      : 'https://mustafakeskin.pages.dev/blog'
    set('meta[property="og:url"]', 'content', url)
    set('link[rel="canonical"]', 'href', url)
  }, [activeCategory, lang])

  const filtered = posts.filter(p => {
    const allCat = activeCategory === 'all' || activeCategory === 'Tümü' || activeCategory === 'All'
    const matchCat = allCat || p.category === activeCategory
    const title = lang === 'en' && p.titleEn ? p.titleEn : p.title
    const excerpt = lang === 'en' && p.excerptEn ? p.excerptEn : p.excerpt
    const matchSearch = title.toLowerCase().includes(search.toLowerCase()) || excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="blog-page">
      <div className="grid-bg" />

      {/* HERO */}
      <div className="blog-hero">
        <div className="blog-hero-glow" />
        <div className="blog-hero-inner">
          <div className="blog-hero-eyebrow"><span className="eyebrow-dot" />mustafa.dev/blog</div>
          <h1>{t.hero}<span className="dot-accent">.</span></h1>
          <p>{t.heroSub}</p>
          <div className="blog-search-wrap">
            <i className="fas fa-search" />
            <input type="text" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button className="search-clear" onClick={() => setSearch('')}><i className="fas fa-times" /></button>}
          </div>
          <div className="blog-stats">
            <span><i className="fas fa-file-alt" /> {posts.length} {lang === 'tr' ? 'Yazı' : 'Posts'}</span>
            <span><i className="fas fa-tags" /> {[...new Set(posts.map(p => p.category))].length} {lang === 'tr' ? 'Kategori' : 'Categories'}</span>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="blog-filter-wrap">
        <div className="blog-filter-bar">
          {cats.map((c, i) => {
            const val = i === 0 ? 'all' : c
            return (
              <button key={c} className={`cat-btn ${activeCategory === val ? 'active' : ''}`} onClick={() => setActiveCategory(val)}>
                {c}
                {i > 0 && <span className="cat-count">{posts.filter(p => p.category === c).length}</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* POSTS */}
      <div className="blog-content">
        {filtered.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon"><i className="fas fa-search" /></div>
            <p>{t.notFound}</p>
            <button className="btn btn-ghost" onClick={() => { setSearch(''); setActiveCategory('all') }}>
              {lang === 'tr' ? 'Sıfırla' : 'Reset'}
            </button>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {filtered.length > 0 && activeCategory === 'all' && !search && (
              <Link to={`/blog/post/${filtered[0].id}`} className="post-featured">
                <div className="post-featured-left">
                  <div className="post-featured-top">
                    <span className="post-cat">{filtered[0].category}</span>
                    <span className="post-read"><i className="fas fa-clock" /> {filtered[0].readTime}</span>
                  </div>
                  <h2>{lang === 'en' && filtered[0].titleEn ? filtered[0].titleEn : filtered[0].title}</h2>
                  <p>{lang === 'en' && filtered[0].excerptEn ? filtered[0].excerptEn : filtered[0].excerpt}</p>
                  <div className="post-tags">
                    {filtered[0].tags?.map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                  </div>
                </div>
                <div className="post-featured-right">
                  <div className="post-featured-meta">
                    <span><i className="fas fa-calendar-alt" /> {new Date(filtered[0].date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="read-cta">{t.readMore} <i className="fas fa-arrow-right" /></span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="posts-grid">
              {(activeCategory === 'all' && !search ? filtered.slice(1) : filtered).map(p => (
                <Link to={`/blog/post/${p.id}`} key={p.id} className="post-card">
                  <div className="post-card-inner">
                    <div className="post-card-top">
                      <span className="post-cat">{p.category}</span>
                      <span className="post-read"><i className="fas fa-clock" /> {p.readTime}</span>
                    </div>
                    <h3>{lang === 'en' && p.titleEn ? p.titleEn : p.title}</h3>
                    <p className="post-excerpt">{lang === 'en' && p.excerptEn ? p.excerptEn : p.excerpt}</p>
                    <div className="post-card-footer">
                      <span className="post-date">{new Date(p.date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' })}</span>
                      <span className="post-arrow"><i className="fas fa-arrow-right" /></span>
                    </div>
                  </div>
                  <div className="post-tags" style={{ padding: '0 1.5rem 1.2rem' }}>
                    {p.tags?.map(tag => <span key={tag} className="tag-chip">{tag}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="site-footer">
        <p>Designed & Built by <b>Mustafa Keskin</b> — © 2026 · 🇹🇷</p>
      </footer>
    </div>
  )
}
