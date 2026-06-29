import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useMagnetic } from "@/hooks/use-magnetic";

type NavItem = {
  label: string;
  href: string;
  accent: string;
  dir: 1 | -1;
  side: string;
};

const ITEMS: NavItem[] = [
  { label: "WORK", href: "#work", accent: "var(--accent-green)", dir: -1, side: "PORTFOLIO" },
  { label: "SERVICES", href: "#services", accent: "var(--accent-blue)", dir: 1, side: "2026" },
  { label: "ABOUT", href: "#about", accent: "var(--accent-green)", dir: -1, side: "PROFILE" },
  { label: "CONTACT", href: "#contact", accent: "var(--accent-blue)", dir: 1, side: "SAY HI" },
];

export default function MarqueeMenu() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<(HTMLDivElement | null)[]>([]);
  const tracksRef = useRef<(HTMLDivElement | null)[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useMagnetic(buttonRef, { strength: 14, radius: 70 });

  // Lock scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Open/close animation + marquee setup
  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        overlay,
        { scale: 0.05, opacity: 0, transformOrigin: "top right" },
        { scale: 1, opacity: 1, duration: 0.5, ease: "power4.out" },
      );

      const rows = rowsRef.current.filter(Boolean) as HTMLDivElement[];
      gsap.fromTo(
        rows,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.06, delay: 0.15 },
      );

      // Infinite marquee per row
      tweensRef.current = [];
      tracksRef.current.forEach((track, i) => {
        if (!track) return;
        const item = ITEMS[i];
        gsap.set(track, { xPercent: item.dir === 1 ? -50 : 0 });
        const tw = gsap.to(track, {
          xPercent: item.dir === 1 ? 0 : -50,
          duration: 30,
          ease: "none",
          repeat: -1,
        });
        tweensRef.current.push(tw);
      });
    });

    return () => {
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
      ctx.revert();
    };
  }, [open]);

  const handleClose = (onDone?: () => void) => {
    const overlay = overlayRef.current;
    if (!overlay) {
      setOpen(false);
      onDone?.();
      return;
    }
    gsap.to(overlay, {
      scale: 0.05,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
      transformOrigin: "top right",
      onComplete: () => {
        setOpen(false);
        onDone?.();
      },
    });
  };

  const resolveVar = (v: string) => {
    const m = v.match(/var\((--[\w-]+)\)/);
    if (!m) return v;
    return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || v;
  };

  const handleRowEnter = (i: number) => {
    const tw = tweensRef.current[i];
    if (tw) tw.timeScale(0.2);
    const track = tracksRef.current[i];
    if (track)
      gsap.to(track, {
        color: resolveVar(ITEMS[i].accent),
        duration: 0.4,
        ease: "power2.out",
      });
  };

  const handleRowLeave = (i: number) => {
    const tw = tweensRef.current[i];
    if (tw) tw.timeScale(1);
    const track = tracksRef.current[i];
    if (track)
      gsap.to(track, {
        color: resolveVar("var(--text-primary)"),
        duration: 0.4,
        ease: "power2.out",
      });
  };

  const handleRowClick = (i: number) => {
    const row = rowsRef.current[i];
    const item = ITEMS[i];
    const flash = () => {
      if (row) {
        const accent = resolveVar(item.accent);
        gsap.fromTo(
          row,
          { backgroundColor: `${accent}33` },
          { backgroundColor: "rgba(0,0,0,0)", duration: 0.2, ease: "power2.out" },
        );
      }
    };
    flash();
    handleClose(() => {
      // Defer to next frame so body scroll lock is released first
      requestAnimationFrame(() => {
        if (item.href === "#contact") {
          // Contact is a fixed reveal-from-bottom footer on desktop —
          // scrollIntoView on a position:fixed element doesn't scroll the
          // page. Force-scroll to the very bottom instead.
          const maxY = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            0,
          );
          window.scrollTo({ top: maxY, behavior: "smooth" });
          return;
        }
        const el = document.querySelector(item.href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? handleClose() : setOpen(true))}
        aria-label={open ? "Close menu" : "Open menu"}
        className="fixed right-6 top-6 z-[200] flex h-10 w-[90px] items-center justify-center gap-1.5 rounded-full text-[13px] font-bold tracking-[0.14em] shadow-sm md:right-10 md:top-8"
        style={{ backgroundColor: "var(--accent-green-soft)", color: "#0E1A12" }}
      >
        <span ref={labelRef} className="leading-none">
          {open ? "CLOSE" : "MENU"}
        </span>
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "#0E1A12" }}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[150] flex flex-col"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
        >
          {ITEMS.map((item, i) => (
            <div
              key={item.label}
              ref={(el) => { rowsRef.current[i] = el; }}
              onMouseEnter={() => handleRowEnter(i)}
              onMouseLeave={() => handleRowLeave(i)}
              onClick={() => handleRowClick(i)}
              className="group relative flex cursor-pointer items-center overflow-hidden border-b"
              style={{
                borderBottomWidth: "0.5px",
                borderColor: "var(--border-hairline)",
                minHeight: 64,
                height: "25vh",
              }}
            >
              {/* Decorative sideways label */}
              <span
                className="pointer-events-none absolute left-2 top-1/2 hidden -translate-y-1/2 -rotate-90 text-[10px] font-medium uppercase tracking-[0.4em] sm:left-4 sm:inline-block"
                style={{ opacity: 0.4, color: "var(--text-secondary)" }}
              >
                {item.side}
              </span>

              {/* Marquee track */}
              <div className="relative w-full overflow-hidden">
                <div
                  ref={(el) => { tracksRef.current[i] = el; }}
                  className="flex whitespace-nowrap font-sans font-extrabold leading-none"
                  style={{
                    fontSize: "clamp(2.5rem, 9vw, 11rem)",
                    letterSpacing: "-0.02em",
                    willChange: "transform",
                    color: "var(--text-primary)",
                  }}
                >

                  {Array.from({ length: 12 }).map((_, k) => (
                    <span key={k} className="pr-[0.5em]">
                      {item.label}{" "}
                      <span className="px-[0.3em]" style={{ color: "var(--text-muted)" }}>
                        •
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Center pill */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className="rounded-full border px-5 py-2 text-[11px] font-bold tracking-[0.28em]"
              style={{
                borderColor: "var(--text-primary)",
                backgroundColor: "var(--bg-base)",
                color: "var(--text-primary)",
              }}
            >
              AYESHA
            </span>
          </div>
        </div>
      )}
    </>
  );
}
