CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT DEFAULT '',
  category TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  excerpt_en TEXT DEFAULT '',
  content TEXT DEFAULT '',
  tags TEXT DEFAULT '[]',
  read_time TEXT DEFAULT '5 dk',
  date TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT DEFAULT 'Diğer',
  icon TEXT DEFAULT 'fas fa-square',
  html TEXT DEFAULT '',
  css TEXT DEFAULT '',
  js TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
