import { useState } from "react";
import { Section } from "../section";
import { TypedTitle } from "../typed-title";

type Stage = "Exploring" | "Learning" | "Hands-on" | "Building" | "Production Practice";

type Tech = { name: string; stage: Stage; note?: string };
type Phase = { id: string; title: string; subtitle: string; techs: Tech[] };

const PHASES: Phase[] = [
  {
    id: "foundation",
    title: "Foundation",
    subtitle: "Operating systems, source control and the language everything else runs on.",
    techs: [
      {
        name: "Linux",
        stage: "Production Practice",
        note: "Filesystems, processes, systemd, networking.",
      },
      {
        name: "Git & GitHub",
        stage: "Production Practice",
        note: "Branching, PR workflow, CI triggers.",
      },
      { name: "Python", stage: "Building", note: "Automation scripting and AI tooling." },
    ],
  },
  {
    id: "cloud",
    title: "Cloud Engineering",
    subtitle: "Infrastructure and automation on real cloud environments.",
    techs: [
      {
        name: "AWS",
        stage: "Production Practice",
        note: "EC2, S3, IAM, CloudFront, Route53, VPC.",
      },
      {
        name: "Docker",
        stage: "Production Practice",
        note: "Images, compose, multi-stage builds.",
      },
      { name: "Terraform", stage: "Hands-on", note: "IaC modules for AWS baseline." },
      { name: "Ansible", stage: "Exploring", note: "Configuration management and playbooks." },
    ],
  },
  {
    id: "devops",
    title: "DevOps",
    subtitle: "Pipelines, orchestration and deployment automation.",
    techs: [
      { name: "GitLab CI/CD", stage: "Learning", note: "Pipeline-as-code and runners." },
      { name: "Jenkins", stage: "Learning", note: "Declarative pipelines." },
      { name: "Kubernetes", stage: "Learning", note: "Pods, deployments, services." },
    ],
  },
  {
    id: "observability",
    title: "Observability",
    subtitle: "Metrics, dashboards and system visibility.",
    techs: [
      { name: "Prometheus", stage: "Exploring", note: "Metrics, exporters, PromQL." },
      { name: "Grafana", stage: "Exploring", note: "Dashboards for infra health." },
    ],
  },
  {
    id: "agentic",
    title: "Agentic AI",
    subtitle: "Long-term specialization: autonomous engineering agents.",
    techs: [
      { name: "OpenAI API", stage: "Hands-on", note: "Chat, tools, embeddings, function calling." },
      {
        name: "Model Context Protocol",
        stage: "Learning",
        note: "Standard LLM ↔ tools interface.",
      },
      { name: "LangGraph", stage: "Exploring", note: "Graph-based agent orchestration." },
      { name: "CrewAI", stage: "Exploring", note: "Role-based collaborative agents." },
      { name: "Agentic AI Systems", stage: "Learning", note: "End-to-end autonomous workflows." },
    ],
  },
];

const ROADMAP = [
  "Linux",
  "Python",
  "Cloud",
  "Docker",
  "Terraform",
  "CI/CD",
  "Kubernetes",
  "Monitoring",
  "Agentic AI",
];

function stageColor(stage: Stage) {
  if (stage === "Production Practice") return "var(--success)";
  if (stage === "Building" || stage === "Hands-on") return "var(--accent)";
  return "var(--muted-foreground)";
}

function StageBadge({ stage }: { stage: Stage }) {
  const color = stageColor(stage);
  const glyph = stage === "Production Practice" ? "✓" : "●";
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest"
      style={{ color }}
    >
      <span aria-hidden>{glyph}</span>
      {stage}
    </span>
  );
}

export function Learning() {
  const [hoverPhase, setHoverPhase] = useState<string | null>(null);
  const [hoverTech, setHoverTech] = useState<string | null>(null);

  return (
    <Section
      id="learning"
      label="05 · Engineering Lab"
      title={<TypedTitle text="THE LAB NEVER SLEEPS." />}
      meta="./lab/active"
    >
      <p className="mb-10 max-w-2xl font-mono text-[12px] leading-relaxed text-muted-foreground reveal">
        The path an engineer walks — foundation, cloud, DevOps, observability and finally agentic
        AI. Every technology below is placed where it actually sits in that journey.
      </p>

      {/* Engineering Roadmap */}
      <div className="reveal mb-14 border-l border-border pl-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Engineering Roadmap
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[12px] text-foreground">
          {ROADMAP.map((step, i) => (
            <span key={step} className="inline-flex items-center gap-2">
              <span>{step}</span>
              {i < ROADMAP.length - 1 && (
                <span aria-hidden className="text-accent">
                  →
                </span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-12">
        {PHASES.map((phase, phaseIdx) => {
          const dim = hoverPhase && hoverPhase !== phase.id;
          return (
            <div
              key={phase.id}
              className="reveal"
              onMouseEnter={() => setHoverPhase(phase.id)}
              onMouseLeave={() => setHoverPhase((cur) => (cur === phase.id ? null : cur))}
              style={{
                opacity: dim ? 0.4 : 1,
                transition: "opacity 260ms ease",
              }}
            >
              {/* Phase header */}
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    Phase {String(phaseIdx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-plex text-[15px] uppercase tracking-[0.14em] text-foreground">
                    {phase.title}
                  </span>
                </div>
                <span className="hidden md:block font-mono text-[11px] text-muted-foreground">
                  ./{phase.id}
                </span>
              </div>
              <div className="mb-5 max-w-2xl font-mono text-[11px] leading-relaxed text-muted-foreground">
                {phase.subtitle}
              </div>

              {/* Technologies */}
              <div className="grid gap-x-10 gap-y-3 md:grid-cols-2 lg:grid-cols-3">
                {phase.techs.map((t) => {
                  const isHover = hoverTech === t.name;
                  const techDim = hoverTech && !isHover;
                  return (
                    <div
                      key={t.name}
                      onMouseEnter={() => setHoverTech(t.name)}
                      onMouseLeave={() => setHoverTech((cur) => (cur === t.name ? null : cur))}
                      className="group relative py-1"
                      style={{
                        opacity: techDim ? 0.55 : 1,
                        transition: "opacity 220ms ease",
                      }}
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <span
                          className="font-plex text-[13px] text-foreground transition-colors"
                          style={{ color: isHover ? "var(--foreground)" : undefined }}
                        >
                          {t.name}
                        </span>
                        <StageBadge stage={t.stage} />
                      </div>
                      {/* progress scan line */}
                      <div className="mt-2 h-px w-full overflow-hidden bg-border">
                        <div
                          key={isHover ? "scan-on" : "scan-off"}
                          className="h-full"
                          style={{
                            width: isHover ? "100%" : "40%",
                            background: stageColor(t.stage),
                            transition: isHover ? "width 800ms ease-out" : "width 300ms ease",
                          }}
                        />
                      </div>
                      {/* tooltip */}
                      {t.note && (
                        <div
                          className="pointer-events-none absolute left-0 top-full z-10 mt-1 rounded border border-border bg-panel-2 px-2 py-1 font-mono text-[11px] text-muted-foreground shadow-sm"
                          style={{
                            opacity: isHover ? 1 : 0,
                            transform: isHover ? "translateY(0)" : "translateY(-2px)",
                            transition: "opacity 180ms ease, transform 180ms ease",
                          }}
                        >
                          {t.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
