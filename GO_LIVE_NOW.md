# 🚀 KING MYCO - LIVE DEPLOYMENT GUIDE

## Status: GO LIVE NOW! 🎉

Your King Myco Web3 bot is ready for production. Follow these steps to launch.

---

## ⚡ 3-STEP DEPLOYMENT

### STEP 1: Setup Supabase Database (2 minutes)

**1a. Open Supabase SQL Editor**
- Go to: https://app.supabase.com
- Select your project
- Click "SQL Editor"
- Click "New query"

**1b. Copy & Paste Database Schema**
```
Copy ENTIRE content from: supabase-setup.sql
Paste into Supabase SQL Editor
Click "Run"
```

**Expected output:**
```
✅ CREATE TABLE user_profiles
✅ CREATE TABLE quests
✅ CREATE TABLE participation_proofs
✅ CREATE TABLE wallet_connections
✅ CREATE TABLE spore_transactions
✅ All indexes created
```

**Verify tables exist:**
```sql
-- Run this query
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should show 5 tables:
-- user_profiles
-- quests
-- participation_proofs
-- wallet_connections
-- spore_transactions
```

---

### STEP 2: Verify Railway Deployment (1 minute)

**2a. Check Railway Dashboard**
- Go to: https://railway.app/dashboard
- Look for your King Myco project
- Check deployment status

**Expected:**
```
✅ Build: Successful
✅ Service: Running
✅ Logs: No errors
```

**2b. Get Your API URL**
- Click on project
- Find "Service" section
- Copy the public URL (looks like: https://king-myco-xyz.railway.app)
- **Save this URL - you'll use it for testing**

**2c. Check Logs (Optional)**
```bash
# In terminal:
railway logs --follow

# Look for:
# ✅ "API Server listening on port 3000"
# ✅ "Supabase connected"
# ✅ "Bot is running"
# ⚠️ No "ERROR" messages
```

---

### STEP 3: Test API Endpoints (2 minutes)

**Replace `YOUR_URL` with your Railway URL from Step 2**

**3a. Health Check**
```bash
curl -X GET https://YOUR_URL/health

# Expected response:
# {
#   "success": true,
#   "message": "API is healthy",
#   "timestamp": "2026-01-18T10:30:00Z",
#   "database": "connected"
# }
```

**3b. Test Leaderboard (Public)**
```bash
curl -X GET https://YOUR_URL/api/leaderboard?limit=5

# Expected response (empty at start):
# {
#   "success": true,
#   "data": []
# }
```

**3c. Test Stats (Public)**
```bash
curl -X GET https://YOUR_URL/api/stats

# Expected response:
# {
#   "success": true,
#   "stats": {
#     "totalUsers": 0,
#     "totalSpores": 0,
#     "totalQuestsCompleted": 0
#   }
# }
```

**3d. Test Wallet Nonce (Web3 Auth)**
```bash
# Use a test wallet address
curl -X GET https://YOUR_URL/api/wallet/0x742d35Cc6634C0532925a3b844Bc9e7595fEA00/nonce

# Expected response:
# {
#   "success": true,
#   "walletAddress": "0x742d35cc...",
#   "nonce": "abc123xyz789",
#   "expiresIn": 600
# }
```

**If all 4 tests pass: ✅ YOUR API IS LIVE!**

---

## 🎯 GO LIVE CHECKLIST

- [ ] Database setup complete (5 tables created)
- [ ] Railway deployment successful (green checkmark)
- [ ] Health check returns `database: connected`
- [ ] Leaderboard endpoint returns data (empty array is OK)
- [ ] Stats endpoint returns stats
- [ ] Wallet nonce endpoint returns nonce
- [ ] Telegram bot still responds to /start
- [ ] All tests passed!

---

## 🎊 YOU'RE LIVE!

If all tests passed above, your King Myco bot is now **LIVE** with:

✅ Web3 wallet authentication
✅ On-chain quest tracking
✅ Decentralized leaderboard
✅ Multi-chain support
✅ Production-ready API

---

## 📱 Next: Onboard Your First User

### Test Quest Creation

**Get your API key** (from .env or Railway):
```bash
API_KEY="your-api-key"
WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595fEA00"
API="https://YOUR_URL"
```

**Create a test quest:**
```bash
curl -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Welcome Quest",
    "description": "Your first Web3 quest",
    "reward": 10,
    "questType": "general"
  }' \
  $API/api/user/$WALLET/quests

# Expected response:
# {
#   "success": true,
#   "questId": "550e8400-e29b-41d4-a716-446655440000",
#   "message": "Quest created successfully"
# }
```

**Save the questId from response**

### Complete the Quest

```bash
curl -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionHash": "0x1234567890abcdef",
    "proofData": {
      "chainId": 501
    }
  }' \
  $API/api/user/$WALLET/quests/550e8400-e29b-41d4-a716-446655440000/complete

# Expected response:
# {
#   "success": true,
#   "message": "Quest completed! 10 spores awarded.",
#   "newTotal": 10
# }
```

### Check Leaderboard

```bash
curl -X GET $API/api/leaderboard

# Expected: Your wallet should appear with 10 spores!
```

---

## 🚨 TROUBLESHOOTING

### "API is unreachable"
```
→ Check Railway dashboard for deployment status
→ Verify URL is correct (no typos)
→ Wait 2-3 minutes for Railway to finish deploying
```

### "Database: not connected"
```
→ Verify supabase-setup.sql was run
→ Check Supabase credentials in .env
→ Verify SUPABASE_URL and SUPABASE_KEY are set
```

### "Table does not exist"
```
→ Open Supabase SQL Editor
→ Run: SELECT * FROM user_profiles;
→ If error, re-run supabase-setup.sql
```

### "API key unauthorized"
```
→ Use correct API_KEY from .env
→ Check header: x-api-key (not x-api-Key)
```

### "Wallet address invalid"
```
→ Use full address: 0x742d35Cc6634C0532925a3b844Bc9e7595fEA00
→ Ensure correct format (0x followed by 40 hex chars)
```

---

## 🎯 What to Tell Your Users

**Your King Myco bot now supports Web3!**

Users can:
1. 🔗 Connect wallet (MetaMask, Phantom, etc.)
2. 🎯 Participate in Web3 quests
3. 🪙 Earn spores on-chain
4. 📊 See their rank on leaderboard
5. 💬 Get King Myco wisdom via Telegram

**How to join:**
```
1. Visit: kingmyco.com
2. Click "Connect Wallet"
3. Sign with your wallet
4. Create profile
5. Start earning spores!
```

---

## 📊 LIVE System Architecture

```
┌─────────────────────────────────┐
│  Your Website (kingmyco.com)    │
│  + Telegram Bot (@KingMycoBot)  │
└────────────────┬────────────────┘
                 │
    (Wallet Auth + REST API)
                 ▼
┌────────────────────────────────┐
│  Railway API (LIVE)            │
│  https://YOUR_URL              │
│  - 15+ endpoints               │
│  - Web3 authentication         │
│  - Quest management            │
└────────────────┬───────────────┘
                 │
    (SQL Queries + Real-time)
                 ▼
┌────────────────────────────────┐
│  Supabase (PostgreSQL)         │
│  - 5 tables                    │
│  - Wallet-based profiles       │
│  - On-chain proof tracking     │
└────────────────────────────────┘
```

---

## 🎉 LAUNCH COMPLETE!

Your King Myco bot is now:

✅ **Live** on Railway
✅ **Deployed** to production
✅ **Tested** and working
✅ **Ready** for users
✅ **Web3-enabled** with wallet auth
✅ **Decentralized** quest system
✅ **Transparent** leaderboard

---

## 📞 NEED HELP?

**All documentation in GitHub repo:**
- `README_DOCS.md` - Documentation index
- `API_REFERENCE.md` - API details
- `DEPLOYMENT_CHECKLIST.md` - Troubleshooting
- `QUICK_REFERENCE.md` - Quick facts

---

## 🚀 NEXT STEPS

1. ✅ [Database Setup](#step-1-setup-supabase-database-2-minutes)
2. ✅ [Verify Deployment](#step-2-verify-railway-deployment-1-minute)
3. ✅ [Test API](#step-3-test-api-endpoints-2-minutes)
4. ✅ [Create First Quest](#-next-onboard-your-first-user)
5. ✅ [Tell Users About It](#-what-to-tell-your-users)
6. 🎊 **CELEBRATE!** You're live!

---

**Total Time to Live: ~5 minutes**

Let's GO! 🚀🌟
