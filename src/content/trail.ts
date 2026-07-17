/** Trail landmarks + mile markers for Oregon Trail-style travel screens */

export type RouteId = "none" | "west" | "east";

export interface Landmark {
  id: string;
  name: string;
  /** Position along trail 0–100 */
  pct: number;
  /** Node ids that place the player here */
  nodes: string[];
  miles: number;
}

export const WEST_LANDMARKS: Landmark[] = [
  { id: "pinsk", name: "PINSK", pct: 0, nodes: ["S01"], miles: 0 },
  {
    id: "flee_west",
    name: "WEST ROAD",
    pct: 8,
    nodes: ["S01B"],
    miles: 5,
  },
  {
    id: "road",
    name: "COUNTRYSIDE",
    pct: 18,
    nodes: ["W01", "W01A", "W01B"],
    miles: 48,
  },
  {
    id: "farm",
    name: "THE FARM",
    pct: 34,
    nodes: ["W02", "W02A", "W02B", "W03", "W03A", "W03B"],
    miles: 52,
  },
  {
    id: "town",
    name: "TOWN",
    pct: 52,
    nodes: ["W04", "W04A", "W04B", "W05", "W05A", "W05B"],
    miles: 71,
  },
  {
    id: "camp",
    name: "LABOR CAMP",
    pct: 68,
    nodes: ["W06", "W06A", "W06B"],
    miles: 38,
  },
  {
    id: "rail",
    name: "RAILCAR",
    pct: 84,
    nodes: ["W07", "W07A", "W07B"],
    miles: 95,
  },
  {
    id: "far2",
    name: "FARMYARD",
    pct: 100,
    nodes: ["W08", "W08A", "W08B"],
    miles: 120,
  },
];

export const EAST_LANDMARKS: Landmark[] = [
  { id: "pinsk", name: "PINSK", pct: 0, nodes: ["S01"], miles: 0 },
  {
    id: "flee_east",
    name: "EAST WOODS",
    pct: 10,
    nodes: ["S01C"],
    miles: 5,
  },
  {
    id: "forest",
    name: "FOREST",
    pct: 28,
    nodes: ["E01", "E01A", "E01B"],
    miles: 22,
  },
  {
    id: "marsh",
    name: "MARSH",
    pct: 50,
    nodes: ["E02", "E02A", "E02B", "E03", "E03A"],
    miles: 18,
  },
  {
    id: "band",
    name: "PARTISANS",
    pct: 74,
    nodes: ["E03B", "E04", "E04A", "E04B"],
    miles: 31,
  },
  {
    id: "hunger",
    name: "VILLAGE EDGE",
    pct: 100,
    nodes: ["E05", "E05A", "E05B"],
    miles: 27,
  },
];

export function landmarksFor(route: RouteId): Landmark[] {
  if (route === "west") return WEST_LANDMARKS;
  if (route === "east") return EAST_LANDMARKS;
  return [{ id: "pinsk", name: "PINSK", pct: 0, nodes: ["S01"], miles: 0 }];
}

/** Alias kept for engine imports */
export function playableLandmarks(route: RouteId): Landmark[] {
  return landmarksFor(route);
}

export function landmarkIndexFor(route: RouteId, nodeId: string): number {
  const marks = landmarksFor(route);
  const idx = marks.findIndex((m) => m.nodes.includes(nodeId));
  if (idx >= 0) return idx;
  const base = nodeId.replace(/[ABC]$/, "").replace(/_\w+$/, "");
  const soft = marks.findIndex((m) =>
    m.nodes.some((n) => n === base || nodeId.startsWith(n)),
  );
  return soft >= 0 ? soft : 0;
}

export function routeFromNode(nodeId: string): RouteId {
  if (nodeId.startsWith("W") || nodeId === "S01B") return "west";
  if (nodeId.startsWith("E") || nodeId === "S01C") return "east";
  return "none";
}

/** Miles gained when arriving at this node from the previous hop */
export function milesForArrival(nodeId: string, route: RouteId): number {
  const marks = landmarksFor(route);
  const idx = landmarkIndexFor(route, nodeId);
  if (idx <= 0) {
    if (nodeId === "S01A") return 0;
    return 4;
  }
  const prev = marks[Math.max(0, idx - 1)];
  const cur = marks[idx];
  const delta = Math.abs((cur?.miles ?? 0) - (prev?.miles ?? 0));
  return Math.max(4, Math.round(delta * 0.85) || 8);
}

export interface SeasonBeat {
  dateLabel: string;
  label: string;
}

export const SEASON_ORDER: SeasonBeat[] = [
  { dateLabel: "Jul-Aug 1941", label: "SUMMER 1941" },
  { dateLabel: "Sep-Oct 1941", label: "FALL 1941" },
  { dateLabel: "Nov-Dec 1941", label: "WINTER 1941" },
  { dateLabel: "Jan-Feb 1942", label: "MIDWINTER 1942" },
  { dateLabel: "Mar-Apr 1942", label: "SPRING 1942" },
  { dateLabel: "May-Jun 1942", label: "EARLY SUMMER 1942" },
  { dateLabel: "Jul-Aug 1942", label: "SUMMER 1942" },
  { dateLabel: "Sep-Oct 1942", label: "FALL 1942" },
  { dateLabel: "Nov-Dec 1942", label: "WINTER 1942" },
];

function normalizeDate(d: string): string {
  return d.replace(/[–—]/g, "-").trim();
}

export function seasonIndex(dateLabel: string): number {
  const n = normalizeDate(dateLabel);
  const i = SEASON_ORDER.findIndex((s) => normalizeDate(s.dateLabel) === n);
  return i >= 0 ? i : 0;
}

export function isSeasonChange(from: string, to: string): boolean {
  return (
    normalizeDate(from) !== normalizeDate(to) &&
    Boolean(from) &&
    Boolean(to)
  );
}
