import { TypedTitle } from "../typed-title";
import { Section } from "../section";
import { ExternalLink, Github } from "lucide-react";

type Project = {
  id: string;
  commit: string;
  title: string;
  status: "SUCCESS" | "PLANNED";
  meta: { label: string; value: string }[];
  services: string[];
  github?: string;
  live?: string;
};

const PROJECTS: Project[] = [
  {
    id: "DEP-2026-001",
    commit: "a7c91f2",
    title: "AWS Static Website",
    status: "SUCCESS",
    meta: [
      { label: "region", value: "ap-south-1" },
      { label: "runtime", value: "Static Website" },
    ],
    services: ["S3", "CloudFront", "IAM"],
    github: "https://github.com/guptaaryandra/aws-static-website-deployment",
  },
  {
    id: "DEP-2026-002",
    commit: "c91ab34",
    title: "Dockerized Nginx on EC2",
    status: "SUCCESS",
    meta: [
      { label: "host", value: "EC2 Ubuntu" },
      { label: "runtime", value: "Docker" },
      { label: "server", value: "Nginx" },
    ],
    services: ["EC2", "Docker", "Nginx"],
    github: "https://github.com/guptaaryandra/aws-docker-webapp",
  },
  {
    id: "DEP-2026-003",
    commit: "f28d7bc",
    title: "Route53 DNS Routing",
    status: "SUCCESS",
    meta: [
      { label: "dns", value: "Amazon Route53" },
      { label: "routing", value: "Public" },
      { label: "ssl", value: "Configured" },
    ],
    services: ["Route53", "ACM"],
    github: "https://github.com/guptaaryandra/aws-static-website-deployment",
  },
  {
    id: "DEP-2026-004",
    commit: "b34e07a",
    title: "Terraform · AWS Baseline",
    status: "PLANNED",
    meta: [
      { label: "status", value: "Planning" },
      { label: "iac", value: "Terraform" },
      { label: "target", value: "AWS Infrastructure" },
    ],
    services: ["Terraform", "AWS", "IaC"],
  },
  {
    id: "DEP-2026-005",
    commit: "d5f11ab",
    title: "Agentic AI · MCP Server",
    status: "PLANNED",
    meta: [
      { label: "language", value: "Python" },
      { label: "protocol", value: "MCP" },
      { label: "framework", value: "LangGraph" },
    ],
    services: ["Python", "MCP", "LangGraph"],
  },
];

function DeploymentSummary() {
  const success = PROJECTS.filter((p) => p.status === "SUCCESS").length;
  const planned = PROJECTS.filter((p) => p.status === "PLANNED").length;
  const rows: [string, string, string?][] = [
    ["✓", "Successful Deployments", String(success)],
    ["◐", "Planned Deployments", String(planned)],
    ["☁", "Cloud Provider", "AWS"],
    ["⚙", "Primary Stack", "Linux • Docker • CloudFront"],
    ["📍", "Region", "ap-south-1"],
    ["✔", "Repository Health", "Healthy"],
  ];
  return (
    <div className="mb-8 font-plex text-[12px] reveal">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-accent uppercase tracking-[0.2em] text-[11px]">
          // deployment summary
        </span>
        <span className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-muted-foreground">
        {rows.map(([icon, label, value]) => {
          const isStatus = icon === "✓" || icon === "✔";
          return (
            <div key={label} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span
                className={
                  isStatus ? "text-success" : icon === "◐" ? "text-accent" : "text-muted-foreground"
                }
              >
                {icon}
              </span>
              <span className="text-muted-foreground/90 sm:min-w-[180px]">{label}</span>
              <span className="text-muted-foreground/60">:</span>
              <span className="text-foreground break-words">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Project["status"] }) {
  if (status === "SUCCESS") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
        style={{
          color: "var(--success)",
          borderColor: "color-mix(in oklab, var(--success) 40%, transparent)",
          background: "color-mix(in oklab, var(--success) 8%, transparent)",
        }}
      >
        <span
          className="status-dot h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--success)" }}
        />
        SUCCESS
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
      <span className="coming-soon">COMING SOON</span>
    </span>
  );
}

function Row({ p, index }: { p: Project; index: number }) {
  return (
    <div
      className="deploy-row group grid gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:px-6 sm:py-5 md:grid-cols-[130px_minmax(0,1.6fr)_130px_minmax(0,1fr)_150px] md:items-center reveal"
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="min-w-0">
        <div className="dep-id font-mono text-[12px] text-muted-foreground transition-colors break-all">
          {p.id}
        </div>
        <div className="mt-1 font-mono text-[10px] text-muted-foreground/60 break-all">
          commit <span className="text-muted-foreground/80">{p.commit}</span>
        </div>
      </div>

      <div className="min-w-0">
        <div className="text-foreground font-plex break-words">{p.title}</div>
        <div className="mt-1.5 grid gap-x-4 gap-y-0.5 font-mono text-[11px] text-muted-foreground sm:grid-cols-[auto_1fr]">
          {p.meta.map((m) => (
            <div key={m.label} className="contents">
              <span className="text-muted-foreground/60 uppercase tracking-wider text-[10px]">
                {m.label}
              </span>
              <span className="text-foreground/80 break-words">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <StatusBadge status={p.status} />
      </div>

      <div className="flex flex-wrap gap-1 service-tags">
        {p.services.map((s, i) => (
          <span
            key={s}
            className="service-tag rounded border border-border bg-panel-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 font-mono text-[11px] md:justify-end">
        {p.github && (
          <a
            href={p.github}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-link inline-flex min-h-[36px] items-center gap-1.5 text-muted-foreground"
          >
            <Github className="gh-icon h-3.5 w-3.5" />
            <span className="gh-text">github</span>
            <ExternalLink className="gh-ext h-3 w-3" />
          </a>
        )}
        {p.live && (
          <a
            href={p.live}
            target="_blank"
            rel="noopener noreferrer"
            className="gh-link inline-flex min-h-[36px] items-center gap-1.5 text-muted-foreground"
          >
            <ExternalLink className="gh-icon h-3.5 w-3.5" />
            <span className="gh-text">live</span>
          </a>
        )}
        {p.status === "PLANNED" && (
          <span className="planned-hint font-mono text-[10px] text-muted-foreground/50">
            Waiting for implementation...
          </span>
        )}
      </div>
    </div>
  );
}

function DeploymentTerminal() {
  return (
    <div className="mt-8 panel rounded-md p-4 font-mono text-[12px] reveal">
      <div className="flex items-center gap-2 border-b border-border pb-2 mb-3">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        <span className="ml-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          deploy.sh
        </span>
      </div>
      <div className="text-muted-foreground">
        <div>
          <span className="text-accent">$</span> deployment status
        </div>
        {PROJECTS.map((p) => (
          <div key={p.id} className="text-muted-foreground">
            <span className={p.status === "SUCCESS" ? "text-success" : "text-muted-foreground/60"}>
              {p.status === "SUCCESS" ? "✓" : "○"}
            </span>{" "}
            <span className="text-foreground/80">{p.id}</span>{" "}
            <span className={p.status === "SUCCESS" ? "text-success" : "text-muted-foreground/70"}>
              {p.status}
            </span>
          </div>
        ))}
        <div className="mt-3 pt-3 border-t border-border grid gap-1 sm:grid-cols-2">
          <div>
            Pipeline Status: <span className="text-success">Healthy</span>
          </div>
          <div>
            Latest Deployment: <span className="text-foreground">DEP-2026-003</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  return (
    <Section
      id="projects"
      label="03 · Deployments"
      title={<TypedTitle text="Deployment records, not marketing cards." />}
      meta="./deployments"
    >
      <DeploymentSummary />
      <div className="panel soft-shadow rounded-lg overflow-hidden">
        <div className="hidden md:grid grid-cols-[130px_minmax(0,1.6fr)_130px_minmax(0,1fr)_150px] gap-4 border-b border-border bg-panel-2 px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <div>deployment id</div>
          <div>deployment</div>
          <div>status</div>
          <div>services</div>
          <div className="text-right">artifacts</div>
        </div>
        {PROJECTS.map((p, i) => (
          <Row key={p.id} p={p} index={i} />
        ))}
      </div>
      <DeploymentTerminal />
    </Section>
  );
}
