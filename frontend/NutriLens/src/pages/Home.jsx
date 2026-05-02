import { useNavigate } from "react-router-dom";
import logo from "../assets/Nurilens Logo Colored.png";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-manrope overflow-hidden relative flex flex-col items-center justify-center px-container-margin">

      {/* Ambient background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero section */}
      <section className="relative z-10 flex flex-col items-center text-center space-y-lg max-w-md w-full py-xl">

        {/* Logo with glow ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl scale-125" />
          <img src={logo} alt="NutriLens" className="relative w-28 h-28 rounded-full shadow-[0_8px_32px_rgba(53,37,205,0.2)] hover:scale-105 transition-transform duration-300" />
        </div>

        {/* Headline */}
        <div className="space-y-sm">
          <h1 className="font-manrope font-extrabold text-[40px] leading-tight tracking-tight bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: "200% auto" }}>
            NutriLens
          </h1>
          <p className="text-body-lg text-on-surface leading-relaxed">
  Your AI-powered food label scanner — know what you eat in seconds.
</p>
          <p className="text-body-md text-on-surface-variant leading-snug">
  Detect hidden ingredients, get health warnings, and personalize choices based on your preferences.
</p>
        </div>

        {/* Feature highlights — bento grid */}
        <div className="grid grid-cols-2 gap-sm w-full text-left">
          <div className="col-span-2 bg-secondary-fixed/20 p-md rounded-xl border border-secondary-fixed/40">
            <div className="flex items-start gap-md">
              <div className="bg-white p-sm rounded-lg shadow-sm shrink-0">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>camera</span>
              </div>
              <div>
                <h4 className="text-label-md text-on-surface">AI Ingredient Scanning</h4>

                <p className="text-label-sm text-on-surface-variant mt-xs">Instant analysis using cutting-edge vision models.</p>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary mb-xs">cards</span>
            <h4 className="text-label-md text-on-surface">Simplification</h4>
            <p className="text-label-sm text-on-surface-variant mt-xs">Complex data, actionable insights.</p>
          </div>
          <div className="bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary mb-xs">health_and_safety</span>
            <h4 className="text-label-md text-on-surface">Health First</h4>
            <p className="text-label-sm text-on-surface-variant mt-xs">Prioritizing your long-term wellness.</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-sm w-full">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 h-14 bg-primary text-on-primary rounded-xl font-headline-sm shadow-[0_8px_24px_rgba(53,37,205,0.25)] hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex-1 h-14 border-2 border-primary text-primary rounded-xl font-headline-sm hover:bg-primary/5 active:scale-[0.98] transition-all"
          >
            Create Account
          </button>
        </div>

        {/* Footer note */}
        <p className="text-label-sm text-on-surface-variant opacity-60">Free to use · No credit card required</p>
      </section>
    </div>
  );
}
