# 实时地图监控 - 快速开始指南

## 1. 启动应用

```bash
cd d:\agv\RDS\opentcs-dashboard
npm install  # 首次运行需要安装依赖
npm run dev  # 启动开发服务器
```

打开浏览器访问 `http://localhost:5173`

## 2. 导航到地图监控页面

1. 在左侧菜单中点击 "🗺️ 实时地图"
2. 或者直接访问 `http://localhost:5173/#/map-monitoring`

## 3. 预期看到的内容

### 页面布局
```
┌─────────────────────────────────────────────────┐
│  实时地图监控          地图: Demo-01  车辆: 4    │
├─────────────────────────────────────────────────┤
│                                                  │
│              Canvas 地图显示区                   │
│                                                  │
│                                                  │
├─────────────────────────────────────────────────┤
│ 图例: ●地图点  ●V01  ●V02  ●V03  ●V04           │
└─────────────────────────────────────────────────┘
```

### 右侧车辆状态面板（宽屏）
- Vehicle-01-VDA5050-2.0：红色圆点
- Vehicle-02：绿色圆点
- Vehicle-03：蓝色圆点
- Vehicle-04：橙色圆点

## 4. 地图要素说明

### 地图点（蓝色圆点）
- 固定的停靠点
- 标有名称（如 Point-0001、Point-0002）
- 车辆必须经过这些点

### 路径（灰色线条）
- 连接两个地图点
- 箭头表示路径方向
- 代表 AGV 可行驶的路线

### 车辆（彩色圆点）
- 显示在其当前所在的地图点上
- 不同颜色区分不同车辆
- 中心显示车辆简称（V1、V2 等）

## 5. 实时更新验证

1. 打开 openTCS 管理系统
2. 命令某辆车移动到不同位置
3. 观察地图上的车辆位置实时更新
4. 每次更新时，右侧车辆列表也会同步更新

## 6. API 测试

### 测试获取地图数据
```bash
curl http://localhost:55200/v1/plantModel
```

应返回包含 points、paths 和 vehicles 的完整地图数据。

### 测试获取车辆数据
```bash
curl http://localhost:55200/v1/vehicles
```

应返回类似：
```json
[
  {
    "name": "Vehicle-01-VDA5050-2.0",
    "currentPosition": "Point-0001",
    "state": "IDLE",
    "energyLevel": 95
  }
]
```

## 7. 故障排查

### 问题：地图显示空白
**排查步骤**：
1. 检查浏览器控制台（F12）是否有错误
2. 确认 openTCS 服务在 `http://localhost:55200` 运行
3. 测试 API 接口是否可访问
4. 检查 `.env` 文件中的 `VITE_API_BASE_URL` 是否正确

### 问题：车辆位置不更新
**排查步骤**：
1. 查看浏览器网络选项卡，检查 `/v1/vehicles` 请求
2. 验证返回的 JSON 数据格式是否正确
3. 检查车辆的 `currentPosition` 字段是否有效
4. 确认车辆位置对应的点存在于 `points` 数组中

### 问题：地图显示不清晰/模糊
**解决方案**：
1. 这通常不会出现，Canvas 已正确配置 DPI
2. 如需调整，可修改 `PADDING` 常数来改变边距
3. 检查浏览器缩放是否为 100%

### 问题：页面加载缓慢
**优化方案**：
1. 减少车辆更新频率（改 `setInterval` 时间）
2. 关闭浏览器扩展程序
3. 检查网络连接速度

## 8. 代码示例：扩展功能

### 添加地图点点击事件
编辑 `MapMonitoring.vue`，在 `onMounted` 后添加：

```typescript
const canvasRef = ref<HTMLCanvasElement | null>(null)

const handleCanvasClick = (event: MouseEvent) => {
  if (!canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const clickY = event.clientY - rect.top
  
  // 检查点击是否在某个地图点上
  for (const point of plantModel.value?.points || []) {
    const { canvasX, canvasY } = worldToCanvas.value(
      point.position.x,
      point.position.y
    )
    const distance = Math.hypot(clickX - canvasX, clickY - canvasY)
    
    if (distance < 15) {
      console.log('点击了点:', point.name)
      // 处理点击逻辑
    }
  }
}

// 在 template 中添加
// <canvas ref="canvasRef" @click="handleCanvasClick"></canvas>
```

### 添加鼠标悬停提示
```typescript
const hoveredPoint = ref<string | null>(null)

const handleCanvasMouseMove = (event: MouseEvent) => {
  if (!canvasRef.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  hoveredPoint.value = null
  
  for (const point of plantModel.value?.points || []) {
    const { canvasX, canvasY } = worldToCanvas.value(
      point.position.x,
      point.position.y
    )
    const distance = Math.hypot(mouseX - canvasX, mouseY - canvasY)
    
    if (distance < 15) {
      hoveredPoint.value = point.name
      break
    }
  }
}
```

### 添加缩放功能
```typescript
const handleWheel = (event: WheelEvent) => {
  if (!canvasRef.value) return
  
  event.preventDefault()
  const factor = event.deltaY > 0 ? 0.9 : 1.1
  const rect = canvasRef.value.getBoundingClientRect()
  
  // 实现鼠标中心缩放
  // zoom(factor, event.clientX - rect.left, event.clientY - rect.top)
}
```

## 9. 性能指标

在浏览器性能工具（DevTools > Performance）中，应该看到：

- **FPS**: 60 fps（流畅渲染）
- **Frame Time**: < 16ms（60fps 目标）
- **Memory**: < 50MB（正常范围）
- **CPU**: < 10%（空闲状态）

## 10. 部署到生产环境

```bash
# 构建优化版本
npm run build

# 输出在 dist/ 目录
# 部署 dist/ 文件夹到 web 服务器

# 确保 openTCS API 地址在 .env.production 中正确配置
VITE_API_BASE_URL=https://your-opentcs-server.com
```

## 11. 联系和支持

如有问题，请检查：
1. `MAP_MONITORING_README.md` - 详细文档
2. 浏览器控制台的错误消息
3. 网络请求（F12 > Network 标签）
4. openTCS 后端日志

---

**创建日期**: 2026-09-29  
**版本**: 1.0.0  
**框架**: Vue 3 + Vite  
**类型检查**: TypeScript
