import { TypedTitle } from "../typed-title";
import { useEffect, useMemo, useRef, useState } from "react";
import { Section } from "../section";

type NodeInfo = {
  id: string;
  label: string;
  parent?: string;
  role: string;
  meta?: { k: string; v: string }[];
  path?: string[]; // custom highlight chain (in addition to descendants + self)
};

// Ordered list: renders as an ASCII tree via computed prefixes derived from parents.
const NODES: NodeInfo[] = [
  { id: "cloud", label: "Cloud", role: "Domain / Root" },

  {
    id: "aws",
    label: "AWS",
    parent: "cloud",
    role: "Cloud Provider",
    meta: [
      { k: "Projects", v: "3 Deployments" },
      { k: "Currently Used", v: "Yes" },
    ],
    path: [
      "aws",
      "ec2",
      "iam",
      "s3",
      "cloudfront",
      "route53",
      "docker",
      "kubernetes",
      "terraform",
      "gitlab",
      "jenkins",
      "prometheus",
      "grafana",
    ],
  },
  {
    id: "ec2",
    label: "EC2",
    parent: "aws",
    role: "Compute",
    meta: [{ k: "Usage", v: "Static site + Docker host" }],
  },
  {
    id: "iam",
    label: "IAM",
    parent: "aws",
    role: "Access Management",
    meta: [{ k: "Focus", v: "Least-privilege roles" }],
  },
  {
    id: "s3",
    label: "S3",
    parent: "aws",
    role: "Object Storage",
    meta: [{ k: "Projects", v: "Static Website" }],
  },
  {
    id: "cloudfront",
    label: "CloudFront",
    parent: "aws",
    role: "CDN / Edge",
    meta: [{ k: "Projects", v: "1 Deployment" }],
  },
  {
    id: "route53",
    label: "Route53",
    parent: "aws",
    role: "DNS",
    meta: [{ k: "Projects", v: "Custom domain routing" }],
  },

  {
    id: "linux",
    label: "Linux",
    parent: "cloud",
    role: "Operating System",
    meta: [{ k: "Learning Stage", v: "Hands-on" }],
    path: ["linux", "ubuntu", "rhel", "bash"],
  },
  { id: "ubuntu", label: "Ubuntu", parent: "linux", role: "Distribution" },
  { id: "rhel", label: "RHEL", parent: "linux", role: "Distribution" },
  { id: "bash", label: "Bash", parent: "linux", role: "Shell / Scripting" },

  {
    id: "docker",
    label: "Docker",
    parent: "cloud",
    role: "Container Runtime",
    meta: [
      { k: "Projects", v: "Dockerized Web Server" },
      { k: "Status", v: "Production Practice" },
    ],
  },
  {
    id: "kubernetes",
    label: "Kubernetes",
    parent: "docker",
    role: "Orchestration",
    meta: [{ k: "Learning Stage", v: "Learning" }],
    path: ["kubernetes", "jenkins", "gitlab", "terraform", "prometheus", "grafana"],
  },

  {
    id: "jenkins",
    label: "Jenkins",
    parent: "kubernetes",
    role: "CI Server",
    meta: [{ k: "Learning Stage", v: "Learning" }],
  },
  {
    id: "gitlab",
    label: "GitLab CI/CD",
    parent: "kubernetes",
    role: "Pipeline-as-code",
    meta: [{ k: "Learning Stage", v: "Learning" }],
  },
  {
    id: "terraform",
    label: "Terraform",
    parent: "kubernetes",
    role: "Infrastructure as Code",
    meta: [{ k: "Learning Stage", v: "Hands-on" }],
  },

  { id: "monitoring", label: "Monitoring", parent: "kubernetes", role: "Observability Layer" },
  {
    id: "prometheus",
    label: "Prometheus",
    parent: "monitoring",
    role: "Metrics & Alerting",
    meta: [{ k: "Learning Stage", v: "Learning" }],
    path: ["prometheus", "grafana"],
  },
  {
    id: "grafana",
    label: "Grafana",
    parent: "monitoring",
    role: "Dashboards",
    meta: [{ k: "Learning Stage", v: "Learning" }],
    path: ["grafana", "python", "openai", "mcp", "langgraph", "crewai", "agentic"],
  },

  {
    id: "python",
    label: "Python",
    parent: "grafana",
    role: "Programming Language",
    meta: [{ k: "Learning Stage", v: "Building" }],
    path: ["python", "openai", "mcp", "langgraph", "crewai", "agentic"],
  },
  {
    id: "openai",
    label: "OpenAI API",
    parent: "python",
    role: "LLM Provider",
    meta: [{ k: "Learning Stage", v: "Hands-on" }],
  },
  {
    id: "mcp",
    label: "Model Context Protocol",
    parent: "openai",
    role: "Tool Interop Standard",
    meta: [{ k: "Learning Stage", v: "Learning" }],
  },
  {
    id: "langgraph",
    label: "LangGraph",
    parent: "mcp",
    role: "Agent Orchestration",
    meta: [{ k: "Learning Stage", v: "Exploring" }],
  },
  {
    id: "crewai",
    label: "CrewAI",
    parent: "langgraph",
    role: "Multi-agent Framework",
    meta: [{ k: "Learning Stage", v: "Exploring" }],
  },
  {
    id: "agentic",
    label: "Agentic AI Systems",
    parent: "crewai",
    role: "End Goal / Systems",
    meta: [{ k: "Focus", v: "Autonomous engineering agents" }],
  },
];

// Live data-flow pulse cycle
const LIVE_FLOW = [
  "aws",
  "docker",
  "terraform",
  "gitlab",
  "jenkins",
  "kubernetes",
  "prometheus",
  "grafana",
];

// Build tree prefixes (├── / └── / │)
function computeRows() {
  const childrenMap = new Map<string | undefined, NodeInfo[]>();
  NODES.forEach((n) => {
    const arr = childrenMap.get(n.parent) || [];
    arr.push(n);
    childrenMap.set(n.parent, arr);
  });
  type Row = { node: NodeInfo; prefix: string; depth: number };
  const rows: Row[] = [];
  const walk = (parent: string | undefined, ancestorsLast: boolean[]) => {
    const kids = childrenMap.get(parent) || [];
    kids.forEach((k, i) => {
      const isLast = i === kids.length - 1;
      const prefix =
        ancestorsLast.map((last) => (last ? "    " : "│   ")).join("") +
        (parent === undefined ? "" : isLast ? "└── " : "├── ");
      rows.push({ node: k, prefix, depth: ancestorsLast.length });
      walk(k.id, [...ancestorsLast, isLast]);
    });
  };
  walk(undefined, []);
  return rows;
}

// Descendants of a node
function descendantsOf(id: string) {
  const set = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    NODES.forEach((n) => {
      if (n.parent && set.has(n.parent) && !set.has(n.id)) {
        set.add(n.id);
        changed = true;
      }
    });
  }
  return set;
}

function ancestorsOf(id: string) {
  const set = new Set<string>();
  let cur = NODES.find((n) => n.id === id);
  while (cur?.parent) {
    set.add(cur.parent);
    cur = NODES.find((n) => n.id === cur!.parent);
  }
  return set;
}

export function Stack() {
  const rows = useMemo(() => computeRows(), []);
  const [built, setBuilt] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [livePulse, setLivePulse] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Sequential build-in on viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setBuilt(true);
      setVisibleCount(rows.length);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !built) {
            setBuilt(true);
            let i = 0;
            const tick = () => {
              i++;
              setVisibleCount(i);
              if (i < rows.length) setTimeout(tick, 55);
            };
            tick();
            obs.disconnect();
          }
        });
      },
      { rootMargin: "-15% 0px -15% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [built, rows.length]);

  // Live pulse cycle
  useEffect(() => {
    if (!built) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let step = 0;
    let stopped = false;
    const loop = () => {
      if (stopped) return;
      setLivePulse(LIVE_FLOW[step % LIVE_FLOW.length]);
      step++;
      setTimeout(loop, 900);
    };
    const start = setTimeout(loop, 1200);
    return () => {
      stopped = true;
      clearTimeout(start);
    };
  }, [built]);

  const highlightSet = useMemo(() => {
    if (!hoverId) return null;
    const node = NODES.find((n) => n.id === hoverId);
    if (!node) return null;
    const set = new Set<string>(node.path ?? []);
    descendantsOf(hoverId).forEach((id) => set.add(id));
    ancestorsOf(hoverId).forEach((id) => set.add(id));
    set.add(hoverId);
    return set;
  }, [hoverId]);

  const hoverNode = hoverId ? NODES.find((n) => n.id === hoverId) : null;

  return (
    <Section
      id="stack"
      label="06 · Engineering Ecosystem"
      title={<TypedTitle text="Engineering is understanding how systems connect." />}
      meta="./ecosystem/graph"
    >
      <p className="mb-10 max-w-2xl font-mono text-[12px] leading-relaxed text-muted-foreground reveal">
        These aren't isolated technologies. They work together to build reliable cloud
        infrastructure, DevOps workflows and AI systems.
      </p>

      <div ref={ref} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Tree */}
        <div className="relative -mx-5 sm:mx-0 overflow-x-auto">
          <pre
            className="font-plex text-[11px] sm:text-[12px] md:text-[13px] leading-[1.9] text-muted-foreground px-5 sm:px-0"
            style={{ whiteSpace: "pre", margin: 0 }}
          >
            {rows.map((r, i) => {
              const visible = i < visibleCount;
              const isHover = hoverId === r.node.id;
              const inHighlight = highlightSet?.has(r.node.id) ?? true;
              const inLive = livePulse === r.node.id;
              const isRoot = !r.node.parent;

              const nodeColor = isHover
                ? "var(--foreground)"
                : highlightSet
                  ? inHighlight
                    ? "var(--foreground)"
                    : "color-mix(in oklab, var(--muted-foreground) 45%, transparent)"
                  : isRoot
                    ? "var(--accent)"
                    : "var(--foreground)";

              const dotColor = (highlightSet ? inHighlight : true)
                ? isRoot || isHover || inLive
                  ? "var(--accent)"
                  : "var(--muted-foreground)"
                : "color-mix(in oklab, var(--muted-foreground) 40%, transparent)";

              return (
                <div
                  key={r.node.id}
                  onMouseEnter={() => setHoverId(r.node.id)}
                  onMouseLeave={() => setHoverId((cur) => (cur === r.node.id ? null : cur))}
                  style={{
                    opacity: visible ? (highlightSet && !inHighlight ? 0.45 : 1) : 0,
                    transform: visible ? "translateY(0)" : "translateY(4px)",
                    transition: "opacity 400ms ease, transform 400ms ease, color 220ms ease",
                    color:
                      highlightSet && !inHighlight
                        ? "color-mix(in oklab, var(--muted-foreground) 45%, transparent)"
                        : "var(--muted-foreground)",
                    cursor: "default",
                    padding: "1px 0",
                  }}
                >
                  <span
                    style={{
                      color: "color-mix(in oklab, var(--muted-foreground) 55%, transparent)",
                    }}
                  >
                    {r.prefix}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: dotColor,
                      marginRight: 10,
                      transform: "translateY(1px)",
                      boxShadow:
                        inLive || (isHover && !isRoot)
                          ? "0 0 12px color-mix(in oklab, var(--accent) 80%, transparent)"
                          : "none",
                      transition: "background 220ms ease, box-shadow 400ms ease",
                    }}
                  />
                  <span
                    style={{
                      color: nodeColor,
                      fontWeight: isRoot ? 500 : 400,
                      letterSpacing: isRoot ? "0.04em" : 0,
                      textTransform: isRoot ? "uppercase" : "none",
                    }}
                  >
                    {r.node.label}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>

        {/* Right column: status + tooltip */}
        <div className="space-y-6">
          <div className="font-mono text-[11px] leading-[1.9] text-muted-foreground reveal">
            <div className="text-foreground">
              <span className="text-accent">$</span> ecosystem-status
            </div>
            <div>
              <span className="text-muted-foreground">Cloud</span>
              <span className="ml-2 text-[color:var(--success)]">● ONLINE</span>
            </div>
            <div>
              <span className="text-muted-foreground">DevOps</span>
              <span className="ml-2 text-accent">● BUILDING</span>
            </div>
            <div>
              <span className="text-muted-foreground">AI</span>
              <span className="ml-2 text-[color:var(--link)]">● EXPERIMENTING</span>
            </div>
            <div className="mt-2 text-muted-foreground">--</div>
            <div className="text-muted-foreground">current-focus:</div>
            <div>&nbsp;&nbsp;- Terraform</div>
            <div>&nbsp;&nbsp;- Kubernetes</div>
            <div>&nbsp;&nbsp;- LangGraph</div>
            <div className="mt-2 text-muted-foreground">
              live-pulse: <span className="text-accent">{livePulse ?? "idle"}</span>
              <span
                className="ml-1 inline-block h-[0.9em] w-[0.5ch] translate-y-[2px] bg-accent"
                style={{ animation: "cursor-blink 1s steps(1) infinite" }}
              />
            </div>
            <style>{`@keyframes cursor-blink { 50% { opacity: 0 } }`}</style>
          </div>

          {/* Info panel */}
          <div
            className="reveal min-h-[132px] border-l border-border pl-4 font-mono text-[11px] leading-[1.8]"
            style={{ transition: "opacity 220ms ease" }}
          >
            {hoverNode ? (
              <>
                <div className="text-foreground font-plex text-[13px]">{hoverNode.label}</div>
                <div className="mt-0.5 text-muted-foreground">{hoverNode.role}</div>
                {hoverNode.meta && (
                  <div className="mt-3 space-y-1">
                    {hoverNode.meta.map((m) => (
                      <div key={m.k} className="flex justify-between gap-4">
                        <span className="text-muted-foreground">{m.k}</span>
                        <span className="text-foreground">{m.v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted-foreground">
                hover any node to inspect
                <div className="mt-2 opacity-60">// tooltip · role · usage · stage</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
