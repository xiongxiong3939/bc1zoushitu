-- 初始化 PostgreSQL 表，用于替代浏览器 IndexedDB 的部分存储
-- 初始化 SQLite 表，用于替代浏览器 IndexedDB 的部分存储
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS batch_results (
  phase_format TEXT PRIMARY KEY,
  date TEXT,
  phase INTEGER,
  time_utc8 TEXT,
  block_number TEXT,
  hash TEXT,
  result TEXT,
  winner TEXT,
  timestamp INTEGER,
  source TEXT
);

CREATE TABLE IF NOT EXISTS auto_draw_results (
  phase_format TEXT PRIMARY KEY,
  date TEXT,
  phase INTEGER,
  time_utc8 TEXT,
  block_number TEXT,
  hash TEXT,
  result TEXT,
  winner TEXT,
  timestamp INTEGER,
  source TEXT
);

CREATE TABLE IF NOT EXISTS trend_data (
  issue TEXT PRIMARY KEY,
  timestamp INTEGER,
  p1 INTEGER, p2 INTEGER, p3 INTEGER, p4 INTEGER, p5 INTEGER,
  p6 INTEGER, p7 INTEGER, p8 INTEGER, p9 INTEGER, p10 INTEGER
);

CREATE TABLE IF NOT EXISTS betting_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  next_issue TEXT,
  trigger_position TEXT,
  trigger_number INTEGER,
  rule TEXT,
  schemes TEXT,
  exclude TEXT,
  result TEXT,
  checked INTEGER DEFAULT 0,
  is_win INTEGER DEFAULT 0,
  timestamp INTEGER
);

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  timestamp INTEGER
);
