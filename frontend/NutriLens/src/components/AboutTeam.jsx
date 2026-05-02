import { useEffect, useRef } from 'react';
import meImg from '../assets/me.png';

// ── Team data — update hrefs with your real links ──────────────────────────
const team = [
  {
    name: 'Aradwad Tushar',
    role: 'Frontend / Backend Developer',
    bio: "I'm a solo developer dedicated to building helpful health tools that empower people to make better choices through technology.",
    image: meImg,
    icon: 'code',
    color: 'text-primary',
    bg: 'bg-primary/10',
    links: {
      github: 'https://github.com/AradwadTushar',       // 👈 update
      linkedin: 'https://www.linkedin.com/in/tushar-aradwad-536570307?utm_source=share_via&utm_content=profile&utm_medium=member_android', // 👈 update
      email: 'mailto:aradwadt47@gmail.com',               // 👈 update
    },
  },
];

// ── Features grid ─────────────────────────────────────────────────────────
const features = [
  {
    icon: 'camera',
    label: 'AI Ingredient Scanning',
    desc: 'Instant analysis of nutritional data using cutting-edge vision models.',
    wide: true,
    iconColor: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: 'cards',
    label: 'Simplification',
    desc: 'Breaking down complex data into actionable insights.',
    wide: false,
    iconColor: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: 'health_and_safety',
    label: 'Health First',
    desc: 'Prioritizing your long-term wellness goals.',
    wide: false,
    iconColor: 'text-green-600',
    bg: 'bg-green-50',
  },
];

// ── Fade-in on scroll hook ────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0');
          el.classList.remove('opacity-0', 'translate-y-6');
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ── Animated section wrapper ──────────────────────────────────────────────
function FadeSection({ children, delay = 0, className = '' }) {
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

// ── Social icon button ────────────────────────────────────────────────────
function SocialBtn({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary/10 active:scale-90 transition-all"
    >
      {/* GitHub & LinkedIn use SVG since Material Symbols doesn't have them */}
      {icon === 'github' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
        </svg>
      )}
      {icon === 'linkedin' && (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )}
      {icon === 'email' && (
        <span className="material-symbols-outlined text-[20px]">mail</span>
      )}
    </a>
  );
}

// ── Team member card ──────────────────────────────────────────────────────
function MemberCard({ member, index }) {
  return (
    <FadeSection delay={index * 120}>
      <div className="bg-surface-container-lowest rounded-3xl p-lg shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-outline-variant/20 flex flex-col gap-md group hover:shadow-[0_8px_32px_rgba(53,37,205,0.10)] transition-shadow">

        {/* Avatar + role badge */}
        <div className="flex items-center gap-md">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-2 ring-outline-variant/20">
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className={`absolute -bottom-1 -right-1 ${member.bg} p-1 rounded-full border-2 border-white`}>
              <span className={`material-symbols-outlined text-[14px] ${member.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {member.icon}
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface">{member.name}</h3>
            <span className={`inline-block font-label-sm text-label-sm px-sm py-0.5 rounded-full ${member.bg} ${member.color} mt-xs`}>
              {member.role}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="font-body-md text-on-surface-variant leading-relaxed text-sm">
          {member.bio}
        </p>

        {/* Social links */}
        <div className="flex items-center gap-sm pt-xs border-t border-outline-variant/20">
          <SocialBtn href={member.links.github} icon="github" label="GitHub" />
          <SocialBtn href={member.links.linkedin} icon="linkedin" label="LinkedIn" />
          <SocialBtn href={member.links.email} icon="email" label="Email" />
        </div>

      </div>
    </FadeSection>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function AboutTeam() {
  return (
    <div className="min-h-screen bg-background font-manrope overflow-x-hidden">

      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute w-80 h-80 bg-primary/5 rounded-full -top-10 -left-20 blur-3xl" />
        <div className="absolute w-64 h-64 bg-secondary/5 rounded-full bottom-32 -right-16 blur-3xl" />
      </div>

      <main className="relative z-10 pt-8 pb-24 px-container-margin max-w-2xl mx-auto space-y-xl">

        {/* ── About Hero ─────────────────────────────────────── */}
        <FadeSection>
          <section className="relative overflow-hidden rounded-3xl bg-primary p-lg text-on-primary shadow-lg">
            {/* decorative circles */}
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full" />
              <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white rounded-full" />
            </div>
            <div className="relative z-10 space-y-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-primary/80" style={{ fontVariationSettings: "'FILL' 1" }}>
                  nutrition
                </span>
                <span className="font-label-sm text-on-primary/70 uppercase tracking-wider">About NutriLens</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
                Bridging the gap between complex labels and everyday health.
              </h1>
              <p className="text-on-primary/80 font-body-md leading-relaxed">
                Understanding what you eat shouldn't require a degree in biochemistry. NutriLens decodes complicated labels and gives you clear, AI-powered health insights in seconds.
              </p>
            </div>
          </section>
        </FadeSection>

        {/* ── Mission card ──────────────────────────────────── */}
        <FadeSection delay={80}>
          <section className="bg-surface-container-lowest rounded-2xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 border-primary">
            <h2 className="font-headline-sm text-on-surface mb-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
              Our Mission
            </h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              NutriLens was built to empower every individual to make informed food decisions with confidence — whether you're tracking ingredients, watching your health, or simply curious about what's in your food.
            </p>
          </section>
        </FadeSection>

        {/* ── Features grid ─────────────────────────────────── */}
        <FadeSection delay={140}>
          <section className="space-y-md">
            <h2 className="font-headline-sm text-on-surface px-1">Why NutriLens?</h2>
            <div className="grid grid-cols-2 gap-md">
              {/* Wide card */}
              <div className="col-span-2 bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/20 shadow-sm flex items-start gap-md">
                <div className={`${features[0].bg} p-sm rounded-xl shrink-0`}>
                  <span className={`material-symbols-outlined ${features[0].iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {features[0].icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-label-md text-on-surface">{features[0].label}</h3>
                  <p className="text-label-sm text-on-surface-variant mt-xs">{features[0].desc}</p>
                </div>
              </div>
              {/* Narrow cards */}
              {features.slice(1).map((f) => (
                <div key={f.label} className="bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/20 shadow-sm flex flex-col items-center text-center gap-sm">
                  <div className={`${f.bg} p-sm rounded-xl`}>
                    <span className={`material-symbols-outlined ${f.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="font-label-md text-on-surface">{f.label}</h3>
                  <p className="text-label-sm text-on-surface-variant">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </FadeSection>

        {/* ── The Why quote ─────────────────────────────────── */}
        <FadeSection delay={160}>
          <section className="bg-surface-container rounded-2xl p-lg space-y-sm border border-outline-variant/20">
            <p className="font-label-sm text-on-surface-variant uppercase tracking-wider">The Why</p>
            <blockquote className="font-body-md text-on-surface-variant italic leading-relaxed border-l-2 border-primary pl-md">
              "I found myself standing in grocery aisles, confused by long lists of unpronounceable ingredients. NutriLens is the tool I wanted for myself — now I'm sharing it with you."
            </blockquote>
          </section>
        </FadeSection>

        {/* ── Divider ───────────────────────────────────────── */}
        <FadeSection delay={180}>
          <div className="flex items-center gap-md">
            <div className="flex-1 h-px bg-outline-variant/30" />
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">Meet the Dev</span>
            <div className="flex-1 h-px bg-outline-variant/30" />
          </div>
        </FadeSection>

        {/* ── Team section title ────────────────────────────── */}
        <FadeSection delay={200}>
          <section className="space-y-xs">
            <h2 className="font-headline-md text-on-surface">The Person behind NutriLens</h2>
            <p className="font-body-md text-on-surface-variant">
                Just one passionate developer on a mission to make nutrition information accessible and actionable for everyone.
            </p>
          </section>
        </FadeSection>

        {/* ── Team cards ────────────────────────────────────── */}
        <section className="space-y-md">
          {team.map((member, i) => (
            <MemberCard key={member.name} member={member} index={i} />
          ))}
        </section>

        {/* ── Footer strip ──────────────────────────────────── */}
        <FadeSection delay={100}>
          <footer className="border-t border-outline-variant/30 pt-lg text-center space-y-xs">
            <p className="font-label-md text-primary font-bold tracking-tight">NutriLens</p>
            <p className="font-label-sm text-on-surface-variant">
              © {new Date().getFullYear()} NutriLens AI. All rights reserved.
            </p>
          </footer>
        </FadeSection>

      </main>
    </div>
  );
}