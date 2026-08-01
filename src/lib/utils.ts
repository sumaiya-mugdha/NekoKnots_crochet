export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-sage-100 text-sage-500',
  easy: 'bg-rose-100 text-rose-600',
  intermediate: 'bg-lavender-100 text-lavender-500',
  advanced: 'bg-amber-100 text-amber-700',
};

export function difficultyClass(level: string): string {
  return DIFFICULTY_STYLES[level] ?? 'bg-rose-100 text-rose-600';
}

export function youtubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

export function vimeoEmbed(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

export function videoEmbed(url: string | null): string | null {
  return youtubeEmbed(url) ?? vimeoEmbed(url);
}
