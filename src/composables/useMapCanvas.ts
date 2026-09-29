import { ref } from 'vue'

export interface Point {
  x: number
  y: number
}

export interface Bounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export function useMapCanvas() {
  const scale = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)

  const zoom = (factor: number, centerX: number, centerY: number) => {
    const newScale = scale.value * factor
    if (newScale < 0.1 || newScale > 10) return

    offsetX.value = centerX - (centerX - offsetX.value) * (newScale / scale.value)
    offsetY.value = centerY - (centerY - offsetY.value) * (newScale / scale.value)
    scale.value = newScale
  }

  const pan = (deltaX: number, deltaY: number) => {
    offsetX.value += deltaX
    offsetY.value += deltaY
  }

  const reset = () => {
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
  }

  const worldToCanvas = (x: number, y: number) => {
    const canvasX = x * scale.value + offsetX.value
    const canvasY = y * scale.value + offsetY.value
    return { canvasX, canvasY }
  }

  const canvasToWorld = (canvasX: number, canvasY: number) => {
    const x = (canvasX - offsetX.value) / scale.value
    const y = (canvasY - offsetY.value) / scale.value
    return { x, y }
  }

  return {
    scale,
    offsetX,
    offsetY,
    zoom,
    pan,
    reset,
    worldToCanvas,
    canvasToWorld
  }
}
