import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, MessageCircle, Send, Tag } from 'lucide-react';
import { supabase, type Article, type Comment } from '@/lib/supabase';
import { Container, StitchDivider } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useAuth } from '@/context/AuthContext';
import { formatDate, timeAgo } from '@/lib/utils';

export function ArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [favState, setFavState] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('articles')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      const a = data as Article | null;
      setArticle(a);
      setLoading(false);
      if (a) {
        await supabase.rpc('increment_article_views', { p_article_id: a.id });
        const { data: cmts } = await supabase
          .from('comments')
          .select('*, profile:profiles(*)')
          .eq('article_id', a.id)
          .order('created_at', { ascending: false });
        setComments((cmts as Comment[]) || []);
        if (user) {
          const { data: fav } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('article_id', a.id)
            .maybeSingle();
          setFavState(!!fav);
        }
      }
    })();
  }, [slug, user]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !commentText.trim()) return;
    setCommentError(null);
    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: user.id, article_id: article!.id, body: commentText.trim() })
      .select('*, profile:profiles(*)')
      .single();
    if (error) {
      setCommentError('Could not post your comment. Try again?');
      return;
    }
    setComments((c) => [data as Comment, ...c]);
    setCommentText('');
  }

  if (loading) {
    return <Container className="py-20"><div className="nk-card h-96 animate-pulse bg-rose-100/50" /></Container>;
  }

  if (!article) {
    return (
      <Container className="py-20 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h1 className="text-2xl font-700 text-ink-900">Article not found</h1>
        <Link href="/blog" className="nk-btn-primary mt-6"><ArrowLeft className="h-4 w-4" /> Back to blog</Link>
      </Container>
    );
  }

  return (
    <div>
      <Container className="py-5">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-rose-600">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>
      </Container>

      <article className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((t) => (
            <span key={t} className="nk-chip bg-lavender-100 text-lavender-500">
              <Tag className="h-3 w-3" /> {t}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl font-700 text-ink-900 leading-tight">{article.title}</h1>
        {article.excerpt && <p className="mt-4 text-lg text-ink-500">{article.excerpt}</p>}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-ink-400">
            <span>{formatDate(article.created_at)}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {article.views}</span>
          </div>
          <FavoriteButton articleId={article.id} favorited={favState} onToggle={setFavState} />
        </div>

        {article.cover_image_url && (
          <div className="mt-6 rounded-5xl overflow-hidden shadow-fluffy border-4 border-white">
            <img src={article.cover_image_url} alt={article.title} className="w-full h-72 sm:h-96 object-cover" />
          </div>
        )}

        <StitchDivider className="my-8 text-rose-200" />

        <div className="prose prose-lg max-w-none">
          {article.body.split('\n').map((para, i) => (
            para.trim() ? <p key={i} className="text-ink-700 leading-relaxed mb-4">{para}</p> : <br key={i} />
          ))}
        </div>

        <StitchDivider className="my-10 text-rose-200" />

        {/* Comments */}
        <section>
          <h2 className="font-display font-700 text-2xl text-ink-900 mb-5 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-rose-500" /> Comments ({comments.length})
          </h2>
          {user ? (
            <form onSubmit={submitComment} className="nk-card p-4 mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="nk-input resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                {commentError && <p className="text-sm text-rose-600">{commentError}</p>}
                <button type="submit" disabled={!commentText.trim()} className="nk-btn-primary ml-auto disabled:opacity-50">
                  <Send className="h-4 w-4" /> Post
                </button>
              </div>
            </form>
          ) : (
            <div className="nk-card p-5 mb-6 text-center text-ink-500">
              <Link href="/login" className="text-rose-600 font-600">Log in</Link> to comment.
            </div>
          )}
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="nk-card p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-9 w-9 rounded-full bg-gradient-to-br from-lavender-200 to-rose-200 grid place-items-center font-display font-600 text-lavender-500">
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
              <p className="text-ink-400 text-center py-6">No comments yet.</p>
            )}
          </div>
        </section>
      </article>
      <div className="h-16" />
    </div>
  );
}
