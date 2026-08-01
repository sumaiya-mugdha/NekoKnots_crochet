import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { supabase, type Pattern, type Category } from '@/lib/supabase';
import { Container, StitchDivider } from '@/components/ui/Brand';
import { PatternCard } from '@/components/ui/PatternCard';
import { Link } from '@/components/ui/Link';
import { useAuth } from '@/context/AuthContext';
import { difficultyClass, formatPrice } from '@/lib/utils';

const DIFFICULTIES = ['beginner', 'easy', 'intermediate', 'advanced'] as const;
const PRICE_FILTERS = ['all', 'free', 'paid'] as const;

export function PatternLibraryPage({ query }: { query: URLSearchParams }) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(query.get('category') || 'all');
  const [difficulty, setDifficulty] = useState('all');
  const [price, setPrice] = useState<'all' | 'free' | 'paid'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const { user } = useAuth();
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: pats }, { data: cats }] = await Promise.all([
        supabase
          .from('patterns')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);
      setPatterns((pats as Pattern[]) || []);
      setCategories((cats as Category[]) || []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('favorites')
        .select('pattern_id')
        .eq('user_id', user.id);
      setFavIds(new Set((data || []).map((d) => d.pattern_id as string)));
    })();
  }, [user]);

  const filtered = patterns.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    if (category !== 'all' && p.category?.slug !== category) return false;
    if (difficulty !== 'all' && p.difficulty !== difficulty) return false;
    if (price === 'free' && !p.is_free) return false;
    if (price === 'paid' && p.is_free) return false;
    return true;
  });

  const resetFilters = useCallback(() => {
    setSearch('');
    setCategory('all');
    setDifficulty('all');
    setPrice('all');
  }, []);

  return (
    <div>
      {/* Header banner */}
      <section className="bg-gradient-to-br from-rose-100 via-cream-50 to-lavender-100 border-b border-rose-100">
        <Container className="py-12">
          <h1 className="text-4xl font-700 text-ink-900">Pattern Library</h1>
          <p className="mt-2 text-ink-500 text-lg">
            {filtered.length} {filtered.length === 1 ? 'pattern' : 'patterns'} to knot up
          </p>
        </Container>
      </section>

      <Container className="py-10">
        {/* Search + filters */}
        <div className="nk-card p-5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patterns..."
                className="nk-input pl-12"
                aria-label="Search patterns"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="nk-input w-auto"
                aria-label="Filter by category"
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="nk-input w-auto"
                aria-label="Filter by difficulty"
              >
                <option value="all">All levels</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d} className="capitalize">{d}</option>
                ))}
              </select>
              <select
                value={price}
                onChange={(e) => setPrice(e.target.value as typeof price)}
                className="nk-input w-auto"
                aria-label="Filter by price"
              >
                {PRICE_FILTERS.map((p) => (
                  <option key={p} value={p} className="capitalize">{p === 'all' ? 'All prices' : p}</option>
                ))}
              </select>
              <div className="flex rounded-full bg-rose-100 p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`h-10 w-10 grid place-items-center rounded-full transition ${view === 'grid' ? 'bg-white text-rose-600 shadow-soft' : 'text-ink-400'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`h-10 w-10 grid place-items-center rounded-full transition ${view === 'list' ? 'bg-white text-rose-600 shadow-soft' : 'text-ink-400'}`}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          {(search || category !== 'all' || difficulty !== 'all' || price !== 'all') && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <SlidersHorizontal className="h-4 w-4 text-ink-400" />
              <span className="text-ink-500">Filters active</span>
              <button onClick={resetFilters} className="nk-chip bg-rose-100 text-rose-600 hover:bg-rose-200">
                Clear all
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className={`grid gap-6 ${view === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="nk-card h-64 animate-pulse bg-rose-100/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="nk-card p-12 text-center">
            <div className="text-5xl mb-4">🧶</div>
            <h3 className="font-display font-600 text-xl text-ink-900">No patterns found</h3>
            <p className="text-ink-500 mt-2">Try adjusting your filters or search.</p>
            <button onClick={resetFilters} className="nk-btn-soft mt-5">Clear filters</button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PatternCard key={p.id} pattern={p} favorited={favIds.has(p.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <Link key={p.id} href={`/patterns/${p.slug}`} className="block">
                <div className="nk-card p-4 flex gap-4 hover:shadow-fluffy hover:-translate-y-0.5 transition-all">
                  <div className="h-24 w-32 rounded-2xl overflow-hidden bg-rose-100 flex-shrink-0">
                    {p.thumbnail_url && (
                      <img src={p.thumbnail_url} alt={p.title} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-ink-400 mb-1">
                      {p.category && <span>{p.category.name}</span>}
                      <span aria-hidden>·</span>
                      <span className="capitalize">{p.difficulty}</span>
                    </div>
                    <h3 className="font-display font-600 text-lg text-ink-900 truncate">{p.title}</h3>
                    <p className="text-sm text-ink-500 line-clamp-1">{p.description}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {p.is_free ? (
                        <span className="nk-chip bg-sage-100 text-sage-500">Free</span>
                      ) : (
                        <span className="nk-chip bg-rose-100 text-rose-600">{formatPrice(p.price_cents)}</span>
                      )}
                      <span className={`nk-chip ${difficultyClass(p.difficulty)} capitalize`}>{p.difficulty}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
      <StitchDivider className="nk-section text-rose-200 mt-8" />
    </div>
  );
}
