import { useEffect, useState } from 'react';
import {
  ArrowLeft, Lock, Download, Play, Eye, MessageCircle, Send, Cat, Shirt, Home, Sparkle, Grid3x3, CheckCircle2,
} from 'lucide-react';
import { supabase, type Pattern, type Comment } from '@/lib/supabase';
import { Container, StitchDivider } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useAuth } from '@/context/AuthContext';
import { difficultyClass, formatPrice, formatDate, timeAgo, videoEmbed } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, typeof Cat> = {
  cat: Cat, shirt: Shirt, home: Home, sparkles: Sparkle, grid: Grid3x3,
};

export function PatternPage({ slug }: { slug: string }) {
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [owned, setOwned] = useState(false);
  const [favState, setFavState] = useState(false);
  const { user } = useAuth();
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('patterns')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      const p = data as Pattern | null;
      setPattern(p);
      setLoading(false);
      if (p) {
        // increment views
        await supabase.rpc('increment_pattern_views', { p_pattern_id: p.id });
        // load comments
        const { data: cmts } = await supabase
          .from('comments')
          .select('*, profile:profiles(*)')
          .eq('pattern_id', p.id)
          .order('created_at', { ascending: false });
        setComments((cmts as Comment[]) || []);
        // check favorite
        if (user) {
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('pattern_id', p.id)
            .maybeSingle();
          setFavState(!!fav);
          // check purchase
          const { data: pur } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('pattern_id', p.id)
            .eq('status', 'paid')
            .maybeSingle();
          setOwned(!!pur);
        }
      }
    })();
  }, [slug, user]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!commentText.trim()) return;
    setCommentError(null);
    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: user.id, pattern_id: pattern!.id, body: commentText.trim() })
      .select('*, profile:profiles(*)')
      .single();
    if (error) {
      setCommentError('Could not post your comment. Try again?');
      return;
    }
    setComments((c) => [data as Comment, ...c]);
    setCommentText('');
  }

  async function startCheckout() {
    if (!user) {
      window.location.hash = '/login';
      return;
    }
    setStripeLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            pattern_id: pattern!.id,
            user_id: user.id,
            price_cents: pattern!.price_cents,
            title: pattern!.title,
          }),
        },
      );
      if (!res.ok) throw new Error('Checkout failed');
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setCommentError('Checkout is not available yet — Stripe needs to be configured.');
    } finally {
      setStripeLoading(false);
    }
  }

  if (loading) {
    return (
      <Container className="py-20">
        <div className="nk-card h-96 animate-pulse bg-rose-100/50" />
      </Container>
    );
  }

  if (!pattern) {
    return (
      <Container className="py-20 text-center">
        <div className="text-6xl mb-4">🧶</div>
        <h1 className="text-2xl font-700 text-ink-900">Pattern not found</h1>
        <p className="text-ink-500 mt-2">This pattern may have been removed.</p>
        <Link href="/patterns" className="nk-btn-primary mt-6">
          <ArrowLeft className="h-4 w-4" /> Back to library
        </Link>
      </Container>
    );
  }

  const canView = pattern.is_free || owned;
  const embed = videoEmbed(pattern.video_url);
  const Icon = pattern.category ? (CATEGORY_ICONS[pattern.category.icon || ''] ?? Sparkle) : Sparkle;

  return (
    <div>
      {/* Breadcrumb */}
      <Container className="py-5">
        <Link href="/patterns" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-rose-600">
          <ArrowLeft className="h-4 w-4" /> All patterns
        </Link>
      </Container>

      <Container className="pb-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="relative rounded-5xl overflow-hidden shadow-fluffy border-4 border-white bg-rose-100 aspect-square">
              {pattern.gallery_urls.length > 0 ? (
                <img
                  src={pattern.gallery_urls[activeImg] || pattern.thumbnail_url || ''}
                  alt={pattern.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-6xl">🧶</div>
              )}
              <div className="absolute top-4 right-4">
                <FavoriteButton patternId={pattern.id} favorited={favState} onToggle={setFavState} />
              </div>
            </div>
            {pattern.gallery_urls.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {pattern.gallery_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition ${activeImg === i ? 'border-rose-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={url} alt={`${pattern.title} ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {pattern.category && (
                <span className="nk-chip bg-rose-100 text-rose-600">
                  <Icon className="h-3.5 w-3.5" /> {pattern.category.name}
                </span>
              )}
              <span className={`nk-chip ${difficultyClass(pattern.difficulty)} capitalize`}>
                {pattern.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                <Eye className="h-3.5 w-3.5" /> {pattern.views} views
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-700 text-ink-900">{pattern.title}</h1>
            {pattern.description && (
              <p className="mt-3 text-ink-500 text-lg">{pattern.description}</p>
            )}

            <StitchDivider className="my-6" />

            {/* Price / buy */}
            {pattern.is_free ? (
              <div className="nk-card p-5 bg-sage-100/40 border-sage-200">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-2xl bg-sage-200 grid place-items-center">
                    <CheckCircle2 className="h-6 w-6 text-sage-500" />
                  </span>
                  <div>
                    <p className="font-display font-700 text-xl text-sage-500">Free pattern</p>
                    <p className="text-sm text-ink-500">All instructions, video, and PDF are yours to enjoy.</p>
                  </div>
                </div>
              </div>
            ) : owned ? (
              <div className="nk-card p-5 bg-sage-100/40 border-sage-200">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-2xl bg-sage-200 grid place-items-center">
                    <CheckCircle2 className="h-6 w-6 text-sage-500" />
                  </span>
                  <div>
                    <p className="font-display font-700 text-xl text-sage-500">Unlocked!</p>
                    <p className="text-sm text-ink-500">You own this pattern — full instructions and PDF below.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="nk-card p-5 bg-rose-50 border-rose-200">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-display font-700 text-2xl text-rose-600">
                      {formatPrice(pattern.price_cents)}
                    </p>
                    <p className="text-sm text-ink-500 mt-1">
                      Unlock the full pattern, video tutorial, and downloadable PDF.
                    </p>
                  </div>
                  <button
                    onClick={startCheckout}
                    disabled={stripeLoading}
                    className="nk-btn-primary"
                  >
                    <Lock className="h-4 w-4" fill="white" />
                    {stripeLoading ? 'Loading...' : 'Buy & Unlock'}
                  </button>
                </div>
                {!user && (
                  <p className="mt-3 text-xs text-ink-400">
                    You'll need to <Link href="/login" className="text-rose-600 font-600">log in</Link> to purchase.
                  </p>
                )}
              </div>
            )}

            {/* Materials */}
            <div className="mt-8">
              <h3 className="font-display font-600 text-xl text-ink-900 mb-3">Materials & yarn</h3>
              <ul className="space-y-2">
                {pattern.materials.map((m, i) => (
                  <li key={i} className="flex items-center justify-between nk-card p-3">
                    <span className="text-ink-700">{m.name}</span>
                    <span className="nk-chip bg-rose-100 text-rose-600">{m.qty}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Video */}
        {embed && (canView || pattern.is_free) && (
          <div className="mt-12">
            <h2 className="font-display font-700 text-2xl text-ink-900 mb-4 flex items-center gap-2">
              <Play className="h-6 w-6 text-rose-500" /> Video tutorial
            </h2>
            <div className="nk-card overflow-hidden p-2">
              <div className="aspect-video rounded-3xl overflow-hidden bg-ink-900">
                <iframe
                  src={embed}
                  title={`${pattern.title} video tutorial`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="font-display font-700 text-2xl text-ink-900 mb-4">Written instructions</h2>
            {canView ? (
              <div className="nk-card p-6">
                <pre className="whitespace-pre-wrap font-body text-ink-700 leading-relaxed">
                  {pattern.instructions || 'Instructions coming soon.'}
                </pre>
                {pattern.pdf_url && (
                  <a href={pattern.pdf_url} target="_blank" rel="noreferrer" className="nk-btn-soft mt-6">
                    <Download className="h-4 w-4" /> Download PDF pattern
                  </a>
                )}
              </div>
            ) : (
              <div className="nk-card p-8 text-center bg-rose-50 border-rose-200">
                <Lock className="h-10 w-10 text-rose-400 mx-auto mb-3" />
                <h3 className="font-display font-600 text-xl text-ink-900">This is a paid pattern</h3>
                <p className="text-ink-500 mt-2 max-w-sm mx-auto">
                  Purchase to unlock the full written instructions, video tutorial, and
                  downloadable PDF.
                </p>
                <button onClick={startCheckout} disabled={stripeLoading} className="nk-btn-primary mt-5">
                  <Lock className="h-4 w-4" fill="white" />
                  {stripeLoading ? 'Loading...' : `Unlock for ${formatPrice(pattern.price_cents)}`}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar: quick facts */}
          <aside className="space-y-4">
            <div className="nk-card p-5">
              <h3 className="font-display font-600 text-ink-900 mb-3">Quick facts</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-ink-400">Difficulty</dt><dd className="capitalize text-ink-700">{pattern.difficulty}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-400">Category</dt><dd className="text-ink-700">{pattern.category?.name || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-400">Price</dt><dd className="text-ink-700">{pattern.is_free ? 'Free' : formatPrice(pattern.price_cents)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-400">Posted</dt><dd className="text-ink-700">{formatDate(pattern.created_at)}</dd></div>
              </dl>
            </div>
          </aside>
        </div>

        {/* Comments */}
        <div className="mt-14">
          <h2 className="font-display font-700 text-2xl text-ink-900 mb-5 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-rose-500" /> Comments ({comments.length})
          </h2>
          {user ? (
            <form onSubmit={submitComment} className="nk-card p-4 mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts or progress..."
                rows={3}
                className="nk-input resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                {commentError && <p className="text-sm text-rose-600">{commentError}</p>}
                <button type="submit" disabled={!commentText.trim()} className="nk-btn-primary ml-auto disabled:opacity-50">
                  <Send className="h-4 w-4" /> Post comment
                </button>
              </div>
            </form>
          ) : (
            <div className="nk-card p-5 mb-6 text-center text-ink-500">
              <Link href="/login" className="text-rose-600 font-600">Log in</Link> to join the conversation.
            </div>
          )}
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="nk-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-9 w-9 rounded-full bg-gradient-to-br from-rose-200 to-lavender-200 grid place-items-center font-display font-600 text-rose-600">
                    {(c.profile?.display_name || 'A')[0].toUpperCase()}
                  </span>
                  <div>
                    <p className="font-display font-600 text-ink-900 text-sm">{c.profile?.display_name || 'Anonymous'}</p>
                    <p className="text-xs text-ink-400">{timeAgo(c.created_at)}</p>
                  </div>
                </div>
                <p className="text-ink-700 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-ink-400 text-center py-6">No comments yet — be the first to share!</p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
