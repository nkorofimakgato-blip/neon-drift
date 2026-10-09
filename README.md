# Neon Drift

A top-down arcade racing game built with React, TypeScript, and HTML5 Canvas. No game engine — just pure canvas and custom physics.

**Play now:** https://neon-drift-xxx.vercel.app

## Features

- 🏎️ **Custom car physics** — acceleration, momentum, lateral grip, and drifting
-  **Neon track** with collision detection
-  **Lap system** — 8 checkpoints in sequence, lap timer, best-lap tracking
-  **Live minimap** showing your position and next checkpoint
-  **Skid marks** that fade behind the car when you drift
-  **Particle effects** — sparks fly on hard wall hits
-  **Speedometer + drift indicator** in the HUD
-  **Start screen + 3-2-1 countdown**

## Controls

| Key | Action |
|---|---|
| ↑ / W | Accelerate |
| ↓ / S | Brake / Reverse |
| ← → / A D | Steer |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS v4** for UI
- **HTML5 Canvas** for rendering
- **Custom physics** — no game engine

## Getting Started

```bash
npm install
npm run dev