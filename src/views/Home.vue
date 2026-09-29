<template>
  <div class="home-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>欢迎来到 Dashboard</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-statistic title="计数器" :value="mainStore.count" />
        </el-col>
      </el-row>
      <el-divider />
      <el-space>
        <el-button type="primary" @click="mainStore.increment">
          增加
        </el-button>
        <el-button @click="mainStore.decrement">
          减少
        </el-button>
        <el-button @click="navigateTo('/about')">
          去 About 页面
        </el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useMainStore } from '../stores'
import { useRouter } from 'vue-router'

const mainStore = useMainStore()
const router = useRouter()

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
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
