export interface Devotional {
  title: string;
  verse: string;
  reference: string;
  reflection: string;
  reflectionQuestion: string;
  shortPrayer: string;
  date: string;
  // Optional sources for search grounded devotionals
  sources?: { uri: string; title: string }[];
}

export interface FavoriteVerse {
  id: string;
  verse: string;
  reference: string;
  savedAt: Date;
}

export interface PrayerComment {
  id: string;
  prayer_id: string;
  author: string;
  content: string;
  created_at: string;
  user_id: string;
}

export interface Prayer {
  id: string;
  user_id: string;
  author: string;
  content: string;
  timestamp: Date;
  prayers_count: number;
  is_anonymous: boolean;
  has_supported?: boolean;
  comment_count?: number;
}

export interface Story {
  id: string;
  user_id: string;
  author: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  avatar_seed?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  id: string;
}

export interface UserProfile {
  id: string;
  name: string;
  streak: number;
  joinedDate: string;
  favoriteVerse: string;
  avatarSeed: string;
  savedVerses: FavoriteVerse[];
  supportedPrayers?: Prayer[];
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'OT' | 'NT';
  category: string;
}

export type AppTab = 'devotional' | 'prayer' | 'bible' | 'ask' | 'profile' | 'settings';

export type BibleTranslation = 'NIV' | 'KJV' | 'ESV' | 'NLT';
export type AITone = 'gentle' | 'deep' | 'practical';