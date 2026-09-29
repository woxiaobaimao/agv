# openTCS 实时地图监控页面

这是一个基于 Vue 3 + Vite 的 openTCS AGV 调度系统实时地图监控页面。

## 功能特性

### 1. 实时地图渲染
- **Canvas 绘制**：使用 HTML5 Canvas 高效渲染地图
- **自动缩放**：根据点的坐标范围自动计算缩放比例和位置
- **响应式布局**：根据窗口大小自动调整 canvas 尺寸

### 2. 地图元素显示
- **地图点**（Points）
  - 蓝色小圆点表示地图上的固定点
  - 显示点名称标签
  - 支持不同类型的点（HALT_POSITION、PARK_POSITION 等）

- **路径**（Paths）
  - 灰色直线连接相邻点
  - 箭头显示路径方向
  - 表示 AGV 可以行驶的路线

- **车辆**（Vehicles）
  - 彩色圆点表示车辆
  - 不同车辆使用不同颜色：
    - Vehicle-01: 红色 (#e74c3c)
    - Vehicle-02: 绿色 (#2ecc71)
    - Vehicle-03: 蓝色 (#3498db)
    - Vehicle-04: 橙色 (#f39c12)
  - 显示车辆简称（V1、V2、V3、V4）
  - 车辆位置跟随其当前所在的点

### 3. 实时更新
- 每 1 秒自动获取最新车辆位置
- 使用 requestAnimationFrame 实现流畅的实时渲染
- 无需手动刷新，自动同步车辆状态

### 4. 车辆状态面板
- 显示所有车辆的实时信息：
  - 车辆名称
  - 当前位置（所在点名称）
  - 运行状态
  - 能量等级（如果可用）

### 5. 图例说明
- 地图点图例
- 各车辆颜色标识
- 快速了解地图含义

## 文件结构

```
src/
├── views/
│   └── MapMonitoring.vue          # 主地图监控组件
├── types/
│   └── map.ts                     # 地图相关的类型定义
├── utils/
│   └── mapRenderer.ts             # 地图渲染工具类和函数
├── composables/
│   └── useMapCanvas.ts            # Canvas 操作的组合式函数
└── api/
    └── index.ts                   # API 客户端
```

## 类型定义

### Point
```typescript
interface Point {
  name: string
  position: {
    x: number      // X 坐标（毫米）
    y: number      // Y 坐标（毫米）
    z?: number     // Z 坐标（可选）
  }
  type: string     // 点类型（HALT_POSITION、PARK_POSITION 等）
  // 其他字段...
}
```

### Vehicle
```typescript
interface Vehicle {
  name: string
  currentPosition: string      // 当前所在点的名称
  state: string               // 车辆状态
  energyLevel?: number        // 电能等级百分比（可选）
}
```

### Path
```typescript
interface Path {
  name: string
  srcPointName: string        // 起点名称
  destPointName: string       // 终点名称
}
```

## API 接口

### 获取地图模型
```
GET /v1/plantModel
```

返回完整的地图数据，包括点、路径和车辆配置

**响应示例**：
```json
{
  "name": "Demo-01",
  "points": [
    {
      "name": "Point-0001",
      "position": { "x": 31000, "y": 11000, "z": 0 },
      "type": "HALT_POSITION"
    }
  ],
  "paths": [
    {
      "name": "Point-0001 --- Point-0002",
      "srcPointName": "Point-0001",
      "destPointName": "Point-0002"
    }
  ],
  "vehicles": [
    {
      "name": "Vehicle-01",
      "currentPosition": "Point-0001",
      "state": "IDLE"
    }
  ]
}
```

### 获取车辆列表
```
GET /v1/vehicles
```

返回当前所有车辆的实时状态

**响应示例**：
```json
[
  {
    "name": "Vehicle-01",
    "currentPosition": "Point-0001",
    "state": "IDLE",
    "energyLevel": 95
  }
]
```

## 环境配置

编辑 `.env` 文件配置 API 服务器地址：

```env
VITE_API_BASE_URL=http://localhost:55200
VITE_APP_TITLE=OpenTCS Dashboard
```

## 运行方式

### 开发模式
```bash
npm install
npm run dev
```

访问 `http://localhost:5173`，进入 "🗺️ 实时地图" 页面

### 生产构建
```bash
npm run build
npm run preview
```

## 技术细节

### 坐标变换
地图坐标系统需要进行以下变换才能显示在 Canvas 上：

1. **边界计算**：找到所有点的最小/最大坐标
2. **缩放计算**：根据 Canvas 大小和点的范围计算缩放因子
3. **中心对齐**：将地图中心对齐到 Canvas 中心
4. **坐标映射**：将世界坐标转换为 Canvas 像素坐标

```typescript
const worldToCanvas = (x: number, y: number) => {
  // 根据边界、缩放和偏移量计算 canvas 坐标
  const canvasX = centerX + (x - mapCenterX) * scale
  const canvasY = centerY + (y - mapCenterY) * scale
  return { canvasX, canvasY }
}
```

### 渲染流程
1. 清空 Canvas
2. 绘制路径（背景）
3. 绘制地图点
4. 绘制车辆（前景）
5. 使用 requestAnimationFrame 循环渲染

### 性能优化
- 使用 MapRenderer 类统一管理渲染逻辑
- 缓存点的 Map 数据结构（O(1) 查询）
- 使用 requestAnimationFrame 避免过度重绘
- 限制更新频率（每 1 秒查询一次车辆数据）

## 自定义和扩展

### 修改车辆颜色
在 `MapMonitoring.vue` 中的 `getVehicleColor` 函数：

```typescript
const getVehicleColor = (vehicle: Vehicle): string => {
  const colors: { [key: string]: string } = {
    'Vehicle-01-VDA5050-2.0': '#e74c3c',  // 修改这里
    'Vehicle-02': '#2ecc71',
    // ...
  }
  return colors[vehicle.name] || '#e74c3c'
}
```

### 修改点或路径的样式
编辑 `src/utils/mapRenderer.ts` 中的 `drawPoints` 或 `drawPaths` 方法

### 添加更多交互功能
- 鼠标悬停显示详细信息
- 点击地图点查看相关数据
- 拖拽平移、滚轮缩放
- 暂停/继续实时更新

## 常见问题

### Q: 地图显示为空或只显示一个点
**A**: 确保 openTCS 后端服务正在运行，且 API 地址配置正确。检查浏览器控制台是否有错误信息。

### Q: 车辆位置不更新
**A**: 检查 `/v1/vehicles` 接口是否返回了最新数据。如果数据没变化，说明车辆确实在该位置停留。

### Q: Canvas 显示不清晰或模糊
**A**: 这通常是高 DPI 屏幕的问题。Canvas 已设置 `clientWidth/clientHeight`，应该会自动适配。

### Q: 地图太小或太大
**A**: 自动缩放应该能正确处理。如果需要手动调整，可以修改 `calculateBounds` 函数中的 `PADDING` 值。

## 浏览器兼容性

- Chrome/Edge：完全支持
- Firefox：完全支持
- Safari：完全支持
- IE：不支持（需要现代 JavaScript）

## 许可证

MIT License - 仅供学习和商业项目使用
