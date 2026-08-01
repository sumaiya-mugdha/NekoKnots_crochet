/*
# NekoKnots — initial schema

A cozy crochet-pattern community platform. Users browse a library of crochet
patterns (free and paid), read blog articles, save favorites, comment, and
purchase paid patterns via Stripe. An admin/creator manages content and
moderates comments.

## 1. New Tables

- `profiles` — public profile data for each auth user (display name, avatar,
  bio, admin flag). One row per auth.users entry.
- `categories` — crochet categories (amigurumi, garments, home decor,
  accessories, ...). Shared reference data used by patterns and articles.
- `patterns` — the core content. Each pattern has a title, description,
  category, difficulty level, optional price (paid patterns), image gallery,
  embedded video tutorial, materials list, written instructions, and a
  downloadable PDF. Tracks view count.
- `articles` — blog/journal posts (tips, tutorials, yarn reviews,
  behind-the-scenes). Rich-text body, cover image, tags.
- `favorites` — a user's saved patterns or articles (heart icon).
- `purchases` — record of a user's paid pattern unlock (Stripe payment).
- `comments` — user comments on patterns or articles.
- `newsletter` — email signup list for the homepage newsletter form.

## 2. Security (RLS)

This app has a sign-in screen, so most policies are scoped to `authenticated`
with ownership checks via `auth.uid()`. Public content (patterns, articles,
categories) is readable by everyone (anon + authenticated) so visitors can
browse before signing in. Writes are owner-scoped. Admin-only writes are
guarded by an `is_admin` check on the profile.

## 3. Important Notes

1. `profiles.user_id` defaults to `auth.uid()` so inserts from the client
   succeed without explicitly passing the owner.
2. `favorites`, `purchases`, and `comments` all default `user_id` to
   `auth.uid()` for the same reason.
3. A trigger auto-creates a `profiles` row whenever a new auth user signs up.
4. `is_admin` defaults to false and is only set true manually for the site
   owner. Admin write policies check `EXISTS (SELECT 1 FROM profiles WHERE
   user_id = auth.uid() AND is_admin = true)`.
*/

-- ---------- profiles ----------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Auto-create a profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'display_name', ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- categories ----------
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_read_all" ON categories;
CREATE POLICY "categories_read_all" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_admin_insert" ON categories;
CREATE POLICY "categories_admin_insert" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "categories_admin_update" ON categories;
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "categories_admin_delete" ON categories;
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

-- ---------- patterns ----------
CREATE TABLE IF NOT EXISTS patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  difficulty text NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','easy','intermediate','advanced')),
  is_free boolean NOT NULL DEFAULT true,
  price_cents integer NOT NULL DEFAULT 0,
  thumbnail_url text,
  gallery_urls text[] NOT NULL DEFAULT '{}',
  video_url text,
  materials jsonb NOT NULL DEFAULT '[]',
  instructions text,
  pdf_url text,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patterns_read_all" ON patterns;
CREATE POLICY "patterns_read_all" ON patterns FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "patterns_admin_insert" ON patterns;
CREATE POLICY "patterns_admin_insert" ON patterns FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "patterns_admin_update" ON patterns;
CREATE POLICY "patterns_admin_update" ON patterns FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "patterns_admin_delete" ON patterns;
CREATE POLICY "patterns_admin_delete" ON patterns FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX IF NOT EXISTS patterns_category_idx ON patterns(category_id);
CREATE INDEX IF NOT EXISTS patterns_created_idx ON patterns(created_at DESC);
CREATE INDEX IF NOT EXISTS patterns_difficulty_idx ON patterns(difficulty);

-- ---------- articles ----------
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text,
  body text NOT NULL DEFAULT '',
  cover_image_url text,
  tags text[] NOT NULL DEFAULT '{}',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "articles_read_all" ON articles;
CREATE POLICY "articles_read_all" ON articles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "articles_admin_insert" ON articles;
CREATE POLICY "articles_admin_insert" ON articles FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "articles_admin_update" ON articles;
CREATE POLICY "articles_admin_update" ON articles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "articles_admin_delete" ON articles;
CREATE POLICY "articles_admin_delete" ON articles FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX IF NOT EXISTS articles_created_idx ON articles(created_at DESC);

-- ---------- favorites ----------
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id uuid REFERENCES patterns(id) ON DELETE CASCADE,
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorites_target CHECK (pattern_id IS NOT NULL OR article_id IS NOT NULL)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites_read_own" ON favorites;
CREATE POLICY "favorites_read_own" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_insert_own" ON favorites;
CREATE POLICY "favorites_insert_own" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorites_delete_own" ON favorites;
CREATE POLICY "favorites_delete_own" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS favorites_user_idx ON favorites(user_id);

-- ---------- purchases ----------
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id uuid NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','refunded','failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "purchases_read_own" ON purchases;
CREATE POLICY "purchases_read_own" ON purchases FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_insert_own" ON purchases;
CREATE POLICY "purchases_insert_own" ON purchases FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "purchases_admin_read" ON purchases;
CREATE POLICY "purchases_admin_read" ON purchases FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX IF NOT EXISTS purchases_user_idx ON purchases(user_id);
CREATE INDEX IF NOT EXISTS purchases_pattern_idx ON purchases(pattern_id);

-- ---------- comments ----------
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id uuid REFERENCES patterns(id) ON DELETE CASCADE,
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_target CHECK (pattern_id IS NOT NULL OR article_id IS NOT NULL)
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Visible comments are readable by everyone (anon included) unless hidden;
-- hidden comments are only visible to the author and admins.
DROP POLICY IF EXISTS "comments_read_visible" ON comments;
CREATE POLICY "comments_read_visible" ON comments FOR SELECT
  TO anon, authenticated USING (
    NOT is_hidden
    OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "comments_insert_own" ON comments;
CREATE POLICY "comments_insert_own" ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update_own" ON comments;
CREATE POLICY "comments_update_own" ON comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_admin_update" ON comments;
CREATE POLICY "comments_admin_update" ON comments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

DROP POLICY IF EXISTS "comments_delete_own_or_admin" ON comments;
CREATE POLICY "comments_delete_own_or_admin" ON comments FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX IF NOT EXISTS comments_pattern_idx ON comments(pattern_id);
CREATE INDEX IF NOT EXISTS comments_article_idx ON comments(article_id);

-- ---------- newsletter ----------
CREATE TABLE IF NOT EXISTS newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_insert_any" ON newsletter;
CREATE POLICY "newsletter_insert_any" ON newsletter FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ---------- seed categories ----------
INSERT INTO categories (name, slug, description, icon)
VALUES
  ('Amigurumi', 'amigurumi', 'Tiny stuffed crochet toys and dolls', 'cat'),
  ('Garments', 'garments', 'Sweaters, cardigans, tops and wearables', 'shirt'),
  ('Home Decor', 'home-decor', 'Pillows, baskets, blankets and cozy home accents', 'home'),
  ('Accessories', 'accessories', 'Hats, scarves, bags and small wearables', 'sparkles'),
  ('Blankets & Throws', 'blankets-throws', 'Granny squares, ripple and textured blankets', 'grid')
ON CONFLICT (slug) DO NOTHING;
