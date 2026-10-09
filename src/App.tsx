import { useEffect, useRef, useState } from 'react'
import type { Car, Input } from './game/types'
import { CAR_WIDTH, CAR_HEIGHT } from './game/constants'
import { updateCar } from './game/physics'
import { drawCar, drawGrid, drawTrack, drawCheckpoints } from './game/render'
import { TRACK, START_POSITION } from './game/track'
import { resolveCarCollisions } from './game/collision'
import { CHECKPOINTS, TOTAL_CHECKPOINTS } from './game/checkpoints'
import {
  createLapState,
  updateLapState,
  formatTime,
  type LapState,
} from './game/lapState'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const carRef = useRef<Car>({
    pos: { x: START_POSITION.x, y: START_POSITION.y },
    vel: { x: 0, y: 0 },
        angle: 0, // right
    angularVel: 0,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
  })
  const inputRef = useRef<Input>({
    up: false,
    down: false,
    left: false,
    right: false,
  })
  const lapStateRef = useRef<LapState>(createLapState(performance.now()))

  // UI state (only updated when values actually change, to avoid re-renders)
  const [hud, setHud] = useState({
    lap: 1,
    currentLapMs: 0,
    bestLapMs: null as number | null,
    flashMessage: '' as string,
  })

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function onKeyDown(e: KeyboardEvent) {
      const inp = inputRef.current
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inp.up = true
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inp.down = true
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inp.left = true
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inp.right = true
    }

    function onKeyUp(e: KeyboardEvent) {
      const inp = inputRef.current
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') inp.up = false
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') inp.down = false
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') inp.left = false
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') inp.right = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    let raf = 0
    let lastTime = performance.now()
    let hudTickAccumulator = 0

    function loop(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.033)
      lastTime = now

      const car = carRef.current
      const input = inputRef.current
      const lapState = lapStateRef.current

      updateCar(car, input, dt)
      resolveCarCollisions(car, TRACK)

      const completed = updateLapState(lapState, car.pos, now)

      // Clear
      ctx.fillStyle = '#05060a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cameraX = car.pos.x - canvas.width / 2
      const cameraY = car.pos.y - canvas.height / 2

      drawGrid(ctx, cameraX, cameraY, canvas.width, canvas.height)
      drawTrack(ctx, TRACK, cameraX, cameraY)
      drawCheckpoints(ctx, CHECKPOINTS, lapState.nextCheckpoint, cameraX, cameraY)
      drawCar(ctx, car, cameraX, cameraY)

      // Update HUD ~10 times per second
      hudTickAccumulator += dt
      if (hudTickAccumulator > 0.1 || completed) {
        hudTickAccumulator = 0
        const currentLapMs = now - lapState.lapStartTime
        const flashMs = lapState.lastLapShownAt
        const showFlash = completed || (now - flashMs < 1800 && lapState.lastLapDuration)
        setHud({
          lap: lapState.lap,
          currentLapMs,
          bestLapMs: lapState.bestLap,
          flashMessage:
            showFlash && lapState.lastLapDuration
              ? `Lap complete — ${formatTime(lapState.lastLapDuration)}`
              : '',
        })
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <div className="relative w-screen h-screen">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Top-left: title */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <h1 className="text-2xl font-black text-cyan-400 tracking-tight">
          Neon Drift
        </h1>
        <p className="text-xs text-gray-500 mt-1">Arrow keys or WASD to drive</p>
      </div>

      {/* Top-right: lap HUD */}
      <div className="absolute top-6 right-6 text-right pointer-events-none">
        <p className="text-xs uppercase tracking-widest text-gray-500">
          Lap
        </p>
        <p className="text-3xl font-black text-white leading-none mb-3">
          {hud.lap}
        </p>

        <p className="text-xs uppercase tracking-widest text-gray-500">
          Current
        </p>
        <p className="text-xl font-bold text-cyan-400 leading-none mb-3">
          {formatTime(hud.currentLapMs)}
        </p>

        {hud.bestLapMs !== null && (
          <>
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Best
            </p>
            <p className="text-xl font-bold text-amber-400 leading-none">
              {formatTime(hud.bestLapMs)}
            </p>
          </>
        )}
      </div>

      {/* Center flash on lap complete */}
      {hud.flashMessage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-emerald-500/20 backdrop-blur border border-emerald-400/40 text-emerald-300 font-bold text-lg px-8 py-4 rounded-2xl">
            {hud.flashMessage}
          </div>
        </div>
      )}
    </div>
  )
}