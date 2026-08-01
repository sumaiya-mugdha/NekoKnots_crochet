import { Home } from 'lucide-react';
import { Container } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';

export function NotFoundPage() {
  return (
    <Container className="py-24 text-center">
      <div className="text-7xl mb-4">🐱</div>
      <h1 className="text-4xl font-700 text-ink-900">Page not found</h1>
      <p className="text-ink-500 mt-2 max-w-sm mx-auto">
        This page wandered off like a ball of yarn. Let's get you back home.
      </p>
      <Link href="/" className="nk-btn-primary mt-6">
        <Home className="h-4 w-4" /> Back home
      </Link>
    </Container>
  );
}
