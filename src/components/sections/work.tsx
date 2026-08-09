import { Section } from "../section";
import { TypedTitle } from "../typed-title";

const BULLETS = [
  "Configured and deployed AWS cloud resources including EC2, IAM, and VPC through hands-on infrastructure assignments.",
  "Applied Linux administration and networking concepts for cloud configuration, monitoring, and troubleshooting.",
  "Completed practical cloud security, infrastructure, and project-based assignments, strengthening AWS and cloud administration skills.",
];

export function Work() {
  return (
    <Section
      id="work"
      label="02 · Experience"
      title={<TypedTitle text="Hands on the console." />}
      meta="./log/experience"
    >
      <div className="relative reveal">
        {/* rail */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[7px] top-2 bottom-2 w-px"
          style={{ background: "var(--border)" }}
        />
        <div className="relative pl-8">
          <span
            aria-hidden
            className="absolute left-0 top-[10px] block h-3.5 w-3.5 rounded-full"
            style={{
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              boxShadow: "0 0 0 5px color-mix(in oklab, var(--accent) 12%, transparent)",
            }}
          />

          <article
            className="group rounded-md border border-border p-5 sm:p-7 transition-colors duration-300 hover:border-[var(--border-strong)]"
            style={{ background: "color-mix(in oklab, var(--foreground) 2%, transparent)" }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-accent">
                  Cloud Engineer Trainee Intern
                </div>
                <h3 className="mt-2 font-plex text-xl md:text-[22px] leading-snug text-foreground break-words">
                  CloudFox CyberTech Educom
                </h3>
                <div className="mt-1 font-mono text-[12px] text-muted-foreground">
                  Prayagraj, India
                </div>
              </div>
              <div className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:text-right">
                Mar 2026 — Jul 2026
                <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] tracking-[0.22em] text-[var(--success)]">
                  <span aria-hidden>✓</span> COMPLETED
                </div>
              </div>
            </div>

            <div className="mt-6 font-mono text-[11px] sm:text-[12px] leading-[1.9] overflow-x-auto">
              <div className="min-w-0">
                <div className="text-muted-foreground">
                  <span className="text-accent">$</span> cat internship/summary.md
                </div>
                <ul className="mt-3 space-y-2">
                  {BULLETS.map((b, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        aria-hidden
                        className="shrink-0"
                        style={{ color: "var(--border-strong)" }}
                      >
                        {i === BULLETS.length - 1 ? "└──" : "├──"}
                      </span>
                      <span className="text-foreground/80">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>
      </div>
    </Section>
  );
}
