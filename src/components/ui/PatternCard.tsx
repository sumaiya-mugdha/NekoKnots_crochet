import { Eye, Lock } from 'lucide-react';
import type { Pattern } from '@/lib/supabase';
import { Link } from '@/components/ui/Link';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { difficultyClass, formatPrice } from '@/lib/utils';

export function PatternCard({
  pattern,
  favorited = false,
}: {
  pattern: Pattern;
  favorited?: boolean;
}) {
  return (
    <div className="nk-card overflow-hidden group hover:shadow-fluffy transition-all duration-300 hover:-translate-y-1">
      <Link href={`/patterns/${pattern.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-rose-100">
          {pattern.thumbnail_url ? (
            <img
              src={pattern.thumbnail_url}
              alt={pattern.title}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full grid place-items-center bg-gradient-to-br from-rose-100 to-lavender-100">
              <span className="text-4xl">🧶</span>
            </div>
          )}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="nk-chip bg-white/90 backdrop-blur text-ink-700 shadow-soft capitalize">
              {pattern.difficulty}
            </span>
            {pattern.is_free ? (
              <span className="nk-chip bg-sage-100 text-sage-500 shadow-soft">Free</span>
            ) : (
              <span className="nk-chip bg-rose-500 text-white shadow-soft">
                <Lock className="h-3 w-3" />
                {formatPrice(pattern.price_cents)}
              </span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <FavoriteButton patternId={pattern.id} favorited={favorited} size="sm" />
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-ink-400 mb-1.5">
          {pattern.category && <span className="capitalize">{pattern.category.name}</span>}
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3 w-3" /> {pattern.views}
          </span>
        </div>
        <Link href={`/patterns/${pattern.slug}`}>
          <h3 className="font-display font-600 text-lg text-ink-900 group-hover:text-rose-600 transition-colors line-clamp-1">
            {pattern.title}
          </h3>
        </Link>
        {pattern.description && (
          <p className="text-sm text-ink-500 mt-1 line-clamp-2">{pattern.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className={`nk-chip ${difficultyClass(pattern.difficulty)} capitalize`}>
            {pattern.difficulty}
          </span>
          <Link
            href={`/patterns/${pattern.slug}`}
            className="text-sm font-display font-600 text-rose-600 hover:text-rose-700"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
