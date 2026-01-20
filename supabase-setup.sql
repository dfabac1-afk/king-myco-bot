-- Supabase Database Setup for King Myco Web3 Integration

-- User Profiles table (wallet-based)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  telegram_user_id BIGINT UNIQUE,
  telegram_name TEXT,
  total_spores INT DEFAULT 0,
  quests_completed INT DEFAULT 0,
  button_pushes INT DEFAULT 0,
  chain_id INT DEFAULT 501,
  nonce TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add button_pushes column if it doesn't exist (for existing databases)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_profiles' AND column_name='button_pushes') THEN
    ALTER TABLE user_profiles ADD COLUMN button_pushes INT DEFAULT 0;
  END IF;
END $$;

-- Quests table (Web3-based)
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward INT NOT NULL,
  quest_type TEXT DEFAULT 'general',
  contract_address TEXT,
  chain_id INT DEFAULT 501,
  started BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  participation_proof TEXT,
  transaction_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (wallet_address) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE
);

-- Wallet connections (support for multiple wallets per user if needed)
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  chain_id INT DEFAULT 501,
  verification_signature TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  connected_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(user_id, wallet_address, chain_id)
);

-- Spore transactions log (audit trail with wallet)
CREATE TABLE IF NOT EXISTS spore_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  amount INT NOT NULL,
  reason TEXT,
  quest_id UUID,
  transaction_hash TEXT,
  chain_id INT DEFAULT 501,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (wallet_address) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE,
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE SET NULL
);

-- On-chain proof of participation
CREATE TABLE IF NOT EXISTS participation_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  proof_type TEXT,
  proof_data JSONB,
  transaction_hash TEXT,
  verified BOOLEAN DEFAULT FALSE,
  chain_id INT DEFAULT 501,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (quest_id) REFERENCES quests(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_address) REFERENCES user_profiles(wallet_address) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_spores ON user_profiles(total_spores DESC);
CREATE INDEX idx_user_profiles_wallet ON user_profiles(wallet_address);
CREATE INDEX idx_user_profiles_telegram ON user_profiles(telegram_user_id);
CREATE INDEX idx_quests_wallet_completed ON quests(wallet_address, completed);
CREATE INDEX idx_quests_contract ON quests(contract_address, chain_id);
CREATE INDEX idx_spore_transactions_wallet ON spore_transactions(wallet_address);
CREATE INDEX idx_participation_proofs_quest ON participation_proofs(quest_id);
CREATE INDEX idx_wallet_connections_address ON wallet_connections(wallet_address);

-- Daily Button Push Winners table
CREATE TABLE IF NOT EXISTS daily_button_winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id BIGINT NOT NULL,
  user_name TEXT NOT NULL,
  daily_pushes INT NOT NULL,
  total_pushes INT NOT NULL,
  rank INT NOT NULL,
  win_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(win_date) -- Only one winner per day
);

CREATE INDEX idx_daily_winners_date ON daily_button_winners(win_date DESC);
CREATE INDEX idx_daily_winners_user ON daily_button_winners(user_id);

-- RLS Policies (Admin-only writes, public read for leaderboards)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE spore_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE participation_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_button_winners ENABLE ROW LEVEL SECURITY;

-- ===== USER_PROFILES POLICIES =====
-- Public read access for leaderboards
CREATE POLICY "Public read leaderboard" ON user_profiles
  FOR SELECT USING (true);

-- No user writes allowed (service role bypasses RLS)
CREATE POLICY "No user insert" ON user_profiles
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No user update" ON user_profiles
  FOR UPDATE USING (false);

CREATE POLICY "No user delete" ON user_profiles
  FOR DELETE USING (false);

-- ===== QUESTS POLICIES =====
-- Public read access to quests
CREATE POLICY "Public read quests" ON quests
  FOR SELECT USING (true);

-- No user writes allowed
CREATE POLICY "No user insert quests" ON quests
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No user update quests" ON quests
  FOR UPDATE USING (false);

CREATE POLICY "No user delete quests" ON quests
  FOR DELETE USING (false);

-- ===== SPORE_TRANSACTIONS POLICIES =====
-- Public read access for transparency
CREATE POLICY "Public read transactions" ON spore_transactions
  FOR SELECT USING (true);

-- No user writes allowed
CREATE POLICY "No user insert transactions" ON spore_transactions
  FOR INSERT WITH CHECK (false);

-- ===== PARTICIPATION_PROOFS POLICIES =====
-- Public read access for verification
CREATE POLICY "Public read proofs" ON participation_proofs
  FOR SELECT USING (true);

-- No user writes allowed
CREATE POLICY "No user insert proofs" ON participation_proofs
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No user update proofs" ON participation_proofs
  FOR UPDATE USING (false);

-- ===== DAILY_BUTTON_WINNERS POLICIES =====
-- Public read access to daily winners (leaderboard)
CREATE POLICY "Public read daily winners" ON daily_button_winners
  FOR SELECT USING (true);

-- No user writes allowed
CREATE POLICY "No user insert winners" ON daily_button_winners
  FOR INSERT WITH CHECK (false);

-- Grant permissions (service role bypasses RLS, anon gets read-only)
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON quests TO anon;
GRANT SELECT ON spore_transactions TO anon;
GRANT SELECT ON participation_proofs TO anon;
GRANT SELECT ON daily_button_winners TO anon;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON quests TO authenticated;
GRANT ALL ON spore_transactions TO authenticated;
GRANT ALL ON participation_proofs TO authenticated;
GRANT ALL ON daily_button_winners TO authenticated;

-- ============= SUPABASE FUNCTIONS =============

-- Function to get daily wins leaderboard (aggregates wins per user)
CREATE OR REPLACE FUNCTION get_daily_wins_leaderboard(row_limit INT DEFAULT 10)
RETURNS TABLE (
  user_id BIGINT,
  user_name TEXT,
  wins BIGINT,
  last_win_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dbw.user_id,
    MAX(dbw.user_name) as user_name,
    COUNT(*)::BIGINT as wins,
    MAX(dbw.win_date)::DATE as last_win_date
  FROM daily_button_winners dbw
  GROUP BY dbw.user_id
  ORDER BY wins DESC, last_win_date DESC
  LIMIT row_limit;
END;
$$ LANGUAGE plpgsql;

