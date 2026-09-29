<template>
  <div class="dashboard">
    <!-- 系统概览统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card" style="border-left: 4px solid #409eff">
          <div class="stat-value">{{ stats.totalAGVs }}</div>
          <div class="stat-label">总AGV数量</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card" style="border-left: 4px solid #67c23a">
          <div class="stat-value">{{ stats.workingAGVs }}</div>
          <div class="stat-label">工作中</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card" style="border-left: 4px solid #e6a23c">
          <div class="stat-value">{{ stats.idleAGVs }}</div>
          <div class="stat-label">空闲中</div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <div class="stat-card" style="border-left: 4px solid #f56c6c">
          <div class="stat-value">{{ stats.faultAGVs }}</div>
          <div class="stat-label">故障/离线</div>
        </div>
      </el-col>
    </el-row>

    <!-- 主要功能区域 -->
    <el-row :gutter="20" class="main-row">
      <!-- 地图/场景视图 -->
      <el-col :xs="24" :md="16">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>实时场景监控</span>
              <el-button type="primary" size="small">刷新</el-button>
            </div>
          </template>
          <div class="scene-container">
            <div class="scene-placeholder">
              <div style="font-size: 48px; margin-bottom: 10px">📍</div>
              <div>场景地图区域</div>
              <div style="color: #999; font-size: 12px; margin-top: 10px">
                - AGV 实时位置显示<br>
                - 工作站和充电桩位置<br>
                - 任务路径规划展示
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作面板 -->
      <el-col :xs="24" :md="8">
        <el-card class="module-card">
          <template #header>
            <span>快捷操作</span>
          </template>
          <el-space direction="vertical" style="width: 100%">
            <el-button type="primary" plain style="width: 100%">
              📋 查看所有任务
            </el-button>
            <el-button type="success" plain style="width: 100%">
              ➕ 创建新任务
            </el-button>
            <el-button type="warning" plain style="width: 100%">
              🚛 AGV管理
            </el-button>
            <el-button type="info" plain style="width: 100%">
              ⚙️ 系统设置
            </el-button>
            <el-button type="danger" plain style="width: 100%">
              🚨 故障处理
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时信息面板 -->
    <el-row :gutter="20" class="info-row">
      <el-col :xs="24" :md="12">
        <el-card class="module-card">
          <template #header>
            <span>最新任务</span>
          </template>
          <el-table :data="latestTasks" size="small" style="width: 100%">
            <el-table-column prop="id" label="任务ID" width="80" />
            <el-table-column prop="type" label="类型" width="70" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="agv" label="执行AGV" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="module-card">
          <template #header>
            <span>系统告警</span>
          </template>
          <el-alert
            v-for="alert in systemAlerts"
            :key="alert.id"
            :title="alert.title"
            :type="alert.type"
            :description="alert.desc"
            :closable="false"
            style="margin-bottom: 10px"
          />
          <div v-if="systemAlerts.length === 0" style="color: #999; text-align: center; padding: 20px">
            暂无告警信息
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const stats = reactive({
  totalAGVs: 15,
  workingAGVs: 8,
  idleAGVs: 5,
  faultAGVs: 2
})

const latestTasks = [
  { id: 'T001', type: '搬运', status: '执行中', agv: 'AGV-01' },
  { id: 'T002', type: '充电', status: '完成', agv: 'AGV-02' },
  { id: 'T003', type: '搬运', status: '等待', agv: '-' },
  { id: 'T004', type: '检测', status: '执行中', agv: 'AGV-03' }
]

const systemAlerts = [
  { id: 1, title: 'AGV-05 电量不足', type: 'warning', desc: '电量 15%，建议前往充电站充电' },
  { id: 2, title: 'AGV-12 通信异常', type: 'error', desc: '无信号，请检查网络连接' }
]

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '执行中': 'success',
    '完成': 'info',
    '等待': 'warning',
    '失败': 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.main-row {
  margin-bottom: 20px;
}

.info-row {
  margin-bottom: 20px;
}

.module-card {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.scene-container {
  min-height: 300px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  border: 2px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scene-placeholder {
  text-align: center;
  color: #909399;
  font-size: 14px;
}
</style>
