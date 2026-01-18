-- Supabase Database Setup for King Myco Integration

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId BIGINT UNIQUE NOT NULL,
  telegramName TEXT,
  totalSpores INT DEFAULT 0,
  questsCompleted INT DEFAULT 0,
  buttonPushes INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId BIGINT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES user_profiles(userId) ON DELETE CASCADE
);

-- Spore transactions log (audit trail)
CREATE TABLE IF NOT EXISTS spore_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId BIGINT NOT NULL,
  amount INT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES user_profiles(userId) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_spores ON user_profiles(totalSpores DESC);
CREATE INDEX idx_quests_user_completed ON quests(userId, completed);
CREATE INDEX idx_spore_transactions_user ON spore_transactions(userId);

-- RLS Policies (if using Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE spore_transactions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to leaderboard
CREATE POLICY "Public read leaderboard" ON user_profiles
  FOR SELECT USING (true);

-- Allow API key authenticated writes
CREATE POLICY "API write access" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "API write access" ON user_profiles
  FOR UPDATE USING (true);

CREATE POLICY "API write access" ON quests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "API write access" ON quests
  FOR UPDATE USING (true);

CREATE POLICY "API write access" ON spore_transactions
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON quests TO authenticated;
GRANT ALL ON spore_transactions TO authenticated;
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON quests TO anon;
