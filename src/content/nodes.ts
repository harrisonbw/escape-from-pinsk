import type { StoryNode } from "../engine/types";

/**
 * Story graph — player-facing copy is taken VERBATIM from:
 * `holocaust vid game -- escape from pinsk -- Denzel draft.xlsx`
 *
 * Do not rephrase, smooth, or "correct" typos/spelling in prose or labels.
 * UI chrome (Continue/PLAY) is the only non-sheet text allowed in this file.
 */
export const START_NODE = "BOOT";

export const NODES: Record<string, StoryNode> = {
  // ── System ──────────────────────────────────────────────────────────
  BOOT: {
    id: "BOOT",
    kind: "boot",
    // Robbie: remove spoiler title that telegraphs death/ending.
    // Trail frame is 1941–1945; draft story beats still use sheet dates.
    prose: "Follow the Holocaust Trail...",
    image: { style: "a", file: "A-BOOT_title_screen.webp" },
    cta: "PLAY",
    next: "S01",
  },

  // ── Opening choice ──────────────────────────────────────────────────
  S01: {
    id: "S01",
    kind: "choice",
    dateLabel: "Jul-Aug 1941",
    // Sheet R3C (without "Story:" label)
    prose:
      "It's July 1941. You are Jewish. The Vermacht has just taken over your of Pinsk, Poland, 5 miles from your village. Do you...",
    image: { style: "b", file: "S01_village_july_1941.webp" },
    choices: [
      {
        id: "stay",
        label: "Stay with your family in the Shtetl",
        next: "S01A",
        effects: { shelter: "home" },
      },
      {
        id: "west",
        label: "Abandon your family, flee West",
        next: "S01B",
        effects: {
          dateLabel: "Jul-Aug 1941",
          shelter: "temporary",
          food: 1,
          health: 3,
        },
      },
      {
        id: "east",
        label: "Abandon your family, flee East",
        next: "S01C",
        effects: {
          dateLabel: "Jul-Aug 1941",
          shelter: "forest",
          food: 1,
          health: 3,
        },
      },
    ],
  },

  S01A: {
    id: "S01A",
    kind: "terminal",
    dateLabel: "Jul-Aug 1941",
    prose:
      "The Germans leave. Two days later, Police Auxillerary Units round up the entire town, force them into the synagogue and set it on fire.",
    image: { style: "a", file: "S01A_synagogue_fire.webp" },
    status: "KILLED",
  },

  S01B: {
    id: "S01B",
    kind: "continue",
    dateLabel: "Jul-Aug 1941",
    prose:
      "You move West toward Nazi occupied Poland. You can sense in your bones you will never see your home again.",
    image: { style: "b", file: "S01B_fleeing_west.webp" },
    cta: "Continue",
    next: "W01",
  },

  S01C: {
    id: "S01C",
    kind: "continue",
    dateLabel: "Jul-Aug 1941",
    prose:
      "You escape East into the forests of Belarus. You don't know how to start a fire or build a shelter in the woods. The air is thick and strange sounds echo and creek from all directions of the wilderness.",
    image: { style: "b", file: "S01C_fleeing_east.webp" },
    cta: "Continue",
    next: "E01",
  },

  // ── West route ──────────────────────────────────────────────────────
  W01: {
    id: "W01",
    kind: "choice",
    dateLabel: "Sep-Oct 1941",
    prose:
      "You have been traveling the countryside alone for months. Hungry, faint and weak. Do you stop in a nearby town for the night?",
    image: { style: "b", file: "W01_countryside_autumn_1941.webp" },
    choices: [
      {
        id: "wander",
        // Sheet: exact option text before ---
        label: "No continue wandering south west",
        next: "W01A",
        effects: { food: 0, health: 1, shelter: "none" },
      },
      {
        id: "farm",
        label: "Yes. Head to a Polish family's farm a bit north west.",
        next: "W01B",
        effects: {
          dateLabel: "Sep-Oct 1941",
          shelter: "farm_outbuilding",
          food: 2,
          health: 2,
        },
      },
    ],
  },

  W01A: {
    id: "W01A",
    kind: "terminal",
    dateLabel: "Sep-Oct 1941",
    prose:
      "You are captured and killed by a Romanian rear guard auxiliary unit.",
    image: { style: "a", file: "W01A_captured_on_road.webp" },
    status: "KILLED",
  },

  W01B: {
    id: "W01B",
    kind: "continue",
    dateLabel: "Sep-Oct 1941",
    prose:
      "No rooms available but they let you sleep in barn with the donkey for a few months.",
    image: { style: "b", file: "W01B_barn_refuge.webp" },
    cta: "Continue",
    next: "W02",
  },

  W02: {
    id: "W02",
    kind: "choice",
    dateLabel: "Nov-Dec 1941",
    prose:
      "Winter has arrived and the Polish family is short on food. You can stay in their stable and get whatever leftovers they may rummage or leave the farm and rewander the countryside",
    image: { style: "b", file: "W02_winter_barn.webp" },
    choices: [
      {
        id: "stay",
        label: "Stay with the Polish farmers",
        next: "W02A",
        effects: { food: 1, health: 2, shelter: "farm_outbuilding" },
      },
      {
        id: "leave",
        label: "Leave the farm, traverse the countryside",
        next: "W02B",
        effects: { food: 0, health: 1, shelter: "none" },
      },
    ],
  },

  W02A: {
    id: "W02A",
    kind: "continue",
    dateLabel: "Nov-Dec 1941",
    prose:
      "They feel bad that for you. You get what little leftovers they have. You lose any body fat you may have had but are still alive.",
    image: { style: "b", file: "W02A_leftovers_winter.webp" },
    cta: "Continue",
    next: "W03",
  },

  W02B: {
    id: "W02B",
    kind: "terminal",
    dateLabel: "Nov-Dec 1941",
    // Sheet keeps lowercase after --
    prose:
      "found by a Ukrainian Waffen SS Unit, made to dig your own grave then are summarily executed.",
    image: { style: "a", file: "W02B_dug_grave.webp" },
    status: "KILLED",
  },

  W03: {
    id: "W03",
    kind: "choice",
    dateLabel: "Jan-Feb 1942",
    prose: "Halfway through the winter the Polish family asks you to leave. You...",
    image: { style: "b", file: "W03_asked_to_leave.webp" },
    choices: [
      {
        id: "leave",
        label: "Simply leave and attempt to travel eastward towards Soviet lines",
        next: "W03A",
        effects: { food: 0, health: 1, shelter: "none" },
      },
      {
        id: "steal",
        label: "Beg to stay then steal their remaining food.",
        next: "W03B",
        effects: {
          food: 2,
          health: 2,
          shelter: "temporary",
          addPossessions: ["stolen valuables", "stolen food"],
        },
      },
    ],
  },

  W03A: {
    id: "W03A",
    kind: "terminal",
    dateLabel: "Jan-Feb 1942",
    prose:
      "Found by three Ukrainian teenagers who strip you of your clothes before stabbing you in the leg and then beating you to death with an iron pipe.",
    image: { style: "a", file: "W03A_teenagers_on_road.webp" },
    status: "KILLED",
  },

  W03B: {
    id: "W03B",
    kind: "continue",
    dateLabel: "Jan-Feb 1942",
    prose:
      "They let you stay a few more weeks and when they are not suspecting you steal all their belongings, valuables and food. You set off again solo.",
    image: { style: "b", file: "W03B_theft.webp" },
    cta: "Continue",
    next: "W04",
  },

  W04: {
    id: "W04",
    kind: "choice",
    dateLabel: "Mar-Apr 1942",
    prose:
      "You run out of food but still have some valuables from the Polish farming family. You come across and small town.",
    image: { style: "b", file: "W04_town_square_barter.webp" },
    choices: [
      {
        id: "barter",
        label: "Go to town square and try to barter the valuables",
        next: "W04A",
        effects: {
          food: 3,
          health: 3,
          shelter: "inn",
          removePossessions: ["stolen valuables", "family valuables"],
          addPossessions: ["shoes", "food stores"],
        },
      },
      {
        id: "ghetto",
        label: "Go to the local Jewish ghetto",
        next: "W04B",
        effects: { shelter: "temporary", health: 1 },
      },
    ],
  },

  W04A: {
    id: "W04A",
    kind: "continue",
    dateLabel: "Mar-Apr 1942",
    prose:
      "You sucessfully trade for some food, a shared room at an inn and a new pair of shoes.",
    image: { style: "b", file: "W04A_barter_succeeds.webp" },
    cta: "Continue",
    next: "W05",
  },

  W04B: {
    id: "W04B",
    kind: "terminal",
    dateLabel: "Mar-Apr 1942",
    prose:
      'In "checking you in" and making sure you are disarmed a ghetto guard throws you to the floor scraping your face. The small wound gets infected and days later you die.',
    image: { style: "a", file: "W04B_ghetto_wound.webp" },
    status: "KILLED",
  },

  W05: {
    id: "W05",
    kind: "choice",
    dateLabel: "May-Jun 1942",
    prose: "Eizatgruppen are scanning the town for Jews, do you...",
    image: { style: "b", file: "W05_sweep_town.webp" },
    choices: [
      {
        id: "flee",
        label: "Flee the town unannounced",
        next: "W05A",
        effects: {
          food: 0,
          health: 2,
          shelter: "none",
          clearPossessions: true,
        },
      },
      {
        id: "bribe",
        label:
          "Attempt to bribe the guards with the rest of your possessions and stay in the town",
        next: "W05B",
        effects: { clearPossessions: true, food: 0, health: 0 },
      },
    ],
  },

  W05A: {
    id: "W05A",
    kind: "continue",
    dateLabel: "May-Jun 1942",
    prose:
      "You sucessfully flee nobody expecting you were a Jew, but now you have no food or supplies.",
    image: { style: "b", file: "W05A_slipping_out.webp" },
    cta: "Continue",
    next: "W06",
  },

  W05B: {
    id: "W05B",
    kind: "terminal",
    dateLabel: "May-Jun 1942",
    prose:
      "The guards confiscate your possessions, march you to the outskirts of town where you are knelt in front of a pit and shot in the back of the head.",
    image: { style: "a", file: "W05B_pit_town_edge.webp" },
    status: "KILLED",
  },

  W06: {
    id: "W06",
    kind: "choice",
    dateLabel: "Jul-Aug 1942",
    prose:
      "The local police raid the room you are slumming in and arrest you. You are immediately transferred to a labor camp. Do you...",
    image: { style: "b", file: "W06_labor_camp_wire.webp" },
    choices: [
      {
        id: "endure",
        label: "Try to tough it out in the labor camp",
        next: "W06A",
        effects: { shelter: "barracks", food: 1, health: 1 },
      },
      {
        id: "escape",
        label: "Try to escape the camp at night by hopping the fence",
        next: "W06B",
        effects: { shelter: "none", health: 0 },
      },
    ],
  },

  W06A: {
    id: "W06A",
    kind: "continue",
    dateLabel: "Jul-Aug 1942",
    prose:
      "Day in and day out you work in the camp with no escape or liberation in sight. But you are alive.",
    image: { style: "b", file: "W06A_enduring_camp.webp" },
    cta: "Continue",
    next: "W07",
  },

  W06B: {
    id: "W06B",
    kind: "terminal",
    dateLabel: "Jul-Aug 1942",
    // Sheet ends with double period
    prose:
      "You're 100 yards outside the wire when a bullet rips through your spine leaving you paralyzed. You bleed out unable to move over the next two days of agony..",
    image: { style: "a", file: "W06B_wire.webp" },
    status: "KILLED",
  },

  W07: {
    id: "W07",
    kind: "choice",
    dateLabel: "Sep-Oct 1942",
    prose:
      "One day you are marked for transfer out of the labor camp. The train stops and your door is accendentally jarred open. Some begin to flee the traincar, most stay. Do you...",
    image: { style: "b", file: "W07_railcar_door.webp" },
    choices: [
      {
        id: "flee",
        label:
          "Try to flee the train car with the escapees through a rain of gunfire",
        next: "W07A",
        effects: { shelter: "none", food: 0, health: 2 },
      },
      {
        id: "stay",
        label: "Wait for the train to be reloaded and fixed",
        next: "W07B",
        effects: { shelter: "railcar" },
      },
    ],
  },

  W07A: {
    id: "W07A",
    kind: "continue",
    dateLabel: "Sep-Oct 1942",
    prose:
      "You sprint away without looking back. Most escapees are shot but you manage to make it to a nearby field with nobody in sight.",
    image: { style: "b", file: "W07A_sprint.webp" },
    cta: "Continue",
    next: "W08",
  },

  W07B: {
    id: "W07B",
    kind: "terminal",
    dateLabel: "Sep-Oct 1942",
    prose:
      "The train is fixed. You are transferred to Chelmno and gassed immediately upon arrival.",
    image: { style: "a", file: "W07B_bronna_gora.webp" },
    status: "KILLED",
  },

  W08: {
    id: "W08",
    kind: "choice",
    dateLabel: "Nov-Dec 1942",
    prose:
      "Months later and miles from wherever the train left you are starving and come upon a farm you suspect belongs to a Polish family. You...",
    image: { style: "b", file: "W08_farm_after_escape.webp" },
    choices: [
      {
        id: "steal",
        label: "Try to steal their possession and food from them at night",
        next: "W08A",
        effects: { food: 0, health: 0 },
      },
      {
        id: "ask",
        label: "Ask them if you can stay in their barn with the farm animals",
        next: "W08B",
        effects: { food: 0, health: 0 },
      },
    ],
  },

  W08A: {
    id: "W08A",
    kind: "terminal",
    dateLabel: "Nov-Dec 1942",
    // Sheet keeps lowercase after --
    prose:
      "you are caught and the farmer screaming in Ukrainian Russian shoots you as you try to leave.",
    image: { style: "a", file: "W08A_farmers_shot.webp" },
    status: "KILLED",
  },

  W08B: {
    id: "W08B",
    kind: "terminal",
    dateLabel: "Nov-Dec 1942",
    prose:
      "the Polish family that once lived there was evicted and replaced by a Ukrainian family. The father and teenage son bound you and beat you to death with a wooden stick.",
    image: { style: "a", file: "W08B_new_occupants.webp" },
    status: "KILLED",
  },

  // ── East route ──────────────────────────────────────────────────────
  E01: {
    id: "E01",
    kind: "choice",
    dateLabel: "Sep-Oct 1941",
    prose: "Fall begins and it begins to get cold in the forest. You...",
    image: { style: "b", file: "E01_first_night_forest.webp" },
    choices: [
      {
        id: "south",
        label: "Flee South",
        next: "E01A",
        effects: { food: 0, health: 0, shelter: "none" },
      },
      {
        id: "north",
        label: "Flee North",
        next: "E01B",
        effects: { shelter: "marsh", food: 1, health: 2 },
      },
    ],
  },

  E01A: {
    id: "E01A",
    kind: "terminal",
    dateLabel: "Sep-Oct 1941",
    prose:
      "You stumble upon a Ukrainian peasant. He's slightly bored and takes it out on you by hitting you in the head with a large stone. You bleed to death.",
    image: { style: "a", file: "E01A_peasants_stone.webp" },
    status: "KILLED",
  },

  E01B: {
    id: "E01B",
    kind: "continue",
    dateLabel: "Sep-Oct 1941",
    prose:
      "You find a small marsh to hide in. Insects while the days are warm, sleepless nights in the cold but you are alive.",
    image: { style: "b", file: "E01B_into_marsh.webp" },
    cta: "Continue",
    next: "E02",
  },

  E02: {
    id: "E02",
    kind: "choice",
    dateLabel: "Nov-Dec 1941",
    prose: "As Winter gets more intense, the Swamp too begins to freeze over. You...",
    image: { style: "b", file: "E02_freezing_swamp.webp" },
    choices: [
      {
        id: "locals",
        label: "Try to befriend some Belarussian locals in a nearby town",
        next: "E02A",
        effects: { shelter: "temporary", health: 1 },
      },
      {
        id: "solo",
        label: "Stick it out solo in the swamps",
        next: "E02B",
        effects: { shelter: "marsh", food: 1, health: 1 },
      },
    ],
  },

  E02A: {
    id: "E02A",
    kind: "terminal",
    dateLabel: "Nov-Dec 1941",
    prose:
      "A week after the town is ransacked by Lithuanian Waffen SS who find out you are Jewish and beat you to death with a pipe.",
    image: { style: "a", file: "E02A_ransacked_town.webp" },
    status: "KILLED",
  },

  E02B: {
    id: "E02B",
    kind: "continue",
    dateLabel: "Nov-Dec 1941",
    prose:
      "Insect bites now cover your entire body and a strange infection spreads across your leg.",
    image: { style: "b", file: "E02B_winter_alone_reeds.webp" },
    cta: "Continue",
    next: "E03",
  },

  E03: {
    id: "E03",
    kind: "choice",
    dateLabel: "Jan-Feb 1942",
    prose:
      "The marshes are teaming with gangs, partisan groups, and military units. Do you...",
    image: { style: "b", file: "E03_gangs_partisans_patrols.webp" },
    choices: [
      {
        id: "alone",
        label: "Stay and try to continue to hide in the swamp solo",
        next: "E03A",
        effects: { shelter: "marsh", health: 0 },
      },
      {
        id: "partisans",
        label: "Try to team up with a partisan gang",
        next: "E03B",
        effects: {
          shelter: "forest",
          food: 1,
          health: 2,
          addPossessions: ["rifle"],
        },
      },
    ],
  },

  E03A: {
    id: "E03A",
    kind: "terminal",
    dateLabel: "Jan-Feb 1942",
    prose:
      'You are picked up by a reargaurd Waffen SS unit of a language you cannot understand. One of the "officers" stabs you and lets you bleed out in a bog they leave you in.',
    image: { style: "a", file: "E03A_bog.webp" },
    status: "KILLED",
  },

  E03B: {
    id: "E03B",
    kind: "continue",
    dateLabel: "Jan-Feb 1942",
    prose:
      "You meet a partisan gang of Belrussians a few miles north. They haze you a bit for being Jewish but let you join if you promise to fight.",
    image: { style: "b", file: "E03B_joining_band.webp" },
    cta: "Continue",
    next: "E04",
  },

  E04: {
    id: "E04",
    kind: "choice",
    dateLabel: "Mar-Apr 1942",
    prose:
      "Starving, the gang is preparing a raid to get supllies on a German reargaurd post. You...",
    image: { style: "b", file: "E04_supply_raid_decision.webp" },
    choices: [
      {
        id: "fight",
        label: "Join the fight",
        next: "E04A",
        effects: { health: 0 },
      },
      {
        id: "desert",
        label: "Abandon the gang and take the rifle they gave you",
        next: "E04B",
        effects: {
          food: 1,
          health: 2,
          shelter: "forest",
          addPossessions: ["rifle", "depleted supplies"],
        },
      },
    ],
  },

  E04A: {
    id: "E04A",
    kind: "terminal",
    dateLabel: "Mar-Apr 1942",
    prose: "Your entire squad is killed by the supply depot gaurds.",
    image: { style: "a", file: "E04A_squad_wiped_out.webp" },
    status: "KILLED",
  },

  E04B: {
    id: "E04B",
    kind: "continue",
    dateLabel: "Mar-Apr 1942",
    prose:
      "You flee to the woods with their as much of their already depleated supplies you can carry.",
    image: { style: "b", file: "E04B_deserting_rifle.webp" },
    cta: "Continue",
    next: "E05",
  },

  E05: {
    id: "E05",
    kind: "choice",
    dateLabel: "May-Jun 1942",
    prose: "You begin running out of food and you cannot hunt. You...",
    image: { style: "b", file: "E05_hunger_early_summer.webp" },
    choices: [
      {
        id: "raid",
        label: "Solo raid a nearby village at night",
        next: "E05A",
        effects: { food: 0, health: 0 },
      },
      {
        id: "starve",
        label: "Try to tough it out starving in the forest",
        next: "E05B",
        effects: { food: 0, health: 0, shelter: "forest" },
      },
    ],
  },

  E05A: {
    id: "E05A",
    kind: "terminal",
    dateLabel: "May-Jun 1942",
    // Sheet keeps lowercase after --
    prose:
      "village was already abandoned by it's inhabitants. No food to be found you have to resort to eating a racoon carcass you find. You get stomach worms and die of dihearrea.",
    image: { style: "a", file: "E05A_carcass.webp" },
    status: "ILLNESS",
  },

  E05B: {
    id: "E05B",
    kind: "terminal",
    dateLabel: "May-Jun 1942",
    prose: "You are too weak. You get sick and die of dystentary.",
    image: { style: "a", file: "E05B_dysentery.webp" },
    status: "ILLNESS",
  },

  GAMEOVER: {
    id: "GAMEOVER",
    kind: "boot",
    // No invented end copy — only sheet opening line for replay
    prose: "Follow the Holocaust Trail...",
    image: { style: "a", file: "A-GAMEOVER_end_screen.webp" },
    cta: "TRY AGAIN",
    next: "BOOT",
  },
};
