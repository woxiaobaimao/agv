<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1>OpenTCS Dashboard</h1>
        <el-menu
          :default-active="$route.path"
          mode="horizontal"
          @select="(index: string) => router.push(index)"
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    <el-main class="app-main">
      <router-view />
    </el-main>
    <el-footer class="app-footer">
      <p>&copy; 2026 OpenTCS Dashboard. All rights reserved.</p>
    </el-footer>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #545c64;
  display: flex;
  align-items: center;
  padding: 0 20px !important;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: white;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  background-color: #f5f7fa;
  overflow-y: auto;
}

.app-footer {
  background-color: #545c64;
  color: white;
  text-align: center;
  padding: 20px !important;
}

.app-footer p {
  margin: 0;
}

:deep(.el-menu) {
  background-color: transparent;
  border: none;
}

:deep(.el-menu-item) {
  color: white;
}

:deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}
</style>
