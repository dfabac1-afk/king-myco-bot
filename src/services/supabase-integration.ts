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
  user_id: number;
  user_name: string;
  daily_pushes: number;
  total_pushes: number;
  rank: number;
  win_date: string; // YYYY-MM-DD
  created_at?: Date;
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
        .eq('wallet_address', walletAddress.toLowerCase())
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
            wallet_address: walletAddress.toLowerCase(),
            telegram_user_id: telegramUserId,
            total_spores: 0,
            quests_completed: 0,
            is_verified: false,
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
          telegram_user_id: telegramUserId,
          telegram_name: telegramName,
        })
        .eq('wallet_address', walletAddress.toLowerCase());

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
        .eq('wallet_address', walletAddress.toLowerCase());

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
        .update({ is_verified: true })
        .eq('wallet_address', walletAddress.toLowerCase())
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
        .update({ total_spores: profile.totalSpores + amount })
        .eq('wallet_address', walletAddress.toLowerCase());

      if (updateError) throw updateError;

      // Log transaction
      await this.supabase.from('spore_transactions').insert([
        {
          wallet_address: walletAddress.toLowerCase(),
          amount,
          reason,
          quest_id: questId,
          transaction_hash: txHash,
          chain_id: 501,
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
            wallet_address: walletAddress.toLowerCase(),
            title,
            description,
            reward,
            quest_type: questType,
            contract_address: contractAddress,
            chain_id: 501,
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
          completed_at: new Date(),
          transaction_hash: txHash,
        })
        .eq('id', questId)
        .eq('wallet_address', walletAddress.toLowerCase())
        .select()
        .single();

      if (questError) throw questError;

      // Store participation proof
      if (proofData) {
        await this.supabase.from('participation_proofs').insert([
          {
            quest_id: questId,
            wallet_address: walletAddress.toLowerCase(),
            proof_type: 'on-chain',
            proof_data: proofData,
            transaction_hash: txHash,
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
          .update({ quests_completed: profile.questsCompleted + 1 })
          .eq('wallet_address', walletAddress.toLowerCase());
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
        .eq('wallet_address', walletAddress.toLowerCase());

      if (completed !== undefined) {
        query = query.eq('completed', completed);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

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
        .eq('quest_id', questId)
        .eq('wallet_address', walletAddress.toLowerCase())
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
        .order('total_spores', { ascending: false })
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
        .select('wallet_address')
        .gt('total_spores', profile.totalSpores)
        .order('total_spores', { ascending: false });

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
          user_id: winner.user_id,
          user_name: winner.user_name,
          daily_pushes: winner.daily_pushes,
          total_pushes: winner.total_pushes,
          rank: winner.rank,
          win_date: winner.win_date,
        }]);

      if (error) {
        // Error code 23505 is unique constraint violation - winner already saved for this date
        if (error.code === '23505') {
          console.log('[SUPABASE] Winner already saved for date:', winner.win_date);
          return true;
        }
        throw error;
      }
      
      console.log('[SUPABASE] Daily winner saved:', winner.user_name, winner.win_date);
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
        .order('win_date', { ascending: false })
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
          .order('win_date', { ascending: false });

        if (winnersError) throw winnersError;

        // Manually aggregate wins per user
        const userWins = new Map<number, { user_name: string; wins: number; last_win_date: string }>();
        
        for (const winner of allWinners || []) {
          const existing = userWins.get(winner.user_id);
          if (existing) {
            existing.wins++;
            if (winner.win_date > existing.last_win_date) {
              existing.last_win_date = winner.win_date;
            }
          } else {
            userWins.set(winner.user_id, {
              user_name: winner.user_name,
              wins: 1,
              last_win_date: winner.win_date,
            });
          }
        }

        // Convert to array and sort
        const leaderboard = Array.from(userWins.entries())
          .map(([user_id, stats]) => ({ user_id, ...stats }))
          .sort((a, b) => b.wins - a.wins || new Date(b.last_win_date).getTime() - new Date(a.last_win_date).getTime())
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
        .eq('win_date', date)
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
            wallet_address: pseudoWallet,
            telegram_user_id: userId,
            telegram_name: userName,
            total_spores: sporesEarned,
            button_pushes: 1,
            quests_completed: 0,
            is_verified: false,
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
          total_spores: profile.totalSpores + sporesEarned,
          button_pushes: (profile as any).buttonPushes ? (profile as any).buttonPushes + 1 : 1,
          telegram_name: userName, // Update name in case it changed
        })
        .eq('wallet_address', pseudoWallet);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase trackButtonPush error:', e);
      return false;
    }
  }
}
