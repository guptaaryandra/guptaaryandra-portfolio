import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AmbientBackground } from "@/components/ambient-background";
import { BootSequence } from "@/components/boot-sequence";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="max-w-md text-center">
        <div className="text-xs text-muted-foreground">ERR_ROUTE_NOT_FOUND</div>
        <h1 className="mt-2 text-6xl text-foreground">404</h1>
        <p className="mt-3 text-sm text-muted-foreground">Route unresolved. Return to root.</p>
        <a href="/" className="mt-6 inline-block text-accent hover:underline">/ home</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-mono">
      <div className="max-w-md text-center">
        <div className="text-xs text-muted-foreground">RUNTIME_EXCEPTION</div>
        <h1 className="mt-2 text-2xl text-foreground">System halted</h1>
        <div className="mt-6 flex justify-center gap-3 text-sm">
          <button onClick={() => { router.invalidate(); reset(); }} className="text-accent hover:underline">retry</button>
          <a href="/" className="text-muted-foreground hover:text-foreground">/ home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "guptaaryandra_ • DevOps & Cloud Engineer" },
      { name: "description", content: "Premium engineering portfolio showcasing DevOps, Cloud Infrastructure, Automation, and Agentic AI projects." },
      { name: "author", content: "Aryandra Gupta" },
      { name: "theme-color", content: "#0B0B0C" },
      { property: "og:title", content: "guptaaryandra_ • DevOps & Cloud Engineer" },
      { property: "og:description", content: "Premium engineering portfolio showcasing DevOps, Cloud Infrastructure, Automation, and Agentic AI projects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "guptaaryandra_ • DevOps & Cloud Engineer" },
      { name: "twitter:description", content: "Premium engineering portfolio showcasing DevOps, Cloud Infrastructure, Automation, and Agentic AI projects." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=document.documentElement;if(t==='light'){d.classList.add('light');d.classList.remove('dark');}else{d.classList.add('dark');d.classList.remove('light');}}catch(e){}try{if('scrollRestoration' in history){history.scrollRestoration='manual';}}catch(e){}try{if(window.location.hash){history.replaceState(null,'',window.location.pathname+window.location.search);}}catch(e){}try{window.scrollTo(0,0);}catch(e){}try{document.documentElement.style.overflow='hidden';}catch(e){}})();`,
          }}
        />
        <HeadContent />
      </head>
      <body style={{ overflow: "hidden" }}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AmbientBackground />
      <BootSequence />
      <Outlet />
      <Analytics />
    </QueryClientProvider>
  );
}

