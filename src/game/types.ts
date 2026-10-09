export interface Vec2 {
  x: number
  y: number
}

export interface Car {
  pos: Vec2
  vel: Vec2
  angle: number
  angularVel: number
  width: number
  height: number
}

export interface Input {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}