import type { Car } from './types'
import type { Wall } from './track'
import type { Checkpoint } from './checkpoints'
import type { SkidMark, Particle } from './effects'
import { CAR_WIDTH, CAR_HEIGHT } from './constants'

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  width: number,
  height: number
) {
  const gridSize = 80
  const offsetX = -cameraX % gridSize
  const offsetY = -cameraY % gridSize

  ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)'
  ctx.lineWidth = 1

  ctx.beginPath()
  for (let x = offsetX; x < width; x += gridSize) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  for (let y = offsetY; y < height; y += gridSize) {
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()
}

export function drawCar(
  ctx: CanvasRenderingContext2D,
  car: Car,
  cameraX: number,
  cameraY: number
) {
  const screenX = car.pos.x - cameraX
  const screenY = car.pos.y - cameraY

  const length = CAR_HEIGHT
  const width = CAR_WIDTH

  ctx.save()
  ctx.translate(screenX, screenY)
  ctx.rotate(car.angle)

  // Glow
  ctx.shadowColor = '#22d3ee'
  ctx.shadowBlur = 24

  // Body
  ctx.fillStyle = '#22d3ee'
  ctx.beginPath()
  ctx.roundRect(-length / 2, -width / 2, length, width, 5)
  ctx.fill()
  ctx.shadowBlur = 0

  // Front amber triangle
  ctx.fillStyle = '#fbbf24'
  ctx.beginPath()
  ctx.moveTo(length / 2, 0)
  ctx.lineTo(length / 2 - 8, -width / 2 + 4)
  ctx.lineTo(length / 2 - 8, width / 2 - 4)
  ctx.closePath()
  ctx.fill()

  // Windshield
  ctx.fillStyle = '#0a0f1a'
  ctx.beginPath()
  ctx.roundRect(length / 2 - 16, -width / 2 + 3, 7, width - 6, 2)
  ctx.fill()

  // Rear window
  ctx.beginPath()
  ctx.roundRect(-length / 2 + 4, -width / 2 + 4, 6, width - 8, 2)
  ctx.fill()

  ctx.restore()
}

export function drawTrack(
  ctx: CanvasRenderingContext2D,
  walls: Wall[],
  cameraX: number,
  cameraY: number
) {
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)'
  ctx.lineWidth = 10
  ctx.lineCap = 'round'
  ctx.shadowColor = '#22d3ee'
  ctx.shadowBlur = 20

  ctx.beginPath()
  for (const wall of walls) {
    ctx.moveTo(wall.a.x - cameraX, wall.a.y - cameraY)
    ctx.lineTo(wall.b.x - cameraX, wall.b.y - cameraY)
  }
  ctx.stroke()

  ctx.strokeStyle = '#a5f3fc'
  ctx.lineWidth = 3
  ctx.shadowBlur = 0

  ctx.beginPath()
  for (const wall of walls) {
    ctx.moveTo(wall.a.x - cameraX, wall.a.y - cameraY)
    ctx.lineTo(wall.b.x - cameraX, wall.b.y - cameraY)
  }
  ctx.stroke()
}

export function drawCheckpoints(
  ctx: CanvasRenderingContext2D,
  checkpoints: Checkpoint[],
  nextIndex: number,
  cameraX: number,
  cameraY: number
) {
  for (const cp of checkpoints) {
    const x = cp.pos.x - cameraX
    const y = cp.pos.y - cameraY

    let color = 'rgba(148, 163, 184, 0.3)'
    if (cp.index === 0) {
      color = 'rgba(251, 191, 36, 0.5)'
    }
    if (cp.index === nextIndex) {
      color = 'rgba(34, 197, 94, 0.9)'
    }

    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 24, 0, Math.PI * 2)
    ctx.stroke()
  }
}

export function drawSkidMarks(
  ctx: CanvasRenderingContext2D,
  marks: SkidMark[],
  cameraX: number,
  cameraY: number
) {
  ctx.lineCap = 'round'
  for (const mark of marks) {
    const alpha = 1 - mark.age / mark.lifetime
    const x = mark.pos.x - cameraX
    const y = mark.pos.y - cameraY

    ctx.strokeStyle = `rgba(120, 240, 255, ${alpha * 0.35})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x, y)

    const dx = Math.cos(mark.angle) * 4
    const dy = Math.sin(mark.angle) * 4
    ctx.lineTo(x - dx, y - dy)
    ctx.stroke()
  }
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  cameraX: number,
  cameraY: number
) {
  for (const p of particles) {
    const alpha = 1 - p.age / p.lifetime
    const x = p.pos.x - cameraX
    const y = p.pos.y - cameraY

    ctx.fillStyle = p.color.replace('ALPHA', String(alpha))
    ctx.beginPath()
    ctx.arc(x, y, p.size * alpha, 0, Math.PI * 2)
    ctx.fill()
  }
}