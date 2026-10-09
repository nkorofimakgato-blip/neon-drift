import type { Vec2 } from './types'

export interface Wall {
  a: Vec2
  b: Vec2
}

export const TRACK: Wall[] = (() => {
  const walls: Wall[] = []
  const cx = 0
  const cy = 0
  const outerRx = 800
  const outerRy = 500
  const innerRx = 550
  const innerRy = 280
  const segments = 48

  function oval(rx: number, ry: number, outward: boolean) {
    const points: Vec2[] = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2
      points.push({
        x: cx + Math.cos(t) * rx,
        y: cy + Math.sin(t) * ry,
      })
    }

    for (let i = 0; i < segments; i++) {
      const a = points[i]
      const b = points[i + 1]
      if (outward) {
        walls.push({ a, b })
      } else {
        walls.push({ a: b, b: a })
      }
    }
  }

  oval(outerRx, outerRy, true)
  oval(innerRx, innerRy, false)

  return walls
})()

export const START_POSITION: Vec2 = { x: 0, y: 390 }