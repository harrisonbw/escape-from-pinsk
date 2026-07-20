# Replit deploy — Escape from Pinsk

## Quick start

1. **Import from GitHub** → `harrisonbw/escape-from-pinsk` (or your fork).
2. Shell: `npm install`
3. **Run** uses `npm start` (serves `dist/` on port 3000).
4. First time: `npm run build:replit` then click **Run**.
5. **Deploy / Publish** → build command `npm run build:replit`, start `npm start`.

## Scripts

| Command | Use |
|---------|-----|
| `npm run build:replit` | Production build with `base: /` (Replit root URL) |
| `npm run build:pages` | Production build with `base: /escape-from-pinsk/` (GitHub Pages) |
| `npm run build` | Auto-detects Replit vs Pages (`REPL_ID` or `VITE_BASE`) |
| `npm start` | Serve `dist/` on port 3000 |
| `npm test` | Path coverage + **copy lock** (harsh language) |

## Public URL

After Deploy you get something like:

`https://<your-repl-name>.<username>.replit.app`

Art and JS load from site root when built with `build:replit`.

## Custom domain

Point domain to Replit → keep `base: /` (`build:replit`). No path prefix.

---

## Content policy (do not “nerf” the draft)

**Hosting does not rewrite your files.** Soft language only appears if someone edits `src/content/nodes.ts`.

### Locked file

`src/content/nodes.ts` is the Denzel Excel draft **verbatim**, including:

- Harsh occupation / violence outcomes  
- Intentional typos and rough phrasing  
- No “sensitivity” rewrites  

### Rules for humans and Replit Agent

1. **Never** rewrite, soften, censor, or “fix spelling” in story `prose` / choice `labels`.
2. **Never** prompt AI with “make this appropriate”, “tone down”, “clean language”.
3. Allowed: UI/CSS, build/deploy, bugs that do **not** change player-facing draft strings.
4. After any content change: `npm test` must pass (includes copy-lock).
5. Ship only `dist/` from a clean `npm run build:replit`.

### Guardrail

```bash
npm test
```

`src/content/copy-lock.test.ts` fails if key harsh result lines are deleted or softened.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page / missing art | Use `build:replit` not `build:pages`; hard refresh |
| Port wrong | App listens on **3000** (see `.replit`) |
| Agent rewrote story | Revert `nodes.ts` from git; re-run `npm test` |
