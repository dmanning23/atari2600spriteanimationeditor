# Claude Code Instructions

## Tech Stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS **v3** (pinned to 3.4.1) — do NOT upgrade to v4; the project uses v3 syntax (`@tailwind base/components/utilities`, `tailwind.config.ts`)
- Radix UI primitives, shadcn/ui components in `components/ui/`
- No test framework configured

## Project Structure

- `app/` — Next.js app router (layout, page, globals.css)
- `components/` — React components (`.js` files)
- `components/ui/` — shadcn/ui base components (`.tsx`)
- `data/` — JSON color palette data

## Key Files

- `components/SpriteAnimationEditor.js` — root component, owns all state
- `components/FrameControls.js` — add/delete/copy/paste/navigate frames
- `components/GridEditor.js` — pixel grid editing
- `components/PreviewCanvas.js` — animation playback preview
- `components/Atari2600CodeExporter.js` — assembly code generation

## State Architecture

All state lives in `SpriteAnimationEditor`. The `animations` object is keyed by animation name:

```js
{
  [animationName]: {
    frames: [{ grid, lineColors1, lineColors2 }],
    speed: Number
  }
}
```

`currentAnimation` (string) and `currentFrame` (number) track the active selection.

## Important Gotchas

- **Tailwind v4 must not be installed.** If it gets installed accidentally, downgrade: `npm install tailwindcss@3.4.1 --save-dev`
- **Do not use `setTimeout` to set `currentFrame`** after frame state updates — this causes race conditions where the timeout fires after a subsequent delete, leaving `currentFrame` out of bounds. Call `setCurrentFrame` synchronously after `setAnimations`; React 18 batches them.
- `getGridWidth()` returns 8 (doubleColor) or 16 (doubleWidth) based on `spriteMode`
