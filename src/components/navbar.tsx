import { useEffect, useRef, useState } from "react";
import { Github, Linkedin, FileText, Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { NAV_ITEMS, navNumber } from "@/lib/nav-config";

const SECTIONS = NAV_ITEMS;
const DESKTOP_SECTIONS = NAV_ITEMS.filter((s) => s.desktop);
const TOTAL_SECTIONS = NAV_ITEMS.length;

const DURATION = 800;
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function Navbar() {
  const [active, setActive] = useState<string>("");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lockRef = useRef(false);
  const lockTimeoutRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const smoothScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Lock observer during programmatic scroll; do NOT change active state yet.
    // Active state updates only once we settle on the destination.
    lockRef.current = true;
    if (lockTimeoutRef.current) window.clearTimeout(lockTimeoutRef.current);
    const settle = () => {
      setActive(id);
      lockRef.current = false;
      lockTimeoutRef.current = null;
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetY = el.getBoundingClientRect().top + window.scrollY - 56;
    if (history.replaceState) history.replaceState(null, "", `#${id}`);
    if (reduce) {
      window.scrollTo(0, targetY);
      lockTimeoutRef.current = window.setTimeout(settle, 80);
      return;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const startY = window.scrollY;
    const delta = targetY - startY;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      window.scrollTo(0, startY + delta * easeInOut(t));
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else {
        rafRef.current = null;
        // Buffer swallows trailing scroll/observer callbacks after settle
        lockTimeoutRef.current = window.setTimeout(settle, 180);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const obs = new IntersectionObserver(
      (entries) => {
        if (lockRef.current) return;
        // Pick the intersecting section whose center is closest to viewport center
        const center = window.innerHeight / 2;
        let bestId: string | null = null;
        let bestDist = Infinity;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const r = e.boundingClientRect;
          const dist = Math.abs(r.top + r.height / 2 - center);
          if (dist < bestDist) {
            bestDist = dist;
            bestId = e.target.id;
          }
        });
        if (bestId) setActive(bestId);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.01, 0.5, 1] },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });

    const docClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const a = target?.closest("a") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#") || href.length < 2) return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      ev.preventDefault();
      smoothScrollTo(id);
    };
    document.addEventListener("click", docClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", docClick);
      obs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (lockTimeoutRef.current) window.clearTimeout(lockTimeoutRef.current);
    };
  }, []);

  // ESC + body scroll lock while open
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <>
      {/* ============= DESKTOP / TABLET NAV (>=768px) ============= */}
      <header
        className="sticky top-0 z-50 hidden md:block"
        style={{
          background: scrolled
            ? "color-mix(in oklab, var(--background) 70%, transparent)"
            : "transparent",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px) saturate(140%)" : "none",
          transition: "background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease",
        }}
      >
        <div className="container-page grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <a href="#top" className="flex min-w-0 items-center gap-2 font-plex text-sm">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent animate-pulse" />
            <span className="truncate text-foreground">guptaaryandra</span>
            <span className="text-muted-foreground shrink-0">@cloud:~$</span>
          </a>
          <nav className="nav-center flex font-mono text-[12px]" data-scrolled={scrolled}>
            {DESKTOP_SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-active={active === s.id}
                onClick={(e) => handleAnchor(e, s.id)}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center justify-end gap-2">
            <a
              href="https://github.com/guptaaryandra"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:border-accent hover:text-accent text-muted-foreground transition-all hover:-translate-y-0.5"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://linkedin.com/in/gupta-aryandra/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:border-accent hover:text-accent text-muted-foreground transition-all hover:-translate-y-0.5"
            >
              <Linkedin className="h-3.5 w-3.5" />
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              aria-label="Resume"
              className="hidden lg:flex h-8 items-center gap-1.5 rounded-md border border-border hover:border-accent px-2.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              <FileText className="h-3 w-3" />
              resume.pdf
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ============= MOBILE NAV (<768px) ============= */}
      <header
        className="sticky top-0 z-50 md:hidden"
        style={{
          background:
            scrolled || menuOpen
              ? "color-mix(in oklab, var(--background) 80%, transparent)"
              : "transparent",
          borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
          backdropFilter: scrolled || menuOpen ? "blur(12px) saturate(140%)" : "none",
          transition: "background 260ms ease, border-color 260ms ease, backdrop-filter 260ms ease",
        }}
      >
        <div className="grid h-14 grid-cols-3 items-center px-4">
          {/* Left: status dot */}
          <div className="flex items-center gap-2 font-plex text-[11px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            <span className="uppercase tracking-[0.16em]">live</span>
          </div>
          {/* Center: brand */}
          <a
            href="#top"
            aria-label="Home"
            className="justify-self-center flex items-baseline font-plex text-foreground whitespace-nowrap"
            style={{ fontSize: "clamp(11px, 3.6vw, 15px)", letterSpacing: "0.04em" }}
          >
            <span>guptaaryandra</span>
            <span className="text-accent animate-pulse">_</span>
          </a>

          {/* Right: hamburger */}
          <div className="justify-self-end">
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              onClick={() => setMenuOpen((o) => !o)}
              className="relative flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground hover:border-accent transition-colors"
            >
              <Menu
                className="absolute h-4 w-4 transition-all duration-300"
                style={{
                  opacity: menuOpen ? 0 : 1,
                  transform: menuOpen ? "rotate(-90deg) scale(0.6)" : "rotate(0) scale(1)",
                }}
              />
              <X
                className="absolute h-4 w-4 text-accent transition-all duration-300"
                style={{
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "rotate(0) scale(1)" : "rotate(90deg) scale(0.6)",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-height slide-in panel */}
      <div
        className="md:hidden fixed inset-0 z-40"
        aria-hidden={!menuOpen}
        style={{ pointerEvents: menuOpen ? "auto" : "none" }}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "color-mix(in oklab, var(--background) 55%, transparent)",
            backdropFilter: "blur(8px)",
            opacity: menuOpen ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        />
        {/* Slide-in panel */}
        <aside
          id="mobile-nav-panel"
          ref={panelRef as React.RefObject<HTMLElement>}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "min(88vw, 360px)",
            background: "var(--background)",
            borderLeft: "1px solid var(--border)",
            boxShadow: "-12px 0 40px rgba(0,0,0,0.35)",
            transform: menuOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Engineering grid overlay */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(to right, color-mix(in oklab, var(--border) 60%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--border) 60%, transparent) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              opacity: 0.35,
              maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
              pointerEvents: "none",
            }}
          />
          {/* Accent glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -80,
              right: -80,
              width: 240,
              height: 240,
              background:
                "radial-gradient(circle, color-mix(in oklab, var(--accent) 22%, transparent) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Panel header */}
          <div className="relative flex h-14 items-center justify-between border-b border-border px-5">
            <div className="flex items-center gap-2 font-plex text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span>navigation</span>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Meta line */}
          <div className="relative px-5 pt-5 font-plex text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            <span className="text-accent">$</span> site map · {navNumber(TOTAL_SECTIONS - 1)}{" "}
            sections
          </div>

          {/* Nav items */}
          <nav className="relative flex flex-1 flex-col gap-1 px-3 pt-4 pb-6 overflow-y-auto">
            {SECTIONS.map((s, i) => {
              const isActive = active === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e) => {
                    handleAnchor(e, s.id);
                    setMenuOpen(false);
                  }}
                  data-active={isActive}
                  className="group relative flex min-h-[56px] items-center justify-between rounded-md px-4 font-plex text-[15px] transition-all"
                  style={{
                    color: isActive ? "var(--accent)" : "var(--foreground)",
                    background: isActive
                      ? "color-mix(in oklab, var(--accent) 10%, transparent)"
                      : "transparent",
                    border: "1px solid",
                    borderColor: isActive
                      ? "color-mix(in oklab, var(--accent) 40%, transparent)"
                      : "transparent",
                    transform: menuOpen ? "translateX(0)" : "translateX(20px)",
                    opacity: menuOpen ? 1 : 0,
                    transition: `transform 380ms cubic-bezier(0.22,1,0.36,1) ${80 + i * 45}ms, opacity 380ms ease ${80 + i * 45}ms, background 200ms ease, color 200ms ease, border-color 200ms ease`,
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="font-mono text-[10px] tabular-nums"
                      style={{
                        color: isActive
                          ? "var(--accent)"
                          : "color-mix(in oklab, var(--muted-foreground) 90%, transparent)",
                      }}
                    >
                      {navNumber(i)}
                    </span>
                    <span className="tracking-[0.04em]">{s.label}</span>
                  </span>
                  <span
                    className="font-mono text-[14px] transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-1"
                    style={{ color: isActive ? "var(--accent)" : "var(--muted-foreground)" }}
                  >
                    {isActive ? "●" : "›"}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="relative border-t border-border px-5 py-4">
            <div className="mb-3 flex items-center gap-2">
              <a
                href="https://github.com/guptaaryandra"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com/in/gupta-aryandra/"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="ml-auto flex h-11 items-center gap-1.5 rounded-md border border-border px-3 font-mono text-[11px] text-muted-foreground hover:text-accent hover:border-accent transition-colors"
              >
                <FileText className="h-3 w-3" />
                resume.pdf
              </a>
              <div className="ml-1">
                <ThemeToggle />
              </div>
            </div>
            <div className="mt-1 border-t border-border pt-4">
              <div className="font-plex text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Contact
              </div>
              <a
                href="mailto:guptaaryandra@gmail.com"
                onContextMenu={(e) => {
                  e.preventDefault();
                  navigator.clipboard?.writeText("guptaaryandra@gmail.com");
                }}
                className="mt-2 inline-block break-all font-plex text-[13px] text-foreground transition-all hover:text-accent hover:[text-shadow:0_0_12px_color-mix(in_oklab,var(--accent)_55%,transparent)] active:scale-[0.98]"
              >
                guptaaryandra@gmail.com
              </a>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
