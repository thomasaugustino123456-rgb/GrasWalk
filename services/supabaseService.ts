import { Prayer, ChatMessage, UserProfile, FavoriteVerse, PrayerComment, Story } from '../types';
import { supabase } from './supabaseClient';

export const supabaseService = {
  // PROFILE OPERATIONS
  async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      const newProfile = {
        id: user.id,
        name: user.email?.split('@')[0] || 'Member',
        streak: 1,
        joined_date: new Date().toISOString(),
        avatar_seed: user.id,
      };
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();
      
      if (insertError) return null;
      profile = data;
    }

    const savedVerses = await this.getSavedVerses();
    const supportedPrayers = await this.getSupportedPrayers();

    return {
      id: user.id,
      name: profile.name,
      streak: profile.streak,
      joinedDate: new Date(profile.joined_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      favoriteVerse: "Connecting...",
      avatarSeed: profile.avatar_seed,
      savedVerses,
      supportedPrayers
    } as UserProfile;
  },

  // PRAYER OPERATIONS
  async fetchPrayers(): Promise<Prayer[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('prayers')
      .select(`
        *,
        prayer_supports(user_id),
        prayer_comments(id)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Fetch error:", error);
      return [];
    }
    
    return data.map(p => ({
      id: p.id,
      user_id: p.user_id,
      author: p.author,
      content: p.content,
      timestamp: new Date(p.created_at),
      prayers_count: p.prayers_count || 0,
      is_anonymous: p.is_anonymous,
      has_supported: p.prayer_supports?.some((s: any) => s.user_id === user?.id),
      comment_count: p.prayer_comments?.length || 0
    }));
  },

  async addPrayer(content: string, author: string, isAnon: boolean): Promise<Prayer | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const newPrayer = {
      user_id: user.id,
      content,
      author: isAnon ? 'Anonymous' : author,
      is_anonymous: isAnon,
      prayers_count: 0
    };

    const { data, error } = await supabase
      .from('prayers')
      .insert(newPrayer)
      .select()
      .single();

    if (error) return null;

    return {
      id: data.id,
      user_id: data.user_id,
      author: data.author,
      content: data.content,
      timestamp: new Date(data.created_at),
      prayers_count: data.prayers_count,
      is_anonymous: data.is_anonymous,
      comment_count: 0
    };
  },

  async deletePrayer(id: string): Promise<boolean> {
    const { error } = await supabase.from('prayers').delete().eq('id', id);
    return !error;
  },

  async toggleSupport(prayerId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: existing } = await supabase
      .from('prayer_supports')
      .select('id')
      .match({ prayer_id: prayerId, user_id: user.id })
      .maybeSingle();

    if (existing) {
      await supabase.from('prayer_supports').delete().eq('id', existing.id);
      await this.decrementPrayerCount(prayerId);
      return false;
    } else {
      await supabase.from('prayer_supports').insert({ prayer_id: prayerId, user_id: user.id });
      await this.incrementPrayerCount(prayerId);
      return true;
    }
  },

  async incrementPrayerCount(id: string): Promise<void> {
    const { data } = await supabase.from('prayers').select('prayers_count').eq('id', id).single();
    await supabase.from('prayers').update({ prayers_count: (data?.prayers_count || 0) + 1 }).eq('id', id);
  },

  async decrementPrayerCount(id: string): Promise<void> {
    const { data } = await supabase.from('prayers').select('prayers_count').eq('id', id).single();
    await supabase.from('prayers').update({ prayers_count: Math.max(0, (data?.prayers_count || 0) - 1) }).eq('id', id);
  },

  // STORY OPERATIONS
  async fetchStories(): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
  },

  async uploadStory(file: File): Promise<Story | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("You must be logged in to upload a story.");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Explicitly set contentType and cacheControl to ensure smooth processing in Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('stories')
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Storage error details:", uploadError);
      // More specific error handling for common bucket issues
      if (uploadError.message.includes('bucket not found')) {
        throw new Error("The 'stories' storage bucket does not exist. Please create a public bucket named 'stories' in your Supabase dashboard.");
      }
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('stories')
      .getPublicUrl(filePath);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('name, avatar_seed')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.warn("Could not fetch profile for story metadata, using defaults.");
    }

    const { data: story, error: dbError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        author: profile?.name || 'Member',
        media_url: publicUrl,
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        avatar_seed: profile?.avatar_seed
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error for story:", dbError);
      throw new Error("Story media uploaded, but failed to save record to the database.");
    }

    return story;
  },

  async deleteStory(id: string): Promise<boolean> {
    const { error } = await supabase.from('stories').delete().eq('id', id);
    return !error;
  },

  // COMMENT OPERATIONS
  async getComments(prayerId: string): Promise<PrayerComment[]> {
    const { data, error } = await supabase
      .from('prayer_comments')
      .select('*')
      .eq('prayer_id', prayerId)
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data;
  },

  async addComment(prayerId: string, content: string, author: string): Promise<PrayerComment | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('prayer_comments')
      .insert({
        prayer_id: prayerId,
        user_id: user.id,
        content,
        author
      })
      .select()
      .single();

    if (error) return null;
    return data;
  },

  // CHAT OPERATIONS
  async saveChatMessage(message: ChatMessage): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('chats').insert({
      user_id: user.id,
      role: message.role,
      text: message.text
    });
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) return [];
    return data.map(c => ({ id: c.id, role: c.role, text: c.text }));
  },

  // VERSE OPERATIONS
  async saveVerse(verse: string, reference: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('saved_verses').upsert({
      user_id: user.id,
      verse,
      reference
    });
  },

  async getSavedVerses(): Promise<FavoriteVerse[]> {
    const { data, error } = await supabase
      .from('saved_verses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data.map(v => ({
      id: v.id,
      verse: v.verse,
      reference: v.reference,
      savedAt: new Date(v.created_at)
    }));
  },

  async getSupportedPrayers(): Promise<Prayer[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('prayer_supports')
      .select(`
        prayer_id,
        prayers(*)
      `)
      .eq('user_id', user.id);

    if (error) return [];
    return data
      .filter((d: any) => d.prayers !== null)
      .map((d: any) => ({
        ...d.prayers,
        timestamp: new Date(d.prayers.created_at),
        has_supported: true
      }));
  },

  async updateStats(type: 'devo' | 'prayer'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Simple mock logic for streaks/stats
    console.log(`Activity logged: ${type}`);
  }
};