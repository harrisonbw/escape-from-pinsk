# Escape from Pinsk — Executive QA Report

**Date:** 2026-07-16  
**Live demo:** https://harrisonbw.github.io/escape-from-pinsk/  
**Repo:** https://github.com/harrisonbw/escape-from-pinsk  
**Source copy:** Denzel Excel draft (`holocaust vid game -- escape from pinsk -- Denzel draft.xlsx`)

---

## Verdict for exec demo: **GO**

| Gate | Result | Evidence |
|------|--------|----------|
| Automated path suite | **PASS** | 29/29 vitest tests |
| All story endings reachable | **PASS** | 16/16 terminals hit |
| Copy vs Excel draft | **PASS** | 74 strings audited, 0 wording mismatches |
| Local art files | **PASS** | 45/45 webp present |
| Live deploy (HTML/JS/CSS/art) | **PASS** | HTTP 200 across samples |
| Broken graph edges | **PASS** | 0 |

Re-run anytime:

```bash
cd ~/code/escape-from-pinsk
npm test
```

---

## What we stress-tested (parallel agents + automation)

Three specialist agents ran in parallel, plus a full engine path-walker:

1. **Copy fidelity agent** — Excel draft vs every `prose` / choice `label`  
2. **Asset & live deploy agent** — local files + GitHub Pages  
3. **Narrative matrix agent** — all endings + recommended exec demos  
4. **Vitest pathwalker** — every complete path + 16 named demo scripts  

---

## 1. Path coverage (automated)

| Metric | Value |
|--------|------:|
| Story nodes | 45 |
| Choice points | 14 |
| Terminal endings | 16 |
| Continue beats | 13 |
| Complete play paths | **16** |
| Paths failed | **0** |
| West endings | 9 |
| East endings | 6 |
| Opening-only ending | 1 |

**Every terminal is reachable.** Every path produces an epitaph whose cause text is the terminal’s draft prose.

### Named demo scripts (all PASS)

| # | Scenario | Terminal | Status | Miles |
|--:|----------|----------|--------|------:|
| 1 | Stay with family | S01A | KILLED | 4 |
| 2 | West — wander road | W01A | KILLED | 82 |
| 3 | West — leave farm winter | W02B | KILLED | 90 |
| 4 | West — leave to Soviet lines | W03A | KILLED | 98 |
| 5 | West — ghetto | W04B | KILLED | 130 |
| 6 | West — bribe guards | W05B | KILLED | 162 |
| 7 | West — camp fence | W06B | KILLED | 218 |
| 8 | West — Chelmno (stay on train) | W07B | KILLED | 314 |
| 9 | West longest — rail escape, steal | W08A | KILLED | 356 |
| 10 | West longest — rail escape, ask barn | W08B | KILLED | 356 |
| 11 | East — south / stone | E01A | KILLED | 36 |
| 12 | East — seek locals | E02A | KILLED | 44 |
| 13 | East — alone swamp | E03A | KILLED | 52 |
| 14 | East — join raid | E04A | KILLED | 81 |
| 15 | East — village raid illness | E05A | ILLNESS | 89 |
| 16 | East — starve illness | E05B | ILLNESS | 89 |

---

## 2. Copy fidelity (agent)

- **Verdict: PASS**
- **74** player-facing strings checked (45 prose + 29 labels)
- **0** wording mismatches vs Denzel draft
- Draft typos intentionally preserved (`Vermacht`, `sucessfully`, `dystentary`, etc.)
- Product chrome only: title **ESCAPE FROM PINSK**, PLAY/Continue buttons (not story rewrite)

---

## 3. Assets & live site (agent)

- **Verdict: PASS**
- Local: **45/45** art files present  
- Live HTML/JS/CSS: **200**  
- Live art samples: **8/8 + extras → 200**, largest ~265 KB  
- Base path `/escape-from-pinsk/` correct for GitHub Pages  

**Soft risks (non-blocking):** Google Fonts CDN if offline; first boot art ~224 KB on weak mobile.

---

## 4. Recommended 5-minute exec walkthrough

| Order | Path (choices) | Ending | Why show it |
|------:|----------------|--------|-------------|
| 1 | **stay** | Synagogue | 30s — thesis: staying is not safety |
| 2 | **west → wander** | Road capture | Fleeing alone is not freedom |
| 3 | **east → north → locals** | SS pipe | “Trust people” still lethal |
| 4 | **west → farm → stay → steal → barter → flee → endure → stay** | **Chelmno** | Full arc + named camp |
| 5 | **…endure → flee → ask** | Final farm | Longest run; “almost made it” |

**URL:** https://harrisonbw.github.io/escape-from-pinsk/  
**Devices:** one laptop + one phone (public Pages — no local server).

---

## 5. Narrative honesty (for leadership)

- **No winning ending** in this draft. All 16 paths end in **KILLED** (14) or **ILLNESS** (2).  
- Intermediate “you are alive” continues = temporary season survival, not victory.  
- Average path length: ~4.9 choices (West ~5.9, East ~4.3).  
- Longest West: 9 choices, 356 miles; longest East: 6 choices, 89 miles.

---

## 6. Sign-off checklist (human, 5 min)

- [ ] Live site opens on exec laptop Wi‑Fi  
- [ ] Live site opens on phone  
- [ ] Path 1 (stay) → tombstone fits full screen, no bad scroll  
- [ ] Path 4 or 5 shows travel map + auto-continue  
- [ ] Sound blips acceptable in the room (or mute system volume)  
- [ ] Facilitator knows: content is historical fiction composite from the Denzel draft  

---

## 7. How the variable tests were run

| Layer | What varied | Tool |
|-------|-------------|------|
| Route | Opening / West / East | Path enumeration |
| Choice branch | Every binary fork | DFS over graph |
| Demo scripts | 16 fixed executive scenarios | `DEMO_SCRIPTS` |
| Assets | All 45 art bindings | Filesystem + live HTTP |
| Deploy | HTML, hashed JS/CSS, art CDN | curl / agent |
| Copy | All prose + labels | Excel vs nodes.ts |

**Engine helper APIs for future tests:** `playChoice`, `playAdvance`, `enumerateAllPaths`, `runDemoScript` in `src/engine/`.

---

*Generated for MAMA executive review. Automated suite: `npm test`.*
