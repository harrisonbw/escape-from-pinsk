import type { GameState } from "../engine/types";

const SHELTER_LABEL: Record<GameState["shelter"], string> = {
  none: "NONE",
  home: "HOME",
  temporary: "CAMP",
  farm_outbuilding: "BARN",
  marsh: "MARSH",
  inn: "INN",
  barracks: "CAMP",
  railcar: "TRAIN",
  forest: "WOODS",
};

function bars(n: number, max = 3): string {
  const filled = Math.max(0, Math.min(max, n));
  return "█".repeat(filled) + "░".repeat(max - filled);
}

export function Hud({
  state,
  visible,
  mode,
}: {
  state: GameState;
  visible: boolean;
  mode: "crt" | "ega";
}) {
  if (!visible) return null;

  return (
    <header className={`trail-bar trail-bar--${mode}`} aria-label="Status">
      <div className="trail-bar-row">
        <span className="trail-field">
          <span className="trail-label">DATE</span>
          <span className="trail-value">{state.dateLabel}</span>
        </span>
        <span className="trail-sep" aria-hidden>
          │
        </span>
        <span className="trail-field">
          <span className="trail-label">MILES</span>
          <span className="trail-value trail-value--miles">
            {String(state.miles).padStart(4, "0")}
          </span>
        </span>
        <span className="trail-sep" aria-hidden>
          │
        </span>
        <span className="trail-field">
          <span className="trail-label">HEALTH</span>
          <span className="trail-value trail-value--bars">{bars(state.health)}</span>
        </span>
        <span className="trail-sep" aria-hidden>
          │
        </span>
        <span className="trail-field">
          <span className="trail-label">FOOD</span>
          <span className="trail-value trail-value--bars">{bars(state.food)}</span>
        </span>
        <span className="trail-sep" aria-hidden>
          │
        </span>
        <span className="trail-field">
          <span className="trail-label">SHELTER</span>
          <span className="trail-value">{SHELTER_LABEL[state.shelter]}</span>
        </span>
      </div>
    </header>
  );
}
