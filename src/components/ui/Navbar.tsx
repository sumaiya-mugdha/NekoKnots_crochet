import { useState } from 'react';
import { Menu, X, Heart, Search, User, LayoutDashboard, LogOut } from 'lucide-react';
import { Logo } from './Brand';
import { Link } from './Link';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { label: 'Patterns', href: '/patterns' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-md border-b border-rose-100">
      <nav className="nk-section flex h-16 items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 rounded-full font-display font-500 text-ink-700 hover:bg-rose-100 hover:text-rose-600 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/patterns" className="nk-btn-ghost" aria-label="Search patterns">
            <Search className="h-4 w-4" />
          </Link>
          {user ? (
            <>
              <Link href="/profile" className="nk-btn-ghost">
                <User className="h-4 w-4" />
                <span className="max-w-[100px] truncate">{profile?.display_name || 'Profile'}</span>
              </Link>
              {profile?.is_admin && (
                <Link href="/admin" className="nk-btn-ghost">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              )}
              <button onClick={signOut} className="nk-btn-ghost" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nk-btn-ghost">
                Log in
              </Link>
              <Link href="/signup" className="nk-btn-primary">
                <Heart className="h-4 w-4" fill="white" />
                Join
              </Link>
            </>
          )}
        </div>
        <button
          className="md:hidden p-2 rounded-full hover:bg-rose-100"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-rose-100 bg-cream-50">
          <div className="nk-section py-4 flex flex-col gap-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-2xl font-display font-500 text-ink-700 hover:bg-rose-100"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="nk-btn-ghost justify-start">
                  <User className="h-4 w-4" /> Profile
                </Link>
                {profile?.is_admin && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="nk-btn-ghost justify-start">
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }}
                  className="nk-btn-ghost justify-start"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setOpen(false)} className="nk-btn-ghost flex-1">
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="nk-btn-primary flex-1">
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
