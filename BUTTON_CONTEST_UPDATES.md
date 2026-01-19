# Button Contest & King Myco Response Updates

## Changes Implemented (January 19, 2026)

### 1. Selective King Myco Responses ✅

King Myco will now **ONLY** respond to messages that:
- Contain the word "MYCO" (case-insensitive)
- Contain "$MYCO" 
- Contain "king myco" (case-insensitive)
- End with a question mark "?"

**Examples that will trigger response:**
- "What do you think about MYCO?"
- "Tell me about $MYCO"
- "King Myco, what's your wisdom?"
- "What is the meaning of life?"
- "How does Solana work?"

**Examples that will NOT trigger response:**
- "Hello everyone"
- "Good morning"
- "I'm buying some tokens"

This prevents King Myco from responding to every message in group chats while still being helpful when summoned or asked questions.

---

### 2. Public Button Push Announcements 🎉

Every time someone pushes the button, there's now a **public celebration announcement** that:

- Announces who pushed the button
- Shows their total push count
- Displays their current rank
- **Encourages others to compete** with motivational messages
- Includes inline buttons to push or view leaderboard

**Sample announcements:**
- "🎉 John just pushed the button! They now have 5 total pushes! 💪 Can YOU beat their record?"
- "⚡ BOOM! Sarah pushed the button! Current streak: 12 pushes! 🔥 Don't let them take the lead!"
- "🍄 Mike has activated the fungal power! Total pushes: 8! 👑 Will you challenge King Myco's chosen one?"

The bot randomly selects from 4 different announcement styles to keep it fresh and engaging.

---

### 3. Daily Winner Announcements 🏆

**Automatic daily winner announcement every 24 hours:**

- Runs at **midnight UTC** every day
- Announces the person with the **most pushes in the last 24 hours**
- Shows their daily push count, total pushes, and overall rank
- **Can be pinned** to your announcement channel/group
- Automatically resets daily stats after announcement

**Announcement includes:**
```
🏆 DAILY WINNER ANNOUNCEMENT 🏆

👑 Congratulations to [Winner Name]!

🔘 Daily Pushes: 15
💎 Total Pushes: 47
🏅 Current Rank: #2

🍄 King Myco honors your dedication to the fungal kingdom!

---
💪 Can YOU claim tomorrow's victory?
🔘 Push the button every 30 minutes to compete!
```

---

## Setup for Daily Announcements

### Option 1: Announcement Channel (Recommended)
Set an environment variable for your announcement channel:
```env
ANNOUNCEMENT_CHAT_ID=-1001234567890
```

Then uncomment lines in `bot_clean.ts` (search for `ANNOUNCEMENT_CHAT_ID`) to enable automatic posting and pinning.

### Option 2: Manual Monitoring
Daily winner info is logged to console. You can manually post announcements if preferred.

---

## Technical Details

### Files Modified:
1. **src/bot_clean.ts**
   - Modified `handleMessage()` to check for MYCO keywords or question marks
   - Modified `handleButtonClick()` to make public announcements
   - Added `startDailyWinnerAnnouncements()` method
   - Added `announceDailyWinner()` method

2. **src/services/buttoncontest.ts**
   - Added `dailyPushes` property to `ButtonPusher` interface
   - Added `getDailyWinner()` method
   - Added `resetDailyStats()` method
   - Added `dailyResetTime` tracking

### How Daily Timer Works:
- Calculates time until next midnight UTC
- Schedules first announcement at midnight
- Then repeats every 24 hours using `setInterval`
- Automatically resets daily stats after each announcement

---

## Testing

### Test Selective Responses:
1. In a group chat, send: "Hello everyone" → No response
2. Send: "What do you think about MYCO?" → King Myco responds
3. Send: "How does staking work?" → King Myco responds (has "?")
4. Send: "$MYCO to the moon" → King Myco responds

### Test Button Announcements:
1. Push the button → See public celebration
2. Push again (after cooldown) → Different announcement style
3. Check leaderboard → See updated stats

### Test Daily Winner:
- Wait for midnight UTC OR
- Manually call `resetDailyStats()` and `getDailyWinner()` in testing

---

## Competition Mechanics

### Current Setup:
- **Cooldown:** 30 minutes between pushes
- **Max daily pushes:** 48 (if pushed every 30 min for 24h)
- **Spores awarded:** 10 per push
- **Public encouragement:** Every successful push

This creates healthy competition while preventing spam!

---

## Future Enhancements

Possible additions:
- Weekly winners
- Monthly champions
- Streak bonuses (consecutive day pushes)
- Special rewards for daily winners
- Multi-group leaderboards
- Push statistics dashboard

---

## Notes

- Daily announcements start automatically when bot starts
- First announcement will be at next midnight UTC
- Console logs all daily winner info for monitoring
- Stats persist in memory (consider database for production)
- Pin permissions needed for announcement channel

---

**Status:** ✅ Fully Implemented and Ready
**Date:** January 19, 2026
