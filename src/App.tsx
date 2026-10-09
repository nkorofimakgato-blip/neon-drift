import { useEffect, useRef, useState } from 'react'
import type { Car, Input } from './game/types'
import { CAR_WIDTH, CAR_HEIGHT } from './game/constants'
import { updateCar } from './game/physics'
import {
  drawCar,
  drawGrid,
  drawTrack,
  drawCheckpoints,
  drawSkidMarks,
  drawParticles,
} from './game/render'
import { TRACK, START_POSITION } from './game/track'
import { resolveCarCollisions } from './game/collision'

import { CHECKPOINTS } from './game/checkpoints'
import {
  createLapState,
  updateLapState,
  formatTime,
  type LapState,
} from './game/lapState'
import { EffectSystem } from './game/effects'
import { drawMinimap } from './game/minimap'

type GamePhase = 'start' | 'countdown' | 'racing'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const carRef = useRef<Car>({
    pos: { x: START_POSITION.x, y: START_POSITION.y },
    vel: { x: 0, y: 0 },
    angle: 0,
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
  const effectsRef = useRef<EffectSystem>(new EffectSystem())
  const phaseRef = useRef<GamePhase>('start')
  const countdownStartRef = useRef<number>(0)

  const [phase, setPhase] = useState<GamePhase>('start')
  const [countdown, setCountdown] = useState<number | null>(null)

  const [hud, setHud] = useState({
    lap: 1,
    currentLapMs: 0,
    bestLapMs: null as number | null,
    flashMessage: '',
    speed: 0,
    drift: false,
  })

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  function startRace() {
    carRef.current.pos = { x: START_POSITION.x, y: START_POSITION.y }
    carRef.current.vel = { x: 0, y: 0 }
    carRef.current.angle = 0
    lapStateRef.current = createLapState(performance.now())
    effectsRef.current = new EffectSystem()
    countdownStartRef.current = performance.now()

    setPhase('countdown')
    setCountdown(3)
  }

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
      if (phaseRef.current !== 'racing') return

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
      const effects = effectsRef.current
      const currentPhase = phaseRef.current

      if (currentPhase === 'countdown') {
        const elapsed = now - countdownStartRef.current
        const remaining = 3 - Math.floor(elapsed / 1000)
        if (remaining <= 0) {
          setPhase('racing')
          setCountdown(null)
          lapStateRef.current = createLapState(now)
        } else {
          setCountdown(remaining)
        }
      }

      if (currentPhase === 'racing') {
        const prevVel = { x: car.vel.x, y: car.vel.y }
        updateCar(car, input, dt)

        const prevSpeed = Math.hypot(prevVel.x, prevVel.y)
        resolveCarCollisions(car, TRACK)
        const postSpeed = Math.hypot(car.vel.x, car.vel.y)

        if (prevSpeed > 80 && postSpeed < prevSpeed * 0.85) {
          effects.spawnParticles(
            { x: car.pos.x, y: car.pos.y },
            12,
            'rgba(251, 191, 36, ALPHA)',
            220
          )
        }

        const speed = Math.hypot(car.vel.x, car.vel.y)
        const drifting =
          speed > 200 && (input.left || input.right) && (input.up || input.down)

        effects.updateSkids(car.pos, car.angle, speed, drifting, dt)
        updateLapState(lapState, car.pos, now)

        hudTickAccumulator += dt
        if (hudTickAccumulator > 0.1) {
          hudTickAccumulator = 0
          const currentLapMs = now - lapState.lapStartTime
          const showFlash =
            lapState.lastLapDuration !== null &&
            now - lapState.lastLapShownAt < 1800

          setHud({
            lap: lapState.lap,
            currentLapMs,
            bestLapMs: lapState.bestLap,
            flashMessage:
              showFlash && lapState.lastLapDuration
                ? `Lap complete — ${formatTime(lapState.lastLapDuration)}`
                : '',
            speed: Math.round(speed * 0.4),
            drift: drifting,
          })
        }
      }

      effects.update(dt)

      ctx.fillStyle = '#05060a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cameraX = car.pos.x - canvas.width / 2
      const cameraY = car.pos.y - canvas.height / 2

      drawGrid(ctx, cameraX, cameraY, canvas.width, canvas.height)
      drawTrack(ctx, TRACK, cameraX, cameraY)
      drawCheckpoints(ctx, CHECKPOINTS, lapState.nextCheckpoint, cameraX, cameraY)
      drawSkidMarks(ctx, effects.skidMarks, cameraX, cameraY)
      drawParticles(ctx, effects.particles, cameraX, cameraY)
      drawCar(ctx, car, cameraX, cameraY)

      if (currentPhase === 'racing') {
        drawMinimap(ctx, car, lapState.nextCheckpoint, canvas.width, canvas.height)
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
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* --- START BUTTON (floats over the game) --- */}
      {phase === 'start' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <button
            onClick={startRace}
            className="pointer-events-auto bg-cyan-400 hover:bg-cyan-300 text-black font-black text-3xl px-16 py-8 rounded-3xl transition-all hover:scale-105 shadow-2xl shadow-cyan-400/60 border-4 border-cyan-200/40"
          >
            ▶ START RACE
          </button>
        </div>
      )}

      {/* --- COUNTDOWN --- */}
      {phase === 'countdown' && countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div
            key={countdown}
            className="text-[180px] font-black text-cyan-400 leading-none drop-shadow-[0_0_60px_rgba(34,211,238,0.8)]"
            style={{ animation: 'countPulse 1s ease-out' }}
          >
            {countdown}
          </div>
        </div>
      )}

      {/* HUD — only when racing */}
      {phase === 'racing' && (
        <>
          <div className="absolute top-6 left-6 pointer-events-none">
            <h1 className="text-2xl font-black text-cyan-400 tracking-tight">
              Neon Drift
            </h1>
          </div>

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

          <div className="absolute bottom-6 right-6 text-right pointer-events-none">
            <p className="text-xs uppercase tracking-widest text-gray-500">
              Speed
            </p>
            <p className="text-4xl font-black text-white leading-none">
              {hud.speed}
            </p>
            <p className="text-xs text-gray-500">km/h</p>

            {hud.drift && (
              <p className="text-xs font-bold text-amber-400 mt-2 animate-pulse">
                DRIFTING
              </p>
            )}
          </div>

          {hud.flashMessage && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-emerald-500/20 backdrop-blur border border-emerald-400/40 text-emerald-300 font-bold text-lg px-8 py-4 rounded-2xl">
                {hud.flashMessage}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}