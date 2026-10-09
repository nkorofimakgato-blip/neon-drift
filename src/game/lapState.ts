import type { Vec2 } from './types'
import { CHECKPOINTS, TOTAL_CHECKPOINTS } from './checkpoints'

export interface LapState {
  /** Which checkpoint we're waiting for next (0 = finish line) */
  nextCheckpoint: number
  /** Lap count (starts at 1) */
  lap: number
  /** Time when current lap started (ms since epoch) */
  lapStartTime: number
  /** Best lap time in ms, or null */
  bestLap: number | null
  /** Flag so we don't spam lap-complete message */
  justCompletedLap: boolean
  /** Time of last lap completion, for HUD flash */
  lastLapDuration: number | null
  lastLapShownAt: number
}

export function createLapState(now: number): LapState {
  return {
    nextCheckpoint: 0,
    lap: 1,
    lapStartTime: now,
    bestLap: null,
    justCompletedLap: false,
    lastLapDuration: null,
    lastLapShownAt: 0,
  }
}

/**
 * Call every frame with the car's position.
 * Returns true if a lap was just completed this frame.
 */
export function updateLapState(
  state: LapState,
  carPos: Vec2,
  now: number
): boolean {
  const target = CHECKPOINTS[state.nextCheckpoint]
  const dx = carPos.x - target.pos.x
  const dy = carPos.y - target.pos.y
  const dist = Math.hypot(dx, dy)

  if (dist > target.radius) return false

  // Passed a gate
  if (state.nextCheckpoint === 0 && state.lap > 1) {
    // We just passed the finish — but only if we've come all the way around
    // (i.e., we were on a later checkpoint and now we're back to 0)
  }

  if (state.nextCheckpoint === 0) {
    // Crossing the finish line only counts as a full lap if we've just
    // passed the last checkpoint (which means nextCheckpoint wrapped from TOTAL-1)
    // The way we track this: nextCheckpoint is 0 only at the very start OR
    // after passing all other checkpoints.
    // Simple rule: passing checkpoint 0 advances to 1; a lap only completes
    // when we go from checkpoint TOTAL-1 back to 0.
  }

  // Advance to next checkpoint
  const previous = state.nextCheckpoint
  state.nextCheckpoint = (state.nextCheckpoint + 1) % TOTAL_CHECKPOINTS

  // Was this a lap completion? (we just went from the last cp back to 0)
  if (previous === TOTAL_CHECKPOINTS - 1 && state.nextCheckpoint === 0) {
    const duration = now - state.lapStartTime
    state.lastLapDuration = duration
    state.lastLapShownAt = now
    state.lap += 1
    state.lapStartTime = now
    if (state.bestLap === null || duration < state.bestLap) {
      state.bestLap = duration
    }
    return true
  }

  return false
}

export function formatTime(ms: number): string {
  const totalSec = ms / 1000
  const minutes = Math.floor(totalSec / 60)
  const seconds = (totalSec % 60).toFixed(2)
  return minutes > 0
    ? `${minutes}:${seconds.padStart(5, '0')}`
    : `${seconds}s`
}