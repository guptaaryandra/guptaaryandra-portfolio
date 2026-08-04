import { TypedTitle } from "../typed-title";
import { useState } from "react";
import { Section } from "../section";

const NODES = [
  { id: "cloud", label: "Cloud", sub: "diploma · aws fundamentals" },
  { id: "infra", label: "Infrastructure", sub: "linux · networking · ec2" },
  { id: "auto", label: "Automation", sub: "docker · terraform · bash" },
  { id: "devops", label: "DevOps", sub: "ci/cd · observability" },
  { id: "agi", label: "Agentic AI", sub: "orchestration · runtimes" },
] as const;

function CareerDiagram() {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="panel soft-shadow relative rounded-lg p-5"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>trajectory.map</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          in progress
        </span>
      </div>

      <div className="relative">
        {NODES.map((n, i) => {
          const done = i <= 1;
          const current = i === 2;
          return (
            <div key={n.id} className="relative">
              <div className="flex items-center gap-3 py-2">
                <div
                  className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono text-[11px]"
                  style={{
                    borderColor: current || hover ? "var(--accent)" : "var(--border-strong)",
                    color: current ? "var(--accent)" : "var(--foreground)",
                    background: "var(--panel)",
                    transition: "border-color 300ms ease, color 300ms ease",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                  {(current || hover) && (
                    <span
                      className="absolute inset-0 rounded-md"
                      style={{
                        boxShadow: "0 0 0 2px color-mix(in oklab, var(--accent) 20%, transparent)",
                        animation: current ? "pulse 2s ease-in-out infinite" : undefined,
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-plex text-sm text-foreground">{n.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {done ? "done" : current ? "now" : "next"}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">{n.sub}</div>
                </div>
              </div>

              {i < NODES.length - 1 && (
                <div className="ml-4 flex h-6 items-center">
                  <div
                    className="relative h-full w-px overflow-hidden"
                    style={{ background: "var(--border-strong)" }}
                  >
                    <span
                      className="absolute left-0 h-3 w-full"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent, var(--accent), transparent)",
                        animation: hover
                          ? `flow-down 1.6s ${i * 0.12}s ease-in-out infinite`
                          : "none",
                        opacity: hover ? 1 : 0,
                        transition: "opacity 300ms ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes flow-down {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(600%); }
        }
      `}</style>
    </div>
  );
}

export function About() {
  return (
    <Section
      id="about"
      label="01 · README"
      title={<TypedTitle text="Infrastructure first. Shipping over theory." />}
      meta="./README.md"
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 text-[15px] leading-relaxed text-foreground/85 reveal">
          <p>
            I'm Aryandra, based in Prayagraj. I finished my{" "}
            <span className="text-foreground">Diploma in Cloud Computing</span> and I'm now pursuing
            a <span className="text-foreground">BCA</span> while building projects that force me to
            touch real infrastructure — the ones that break, log strange errors, and only work after
            reading the docs twice.
          </p>
          <p>
            My approach is simple: build the thing, deploy it, watch it fall over, fix it, document
            what I learned, commit. Tutorials get me started; version control, debugging and small
            automations are what actually make the knowledge stick. Every project is a chance to
            make the next one a little more boring — in the good way.
          </p>
          <p>
            The direction I'm heading in is{" "}
            <span className="text-accent">Cloud Infrastructure, DevOps and Agentic AI</span> — the
            platforms that let software (and eventually agents) run reliably in production. I'd
            rather ship five honest projects than talk about ten I never finished.
          </p>
        </div>
        <div className="reveal">
          <CareerDiagram />
        </div>
      </div>
    </Section>
  );
}
