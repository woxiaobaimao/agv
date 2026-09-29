<template>
  <div class="task-scheduling">
    <el-row :gutter="20">
      <!-- 任务创建面板 -->
      <el-col :xs="24" :md="8">
        <el-card>
          <template #header>
            <span>➕ 创建新任务</span>
          </template>
          <el-form>
            <el-form-item label="任务类型">
              <el-select v-model="newTask.type" placeholder="选择任务类型">
                <el-option label="搬运" value="transport" />
                <el-option label="检测" value="inspect" />
                <el-option label="充电" value="charging" />
                <el-option label="维护" value="maintain" />
              </el-select>
            </el-form-item>
            <el-form-item label="起点">
              <el-input v-model="newTask.startPoint" placeholder="输入起点位置" />
            </el-form-item>
            <el-form-item label="终点">
              <el-input v-model="newTask.endPoint" placeholder="输入终点位置" />
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="newTask.priority" placeholder="选择优先级">
                <el-option label="低" value="low" />
                <el-option label="中" value="medium" />
                <el-option label="高" value="high" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%" @click="createTask">
                创建任务
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 统计卡片 -->
        <el-card style="margin-top: 20px">
          <template #header>
            <span>任务统计</span>
          </template>
          <div class="stat-item">
            <span>总任务</span>
            <strong style="color: #409eff">{{ taskStats.total }}</strong>
          </div>
          <el-divider style="margin: 10px 0" />
          <div class="stat-item">
            <span>执行中</span>
            <strong style="color: #67c23a">{{ taskStats.executing }}</strong>
          </div>
          <el-divider style="margin: 10px 0" />
          <div class="stat-item">
            <span>等待中</span>
            <strong style="color: #e6a23c">{{ taskStats.waiting }}</strong>
          </div>
          <el-divider style="margin: 10px 0" />
          <div class="stat-item">
            <span>已完成</span>
            <strong style="color: #909399">{{ taskStats.completed }}</strong>
          </div>
        </el-card>
      </el-col>

      <!-- 任务列表面板 -->
      <el-col :xs="24" :md="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>📋 任务列表</span>
              <div>
                <el-button-group>
                  <el-button
                    v-for="tab in taskTabs"
                    :key="tab.value"
                    :type="currentTab === tab.value ? 'primary' : 'info'"
                    size="small"
                    @click="currentTab = tab.value"
                  >
                    {{ tab.label }}
                  </el-button>
                </el-button-group>
              </div>
            </div>
          </template>

          <el-table :data="filteredTasks" style="width: 100%" stripe size="small">
            <el-table-column prop="id" label="任务ID" width="90" />
            <el-table-column prop="type" label="类型" width="80">
              <template #default="{ row }">
                <el-tag>{{ row.type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startPoint" label="起点" />
            <el-table-column prop="endPoint" label="终点" />
            <el-table-column prop="assignedAGV" label="分配AGV" width="100" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusColor(row.status)">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="90">
              <template #default="{ row }">
                <el-rate
                  :model-value="getPriorityValue(row.priority)"
                  :max="3"
                  disabled
                  size="small"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-space :size="6">
                  <el-button type="primary" size="small" text @click="handleEditTask(row)">
                    编辑
                  </el-button>
                  <el-button type="danger" size="small" text @click="handleDeleteTask(row)">
                    删除
                  </el-button>
                </el-space>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 任务流程可视化 -->
        <el-card style="margin-top: 20px">
          <template #header>
            <span>📊 任务流程</span>
          </template>
          <div class="task-flow">
            <div class="flow-item" style="background: #e6f7ff">
              <div class="flow-step">1</div>
              <div class="flow-label">待分配</div>
              <div class="flow-count">{{ taskStats.waiting }}</div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-item" style="background: #f6ffed">
              <div class="flow-step">2</div>
              <div class="flow-label">执行中</div>
              <div class="flow-count">{{ taskStats.executing }}</div>
            </div>
            <div class="flow-arrow">→</div>
            <div class="flow-item" style="background: #f5f5f5">
              <div class="flow-step">3</div>
              <div class="flow-label">已完成</div>
              <div class="flow-count">{{ taskStats.completed }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const currentTab = ref('all')
const taskTabs = [
  { label: '全部', value: 'all' },
  { label: '执行中', value: 'executing' },
  { label: '等待中', value: 'waiting' },
  { label: '已完成', value: 'completed' }
]

const newTask = ref({
  type: '',
  startPoint: '',
  endPoint: '',
  priority: 'medium'
})

const taskList = ref([
  { id: 'T001', type: '搬运', startPoint: 'A1', endPoint: 'B1', assignedAGV: 'AGV-01', status: '执行中', priority: 'high', progress: 60 },
  { id: 'T002', type: '搬运', startPoint: 'C1', endPoint: 'D1', assignedAGV: 'AGV-03', status: '执行中', priority: 'medium', progress: 40 },
  { id: 'T003', type: '检测', startPoint: 'A1', endPoint: 'A2', assignedAGV: '-', status: '等待中', priority: 'low', progress: 0 },
  { id: 'T004', type: '搬运', startPoint: 'B1', endPoint: 'C1', assignedAGV: '-', status: '等待中', priority: 'high', progress: 0 },
  { id: 'T005', type: '充电', startPoint: 'D1', endPoint: '充电站', assignedAGV: 'AGV-02', status: '已完成', priority: 'medium', progress: 100 },
  { id: 'T006', type: '搬运', startPoint: 'E1', endPoint: 'F1', assignedAGV: 'AGV-04', status: '已完成', priority: 'low', progress: 100 }
])

const taskStats = computed(() => ({
  total: taskList.value.length,
  executing: taskList.value.filter(t => t.status === '执行中').length,
  waiting: taskList.value.filter(t => t.status === '等待中').length,
  completed: taskList.value.filter(t => t.status === '已完成').length
}))

const filteredTasks = computed(() => {
  if (currentTab.value === 'all') return taskList.value
  return taskList.value.filter(t => {
    const statusMap: Record<string, string> = {
      executing: '执行中',
      waiting: '等待中',
      completed: '已完成'
    }
    return t.status === statusMap[currentTab.value]
  })
})

const getTaskStatusColor = (status: string) => {
  const map: Record<string, string> = {
    '执行中': 'success',
    '等待中': 'warning',
    '已完成': 'info',
    '失败': 'danger'
  }
  return map[status] || 'info'
}

const getPriorityValue = (priority: string) => {
  const map: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3
  }
  return map[priority] || 1
}

const createTask = () => {
  if (!newTask.value.type || !newTask.value.startPoint || !newTask.value.endPoint) {
    ElMessage.warning('请填写所有必要信息')
    return
  }
  const task = {
    id: `T${String(taskList.value.length + 1).padStart(3, '0')}`,
    type: newTask.value.type,
    startPoint: newTask.value.startPoint,
    endPoint: newTask.value.endPoint,
    assignedAGV: '-',
    status: '等待中',
    priority: newTask.value.priority,
    progress: 0
  }
  taskList.value.push(task)
  ElMessage.success('任务创建成功')
  newTask.value = { type: '', startPoint: '', endPoint: '', priority: 'medium' }
}

const handleEditTask = (row: any) => {
  console.log('编辑任务:', row)
}

const handleDeleteTask = (row: any) => {
  const index = taskList.value.indexOf(row)
  if (index > -1) {
    taskList.value.splice(index, 1)
    ElMessage.success('任务已删除')
  }
}
</script>

<style scoped>
.task-scheduling {
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

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
}

.task-flow {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}

.flow-item {
  flex: 1;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  border-left: 4px solid #409eff;
}

.flow-step {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.flow-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.flow-count {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.flow-arrow {
  font-size: 24px;
  color: #dcdfe6;
  margin: 0 10px;
}
</style>
