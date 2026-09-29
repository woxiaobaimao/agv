<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false)

const menuItems = [
  { path: '/dashboard', label: '📊 仪表板', icon: 'dashboard' },
  { path: '/map-monitoring', label: '🗺️ 实时地图', icon: 'map' },
  { path: '/agv-management', label: '🚛 AGV管理', icon: 'agv' },
  { path: '/task-scheduling', label: '📋 任务调度', icon: 'task' },
  { path: '/system-monitoring', label: '📈 系统监控', icon: 'monitor' },
  { path: '/system-settings', label: '⚙️ 系统设置', icon: 'settings' }
]

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '200px'" class="app-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          {{ isCollapsed ? '🚀' : 'AGV Dashboard' }}
        </div>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="isCollapsed"
        @select="(path: string) => router.push(path)"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
        >
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主容器 -->
    <el-container class="main-container">
      <!-- 顶部栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <el-button
            text
            @click="toggleCollapse"
            style="color: white; font-size: 20px"
          >
            ☰
          </el-button>
          <span class="header-title">{{ route.meta.title || 'AGV调度系统' }}</span>
        </div>
        <div class="header-right">
          <el-button type="primary" text style="color: white">
            👤 用户
          </el-button>
          <el-divider direction="vertical" style="background-color: rgba(255, 255, 255, 0.3)" />
          <el-button type="primary" text style="color: white">
            🔔 通知
          </el-button>
          <el-divider direction="vertical" style="background-color: rgba(255, 255, 255, 0.3)" />
          <el-button type="primary" text style="color: white">
            🚪 退出
          </el-button>
        </div>
      </el-header>

      <!-- 主要内容区 -->
      <el-main class="app-main">
        <router-view />
      </el-main>

      <!-- 底部栏 -->
      <el-footer class="app-footer">
        <p>&copy; 2026 OpenTCS AGV 调度系统 v1.0.0 | 技术支持: admin@example.com</p>
      </el-footer>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
}

.app-sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  border-right: 1px solid #ecf0f1;
  transition: width 0.3s;
  overflow: hidden;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.logo {
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  padding: 0 10px;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(90deg, #2c3e50 0%, #3498db 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  color: white;
  gap: 15px;
}

.header-title {
  font-size: 18px;
  font-weight: bold;
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-main {
  flex: 1;
  background-color: #f5f7fa;
  overflow-y: auto;
  padding: 0;
}

.app-footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 15px;
  border-top: 1px solid #ecf0f1;
  font-size: 12px;
}

.app-footer p {
  margin: 0;
}

/* 菜单样式自定义 */
:deep(.el-menu) {
  background-color: transparent;
  border: none;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.7);
  background-color: transparent !important;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(52, 149, 235, 0.8) !important;
  color: white !important;
  border-left: 3px solid #3498db !important;
}
</style>
