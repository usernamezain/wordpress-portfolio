import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);


type Project = {
  name: string;
  category: string;
  year: string;
  accent: "green" | "blue";
  builtWith: string;
  role: string;
  description: string;
};

const PROJECTS: Project[] = [
  {
    name: "Bloomly",
    category: "E-commerce / WooCommerce",
    year: "2025",
    accent: "green",
    builtWith: "Built with: WordPress, WooCommerce, custom PHP blocks",
    role: "Role: Full build, design to deployment",
    description: "A boutique floral shop selling seasonal arrangements with same-day local delivery.",
  },
  {
    name: "Studio North",
    category: "Agency site / Custom theme",
    year: "2024",
    accent: "blue",
    builtWith: "Built with: WordPress, custom theme, ACF, GSAP",
    role: "Role: Theme architecture and front-end animation",
    description: "Brand site for a Nordic design studio showcasing case studies and editorial work.",
  },
  {
    name: "Pagelift",
    category: "Blog platform / Full-stack",
    year: "2024",
    accent: "green",
    builtWith: "Built with: PHP, MySQL, custom CMS layer",
    role: "Role: Backend logic, editor UX, hosting setup",
    description: "A lightweight self-hosted publishing platform built for independent writers and small teams.",
  },
  {
    name: "BookBay",
    category: "Booking system / PHP + MySQL",
    year: "2023",
    accent: "blue",
    builtWith: "Built with: PHP, MySQL, vanilla JS, Stripe API",
    role: "Role: Sole developer, schema design through launch",
    description: "Appointment booking platform for small service businesses with calendar sync and reminders.",
  },
];

const ACCENT_VAR = { green: "var(--accent-green)", blue: "var(--accent-blue)" } as const;
const BAR_ACCENT_VAR = { green: "var(--accent-green-soft)", blue: "var(--accent-blue-soft)" } as const;
const CATEGORY_VAR = { green: "var(--accent-green-soft)", blue: "var(--accent-blue-soft)" } as const;

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progFillRefs = useRef<Array<Array<HTMLSpanElement | null>>>([]);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [incoming, setIncoming] = useState<{ idx: number; dir: 1 | -1 } | null>(null);
  const animatingRef = useRef(false);
  const currentSlotRef = useRef<HTMLDivElement>(null);
  const incomingSlotRef = useRef<HTMLDivElement>(null);
  const leftBtnRef = useRef<HTMLButtonElement>(null);
  const rightBtnRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);

  const goTo = (target: number) => {
    if (animatingRef.current) return;
    if (target < 0 || target >= PROJECTS.length || target === currentIndex) return;
    const dir: 1 | -1 = target > currentIndex ? 1 : -1;
    animatingRef.current = true;
    setIncoming({ idx: target, dir });
  };

  useLayoutEffect(() => {
    if (!incoming) return;
    const cur = currentSlotRef.current;
    const inc = incomingSlotRef.current;
    if (!cur || !inc) {
      setCurrentIndex(incoming.idx);
      setIncoming(null);
      animatingRef.current = false;
      return;
    }
    const dir = incoming.dir;
    gsap.set(inc, { xPercent: dir * 100, opacity: 0 });
    const tl = gsap.timeline({
      onComplete: () => {
        const nextIdx = incoming.idx;
        setCurrentIndex(nextIdx);
        setIncoming(null);
        animatingRef.current = false;
        if (currentSlotRef.current) gsap.set(currentSlotRef.current, { xPercent: 0, opacity: 1, clearProps: "transform,opacity" });
      },
    });
    tl.to(cur, { xPercent: -dir * 100, opacity: 0, duration: 0.35, ease: "power3.inOut" }, 0);
    tl.to(inc, { xPercent: 0, opacity: 1, duration: 0.35, ease: "power3.inOut" }, 0.05);
  }, [incoming]);

  const bounceBtn = (el: HTMLButtonElement | null) => {
    if (!el) return;
    gsap.fromTo(el, { scale: 1 }, { scale: 0.9, duration: 0.1, ease: "power2.out", yoyo: true, repeat: 1 });
  };

  const handlePrev = () => {
    bounceBtn(leftBtnRef.current);
    goTo(currentIndex - 1);
  };
  const handleNext = () => {
    bounceBtn(rightBtnRef.current);
    goTo(currentIndex + 1);
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);


  useEffect(() => {
    const ctx = gsap.context(() => {
      // Headline scrub (all viewports)
      gsap.set(line1Ref.current, { xPercent: -30, opacity: 0 });
      gsap.set(line2Ref.current, { xPercent: 30, opacity: 0 });
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          end: "top 25%",
          scrub: true,
        },
      })
        .to(line1Ref.current, { xPercent: 0, opacity: 1, ease: "power2.out", duration: 1 }, 0)
        .to(line2Ref.current, { xPercent: 0, opacity: 1, ease: "power2.out", duration: 1 }, 0);

      if (!isDesktop) {
        // Mobile/tablet: simple fade-up per card, no pin/peel
        cardRefs.current.forEach((card) => {
          if (!card) return;
          gsap.fromTo(
            card,
            { opacity: 0, y: 40 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 85%", once: true },
            },
          );
        });
        return;
      }

      // Desktop: deck/peel
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        gsap.set(card, {
          scale: 1 - i * 0.04,
          y: i * 12,
          zIndex: PROJECTS.length - i,
          opacity: 1,
          rotateZ: 0,
          x: 0,
          xPercent: -50,
          yPercent: -50,
          pointerEvents: i === 0 ? "auto" : "none",
        });
      });

      progFillRefs.current.forEach((row) => {
        row?.forEach((el) => {
          if (el) gsap.set(el, { width: "0%" });
        });
      });

      const phases = PROJECTS.length - 1;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          end: `+=${phases * 100}%`,
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 0; i < phases; i++) {
        const front = cardRefs.current[i];
        const peelLeft = i % 2 === 0;
        const dir = peelLeft ? -1 : 1;

        tl.addLabel(`p${i}`, i);
        if (front) {
          tl.to(
            front,
            {
              x: dir * window.innerWidth * 0.6,
              y: "+=15%",
              rotateZ: dir * -18,
              opacity: 0,
              duration: 1,
              onStart: () => gsap.set(front, { pointerEvents: "none" }),
              onReverseComplete: () => {
                if (i === 0) gsap.set(front, { pointerEvents: "auto" });
              },
            },
            i,
          );
        }
        for (let j = i + 1; j < PROJECTS.length; j++) {
          const card = cardRefs.current[j];
          if (!card) continue;
          const newDepth = j - (i + 1);
          tl.to(
            card,
            { scale: 1 - newDepth * 0.04, y: newDepth * 12, duration: 1 },
            i,
          );
        }
        const newFront = cardRefs.current[i + 1];
        if (newFront) {
          tl.call(() => gsap.set(newFront, { pointerEvents: "auto" }), undefined, i + 0.999);
        }

        const barEls = progFillRefs.current
          .map((row) => row?.[i])
          .filter((el): el is HTMLSpanElement => !!el);
        if (barEls.length) {
          tl.to(barEls, { width: "100%", duration: 1, ease: "none" }, i);
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isDesktop]);


  return (
    <section
      id="work"
      ref={sectionRef}
      className={isDesktop ? "relative overflow-hidden" : "relative"}
      style={{ backgroundColor: "var(--bg-section-work)", height: "auto" }}
    >
      {/* Centered intro */}
      <div className="relative z-10 mx-auto max-w-6xl px-8 pt-32 text-center md:px-14">
        <h2
          className="font-sans font-extrabold leading-[0.85] tracking-tight"
          style={{ letterSpacing: "-0.04em", color: "var(--text-primary)" }}
        >
          <span
            ref={line1Ref}
            className="block will-change-transform"
            style={{ fontSize: "clamp(2.75rem, 8vw, 9.5rem)" }}
          >
            SELECTED
          </span>
          <span
            ref={line2Ref}
            className="block will-change-transform work-outline"
            style={{
              fontSize: "clamp(2.9rem, 8.4vw, 10rem)",
              marginTop: "-0.15em",
              color: "transparent",
            }}
            aria-hidden="true"
          >
            WORK
          </span>
        </h2>
        <p
          className="mt-8 text-xs font-medium uppercase tracking-[0.22em]"
          style={{ color: "var(--text-secondary)" }}
        >
          04 projects — 2024–2026
        </p>
      </div>

      {/* Card stack (pinned on desktop; carousel on mobile/tablet) */}
      {isDesktop ? (
        <div
          ref={pinRef}
          className="relative mt-24 flex items-center justify-center"
          style={{ height: "90vh" }}
        >
          <div className="relative h-full w-full">
            {PROJECTS.map((p, i) => (
              <div
                key={p.name}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="group absolute left-1/2 top-1/2 overflow-hidden"
                style={{
                  width: "70%",
                  height: "75%",
                  borderRadius: 16,
                  border: "1px solid var(--card-border)",
                  backgroundColor: "var(--card-bg)",
                  willChange: "transform, opacity",
                }}
                onMouseEnter={(e) => {
                  if (i !== getCurrentFront(cardRefs.current)) return;
                  const label = e.currentTarget.querySelector<HTMLElement>("[data-cardlabel]");
                  if (label) gsap.to(label, { y: -4, duration: 0.3, ease: "power2.out" });
                }}
                onMouseLeave={(e) => {
                  const label = e.currentTarget.querySelector<HTMLElement>("[data-cardlabel]");
                  if (label) gsap.to(label, { y: 0, duration: 0.3, ease: "power2.out" });
                }}
              >
                <ProjectImage project={p} isDesktop />
                <div
                  className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6"
                  style={{ height: 80, background: "var(--scrim-dark)" }}
                >
                  <div data-cardlabel className="min-w-0 will-change-transform">
                    <div
                      className="truncate font-sans font-extrabold leading-none tracking-tight"
                      style={{
                        fontSize: "clamp(1.1rem, 2.6vw, 2.25rem)",
                        letterSpacing: "-0.02em",
                        color: "#FAFAF7",
                      }}
                    >
                      {p.name}
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em]">
                      <span className="truncate" style={{ color: CATEGORY_VAR[p.accent] }}>
                        {p.category}
                      </span>
                      <span style={{ color: "rgba(250,250,247,0.6)" }}>{p.year}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {PROJECTS.map((proj, barIdx) => (
                      <div
                        key={proj.name}
                        className="relative overflow-hidden rounded-full"
                        style={{ width: 28, height: 3, background: "rgba(255,255,255,0.3)" }}
                      >
                        <span
                          ref={(el) => {
                            if (!progFillRefs.current[i]) progFillRefs.current[i] = [];
                            progFillRefs.current[i][barIdx] = el;
                          }}
                          className="absolute left-0 top-0 block h-full"
                          style={{ width: "0%", background: BAR_ACCENT_VAR[proj.accent] }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="relative mt-16 pb-12">
          <div className="relative mx-auto" style={{ maxWidth: 640, paddingLeft: 56, paddingRight: 56 }}>
            <button
              type="button"
              ref={leftBtnRef}
              aria-label="Previous project"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full cursor-pointer"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border-hairline)",
                color: "var(--text-primary)",
                opacity: currentIndex === 0 ? 0.3 : 1,
                pointerEvents: currentIndex === 0 ? "none" : "auto",
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              ref={rightBtnRef}
              aria-label="Next project"
              onClick={handleNext}
              disabled={currentIndex === PROJECTS.length - 1}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full cursor-pointer"
              style={{
                backgroundColor: "var(--bg-raised)",
                border: "1px solid var(--border-hairline)",
                color: "var(--text-primary)",
                opacity: currentIndex === PROJECTS.length - 1 ? 0.3 : 1,
                pointerEvents: currentIndex === PROJECTS.length - 1 ? "none" : "auto",
              }}
            >
              <ChevronRight size={20} />
            </button>

            <div
              className="relative overflow-hidden"
              style={{ borderRadius: 16 }}
              onTouchStart={(e) => {
                touchStartXRef.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                const start = touchStartXRef.current;
                touchStartXRef.current = null;
                if (start == null) return;
                const dx = e.changedTouches[0].clientX - start;
                if (Math.abs(dx) < 50) return;
                if (dx < 0) handleNext();
                else handlePrev();
              }}
            >
              <div ref={currentSlotRef} className="relative will-change-transform">
                <MobileCardBody
                  project={PROJECTS[currentIndex]}
                  onOpen={() => setActiveProject(PROJECTS[currentIndex])}
                />
              </div>
              {incoming && (
                <div ref={incomingSlotRef} className="absolute inset-0 will-change-transform">
                  <MobileCardBody project={PROJECTS[incoming.idx]} onOpen={() => {}} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2.5">
            {PROJECTS.map((p, i) => {
              const active = i === currentIndex;
              return (
                <button
                  key={p.name}
                  type="button"
                  aria-label={`Go to ${p.name}`}
                  onClick={() => goTo(i)}
                  className="cursor-pointer rounded-full"
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: active ? ACCENT_VAR[p.accent] : "transparent",
                    border: active ? "1px solid transparent" : "1px solid var(--text-muted)",
                    transform: active ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.3s ease, background-color 0.3s ease, border-color 0.3s ease",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}


      <style>{`
        .work-outline { -webkit-text-stroke: 1.5px var(--text-primary); }
      `}</style>

      <ProjectDetailView project={activeProject} onClose={() => setActiveProject(null)} />
    </section>
  );
}

function ProjectDetailView({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (project) setRender(true);
  }, [project]);

  useEffect(() => {
    if (!render || !panelRef.current) return;
    const panel = panelRef.current;
    gsap.fromTo(
      panel,
      { yPercent: 100 },
      { yPercent: 0, duration: 0.4, ease: "power3.out" },
    );
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [render]);

  const close = () => {
    if (!panelRef.current) {
      setRender(false);
      onClose();
      return;
    }
    gsap.to(panelRef.current, {
      yPercent: 100,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        setRender(false);
        onClose();
      },
    });
  };

  if (!render || !project) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0"
      style={{ zIndex: 200 }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={panelRef}
        className="absolute inset-0 overflow-y-auto"
        style={{ backgroundColor: "var(--bg-section-work)", willChange: "transform" }}
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          const start = touchStartY.current;
          touchStartY.current = null;
          if (start == null) return;
          const delta = e.changedTouches[0].clientY - start;
          // Only dismiss on swipe-down when scrolled to top
          const scrollTop = (e.currentTarget as HTMLDivElement).scrollTop;
          if (delta > 80 && scrollTop <= 0) close();
        }}
      >
        <button
          type="button"
          onClick={close}
          className="fixed left-4 top-4 z-10 cursor-pointer rounded-full px-4 py-2 text-sm font-medium"
          style={{
            backgroundColor: "var(--card-bg)",
            color: "var(--text-primary)",
            border: "1px solid var(--card-border)",
          }}
        >
          ← Back
        </button>

        <div className="px-6 pb-16 pt-20 md:px-10">
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: "16 / 12",
              borderRadius: 16,
              border: "1px solid var(--card-border)",
            }}
          >
            <ProjectPlaceholder project={project} />
          </div>

          <div className="mt-8">
            <h3
              className="font-sans font-extrabold leading-[0.95] tracking-tight"
              style={{
                fontSize: "clamp(2rem, 9vw, 3.25rem)",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              {project.name}.
            </h3>
            <div className="mt-3 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em]">
              <span style={{ color: ACCENT_VAR[project.accent] }}>{project.category}</span>
              <span style={{ color: "var(--text-secondary)" }}>{project.year}</span>
            </div>
          </div>

          <div
            className="mt-8 space-y-3 text-sm leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            <p>{project.description}</p>
            <p style={{ color: "var(--text-secondary)" }}>{project.builtWith}</p>
            <p style={{ color: "var(--text-secondary)" }}>{project.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getCurrentFront(cards: Array<HTMLDivElement | null>): number {
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (c && c.style.pointerEvents !== "none") return i;
  }
  return 0;
}

function ProjectImage({ project, isDesktop }: { project: Project; isDesktop: boolean }) {
  return (
    <div className="flex h-full w-full flex-col">
      <div
        className="flex items-center gap-1.5 border-b px-3 py-2"
        style={{
          borderColor: "var(--border-hairline)",
          backgroundColor: "var(--browser-chrome-bg)",
        }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--text-muted)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--text-muted)" }} />
        <span className="h-2 w-2 rounded-full" style={{ background: "var(--text-muted)" }} />
        <span
          className="ml-3 text-[10px] uppercase tracking-[0.18em]"
          style={{ color: "var(--text-secondary)" }}
        >
          {project.name.toLowerCase().replace(/\s+/g, "")}.dev
        </span>
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          aspectRatio: isDesktop ? undefined : "16 / 10",
          minHeight: isDesktop ? undefined : 0,
        }}
      >
        <ProjectPlaceholder project={project} />
        {/* eyebrow */}
        <span
          className="absolute left-4 top-4 z-10 text-[10px] font-medium uppercase tracking-[0.24em] sm:left-6 sm:top-6"
          style={{ color: ACCENT_VAR[project.accent] }}
        >
          WordPress / PHP build
        </span>
        {isDesktop && (
          <div
            className="absolute bottom-24 left-6 z-10 font-sans font-extrabold leading-[0.9] md:left-10"
            style={{
              fontSize: "clamp(1.75rem, 4vw, 4rem)",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            {project.name}.
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectPlaceholder({ project }: { project: Project }) {
  const accent = project.accent === "green" ? "#639922" : "#378ADD";
  const accentSoft = project.accent === "green" ? "#9CCB5A" : "#7FB3E8";
  const bgTint =
    project.accent === "green"
      ? "linear-gradient(135deg, rgba(99,153,34,0.10) 0%, rgba(99,153,34,0.02) 100%)"
      : "linear-gradient(135deg, rgba(55,138,221,0.10) 0%, rgba(55,138,221,0.02) 100%)";

  let svg: React.ReactNode = null;
  if (project.name === "Bloomly") {
    svg = (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <circle cx="120" cy="125" r="70" fill={accent} opacity="0.35" />
        <circle cx="200" cy="125" r="70" fill={accentSoft} opacity="0.45" />
        <circle cx="280" cy="125" r="70" fill={accent} opacity="0.3" />
        <circle cx="200" cy="55" r="55" fill={accentSoft} opacity="0.4" />
        <circle cx="200" cy="195" r="55" fill={accent} opacity="0.35" />
        <circle cx="200" cy="125" r="28" fill={accent} opacity="0.85" />
      </svg>
    );
  } else if (project.name === "Studio North") {
    svg = (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={40 * (i + 1)} y1="0" x2={40 * (i + 1)} y2="250" stroke={accent} strokeOpacity="0.18" strokeWidth="1" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={40 * (i + 1)} x2="400" y2={40 * (i + 1)} stroke={accent} strokeOpacity="0.18" strokeWidth="1" />
        ))}
        <rect x="60" y="50" width="120" height="150" fill={accentSoft} opacity="0.5" />
        <rect x="200" y="90" width="140" height="110" fill={accent} opacity="0.55" />
        <rect x="220" y="40" width="60" height="60" fill={accentSoft} opacity="0.7" />
      </svg>
    );
  } else if (project.name === "Pagelift") {
    svg = (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <rect x="60" y="60" width="280" height="40" rx="6" fill={accent} opacity="0.5" />
        <rect x="80" y="115" width="240" height="40" rx="6" fill={accentSoft} opacity="0.55" />
        <rect x="100" y="170" width="200" height="40" rx="6" fill={accent} opacity="0.7" />
        <circle cx="200" cy="45" r="10" fill={accentSoft} opacity="0.8" />
      </svg>
    );
  } else {
    // BookBay — dot grid + arc
    svg = (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 13 }).map((_, c) => (
            <circle
              key={`d${r}-${c}`}
              cx={30 + c * 30}
              cy={20 + r * 30}
              r="3"
              fill={accent}
              opacity={0.2 + ((r + c) % 4) * 0.12}
            />
          )),
        )}
        <circle cx="200" cy="125" r="60" fill="none" stroke={accent} strokeWidth="3" opacity="0.7" />
        <circle cx="200" cy="125" r="28" fill={accentSoft} opacity="0.8" />
      </svg>
    );
  }

  return (
    <div className="absolute inset-0" style={{ background: bgTint }}>
      {svg}
    </div>
  );
}

function MobileCardBody({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="relative w-full overflow-hidden cursor-pointer"
      style={{
        borderRadius: 16,
        border: "1px solid var(--card-border)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      <ProjectImage project={project} isDesktop={false} />
      <div
        className="relative flex items-center justify-between gap-4 px-4 sm:gap-6 sm:px-6"
        style={{ height: 80, background: "var(--scrim-dark)" }}
      >
        <div className="min-w-0">
          <div
            className="truncate font-sans font-extrabold leading-none tracking-tight"
            style={{
              fontSize: "clamp(1.1rem, 5vw, 1.75rem)",
              letterSpacing: "-0.02em",
              color: "#FAFAF7",
            }}
          >
            {project.name}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.22em]">
            <span className="truncate" style={{ color: CATEGORY_VAR[project.accent] }}>
              {project.category}
            </span>
            <span style={{ color: "rgba(250,250,247,0.6)" }}>{project.year}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


