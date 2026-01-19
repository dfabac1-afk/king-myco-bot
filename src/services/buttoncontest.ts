export interface ButtonPusher {
  userId: number;
  name: string;
  clicks: number;
  lastClickTime: number;
  sporesEarned?: number; // Total spores earned from button pushes
  dailyPushes?: number; // Pushes in current 24h period
}

export interface DailyWinner {
  userId: number;
  name: string;
  dailyPushes: number;
  totalPushes: number;
  date: string; // ISO date string
  rank: number; // Their overall rank at time of winning
}

export class ButtonContestService {
  private pushers: Map<number, ButtonPusher> = new Map();
  private dailyWinnersHistory: DailyWinner[] = []; // In-memory cache
  private readonly COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes
  private readonly SPORES_PER_PUSH = 10; // Spores earned per button push
  private supabase: any; // SupabaseIntegration instance
  private dailyResetTime: number = Date.now(); // Track when daily stats were last reset
  private historyLoaded: boolean = false; // Track if we've loaded from DB

  constructor(supabase?: any) {
    this.supabase = supabase;
    // Load history from Supabase on startup
    if (this.supabase) {
      this.loadDailyWinnersHistory();
    }
  }

  // Load daily winners history from Supabase
  private async loadDailyWinnersHistory(): Promise<void> {
    if (!this.supabase || this.historyLoaded) return;
    
    try {
      console.log('[BUTTON_CONTEST] Loading daily winners history from Supabase...');
      const winners = await this.supabase.getDailyWinnersHistory(365); // Get last year
      
      this.dailyWinnersHistory = winners.map((w: any) => ({
        userId: w.userId,
        name: w.userName,
        dailyPushes: w.dailyPushes,
        totalPushes: w.totalPushes,
        date: w.winDate,
        rank: w.rank,
      }));
      
      this.historyLoaded = true;
      console.log(`[BUTTON_CONTEST] Loaded ${this.dailyWinnersHistory.length} historical winners`);
    } catch (e) {
      console.error('[BUTTON_CONTEST] Error loading daily winners history:', e);
    }
  }

  addClick(userId: number, userName: string): { success: boolean; message: string; cooldownMinutes?: number; sporesAwarded?: number } {
    const now = Date.now();
    const pusher = this.pushers.get(userId);

    if (pusher) {
      const timeSinceLastClick = now - pusher.lastClickTime;
      if (timeSinceLastClick < this.COOLDOWN_MS) {
        const minutesLeft = Math.ceil((this.COOLDOWN_MS - timeSinceLastClick) / (60 * 1000));
        return {
          success: false,
          message: `⏳ You can push again in ${minutesLeft} minutes!`,
          cooldownMinutes: minutesLeft,
        };
      }
    }

    // Update or create pusher
    const newPusher: ButtonPusher = {
      userId,
      name: userName || `User ${userId}`,
      clicks: (pusher?.clicks || 0) + 1,
      lastClickTime: now,
      sporesEarned: (pusher?.sporesEarned || 0) + this.SPORES_PER_PUSH,
      dailyPushes: (pusher?.dailyPushes || 0) + 1,
    };

    this.pushers.set(userId, newPusher);

    // Award spores via Supabase if available
    if (this.supabase) {
      // Track in Supabase for spore leaderboard
      this.supabase.trackButtonPush(userId, userName, this.SPORES_PER_PUSH).catch((e: any) => {
        console.error('[BUTTON_CONTEST] Failed to track in Supabase:', e);
      });
    }

    return {
      success: true,
      message: `🎉 Button pushed! You now have ${newPusher.clicks} total pushes!`,
      sporesAwarded: this.SPORES_PER_PUSH,
    };
  }

  getLeaderboard(limit: number = 10): ButtonPusher[] {
    return Array.from(this.pushers.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);
  }

  formatLeaderboard(leaderboard: ButtonPusher[]): string {
    if (leaderboard.length === 0) {
      return '📊 No button pushes yet! Be the first! 🎯';
    }

    let board = '🏆 **King Myco Button Push Leaderboard** 🏆\n\n';
    const medals = ['🥇', '🥈', '🥉'];

    leaderboard.forEach((pusher, index) => {
      const medal = medals[index] || '✨';
      board += `${medal} #${index + 1} - **${pusher.name}** - ${pusher.clicks} pushes\n`;
    });

    board += '\n💪 Can you reach the top? Push the button every 30 minutes!';
    return board;
  }

  getUserRank(userId: number): { rank: number; clicks: number } | null {
    const pusher = this.pushers.get(userId);
    if (!pusher) return null;

    const leaderboard = this.getLeaderboard(this.pushers.size);
    const rank = leaderboard.findIndex((p) => p.userId === userId) + 1;

    return { rank, clicks: pusher.clicks };
  }

  getCooldownStatus(userId: number): { canPush: boolean; minutesLeft: number } {
    const pusher = this.pushers.get(userId);
    if (!pusher) return { canPush: true, minutesLeft: 0 };

    const timeSinceLastClick = Date.now() - pusher.lastClickTime;
    if (timeSinceLastClick >= this.COOLDOWN_MS) {
      return { canPush: true, minutesLeft: 0 };
    }

    const minutesLeft = Math.ceil((this.COOLDOWN_MS - timeSinceLastClick) / (60 * 1000));
    return { canPush: false, minutesLeft };
  }

  // Get daily winner (most pushes in last 24h)
  getDailyWinner(): { userId: number; name: string; dailyPushes: number; clicks: number; rank: number } | null {
    if (this.pushers.size === 0) return null;

    // Find user with most daily pushes
    let winnerPusher: ButtonPusher | undefined;
    let maxDailyPushes = 0;

    this.pushers.forEach((pusher) => {
      const dailyPushes = pusher.dailyPushes || 0;
      if (dailyPushes > maxDailyPushes) {
        maxDailyPushes = dailyPushes;
        winnerPusher = pusher;
      }
    });

    if (!winnerPusher || maxDailyPushes === 0) return null;

    // Get their overall rank
    const leaderboard = this.getLeaderboard(this.pushers.size);
    const rank = leaderboard.findIndex((p) => p.userId === winnerPusher!.userId) + 1;

    const winner = winnerPusher; // Type narrowing helper
    return {
      userId: winner.userId,
      name: winner.name,
      dailyPushes: maxDailyPushes,
      clicks: winner.clicks,
      rank,
    };
  }

  // Save daily winner to history
  saveDailyWinner(winner: { userId: number; name: string; dailyPushes: number; clicks: number; rank: number }): void {
    const dailyWinner: DailyWinner = {
      userId: winner.userId,
      name: winner.name,
      dailyPushes: winner.dailyPushes,
      totalPushes: winner.clicks,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      rank: winner.rank,
    };
    
    // Add to in-memory cache
    this.dailyWinnersHistory.push(dailyWinner);
    console.log(`[BUTTON_CONTEST] Daily winner saved to cache: ${dailyWinner.name} (${dailyWinner.dailyPushes} pushes)`);
    
    // Save to Supabase if available
    if (this.supabase) {
      this.supabase.saveDailyWinner({
        userId: dailyWinner.userId,
        userName: dailyWinner.name,
        dailyPushes: dailyWinner.dailyPushes,
        totalPushes: dailyWinner.totalPushes,
        rank: dailyWinner.rank,
        winDate: dailyWinner.date,
      }).catch((e: any) => {
        console.error('[BUTTON_CONTEST] Error saving to Supabase:', e);
      });
    }
  }

  // Get daily winners history
  async getDailyWinnersHistory(limit: number = 30): Promise<DailyWinner[]> {
    // If Supabase available, fetch fresh data
    if (this.supabase) {
      try {
        const winners = await this.supabase.getDailyWinnersHistory(limit);
        return winners.map((w: any) => ({
          userId: w.userId,
          name: w.userName,
          dailyPushes: w.dailyPushes,
          totalPushes: w.totalPushes,
          date: w.winDate,
          rank: w.rank,
        }));
      } catch (e) {
        console.error('[BUTTON_CONTEST] Error fetching from Supabase, using cache:', e);
      }
    }
    
    // Fallback to in-memory cache
    return this.dailyWinnersHistory.slice(-limit).reverse(); // Most recent first
  }

  // Get users ranked by number of daily wins
  async getDailyWinsLeaderboard(limit: number = 10): Promise<{ userId: number; name: string; wins: number; lastWinDate: string }[]> {
    // If Supabase available, use database aggregation
    if (this.supabase) {
      try {
        return await this.supabase.getDailyWinsLeaderboard(limit);
      } catch (e) {
        console.error('[BUTTON_CONTEST] Error fetching leaderboard from Supabase, using cache:', e);
      }
    }
    
    // Fallback to in-memory aggregation
    const winsMap = new Map<number, { name: string; wins: number; lastWinDate: string }>();
    
    this.dailyWinnersHistory.forEach((winner) => {
      const existing = winsMap.get(winner.userId);
      if (existing) {
        existing.wins++;
        // Update last win date if this one is more recent
        if (winner.date > existing.lastWinDate) {
          existing.lastWinDate = winner.date;
        }
      } else {
        winsMap.set(winner.userId, {
          name: winner.name,
          wins: 1,
          lastWinDate: winner.date,
        });
      }
    });

    return Array.from(winsMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, limit);
  }

  // Format daily winners history for display
  formatDailyWinnersHistory(history: DailyWinner[]): string {
    if (history.length === 0) {
      return '📅 No daily winners yet! Be the first to claim victory! 🏆';
    }

    let board = '📅 **Daily Winners History** 📅\n\n';
    
    history.forEach((winner, index) => {
      const date = new Date(winner.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      board += `📆 ${date} - **${winner.name}** (${winner.dailyPushes} pushes)\n`;
    });

    return board;
  }

  // Format daily wins leaderboard
  formatDailyWinsLeaderboard(leaderboard: { userId: number; name: string; wins: number; lastWinDate: string }[]): string {
    if (leaderboard.length === 0) {
      return '🏆 No champions yet! Be the first to win a day! 💪';
    }

    let board = '🏆 **Daily Win Champions** 🏆\n\n';
    const medals = ['🥇', '🥈', '🥉'];

    leaderboard.forEach((champion, index) => {
      const medal = medals[index] || '🏅';
      const lastWin = new Date(champion.lastWinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      board += `${medal} **${champion.name}** - ${champion.wins} day${champion.wins !== 1 ? 's' : ''} won (Last: ${lastWin})\n`;
    });

    board += '\n💪 Win the most days to become the ultimate champion!';
    return board;
  }

  // Reset daily push counts
  resetDailyStats(): void {
    this.pushers.forEach((pusher) => {
      pusher.dailyPushes = 0;
    });
    this.dailyResetTime = Date.now();
    console.log('[BUTTON_CONTEST] Daily stats reset');
  }
}
