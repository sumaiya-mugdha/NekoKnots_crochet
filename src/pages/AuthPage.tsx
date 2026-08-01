import { useState } from 'react';
import { Heart, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Container } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { navigate } from '@/lib/router';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (isSignup) {
      const { error } = await signUp(email, password, displayName || email.split('@')[0]);
      if (error) setError(error);
      else navigate('/profile');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/profile');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      {/* Left visual panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-rose-200 via-rose-100 to-lavender-100 p-12 flex-col justify-center">
        <div className="absolute -top-10 -left-10 h-64 w-64 rounded-full bg-rose-300/30 blur-3xl animate-float-soft" />
        <div className="absolute -bottom-10 -right-10 h-72 w-72 rounded-full bg-lavender-300/30 blur-3xl animate-float-soft" style={{ animationDelay: '2s' }} />
        <div className="relative">
          <span className="text-6xl mb-6 block">🧶</span>
          <h2 className="text-4xl font-700 text-ink-900 leading-tight">
            {isSignup ? 'Join the cozy corner of the crochet world' : 'Welcome back to your cozy corner'}
          </h2>
          <p className="mt-4 text-ink-500 text-lg max-w-sm">
            {isSignup
              ? 'Save your favorite patterns, unlock premium designs, and join the conversation.'
              : 'Pick up right where you left off — your saved patterns and projects are waiting.'}
          </p>
          <div className="mt-8 flex items-center gap-4 text-sm text-ink-500">
            <Heart className="h-5 w-5 text-rose-400" fill="currentColor" />
            <span>Loved by crocheters everywhere</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <Container className="max-w-md">
          <div className="nk-card p-8">
            <h1 className="text-3xl font-700 text-ink-900 mb-1">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-ink-500 mb-6">
              {isSignup ? 'It only takes a moment.' : 'Log in to continue knotting.'}
            </p>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-sm font-600 text-ink-700 mb-1.5">Display name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your cozy name"
                      className="nk-input pl-12"
                      required
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-600 text-ink-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@cozy.com"
                    className="nk-input pl-12"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-600 text-ink-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="nk-input pl-12"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="nk-btn-primary w-full py-3 disabled:opacity-50">
                {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-500">
              {isSignup ? (
                <>Already have an account? <Link href="/login" className="text-rose-600 font-600">Log in</Link></>
              ) : (
                <>New here? <Link href="/signup" className="text-rose-600 font-600">Create an account</Link></>
              )}
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}
