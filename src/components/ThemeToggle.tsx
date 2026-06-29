import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Sun, Moon } from "lucide-react";
import {
  applyTheme,
  getCurrentTheme,
  getInitialTheme,
  THEME_EVENT,
  type Theme,
} from "@/lib/theme";
import { useMagnetic } from "@/hooks/use-magnetic";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const iconWrapRef = useRef<HTMLSpanElement>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useMagnetic(buttonRef, { strength: 12, radius: 60 });

  useEffect(() => {
    // Sync from what the pre-paint script set, or compute fresh.
    const current = getCurrentTheme() || getInitialTheme();
    if (!document.documentElement.getAttribute("data-theme")) {
      applyTheme(current, false);
    }
    setTheme(current);
    setMounted(true);

    const onChange = (e: Event) => {
      const next = (e as CustomEvent<Theme>).detail;
      if (next === "light" || next === "dark") setTheme(next);
    };
    window.addEventListener(THEME_EVENT, onChange);
    return () => window.removeEventListener(THEME_EVENT, onChange);
  }, []);

  const handleToggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";

    // Build the flash overlay matching the TARGET theme background.
    // Probe by temporarily setting data-theme on a hidden node would
    // be heavy — instead we hardcode the two known --bg-base values.
    const targetBg = next === "dark" ? "#0E1A12" : "#FAFAF7";

    if (!flashRef.current) {
      const el = document.createElement("div");
      el.style.cssText =
        "position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0;will-change:opacity;";
      document.body.appendChild(el);
      flashRef.current = el;
    }
    const flash = flashRef.current;
    flash.style.backgroundColor = targetBg;

    // Icon spin / crossfade
    if (iconWrapRef.current) {
      gsap.fromTo(
        iconWrapRef.current,
        { rotate: 0, opacity: 1 },
        {
          rotate: 180,
          duration: 0.4,
          ease: "power2.inOut",
          onUpdate: function () {
            // Crossfade icon at midpoint by swapping React state at 50%.
          },
        },
      );
    }

    // Flash 0 -> 1 -> 0, swap theme at the peak.
    gsap.killTweensOf(flash);
    const tl = gsap.timeline();
    tl.to(flash, { opacity: 1, duration: 0.2, ease: "power2.inOut" })
      .add(() => {
        applyTheme(next);
        setTheme(next);
      })
      .to(flash, { opacity: 0, duration: 0.2, ease: "power2.inOut" });
  };

  // Icon shown represents the mode you'd switch TO.
  const showMoon = theme === "light";

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleToggle}
      aria-label={showMoon ? "Switch to dark mode" : "Switch to light mode"}
      className="fixed right-[calc(1.5rem+98px)] top-6 z-[200] flex h-10 w-10 items-center justify-center rounded-full md:right-[calc(2.5rem+98px)] md:top-8"
      style={{
        backgroundColor: "var(--bg-raised)",
        border: "1px solid var(--border-hairline)",
        color: "var(--text-primary)",
      }}
    >
      <span
        ref={iconWrapRef}
        className="inline-flex"
        style={{ willChange: "transform" }}
      >
        {mounted && (showMoon ? <Moon size={16} strokeWidth={2} /> : <Sun size={16} strokeWidth={2} />)}
      </span>
    </button>
  );
}
