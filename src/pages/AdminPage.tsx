import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Plus, Pencil, Trash2, Eye, Heart, DollarSign, MessageCircle, X, Save, BarChart3,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Pattern, type Article, type Category, type Comment } from '@/lib/supabase';
import { Container, SectionHeading } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { slugify, formatPrice, formatDate } from '@/lib/utils';

type Tab = 'overview' | 'patterns' | 'articles' | 'comments';

export function AdminPage() {
  const { profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState({ views: 0, sales: 0, favorites: 0, paidCount: 0 });
  const [editing, setEditing] = useState<Pattern | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [showPatternForm, setShowPatternForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);

  async function loadAll() {
    const [{ data: pats }, { data: arts }, { data: cats }, { data: cmts }, { data: favs }, { data: purs }] = await Promise.all([
      supabase.from('patterns').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('articles').select('*, category:categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
      supabase.from('comments').select('*, profile:profiles(*)').order('created_at', { ascending: false }),
      supabase.from('favorites').select('id'),
      supabase.from('purchases').select('amount_cents, status').eq('status', 'paid'),
    ]);
    setPatterns((pats as Pattern[]) || []);
    setArticles((arts as Article[]) || []);
    setCategories((cats as Category[]) || []);
    setComments((cmts as Comment[]) || []);
    const totalViews = ((pats as Pattern[]) || []).reduce((s, p) => s + p.views, 0) + ((arts as Article[]) || []).reduce((s, a) => s + a.views, 0);
    const totalSales = ((purs as { amount_cents: number }[]) || []).reduce((s, p) => s + p.amount_cents, 0);
    setStats({
      views: totalViews,
      sales: totalSales,
      favorites: (favs || []).length,
      paidCount: ((purs as { amount_cents: number }[]) || []).length,
    });
  }

  useEffect(() => {
    if (profile?.is_admin) loadAll();
  }, [profile]);

  if (authLoading) {
    return <Container className="py-20"><div className="nk-card h-64 animate-pulse bg-rose-100/50" /></Container>;
  }

  if (!profile?.is_admin) {
    return (
      <Container className="py-20 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-700 text-ink-900">Admin only</h1>
        <p className="text-ink-500 mt-2">You need admin access to view this page.</p>
        <Link href="/" className="nk-btn-primary mt-6">Back home</Link>
      </Container>
    );
  }

  async function deletePattern(id: string) {
    if (!confirm('Delete this pattern? This cannot be undone.')) return;
    await supabase.from('patterns').delete().eq('id', id);
    loadAll();
  }

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article? This cannot be undone.')) return;
    await supabase.from('articles').delete().eq('id', id);
    loadAll();
  }

  async function toggleCommentHidden(c: Comment) {
    await supabase.from('comments').update({ is_hidden: !c.is_hidden }).eq('id', c.id);
    loadAll();
  }

  async function deleteComment(id: string) {
    await supabase.from('comments').delete().eq('id', id);
    loadAll();
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-rose-100 via-cream-50 to-lavender-100 border-b border-rose-100">
        <Container className="py-8 flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8 text-rose-500" />
          <div>
            <h1 className="text-2xl font-700 text-ink-900">Creator Dashboard</h1>
            <p className="text-ink-500 text-sm">Manage your patterns, articles, and community.</p>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {([
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'patterns', label: 'Patterns', icon: Yarn },
            { id: 'articles', label: 'Articles', icon: BookIcon },
            { id: 'comments', label: 'Comments', icon: MessageCircle },
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

        {tab === 'overview' && (
          <div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Eye} label="Total views" value={stats.views.toLocaleString()} color="rose" />
              <StatCard icon={DollarSign} label="Sales revenue" value={formatPrice(stats.sales)} color="sage" />
              <StatCard icon={Heart} label="Total favorites" value={stats.favorites.toLocaleString()} color="lavender" />
              <StatCard icon={ShoppingBag} label="Paid unlocks" value={stats.paidCount.toLocaleString()} color="rose" />
            </div>
            <SectionHeading title="Top patterns" subtitle="By views." />
            <div className="space-y-3">
              {[...patterns].sort((a, b) => b.views - a.views).slice(0, 5).map((p) => (
                <div key={p.id} className="nk-card p-4 flex items-center gap-4">
                  <span className="h-12 w-12 rounded-2xl bg-rose-100 grid place-items-center text-2xl">🧶</span>
                  <div className="flex-1">
                    <p className="font-display font-600 text-ink-900">{p.title}</p>
                    <p className="text-sm text-ink-400">{p.is_free ? 'Free' : formatPrice(p.price_cents)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-ink-500"><Eye className="h-4 w-4" /> {p.views}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'patterns' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <SectionHeading title="Patterns" />
              <button onClick={() => { setEditing(null); setShowPatternForm(true); }} className="nk-btn-primary">
                <Plus className="h-4 w-4" /> New pattern
              </button>
            </div>
            <div className="space-y-3">
              {patterns.map((p) => (
                <div key={p.id} className="nk-card p-4 flex items-center gap-4 flex-wrap">
                  {p.thumbnail_url && <img src={p.thumbnail_url} alt="" className="h-12 w-12 rounded-2xl object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-600 text-ink-900 truncate">{p.title}</p>
                    <p className="text-sm text-ink-400">{p.category?.name} · {p.difficulty} · {p.is_free ? 'Free' : formatPrice(p.price_cents)} · {p.views} views</p>
                  </div>
                  <button onClick={() => { setEditing(p); setShowPatternForm(true); }} className="nk-btn-ghost"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deletePattern(p.id)} className="nk-btn-ghost text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {patterns.length === 0 && <p className="text-ink-400 text-center py-8">No patterns yet.</p>}
            </div>
          </div>
        )}

        {tab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <SectionHeading title="Articles" />
              <button onClick={() => { setEditArticle(null); setShowArticleForm(true); }} className="nk-btn-primary">
                <Plus className="h-4 w-4" /> New article
              </button>
            </div>
            <div className="space-y-3">
              {articles.map((a) => (
                <div key={a.id} className="nk-card p-4 flex items-center gap-4 flex-wrap">
                  {a.cover_image_url && <img src={a.cover_image_url} alt="" className="h-12 w-12 rounded-2xl object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-600 text-ink-900 truncate">{a.title}</p>
                    <p className="text-sm text-ink-400">{a.tags.join(', ') || 'No tags'} · {a.views} views · {formatDate(a.created_at)}</p>
                  </div>
                  <button onClick={() => { setEditArticle(a); setShowArticleForm(true); }} className="nk-btn-ghost"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => deleteArticle(a.id)} className="nk-btn-ghost text-rose-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              {articles.length === 0 && <p className="text-ink-400 text-center py-8">No articles yet.</p>}
            </div>
          </div>
        )}

        {tab === 'comments' && (
          <div>
            <SectionHeading title="Moderate comments" subtitle="Hide or remove inappropriate comments." />
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className={`nk-card p-4 ${c.is_hidden ? 'opacity-60' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-600 text-ink-900 text-sm">{c.profile?.display_name || 'Anon'}</span>
                      <span className="text-xs text-ink-400">{formatDate(c.created_at)}</span>
                      {c.is_hidden && <span className="nk-chip bg-rose-100 text-rose-600">Hidden</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleCommentHidden(c)} className="nk-btn-ghost text-xs">
                        {c.is_hidden ? 'Show' : 'Hide'}
                      </button>
                      <button onClick={() => deleteComment(c.id)} className="nk-btn-ghost text-rose-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <p className="text-ink-700 text-sm">{c.body}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-ink-400 text-center py-8">No comments yet.</p>}
            </div>
          </div>
        )}
      </Container>

      {showPatternForm && (
        <PatternForm
          pattern={editing}
          categories={categories}
          onClose={() => setShowPatternForm(false)}
          onSaved={() => { setShowPatternForm(false); loadAll(); }}
        />
      )}
      {showArticleForm && (
        <ArticleForm
          article={editArticle}
          categories={categories}
          onClose={() => setShowArticleForm(false)}
          onSaved={() => { setShowArticleForm(false); loadAll(); }}
        />
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    rose: 'from-rose-100 to-rose-200 text-rose-600',
    sage: 'from-sage-100 to-sage-200 text-sage-500',
    lavender: 'from-lavender-100 to-lavender-200 text-lavender-500',
  };
  return (
    <div className="nk-card p-5">
      <span className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${colors[color]} grid place-items-center`}>
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-2xl font-700 text-ink-900">{value}</p>
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  );
}

function PatternForm({ pattern, categories, onClose, onSaved }: {
  pattern: Pattern | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: pattern?.title || '',
    description: pattern?.description || '',
    category_id: pattern?.category_id || categories[0]?.id || '',
    difficulty: pattern?.difficulty || 'beginner',
    is_free: pattern?.is_free ?? true,
    price_cents: pattern?.price_cents || 0,
    thumbnail_url: pattern?.thumbnail_url || '',
    gallery_urls: pattern?.gallery_urls.join(', ') || '',
    video_url: pattern?.video_url || '',
    instructions: pattern?.instructions || '',
    pdf_url: pattern?.pdf_url || '',
    materials: pattern?.materials.map((m) => `${m.name}|${m.qty}`).join('\n') || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const materials = form.materials
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, qty] = line.split('|');
        return { name: (name || '').trim(), qty: (qty || '').trim() };
      });
    const gallery = form.gallery_urls.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = {
      title: form.title,
      slug: pattern?.slug || slugify(form.title),
      description: form.description,
      category_id: form.category_id || null,
      difficulty: form.difficulty,
      is_free: form.is_free,
      price_cents: form.is_free ? 0 : Number(form.price_cents) || 0,
      thumbnail_url: form.thumbnail_url || null,
      gallery_urls: gallery,
      video_url: form.video_url || null,
      materials,
      instructions: form.instructions,
      pdf_url: form.pdf_url || null,
    };
    const { error } = pattern
      ? await supabase.from('patterns').update(payload).eq('id', pattern.id)
      : await supabase.from('patterns').insert(payload);
    setSaving(false);
    if (error) { setError(error.message); return; }
    onSaved();
  }

  return (
    <Modal title={pattern ? 'Edit pattern' : 'New pattern'} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Field label="Title"><input className="nk-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Description"><textarea className="nk-input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <select className="nk-input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select className="nk-input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'beginner' | 'easy' | 'intermediate' | 'advanced' })}>
              <option value="beginner">Beginner</option>
              <option value="easy">Easy</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-600 text-ink-700">
            <input type="checkbox" checked={form.is_free} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} className="accent-rose-500 h-4 w-4" />
            Free pattern
          </label>
          {!form.is_free && (
            <Field label="Price (cents)">
              <input type="number" className="nk-input w-32" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })} />
            </Field>
          )}
        </div>
        <Field label="Thumbnail URL"><input className="nk-input" value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></Field>
        <Field label="Gallery URLs (comma-separated)"><input className="nk-input" value={form.gallery_urls} onChange={(e) => setForm({ ...form, gallery_urls: e.target.value })} /></Field>
        <Field label="Video URL (YouTube/Vimeo)"><input className="nk-input" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} /></Field>
        <Field label="Materials (one per line, format: Name|Quantity)"><textarea className="nk-input resize-none font-mono text-sm" rows={4} value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} /></Field>
        <Field label="Written instructions"><textarea className="nk-input resize-none" rows={4} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} /></Field>
        <Field label="PDF URL"><input className="nk-input" value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} /></Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="nk-btn-primary disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save pattern'}</button>
          <button type="button" onClick={onClose} className="nk-btn-ghost"><X className="h-4 w-4" /> Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function ArticleForm({ article, categories, onClose, onSaved }: {
  article: Article | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    body: article?.body || '',
    cover_image_url: article?.cover_image_url || '',
    tags: article?.tags.join(', ') || '',
    category_id: article?.category_id || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title,
      slug: article?.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      body: form.body,
      cover_image_url: form.cover_image_url || null,
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      category_id: form.category_id || null,
    };
    const { error } = article
      ? await supabase.from('articles').update(payload).eq('id', article.id)
      : await supabase.from('articles').insert(payload);
    setSaving(false);
    if (error) { setError(error.message); return; }
    onSaved();
  }

  return (
    <Modal title={article ? 'Edit article' : 'New article'} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Field label="Title"><input className="nk-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></Field>
        <Field label="Excerpt"><textarea className="nk-input resize-none" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
        <Field label="Body (plain text, line breaks ok)"><textarea className="nk-input resize-none" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
        <Field label="Cover image URL"><input className="nk-input" value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} /></Field>
        <Field label="Tags (comma-separated)"><input className="nk-input" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
        <Field label="Category (optional)">
          <select className="nk-input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="nk-btn-primary disabled:opacity-50"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save article'}</button>
          <button type="button" onClick={onClose} className="nk-btn-ghost"><X className="h-4 w-4" /> Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto bg-ink-900/30 backdrop-blur-sm">
      <div className="nk-card w-full max-w-2xl my-8 p-6 animate-pop-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-700 text-ink-900">{title}</h2>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full hover:bg-rose-100"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-600 text-ink-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// Small inline icon components to avoid extra imports
function Yarn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18" /><path d="M3 12a9 9 0 0 0 18 0" />
    </svg>
  );
}
function BookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function ShoppingBag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
