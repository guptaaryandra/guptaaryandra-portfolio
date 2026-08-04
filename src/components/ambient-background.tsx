import { useEffect, useRef } from "react";

export function AmbientBackground() {
  const gridRef = useRef<HTMLDivElement>(null);
  const noiseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 8;
      ty = (e.clientY / window.innerHeight - 0.5) * 8;
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      if (gridRef.current) {
        gridRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={gridRef}
        className="bg-grid absolute -inset-8"
        style={{ willChange: "transform" }}
      />
      <div className="bg-scanlines absolute inset-0" />
      <div
        ref={noiseRef}
        className="absolute -inset-20"
        style={{
          opacity: "var(--noise-opacity)",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          animation: "noise-shift 1.6s steps(6) infinite",
        }}
      />
      {/* subtle radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px 500px at 50% -10%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
