-- Migration 0003: จำกัดจำนวนครั้งที่ล็อกอินผิด (rate limit)
CREATE TABLE IF NOT EXISTS login_attempts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  key        TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_login_attempts_key ON login_attempts(key, created_at);
