import TelegramBot from 'node-telegram-bot-api';
import { DexScreenerService } from './services/dexscreener';
import { OpenAIService } from './services/openai';
import { ChatMessage } from './types';
import { ButtonContestService } from './services/buttoncontest';

export class KingMycoBot {
  private bot: TelegramBot;
  private dexScreener: DexScreenerService;
  private openai: OpenAIService;
  private conversationHistory: Map<number, ChatMessage[]> = new Map();
  private buttonContest: ButtonContestService = new ButtonContestService();

  constructor(botToken: string, openaiKey: string) {
    const token = process.env.BOT_TOKEN || botToken;
    if (!token) {
      throw new Error('BOT_TOKEN must be provided via environment variable or constructor');
    }
    this.bot = new TelegramBot(token, { polling: true });
    this.dexScreener = new DexScreenerService();
    this.openai = new OpenAIService(openaiKey);

    this.setupHandlers();
    this.setupMenuButton();
  }

  private setupMenuButton(): void {
    const commands = [
      { command: 'start', description: '🚀 Start the bot and see welcome message' },
      { command: 'menu', description: '📱 Open main interactive menu' },
      { command: 'mycoai', description: '👑 King Myco coin menu' },
      { command: 'mycomeme', description: '😂 Create funny King Myco memes' },
      { command: 'motivate', description: '💪 Get King Myco wisdom & motivation' },
      { command: 'newtocrypto', description: '🌱 Learn crypto basics & Solana for beginners' },
      { command: 'newtomyco', description: '📘 Learn with Myco — curated lessons' },
      { command: 'educate', description: '🎓 Learn about Solana blockchain' },
      { command: 'ca', description: '🔍 Lookup token by contract address' },
      { command: 'price', description: '💰 Get crypto price' },
      { command: 'volume', description: '📊 Get 24h trading volume' },
      { command: 'chart', description: '📈 Get technical analysis' },
      { command: 'trending', description: '🔥 Top 10 trending Solana coins' },
      { command: 'risk', description: '⚠️ Analyze token risk factors' },
      { command: 'holders', description: '👥 Check token holder distribution' },
      { command: 'askkingmyco', description: '🧙 Ask King Myco AI a question' },
      { command: 'xposts', description: '𝕏 Generate X posts about King Myco' },
      { command: 'help', description: '❓ Get command help' },
      { command: 'buttonpush', description: '🔘 Join the button push contest!' },
      { command: 'leaderboard', description: '🏆 See top button pushers' }
    ];

    this.bot.setMyCommands(commands).catch((error: any) => {
      console.error('Failed to set bot commands:', error);
    });
  }

  private setupHandlers(): void {
    console.log('[SETUP] Registering command handlers...');
    this.bot.onText(/\/start(@\w+)?/i, async (msg) => { try { await this.handleStart(msg); } catch (e) { console.error('[START] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /start'); } });
    this.bot.onText(/\/help/, async (msg) => { try { await this.handleHelp(msg); } catch (e) { console.error('[HELP] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /help'); } });
    this.bot.onText(/\/menu(@\w+)?/i, async (msg) => { try { await this.handleMenu(msg); } catch (e) { console.error('[MENU] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /menu'); } });
    this.bot.onText(/\/mycoai(@\w+)?/i, async (msg) => { try { await this.handleKingMycoMenu(msg); } catch (e) { console.error('[MYCOAI] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /mycoai'); } });
    this.bot.onText(/\/ca\s+(\w+)/, async (msg, match) => { try { await this.handleCALookup(msg, match); } catch (e) { console.error('[CA] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /ca'); } });
    this.bot.onText(/\/risk\s+(\w+)/, async (msg, match) => { try { await this.handleRisk(msg, match); } catch (e) { console.error('[RISK] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /risk'); } });
    this.bot.onText(/\/listings\s+(\w+)/, async (msg, match) => { try { await this.handleListings(msg, match); } catch (e) { console.error('[LISTINGS] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /listings'); } });
    this.bot.onText(/\/holders\s+(\w+)/, async (msg, match) => { try { await this.handleHolders(msg, match); } catch (e) { console.error('[HOLDERS] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /holders'); } });
    this.bot.onText(/\/top10%\s+(\w+)/, async (msg, match) => { try { await this.handleTop10Percent(msg, match); } catch (e) { console.error('[TOP10] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /top10%'); } });
    this.bot.onText(/\/price\s+([A-Za-z0-9]+)/, async (msg, match) => { try { await this.handlePrice(msg, match); } catch (e) { console.error('[PRICE] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /price'); } });
    this.bot.onText(/\/volume\s+(\w+)/, async (msg, match) => { try { await this.handleVolume(msg, match); } catch (e) { console.error('[VOLUME] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /volume'); } });
    this.bot.onText(/\/chart\s+(\w+)/, async (msg, match) => { try { await this.handleChart(msg, match); } catch (e) { console.error('[CHART] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /chart'); } });
    this.bot.onText(/\/trending/, async (msg) => { try { await this.handleTrending(msg); } catch (e) { console.error('[TRENDING] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /trending'); } });
    this.bot.onText(/\/portfolio/, async (msg) => { try { await this.handlePortfolio(msg); } catch (e) { console.error('[PORTFOLIO] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /portfolio'); } });
    this.bot.onText(/\/mycomeme(@\w+)?(?:\s+(.+))?/i, async (msg, match) => { try { await this.handleMycoMeme(msg, match); } catch (e) { console.error('[MEME] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /mycomeme'); } });
    this.bot.onText(/\/motivate(@\w+)?/i, async (msg) => { try { await this.handleMotivate(msg); } catch (e) { console.error('[MOTIVATE] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /motivate'); } });
    this.bot.onText(/\/newtocrypto(@\w+)?/i, async (msg) => { try { await this.handleNewToCrypto(msg); } catch (e) { console.error('[CRYPTO] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /newtocrypto'); } });
    this.bot.onText(/\/newtomyco(@\w+)?/i, async (msg) => { try { await this.handleNewToMyco(msg); } catch (e) { console.error('[NEWTOMYCO] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /newtomyco'); } });
    this.bot.onText(/\/educate(@\w+)?(?:\s+(.+))?/i, async (msg, match) => { try { await this.handleEducate(msg, match); } catch (e) { console.error('[EDUCATE] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /educate'); } });
    this.bot.onText(/\/askkingmyco\s+(.+)/, async (msg, match) => { try { await this.handleAskKingMyco(msg, match); } catch (e) { console.error('[ASKKINGMYCO] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /askkingmyco'); } });
    this.bot.onText(/\/xposts(@\w+)?/i, async (msg) => { try { await this.handleXPosts(msg); } catch (e) { console.error('[XPOSTS] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /xposts'); } });
    this.bot.onText(/\/buttonpush(@\w+)?/i, async (msg) => { try { console.log('[BUTTONPUSH] Command triggered'); await this.handleButtonPush(msg); } catch (e) { console.error('[BUTTONPUSH] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /buttonpush'); } });
    this.bot.onText(/\/leaderboard(@\w+)?/i, async (msg) => { try { await this.handleLeaderboard(msg); } catch (e) { console.error('[LEADERBOARD] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process /leaderboard'); } });
    this.bot.on('callback_query', async (query) => { try { await this.handleCallbackQuery(query); } catch (e) { console.error('[CALLBACK] Error:', e); this.bot.sendMessage(query.message?.chat.id || 0, 'Error: Could not process button.'); } });
    this.bot.on('message', async (msg) => { try { await this.handleMessage(msg); } catch (e) { console.error('[MESSAGE] Error:', e); this.bot.sendMessage(msg.chat.id, 'Error: Could not process message.'); } });
    console.log('[SETUP] Handlers registered successfully');
  }

  private async handleStart(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const greetings = [
      '👑 Well, well, well... another seeker arrives. The mycelium has spoken.',
      '🍄 Ah, fresh spores in the wind. Welcome to the kingdom.',
      '🧙 Another wanderer enters the fungal realm. Most peculiar timing.',
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    await this.bot.sendMessage(chatId, greeting);
    await this.handleMenu(msg);
  }

  private async handleHelp(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const helpMessage = [
      '📖 King Myco AI Commands:',
      '/menu - Interactive menu',
      '/askkingmyco <question> - Ask King Myco',
      '/buttonpush - Join the button push contest',
      '/leaderboard - View top button pushers',
    ].join('\n');
    await this.bot.sendMessage(chatId, helpMessage);
  }

  private async handleMenu(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const menuMessage = '🎯 **King Myco AI - Main Menu**\n\nChoose a category:';
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📘 Learn with Myco', callback_data: 'menu_learnmyco' }],
          [{ text: '🔍 Token Analysis', callback_data: 'menu_token' }],
          [{ text: '📊 Market Data', callback_data: 'menu_market' }],
          [{ text: '🧙 Ask King Myco', callback_data: 'menu_kingmyco' }],
          [{ text: '💼 Portfolio', callback_data: 'menu_portfolio' }],
          [{ text: '🔘 Button Push', callback_data: 'menu_buttonpush' }],
          [{ text: '🏆 Leaderboard', callback_data: 'menu_leaderboard' }],
        ],
      },
    } as TelegramBot.SendMessageOptions;
    await this.bot.sendMessage(chatId, menuMessage, options);
  }

  private async handleCallbackQuery(query: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = query.message?.chat.id!;
    const data = query.data;
    console.log(`[CALLBACK] Data: ${data}, ChatID: ${chatId}, UserID: ${query.from?.id}`);
    this.bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'menu_token':
        this.showTokenMenu(chatId);
        break;
      case 'menu_market':
        this.showMarketMenu(chatId);
        break;
      case 'menu_kingmyco':
        this.showKingMycoMenu(chatId);
        break;
      case 'menu_portfolio':
        this.bot.sendMessage(chatId, '💼 Use /portfolio for tips.');
        break;
      case 'menu_learnmyco':
        this.handleNewToMyco({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'menu_buttonpush':
        this.handleButtonPush({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'menu_leaderboard':
        this.handleLeaderboard({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'button_push':
        console.log(`[BUTTON_PUSH] Attempting to handle button click for user ${query.from?.id}`);
        await this.handleButtonClick(chatId, query.from?.id || 0, query.from?.first_name || 'Anonymous');
        break;
      case 'edu_solana':
      case 'edu_wallets':
      case 'edu_tokenomics':
      case 'edu_defi':
      case 'edu_nfts':
      case 'edu_gasfees':
      case 'edu_cycles':
      case 'edu_staking':
      case 'edu_hodl':
      case 'edu_btceth':
      case 'edu_dexcex':
      case 'edu_scams':
        this.handleEducationTopic(chatId, data);
        break;
      case 'back_main':
        this.handleMenu({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      default:
        console.log(`[CALLBACK] Unhandled callback data: ${data}`);
    }
  }

  private showTokenMenu(chatId: number): void {
    const message = [
      '🔍 **Token Analysis Tools**',
      '',
      '📌 Quick Commands:',
      '/ca <address> - Full overview',
      '/risk <address> - Risk analysis',
      '/holders <address> - Holders',
      '/top10% <address> - Top 10% holders',
    ].join('\n');
    const options = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back_main' }]] } };
    this.bot.sendMessage(chatId, message, options);
  }

  private showMarketMenu(chatId: number): void {
    const message = [
      '📊 **Market Data & Analysis**',
      '',
      '📌 Quick Commands:',
      '/price <symbol> - Get price',
      '/volume <symbol> - Trading volume',
      '/chart <symbol> - Chart analysis',
      '/trending - Top trending coins',
    ].join('\n');
    const options = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back_main' }]] } };
    this.bot.sendMessage(chatId, message, options);
  }

  private showKingMycoMenu(chatId: number): void {
    const kingMycoMessage = [
      '🧙 **Ask King Myco**',
      '',
      'The mushroom king sorcerer awaits your questions...',
      '',
      'Use: /askkingmyco <your question>',
      '',
      'Examples:',
      '• What\'s your wisdom?',
      '• Tell me about DeFi',
      '• How should I invest?',
    ].join('\n');
    const options = { reply_markup: { inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back_main' }]] } };
    this.bot.sendMessage(chatId, kingMycoMessage, options);
  }

  private async handleKingMycoMenu(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    this.showKingMycoMenu(chatId);
  }

  private async handleMessage(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;
    this.bot.sendChatAction(chatId, 'typing');
    const systemPrompt = 'You are King Myco, a stoic mushroom king sorcerer. Speak with measured wisdom, dry humor, no financial advice.';
    const messages: ChatMessage[] = [ { role: 'system', content: systemPrompt }, { role: 'user', content: text } ];
    const response = await this.openai.chat(messages);
    const formatted = `🧙 King Myco Speaks:\n\n${response}`;
    this.bot.sendMessage(chatId, formatted, { parse_mode: 'Markdown' });
  }

  // DexScreener powered handlers (trimmed but functional)
  private async handleCALookup(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const address = match?.[1];
    if (!address) { this.bot.sendMessage(chatId, 'Usage: /ca <contract_address>'); return; }
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Fetching token info...');
      const token = await this.dexScreener.getTokenInfo(address);
      const activity = await this.dexScreener.getTradingActivity(address);
      if (!token) {
        this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id });
        return;
      }
      const aiInsight = await this.openai.askAboutProject(token.name, `Price $${token.price}, Vol24h $${token.volume24h}, MC ${token.marketCap}, Liq ${token.liquidity}`);
      const response = [
        `📊 ${token.name} (${token.symbol})`,
        `Price: $${token.price.toFixed(6)}`,
        `24h Volume: $${token.volume24h.toFixed(0)}`,
        `Market Cap: ${token.marketCap}`,
        `Liquidity: ${token.liquidity}`,
        '',
        `🧙 King Myco's Take:`,
        aiInsight,
        '',
        '⚠️ NFA. DYOR.',
      ].join('\n');
      this.bot.editMessageText(response, { chat_id: chatId, message_id: loading.message_id });
    } catch (e) {
      this.bot.sendMessage(chatId, '❌ Error fetching token information.');
    }
  }

  private async handleRisk(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const address = match?.[1];
    if (!address) { this.bot.sendMessage(chatId, 'Usage: /risk <contract_address>'); return; }
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Analyzing risk...');
      const token = await this.dexScreener.getTokenInfo(address);
      const activity = await this.dexScreener.getTradingActivity(address);
      if (!token) { this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id }); return; }
      const riskData = `Δ24h ${token.priceChange24h}%, Vol24h $${token.volume24h}, MC ${token.marketCap}, Buys ${activity?.buys24h}, Sells ${activity?.sells24h}`;
      const riskAnalysis = await this.openai.analyzeRisk(token.name, riskData);
      const response = [
        `⚠️ Risk Check: ${token.name}`,
        `Price Change 24h: ${token.priceChange24h}%`,
        `Vol 24h: $${token.volume24h.toFixed(0)}`,
        `MC: ${token.marketCap}`,
        `Liq: ${token.liquidity}`,
        `Buys: ${activity?.buys24h ?? 'N/A'} | Sells: ${activity?.sells24h ?? 'N/A'}`,
        '',
        riskAnalysis,
        '',
        '⚠️ NFA',
      ].join('\n');
      this.bot.editMessageText(response, { chat_id: chatId, message_id: loading.message_id });
    } catch {
      this.bot.sendMessage(chatId, '❌ Error analyzing risk.');
    }
  }

  private async handleListings(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const address = match?.[1];
    if (!address) { this.bot.sendMessage(chatId, 'Usage: /listings <contract_address>'); return; }
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Finding listings...');
      const token = await this.dexScreener.getTokenInfo(address);
      if (!token) { this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id }); return; }
      const listingsInfo = await this.openai.chat([
        { role: 'system', content: 'Suggest likely exchanges/DEXs for this Solana token.' },
        { role: 'user', content: `${token.name} (${token.symbol}) Vol24h $${token.volume24h.toFixed(0)}, MC ${token.marketCap}` },
      ]);
      const response = [`🏪 Listings & Exchanges: ${token.name}`, listingsInfo].join('\n');
      this.bot.editMessageText(response, { chat_id: chatId, message_id: loading.message_id });
    } catch {
      this.bot.sendMessage(chatId, '❌ Error fetching listings.');
    }
  }

  private async handleHolders(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const address = match?.[1];
    if (!address) { this.bot.sendMessage(chatId, 'Usage: /holders <contract_address>'); return; }
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Analyzing holders...');
      const token = await this.dexScreener.getTokenInfo(address);
      if (!token) { this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id }); return; }
      const holdersAnalysis = await this.openai.chat([
        { role: 'system', content: 'Provide insights on token holder distribution and health.' },
        { role: 'user', content: `${token.name} (${token.symbol}) MC ${token.marketCap} Liq ${token.liquidity}` },
      ]);
        const response = [`👥 Holder Analysis: ${token.name}`, holdersAnalysis].join('\n');
      this.bot.editMessageText(response, { chat_id: chatId, message_id: loading.message_id });
    } catch {
      this.bot.sendMessage(chatId, '❌ Error analyzing holders.');
    }
  }

  private async handleTop10Percent(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const address = match?.[1];
    if (!address) { this.bot.sendMessage(chatId, 'Usage: /top10% <contract_address>'); return; }
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Analyzing top holders...');
      const token = await this.dexScreener.getTokenInfo(address);
      const activity = await this.dexScreener.getTradingActivity(address);
      if (!token) { this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id }); return; }
      const top10Analysis = await this.openai.chat([
        { role: 'system', content: 'Analyze concentration risk of top holders.' },
        { role: 'user', content: `${token.name} Vol24h $${token.volume24h.toFixed(0)} MC ${token.marketCap}` },
      ]);
      const response = [`🔝 Top 10% Holders: ${token.name}`, `Buys: ${activity?.buys24h ?? 'N/A'} | Sells: ${activity?.sells24h ?? 'N/A'}`, top10Analysis].join('\n');
      this.bot.editMessageText(response, { chat_id: chatId, message_id: loading.message_id });
    } catch {
      this.bot.sendMessage(chatId, '❌ Error analyzing top holders.');
    }
  }

  private async handlePrice(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const symbol = match?.[1]?.toUpperCase();
    if (!symbol) { this.bot.sendMessage(chatId, 'Usage: /price <symbol>'); return; }
    try {
      this.bot.sendChatAction(chatId, 'typing');
      const info = await this.openai.analyzePriceAction(symbol, `Get price and 24h change for ${symbol}.`);
      const response = `💰 Price Check: ${symbol}\n\n${info}\n\n⚠️ NFA`;
      this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch { this.bot.sendMessage(chatId, '❌ Error fetching price.'); }
  }

  private async handleVolume(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const symbol = match?.[1]?.toUpperCase();
    if (!symbol) { this.bot.sendMessage(chatId, 'Usage: /volume <symbol>'); return; }
    try {
      this.bot.sendChatAction(chatId, 'typing');
      const info = await this.openai.analyzeVolume(symbol, `24h and 7d volume for ${symbol}.`);
      const response = `📊 Volume Check: ${symbol}\n\n${info}\n\n⚠️ NFA`;
      this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch { this.bot.sendMessage(chatId, '❌ Error fetching volume.'); }
  }

  private async handleChart(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const symbol = match?.[1]?.toUpperCase();
    if (!symbol) { this.bot.sendMessage(chatId, 'Usage: /chart <symbol>'); return; }
    try {
      this.bot.sendChatAction(chatId, 'typing');
      const info = await this.openai.analyzeChart(symbol, `Chart patterns for ${symbol}.`);
      const response = `📈 Chart Analysis: ${symbol}\n\n${info}\n\n⚠️ NFA`;
      this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch { this.bot.sendMessage(chatId, '❌ Error fetching chart.'); }
  }

  private async handleTrending(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Top 5 trending Solana coins...');
      const trending = await this.dexScreener.trendingSolanaTokens(5);
      if (!trending.length) { this.bot.editMessageText('❌ No trending coins found.', { chat_id: chatId, message_id: loading.message_id }); return; }
      let report = '🔥 Top 5 Trending Solana Coins\n\n';
      for (const [idx, token] of trending.entries()) {
        report += `${idx + 1}. ${token.name} (${token.symbol}) - $${token.price} | Δ24h ${token.priceChange24h}% | Vol24h $${token.volume24h}\n`;
      }
      this.bot.editMessageText(report, { chat_id: chatId, message_id: loading.message_id });
    } catch { this.bot.sendMessage(chatId, '❌ Error fetching trending data.'); }
  }

  private async handlePortfolio(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const portfolioInfo = [
      '💼 Portfolio Tips',
      '• Diversify across sectors',
      '• Set profit targets and stop losses',
      '• Use hardware wallets for security',
    ].join('\n');
    this.bot.sendMessage(chatId, portfolioInfo);
  }

  private async handleEducate(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const topic = match?.[2]?.toLowerCase().trim();
    if (!topic) { this.bot.sendMessage(chatId, '🎓 Use /educate <topic> (e.g., diamond, swing)'); return; }
    const topicMap: { [k: string]: string } = {
      diamond: 'Teach diamond hands and conviction in King Myco lingo.',
      swing: 'Explain swing trading on Solana DEXs in practical steps.',
    };
    const question = topicMap[topic];
    if (!question) { this.bot.sendMessage(chatId, '❌ Topic not found. Try: diamond, swing'); return; }
    this.bot.sendChatAction(chatId, 'typing');
    const answer = await this.openai.askCryptoQuestion(question);
    this.bot.sendMessage(chatId, `🧙 King Myco's Lesson\n\n${answer}`);
  }

  private async handleAskKingMyco(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || chatId;
    const question = match?.[1];
    if (!question) { this.bot.sendMessage(chatId, 'Usage: /askkingmyco <your question>'); return; }
    if (!this.conversationHistory.has(userId)) this.conversationHistory.set(userId, []);
    const history = this.conversationHistory.get(userId)!;
    history.push({ role: 'user', content: question });
    if (history.length > 20) history.splice(0, 2);
    const systemPrompt = 'You are King Myco, a stoic mushroom king sorcerer. No price predictions. Measured wisdom, nature metaphors, dry humor.';
    const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }, ...history];
    const response = await this.openai.chat(messages);
    history.push({ role: 'assistant', content: response });
    this.bot.sendMessage(chatId, `🧙 King Myco Speaks\n\n${response}`);
  }

  private async handleMycoMeme(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const topic = match?.[2]?.toLowerCase().trim();
    if (!topic) {
      const options = { reply_markup: { inline_keyboard: [
        [{ text: '💎 HODL Memes', callback_data: 'meme_hodl' }],
        [{ text: '🪡 Rug Pull Memes', callback_data: 'meme_rugpull' }],
        [{ text: '🔙 Back', callback_data: 'back_main' }],
      ] } };
      this.bot.sendMessage(chatId, '😂 King Myco Meme Factory', options);
      return;
    }
    const prompts: { [k: string]: string } = {
      hodl: 'Create 3 hilarious King Myco HODL memes.',
      rugpull: 'Create 3 hilarious rug pull memes in King Myco voice.',
    };
    const prompt = prompts[topic];
    if (!prompt) { this.bot.sendMessage(chatId, '❌ Meme type not found. Try: hodl, rugpull'); return; }
    const memeResponse = await this.openai.askCryptoQuestion(prompt);
    this.bot.sendMessage(chatId, `😂 King Myco Comedy\n\n${memeResponse}`);
  }

  private async handleMotivate(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const quotes = [
      '💎 Diamond hands are forged under pressure.',
      '🧙 Patience is the way; markets reward the measured.',
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    this.bot.sendMessage(chatId, `🧙 King Myco's Wisdom\n\n${quote}`);
  }

  private async handleNewToCrypto(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const options = { reply_markup: { inline_keyboard: [
      [{ text: '⛓️ Solana Blockchain', callback_data: 'edu_solana' }],
      [{ text: '🔑 Wallets & Security', callback_data: 'edu_wallets' }],
      [{ text: '📊 Tokenomics', callback_data: 'edu_tokenomics' }],
      [{ text: '🏦 DeFi & Contracts', callback_data: 'edu_defi' }],
      [{ text: '🖼️ NFTs', callback_data: 'edu_nfts' }],
      [{ text: '⚡ Gas Fees', callback_data: 'edu_gasfees' }],
      [{ text: '📈 Market Cycles', callback_data: 'edu_cycles' }],
      [{ text: '🎯 Staking & Yield', callback_data: 'edu_staking' }],
      [{ text: '💼 HODL vs Trading', callback_data: 'edu_hodl' }],
      [{ text: '🪙 Bitcoin & Ethereum', callback_data: 'edu_btceth' }],
      [{ text: '🏪 DEXs & CEXs', callback_data: 'edu_dexcex' }],
      [{ text: '⚠️ Scams & Rugs', callback_data: 'edu_scams' }],
      [{ text: '⬅️ Back', callback_data: 'back_main' }],
    ] } };
    const msg_text = '🌱 **King Myco\'s Academy**\n\nChoose a topic to learn about crypto & Solana:\n\n⚠️ Remember: This is educational content, NOT financial advice (NFA). Always DYOR!';
    this.bot.sendMessage(chatId, msg_text, options);
  }

  private async handleNewToMyco(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const options = { reply_markup: { inline_keyboard: [
      [{ text: '⛓️ Solana Blockchain', callback_data: 'edu_solana' }],
      [{ text: '🔑 Wallets & Security', callback_data: 'edu_wallets' }],
      [{ text: '📊 Tokenomics', callback_data: 'edu_tokenomics' }],
      [{ text: '🏦 DeFi & Contracts', callback_data: 'edu_defi' }],
      [{ text: '🖼️ NFTs', callback_data: 'edu_nfts' }],
      [{ text: '⚡ Gas Fees', callback_data: 'edu_gasfees' }],
      [{ text: '📈 Market Cycles', callback_data: 'edu_cycles' }],
      [{ text: '🎯 Staking & Yield', callback_data: 'edu_staking' }],
      [{ text: '💼 HODL vs Trading', callback_data: 'edu_hodl' }],
      [{ text: '🪙 Bitcoin & Ethereum', callback_data: 'edu_btceth' }],
      [{ text: '🏪 DEXs & CEXs', callback_data: 'edu_dexcex' }],
      [{ text: '⚠️ Scams & Rugs', callback_data: 'edu_scams' }],
      [{ text: '⬅️ Back', callback_data: 'back_main' }],
    ] } };
    const msg_text = '📘 **Learn with Myco**\n\nCurated lessons, kept fresh with current market context.\n\nPick a topic:';
    this.bot.sendMessage(chatId, msg_text, options);
  }

  private async handleEducationTopic(chatId: number, topic: string): Promise<void> {
    const topicMap: { [key: string]: { title: string; prompt: string } } = {
      edu_solana: {
        title: '⛓️ Solana Blockchain',
        prompt: 'Teach a beginner why Solana is revolutionary. Include current context: performance, fees, ecosystem growth, and notable recent developments.'
      },
      edu_wallets: {
        title: '🔑 Wallets & Security',
        prompt: 'Explain wallets (hot vs cold), seed phrases, private keys, security best practices, common pitfalls, and recent scam trends.'
      },
      edu_tokenomics: {
        title: '📊 Tokenomics',
        prompt: 'Explain supply, distribution, emissions, burning, staking rewards, FDV vs MC, and how to spot healthy tokenomics with current market examples.'
      },
      edu_defi: {
        title: '🏦 DeFi & Contracts',
        prompt: 'Introduce DeFi and smart contracts, core primitives (DEXs, lending, staking), composability, and current risks and narratives.'
      },
      edu_nfts: {
        title: '🖼️ NFTs',
        prompt: 'Explain NFTs: utility, art, gaming, tickets; discuss market maturity, royalties, and current trends.'
      },
      edu_gasfees: {
        title: '⚡ Gas Fees',
        prompt: 'Explain transaction fees, why Solana is cheaper, congestion, and tips to minimize costs.'
      },
      edu_cycles: {
        title: '📈 Market Cycles',
        prompt: 'Explain bull/bear cycles, macro drivers, psychology, and positioning through cycles with present context.'
      },
      edu_staking: {
        title: '🎯 Staking & Yield',
        prompt: 'Explain staking, validators, yield sources, risks of liquid staking, and recent changes in yields.'
      },
      edu_hodl: {
        title: '💼 HODL vs Trading',
        prompt: 'Contrast long-term conviction vs active trading, time horizons, risk management, and realistic expectations.'
      },
      edu_btceth: {
        title: '🪙 Bitcoin & Ethereum',
        prompt: 'Teach Bitcoin vs Ethereum: history, purpose, tech differences, and how Solana fits into today’s multi-chain landscape.'
      },
      edu_dexcex: {
        title: '🏪 DEXs & CEXs',
        prompt: 'Explain decentralized vs centralized exchanges, pros/cons, safety, compliance, and recent events affecting usage.'
      },
      edu_scams: {
        title: '⚠️ Scams & Rugs',
        prompt: 'Cover common scams, rug pulls, pump-and-dumps, red flags, verification steps, and recent notable incidents.'
      },
    };

    const content = topicMap[topic];
    if (!content) { this.bot.sendMessage(chatId, '❌ Topic not found. Use /newtomyco to see available topics.'); return; }

    try {
      this.bot.sendChatAction(chatId, 'typing');
      const timestamp = new Date().toISOString();
      const systemPrompt = 'You are King Myco, a stoic and wise mushroom king sorcerer. Teach with measured wisdom, nature metaphors, and dry wit. Never give financial advice. Reference current market conditions when relevant.';
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${content.prompt}\n\nCurrent timestamp: ${timestamp}. Update the explanation to feel current and relevant.` },
      ];
      const answer = await this.openai.chat(messages);
      const formatted = `${content.title}\n\n${answer}\n\n---\n⚠️ This is educational content only. NFA / DYOR.`;
      this.bot.sendMessage(chatId, formatted);
    } catch (error) {
      console.error('Education topic error:', error);
      this.bot.sendMessage(chatId, '❌ Error generating educational content. Please try again.');
    }
  }

  private async handleXPosts(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    try {
      this.bot.sendChatAction(chatId, 'typing');
      const styles = ['funny', 'serious', 'motivational', 'edgy', 'informative'];
      const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
      const timestamp = new Date().toISOString();
      const prompt = `Generate 3 unique X posts about $MYCO. Style: ${selectedStyle}. Current timestamp: ${timestamp}. Each under 280 characters.`;
      const response = await this.openai.askCryptoQuestion(prompt);
      this.bot.sendMessage(chatId, `𝕏 King Myco Posts (${selectedStyle})\n\n${response}`);
    } catch (error) {
      console.error('X posts generation error:', error);
      this.bot.sendMessage(chatId, '🧙 The sorcerer\'s wisdom spreads thin today... Try again shortly!');
    }
  }

  // Button Push Contest Handlers
  private async handleButtonPush(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const message = [
      '🔘 **King Myco Button Push Contest**',
      '',
      'Push the magical button every 30 minutes to earn points!',
      'Compete with the community to reach the top of the leaderboard.',
      '',
      '💪 Ready to push?',
    ].join('\n');
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔘 PUSH THE BUTTON', callback_data: 'button_push' }],
          [{ text: '🏆 Leaderboard', callback_data: 'menu_leaderboard' }],
          [{ text: '⬅️ Back', callback_data: 'back_main' }],
        ],
      },
    } as TelegramBot.SendMessageOptions;
    this.bot.sendMessage(chatId, message, options);
  }

  private async handleButtonClick(chatId: number, userId: number, userName: string): Promise<void> {
    try {
      console.log(`[BUTTON_CLICK] User ${userId} (${userName}) pushing button in chat ${chatId}`);
      const result = this.buttonContest.addClick(userId, userName);
      console.log(`[BUTTON_CLICK] Result:`, result);
      
      if (result.success) {
        const userRank = this.buttonContest.getUserRank(userId);
        const rankMessage = userRank ? `\n\n🏅 Your rank: #${userRank.rank} with ${userRank.clicks} total pushes!` : '';
        await this.bot.sendMessage(chatId, `${result.message}${rankMessage}`);
      } else {
        await this.bot.sendMessage(chatId, result.message);
      }
    } catch (error) {
      console.error('[BUTTON_CLICK] Error:', error);
      this.bot.sendMessage(chatId, '❌ Error processing button click.');
    }
  }

  private async handleLeaderboard(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const leaderboard = this.buttonContest.getLeaderboard(10);
    const leaderboardText = this.buttonContest.formatLeaderboard(leaderboard);
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔘 Push Button', callback_data: 'button_push' }],
          [{ text: '⬅️ Back', callback_data: 'back_main' }],
        ],
      },
    } as TelegramBot.SendMessageOptions;
    this.bot.sendMessage(chatId, leaderboardText, options);
  }

  public start(): void {
    console.log('🚀 King Myco AI Bot is running...');
  }
}
