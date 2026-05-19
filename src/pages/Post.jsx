import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import './Post.css'

function parseContent(text) {
  return text
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|p|u|o|pre|code|li])(.+)$/gm, '<p>$1</p>')
}

export default function Post() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [allPosts, setAllPosts] = useState([])
  const [scroll, setScroll] = useState(0)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('mk_blog_posts') || '[]')
    setAllPosts(stored)
    const found = stored.find(p => p.id === id)
    if (found) setPost(found)
  }, [id])

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100
      setScroll(pct)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!post) return (
    <div className="post-not-found">
      <i className="fas fa-file-slash" />
      <p>Yazı bulunamadı.</p>
      <Link to="/blog" className="btn btn-ghost">← Blog'a Dön</Link>
    </div>
  )

  const idx = allPosts.findIndex(p => p.id === id)
  const prev = idx > 0 ? allPosts[idx - 1] : null
  const next = idx < allPosts.length - 1 ? allPosts[idx + 1] : null

  return (
    <div className="post-page">
      {/* Progress bar */}
      <div className="progress-bar" style={{ width: `${scroll}%` }} />

      <div className="grid-bg" />
      <div className="post-hero">
        <div className="post-hero-inner">
          <Link to="/blog" className="back-link"><i className="fas fa-arrow-left" /> Blog'a Dön</Link>
          <span className="post-cat-hero">{post.category}</span>
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span><i className="fas fa-calendar-alt" /> {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span><i className="fas fa-clock" /> {post.readTime} okuma</span>
          </div>
        </div>
      </div>

      <article className="post-body">
        <div className="post-content" dangerouslySetInnerHTML={{ __html: parseContent(post.content) }} />

        {post.tags?.length > 0 && (
          <div className="post-tag-section">
            {post.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
          </div>
        )}
      </article>

      {(prev || next) && (
        <div className="post-nav">
          {prev ? (
            <Link to={`/blog/post/${prev.id}`} className="pn-card pn-prev">
              <span className="pn-label"><i className="fas fa-arrow-left" /> Önceki</span>
              <span className="pn-title">{prev.title}</span>
            </Link>
          ) : <div />}
          {next && (
            <Link to={`/blog/post/${next.id}`} className="pn-card pn-next">
              <span className="pn-label">Sonraki <i className="fas fa-arrow-right" /></span>
              <span className="pn-title">{next.title}</span>
            </Link>
          )}
        </div>
      )}

      <footer className="site-footer">
        <p>Designed & Built by <b>Mustafa Keskin</b> — © 2026 · Türkiye 🇹🇷</p>
      </footer>
    </div>
  )
}
