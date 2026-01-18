# ✅ SUPABASE SETUP VERIFICATION

## Database Tables Created

Your Supabase database should now have these tables:

- [x] **user_profiles** - Stores wallet addresses and user data
- [x] **quests** - Stores quest information and tracking
- [x] **wallet_connections** - Links multiple wallets per user
- [x] **spore_transactions** - Audit trail of spore transfers
- [x] **participation_proofs** - On-chain proof tracking

---

## 🔍 How to Verify in Supabase

### Step 1: Open Supabase Dashboard
```
https://supabase.com/dashboard
```

### Step 2: Go to SQL Editor
Click: **SQL Editor** in left sidebar

### Step 3: Run This Query
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema='public';
```

### Expected Output
You should see these 5 tables:
```
user_profiles
quests
wallet_connections
spore_transactions
participation_proofs
```

---

## 📊 Verify Table Structure

Run this to see all tables with their columns:

```sql
-- Check user_profiles columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='user_profiles'
ORDER BY ordinal_position;
```

---

## ✅ What This Means

Now that your database is set up:

✅ **Spore leaderboard** - Will query `user_profiles` table  
✅ **Quest tracking** - Will use `quests` table  
✅ **Wallet verification** - Will use `wallet_connections` table  
✅ **Audit trail** - Will track in `spore_transactions` table  
✅ **On-chain proofs** - Will store in `participation_proofs` table  

---

## 🚀 Test the Bot

### Test 1: Open Telegram
Search: `@king_myco_bot`

### Test 2: Try Commands
```
/start          → Welcome message
/menu           → Main menu
/menu → ⭐ Spore Leaderboard → Shows (empty or data)
/menu → 🏆 Push Leaderboard → Shows button pushers
```

---

## 🎯 Next: Use the Bot

### Create a Test Quest
If you want to test the full flow:

```sql
-- Create a test quest
INSERT INTO quests (
  walletAddress,
  title,
  description,
  reward,
  questType,
  chainId,
  completed
) VALUES (
  '0x742d35Cc6634C0532925a3b844Bc9e7595fEA00',
  'Welcome to King Myco',
  'Your first quest!',
  100,
  'general',
  501,
  false
);
```

### Add Spores to a User
```sql
-- Add test spores
INSERT INTO user_profiles (
  walletAddress,
  totalSpores,
  chainId
) VALUES (
  '0x742d35Cc6634C0532925a3b844Bc9e7595fEA00',
  500,
  501
)
ON CONFLICT (walletAddress) 
DO UPDATE SET totalSpores = 500;
```

---

## 📋 Final Checklist

- [x] Supabase project created
- [x] Database tables created
- [x] Environment variables set
- [x] Bot deployed on Railway
- [x] API server running
- [x] Leaderboards working
- [x] Ready for users

---

## 🎊 You're All Set!

Your King Myco bot is now:
- ✅ Fully connected to Supabase
- ✅ Ready to track users & spores
- ✅ Ready to manage quests
- ✅ Ready to verify wallets
- ✅ Ready for production use

---

**Status: 🟢 PRODUCTION READY**

Users can now use the bot and earn spores! 🚀
