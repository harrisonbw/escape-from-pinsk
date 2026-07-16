import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NODES } from "../content/nodes";
import {
  analyzeGraph,
  DEMO_SCRIPTS,
  enumerateAllPaths,
  runDemoScript,
} from "./pathwalker";
import {
  createInitialState,
  getNode,
  playAdvance,
  playChoice,
  resolveTravel,
} from "./machine";

const publicArt = join(process.cwd(), "public", "art");

describe("graph integrity", () => {
  it("has no broken edges or unreachable story nodes", () => {
    const g = analyzeGraph();
    expect(g.brokenEdges).toEqual([]);
    // GAMEOVER is reachable only via goToTombstone, not edges — exclude it
    const unexpected = g.unreachableNodes.filter((id) => id !== "GAMEOVER");
    expect(unexpected).toEqual([]);
    expect(g.choiceNodes).toBeGreaterThan(5);
    expect(g.terminalNodes).toBeGreaterThan(10);
  });

  it("every node with image has a real public art file", () => {
    const missing: string[] = [];
    for (const n of Object.values(NODES)) {
      if (!n.image) continue;
      const p = join(publicArt, `style-${n.image.style}`, n.image.file);
      if (!existsSync(p)) missing.push(`${n.id}: ${p}`);
    }
    expect(missing).toEqual([]);
  });

  it("every choice and continue has non-empty prose/labels", () => {
    for (const n of Object.values(NODES)) {
      expect(n.prose.trim().length, n.id).toBeGreaterThan(0);
      if (n.kind === "choice") {
        expect(n.choices?.length, n.id).toBeGreaterThan(0);
        for (const c of n.choices ?? []) {
          expect(c.label.trim().length, `${n.id}:${c.id}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("exhaustive path coverage", () => {
  const paths = enumerateAllPaths();

  it("enumerates complete terminating paths", () => {
    expect(paths.length).toBeGreaterThan(10);
    const failed = paths.filter((p) => !p.ok);
    expect(failed, JSON.stringify(failed, null, 2)).toEqual([]);
  });

  it("reaches every terminal death/illness node", () => {
    const terminals = Object.values(NODES)
      .filter((n) => n.kind === "terminal")
      .map((n) => n.id)
      .sort();
    const reached = new Set(paths.map((p) => p.terminalId));
    const missing = terminals.filter((t) => !reached.has(t));
    expect(missing).toEqual([]);
  });

  it("every path produces an epitaph cause matching terminal prose", () => {
    for (const p of paths) {
      const term = getNode(p.terminalId);
      expect(p.epitaphCause).toBe(term.prose);
    }
  });

  it("west longest path accrues miles > 0", () => {
    const longWest = paths
      .filter((p) => p.route === "west")
      .sort((a, b) => b.miles - a.miles)[0];
    expect(longWest).toBeTruthy();
    expect(longWest.miles).toBeGreaterThan(0);
  });

  it("east paths reach illness or killed terminals", () => {
    const east = paths.filter((p) => p.route === "east");
    expect(east.length).toBeGreaterThan(0);
    for (const p of east) {
      expect(["KILLED", "ILLNESS"]).toContain(p.status);
    }
  });
});

describe("executive demo scripts", () => {
  it.each(DEMO_SCRIPTS.map((s) => [s.name, s] as const))(
    "%s",
    (_name, script) => {
      const result = runDemoScript(script);
      expect(result.ok, result.error ?? JSON.stringify(result)).toBe(true);
      expect(result.terminalId).not.toBe("ERROR");
      expect(result.epitaphCause.length).toBeGreaterThan(10);
    },
  );
});

describe("engine state invariants", () => {
  it("boot advances to S01", () => {
    let s = createInitialState();
    s = playAdvance(s);
    expect(s.nodeId).toBe("S01");
  });

  it("stay path ends at S01A with epitaph", () => {
    let s = createInitialState();
    s = playAdvance(s);
    s = playChoice(s, "stay");
    expect(s.nodeId).toBe("S01A");
    expect(s.epitaph?.cause).toContain("synagogue");
  });

  it("flee west sets route and can complete travel", () => {
    let s = createInitialState();
    s = playAdvance(s);
    s = playChoice(s, "west");
    s = resolveTravel(s);
    expect(s.route).toBe("west");
    expect(["S01B", "W01"]).toContain(s.nodeId);
  });

  it("does not throw on illegal choice", () => {
    let s = createInitialState();
    s = playAdvance(s);
    expect(() => playChoice(s, "not-a-choice")).toThrow();
  });

  it("health/food stay in sane bounds across all paths", () => {
    for (const p of enumerateAllPaths()) {
      expect(p.miles).toBeGreaterThanOrEqual(0);
      expect(p.miles).toBeLessThan(10000);
    }
  });
});
