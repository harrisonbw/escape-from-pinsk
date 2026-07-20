# Escape from Pinsk

Browser choice-driven historical survival narrative. Portfolio build for MAMA.

Full-bleed Style A (green CRT) system/death screens and Style B (EGA) choice/continue screens. All copy is HTML overlay — art is wordless.

## Source

Narrative from the Denzel Excel draft in `MAMA_GAME` (**verbatim** — see `AGENTS.md` / `src/content/copy-lock.test.ts`). Do not soften story prose.

## Live

- **GitHub Pages:** https://harrisonbw.github.io/escape-from-pinsk/
- **Replit:** import this repo → see **`REPLIT.md`**

## Run (local)

```bash
npm install
npm run dev
```

```bash
npm run build:pages   # GitHub Pages path prefix
npm run preview
```

## Replit / root host

```bash
npm install
npm run build:replit  # base = /
npm start             # serve dist on :3000
```

| Script | Base path |
|--------|-----------|
| `build:pages` | `/escape-from-pinsk/` |
| `build:replit` | `/` |
| `build` | auto (`REPL_ID` → `/`, else Pages) |

## Tests (including copy lock)

```bash
npm test
```

Fails if harsh draft outcome strings in `src/content/nodes.ts` are nerfed or removed.

## Controls

- Click choices, or press `1` / `2` / `3`
- `Enter` / `Space` advances boot, continue, and terminal screens
- `♪ ON/OFF` mutes 8-bit music

## Stack

Vite · React · TypeScript · static assets in `public/art/`
