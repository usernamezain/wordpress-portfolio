import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

gsap.registerPlugin(ScrollTrigger);

/**
 * Forces ScrollTrigger to recalculate trigger positions after layout has
 * fully settled. This addresses a mobile bug where sections below pinned
 * sections (Manifesto, SelectedWork) would never reveal because their
 * start/end positions were measured before final layout height was known.
 */
export default function ScrollRefresher() {
  useEffect(() => {
    let raf1 = 0;
    let raf2 = 0;
    let timeouts: number[] = [];

    const refresh = () => ScrollTrigger.refresh();

    const scheduleRefresh = () => {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(refresh);
      });
    };

    // Initial: after current paint
    scheduleRefresh();

    // After fonts settle
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(refresh).catch(() => {});
    }

    // After full window load (images, iframes, etc.)
    const onLoad = () => {
      scheduleRefresh();
      // Belt-and-braces: extra refreshes as late content settles
      timeouts.push(window.setTimeout(refresh, 200));
      timeouts.push(window.setTimeout(refresh, 600));
      timeouts.push(window.setTimeout(refresh, 1200));
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    // Watch every <img> for load; mobile layout shifts when images decode
    const imgs = Array.from(document.images);
    const onImg = () => scheduleRefresh();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onImg, { once: true });
    });

    // Resize / orientation change (mobile address-bar show/hide too)
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refresh, 150);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      timeouts.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(resizeTimer);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      imgs.forEach((img) => img.removeEventListener("load", onImg));
    };
  }, []);

  return null;
}
