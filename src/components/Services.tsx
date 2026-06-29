import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  File,
  Palette,
  Plug,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type ServiceKey = "wp" | "woo" | "php" | "xampp" | "theme";

type Service = {
  index: string;
  name: string;
  description: string;
  accent: "green" | "blue";
  key: ServiceKey;
  label: string;
};

const SERVICES: Service[] = [
  {
    index: "01",
    name: "WordPress development",
    description: "Elementor builds, custom theming, and plugin configuration.",
    accent: "green",
    key: "wp",
    label: "wp-admin",
  },
  {
    index: "02",
    name: "WooCommerce & online stores",
    description: "Product catalogs, cart functionality, and payment integration for client stores.",
    accent: "blue",
    key: "woo",
    label: "products",
  },
  {
    index: "03",
    name: "Custom website design",
    description: "Responsive, pixel-perfect layouts built with HTML, CSS, and JavaScript.",
    accent: "green",
    key: "php",
    label: "index.html",
  },
  {
    index: "04",
    name: "Responsive UI development",
    description: "Mobile-first interfaces tested and refined across devices using Chrome DevTools.",
    accent: "blue",
    key: "xampp",
    label: "devtools",
  },
  {
    index: "05",
    name: "Theme customization",
    description: "Tailoring existing themes and templates to match brand identity and client requirements.",
    accent: "green",
    key: "theme",
    label: "elementor",
  },
];

const ACCENT_VAR = { green: "var(--accent-green)", blue: "var(--accent-blue)" } as const;
const TINT_VAR = { green: "var(--bg-tint-green)", blue: "var(--bg-tint-blue)" } as const;

function WpPreview() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileText, label: "Posts" },
    { icon: ImageIcon, label: "Media" },
    { icon: File, label: "Pages" },
    { icon: Palette, label: "Appearance" },
    { icon: Plug, label: "Plugins" },
  ];
  return (
    <div
      className="flex flex-col gap-1.5 font-sans text-[13px]"
      data-lines
      style={{ color: "var(--text-primary)" }}
    >
      {items.map(({ icon: Icon, label, active }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-sm px-2 py-1.5"
          style={{
            background: active ? "var(--bg-tint-blue)" : "transparent",
            color: active ? "var(--accent-blue-soft)" : "var(--text-primary)",
            fontWeight: active ? 600 : 400,
          }}
        >
          <Icon size={14} strokeWidth={2} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function PhpPreview() {
  const Line = ({ children, indent = 0 }: { children: React.ReactNode; indent?: number }) => (
    <div data-lines style={{ paddingLeft: indent * 14 }}>
      {children}
    </div>
  );
  const KW = ({ children }: { children: React.ReactNode }) => (
    <span style={{ color: "var(--code-keyword)" }}>{children}</span>
  );
  const STR = ({ children }: { children: React.ReactNode }) => (
    <span style={{ color: "var(--code-string)" }}>{children}</span>
  );
  const MUTED = ({ children }: { children: React.ReactNode }) => (
    <span style={{ color: "var(--code-muted)" }}>{children}</span>
  );
  return (
    <div
      className="text-[12.5px] leading-[1.7]"
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: "var(--text-primary)",
      }}
    >
      <Line>
        <KW>function</KW> validate_email(<MUTED>$email</MUTED>) {"{"}
      </Line>
      <Line indent={1}>
        <KW>if</KW> (<KW>empty</KW>(<MUTED>$email</MUTED>)) {"{"}
      </Line>
      <Line indent={2}>
        <KW>return</KW> <STR>'Email required'</STR>;
      </Line>
      <Line indent={1}>{"}"}</Line>
      <Line indent={1}>
        <KW>if</KW> (!filter_var(<MUTED>$email</MUTED>, FILTER_VALIDATE_EMAIL)) {"{"}
      </Line>
      <Line indent={2}>
        <KW>return</KW> <STR>'Invalid format'</STR>;
      </Line>
      <Line indent={1}>{"}"}</Line>
      <Line indent={1}>
        <KW>return</KW> <KW>true</KW>;
      </Line>
      <Line>{"}"}</Line>
    </div>
  );
}

function XamppPreview() {
  const services = [
    { name: "Apache", running: true },
    { name: "MySQL", running: true },
    { name: "FileZilla", running: false },
  ];
  return (
    <div
      className="flex flex-col gap-2 font-sans text-[13px]"
      style={{ color: "var(--text-primary)" }}
    >
      <div
        className="flex items-center justify-between border-b pb-1.5 text-[10px] uppercase tracking-[0.16em]"
        style={{ borderColor: "var(--border-hairline)", color: "var(--text-secondary)" }}
      >
        <span>Module</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      {services.map((s) => (
        <div
          key={s.name}
          data-lines
          className="flex items-center justify-between rounded-sm px-1 py-1.5"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: s.running ? "var(--status-on)" : "var(--status-off)" }}
            />
            <span className="font-medium">{s.name}</span>
          </div>
          <span
            className="text-[11px] uppercase tracking-[0.1em]"
            style={{ color: "var(--text-secondary)" }}
          >
            {s.running ? "Running" : "Stopped"}
          </span>
          <span
            className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              borderColor: s.running ? "var(--status-on)" : "var(--card-border)",
              color: s.running ? "var(--status-on)" : "var(--text-secondary)",
            }}
          >
            {s.running ? "Stop" : "Start"}
          </span>
        </div>
      ))}
    </div>
  );
}

function WooPreview() {
  const products = [
    { name: "Linen Tote", price: "$24", stock: "In stock", color: "var(--accent-green-soft)" },
    { name: "Studio Mug", price: "$18", stock: "In stock", color: "var(--accent-blue-soft)" },
    { name: "Theme Pack", price: "$49", stock: "In stock", color: "var(--accent-green)" },
  ];

  return (
    <div className="flex flex-col gap-2 font-sans text-[13px]" style={{ color: "var(--text-primary)" }}>
      <div
        className="grid grid-cols-[1fr_auto_auto] gap-3 border-b pb-1.5 text-[10px] uppercase tracking-[0.16em]"
        style={{ borderColor: "var(--border-hairline)", color: "var(--text-secondary)" }}
      >
        <span>Product</span>
        <span>Price</span>
        <span>Status</span>
      </div>
      {products.map((product) => (
        <div
          key={product.name}
          data-lines
          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-sm px-1 py-1.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="h-8 w-8 shrink-0 rounded-sm"
              style={{ background: product.color, opacity: 0.9 }}
            />
            <span className="min-w-0 font-medium">{product.name}</span>
          </div>
          <span className="font-mono text-[12px]" style={{ color: "var(--text-primary)" }}>
            {product.price}
          </span>
          <span
            className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{ borderColor: "var(--status-on)", color: "var(--status-on)" }}
          >
            {product.stock}
          </span>
        </div>
      ))}
    </div>
  );
}

function ThemePreview() {
  const widgets = [
    { icon: FileText, label: "Heading" },
    { icon: ImageIcon, label: "Image" },
    { icon: ArrowUpRight, label: "Button" },
    { icon: LayoutDashboard, label: "Columns" },
  ];

  return (
    <div className="flex h-full gap-3 font-sans text-[13px]" style={{ color: "var(--text-primary)" }}>
      <aside
        className="flex w-[148px] shrink-0 flex-col gap-2 border-r pr-3"
        style={{ borderColor: "var(--border-hairline)" }}
      >
        <div
          className="pb-1 text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Widgets
        </div>
        {widgets.map(({ icon: Icon, label }) => (
          <div
            key={label}
            data-lines
            className="flex items-center gap-2 rounded-sm px-2 py-2"
            style={{ background: label === "Heading" ? "var(--bg-tint-green)" : "transparent" }}
          >
            <Icon size={14} strokeWidth={2} style={{ color: "var(--accent-green-soft)" }} />
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-2" data-lines>
        <div className="h-5 w-24 rounded-sm" style={{ background: "var(--accent-green-soft)" }} />
        <div className="h-14 rounded-sm" style={{ background: "var(--card-bg)" }} />
        <div className="grid grid-cols-2 gap-2">
          <span className="h-14 rounded-sm" style={{ background: "var(--bg-tint-blue)" }} />
          <span className="h-14 rounded-sm" style={{ background: "var(--bg-tint-green)" }} />
        </div>
        <div className="mt-1 h-7 w-20 rounded-sm" style={{ background: "var(--accent-blue-soft)" }} />
      </div>
    </div>
  );
}

function PreviewContent({ k }: { k: ServiceKey }) {
  if (k === "wp") return <WpPreview />;
  if (k === "woo") return <WooPreview />;
  if (k === "php") return <PhpPreview />;
  if (k === "theme") return <ThemePreview />;
  return <XamppPreview />;
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const labelTextRef = useRef<HTMLSpanElement>(null);
  const [activeKey, setActiveKey] = useState<ServiceKey>(SERVICES[0].key);
  const activeKeyRef = useRef<ServiceKey>(SERVICES[0].key);
  const [expandedKey, setExpandedKey] = useState<ServiceKey | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setExpandedKey(null);
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      rowRefs.current.forEach((row, i) => {
        if (!row) return;
        const name = row.querySelector<HTMLElement>("[data-name]");
        if (name) {
          gsap.fromTo(
            name,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 1,
              ease: "power4.out",
              delay: i * 0.1,
              immediateRender: false,
              scrollTrigger: { trigger: row, start: "top 95%", once: true },
            },
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);


  const movePanelTo = (row: HTMLDivElement) => {
    const list = listRef.current;
    const panel = panelRef.current;
    if (!list || !panel) return;
    const listRect = list.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const y = rowRect.top - listRect.top + rowRect.height / 2 - panel.offsetHeight / 2;
    gsap.to(panel, { y, duration: 0.4, ease: "power3.out", overwrite: "auto" });
  };

  const showPanel = () => {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.to(panel, {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
      pointerEvents: "auto",
      overwrite: "auto",
    });
  };

  const hidePanel = () => {
    const panel = panelRef.current;
    if (!panel) return;
    gsap.to(panel, {
      opacity: 0,
      scale: 0.96,
      duration: 0.2,
      ease: "power2.in",
      pointerEvents: "none",
      overwrite: "auto",
    });
  };

  const requestSwap = (next: ServiceKey, nextLabel: string) => {
    if (activeKeyRef.current === next) return;
    activeKeyRef.current = next;
    const content = contentRef.current;
    const label = labelTextRef.current;
    if (!content) {
      setActiveKey(next);
      return;
    }
    gsap.to(content, {
      opacity: 0,
      scale: 0.97,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        if (label) label.textContent = nextLabel;
        setActiveKey(next);
        requestAnimationFrame(() => {
          const lines = content.querySelectorAll<HTMLElement>("[data-lines]");
          gsap.fromTo(
            content,
            { opacity: 0, scale: 0.97 },
            { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" },
          );
          if (lines.length) {
            gsap.fromTo(
              lines,
              { y: 8, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.3, ease: "power2.out", stagger: 0.04 },
            );
          }
        });
      },
    });
  };

  const handleRowEnter = (i: number, s: Service) => {
    const row = rowRefs.current[i];
    if (!row) return;
    gsap.to(row, { backgroundColor: TINT_VAR[s.accent], duration: 0.3, ease: "power2.out" });
    gsap.to(row.querySelector("[data-index]"), { x: -6, duration: 0.4, ease: "power2.out" });
    gsap.to(row.querySelector("[data-desc]"), { x: 6, duration: 0.4, ease: "power2.out" });
    gsap.to(row.querySelector("[data-arrow]"), {
      scale: 1.5,
      rotate: 0,
      duration: 0.3,
      ease: "power2.out",
    });
    requestSwap(s.key, s.label);
    movePanelTo(row);
    showPanel();
  };

  const handleRowLeave = (i: number) => {
    const row = rowRefs.current[i];
    if (!row) return;
    gsap.to(row, { backgroundColor: "rgba(0,0,0,0)", duration: 0.3, ease: "power2.out" });
    gsap.to(row.querySelector("[data-index]"), { x: 0, duration: 0.4, ease: "power2.out" });
    gsap.to(row.querySelector("[data-desc]"), { x: 0, duration: 0.4, ease: "power2.out" });
    gsap.to(row.querySelector("[data-arrow]"), {
      scale: 1,
      rotate: -45,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative min-h-[75vh] overflow-hidden px-8 py-4 md:px-14 lg:min-h-0 lg:py-32"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <h2
        className="relative z-10 text-[11px] font-medium uppercase tracking-[0.28em]"
        style={{ color: "var(--text-secondary)" }}
      >
        What I Do
      </h2>

      <div
        ref={listRef}
        className="relative z-10 mt-16"
        onMouseLeave={isDesktop ? hidePanel : undefined}
      >
        {SERVICES.map((s, i) => {
          const isExpanded = !isDesktop && expandedKey === s.key;
          return (
            <div key={s.index} className="border-t" style={{ borderColor: "var(--border-hairline)", borderTopWidth: "0.5px", borderBottomWidth: i === SERVICES.length - 1 ? "0.5px" : "0" }}>
              <div
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                onMouseEnter={isDesktop ? () => handleRowEnter(i, s) : undefined}
                onMouseLeave={isDesktop ? () => handleRowLeave(i) : undefined}
                onClick={
                  isDesktop
                    ? undefined
                    : () => setExpandedKey((cur) => (cur === s.key ? null : s.key))
                }
                role={isDesktop ? undefined : "button"}
                aria-expanded={isDesktop ? undefined : isExpanded}
                className="group relative flex cursor-pointer items-center gap-4 px-2 sm:gap-6 sm:px-4 md:gap-8 md:px-6"
                style={{ minHeight: 66 }}
              >
                <span
                  data-index
                  className="font-sans font-light will-change-transform"
                  style={{
                    fontSize: "clamp(0.85rem, 1.4vw, 1.25rem)",
                    flex: "0 0 36px",
                    color: "var(--text-muted)",
                  }}
                >
                  {s.index}
                </span>

                <h3
                  data-name
                  className="font-sans font-extrabold leading-[1.1] tracking-tight"
                  style={{
                    fontSize: "clamp(1.05rem, 3.3vw, 32px)",
                    letterSpacing: "-0.02em",
                    flex: "1 1 0%",
                    minWidth: 0,
                    color: "var(--text-primary)",
                  }}
                >
                  {s.name}
                </h3>

                <p
                  data-desc
                  className="hidden text-[13px] leading-[1.5] will-change-transform lg:block"
                  style={{ flex: "0 0 320px", maxWidth: 320, color: "var(--text-secondary)" }}
                >
                  {s.description}
                </p>

                <div
                  data-arrow
                  className="shrink-0 will-change-transform"
                  style={{
                    color: ACCENT_VAR[s.accent],
                    transform: isExpanded ? "rotate(45deg)" : "rotate(-45deg)",
                    transition: !isDesktop ? "transform 0.3s ease" : undefined,
                    flex: "0 0 32px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <ArrowUpRight size={16} strokeWidth={2} />
                </div>
              </div>

              {/* Inline tap-to-reveal preview (mobile/tablet only) */}
              {!isDesktop && (
                <div
                  className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                  style={{
                    maxHeight: isExpanded ? 460 : 0,
                    opacity: isExpanded ? 1 : 0,
                  }}
                >
                  <div className="px-2 pb-6 pt-2 sm:px-4">
                    <p className="mb-4 text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {s.description}
                    </p>
                    <div
                      className="relative overflow-hidden"
                      style={{
                        height: 260,
                        borderRadius: 12,
                        border: "1px solid var(--card-border)",
                        backgroundColor: "var(--bg-raised)",
                      }}
                    >
                      <div
                        className="absolute left-3 top-3 z-10 flex items-center justify-between rounded px-2 py-0.5"
                        style={{ background: "var(--text-primary)" }}
                      >
                        <span
                          style={{
                            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                            fontSize: 10,
                            letterSpacing: "0.04em",
                            color: "var(--bg-base)",
                          }}
                        >
                          {s.label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedKey(null);
                        }}
                        aria-label="Close preview"
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs"
                        style={{
                          background: "var(--bg-base)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--card-border)",
                        }}
                      >
                        ✕
                      </button>
                      <div className="absolute inset-0 overflow-hidden px-5 pb-5 pt-12">
                        <PreviewContent k={s.key} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Desktop floating hover panel */}
        {isDesktop && (
          <div
            ref={panelRef}
            className="pointer-events-none absolute overflow-hidden"
            style={{
              top: 0,
              left: "62%",
              width: 360,
              height: 280,
              borderRadius: 12,
              border: "1px solid var(--card-border)",
              backgroundColor: "var(--bg-raised)",
              opacity: 0,
              transform: "scale(0.96)",
              zIndex: 20,
            }}
          >
            <div
              className="absolute left-3 top-3 z-10 rounded px-2 py-0.5"
              style={{ background: "var(--text-primary)" }}
            >
              <span
                ref={labelTextRef}
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 10,
                  letterSpacing: "0.04em",
                  color: "var(--bg-base)",
                }}
              >
                {SERVICES[0].label}
              </span>
            </div>

            <div
              ref={contentRef}
              className="absolute inset-0 overflow-hidden px-5 pb-5 pt-12"
              style={{ willChange: "transform, opacity" }}
            >
              <PreviewContent k={activeKey} />
            </div>
          </div>
        )}
      </div>

    </section>
  );
}
