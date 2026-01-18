# 🚀 Web3 Deployment Verification Checklist

## ✅ Completed Changes

### 1. **TypeScript Build** ✅
- All files compiled successfully
- No type errors or syntax issues
- Ready for production deployment

### 2. **Code Changes**
| File | Status | Changes |
|------|--------|---------|
| `src/bot_clean.ts` | ✅ Updated | Quest announcements now use wallet addresses |
| `src/services/api-server.ts` | ✅ Updated | All routes use wallet parameters, added wallet auth |
| `src/services/supabase-integration.ts` | ✅ Refactored | Completely rewritten for wallet-based system |
| `supabase-setup.sql` | ✅ Updated | Schema changed to wallet-primary architecture |
| `API_REFERENCE.md` | ✅ Created | Complete API documentation |
| `WEB3_INTEGRATION.md` | ✅ Created | Web3 integration guide |

### 3. **Git Commit** ✅
```
Commit: 4dbbcd2
Message: refactor: Web3 wallet-based architecture
Files changed: 6
Insertions: 1725
Deletions: 182
```

### 4. **GitHub Push** ✅
```
Status: Successfully pushed to main branch
Trigger: Railway auto-deployment should start automatically
```

---

## 📋 Pre-Deployment Setup Checklist

Before your new Web3 system goes live, verify:

### Database Setup
- [ ] Run `supabase-setup.sql` in your Supabase database
- [ ] Verify `user_profiles` table has `walletAddress` column
- [ ] Check `quests` table includes `chainId` field
- [ ] Confirm `participation_proofs` table exists
- [ ] Verify indexes are created for performance

### Environment Variables
- [ ] `BOT_TOKEN` - Your Telegram bot token
- [ ] `OPENAI_KEY` - Your OpenAI API key
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_KEY` - Your Supabase service key
- [ ] `API_KEY` - Your API secret key (change from default)
- [ ] `API_PORT` - Port for API (default 3000)

### Telegram Bot
- [ ] Bot is in your Telegram server
- [ ] Bot has admin permissions (if needed)
- [ ] Polling mode is enabled
- [ ] Commands are registered (/menu, /start, etc.)

### Railway Deployment
- [ ] Check Railway logs for errors
- [ ] Verify deployment completed successfully
- [ ] API health check passes: `GET /health`
- [ ] Public endpoints accessible (no auth errors)

### API Testing
- [ ] Test public leaderboard: `GET /api/leaderboard`
- [ ] Test health check: `GET /health`
- [ ] Test stats: `GET /api/stats`
- [ ] Test wallet nonce: `GET /api/wallet/0x123.../nonce`

---

## 🧪 Quick Test Commands

### Test Public Endpoints (No Auth Required)
```bash
# Replace with your Railway URL
API="https://your-railway-url"

# Health check
curl -X GET $API/health

# Leaderboard (should return empty or existing data)
curl -X GET $API/api/leaderboard?limit=5

# Stats
curl -X GET $API/api/stats
```

### Test Wallet Authentication
```bash
# Test with a sample wallet address
WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595fEA00"

# Get nonce
curl -X GET $API/api/wallet/$WALLET/nonce

# You should see: nonce, walletAddress, expiresIn, message
```

### Test User Profile (After Linking)
```bash
WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595fEA00"

# Get profile (requires user to exist in DB)
curl -X GET $API/api/user/$WALLET/profile

# Get spores
curl -X GET $API/api/user/$WALLET/spores

# Get rank
curl -X GET $API/api/user/$WALLET/rank
```

### Test Quest Creation (Requires API Key)
```bash
API_KEY="your-api-key"
WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595fEA00"

curl -X POST \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Quest",
    "description": "A test quest",
    "reward": 10,
    "questType": "general"
  }' \
  $API/api/user/$WALLET/quests
```

---

## 🔍 Verification Steps

### 1. Check Railway Deployment
```bash
# Visit Railway dashboard
# https://railway.app/dashboard

# Check deployment status:
# - Build successful?
# - All logs green?
# - No errors in output?
```

### 2. Verify API Endpoints
```bash
# In your terminal or Postman:
# Test each endpoint type:

# Public: GET /health
# Public: GET /api/leaderboard  
# Public: GET /api/stats
# Auth: GET /api/wallet/:address/nonce
# Auth: POST /api/wallet/verify
# Protected: GET /api/user/:wallet/profile
# Protected: POST /api/user/:wallet/quests
```

### 3. Check Database Connection
```sql
-- In Supabase SQL Editor
-- Verify your tables exist:
SELECT * FROM user_profiles LIMIT 1;
SELECT * FROM quests LIMIT 1;
SELECT * FROM participation_proofs LIMIT 1;
SELECT * FROM wallet_connections LIMIT 1;
SELECT * FROM spore_transactions LIMIT 1;
```

### 4. Test Telegram Bot
```
# In Telegram:
1. Message your bot: /start
2. Check response is working
3. Try: /menu
4. Verify interactive menu appears
5. Test: /help
```

### 5. Monitor Logs
```bash
# Watch Railway logs in real-time
railway logs --follow

# Look for:
# ✅ "API Server listening on port 3000"
# ✅ "Supabase connected"
# ✅ "Bot is running"
# ⚠️ No ERROR messages
```

---

## ⚠️ Common Issues & Fixes

### Issue: "Invalid wallet address format"
**Cause:** Wallet address isn't properly formatted
**Fix:** Use full address (0x... for Ethereum, base58 for Solana)

### Issue: "Signature verification failed"
**Cause:** Wrong signature or nonce expired
**Fix:** Nonce expires in 10 minutes; get fresh nonce

### Issue: "Database connection failed"
**Cause:** Supabase credentials wrong or expired
**Fix:** Check SUPABASE_URL and SUPABASE_KEY in environment

### Issue: "API key unauthorized"
**Cause:** Wrong API key provided
**Fix:** Use correct key from environment variables

### Issue: "Quest not found"
**Cause:** questId doesn't exist in database
**Fix:** Verify questId format and that quest was created

### Issue: "Users not appearing on leaderboard"
**Cause:** No users in database yet or data not inserted
**Fix:** Create some test users and complete quests

---

## 🎯 Next Steps

### 1. Run Database Setup
```bash
# In Supabase:
# Copy and paste contents of supabase-setup.sql
# Execute in SQL Editor
```

### 2. Test with Sample Data
```bash
# Create test user via API
# Create test quest
# Complete a test quest
# Verify spores awarded
# Check leaderboard updated
```

### 3. Link Telegram Bot
```bash
# Optional: Link specific Telegram users to wallets
# Allows bot to announce quest completions
# Uses telegramUserId linking in user_profiles
```

### 4. Configure Website
```javascript
// kingmyco.com integration:
// 1. Add wallet connect button
// 2. Implement signature verification flow
// 3. Call API endpoints for quests/leaderboard
// 4. See WEB3_INTEGRATION.md for examples
```

### 5. Monitor & Maintain
```bash
# Monitor API logs
# Check leaderboard for suspicious activity
# Update quests based on community feedback
# Keep backup of database
```

---

## 📊 System Architecture

```
Web3 Wallet Connection
        ↓
Signature Verification (Nonce-based)
        ↓
JWT Token Issued
        ↓
API Requests with Auth
        ↓
Create/Complete Quests
        ↓
On-Chain Proof Tracking
        ↓
Spores Awarded
        ↓
Leaderboard Updated
        ↓
Telegram Announcements (Optional)
```

---

## 🔐 Security Checklist

- [ ] All API keys stored in environment only
- [ ] HTTPS enabled on Railway
- [ ] CORS configured properly
- [ ] Rate limiting implemented
- [ ] No user passwords (wallet signatures only)
- [ ] Nonce expires quickly (10 minutes)
- [ ] On-chain proofs can be verified
- [ ] Database backups configured
- [ ] Error messages don't leak sensitive info
- [ ] API key rotation strategy documented

---

## 📱 Telegram Bot Integration

The bot now works WITH wallet-based system:

### Current Features
- ✅ Commands like /start, /menu, /trending
- ✅ Token analysis (/ca, /risk, /holders)
- ✅ King Myco wisdom (/askkingmyco)
- ✅ Educational content (/educate)
- ✅ Button push contest (/buttonpush)

### Wallet Integration Features
- ✅ Can announce quest completions to Telegram
- ✅ Optional linking of Telegram ID to wallet
- ✅ Display spore balance
- ✅ Show user rank on leaderboard
- ✅ Announce top earners

---

## 🚀 Deployment Timeline

| Phase | Status | Time |
|-------|--------|------|
| Code refactoring | ✅ Complete | ~2 hours |
| TypeScript build | ✅ Complete | ~1 min |
| Git commit | ✅ Complete | ~1 min |
| GitHub push | ✅ Complete | ~1 min |
| Railway deployment | ⏳ In Progress | ~3-5 min |
| Database setup | ⏹️ Pending | ~5-10 min |
| API testing | ⏹️ Pending | ~10-15 min |
| Go-live | ⏹️ Ready | Immediate |

---

## 📞 Support & Debugging

### Check Deployment Status
```bash
# Railway dashboard
https://railway.app/dashboard

# Look at:
# - Deployment section
# - Build logs
# - Service logs
# - Environment variables
```

### View Real-Time Logs
```bash
# Terminal command
railway logs --follow

# Or in Railway dashboard:
# Project → Service → Logs tab
```

### Test API Health
```bash
# Your API URL from Railway
# Replace with actual URL:
https://king-myco-production-xyz.railway.app/health

# Should return:
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2026-01-18T10:30:00Z",
  "database": "connected"
}
```

---

## ✨ Success Indicators

When everything is working:

1. ✅ `/health` returns `database: connected`
2. ✅ `/api/leaderboard` returns empty array initially (no users yet)
3. ✅ `/api/stats` shows totalUsers: 0
4. ✅ `/api/wallet/:address/nonce` returns valid nonce
5. ✅ `/api/wallet/verify` accepts signature
6. ✅ Telegram bot responds to /start
7. ✅ API requests complete within 1 second
8. ✅ No ERROR logs in Railway dashboard

---

**Your King Myco Web3 system is ready to go! 🎉**

Next step: Run the database setup SQL and start creating quests.

For questions, check:
- `WEB3_INTEGRATION.md` - Architecture & integration details
- `API_REFERENCE.md` - Complete API documentation
- Railway logs - Real-time debugging

Good luck! 🌟
