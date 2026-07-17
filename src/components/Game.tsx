import { useCallback, useEffect, useMemo, useState } from "react";
import { blip, deathToll, tombstoneOpen } from "../audio/fx";
import { startMusic } from "../audio/music";
import {
  advance,
  applyChoice,
  completeTravel,
  createInitialState,
  getNode,
  goToTombstone,
  restart,
} from "../engine/machine";
import type { GameState } from "../engine/types";
import { Hud } from "./Hud";
import { MusicToggle } from "./MusicToggle";
import { Stage } from "./Stage";
import { Tombstone } from "./Tombstone";
import { TrailMap } from "./TrailMap";
import { Typewriter } from "./Typewriter";

function modeFor(kind: string): "crt" | "ega" {
  return kind === "boot" || kind === "terminal" ? "crt" : "ega";
}

export function Game() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [flash, setFlash] = useState(false);
  const [typeDone, setTypeDone] = useState(false);
  const [skipType, setSkipType] = useState(false);

  const node = useMemo(() => getNode(state.nodeId), [state.nodeId]);
  const mode = state.travel ? "ega" : modeFor(node.kind);
  const showHud =
    Boolean(state.travel) ||
    node.kind === "choice" ||
    node.kind === "continue";
  const showTombstone = node.id === "GAMEOVER" && state.epitaph != null;
  const prefetchIds = useMemo(() => {
    const ids: string[] = [];
    if (node.choices) for (const c of node.choices) ids.push(c.next);
    if (node.next) ids.push(node.next);
    if (state.travel) ids.push(state.travel.nextNodeId);
    return ids;
  }, [node, state.travel]);

  useEffect(() => {
    setTypeDone(false);
    setSkipType(false);
  }, [state.nodeId, state.travel?.nextNodeId]);

  useEffect(() => {
    if (showTombstone) tombstoneOpen();
  }, [showTombstone]);

  const skipOrAdvanceType = useCallback(() => {
    if (!typeDone) {
      setSkipType(true);
      setTypeDone(true);
      return true;
    }
    return false;
  }, [typeDone]);

  const onChoice = useCallback(
    (choiceId: string) => {
      if (state.travel) return;
      if (!typeDone) {
        setSkipType(true);
        setTypeDone(true);
        return;
      }
      blip(520, 35);
      setState((s) => applyChoice(s, choiceId));
    },
    [state.travel, typeDone],
  );

  const finishTravel = useCallback(() => {
    blip(480, 45);
    setState((s) => completeTravel(s));
  }, []);

  const onAdvance = useCallback(() => {
    if (state.travel) {
      finishTravel();
      return;
    }

    if (
      (node.kind === "continue" ||
        node.kind === "terminal" ||
        node.kind === "choice") &&
      skipOrAdvanceType()
    ) {
      return;
    }

    const current = getNode(state.nodeId);

    if (current.kind === "terminal") {
      deathToll();
      setFlash(true);
      window.setTimeout(() => setFlash(false), 220);
      setState((s) => goToTombstone(s));
      return;
    }

    if (
      current.id === "GAMEOVER" ||
      (current.kind === "boot" && current.next === "BOOT")
    ) {
      blip(330, 40);
      setState(restart());
      return;
    }

    if (current.kind === "boot" && current.next === "S01") {
      void startMusic();
      blip(660, 50);
      setState({
        ...createInitialState(),
        nodeId: "S01",
        history: ["BOOT"],
      });
      return;
    }

    blip(400, 30);
    setState((s) => advance(s));
  }, [state.nodeId, state.travel, node.kind, finishTravel, skipOrAdvanceType]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        if (
          state.travel ||
          node.kind === "boot" ||
          node.kind === "continue" ||
          node.kind === "terminal" ||
          showTombstone
        ) {
          e.preventDefault();
          onAdvance();
          return;
        }
        if (node.kind === "choice" && !typeDone) {
          e.preventDefault();
          setSkipType(true);
          setTypeDone(true);
        }
      }
      if (!state.travel && node.kind === "choice" && node.choices && typeDone) {
        const idx = parseInt(e.key, 10);
        if (idx >= 1 && idx <= node.choices.length) {
          e.preventDefault();
          onChoice(node.choices[idx - 1].id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [node, onAdvance, onChoice, state.travel, typeDone, showTombstone]);

  const onConsoleClick = () => {
    if (!typeDone && !state.travel && node.kind !== "boot" && !showTombstone) {
      setSkipType(true);
      setTypeDone(true);
    }
  };

  return (
    <div className={`app app--${mode}${flash ? " app--flash" : ""}`}>
      <MusicToggle />
      <Stage
        node={node}
        mode={mode}
        topBar={<Hud state={state} visible={showHud} mode={mode} />}
        dimArt={Boolean(state.travel)}
        endScreen={showTombstone}
        prefetchIds={prefetchIds}
      >
        {state.travel ? (
          <TrailMap
            route={state.route}
            currentNodeId={state.nodeId}
            travel={state.travel}
            totalMiles={state.miles}
            onContinue={finishTravel}
          />
        ) : showTombstone && state.epitaph ? (
          <Tombstone epitaph={state.epitaph} onRetry={onAdvance} />
        ) : (
          <>
            {node.kind === "boot" && (
              <div className="console console--boot">
                <div className="console-frame">
                  <div className="console-frame-inner">
                    <h1 className="boot-title">ESCAPE FROM PINSK</h1>
                    <div className="boot-prose">
                      {node.prose.split("\n").map((line, i) =>
                        line ? (
                          <p
                            key={i}
                            className={i === 0 ? "boot-hook" : "boot-sub"}
                          >
                            {line}
                          </p>
                        ) : (
                          <br key={i} />
                        ),
                      )}
                    </div>
                    <button
                      type="button"
                      className="btn btn--play"
                      onClick={onAdvance}
                    >
                      <span className="blink">►</span> {node.cta ?? "PLAY"}
                    </button>
                    <p className="boot-hint">PRESS SPACE BAR TO CONTINUE</p>
                  </div>
                </div>
              </div>
            )}

            {node.kind === "choice" && (
              <div className="console console--play" onClick={onConsoleClick}>
                <div className="console-frame">
                  <div className="console-frame-inner">
                    <div className="console-header">
                      <span className="console-date">
                        {state.dateLabel} · {state.miles} MI
                      </span>
                    </div>
                    <Typewriter
                      text={node.prose}
                      className="scene-prose"
                      speed={8}
                      skip={skipType}
                      onDone={() => setTypeDone(true)}
                    />
                    {typeDone && (
                      <>
                        <div className="choices" role="menu">
                          {node.choices?.map((c, i) => (
                            <button
                              key={c.id}
                              type="button"
                              className="btn btn--choice"
                              role="menuitem"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChoice(c.id);
                              }}
                            >
                              <span className="choice-key">{i + 1}.</span>
                              <span className="choice-label">{c.label}</span>
                            </button>
                          ))}
                        </div>
                        <p className="console-hint">
                          TYPE 1-{node.choices?.length ?? 1} OR CLICK AN OPTION
                        </p>
                      </>
                    )}
                    {!typeDone && (
                      <p className="console-hint">PRESS SPACE TO SKIP TEXT</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {node.kind === "continue" && (
              <div className="console console--play" onClick={onConsoleClick}>
                <div className="console-frame">
                  <div className="console-frame-inner">
                    <div className="console-header">
                      <span className="console-date">
                        {state.dateLabel} · {state.miles} MI
                      </span>
                    </div>
                    <Typewriter
                      text={node.prose}
                      className="scene-prose"
                      speed={8}
                      skip={skipType}
                      onDone={() => setTypeDone(true)}
                    />
                    {typeDone && (
                      <>
                        <button
                          type="button"
                          className="btn btn--cta"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvance();
                          }}
                        >
                          <span className="blink">►</span>{" "}
                          {node.cta ?? "Continue"}
                        </button>
                        <p className="console-hint">
                          PRESS SPACE BAR TO CONTINUE
                        </p>
                      </>
                    )}
                    {!typeDone && (
                      <p className="console-hint">PRESS SPACE TO SKIP TEXT</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {node.kind === "terminal" && (
              <div className="console console--death" onClick={onConsoleClick}>
                <div className="console-frame">
                  <div className="console-frame-inner">
                    <Typewriter
                      text={node.prose}
                      className="scene-prose"
                      speed={10}
                      skip={skipType}
                      onDone={() => setTypeDone(true)}
                    />
                    {typeDone && (
                      <>
                        <p className="death-miles">
                          YOU TRAVELED {state.miles} MILES
                        </p>
                        <button
                          type="button"
                          className="btn btn--cta"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdvance();
                          }}
                        >
                          <span className="blink">►</span> Continue
                        </button>
                        <p className="console-hint">
                          PRESS SPACE BAR TO CONTINUE
                        </p>
                      </>
                    )}
                    {!typeDone && (
                      <p className="console-hint">PRESS SPACE TO SKIP TEXT</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Stage>
    </div>
  );
}
