CREATE TABLE IF NOT EXISTS funds_contributions (
  id TEXT PRIMARY KEY,
  contributorName TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  paymentMode TEXT NOT NULL,
  note TEXT,
  imageUrl TEXT,
  imagePublicId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_funds_contributions_date ON funds_contributions(date DESC);
CREATE INDEX IF NOT EXISTS idx_funds_contributions_name ON funds_contributions(contributorName);

CREATE TABLE IF NOT EXISTS funds_expenses (
  id TEXT PRIMARY KEY,
  expenseName TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  paidTo TEXT,
  description TEXT,
  receiptUrl TEXT,
  receiptPublicId TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_funds_expenses_date ON funds_expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_funds_expenses_category ON funds_expenses(category);
