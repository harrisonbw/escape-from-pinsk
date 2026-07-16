import { NODES, START_NODE } from "../content/nodes";
import {
  isSeasonChange,
  landmarkIndexFor,
  landmarksFor,
  milesForArrival,
  routeFromNode,
  seasonIndex,
  SEASON_ORDER,
  type RouteId,
} from "../content/trail";
import type {
  Choice,
  Epitaph,
  GameState,
  StoryNode,
  TravelState,
} from "./types";

export function getNode(id: string): StoryNode {
  const node = NODES[id];
  if (!node) {
    throw new Error(`Unknown story node: ${id}`);
  }
  return node;
}

export function createInitialState(): GameState {
  return {
    nodeId: START_NODE,
    dateLabel: "Jul–Aug 1941",
    health: 3,
    food: 2,
    shelter: "home",
    possessions: ["travel bag", "family valuables"],
    history: [],
    miles: 0,
    route: "none",
    travel: null,
    epitaph: null,
  };
}

function applyEffects(state: GameState, effects?: Choice["effects"]): GameState {
  if (!effects) return state;

  let possessions = [...state.possessions];
  if (effects.clearPossessions) {
    possessions = [];
  }
  if (effects.removePossessions) {
    possessions = possessions.filter(
      (p) => !effects.removePossessions!.includes(p),
    );
  }
  if (effects.addPossessions) {
    for (const p of effects.addPossessions) {
      if (!possessions.includes(p)) possessions.push(p);
    }
  }

  return {
    ...state,
    dateLabel: effects.dateLabel ?? state.dateLabel,
    health: effects.health ?? state.health,
    food: effects.food ?? state.food,
    shelter: effects.shelter ?? state.shelter,
    possessions,
    miles: effects.miles != null ? state.miles + effects.miles : state.miles,
    route: effects.route ?? state.route,
  };
}

function buildTravel(
  state: GameState,
  nextId: string,
  forcedRoute?: GameState["route"],
): TravelState {
  const next = getNode(nextId);
  const route =
    forcedRoute && forcedRoute !== "none"
      ? forcedRoute
      : routeFromNode(nextId) !== "none"
        ? routeFromNode(nextId)
        : state.route;

  const toDate = next.dateLabel ?? state.dateLabel;
  const marks = landmarksFor(route);
  const idx = landmarkIndexFor(route, nextId);
  const landmarkName =
    marks[idx]?.name ?? next.title?.toUpperCase() ?? "THE TRAIL";
  const milesGained = milesForArrival(nextId, route);
  const season = SEASON_ORDER[seasonIndex(toDate)];

  return {
    nextNodeId: nextId,
    fromDate: state.dateLabel,
    toDate,
    milesGained,
    landmarkName,
    seasonLabel: season?.label ?? toDate,
    isSeasonChange: isSeasonChange(state.dateLabel, toDate),
  };
}

function shouldShowTravel(
  fromId: string,
  toId: string,
  state: GameState,
): boolean {
  if (toId === "BOOT" || toId === "GAMEOVER" || toId === "S01") return false;
  const to = getNode(toId);
  if (to.kind === "terminal") return false;

  const route =
    routeFromNode(toId) !== "none" ? routeFromNode(toId) : state.route;

  // Season change → always show travel
  if (to.dateLabel && to.dateLabel !== state.dateLabel) return true;

  // First flight out of the village
  if (fromId === "S01" && (toId === "S01B" || toId === "S01C")) return true;

  // Landmark change along a route
  if (route !== "none") {
    const a = landmarkIndexFor(route, fromId);
    const b = landmarkIndexFor(route, toId);
    if (a !== b) return true;
  }

  // Don't show a travel interstitial for same-landmark continues
  // (was stranding players on "ARRIVED · PINSK" with a clipped button)
  return false;
}

function goToNode(
  state: GameState,
  nextId: string,
  withTravel: boolean,
): GameState {
  const next = getNode(nextId);
  const route =
    routeFromNode(nextId) !== "none" ? routeFromNode(nextId) : state.route;

  if (withTravel && shouldShowTravel(state.nodeId, nextId, state)) {
    const travel = buildTravel(state, nextId, route);
    return {
      ...state,
      route,
      travel,
      history: [...state.history, state.nodeId],
    };
  }

  const gained = milesForArrival(nextId, route);
  return {
    ...state,
    nodeId: nextId,
    dateLabel: next.dateLabel ?? state.dateLabel,
    route,
    miles: state.miles + gained,
    travel: null,
    history: [...state.history, state.nodeId],
  };
}

export function applyChoice(state: GameState, choiceId: string): GameState {
  if (state.travel) return state;
  const node = getNode(state.nodeId);
  const choice = node.choices?.find((c) => c.id === choiceId);
  if (!choice) {
    throw new Error(`Unknown choice ${choiceId} on node ${state.nodeId}`);
  }

  let withEffects = applyEffects(state, choice.effects);

  if (choice.id === "west") {
    withEffects = { ...withEffects, route: "west" };
  } else if (choice.id === "east") {
    withEffects = { ...withEffects, route: "east" };
  }

  const next = getNode(choice.next);
  if (next.kind === "terminal") {
    const route =
      routeFromNode(choice.next) !== "none"
        ? routeFromNode(choice.next)
        : withEffects.route;
    const arrived: GameState = {
      ...withEffects,
      nodeId: choice.next,
      dateLabel: next.dateLabel ?? withEffects.dateLabel,
      route,
      miles: withEffects.miles + milesForArrival(choice.next, route),
      travel: null,
      history: [...withEffects.history, withEffects.nodeId],
    };
    return {
      ...arrived,
      epitaph: buildEpitaph(arrived, next),
    };
  }

  return goToNode(withEffects, choice.next, true);
}

export function advance(state: GameState): GameState {
  if (state.travel) return state;
  const node = getNode(state.nodeId);
  if (!node.next) {
    throw new Error(`Node ${state.nodeId} has no next`);
  }
  return goToNode(state, node.next, true);
}

export function completeTravel(state: GameState): GameState {
  if (!state.travel) return state;
  const { nextNodeId, milesGained, toDate } = state.travel;
  const next = getNode(nextNodeId);
  const route =
    routeFromNode(nextNodeId) !== "none"
      ? routeFromNode(nextNodeId)
      : state.route;

  return {
    ...state,
    nodeId: nextNodeId,
    dateLabel: next.dateLabel ?? toDate,
    miles: state.miles + milesGained,
    route,
    travel: null,
  };
}

/** Unique landmarks visited along the route from history */
export function landmarksVisited(route: RouteId, history: string[]): string[] {
  if (route === "none") return ["PINSK"];
  const marks = landmarksFor(route);
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const id of history) {
    const idx = landmarkIndexFor(route, id);
    const name = marks[idx]?.name;
    if (name && !seen.has(name)) {
      seen.add(name);
      ordered.push(name);
    }
  }
  return ordered.length ? ordered : ["PINSK"];
}

export function buildEpitaph(state: GameState, deathNode: StoryNode): Epitaph {
  const history = [...state.history, deathNode.id];
  const route = state.route !== "none" ? state.route : routeFromNode(deathNode.id);
  return {
    status: deathNode.status ?? "KILLED",
    title: deathNode.title ?? "The End",
    cause: deathNode.prose,
    dateLabel: deathNode.dateLabel ?? state.dateLabel,
    miles: state.miles,
    route,
    landmarks: landmarksVisited(route, history),
    decisions: history.filter((id) => {
      try {
        return getNode(id).kind === "choice";
      } catch {
        return false;
      }
    }).length,
  };
}

export function goToTombstone(state: GameState): GameState {
  return {
    ...state,
    nodeId: "GAMEOVER",
    history: [...state.history, state.nodeId],
  };
}

export function restart(): GameState {
  return createInitialState();
}

export function artUrl(style: "a" | "b", file: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}art/style-${style}/${file}`;
}
