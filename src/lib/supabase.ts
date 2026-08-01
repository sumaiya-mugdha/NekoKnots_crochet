import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing — auth and data will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export type Material = {
  name: string;
  qty: string;
};

export type Pattern = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  difficulty: 'beginner' | 'easy' | 'intermediate' | 'advanced';
  is_free: boolean;
  price_cents: number;
  thumbnail_url: string | null;
  gallery_urls: string[];
  video_url: string | null;
  materials: Material[];
  instructions: string | null;
  pdf_url: string | null;
  author_id: string | null;
  views: number;
  created_at: string;
  category?: Category | null;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  tags: string[];
  category_id: string | null;
  author_id: string | null;
  views: number;
  created_at: string;
  category?: Category | null;
};

export type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  pattern_id: string | null;
  article_id: string | null;
  created_at: string;
};

export type Purchase = {
  id: string;
  user_id: string;
  pattern_id: string;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  created_at: string;
  pattern?: Pattern | null;
};

export type Comment = {
  id: string;
  user_id: string;
  pattern_id: string | null;
  article_id: string | null;
  body: string;
  is_hidden: boolean;
  created_at: string;
  profile?: Profile | null;
};

export type Newsletter = {
  id: string;
  email: string;
  created_at: string;
};
