import { useEffect, useState } from 'react';
import { Heart, ShoppingBag, User, LogOut, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Pattern, type Purchase, type Favorite } from '@/lib/supabase';
import { Container, SectionHeading, StitchDivider } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { PatternCard } from '@/components/ui/PatternCard';
import { formatPrice, formatDate } from '@/lib/utils';

export function ProfilePage() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState<'favorites' | 'purchases' | 'edit'>('favorites');
  const [favPatterns, setFavPatterns] = useState<Pattern[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(profile?.display_name || '');
    setBio(profile?.bio || '');
    (async () => {
      const [{ data: favs }, { data: purs }] = await Promise.all([
        supabase
          .from('favorites')
          .select('pattern_id')
          .eq('user_id', user.id)
          .not('pattern_id', 'is', null),
        supabase
          .from('purchases')
          .select('*, pattern:patterns(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      const favIds = ((favs as Favorite[]) || []).map((f) => f.pattern_id).filter(Boolean) as string[];
      if (favIds.length) {
        const { data: pats } = await supabase
          .from('patterns')
          .select('*, category:categories(*)')
          .in('id', favIds);
        setFavPatterns((pats as Pattern[]) || []);
      }
      setPurchases((purs as Purchase[]) || []);
      setLoading(false);
    })();
  }, [user, profile]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaved(false);
    await supabase
      .from('profiles')
      .update({ display_name: displayName, bio })
      .eq('user_id', user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!user) {
    return (
      <Container className="py-20 text-center">
        <div className="text-6xl mb-4">🐱</div>
        <h1 className="text-2xl font-700 text-ink-900">You're not logged in</h1>
        <p className="text-ink-500 mt-2">Log in to see your favorites and purchases.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/login" className="nk-btn-primary">Log in</Link>
          <Link href="/signup" className="nk-btn-ghost">Create account</Link>
        </div>
      </Container>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-rose-100 via-cream-50 to-lavender-100 border-b border-rose-100">
        <Container className="py-10 flex items-center gap-5">
          <span className="h-20 w-20 rounded-3xl bg-gradient-to-br from-rose-300 to-lavender-300 grid place-items-center font-display font-700 text-3xl text-white shadow-fluffy">
            {(profile?.display_name || user.email || 'N')[0].toUpperCase()}
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-700 text-ink-900">{profile?.display_name || 'Crafter'}</h1>
            <p className="text-ink-500">{user.email}</p>
            {profile?.is_admin && <span className="nk-chip bg-rose-500 text-white mt-2">Admin</span>}
          </div>
          <button onClick={signOut} className="nk-btn-ghost">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </Container>
      </section>

      <Container className="py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {([
            { id: 'favorites', label: 'Favorites', icon: Heart },
            { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
            { id: 'edit', label: 'Edit profile', icon: Edit2 },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`nk-btn ${tab === t.id ? 'bg-rose-500 text-white shadow-soft' : 'bg-white text-ink-700 border border-rose-100'}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'favorites' && (
          <div>
            <SectionHeading title="Your saved patterns" subtitle="All the projects you've hearted." />
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <div key={i} className="nk-card h-64 animate-pulse bg-rose-100/50" />)}
              </div>
            ) : favPatterns.length === 0 ? (
              <div className="nk-card p-12 text-center">
                <Heart className="h-10 w-10 text-rose-300 mx-auto mb-3" />
                <h3 className="font-display font-600 text-xl text-ink-900">No favorites yet</h3>
                <p className="text-ink-500 mt-2">Tap the heart on any pattern to save it here.</p>
                <Link href="/patterns" className="nk-btn-primary mt-5">Browse patterns</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favPatterns.map((p) => <PatternCard key={p.id} pattern={p} favorited />)}
              </div>
            )}
          </div>
        )}

        {tab === 'purchases' && (
          <div>
            <SectionHeading title="Purchase history" subtitle="Patterns you've unlocked." />
            {loading ? (
              <div className="nk-card h-40 animate-pulse bg-rose-100/50" />
            ) : purchases.length === 0 ? (
              <div className="nk-card p-12 text-center">
                <ShoppingBag className="h-10 w-10 text-rose-300 mx-auto mb-3" />
                <h3 className="font-display font-600 text-xl text-ink-900">No purchases yet</h3>
                <p className="text-ink-500 mt-2">Paid patterns you unlock will appear here.</p>
                <Link href="/patterns" className="nk-btn-primary mt-5">Browse patterns</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((p) => (
                  <div key={p.id} className="nk-card p-4 flex items-center gap-4 flex-wrap">
                    {p.pattern?.thumbnail_url && (
                      <img src={p.pattern.thumbnail_url} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link href={`/patterns/${p.pattern?.slug}`} className="font-display font-600 text-ink-900 hover:text-rose-600">
                        {p.pattern?.title || 'Pattern'}
                      </Link>
                      <p className="text-sm text-ink-400">{formatDate(p.created_at)}</p>
                    </div>
                    <span className="nk-chip bg-sage-100 text-sage-500 capitalize">{p.status}</span>
                    <span className="font-display font-600 text-ink-700">{formatPrice(p.amount_cents)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'edit' && (
          <div className="max-w-lg">
            <SectionHeading title="Edit your profile" subtitle="Tell the community a little about you." />
            <form onSubmit={saveProfile} className="nk-card p-6 space-y-4">
              <div>
                <label className="block text-sm font-600 text-ink-700 mb-1.5">Display name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="nk-input pl-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-600 text-ink-700 mb-1.5">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="What do you love to crochet?"
                  className="nk-input resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={saving} className="nk-btn-primary disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                {saved && (
                  <span className="inline-flex items-center gap-1 text-sage-500 font-600">
                    <Check className="h-4 w-4" /> Saved!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </Container>
      <StitchDivider className="nk-section text-rose-200 mt-8" />
    </div>
  );
}
