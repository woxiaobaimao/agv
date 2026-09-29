<template>
  <div class="about-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>About 页面</span>
        </div>
      </template>
      <el-alert
        title="项目信息"
        type="info"
        description="这是一个 Vue 3 + TypeScript + Vite 的项目，已配置了 axios、router、pinia 和 element-plus。"
        :closable="false"
      />
      <el-divider />
      <el-descriptions :column="1" border>
        <el-descriptions-item label="项目名称">
          opentcs-dashboard
        </el-descriptions-item>
        <el-descriptions-item label="框架版本">
          Vue 3
        </el-descriptions-item>
        <el-descriptions-item label="开发工具">
          TypeScript + Vite
        </el-descriptions-item>
        <el-descriptions-item label="UI 框架">
          Element Plus
        </el-descriptions-item>
      </el-descriptions>
      <el-divider />
      <el-button type="primary" @click="goHome">
        返回首页
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.about-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
