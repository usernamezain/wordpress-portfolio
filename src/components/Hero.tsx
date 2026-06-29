import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threadSvgRef = useRef<SVGSVGElement>(null);
  const threadPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Word reveal via clip-path
      const words = headlineRef.current?.querySelectorAll<HTMLElement>("[data-word]") ?? [];
      gsap.set(words, { clipPath: "inset(0 100% 0 0)", y: "0.1em" });
      gsap.set([subRef.current, linksRef.current], { opacity: 0, y: 20 });

      const tl = gsap.timeline();
      tl.to(words, {
        clipPath: "inset(0 0% 0 0)",
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.12,
      })
        .to(
          subRef.current,
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
          "-=0.4",
        )
        .to(
          linksRef.current?.children ?? [],
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1 },
          "-=0.5",
        );

      // Pulsing dot
      if (dotRef.current) {
        gsap.to(dotRef.current, {
          scale: 1.6,
          opacity: 0.5,
          duration: 1.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      // Mouse parallax tilt — desktop only (>=1024px)
      const desktopMQ = window.matchMedia("(min-width: 1024px)");
      const baseTilt = -3;
      const tiltX = gsap.quickTo(tiltRef.current, "rotate", { duration: 0.6, ease: "power3.out" });
      const onMove = (e: MouseEvent) => {
        if (!desktopMQ.matches) return;
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        tiltX(baseTilt + nx * 2);
      };
      window.addEventListener("mousemove", onMove);

      // Scroll scrub
      gsap.to(rootRef.current, {
        scale: 0.96,
        opacity: 0.7,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      return () => {
        window.removeEventListener("mousemove", onMove);
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);


  // Three.js drifting particles — skip on small screens for performance
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(max-width: 767px)").matches) {
      canvas.style.display = "none";
      return;
    }


    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 10;

    const count = 320;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const rootStyle = () => getComputedStyle(document.documentElement);
    const getColors = () => ({
      a: new THREE.Color((rootStyle().getPropertyValue("--grain-color-a") || "#3B6D11").trim()),
      b: new THREE.Color((rootStyle().getPropertyValue("--grain-color-b") || "#0C447C").trim()),
    });
    const pick = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      pick[i] = Math.random() > 0.5 ? 1 : 0;
    }
    const fillColors = () => {
      const { a, b } = getColors();
      for (let i = 0; i < count; i++) {
        const c = pick[i] === 1 ? a : b;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }
    };
    fillColors();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Update grain canvas opacity from CSS var, plus re-color on theme change.
    const applyGrainOpacity = () => {
      const op = parseFloat(rootStyle().getPropertyValue("--grain-opacity") || "0.07");
      canvas.style.opacity = String(op);
    };
    applyGrainOpacity();

    const onTheme = () => {
      fillColors();
      (geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
      applyGrainOpacity();
    };
    window.addEventListener("themechange", onTheme);

    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      points.rotation.y = t * 0.02;
      points.rotation.x = Math.sin(t * 0.1) * 0.05;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < count; i++) {
        pos.array[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.0008;
      }
      pos.needsUpdate = true;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("themechange", onTheme);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  // Cursor thread (snake-like trail) — hero only, desktop only (>=1024px)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none), (pointer: coarse), (max-width: 1023px)").matches) return;


    const root = rootRef.current;
    const svg = threadSvgRef.current;
    const path = threadPathRef.current;
    if (!root || !svg || !path) return;

    const SEG = 10;
    const points = Array.from({ length: SEG }, () => ({ x: -100, y: -100 }));
    const target = { x: -100, y: -100 };
    let inside = false;
    let settleTween: gsap.core.Tween | null = null;

    const buildPath = () => {
      // Catmull-Rom to Bezier
      const p = points;
      if (p.length < 2) return "";
      let d = `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`;
      for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[i - 1] ?? p[i];
        const p1 = p[i];
        const p2 = p[i + 1];
        const p3 = p[i + 2] ?? p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      }
      return d;
    };

    const tick = () => {
      // Lead point eases toward cursor; each subsequent eases toward previous with increasing lag
      const baseLead = 0.35;
      points[0].x += (target.x - points[0].x) * baseLead;
      points[0].y += (target.y - points[0].y) * baseLead;
      for (let i = 1; i < SEG; i++) {
        const ease = baseLead - i * 0.025; // decreasing follow strength = more lag
        const e = Math.max(0.05, ease);
        points[i].x += (points[i - 1].x - points[i].x) * e;
        points[i].y += (points[i - 1].y - points[i].y) * e;
      }
      path.setAttribute("d", buildPath());
    };

    gsap.ticker.add(tick);

    const onMove = (e: MouseEvent) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const within =
        e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (within) {
        if (!inside) {
          inside = true;
          // initialize points to cursor to avoid snap from offscreen
          for (let i = 0; i < SEG; i++) {
            points[i].x = x;
            points[i].y = y;
          }
          gsap.to(svg, { opacity: 1, duration: 0.3, ease: "power2.out" });
        }
        if (settleTween) {
          settleTween.kill();
          settleTween = null;
        }
        target.x = x;
        target.y = y;

        // schedule settle if no movement
        clearTimeout((onMove as any)._t);
        (onMove as any)._t = setTimeout(() => {
          // elastic settle: relax trailing points behind the lead
          settleTween = gsap.to(
            {},
            {
              duration: 0.4,
              ease: "elastic.out(1, 0.4)",
              onUpdate: () => {
                // pull target a hair to keep tick flowing; trailing points naturally line up
              },
            },
          );
        }, 80);
      } else if (inside) {
        inside = false;
        gsap.to(svg, { opacity: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    const onLeave = () => {
      if (inside) {
        inside = false;
        gsap.to(svg, { opacity: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onLeave, { passive: true });

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onLeave);
      clearTimeout((onMove as any)._t);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden lg:min-h-screen"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        id="hero-grain-canvas"
        className="pointer-events-none fixed inset-0 h-full w-full"
        style={{ opacity: 0.07 }}
        aria-hidden="true"
      />

      {/* Cursor thread (hero-only) */}
      <svg
        ref={threadSvgRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full opacity-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="thread-gradient" gradientUnits="userSpaceOnUse">
            <stop offset="0%" style={{ stopColor: "var(--accent-green)" }} stopOpacity="1" />
            <stop offset="100%" style={{ stopColor: "var(--accent-green)" }} stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          ref={threadPathRef}
          fill="none"
          stroke="url(#thread-gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-8 pt-8 md:px-14">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold tracking-[0.18em]">AYESHA</span>
          <span
            ref={dotRef}
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "var(--accent-green)" }}
            aria-hidden="true"
          />
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex min-h-[75vh] flex-col justify-center px-8 py-4 md:px-14 lg:min-h-[calc(100vh-6rem)] lg:py-0">
        <div ref={tiltRef} className="origin-left will-change-transform" style={{ transform: "rotate(-3deg)" }}>
          <h1
            ref={headlineRef}
            className="font-sans font-extrabold leading-[0.88] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 11vw, 14rem)", wordBreak: "keep-all" }}
          >

            <span data-word className="inline-block">I&nbsp;</span>
            <span
              data-word
              className="inline-block italic"
              style={{
                fontFamily: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
                fontWeight: 400,
                color: "var(--accent-green)",
              }}
            >
              engineer
            </span>
            <br />
            <span
              data-word
              className="inline-block"
              style={{ fontSize: "1.35em", letterSpacing: "-0.04em" }}
            >
              WORDPRESS.
            </span>
          </h1>
        </div>

        <p
          ref={subRef}
          className="mt-10 max-w-[460px] text-sm leading-relaxed md:text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Frontend developer and WordPress specialist with 1+ year of freelance experience — building responsive sites and custom WooCommerce stores with clean code and pixel-perfect UI.
        </p>

        <div ref={linksRef} className="mt-8 flex items-center gap-5 text-sm font-medium">
          <a href="#work" className="nav-link relative" style={{ color: "var(--accent-green)" }}>
            View work →
          </a>
          <span
            className="h-4 w-px"
            style={{ backgroundColor: "var(--border-hairline)" }}
            aria-hidden="true"
          />
          <a href="#contact" className="nav-link relative" style={{ color: "var(--text-primary)" }}>
            Let's talk
          </a>
        </div>
      </main>

      <style>{`
        .nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -3px;
          height: 1px;
          width: 100%;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .nav-link:hover::after { transform: scaleX(1); }
      `}</style>
    </div>
  );
}
