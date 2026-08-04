import { Section } from "../section";
import { TypedTitle } from "../typed-title";

const NODES = [
  { title: "Cloud Engineer", note: "AWS · Linux · Networking", state: "current" },
  { title: "DevOps Engineer", note: "Docker · K8s · CI/CD · IaC", state: "next" },
  {
    title: "Platform Engineer",
    note: "Internal platforms · Developer experience",
    state: "future",
  },
  { title: "Agentic AI Engineer", note: "LLM orchestration · MCP · Tooling", state: "future" },
  {
    title: "AI Infrastructure Architect",
    note: "Runtimes · Scaling · Reliability",
    state: "north-star",
  },
];

export function Roadmap() {
  return (
    <Section
      id="roadmap"
      label="07 · Trajectory"
      title={<TypedTitle text="The path — one deployment at a time." />}
      meta="./roadmap.timeline"
    >
      <ol className="relative border-l border-border pl-6 md:pl-10">
        {NODES.map((n, i) => (
          <li key={n.title} className="relative pb-10 last:pb-0 reveal">
            <span
              className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border border-border bg-background md:-left-[47px]"
              style={{
                borderColor: n.state === "current" ? "var(--accent)" : "var(--border)",
                background: n.state === "current" ? "var(--accent)" : "var(--background)",
                boxShadow:
                  n.state === "current"
                    ? "0 0 0 4px color-mix(in oklab, var(--accent) 20%, transparent)"
                    : undefined,
              }}
            />
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                phase.{String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                style={{
                  color: n.state === "current" ? "var(--accent)" : "var(--muted-foreground)",
                  borderColor:
                    n.state === "current"
                      ? "color-mix(in oklab, var(--accent) 40%, transparent)"
                      : "var(--border)",
                }}
              >
                {n.state}
              </span>
            </div>
            <h3 className="mt-2 font-plex text-2xl md:text-3xl tracking-tight text-foreground">
              {n.title}
            </h3>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{n.note}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
