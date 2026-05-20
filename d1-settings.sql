-- ADIM 1: Sadece aşağıdaki 4 satırı yapıştır. İmleç CREATE satırında olsun. Run.
-- ADIM 2: d1-settings-insert.sql dosyasını çalıştır.

CREATE TABLE IF NOT EXISTS settings (
  "key" TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);
