PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
CREATE TABLE IF NOT EXISTS requests (
 id TEXT PRIMARY KEY, reference TEXT NOT NULL UNIQUE, email_hash TEXT NOT NULL,
 private_data TEXT NOT NULL, service TEXT NOT NULL, preferred_date TEXT NOT NULL,
 preferred_time TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'submitted',
 appointment TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
 idempotency_hash TEXT NOT NULL UNIQUE, payload_hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS requests_status_date ON requests(status, created_at DESC);
CREATE TABLE IF NOT EXISTS events (
 id INTEGER PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id),
 previous_status TEXT, status TEXT NOT NULL, created_at TEXT NOT NULL,
 actor TEXT NOT NULL, message TEXT NOT NULL, appointment TEXT
);
CREATE INDEX IF NOT EXISTS events_request ON events(request_id,id);
CREATE TABLE IF NOT EXISTS notes (
 id INTEGER PRIMARY KEY, request_id TEXT NOT NULL REFERENCES requests(id),
 body TEXT NOT NULL, actor TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS staff (
 id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('staff','admin')), active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS sessions (
 hash TEXT PRIMARY KEY, kind TEXT NOT NULL, subject TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS challenges (
 id TEXT PRIMARY KEY, request_id TEXT REFERENCES requests(id), code_hash TEXT NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0, expires_at INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit (
 id INTEGER PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, request_id TEXT, created_at TEXT NOT NULL
);
