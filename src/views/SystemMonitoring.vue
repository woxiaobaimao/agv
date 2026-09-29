<template>
  <div class="system-monitoring">
    <!-- 系统状态指示 -->
    <el-row :gutter="20" class="status-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="status-card" style="border-top: 4px solid #67c23a">
          <div class="status-icon">✓</div>
          <div class="status-text">系统运行正常</div>
          <div class="status-desc">在线: {{ systemStatus.online }}/{{ systemStatus.total }}</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="status-card" style="border-top: 4px solid #409eff">
          <div class="status-icon" style="color: #409eff">📊</div>
          <div class="status-text">系统负载</div>
          <div class="status-desc">{{ systemStatus.load }}%</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="status-card" style="border-top: 4px solid #e6a23c">
          <div class="status-icon" style="color: #e6a23c">⚡</div>
          <div class="status-text">平均能耗</div>
          <div class="status-desc">{{ systemStatus.avgPower }}W/AGV</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="status-card" style="border-top: 4px solid #f56c6c">
          <div class="status-icon" style="color: #f56c6c">⏱️</div>
          <div class="status-text">系统运行时间</div>
          <div class="status-desc">{{ systemStatus.uptime }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 监控面板 -->
    <el-row :gutter="20" class="monitor-row">
      <!-- AGV 效率监控 -->
      <el-col :xs="24" :md="12">
        <el-card class="monitor-card">
          <template #header>
            <span>📈 AGV 效率监控</span>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div style="color: #409eff; font-size: 14px">效率统计柱状图</div>
              <div style="margin-top: 10px; font-size: 12px; color: #999">
                <div>- AGV-01: 85% ████████░</div>
                <div>- AGV-02: 72% ███████░░</div>
                <div>- AGV-03: 91% █████████░</div>
                <div>- AGV-04: 68% ██████░░░</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 任务执行情况 -->
      <el-col :xs="24" :md="12">
        <el-card class="monitor-card">
          <template #header>
            <span>📊 任务执行情况</span>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div style="color: #67c23a; font-size: 14px">任务完成率</div>
              <div style="margin-top: 20px; text-align: center">
                <div style="font-size: 36px; color: #67c23a; font-weight: bold">92%</div>
                <div style="color: #999; font-size: 12px; margin-top: 10px">
                  总任务: 50 | 已完成: 46 | 进行中: 3 | 待分配: 1
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 详细监控信息 -->
    <el-row :gutter="20" class="detail-row">
      <!-- 设备状态详情 -->
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>🔍 设备状态详情</span>
          </template>
          <el-table :data="deviceStatus" size="small" style="width: 100%">
            <el-table-column prop="name" label="设备" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="uptime" label="运行时长" />
            <el-table-column prop="errorRate" label="错误率" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 事件日志 -->
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>📝 最近事件</span>
          </template>
          <div class="event-log">
            <div v-for="event in eventLogs" :key="event.id" class="event-item">
              <div class="event-time">{{ event.time }}</div>
              <div class="event-content">
                <div :style="{ color: getEventColor(event.level) }">
                  {{ event.level }}: {{ event.message }}
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 性能指标 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="24" :md="8">
        <el-card class="metric-card">
          <template #header>
            <span>⏱️ 平均任务耗时</span>
          </template>
          <div class="metric-value">4.5 分钟</div>
          <el-progress :percentage="72" status="success" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="metric-card">
          <template #header>
            <span>🎯 任务成功率</span>
          </template>
          <div class="metric-value">99.2%</div>
          <el-progress :percentage="99" status="success" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card class="metric-card">
          <template #header>
            <span>⚡ 系统资源占用</span>
          </template>
          <div class="metric-value">42%</div>
          <el-progress :percentage="42" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const systemStatus = ref({
  online: 13,
  total: 15,
  load: 68,
  avgPower: 2400,
  uptime: '45 天 12 小时'
})

const deviceStatus = [
  { name: '路由器', status: '正常', uptime: '45 天', errorRate: '0%' },
  { name: '调度中心', status: '正常', uptime: '45 天', errorRate: '0.1%' },
  { name: '地图服务', status: '正常', uptime: '45 天', errorRate: '0%' },
  { name: '充电站', status: '正常', uptime: '45 天', errorRate: '0.2%' }
]

const eventLogs = ref([
  { id: 1, time: '14:35:22', level: 'INFO', message: 'AGV-03 完成任务 T005' },
  { id: 2, time: '14:32:18', level: 'WARNING', message: 'AGV-05 电量低于 20%' },
  { id: 3, time: '14:28:45', level: 'INFO', message: '新任务 T006 已分配给 AGV-04' },
  { id: 4, time: '14:25:30', level: 'INFO', message: 'AGV-02 已到达充电站' },
  { id: 5, time: '14:20:15', level: 'WARNING', message: 'AGV-12 与 AGV-14 距离过近' },
  { id: 6, time: '14:15:00', level: 'ERROR', message: 'AGV-07 通信异常，已离线' }
])

const getEventColor = (level: string) => {
  const map: Record<string, string> = {
    INFO: '#909399',
    WARNING: '#e6a23c',
    ERROR: '#f56c6c'
  }
  return map[level] || '#909399'
}
</script>

<style scoped>
.system-monitoring {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.status-row {
  margin-bottom: 20px;
}

.status-card {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.status-icon {
  font-size: 28px;
  margin-bottom: 10px;
  color: #67c23a;
}

.status-text {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.status-desc {
  font-size: 12px;
  color: #999;
}

.monitor-row {
  margin-bottom: 20px;
}

.monitor-card {
  height: 100%;
}

.chart-container {
  min-height: 200px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.detail-row {
  margin-bottom: 20px;
}

.event-log {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.event-time {
  font-size: 12px;
  color: #909399;
  min-width: 70px;
  font-family: monospace;
}

.event-content {
  flex: 1;
  margin-left: 10px;
  font-size: 12px;
}

.metrics-row {
  margin-bottom: 20px;
}

.metric-card {
  text-align: center;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 15px;
}
</style>
