import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '仪表板' }
  },
  {
    path: '/map-monitoring',
    name: 'MapMonitoring',
    component: () => import('../views/MapMonitoring.vue'),
    meta: { title: '实时地图' }
  },
  {
    path: '/agv-management',
    name: 'AGVManagement',
    component: () => import('../views/AGVManagement.vue'),
    meta: { title: 'AGV管理' }
  },
  {
    path: '/task-scheduling',
    name: 'TaskScheduling',
    component: () => import('../views/TaskScheduling.vue'),
    meta: { title: '任务调度' }
  },
  {
    path: '/system-monitoring',
    name: 'SystemMonitoring',
    component: () => import('../views/SystemMonitoring.vue'),
    meta: { title: '系统监控' }
  },
  {
    path: '/system-settings',
    name: 'SystemSettings',
    component: () => import('../views/SystemSettings.vue'),
    meta: { title: '系统设置' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: { title: '关于' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
