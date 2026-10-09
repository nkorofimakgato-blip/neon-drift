import type { Car } from './types'
import { CHECKPOINTS } from './checkpoints'

const MAP_SIZE = 140          // size of the minimap square
const MAP_PADDING = 20        // padding from screen edge
const WORLD_SCALE = 0.075     // world units → pixels (adjusts to fit)

export function drawMinimap(
  ctx: CanvasRenderingContext2D,
  car: Car,
  nextCheckpoint: number,
  _screenWidth: number,
  screenHeight: number
) {
  const mapX = MAP_PADDING
  const mapY = screenHeight - MAP_SIZE - MAP_PADDING

  // Background
  ctx.save()
  ctx.globalAlpha = 0.9
  ctx.fillStyle = '#0a0f1a'
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'
  ctx.lineWidth = 1

  ctx.beginPath()
  ctx.roundRect(mapX, mapY, MAP_SIZE, MAP_SIZE, 8)
  ctx.fill()
  ctx.stroke()

  // Clip so nothing draws outside
  ctx.beginPath()
  ctx.roundRect(mapX, mapY, MAP_SIZE, MAP_SIZE, 8)
  ctx.clip()

  const cx = mapX + MAP_SIZE / 2
  const cy = mapY + MAP_SIZE / 2

  // Draw the oval (inner + outer)
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)'
  ctx.lineWidth = 1.5

  ctx.beginPath()
  ctx.ellipse(cx, cy, 800 * WORLD_SCALE, 500 * WORLD_SCALE, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.ellipse(cx, cy, 550 * WORLD_SCALE, 280 * WORLD_SCALE, 0, 0, Math.PI * 2)
  ctx.stroke()

  // Checkpoints as dots
  for (const cp of CHECKPOINTS) {
    const x = cx + cp.pos.x * WORLD_SCALE
    const y = cy + cp.pos.y * WORLD_SCALE

    if (cp.index === 0) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.9)'
    } else if (cp.index === nextCheckpoint) {
      ctx.fillStyle = 'rgba(34, 197, 94, 1)'
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
    }

    ctx.beginPath()
    ctx.arc(x, y, 2.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Car as a small triangle
  const carX = cx + car.pos.x * WORLD_SCALE
  const carY = cy + car.pos.y * WORLD_SCALE

  ctx.translate(carX, carY)
  ctx.rotate(car.angle)

  ctx.fillStyle = '#22d3ee'
  ctx.shadowColor = '#22d3ee'
  ctx.shadowBlur = 8
  ctx.beginPath()
  ctx.moveTo(6, 0)
  ctx.lineTo(-4, -4)
  ctx.lineTo(-4, 4)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}