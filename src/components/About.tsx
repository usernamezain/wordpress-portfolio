import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SkillWeb from "./SkillWeb";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: "1+ year", label: "freelance web development experience" },
  { value: "WordPress", label: "main specialty — Elementor, WooCommerce, theming" },
  { value: "HTML / CSS / JS", label: "core frontend stack, daily driver" },
  { value: "Based in", label: "Lahore, Pakistan — open to remote work" },
];


export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = paragraphRef.current?.querySelectorAll<HTMLElement>("[data-line]") ?? [];

      const paraTl = gsap.timeline({
        scrollTrigger: {
          trigger: paragraphRef.current,
          start: "top 90%",
          once: true,
        },
      });
      paraTl
        .fromTo(
          lines,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            immediateRender: false,
          },
        )
        .add(() => highlightRef.current?.classList.add("is-active"), "-=0.2");

      // Stats stagger
      const statItems = statsRef.current?.querySelectorAll<HTMLElement>("[data-stat]") ?? [];
      gsap.fromTo(
        statItems,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.4)",
          stagger: 0.1,
          immediateRender: false,
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );

      // Closing statement
      gsap.fromTo(
        closingRef.current,
        { opacity: 0, letterSpacing: "4px" },
        {
          opacity: 1,
          letterSpacing: "normal",
          duration: 0.8,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: closingRef.current,
            start: "top 95%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about"
      ref={sectionRef}
      className="relative min-h-[75vh] overflow-hidden px-8 py-4 md:px-14 lg:min-h-0 lg:py-32"
      style={{
        backgroundColor: "var(--bg-section-about)",
        borderTop: "0.5px solid var(--border-hairline)",
        borderBottom: "0.5px solid var(--border-hairline)",
      }}
    >
      <p
        className="relative z-10 text-[11px] font-medium uppercase tracking-[0.28em]"
        style={{ color: "var(--text-secondary)" }}
      >
        Who I Am
      </p>

      <div className="relative z-10 mt-4 grid grid-cols-1 gap-4 lg:mt-20 lg:gap-12 lg:grid-cols-[55fr_45fr] xl:gap-20">
        {/* Left: paragraph */}
        <p
          ref={paragraphRef}
          className="font-sans font-normal"
          style={{
            fontSize: "clamp(1.15rem, 2.2vw, 1.85rem)",
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
          }}
        >
          <span data-line className="block">I'm Ayesha — a web developer specializing in</span>
          <span data-line className="block">WordPress, currently in my 4th semester of a</span>
          <span data-line className="block">BS in Computer Science at Virtual University</span>
          <span data-line className="block">of Pakistan. Over the past year I've worked</span>
          <span data-line className="block">as a freelance developer, building responsive</span>
          <span data-line className="block">websites and custom WooCommerce stores for</span>
          <span data-line className="block">real clients — from theme customization to</span>
          <span data-line className="block">full store setups. I care about clean code and{" "}
            <span
              ref={highlightRef}
              className="inline about-highlight"
              style={{ color: "var(--text-primary)", fontStyle: "italic", transition: "color 0.4s ease" }}
            >
              treats every build like a craft
            </span>
            , not a checklist.
          </span>
        </p>

        {/* Right: stats */}
        <div ref={statsRef} className="flex flex-col">
          {STATS.map((s) => (
            <div
              key={s.value}
              data-stat
              className="py-3 lg:py-6"
              style={{ borderTop: "0.5px solid var(--border-hairline)" }}
            >
              <div
                className="font-sans font-bold tracking-tight"
                style={{
                  color: "var(--accent-blue)",
                  fontSize: "clamp(1.5rem, 2.6vw, 2.1rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                {s.value}
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack — interactive skill web */}
      <div className="relative z-10 mt-4 lg:mt-16">
        <h2
          className="text-[11px] font-medium uppercase tracking-[0.28em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Tech Stack
        </h2>
        <div className="mt-5">
          <SkillWeb />
        </div>
      </div>

      {/* Closing */}
      <div
        className="relative z-10 mt-4 pt-4 lg:mt-24 lg:pt-16"
        style={{ borderTop: "0.5px solid var(--border-hairline)" }}
      >
        <p
          ref={closingRef}
          className="mx-auto max-w-4xl text-center font-sans font-medium"
          style={{
            fontSize: "clamp(1.05rem, 2vw, 1.75rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
          }}
        >
          I don't just build sites. I build the parts no one notices until something breaks.
        </p>
      </div>
      <style>{`
        .about-highlight.is-active { color: var(--accent-green) !important; }
      `}</style>
    </section>
  );
}
