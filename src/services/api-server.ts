import express, { Request, Response } from 'express';

export interface ApiServerConfig {
  port: number;
  apiKey: string;
}

export class ApiServer {
  private app: express.Application;
  private port: number;
  private apiKey: string;
  private bot: any;
  private supabase: any;

  constructor(config: ApiServerConfig, bot: any, supabase: any) {
    this.app = express();
    this.port = config.port;
    this.apiKey = config.apiKey;
    this.bot = bot;
    this.supabase = supabase;

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());

    // API key authentication middleware
    this.app.use((req: Request, res: Response, next: any) => {
      if (req.path === '/health' || req.path === '/api/leaderboard' || req.path === '/api/stats') {
        return next();
      }

      const apiKey = req.headers['x-api-key'] || req.query.apiKey;
      if (apiKey !== this.apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
      }

      next();
    });

    // CORS
    this.app.use((req: Request, res: Response, next: any) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // ============= WALLET AUTHENTICATION =============

    // GET /api/wallet/:address/nonce - Generate nonce for wallet signature
    this.app.get('/api/wallet/:address/nonce', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.address) ? req.params.address[0] : req.params.address).toLowerCase();

        const nonce = await this.supabase.generateNonce(walletAddress);
        if (!nonce) {
          return res.status(500).json({ success: false, error: 'Failed to generate nonce' });
        }

        res.json({
          success: true,
          walletAddress,
          nonce,
          message: 'Sign this nonce with your wallet to verify ownership',
        });
      } catch (error) {
        console.error('Nonce generation error:', error);
        res.status(500).json({ success: false, error: 'Failed to generate nonce' });
      }
    });

    // POST /api/wallet/verify - Verify wallet signature
    this.app.post('/api/wallet/verify', async (req: Request, res: Response) => {
      try {
        const { walletAddress, signature, nonce } = req.body;

        if (!walletAddress || !signature || !nonce) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: walletAddress, signature, nonce',
          });
        }

        // In production, verify signature on-chain using ethers.js or similar
        const verified = await this.supabase.verifySignature(walletAddress.toLowerCase(), nonce);

        if (!verified) {
          return res.status(401).json({ success: false, error: 'Signature verification failed' });
        }

        res.json({
          success: true,
          walletAddress: walletAddress.toLowerCase(),
          verified: true,
          token: Buffer.from(`${walletAddress}:${Date.now()}`).toString('base64'),
        });
      } catch (error) {
        console.error('Signature verification error:', error);
        res.status(500).json({ success: false, error: 'Failed to verify signature' });
      }
    });

    // ============= USER PROFILE (WALLET-BASED) =============

    // GET /api/user/:wallet/profile - Get user profile
    this.app.get('/api/user/:wallet/profile', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.wallet) ? req.params.wallet[0] : req.params.wallet).toLowerCase();
        const profile = await this.supabase.getOrCreateProfile(walletAddress);

        if (!profile) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: profile });
      } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
      }
    });

    // GET /api/user/:wallet/spores - Get spore balance
    this.app.get('/api/user/:wallet/spores', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.wallet) ? req.params.wallet[0] : req.params.wallet).toLowerCase();
        const spores = await this.supabase.getUserSpores(walletAddress);

        res.json({ success: true, walletAddress, totalSpores: spores });
      } catch (error) {
        console.error('User spores error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch spores' });
      }
    });

    // GET /api/user/:wallet/rank - Get user rank on leaderboard
    this.app.get('/api/user/:wallet/rank', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.wallet) ? req.params.wallet[0] : req.params.wallet).toLowerCase();
        const rankData = await this.supabase.getUserRank(walletAddress);

        if (!rankData) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, walletAddress, ...rankData });
      } catch (error) {
        console.error('User rank error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch rank' });
      }
    });

    // ============= QUESTS =============

    // GET /api/user/:wallet/quests - List user quests
    this.app.get('/api/user/:wallet/quests', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.wallet) ? req.params.wallet[0] : req.params.wallet).toLowerCase();
        const completed = req.query.completed ? req.query.completed === 'true' : undefined;
        const quests = await this.supabase.getUserQuests(walletAddress, completed);

        res.json({ success: true, data: quests });
      } catch (error) {
        console.error('User quests error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch quests' });
      }
    });

    // POST /api/user/:wallet/quests - Create quest
    this.app.post('/api/user/:wallet/quests', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.wallet) ? req.params.wallet[0] : req.params.wallet).toLowerCase();
        const { title, description, reward, questType = 'general', contractAddress } = req.body;

        if (!title || !description || !reward) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: title, description, reward',
          });
        }

        const questId = await this.supabase.createQuest(
          walletAddress,
          title,
          description,
          reward,
          questType,
          contractAddress
        );

        if (!questId) {
          return res.status(500).json({ success: false, error: 'Failed to create quest' });
        }

        res.json({
          success: true,
          questId,
          message: 'Quest created successfully',
        });
      } catch (error) {
        console.error('Create quest error:', error);
        res.status(500).json({ success: false, error: 'Failed to create quest' });
      }
    });

    // POST /api/user/:wallet/quests/:questId/complete - Complete quest
    this.app.post('/api/user/:wallet/quests/:questId/complete', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.wallet) ? req.params.wallet[0] : req.params.wallet).toLowerCase();
        const questId = Array.isArray(req.params.questId) ? req.params.questId[0] : req.params.questId;
        const { proofData, transactionHash } = req.body;

        const success = await this.supabase.completeQuest(questId, walletAddress, proofData, transactionHash);

        if (!success) {
          return res.status(500).json({ success: false, error: 'Failed to complete quest' });
        }

        // Announce in Telegram if Telegram ID is linked
        if (this.bot && this.bot.announceQuestCompletion) {
          this.bot.announceQuestCompletion(walletAddress, questId).catch((e: any) => {
            console.error('Failed to announce quest:', e);
          });
        }

        res.json({
          success: true,
          message: 'Quest completed successfully! Spores awarded.',
          walletAddress,
          questId,
        });
      } catch (error) {
        console.error('Complete quest error:', error);
        res.status(500).json({ success: false, error: 'Failed to complete quest' });
      }
    });

    // ============= LEADERBOARD =============

    // GET /api/leaderboard - Top spore earners
    this.app.get('/api/leaderboard', async (req: Request, res: Response) => {
      try {
        const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
        const leaderboard = await this.supabase.getLeaderboard(limit);

        res.json({
          success: true,
          data: leaderboard,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
      }
    });

    // ============= STATS =============

    // GET /api/stats - Overall statistics
    this.app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        const stats = await this.supabase.getStats();

        res.json({
          success: true,
          stats: {
            ...stats,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
      }
    });

    // ============= SPORES (ADMIN) =============

    // POST /api/user/:wallet/spores/add - Award spores
    this.app.post('/api/user/:wallet/spores/add', async (req: Request, res: Response) => {
      try {
        const walletAddress = (Array.isArray(req.params.wallet) ? req.params.wallet[0] : req.params.wallet).toLowerCase();
        const { amount, reason } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Invalid amount. Must be positive integer.',
          });
        }

        await this.supabase.addSpores(walletAddress, amount, reason || 'Manual admin reward');
        const newBalance = await this.supabase.getUserSpores(walletAddress);

        res.json({
          success: true,
          walletAddress,
          newBalance,
          message: `Added ${amount} spores to wallet ${walletAddress}`,
        });
      } catch (error) {
        console.error('Add spores error:', error);
        res.status(500).json({ success: false, error: 'Failed to add spores' });
      }
    });

    // ============= ADMIN CONTROLS =============

    // POST /api/admin/reset-daily-stats - Reset daily button push counts (ADMIN ONLY)
    this.app.post('/api/admin/reset-daily-stats', async (req: Request, res: Response) => {
      try {
        if (!this.bot || !this.bot.buttonContest) {
          return res.status(500).json({
            success: false,
            error: 'Button contest service not available',
          });
        }

        // Call the reset method
        this.bot.buttonContest.resetDailyStats();

        res.json({
          success: true,
          message: 'Daily button push stats have been reset',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Reset daily stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to reset daily stats' });
      }
    });
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`🌐 API Server running on port ${this.port}`);
    });
  }
}
