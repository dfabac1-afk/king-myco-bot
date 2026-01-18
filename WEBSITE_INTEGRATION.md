# King Myco Bot & Website Integration Guide

## Overview

This integration connects your Telegram bot with kingmyco.com, enabling:
- **Spores**: In-game currency earned from button pushes and quest completion
- **Quests**: Tasks created on the website that award spores when completed
- **Leaderboard**: Display top spore earners on your website
- **Real-time announcements**: Quest completions announced in Telegram

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  kingmyco.com   │◄───────►│  Express API     │◄───────►│  Supabase       │
│  (Frontend)     │  (REST)  │  Server (3000)   │         │  (Database)     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                    ▲
                                    │ Telegram API
                                    ▼
                            ┌──────────────────┐
                            │  Telegram Bot    │
                            │  (Polling)       │
                            └──────────────────┘
```

## Setup Instructions

### 1. Supabase Setup

First, set up your Supabase database with the required tables:

1. Go to [supabase.com](https://supabase.com) and create/login to your project
2. Open the SQL editor in Supabase
3. Run the SQL from `supabase-setup.sql` in your project root
4. Copy your credentials:
   - **Supabase URL**: https://[project-id].supabase.co
   - **Supabase Key**: (Anon or Service Role key)

### 2. Environment Variables

Add these to your Railway (or local) `.env`:

```bash
# Existing
BOT_TOKEN=your-telegram-bot-token
OPENAI_KEY=your-openai-api-key

# New - Supabase Integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# API Server
API_PORT=3000
API_KEY=your-secure-api-key-for-website-access
ANNOUNCEMENT_GROUP_ID=optional-telegram-group-id
```

### 3. Deploy Changes

```bash
npm install
npm run build
git add -A
git commit -m "Add website integration: Spores, Quests, API"
git push origin main
```

Railway will auto-deploy. Your API will be available at:
```
https://your-railway-url/api
```

## API Endpoints

All endpoints require the `x-api-key` header or `apiKey` query parameter.

### Leaderboard

**GET** `/api/leaderboard?limit=10`

Returns top spore earners.

```bash
curl -H "x-api-key: your-api-key" \
  https://your-railway-url/api/leaderboard?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 123456,
      "telegramName": "user1",
      "totalSpores": 500,
      "questsCompleted": 5,
      "leaderboardRank": 1
    }
  ],
  "timestamp": "2026-01-18T10:30:00Z"
}
```

### User Profile

**GET** `/api/user/:userId/profile`

Get user spores and stats.

```bash
curl -H "x-api-key: your-api-key" \
  https://your-railway-url/api/user/123456/profile
```

### User Spores

**GET** `/api/user/:userId/spores`

Get user's current spore balance.

```bash
curl -H "x-api-key: your-api-key" \
  https://your-railway-url/api/user/123456/spores
```

**Response:**
```json
{
  "success": true,
  "userId": 123456,
  "totalSpores": 250
}
```

### User Quests

**GET** `/api/user/:userId/quests?completed=false`

Get user's active or completed quests.

```bash
curl -H "x-api-key: your-api-key" \
  https://your-railway-url/api/user/123456/quests
```

### Create Quest

**POST** `/api/user/:userId/quests`

Create a new quest for a user.

```bash
curl -X POST -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily Challenge",
    "description": "Complete 5 trades",
    "reward": 100
  }' \
  https://your-railway-url/api/user/123456/quests
```

**Response:**
```json
{
  "success": true,
  "questId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Quest created successfully"
}
```

### Complete Quest

**POST** `/api/user/:userId/quests/:questId/complete`

Mark a quest as completed (awards spores).

```bash
curl -X POST -H "x-api-key: your-api-key" \
  https://your-railway-url/api/user/123456/quests/550e8400-e29b-41d4-a716-446655440000/complete
```

This will:
1. Mark quest as completed
2. Award spores to user
3. Announce completion in Telegram
4. Update user stats

### Add Spores (Admin)

**POST** `/api/user/:userId/spores/add`

Manually award spores (use for promotions, rewards, etc).

```bash
curl -X POST -H "x-api-key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "reason": "Tournament winner"
  }' \
  https://your-railway-url/api/user/123456/spores/add
```

### Stats

**GET** `/api/stats`

Get overall bot statistics.

```bash
curl -H "x-api-key: your-api-key" \
  https://your-railway-url/api/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 42,
    "totalSpores": 5250,
    "topPlayer": {
      "userId": 123456,
      "telegramName": "king",
      "totalSpores": 500
    },
    "timestamp": "2026-01-18T10:30:00Z"
  }
}
```

## Website Integration Examples

### Display Leaderboard

```html
<div id="leaderboard"></div>

<script>
const API_KEY = 'your-api-key';
const API_URL = 'https://your-railway-url/api';

async function displayLeaderboard() {
  const response = await fetch(`${API_URL}/leaderboard?limit=10`, {
    headers: { 'x-api-key': API_KEY }
  });
  
  const data = await response.json();
  const html = data.data.map((user, i) => `
    <div class="leaderboard-entry">
      <span class="rank">#${i + 1}</span>
      <span class="name">${user.telegramName}</span>
      <span class="spores">🌱 ${user.totalSpores}</span>
    </div>
  `).join('');
  
  document.getElementById('leaderboard').innerHTML = html;
}

displayLeaderboard();
</script>
```

### Display User Spores

```html
<div id="user-spores"></div>

<script>
async function displayUserSpores(userId) {
  const response = await fetch(`${API_URL}/user/${userId}/spores`, {
    headers: { 'x-api-key': API_KEY }
  });
  
  const data = await response.json();
  document.getElementById('user-spores').innerHTML = 
    `🌱 ${data.totalSpores} Spores`;
}

displayUserSpores(123456);
</script>
```

### Create and Complete Quests

```html
<button onclick="createQuest()">Create Quest</button>
<button onclick="completeQuest()">Complete Quest</button>

<script>
async function createQuest() {
  const response = await fetch(`${API_URL}/user/123456/quests`, {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Complete Daily Trading',
      description: 'Make 5 trades on the platform',
      reward: 100
    })
  });
  
  const data = await response.json();
  console.log('Quest created:', data.questId);
}

async function completeQuest(questId) {
  const response = await fetch(
    `${API_URL}/user/123456/quests/${questId}/complete`,
    {
      method: 'POST',
      headers: { 'x-api-key': API_KEY }
    }
  );
  
  const data = await response.json();
  console.log('Quest completed! Spores awarded.');
}
</script>
```

## Spores System

### How Spores Are Earned

1. **Button Push Contest**: +10 spores per successful push (every 30 mins)
2. **Quest Completion**: Variable reward (set when quest is created)
3. **Admin Awards**: Manual spore allocation via API

### Where Spores Are Displayed

- **Telegram**: In bot leaderboard after button push
- **Website**: User dashboard, leaderboard, profile
- **API**: All endpoints include spore data

## Quest Announcements

When a quest is completed:

1. **Telegram**: Announcement sent to configured group or user's DM
2. **Database**: Quest marked as completed, user stats updated
3. **Spores**: Awarded to user's account
4. **Webhook** (optional): You can set up webhooks for custom integrations

### Example Announcement Message

```
🎉 **QUEST COMPLETED!**

👤 username has completed the quest:
📜 **Complete Daily Trading**

✨ **Reward:** +100 🌱 Spores

Total Spores Earned: 250
Quests Completed: 2

---
*Complete quests at kingmyco.com to earn more spores!*
```

## Troubleshooting

### API Returns 401 Unauthorized

- Check your API key in the header/query parameter
- Verify it matches `API_KEY` in Railway env vars

### Quests Not Appearing on Website

- Verify Supabase is initialized (`SUPABASE_URL` and `SUPABASE_KEY` set)
- Check Railway logs: `railway logs`
- Ensure quest was created with correct user ID

### Spores Not Updating

- Verify Supabase connection is active
- Check Supabase user_profiles table has the user record
- Look at spore_transactions table for audit trail

### Quest Announcements Not in Telegram

- Set `ANNOUNCEMENT_GROUP_ID` environment variable
- Or quests announce to user's private DM
- Check bot has permission to post in group

## Security Notes

1. **API Key**: Change from default `default-api-key-change-in-production`
2. **CORS**: Currently allows all origins; restrict in production
3. **Rate Limiting**: Add rate limiting for production use
4. **Authentication**: Consider JWT tokens for website users
5. **Database**: Enable Row-Level Security (RLS) policies in Supabase

## Next Steps

1. Configure Supabase database
2. Set environment variables in Railway
3. Deploy changes
4. Test API endpoints
5. Integrate with kingmyco.com frontend
6. Monitor logs for errors

## Support

For issues or questions, check:
- Railway logs: `railway logs`
- Supabase logs: In Supabase dashboard
- Bot console output: Check for [INDEX] logs
