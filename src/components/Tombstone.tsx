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
      <div className="console-frame tombstone-frame">
        <div className="console-frame-inner tombstone-inner">
          <pre className="tombstone-art" aria-hidden>{`
    .-+-[[ HERE LIES ]]-+-.
   /                       \\
  |     A TRAVELER FROM     |
  |         PINSK           |
   \\                       /
    '-----._______.------'
`}</pre>

          <p className="tombstone-banner">══ {status} ══</p>
          <h2 className="tombstone-title">{epitaph.title.toUpperCase()}</h2>

          <dl className="tombstone-stats">
            <div className="tombstone-row">
              <dt>DATE</dt>
              <dd>{epitaph.dateLabel}</dd>
            </div>
            <div className="tombstone-row">
              <dt>MILES</dt>
              <dd>{epitaph.miles}</dd>
            </div>
            <div className="tombstone-row">
              <dt>ROUTE</dt>
              <dd>{ROUTE_LABEL[epitaph.route]}</dd>
            </div>
            <div className="tombstone-row">
              <dt>DECISIONS</dt>
              <dd>{epitaph.decisions}</dd>
            </div>
            <div className="tombstone-row tombstone-row--wide">
              <dt>LANDMARKS</dt>
              <dd>{epitaph.landmarks.join(" → ")}</dd>
            </div>
          </dl>

          <div className="tombstone-cause">
            <p className="tombstone-cause-label">CAUSE</p>
            <p className="tombstone-cause-text">{epitaph.cause}</p>
          </div>

          <p className="tombstone-epilogue">
            The route ends here. Occupation violence left few safe paths.
          </p>

          <button type="button" className="btn btn--play" onClick={onRetry}>
            <span className="blink">►</span> TRY AGAIN
          </button>
          <p className="boot-hint">PRESS SPACE BAR TO CONTINUE</p>
        </div>
      </div>
    </div>
  );
}
