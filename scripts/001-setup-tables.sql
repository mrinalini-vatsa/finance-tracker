-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Insert a default user for demo purposes
INSERT INTO users (name, email, avatar_url)
VALUES ('Alex Morgan', 'alex@example.com', NULL)
ON CONFLICT (email) DO NOTHING;

-- Insert some sample transactions for the demo user
INSERT INTO transactions (user_id, amount, type, category, description, date)
SELECT 
  u.id,
  t.amount,
  t.type,
  t.category,
  t.description,
  t.date
FROM users u
CROSS JOIN (VALUES
  (5200.00, 'income', 'Salary', 'Monthly salary', CURRENT_DATE - INTERVAL '2 days'),
  (1500.00, 'income', 'Freelance', 'Web design project', CURRENT_DATE - INTERVAL '5 days'),
  (120.50, 'expense', 'Utilities', 'Electric bill', CURRENT_DATE - INTERVAL '3 days'),
  (85.00, 'expense', 'Groceries', 'Weekly groceries', CURRENT_DATE - INTERVAL '1 day'),
  (45.00, 'expense', 'Entertainment', 'Movie night', CURRENT_DATE - INTERVAL '4 days'),
  (200.00, 'expense', 'Shopping', 'New headphones', CURRENT_DATE - INTERVAL '6 days'),
  (950.00, 'expense', 'Rent', 'Monthly rent payment', CURRENT_DATE - INTERVAL '10 days'),
  (3800.00, 'income', 'Salary', 'Monthly salary', CURRENT_DATE - INTERVAL '32 days'),
  (350.00, 'expense', 'Healthcare', 'Doctor visit', CURRENT_DATE - INTERVAL '15 days'),
  (75.00, 'expense', 'Transportation', 'Gas', CURRENT_DATE - INTERVAL '8 days'),
  (500.00, 'income', 'Investment', 'Stock dividends', CURRENT_DATE - INTERVAL '20 days'),
  (180.00, 'expense', 'Dining', 'Restaurant dinner', CURRENT_DATE - INTERVAL '12 days'),
  (4500.00, 'income', 'Salary', 'Monthly salary', CURRENT_DATE - INTERVAL '62 days'),
  (1200.00, 'expense', 'Rent', 'Monthly rent payment', CURRENT_DATE - INTERVAL '40 days'),
  (250.00, 'expense', 'Shopping', 'Clothes shopping', CURRENT_DATE - INTERVAL '25 days')
) AS t(amount, type, category, description, date)
WHERE u.email = 'alex@example.com'
AND NOT EXISTS (SELECT 1 FROM transactions WHERE user_id = u.id LIMIT 1);
