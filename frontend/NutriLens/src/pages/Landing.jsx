import { useNavigate } from 'react-router-dom';
import logo from '../assets/Nurilens Logo Colored.png';
// 👇 Add your own image to src/assets/ and update this import
import heroImage from '../assets/Gemini_Generated_Image_pqm1cwpqm1cwpqm1.png';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-manrope overflow-x-hidden">

      {/* ── Floating ambient blobs ───────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-96 h-96 bg-primary/5 rounded-full -top-20 -right-20 blur-3xl" />
        <div className="absolute w-72 h-72 bg-secondary/5 rounded-full bottom-40 -left-16 blur-3xl" />
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="relative z-10 pt-8 pb-24 px-container-margin max-w-2xl mx-auto space-y-xl">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="flex flex-col items-center text-center gap-lg pt-4">

          {/* Badge */}
          <span className="inline-flex items-center gap-xs px-md py-1.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            AI-Powered Nutrition
          </span>

          {/* Headline */}
          <div className="space-y-sm">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-on-background leading-tight tracking-tight">
              Scan. Analyze.{' '}
              <span className="text-primary">Eat Healthier.</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-sm mx-auto">
              Understand exactly what's in your food with a single snap. Your high-tech health companion for mindful eating.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => navigate('/scanner')}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-sm shadow-[0_8px_24px_rgba(53,37,205,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
            Get Started
          </button>

          {/* Hero image */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/20 mt-sm">
            <img
              src={heroImage}
              alt="Scanning a nutrition label with NutriLens"
              className="w-full aspect-video object-cover brightness-105"
              onError={(e) => {
                // Fallback if image not found yet
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('bg-surface-container-low', 'min-h-[200px]', 'flex', 'items-center', 'justify-center');
                e.target.parentElement.innerHTML = `
                  <div class="flex flex-col items-center gap-sm p-xl text-on-surface-variant">
                    <span class="material-symbols-outlined text-5xl">add_photo_alternate</span>
                    <p class="font-label-md">Add your hero image to src/assets/hero-scan.png</p>
                  </div>`;
              }}
            />
            {/* Scan line overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 border-2 border-primary/40 rounded-2xl flex items-center justify-center">
                <div className="w-full h-px bg-primary/70 shadow-[0_0_12px_rgba(53,37,205,0.6)]" />
              </div>
            </div>
            {/* Health score glass card */}
            <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md p-sm rounded-2xl shadow-lg border border-white/40 space-y-xs">
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-green-500 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-label-md text-on-surface text-xs">Optimal Health Score</span>
              </div>
              <div className="h-1.5 w-28 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[85%] rounded-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Bento Grid ───────────────────────────────────── */}
        <section className="space-y-md">

          {/* Row 1: Instant Label Recognition (wide) + Deep Analytics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">

            {/* Card 1 — Instant Label Recognition (spans 2 cols on sm+) */}
            <div className="sm:col-span-2 bg-surface-container-lowest rounded-3xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between gap-md">
                <div className="space-y-sm">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">center_focus_strong</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Instant Label Recognition</h3>
                  <p className="text-on-surface-variant text-body-md">
                    Our advanced computer vision identifies ingredients and hidden additives faster than you can read them.
                  </p>
                </div>
                <div className="flex items-center gap-xs">
                  <div className="flex -space-x-2">
                    {['bg-primary/20', 'bg-primary/40', 'bg-primary/60'].map((c, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${c} flex items-center justify-center`} />
                    ))}
                  </div>
                  <span className="font-label-sm text-on-surface-variant ml-sm">+12k scans today</span>
                </div>
              </div>
              {/* Ambient glow */}
              <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            </div>

            {/* Card 2 — Deep Analytics (indigo filled) */}
            <div className="bg-primary rounded-3xl p-lg shadow-lg text-on-primary flex flex-col justify-between">
              <div className="space-y-sm">
                <span className="material-symbols-outlined text-3xl">insights</span>
                <h3 className="font-headline-sm text-headline-sm">Deep Analytics</h3>
                <p className="opacity-90 text-body-md">
                  Track macros, micros, and glycemic impact effortlessly over time.
                </p>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 h-10 mt-md">
                {[50, 75, 100, 65, 50, 85, 60].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${h}%`,
                      background: i === 2 || i === 5 ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.3)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Personalized Alerts + Smart Substitutions (wide) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">

            {/* Card 3 — Personalized Alerts */}
            <div className="bg-surface-container-lowest rounded-3xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 flex flex-col gap-md">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">health_and_safety</span>
              </div>
              <div className="space-y-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Personalized Alerts</h3>
                <p className="text-on-surface-variant text-body-md">
                  Flags allergens and high-sodium warnings based on your profile.
                </p>
              </div>
              {/* Alert chips */}
              <div className="flex flex-wrap gap-xs mt-auto">
                {['Nut-Free', 'Low Sugar', 'Gluten-Free'].map((tag) => (
                  <span key={tag} className="px-sm py-1 bg-green-50 text-green-700 rounded-full font-label-sm text-label-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 4 — Smart Substitutions (spans 2 cols on sm+) */}
            <div className="sm:col-span-2 bg-surface-container rounded-3xl p-lg border border-outline-variant/20 flex flex-col gap-md">
              <div className="space-y-xs">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Smart Substitutions</h3>
                <p className="text-on-surface-variant text-body-md">
                  Scanned something unhealthy? We suggest better alternatives instantly.
                </p>
                <button
                  onClick={() => navigate('/scanner')}
                  className="text-primary font-label-md flex items-center gap-xs hover:gap-sm transition-all"
                >
                  Try it now
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              {/* Substitution example cards */}
              <div className="grid grid-cols-2 gap-sm mt-auto">
                <div className="bg-white rounded-2xl p-sm shadow-sm text-center border border-outline-variant/10">
                  <span className="font-label-sm text-on-surface-variant block mb-xs">Try this</span>
                  <span className="font-bold text-green-600 text-label-md">Almond Milk</span>
                </div>
                <div className="bg-white rounded-2xl p-sm shadow-sm text-center border border-outline-variant/10">
                  <span className="font-label-sm text-on-surface-variant block mb-xs">Instead of</span>
                  <span className="font-bold text-error text-label-md">Whole Milk</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tagline strip ────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-lg text-on-primary text-center shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10 space-y-sm">
            <h2 className="text-2xl font-extrabold tracking-tight">Empowering Smarter Food Choices</h2>
            <p className="opacity-90 text-body-md">Your nutrition, your rules — NutriLens makes understanding food simple.</p>
            <button
              onClick={() => navigate('/scanner')}
              className="mt-sm inline-flex items-center gap-sm bg-white text-primary px-lg py-3 rounded-xl font-label-md shadow active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
              Start Scanning
            </button>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────── */}
        <footer className="border-t border-outline-variant/30 pt-lg flex flex-col sm:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-sm">
            <img src={logo} alt="NutriLens" className="w-8 h-8" />
            <div>
              <p className="font-bold text-primary text-label-md tracking-tight">NutriLens</p>
              <p className="text-label-sm text-on-surface-variant">© {new Date().getFullYear()} NutriLens AI. All rights reserved.</p>
            </div>
          </div>
          <div className="flex gap-lg">
            {['Privacy', 'Terms', 'Support'].map((link) => (
              <a key={link} href="#" className="text-on-surface-variant hover:text-primary font-label-md transition-colors">
                {link}
              </a>
            ))}
          </div>
        </footer>

      </main>
    </div>
  );
}