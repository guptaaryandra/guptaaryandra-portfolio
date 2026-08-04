import { useEffect, useRef, useState } from "react";

/**
 * Vertical Git history visualization with balanced left/right branches.
 * - Default: static merged history (like `git log --graph`).
 * - Hover: replays branching + merging flow with a glowing runner commit.
 *   Applies a very subtle camera zoom + parallax on pointer move.
 * - Commit hover reveals hash + message tooltip.
 */

const V_W = 380;
const V_H = 620;
const MAIN_X = 190; // trunk centered
const LEFT_X = 80;
const RIGHT_X = 300;

type Branch = "main" | "ai" | "ops" | "infra";

type Commit = {
  id: string;
  x: number;
  y: number;
  branch: Branch;
  hash: string;
  label: string;
  activateAt: number;
};

const COMMITS: Commit[] = [
  {
    id: "m1",
    x: MAIN_X,
    y: 60,
    branch: "main",
    hash: "a18f2c1",
    label: "chore: init repo",
    activateAt: 0.0,
  },
  {
    id: "m2",
    x: MAIN_X,
    y: 120,
    branch: "main",
    hash: "93bc71e",
    label: "feat: core services",
    activateAt: 0.08,
  },
  // left branch: feature/ai
  {
    id: "a1",
    x: LEFT_X,
    y: 170,
    branch: "ai",
    hash: "c91f8d2",
    label: "feat(ai): agent runtime",
    activateAt: 0.2,
  },
  {
    id: "a2",
    x: LEFT_X,
    y: 220,
    branch: "ai",
    hash: "7f4e08b",
    label: "feat(ai): tool router",
    activateAt: 0.3,
  },
  {
    id: "m3",
    x: MAIN_X,
    y: 280,
    branch: "main",
    hash: "2d81fa4",
    label: "merge: feature/ai",
    activateAt: 0.42,
  },
  {
    id: "m4",
    x: MAIN_X,
    y: 340,
    branch: "main",
    hash: "5ea9c30",
    label: "feat: platform api",
    activateAt: 0.52,
  },
  // right branch: feature/devops
  {
    id: "d1",
    x: RIGHT_X,
    y: 390,
    branch: "ops",
    hash: "ab17f3e",
    label: "feat(ops): terraform mod",
    activateAt: 0.62,
  },
  {
    id: "d2",
    x: RIGHT_X,
    y: 440,
    branch: "ops",
    hash: "b442e51",
    label: "feat(ops): ci pipeline",
    activateAt: 0.72,
  },
  {
    id: "m5",
    x: MAIN_X,
    y: 500,
    branch: "main",
    hash: "c0d3ed9",
    label: "merge: feature/devops",
    activateAt: 0.86,
  },
  {
    id: "m6",
    x: MAIN_X,
    y: 560,
    branch: "main",
    hash: "e7a1b02",
    label: "release: v1.0.0",
    activateAt: 0.99,
  },
];

const STATIC_EDGES: Array<{ d: string; branch: Branch; merged?: boolean }> = [
  // trunk
  { d: `M ${MAIN_X} 60  L ${MAIN_X} 120`, branch: "main" },
  { d: `M ${MAIN_X} 120 L ${MAIN_X} 280`, branch: "main" },
  { d: `M ${MAIN_X} 280 L ${MAIN_X} 340`, branch: "main" },
  { d: `M ${MAIN_X} 340 L ${MAIN_X} 500`, branch: "main" },
  { d: `M ${MAIN_X} 500 L ${MAIN_X} 560`, branch: "main" },
  // feature/ai (LEFT)
  { d: `M ${MAIN_X} 120 C ${MAIN_X} 155, ${LEFT_X} 135, ${LEFT_X} 170`, branch: "ai" },
  { d: `M ${LEFT_X} 170 L ${LEFT_X} 220`, branch: "ai" },
  {
    d: `M ${LEFT_X} 220 C ${LEFT_X} 255, ${MAIN_X} 245, ${MAIN_X} 280`,
    branch: "ai",
    merged: true,
  },
  // feature/devops (RIGHT)
  { d: `M ${MAIN_X} 340 C ${MAIN_X} 375, ${RIGHT_X} 355, ${RIGHT_X} 390`, branch: "ops" },
  { d: `M ${RIGHT_X} 390 L ${RIGHT_X} 440`, branch: "ops" },
  {
    d: `M ${RIGHT_X} 440 C ${RIGHT_X} 475, ${MAIN_X} 465, ${MAIN_X} 500`,
    branch: "ops",
    merged: true,
  },
];

const RUNNER_D =
  `M ${MAIN_X} 60 ` +
  `L ${MAIN_X} 120 ` +
  `C ${MAIN_X} 155, ${LEFT_X} 135, ${LEFT_X} 170 ` +
  `L ${LEFT_X} 220 ` +
  `C ${LEFT_X} 255, ${MAIN_X} 245, ${MAIN_X} 280 ` +
  `L ${MAIN_X} 340 ` +
  `C ${MAIN_X} 375, ${RIGHT_X} 355, ${RIGHT_X} 390 ` +
  `L ${RIGHT_X} 440 ` +
  `C ${RIGHT_X} 475, ${MAIN_X} 465, ${MAIN_X} 500 ` +
  `L ${MAIN_X} 560`;

const RUN_DURATION = 5200;

const branchColor = (branch: Branch, merged?: boolean) => {
  if (merged) return "var(--success)";
  if (branch === "main") return "var(--border-strong)";
  return "var(--accent)";
};

type StatusKind = "idle" | "running" | "done";
type StatusMsg = { kind: StatusKind; text: string };

const RUN_STAGES: Array<{ at: number; text: string }> = [
  { at: 0.0, text: "Replaying commit history..." },
  { at: 0.18, text: "Checking out feature/ai..." },
  { at: 0.28, text: "Creating commits on feature/ai..." },
  { at: 0.4, text: "Merging feature/ai into main..." },
  { at: 0.55, text: "Checking out feature/devops..." },
  { at: 0.65, text: "Creating commits on feature/devops..." },
  { at: 0.82, text: "Merging feature/devops into main..." },
];

const IDLE_MSG: StatusMsg = { kind: "idle", text: "Hover to replay" };

export function HeroObject() {
  const runnerPathRef = useRef<SVGPathElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(1);
  const [runnerPt, setRunnerPt] = useState<{ x: number; y: number } | null>(null);
  const [replays, setReplays] = useState(0);
  const [hoveredCommit, setHoveredCommit] = useState<string | null>(null);
  const [cam, setCam] = useState({ x: 0, y: 0, zoom: 1 });
  const [status, setStatus] = useState<StatusMsg>(IDLE_MSG);
  const rafRef = useRef<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startReplay = () => {
    if (rafRef.current) return;
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    setReplays((n) => n + 1);
  };

  useEffect(() => {
    if (replays === 0) return;
    const start = performance.now();
    setProgress(0);
    setStatus({ kind: "running", text: RUN_STAGES[0].text });
    let stageIdx = 0;
    const step = (now: number) => {
      const raw = Math.min(1, (now - start) / RUN_DURATION);
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
      setProgress(eased);
      const path = runnerPathRef.current;
      if (path) {
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(eased * len);
        setRunnerPt({ x: pt.x, y: pt.y });
      }
      while (stageIdx + 1 < RUN_STAGES.length && eased >= RUN_STAGES[stageIdx + 1].at) {
        stageIdx += 1;
        const text = RUN_STAGES[stageIdx].text;
        setStatus({ kind: "running", text });
      }
      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        setStatus({ kind: "done", text: "History replayed successfully" });
        setTimeout(() => setRunnerPt(null), 600);
        idleTimerRef.current = setTimeout(() => {
          setStatus(IDLE_MSG);
          idleTimerRef.current = null;
        }, 2400);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [replays]);

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const onMouseMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    setCam({ x: nx * 8, y: ny * 8, zoom: 1.03 });
  };
  const onMouseLeave = () => {
    setCam({ x: 0, y: 0, zoom: 1 });
    setHoveredCommit(null);
  };

  const isActivated = (c: Commit) => progress >= c.activateAt;
  const nearRunner = (c: Commit) => {
    if (!runnerPt) return 0;
    const dx = c.x - runnerPt.x;
    const dy = c.y - runnerPt.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.max(0, 1 - dist / 80);
  };

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto flex w-full max-w-[260px] xs:max-w-[300px] sm:max-w-[360px] md:max-w-[360px] lg:max-w-[380px] flex-col items-center justify-center"
      onMouseEnter={startReplay}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      aria-label="Git history"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(300px 400px at 50% 50%, color-mix(in oklab, var(--accent) 6%, transparent), transparent 70%)",
        }}
      />

      <svg
        viewBox={`0 0 ${V_W} ${V_H}`}
        className="h-auto w-full"
        style={{
          maxHeight: "min(62vh, 560px)",
          transform: `translate3d(${cam.x}px, ${cam.y}px, 0) scale(${cam.zoom})`,
          transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
          willChange: "transform",
        }}
      >
        <defs>
          <filter id="runner-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path ref={runnerPathRef} d={RUNNER_D} fill="none" stroke="none" />

        <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--muted-foreground)">
          <text x={MAIN_X} y={30} textAnchor="middle" fill="var(--accent)">
            HEAD
          </text>
          <text x={MAIN_X} y={598} textAnchor="middle">
            main
          </text>
          <text x={LEFT_X - 6} y={175} textAnchor="end">
            feature/ai
          </text>
          <text x={RIGHT_X + 6} y={395} textAnchor="start">
            feature/devops
          </text>
        </g>

        {STATIC_EDGES.map((e, i) => {
          const color = branchColor(e.branch, e.merged);
          const isMain = e.branch === "main";
          return (
            <path
              key={i}
              d={e.d}
              fill="none"
              stroke={color}
              strokeOpacity={isMain ? 0.55 : e.merged ? 0.55 : 0.6}
              strokeWidth={isMain ? 1.1 : 1.2}
              strokeLinecap="round"
            />
          );
        })}

        {COMMITS.map((c) => {
          const activated = isActivated(c);
          const proximity = nearRunner(c);
          const isFeature = c.branch !== "main";
          const baseColor = isFeature ? "var(--accent)" : "var(--foreground)";
          const idle = !runnerPt;
          const brightness = idle ? (isFeature ? 0.9 : 0.75) : Math.min(1, 0.55 + proximity * 0.6);
          const ringOpacity = idle ? 0.12 : 0.1 + proximity * 0.35;
          const isHover = hoveredCommit === c.id;
          const tipRight = c.x <= MAIN_X;
          return (
            <g
              key={c.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredCommit(c.id)}
              onMouseLeave={() => setHoveredCommit((v) => (v === c.id ? null : v))}
            >
              <circle cx={c.x} cy={c.y} r={14} fill="transparent" />
              <circle cx={c.x} cy={c.y} r={9} fill={baseColor} opacity={ringOpacity} />
              <circle
                cx={c.x}
                cy={c.y}
                r={activated ? 4 : 3.2}
                fill={activated ? baseColor : "var(--background)"}
                stroke={baseColor}
                strokeWidth={1}
                opacity={brightness}
                style={{ transition: "opacity 200ms ease, r 200ms ease" }}
              />
              {isHover && (
                <g style={{ pointerEvents: "none" }}>
                  <rect
                    x={c.x + (tipRight ? 16 : -132)}
                    y={c.y - 18}
                    width={116}
                    height={36}
                    rx={4}
                    fill="var(--panel)"
                    stroke="var(--border-strong)"
                    strokeWidth={0.8}
                  />
                  <text
                    x={c.x + (tipRight ? 24 : -124)}
                    y={c.y - 4}
                    fontFamily="JetBrains Mono, monospace"
                    fontSize={9}
                    fill="var(--accent)"
                  >
                    {c.hash}
                  </text>
                  <text
                    x={c.x + (tipRight ? 24 : -124)}
                    y={c.y + 9}
                    fontFamily="JetBrains Mono, monospace"
                    fontSize={8.5}
                    fill="var(--muted-foreground)"
                  >
                    {c.label.length > 18 ? c.label.slice(0, 17) + "…" : c.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {runnerPt && (
          <g style={{ pointerEvents: "none" }}>
            <circle cx={runnerPt.x} cy={runnerPt.y} r={12} fill="var(--accent)" opacity={0.18} />
            <circle
              cx={runnerPt.x}
              cy={runnerPt.y}
              r={5.5}
              fill="var(--accent)"
              filter="url(#runner-glow)"
            />
          </g>
        )}
      </svg>

      <div
        className="pointer-events-none mt-6 flex w-full items-center justify-center px-4 md:mt-8"
        style={{ minHeight: "1.5rem" }}
        aria-live="polite"
      >
        <div className="relative w-full max-w-[360px] text-center" style={{ minHeight: "1.25rem" }}>
          <span
            key={status.text}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
            style={{
              animation: "status-fade 260ms ease-out both",
            }}
          >
            {status.kind === "done" ? (
              <span className="text-[11px] leading-none" style={{ color: "var(--success)" }}>
                ✓
              </span>
            ) : (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full align-middle"
                style={{
                  background:
                    status.kind === "running"
                      ? "var(--accent)"
                      : "color-mix(in oklab, var(--muted-foreground) 60%, transparent)",
                  boxShadow:
                    status.kind === "running"
                      ? "0 0 8px color-mix(in oklab, var(--accent) 70%, transparent)"
                      : "none",
                }}
              />
            )}
            <span className="truncate">{status.text}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
