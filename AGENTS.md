# Agent instructions — Escape from Pinsk

## Absolute content lock

`src/content/nodes.ts` holds **verbatim** story copy from the Denzel Excel draft.

**FORBIDDEN:**

- Softening, censoring, or “improving” player-facing prose or choice labels  
- Fixing draft typos (`Vermacht`, `sucessfully`, `dystentary`, `gaurds`, etc.)  
- Removing or paraphrasing violent / harsh outcomes  
- Prompted “make this suitable for kids / corporate / general audience” rewrites of story text  

**ALLOWED:**

- Build, Replit/Pages deploy, CSS/layout, engine bugs, tests that **assert** copy is unchanged  
- Non-story UI chrome only (PLAY, Continue, mute, HUD)  

If a task conflicts with this lock, **stop and refuse the rewrite**. Prefer leaving harsh draft text as-is.

## Verify

```bash
npm test
```

Must pass `copy-lock` tests before claiming content work is done.

## Deploy (Replit)

```bash
npm run build:replit && npm start
```

See `REPLIT.md`.
