/*
# Seed demo content + view counter

## 1. New Functions
- `increment_pattern_views(pattern_id)` — atomically bumps a pattern's view
  count. Callable by anon (browsing is public).
- `increment_article_views(article_id)` — same for articles.

## 2. Demo Data
- Inserts sample patterns and articles so the homepage and library aren't
  empty on first load. author_id is left null (see migration 0002a); the real
  admin can claim them later.
*/

-- View counters (callable by anyone browsing)
CREATE OR REPLACE FUNCTION public.increment_pattern_views(p_pattern_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE patterns SET views = views + 1 WHERE id = p_pattern_id;
$$;

CREATE OR REPLACE FUNCTION public.increment_article_views(p_article_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE articles SET views = views + 1 WHERE id = p_article_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_pattern_views(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_article_views(uuid) TO anon, authenticated;

-- Demo patterns (free + paid mix). Uses placeholder image URLs from Pexels.
INSERT INTO patterns (title, slug, description, category_id, difficulty, is_free, price_cents, thumbnail_url, gallery_urls, video_url, materials, instructions, pdf_url)
SELECT
  'Pudding the Cat Amigurumi', 'pudding-cat-amigurumi',
  'A chubby little crochet cat with a pudding-cup body. Beginner-friendly and works up in an afternoon.',
  c.id, 'beginner', true, 0,
  'https://images.pexels.com/photos/3014853/pexels-photo-3014853.jpeg',
  ARRAY['https://images.pexels.com/photos/3014853/pexels-photo-3014853.jpeg','https://images.pexels.com/photos/4474035/pexels-photo-4474035.jpeg'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '[{"name":"Worsted weight yarn (cream)","qty":"1 skein"},{"name":"Size G/4mm crochet hook","qty":"1"},{"name":"Polyfill stuffing","qty":"small bag"},{"name":"Safety eyes 8mm","qty":"1 pair"}]',
  'Round 1: magic ring, 6 sc into ring (6). Round 2: 2 sc in each st around (12). Round 3: [sc, 2 sc in next] x6 (18). Continue increasing until 36 sts, then work even for body.',
  NULL
FROM categories c WHERE c.slug = 'amigurumi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO patterns (title, slug, description, category_id, difficulty, is_free, price_cents, thumbnail_url, gallery_urls, video_url, materials, instructions, pdf_url)
SELECT
  'Lavender Cloud Cardigan', 'lavender-cloud-cardigan',
  'An oversized, cozy cardigan with a lacy stitch pattern. Perfect for spring evenings.',
  c.id, 'intermediate', false, 800,
  'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg',
  ARRAY['https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg','https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '[{"name":"DK weight yarn (lavender)","qty":"8 skeins"},{"name":"Size H/5mm crochet hook","qty":"1"},{"name":"Stitch markers","qty":"4"}]',
  'Body: ch 80, dc in 4th ch from hook and each ch across. Work in back loop for ribbed texture. Sleeves picked up along armhole and worked in rounds.',
  NULL
FROM categories c WHERE c.slug = 'garments'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO patterns (title, slug, description, category_id, difficulty, is_free, price_cents, thumbnail_url, gallery_urls, video_url, materials, instructions, pdf_url)
SELECT
  'Strawberry Bloom Basket', 'strawberry-bloom-basket',
  'A small textured storage basket with a strawberry-motif border. Great for yarn scraps.',
  c.id, 'easy', true, 0,
  'https://images.pexels.com/photos/4210385/pexels-photo-4210385.jpeg',
  ARRAY['https://images.pexels.com/photos/4210385/pexels-photo-4210385.jpeg'],
  NULL,
  '[{"name":"Cotton worsted yarn (pink, green, cream)","qty":"1 skein each"},{"name":"Size H/5mm crochet hook","qty":"1"}]',
  'Base: ch 4, sl st to join. Rnd 1: 8 sc in ring. Rnd 2: 2 sc in each st (16). Continue increasing flat, then work even up the sides for the basket walls.',
  NULL
FROM categories c WHERE c.slug = 'home-decor'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO patterns (title, slug, description, category_id, difficulty, is_free, price_cents, thumbnail_url, gallery_urls, video_url, materials, instructions, pdf_url)
SELECT
  'Mochi Beanie', 'mochi-beanie',
  'A slouchy beanie with a faux-pom-pom. Quick one-evening project.',
  c.id, 'beginner', true, 0,
  'https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg',
  ARRAY['https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg'],
  NULL,
  '[{"name":"Chunky yarn (cream)","qty":"1 skein"},{"name":"Size L/8mm crochet hook","qty":"1"}]',
  'Ch 50, join. Rnd 1: hdc in each st. Repeat for 8 rounds. Decrease evenly over next 4 rounds to close crown.',
  NULL
FROM categories c WHERE c.slug = 'accessories'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO patterns (title, slug, description, category_id, difficulty, is_free, price_cents, thumbnail_url, gallery_urls, video_url, materials, instructions, pdf_url)
SELECT
  'Rosewater Granny Square Blanket', 'rosewater-granny-square-blanket',
  'A full granny-square blanket with a rose-petal join. Includes 12-square motif chart and assembly guide.',
  c.id, 'intermediate', false, 1200,
  'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
  ARRAY['https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg','https://images.pexels.com/photos/4210870/pexels-photo-4210870.jpeg'],
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  '[{"name":"DK yarn (rose, cream, sage)","qty":"6 skeins total"},{"name":"Size G/4mm crochet hook","qty":"1"}]',
  'Motif: ch 4, join. Rnd 1: 3 dc, ch 2 x4 in ring. Join squares with flat braid join as shown in chart.',
  NULL
FROM categories c WHERE c.slug = 'blankets-throws'
ON CONFLICT (slug) DO NOTHING;

-- Demo articles
INSERT INTO articles (title, slug, excerpt, body, cover_image_url, tags, category_id)
SELECT
  'Choosing the Right Yarn for Amigurumi',
  'choosing-the-right-yarn-for-amigurumi',
  'A quick guide to yarn weights, fiber content, and tension for the perfect squishy toy.',
  'When it comes to amigurumi, the yarn you choose makes all the difference. Cotton yarn holds its shape beautifully and gives crisp stitch definition. For toys that will be loved and squished, a tight gauge is essential so the stuffing does not peek through. I recommend a size G or 4mm hook with worsted cotton for most projects.',
  'https://images.pexels.com/photos/4210385/pexels-photo-4210385.jpeg',
  ARRAY['yarn','amigurumi','beginner'],
  c.id
FROM categories c WHERE c.slug = 'amigurumi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO articles (title, slug, excerpt, body, cover_image_url, tags)
VALUES
  ('Behind the Scenes: Designing the Lavender Cloud Cardigan',
  'behind-the-scenes-lavender-cloud',
  'How a rainy afternoon and a single skein of lavender yarn became a cardigan pattern.',
  'It started, as most of my patterns do, with a single skein I could not resist. I swatched, I frogged, I swatched again. The lace motif came from an old stitch dictionary, but I simplified the repeats so it would relax into a drapey fabric rather than a stiff one.',
  'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg',
  ARRAY['behind-the-scenes','design'])
ON CONFLICT (slug) DO NOTHING;
