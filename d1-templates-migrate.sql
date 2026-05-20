-- Mevcut D1 veritabanına şablon modu alanları (Console'da tek tek çalıştır)
ALTER TABLE templates ADD COLUMN mode TEXT DEFAULT 'html';
ALTER TABLE templates ADD COLUMN py TEXT DEFAULT '';
ALTER TABLE templates ADD COLUMN deps TEXT DEFAULT '';
