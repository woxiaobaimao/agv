<template>
  <div class="agv-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AGV 设备管理</span>
          <div>
            <el-button type="primary" size="small">➕ 添加AGV</el-button>
            <el-button size="small">🔄 刷新</el-button>
          </div>
        </div>
      </template>

      <!-- 搜索过滤 -->
      <el-row :gutter="20" style="margin-bottom: 20px">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="searchText"
            placeholder="搜索AGV ID..."
            clearable
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select v-model="filterStatus" placeholder="状态过滤" clearable>
            <el-option label="工作中" value="working" />
            <el-option label="空闲" value="idle" />
            <el-option label="充电中" value="charging" />
            <el-option label="故障" value="fault" />
            <el-option label="离线" value="offline" />
          </el-select>
        </el-col>
      </el-row>

      <!-- AGV 列表 -->
      <el-table :data="filteredAGVs" style="width: 100%" stripe>
        <el-table-column prop="id" label="AGV ID" width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="battery" label="电池电量" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.battery" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="location" label="当前位置" width="120" />
        <el-table-column prop="currentTask" label="当前任务" width="100" />
        <el-table-column prop="speed" label="速度(m/s)" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space :size="6">
              <el-button type="primary" size="small" text @click="handleControl(row)">
                控制
              </el-button>
              <el-button type="info" size="small" text @click="handleDetail(row)">
                详情
              </el-button>
              <el-button type="warning" size="small" text @click="handleMaintain(row)">
                维护
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- AGV 统计卡片 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="info-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <div class="info-value">{{ agvStats.total }}</div>
          <div class="info-label">总设备数</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="info-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <div class="info-value">{{ agvStats.working }}</div>
          <div class="info-label">工作中</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="info-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
          <div class="info-value">{{ agvStats.available }}</div>
          <div class="info-label">可用设备</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="info-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%)">
          <div class="info-value">{{ agvStats.offline }}</div>
          <div class="info-label">离线/故障</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

const searchText = ref('')
const filterStatus = ref('')

const agvList = ref<any[]>([])

const mapVehicleToAGV = (vehicle: any) => {
  const energyLevel = vehicle.energyLevel || 0
  const stateMappings: Record<string, string> = {
    'IDLE': '空闲',
    'CHARGING': '充电中',
    'DRIVING': '工作中',
    'UNKNOWN': '未知'
  }
  
  return {
    id: vehicle.name,
    status: stateMappings[vehicle.state] || vehicle.state,
    battery: energyLevel,
    location: vehicle.currentPosition || '未知',
    currentTask: vehicle.transportOrder || '-',
    speed: 0
  }
}

const loadAGVData = async () => {
  try {
    const data = await api.get('/v1/vehicles')
    agvList.value = data.map(mapVehicleToAGV)
  } catch (error) {
    // 错误已由 api.handleError 统一处理并显示提示
    // 使用默认数据
    agvList.value = [
      { id: 'Vehicle-01-VDA5050-2.0', status: '空闲', battery: 100, location: '停靠区', currentTask: '-', speed: 0 },
      { id: 'Vehicle-02', status: '空闲', battery: 100, location: '停靠区', currentTask: '-', speed: 0 },
      { id: 'Vehicle-03', status: '空闲', battery: 100, location: '停靠区', currentTask: '-', speed: 0 },
      { id: 'Vehicle-04', status: '空闲', battery: 100, location: '停靠区', currentTask: '-', speed: 0 }
    ]
  }
}

onMounted(() => {
  loadAGVData()
})

const filteredAGVs = computed(() => {
  return agvList.value.filter(agv => {
    const matchSearch = agv.id.toLowerCase().includes(searchText.value.toLowerCase())
    const matchStatus = !filterStatus.value || agv.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const agvStats = computed(() => ({
  total: agvList.value.length,
  working: agvList.value.filter(a => a.status === '工作中').length,
  available: agvList.value.filter(a => a.status === '空闲').length,
  offline: agvList.value.filter(a => a.status === '故障' || a.status === '离线').length
}))

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    '工作中': 'success',
    '空闲': 'info',
    '充电中': 'warning',
    '故障': 'danger',
    '离线': 'danger'
  }
  return map[status] || 'info'
}

const handleControl = (row: any) => {
  console.log('控制AGV:', row)
}

const handleDetail = (row: any) => {
  console.log('查看详情:', row)
}

const handleMaintain = (row: any) => {
  console.log('维护:', row)
}
</script>

<style scoped>
.agv-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.info-card {
  padding: 20px;
  border-radius: 8px;
  color: white;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.info-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.info-label {
  font-size: 14px;
  opacity: 0.9;
}
</style>
