import { type MouseEvent, type ReactNode } from 'react';
import { navigate } from '@/lib/router';

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function Link({ href, children, className = '', onClick }: LinkProps) {
  const handle = (e: MouseEvent) => {
    e.preventDefault();
    if (onClick) onClick();
    navigate(href);
  };
  return (
    <a href={`#${href}`} onClick={handle} className={className}>
      {children}
    </a>
  );
}
