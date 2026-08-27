CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  email TEXT,
  name TEXT,
  country TEXT,
  subject TEXT,
  message TEXT,
  body TEXT,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_source ON submissions(source);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  type TEXT NOT NULL,
  page_path TEXT,
  metadata TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
