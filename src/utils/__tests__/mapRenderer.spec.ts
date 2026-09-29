import { describe, it, expect } from 'vitest'
import { calculateBounds, createWorldToCanvasTransform } from '@/utils/mapRenderer'
import type { Point, Bounds } from '@/types/map'

describe('mapRenderer utilities', () => {
  describe('calculateBounds', () => {
    it('应该正确计算空数组的边界', () => {
      const bounds = calculateBounds([])
      expect(bounds).toEqual({ minX: 0, maxX: 100, minY: 0, maxY: 100 })
    })

    it('应该正确计算单个点的边界', () => {
      const points: Point[] = [
        {
          name: 'Point-1',
          position: { x: 50, y: 50 },
          type: 'HALT_POSITION'
        }
      ]
      const bounds = calculateBounds(points)
      expect(bounds).toEqual({ minX: 50, maxX: 50, minY: 50, maxY: 50 })
    })

    it('应该正确计算多个点的边界', () => {
      const points: Point[] = [
        { name: 'Point-1', position: { x: 0, y: 0 }, type: 'HALT_POSITION' },
        { name: 'Point-2', position: { x: 100, y: 100 }, type: 'HALT_POSITION' },
        { name: 'Point-3', position: { x: 50, y: 50 }, type: 'PARK_POSITION' }
      ]
      const bounds = calculateBounds(points)
      expect(bounds).toEqual({ minX: 0, maxX: 100, minY: 0, maxY: 100 })
    })

    it('应该正确处理负数坐标', () => {
      const points: Point[] = [
        { name: 'Point-1', position: { x: -50, y: -50 }, type: 'HALT_POSITION' },
        { name: 'Point-2', position: { x: 50, y: 50 }, type: 'HALT_POSITION' }
      ]
      const bounds = calculateBounds(points)
      expect(bounds).toEqual({ minX: -50, maxX: 50, minY: -50, maxY: 50 })
    })
  })

  describe('createWorldToCanvasTransform', () => {
    it('应该返回一个函数', () => {
      const bounds: Bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 }
      const transform = createWorldToCanvasTransform(bounds, 800, 600)
      expect(typeof transform).toBe('function')
    })

    it('应该正确转换中心点', () => {
      const bounds: Bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 }
      const transform = createWorldToCanvasTransform(bounds, 800, 600, 100)

      const center = transform(50, 50)
      expect(center.canvasX).toBeCloseTo(400, 0)
      expect(center.canvasY).toBeCloseTo(300, 0)
    })

    it('应该正确处理不同的宽高比', () => {
      const bounds: Bounds = { minX: 0, maxX: 200, minY: 0, maxY: 100 }
      const transform = createWorldToCanvasTransform(bounds, 1000, 500, 100)

      const result = transform(100, 50)
      expect(result.canvasX).toBeDefined()
      expect(result.canvasY).toBeDefined()
    })

    it('应该处理零范围的边界', () => {
      const bounds: Bounds = { minX: 50, maxX: 50, minY: 50, maxY: 50 }
      const transform = createWorldToCanvasTransform(bounds, 800, 600)

      const result = transform(50, 50)
      expect(result.canvasX).toBeCloseTo(400, 0)
      expect(result.canvasY).toBeCloseTo(300, 0)
    })

    it('应该正确缩放坐标', () => {
      const bounds: Bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 1000 }
      const transform = createWorldToCanvasTransform(bounds, 800, 800, 0)

      // 右上角点应该在 canvas 的右上角附近
      const topRight = transform(1000, 1000)
      expect(topRight.canvasX).toBeGreaterThan(400)
      expect(topRight.canvasY).toBeGreaterThan(400)

      // 左下角点应该在 canvas 的左下角附近
      const bottomLeft = transform(0, 0)
      expect(bottomLeft.canvasX).toBeLessThan(400)
      expect(bottomLeft.canvasY).toBeLessThan(400)
    })
  })
})
