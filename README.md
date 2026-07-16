# Escape from Pinsk

Browser choice-driven historical survival narrative. Portfolio build for MAMA.

Full-bleed Style A (green CRT) system/death screens and Style B (EGA) choice/continue screens. All copy is HTML overlay — art is wordless.

## Source

Narrative from the vetted draft in `~/Downloads/MAMA_GAME/` (spreadsheet + scene bible). Art batches: Style A system/deaths, Style B choices/continues.

## Live

https://harrisonbw.github.io/escape-from-pinsk/

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

Deploy: push to `main` → GitHub Actions → GitHub Pages.

## Controls

- Click choices, or press `1` / `2` / `3`
- `Enter` / `Space` advances boot, continue, and terminal screens

## Stack

Vite · React · TypeScript · static assets in `public/art/`
