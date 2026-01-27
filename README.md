# MYCOAI

## King Myco AI - Complete Telegram Bot Platform

The official MYCOAI Telegram bot - a TypeScript-based platform powered by OpenAI GPT-4, featuring gamification, Web3 integration, and persistent data storage. King Myco is a wise mushroom sorcerer who educates, analyzes, and entertains with dry wit and nature-inspired metaphors.

## 🌟 Features

### Core Features
- 🧙 **King Myco Persona** - Stoic mushroom sorcerer with wise, measured responses
- 🤖 **AI-Powered** - OpenAI GPT-4 integration for intelligent conversations
- 📊 **Crypto Analysis** - Live Solana token data via DexScreener API
- 📚 **Education** - 12 interactive crypto/Solana learning modules
- 😂 **Meme Generator** - 6 types of crypto memes in King Myco's style
- 𝕏 **X Post Generator** - Unique social media content about $MYCO
- 💡 **Motivation** - Daily wisdom and diamond hands encouragement
- 🔍 **Token Lookup** - CA analysis, risk assessment, trending coins

### Gamification & Rewards (NEW!)
- 🔘 **Button Push Contest** - Push every 30 minutes to compete
- 🏆 **Live Leaderboards** - Overall & Daily Winners tracking
- ⭐ **Spore System** - Earn spores for activity (10 per push)
- 📅 **Daily Winners** - Automatic announcements at midnight UTC
- 💾 **Supabase Integration** - Persistent data & real-time sync
- 🎯 **Quest System** - Coming soon!

### Smart Response System
- 🎯 **Selective Replies** - Only responds to MYCO mentions or questions
- 📢 **Public Announcements** - Celebrates button pushes & encourages competition
- 📊 **Analytics** - Track user engagement & activity

## Quick Start (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set environment variables:**
   
   **Windows PowerShell:**
   ```powershell
   $env:BOT_TOKEN = "your_telegram_bot_token_here"
   $env:OPENAI_KEY = "your_openai_api_key_here"
   ```
   
   **macOS/Linux:**
   ```bash
   export BOT_TOKEN="your_telegram_bot_token_here"
   export OPENAI_KEY="your_openai_api_key_here"
   ```

3. **Run in development mode:**
   ```bash
   npm run dev
   ```
   
   Or build and run production:
   ```bash
   npm run build
   npm start
   ```

> **Note:** The bot requires `BOT_TOKEN` and `OPENAI_KEY` environment variables. Get your Telegram bot token from [@BotFather](https://t.me/botfather) and OpenAI API key from [platform.openai.com](https://platform.openai.com).

## Deploy to Cloud (24/7 Hosting)

**Want your bot to run 24/7 even when your computer is off?**

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on deploying to:
- **Railway** (Recommended - Free tier, easiest)
- **Render** (Also free tier)
- **DigitalOcean** (More control, $5/month)

## Environment Variables

### Required (Core Functionality)
```bash
BOT_TOKEN=your_telegram_bot_token
OPENAI_KEY=your_openai_api_key
```

### Optional (Enhanced Features)
```bash
# Supabase Integration (for spores, leaderboards, daily winners)
# Pre-configured - just copy .env.example to .env!
SUPABASE_URL=https://ddsnflsvxxmkeixykcfj.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkc25mbHN2eHhta2VpeHlrY2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxOTUxODMsImV4cCI6MjA3MDc3MTE4M30.32323zFWg9-rR28qQlMIi-NQhaPyIYWGrkvNvtfl9fE

# API Server (for web3 integration)
API_KEY=your_api_key
API_PORT=3000

# Daily Winner Announcements (optional)
ANNOUNCEMENT_CHAT_ID=-1001234567890
```

> **🚀 Supabase Setup:** To enable spores, leaderboards, and daily winners tracking:
> 1. Copy `.env.example` to `.env` (Supabase credentials are pre-configured!)
> 2. Run [supabase-setup.sql](supabase-setup.sql) in your Supabase SQL Editor
> 3. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for complete setup guide
> 4. See [SUPABASE_DAILY_WINNERS_SETUP.md](SUPABASE_DAILY_WINNERS_SETUP.md) for daily winners feature

## Bot Commands

### Main Commands
- `/start` - Welcome message with interactive menu
- `/help` - Command reference
- `/menu` - Main interactive menu

### Gamification Commands (NEW!)
- `/buttonpush` - Join the button push contest (earn 10 spores)
- `/leaderboard` - View top button pushers
- `/dailywinners` - View daily winner history & champions
- `/sporeleaderboard` - View top spore earners

### King Myco Commands
- `/mycoai` - King Myco coin information
- `/askkingmyco <question>` - Ask King Myco for wisdom
- `/motivate` - Get motivational wisdom
- `/xposts` - Generate X (Twitter) posts about $MYCO

### Education Commands
- `/newtocrypto` - Interactive learning menu (12 topics)
- `/newtomyco` - Learn with Myco (curated lessons)
- `/educate <topic>` - Learn about Solana/crypto topics
- `/mycomeme` - Generate funny crypto memes (6 types)

### Market Data Commands
- `/ca <address>` - Lookup Solana token by contract address
- `/price <symbol>` - Get crypto price
- `/volume <symbol>` - Get 24h trading volume
- `/chart <symbol>` - Technical analysis
- `/trending` - Top 5 trending Solana coins
- `/risk <address>` - Analyze token risk factors
- `/holders <address>` - Check holder distribution

### Community & Fun
- `/buttonpush` - Join the button push contest (30-minute cooldown)
- `/leaderboard` - View top 10 button pushers
- `/portfolio` - Portfolio management tips

## Project Structure

```
src/
  ├── index.ts              # Entry point
  ├── bot.ts                # Main bot logic & command handlers
  ├── types.ts              # TypeScript type definitions
  └── services/
      ├── openai.ts         # OpenAI GPT-4 integration
      ├── dexscreener.ts    # DexScreener API wrapper
      ├── dexscreener-api.ts        # Token data fetching
      └── dexscreener-trending.ts   # Trending tokens
```

## King Myco Persona

King Myco speaks with:
- 🍄 Stoic wisdom and ancient perspective
- 🧘 Measured, deliberate language
- 🌱 Nature-inspired metaphors (mycelium, growth cycles, fungal wisdom)
- 😏 Dry, understated humor
- ⚖️ Balanced perspective (never predictions or financial advice)

## Contributing

This bot is designed for the King Myco community. Always remember:
- ⚠️ All responses include "NFA - Not Financial Advice"
- 🔒 Never share seed phrases or private keys
- 🧠 Educate, don't speculate

## Notes

- **Not Financial Advice** - All market analysis is educational only
- **One Instance Only** - Run either locally OR on cloud, not both (avoid 409 errors)
- **Rate Limits** - OpenAI and DexScreener APIs have rate limits

## License

MIT

---

**Built with wisdom by the King Myco community** 🍄👑
