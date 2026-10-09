import type { Car, Input } from './types'
import {
  ACCELERATION,
  REVERSE_ACCEL,
  MAX_SPEED,
  FRICTION,
  TURN_SPEED,
  TURN_SPEED_MIN,
} from './constants'

const LATERAL_GRIP = 8.0

export function updateCar(car: Car, input: Input, dt: number) {
  // Acceleration (forward/backward along the car's heading)
  if (input.up) {
    car.vel.x += Math.cos(car.angle) * ACCELERATION * dt
    car.vel.y += Math.sin(car.angle) * ACCELERATION * dt
  }
  if (input.down) {
    car.vel.x -= Math.cos(car.angle) * REVERSE_ACCEL * dt
    car.vel.y -= Math.sin(car.angle) * REVERSE_ACCEL * dt
  }

  // Steering
  const speed = Math.hypot(car.vel.x, car.vel.y)
  const speedRatio = Math.min(speed / MAX_SPEED, 1)
  const turnRate = TURN_SPEED_MIN + (TURN_SPEED - TURN_SPEED_MIN) * speedRatio

  if (input.left) car.angle -= turnRate * dt * Math.sign(speed || 1)
  if (input.right) car.angle += turnRate * dt * Math.sign(speed || 1)

  // Decompose velocity into forward + sideways
  const fx = Math.cos(car.angle)
  const fy = Math.sin(car.angle)
  const rx = -fy
  const ry = fx

  let vFwd = car.vel.x * fx + car.vel.y * fy
  let vSide = car.vel.x * rx + car.vel.y * ry

  // Scrub off sideways velocity (grip)
  vSide *= Math.exp(-LATERAL_GRIP * dt)

  // Speed limits
  if (vFwd > MAX_SPEED) vFwd = MAX_SPEED
  if (vFwd < -MAX_SPEED * 0.5) vFwd = -MAX_SPEED * 0.5

  // Recompose
  car.vel.x = fx * vFwd + rx * vSide
  car.vel.y = fy * vFwd + ry * vSide

  // Friction
  car.vel.x *= FRICTION
  car.vel.y *= FRICTION

  if (Math.abs(car.vel.x) < 0.5) car.vel.x = 0
  if (Math.abs(car.vel.y) < 0.5) car.vel.y = 0

  // Move
  car.pos.x += car.vel.x * dt
  car.pos.y += car.vel.y * dt
}