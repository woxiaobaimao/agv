<template>
  <div class="system-settings">
    <el-row :gutter="20">
      <!-- 设置菜单 -->
      <el-col :xs="24" :md="6">
        <el-card>
          <el-menu
            :default-active="activeMenu"
            class="settings-menu"
            @select="activeMenu = $event"
          >
            <el-menu-item index="basic">⚙️ 基本设置</el-menu-item>
            <el-menu-item index="agv">🚛 AGV 配置</el-menu-item>
            <el-menu-item index="network">🌐 网络设置</el-menu-item>
            <el-menu-item index="alert">🚨 告警规则</el-menu-item>
            <el-menu-item index="map">📍 地图配置</el-menu-item>
            <el-menu-item index="backup">💾 备份恢复</el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 设置内容 -->
      <el-col :xs="24" :md="18">
        <!-- 基本设置 -->
        <el-card v-if="activeMenu === 'basic'" class="settings-card">
          <template #header>
            <span>⚙️ 基本设置</span>
          </template>
          <el-form label-width="150px">
            <el-form-item label="系统名称">
              <el-input v-model="settings.systemName" />
            </el-form-item>
            <el-form-item label="工厂位置">
              <el-input v-model="settings.factoryLocation" />
            </el-form-item>
            <el-form-item label="时区">
              <el-select v-model="settings.timezone">
                <el-option label="UTC+8 (China)" value="UTC+8" />
                <el-option label="UTC+0 (GMT)" value="UTC+0" />
                <el-option label="UTC-5 (EST)" value="UTC-5" />
              </el-select>
            </el-form-item>
            <el-form-item label="语言">
              <el-select v-model="settings.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="维护时间">
              <el-time-select
                v-model="settings.maintenanceTime"
                :start="'00:00'"
                :step="'00:30'"
                :end="'23:30'"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">💾 保存设置</el-button>
              <el-button>↩️ 重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- AGV 配置 -->
        <el-card v-if="activeMenu === 'agv'" class="settings-card">
          <template #header>
            <span>🚛 AGV 配置</span>
          </template>
          <el-form label-width="150px">
            <el-form-item label="最大AGV数">
              <el-input-number v-model="settings.maxAGV" :min="1" :max="100" />
            </el-form-item>
            <el-form-item label="默认速度(m/s)">
              <el-input-number v-model="settings.defaultSpeed" :min="0.5" :max="2" :step="0.1" />
            </el-form-item>
            <el-form-item label="安全距离(m)">
              <el-input-number v-model="settings.safeDistance" :min="0.5" :max="5" :step="0.1" />
            </el-form-item>
            <el-form-item label="电池告警阈值(%)">
              <el-input-number v-model="settings.batteryAlert" :min="5" :max="50" />
            </el-form-item>
            <el-form-item label="自动充电">
              <el-switch v-model="settings.autoCharging" />
            </el-form-item>
            <el-form-item label="路径优化算法">
              <el-select v-model="settings.pathAlgorithm">
                <el-option label="A*" value="astar" />
                <el-option label="Dijkstra" value="dijkstra" />
                <el-option label="RRT" value="rrt" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">💾 保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 网络设置 -->
        <el-card v-if="activeMenu === 'network'" class="settings-card">
          <template #header>
            <span>🌐 网络设置</span>
          </template>
          <el-form label-width="150px">
            <el-form-item label="服务器地址">
              <el-input v-model="settings.serverAddress" />
            </el-form-item>
            <el-form-item label="服务器端口">
              <el-input-number v-model="settings.serverPort" :min="1024" :max="65535" />
            </el-form-item>
            <el-form-item label="通信协议">
              <el-select v-model="settings.protocol">
                <el-option label="TCP" value="tcp" />
                <el-option label="UDP" value="udp" />
                <el-option label="WebSocket" value="websocket" />
              </el-select>
            </el-form-item>
            <el-form-item label="心跳间隔(s)">
              <el-input-number v-model="settings.heartbeatInterval" :min="1" :max="60" />
            </el-form-item>
            <el-form-item label="连接超时(s)">
              <el-input-number v-model="settings.connectionTimeout" :min="5" :max="300" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary">💾 保存设置</el-button>
              <el-button>🔗 测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 告警规则 -->
        <el-card v-if="activeMenu === 'alert'" class="settings-card">
          <template #header>
            <span>🚨 告警规则</span>
          </template>
          <el-table :data="alertRules" style="width: 100%; margin-bottom: 20px">
            <el-table-column prop="name" label="规则名称" />
            <el-table-column prop="condition" label="触发条件" />
            <el-table-column prop="level" label="告警等级">
              <template #default="{ row }">
                <el-tag :type="row.level === 'high' ? 'danger' : row.level === 'medium' ? 'warning' : 'info'">
                  {{ row.level === 'high' ? '严重' : row.level === 'medium' ? '中等' : '轻微' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="启用" width="60">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default>
                <el-button type="primary" size="small" text>编辑</el-button>
                <el-button type="danger" size="small" text>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button type="success">➕ 添加规则</el-button>
        </el-card>

        <!-- 地图配置 -->
        <el-card v-if="activeMenu === 'map'" class="settings-card">
          <template #header>
            <span>📍 地图配置</span>
          </template>
          <el-form label-width="150px">
            <el-form-item label="地图类型">
              <el-select v-model="settings.mapType">
                <el-option label="2D 栅格" value="2d-grid" />
                <el-option label="3D 场景" value="3d-scene" />
              </el-select>
            </el-form-item>
            <el-form-item label="栅格大小(m)">
              <el-input-number v-model="settings.gridSize" :min="0.1" :max="1" :step="0.1" />
            </el-form-item>
            <el-form-item label="地图文件">
              <el-upload
                action="#"
                drag
              >
                <template #default>
                  <div class="el-upload__text">
                    拖拽或<em>点击上传</em>地图文件
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary">💾 保存配置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 备份恢复 -->
        <el-card v-if="activeMenu === 'backup'" class="settings-card">
          <template #header>
            <span>💾 备份恢复</span>
          </template>
          <el-divider>备份管理</el-divider>
          <div style="margin-bottom: 20px">
            <el-button type="success" style="width: 100%; margin-bottom: 10px">
              ⬇️ 创建备份
            </el-button>
            <el-button type="info" style="width: 100%">
              📋 查看备份历史
            </el-button>
          </div>
          <el-divider>备份列表</el-divider>
          <el-table :data="backupList" size="small">
            <el-table-column prop="name" label="备份名称" />
            <el-table-column prop="time" label="创建时间" />
            <el-table-column prop="size" label="大小" width="80" />
            <el-table-column label="操作" width="150">
              <template #default>
                <el-button type="primary" size="small" text>恢复</el-button>
                <el-button type="danger" size="small" text>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeMenu = ref('basic')

const settings = ref({
  systemName: 'AGV 调度系统',
  factoryLocation: '工厂A-2号生产线',
  timezone: 'UTC+8',
  language: 'zh-CN',
  maintenanceTime: '02:00',
  maxAGV: 50,
  defaultSpeed: 1.2,
  safeDistance: 1.5,
  batteryAlert: 20,
  autoCharging: true,
  pathAlgorithm: 'astar',
  serverAddress: 'localhost',
  serverPort: 8080,
  protocol: 'websocket',
  heartbeatInterval: 5,
  connectionTimeout: 30,
  mapType: '2d-grid',
  gridSize: 0.5
})

const alertRules = ref([
  { name: 'AGV电量过低', condition: '电量 < 20%', level: 'high', enabled: true },
  { name: '碰撞风险', condition: '距离 < 1.5m', level: 'high', enabled: true },
  { name: '通信超时', condition: '无心跳 > 30s', level: 'medium', enabled: true },
  { name: '任务延迟', condition: '耗时 > 预计2倍', level: 'medium', enabled: false }
])

const backupList = ref([
  { name: 'backup_2026-09-29_14-00', time: '2026-09-29 14:00:00', size: '2.5 MB' },
  { name: 'backup_2026-09-28_02-00', time: '2026-09-28 02:00:00', size: '2.3 MB' },
  { name: 'backup_2026-09-27_02-00', time: '2026-09-27 02:00:00', size: '2.4 MB' }
])
</script>

<style scoped>
.system-settings {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.settings-menu {
  border: none;
}

.settings-card {
  margin-bottom: 20px;
}
</style>
