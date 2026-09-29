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

const PADDING = 80

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
  if (!canvasRef.value) return 600
  return canvasRef.value.clientHeight
})

const worldToCanvas = computed(() => {
  return createWorldToCanvasTransform(getCanvasBounds.value, canvasWidth.value, canvasHeight.value, PADDING)
})

const vehicleStats = computed(() => {
  const stats = {
    total: vehicles.value.length,
    idle: 0,
    moving: 0,
    charging: 0,
    error: 0
  }
  for (const v of vehicles.value) {
    if (v.state === 'IDLE') stats.idle++
    else if (v.state === 'MOVING') stats.moving++
    else if (v.state === 'CHARGING') stats.charging++
    else stats.error++
  }
  return stats
})

const fetchPlantModel = async () => {
  try {
    loading.value = true
    const data = await apiClient.get<PlantModel>('/v1/plantModel')
    plantModel.value = data
  } catch (err: any) {
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
    'Vehicle-01-VDA5050-2.0': '#00ff88',
    'Vehicle-02': '#00ddff',
    'Vehicle-03': '#ffaa00',
    'Vehicle-04': '#ff5555'
  }
  return colors[vehicle.name] || '#00ff88'
}

const draw = () => {
  if (!ctx.value || !canvasRef.value) return
  const renderer = new MapRenderer(ctx.value, canvasWidth.value, canvasHeight.value)
  renderer.clear('#0a1828')
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
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <div class="top-bar">
      <div class="title">openTCS 实时地图监控系统</div>
      <div class="time">{{ new Date().toLocaleTimeString('zh-CN') }}</div>
    </div>

    <!-- 主体区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="stat-box">
          <div class="stat-label">车辆总数</div>
          <div class="stat-value">{{ vehicleStats.total }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">运行中</div>
          <div class="stat-value" style="color: #00ff88">{{ vehicleStats.moving }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">空闲</div>
          <div class="stat-value" style="color: #00ddff">{{ vehicleStats.idle }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">充电中</div>
          <div class="stat-value" style="color: #ffaa00">{{ vehicleStats.charging }}</div>
        </div>

        <div class="divider"></div>

        <div class="vehicle-list-title">车辆列表</div>
        <div class="vehicle-list">
          <div v-for="vehicle in vehicles" :key="vehicle.name" class="vehicle-card">
            <div class="vehicle-dot" :style="{ background: getVehicleColor(vehicle) }"></div>
            <div class="vehicle-info">
              <div class="vehicle-name">{{ vehicle.name }}</div>
              <div class="vehicle-pos">{{ vehicle.currentPosition }}</div>
              <div class="vehicle-state">{{ vehicle.state }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间地图区域 -->
      <div class="map-container">
        <canvas ref="canvasRef" class="map-canvas"></canvas>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="panel-title">系统状态</div>

        <div class="info-box">
          <div class="info-label">地图名称</div>
          <div class="info-value">{{ plantModel?.name || '加载中...' }}</div>
        </div>

        <div class="info-box">
          <div class="info-label">地图点数</div>
          <div class="info-value">{{ plantModel?.points.length || 0 }}</div>
        </div>

        <div class="info-box">
          <div class="info-label">路径数</div>
          <div class="info-value">{{ plantModel?.paths.length || 0 }}</div>
        </div>

        <div class="divider"></div>

        <div class="panel-title">图例</div>
        <div class="legend">
          <div class="legend-item">
            <div class="legend-dot" style="background: #3498db"></div>
            <span>地图点</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: #bdc3c7"></div>
            <span>路径</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: #00ff88"></div>
            <span>运行中</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot" style="background: #00ddff"></div>
            <span>空闲</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="status-indicator">
          <div class="indicator-light" :style="{ background: loading ? '#ff9800' : '#4caf50' }"></div>
          <span>{{ loading ? '更新中...' : '运行中' }}</span>
        </div>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="bottom-bar">
      <div class="bottom-info">
        <span>实时更新频率: 1s</span>
        <span class="separator">|</span>
        <span>分辨率: {{ canvasWidth }} x {{ canvasHeight }}</span>
        <span class="separator">|</span>
        <span>已连接: {{ vehicles.length }} 台车辆</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0a1828 0%, #1a2a4a 100%);
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #00ff88;
  height: 45px;
  flex-shrink: 0;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.time {
  font-size: 14px;
  color: #00ddff;
}

.main-content {
  display: flex;
  flex: 1;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
}

.left-panel {
  width: 150px;
  background: rgba(10, 24, 40, 0.8);
  border: 1px solid #00ff88;
  border-radius: 8px;
  padding: 12px;
  overflow: hidden;
}

.stat-box {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #a0a0a0;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #00ff88, transparent);
  margin: 15px 0;
}

.vehicle-list-title {
  font-size: 14px;
  color: #00ddff;
  font-weight: bold;
  margin-bottom: 10px;
}

.vehicle-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.vehicle-card {
  display: flex;
  gap: 8px;
  align-items: center;
  background: rgba(0, 100, 150, 0.2);
  border: 1px solid #00ddff;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.vehicle-card:hover {
  background: rgba(0, 150, 200, 0.3);
  box-shadow: 0 0 10px rgba(0, 221, 255, 0.3);
}

.vehicle-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 5px currentColor;
}

.vehicle-info {
  flex: 1;
  min-width: 0;
}

.vehicle-name {
  font-size: 11px;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vehicle-pos {
  font-size: 10px;
  color: #00ddff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vehicle-state {
  font-size: 10px;
  color: #a0a0a0;
}

.map-container {
  flex: 1;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #00ff88;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.map-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.right-panel {
  width: 150px;
  background: rgba(10, 24, 40, 0.8);
  border: 1px solid #00ddff;
  border-radius: 8px;
  padding: 12px;
  overflow: hidden;
}

.panel-title {
  font-size: 14px;
  color: #00ddff;
  font-weight: bold;
  margin-bottom: 12px;
  text-shadow: 0 0 5px rgba(0, 221, 255, 0.3);
}

.info-box {
  background: rgba(0, 100, 150, 0.1);
  border: 1px solid #00ddff;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.info-label {
  font-size: 11px;
  color: #a0a0a0;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  color: #00ddff;
  font-weight: bold;
  word-break: break-all;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #00ff88;
  border-radius: 4px;
  padding: 10px;
}

.indicator-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.bottom-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 2px solid #00ddff;
  height: 32px;
  flex-shrink: 0;
  font-size: 11px;
}

.bottom-info {
  display: flex;
  gap: 20px;
  color: #a0a0a0;
}

.separator {
  color: #00ff88;
}
</style>
