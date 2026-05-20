const TOKEN_KEY = 'mk_admin_token'

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return data
}

export const api = {
  login: (password) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  logout: () => request('/api/admin/logout', { method: 'POST' }),
  seed: () => request('/api/admin/seed', { method: 'POST' }),

  getPosts: () => request('/api/posts'),
  getPost: (id) => request(`/api/posts/${id}`),

  adminGetPosts: () => request('/api/admin/posts'),
  createPost: (post) => request('/api/admin/posts', { method: 'POST', body: JSON.stringify(post) }),
  updatePost: (id, post) => request(`/api/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(post) }),
  deletePost: (id) => request(`/api/admin/posts/${id}`, { method: 'DELETE' }),

  getTemplates: () => request('/api/templates'),
  adminGetTemplates: () => request('/api/admin/templates'),
  createTemplate: (tpl) => request('/api/admin/templates', { method: 'POST', body: JSON.stringify(tpl) }),
  updateTemplate: (id, tpl) => request(`/api/admin/templates/${id}`, { method: 'PUT', body: JSON.stringify(tpl) }),
  deleteTemplate: (id) => request(`/api/admin/templates/${id}`, { method: 'DELETE' }),

  getNotes: () => request('/api/admin/notes'),
  createNote: (note) => request('/api/admin/notes', { method: 'POST', body: JSON.stringify(note) }),
  updateNote: (id, note) => request(`/api/admin/notes/${id}`, { method: 'PUT', body: JSON.stringify(note) }),
  deleteNote: (id) => request(`/api/admin/notes/${id}`, { method: 'DELETE' }),

  getSettings: () => request('/api/admin/settings'),
  updateSettings: (settings) => request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(settings) }),
}
