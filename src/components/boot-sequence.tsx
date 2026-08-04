import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Engineering Workstation Boot Screen.
 * Shows on every fresh load / refresh (not during in-app navigation).
 * Terminal boot lines type sequentially alongside a compact vertical Git graph
 * with an orange pulse traveling through commits.
 */

type Line = {
  cmd: string;
  // optional green confirmation shown after the line finishes
  ok?: string;
};

const LINES: Line[] = [
  { cmd: "$ boot" },
  { cmd: "Initializing engineering workspace..." },
  { cmd: "Loading cloud modules...", ok: "✓ Cloud modules loaded" },
  { cmd: "Loading deployment records...", ok: "✓ Deployment history restored" },
  { cmd: "Mounting engineering lab...", ok: "✓ Lab initialized" },
  { cmd: "Connecting infrastructure graph...", ok: "✓ Ecosystem online" },
  { cmd: "Syncing repository state..." },
  { cmd: "Checking dependencies..." },
  { cmd: "Restoring engineering workspace..." },
  { cmd: "HEAD → main" },
  { cmd: "Session Ready." },
  { cmd: "Welcome to my Engineering Workspace." },
  { cmd: "Launching Control Center..." },
];

// Per-character typing speed (ms). Kept lively but readable.
const CHAR_MS = 18;
// Pause between lines (ms).
const LINE_GAP = 120;
// Delay after last line before fading out (ms).
const HOLD_MS = 500;
// Fade out duration.
const FADE_MS = 650;

// Git graph nodes — vertical trunk.
const GRAPH_H = 260;
const NODE_YS = [30, 90, 150, 210]; // 4 commits
const HEAD_Y = 0;

export function BootSequence() {
  // Session-scoped: shows on every refresh, not during SPA navigation.
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  // Typing state
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() => LINES.map(() => false));

  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Force scroll to top on fresh load / refresh
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // Ignore errors
    }
    window.scrollTo(0, 0);
    // Lock body scroll during boot
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, []);

  // When the boot screen is hidden, ensure scroll is unlocked and page is at top
  useEffect(() => {
    if (visible) return;
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, 0);
  }, [visible]);

  // Type each line char-by-char, then advance.
  useEffect(() => {
    if (!visible) return;
    if (lineIdx >= LINES.length) return;

    const currentText = LINES[lineIdx].cmd;

    if (charIdx < currentText.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), reducedMotion.current ? 0 : CHAR_MS);
      return () => clearTimeout(t);
    }

    // finished current line
    const t = setTimeout(
      () => {
        setCompleted((prev) => {
          const next = prev.slice();
          next[lineIdx] = true;
          return next;
        });
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      },
      reducedMotion.current ? 0 : LINE_GAP,
    );
    return () => clearTimeout(t);
  }, [visible, lineIdx, charIdx]);

  // When all lines done, hold then fade.
  useEffect(() => {
    if (lineIdx < LINES.length) return;
    const t1 = setTimeout(() => setClosing(true), HOLD_MS);
    const t2 = setTimeout(() => setVisible(false), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [lineIdx]);

  // Git pulse progression synced to typing progress.
  // Total progress 0..1 across all lines.
  const totalChars = useMemo(() => LINES.reduce((a, l) => a + l.cmd.length, 0), []);
  const typedChars = useMemo(() => {
    let sum = 0;
    for (let i = 0; i < lineIdx; i++) sum += LINES[i].cmd.length;
    return sum + charIdx;
  }, [lineIdx, charIdx]);
  const progress = Math.min(1, typedChars / totalChars);

  // Pulse position along trunk (HEAD → last commit)
  const pulseY = HEAD_Y + progress * (NODE_YS[NODE_YS.length - 1] - HEAD_Y);
  // Which commit nodes are "activated" (pulse has passed them)
  const activated = NODE_YS.map((y) => pulseY >= y - 6);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-background"
      style={{
        opacity: closing ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
      aria-label="Booting engineering workstation"
      role="dialog"
    >
      {/* Same design language: grid + scanlines + orange ambient glow */}
      <div className="bg-grid absolute inset-0 opacity-[0.35]" />
      <div className="bg-scanlines absolute inset-0 opacity-20" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(720px 520px at 50% 45%, color-mix(in oklab, var(--accent) 7%, transparent), transparent 70%)",
        }}
      />

      <div className="relative flex w-full max-w-[880px] flex-col items-start gap-8 px-5 pb-24 sm:gap-10 sm:px-8 md:flex-row md:items-center md:gap-16 md:pb-0">
        {/* Terminal output */}
        <div className="flex-1 font-mono text-[12.5px] leading-[1.85] md:text-[13px]">
          {LINES.slice(0, lineIdx + 1).map((line, i) => {
            const isActive = i === lineIdx && lineIdx < LINES.length;
            const shown = isActive ? line.cmd.slice(0, charIdx) : line.cmd;
            const done = completed[i];
            const isCommand = line.cmd.startsWith("$");
            const isHead = line.cmd.startsWith("HEAD");
            return (
              <div key={i} className="flex flex-col">
                <div
                  style={{
                    color: isCommand
                      ? "var(--foreground)"
                      : isHead
                        ? "var(--accent)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {shown}
                  {isActive && (
                    <span
                      className="ml-0.5 inline-block h-[1.05em] w-[7px] translate-y-[2px] bg-accent align-middle"
                      style={{ animation: "blink 1s steps(2, start) infinite" }}
                    />
                  )}
                </div>
                {done && line.ok && (
                  <div
                    className="pl-3 text-[11px]"
                    style={{
                      color: "var(--success)",
                      opacity: 0.85,
                      animation: "fade-in 260ms ease-out both",
                    }}
                  >
                    {line.ok}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Git graph */}
        <div className="mx-auto w-[120px] shrink-0 md:mx-0 md:w-[140px]">
          <svg viewBox={`0 0 80 ${GRAPH_H + 30}`} className="h-auto w-full" aria-hidden>
            <defs>
              <filter id="boot-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* HEAD label */}
            <text
              x={40}
              y={14}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="9"
              fill={progress >= 0.98 ? "var(--accent)" : "var(--muted-foreground)"}
              style={{ transition: "fill 300ms ease" }}
            >
              {progress >= 0.98 ? "HEAD → main" : "HEAD"}
            </text>

            {/* Trunk line */}
            <line
              x1={40}
              y1={22}
              x2={40}
              y2={NODE_YS[NODE_YS.length - 1] + 6}
              stroke="var(--border-strong)"
              strokeOpacity={0.55}
              strokeWidth={1.1}
            />

            {/* Commits */}
            {NODE_YS.map((y, i) => {
              const on = activated[i];
              return (
                <g key={i}>
                  <circle
                    cx={40}
                    cy={y}
                    r={9}
                    fill="var(--accent)"
                    opacity={on ? 0.14 : 0.05}
                    style={{ transition: "opacity 260ms ease" }}
                  />
                  <circle
                    cx={40}
                    cy={y}
                    r={on ? 4 : 3.2}
                    fill={on ? "var(--accent)" : "var(--background)"}
                    stroke="var(--accent)"
                    strokeWidth={1}
                    style={{ transition: "fill 200ms ease, r 200ms ease" }}
                  />
                </g>
              );
            })}

            {/* Pulse runner */}
            <g>
              <circle cx={40} cy={22 + pulseY} r={11} fill="var(--accent)" opacity={0.22} />
              <circle
                cx={40}
                cy={22 + pulseY}
                r={4.2}
                fill="var(--accent)"
                filter="url(#boot-glow)"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Footer info — stacked & centered on mobile, split corners on desktop */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 px-4 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground sm:bottom-5 sm:flex-row sm:items-end sm:justify-between sm:gap-3 sm:px-6 sm:text-left">
        <div className="opacity-40 order-2 sm:order-1">guptaaryandra@cloud</div>
        <div className="opacity-50 order-1 sm:order-2 flex flex-col items-center gap-0.5 sm:flex-row sm:gap-0">
          <span>Build v1.0.0</span>
          <span className="hidden sm:inline mx-2 opacity-60">·</span>
          <span>
            Cloud <span className="opacity-40">•</span> DevOps <span className="opacity-40">•</span>{" "}
            Agentic AI
          </span>
        </div>
      </div>
    </div>
  );
}
