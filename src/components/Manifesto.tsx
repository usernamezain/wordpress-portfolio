import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(labelRef.current, { opacity: 0, y: 10 });
      gsap.set(statementRef.current, { opacity: 0, scale: 0.85, filter: "blur(8px)" });
      gsap.set(captionRef.current, { opacity: 0, y: 15 });
      // Highlight color is controlled via class (theme-safe).
      highlightRef.current?.classList.remove("is-active");

      const isMobile = window.matchMedia("(max-width: 1023px)").matches;
      // Pinned scrubbed timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: isMobile ? "+=30%" : "+=60%",
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!highlightRef.current) return;
            highlightRef.current.classList.toggle("is-active", self.progress >= 0.85);
          },
        },
      });


      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.2, ease: "none" }, 0)
        .to(
          statementRef.current,
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "none",
          },
          0.1,
        );

      // Caption fades up after pin releases
      gsap.to(captionRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 30%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[75vh] items-center justify-center overflow-hidden px-8 py-4 md:px-14 lg:min-h-screen lg:py-0"
      style={{ background: "var(--bg-manifesto)" }}
    >
      <div className="relative z-10 flex max-w-5xl flex-col items-center text-center">
        <span
          ref={labelRef}
          className="mb-10 text-[11px] font-medium uppercase tracking-[0.28em]"
          style={{ color: "var(--text-secondary)" }}
        >
          The Philosophy
        </span>

        <h2
          ref={statementRef}
          className="font-sans font-extrabold leading-[0.95] tracking-tight"
          style={{
            fontSize: "clamp(2rem, 8vw, 9rem)",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
          }}

        >
          CODE IS THE{" "}
          <span
            ref={highlightRef}
            className="inline-block manifesto-highlight"
            style={{ color: "var(--text-primary)", transition: "color 0.3s ease" }}
          >
            DESIGN.
          </span>
        </h2>

        <p
          ref={captionRef}
          className="mt-12 max-w-[380px] text-sm leading-relaxed md:text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Every line of PHP, every theme structure, every database query — it's all part of how the site feels, not just how it works.
        </p>
      </div>
      <style>{`
        .manifesto-highlight.is-active { color: var(--accent-green) !important; }
      `}</style>
    </section>
  );
}
