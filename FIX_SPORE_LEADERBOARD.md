# 🔧 Fix Spore Leaderboard Issue

## Problem
"Spore leaderboard is not available. Supabase is not initialized."

## Root Cause
The Supabase database tables haven't been created yet. You need to run the setup SQL script.

---

## ✅ Solution (3 Steps)

### STEP 1: Go to Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Click your **ddsnflsvxxmkeixykcfj** project

### STEP 2: Open SQL Editor
1. Click **SQL Editor** in left sidebar
2. Click **New Query** (or **+** button)

### STEP 3: Run Setup SQL

Copy and paste this entire SQL script:

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id BIGSERIAL PRIMARY KEY,
  walletAddress TEXT UNIQUE NOT NULL,
  telegramUserId BIGINT UNIQUE,
  totalSpores BIGINT DEFAULT 0,
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  chainId INT DEFAULT 501,
  nonce TEXT,
  isVerified BOOLEAN DEFAULT FALSE
);

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sporeReward BIGINT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  chainId INT DEFAULT 501,
  contractAddress TEXT
);

-- Create participation_proofs table
CREATE TABLE IF NOT EXISTS participation_proofs (
  id BIGSERIAL PRIMARY KEY,
  questId TEXT NOT NULL REFERENCES quests(id),
  walletAddress TEXT NOT NULL REFERENCES user_profiles(walletAddress),
  proofData JSONB,
  transactionHash TEXT,
  completedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN DEFAULT FALSE
);

-- Create wallet_connections table
CREATE TABLE IF NOT EXISTS wallet_connections (
  id BIGSERIAL PRIMARY KEY,
  walletAddress TEXT NOT NULL REFERENCES user_profiles(walletAddress),
  chainId INT,
  contractAddress TEXT,
  isVerified BOOLEAN DEFAULT FALSE,
  connectedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spore_transactions table
CREATE TABLE IF NOT EXISTS spore_transactions (
  id BIGSERIAL PRIMARY KEY,
  walletAddress TEXT NOT NULL REFERENCES user_profiles(walletAddress),
  amount BIGINT NOT NULL,
  reason TEXT,
  questId TEXT,
  transactionHash TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_user_profiles_wallet ON user_profiles(walletAddress);
CREATE INDEX idx_user_profiles_telegram ON user_profiles(telegramUserId);
CREATE INDEX idx_participation_wallet ON participation_proofs(walletAddress);
CREATE INDEX idx_participation_quest ON participation_proofs(questId);
CREATE INDEX idx_spore_transactions_wallet ON spore_transactions(walletAddress);
CREATE INDEX idx_wallet_connections_chain ON wallet_connections(chainId);

-- Done!
```

### STEP 4: Click "Run"
1. Select all the SQL above (Ctrl+A in the query box)
2. Click the **Run** button
3. Wait for ✅ "Query successful"

---

## ✅ After Database Setup

Once you run the SQL:

1. **Spore Leaderboard** will show:
   - Empty leaderboard (no data yet)
   - Or top spore earners once users complete quests

2. **Bot will be fully functional**:
   - Users can earn spores
   - Leaderboards will update
   - Quest completion works

---

## 🎯 Test It

After running the SQL:

1. Open Telegram bot
2. Click `/menu`
3. Click `⭐ Spore Leaderboard`
4. Should show: "No users have earned spores yet"

That means the database is working! ✅

---

## 💡 Need Help?

If you get errors when running the SQL:

- **"Table already exists"** → That's OK! Just means it's already set up
- **"Permission denied"** → Check Supabase credentials in `.env`
- **"Column already exists"** → Already set up, skip that part

All good! Your database is ready! 🚀

---

## 📋 Summary

```
Current Status: ❌ Database tables not created
After Setup:    ✅ All systems GO
Time Required:  2 minutes
```

Go to Supabase, run the SQL, and you're done! 🎉
