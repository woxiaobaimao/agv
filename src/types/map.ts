export interface Position {
  x: number
  y: number
  z?: number
}

export interface Point {
  name: string
  position: Position
  type: string
  vehicleOrientationAngle?: string | number
  layout?: any
  vehicleEnvelopes?: any[]
  maxVehicleBoundingBox?: any
  properties?: Array<{ name: string; value: string }>
}

export interface Path {
  name: string
  srcPointName: string
  destPointName: string
  length?: number
  maxVelocity?: number
  maxReverseVelocity?: number
}

export interface Vehicle {
  name: string
  currentPosition: string
  state: string
  energyLevel?: number
  length?: number
  boundingBox?: any
  layout?: { routeColor?: string }
}

export interface PlantModel {
  name: string
  points: Point[]
  paths: Path[]
  vehicles: Vehicle[]
  visualLayout?: {
    scaleX: number
    scaleY: number
  }
}

export interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}
