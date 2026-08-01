import { AuthProvider } from '@/context/AuthContext';
import { useRouter, matchRoute } from '@/lib/router';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';
import { HomePage } from '@/pages/HomePage';
import { PatternLibraryPage } from '@/pages/PatternLibraryPage';
import { PatternPage } from '@/pages/PatternPage';
import { BlogPage } from '@/pages/BlogPage';
import { ArticlePage } from '@/pages/ArticlePage';
import { AboutPage } from '@/pages/AboutPage';
import { AuthPage } from '@/pages/AuthPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function Routes() {
  const { route } = useRouter();
  const { path, query } = route;

  // Auth pages render without navbar/footer
  if (path === '/login') return <AuthPage mode="login" />;
  if (path === '/signup') return <AuthPage mode="signup" />;

  let page: React.ReactNode;

  if (path === '/') page = <HomePage />;
  else if (path === '/patterns') page = <PatternLibraryPage query={query} />;
  else {
    const pm = matchRoute('/patterns/:slug', path);
    if (pm.match) { page = <PatternPage slug={pm.params.slug} />; }
  }
  if (page === undefined) {
    if (path === '/blog') page = <BlogPage />;
    else {
      const am = matchRoute('/blog/:slug', path);
      if (am.match) page = <ArticlePage slug={am.params.slug} />;
    }
  }
  if (page === undefined) {
    if (path === '/about') page = <AboutPage />;
    else if (path === '/profile') page = <ProfilePage />;
    else if (path === '/admin') page = <AdminPage />;
    else if (path === '/checkout') page = <CheckoutPage query={query} />;
    else { page = <NotFoundPage />; }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{page}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}
