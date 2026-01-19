# MYCOAI - Official Project

## 🍄 Welcome to MYCOAI

This is the **official MYCOAI repository** - the complete King Myco AI Telegram bot platform.

---

## 🎯 What is MYCOAI?

MYCOAI is a comprehensive Telegram bot platform that combines:
- **AI-Powered Conversations** (OpenAI GPT-4)
- **Gamification System** (Button contests, spores, leaderboards)
- **Web3 Integration** (Solana/blockchain features)
- **Persistent Data Storage** (Supabase)
- **Educational Content** (Crypto & Solana learning)
- **Community Engagement** (Daily winners, competitions)

---

## 🏗️ Project Architecture

### Core Components

1. **Bot Engine** (`src/bot.ts`)
   - Main bot logic and handlers
   - King Myco AI persona
   - Command routing
   - Interactive menus

2. **Services Layer** (`src/services/`)
   - `openai.ts` - AI integration
   - `supabase-integration.ts` - Database
   - `buttoncontest.ts` - Gamification
   - `dexscreener.ts` - Token data
   - `api-server.ts` - Web3 API

3. **Data Layer** (Supabase)
   - User profiles
   - Spore system
   - Daily winners
   - Quest tracking

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your keys

# Run development
npm run dev

# Build & deploy
npm run build
npm start
```

---

## 📦 Environment Setup

### Required
```env
BOT_TOKEN=your_telegram_bot_token
OPENAI_KEY=your_openai_api_key
```

### Optional (Enhanced Features)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
API_KEY=your_api_key
API_PORT=3000
ANNOUNCEMENT_CHAT_ID=-1001234567890
```

---

## 🎮 Features

### AI & Persona
- ✅ King Myco character (stoic mushroom sorcerer)
- ✅ Context-aware responses
- ✅ Selective reply mode (MYCO mentions & questions)
- ✅ Educational content generation

### Gamification
- ✅ Button push contest (30min cooldown)
- ✅ Spore rewards system (10 per push)
- ✅ Live leaderboards (overall & daily)
- ✅ Daily winner announcements
- ✅ Public celebration messages

### Data & Persistence
- ✅ Supabase integration
- ✅ User profiles
- ✅ Historical tracking
- ✅ Real-time sync

### Community Tools
- ✅ 12 education modules
- ✅ Meme generator
- ✅ X post generator
- ✅ Token analysis
- ✅ Market data

---

## 📊 Stats & Metrics

Track your community:
- Total spores earned
- Button push counts
- Daily winners history
- User engagement levels
- Quest completions (coming soon)

---

## 🛠️ Development

### Project Structure
```
mycoai/
├── src/
│   ├── bot.ts              # Main bot
│   ├── index.ts            # Entry point
│   ├── types.ts            # TypeScript types
│   └── services/           # Service layer
├── supabase-setup.sql      # Database schema
├── package.json            # Dependencies
└── README.md              # Documentation
```

### Adding Features
1. Create service in `src/services/`
2. Add handler in `src/bot.ts`
3. Register command in `setupMenuButton()`
4. Update documentation

### Database Changes
1. Update `supabase-setup.sql`
2. Add methods in `supabase-integration.ts`
3. Test locally
4. Deploy schema changes

---

## 🚢 Deployment

### Platforms Supported
- **Railway** (Recommended)
- **Render**
- **DigitalOcean**
- **Heroku**
- **VPS/Custom**

See [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) for detailed steps.

---

## 📚 Documentation

- [README.md](README.md) - Feature overview
- [DEPLOY_CHECKLIST.md](DEPLOY_CHECKLIST.md) - Deployment guide
- [SUPABASE_DAILY_WINNERS_SETUP.md](SUPABASE_DAILY_WINNERS_SETUP.md) - Database setup
- [BUTTON_CONTEST_UPDATES.md](BUTTON_CONTEST_UPDATES.md) - Contest system
- [API_REFERENCE.md](API_REFERENCE.md) - API documentation

---

## 🤝 Contributing

This is the official MYCOAI project. To contribute:
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## 📜 License

[Your License Here]

---

## 🔗 Links

- **Telegram Bot:** [@YourBotUsername](https://t.me/YourBotUsername)
- **Website:** [Coming Soon]
- **Twitter/X:** [@MYCOAI](https://twitter.com/MYCOAI)
- **Documentation:** [docs.mycoai.com](https://docs.mycoai.com)

---

## 👑 The MYCOAI Team

Built with 🍄 by the King Myco community.

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** January 19, 2026

🍄 Welcome to the fungal kingdom! 🍄
