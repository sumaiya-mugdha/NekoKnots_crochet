import { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Mail, CheckCircle2, Cat, Shirt, Home, Sparkle, Grid3x3 } from 'lucide-react';
import { supabase, type Pattern, type Category } from '@/lib/supabase';
import { Container, SectionHeading, StitchDivider } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { PatternCard } from '@/components/ui/PatternCard';
import { useAuth } from '@/context/AuthContext';

const CATEGORY_ICONS: Record<string, typeof Cat> = {
  cat: Cat,
  shirt: Shirt,
  home: Home,
  sparkles: Sparkles,
  grid: Grid3x3,
};

export function HomePage() {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const { user } = useAuth();
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const [{ data: pats }, { data: cats }] = await Promise.all([
        supabase
          .from('patterns')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false })
          .limit(6),
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
        .eq('user_id', user.id)
        .is('pattern_id', 'not.null');
      setFavIds(new Set((data || []).map((d) => d.pattern_id as string)));
    })();
  }, [user]);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setSubError(null);
    if (!email) return;
    const { error } = await supabase.from('newsletter').insert({ email });
    if (error) {
      if (error.code === '23505') {
        setSubscribed(true);
      } else {
        setSubError('Something went wrong. Try again?');
      }
      return;
    }
    setSubscribed(true);
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-cream-50 to-lavender-100" />
        <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl animate-float-soft" />
        <div className="absolute -bottom-20 -left-10 h-80 w-80 rounded-full bg-lavender-200/40 blur-3xl animate-float-soft" style={{ animationDelay: '2s' }} />
        <Container className="relative py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-pop-in">
            <span className="nk-chip bg-white/80 text-rose-600 shadow-soft mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Cozy crochet community
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-700 leading-[1.1] text-ink-900">
              Knot your heart into <span className="text-rose-500">every stitch</span>
            </h1>
            <p className="mt-5 text-lg text-ink-500 max-w-md">
              Discover free and premium crochet patterns, follow along with video
              tutorials, and share your cozy creations with a community that gets it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/patterns" className="nk-btn-primary text-base px-7 py-3">
                Browse Patterns <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/blog" className="nk-btn-ghost text-base px-7 py-3">
                Read the Blog
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-ink-500">
              <div><span className="font-700 text-ink-900 text-lg">50+</span> patterns</div>
              <div className="h-8 w-px bg-rose-200" />
              <div><span className="font-700 text-ink-900 text-lg">5</span> categories</div>
              <div className="h-8 w-px bg-rose-200" />
              <div><span className="font-700 text-ink-900 text-lg">100%</span> cozy</div>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-5xl overflow-hidden shadow-fluffy border-4 border-white">
              <img
                src="https://images.pexels.com/photos/4792061/pexels-photo-4792061.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Soft pink yarn with a crochet hook"
                className="w-full h-[420px] object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 nk-card p-4 flex items-center gap-3 animate-float-soft">
              <span className="h-11 w-11 rounded-2xl bg-rose-100 grid place-items-center text-2xl">🧶</span>
              <div>
                <p className="font-display font-600 text-ink-900 text-sm">New pattern!</p>
                <p className="text-xs text-ink-500">Pudding the Cat</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 nk-card p-3 flex items-center gap-2 animate-float-soft" style={{ animationDelay: '1.5s' }}>
              <span className="text-2xl">🐱</span>
              <span className="font-display font-600 text-rose-600 text-sm">Cozy vibes</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories */}
      <Container className="py-16">
        <SectionHeading
          center
          eyebrow="Browse by craft"
          title="What will you knot today?"
          subtitle="From tiny amigurumi friends to snuggly blankets — find your next project."
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon || ''] ?? Sparkle;
            return (
              <Link
                key={c.id}
                href={`/patterns?category=${c.slug}`}
                className="nk-card p-6 text-center group hover:shadow-fluffy hover:-translate-y-1 transition-all"
              >
                <span className="h-14 w-14 mx-auto rounded-3xl bg-gradient-to-br from-rose-100 to-lavender-100 grid place-items-center group-hover:from-rose-200 group-hover:to-lavender-200 transition-colors">
                  <Icon className="h-7 w-7 text-rose-500" />
                </span>
                <h3 className="mt-4 font-display font-600 text-ink-900">{c.name}</h3>
                {c.description && (
                  <p className="mt-1 text-xs text-ink-400 line-clamp-2">{c.description}</p>
                )}
              </Link>
            );
          })}
        </div>
      </Container>

      <StitchDivider className="nk-section text-rose-200" />

      {/* Featured patterns */}
      <Container className="py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <SectionHeading
            eyebrow="Fresh off the hook"
            title="Latest patterns"
            subtitle="Newly added projects to inspire your next cozy evening."
          />
          <Link href="/patterns" className="nk-btn-soft">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="nk-card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-rose-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-rose-100 rounded w-3/4" />
                  <div className="h-3 bg-rose-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patterns.map((p) => (
              <PatternCard key={p.id} pattern={p} favorited={favIds.has(p.id)} />
            ))}
          </div>
        )}
      </Container>

      {/* Newsletter */}
      <section className="nk-section py-16">
        <div className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-rose-200 via-rose-100 to-lavender-100 p-8 sm:p-14 text-center shadow-fluffy">
          <div className="absolute -top-8 -left-8 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute -bottom-10 -right-6 h-48 w-48 rounded-full bg-lavender-200/40 blur-3xl" />
          <div className="relative">
            <span className="nk-chip bg-white/80 text-rose-600 mb-4">
              <Mail className="h-3.5 w-3.5" /> Newsletter
            </span>
            <h2 className="text-3xl sm:text-4xl font-700 text-ink-900 mb-3">
              Get cozy patterns in your inbox
            </h2>
            <p className="text-ink-500 max-w-md mx-auto mb-6">
              One sweet email a month with new patterns, yarn tips, and behind-the-scenes
              peeks. No spam, just stitches.
            </p>
            {subscribed ? (
              <div className="inline-flex items-center gap-2 nk-btn bg-white text-sage-500 px-6 py-3">
                <CheckCircle2 className="h-5 w-5" />
                You're on the list! Check your inbox.
              </div>
            ) : (
              <form onSubmit={subscribe} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cozy.com"
                  className="nk-input flex-1 bg-white/90"
                  aria-label="Email address"
                />
                <button type="submit" className="nk-btn-primary px-6 py-3">
                  Subscribe <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            )}
            {subError && <p className="mt-3 text-sm text-rose-600">{subError}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
