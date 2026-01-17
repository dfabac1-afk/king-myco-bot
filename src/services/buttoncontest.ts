export interface ButtonPusher {
  userId: number;
  name: string;
  clicks: number;
  lastClickTime: number;
}

export class ButtonContestService {
  private pushers: Map<number, ButtonPusher> = new Map();
  private readonly COOLDOWN_MS = 8 * 60 * 60 * 1000; // 8 hours

  addClick(userId: number, userName: string): { success: boolean; message: string; cooldownMinutes?: number } {
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
    };

    this.pushers.set(userId, newPusher);

    return {
      success: true,
      message: `🎉 Button pushed! You now have ${newPusher.clicks} total pushes!`,
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

    board += '\n💪 Can you reach the top? Push the button every 8 hours!';
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
}
