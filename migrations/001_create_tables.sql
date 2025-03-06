-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Create comments table
CREATE TABLE IF NOT EXISTS tool_comments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tool_name TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert a default user
INSERT INTO users (username, password)
VALUES ('anonymous', 'anonymous_password')
ON CONFLICT (username) DO NOTHING; 