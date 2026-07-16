import type { ReactNode } from "react";
import { artUrl } from "../engine/machine";
import type { StoryNode } from "../engine/types";

interface StageProps {
  node: StoryNode;
  mode: "crt" | "ega";
  children: ReactNode;
  topBar?: ReactNode;
  dimArt?: boolean;
}

export function Stage({ node, mode, children, topBar, dimArt }: StageProps) {
  const src = node.image
    ? artUrl(node.image.style, node.image.file)
    : undefined;

  return (
    <div className={`monitor monitor--${mode}`}>
      <div className="monitor-bezel">
        <div className="monitor-screw monitor-screw--tl" aria-hidden />
        <div className="monitor-screw monitor-screw--tr" aria-hidden />
        <div className="monitor-screw monitor-screw--bl" aria-hidden />
        <div className="monitor-screw monitor-screw--br" aria-hidden />

        <div className={`stage stage--${mode}${dimArt ? " stage--travel" : ""}`}>
          {topBar}

          <div className="stage-viewport">
            {src && (
              <img
                className="stage-art"
                src={src}
                alt=""
                draggable={false}
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
