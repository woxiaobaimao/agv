<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import apiClient from '@/api'
import type { PlantModel, Vehicle } from '@/types/map'
import { MapRenderer, calculateBounds, createWorldToCanvasTransform } from '@/utils/mapRenderer'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const plantModel = ref<PlantModel | null>(null)
const vehicles = ref<Vehicle[]>([])
const loading = ref(false)
const error = ref('')

const PADDING = 100

let updateInterval: ReturnType<typeof setInterval> | null = null
let animationFrameId: number | null = null

const getCanvasBounds = computed(() => {
  if (!plantModel.value?.points.length) {
    return { minX: 0, maxX: 100, minY: 0, maxY: 100 }
  }
  return calculateBounds(plantModel.value.points)
})

const canvasWidth = computed(() => {
  if (!canvasRef.value) return 1200
  return canvasRef.value.clientWidth
})

const canvasHeight = computed(() => {
  if (!canvasRef.value) return 800
  return canvasRef.value.clientHeight
})

const worldToCanvas = computed(() => {
  return createWorldToCanvasTransform(getCanvasBounds.value, canvasWidth.value, canvasHeight.value, PADDING)
})

const fetchPlantModel = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await apiClient.get<PlantModel>('/v1/plantModel')
    plantModel.value = data
  } catch (err: any) {
    error.value = '加载地图数据失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const fetchVehicles = async () => {
  try {
    const data = await apiClient.get<Vehicle[]>('/v1/vehicles')
    vehicles.value = data
  } catch (err) {
    console.error('Failed to fetch vehicles:', err)
  }
}

const drawPoints = () => {
  if (!ctx.value || !plantModel.value) return
  const renderer = new MapRenderer(ctx.value, canvasWidth.value, canvasHeight.value)
  renderer.drawPoints(plantModel.value.points, worldToCanvas.value)
}

const drawPaths = () => {
  if (!ctx.value || !plantModel.value) return
  const renderer = new MapRenderer(ctx.value, canvasWidth.value, canvasHeight.value)
  const pointMap = new Map(plantModel.value.points.map(p => [p.name, p]))
  renderer.drawPaths(plantModel.value.paths, pointMap, worldToCanvas.value)
}

const drawVehicles = () => {
  if (!ctx.value || !plantModel.value) return
  const renderer = new MapRenderer(ctx.value, canvasWidth.value, canvasHeight.value)
  const pointMap = new Map(plantModel.value.points.map(p => [p.name, p]))
  renderer.drawVehicles(vehicles.value, pointMap, worldToCanvas.value, getVehicleColor)
}

const getVehicleColor = (vehicle: Vehicle): string => {
  const colors: { [key: string]: string } = {
    'Vehicle-01-VDA5050-2.0': '#e74c3c',
    'Vehicle-02': '#2ecc71',
    'Vehicle-03': '#3498db',
    'Vehicle-04': '#f39c12'
  }
  return colors[vehicle.name] || '#e74c3c'
}

const draw = () => {
  if (!ctx.value || !canvasRef.value) return

  const renderer = new MapRenderer(ctx.value, canvasWidth.value, canvasHeight.value)
  renderer.clear()
  drawPaths()
  drawPoints()
  drawVehicles()
}

const render = () => {
  draw()
  animationFrameId = requestAnimationFrame(render)
}

const resizeCanvas = () => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.parentElement?.getBoundingClientRect()
  if (rect) {
    canvasRef.value.width = rect.width
    canvasRef.value.height = rect.height
  }
}

onMounted(async () => {
  if (!canvasRef.value) return

  resizeCanvas()
  ctx.value = canvasRef.value.getContext('2d')

  window.addEventListener('resize', resizeCanvas)

  await fetchPlantModel()
  await fetchVehicles()

  updateInterval = setInterval(() => {
    fetchVehicles()
  }, 1000)

  render()
})

onBeforeUnmount(() => {
  if (updateInterval) clearInterval(updateInterval)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div class="map-monitoring">
    <div class="header">
      <h1>实时地图监控</h1>
      <div class="info">
        <span v-if="plantModel">地图: {{ plantModel.name }}</span>
        <span>车辆: {{ vehicles.length }}</span>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="canvas-container">
      <canvas ref="canvasRef" class="map-canvas"></canvas>
    </div>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-circle" style="background: #3498db"></div>
        <span>地图点</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background: #e74c3c"></div>
        <span>Vehicle-01</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background: #2ecc71"></div>
        <span>Vehicle-02</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background: #3498db"></div>
        <span>Vehicle-03</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle" style="background: #f39c12"></div>
        <span>Vehicle-04</span>
      </div>
    </div>

    <div class="vehicles-list">
      <h3>车辆状态</h3>
      <div v-if="vehicles.length === 0" class="empty">暂无车辆</div>
      <div v-for="vehicle in vehicles" :key="vehicle.name" class="vehicle-item">
        <div class="vehicle-indicator" :style="{ background: getVehicleColor(vehicle) }"></div>
        <div class="vehicle-info">
          <div class="vehicle-name">{{ vehicle.name }}</div>
          <div class="vehicle-details">
            <span>位置: {{ vehicle.currentPosition }}</span>
            <span>状态: {{ vehicle.state }}</span>
            <span v-if="vehicle.energyLevel">电量: {{ vehicle.energyLevel }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-monitoring {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

.info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.error-message {
  padding: 12px 20px;
  background: #fee;
  color: #c33;
  border-bottom: 1px solid #e0e0e0;
}

.canvas-container {
  flex: 1;
  position: relative;
  background: #fff;
  margin: 10px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.legend {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.vehicles-list {
  width: 280px;
  background: #fff;
  border-left: 1px solid #e0e0e0;
  padding: 15px;
  overflow-y: auto;
  max-height: 300px;
}

.vehicles-list h3 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #2c3e50;
}

.empty {
  color: #999;
  font-size: 13px;
  text-align: center;
  padding: 20px;
}

.vehicle-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  background: #f9f9f9;
  border: 1px solid #eee;
}

.vehicle-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}

.vehicle-info {
  flex: 1;
}

.vehicle-name {
  font-weight: 600;
  font-size: 13px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.vehicle-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #666;
}

.vehicle-details span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 1200px) {
  .vehicles-list {
    display: none;
  }
}

@media (max-width: 768px) {
  .legend {
    gap: 10px;
  }

  .legend-item {
    font-size: 12px;
  }
}
</style>
