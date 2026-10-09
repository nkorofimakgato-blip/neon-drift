import type { Vec2 } from './types'

export interface Checkpoint {
  /** Center of the gate */
  pos: Vec2
  /** Radius the car must be within to count as passing through */
  radius: number
  /** Which number is it? (0-based). 0 = finish line */
  index: number
}

/**
 * Checkpoints placed around the oval, in driving order (counter-clockwise).
 * The finish (index 0) is at the START_POSITION's x, at y = 390.
 * Following gates are placed around the track.
 */
export const CHECKPOINTS: Checkpoint[] = [
  { pos: { x: 0,    y: 390 }, radius: 90, index: 0 }, // finish/start line (bottom of oval)
  { pos: { x: 400,  y: 300 }, radius: 90, index: 1 }, // bottom-right area
  { pos: { x: 675,  y: 0 },   radius: 90, index: 2 }, // right side
  { pos: { x: 400,  y: -300 }, radius: 90, index: 3 }, // top-right area
  { pos: { x: 0,    y: -390 }, radius: 90, index: 4 }, // top of oval
  { pos: { x: -400, y: -300 }, radius: 90, index: 5 }, // top-left
  { pos: { x: -675, y: 0 },   radius: 90, index: 6 }, // left side
  { pos: { x: -400, y: 300 }, radius: 90, index: 7 }, // bottom-left
]

export const TOTAL_CHECKPOINTS = CHECKPOINTS.length