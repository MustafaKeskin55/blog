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

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT DEFAULT '',
  pinned INTEGER DEFAULT 0,
  date TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('ga_measurement_id', '');
