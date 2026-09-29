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
    for (const point of points) {
      const { canvasX, canvasY } = worldToCanvas(point.position.x, point.position.y)

      // 根据类型选择颜色
      let fillColor = '#3498db'
      if (point.type === 'PARK_POSITION') {
        fillColor = '#2ecc71'
      } else if (point.type === 'HALT_POSITION') {
        fillColor = '#3498db'
      }

      this.ctx.fillStyle = fillColor
      this.ctx.strokeStyle = '#2c3e50'
      this.ctx.lineWidth = 2

      this.ctx.beginPath()
      this.ctx.arc(canvasX, canvasY, POINT_RADIUS, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()

      // 绘制点的标签
      this.ctx.fillStyle = '#2c3e50'
      this.ctx.font = '10px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'top'
      this.ctx.fillText(point.name, canvasX, canvasY + POINT_RADIUS + 4)
    }
  }

  drawPaths(
    paths: Path[],
    pointMap: Map<string, Point>,
    worldToCanvas: (x: number, y: number) => { canvasX: number; canvasY: number }
  ) {
    this.ctx.strokeStyle = '#95a5a6'
    this.ctx.lineWidth = 1.5

    // 获取原点位置（用于controlPoints转换）
    const origin = worldToCanvas(0, 0)

    for (const path of paths) {
      const srcPoint = pointMap.get(path.srcPointName)
      const destPoint = pointMap.get(path.destPointName)

      if (!srcPoint || !destPoint) continue

      const start = worldToCanvas(srcPoint.position.x, srcPoint.position.y)
      const end = worldToCanvas(destPoint.position.x, destPoint.position.y)

      const connectionType = (path as any).layout?.connectionType || 'DIRECT'
      
      this.ctx.beginPath()
      this.ctx.moveTo(start.canvasX, start.canvasY)

      if (connectionType === 'BEZIER') {
        const controlPoints = (path as any).layout?.controlPoints || []
        
        if (controlPoints.length >= 2) {
          // controlPoints 已经是相对于原点的像素坐标
          // Y值为负表示向上，为正表示向下
          const cp1X = origin.canvasX + controlPoints[0].x
          const cp1Y = origin.canvasY + controlPoints[0].y  // 直接加（Y值已经正确）
          
          const cp2X = origin.canvasX + controlPoints[1].x
          const cp2Y = origin.canvasY + controlPoints[1].y  // 直接加（Y值已经正确）
          
          this.ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, end.canvasX, end.canvasY)
        } else {
          this.ctx.lineTo(end.canvasX, end.canvasY)
        }
      } else {
        this.ctx.lineTo(end.canvasX, end.canvasY)
      }

      this.ctx.stroke()

      // 绘制方向箭头
      const dx = end.canvasX - start.canvasX
      const dy = end.canvasY - start.canvasY
      const angle = Math.atan2(dy, dx)
      const arrowSize = 8
      const arrowX = end.canvasX - arrowSize * 1.5 * Math.cos(angle)
      const arrowY = end.canvasY - arrowSize * 1.5 * Math.sin(angle)

      this.ctx.fillStyle = '#95a5a6'
      this.ctx.beginPath()
      this.ctx.moveTo(
        arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
      )
      this.ctx.lineTo(arrowX + arrowSize * Math.cos(angle), arrowY + arrowSize * Math.sin(angle))
      this.ctx.lineTo(
        arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
        arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
      )
      this.ctx.closePath()
      this.ctx.fill()
    }
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
      const color = getVehicleColor(vehicle)

      // 绘制外圈光晕
      this.ctx.fillStyle = color
      this.ctx.globalAlpha = 0.2
      this.ctx.beginPath()
      this.ctx.arc(canvasX, canvasY, VEHICLE_SIZE + 5, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.globalAlpha = 1.0

      // 绘制主圆圈
      this.ctx.fillStyle = color
      this.ctx.strokeStyle = '#fff'
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.arc(canvasX, canvasY, VEHICLE_SIZE, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()

      // 绘制车辆标签
      this.ctx.fillStyle = '#fff'
      this.ctx.font = 'bold 9px Arial'
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
    // Y轴翻转：openTCS中Y轴向下为正，但我们需要向上为正
    const canvasY = canvasHeight / 2 - (y - centerY) * scale
    return { canvasX, canvasY }
  }
}
