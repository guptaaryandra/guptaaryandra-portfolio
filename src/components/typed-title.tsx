import { useEffect, useRef, useState } from "react";

// Shared section-heading typing animation.
// Plays once on first viewport entry; blinking cursor when done.
export function TypedTitle({ text, speed = 42 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(text);
      setDone(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            let i = 0;
            const tick = () => {
              i++;
              setShown(text.slice(0, i));
              if (i < text.length) setTimeout(tick, speed);
              else setDone(true);
            };
            tick();
            obs.disconnect();
          }
        });
      },
      { rootMargin: "-10% 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [text, speed]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <span>{shown || "\u00A0"}</span>
      <span
        aria-hidden
        className="ml-1 inline-block h-[0.9em] w-[0.5ch] translate-y-[2px] bg-accent"
        style={{
          animation: done ? "cursor-blink 1s steps(1) infinite" : "none",
          opacity: done ? undefined : 1,
        }}
      />
      <style>{`@keyframes cursor-blink { 50% { opacity: 0 } }`}</style>
    </span>
  );
}
