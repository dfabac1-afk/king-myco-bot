# Railway Deployment Guide for King Myco Bot

## Quick Deploy to Railway (Free 24/7 Hosting)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Project
```bash
npm run build
```

### Step 3: Deploy to Railway

1. **Sign up for Railway:**
   - Go to https://railway.app
   - Sign up with GitHub (easiest)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Push this code to a GitHub repository first (see below)

3. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - King Myco Bot"
   # Create a new repo on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/king-myco-bot.git
   git branch -M main
   git push -u origin main
   ```

4. **Select Your Repo in Railway:**
   - Choose your newly created repository
   - Railway will auto-detect Node.js and deploy

5. **Set Environment Variables (IMPORTANT!):**
   - In Railway dashboard, go to your project
   - Click on "Variables" tab
   - Add these variables:
     - `BOT_TOKEN` = Your Telegram bot token
     - `OPENAI_KEY` = Your OpenAI API key

6. **Deploy:**
   - Railway will automatically build and deploy
   - Your bot will be live 24/7!

### Monitoring
- Check logs in Railway dashboard under "Deployments" tab
- Bot will restart automatically if it crashes

---

## Alternative: Render.com (Also Free)

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub repo
5. Configure:
   - **Name:** king-myco-bot
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
6. Add environment variables (same as above)
7. Click "Create Web Service"

---

## Alternative: DigitalOcean (Requires $5/month)

If you need more control:
1. Create a DigitalOcean Droplet (Ubuntu)
2. SSH into server
3. Install Node.js
4. Clone your repo
5. Install PM2: `npm install -g pm2`
6. Run: `pm2 start dist/index.js --name king-myco`
7. Setup PM2 startup: `pm2 startup` and `pm2 save`

---

## Troubleshooting

**Bot not responding:**
- Check Railway logs
- Verify environment variables are set
- Make sure only ONE instance is running

**409 Conflict Error:**
- Stop your local bot (the one on your computer)
- Only run ONE bot instance at a time (either local OR cloud, not both)

**Out of credits:**
- Railway free tier: $5/month credit (enough for small bots)
- Render free tier: 750 hours/month (enough for 24/7)
- Upgrade if needed
