<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { path: '/dashboard', label: '仪表板', icon: '📊' },
  { path: '/map-monitoring', label: '实时地图', icon: '🗺️' },
  { path: '/agv-management', label: 'AGV管理', icon: '🚛' },
  { path: '/task-scheduling', label: '任务调度', icon: '📋' },
  { path: '/system-monitoring', label: '系统监控', icon: '📈' },
  { path: '/system-settings', label: '系统设置', icon: '⚙️' }
]
</script>

<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <div class="app-header">
      <div class="header-brand">
        <span class="brand-icon">🚀</span>
        <span class="brand-text">OpenTCS AGV 调度系统</span>
      </div>
      <div class="header-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: route.path === item.path }"
          @click="router.push(item.path)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn">👤 用户</button>
        <button class="action-btn">🔔 通知</button>
        <button class="action-btn">🚪 退出</button>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="app-main">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  overflow: hidden;
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  height: 100%;
}

.app-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0a1828 0%, #1a2a4a 100%);
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  height: 70px;
  background: linear-gradient(90deg, rgba(10, 24, 40, 0.95) 0%, rgba(26, 42, 74, 0.95) 100%);
  border-bottom: 2px solid #00ff88;
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.15);
  gap: 20px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  white-space: nowrap;
}

.brand-icon {
  font-size: 20px;
}

.brand-text {
  letter-spacing: 1px;
}

.header-menu {
  display: flex;
  gap: 5px;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 500;
}

.menu-item:hover {
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
  transform: translateY(-2px);
}

.menu-item.active {
  background: rgba(0, 255, 136, 0.25);
  color: #00ff88;
  border-bottom: 2px solid #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}

.menu-icon {
  font-size: 14px;
}

.menu-label {
  letter-spacing: 0.5px;
}

.header-actions {
  display: flex;
  gap: 12px;
  white-space: nowrap;
}

.action-btn {
  padding: 6px 14px;
  border: 1px solid rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.08);
  color: #00ddff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.action-btn:hover {
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.15);
  color: #00ff88;
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.2);
}

.app-main {
  flex: 1;
  overflow: hidden;
  padding: 0;
}
</style>
