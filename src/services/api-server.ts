import express, { Request, Response } from 'express';

export interface ApiServerConfig {
  port: number;
  apiKey: string; // API key for authentication
}

export class ApiServer {
  private app: express.Application;
  private port: number;
  private apiKey: string;
  private bot: any; // KingMycoBot instance
  private supabase: any; // SupabaseIntegration instance

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
    this.app.use((req: Request, res: Response, next) => {
      // Skip auth for health check
      if (req.path === '/health') {
        return next();
      }

      const apiKey = req.headers['x-api-key'] || req.query.apiKey;
      if (apiKey !== this.apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
      }

      next();
    });

    // CORS
    this.app.use((req: Request, res: Response, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // GET /api/leaderboard - Get top spore earners
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

    // GET /api/user/:userId/profile - Get user profile with spores
    this.app.get('/api/user/:userId/profile', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        const profile = await this.supabase.getUserProfile(userId);

        if (!profile) {
          return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
          success: true,
          data: profile,
        });
      } catch (error) {
        console.error('User profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
      }
    });

    // GET /api/user/:userId/spores - Get user spores balance
    this.app.get('/api/user/:userId/spores', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        const spores = await this.supabase.getUserSpores(userId);

        res.json({
          success: true,
          userId,
          totalSpores: spores,
        });
      } catch (error) {
        console.error('User spores error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch spores' });
      }
    });

    // GET /api/user/:userId/quests - Get user quests
    this.app.get('/api/user/:userId/quests', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        const completed = req.query.completed ? req.query.completed === 'true' : undefined;
        const quests = await this.supabase.getUserQuests(userId, completed);

        res.json({
          success: true,
          data: quests,
        });
      } catch (error) {
        console.error('User quests error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch quests' });
      }
    });

    // POST /api/user/:userId/quests - Create a new quest
    this.app.post('/api/user/:userId/quests', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        const { title, description, reward } = req.body;

        if (!title || !description || !reward) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: title, description, reward',
          });
        }

        const questId = await this.supabase.createQuest(userId, title, description, reward);

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

    // POST /api/user/:userId/quests/:questId/complete - Complete a quest
    this.app.post('/api/user/:userId/quests/:questId/complete', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        const questId = Array.isArray(req.params.questId) ? req.params.questId[0] : req.params.questId;

        const success = await this.supabase.completeQuest(questId, userId);

        if (!success) {
          return res.status(500).json({ success: false, error: 'Failed to complete quest' });
        }

        // Announce quest completion to Telegram
        await this.bot.announceQuestCompletion(userId, questId);

        res.json({
          success: true,
          message: 'Quest completed successfully! Spores awarded.',
        });
      } catch (error) {
        console.error('Complete quest error:', error);
        res.status(500).json({ success: false, error: 'Failed to complete quest' });
      }
    });

    // POST /api/user/:userId/spores/add - Add spores manually (admin)
    this.app.post('/api/user/:userId/spores/add', async (req: Request, res: Response) => {
      try {
        const userId = parseInt(Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId);
        const { amount, reason } = req.body;

        if (!amount || amount <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Invalid amount. Must be positive integer.',
          });
        }

        await this.supabase.addSpores(userId, amount, reason || 'Manual admin reward');

        const newBalance = await this.supabase.getUserSpores(userId);

        res.json({
          success: true,
          userId,
          newBalance,
          message: `Added ${amount} spores to user ${userId}`,
        });
      } catch (error) {
        console.error('Add spores error:', error);
        res.status(500).json({ success: false, error: 'Failed to add spores' });
      }
    });

    // GET /api/stats - Get overall bot stats
    this.app.get('/api/stats', async (req: Request, res: Response) => {
      try {
        const leaderboard = await this.supabase.getLeaderboard(100);
        const totalUsers = leaderboard.length;
        const totalSpores = leaderboard.reduce((sum: number, user: any) => sum + user.totalSpores, 0);

        res.json({
          success: true,
          stats: {
            totalUsers,
            totalSpores,
            topPlayer: leaderboard[0] || null,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
      }
    });
  }

  start(): void {
    this.app.listen(this.port, () => {
      console.log(`🌐 API Server running on port ${this.port}`);
    });
  }
}
