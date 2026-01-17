import { KingMycoBot } from './bot';

// Use environment variables for production deployment
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN || '';

if (!OPENAI_KEY || !BOT_TOKEN) {
	console.error('Missing required environment variables: BOT_TOKEN and OPENAI_KEY');
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
