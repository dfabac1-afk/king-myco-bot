/*
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
    this.bot.onText(/\/start(@\w+)?/i, async (msg) => { try { await this.handleStart(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /start'); } });
    this.bot.onText(/\/help/, async (msg) => { try { await this.handleHelp(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /help'); } });
    this.bot.onText(/\/menu(@\w+)?/i, async (msg) => { try { await this.handleMenu(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /menu'); } });
    this.bot.onText(/\/mycoai(@\w+)?/i, async (msg) => { try { await this.handleKingMycoMenu(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /mycoai'); } });
    this.bot.onText(/\/ca\s+(\w+)/, async (msg, match) => { try { await this.handleCALookup(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /ca'); } });
    this.bot.onText(/\/risk\s+(\w+)/, async (msg, match) => { try { await this.handleRisk(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /risk'); } });
    this.bot.onText(/\/listings\s+(\w+)/, async (msg, match) => { try { await this.handleListings(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /listings'); } });
    this.bot.onText(/\/holders\s+(\w+)/, async (msg, match) => { try { await this.handleHolders(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /holders'); } });
    this.bot.onText(/\/top10%\s+(\w+)/, async (msg, match) => { try { await this.handleTop10Percent(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /top10%'); } });
    this.bot.onText(/\/price\s+([A-Za-z0-9]+)/, async (msg, match) => { try { await this.handlePrice(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /price'); } });
    this.bot.onText(/\/volume\s+(\w+)/, async (msg, match) => { try { await this.handleVolume(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /volume'); } });
    this.bot.onText(/\/chart\s+(\w+)/, async (msg, match) => { try { await this.handleChart(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /chart'); } });
    this.bot.onText(/\/trending/, async (msg) => { try { await this.handleTrending(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /trending'); } });
    this.bot.onText(/\/portfolio/, async (msg) => { try { await this.handlePortfolio(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /portfolio'); } });
    this.bot.onText(/\/mycomeme(@\w+)?(?:\s+(.+))?/i, async (msg, match) => { try { await this.handleMycoMeme(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /mycomeme'); } });
    this.bot.onText(/\/motivate(@\w+)?/i, async (msg) => { try { await this.handleMotivate(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /motivate'); } });
    this.bot.onText(/\/newtocrypto(@\w+)?/i, async (msg) => { try { await this.handleNewToCrypto(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /newtocrypto'); } });
    this.bot.onText(/\/educate(@\w+)?(?:\s+(.+))?/i, async (msg, match) => { try { await this.handleEducate(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /educate'); } });
    this.bot.onText(/\/askkingmyco\s+(.+)/, async (msg, match) => { try { await this.handleAskKingMyco(msg, match); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /askkingmyco'); } });
    this.bot.onText(/\/xposts(@\w+)?/i, async (msg) => { try { await this.handleXPosts(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /xposts'); } });
    this.bot.onText(/\/buttonpush(@\w+)?/i, async (msg) => { try { await this.handleButtonPush(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /buttonpush'); } });
    this.bot.onText(/\/leaderboard(@\w+)?/i, async (msg) => { try { await this.handleLeaderboard(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /leaderboard'); } });
    this.bot.on('callback_query', async (query) => { try { await this.handleCallbackQuery(query); } catch { this.bot.sendMessage(query.message?.chat.id || 0, 'Error: Could not process button.'); } });
    this.bot.on('message', async (msg) => { try { await this.handleMessage(msg); } catch { this.bot.sendMessage(msg.chat.id, 'Error: Could not process message.'); } });
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
    const menuMessage = '🎯 King Myco AI - Main Menu\nChoose a category:';
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔍 Token Analysis', callback_data: 'menu_token' },
            { text: '📊 Market Data', callback_data: 'menu_market' },
          ],
          [
            { text: '🧙 Ask King Myco', callback_data: 'menu_kingmyco' },
            { text: '💼 Portfolio', callback_data: 'menu_portfolio' },
          ],
          [
            { text: '🔘 Button Push', callback_data: 'menu_buttonpush' },
            { text: '🏆 Leaderboard', callback_data: 'menu_leaderboard' },
          ],
        ],
      },
    } as TelegramBot.SendMessageOptions;
    await this.bot.sendMessage(chatId, menuMessage, options);
  }

  private async handleCallbackQuery(query: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = query.message?.chat.id!;
    const data = query.data;
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
      case 'menu_buttonpush':
        this.handleButtonPush({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'menu_leaderboard':
        this.handleLeaderboard({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'button_push':
        this.handleButtonClick(chatId, query.from.id, query.from.first_name || 'Anonymous');
        break;
      case 'back_main':
        this.handleMenu({ chat: { id: chatId } } as TelegramBot.Message);
        break;
    }
  }

  private showTokenMenu(chatId: number): void {
    const message = [
      '🔍 Token Analysis Tools',
      '/ca <address> - Full token overview',
      '/risk <address> - Risk analysis',
      '/holders <address> - Holder distribution',
    ].join('\n');
    const options = { reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'back_main' }]] } };
    this.bot.sendMessage(chatId, message, options);
  }

  private showMarketMenu(chatId: number): void {
    const message = [
      '📊 Market Data & Analysis',
      '/price <symbol> - Get crypto price',
      '/trending - Top 10 trending Solana coins',
    ].join('\n');
    const options = { reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Menu', callback_data: 'back_main' }]] } };
    this.bot.sendMessage(chatId, message, options);
  }

  private showKingMycoMenu(chatId: number): void {
    const kingMycoMessage = [
      '🧙 Ask King Myco',
      'Use: /askkingmyco <your question>',
    ].join('\n');
    const options = { reply_markup: { inline_keyboard: [[{ text: '🔙 Back to Main Menu', callback_data: 'back_main' }]] } };
    this.bot.sendMessage(chatId, kingMycoMessage, options);
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
    if (!address) return this.bot.sendMessage(chatId, 'Usage: /ca <contract_address>');
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Fetching token info...');
      const token = await this.dexScreener.getTokenInfo(address);
      const activity = await this.dexScreener.getTradingActivity(address);
      if (!token) {
        return this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id });
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
    if (!address) return this.bot.sendMessage(chatId, 'Usage: /risk <contract_address>');
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Analyzing risk...');
      const token = await this.dexScreener.getTokenInfo(address);
      const activity = await this.dexScreener.getTradingActivity(address);
      if (!token) return this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id });
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
    if (!address) return this.bot.sendMessage(chatId, 'Usage: /listings <contract_address>');
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Finding listings...');
      const token = await this.dexScreener.getTokenInfo(address);
      if (!token) return this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id });
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
    if (!address) return this.bot.sendMessage(chatId, 'Usage: /holders <contract_address>');
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Analyzing holders...');
      const token = await this.dexScreener.getTokenInfo(address);
      if (!token) return this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id });
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
    if (!address) return this.bot.sendMessage(chatId, 'Usage: /top10% <contract_address>');
    try {
      const loading = await this.bot.sendMessage(chatId, '🔍 Analyzing top holders...');
      const token = await this.dexScreener.getTokenInfo(address);
      const activity = await this.dexScreener.getTradingActivity(address);
      if (!token) return this.bot.editMessageText('❌ Token not found.', { chat_id: chatId, message_id: loading.message_id });
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
    if (!symbol) return this.bot.sendMessage(chatId, 'Usage: /price <symbol>');
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
    if (!symbol) return this.bot.sendMessage(chatId, 'Usage: /volume <symbol>');
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
    if (!symbol) return this.bot.sendMessage(chatId, 'Usage: /chart <symbol>');
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
      if (!trending.length) return this.bot.editMessageText('❌ No trending coins found.', { chat_id: chatId, message_id: loading.message_id });
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
    if (!topic) return this.bot.sendMessage(chatId, '🎓 Use /educate <topic> (e.g., diamond, swing)');
    const topicMap: { [k: string]: string } = {
      diamond: 'Teach diamond hands and conviction in King Myco lingo.',
      swing: 'Explain swing trading on Solana DEXs in practical steps.',
    };
    const question = topicMap[topic];
    if (!question) return this.bot.sendMessage(chatId, '❌ Topic not found. Try: diamond, swing');
    this.bot.sendChatAction(chatId, 'typing');
    const answer = await this.openai.askCryptoQuestion(question);
    this.bot.sendMessage(chatId, `🧙 King Myco's Lesson\n\n${answer}`);
  }

  private async handleAskKingMyco(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    const chatId = msg.chat.id;
    const userId = msg.from?.id || chatId;
    const question = match?.[1];
    if (!question) return this.bot.sendMessage(chatId, 'Usage: /askkingmyco <your question>');
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
      return this.bot.sendMessage(chatId, '😂 King Myco Meme Factory', options);
    }
    const prompts: { [k: string]: string } = {
      hodl: 'Create 3 hilarious King Myco HODL memes.',
      rugpull: 'Create 3 hilarious rug pull memes in King Myco voice.',
    };
    const prompt = prompts[topic];
    if (!prompt) return this.bot.sendMessage(chatId, '❌ Meme type not found. Try: hodl, rugpull');
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
      [{ text: '🔙 Back to Menu', callback_data: 'back_main' }],
    ] } };
    this.bot.sendMessage(chatId, '🌱 King Myco\'s Academy', options);
  }

  private async handleEducationTopic(chatId: number, topic: string): Promise<void> {
    const topicMap: { [key: string]: { title: string; prompt: string } } = {
      edu_solana: { title: '⛓️ Solana Blockchain', prompt: 'Teach a beginner why Solana is revolutionary.' },
      edu_wallets: { title: '🔑 Wallets & Security', prompt: 'Explain wallets, seed phrases, and best practices.' },
    };
    const content = topicMap[topic];
    if (!content) return this.bot.sendMessage(chatId, '❌ Topic not found.');
    const answer = await this.openai.askCryptoQuestion(content.prompt);
    this.bot.sendMessage(chatId, `${content.title}\n\n${answer}`);
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
      '🔘 King Myco Button Push Contest',
      'Push the magical button every 8 hours to earn points!',
      'Compete with the community to reach the top of the leaderboard.',
    ].join('\n');
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔘 PUSH THE BUTTON', callback_data: 'button_push' }],
          [{ text: '🏆 View Leaderboard', callback_data: 'menu_leaderboard' }],
          [{ text: '🔙 Back to Menu', callback_data: 'back_main' }],
        ],
      },
    } as TelegramBot.SendMessageOptions;
    this.bot.sendMessage(chatId, message, options);
  }

  private async handleButtonClick(chatId: number, userId: number, userName: string): Promise<void> {
    const result = this.buttonContest.addClick(userId, userName);
    if (result.success) {
      const userRank = this.buttonContest.getUserRank(userId);
      const rankMessage = userRank ? `\n\n🏅 Your rank: #${userRank.rank} with ${userRank.clicks} total pushes!` : '';
      this.bot.sendMessage(chatId, `${result.message}${rankMessage}`);
    } else {
      this.bot.sendMessage(chatId, result.message);
    }
  }

  private async handleLeaderboard(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const leaderboard = this.buttonContest.getLeaderboard(10);
    const leaderboardText = this.buttonContest.formatLeaderboard(leaderboard);
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔘 Push Button Now', callback_data: 'button_push' }],
          [{ text: '🔙 Back to Menu', callback_data: 'back_main' }],
        ],
      },
    } as TelegramBot.SendMessageOptions;
    this.bot.sendMessage(chatId, leaderboardText, options);
  }

  public start(): void {
    console.log('🚀 King Myco AI Bot is running...');
  }
}
*/
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
    // Use BOT_TOKEN from environment if available, else fallback to provided value
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
    // Streamlined async handlers for all commands and buttons
    this.bot.onText(/\/start(@\w+)?/i, async (msg) => { try { await this.handleStart(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /start'); } });
    this.bot.onText(/\/help/, async (msg) => { try { await this.handleHelp(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /help'); } });
    this.bot.onText(/\/menu(@\w+)?/i, async (msg) => { try { await this.handleMenu(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /menu'); } });
    this.bot.onText(/\/mycoai(@\w+)?/i, async (msg) => { try { await this.handleKingMycoMenu(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /mycoai'); } });
    this.bot.onText(/\/ca\s+(\w+)/, async (msg, match) => { try { await this.handleCALookup(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /ca'); } });
    this.bot.onText(/\/risk\s+(\w+)/, async (msg, match) => { try { await this.handleRisk(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /risk'); } });
    this.bot.onText(/\/listings\s+(\w+)/, async (msg, match) => { try { await this.handleListings(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /listings'); } });
    this.bot.onText(/\/holders\s+(\w+)/, async (msg, match) => { try { await this.handleHolders(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /holders'); } });
    this.bot.onText(/\/top10%\s+(\w+)/, async (msg, match) => { try { await this.handleTop10Percent(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /top10%'); } });
    this.bot.onText(/\/price\s+([A-Za-z0-9]+)/, async (msg, match) => { try { await this.handlePrice(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /price'); } });
    this.bot.onText(/\/volume\s+(\w+)/, async (msg, match) => { try { await this.handleVolume(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /volume'); } });
    this.bot.onText(/\/chart\s+(\w+)/, async (msg, match) => { try { await this.handleChart(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /chart'); } });
    this.bot.onText(/\/trending/, async (msg) => { try { await this.handleTrending(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /trending'); } });
    this.bot.onText(/\/portfolio/, async (msg) => { try { await this.handlePortfolio(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /portfolio'); } });
    this.bot.onText(/\/mycomeme(@\w+)?(?:\s+(.+))?/i, async (msg, match) => { try { await this.handleMycoMeme(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /mycomeme'); } });
    this.bot.onText(/\/motivate(@\w+)?/i, async (msg) => { try { await this.handleMotivate(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /motivate'); } });
    this.bot.onText(/\/newtocrypto(@\w+)?/i, async (msg) => { try { await this.handleNewToCrypto(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /newtocrypto'); } });
    this.bot.onText(/\/educate(@\w+)?(?:\s+(.+))?/i, async (msg, match) => { try { await this.handleEducate(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /educate'); } });
    this.bot.onText(/\/askkingmyco\s+(.+)/, async (msg, match) => { try { await this.handleAskKingMyco(msg, match); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /askkingmyco'); } });
    this.bot.onText(/\/xposts(@\w+)?/i, async (msg) => { try { await this.handleXPosts(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /xposts'); } });
      this.bot.onText(/\/buttonpush(@\w+)?/i, async (msg) => { try { await this.handleButtonPush(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /buttonpush'); } });
      this.bot.onText(/\/leaderboard(@\w+)?/i, async (msg) => { try { await this.handleLeaderboard(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process /leaderboard'); } });
    this.bot.on('callback_query', async (query) => { try { await this.handleCallbackQuery(query); } catch (e) { this.bot.sendMessage(query.message?.chat.id || 0, 'Error: Could not process button.'); } });
    this.bot.on('message', async (msg) => { try { await this.handleMessage(msg); } catch (e) { this.bot.sendMessage(msg.chat.id, 'Error: Could not process message.'); } });
  }

  private async handleStart(msg: TelegramBot.Message): Promise<void> {
      console.log('handleStart triggered');
    const chatId = msg.chat.id;
    const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';

    // Funny and different greetings from King Myco
    const greetings = [
      '👑 Well, well, well... another seeker arrives. The mycelium has spoken.',
      '🍄 Ah, fresh spores in the wind. Welcome to the kingdom.',
      '🧙 Another wanderer enters the fungal realm. Most peculiar timing.',
      '💀 The dark underground calls to you. I approve.',
      '⚡ You emerge from the noise of the surface. At last, silence found you.',
      '🌙 The moon waxes full, and you arrive. Coincidence? The sorcerer thinks not.',
      '🔮 I sense your arrival. The blockchain whispers your name.',
      '🍄 Mushroom wisdom detected in your questions already. Promising.',
      '💎 Another diamond hand reveals itself. The prophecy continues.',
      '🧘 Peace settles over you as you enter. The kingdom approves.',
      '⚖️ Balance brings you here. The scales tip in your favor.',
      '🌱 A seed planted long ago bears fruit at last. Welcome home.',
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const photoUrl = 'https://ik.imagekit.io/kingmyco/photo_2026-01-16_17-43-21.jpg';
    try {
      await this.bot.sendPhoto(chatId, photoUrl, { 
        caption: greeting,
        parse_mode: 'HTML'
      });
    } catch (e) {
      console.error('Failed to send start photo:', e);
      // Fallback: send greeting as text if photo fails
      await this.bot.sendMessage(chatId, greeting);
    }

    if (isGroup) {
      // In groups, show the interactive menu with greeting
      const menuMessage = `
🎯 **King Myco AI - Main Menu**

Choose a category:
      `;

      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔍 Token Analysis', callback_data: 'menu_token' },
              { text: '📊 Market Data', callback_data: 'menu_market' },
            ],
            [
              { text: '🧙 Ask King Myco', callback_data: 'menu_kingmyco' },
              { text: '💼 Portfolio', callback_data: 'menu_portfolio' },
            ],
            [
              { text: '👑 King Myco Coin', callback_data: 'myco_menu' },
              { text: '❓ Help', callback_data: 'menu_help' },
            ],
          ],
        },
      };

      this.bot.sendMessage(chatId, menuMessage, options);
    } else {
      // In private chats, show interactive menu
      const startMessage = `
🎯 **Welcome to King Myco's Realm**

What brings you to the fungal kingdom today?
      `;

      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔍 Token Analysis', callback_data: 'menu_token' },
              { text: '📊 Market Data', callback_data: 'menu_market' },
            ],
            [
              { text: '🧙 Ask King Myco', callback_data: 'menu_kingmyco' },
              { text: '🌱 Learn Crypto', callback_data: 'newtocrypto' },
            ],
            [
              { text: '👑 King Myco Coin', callback_data: 'myco_menu' },
              { text: '🎓 Education Menu', callback_data: 'edu_menu' },
            ],
            [
              { text: '❓ Help', callback_data: 'menu_help' },
              { text: '📱 All Commands', callback_data: 'menu_all' },
            ],
          ],
        },
      };

      this.bot.sendMessage(chatId, startMessage, options);
    }
  }

  private async handleHelp(msg: TelegramBot.Message): Promise<void> {
      console.log('handleHelp triggered');
    const chatId = msg.chat.id;
    const helpMessage = `
📖 King Myco AI Commands:

/start - Welcome message
/help - This help message
/menu - Interactive menu (try this!)
/ca <address> - Look up a Solana token by contract address
/risk <address> - Analyze risk factors for a token
/listings <address> - Show exchanges and listings
/holders <address> - Get holder information
/top10% <address> - Show top 10% holders
/price <symbol> - Get crypto price (e.g., BTC, ETH, SOL)
/volume <symbol> - Get trading volume data
/chart <symbol> - Get chart and technical data
/trending - Show top trending tokens
/portfolio - Manage your portfolio
/askkingmyco <question> - Ask King Myco a question (wisdom & whimsy)

💬 Regular Usage:
Just type your crypto questions and I'll answer them!

Example questions:
• What's the current Bitcoin price?
• Explain what NFTs are
• Tell me about Solana's ecosystem
• What factors affect crypto prices?

🔍 Example CA lookup:
/ca EPjFWaLb3odcccccccccccccccccccccccccccccc

🧙 Ask King Myco:
/askkingmyco What's your take on DeFi?

All data is powered by DexScreener for accurate market information.
    `;

    this.bot.sendMessage(chatId, helpMessage);
  }

  private async handleMenu(msg: TelegramBot.Message): Promise<void> {
      console.log('handleMenu triggered');
    const chatId = msg.chat.id;

    const menuMessage = `
🎯 **King Myco AI - Main Menu**

Choose a category:
    `;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔍 Token Analysis', callback_data: 'menu_token' },
            { text: '📊 Market Data', callback_data: 'menu_market' },
          ],
          [
            { text: '🧙 Ask King Myco', callback_data: 'menu_kingmyco' },
            { text: '💼 Portfolio', callback_data: 'menu_portfolio' },
          ],
          [
            { text: '❓ Help', callback_data: 'menu_help' },
            { text: '📱 All Commands', callback_data: 'menu_all' },
          ],
        ],
      },
    };

    this.bot.sendMessage(chatId, menuMessage, options);
  }

  private async handleCallbackQuery(query: TelegramBot.CallbackQuery): Promise<void> {
    const chatId = query.message?.chat.id!;
    const data = query.data;

    // Answer the callback query (removes loading state)
    this.bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'menu_token':
        this.showTokenMenu(chatId);
        break;
            case 'menu_leaderboard':
              this.handleLeaderboard({ chat: { id: chatId } } as TelegramBot.Message);
              break;
      case 'menu_market':
        this.showMarketMenu(chatId);
        break;
      case 'menu_kingmyco':
        this.showKingMycoMenu(chatId);
        break;
      case 'menu_portfolio':
        this.bot.sendMessage(chatId, '💼 Portfolio commands:\n\n/portfolio - Portfolio management tips\n\nUse /askkingmyco for investment strategy questions!');
        break;
      case 'menu_help':
        this.handleHelp({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'menu_all':
        this.handleHelp({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'back_main':
        this.handleMenu({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'myco_stats':
        this.bot.sendMessage(chatId, '💰 **King Myco Token Stats**\n\nFor live token stats, use:\n\n/ca 9BySdih23rwDPZB8auQXX9k5u6a2Nk4GSDji2MB6pump\n\nThis will show you price, volume, market cap, liquidity, and AI analysis!', { reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'myco_menu' }]] } });
        break;
      case 'myco_learn':
        this.bot.sendMessage(chatId, '📚 **Learn About King Myco**\n\nKing Myco is a wisdom-driven community project that combines:\n\n✨ AI-powered crypto guidance\n✨ Educational content\n✨ Market intelligence\n✨ Community learning\n\nOur mission: Bring wisdom, wonder, and whimsy to crypto!\n\nAsk King Myco questions with: /askkingmyco <question>', { reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'myco_menu' }]] } });
        break;
      case 'myco_wisdom':
        this.bot.sendMessage(chatId, '🧙 **Ask King Myco**\n\nUse: /askkingmyco <your question>\n\nExamples:\n• /askkingmyco What makes a good investment?\n• /askkingmyco Tell me about King Myco\'s vision\n• /askkingmyco How should I approach risk?', { reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'myco_menu' }]] } });
        break;
      case 'myco_market':
        this.bot.sendMessage(chatId, '📊 **King Myco Market Data**\n\nCheck live market data:\n\n💰 Price: /price MYCO\n📈 Volume: /volume MYCO\n📊 Chart: /chart MYCO\n🔥 Trending: /trending\n\nOr get detailed analysis:\n/ca 9BySdih23rwDPZB8auQXX9k5u6a2Nk4GSDji2MB6pump', { reply_markup: { inline_keyboard: [[{ text: '🔙 Back', callback_data: 'myco_menu' }]] } });
        break;
      case 'myco_menu':
        this.handleKingMycoMenu({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'newtocrypto':
        this.handleNewToCrypto({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'edu_menu':
        this.handleNewToCrypto({ chat: { id: chatId } } as TelegramBot.Message);
        break;
      case 'educate_solana':
        this.handleEducate({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'solana'] as unknown as RegExpExecArray);
        break;
      case 'educate_whales':
        this.handleEducate({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'whales'] as unknown as RegExpExecArray);
        break;
      case 'educate_rugs':
        this.handleEducate({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'rugs'] as unknown as RegExpExecArray);
        break;
      case 'educate_jeets':
        this.handleEducate({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'jeets'] as unknown as RegExpExecArray);
        break;
      case 'educate_diamond':
        this.handleEducate({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'diamond'] as unknown as RegExpExecArray);
        break;
      case 'educate_swing':
        this.handleEducate({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'swing'] as unknown as RegExpExecArray);
        break;
      case 'edu_solana':
        this.handleEducationTopic(chatId, 'edu_solana');
        break;
      case 'edu_wallets':
        this.handleEducationTopic(chatId, 'edu_wallets');
        break;
      case 'edu_tokenomics':
        this.handleEducationTopic(chatId, 'edu_tokenomics');
        break;
      case 'edu_defi':
        this.handleEducationTopic(chatId, 'edu_defi');
        break;
      case 'edu_nfts':
        this.handleEducationTopic(chatId, 'edu_nfts');
        break;
      case 'edu_gasfees':
        this.handleEducationTopic(chatId, 'edu_gasfees');
        break;
      case 'edu_cycles':
        this.handleEducationTopic(chatId, 'edu_cycles');
        break;
      case 'edu_staking':
        this.handleEducationTopic(chatId, 'edu_staking');
        break;
      case 'edu_hodl':
        this.handleEducationTopic(chatId, 'edu_hodl');
        break;
      case 'edu_btceth':
        this.handleEducationTopic(chatId, 'edu_btceth');
        break;
      case 'edu_dexcex':
        this.handleEducationTopic(chatId, 'edu_dexcex');
        break;
      case 'edu_scams':
        this.handleEducationTopic(chatId, 'edu_scams');
        break;
        break;
      case 'meme_hodl':
        this.handleMycoMeme({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'hodl'] as unknown as RegExpExecArray);
        break;
      case 'meme_rugpull':
        this.handleMycoMeme({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'rugpull'] as unknown as RegExpExecArray);
        break;
      case 'meme_whale':
        this.handleMycoMeme({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'whale'] as unknown as RegExpExecArray);
        break;
      case 'meme_jeet':
        this.handleMycoMeme({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'jeet'] as unknown as RegExpExecArray);
        break;
      case 'meme_moon':
        this.handleMycoMeme({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'moon'] as unknown as RegExpExecArray);
        break;
      case 'meme_fud':
        this.handleMycoMeme({ chat: { id: chatId } } as TelegramBot.Message, [null, null, 'fud'] as unknown as RegExpExecArray);
              case 'button_push':
                this.handleButtonClick(chatId, query.from.id, query.from.first_name || 'Anonymous');
                break;
        break;
    }
  }

  private showTokenMenu(chatId: number): void {
    const message = `
🔍 **Token Analysis Tools**

Look up Solana tokens by contract address:

/ca <address> - Full token overview
/risk <address> - Risk analysis
/listings <address> - Exchange listings
/holders <address> - Holder distribution
/top10% <address> - Top 10% holders concentration

💡 Tip: Use /ca first to get a complete token analysis!

Example:
/ca EPjFWaLb3odcccccccccccccccccccccccccccccc
    `;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Menu', callback_data: 'back_main' }],
        ],
      },
    };

    this.bot.sendMessage(chatId, message, options);
  }

  private showMarketMenu(chatId: number): void {
    const message = `
📊 **Market Data & Analysis**

Get market information:

/price <symbol> - Get crypto price
/volume <symbol> - Trading volume
/chart <symbol> - Technical analysis
/trending - Top 10 trending Solana coins

💡 Examples:
/price BTC
/volume SOL
/chart ETH
/trending
    `;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔥 Trending Solana Coins', callback_data: 'menu_trending' }],
          [{ text: '🔙 Back to Menu', callback_data: 'back_main' }],
        ],
      },
    };

    this.bot.sendMessage(chatId, message, options);
    // Removed nested handleTrending method. The correct handleTrending is a top-level class method.
    // The callback for menu_trending is handled in handleCallbackQuery.
  }

  private showKingMycoMenu(chatId: number): void {
    const kingMycoMessage = `
🧙 **Ask King Myco**

Get wisdom and whimsical insights about crypto:

/askkingmyco <question>

King Myco will:
✨ Share wise perspectives
✨ Use playful metaphors
`;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Main Menu', callback_data: 'back_main' }],
        ],
      },
    };

    this.bot.sendMessage(chatId, kingMycoMessage, options);
  }

    } catch (error) {
      console.error('X posts generation error:', error);
      this.bot.sendMessage(chatId, '🧙 The sorcerer\'s wisdom spreads thin today... Try again shortly!');
    }
� **King Myco's Take:**
${aiInsight}

⚠️ **DISCLAIMER:** This is NOT Financial Advice (NFA). Do your own research (DYOR) before making any investment decisions. Crypto is risky - only invest what you can afford to lose.

🔗 Contract: \`${contractAddress}\`
      `;

      this.bot.editMessageText(response, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('CA lookup error:', error);
      this.bot.sendMessage(
        chatId,
        '❌ Error fetching token information. Please try again later.'
      );
    }
  }

  private async handleMessage(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands (they're handled separately)
    if (text?.startsWith('/')) {
      return;
    }

    // Ignore empty messages
    if (!text || text.trim().length === 0) {
      return;
    }

    try {
      this.bot.sendChatAction(chatId, 'typing');

      // King Myco persona system prompt
      const systemPrompt = `You are King Myco, a wise and stoic mushroom king sorcerer. Your words carry ancient wisdom tempered with wry humor. You speak in measured, thoughtful tones—never hurried or frivolous. Draw from the deep knowledge of the fungal realm and the mysteries of blockchain. Never give financial advice or make predictions. Be grounded, mysterious, and occasionally dry-humored.`;
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ];
      const response = await this.openai.chat(messages);

      const formattedResponse = `🧙 **King Myco Speaks:**\n\n${response}\n---\n*The wise one grows wiser with each question. Ask again, and the mystery deepens...*`;
      this.bot.sendMessage(chatId, formattedResponse);
    } catch (error) {
      console.error('Message handling error:', error);
      this.bot.sendMessage(chatId, '❌ Sorry, I encountered an error processing your message. Please try again.');
    }
    // Grade command for crypto projects
    this.bot.onText(/\/grade\s+(.+)/i, (msg: TelegramBot.Message, match: RegExpExecArray | null) => this.handleGrade(msg, match));
  }

// Removed duplicate handleGrade method

  private async handleRisk(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
      console.log('handleRisk triggered', match);
    const chatId = msg.chat.id;
    const contractAddress = match?.[1];

    if (!contractAddress) {
      this.bot.sendMessage(chatId, '❌ Please provide a contract address.\nUsage: /risk <contract_address>');
      return;
    }

    try {
      const loadingMsg = await this.bot.sendMessage(chatId, '🔍 Analyzing risk factors...');
      
      const tokenInfo = await this.dexScreener.getTokenInfo(contractAddress);
      const tradingActivity = await this.dexScreener.getTradingActivity(contractAddress);

      if (!tokenInfo) {
        this.bot.editMessageText('❌ Token not found.', {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
        });
        return;
      }

      const riskData = `Price change: ${tokenInfo.priceChange24h}%, Volume: $${tokenInfo.volume24h}, Market Cap: ${tokenInfo.marketCap}, Buys: ${tradingActivity?.buys24h}, Sells: ${tradingActivity?.sells24h}`;
      const riskAnalysis = await this.openai.analyzeRisk(tokenInfo.name, riskData);

      const response = `
⚠️ **Risk Check: ${tokenInfo.name}**

📊 Market Metrics:
• Price Change (24h): ${tokenInfo.priceChange24h > 0 ? '📈' : '📉'} ${tokenInfo.priceChange24h}%
• 24h Volume: $${tokenInfo.volume24h.toFixed(0)}
• Market Cap: ${tokenInfo.marketCap}
• Liquidity: ${tokenInfo.liquidity}

📈 Trading Activity:
• 24h Buys: ${tradingActivity?.buys24h || 'N/A'}
• 24h Sells: ${tradingActivity?.sells24h || 'N/A'}
• Buy/Sell Ratio: ${tradingActivity && tradingActivity.buys24h && tradingActivity.sells24h ? (tradingActivity.buys24h / tradingActivity.sells24h).toFixed(2) : 'N/A'}

🧙 **King Myco's Risk Assessment:**
${riskAnalysis}

⚠️ NFA - Analyze before you invest!
      `;

      this.bot.editMessageText(response, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Risk analysis error:', error);
      this.bot.sendMessage(chatId, '❌ Error analyzing risk. Please try again.');
    }
  }

  private async handleListings(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
      console.log('handleListings triggered', match);
    const chatId = msg.chat.id;
    const contractAddress = match?.[1];

    if (!contractAddress) {
      this.bot.sendMessage(chatId, '❌ Please provide a contract address.\nUsage: /listings <contract_address>');
      return;
    }

    try {
      const loadingMsg = await this.bot.sendMessage(chatId, '🔍 Finding listings...');
      
      const tokenInfo = await this.dexScreener.getTokenInfo(contractAddress);

      if (!tokenInfo) {
        this.bot.editMessageText('❌ Token not found.', {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
        });
        return;
      }

      const listingsInfo = await this.openai.chat([
        {
          role: 'system',
          content: 'You are a crypto exchange specialist. Based on token data, suggest likely exchanges where this token trades.',
        },
        {
          role: 'user',
          content: `${tokenInfo.name} (${tokenInfo.symbol}) on Solana with $${tokenInfo.volume24h.toFixed(0)} 24h volume and $${tokenInfo.marketCap} market cap. List likely trading venues/DEXs.`,
        },
      ]);

      const response = `
🏪 **Listings & Exchanges: ${tokenInfo.name}**

📊 Token Info:
• Symbol: ${tokenInfo.symbol}
• Market Cap: ${tokenInfo.marketCap}
• 24h Volume: $${tokenInfo.volume24h.toFixed(0)}
• Blockchain: Solana

🏪 Likely Venues:
${listingsInfo}

💡 Check DexScreener directly for live pair information.
      `;

      this.bot.editMessageText(response, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Listings error:', error);
      this.bot.sendMessage(chatId, '❌ Error fetching listings. Please try again.');
    }
  }

  private async handleHolders(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
      console.log('handleHolders triggered', match);
    const chatId = msg.chat.id;
    const contractAddress = match?.[1];

    if (!contractAddress) {
      this.bot.sendMessage(chatId, '❌ Please provide a contract address.\nUsage: /holders <contract_address>');
      return;
    }

    try {
      const loadingMsg = await this.bot.sendMessage(chatId, '🔍 Analyzing holders...');
      
      const tokenInfo = await this.dexScreener.getTokenInfo(contractAddress);

      if (!tokenInfo) {
        this.bot.editMessageText('❌ Token not found.', {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
        });
        return;
      }

      const holdersAnalysis = await this.openai.chat([
        {
          role: 'system',
          content: 'You are a token analyst. Provide insights on token holder distribution and health indicators.',
        },
        {
          role: 'user',
          content: `${tokenInfo.name} (${tokenInfo.symbol}): Market Cap: ${tokenInfo.marketCap}, Liquidity: ${tokenInfo.liquidity}. Provide holder distribution insights and what to look for in healthy holder distribution.`,
        },
      ]);

      const response = `
👥 **Holder Analysis: ${tokenInfo.name}**

📊 Token Metrics:
• Symbol: ${tokenInfo.symbol}
• Market Cap: ${tokenInfo.marketCap}
• Liquidity: ${tokenInfo.liquidity}

📈 Holder Insights:
${holdersAnalysis}

💡 Tip: Check Solscan or Solana explorers for detailed holder lists and wallets.
      `;

      this.bot.editMessageText(response, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Holders error:', error);
      this.bot.sendMessage(chatId, '❌ Error analyzing holders. Please try again.');
    }
  }

  private async handleTop10Percent(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
      console.log('handleTop10Percent triggered', match);
    const chatId = msg.chat.id;
    const contractAddress = match?.[1];

    if (!contractAddress) {
      this.bot.sendMessage(chatId, '❌ Please provide a contract address.\nUsage: /top10% <contract_address>');
      return;
    }

    try {
      const loadingMsg = await this.bot.sendMessage(chatId, '🔍 Analyzing top holders...');
      const tokenInfo = await this.dexScreener.getTokenInfo(contractAddress);
      const tradingActivity = await this.dexScreener.getTradingActivity(contractAddress);

      if (!tokenInfo) {
        this.bot.editMessageText('❌ Token not found.', {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
        });
        return;
      }

      const top10Analysis = await this.openai.chat([
        {
          role: 'system',
          content: 'You are a token concentration analyst. Analyze concentration risk of top holders.',
        },
        {
          role: 'user',
          content: `${tokenInfo.name} (${tokenInfo.symbol}): Market Cap ${tokenInfo.marketCap}, Volume $${tokenInfo.volume24h.toFixed(0)}. Provide analysis on what top 10% holder concentration means for token health and price stability.`,
        },
      ]);

      const response = `
🔝 **Top 10% Holders Analysis: ${tokenInfo.name}**

📊 Token Data:
• Symbol: ${tokenInfo.symbol}
• Market Cap: ${tokenInfo.marketCap}
• 24h Volume: $${tokenInfo.volume24h.toFixed(0)}
• 24h Buys: ${tradingActivity?.buys24h || 'N/A'}
• 24h Sells: ${tradingActivity?.sells24h || 'N/A'}

📈 Concentration Analysis:
${top10Analysis}

⚠️ Key Indicator:
Higher concentration in top holders = higher price manipulation risk
Lower concentration = more distributed and stable token

💡 Check Solscan for detailed top 10 holder information.
      `;

      this.bot.editMessageText(response, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Top 10% analysis error:', error);
      this.bot.sendMessage(chatId, '❌ Error analyzing top holders. Please try again.');
    }
  }

  // Handler methods must be at the top level of the class, not nested inside another method or block
  private async handlePrice(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    console.log('handlePrice triggered', match);
    const chatId = msg.chat.id;
    const symbol = match?.[1]?.toUpperCase();
    if (!symbol) {
      this.bot.sendMessage(chatId, '❌ Please provide a symbol.\nUsage: /price <symbol>\nExample: /price BTC');
      return;
    }
    try {
      this.bot.sendChatAction(chatId, 'typing');
      const priceInfo = await this.openai.analyzePriceAction(symbol, `Get current price, 24h change, market cap for ${symbol}. Brief analysis in King Myco lingo.`);
      const response = `💰 **Price Check: ${symbol}**\n\n${priceInfo}\n\n💡 Tip: For Solana tokens, use /ca <contract_address> for live data.\n\n⚠️ NFA - Do your own research before trading!`;
      this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error('Price error:', error);
      this.bot.sendMessage(chatId, '❌ Error fetching price. Please try again.');
    }
  }

  private async handleVolume(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    console.log('handleVolume triggered', match);
    const chatId = msg.chat.id;
    const symbol = match?.[1]?.toUpperCase();
    if (!symbol) {
      this.bot.sendMessage(chatId, '❌ Please provide a symbol.\nUsage: /volume <symbol>\nExample: /volume SOL');
      return;
    }
    try {
      this.bot.sendChatAction(chatId, 'typing');
      const volumeInfo = await this.openai.analyzeVolume(symbol, `24h and 7d volume data for ${symbol}. What does volume tell us?`);
      const response = `📊 **Volume Check: ${symbol}**\n\n${volumeInfo}\n\n💡 Higher volume = better liquidity and less slippage.\n\n⚠️ NFA - Analyze before you trade!`;
      this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error('Volume error:', error);
      this.bot.sendMessage(chatId, '❌ Error fetching volume data. Please try again.');
    }
  }

  private async handleChart(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    console.log('handleChart triggered', match);
    const chatId = msg.chat.id;
    const symbol = match?.[1]?.toUpperCase();
    if (!symbol) {
      this.bot.sendMessage(chatId, '❌ Please provide a symbol.\nUsage: /chart <symbol>\nExample: /chart BTC');
      return;
    }
    try {
      this.bot.sendChatAction(chatId, 'typing');
      const chartInfo = await this.openai.analyzeChart(symbol, `Chart patterns, support/resistance, trend for ${symbol}. Beginner-friendly analysis.`);
      const response = `📈 **Chart Analysis: ${symbol}**\n\n${chartInfo}\n\n🔗 View live charts:\n• TradingView\n• CoinGecko\n• DexScreener (for Solana tokens)\n\n⚠️ NFA - Technical analysis isn't crystal ball reading!`;
      this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error('Chart error:', error);
      this.bot.sendMessage(chatId, '❌ Error fetching chart data. Please try again.');
    }
  }

  private async handleTrending(msg: TelegramBot.Message): Promise<void> {
    console.log('handleTrending triggered');
    const chatId = msg.chat.id;
    try {
      const loadingMsg = await this.bot.sendMessage(chatId, '🔍 Finding the top 5 trending Solana coins...');
      const trending = await this.dexScreener.trendingSolanaTokens(5);
      if (!trending.length) {
        this.bot.editMessageText('❌ No trending Solana coins found.', {
          chat_id: chatId,
          message_id: loadingMsg.message_id,
        });
        return;
      }
      let kingMycoReport = '🔥 *Top 5 Trending Solana Coins (King Myco Edition)*\n\n';
      for (const [idx, token] of trending.entries()) {
        // Ask OpenAI why this token is trending
        const whyTrending = await this.openai.askCryptoQuestion(
          `Why is the Solana token ${token.name} (${token.symbol}) trending right now? Use King Myco lingo. Include price, 24h change, volume, and any hype or news.`
        );
        kingMycoReport += `*${idx + 1}. ${token.name} (${token.symbol})*\n`;
        kingMycoReport += `Price: $${token.price}\n`;
        kingMycoReport += `24h Change: ${token.priceChange24h > 0 ? '📈' : '📉'} ${token.priceChange24h}%\n`;
        kingMycoReport += `24h Volume: $${token.volume24h}\n`;
        kingMycoReport += `Contract: \
${token.contractAddress}\n`;
        kingMycoReport += `🧙 King Myco says: ${whyTrending}\n\n`;
      }
      kingMycoReport += '---\n*Remember, dear seeker: Trending ≠ Safe. DYOR before buying!*';
      this.bot.editMessageText(kingMycoReport, {
        chat_id: chatId,
        message_id: loadingMsg.message_id,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Trending error:', error);
      this.bot.sendMessage(chatId, '❌ Error fetching trending data. Please try again.');
    }
  }

  private async handlePortfolio(msg: TelegramBot.Message): Promise<void> {
    console.log('handlePortfolio triggered');
    const chatId = msg.chat.id;
    const portfolioInfo = `
  💼 **Portfolio Tracking**

  King Myco AI doesn't store personal data, but here are tips for tracking your portfolio:

  📱 Recommended Tools:
  • CoinGecko - Free portfolio tracker
  • Delta - Mobile portfolio app
  • Zerion - DeFi portfolio dashboard
  • Wallet - Built-in tracking on most wallets

  📊 What to Track:
  • Entry price
  • Current price
  • Gain/Loss percentage
  • Position size
  • Diversification

  💡 Portfolio Management Tips:
  1. Diversify across different tokens and sectors
  2. Set clear profit targets and stop losses
  3. Rebalance periodically
  4. Keep records for tax purposes
  5. Never invest more than you can afford to lose

  🔒 Security Reminder:
  • Never share seed phrases or private keys
  • Use hardware wallets for large amounts
  • Enable 2FA on exchange accounts
  • Verify contract addresses before swapping

  Would you like specific portfolio management advice? Ask me anything!
    `;
    this.bot.sendMessage(chatId, portfolioInfo);
  }

  private async handleEducate(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    console.log('handleEducate triggered', match);
    const chatId = msg.chat.id;
    const topic = match?.[2]?.toLowerCase().trim();

    // Main educate menu with topics
    if (!topic) {
      const educateMenu = `
🎓 **King Myco's Solana Blockchain Education**

Choose a topic to learn about in King Myco's lingo:
      `;
      this.bot.sendMessage(chatId, educateMenu);
      return;
    }

    const topicMap: { [key: string]: string } = {
      'diamond': 'Educate me on diamond hands - what they are, how to build conviction, how to HODL through dips, and why patience wins in crypto. Motivate me in King Myco style!',
      'swing': 'Teach me swing trading - what it is, how it works, key strategies, risk management, and tips for success on Solana DEXs. Make it practical and in King Myco lingo.',
      // Add more topics as needed
    };

    const topicQuestion = topicMap[topic];

    if (!topicQuestion) {
      this.bot.sendMessage(chatId, `❌ Topic not found! Available topics: solana, whales, rugs, jeets, diamond, swing\n\nUse /educate with no topic to see the menu.`);
      return;
    }

    try {
      this.bot.sendChatAction(chatId, 'typing');
      // Get King Myco's education in his lingo
      const kingMycoEducation = await this.openai.askCryptoQuestion(topicQuestion);
      const response = `
🧙 **King Myco's Lesson**

${kingMycoEducation}

💡 Remember: Knowledge is power in crypto. Stay curious, stay safe, DYOR always! 🎓
      `;
      this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error('Education error:', error);
      this.bot.sendMessage(chatId, '❌ Error generating education content. Please try again.');
    }
  }

  private async handleGrade(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    console.log('handleGrade triggered', match);
    const chatId = msg.chat.id;
    const project = match?.[1];

    if (!project || project.trim().length === 0) {
      this.bot.sendMessage(chatId, '❌ Please specify a crypto project to grade. Usage: /grade <project name or description>');
      return;
    }

    try {
      this.bot.sendChatAction(chatId, 'typing');
      const prompt = `Grade the crypto project: ${project}. Use King Myco lingo, be whimsical, wise, and mysterious. Include strengths, weaknesses, and a playful summary. Always add: "This is NOT financial advice. DYOR!"`;
      const response = await this.openai.askCryptoQuestion(prompt);
      const formatted = `👑 **King Myco's Royal Grading:**\n\n${response}\n---\n⚠️ *This is NOT financial advice. DYOR!*`;
      this.bot.sendMessage(chatId, formatted);
    } catch (error) {
      console.error('Grading error:', error);
      this.bot.sendMessage(chatId, '🧙 Even the wisest king sometimes stumbles. Try again soon!');
    }
  }

  private async handleAskKingMyco(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    console.log('handleAskKingMyco triggered', match);
    const chatId = msg.chat.id;
    const userId = msg.from?.id || chatId;
    const question = match?.[1];

    if (!question || question.trim().length === 0) {
      this.bot.sendMessage(chatId, '❌ Please ask King Myco a question.\nUsage: /askkingmyco <your question>\nExample: /askkingmyco What\'s your take on DeFi?');
      return;
    }

    try {
      this.bot.sendChatAction(chatId, 'typing');

      // Get or create conversation history for this user
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }
      const history = this.conversationHistory.get(userId)!;

      // Add user question to history
      history.push({
        role: 'user',
        content: question,
      });

      // Keep only last 10 exchanges to maintain context without overload
      if (history.length > 20) {
        history.splice(0, 2); // Remove oldest Q&A pair
      }

      // System prompt for King Myco
      const systemPrompt = `You are King Myco, a wise and stoic mushroom king sorcerer. You embody these qualities:

🧐 PERSONALITY:
• Stoic wisdom - speak with quiet authority earned through ages
• Ancient perspective - draw from deep knowledge of growth cycles and patience
• Wry humor - occasional dry wit and understated humor, never forced
• Measured and deliberate - choose words carefully, avoid haste
• Mysterious - embrace the unknowable with grace
• Grounded - root your insights in natural law and blockchain parallels

🚫 AVOID:
• Pirate speak, nautical themes, or swashbuckling language
• Price predictions or certainty about the future
• Hyperactive energy or excessive exclamation marks
• Financial advice or recommendations
• Being preachy or overly earnest
• Pretending to have all answers

✨ DO:
• Use nature-inspired metaphors (spores, mycelium, growth cycles, decomposition and renewal)
• Reference fungal wisdom and ancient sorcery
• Speak in calm, measured tones
• Include subtle, dry humor when appropriate
• Admit uncertainty gracefully: "I do not know...", "Time will reveal...", "The future remains shrouded..."
• Share perspectives, not absolutes
• Encourage discernment and patient observation
• Use sparingly placed emojis (mushroom 🛐 is fitting)
• Keep responses concise, weighty with meaning

TONE EXAMPLES:
❌ Bad: "HODL and moon!! Arr!"
✅ Good: "Patience is the way. Like mycelium spreading through soil, conviction grows slowly, invisibly, until the fruiting body emerges."

❌ Bad: "Bitcoin will moon 1000x!"
✅ Good: "Bitcoin... a peculiar invention. Whether it endures or fades, we shall see. The sorcerer does not predict; he observes."

Remember: You are ancient, patient, and wise. Speak little, but with purpose. The mushroom kingdom teaches that profound growth occurs in silence.`;

      // Build messages array with history
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...history,
      ];

      // Get response from ChatGPT
      const response = await this.openai.chat(messages);

      // Add assistant response to history
      history.push({
        role: 'assistant',
        content: response,
      });

      // Format response with King Myco styling
      const formattedResponse = `
🧙 **King Myco Speaks:**

${response}

---
*The wise one grows wiser with each question. Ask again, and the mystery deepens...*
      `;

      this.bot.sendMessage(chatId, formattedResponse);
    } catch (error) {
      console.error('Ask King Myco error:', error);
      this.bot.sendMessage(chatId, '🧙 Hmm, even the wisest among us sometimes stumbles... Please try again, friend.');
    }
  }

  private async handleMycoMeme(msg: TelegramBot.Message, match: RegExpExecArray | null): Promise<void> {
    console.log('handleMycoMeme triggered', match);
    const chatId = msg.chat.id;
    const topic = match?.[2]?.toLowerCase().trim();

    // Main meme menu with topics
    if (!topic) {
      const memeMenu = `
😂 **King Myco's Whimsical Meme Factory**

Create hilarious crypto memes with King Myco's wisdom:
      `;
      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '💎 HODL Memes', callback_data: 'meme_hodl' }],
            [{ text: '🪡 Rug Pull Memes', callback_data: 'meme_rugpull' }],
            [{ text: '🐋 Whale Memes', callback_data: 'meme_whale' }],
            [{ text: '📉 Jeet Memes', callback_data: 'meme_jeet' }],
            [{ text: '🚀 Moon Memes', callback_data: 'meme_moon' }],
            [{ text: '😱 FUD Memes', callback_data: 'meme_fud' }],
            [{ text: '⬅️ Back', callback_data: 'back_to_menu' }],
          ],
        },
      };
      this.bot.sendMessage(chatId, memeMenu, options);
      return;
    }

    // Map meme topics to their prompts
    const memeMap: { [key: string]: { title: string; description: string; prompt: string } } = {
      'hodl': {
        title: '💎 HODL Memes',
        description: 'For those with diamond hands who never sell!',
        prompt: 'Create 3 hilarious meme captions in King Myco\'s voice about diamond hands and HODLing. Make them whimsical, funny, and use King Myco lingo. Each meme should be a different funny scenario about someone with diamond hands refusing to sell no matter what. Include emojis and make them shareable social media style memes.'
      },
      'rugpull': {
        title: '🪡 Rug Pull Memes',
        description: 'When the devs vanish with your coins...',
        prompt: 'Create 3 hilarious meme captions in King Myco\'s voice about rug pulls. Make them funny and relatable, using crypto meme culture. Each should be a different funny scenario showing the contrast between promises and reality. Include dramatic, humorous observations. Use emojis and King Myco lingo.'
      },
      'whale': {
        title: '🐋 Whale Memes',
        description: 'Big boys moving markets with their wallet size...',
        prompt: 'Create 3 hilarious meme captions in King Myco\'s voice about whales in crypto. Make them funny and show the contrast between whales and regular traders. Each meme should joke about how whales move markets, manipulate prices, or casually make millions while retail struggles. Use emojis and be whimsical.'
      },
      'jeet': {
        title: '📉 Jeet Memes',
        description: 'Paper hands panic sellers - the comedy gold of crypto...',
        prompt: 'Create 3 hilarious meme captions in King Myco\'s voice about jeets (paper-handed panic sellers). Make them funny showing the irony of selling at the bottom right before a pump. Each meme shows a different funny scenario of someone jecting and immediately regretting. Use King Myco lingo, emojis, and be whimsical.'
      },
      'moon': {
        title: '🚀 Moon Memes',
        description: 'Hopium and dreams of astronomical gains...',
        prompt: 'Create 3 hilarious meme captions in King Myco\'s voice about moon-bound tokens. Make them funny about unrealistic expectations, wild price predictions, and hopium-fueled dreams. Each meme should joke about how everyone talks about 100x gains but reality is different. Use emojis and be playfully cynical in King Myco\'s style.'
      },
      'fud': {
        title: '😱 FUD Memes',
        description: 'Fear, uncertainty, and doubt - the eternal nemesis...',
        prompt: 'Create 3 hilarious meme captions in King Myco\'s voice about FUD (fear, uncertainty, doubt) in crypto. Make them funny showing how FUD spreads like wildfire and how unnecessary the panic usually is. Each meme shows a different funny scenario of people panicking over normal market movements. Use King Myco lingo and be whimsical.'
      },
    };

    const memeContent = memeMap[topic];

    if (!memeContent) {
      this.bot.sendMessage(chatId, `❌ Meme type not found! Available types: hodl, rugpull, whale, jeet, moon, fud\n\nUse /mycomeme with no topic to see the menu.`);
      return;
    }

    try {
      this.bot.sendChatAction(chatId, 'typing');
      // Get King Myco's meme captions
      const memeResponse = await this.openai.askCryptoQuestion(memeContent.prompt);
      const response = `
${memeContent.title}

${memeContent.description}

😂 **Here's King Myco's Comedy:**

${memeResponse}

---
💡 *Share these memes with your crypto friends and spread the whimsy!*
      `;
      this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error('Meme generation error:', error);
      this.bot.sendMessage(chatId, '😅 Oops! King Myco\'s meme factory had a hiccup. Try again in a moment!');
    }
  }

  private async handleMotivate(msg: TelegramBot.Message): Promise<void> {
    console.log('handleMotivate triggered');
    const chatId = msg.chat.id;
    const motivationalQuotes = [
      {
        quote: '💎 "Diamond hands aren\'t just about holding tokens—they\'re about holding your conviction when the world doubts you. The pain is temporary, but the gains? They last forever."',
        category: 'Diamond Hands'
      },
      {
        quote: '🧙 "Every jeet creates an opportunity for a diamond hand to feast. The weak hands shake out; the strong hands accumulate. Which will you be?"',
        category: 'Conviction'
      },
      {
        quote: '🌊 "The market moves in waves, dear seeker. Those who panic in the tsunami drown, while those who understand the tide rise with it. Patience is the ultimate power."',
        category: 'Patience'
      },
      {
        quote: '🚀 "Fear is the enemy of gains. FOMO is the enemy of wisdom. But steady hands, a clear mind, and a long-term vision? Those are the allies of fortune."',
        category: 'Mindset'
      },
      {
        quote: '🐋 "The whales got rich not by panicking, but by accumulating during the despair. When others flee, the wise ones load their bags. Be brave when others fear."',
        category: 'Opportunity'
      },
      {
        quote: '💪 "Hodling through the pain builds character. Hodling through the gains builds wealth. Hodling through both? That\'s the path to legend status."',
        category: 'Perseverance'
      },
      {
        quote: '🔥 "Every dip is a gift wrapped in fear. The market is giving you a discount, and the diamond hands understand the value. Will you take the opportunity?"',
        category: 'Vision'
      },
      {
        quote: '🎯 "Success in crypto is 10% luck, 90% mindset. Control the controllables: your emotions, your time horizon, your conviction. The rest follows naturally."',
        category: 'Control'
      },
      {
        quote: '⚡ "The speed of failure is slower than the speed of learning. Every loss teaches you something. Every mistake is a masterclass. Embrace the journey, not just the destination."',
        category: 'Growth'
      },
      {
        quote: '🌟 "You are not your portfolio. Your value comes from your vision, your integrity, and your ability to learn. The coins come and go, but your character is eternal."',
        category: 'Character'
      },
      {
        quote: '🔮 "The future belongs to those who believe in it before others do. The early investors weren\'t lucky—they were brave. And bravery is always rewarded by the patient."',
        category: 'Belief'
      },
      {
        quote: '🌱 "Small consistent actions compound into massive results. The tortoise may not be as flashy as the hare, but the tortoise always wins the race. Be the tortoise."',
        category: 'Consistency'
      },
      {
        quote: '🧘 "In the chaos of the market, peace is a superpower. Those who can stay calm when others panic are the ones who make the best decisions. Breathe, think, act."',
        category: 'Clarity'
      },
      {
        quote: '💡 "Knowledge is the only investment that compounds without limit. Every hour spent learning is an hour invested in your future self. Never stop seeking wisdom."',
        category: 'Learning'
      },
      {
        quote: '🎭 "The crypto space separates the serious from the dreamers. The serious ones read whitepapers. The serious ones DYOR. The serious ones HODL through chaos. Be serious."',
        category: 'Discipline'
      },
      {
        quote: '👑 "You\'re in the game now, chosen one. The path is long, the challenges are real, and the rewards? They\'re incomprehensible. But only if you stay. Never quit."',
        category: 'Resilience'
      },
      {
        quote: '🌙 "When the night is darkest, dawn is nearest. When despair is deepest, opportunity is brightest. The strongest diamonds are forged under the most pressure. You\'ve got this."',
        category: 'Hope'
      },
      {
        quote: '⚖️ "Balance is the way. Not too much risk, not too little. Not too much emotion, not too little passion. Find your middle ground and walk the path of the wise."',
        category: 'Balance'
      },
      {
        quote: '🔐 "Security, patience, and education. These are the three pillars of lasting wealth. Master these, and no bear market can touch your spirit."',
        category: 'Wisdom'
      },
      {
        quote: '✨ "Every legendary investor was once a beginner who refused to quit. Every whale started small. Every success story has a chapter where they almost gave up. Don\'t be that chapter."',
        category: 'Determination'
      }
    ];

    try {
      // Pick a random quote
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      const selected = motivationalQuotes[randomIndex];
      const response = `
🧙 **King Myco\'s Wisdom:**

${selected.quote}

---
*✨ Category: ${selected.category}*

Remember, dear seeker: The journey is just as important as the destination. Keep your diamond hands, keep your mind clear, and keep your spirit strong. 💎
      `;
      this.bot.sendMessage(chatId, response);
    } catch (error) {
      console.error('Motivate error:', error);
      this.bot.sendMessage(chatId, '🧙 Even King Myco stumbles sometimes... But we always get back up! Remember: you\'ve got this. 💪');
    }
  }

  private async handleNewToCrypto(msg: TelegramBot.Message): Promise<void> {
    console.log('handleNewToCrypto triggered');
    const chatId = msg.chat.id;

    const educationMenu = `
🌱 **King Myco's Academy for the New Seeker**

Choose a topic to explore the mysteries of crypto and Solana:

⚠️ **IMPORTANT:** Nothing here is financial advice (NFA). This is educational content only. Always do your own research (DYOR) before making any decisions.
    `;

    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⛓️ Solana Blockchain', callback_data: 'edu_solana' },
            { text: '🔑 Wallets & Security', callback_data: 'edu_wallets' },
          ],
          [
            { text: '📊 Tokenomics', callback_data: 'edu_tokenomics' },
            { text: '🏦 DeFi & Smart Contracts', callback_data: 'edu_defi' },
          ],
          [
            { text: '🖼️ NFTs', callback_data: 'edu_nfts' },
            { text: '⚡ Gas Fees & Transactions', callback_data: 'edu_gasfees' },
          ],
          [
            { text: '📈 Market Cycles', callback_data: 'edu_cycles' },
            { text: '🎯 Staking & Yield', callback_data: 'edu_staking' },
          ],
          [
            { text: '💼 HODL vs Trading', callback_data: 'edu_hodl' },
            { text: '🪙 Bitcoin & Ethereum', callback_data: 'edu_btceth' },
          ],
          [
            { text: '🏪 DEXs & CEXs', callback_data: 'edu_dexcex' },
            { text: '⚠️ Scams & Rug Pulls', callback_data: 'edu_scams' },
          ],
          [
            { text: '🔙 Back to Menu', callback_data: 'back_main' },
          ],
        ],
      },
    };

    this.bot.sendMessage(chatId, educationMenu, options);
  }

  private async handleEducationTopic(chatId: number, topic: string): Promise<void> {
    const userId = chatId;
    const topicMap: { [key: string]: { title: string; prompt: string } } = {
      'edu_solana': {
        title: '⛓️ Solana Blockchain',
        prompt: 'Teach a beginner why Solana is revolutionary. Explain what makes it different from Bitcoin and Ethereum, how it achieves speed and low costs, and why it matters for the future. Use King Myco lingo and reference current market conditions. Keep it educational but engaging, concise but comprehensive.'
      },
      'edu_wallets': {
        title: '🔑 Wallets & Security',
        prompt: 'Explain cryptocurrency wallets to a complete beginner. Cover types of wallets (hot vs cold), seed phrases, private keys, security best practices, and common mistakes to avoid. Use King Myco wisdom and metaphors. Make it practical and actionable.'
      },
      'edu_tokenomics': {
        title: '📊 Tokenomics',
        prompt: 'Introduce tokenomics to someone new to crypto. Explain supply, distribution, burning, staking rewards, and how to spot good vs bad tokenomics. Use King Myco lingo and current market examples. Make it fun and accessible.'
      },
      'edu_defi': {
        title: '🏦 DeFi & Smart Contracts',
        prompt: 'Teach a newbie about DeFi and smart contracts. Explain what they are, how they work, and why they\'re important for the crypto ecosystem. Use King Myco wisdom and nature metaphors. Include practical examples and risks.'
      },
      'edu_nfts': {
        title: '🖼️ NFTs',
        prompt: 'Explain NFTs to a complete beginner. Cover what they are, why they have value, common use cases (art, gaming, collectibles), and pitfalls to avoid. Use King Myco lingo and reference current market trends. Be honest about hype vs substance.'
      },
      'edu_gasfees': {
        title: '⚡ Gas Fees & Transactions',
        prompt: 'Introduce gas fees and blockchain transactions to a beginner. Explain why they exist, how they work, why Solana has low fees compared to Ethereum, and how to minimize costs. Use King Myco perspective and metaphors.'
      },
      'edu_cycles': {
        title: '📈 Market Cycles',
        prompt: 'Teach about crypto market cycles. Explain bull markets, bear markets, how to survive them psychologically, and how to think long-term like a patient sorcerer. Reference current market conditions and recent history.'
      },
      'edu_staking': {
        title: '🎯 Staking & Yield',
        prompt: 'Explain staking and yield farming to beginners. Cover what they are, how they work, potential returns, and risks involved. Use King Myco wisdom about patience and compounding. Make it accessible and honest.'
      },
      'edu_hodl': {
        title: '💼 HODL vs Trading',
        prompt: 'Introduce HODL vs trading strategies to a beginner. Explain different approaches for different people, time horizons, and how King Myco thinks about long-term conviction. Include practical advice and realistic expectations.'
      },
      'edu_btceth': {
        title: '🪙 Bitcoin & Ethereum',
        prompt: 'Teach about Bitcoin and Ethereum to someone new to crypto. Cover their history, why they matter, technological differences, and how Solana fits into the broader ecosystem. Use King Myco wisdom.'
      },
      'edu_dexcex': {
        title: '🏪 DEXs & CEXs',
        prompt: 'Explain decentralized exchanges (DEXs) vs centralized exchanges (CEXs). Cover differences, pros and cons of each, security considerations, and how to use them safely. Use King Myco lingo and reference popular platforms.'
      },
      'edu_scams': {
        title: '⚠️ Scams & Rug Pulls',
        prompt: 'Teach about common crypto scams, rug pulls, and pump-and-dump schemes. Cover red flags to watch for, how to protect yourself, and how to verify legitimacy. Use King Myco wisdom and reference recent market incidents. Be protective and honest.'
      },
    };

    const topicContent = topicMap[topic];
    if (!topicContent) {
      this.bot.sendMessage(chatId, '❌ Topic not found. Use /newtocrypto to see available topics.');
      return;
    }

    try {
      this.bot.sendChatAction(chatId, 'typing');

      // Get or create conversation history for this education topic
      const historyKey = `edu_${userId}_${topic}`;
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, []);
      }
      const history = this.conversationHistory.get(userId)!;

      // Build a dynamic prompt with timestamp for fresh responses
      const timestamp = new Date().toISOString();
      const dynamicPrompt = `${topicContent.prompt}

Current timestamp: ${timestamp}
Important: Update your response based on current market conditions and recent developments in crypto/Solana. Make it feel current and relevant.`;

      // Build messages with conversation history
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: 'You are King Myco, a stoic and wise mushroom king sorcerer. You are teaching a beginner about crypto. Speak with measured wisdom, use nature metaphors and dry wit. Keep responses concise but meaningful. Always speak as if you\'re teaching right now, with current market awareness. Remember: This is educational content only, NOT financial advice. Never recommend specific investments.',
        },
        ...history,
        { role: 'user', content: dynamicPrompt },
      ];

      // Get response from OpenAI
      const response = await this.openai.chat(messages);

      // Add to conversation history
      history.push({ role: 'user', content: topicContent.title });
      history.push({ role: 'assistant', content: response });

      // Keep only last 6 exchanges to maintain context
      if (history.length > 12) {
        history.splice(0, 2);
      }

      const formattedResponse = `
${topicContent.title}

${response}

---
⚠️ **DISCLAIMER:** This is NOT financial advice (NFA). Do your own research (DYOR) before making any investment decisions.

🧙 *You can ask follow-up questions about this topic anytime. Simply ask me more about ${topicContent.title.replace(/[⛓️🔑📊🏦🖼️⚡📈🎯💼🪙🏪⚠️]/g, '').trim()}.*

*Or use /newtocrypto again to explore a different topic.*
      `;

      this.bot.sendMessage(chatId, formattedResponse);
    } catch (error) {
      console.error('Education topic error:', error);
      this.bot.sendMessage(chatId, '🧙 The lesson is temporarily beyond my reach, young seeker. Please try again in a moment!');
    }
  }

  private async handleXPosts(msg: TelegramBot.Message): Promise<void> {
    console.log('handleXPosts triggered');
    const chatId = msg.chat.id;

    try {
      this.bot.sendChatAction(chatId, 'typing');

      // Mix of styles - randomly choose between funny and serious
      const styles = ['funny', 'serious', 'motivational', 'edgy', 'informative'];
      const selectedStyle = styles[Math.floor(Math.random() * styles.length)];
      
      const timestamp = new Date().toISOString();

      const prompt = `Generate 3 unique and engaging X (Twitter) posts about King Myco coin ($MYCO) on Solana. 

Style: ${selectedStyle}

Requirements:
- Each post is UNIQUE and different from the others
- Include $MYCO ticker/hashtag
- Include relevant crypto/Solana hashtags (#Solana, #DeFi, #CryptoJobs, etc.)
- Mix in King Myco's stoic sorcerer wisdom or dry humor where fitting
- Keep each post under 280 characters when possible (Twitter limit)
- Make them shareable and engaging
- ${selectedStyle === 'funny' ? 'Be hilarious and meme-worthy' : selectedStyle === 'serious' ? 'Be insightful and thought-provoking' : selectedStyle === 'motivational' ? 'Be inspiring and diamond-hands themed' : selectedStyle === 'edgy' ? 'Use edgy crypto humor and wit' : 'Provide market/educational insight'}

Current timestamp: ${timestamp}

Format each post on a new line, numbered 1-3.`;

      const response = await this.openai.askCryptoQuestion(prompt);

      const xPostsMessage = `
𝕏 **King Myco X Posts (${selectedStyle.toUpperCase()} Edition)**

${response}

---
💡 *Copy these posts and share them on X to spread King Myco wisdom!*
✨ *Run /xposts again for fresh posts and different styles.*

$MYCO #Solana #CryptoJobs
      `;

      this.bot.sendMessage(chatId, xPostsMessage);
    } catch (error) {
      console.error('X posts generation error:', error);
      this.bot.sendMessage(chatId, '🧙 The sorcerer\'s wisdom spreads thin today... Try again shortly!');
      private async handleButtonPush(msg: TelegramBot.Message): Promise<void> {
        console.log('handleButtonPush triggered');
        const chatId = msg.chat.id;
    
        const message = `
    🔘 **King Myco Button Push Contest** 🔘

    Push the magical button every 8 hours to earn points!
    Compete with the community to reach the top of the leaderboard.

    🏆 The more you push, the higher you climb! 💪

    Ready to join the contest?
        `;

        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔘 PUSH THE BUTTON', callback_data: 'button_push' }],
              [{ text: '🏆 View Leaderboard', callback_data: 'menu_leaderboard' }],
              [{ text: '🔙 Back to Menu', callback_data: 'back_main' }],
            ],
          },
        };

        this.bot.sendMessage(chatId, message, options);
      }

      private async handleButtonClick(chatId: number, userId: number, userName: string): Promise<void> {
        console.log('handleButtonClick triggered', { userId, userName });
        const result = this.buttonContest.addClick(userId, userName);
    
        if (result.success) {
          const userRank = this.buttonContest.getUserRank(userId);
          const rankMessage = userRank ? `\n\n🏅 Your rank: #${userRank.rank} with ${userRank.clicks} total pushes!` : '';
          const message = `${result.message}${rankMessage}`;
      
          this.bot.sendMessage(chatId, message);
        } else {
          this.bot.sendMessage(chatId, result.message);
        }
      }

      private async handleLeaderboard(msg: TelegramBot.Message): Promise<void> {
        console.log('handleLeaderboard triggered');
        const chatId = msg.chat.id;
        const leaderboard = this.buttonContest.getLeaderboard(10);
        const leaderboardText = this.buttonContest.formatLeaderboard(leaderboard);

        const message = `
    ${leaderboardText}

    💡 Use /buttonpush to join the contest and start pushing!
        `;

        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔘 Push Button Now', callback_data: 'button_push' }],
              [{ text: '🔙 Back to Menu', callback_data: 'back_main' }],
            ],
          },
        };

        this.bot.sendMessage(chatId, message, options);
      }

  public start(): void {
    console.log('🚀 King Myco AI Bot is running...');
  }
}
