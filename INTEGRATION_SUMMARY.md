# 🌱 King Myco Website Integration - Complete Summary

## What Was Built

Your Telegram bot is now fully integrated with kingmyco.com through a comprehensive API system:

```
kingmyco.com ◄─────► REST API Server (Port 3000) ◄─────► Supabase Database
                                   │
                                   └─────► Telegram Bot (Quest Announcements)
```

## Features Implemented

### 1. **Spores System** 🌱
- **Button Push Contest**: +10 spores per successful push (30-min cooldown)
- **Quest Rewards**: Variable spore awards for completed quests
- **Admin Awards**: Manual spore allocation via API
- **Persistent Tracking**: All spores stored in Supabase database

### 2. **Quest System** 📜
- **Create Quests**: Website can create new quests for users
- **Track Progress**: See active and completed quests
- **Auto-Rewards**: Spores awarded automatically on completion
- **Telegram Announcements**: Quest completions announced in Telegram

### 3. **Leaderboard** 🏆
- **Spore Ranking**: Top earners displayed by total spores
- **User Stats**: Track questsCompleted, totalSpores, ranking
- **Real-time**: Updates immediately after button push or quest completion
- **Public & Private**: Leaderboard visible in Telegram and on website

### 4. **REST API Endpoints**
All endpoints require authentication via `x-api-key` header:

```
GET    /api/leaderboard              ─ Top 10 spore earners
GET    /api/stats                    ─ Overall bot statistics
GET    /api/user/:userId/profile     ─ User details + spores
GET    /api/user/:userId/spores      ─ Current spore balance
GET    /api/user/:userId/quests      ─ Active/completed quests
POST   /api/user/:userId/quests      ─ Create new quest
POST   /api/user/:userId/quests/:id/complete ─ Complete quest (award spores)
POST   /api/user/:userId/spores/add  ─ Admin: Award spores
```

## Files Created/Modified

### New Files
- `src/services/api-server.ts` - Express REST API server
- `src/services/supabase-integration.ts` - Supabase database integration
- `supabase-setup.sql` - Database schema (run in Supabase SQL editor)
- `WEBSITE_INTEGRATION.md` - Full API documentation
- `SETUP_GUIDE.md` - Step-by-step setup instructions

### Modified Files
- `src/index.ts` - Initialize API server + Supabase
- `src/bot_clean.ts` - Added quest announcement + spore retrieval methods
- `src/services/buttoncontest.ts` - Integrated spore awards on button push
- `package.json` - Added Express, Supabase, TypeScript types

## Environment Variables Needed

Add to Railway:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-supabase-key
API_KEY=change-from-default
API_PORT=3000
ANNOUNCEMENT_GROUP_ID=optional-telegram-group
```

## Quick Start

### 1. Supabase Setup
```sql
-- Run in Supabase SQL Editor (from supabase-setup.sql)
CREATE TABLE user_profiles (...)
CREATE TABLE quests (...)
CREATE TABLE spore_transactions (...)
```

### 2. Railway Deployment
- Commit and push to GitHub
- Railway auto-deploys
- API available at `https://your-railway-url/api`

### 3. Test API
```bash
# Fetch leaderboard
curl -H "x-api-key: your-api-key" \
  https://your-railway-url/api/leaderboard

# Fetch user spores
curl -H "x-api-key: your-api-key" \
  https://your-railway-url/api/user/123456/spores
```

### 4. Website Integration
```javascript
const API = 'https://your-railway-url/api';
const KEY = 'your-api-key';

// Get leaderboard
fetch(`${API}/leaderboard`, {
  headers: { 'x-api-key': KEY }
}).then(r => r.json()).then(data => console.log(data));

// Create quest
fetch(`${API}/user/123456/quests`, {
  method: 'POST',
  headers: { 'x-api-key': KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Daily Trading Challenge',
    description: 'Complete 5 trades',
    reward: 100
  })
}).then(r => r.json()).then(data => console.log(data));

// Complete quest (awards spores + announces in Telegram)
fetch(`${API}/user/123456/quests/quest-id/complete`, {
  method: 'POST',
  headers: { 'x-api-key': KEY }
}).then(r => r.json()).then(data => console.log(data));
```

## How Spores Work

```
┌─────────────────────────────────────────────────────────┐
│                    SPORE FLOW                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User pushes button every 30 min                        │
│         ↓                                               │
│  ButtonContestService.addClick()                        │
│         ↓                                               │
│  +10 spores awarded                                     │
│         ↓                                               │
│  SupabaseIntegration.addSpores()                        │
│         ↓                                               │
│  Stored in database                                     │
│         ↓                                               │
│  Website displays in profile/leaderboard                │
│                                                         │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  User completes quest from website                      │
│         ↓                                               │
│  /api/user/:id/quests/:id/complete endpoint            │
│         ↓                                               │
│  +X spores awarded (quest reward amount)                │
│         ↓                                               │
│  Quest announced in Telegram                            │
│         ↓                                               │
│  User stats updated (questsCompleted++)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### user_profiles
```
userId (PK)      - Telegram user ID
totalSpores      - Total spores earned
questsCompleted  - Number of quests finished
buttonPushes     - Number of button pushes
telegramName     - User's Telegram name
createdAt        - Account creation date
```

### quests
```
id (PK)          - Quest UUID
userId (FK)      - Which user
title            - Quest name
description      - What to do
reward           - Spores to award
completed        - Is it done?
completedAt      - When completed?
createdAt        - When created?
```

### spore_transactions
```
id (PK)          - Transaction UUID
userId (FK)      - Which user
amount           - Spores awarded
reason           - Why (button push, quest, admin, etc)
timestamp        - When
```

## Hostinger Integration Notes

Your API key (0cM4KEg0i4XCslli7AUsVrQyioP2JtbTKRwzlIIX90c24117) can be used to:

1. **Point kingmyco.com to Railway**
   - Create CNAME record pointing to your Railway deployment
   - Or use Railway's custom domain feature

2. **Update DNS Records**
   - Ensure Traffic routes to: `https://your-railway-url/api`

3. **SSL/HTTPS**
   - Railway provides automatic SSL
   - Ensure Hostinger redirects to HTTPS

## Security Considerations

✅ **Implemented:**
- API key authentication required
- CORS protection
- Telegram API polling (no webhooks exposed)
- Row-level security policies in Supabase

⚠️ **For Production:**
- Change `API_KEY` from default value
- Enable rate limiting on API
- Add JWT token auth for website users
- Consider IP whitelisting
- Enable HTTPS everywhere
- Monitor spore_transactions for fraud

## What's Next?

Your bot now has:
- ✅ 24/7 uptime on Railway
- ✅ Button push contest (30-min cooldown)
- ✅ Spores system (earned from pushes + quests)
- ✅ Quest system (website can create & track)
- ✅ REST API (for website integration)
- ✅ Database (Supabase persistence)
- ✅ Telegram announcements (quest completions)
- ✅ Leaderboard (public & real-time)

### Optional Enhancements:
- Quest types (daily, weekly, monthly)
- Achievements/badges
- Team/guild system
- Trading system for spores
- Spore marketplace
- Rankings by category
- Analytics dashboard
- Webhook notifications

---

## Support & Documentation

Full docs available in:
- `WEBSITE_INTEGRATION.md` - Complete API reference
- `SETUP_GUIDE.md` - Step-by-step setup
- `supabase-setup.sql` - Database schema

Questions? Check logs:
```bash
# Railway logs
railway logs

# Local testing
npm run dev
```

🎉 **Your bot is ready for website integration!**
