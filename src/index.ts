import dotenv from 'dotenv';
dotenv.config();

import { KingMycoBot } from './bot_clean';
import { SupabaseIntegration } from './services/supabase-integration';
import { ApiServer } from './services/api-server';

// Use environment variables for production deployment
const OPENAI_KEY = process.env.OPENAI_KEY || '';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const API_KEY = process.env.API_KEY || 'default-api-key-change-in-production';
const API_PORT = parseInt(process.env.API_PORT || '3000', 10);

console.log('[INDEX] BOT_TOKEN:', BOT_TOKEN ? `${BOT_TOKEN.substring(0, 20)}...` : 'NOT SET');
console.log('[INDEX] OPENAI_KEY:', OPENAI_KEY ? `${OPENAI_KEY.substring(0, 20)}...` : 'NOT SET');
console.log('[INDEX] SUPABASE_URL:', SUPABASE_URL ? `${SUPABASE_URL.substring(0, 20)}...` : 'NOT SET (optional)');
console.log('[INDEX] API_PORT:', API_PORT);

if (!OPENAI_KEY || !BOT_TOKEN) {
	console.error('[INDEX] Missing required environment variables: BOT_TOKEN and OPENAI_KEY');
	process.exit(1);
}

// Initialize Supabase if credentials provided
let supabaseIntegration: SupabaseIntegration | null = null;
if (SUPABASE_URL && SUPABASE_KEY) {
	supabaseIntegration = new SupabaseIntegration(SUPABASE_URL, SUPABASE_KEY);
	console.log('[INDEX] Supabase integration initialized');
} else {
	console.warn('[INDEX] SUPABASE_URL or SUPABASE_KEY not set. Spores and quests features disabled.');
}

const bot = new KingMycoBot(BOT_TOKEN, OPENAI_KEY, supabaseIntegration);

// Start bot
bot.start();

// Initialize API server
const apiServer = new ApiServer(
	{
		port: API_PORT,
		apiKey: API_KEY,
	},
	bot,
	supabaseIntegration
);

apiServer.start();

console.log('King Myco Bot is live!');

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});


process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason);
});
