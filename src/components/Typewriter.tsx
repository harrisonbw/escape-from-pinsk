import { useEffect, useRef, useState } from "react";

interface TypewriterProps {
  text: string;
  /** ms per character */
  speed?: number;
  className?: string;
  /** When text changes, restarts */
  active?: boolean;
  onDone?: () => void;
  /** Skip to full text when parent requests */
  skip?: boolean;
}

export function Typewriter({
  text,
  speed = 18,
  className,
  active = true,
  onDone,
  skip = false,
}: TypewriterProps) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    doneRef.current = false;
    setShown(0);
    if (!active || !text) {
      setShown(text.length);
      return;
    }
  }, [text, active]);

  useEffect(() => {
    if (skip) {
      setShown(text.length);
      return;
    }
  }, [skip, text]);

  useEffect(() => {
    if (!active) return;
    if (shown >= text.length) {
      if (!doneRef.current) {
        doneRef.current = true;
        onDoneRef.current?.();
      }
      return;
    }

    const ch = text[shown];
    // Slightly faster on spaces, pause on punctuation
    let delay = speed;
    if (ch === " ") delay = speed * 0.5;
    if (ch === "." || ch === "!" || ch === "?" || ch === "\n") delay = speed * 4;
    if (ch === "," || ch === ";") delay = speed * 2.5;

    const t = window.setTimeout(() => setShown((n) => n + 1), delay);
    return () => window.clearTimeout(t);
  }, [shown, text, speed, active]);

  const full = shown >= text.length;
  const display = text.slice(0, shown);

  return (
    <p className={className}>
      {display}
      {!full && active && <span className="tw-cursor" aria-hidden>█</span>}
    </p>
  );
}
