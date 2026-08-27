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
