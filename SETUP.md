# OpenTCS Dashboard - 项目配置说明

## 项目概览

这是一个基于 Vue 3 + TypeScript + Vite 的现代化前端项目，已集成以下主要库：

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全的 JavaScript 超集
- **Vite**: 下一代前端构建工具
- **Vue Router**: Vue 应用的路由库
- **Pinia**: Vue 应用状态管理库
- **Axios**: HTTP 客户端库
- **Element Plus**: Vue 3 UI 组件库

## 项目结构

```
src/
├── api/              # API 请求相关
│   └── request.ts   # Axios 实例配置和拦截器
├── router/          # 路由配置
│   └── index.ts     # 路由定义
├── stores/          # Pinia 状态管理
│   └── index.ts     # 主状态 store
├── views/           # 页面组件
│   ├── Home.vue     # 首页
│   └── About.vue    # 关于页面
├── components/      # 可复用组件
├── assets/          # 静态资源
├── App.vue          # 根组件
├── main.ts          # 应用入口
└── style.css        # 全局样式
```

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```
项目将在 http://localhost:5173 启动

### 生产构建
```bash
pnpm build
```

### 预览构建结果
```bash
pnpm preview
```

## 配置说明

### 环境变量

项目支持以下环境变量配置：

- `.env` - 开发环境配置
- `.env.production` - 生产环境配置

主要变量：
- `VITE_API_BASE_URL`: API 服务地址
- `VITE_APP_TITLE`: 应用标题

### Axios 配置

Axios 实例位于 `src/api/request.ts`，包含：
- 自动添加 Bearer token 到请求头
- 统一的错误处理
- 可配置的超时时间和基础 URL

### 路由配置

路由配置位于 `src/router/index.ts`：
- 支持懒加载组件
- 自动路由匹配
- 可扩展的路由定义

### 状态管理

使用 Pinia 进行状态管理，主 store 位于 `src/stores/index.ts`：
- 提供 `count` 状态
- `increment` 和 `decrement` 方法

### UI 框架

Element Plus 已配置为中文语言环境，包含：
- 丰富的组件库
- 完整的图标库
- 响应式设计

## 开发建议

### 添加新的 API 接口

在 `src/api/` 目录创建新的文件：

```typescript
import request from './request'

export const getUserList = () => {
  return request.get('/users')
}

export const createUser = (data: any) => {
  return request.post('/users', data)
}
```

### 添加新的路由

编辑 `src/router/index.ts`：

```typescript
{
  path: '/users',
  name: 'Users',
  component: () => import('../views/Users.vue')
}
```

### 使用状态管理

在组件中使用 Pinia store：

```typescript
import { useMainStore } from '@/stores'

export default {
  setup() {
    const store = useMainStore()
    
    return {
      count: computed(() => store.count),
      increment: () => store.increment()
    }
  }
}
```

### 使用 Axios 请求

```typescript
import request from '@/api/request'

const data = await request.get('/endpoint')
```

## 路径别名

项目配置了 `@` 别名指向 `src` 目录，可以这样导入：

```typescript
// 而不是
import { useMainStore } from '../../../stores'

// 使用
import { useMainStore } from '@/stores'
```

## 构建优化

项目已配置代码分割，将以下库分离为独立 chunk：
- element-plus
- vue-router
- pinia

这有助于减小主文件大小和改善加载性能。

## 常见问题

### Q: 如何修改 API 地址？
A: 编辑 `.env` 或 `.env.production` 文件中的 `VITE_API_BASE_URL` 变量。

### Q: 如何添加中文以外的语言？
A: 修改 `src/main.ts` 中 Element Plus 的 locale 配置。

### Q: 如何扩展 Axios 功能？
A: 在 `src/api/request.ts` 中添加新的拦截器或配置。

## 下一步

1. 根据需要在 `src/views` 下创建页面
2. 在 `src/api` 下创建 API 服务模块
3. 在 `src/stores` 下扩展状态管理
4. 在 `src/components` 下创建可复用组件

祝开发愉快！
