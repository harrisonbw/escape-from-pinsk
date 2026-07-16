import { useEffect, useState, type ReactNode } from "react";
import { artUrl, getNode } from "../engine/machine";
import type { StoryNode } from "../engine/types";

interface StageProps {
  node: StoryNode;
  mode: "crt" | "ega";
  children: ReactNode;
  topBar?: ReactNode;
  dimArt?: boolean;
  /** Optional next image to warm the cache */
  prefetchIds?: string[];
}

export function Stage({
  node,
  mode,
  children,
  topBar,
  dimArt,
  prefetchIds = [],
}: StageProps) {
  const src = node.image
    ? artUrl(node.image.style, node.image.file)
    : undefined;
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!src) {
      setLoadedSrc(undefined);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!cancelled) setLoadedSrc(src);
    };
    img.onerror = () => {
      if (!cancelled) setLoadedSrc(src); // still show broken/fallback attempt
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  // Prefetch upcoming art so transitions feel instant
  useEffect(() => {
    for (const id of prefetchIds) {
      try {
        const n = getNode(id);
        if (n.image) {
          const u = artUrl(n.image.style, n.image.file);
          const img = new Image();
          img.decoding = "async";
          img.src = u;
        }
      } catch {
        /* ignore */
      }
    }
  }, [prefetchIds]);

  const showSrc = loadedSrc === src ? src : src;
  const loading = Boolean(src && loadedSrc !== src);

  return (
    <div className={`monitor monitor--${mode}`}>
      <div className="monitor-bezel">
        <div className="monitor-screw monitor-screw--tl" aria-hidden />
        <div className="monitor-screw monitor-screw--tr" aria-hidden />
        <div className="monitor-screw monitor-screw--bl" aria-hidden />
        <div className="monitor-screw monitor-screw--br" aria-hidden />

        <div
          className={`stage stage--${mode}${dimArt ? " stage--travel" : ""}`}
        >
          {topBar}

          <div className="stage-viewport">
            {showSrc && (
              <img
                className={`stage-art${loading ? " stage-art--loading" : ""}`}
                src={showSrc}
                alt=""
                draggable={false}
                decoding="async"
                fetchPriority="high"
              />
            )}
            <div className="stage-scanlines" aria-hidden />
            <div className="stage-phosphor" aria-hidden />
            <div className="stage-vignette" aria-hidden />
            {dimArt && <div className="stage-dim" aria-hidden />}
          </div>

          <div className="stage-console">{children}</div>
        </div>
      </div>
      <div className="monitor-badge" aria-hidden>
        MAMA · EDUCATIONAL SOFTWARE · 1941
      </div>
    </div>
  );
}
