const SEED_POSTS = [
  {
    id: '1',
    title: 'React ile Modern Web Uygulaması Geliştirmek',
    titleEn: 'Building Modern Web Apps with React',
    category: 'React',
    date: '2026-05-18',
    readTime: '5 dk',
    excerpt: 'React ekosistemi, hooks ve modern state yönetimi ile nasıl ölçeklenebilir uygulamalar yapılır?',
    excerptEn: 'How to build scalable apps with React hooks and modern state management.',
    content: `## Giriş\n\nReact, günümüzün en popüler frontend kütüphanelerinden biri.\n\n## useState ve useEffect\n\nuseState ile reaktif state yönetimi, useEffect ile yan efekte dayalı işlemler.\n\n\`\`\`js\nconst [count, setCount] = useState(0)\nuseEffect(() => {\n  document.title = count\n}, [count])\n\`\`\`\n\n## Sonuç\n\nReact öğrenmek zaman alır ama ekosistem çok güçlüdür.`,
    tags: ['React', 'JavaScript', 'Frontend'],
  },
  {
    id: '2',
    title: 'Go ile Yüksek Performanslı API Yazma',
    titleEn: 'Building High-Performance APIs with Go',
    category: 'Go',
    date: '2026-05-10',
    readTime: '7 dk',
    excerpt: "Go dilinin sadeliği ve concurrency modeli ile nasıl hızlı, güvenilir REST API'lar inşa edebilirsiniz?",
    excerptEn: "How to build fast, reliable REST APIs with Go's simplicity and concurrency model.",
    content: `## Go Neden?\n\nGo; derlenen, statik tipli bir dil. Backend servislerde muazzam performans sunar.\n\n## Basit HTTP Sunucu\n\n\`\`\`go\npackage main\nimport "net/http"\nfunc main() {\n    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {\n        w.Write([]byte("Merhaba Go!"))\n    })\n    http.ListenAndServe(":8080", nil)\n}\n\`\`\`\n\n## Sonuç\n\nGo ile yazılan servisler hem hızlı hem okunması kolaydır.`,
    tags: ['Go', 'Backend', 'API'],
  },
  {
    id: '3',
    title: 'CSS Grid ve Flexbox: Ne Zaman Hangisi?',
    titleEn: 'CSS Grid vs Flexbox: When to Use Which?',
    category: 'CSS',
    date: '2026-05-02',
    readTime: '4 dk',
    excerpt: 'Grid ve Flexbox arasında seçim yapmak kafa karıştırıcı olabilir. Pratik kurallar paylaşıyorum.',
    excerptEn: 'Choosing between Grid and Flexbox can be confusing. Here are practical rules.',
    content: `## Flexbox\n\nTek boyutlu düzenlemeler için idealdir.\n\n## Grid\n\nİki boyutlu düzenlemeler için kullanın.\n\n## Pratik Kural\n\n- **Flexbox**: Nav, buton grupları\n- **Grid**: Sayfa düzeni, galeri\n\nİkisini birlikte kullanmaktan çekinmeyin!`,
    tags: ['CSS', 'Frontend', 'Design'],
  },
]

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function err(message, status = 400) {
  return json({ error: message }, status)
}

function rowToPost(row) {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en || '',
    category: row.category || '',
    excerpt: row.excerpt || '',
    excerptEn: row.excerpt_en || '',
    content: row.content || '',
    tags: JSON.parse(row.tags || '[]'),
    readTime: row.read_time || '5 dk',
    date: row.date || '',
  }
}

function rowToTemplate(row) {
  return {
    id: row.id,
    label: row.label,
    category: row.category || 'Diğer',
    icon: row.icon || 'fas fa-square',
    html: row.html || '',
    css: row.css || '',
    js: row.js || '',
  }
}

function rowToNote(row) {
  return {
    id: row.id,
    title: row.title,
    content: row.content || '',
    category: row.category || '',
    pinned: !!row.pinned,
    date: row.date || '',
  }
}

function postToDb(post) {
  return {
    id: String(post.id),
    title: post.title,
    title_en: post.titleEn || '',
    category: post.category || '',
    excerpt: post.excerpt || '',
    excerpt_en: post.excerptEn || '',
    content: post.content || '',
    tags: JSON.stringify(post.tags || []),
    read_time: post.readTime || '5 dk',
    date: post.date || new Date().toISOString().split('T')[0],
  }
}

function templateToDb(tpl) {
  return {
    id: String(tpl.id),
    label: tpl.label,
    category: tpl.category || 'Diğer',
    icon: tpl.icon || 'fas fa-square',
    html: tpl.html || '',
    css: tpl.css || '',
    js: tpl.js || '',
  }
}

function noteToDb(note) {
  return {
    id: String(note.id),
    title: note.title,
    content: note.content || '',
    category: note.category || '',
    pinned: note.pinned ? 1 : 0,
    date: note.date || new Date().toLocaleDateString('tr-TR'),
  }
}

async function readBody(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

function getToken(request) {
  const auth = request.headers.get('Authorization') || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

async function isAuthed(request, env) {
  const token = getToken(request)
  if (!token) return false
  const row = await env.DB.prepare(
    'SELECT token FROM sessions WHERE token = ? AND expires_at > datetime(\'now\')'
  ).bind(token).first()
  return !!row
}

async function requireAuth(request, env) {
  if (!(await isAuthed(request, env))) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
}

async function createSession(env) {
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  await env.DB.prepare('INSERT INTO sessions (token, expires_at) VALUES (?, ?)').bind(token, expires).run()
  return token
}

async function getPosts(env) {
  const { results } = await env.DB.prepare('SELECT * FROM posts ORDER BY date DESC, created_at DESC').all()
  return results.map(rowToPost)
}

async function getPost(env, id) {
  const row = await env.DB.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first()
  return row ? rowToPost(row) : null
}

async function insertPost(env, post) {
  const p = postToDb(post)
  await env.DB.prepare(`
    INSERT INTO posts (id, title, title_en, category, excerpt, excerpt_en, content, tags, read_time, date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(p.id, p.title, p.title_en, p.category, p.excerpt, p.excerpt_en, p.content, p.tags, p.read_time, p.date).run()
  return getPost(env, p.id)
}

async function updatePost(env, id, post) {
  const p = postToDb({ ...post, id })
  await env.DB.prepare(`
    UPDATE posts SET title=?, title_en=?, category=?, excerpt=?, excerpt_en=?, content=?, tags=?, read_time=?, date=?
    WHERE id=?
  `).bind(p.title, p.title_en, p.category, p.excerpt, p.excerpt_en, p.content, p.tags, p.read_time, p.date, id).run()
  return getPost(env, id)
}

async function deletePost(env, id) {
  await env.DB.prepare('DELETE FROM posts WHERE id = ?').bind(id).run()
}

async function getTemplates(env) {
  const { results } = await env.DB.prepare('SELECT * FROM templates ORDER BY created_at DESC').all()
  return results.map(rowToTemplate)
}

async function insertTemplate(env, tpl) {
  const t = templateToDb(tpl)
  await env.DB.prepare(`
    INSERT INTO templates (id, label, category, icon, html, css, js)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(t.id, t.label, t.category, t.icon, t.html, t.css, t.js).run()
  const row = await env.DB.prepare('SELECT * FROM templates WHERE id = ?').bind(t.id).first()
  return rowToTemplate(row)
}

async function updateTemplate(env, id, tpl) {
  const t = templateToDb({ ...tpl, id })
  await env.DB.prepare(`
    UPDATE templates SET label=?, category=?, icon=?, html=?, css=?, js=? WHERE id=?
  `).bind(t.label, t.category, t.icon, t.html, t.css, t.js, id).run()
  const row = await env.DB.prepare('SELECT * FROM templates WHERE id = ?').bind(id).first()
  return rowToTemplate(row)
}

async function deleteTemplate(env, id) {
  await env.DB.prepare('DELETE FROM templates WHERE id = ?').bind(id).run()
}

async function getNotes(env) {
  const { results } = await env.DB.prepare('SELECT * FROM notes ORDER BY pinned DESC, created_at DESC').all()
  return results.map(rowToNote)
}

async function insertNote(env, note) {
  const n = noteToDb(note)
  await env.DB.prepare(`
    INSERT INTO notes (id, title, content, category, pinned, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(n.id, n.title, n.content, n.category, n.pinned, n.date).run()
  const row = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(n.id).first()
  return rowToNote(row)
}

async function updateNote(env, id, note) {
  const n = noteToDb({ ...note, id })
  await env.DB.prepare(`
    UPDATE notes SET title=?, content=?, category=?, pinned=?, date=? WHERE id=?
  `).bind(n.title, n.content, n.category, n.pinned, n.date, id).run()
  const row = await env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first()
  return rowToNote(row)
}

async function deleteNote(env, id) {
  await env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run()
}

async function getSettings(env) {
  const { results } = await env.DB.prepare('SELECT "key", value FROM settings').all()
  const map = Object.fromEntries(results.map(r => [r.key, r.value]))
  return { gaMeasurementId: map.ga_measurement_id || '' }
}

async function updateSettings(env, data) {
  if (data.gaMeasurementId !== undefined) {
    await env.DB.prepare(`
      INSERT INTO settings ("key", value) VALUES ('ga_measurement_id', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).bind(data.gaMeasurementId).run()
  }
  return getSettings(env)
}

async function seedDatabase(env) {
  const count = await env.DB.prepare('SELECT COUNT(*) as c FROM posts').first()
  if (count?.c > 0) return { seeded: false, message: 'Posts already exist' }
  for (const post of SEED_POSTS) {
    await insertPost(env, post)
  }
  return { seeded: true, count: SEED_POSTS.length }
}

async function handleApi(request, env) {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  try {
    // Public
    if (method === 'GET' && path === '/api/posts') {
      return json(await getPosts(env))
    }

    if (method === 'GET' && path.startsWith('/api/posts/')) {
      const id = path.slice('/api/posts/'.length)
      const post = await getPost(env, id)
      if (!post) return err('Post not found', 404)
      return json(post)
    }

    if (method === 'GET' && path === '/api/templates') {
      return json(await getTemplates(env))
    }

    // Auth
    if (method === 'POST' && path === '/api/admin/login') {
      const body = await readBody(request)
      const password = env.ADMIN_PASSWORD || 'admin123'
      if (!body?.password || body.password !== password) return err('Invalid password', 401)
      const token = await createSession(env)
      return json({ token })
    }

    if (method === 'POST' && path === '/api/admin/logout') {
      const token = getToken(request)
      if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
      return json({ ok: true })
    }

    if (method === 'POST' && path === '/api/admin/seed') {
      await requireAuth(request, env)
      return json(await seedDatabase(env))
    }

    // Admin — posts
    if (path === '/api/admin/posts') {
      await requireAuth(request, env)
      if (method === 'GET') return json(await getPosts(env))
      if (method === 'POST') {
        const body = await readBody(request)
        if (!body?.title) return err('Title required')
        const post = await insertPost(env, { ...body, id: Date.now().toString() })
        return json(post, 201)
      }
    }

    if (path.startsWith('/api/admin/posts/')) {
      await requireAuth(request, env)
      const id = path.slice('/api/admin/posts/'.length)
      if (method === 'PUT') {
        const body = await readBody(request)
        const existing = await getPost(env, id)
        if (!existing) return err('Post not found', 404)
        const post = await updatePost(env, id, { ...existing, ...body, id })
        return json(post)
      }
      if (method === 'DELETE') {
        await deletePost(env, id)
        return json({ ok: true })
      }
    }

    // Admin — templates
    if (path === '/api/admin/templates') {
      await requireAuth(request, env)
      if (method === 'GET') return json(await getTemplates(env))
      if (method === 'POST') {
        const body = await readBody(request)
        if (!body?.label) return err('Label required')
        const tpl = await insertTemplate(env, { ...body, id: Date.now().toString() })
        return json(tpl, 201)
      }
    }

    if (path.startsWith('/api/admin/templates/')) {
      await requireAuth(request, env)
      const id = path.slice('/api/admin/templates/'.length)
      if (method === 'PUT') {
        const body = await readBody(request)
        const tpl = await updateTemplate(env, id, body)
        return json(tpl)
      }
      if (method === 'DELETE') {
        await deleteTemplate(env, id)
        return json({ ok: true })
      }
    }

    // Admin — notes
    if (path === '/api/admin/notes') {
      await requireAuth(request, env)
      if (method === 'GET') return json(await getNotes(env))
      if (method === 'POST') {
        const body = await readBody(request)
        if (!body?.title) return err('Title required')
        const note = await insertNote(env, { ...body, id: Date.now().toString() })
        return json(note, 201)
      }
    }

    if (path.startsWith('/api/admin/notes/')) {
      await requireAuth(request, env)
      const id = path.slice('/api/admin/notes/'.length)
      if (method === 'PUT') {
        const body = await readBody(request)
        const note = await updateNote(env, id, body)
        return json(note)
      }
      if (method === 'DELETE') {
        await deleteNote(env, id)
        return json({ ok: true })
      }
    }

    // Admin — settings
    if (path === '/api/admin/settings') {
      await requireAuth(request, env)
      if (method === 'GET') return json(await getSettings(env))
      if (method === 'PUT') {
        const body = await readBody(request)
        return json(await updateSettings(env, body))
      }
    }

    return err('Not found', 404)
  } catch (e) {
    if (e instanceof Response) return e
    console.error(e)
    return err('Internal server error', 500)
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
