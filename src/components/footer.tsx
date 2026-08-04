export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col items-center gap-2 py-5 text-center font-mono text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-6 sm:text-left">
        <div className="break-words">
          © {new Date().getFullYear()} Aryandra Gupta · all systems nominal
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            runtime · online
          </span>
          <span className="opacity-40 hidden sm:inline">·</span>
          <span>build · v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
