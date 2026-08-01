import { Heart, Instagram, Mail } from 'lucide-react';
import { Logo, StitchDivider } from './Brand';
import { Link } from './Link';

export function Footer() {
  return (
    <footer className="mt-20 bg-rose-50/60 border-t border-rose-100">
      <div className="nk-section py-12">
        <StitchDivider className="mb-10" />
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 text-ink-500 max-w-sm">
              A cozy little corner of the internet for crochet lovers. Share your
              stitches, learn new patterns, and knot with friends.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white grid place-items-center shadow-soft hover:bg-rose-100 transition"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-rose-500" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white grid place-items-center shadow-soft hover:bg-rose-100 transition"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 text-rose-500" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-display font-600 text-ink-900 mb-3">Explore</h4>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/patterns" className="hover:text-rose-600">Pattern Library</Link></li>
              <li><Link href="/blog" className="hover:text-rose-600">Blog & Articles</Link></li>
              <li><Link href="/about" className="hover:text-rose-600">About NekoKnots</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-600 text-ink-900 mb-3">Account</h4>
            <ul className="space-y-2 text-ink-500">
              <li><Link href="/login" className="hover:text-rose-600">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-rose-600">Create account</Link></li>
              <li><Link href="/profile" className="hover:text-rose-600">Your profile</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-rose-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-ink-400">
          <p>Made with <Heart className="inline h-3.5 w-3.5 text-rose-400" fill="currentColor" /> by NekoKnots</p>
          <p>&copy; {new Date().getFullYear()} NekoKnots. All stitches reserved.</p>
        </div>
      </div>
    </footer>
  );
}
