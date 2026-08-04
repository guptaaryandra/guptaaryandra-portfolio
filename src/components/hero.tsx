import { useEffect, useRef, useState } from "react";
import { ArrowRight, Download, MapPin } from "lucide-react";
import { HeroObject } from "./hero-object";

const NAME_LINES = ["ARYANDRA", "GUPTA"] as const;
const SEQUENCE: Array<readonly [string, string]> = [
  ["ARYANDRA", "GUPTA"],
  ["CLOUD", ""],
  ["DEVOPS", ""],
  ["AGENTIC", "AI"],
  ["ARYANDRA", "GUPTA"],
];
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&?/*";
const SCRAMBLE_MS = 500;
const PAUSE_MS = 400;

function randChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function scrambleTowards(target: string, progress: number) {
  const revealed = Math.floor(target.length * progress);
  let out = "";
  for (let i = 0; i < target.length; i++) {
    if (target[i] === " ") out += " ";
    else if (i < revealed) out += target[i];
    else out += randChar();
  }
  return out;
}

function ScrambleName() {
  const [lines, setLines] = useState<readonly [string, string]>(["ARYANDRA", "GUPTA"]);
  const playingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const timeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const cleanup = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  useEffect(() => cleanup, []);

  const runStep = (
    from: readonly [string, string],
    to: readonly [string, string],
    done: () => void,
  ) => {
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / SCRAMBLE_MS);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const l1 = scrambleTowards(to[0], eased);
      const l2 = scrambleTowards(to[1], eased);
      setLines([l1, l2]);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setLines(to);
        done();
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const play = () => {
    if (playingRef.current) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    playingRef.current = true;

    let i = 0;
    const next = () => {
      if (i >= SEQUENCE.length - 1) {
        playingRef.current = false;
        return;
      }
      const from = SEQUENCE[i];
      const to = SEQUENCE[i + 1];
      i++;
      runStep(from, to, () => {
        const t = setTimeout(next, PAUSE_MS);
        timeoutsRef.current.push(t);
      });
    };
    next();
  };

  return (
    <h1
      className="hero-name font-plex tracking-tight cursor-default select-none"
      style={{
        fontSize: "clamp(2rem, 11vw, 6.5rem)",
        lineHeight: 0.98,
        letterSpacing: "-0.02em",
      }}
      onMouseEnter={play}
      aria-label={NAME_LINES.join(" ")}
    >
      <span className="block whitespace-nowrap">{lines[0] || "\u00A0"}</span>
      <span className="block whitespace-nowrap">{lines[1] || "\u00A0"}</span>
    </h1>
  );
}

const SUBTITLE = [
  "Building scalable cloud systems",
  "Automating everything worth repeating",
  "Engineering intelligent workflows",
];

export function Hero() {
  return (
    <section id="top" className="relative border-b border-border">
      <div className="container-page pb-16 pt-10 sm:pb-24 sm:pt-14 md:pb-32 md:pt-10 lg:pt-8">
        <div className="grid gap-10 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-accent">●</span> HEAD → main
            </div>

            <div className="mt-6 sm:mt-8">
              <ScrambleName />
            </div>

            <div className="mt-5 sm:mt-6 space-y-1 font-mono text-[13px] sm:text-sm text-muted-foreground">
              {SUBTITLE.map((line) => (
                <div key={line} className="break-words">
                  <span className="text-foreground">›</span> {line}
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-10 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center gap-2 sm:gap-3">
              <a
                href="#projects"
                className="btn-primary group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2.5 font-mono text-xs text-background"
              >
                open projects{" "}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#experience"
                className="btn-secondary inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-border-strong px-4 py-2.5 font-mono text-xs text-foreground"
              >
                explore journey
              </a>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-3 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Download className="h-3 w-3" /> download resume
              </a>
            </div>

            <div className="mt-6 sm:mt-8 inline-flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> Prayagraj, India
              <span className="mx-2 opacity-40">·</span>
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success" /> available
            </div>
          </div>

          <div className="relative min-w-0">
            <HeroObject />
          </div>
        </div>
      </div>
    </section>
  );
}
