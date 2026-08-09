import { TypedTitle } from "../typed-title";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Section } from "../section";

type NodeT = {
  name: string;
  desc?: string;
  children?: NodeT[];
};

type StatusKind = "completed" | "in-progress" | "ongoing" | "shipped";

type Entry = {
  timeline: string;
  role: string;
  org?: string;
  status: StatusKind;
  trees: NodeT[];
};

const ENTRIES: Entry[] = [
  {
    timeline: "2023 — Present",
    role: "Bachelor of Computer Applications",
    org: "Arunachal University of Studies",
    status: "in-progress",
    trees: [
      {
        name: "Computer Science",
        children: [
          { name: "Programming", desc: "Languages & paradigms" },
          { name: "Operating Systems", desc: "Processes, memory, IO" },
          { name: "DBMS", desc: "Database Management Systems" },
          { name: "Networking", desc: "Protocols & topologies" },
          { name: "Software Engineering", desc: "SDLC & design" },
        ],
      },
    ],
  },
  {
    timeline: "2025 — 2026",
    role: "Diploma in Cloud Computing with AI",
    org: "Jetking Institute · Prayagraj",
    status: "completed",
    trees: [
      {
        name: "Cloud Computing",
        children: [
          {
            name: "AWS",
            children: [
              { name: "EC2", desc: "Elastic Compute Cloud" },
              { name: "S3", desc: "Simple Storage Service" },
              { name: "IAM", desc: "Identity & Access Management" },
              { name: "CloudFront", desc: "Content Delivery Network" },
              { name: "Route53", desc: "Managed DNS" },
            ],
          },
          {
            name: "Linux",
            children: [
              { name: "Ubuntu", desc: "Debian-based distro" },
              { name: "RHEL", desc: "Red Hat Enterprise Linux" },
              { name: "Bash", desc: "Shell scripting" },
            ],
          },
          {
            name: "Networking",
            children: [
              { name: "TCP/IP", desc: "Transport & internet layer" },
              { name: "DNS", desc: "Domain Name System" },
              { name: "Subnetting", desc: "IP range partitioning" },
            ],
          },
        ],
      },
    ],
  },
  {
    timeline: "2026 — Present",
    role: "Self Learning",
    org: "DevOps · Cloud Engineering · Agentic AI",
    status: "ongoing",
    trees: [
      {
        name: "DevOps",
        children: [
          { name: "Docker", desc: "Container Runtime" },
          { name: "Kubernetes", desc: "Container Orchestration" },
          { name: "Terraform", desc: "Infrastructure as Code" },
          { name: "Jenkins", desc: "CI/CD Automation Server" },
          { name: "GitLab CI/CD", desc: "Pipeline Automation" },
          { name: "Ansible", desc: "Configuration Management" },
        ],
      },
      {
        name: "Agentic AI",
        children: [
          { name: "Python", desc: "Primary Language" },
          { name: "MCP", desc: "Model Context Protocol" },
          { name: "LangGraph", desc: "Agent Orchestration" },
          { name: "OpenAI API", desc: "LLM Interface" },
          { name: "AI Workflows", desc: "Automation Pipelines" },
        ],
      },
    ],
  },
  {
    timeline: "2026",
    role: "Hands-on AWS Projects",
    org: "Production deployments",
    status: "shipped",
    trees: [
      {
        name: "Production Deployments",
        children: [
          {
            name: "Static Website",
            children: [
              { name: "S3", desc: "Origin bucket" },
              { name: "CloudFront", desc: "Edge distribution" },
              { name: "IAM", desc: "Access policies" },
            ],
          },
          {
            name: "Docker Deployment",
            children: [
              { name: "EC2", desc: "Compute host" },
              { name: "Docker", desc: "Container runtime" },
              { name: "Nginx", desc: "Reverse proxy" },
            ],
          },
          {
            name: "DNS Configuration",
            children: [{ name: "Route53", desc: "Zone + records" }],
          },
        ],
      },
    ],
  },
];

function StatusBadge({ kind }: { kind: StatusKind }) {
  const map = {
    completed: { label: "COMPLETED", glyph: "✓", color: "var(--success)" },
    "in-progress": { label: "IN PROGRESS", glyph: "●", color: "var(--accent)" },
    ongoing: { label: "ONGOING", glyph: "●", color: "#6EA8FE" },
    shipped: { label: "SHIPPED", glyph: "✓", color: "var(--success)" },
  }[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em]"
      style={{ color: map.color }}
    >
      <span aria-hidden>{map.glyph}</span>
      {map.label}
    </span>
  );
}

type Line = {
  key: string;
  prefix: string;
  connector: string;
  name: string;
  desc?: string;
  depth: number;
  isRoot: boolean;
};

function flattenTree(root: NodeT): Line[] {
  const out: Line[] = [];
  const walk = (
    node: NodeT,
    prefix: string,
    connector: string,
    depth: number,
    isRoot: boolean,
    path: string,
  ) => {
    out.push({ key: path, prefix, connector, name: node.name, desc: node.desc, depth, isRoot });
    const kids = node.children || [];
    kids.forEach((child, i) => {
      const last = i === kids.length - 1;
      const nextConnector = last ? "└── " : "├── ";
      const nextPrefix = isRoot ? "" : prefix + (connector.startsWith("└") ? "    " : "│   ");
      walk(child, nextPrefix, nextConnector, depth + 1, false, `${path}/${child.name}-${i}`);
    });
  };
  walk(root, "", "", 0, true, root.name);
  return out;
}

function DependencyTree({
  root,
  active,
  dim,
  startDelay,
  perLineDelay = 90,
}: {
  root: NodeT;
  active: boolean;
  dim: boolean;
  startDelay: number;
  perLineDelay?: number;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [rootHover, setRootHover] = useState(false);
  const lines = useMemo(() => flattenTree(root), [root]);

  return (
    <div
      className="font-mono text-[11px] sm:text-[12px] leading-[1.85] select-none overflow-x-auto"
      style={{
        opacity: dim ? 0.35 : 1,
        transition: "opacity 400ms ease",
      }}
    >
      <div className="min-w-max">
        {lines.map((ln, idx) => {
          const isHover = hovered === ln.key;
          const delay = startDelay + idx * perLineDelay;
          const pulseActive = rootHover;
          return (
            <div
              key={ln.key}
              className="group flex items-start whitespace-pre"
              style={{
                opacity: active ? (isHover ? 1 : ln.isRoot ? 1 : 0.75) : 0,
                transform: active ? "translateX(0)" : "translateX(-6px)",
                filter: active ? "blur(0)" : "blur(2px)",
                transition: `opacity 420ms ease ${delay}ms, transform 420ms ease ${delay}ms, filter 420ms ease ${delay}ms`,
              }}
              onMouseEnter={() => {
                setHovered(ln.key);
                if (ln.isRoot) setRootHover(true);
              }}
              onMouseLeave={() => {
                setHovered((v) => (v === ln.key ? null : v));
                if (ln.isRoot) setRootHover(false);
              }}
            >
              {!ln.isRoot && (
                <span
                  aria-hidden
                  style={{
                    color: "var(--border-strong)",
                    opacity: pulseActive ? 0.9 : 0.55,
                    transition: "opacity 300ms ease",
                  }}
                >
                  {ln.prefix}
                  {ln.connector}
                </span>
              )}
              <span
                style={{
                  color: ln.isRoot ? "var(--accent)" : "var(--foreground)",
                  opacity: ln.isRoot ? 1 : isHover ? 1 : 0.78,
                  fontWeight: ln.isRoot ? 500 : 400,
                  letterSpacing: ln.isRoot ? "0.04em" : "0",
                  textTransform: ln.isRoot ? "uppercase" : "none",
                  transition: "opacity 200ms ease, color 200ms ease",
                }}
              >
                {ln.name}
              </span>
              {ln.desc && isHover && !ln.isRoot && (
                <span
                  className="ml-3 font-mono text-[10.5px] uppercase tracking-[0.18em]"
                  style={{
                    color: "var(--muted-foreground)",
                    opacity: 0.9,
                    animation: "fade-in 220ms ease-out",
                  }}
                >
                  → {ln.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Experience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [nodeYs, setNodeYs] = useState<number[]>([]);
  const [railHeight, setRailHeight] = useState(0);
  const [progressY, setProgressY] = useState(0);
  const [revealed, setRevealed] = useState<boolean[]>(() => ENTRIES.map(() => false));
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // measure node positions relative to container
  useLayoutEffect(() => {
    const measure = () => {
      const c = containerRef.current;
      if (!c) return;
      const cRect = c.getBoundingClientRect();
      const ys = nodeRefs.current.map((n) => {
        if (!n) return 0;
        const r = n.getBoundingClientRect();
        // dot sits at top-[9px] inside pl-8 column; approximate ~18px from item top
        return r.top - cRect.top + 16;
      });
      setNodeYs(ys);
      setRailHeight(c.getBoundingClientRect().height);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // scroll-driven progress + sequential reveal
  useEffect(() => {
    let raf = 0;
    const update = () => {
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const vh = window.innerHeight;
      // trigger line ~ 55% down the viewport
      const trigger = vh * 0.55;
      const rawY = trigger - rect.top;
      const clamped = Math.max(0, Math.min(rect.height, rawY));
      setProgressY(clamped);

      setRevealed((prev) => {
        let changed = false;
        const next = prev.slice();
        nodeYs.forEach((y, i) => {
          if (!next[i] && clamped >= y - 8) {
            next[i] = true;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [nodeYs]);

  // currently active node = last revealed
  const activeIdx = useMemo(() => {
    let idx = -1;
    revealed.forEach((r, i) => {
      if (r) idx = i;
    });
    return idx;
  }, [revealed]);

  return (
    <Section
      id="experience"
      label="03 · Engineering Logbook"
      title={<TypedTitle text="Commits from the field." />}
      meta="./log/engineering"
    >
      <div ref={containerRef} className="relative">
        {/* rail base */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[7px] top-0 w-px"
          style={{ background: "var(--border)", height: railHeight }}
        />
        {/* rail progress fill */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[7px] top-0 w-px"
          style={{
            height: progressY,
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--accent) 60%, transparent), var(--accent))",
            transition: "height 120ms linear",
            boxShadow: "0 0 8px color-mix(in oklab, var(--accent) 50%, transparent)",
          }}
        />
        {/* traveling dot */}
        {progressY > 0 && progressY < railHeight && (
          <div
            aria-hidden
            className="pointer-events-none absolute -translate-x-1/2"
            style={{
              left: "7px",
              top: progressY,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow:
                "0 0 0 3px color-mix(in oklab, var(--accent) 20%, transparent), 0 0 18px color-mix(in oklab, var(--accent) 70%, transparent)",
              transform: "translate(-50%, -50%)",
              transition: "top 140ms linear",
            }}
          />
        )}

        <ul className="space-y-16">
          {ENTRIES.map((it, i) => {
            const isActive = activeIdx === i;
            const isRevealed = revealed[i];
            const isHovered = hoverIdx === i;
            const isDimmed = hoverIdx !== null ? !isHovered : activeIdx !== -1 && !isActive;
            const treeStartDelay = 260; // after content fades in
            return (
              <li
                key={i}
                ref={(el) => {
                  nodeRefs.current[i] = el;
                }}
                className="grid gap-8 md:gap-[100px] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx((v) => (v === i ? null : v))}
                style={{
                  opacity: isDimmed ? 0.4 : 1,
                  transition: "opacity 400ms ease",
                }}
              >
                {/* left: meta */}
                <div className="relative pl-8">
                  <span
                    aria-hidden
                    className="absolute left-0 top-[14px] block h-3.5 w-3.5 rounded-full"
                    style={{
                      background: isRevealed ? "var(--accent)" : "var(--background)",
                      border: `1px solid ${isRevealed ? "var(--accent)" : "var(--border-strong)"}`,
                      boxShadow: isActive
                        ? "0 0 0 5px color-mix(in oklab, var(--accent) 14%, transparent), 0 0 18px color-mix(in oklab, var(--accent) 55%, transparent)"
                        : "none",
                      animation: isActive ? "node-pulse 2.4s ease-in-out infinite" : "none",
                      transition:
                        "background 400ms ease, border-color 400ms ease, box-shadow 400ms ease",
                    }}
                  />
                  {/* left connector highlight on hover */}
                  <span
                    aria-hidden
                    className="absolute left-[7px] top-[14px] h-px"
                    style={{
                      width: isHovered ? 22 : 0,
                      background: "var(--accent)",
                      opacity: isHovered ? 0.7 : 0,
                      transition: "width 260ms ease, opacity 260ms ease",
                    }}
                  />
                  <div
                    style={{
                      opacity: isRevealed ? 1 : 0,
                      transform: isRevealed ? "translateY(0)" : "translateY(6px)",
                      filter: isRevealed ? "blur(0)" : "blur(3px)",
                      transition:
                        "opacity 460ms ease 120ms, transform 460ms ease 120ms, filter 460ms ease 120ms",
                    }}
                  >
                    <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {it.timeline}
                    </div>
                    <div className="mt-2 font-plex text-xl md:text-[22px] leading-snug text-foreground">
                      {it.role}
                    </div>
                    {it.org && (
                      <div className="mt-1 font-mono text-[12px] text-muted-foreground">
                        {it.org}
                      </div>
                    )}
                    <div className="mt-4">
                      <StatusBadge kind={it.status} />
                    </div>
                  </div>
                </div>

                {/* right: dependency trees */}
                <div className="space-y-8 pl-8 md:pl-0">
                  {it.trees.map((tree, ti) => (
                    <DependencyTree
                      key={ti}
                      root={tree}
                      active={isRevealed}
                      dim={isDimmed}
                      startDelay={treeStartDelay + ti * 220}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
