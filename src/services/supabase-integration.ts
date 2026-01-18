import { createClient } from '@supabase/supabase-js';

export interface Quest {
  id: string;
  userId: number;
  title: string;
  description: string;
  reward: number; // spores
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
}

export interface UserProfile {
  userId: number;
  telegramName: string;
  totalSpores: number;
  questsCompleted: number;
  leaderboardRank?: number;
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

  // Get user profile with spores and quest data
  async getUserProfile(userId: number): Promise<UserProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('userId', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (e) {
      console.error('Supabase getUserProfile error:', e);
      return null;
    }
  }

  // Update user spores (called when button is pushed or quest completed)
  async addSpores(userId: number, amount: number, reason: string): Promise<void> {
    try {
      // Get current profile
      let profile = await this.getUserProfile(userId);

      if (!profile) {
        // Create new profile
        const { error: createError } = await this.supabase
          .from('user_profiles')
          .insert([
            {
              userId,
              totalSpores: amount,
              questsCompleted: 0,
            },
          ]);

        if (createError) throw createError;
      } else {
        // Update existing profile
        const { error: updateError } = await this.supabase
          .from('user_profiles')
          .update({ totalSpores: profile.totalSpores + amount })
          .eq('userId', userId);

        if (updateError) throw updateError;
      }

      // Log the transaction
      await this.logSporeTransaction(userId, amount, reason);
    } catch (e) {
      console.error('Supabase addSpores error:', e);
    }
  }

  // Create or complete a quest
  async createQuest(userId: number, title: string, description: string, reward: number): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('quests')
        .insert([
          {
            userId,
            title,
            description,
            reward,
            completed: false,
            createdAt: new Date(),
          },
        ])
        .select();

      if (error) throw error;
      return data?.[0]?.id || null;
    } catch (e) {
      console.error('Supabase createQuest error:', e);
      return null;
    }
  }

  // Complete a quest
  async completeQuest(questId: string, userId: number): Promise<boolean> {
    try {
      // Mark quest as completed
      const { error: questError } = await this.supabase
        .from('quests')
        .update({
          completed: true,
          completedAt: new Date(),
        })
        .eq('id', questId)
        .eq('userId', userId);

      if (questError) throw questError;

      // Get quest details to get reward amount
      const { data: quest, error: fetchError } = await this.supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

      if (fetchError) throw fetchError;

      // Add spores as reward
      await this.addSpores(userId, quest.reward, `Quest completed: ${quest.title}`);

      // Increment questsCompleted
      const profile = await this.getUserProfile(userId);
      if (profile) {
        await this.supabase
          .from('user_profiles')
          .update({ questsCompleted: profile.questsCompleted + 1 })
          .eq('userId', userId);
      }

      return true;
    } catch (e) {
      console.error('Supabase completeQuest error:', e);
      return false;
    }
  }

  // Get user quests
  async getUserQuests(userId: number, completed?: boolean): Promise<Quest[]> {
    try {
      let query = this.supabase.from('quests').select('*').eq('userId', userId);

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

  // Log spore transaction for audit trail
  private async logSporeTransaction(userId: number, amount: number, reason: string): Promise<void> {
    try {
      await this.supabase.from('spore_transactions').insert([
        {
          userId,
          amount,
          reason,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error('Error logging spore transaction:', e);
    }
  }

  // Get user spore balance
  async getUserSpores(userId: number): Promise<number> {
    try {
      const profile = await this.getUserProfile(userId);
      return profile?.totalSpores || 0;
    } catch (e) {
      console.error('Supabase getUserSpores error:', e);
      return 0;
    }
  }
}
