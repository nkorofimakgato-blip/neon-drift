import type { Vec2 } from './types'

export interface SkidMark {
  pos: Vec2
  angle: number
  age: number       // seconds
  lifetime: number  // seconds
}

export interface Particle {
  pos: Vec2
  vel: Vec2
  age: number
  lifetime: number
  color: string
  size: number
}

export class EffectSystem {
  skidMarks: SkidMark[] = []
  particles: Particle[] = []
  private skidTimer = 0

  /** Called each frame. Spawns skid marks when car is drifting. */
  updateSkids(
    carPos: Vec2,
    carAngle: number,
    speed: number,
    isDrifting: boolean,
    dt: number
  ) {
    if (isDrifting && speed > 80) {
      this.skidTimer += dt
      // Spawn a mark every ~30ms while drifting
      if (this.skidTimer > 0.03) {
        this.skidTimer = 0
        this.skidMarks.push({
          pos: { x: carPos.x, y: carPos.y },
          angle: carAngle,
          age: 0,
          lifetime: 4, // fade over 4 seconds
        })
        // Cap total marks so we don't accumulate forever
        if (this.skidMarks.length > 400) this.skidMarks.shift()
      }
    } else {
      this.skidTimer = 0
    }
  }

  /** Spawn a burst of particles (e.g. wall hit). */
  spawnParticles(pos: Vec2, count: number, color: string, baseSpeed: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = baseSpeed * (0.5 + Math.random())
      this.particles.push({
        pos: { x: pos.x, y: pos.y },
        vel: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        age: 0,
        lifetime: 0.6 + Math.random() * 0.4,
        color,
        size: 2 + Math.random() * 3,
      })
    }
  }

  /** Update all effects. Returns nothing — just ages everything. */
  update(dt: number) {
    // Age skid marks
    for (const mark of this.skidMarks) {
      mark.age += dt
    }
    // Remove expired
    this.skidMarks = this.skidMarks.filter((m) => m.age < m.lifetime)

    // Age particles
    for (const p of this.particles) {
      p.age += dt
      p.pos.x += p.vel.x * dt
      p.pos.y += p.vel.y * dt
      // Friction slows particles
      p.vel.x *= 0.94
      p.vel.y *= 0.94
    }
    this.particles = this.particles.filter((p) => p.age < p.lifetime)
  }
}