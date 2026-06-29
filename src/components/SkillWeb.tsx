import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Category = "frontend" | "backend";
type SkillNode = {
  id: string;
  label: string;
  size: number;
  category: Category;
  hub?: boolean;
};

const NODES: SkillNode[] = [
  { id: "wordpress", label: "WordPress", size: 120, category: "frontend", hub: true },
  { id: "html", label: "HTML5", size: 90, category: "frontend" },
  { id: "css", label: "CSS3", size: 90, category: "frontend" },
  { id: "js", label: "JavaScript", size: 90, category: "frontend" },
  { id: "bootstrap", label: "Bootstrap", size: 90, category: "frontend" },
  { id: "elementor", label: "Elementor", size: 90, category: "frontend" },
  { id: "woocommerce", label: "WooCommerce", size: 90, category: "frontend" },
  { id: "php", label: "PHP", size: 90, category: "backend" },
  { id: "csharp", label: "C#", size: 70, category: "backend" },
  { id: "aspnet", label: "ASP.NET Core", size: 82, category: "backend" },
  { id: "cpp", label: "C++", size: 70, category: "backend" },
  { id: "git", label: "Git", size: 70, category: "backend" },
  { id: "github", label: "GitHub", size: 70, category: "backend" },
  { id: "vscode", label: "VS Code", size: 70, category: "backend" },
  { id: "xampp", label: "XAMPP", size: 70, category: "backend" },
  { id: "devtools", label: "Chrome DevTools", size: 82, category: "backend" },
];

// Edges (undirected). All non-hub nodes also connect to wordpress (added below).
const SECONDARY_EDGES: [string, string][] = [
  ["html", "css"],
  ["css", "js"],
  ["js", "bootstrap"],
  ["html", "bootstrap"],
  ["woocommerce", "elementor"],
  ["csharp", "aspnet"],
  ["git", "github"],
  ["vscode", "git"],
  ["php", "xampp"],
];

const EDGES: [string, string][] = [
  ...NODES.filter((n) => !n.hub).map((n) => ["wordpress", n.id] as [string, string]),
  ...SECONDARY_EDGES,
];

type Pos = { x: number; y: number };

function computeLayout(width: number, height: number): Record<string, Pos> {
  const cx = width / 2;
  const cy = height / 2;
  const pos: Record<string, Pos> = {};

  // Initial placement: hub center, others on ring with small jitter
  const others = NODES.filter((n) => !n.hub);
  others.forEach((n, i) => {
    const angle = (i / others.length) * Math.PI * 2;
    const r = Math.min(width, height) * 0.35;
    pos[n.id] = {
      x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 30,
      y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 30,
    };
  });
  pos["wordpress"] = { x: cx, y: cy };

  // Build adjacency
  const adj: Record<string, string[]> = {};
  NODES.forEach((n) => (adj[n.id] = []));
  EDGES.forEach(([a, b]) => {
    adj[a].push(b);
    adj[b].push(a);
  });

  const sizeMap = Object.fromEntries(NODES.map((n) => [n.id, n.size]));

  // Force-directed iterations
  const iterations = 220;
  const repulsion = 18000;
  const springLen = Math.min(width, height) * 0.22;
  const springK = 0.04;
  const damping = 0.82;
  const vel: Record<string, Pos> = {};
  NODES.forEach((n) => (vel[n.id] = { x: 0, y: 0 }));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        const a = NODES[i].id;
        const b = NODES[j].id;
        const dx = pos[a].x - pos[b].x;
        const dy = pos[a].y - pos[b].y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDist = (sizeMap[a] + sizeMap[b]) / 2 + 20;
        const f = repulsion / (dist * dist);
        const fx = (dx / dist) * f;
        const fy = (dy / dist) * f;
        vel[a].x += fx;
        vel[a].y += fy;
        vel[b].x -= fx;
        vel[b].y -= fy;
        // Hard separation
        if (dist < minDist) {
          const push = (minDist - dist) / 2;
          vel[a].x += (dx / dist) * push;
          vel[a].y += (dy / dist) * push;
          vel[b].x -= (dx / dist) * push;
          vel[b].y -= (dy / dist) * push;
        }
      }
    }
    // Spring attraction
    EDGES.forEach(([a, b]) => {
      const dx = pos[b].x - pos[a].x;
      const dy = pos[b].y - pos[a].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const target = a === "wordpress" || b === "wordpress" ? springLen * 0.85 : springLen;
      const f = (dist - target) * springK;
      const fx = (dx / dist) * f;
      const fy = (dy / dist) * f;
      vel[a].x += fx;
      vel[a].y += fy;
      vel[b].x -= fx;
      vel[b].y -= fy;
    });
    // Center pull
    NODES.forEach((n) => {
      const dx = cx - pos[n.id].x;
      const dy = cy - pos[n.id].y;
      vel[n.id].x += dx * 0.005;
      vel[n.id].y += dy * 0.005;
    });
    // Apply velocity with damping; pin hub
    NODES.forEach((n) => {
      if (n.hub) {
        pos[n.id].x = cx;
        pos[n.id].y = cy;
        vel[n.id] = { x: 0, y: 0 };
        return;
      }
      vel[n.id].x *= damping;
      vel[n.id].y *= damping;
      pos[n.id].x += vel[n.id].x * 0.05;
      pos[n.id].y += vel[n.id].y * 0.05;
      // Bounds
      const half = sizeMap[n.id] / 2 + 8;
      pos[n.id].x = Math.max(half, Math.min(width - half, pos[n.id].x));
      pos[n.id].y = Math.max(half, Math.min(height - half, pos[n.id].y));
    });
  }

  return pos;
}

export default function SkillWeb() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lineRefs = useRef<Record<string, SVGLineElement | null>>({});
  const restPos = useRef<Record<string, Pos>>({});
  const currentPos = useRef<Record<string, Pos>>({});
  const mouse = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const hasFinePointer = () =>
      window.matchMedia("(hover: hover)").matches && !window.matchMedia("(pointer: coarse)").matches;
    let isDesktop = hasFinePointer();

    const updateLines = () => {
      EDGES.forEach(([a, b]) => {
        const key = `${a}-${b}`;
        const line = lineRefs.current[key];
        if (!line) return;
        const pa = currentPos.current[a];
        const pb = currentPos.current[b];
        if (!pa || !pb) return;
        line.setAttribute("x1", String(pa.x));
        line.setAttribute("y1", String(pa.y));
        line.setAttribute("x2", String(pb.x));
        line.setAttribute("y2", String(pb.y));
      });
    };

    const setup = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      const layout = computeLayout(w, h);
      restPos.current = layout;
      currentPos.current = JSON.parse(JSON.stringify(layout));

      NODES.forEach((n) => {
        const node = nodeRefs.current[n.id];
        if (!node) return;
        gsap.set(node, {
          x: layout[n.id].x - n.size / 2,
          y: layout[n.id].y - n.size / 2,
          opacity: 0,
          scale: 0,
        });
      });

      updateLines();
    };

    setup();

    // Entry animation
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 80%",
        once: true,
        onEnter: () => {
          NODES.forEach((n) => {
            const node = nodeRefs.current[n.id];
            if (!node) return;
            gsap.to(node, {
              opacity: 1,
              scale: 1,
              duration: 0.7,
              ease: "back.out(1.4)",
              delay: Math.random() * 0.6,
            });
          });
          EDGES.forEach(([a, b], i) => {
            const key = `${a}-${b}`;
            const line = lineRefs.current[key];
            if (!line) return;
            const len = Math.hypot(
              currentPos.current[a].x - currentPos.current[b].x,
              currentPos.current[a].y - currentPos.current[b].y,
            );
            line.style.strokeDasharray = String(len);
            line.style.strokeDashoffset = String(len);
            gsap.to(line, {
              strokeDashoffset: 0,
              opacity: 0.6,
              duration: 0.8,
              ease: "power2.out",
              delay: 0.4 + i * 0.03,
            });
          });
        },
      });
    }, el);

    // Mouse magnetic interaction (fine-pointer devices)
    const RADIUS = 150;
    const MAX_DISPLACE = 30;
    const LERP = 0.18; // smoothing factor per frame

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left;
      mouse.current.y = e.clientY - rect.top;
      mouse.current.active = true;
    };
    const onLeave = () => {
      mouse.current.active = false;
    };

    const tick = () => {
      const m = mouse.current;
      NODES.forEach((n) => {
        if (n.hub) return;
        const rest = restPos.current[n.id];
        const cur = currentPos.current[n.id];
        const node = nodeRefs.current[n.id];
        if (!rest || !cur || !node) return;

        // Target position: displaced if mouse near, otherwise rest
        let tx = rest.x;
        let ty = rest.y;
        if (m.active) {
          const dx = rest.x - m.x;
          const dy = rest.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS && dist > 0.1) {
            const force = (1 - dist / RADIUS) * MAX_DISPLACE;
            tx = rest.x + (dx / dist) * force;
            ty = rest.y + (dy / dist) * force;
          }
        }

        // Lerp current toward target every frame — no tweens to fight with
        cur.x += (tx - cur.x) * LERP;
        cur.y += (ty - cur.y) * LERP;
        gsap.set(node, { x: cur.x - n.size / 2, y: cur.y - n.size / 2 });
      });
      updateLines();
    };

    const attachPointer = () => {
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
    };
    const detachPointer = () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      mouse.current.active = false;
    };
    if (isDesktop) attachPointer();
    gsap.ticker.add(tick);

    const onResize = () => {
      const next = hasFinePointer();
      if (next !== isDesktop) {
        isDesktop = next;
        if (next) attachPointer();
        else detachPointer();
      }
      setup();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      detachPointer();
      gsap.ticker.remove(tick);
      ctx.revert();
    };
  }, []);

  const handleNodeEnter = (id: string) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const node = nodeRefs.current[id];
    const cat = NODES.find((n) => n.id === id)?.category;
    const accent = cat === "frontend" ? "var(--accent-green)" : "var(--accent-blue)";
    if (node) {
      gsap.to(node, {
        scale: 1.1,
        borderColor: accent,
        color: accent,
        duration: 0.3,
        ease: "power2.out",
      });
    }
    EDGES.forEach(([a, b]) => {
      if (a === id || b === id) {
        const line = lineRefs.current[`${a}-${b}`];
        if (!line) return;
        gsap.to(line, { strokeWidth: 2, stroke: accent, opacity: 1, duration: 0.3 });
      }
    });
  };

  const handleNodeLeave = (id: string) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const node = nodeRefs.current[id];
    const nodeData = NODES.find((n) => n.id === id);
    if (node) {
      gsap.to(node, {
        scale: 1,
        borderColor: nodeData?.hub
          ? "var(--accent-green)"
          : "var(--border-hairline)",
        color: "var(--text-secondary)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
    EDGES.forEach(([a, b]) => {
      if (a === id || b === id) {
        const line = lineRefs.current[`${a}-${b}`];
        if (!line) return;
        gsap.to(line, {
          strokeWidth: 1,
          stroke: "var(--border-hairline)",
          opacity: 0.6,
          duration: 0.3,
        });
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: "60vh", minHeight: 480 }}
    >
      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {EDGES.map(([a, b]) => {
          const key = `${a}-${b}`;
          return (
            <line
              key={key}
              ref={(el) => {
                lineRefs.current[key] = el;
              }}
              stroke="var(--border-hairline)"
              strokeWidth={1}
              opacity={0}
              style={{ transition: "none" }}
            />
          );
        })}
      </svg>
      {NODES.map((n) => {
        const isMultiWord = n.label.includes(" ") || n.label.includes(".");
        return (
          <div
            key={n.id}
            ref={(el) => {
              nodeRefs.current[n.id] = el;
            }}
            onMouseEnter={() => handleNodeEnter(n.id)}
            onMouseLeave={() => handleNodeLeave(n.id)}
            className="absolute flex items-center justify-center rounded-full text-center font-medium uppercase tracking-[0.08em]"
            style={{
              width: n.size,
              height: n.size,
              top: 0,
              left: 0,
              border: n.hub
                ? "1.5px solid var(--accent-green)"
                : "1px solid var(--border-hairline)",
              backgroundColor: "var(--bg-raised)",
              color: n.hub ? "var(--text-primary)" : "var(--text-secondary)",
              fontSize: n.hub ? 13 : isMultiWord ? 9 : n.size >= 90 ? 11 : 10,
              fontWeight: n.hub ? 700 : 500,
              padding: 8,
              lineHeight: 1.1,
              cursor: "pointer",
              willChange: "transform",
              userSelect: "none",
              overflow: "hidden",
              wordBreak: "break-word",
            }}
          >
            <span style={{ maxWidth: "82%", display: "block" }}>{n.label}</span>
          </div>
        );
      })}
    </div>
  );
}
