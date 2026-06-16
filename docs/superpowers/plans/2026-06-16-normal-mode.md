# Normal Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `normal` sprite mode (P0 only, 8px wide, binary cells) to the Atari 2600 Sprite Animation Editor alongside the existing `doubleColor` and `doubleWidth` modes.

**Architecture:** `normal` mode reuses all existing 8px-wide infrastructure — `getGridWidth()` already returns 8, C2 color controls already hide, `lineColors2` already ignored. New code adds: the mode option in the selector, binary cell toggling, four mode-transition data transforms, load/validate support, preview rendering, and ASM export.

**Tech Stack:** Next.js 14, React 18, JavaScript (no test framework configured — manual verification steps used in place of automated tests).

**Design spec:** `docs/superpowers/specs/2026-06-16-normal-mode-design.md`

---

## File Map

| File | Change |
|---|---|
| `components/ModeSelector.js` | Add `normal` option to modes array |
| `components/SpriteAnimationEditor.js` | `handleCellClick`, `handleModeChange`, `loadProject` |
| `components/PreviewCanvas.js` | Add `normal` branch to both render paths |
| `components/Atari2600CodeExporter.js` | Add `normal` branch to `generateCode()` |

---

## Task 1: Add Normal Mode to ModeSelector

**Files:**
- Modify: `components/ModeSelector.js`

- [ ] **Step 1: Add `normal` as the first option in the modes array**

In `components/ModeSelector.js`, replace the `modes` array:

```js
const modes = [
    { id: 'normal', label: 'Normal (P0 only)' },
    { id: 'doubleColor', label: 'Double Color (P0, P1)' },
    { id: 'doubleWidth', label: 'Double Width (16px)' }
];
```

- [ ] **Step 2: Commit**

```bash
git add components/ModeSelector.js
git commit -m "feat: add Normal mode option to ModeSelector"
```

---

## Task 2: Handle Cell Clicks in Normal Mode

**Files:**
- Modify: `components/SpriteAnimationEditor.js` (lines 72–88, `handleCellClick`)

In `normal` mode cells toggle binary 0↔1, the same as `doubleWidth`.

- [ ] **Step 1: Add `normal` branch to `handleCellClick`**

In `components/SpriteAnimationEditor.js`, find the block starting at line 72:

```js
if (spriteMode === 'doubleColor') {
    // ...
} else if (spriteMode === 'doubleWidth') {
    // In double width mode, toggle between 0 and 1
    newAnimations[currentAnimation].frames[currentFrame].grid[row][col] =
        currentCellValue === 0 ? 1 : 0;
}
```

Add the `normal` case so it reads:

```js
if (spriteMode === 'doubleColor') {
    if (currentCellValue === 0) {
        newAnimations[currentAnimation].frames[currentFrame].grid[row][col] = 1;
    } else if (currentCellValue === 1) {
        newAnimations[currentAnimation].frames[currentFrame].grid[row][col] = 2;
    } else {
        newAnimations[currentAnimation].frames[currentFrame].grid[row][col] = 0;
    }
} else if (spriteMode === 'doubleWidth') {
    newAnimations[currentAnimation].frames[currentFrame].grid[row][col] =
        currentCellValue === 0 ? 1 : 0;
} else if (spriteMode === 'normal') {
    newAnimations[currentAnimation].frames[currentFrame].grid[row][col] =
        currentCellValue === 0 ? 1 : 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/SpriteAnimationEditor.js
git commit -m "feat: toggle cells 0/1 in Normal mode"
```

---

## Task 3: Mode Transition Data Transforms

**Files:**
- Modify: `components/SpriteAnimationEditor.js` (`handleModeChange`, lines 158–222)

Four new transition paths are needed. `normal`→`doubleColor` requires no data transform (0/1 values are valid in `doubleColor`), but the other three need grid mutations.

- [ ] **Step 1: Replace `handleModeChange` with the version that includes all normal transitions**

Find `handleModeChange` (starts around line 158) and replace the entire callback body with:

```js
const handleModeChange = useCallback((newMode) => {
    setSpriteMode(newMode);

    // doubleColor → doubleWidth: extend rows 8→16, collapse color2 pixels to on
    if (spriteMode === 'doubleColor' && newMode === 'doubleWidth') {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };
            Object.keys(newAnimations).forEach(animName => {
                newAnimations[animName].frames = newAnimations[animName].frames.map(frame => {
                    const newGrid = Array(frame.grid.length).fill().map((_, rowIndex) => {
                        const oldRow = frame.grid[rowIndex];
                        return [...oldRow, ...Array(8).fill(0)];
                    });
                    for (let i = 0; i < frame.grid.length; i++) {
                        for (let j = 0; j < 8; j++) {
                            if (frame.grid[i][j] === 2) {
                                newGrid[i][j] = 1;
                            }
                        }
                    }
                    return {
                        grid: newGrid,
                        lineColors1: [...frame.lineColors1],
                        lineColors2: [...frame.lineColors2]
                    };
                });
            });
            return newAnimations;
        });
    }
    // doubleWidth → doubleColor: trim rows 16→8
    else if (spriteMode === 'doubleWidth' && newMode === 'doubleColor') {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };
            Object.keys(newAnimations).forEach(animName => {
                newAnimations[animName].frames = newAnimations[animName].frames.map(frame => {
                    const newGrid = frame.grid.map(row => row.slice(0, 8));
                    return {
                        grid: newGrid,
                        lineColors1: [...frame.lineColors1],
                        lineColors2: [...frame.lineColors2]
                    };
                });
            });
            return newAnimations;
        });
    }
    // doubleColor → normal: collapse color2 pixels (2→1), grid stays 8px
    else if (spriteMode === 'doubleColor' && newMode === 'normal') {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };
            Object.keys(newAnimations).forEach(animName => {
                newAnimations[animName].frames = newAnimations[animName].frames.map(frame => {
                    const newGrid = frame.grid.map(row =>
                        row.map(cell => (cell === 2 ? 1 : cell))
                    );
                    return {
                        grid: newGrid,
                        lineColors1: [...frame.lineColors1],
                        lineColors2: [...frame.lineColors2]
                    };
                });
            });
            return newAnimations;
        });
    }
    // doubleWidth → normal: trim rows 16→8
    else if (spriteMode === 'doubleWidth' && newMode === 'normal') {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };
            Object.keys(newAnimations).forEach(animName => {
                newAnimations[animName].frames = newAnimations[animName].frames.map(frame => {
                    const newGrid = frame.grid.map(row => row.slice(0, 8));
                    return {
                        grid: newGrid,
                        lineColors1: [...frame.lineColors1],
                        lineColors2: [...frame.lineColors2]
                    };
                });
            });
            return newAnimations;
        });
    }
    // normal → doubleWidth: extend rows 8→16
    else if (spriteMode === 'normal' && newMode === 'doubleWidth') {
        setAnimations(prevAnimations => {
            const newAnimations = { ...prevAnimations };
            Object.keys(newAnimations).forEach(animName => {
                newAnimations[animName].frames = newAnimations[animName].frames.map(frame => {
                    const newGrid = frame.grid.map(row => [...row, ...Array(8).fill(0)]);
                    return {
                        grid: newGrid,
                        lineColors1: [...frame.lineColors1],
                        lineColors2: [...frame.lineColors2]
                    };
                });
            });
            return newAnimations;
        });
    }
    // normal → doubleColor: no-op (0/1 values are valid in doubleColor)
}, [spriteMode]);
```

- [ ] **Step 2: Commit**

```bash
git add components/SpriteAnimationEditor.js
git commit -m "feat: add Normal mode transitions in handleModeChange"
```

---

## Task 4: Recognize Normal Mode When Loading Projects

**Files:**
- Modify: `components/SpriteAnimationEditor.js` (`loadProject`, lines ~428 and ~481)

Two changes in `loadProject`: the `validValues` check for grid cells, and the mode detection when setting state.

- [ ] **Step 1: Fix `validValues` to allow `[0, 1]` for `normal` mode**

Find the line around line 428:

```js
const validValues = loadedProject.spriteMode === 'doubleWidth' ? [0, 1] : [0, 1, 2];
```

Replace with:

```js
const validValues = (loadedProject.spriteMode === 'doubleWidth' || loadedProject.spriteMode === 'normal')
    ? [0, 1]
    : [0, 1, 2];
```

- [ ] **Step 2: Recognize `normal` as a valid saved mode**

Find the line around line 481:

```js
const spriteMode = loadedProject.spriteMode === 'doubleWidth' ? 'doubleWidth' : 'doubleColor';
```

Replace with:

```js
const validModes = ['doubleColor', 'doubleWidth', 'normal'];
const spriteMode = validModes.includes(loadedProject.spriteMode)
    ? loadedProject.spriteMode
    : 'doubleColor';
```

- [ ] **Step 3: Commit**

```bash
git add components/SpriteAnimationEditor.js
git commit -m "feat: recognize Normal mode when loading saved projects"
```

---

## Task 5: Render Normal Mode in PreviewCanvas

**Files:**
- Modify: `components/PreviewCanvas.js`

There are two render blocks in `PreviewCanvas` — one in the animation loop (`animate` function) and one in the static/paused render. Both need a `normal` branch.

- [ ] **Step 1: Add `normal` to the animation loop render block**

Find the `cell` rendering inside the `animate` function (around line 54–74). It currently looks like:

```js
if (spriteMode === 'doubleColor') {
    if (cell === 1) { /* lineColors1 */ }
    else if (cell === 2) { /* lineColors2 */ }
} else if (spriteMode === 'doubleWidth') {
    if (cell === 1) { /* lineColors1 */ }
}
```

Add the `normal` branch:

```js
if (spriteMode === 'doubleColor') {
    if (cell === 1) {
        const colorCode = frame.lineColors1[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    } else if (cell === 2) {
        const colorCode = frame.lineColors2[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
} else if (spriteMode === 'doubleWidth') {
    if (cell === 1) {
        const colorCode = frame.lineColors1[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
} else if (spriteMode === 'normal') {
    if (cell === 1) {
        const colorCode = frame.lineColors1[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
}
```

- [ ] **Step 2: Add `normal` to the static (paused) render block**

Find the second identical render block (around line 95–117, inside the `else` branch after `if (isPlaying)`). Apply the same change — add the `normal` branch after `doubleWidth`:

```js
if (spriteMode === 'doubleColor') {
    if (cell === 1) {
        const colorCode = frame.lineColors1[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    } else if (cell === 2) {
        const colorCode = frame.lineColors2[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
} else if (spriteMode === 'doubleWidth') {
    if (cell === 1) {
        const colorCode = frame.lineColors1[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
} else if (spriteMode === 'normal') {
    if (cell === 1) {
        const colorCode = frame.lineColors1[y];
        ctx.fillStyle = getColorHex(colorCode);
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add components/PreviewCanvas.js
git commit -m "feat: render Normal mode in PreviewCanvas"
```

---

## Task 6: Export Normal Mode Assembly Code

**Files:**
- Modify: `components/Atari2600CodeExporter.js`

Normal mode exports one sprite label per frame (not two), and one color block if `withColor`.

- [ ] **Step 1: Add `normal` branch to `generateCode()`**

In `components/Atari2600CodeExporter.js`, find the `if (mode === 'doubleWidth') { ... } else { ... }` block inside the `animation.frames.forEach`. Replace with a three-way branch:

```js
if (mode === 'doubleWidth') {
    code += `${characterName}${animationName}${frameIndex + 1}1\n`;
    for (let i = spriteHeight - 1; i >= 0; i--) {
        const row = frame.grid[i];
        const leftByte = row.slice(0, 8).reduce((acc, cell, index) =>
            acc | (cell !== 0 ? (1 << (7 - index)) : 0), 0);
        code += `  .byte %${leftByte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i} (left)\n`;
    }
    code += '\n';

    code += `${characterName}${animationName}${frameIndex + 1}2\n`;
    for (let i = spriteHeight - 1; i >= 0; i--) {
        const row = frame.grid[i];
        const rightByte = row.slice(8, 16).reduce((acc, cell, index) =>
            acc | (cell !== 0 ? (1 << (7 - index)) : 0), 0);
        code += `  .byte %${rightByte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i} (right)\n`;
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
} else if (mode === 'normal') {
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
} else {
    // doubleColor mode
    code += `${characterName}${animationName}${frameIndex + 1}1\n`;
    for (let i = spriteHeight - 1; i >= 0; i--) {
        const row = frame.grid[i];
        const byte = row.reduce((acc, cell, index) => acc | (cell === 1 ? (1 << (7 - index)) : 0), 0);
        code += `  .byte %${byte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i}\n`;
    }
    code += '\n';

    code += `${characterName}${animationName}${frameIndex + 1}2\n`;
    for (let i = spriteHeight - 1; i >= 0; i--) {
        const row = frame.grid[i];
        const byte = row.reduce((acc, cell, index) => acc | (cell === 2 ? (1 << (7 - index)) : 0), 0);
        code += `  .byte %${byte.toString(2).padStart(8, '0')} ; Row ${spriteHeight - i}\n`;
    }
    code += '\n';

    if (withColor) {
        code += `${characterName}${animationName}Color${frameIndex + 1}1\n`;
        for (let i = spriteHeight - 1; i >= 0; i--) {
            const color = frame.lineColors1[i];
            code += `  .byte ${color} ; Row ${spriteHeight - i}\n`;
        }
        code += '\n';

        code += `${characterName}${animationName}Color${frameIndex + 1}2\n`;
        for (let i = spriteHeight - 1; i >= 0; i--) {
            const color = frame.lineColors2[i];
            code += `  .byte ${color} ; Row ${spriteHeight - i}\n`;
        }
        code += '\n';
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Atari2600CodeExporter.js
git commit -m "feat: export Normal mode assembly code"
```

---

## Task 7: Manual Verification

Run the dev server and exercise every Normal mode path.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

- [ ] **Step 2: Verify Normal mode appears in the mode selector**

Open the Mode dropdown. Confirm three options appear: `Normal (P0 only)`, `Double Color (P0, P1)`, `Double Width (16px)`.

- [ ] **Step 3: Verify cell editing in Normal mode**

Select `Normal (P0 only)`. Click a cell in the grid — it should turn on (color fills). Click it again — it should turn off. No three-state cycling.

- [ ] **Step 4: Verify C1/C2 color controls**

In Normal mode, confirm only the `C1` color column is visible (no `C2`). Switch to `Double Color` — confirm `C2` reappears. Switch back to `Normal` — confirm `C2` disappears again.

- [ ] **Step 5: Verify preview renders correctly**

Draw a few pixels in Normal mode. The preview canvas should show them filled with the `C1` color for each row.

- [ ] **Step 6: Verify doubleColor → normal transition**

Switch to `Double Color`, draw pixels using both color 1 and color 2 (click once for C1, twice for C2). Then switch to `Normal`. Color-2 pixels (value 2) should become color-1 pixels (value 1, still visible). No pixels should disappear.

- [ ] **Step 7: Verify doubleWidth → normal transition**

Switch to `Double Width`, draw pixels on both the left and right halves of the 16px grid. Switch to `Normal`. Only the left 8 pixels of each row should remain; the right half is dropped.

- [ ] **Step 8: Verify normal → doubleColor transition**

In `Normal` mode, draw pixels. Switch to `Double Color`. All drawn pixels should still be visible as color-1 pixels. The grid remains 8px wide.

- [ ] **Step 9: Verify normal → doubleWidth transition**

In `Normal` mode, draw pixels. Switch to `Double Width`. The 16px grid should appear with all existing pixels on the left half; the right 8 columns are blank.

- [ ] **Step 10: Verify ASM export for Normal mode**

In Normal mode with a character name set (e.g. `Mario`), click "Export 6502". Open the downloaded `.asm` file. Confirm:
- Each frame has a single label like `MarioDefault1` (not `MarioDefault11` / `MarioDefault12`)
- Each row is a single `.byte %XXXXXXXX` entry
- If "Export 6502" (with color) was clicked, a `MarioDefaultColor1` block follows with one `.byte` per row

- [ ] **Step 11: Verify save/load round-trip for Normal mode**

In Normal mode, draw some pixels, then click "Save Project". Download the JSON. Reload the page. Click "Load Project" and open the saved file. Confirm the editor reopens in Normal mode with pixels intact.

- [ ] **Step 12: Final commit if any fixes were made during verification**

```bash
git add -p
git commit -m "fix: normal mode verification fixes"
```
