import type { Point, Path, Vehicle, Bounds } from '@/types/map'

const POINT_RADIUS = 8
const VEHICLE_SIZE = 15
const PADDING = 100

export class MapRenderer {
  private ctx: CanvasRenderingContext2D
  private width: number
  private height: number

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx
    this.width = width
    this.height = height
  }

  clear(color = '#ecf0f1') {
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, this.width, this.height)
    this.ctx.strokeStyle = '#95a5a6'
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(0, 0, this.width, this.height)
  }

  drawPoints(points: Point[], worldToCanvas: (x: number, y: number) => { canvasX: number; canvasY: number }) {
    this.ctx.fillStyle = '#3498db'
    this.ctx.strokeStyle = '#2c3e50'
    this.ctx.lineWidth = 2

    for (const point of points) {
      const { canvasX, canvasY } = worldToCanvas(point.position.x, point.position.y)

      this.ctx.beginPath()
      this.ctx.arc(canvasX, canvasY, POINT_RADIUS, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()

      this.ctx.fillStyle = '#2c3e50'
      this.ctx.font = '11px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'top'
      this.ctx.fillText(point.name, canvasX, canvasY + POINT_RADIUS + 3)
      this.ctx.fillStyle = '#3498db'
    }
  }

  drawPaths(
    paths: Path[],
    pointMap: Map<string, Point>,
    worldToCanvas: (x: number, y: number) => { canvasX: number; canvasY: number }
  ) {
    this.ctx.strokeStyle = '#bdc3c7'
    this.ctx.lineWidth = 2

    for (const path of paths) {
      const srcPoint = pointMap.get(path.srcPointName)
      const destPoint = pointMap.get(path.destPointName)

      if (!srcPoint || !destPoint) continue

      const start = worldToCanvas(srcPoint.position.x, srcPoint.position.y)
      const end = worldToCanvas(destPoint.position.x, destPoint.position.y)

      this.ctx.beginPath()
      this.ctx.moveTo(start.canvasX, start.canvasY)
      this.ctx.lineTo(end.canvasX, end.canvasY)
      this.ctx.stroke()

      this.drawArrow(start.canvasX, start.canvasY, end.canvasX, end.canvasY)
    }
  }

  private drawArrow(fromX: number, fromY: number, toX: number, toY: number) {
    const headlen = 10
    const angle = Math.atan2(toY - fromY, toX - fromX)

    this.ctx.beginPath()
    this.ctx.moveTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6))
    this.ctx.lineTo(toX, toY)
    this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6))
    this.ctx.stroke()
  }

  drawVehicles(
    vehicles: Vehicle[],
    pointMap: Map<string, Point>,
    worldToCanvas: (x: number, y: number) => { canvasX: number; canvasY: number },
    getVehicleColor: (vehicle: Vehicle) => string
  ) {
    for (const vehicle of vehicles) {
      const point = pointMap.get(vehicle.currentPosition)
      if (!point) continue

      const { canvasX, canvasY } = worldToCanvas(point.position.x, point.position.y)

      this.ctx.fillStyle = getVehicleColor(vehicle)
      this.ctx.strokeStyle = '#2c3e50'
      this.ctx.lineWidth = 2

      this.ctx.beginPath()
      this.ctx.arc(canvasX, canvasY, VEHICLE_SIZE, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()

      this.ctx.fillStyle = '#fff'
      this.ctx.font = 'bold 10px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      const label = vehicle.name.replace('Vehicle-', 'V')
      this.ctx.fillText(label, canvasX, canvasY)
    }
  }

  drawGrid(spacing: number = 100, color = '#f0f0f0') {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = 1

    for (let x = 0; x < this.width; x += spacing) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.height)
      this.ctx.stroke()
    }

    for (let y = 0; y < this.height; y += spacing) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.width, y)
      this.ctx.stroke()
    }
  }
}

export function calculateBounds(points: Point[]): Bounds {
  if (points.length === 0) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 }
  }

  let minX = points[0].position.x
  let maxX = points[0].position.x
  let minY = points[0].position.y
  let maxY = points[0].position.y

  for (const point of points) {
    minX = Math.min(minX, point.position.x)
    maxX = Math.max(maxX, point.position.x)
    minY = Math.min(minY, point.position.y)
    maxY = Math.max(maxY, point.position.y)
  }

  return { minX, maxX, minY, maxY }
}

export function createWorldToCanvasTransform(
  bounds: Bounds,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = PADDING
) {
  const rangeX = bounds.maxX - bounds.minX
  const rangeY = bounds.maxY - bounds.minY

  const availableWidth = canvasWidth - padding * 2
  const availableHeight = canvasHeight - padding * 2

  const scaleX = rangeX > 0 ? availableWidth / rangeX : 1
  const scaleY = rangeY > 0 ? availableHeight / rangeY : 1
  const scale = Math.min(scaleX, scaleY)

  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2

  return (x: number, y: number) => {
    const canvasX = canvasWidth / 2 + (x - centerX) * scale
    const canvasY = canvasHeight / 2 + (y - centerY) * scale
    return { canvasX, canvasY }
  }
}
