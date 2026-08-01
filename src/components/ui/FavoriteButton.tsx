import { useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { navigate } from '@/lib/router';

type Props = {
  patternId?: string;
  articleId?: string;
  favorited: boolean;
  onToggle?: (next: boolean) => void;
  size?: 'sm' | 'md';
};

export function FavoriteButton({
  patternId,
  articleId,
  favorited,
  onToggle,
  size = 'md',
}: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(favorited);

  async function toggle() {
    if (!user) {
      navigate('/login');
      return;
    }
    setBusy(true);
    if (active) {
      const col = patternId ? 'pattern_id' : 'article_id';
      const val = patternId ?? articleId;
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq(col, val);
      setActive(false);
      onToggle?.(false);
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        pattern_id: patternId ?? null,
        article_id: articleId ?? null,
      });
      setActive(true);
      onToggle?.(true);
    }
    setBusy(false);
  }

  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={active}
      className={`${dim} grid place-items-center rounded-full bg-white/90 backdrop-blur shadow-soft border border-rose-100 transition-all hover:scale-110 active:scale-90 ${
        active ? 'text-rose-500' : 'text-ink-400 hover:text-rose-400'
      }`}
    >
      <Heart
        className={`${icon} ${active ? 'animate-heart-beat' : ''}`}
        fill={active ? 'currentColor' : 'none'}
      />
    </button>
  );
}
