import { TypedTitle } from "../typed-title";
import { Section } from "../section";
import { Github, Linkedin, Mail, FileText, ArrowUpRight } from "lucide-react";

const LINKS = [
  {
    icon: Mail,
    label: "email",
    value: "guptaaryandra@gmail.com",
    href: "mailto:guptaaryandra@gmail.com",
  },
  {
    icon: Github,
    label: "github",
    value: "github.com/guptaaryandra",
    href: "https://github.com/guptaaryandra",
  },
  {
    icon: Linkedin,
    label: "linkedin",
    value: "linkedin.com/in/gupta-aryandra",
    href: "https://linkedin.com/in/gupta-aryandra/",
  },
  { icon: FileText, label: "resume", value: "resume.pdf", href: "/resume.pdf" },
];

export function Contact() {
  return (
    <Section
      id="contact"
      label="06 · Connect"
      title={<TypedTitle text="Let's build something." />}
      meta="./connect"
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-border md:grid-cols-2">
        {LINKS.map(({ icon: Icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer noopener"
            className="group flex items-center justify-between gap-4 bg-panel p-6 transition-colors hover:bg-panel-2 reveal"
            data-cursor="card"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-border bg-panel-2 text-muted-foreground group-hover:text-accent group-hover:border-accent transition-colors">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {label}
                </div>
                <div className="mt-0.5 text-foreground">{value}</div>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </a>
        ))}
      </div>
      <div className="mt-10 font-mono text-[11px] text-muted-foreground reveal">
        <span className="text-accent">$</span> echo "thanks for scrolling · built with care in
        prayagraj"
      </div>
    </Section>
  );
}
