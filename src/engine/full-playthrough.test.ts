/**
 * Ship-gate tests: every complete path is played step-by-step through the
 * real engine (including travel enter + completeTravel), verifying art,
 * epitaph, and tombstone for each ending.
 */
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "../content/nodes";
import {
  applyChoice,
  advance,
  completeTravel,
  createInitialState,
  getNode,
  goToTombstone,
} from "./machine";
import type { GameState } from "./types";

const publicArt = join(process.cwd(), "public", "art");

function artPath(style: "a" | "b", file: string) {
  return join(publicArt, `style-${style}`, file);
}

function assertNodeArt(nodeId: string) {
  const n = getNode(nodeId);
  if (!n.image) return;
  const p = artPath(n.image.style, n.image.file);
  expect(existsSync(p), `missing art for ${nodeId}: ${p}`).toBe(true);
  expect(statSync(p).size, `empty art ${p}`).toBeGreaterThan(1000);
}

/** One micro-step of play, mirroring UI: resolve travel, then choice/continue. */
function microStep(
  state: GameState,
  action: { type: "choice"; id: string } | { type: "continue" } | { type: "clear-travel" },
): GameState {
  if (state.travel) {
    if (action.type !== "clear-travel") {
      throw new Error(
        `Must clear travel before ${action.type} (pending → ${state.travel.nextNodeId})`,
      );
    }
    return completeTravel(state);
  }
  const node = getNode(state.nodeId);
  if (action.type === "choice") {
    expect(node.kind).toBe("choice");
    return applyChoice(state, action.id);
  }
  if (action.type === "continue") {
    if (node.kind === "boot" || node.kind === "continue") {
      return advance(state);
    }
    throw new Error(`Cannot continue on ${state.nodeId} kind=${node.kind}`);
  }
  throw new Error("unreachable");
}

interface PlayLog {
  pathName: string;
  choiceIds: string[];
  visited: string[];
  travelHops: string[];
  terminalId: string;
  status: string;
  miles: number;
  route: string;
  epitaphOk: boolean;
  tombstoneOk: boolean;
}

/** DFS: every path from BOOT to every terminal, step-accurate. */
function playAllPaths(): PlayLog[] {
  const logs: PlayLog[] = [];

  type Frame = {
    state: GameState;
    choiceIds: string[];
    visited: string[];
    travelHops: string[];
  };

  const stack: Frame[] = [
    {
      state: createInitialState(),
      choiceIds: [],
      visited: ["BOOT"],
      travelHops: [],
    },
  ];

  while (stack.length) {
    const frame = stack.pop()!;
    let s = frame.state;
    const visited = [...frame.visited];
    const travelHops = [...frame.travelHops];
    const choiceIds = [...frame.choiceIds];

    // Drain travel first (player must complete travel screens)
    let guard = 0;
    while (s.travel && guard++ < 10) {
      travelHops.push(
        `${s.nodeId}→${s.travel.nextNodeId} (${s.travel.landmarkName})`,
      );
      s = microStep(s, { type: "clear-travel" });
      visited.push(s.nodeId);
    }

    const node = getNode(s.nodeId);

    if (node.kind === "boot" && s.nodeId === "BOOT") {
      s = microStep(s, { type: "continue" });
      // may open travel
      while (s.travel) {
        travelHops.push(
          `${visited[visited.length - 1] ?? "BOOT"}→${s.travel.nextNodeId}`,
        );
        s = microStep(s, { type: "clear-travel" });
      }
      visited.push(s.nodeId);
      stack.push({ state: s, choiceIds, visited, travelHops });
      continue;
    }

    if (node.kind === "continue") {
      s = microStep(s, { type: "continue" });
      while (s.travel) {
        travelHops.push(`${node.id}→${s.travel.nextNodeId}`);
        s = microStep(s, { type: "clear-travel" });
      }
      visited.push(s.nodeId);
      stack.push({ state: s, choiceIds, visited, travelHops });
      continue;
    }

    if (node.kind === "terminal") {
      assertNodeArt(node.id);
      const epitaphOk =
        Boolean(s.epitaph?.cause) && s.epitaph!.cause === node.prose;
      const tomb = goToTombstone(s);
      logs.push({
        pathName: choiceIds.join(" → ") || "stay-open",
        choiceIds,
        visited,
        travelHops,
        terminalId: node.id,
        status: node.status ?? "?",
        miles: s.miles,
        route: s.route,
        epitaphOk,
        tombstoneOk: tomb.nodeId === "GAMEOVER" && Boolean(s.epitaph),
      });
      continue;
    }

    if (node.kind === "choice" && node.choices) {
      assertNodeArt(node.id);
      for (let i = node.choices.length - 1; i >= 0; i--) {
        const c = node.choices[i];
        let next = applyChoice(s, c.id);
        const v2 = [...visited, node.id];
        const t2 = [...travelHops];
        // After choice, may land on terminal, continue, or travel
        while (next.travel) {
          t2.push(`${node.id}:${c.id}→${next.travel.nextNodeId}`);
          next = completeTravel(next);
        }
        v2.push(next.nodeId);
        stack.push({
          state: next,
          choiceIds: [...choiceIds, c.id],
          visited: v2,
          travelHops: t2,
        });
      }
      continue;
    }

    throw new Error(`Unhandled node ${s.nodeId} kind=${node.kind}`);
  }

  return logs;
}

const ALL = playAllPaths();

describe("SHIP GATE — every path end-to-end", () => {
  it("discovers exactly one path per terminal (full binary tree)", () => {
    const terminals = Object.values(NODES)
      .filter((n) => n.kind === "terminal")
      .map((n) => n.id)
      .sort();
    const reached = ALL.map((p) => p.terminalId).sort();
    expect(reached).toEqual(terminals);
    expect(ALL.length).toBe(terminals.length);
  });

  it.each(ALL.map((p) => [p.terminalId, p] as const))(
    "path → %s completes cleanly",
    (_id, path) => {
      expect(path.epitaphOk, `${path.pathName} missing/wrong epitaph`).toBe(
        true,
      );
      expect(path.tombstoneOk, `${path.pathName} tombstone fail`).toBe(true);
      expect(path.visited[0]).toBe("BOOT");
      expect(path.visited).toContain(path.terminalId);
      // Every visited story node has art
      for (const id of path.visited) {
        if (NODES[id]) assertNodeArt(id);
      }
      expect(path.miles).toBeGreaterThanOrEqual(0);
    },
  );

  it("no path leaves residual travel pending at terminal", () => {
    // Reconstruct each longest path and assert
    for (const path of ALL) {
      let s = createInitialState();
      s = advance(s);
      while (s.travel) s = completeTravel(s);

      for (const choiceId of path.choiceIds) {
        while (s.travel) s = completeTravel(s);
        const n = getNode(s.nodeId);
        if (n.kind === "continue") {
          s = advance(s);
          while (s.travel) s = completeTravel(s);
        }
        // keep advancing continues until choice
        let g = 0;
        while (getNode(s.nodeId).kind === "continue" && g++ < 20) {
          s = advance(s);
          while (s.travel) s = completeTravel(s);
        }
        expect(getNode(s.nodeId).kind).toBe("choice");
        s = applyChoice(s, choiceId);
        while (s.travel) s = completeTravel(s);
      }

      while (s.travel) s = completeTravel(s);
      while (getNode(s.nodeId).kind === "continue") {
        s = advance(s);
        while (s.travel) s = completeTravel(s);
      }

      expect(s.travel).toBeNull();
      expect(getNode(s.nodeId).kind).toBe("terminal");
      expect(s.nodeId).toBe(path.terminalId);
      expect(s.epitaph).not.toBeNull();
      const tomb = goToTombstone(s);
      expect(tomb.nodeId).toBe("GAMEOVER");
      expect(tomb.epitaph?.cause).toBe(getNode(path.terminalId).prose);
    }
  });

  it("prints ship path matrix (always passes; documentation)", () => {
    const lines = ALL.map(
      (p) =>
        `${p.terminalId.padEnd(6)} ${p.status.padEnd(8)} choices=${String(p.choiceIds.length).padStart(2)} miles=${String(p.miles).padStart(4)} route=${p.route.padEnd(4)} [${p.choiceIds.join(",")}]`,
    );
    // Visible in vitest verbose / failure artifacts
    expect(lines.length).toBe(16);
    // Store on expect message for humans running npm test -- --reporter=verbose
    console.log("\n=== ALL 16 PATHS ===\n" + lines.join("\n") + "\n");
  });
});

describe("SHIP GATE — graph & art", () => {
  it("every choice next and continue next resolves", () => {
    for (const n of Object.values(NODES)) {
      if (n.choices) {
        for (const c of n.choices) {
          expect(NODES[c.next], `broken ${n.id}->${c.next}`).toBeTruthy();
        }
      }
      if (n.next) {
        expect(NODES[n.next], `broken ${n.id}->${n.next}`).toBeTruthy();
      }
    }
  });

  it("dist/ art matches public/ for all nodes after build (if dist exists)", () => {
    const distArt = join(process.cwd(), "dist", "art");
    if (!existsSync(distArt)) return; // skip if not built
    for (const n of Object.values(NODES)) {
      if (!n.image) continue;
      const p = join(distArt, `style-${n.image.style}`, n.image.file);
      expect(existsSync(p), `dist missing ${p}`).toBe(true);
    }
  });
});
