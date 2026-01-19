-- Supabase Database Setup for King Myco Web3 Integration

-- User Profiles table (wallet-based)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  walletAddress TEXT UNIQUE NOT NULL,
  telegramUserId BIGINT UNIQUE,
  telegramName TEXT,
  totalSpores INT DEFAULT 0,
  questsCompleted INT DEFAULT 0,
  buttonPushes INT DEFAULT 0,
  chainId INT DEFAULT 501,
  nonce TEXT,
  isVerified BOOLEAN DEFAULT FALSE,
  lastActiveAt TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Add buttonPushes column if it doesn't exist (for existing databases)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='user_profiles' AND column_name='buttonPushes') THEN
    ALTER TABLE user_profiles ADD COLUMN buttonPushes INT DEFAULT 0;
  END IF;
END $$;

-- Quests table (Web3-based)
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  walletAddress TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward INT NOT NULL,
  questType TEXT DEFAULT 'general',
  contractAddress TEXT,
  chainId INT DEFAULT 501,
  started BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  completedAt TIMESTAMP,
  participationProof TEXT,
  transactionHash TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (walletAddress) REFERENCES user_profiles(walletAddress) ON DELETE CASCADE
);

-- Wallet connections (support for multiple wallets per user if needed)
CREATE TABLE IF NOT EXISTS wallet_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId UUID NOT NULL,
  walletAddress TEXT NOT NULL,
  chainId INT DEFAULT 501,
  verificationSignature TEXT,
  isVerified BOOLEAN DEFAULT FALSE,
  connectedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES user_profiles(id) ON DELETE CASCADE,
  UNIQUE(userId, walletAddress, chainId)
);

-- Spore transactions log (audit trail with wallet)
CREATE TABLE IF NOT EXISTS spore_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  walletAddress TEXT NOT NULL,
  amount INT NOT NULL,
  reason TEXT,
  questId UUID,
  transactionHash TEXT,
  chainId INT DEFAULT 501,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (walletAddress) REFERENCES user_profiles(walletAddress) ON DELETE CASCADE,
  FOREIGN KEY (questId) REFERENCES quests(id) ON DELETE SET NULL
);

-- On-chain proof of participation
CREATE TABLE IF NOT EXISTS participation_proofs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  questId UUID NOT NULL,
  walletAddress TEXT NOT NULL,
  proofType TEXT,
  proofData JSONB,
  transactionHash TEXT,
  verified BOOLEAN DEFAULT FALSE,
  chainId INT DEFAULT 501,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (questId) REFERENCES quests(id) ON DELETE CASCADE,
  FOREIGN KEY (walletAddress) REFERENCES user_profiles(walletAddress) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_spores ON user_profiles(totalSpores DESC);
CREATE INDEX idx_user_profiles_wallet ON user_profiles(walletAddress);
CREATE INDEX idx_user_profiles_telegram ON user_profiles(telegramUserId);
CREATE INDEX idx_quests_wallet_completed ON quests(walletAddress, completed);
CREATE INDEX idx_quests_contract ON quests(contractAddress, chainId);
CREATE INDEX idx_spore_transactions_wallet ON spore_transactions(walletAddress);
CREATE INDEX idx_participation_proofs_quest ON participation_proofs(questId);
CREATE INDEX idx_wallet_connections_address ON wallet_connections(walletAddress);

-- Daily Button Push Winners table
CREATE TABLE IF NOT EXISTS daily_button_winners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  userId BIGINT NOT NULL,
  userName TEXT NOT NULL,
  dailyPushes INT NOT NULL,
  totalPushes INT NOT NULL,
  rank INT NOT NULL,
  winDate DATE NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  UNIQUE(winDate) -- Only one winner per day
);

CREATE INDEX idx_daily_winners_date ON daily_button_winners(winDate DESC);
CREATE INDEX idx_daily_winners_user ON daily_button_winners(userId);

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

-- ============= SUPABASE FUNCTIONS =============

-- Function to get daily wins leaderboard (aggregates wins per user)
CREATE OR REPLACE FUNCTION get_daily_wins_leaderboard(row_limit INT DEFAULT 10)
RETURNS TABLE (
  userId BIGINT,
  userName TEXT,
  wins BIGINT,
  lastWinDate DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dbw.userId,
    MAX(dbw.userName) as userName,
    COUNT(*)::BIGINT as wins,
    MAX(dbw.winDate)::DATE as lastWinDate
  FROM daily_button_winners dbw
  GROUP BY dbw.userId
  ORDER BY wins DESC, lastWinDate DESC
  LIMIT row_limit;
END;
$$ LANGUAGE plpgsql;

