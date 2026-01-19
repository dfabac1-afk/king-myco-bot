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

  // Track button push for Telegram user (create profile if needed)
  async trackButtonPush(telegramUserId: number, telegramName: string, sporesAwarded: number): Promise<void> {
    try {
      // Try to find existing profile by Telegram ID
      const { data: existingProfile, error: findError } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('telegramUserId', telegramUserId)
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await this.supabase
          .from('user_profiles')
          .update({
            buttonPushes: (existingProfile.buttonPushes || 0) + 1,
            totalSpores: (existingProfile.totalSpores || 0) + sporesAwarded,
            telegramName: telegramName, // Update name in case it changed
            lastActiveAt: new Date().toISOString(),
          })
          .eq('telegramUserId', telegramUserId);

        if (updateError) throw updateError;
        console.log(`[SUPABASE] Button push tracked for ${telegramName} (${telegramUserId})`);
      } else {
        // Create new profile for Telegram-only user
        const { error: insertError } = await this.supabase
          .from('user_profiles')
          .insert([{
            walletAddress: `telegram_${telegramUserId}`, // Placeholder wallet
            telegramUserId,
            telegramName,
            totalSpores: sporesAwarded,
            buttonPushes: 1,
            questsCompleted: 0,
            isVerified: false,
            chainId: 501,
          }]);

        if (insertError) throw insertError;
        console.log(`[SUPABASE] New profile created for ${telegramName} (${telegramUserId})`);
      }
    } catch (e) {
      console.error('[SUPABASE] Error tracking button push:', e);
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
}
