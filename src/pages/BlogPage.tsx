import { useEffect, useState } from 'react';
import { ArrowRight, Search, Tag } from 'lucide-react';
import { supabase, type Article, type Category } from '@/lib/supabase';
import { Container, SectionHeading, StitchDivider } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { formatDate } from '@/lib/utils';

export function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: arts }, { data: cats }] = await Promise.all([
        supabase
          .from('articles')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);
      setArticles((arts as Article[]) || []);
      setCategories((cats as Category[]) || []);
      setLoading(false);
    })();
  }, []);

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags))).sort();

  const filtered = articles.filter((a) => {
    if (search) {
      const q = search.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !(a.excerpt || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    if (activeTag && !a.tags.includes(activeTag)) return false;
    return true;
  });

  return (
    <div>
      <section className="bg-gradient-to-br from-lavender-100 via-cream-50 to-rose-100 border-b border-rose-100">
        <Container className="py-12">
          <span className="nk-chip bg-white/80 text-lavender-500 mb-3">The NekoKnots Journal</span>
          <h1 className="text-4xl font-700 text-ink-900">Tips, yarn & cozy stories</h1>
          <p className="mt-2 text-ink-500 text-lg max-w-xl">
            Tutorials, yarn reviews, and behind-the-scenes peeks from the hook.
          </p>
        </Container>
      </section>

      <Container className="py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="nk-input pl-12"
                aria-label="Search articles"
              />
            </div>
            <div className="nk-card p-5">
              <h3 className="font-display font-600 text-ink-900 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-rose-500" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`nk-chip transition ${activeTag === null ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}
                >
                  All
                </button>
                {allTags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                    className={`nk-chip transition ${activeTag === t ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="nk-card p-5">
              <h3 className="font-display font-600 text-ink-900 mb-3">Categories</h3>
              <ul className="space-y-1.5 text-sm">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href="/blog" className="text-ink-500 hover:text-rose-600">{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Articles */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="nk-card h-72 animate-pulse bg-rose-100/50" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="nk-card p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="font-display font-600 text-xl text-ink-900">No articles found</h3>
                <p className="text-ink-500 mt-2">Try a different search or tag.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((a) => (
                  <Link key={a.id} href={`/blog/${a.slug}`} className="nk-card overflow-hidden group hover:shadow-fluffy hover:-translate-y-1 transition-all">
                    <div className="aspect-[16/10] overflow-hidden bg-lavender-100">
                      {a.cover_image_url && (
                        <img src={a.cover_image_url} alt={a.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {a.tags.slice(0, 2).map((t) => (
                          <span key={t} className="nk-chip bg-lavender-100 text-lavender-500">{t}</span>
                        ))}
                      </div>
                      <h3 className="font-display font-600 text-lg text-ink-900 group-hover:text-rose-600 transition-colors">{a.title}</h3>
                      {a.excerpt && <p className="text-sm text-ink-500 mt-1.5 line-clamp-2">{a.excerpt}</p>}
                      <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
                        <span>{formatDate(a.created_at)}</span>
                        <span className="inline-flex items-center gap-1 text-rose-600 font-600">Read <ArrowRight className="h-3 w-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
      <StitchDivider className="nk-section text-rose-200 mt-8" />
    </div>
  );
}
