import { type ReactNode } from 'react';
import { Link } from './Link';
import { Heart } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const text = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <span
        className={`${dim} rounded-2xl bg-gradient-to-br from-rose-400 to-lavender-300 grid place-items-center shadow-soft group-hover:scale-105 transition-transform`}
      >
        <Heart className="h-1/2 w-1/2 text-white" fill="white" />
      </span>
      <span className={`font-display font-700 ${text} text-ink-900 tracking-tight`}>
        Neko<span className="text-rose-500">Knots</span>
      </span>
    </Link>
  );
}

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`nk-section ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`${center ? 'text-center mx-auto max-w-2xl' : ''} mb-8`}>
      {eyebrow && (
        <span className="nk-chip bg-rose-100 text-rose-600 mb-3">{eyebrow}</span>
      )}
      <h2 className="text-3xl sm:text-4xl font-700 text-ink-900 mb-2">{title}</h2>
      {subtitle && <p className="text-ink-500 text-lg">{subtitle}</p>}
    </div>
  );
}

export function StitchDivider({ className = '' }: { className?: string }) {
  return <div className={`nk-stitch-divider text-rose-300 ${className}`} />;
}
