import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useMagnetic } from "@/hooks/use-magnetic";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const SOCIALS: Array<{ label: string; href: string }> = [
  { label: "LinkedIn", href: "https://linkedin.com/in/ayesha-ghulam-rasool" },
  { label: "Upwork", href: "#" },
];


export default function Contact() {
  const spacerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const realRef = useRef<HTMLSpanElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true,
  );
  useMagnetic(emailRef, { strength: 22, radius: 120 });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const about = document.getElementById("about");
    const triggerEl = about ?? spacerRef.current;
    if (!triggerEl) return;

    const ctx = gsap.context(() => {
      gsap.set([line1Ref.current, line2Ref.current], { clipPath: "inset(0 100% 0 0)" });
      realRef.current?.classList.remove("is-active");
      const socials = socialsRef.current?.querySelectorAll<HTMLElement>("[data-social]") ?? [];
      gsap.set(socials, { opacity: 0, y: 14 });
      gsap.set(emailRef.current, { opacity: 0, y: 18 });
      gsap.set(footerRef.current, { opacity: 0, y: 10 });

      if (isDesktop) {
        // Desktop: scrubbed reveal driven by About scrolling away
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: triggerEl,
            start: "bottom bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              realRef.current?.classList.toggle("is-active", self.progress >= 0.9);
            },
          },
        });
        tl.to(line1Ref.current, { clipPath: "inset(0 0% 0 0)", ease: "power3.out", duration: 1 }, 0)
          .to(line2Ref.current, { clipPath: "inset(0 0% 0 0)", ease: "power3.out", duration: 1 }, 0.15)
          .to(emailRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.55)
          .to(socials, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.1 }, 0.7)
          .to(footerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.85);
      } else {
        // Mobile/tablet: simple fade-up entrance, no pin / no scrub
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        });
        tl.to(line1Ref.current, { clipPath: "inset(0 0% 0 0)", ease: "power3.out", duration: 0.8 }, 0)
          .to(line2Ref.current, { clipPath: "inset(0 0% 0 0)", ease: "power3.out", duration: 0.8 }, 0.1)
          .to(emailRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.3)
          .to(socials, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.08 }, 0.4)
          .to(footerRef.current, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }, 0.55)
          .add(() => realRef.current?.classList.add("is-active"), 0.4);
      }

      // Magnetic email — desktop only
      if (isDesktop && emailRef.current) {
        const el = emailRef.current;
        const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
        const radius = 120;
        const onMove = (e: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = e.clientX - cx;
          const dy = e.clientY - cy;
          const dist = Math.hypot(dx, dy);
          if (dist < radius && dist > 0) {
            const strength = (1 - dist / radius) * 6;
            xTo((dx / dist) * strength);
            yTo((dy / dist) * strength);
          } else {
            xTo(0);
            yTo(0);
          }
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
      }
    }, sectionRef);

    // Fade out hero grain canvas as section reveals (desktop only)
    const grain = document.getElementById("hero-grain-canvas");
    const getBaseGrain = () =>
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--grain-opacity") || "0.07",
      );
    let grainTrigger: ScrollTrigger | undefined;
    if (grain && isDesktop) {
      grainTrigger = ScrollTrigger.create({
        trigger: triggerEl,
        start: "bottom bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          gsap.set(grain, { opacity: getBaseGrain() * (1 - self.progress) });
        },
        onLeaveBack: () => gsap.set(grain, { opacity: getBaseGrain() }),
      });
    }

    return () => {
      ctx.revert();
      grainTrigger?.kill();
      if (grain) gsap.set(grain, { opacity: getBaseGrain() });
    };
  }, [isDesktop]);


  const scrollToTop = () => {
    gsap.to(window, {
      duration: 1.2,
      ease: "power2.inOut",
      scrollTo: { y: 0 },
    });
  };

  return (
    <div
      ref={spacerRef}
      className="relative"
      style={isDesktop ? { height: "100vh" } : undefined}
    >
      <section
        id="contact"
        ref={sectionRef}
        className={
          isDesktop
            ? "fixed inset-x-0 bottom-0 flex flex-col overflow-hidden px-8 py-20 md:px-14"
            : "relative flex min-h-[75vh] w-full flex-col overflow-hidden px-6 py-4 sm:px-8 md:px-14"
        }
        style={{
          height: isDesktop ? "100vh" : "auto",
          backgroundColor: "var(--bg-contact)",
          color: "var(--text-on-contact)",
          zIndex: 0,
        }}
      >
        <p
          className="text-[11px] font-medium uppercase tracking-[0.28em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Get In Touch
        </p>

        <div className="flex flex-1 flex-col items-center justify-center py-4 text-center lg:py-16">
          <h2
            className="font-sans font-extrabold leading-[0.9] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 9vw, 11rem)", letterSpacing: "-0.04em" }}
          >

            <span ref={line1Ref} className="block will-change-transform">
              LET'S BUILD
            </span>
            <span ref={line2Ref} className="block will-change-transform">
              SOMETHING{" "}
              <span
                ref={realRef}
                className="inline-block contact-real"
                style={{ color: "var(--text-on-contact)", transition: "color 0.3s ease" }}
              >
                REAL.
              </span>
            </span>
          </h2>

          <a
            ref={emailRef}
            href="mailto:ayesha03022007@gmail.com"
            className="email-link mt-16 inline-block font-sans font-medium will-change-transform"
            style={{ fontSize: "clamp(1.4rem, 2.5vw, 2.4rem)", color: "var(--text-on-contact)" }}
          >
            ayesha03022007@gmail.com
          </a>

          <div
            ref={socialsRef}
            className="mt-10 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {SOCIALS.map((s, i) => (
              <span key={s.label} data-social className="inline-flex items-center gap-3">
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="contact-social-link transition-colors"
                >
                  {s.label}
                </a>
                {i < SOCIALS.length - 1 && (
                  <span style={{ color: "var(--text-muted)" }}>·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div
          ref={footerRef}
          className="flex flex-col items-start justify-between gap-4 pt-6 text-xs sm:flex-row sm:items-center"
          style={{
            borderTop: "0.5px solid var(--border-hairline)",
            color: "var(--text-secondary)",
          }}
        >
          <span>© 2026 Ayesha. All rights reserved.</span>
          <button
            type="button"
            onClick={scrollToTop}
            className="back-to-top group inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border-hairline)",
              backgroundColor: "transparent",
            }}
          >
            <span className="back-to-top-arrow relative inline-flex h-3 w-3 items-center justify-center overflow-hidden">
              <span className="back-to-top-arrow-inner absolute inset-0 flex items-center justify-center leading-none">
                ↑
              </span>
              <span className="back-to-top-arrow-ghost absolute inset-0 flex items-center justify-center leading-none">
                ↑
              </span>
            </span>
            <span className="back-to-top-label relative overflow-hidden">
              <span className="back-to-top-text inline-block">Back to top</span>
            </span>
          </button>
        </div>

        <style>{`
          .contact-real.is-active { color: var(--accent-green-soft) !important; }
          .contact-social-link:hover { color: var(--accent-green-soft); }
          .email-link { position: relative; padding-bottom: 6px; transition: color 0.3s ease; }
          .email-link::after {
            content: ""; position: absolute; left: 0; right: 0; bottom: 0;
            height: 1px; background: currentColor;
            transition: height 0.3s ease, background-color 0.3s ease;
          }
          .email-link:hover { color: var(--accent-green) !important; }
          .email-link:hover::after { height: 2px; }

          .back-to-top {
            transition: color 0.35s ease, border-color 0.35s ease,
              background-color 0.35s ease, transform 0.35s cubic-bezier(.2,.8,.2,1);
          }
          .back-to-top:hover {
            color: var(--text-on-contact);
            border-color: var(--accent-green);
            background-color: color-mix(in oklab, var(--accent-green) 12%, transparent);
            transform: translateY(-2px);
          }
          .back-to-top:active { transform: translateY(0); }

          .back-to-top-arrow-inner,
          .back-to-top-arrow-ghost {
            transition: transform 0.45s cubic-bezier(.2,.8,.2,1), opacity 0.3s ease;
          }
          .back-to-top-arrow-ghost { transform: translateY(110%); opacity: 0; }
          .back-to-top:hover .back-to-top-arrow-inner {
            transform: translateY(-110%);
            opacity: 0;
          }
          .back-to-top:hover .back-to-top-arrow-ghost {
            transform: translateY(0);
            opacity: 1;
            color: var(--accent-green);
          }

          .back-to-top-text {
            transition: transform 0.5s cubic-bezier(.2,.8,.2,1), letter-spacing 0.4s ease;
          }
          .back-to-top:hover .back-to-top-text {
            transform: translateX(2px);
            letter-spacing: 0.28em;
          }
        `}</style>
      </section>
    </div>
  );
}
