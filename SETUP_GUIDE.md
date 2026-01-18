# King Myco Website Integration - Setup Checklist

## Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use existing
3. Run the SQL from `supabase-setup.sql` in Supabase SQL Editor
4. Copy credentials:
   - **Project URL**: https://xxxxx.supabase.co
   - **Anon Key**: (from API settings)

## Step 2: Railway Environment Variables

Add these to your Railway project settings:

```
BOT_TOKEN=<your existing telegram bot token>
OPENAI_KEY=<your existing openai key>
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=<your supabase anon key>
API_KEY=your-secure-api-key-for-website (change from default!)
API_PORT=3000
ANNOUNCEMENT_GROUP_ID=<optional: telegram group id for quest announcements>
```

## Step 3: Hostinger Integration

Your Hostinger API key is stored. You can use it to:
- Route traffic to your bot API
- Create DNS records pointing to your Railway URL

### Connect Hostinger to Railway:

1. Get your Railway URL: `https://your-railway-url.railway.app`
2. Create a CNAME record in Hostinger pointing to your Railway deployment
3. Or use Railway's custom domain feature

## Step 4: API Endpoints Available

Once deployed, these endpoints are available at `https://your-railway-url/api`:

### Read Operations (No Auth Required)
- `GET /api/leaderboard` - Top spore earners
- `GET /api/stats` - Overall stats

### Authenticated Operations (Require `x-api-key` header)
- `GET /api/user/:userId/profile` - User data
- `GET /api/user/:userId/spores` - Spore balance
- `GET /api/user/:userId/quests` - User quests
- `POST /api/user/:userId/quests` - Create quest
- `POST /api/user/:userId/quests/:questId/complete` - Complete quest
- `POST /api/user/:userId/spores/add` - Award spores

## Step 5: Website Integration

Update your kingmyco.com frontend:

```javascript
const API_BASE = 'https://your-railway-url/api';
const API_KEY = 'your-api-key';

// Example: Fetch leaderboard
const response = await fetch(`${API_BASE}/leaderboard?limit=10`, {
  headers: { 'x-api-key': API_KEY }
});
```

See `WEBSITE_INTEGRATION.md` for full examples and documentation.

## Step 6: Verify Deployment

1. Check Railway logs: `railway logs`
2. Test health endpoint: `https://your-railway-url/health`
3. Test leaderboard: `curl https://your-railway-url/api/leaderboard`

## Troubleshooting

### API Returns 401
- Check `API_KEY` matches between Railway and your website code
- Verify `x-api-key` header is being sent

### Supabase Connection Error
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are set
- Check Supabase project is active
- Verify SQL tables were created (check supabase-setup.sql)

### Button Push Contest Not Awarding Spores
- Ensure Supabase is initialized (API_KEY should show in logs)
- Check user_profiles table in Supabase has entries
- Look at spore_transactions table for audit trail

### Quest Announcements Not Working
- Set `ANNOUNCEMENT_GROUP_ID` to receive group announcements
- Or quests will announce to user's private chat
- Check bot permissions in Telegram group

## API Response Examples

### Leaderboard
```json
{
  "success": true,
  "data": [
    {
      "userId": 123456,
      "telegramName": "player1",
      "totalSpores": 500,
      "questsCompleted": 5
    }
  ]
}
```

### User Profile
```json
{
  "success": true,
  "data": {
    "userId": 123456,
    "telegramName": "player1",
    "totalSpores": 250,
    "questsCompleted": 2
  }
}
```

### Complete Quest
```json
{
  "success": true,
  "message": "Quest completed successfully! Spores awarded."
}
```

## Next Steps

1. ✅ Website integration files created
2. ⏳ Run SQL in Supabase
3. ⏳ Set environment variables in Railway
4. ⏳ Test API endpoints
5. ⏳ Integrate with kingmyco.com frontend
6. ⏳ Monitor logs for errors

---

For full documentation, see `WEBSITE_INTEGRATION.md`
