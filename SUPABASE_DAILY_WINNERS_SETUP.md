# Supabase Daily Winners Setup Guide

## 🎯 What's Been Implemented

Daily button push winners are now **permanently stored in Supabase** with full history tracking, leaderboards, and persistent data across bot restarts.

---

## 📋 Setup Steps

### 1. **Update Supabase Database Schema**

Run the updated SQL script in your Supabase SQL Editor:

**Location:** `supabase-setup.sql`

The new additions include:
- `daily_button_winners` table
- `get_daily_wins_leaderboard()` function for optimized queries
- Indexes for performance

#### Quick Copy-Paste (New Tables Only):

```sql
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

-- Function to get daily wins leaderboard
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
```

### 2. **Verify Environment Variables**

Make sure your `.env` file has:

```env
BOT_TOKEN=your_telegram_bot_token
OPENAI_KEY=your_openai_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
API_KEY=your_api_key
API_PORT=3000
```

### 3. **Deploy to Railway (or your platform)**

Your bot will now automatically:
- ✅ Load all historical daily winners on startup
- ✅ Save each new daily winner to Supabase
- ✅ Display persistent leaderboards
- ✅ Survive bot restarts without losing data

---

## 🔄 How It Works

### Data Flow

```
Daily Winner Announcement (Midnight UTC)
    ↓
1. Get current day's winner
    ↓
2. Save to Supabase database
    ↓
3. Also cache in memory
    ↓
4. Reset daily push counts
    ↓
5. Ready for next day
```

### On Bot Startup

```
Bot Initialization
    ↓
1. Connect to Supabase
    ↓
2. Load last 365 daily winners
    ↓
3. Cache in memory for fast access
    ↓
4. Start daily announcement timer
```

### When User Requests `/dailywinners`

```
User Command
    ↓
1. Fetch fresh data from Supabase
    ↓
2. Aggregate wins per user
    ↓
3. Display champions + history
    ↓
4. Cache results for performance
```

---

## 📊 Database Tables

### `daily_button_winners`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `userId` | BIGINT | Telegram user ID |
| `userName` | TEXT | Telegram username |
| `dailyPushes` | INT | Pushes in that 24h period |
| `totalPushes` | INT | Total lifetime pushes |
| `rank` | INT | Overall rank at time of win |
| `winDate` | DATE | Date of win (YYYY-MM-DD) |
| `createdAt` | TIMESTAMP | When record was created |

**Unique Constraint:** One winner per `winDate`

---

## 🎮 Features

### 1. **Persistent History**
- All daily winners saved forever
- Survives bot restarts
- Historical analysis possible

### 2. **Champions Leaderboard**
Shows users ranked by **total daily wins**:
```
🏆 Daily Win Champions 🏆

🥇 Sarah - 12 days won (Last: Jan 19)
🥈 John - 8 days won (Last: Jan 18)
🥉 Mike - 5 days won (Last: Jan 17)
```

### 3. **Recent History**
Chronological list of recent winners:
```
📅 Daily Winners History 📅

📆 Jan 19, 2026 - Sarah (18 pushes)
📆 Jan 18, 2026 - John (15 pushes)
📆 Jan 17, 2026 - Mike (12 pushes)
```

### 4. **Automatic Syncing**
- New winners auto-saved to database
- Fallback to in-memory if DB unavailable
- Smart caching for performance

---

## 🧪 Testing

### Test Database Connection

In Supabase SQL Editor:
```sql
-- Check table exists
SELECT * FROM daily_button_winners LIMIT 5;

-- Test function
SELECT * FROM get_daily_wins_leaderboard(10);
```

### Test Bot Commands

1. Push button multiple times (different users)
2. Manually trigger winner (for testing):
   ```javascript
   // In bot console or test script
   const winner = buttonContest.getDailyWinner();
   if (winner) buttonContest.saveDailyWinner(winner);
   ```
3. Check `/dailywinners` command
4. Verify data in Supabase dashboard

### Verify Persistence

1. Push button and win a day
2. Check Supabase table for new record
3. Restart bot
4. Run `/dailywinners` - history should persist!

---

## 📈 Monitoring

### Check Logs

Watch for these messages:
```
[BUTTON_CONTEST] Loading daily winners history from Supabase...
[BUTTON_CONTEST] Loaded 45 historical winners
[SUPABASE] Daily winner saved: Sarah 2026-01-19
```

### Supabase Dashboard

Monitor:
- Table row count
- Query performance
- Storage usage

---

## 🔧 Advanced Configuration

### Custom Announcement Channel

To post daily winners to a specific channel:

1. Get your channel ID:
   ```javascript
   // Forward a message from the channel to @userinfobot
   // Channel ID format: -1001234567890
   ```

2. Add to `.env`:
   ```env
   ANNOUNCEMENT_CHAT_ID=-1001234567890
   ```

3. Uncomment in `bot_clean.ts` (lines ~937-941):
   ```typescript
   const announcementChatId = process.env.ANNOUNCEMENT_CHAT_ID;
   if (announcementChatId) {
     const sentMsg = await this.bot.sendMessage(announcementChatId, announcement);
     await this.bot.pinChatMessage(announcementChatId, sentMsg.message_id);
   }
   ```

### Adjust History Limit

In `buttoncontest.ts` constructor:
```typescript
// Default: last 365 days
const winners = await this.supabase.getDailyWinnersHistory(365);

// Change to 90 days:
const winners = await this.supabase.getDailyWinnersHistory(90);
```

---

## 🚨 Troubleshooting

### Winners Not Saving

**Check:**
1. Supabase credentials in `.env`
2. Table created successfully
3. Console logs for errors
4. Row Level Security policies

**Solution:**
```sql
-- Disable RLS temporarily for testing
ALTER TABLE daily_button_winners DISABLE ROW LEVEL SECURITY;

-- Or add proper policy
CREATE POLICY "Allow bot insert" ON daily_button_winners
  FOR INSERT WITH CHECK (true);
```

### Duplicate Winner Error

**Symptom:** `Error: duplicate key value violates unique constraint`

**Cause:** Winner already recorded for this date

**Solution:** This is expected - the system prevents duplicate winners. Check logs for:
```
[SUPABASE] Daily winner already exists for 2026-01-19
```

### History Not Loading

**Check:**
1. Bot has internet connection
2. Supabase URL/key are correct
3. Table has data

**Fallback:** Bot will use in-memory cache

---

## 📦 Files Modified

### Database
- ✅ `supabase-setup.sql` - Added daily winners table + function

### Backend Services
- ✅ `src/services/supabase-integration.ts` - Added daily winners methods
- ✅ `src/services/buttoncontest.ts` - Added Supabase persistence
- ✅ `src/bot_clean.ts` - Updated to use async methods

### Features Added
- ✅ Persistent daily winner storage
- ✅ Champions leaderboard (most days won)
- ✅ Historical winner list
- ✅ Automatic data syncing
- ✅ Fallback to memory cache
- ✅ Optimized SQL queries

---

## 🎉 You're Live!

Once you've run the SQL script and redeployed, your daily winners system is **fully persistent**!

### Quick Verification Checklist

- [ ] SQL tables created in Supabase
- [ ] Environment variables set
- [ ] Bot redeployed
- [ ] Test `/dailywinners` command
- [ ] Push button and verify in Supabase dashboard
- [ ] Check console logs for success messages

---

**Status:** ✅ Production Ready  
**Last Updated:** January 19, 2026

Need help? Check the console logs or Supabase dashboard for diagnostics!
