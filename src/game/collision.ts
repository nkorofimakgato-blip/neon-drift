import type { Car, Vec2 } from './types'
import type { Wall } from './track'

const RESTITUTION = 0.5
const COLLISION_DAMP = 0.7

function pointToSegment(p: Vec2, a: Vec2, b: Vec2) {
  const abx = b.x - a.x
  const aby = b.y - a.y
  const apx = p.x - a.x
  const apy = p.y - a.y

  const abLenSq = abx * abx + aby * aby
  let t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq
  t = Math.max(0, Math.min(1, t))

  const closest = { x: a.x + abx * t, y: a.y + aby * t }
  const dx = p.x - closest.x
  const dy = p.y - closest.y
  return { dist: Math.hypot(dx, dy), closest, dx, dy }
}

export function resolveCarCollisions(car: Car, walls: Wall[]) {
  const radius = Math.min(car.width, car.height) * 0.45

  for (const wall of walls) {
    const { dist, dx, dy } = pointToSegment(car.pos, wall.a, wall.b)

    if (dist < radius && dist > 0.001) {
      const nx = dx / dist
      const ny = dy / dist

      const overlap = radius - dist
      car.pos.x += nx * overlap
      car.pos.y += ny * overlap

      const vDotN = car.vel.x * nx + car.vel.y * ny
      if (vDotN < 0) {
        car.vel.x = (car.vel.x - (1 + RESTITUTION) * vDotN * nx) * COLLISION_DAMP
        car.vel.y = (car.vel.y - (1 + RESTITUTION) * vDotN * ny) * COLLISION_DAMP
      }
    }
  }
}