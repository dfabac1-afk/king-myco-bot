import { createClient } from '@supabase/supabase-js';

export interface Quest {
  id: string;
  walletAddress: string;
  title: string;
  description: string;
  reward: number;
  questType: string;
  contractAddress?: string;
  chainId: number;
  completed: boolean;
  completedAt?: Date;
  transactionHash?: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  telegramUserId?: number;
  telegramName?: string;
  totalSpores: number;
  questsCompleted: number;
  chainId: number;
  isVerified: boolean;
  lastActiveAt: Date;
}

export interface ParticipationProof {
  questId: string;
  walletAddress: string;
  proofType: string;
  proofData: any;
  transactionHash?: string;
  verified: boolean;
}

export interface DailyButtonWinner {
  id?: string;
  userId: number;
  userName: string;
  dailyPushes: number;
  totalPushes: number;
  rank: number;
  winDate: string; // YYYY-MM-DD
  createdAt?: Date;
}

export class SupabaseIntegration {
  private supabase: any;
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ============= USER PROFILE MANAGEMENT =============

  // Get user profile by wallet address
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('walletAddress', walletAddress.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      }

      return data || null;
    } catch (e) {
      console.error('Supabase getUserProfile error:', e);
      return null;
    }
  }

  // Create or get user profile
  async getOrCreateProfile(walletAddress: string, telegramUserId?: number): Promise<UserProfile | null> {
    try {
      let profile = await this.getUserProfile(walletAddress);

      if (profile) {
        return profile;
      }

      // Create new profile
      const { data, error } = await this.supabase
        .from('user_profiles')
        .insert([
          {
            walletAddress: walletAddress.toLowerCase(),
            telegramUserId,
            totalSpores: 0,
            questsCompleted: 0,
            isVerified: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Supabase getOrCreateProfile error:', e);
      return null;
    }
  }

  // Link Telegram account to wallet
  async linkTelegramAccount(walletAddress: string, telegramUserId: number, telegramName: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          telegramUserId,
          telegramName,
        })
        .eq('walletAddress', walletAddress.toLowerCase());

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase linkTelegramAccount error:', e);
      return false;
    }
  }

  // Verify wallet signature (for signing in)
  async generateNonce(walletAddress: string): Promise<string | null> {
    try {
      const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const profile = await this.getOrCreateProfile(walletAddress);
      if (!profile) return null;

      const { error } = await this.supabase
        .from('user_profiles')
        .update({ nonce })
        .eq('walletAddress', walletAddress.toLowerCase());

      if (error) throw error;
      return nonce;
    } catch (e) {
      console.error('Error generating nonce:', e);
      return null;
    }
  }

  // Verify wallet signature
  async verifySignature(walletAddress: string, nonce: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({ isVerified: true })
        .eq('walletAddress', walletAddress.toLowerCase())
        .eq('nonce', nonce)
        .select()
        .single();

      if (error) throw error;
      return !!data;
    } catch (e) {
      console.error('Error verifying signature:', e);
      return false;
    }
  }

  // ============= SPORE MANAGEMENT =============

  // Add spores to wallet
  async addSpores(walletAddress: string, amount: number, reason: string, questId?: string, txHash?: string): Promise<void> {
    try {
      const profile = await this.getOrCreateProfile(walletAddress);
      if (!profile) return;

      // Update spores
      const { error: updateError } = await this.supabase
        .from('user_profiles')
        .update({ totalSpores: profile.totalSpores + amount })
        .eq('walletAddress', walletAddress.toLowerCase());

      if (updateError) throw updateError;

      // Log transaction
      await this.supabase.from('spore_transactions').insert([
        {
          walletAddress: walletAddress.toLowerCase(),
          amount,
          reason,
          questId,
          transactionHash: txHash,
          chainId: 501,
        },
      ]);
    } catch (e) {
      console.error('Supabase addSpores error:', e);
    }
  }

  // Get user spore balance
  async getUserSpores(walletAddress: string): Promise<number> {
    try {
      const profile = await this.getUserProfile(walletAddress);
      return profile?.totalSpores || 0;
    } catch (e) {
      console.error('Supabase getUserSpores error:', e);
      return 0;
    }
  }

  // ============= QUEST MANAGEMENT =============

  // Create quest
  async createQuest(
    walletAddress: string,
    title: string,
    description: string,
    reward: number,
    questType: string = 'general',
    contractAddress?: string
  ): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('quests')
        .insert([
          {
            walletAddress: walletAddress.toLowerCase(),
            title,
            description,
            reward,
            questType,
            contractAddress,
            chainId: 501,
            completed: false,
            started: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (e) {
      console.error('Supabase createQuest error:', e);
      return null;
    }
  }

  // Complete quest with proof
  async completeQuest(
    questId: string,
    walletAddress: string,
    proofData?: any,
    txHash?: string
  ): Promise<boolean> {
    try {
      // Mark quest as completed
      const { data: questData, error: questError } = await this.supabase
        .from('quests')
        .update({
          completed: true,
          completedAt: new Date(),
          transactionHash: txHash,
        })
        .eq('id', questId)
        .eq('walletAddress', walletAddress.toLowerCase())
        .select()
        .single();

      if (questError) throw questError;

      // Store participation proof
      if (proofData) {
        await this.supabase.from('participation_proofs').insert([
          {
            questId,
            walletAddress: walletAddress.toLowerCase(),
            proofType: 'on-chain',
            proofData,
            transactionHash: txHash,
            verified: !!txHash,
          },
        ]);
      }

      // Award spores
      await this.addSpores(walletAddress, questData.reward, `Quest completed: ${questData.title}`, questId, txHash);

      // Update quest completion count
      const profile = await this.getUserProfile(walletAddress);
      if (profile) {
        await this.supabase
          .from('user_profiles')
          .update({ questsCompleted: profile.questsCompleted + 1 })
          .eq('walletAddress', walletAddress.toLowerCase());
      }

      return true;
    } catch (e) {
      console.error('Supabase completeQuest error:', e);
      return false;
    }
  }

  // Get user quests
  async getUserQuests(walletAddress: string, completed?: boolean): Promise<Quest[]> {
    try {
      let query = this.supabase
        .from('quests')
        .select('*')
        .eq('walletAddress', walletAddress.toLowerCase());

      if (completed !== undefined) {
        query = query.eq('completed', completed);
      }

      const { data, error } = await query.order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Supabase getUserQuests error:', e);
      return [];
    }
  }

  // Get participation proof
  async getParticipationProof(questId: string, walletAddress: string): Promise<ParticipationProof | null> {
    try {
      const { data, error } = await this.supabase
        .from('participation_proofs')
        .select('*')
        .eq('questId', questId)
        .eq('walletAddress', walletAddress.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (e) {
      console.error('Error fetching participation proof:', e);
      return null;
    }
  }

  // ============= LEADERBOARD =============

  // Get leaderboard by spores
  async getLeaderboard(limit: number = 10): Promise<UserProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .order('totalSpores', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Supabase getLeaderboard error:', e);
      return [];
    }
  }

  // Get user rank
  async getUserRank(walletAddress: string): Promise<{ rank: number; spores: number } | null> {
    try {
      const profile = await this.getUserProfile(walletAddress);
      if (!profile) return null;

      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('walletAddress')
        .gt('totalSpores', profile.totalSpores)
        .order('totalSpores', { ascending: false });

      if (error) throw error;
      
      const rank = (data?.length || 0) + 1;
      return { rank, spores: profile.totalSpores };
    } catch (e) {
      console.error('Error fetching user rank:', e);
      return null;
    }
  }

  // ============= STATS =============

  // Get overall stats
  async getStats(): Promise<{
    totalUsers: number;
    totalSpores: number;
    topPlayer: UserProfile | null;
    totalQuestsCompleted: number;
  }> {
    try {
      const leaderboard = await this.getLeaderboard(100);
      const totalUsers = leaderboard.length;
      const totalSpores = leaderboard.reduce((sum: number, user: any) => sum + user.totalSpores, 0);
      const totalQuestsCompleted = leaderboard.reduce((sum: number, user: any) => sum + user.questsCompleted, 0);

      return {
        totalUsers,
        totalSpores,
        topPlayer: leaderboard[0] || null,
        totalQuestsCompleted,
      };
    } catch (e) {
      console.error('Error fetching stats:', e);
      return {
        totalUsers: 0,
        totalSpores: 0,
        topPlayer: null,
        totalQuestsCompleted: 0,
      };
    }
  }

  // ============= DAILY BUTTON WINNERS =============

  // Save daily winner to database
  async saveDailyWinner(winner: DailyButtonWinner): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('daily_button_winners')
        .insert([{
          userId: winner.userId,
          userName: winner.userName,
          dailyPushes: winner.dailyPushes,
          totalPushes: winner.totalPushes,
          rank: winner.rank,
          winDate: winner.winDate,
        }]);

      if (error) {
        // Error code 23505 is unique constraint violation - winner already saved for this date
        if (error.code === '23505') {
          console.log('[SUPABASE] Winner already saved for date:', winner.winDate);
          return true;
        }
        throw error;
      }
      
      console.log('[SUPABASE] Daily winner saved:', winner.userName, winner.winDate);
      return true;
    } catch (e) {
      console.error('Supabase saveDailyWinner error:', e);
      return false;
    }
  }

  // Get daily winners history
  async getDailyWinnersHistory(limit: number = 30): Promise<DailyButtonWinner[]> {
    try {
      const { data, error } = await this.supabase
        .from('daily_button_winners')
        .select('*')
        .order('winDate', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Supabase getDailyWinnersHistory error:', e);
      return [];
    }
  }

  // Get daily wins leaderboard (champions by total days won)
  async getDailyWinsLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      // Try using the SQL function first
      const { data, error } = await this.supabase
        .rpc('get_daily_wins_leaderboard', { row_limit: limit });

      if (error) {
        console.error('RPC error, using manual aggregation:', error);
        // Fallback: manual aggregation
        const { data: allWinners, error: winnersError } = await this.supabase
          .from('daily_button_winners')
          .select('*')
          .order('winDate', { ascending: false });

        if (winnersError) throw winnersError;

        // Manually aggregate wins per user
        const userWins = new Map<number, { userName: string; wins: number; lastWinDate: string }>();
        
        for (const winner of allWinners || []) {
          const existing = userWins.get(winner.userId);
          if (existing) {
            existing.wins++;
            if (winner.winDate > existing.lastWinDate) {
              existing.lastWinDate = winner.winDate;
            }
          } else {
            userWins.set(winner.userId, {
              userName: winner.userName,
              wins: 1,
              lastWinDate: winner.winDate,
            });
          }
        }

        // Convert to array and sort
        const leaderboard = Array.from(userWins.entries())
          .map(([userId, stats]) => ({ userId, ...stats }))
          .sort((a, b) => b.wins - a.wins || new Date(b.lastWinDate).getTime() - new Date(a.lastWinDate).getTime())
          .slice(0, limit);

        return leaderboard;
      }

      return data || [];
    } catch (e) {
      console.error('Supabase getDailyWinsLeaderboard error:', e);
      return [];
    }
  }

  // Check if winner already exists for a date
  async hasWinnerForDate(date: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('daily_button_winners')
        .select('id')
        .eq('winDate', date)
        .single();

      return !!data && !error;
    } catch {
      return false;
    }
  }

  // Track button push for Telegram-only users (creates profile if needed)
  async trackButtonPush(userId: number, userName: string, sporesEarned: number): Promise<boolean> {
    try {
      // Create a pseudo wallet address for Telegram-only users
      const pseudoWallet = `telegram_${userId}`;

      // Get or create profile
      let profile = await this.getUserProfile(pseudoWallet);
      
      if (!profile) {
        const { data, error } = await this.supabase
          .from('user_profiles')
          .insert([{
            walletAddress: pseudoWallet,
            telegramUserId: userId,
            telegramName: userName,
            totalSpores: sporesEarned,
            buttonPushes: 1,
            questsCompleted: 0,
            isVerified: false,
          }])
          .select()
          .single();

        if (error) throw error;
        return true;
      }

      // Update existing profile
      const { error } = await this.supabase
        .from('user_profiles')
        .update({
          totalSpores: profile.totalSpores + sporesEarned,
          buttonPushes: (profile as any).buttonPushes ? (profile as any).buttonPushes + 1 : 1,
          telegramName: userName, // Update name in case it changed
        })
        .eq('walletAddress', pseudoWallet);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase trackButtonPush error:', e);
      return false;
    }
  }
}
