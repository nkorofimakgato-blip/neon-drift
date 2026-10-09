import type { Car } from './types'
import type { Wall } from './track'
import type { Checkpoint } from './checkpoints'
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

  // Car points RIGHT by default (canvas rotation 0 = right).
  // Long axis is horizontal (CAR_HEIGHT), short axis is vertical (CAR_WIDTH).
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

  // Front indicator (amber triangle at RIGHT edge)
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
  // Outer glow pass
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

  // Inner crisp pass
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

    let color = 'rgba(148, 163, 184, 0.3)' // dim gray (already passed)
    if (cp.index === 0) {
      color = 'rgba(251, 191, 36, 0.5)' // amber — finish line
    }
    if (cp.index === nextIndex) {
      color = 'rgba(34, 197, 94, 0.9)' // green — next target
    }

    // Filled dot
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.fill()

    // Outer ring
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, 24, 0, Math.PI * 2)
    ctx.stroke()
  }
}