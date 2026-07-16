import { NODES } from "../content/nodes";
import {
  createInitialState,
  getNode,
  goToTombstone,
  playAdvance,
  playChoice,
  resolveTravel,
} from "./machine";
import type { GameState } from "./types";

export interface PathResult {
  name: string;
  choices: string[];
  terminalId: string;
  status: string;
  miles: number;
  route: string;
  steps: string[];
  epitaphCause: string;
  ok: boolean;
  error?: string;
}

export interface GraphStats {
  nodeCount: number;
  choiceNodes: number;
  terminalNodes: number;
  continueNodes: number;
  totalEdges: number;
  completePaths: number;
  terminalsReached: string[];
  unreachableNodes: string[];
  brokenEdges: string[];
}

function stepThroughContinues(state: GameState): GameState {
  let s = resolveTravel(state);
  let guard = 0;
  while (guard++ < 40) {
    const node = getNode(s.nodeId);
    if (node.kind === "continue") {
      s = playAdvance(s);
      continue;
    }
    if (node.kind === "boot" && node.next && node.id !== "GAMEOVER") {
      s = playAdvance(s);
      continue;
    }
    break;
  }
  return s;
}

/** Depth-first enumeration of every complete play path from BOOT → terminal. */
export function enumerateAllPaths(maxPaths = 500): PathResult[] {
  const results: PathResult[] = [];

  type Frame = {
    state: GameState;
    choices: string[];
    steps: string[];
  };

  const stack: Frame[] = [
    {
      state: createInitialState(),
      choices: [],
      steps: ["BOOT"],
    },
  ];

  while (stack.length && results.length < maxPaths) {
    const frame = stack.pop()!;
    let s = resolveTravel(frame.state);

    // Start game from boot
    if (s.nodeId === "BOOT") {
      s = playAdvance(s);
    }

    s = stepThroughContinues(s);
    const node = getNode(s.nodeId);

    if (node.kind === "terminal") {
      // Epitaph is set by applyChoice when landing on a terminal
      const epitaph = s.epitaph;
      results.push({
        name: frame.choices.join(" → ") || node.id,
        choices: frame.choices,
        terminalId: node.id,
        status: node.status ?? "UNKNOWN",
        miles: s.miles,
        route: s.route,
        steps: [...frame.steps, node.id],
        epitaphCause: epitaph?.cause ?? node.prose,
        ok: Boolean(epitaph?.cause),
        error: epitaph ? undefined : "missing epitaph on terminal",
      });
      continue;
    }

    if (node.kind === "choice" && node.choices?.length) {
      // Push reverse so natural order explores first
      for (let i = node.choices.length - 1; i >= 0; i--) {
        const c = node.choices[i];
        try {
          const next = playChoice(s, c.id);
          stack.push({
            state: next,
            choices: [...frame.choices, `${node.id}:${c.id}`],
            steps: [...frame.steps, node.id, c.next],
          });
        } catch (e) {
          results.push({
            name: [...frame.choices, `${node.id}:${c.id}`].join(" → "),
            choices: [...frame.choices, `${node.id}:${c.id}`],
            terminalId: "ERROR",
            status: "ERROR",
            miles: s.miles,
            route: s.route,
            steps: frame.steps,
            epitaphCause: "",
            ok: false,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }
      continue;
    }

    if (node.id === "GAMEOVER") {
      results.push({
        name: frame.choices.join(" → ") || "GAMEOVER",
        choices: frame.choices,
        terminalId: "GAMEOVER",
        status: "GAMEOVER",
        miles: s.miles,
        route: s.route,
        steps: frame.steps,
        epitaphCause: s.epitaph?.cause ?? "",
        ok: true,
      });
      continue;
    }

    results.push({
      name: frame.choices.join(" → ") || s.nodeId,
      choices: frame.choices,
      terminalId: s.nodeId,
      status: "STUCK",
      miles: s.miles,
      route: s.route,
      steps: frame.steps,
      epitaphCause: "",
      ok: false,
      error: `Path stuck on node ${s.nodeId} kind=${node.kind}`,
    });
  }

  return results;
}

export function analyzeGraph(): GraphStats {
  const nodes = Object.values(NODES);
  const edges: Array<{ from: string; to: string }> = [];
  const brokenEdges: string[] = [];

  for (const n of nodes) {
    if (n.choices) {
      for (const c of n.choices) {
        edges.push({ from: n.id, to: c.next });
        if (!NODES[c.next]) brokenEdges.push(`${n.id} --${c.id}--> ${c.next}`);
      }
    }
    if (n.next) {
      edges.push({ from: n.id, to: n.next });
      if (!NODES[n.next]) brokenEdges.push(`${n.id} --> ${n.next}`);
    }
  }

  const paths = enumerateAllPaths();
  const terminalsReached = [
    ...new Set(paths.filter((p) => p.ok).map((p) => p.terminalId)),
  ].sort();

  // Reachability BFS from BOOT
  const reached = new Set<string>();
  const q = ["BOOT"];
  while (q.length) {
    const id = q.shift()!;
    if (reached.has(id)) continue;
    reached.add(id);
    const n = NODES[id];
    if (!n) continue;
    if (n.next) q.push(n.next);
    if (n.choices) for (const c of n.choices) q.push(c.next);
  }

  const unreachableNodes = Object.keys(NODES)
    .filter((id) => !reached.has(id))
    .sort();

  return {
    nodeCount: nodes.length,
    choiceNodes: nodes.filter((n) => n.kind === "choice").length,
    terminalNodes: nodes.filter((n) => n.kind === "terminal").length,
    continueNodes: nodes.filter((n) => n.kind === "continue").length,
    totalEdges: edges.length,
    completePaths: paths.filter((p) => p.ok).length,
    terminalsReached,
    unreachableNodes,
    brokenEdges,
  };
}

/** Named executive demo paths (key narrative beats). */
export const DEMO_SCRIPTS: Array<{ name: string; choices: string[] }> = [
  {
    name: "Immediate death — stay with family",
    choices: ["stay"],
  },
  {
    name: "West short death — wander road",
    choices: ["west", "wander"],
  },
  {
    name: "West farm death — leave farm winter",
    choices: ["west", "farm", "leave"],
  },
  {
    name: "West mid death — leave to Soviet lines",
    choices: ["west", "farm", "stay", "leave"],
  },
  {
    name: "West town death — ghetto",
    choices: ["west", "farm", "stay", "steal", "ghetto"],
  },
  {
    name: "West town death — bribe",
    choices: ["west", "farm", "stay", "steal", "barter", "bribe"],
  },
  {
    name: "West camp death — fence escape",
    choices: ["west", "farm", "stay", "steal", "barter", "flee", "escape"],
  },
  {
    name: "West rail death — stay on train (Chelmno)",
    choices: ["west", "farm", "stay", "steal", "barter", "flee", "endure", "stay"],
  },
  {
    name: "West longest — rail escape then farm night steal",
    choices: [
      "west",
      "farm",
      "stay",
      "steal",
      "barter",
      "flee",
      "endure",
      "flee",
      "steal",
    ],
  },
  {
    name: "West longest — rail escape then ask barn",
    choices: [
      "west",
      "farm",
      "stay",
      "steal",
      "barter",
      "flee",
      "endure",
      "flee",
      "ask",
    ],
  },
  {
    name: "East short death — south stone",
    choices: ["east", "south"],
  },
  {
    name: "East death — seek locals",
    choices: ["east", "north", "locals"],
  },
  {
    name: "East death — alone swamp",
    choices: ["east", "north", "solo", "alone"],
  },
  {
    name: "East death — join raid",
    choices: ["east", "north", "solo", "partisans", "fight"],
  },
  {
    name: "East death — village raid illness",
    choices: ["east", "north", "solo", "partisans", "desert", "raid"],
  },
  {
    name: "East death — starve illness",
    choices: ["east", "north", "solo", "partisans", "desert", "starve"],
  },
];

export function runDemoScript(script: {
  name: string;
  choices: string[];
}): PathResult {
  try {
    let s = createInitialState();
    s = playAdvance(s); // BOOT → S01
    const steps = ["BOOT", "S01"];
    const choiceLog: string[] = [];

    for (const choiceId of script.choices) {
      s = stepThroughContinues(s);
      const node = getNode(s.nodeId);
      if (node.kind !== "choice") {
        return {
          name: script.name,
          choices: choiceLog,
          terminalId: s.nodeId,
          status: "ERROR",
          miles: s.miles,
          route: s.route,
          steps,
          epitaphCause: "",
          ok: false,
          error: `Expected choice node, on ${s.nodeId} (${node.kind}) when picking ${choiceId}`,
        };
      }
      if (!node.choices?.some((c) => c.id === choiceId)) {
        return {
          name: script.name,
          choices: choiceLog,
          terminalId: s.nodeId,
          status: "ERROR",
          miles: s.miles,
          route: s.route,
          steps,
          epitaphCause: "",
          ok: false,
          error: `Choice ${choiceId} not on ${s.nodeId}; have ${node.choices?.map((c) => c.id).join(",")}`,
        };
      }
      choiceLog.push(`${s.nodeId}:${choiceId}`);
      s = playChoice(s, choiceId);
      steps.push(s.nodeId);
    }

    s = stepThroughContinues(s);
    const node = getNode(s.nodeId);

    if (node.kind === "terminal") {
      const tomb = goToTombstone(s);
      return {
        name: script.name,
        choices: choiceLog,
        terminalId: node.id,
        status: node.status ?? "KILLED",
        miles: s.miles,
        route: s.route,
        steps: [...steps, "GAMEOVER"],
        epitaphCause: s.epitaph?.cause ?? node.prose,
        ok: tomb.nodeId === "GAMEOVER" && Boolean(s.epitaph),
      };
    }

    return {
      name: script.name,
      choices: choiceLog,
      terminalId: s.nodeId,
      status: "INCOMPLETE",
      miles: s.miles,
      route: s.route,
      steps,
      epitaphCause: "",
      ok: false,
      error: `Script ended on ${s.nodeId} kind=${node.kind}`,
    };
  } catch (e) {
    return {
      name: script.name,
      choices: [],
      terminalId: "ERROR",
      status: "ERROR",
      miles: 0,
      route: "none",
      steps: [],
      epitaphCause: "",
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
