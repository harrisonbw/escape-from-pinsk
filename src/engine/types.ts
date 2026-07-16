import type { RouteId } from "../content/trail";

export type NodeKind = "boot" | "choice" | "continue" | "terminal";

export type RouteStatus =
  | "ROUTE_CONTINUES"
  | "SURVIVED_SEASON"
  | "ILLNESS"
  | "CAPTURED"
  | "KILLED"
  | "TRANSFERRED";

export type Shelter =
  | "none"
  | "home"
  | "temporary"
  | "farm_outbuilding"
  | "marsh"
  | "inn"
  | "barracks"
  | "railcar"
  | "forest";

/** Full-screen travel interstitial (trail map between beats) */
export interface TravelState {
  nextNodeId: string;
  fromDate: string;
  toDate: string;
  milesGained: number;
  landmarkName: string;
  seasonLabel: string;
  isSeasonChange: boolean;
}

/** Final Oregon Trail-style epitaph / tombstone */
export interface Epitaph {
  status: RouteStatus;
  title: string;
  cause: string;
  dateLabel: string;
  miles: number;
  route: RouteId;
  landmarks: string[];
  decisions: number;
}

export interface GameState {
  nodeId: string;
  dateLabel: string;
  health: number;
  food: number;
  shelter: Shelter;
  possessions: string[];
  history: string[];
  miles: number;
  route: RouteId;
  /** When set, show trail map before entering nextNodeId */
  travel: TravelState | null;
  epitaph: Epitaph | null;
}

export interface ChoiceEffect {
  dateLabel?: string;
  health?: number;
  food?: number;
  shelter?: Shelter;
  addPossessions?: string[];
  removePossessions?: string[];
  clearPossessions?: boolean;
  miles?: number;
  route?: RouteId;
}

export interface Choice {
  id: string;
  label: string;
  next: string;
  effects?: ChoiceEffect;
}

export interface StoryNode {
  id: string;
  kind: NodeKind;
  dateLabel?: string;
  title?: string;
  prose: string;
  image?: {
    style: "a" | "b";
    file: string;
  };
  choices?: Choice[];
  /** Single CTA for continue / framing screens */
  cta?: string;
  next?: string;
  status?: RouteStatus;
}

export type ScreenMode = "crt" | "ega" | "boot";
