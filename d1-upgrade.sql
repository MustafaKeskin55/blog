-- =============================================================================
-- BLOG D1 — TEK SEFERDE GÜNCELLEME (tabloları SİLMEZ, veriyi SİLMEZ)
-- Veritabanı: blog
--
-- Wrangler (önerilen — tüm dosyayı çalıştırır):
--   npx wrangler d1 execute blog --remote --file=d1-upgrade.sql
--
-- D1 Console: Her CREATE/ALTER bloğunu ayrı seçip Run (imleç o blokta olsun).
-- "duplicate column name" hatası = kolon zaten var, o ALTER'ı atla, devam et.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Eksik tabloları oluştur (varsa dokunmaz)
-- -----------------------------------------------------------------------------

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
  mode TEXT DEFAULT 'html',
  py TEXT DEFAULT '',
  deps TEXT DEFAULT '',
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
  "key" TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 2) Eski templates tablosuna yeni kolonlar (React/Python şablonları)
--    Kolon zaten varsa hata verir — görmezden gel, sonraki satıra geç.
-- -----------------------------------------------------------------------------

ALTER TABLE templates ADD COLUMN mode TEXT DEFAULT 'html';

ALTER TABLE templates ADD COLUMN py TEXT DEFAULT '';

ALTER TABLE templates ADD COLUMN deps TEXT DEFAULT '';

-- -----------------------------------------------------------------------------
-- 3) Varsayılan ayarlar ve mevcut kayıtları düzelt
-- -----------------------------------------------------------------------------

INSERT OR IGNORE INTO settings ("key", value) VALUES ('ga_measurement_id', '');

UPDATE templates SET mode = 'html' WHERE mode IS NULL OR mode = '';

UPDATE templates SET py = '' WHERE py IS NULL;

UPDATE templates SET deps = '' WHERE deps IS NULL;
