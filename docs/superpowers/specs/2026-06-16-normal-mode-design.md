# Normal Mode Design

**Date:** 2026-06-16  
**Status:** Approved

## Overview

Add a third sprite mode — **Normal** — that uses only the P0 player sprite. It is 8 pixels wide, single-color-per-line, with binary on/off cells. This is the standard "one sprite" case on the Atari 2600, as opposed to the existing two-sprite modes (Double Color and Double Width).

## Existing Modes (Context)

| Mode | Grid Width | Cell Values | Sprites Used | Colors |
|---|---|---|---|---|
| `doubleColor` | 8px | 0, 1, 2 | P0 + P1 | lineColors1 (P0), lineColors2 (P1) |
| `doubleWidth` | 16px | 0, 1 | P0 + P1 | lineColors1 only |
| **`normal`** (new) | **8px** | **0, 1** | **P0 only** | **lineColors1 only** |

## What Already Works Without Changes

The following already handle `normal` correctly by virtue of existing logic:

- `getGridWidth()` returns 8 for any non-`doubleWidth` mode — correct for `normal`
- `ColorControls.js` hides the C2 column when `spriteMode !== 'doubleColor'` — correct for `normal`
- `handleLineColorChange` only updates `lineColors2` when `spriteMode === 'doubleColor'` — correct for `normal`

## Files to Change

### `components/ModeSelector.js`

Add `normal` as a third option:

```js
{ id: 'normal', label: 'Normal (P0 only)' }
```

Order: Normal, Double Color, Double Width (or: Normal first as simplest mode).

### `components/SpriteAnimationEditor.js`

**`handleCellClick`:** Add `normal` branch — binary toggle, same as `doubleWidth`:

```js
} else if (spriteMode === 'normal') {
    newAnimations[currentAnimation].frames[currentFrame].grid[row][col] =
        currentCellValue === 0 ? 1 : 0;
}
```

**`handleModeChange`:** Add four new transition paths:

| From | To | Action |
|---|---|---|
| `normal` | `doubleColor` | No grid change (0/1 values are valid in doubleColor) |
| `normal` | `doubleWidth` | Extend each row from 8 → 16 columns (right 8 columns filled with 0) |
| `doubleColor` | `normal` | Collapse cell value 2 → 1 (P1 pixels become P0); grid stays 8px |
| `doubleWidth` | `normal` | Trim each row from 16 → 8 columns (drop right half) — same as existing doubleWidth→doubleColor |

**`loadProject`:** Recognize `'normal'` as a valid mode:

```js
// Before:
const spriteMode = loadedProject.spriteMode === 'doubleWidth' ? 'doubleWidth' : 'doubleColor';

// After:
const validModes = ['doubleColor', 'doubleWidth', 'normal'];
const spriteMode = validModes.includes(loadedProject.spriteMode)
    ? loadedProject.spriteMode
    : 'doubleColor';
```

**`validValues` in grid validation:** For `normal`, valid cell values are `[0, 1]`, same as `doubleWidth`:

```js
// Before:
const validValues = loadedProject.spriteMode === 'doubleWidth' ? [0, 1] : [0, 1, 2];

// After:
const validValues = (loadedProject.spriteMode === 'doubleWidth' || loadedProject.spriteMode === 'normal')
    ? [0, 1]
    : [0, 1, 2];
```

### `components/PreviewCanvas.js`

**`getGridWidth()`:** No change needed (already returns 8 for non-`doubleWidth`).

**Render logic:** Add `normal` branch in both the animation loop and the static (paused) render block:

```js
} else if (spriteMode === 'normal') {
    if (cell === 1) {
        const colorCode = frame.lineColors1[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
}
```

This is identical to the `doubleWidth` branch but named explicitly for clarity.

### `components/Atari2600CodeExporter.js`

Add `normal` branch in `generateCode()`:

```js
} else if (mode === 'normal') {
    // Single P0 sprite, one label per frame
    code += `${characterName}${animationName}${frameIndex + 1}\n`;
    for (let i = spriteHeight - 1; i >= 0; i--) {
        const row = frame.grid[i];
        const byte = row.reduce((acc, cell, index) =>
            acc | (cell !== 0 ? (1 << (7 - index)) : 0), 0);
        code += `  .byte %${byte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i}\n`;
    }
    code += '\n';

    if (withColor) {
        code += `${characterName}${animationName}Color${frameIndex + 1}\n`;
        for (let i = spriteHeight - 1; i >= 0; i--) {
            const color = frame.lineColors1[i];
            code += `  .byte ${color} ; Row ${spriteHeight - i}\n`;
        }
        code += '\n';
    }
}
```

## Mode Transition Decision

When switching from `doubleColor` → `normal`, color-2 pixels (cell value `2`) are converted to `1` (on). This preserves the visual shape of the sprite — the pixel is "on" regardless of which color it used.

## Out of Scope

- No changes to `GridEditor.js` (cell click is delegated to `handleCellClick` in the parent)
- No changes to `ColorControls.js` (C2 hiding already works via `spriteMode === 'doubleColor'` check)
- No changes to `FrameControls.js`, `AnimationSelector.js`, or `HeaderControls.js`
- No data migration for existing saved projects (they default to `doubleColor` when loaded without a recognized mode)
