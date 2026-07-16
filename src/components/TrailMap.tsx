import { useEffect, useRef, useState } from "react";
import { wagonCreak } from "../audio/fx";
import {
  landmarkIndexFor,
  landmarksFor,
  type RouteId,
} from "../content/trail";
import type { TravelState } from "../engine/types";

const TRAVEL_MS = 900;
/** Auto-advance after ARRIVED so players never get stuck */
const AUTO_CONTINUE_MS = 700;

interface TrailMapProps {
  route: RouteId;
  currentNodeId: string;
  travel: TravelState;
  totalMiles: number;
  onContinue: () => void;
}

export function TrailMap({
  route,
  currentNodeId,
  travel,
  totalMiles,
  onContinue,
}: TrailMapProps) {
  const r = route === "none" ? "west" : route;
  const marks = landmarksFor(r);
  const nextIdx = landmarkIndexFor(r, travel.nextNodeId);
  const fromIdx = landmarkIndexFor(r, currentNodeId);

  const fromPct = marks[fromIdx]?.pct ?? 0;
  // Always move at least a little so the wagon animates
  const rawTo = marks[nextIdx]?.pct ?? fromPct + 10;
  const toPct = rawTo === fromPct ? Math.min(100, fromPct + 8) : rawTo;

  const [wagonPct, setWagonPct] = useState(fromPct);
  const [moving, setMoving] = useState(true);
  const [arrived, setArrived] = useState(false);
  const finishedRef = useRef(false);
  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onContinueRef.current();
  };

  // Animate wagon + creaks, then auto-continue
  useEffect(() => {
    finishedRef.current = false;
    setWagonPct(fromPct);
    setMoving(true);
    setArrived(false);

    let raf = 0;
    let autoTimer = 0;
    const start = performance.now();
    let lastCreak = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TRAVEL_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const pct = fromPct + (toPct - fromPct) * eased;
      setWagonPct(pct);

      if (now - lastCreak > 400 && t < 0.9) {
        wagonCreak();
        lastCreak = now;
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setMoving(false);
        setArrived(true);
        setWagonPct(toPct);
        // Don't strand players on ARRIVED — auto continue
        autoTimer = window.setTimeout(() => finish(), AUTO_CONTINUE_MS);
      }
    };

    wagonCreak();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(autoTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run per travel hop
  }, [fromPct, toPct, travel.nextNodeId]);

  const routeLabel =
    route === "east"
      ? "EAST ROUTE · BELARUS"
      : route === "west"
        ? "WEST ROUTE · POLAND"
        : "PINSK REGION";

  const span = Math.max(0.01, toPct - fromPct);
  const progressPct = moving
    ? Math.min(100, Math.max(0, ((wagonPct - fromPct) / span) * 100))
    : 100;

  const skipOrContinue = () => {
    // One tap always leaves the travel screen
    finish();
  };

  return (
    <div className="travel-screen">
      <div className="console-frame travel-frame">
        <div className="console-frame-inner travel-inner">
          <div className="travel-body">
            <p className="travel-kicker">
              {travel.isSeasonChange
                ? `══ SEASON CHANGE · ${travel.seasonLabel} ══`
                : "══ ON THE TRAIL ══"}
            </p>

            <h2 className="travel-title">
              {moving ? "TRAVELING…" : "ARRIVED"}
            </h2>

            <p className="travel-line">
              {moving ? (
                <>
                  You head toward <strong>{travel.landmarkName}</strong>.
                </>
              ) : (
                <>
                  You reach <strong>{travel.landmarkName}</strong>.
                </>
              )}
            </p>
            <p className="travel-line travel-miles">
              +{travel.milesGained} MILES &nbsp;·&nbsp; TOTAL{" "}
              {totalMiles + travel.milesGained} MI
            </p>
            {travel.isSeasonChange && (
              <p className="travel-line travel-season">
                {travel.fromDate} → {travel.toDate}
              </p>
            )}

            <div className="map" aria-label="Trail map">
              <div className="map-header">{routeLabel}</div>
              <div className="map-body">
                <div className="map-terrain map-terrain--sky" />
                <div className="map-terrain map-terrain--land" />
                <div className="map-trail-line" />
                {moving && (
                  <div className="map-dust" style={{ left: `${wagonPct}%` }} />
                )}

                {marks.map((m, i) => (
                  <div
                    key={m.id}
                    className={
                      "map-mark" +
                      (i < nextIdx ? " map-mark--done" : "") +
                      (i === nextIdx ? " map-mark--next" : "") +
                      (i === fromIdx ? " map-mark--from" : "")
                    }
                    style={{ left: `${m.pct}%` }}
                  >
                    <span className="map-mark-dot">
                      {i === nextIdx ? "▲" : i < nextIdx ? "■" : "□"}
                    </span>
                    <span className="map-mark-name">{m.name}</span>
                  </div>
                ))}

                <div
                  className={
                    "map-wagon" + (moving ? " map-wagon--rolling" : "")
                  }
                  style={{ left: `${wagonPct}%` }}
                  title="You"
                >
                  ☺
                </div>
              </div>
              <div className="map-footer">
                <span>START: PINSK</span>
                <span>
                  {route === "east"
                    ? "INTO THE MARSHES"
                    : "TOWARD OCCUPIED POLAND"}
                </span>
              </div>
            </div>

            <div className="travel-progress" aria-hidden>
              <div
                className="travel-progress-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="travel-footer">
            <button
              type="button"
              className="btn btn--cta btn--travel-continue"
              onClick={skipOrContinue}
            >
              <span className="blink">►</span>{" "}
              {moving ? "Skip travel" : "Continue on the trail"}
            </button>
            <p className="console-hint">
              {arrived
                ? "CONTINUING…"
                : "TAP / SPACE TO SKIP · AUTO-CONTINUES"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
