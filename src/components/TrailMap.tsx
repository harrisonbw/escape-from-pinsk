import { useEffect, useRef, useState } from "react";
import { wagonCreak } from "../audio/fx";
import {
  landmarkIndexFor,
  landmarksFor,
  playableLandmarks,
  type RouteId,
} from "../content/trail";
import type { TravelState } from "../engine/types";

const TRAVEL_MS = 900;
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
  const allMarks = landmarksFor(r);
  const playable = playableLandmarks(r);
  const nextIdx = landmarkIndexFor(r, travel.nextNodeId);
  const fromIdx = landmarkIndexFor(r, currentNodeId);

  const fromPct = playable[fromIdx]?.pct ?? 0;
  const rawTo = playable[nextIdx]?.pct ?? fromPct + 6;
  const toPct = rawTo === fromPct ? Math.min(100, fromPct + 4) : rawTo;

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
        autoTimer = window.setTimeout(() => finish(), AUTO_CONTINUE_MS);
      }
    };

    wagonCreak();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(autoTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromPct, toPct, travel.nextNodeId]);

  const routeLabel =
    route === "east"
      ? "EAST ROUTE · 1941–1945"
      : route === "west"
        ? "WEST ROUTE · 1941–1945"
        : "PINSK REGION · 1941–1945";

  const span = Math.max(0.01, toPct - fromPct);
  const progressPct = moving
    ? Math.min(100, Math.max(0, ((wagonPct - fromPct) / span) * 100))
    : 100;

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

            <div className="map" aria-label="Trail map 1941 to 1945">
              <div className="map-header">{routeLabel}</div>
              <div className="map-body">
                <div className="map-terrain map-terrain--sky" />
                <div className="map-terrain map-terrain--land" />
                <div className="map-trail-line" />
                {moving && (
                  <div className="map-dust" style={{ left: `${wagonPct}%` }} />
                )}

                {allMarks.map((m) => {
                  const playIdx = playable.findIndex((p) => p.id === m.id);
                  const isFuture = Boolean(m.future);
                  const isDone = !isFuture && playIdx >= 0 && playIdx < nextIdx;
                  const isNext = !isFuture && playIdx === nextIdx;
                  const isFrom = !isFuture && playIdx === fromIdx;
                  return (
                    <div
                      key={m.id}
                      className={
                        "map-mark" +
                        (isFuture ? " map-mark--future" : "") +
                        (isDone ? " map-mark--done" : "") +
                        (isNext ? " map-mark--next" : "") +
                        (isFrom ? " map-mark--from" : "")
                      }
                      style={{ left: `${m.pct}%` }}
                    >
                      <span className="map-mark-dot">
                        {isFuture
                          ? "·"
                          : isNext
                            ? "▲"
                            : isDone
                              ? "■"
                              : "□"}
                      </span>
                      <span className="map-mark-name">{m.name}</span>
                    </div>
                  );
                })}

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
                <span>1941 · PINSK</span>
                <span>1945 →</span>
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
              onClick={finish}
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
