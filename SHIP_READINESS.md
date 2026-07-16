# Ship readiness — every path tested

**Date:** 2026-07-16  
**Live:** https://harrisonbw.github.io/escape-from-pinsk/  
**Command:** `npm test` → **50/50 PASS**

## Result: **READY TO SHIP** (engine + content + assets)

Every complete story path was played through the real game engine:

1. BOOT → S01  
2. Every choice branch (DFS)  
3. Continue screens  
4. Travel enter → `completeTravel` (no stuck “ARRIVED”)  
5. Terminal death/illness  
6. Epitaph = draft prose  
7. Tombstone (`GAMEOVER`)  
8. Art file exists for every visited node  

### All 16 paths

| Terminal | Status  | Choices | Miles | Choice sequence |
|----------|---------|--------:|------:|-----------------|
| S01A | KILLED | 1 | 4 | `stay` |
| W01A | KILLED | 2 | 82 | `west, wander` |
| W02B | KILLED | 3 | 90 | `west, farm, leave` |
| W03A | KILLED | 4 | 98 | `west, farm, stay, leave` |
| W04B | KILLED | 5 | 130 | `west, farm, stay, steal, ghetto` |
| W05B | KILLED | 6 | 162 | `west, farm, stay, steal, barter, bribe` |
| W06B | KILLED | 7 | 218 | `west, farm, stay, steal, barter, flee, escape` |
| W07B | KILLED | 8 | 314 | `west, farm, stay, steal, barter, flee, endure, stay` |
| W08A | KILLED | 9 | 356 | `…endure, flee, steal` |
| W08B | KILLED | 9 | 356 | `…endure, flee, ask` |
| E01A | KILLED | 2 | 36 | `east, south` |
| E02A | KILLED | 3 | 44 | `east, north, locals` |
| E03A | KILLED | 4 | 52 | `east, north, solo, alone` |
| E04A | KILLED | 5 | 81 | `east, north, solo, partisans, fight` |
| E05A | ILLNESS | 6 | 89 | `…desert, raid` |
| E05B | ILLNESS | 6 | 89 | `…desert, starve` |

**Coverage:** 16/16 terminals · 0 broken edges · 45/45 art files.

### Re-run before any ship

```bash
cd ~/code/escape-from-pinsk
npm test
npm run build
```

### What’s covered vs manual

| Layer | Automated? |
|-------|------------|
| All choice paths / endings | Yes |
| Travel not stuck | Yes |
| Tombstone + epitaph | Yes |
| Art files on disk (+ dist if built) | Yes |
| Live art HTTP | Run live check in CI/pre-ship |
| Visual layout on real phone | **Manual** once (tombstone full-screen) |
| Touch targets / audio in room | **Manual** |

### Manual 3-minute smoke (recommended once before room)

1. Phone: open live URL, PLAY → stay → end screen (fits, no scroll hell)  
2. Laptop: west → farm → leave (travel auto-continues)  
3. Laptop: east → south (short second route)  

If those three work, every other path uses the same engine code paths already green in tests.
