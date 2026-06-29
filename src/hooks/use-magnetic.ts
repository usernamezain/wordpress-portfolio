import { useEffect, type RefObject } from "react";
import gsap from "gsap";

type Options = {
  strength?: number; // max pixel offset
  radius?: number; // extra px beyond the element's own bounds to keep tracking
};

/**
 * Magnetic-pull hover effect. Only engages once the cursor is actually
 * over the element (or within `radius` px of its bounds while still being
 * hovered). On leave the element elastically returns to rest. Works
 * repeatedly — no stale tween state between hovers.
 */
export function useMagnetic<T extends HTMLElement>(
  ref: RefObject<T | null>,
  { strength = 14, radius = 24 }: Options = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window === "undefined" ||
      window.matchMedia("(pointer: coarse)").matches ||
      !window.matchMedia("(hover: hover)").matches
    ) {
      return;
    }

    let active = false;
    let setXY: ((v: number) => void) | null = null;
    let setY: ((v: number) => void) | null = null;

    // Seed x/y so GSAP can track them cleanly (avoids "not eligible for
    // reset" warnings when the element already has a CSS transform from
    // utility classes / variants).
    gsap.set(el, { x: 0, y: 0 });

    const buildQuickTo = () => {
      setXY = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
      setY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });
    };

    const onMove = (e: MouseEvent) => {
      if (!active || !setXY || !setY) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const rx = rect.width / 2 + radius;
      const ry = rect.height / 2 + radius;
      const nx = Math.max(-1, Math.min(1, dx / rx));
      const ny = Math.max(-1, Math.min(1, dy / ry));
      setXY(nx * strength);
      setY(ny * strength);
    };

    const onEnter = () => {
      active = true;
      // Recreate quickTo every enter — the elastic return tween from the
      // previous leave overwrites the quickTo's internal tween, leaving the
      // setter inert. Fresh setters guarantee the pull engages every time.
      gsap.killTweensOf(el, "x,y");
      buildQuickTo();
      window.addEventListener("mousemove", onMove);
    };

    const onLeave = () => {
      active = false;
      window.removeEventListener("mousemove", onMove);
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1, 0.6)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousemove", onMove);
      gsap.killTweensOf(el, "x,y");
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, strength, radius]);
}
