import { Heart, Sparkles, Cat, Scissors, Mail } from 'lucide-react';
import { Container, SectionHeading, StitchDivider } from '@/components/ui/Brand';
import { Link } from '@/components/ui/Link';

export function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-100 via-cream-50 to-lavender-100">
        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-rose-200/40 blur-3xl animate-float-soft" />
        <Container className="relative py-16 sm:py-24 text-center">
          <span className="nk-chip bg-white/80 text-rose-600 shadow-soft mb-5">
            <Sparkles className="h-3.5 w-3.5" /> Our story
          </span>
          <h1 className="text-4xl sm:text-5xl font-700 text-ink-900 max-w-2xl mx-auto leading-tight">
            A cozy corner for everyone who <span className="text-rose-500">loves to knot</span>
          </h1>
          <p className="mt-5 text-lg text-ink-500 max-w-xl mx-auto">
            NekoKnots began with one crocheter, one cat, and an overflowing basket of yarn.
            We wanted a place to share patterns that felt warm, welcoming, and a little bit fluffy.
          </p>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Heart, title: 'Made with love', text: 'Every pattern is tested, photographed, and written with care so you can crochet with confidence.' },
            { icon: Cat, title: 'Community first', text: 'Comments, favorites, and shared projects make NekoKnots a place to belong, not just browse.' },
            { icon: Scissors, title: 'From beginner to pro', text: 'Whether it is your first magic ring or your fiftieth cardigan, there is a pattern here for you.' },
          ].map((f) => (
            <div key={f.title} className="nk-card p-6 text-center">
              <span className="h-14 w-14 mx-auto rounded-3xl bg-gradient-to-br from-rose-100 to-lavender-100 grid place-items-center">
                <f.icon className="h-7 w-7 text-rose-500" />
              </span>
              <h3 className="mt-4 font-display font-600 text-xl text-ink-900">{f.title}</h3>
              <p className="mt-2 text-ink-500">{f.text}</p>
            </div>
          ))}
        </div>
      </Container>

      <StitchDivider className="nk-section text-rose-200" />

      <Container className="py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="rounded-5xl overflow-hidden shadow-fluffy border-4 border-white">
            <img
              src="https://images.pexels.com/photos/4792059/pexels-photo-4792059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Crochet hooks and yarn"
              className="w-full h-96 object-cover"
            />
          </div>
          <div>
            <SectionHeading eyebrow="The maker" title="Hi, I'm the hands behind NekoKnots" />
            <p className="text-ink-500 leading-relaxed mb-4">
              I started crocheting as a way to unwind after long days, and it quickly
              became the coziest part of my routine. What began as one amigurumi cat
              turned into a whole library of patterns I wanted to share.
            </p>
            <p className="text-ink-500 leading-relaxed mb-6">
              NekoKnots is my way of building a warm, encouraging space for makers —
              with clear instructions, gentle video tutorials, and a community that
              cheers you on stitch by stitch.
            </p>
            <div className="flex gap-3">
              <Link href="/patterns" className="nk-btn-primary">Explore patterns</Link>
              <a href="mailto:hello@nekoknots.com" className="nk-btn-ghost">
                <Mail className="h-4 w-4" /> Say hello
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
