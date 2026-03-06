# Atari 2600 Sprite Animation Editor

A browser-based tool for creating and editing character sprite animations for Atari 2600 games.

## Features

- **Two sprite modes:**
  - Double Color — 8-wide grid with three states per pixel (off, color 1, color 2)
  - Double Width — 16-wide grid with two states per pixel (off, on)
- **Adjustable sprite height** — resize the grid rows to suit your sprite
- **Multiple animations** — create and manage named animation sets
- **Frame editing** — add, delete, copy, paste, and navigate frames
- **Per-row color assignment** — set Atari 2600 palette colors per scanline
- **Horizontal flip** — mirror the current frame
- **Animated preview** — play back animations at adjustable speed
- **Atari 2600 code export** — generate assembly-ready sprite data
- **Save/load projects** — JSON project files for round-trip editing

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS v3
- Radix UI primitives
- shadcn/ui components
