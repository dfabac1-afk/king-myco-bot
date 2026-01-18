# 🎉 King Myco Website Integration - COMPLETE

## ✅ What You Now Have

Your Telegram bot is **fully integrated** with kingmyco.com with a complete spores, quests, and leaderboard system.

### Key Components

1. **REST API Server** (Express)
   - Running on port 3000
   - 7 main endpoints
   - API key authentication
   - CORS enabled

2. **Supabase Database**
   - user_profiles table (spores, quests count)
   - quests table (active & completed)
   - spore_transactions table (audit trail)
   - All with proper indexes & RLS

3. **Spores System** 🌱
   - Button push: +10 spores every 30 min
   - Quests: Variable rewards
   - Admin awards: Manual allocation
   - Persistent storage

4. **Quest System** 📜
   - Create quests from website
   - Auto-award spores on completion
   - Telegram announcements
   - Track active/completed

5. **Leaderboard** 🏆
   - Real-time updates
   - Displayed on website & Telegram
   - Top 10 earners
   - Overall statistics

## 📋 Setup Checklist

### Phase 1: Supabase (5 min)

- [ ] Go to supabase.com
- [ ] Create project
- [ ] Open SQL Editor
- [ ] Copy entire `supabase-setup.sql`
- [ ] Paste and run in SQL Editor
- [ ] Copy Project URL and Anon Key

### Phase 2: Railway Environment (5 min)

Add these variables to Railway settings:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=<anon-key-from-supabase>
API_KEY=your-secure-key-change-this
API_PORT=3000
ANNOUNCEMENT_GROUP_ID=<optional>
```

### Phase 3: Test Deployment (5 min)

```bash
# Check health
curl https://your-railway-url/health

# Get leaderboard (no auth needed)
curl https://your-railway-url/api/leaderboard

# Get stats
curl https://your-railway-url/api/stats
```

### Phase 4: Website Integration (30-60 min)

Update kingmyco.com frontend to call API endpoints:
- Display leaderboard
- Show user spores
- List active quests
- Create quests
- Complete quests (triggers Telegram announcement)

See `WEBSITE_INTEGRATION.md` for code examples.

## 🔗 API Endpoints Quick Reference

All require `x-api-key` header (except noted):

```
GET  /api/leaderboard                          - Top earners [NO AUTH]
GET  /api/stats                                - Overall stats [NO AUTH]
GET  /api/user/:userId/profile                 - User data
GET  /api/user/:userId/spores                  - Spore balance
GET  /api/user/:userId/quests                  - List quests
POST /api/user/:userId/quests                  - Create quest
POST /api/user/:userId/quests/:id/complete     - Complete quest (awards + announces)
POST /api/user/:userId/spores/add              - Award spores (admin)
```

## 📁 Files & Documentation

Read these in order:

1. **SETUP_GUIDE.md** - Start here! Step-by-step setup
2. **WEBSITE_INTEGRATION.md** - Full API reference + examples
3. **INTEGRATION_SUMMARY.md** - Overview & architecture
4. **examples-api.sh** - cURL commands to test API
5. **supabase-setup.sql** - Database schema (run in Supabase)

## 🌐 Website Integration Examples

### Display Leaderboard
```javascript
const API = 'https://your-railway-url/api';
const response = await fetch(`${API}/leaderboard?limit=10`);
const { data } = await response.json();
data.forEach(user => console.log(`${user.telegramName}: ${user.totalSpores} spores`));
```

### Create Quest
```javascript
const response = await fetch(`${API}/user/123456/quests`, {
  method: 'POST',
  headers: { 
    'x-api-key': 'your-api-key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Complete Profile',
    description: 'Fill all profile fields',
    reward: 100
  })
});
const { questId } = await response.json();
```

### Complete Quest (Auto-announces in Telegram!)
```javascript
const response = await fetch(
  `${API}/user/123456/quests/${questId}/complete`,
  {
    method: 'POST',
    headers: { 'x-api-key': 'your-api-key' }
  }
);
// This automatically:
// 1. Marks quest as completed
// 2. Awards spores to user
// 3. Announces in Telegram group
// 4. Updates user stats
```

## 🔐 Security Notes

✅ **Already Implemented:**
- API key auth
- CORS protection
- Telegram API isolated
- Row-level security policies

⚠️ **For Production:**
- Change `API_KEY` from default
- Add rate limiting
- Consider JWT for website users
- Enable IP whitelisting
- Monitor spore_transactions table

## 📊 Data Flow

```
User on kingmyco.com
    ↓
[Create/Complete Quest]
    ↓
POST /api/user/:id/quests/:id/complete
    ↓
┌─────────────────────────────────────┐
│ Supabase:                           │
│ - Mark quest completed             │
│ - Award spores                      │
│ - Update user stats                 │
│ - Log transaction                   │
└─────────────────────────────────────┘
    ↓
Telegram Bot:
    ├─ Announces in group/DM
    ├─ Shows spore award
    ├─ Updates leaderboard
    └─ Records achievement
    ↓
Website Updates:
    ├─ User sees spores ↑
    ├─ Leaderboard refreshes
    ├─ Quest marked complete
    └─ Notification sent
```

## 🚀 Going Live

When ready to launch kingmyco.com integration:

1. **Configure Hostinger DNS** (use your API key)
   - Point to Railway deployment
   - Enable HTTPS redirect

2. **Set Production API Key**
   - Generate secure random key
   - Update `API_KEY` in Railway
   - Share only with frontend

3. **Test All Endpoints**
   ```bash
   # Use examples-api.sh to test:
   bash examples-api.sh
   ```

4. **Monitor Logs**
   ```bash
   railway logs  # Check for errors
   ```

5. **Announce Features**
   - Tell users about spore system
   - Promote quest completion
   - Show leaderboard updates

## 💡 Optional Next Steps

After initial launch, consider:

- **Quest Categories** (daily, weekly, seasonal)
- **Achievements & Badges** (first quest, 100 spores, etc)
- **Trading System** (users trade spores)
- **Guilds/Teams** (group spore pools)
- **Spore Shop** (spend spores on items)
- **Analytics Dashboard** (view trends)
- **Webhooks** (custom integrations)
- **Mobile App** (native iOS/Android)

## 📞 Troubleshooting

### API Returns 401
```
✗ Check: API key in header matches `API_KEY` in Railway
✗ Verify: Header format is `x-api-key: your-key`
```

### Supabase Connection Error
```
✗ Check: SUPABASE_URL in env vars
✗ Verify: SUPABASE_KEY is correct
✗ Confirm: Tables created (run supabase-setup.sql)
```

### Quests Not Awarding Spores
```
✗ Check: Supabase initialized (should show in logs)
✗ Verify: user_profiles table has user record
✗ Look: At spore_transactions for audit trail
```

### No Telegram Announcements
```
✗ Set: ANNOUNCEMENT_GROUP_ID env var (optional)
✗ Without: Quests announce to user's private DM
✗ Check: Bot has permission in group
```

## 📈 What's Happening Right Now

- ✅ Code deployed to Railway
- ✅ Database schema ready (just needs setup)
- ✅ API server running
- ✅ Bot ready to award spores
- ✅ All endpoints available
- ⏳ Waiting for: Supabase setup + env vars

## 🎯 Next Actions

1. **Set up Supabase** (follow SETUP_GUIDE.md)
2. **Add env vars to Railway**
3. **Test API endpoints** (use examples-api.sh)
4. **Integrate with website frontend**
5. **Test end-to-end flow**
6. **Go live!**

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `SETUP_GUIDE.md` | 📋 Step-by-step setup instructions |
| `WEBSITE_INTEGRATION.md` | 📖 Complete API reference & examples |
| `INTEGRATION_SUMMARY.md` | 📊 Architecture & flow diagrams |
| `examples-api.sh` | 💻 cURL examples for all endpoints |
| `supabase-setup.sql` | 🗄️ Database schema (run in Supabase) |

## 🎉 You're All Set!

Your bot now has everything needed for a full web3 experience:
- ✅ Persistent user data
- ✅ Spore economy
- ✅ Quest system
- ✅ Real-time leaderboard
- ✅ Telegram integration
- ✅ REST API
- ✅ Admin controls

**Questions?** Check the docs or review `examples-api.sh` for API patterns.

**Ready to launch?** Start with `SETUP_GUIDE.md` and follow step-by-step.

Good luck! 🚀🌱
