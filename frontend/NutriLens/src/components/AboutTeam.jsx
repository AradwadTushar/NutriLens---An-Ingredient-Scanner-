import { useEffect, useRef } from "react";
import meImg from "../assets/me.png";

// Team data
const team = [
  {
    name: "Aradwad Tushar",
    role: "Full-Stack AI Developer & Founder",
    bio: "Passionate engineer committed to dismantling deceptively packaged food labels and putting scientific chemical transparency into the hands of every consumer.",
    image: meImg,
    icon: "code",
    color: "text-primary",
    bg: "bg-primary/10",
    links: {
      github: "https://github.com/AradwadTushar",
      linkedin:
        "https://www.linkedin.com/in/tushar-aradwad-536570307?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      email: "mailto:aradwadt47@gmail.com",
    },
  },
];

// Features
const features = [
  {
    icon: "camera",
    label: "Optical Label Extraction",
    desc: "Instant OCR extraction of micro-printed ingredients and nutrition panels directly from packaging photos.",
    iconColor: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: "science",
    label: "INS & E-Number Decoding",
    desc: "Translates cryptic chemical numbers into clear clinical definitions and documented physiological risks.",
    iconColor: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: "health_and_safety",
    label: "Scientific Risk Profiling",
    desc: "Cross-checks ingredients against WHO, FDA, and FSSAI safety benchmarks to generate personalized safety scores.",
    iconColor: "text-emerald-700",
    bg: "bg-emerald-50",
  },
];

function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FadeSection({ children, delay = 0, className = "" }) {
  const ref = useFadeIn();
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SocialBtn({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 active:scale-90 transition-all border border-outline-variant/30"
    >
      {icon === "github" && (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )}
      {icon === "linkedin" && (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )}
      {icon === "email" && (
        <span className="material-symbols-outlined text-[18px]">mail</span>
      )}
    </a>
  );
}

export default function AboutTeam() {
  return (
    <div className="min-h-screen bg-surface font-manrope overflow-x-hidden pb-16">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-96 h-96 bg-primary/5 rounded-full -top-10 -left-20 blur-3xl" />
        <div className="absolute w-80 h-80 bg-secondary/5 rounded-full bottom-32 -right-16 blur-3xl" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* Hero Section */}
        <FadeSection>
          <section className="relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-12 text-white shadow-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-white/90">
              <span className="material-symbols-outlined text-[16px]">biotech</span>
              <span>About NutriLens</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Bridging the Gap Between Deceptive Labels & Real Human Health.
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-3xl">
              Understanding what you put in your body should not require a postgraduate degree in biochemistry. NutriLens was engineered to decode cryptic food additives and hidden sugars into clear, actionable health intelligence in seconds.
            </p>
          </section>
        </FadeSection>

        {/* Mission Statement Card */}
        <FadeSection delay={80}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-outline-variant/30 border-l-4 border-l-primary space-y-2">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">visibility</span>
              <span>Our Core Mission</span>
            </h2>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              We empower consumers to see through manipulative marketing claims on food packages. Whether managing diabetes, protecting children from banned synthetic dyes, or pursuing longevity, NutriLens provides unbiased, automated nutritional audits.
            </p>
          </div>
        </FadeSection>

        {/* Feature Cards Grid (3 columns on md+) */}
        <FadeSection delay={140}>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface">The NutriLens Pillars</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-xs space-y-3 hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[24px] ${f.iconColor}`}>
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-on-surface">{f.label}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* Founder / Team Member Section */}
        <FadeSection delay={180}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-outline-variant/30" />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                The Creator
              </span>
              <div className="flex-1 h-px bg-outline-variant/30" />
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-outline-variant/30 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-3 flex justify-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-primary/20 shadow-md">
                  <img
                    src={team[0].image}
                    alt={team[0].name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-9 space-y-3 text-center md:text-left">
                <div>
                  <h3 className="text-xl font-extrabold text-on-surface">{team[0].name}</h3>
                  <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary mt-1">
                    {team[0].role}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {team[0].bio}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 pt-1">
                  <SocialBtn href={team[0].links.github} icon="github" label="GitHub Profile" />
                  <SocialBtn href={team[0].links.linkedin} icon="linkedin" label="LinkedIn Profile" />
                  <SocialBtn href={team[0].links.email} icon="email" label="Send Email" />
                </div>
              </div>
            </div>
          </div>
        </FadeSection>

        {/* Footer */}
        <footer className="border-t border-outline-variant/30 pt-8 text-center text-xs text-on-surface-variant">
          <p className="font-bold text-primary">NutriLens AI</p>
          <p>© {new Date().getFullYear()} NutriLens Food Intelligence. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
