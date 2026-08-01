import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Pattern, type Purchase } from '@/lib/supabase';
import { Container } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';
import { formatPrice } from '@/lib/utils';

export function CheckoutPage({ query }: { query: URLSearchParams }) {
  const { user } = useAuth();
  const patternId = query.get('pattern_id');
  const status = query.get('status'); // 'success' | 'cancel'
  const paymentIntent = query.get('payment_intent');
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    (async () => {
      if (patternId) {
        const { data } = await supabase
          .from('patterns')
          .select('*, category:categories(*)')
          .eq('id', patternId)
          .maybeSingle();
        setPattern(data as Pattern | null);
      }
      setLoading(false);
    })();
  }, [patternId]);

  // Record a successful purchase
  useEffect(() => {
    if (!user || !pattern || status !== 'success' || recording) return;
    setRecording(true);
    (async () => {
      // Check if already recorded
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('pattern_id', pattern.id)
        .eq('status', 'paid')
        .maybeSingle();
      if (!existing) {
        const { data } = await supabase
          .from('purchases')
          .insert({
            user_id: user.id,
            pattern_id: pattern.id,
            amount_cents: pattern.price_cents,
            status: 'paid',
            stripe_payment_intent_id: paymentIntent || null,
          })
          .select('*')
          .single();
        setPurchase(data as Purchase | null);
      } else {
        setPurchase(existing as Purchase | null);
      }
    })();
  }, [user, pattern, status, paymentIntent, recording]);

  if (loading) {
    return (
      <Container className="py-20 grid place-items-center">
        <Loader2 className="h-8 w-8 text-rose-400 animate-spin" />
      </Container>
    );
  }

  if (status === 'cancel') {
    return (
      <Container className="py-20 max-w-lg text-center">
        <div className="nk-card p-10">
          <XCircle className="h-14 w-14 text-rose-400 mx-auto mb-4" />
          <h1 className="text-2xl font-700 text-ink-900">Checkout cancelled</h1>
          <p className="text-ink-500 mt-2">No worries — your card wasn't charged. You can try again anytime.</p>
          {pattern && (
            <Link href={`/patterns/${pattern.slug}`} className="nk-btn-primary mt-6">
              Back to {pattern.title}
            </Link>
          )}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20 max-w-lg text-center">
      <div className="nk-card p-10">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-sage-100 grid place-items-center mb-5 animate-pop-in">
          <CheckCircle2 className="h-9 w-9 text-sage-500" />
        </div>
        <h1 className="text-2xl font-700 text-ink-900">Payment confirmed!</h1>
        <p className="text-ink-500 mt-2">
          {pattern
            ? `You've unlocked "${pattern.title}"${pattern.price_cents ? ` for ${formatPrice(pattern.price_cents)}` : ''}.`
            : 'Your purchase is complete.'}
        </p>
        {pattern && (
          <div className="mt-6 nk-card p-4 bg-rose-50">
            {pattern.thumbnail_url && (
              <img src={pattern.thumbnail_url} alt="" className="h-24 w-full rounded-2xl object-cover mb-3" />
            )}
            <p className="font-display font-600 text-ink-900">{pattern.title}</p>
          </div>
        )}
        <div className="mt-6 flex gap-3 justify-center">
          {pattern && (
            <Link href={`/patterns/${pattern.slug}`} className="nk-btn-primary">
              View pattern <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link href="/profile" className="nk-btn-ghost">Go to profile</Link>
        </div>
      </div>
    </Container>
  );
}
