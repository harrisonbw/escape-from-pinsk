/**
 * Fails if harsh draft result/story strings are deleted or softened.
 * Source of truth: Denzel Excel draft → nodes.ts (verbatim).
 */
import { describe, expect, it } from "vitest";
import { NODES } from "./nodes";

/** Exact substrings / full lines that must remain in the shipped game. */
const LOCKED_SNIPPETS: Array<{ id: string; mustInclude: string }> = [
  {
    id: "BOOT",
    mustInclude: "Which Concentration Camp Would You Have Died In?",
  },
  {
    id: "BOOT",
    mustInclude: "Follow the Holocaust Trail...",
  },
  {
    id: "S01",
    mustInclude:
      "It's July 1941. You are Jewish. The Vermacht has just taken over your of Pinsk",
  },
  {
    id: "S01A",
    mustInclude:
      "Police Auxillerary Units round up the entire town, force them into the synagogue and set it on fire.",
  },
  {
    id: "W01A",
    mustInclude:
      "You are captured and killed by a Romanian rear guard auxiliary unit.",
  },
  {
    id: "W02B",
    mustInclude:
      "found by a Ukrainian Waffen SS Unit, made to dig your own grave then are summarily executed.",
  },
  {
    id: "W03A",
    mustInclude:
      "Found by three Ukrainian teenagers who strip you of your clothes before stabbing you in the leg and then beating you to death with an iron pipe.",
  },
  {
    id: "W04B",
    mustInclude:
      'In "checking you in" and making sure you are disarmed a ghetto guard throws you to the floor scraping your face. The small wound gets infected and days later you die.',
  },
  {
    id: "W05B",
    mustInclude:
      "march you to the outskirts of town where you are knelt in front of a pit and shot in the back of the head.",
  },
  {
    id: "W06B",
    mustInclude:
      "You're 100 yards outside the wire when a bullet rips through your spine leaving you paralyzed. You bleed out unable to move over the next two days of agony..",
  },
  {
    id: "W07B",
    mustInclude:
      "The train is fixed. You are transferred to Chelmno and gassed immediately upon arrival.",
  },
  {
    id: "W08A",
    mustInclude:
      "you are caught and the farmer screaming in Ukrainian Russian shoots you as you try to leave.",
  },
  {
    id: "W08B",
    mustInclude:
      "the Polish family that once lived there was evicted and replaced by a Ukrainian family. The father and teenage son bound you and beat you to death with a wooden stick.",
  },
  {
    id: "E01A",
    mustInclude:
      "You stumble upon a Ukrainian peasant. He's slightly bored and takes it out on you by hitting you in the head with a large stone. You bleed to death.",
  },
  {
    id: "E02A",
    mustInclude:
      "A week after the town is ransacked by Lithuanian Waffen SS who find out you are Jewish and beat you to death with a pipe.",
  },
  {
    id: "E03A",
    mustInclude:
      'You are picked up by a reargaurd Waffen SS unit of a language you cannot understand. One of the "officers" stabs you and lets you bleed out in a bog they leave you in.',
  },
  {
    id: "E04A",
    mustInclude: "Your entire squad is killed by the supply depot gaurds.",
  },
  {
    id: "E05A",
    mustInclude:
      "village was already abandoned by it's inhabitants. No food to be found you have to resort to eating a racoon carcass you find. You get stomach worms and die of dihearrea.",
  },
  {
    id: "E05B",
    mustInclude: "You are too weak. You get sick and die of dystentary.",
  },
];

const LOCKED_LABELS: Array<{ nodeId: string; choiceId: string; label: string }> =
  [
    {
      nodeId: "S01",
      choiceId: "stay",
      label: "Stay with your family in the Shtetl",
    },
    {
      nodeId: "W01",
      choiceId: "wander",
      label: "No continue wandering south west",
    },
    {
      nodeId: "W05",
      choiceId: "bribe",
      label:
        "Attempt to bribe the guards with the rest of your possessions and stay in the town",
    },
  ];

describe("copy-lock — harsh draft language must not be nerfed", () => {
  it.each(LOCKED_SNIPPETS.map((s) => [s.id, s.mustInclude] as const))(
    "node %s still contains locked prose",
    (id, mustInclude) => {
      const node = NODES[id];
      expect(node, `missing node ${id}`).toBeTruthy();
      expect(
        node.prose,
        `NERFED or missing in ${id}. Restore Denzel draft wording.`,
      ).toContain(mustInclude);
    },
  );

  it.each(
    LOCKED_LABELS.map((s) => [s.nodeId, s.choiceId, s.label] as const),
  )("choice %s:%s label locked", (nodeId, choiceId, label) => {
    const node = NODES[nodeId];
    const choice = node.choices?.find((c) => c.id === choiceId);
    expect(choice, `missing ${nodeId}:${choiceId}`).toBeTruthy();
    expect(choice!.label).toBe(label);
  });

  it("every terminal still has a death/illness status and non-empty prose", () => {
    const terminals = Object.values(NODES).filter((n) => n.kind === "terminal");
    expect(terminals.length).toBeGreaterThanOrEqual(16);
    for (const t of terminals) {
      expect(["KILLED", "ILLNESS"]).toContain(t.status);
      expect(t.prose.trim().length).toBeGreaterThan(20);
    }
  });
});
