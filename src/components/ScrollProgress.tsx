import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    let currentColor = "var(--accent-green)";
    let lastAccent: "green" | "blue" = "green";

    const update = () => {
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const max = Math.max(docH - winH, 1);
      const progress = Math.min(Math.max(window.scrollY / max, 0), 1);
      fill.style.height = `${progress * 100}%`;

      // Determine current section accent by checking which section is centered
      const midY = window.scrollY + winH / 2;
      const work = document.getElementById("work");
      const about = document.getElementById("about");
      let accent: "green" | "blue" = "green";
      if (work && about) {
        const workTop = work.offsetTop;
        const aboutTop = about.offsetTop;
        if (midY >= workTop && midY < aboutTop) accent = "blue";
      }
      if (accent !== lastAccent) {
        lastAccent = accent;
        currentColor = accent === "blue" ? "var(--accent-blue)" : "var(--accent-green)";
        gsap.to(fill, {
          backgroundColor:
            getComputedStyle(document.documentElement)
              .getPropertyValue(accent === "blue" ? "--accent-blue" : "--accent-green")
              .trim() || currentColor,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    gsap.ticker.add(update);
    update();
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <div
      ref={trackRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 16,
        bottom: 16,
        left: 10,
        width: 3,
        backgroundColor: "transparent",
        borderRadius: 999,
        overflow: "hidden",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      {/* Faint static rail so the indicator has a path to ride */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--border-hairline)",
          opacity: 0.35,
          borderRadius: 999,
        }}
      />
      <div
        ref={fillRef}
        style={{
          position: "relative",
          width: "100%",
          height: "0%",
          backgroundColor: "var(--accent-green)",
          borderRadius: 999,
          boxShadow: "0 0 12px 0 currentColor",
          transition: "background-color 0.3s ease",
          willChange: "height",
        }}
      />
    </div>
  );
}
