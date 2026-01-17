import { KingMycoBot } from './bot_clean';

// Use environment variables for production deployment
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN || '';

console.log('[INDEX] BOT_TOKEN:', BOT_TOKEN ? `${BOT_TOKEN.substring(0, 20)}...` : 'NOT SET');
console.log('[INDEX] OPENAI_KEY:', OPENAI_KEY ? `${OPENAI_KEY.substring(0, 20)}...` : 'NOT SET');

if (!OPENAI_KEY || !BOT_TOKEN) {
	console.error('[INDEX] Missing required environment variables: BOT_TOKEN and OPENAI_KEY');
	process.exit(1);
}

const bot = new KingMycoBot(BOT_TOKEN, OPENAI_KEY);

// Start log and global error handlers
bot.start();

console.log('King Myco Bot is live!');

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason);
});
