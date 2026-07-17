import type { Epitaph } from "../engine/types";

const ROUTE_LABEL = {
  none: "NEAR PINSK",
  west: "WEST — OCCUPIED POLAND",
  east: "EAST — BELARUSIAN FORESTS",
} as const;

interface TombstoneProps {
  epitaph: Epitaph;
  onRetry: () => void;
}

export function Tombstone({ epitaph, onRetry }: TombstoneProps) {
  const status = epitaph.status.replace(/_/g, " ");

  return (
    <div className="tombstone">
      <div className="tombstone-panel">
        <p className="tombstone-kicker">HERE LIES A TRAVELER FROM PINSK</p>
        <p className="tombstone-banner">══ {status} ══</p>

        <div className="tombstone-stats" role="list">
          <div className="tombstone-stat" role="listitem">
            <span className="tombstone-stat-k">DATE</span>
            <span className="tombstone-stat-v">{epitaph.dateLabel}</span>
          </div>
          <div className="tombstone-stat" role="listitem">
            <span className="tombstone-stat-k">MILES</span>
            <span className="tombstone-stat-v">{epitaph.miles}</span>
          </div>
          <div className="tombstone-stat" role="listitem">
            <span className="tombstone-stat-k">ROUTE</span>
            <span className="tombstone-stat-v">{ROUTE_LABEL[epitaph.route]}</span>
          </div>
          <div className="tombstone-stat" role="listitem">
            <span className="tombstone-stat-k">DECISIONS</span>
            <span className="tombstone-stat-v">{epitaph.decisions}</span>
          </div>
          <div className="tombstone-stat tombstone-stat--full" role="listitem">
            <span className="tombstone-stat-k">LANDMARKS</span>
            <span className="tombstone-stat-v">
              {epitaph.landmarks.join(" → ")}
            </span>
          </div>
        </div>

        <div className="tombstone-cause">
          <p className="tombstone-cause-label">RESULT</p>
          <p className="tombstone-cause-text">{epitaph.cause}</p>
        </div>

        <div className="tombstone-actions">
          <button type="button" className="btn btn--play" onClick={onRetry}>
            <span className="blink">►</span> TRY AGAIN
          </button>
          <p className="boot-hint">PRESS SPACE BAR TO CONTINUE</p>
        </div>
      </div>
    </div>
  );
}
