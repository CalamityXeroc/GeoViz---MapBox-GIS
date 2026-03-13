# MapBox GIS 可视化编辑器 - 项目结构

## 目录树

```
MapBox-Visualization/
├── src/                            # Vue 前端源代码
│   ├── App.vue                     # 主应用组件
│   ├── main.js                     # 应用入口点
│   ├── assets/                     # 资源文件
│   │   └── styles/
│   │       └── main.css            # 全局样式
│   └── views/
│       └── Maps.vue                # 地图编辑器核心组件（2138 行）
│
├── backend/                        # Node.js 后端
│   ├── src/
│   │   ├── server.js               # Express 服务器配置
│   │   ├── config/
│   │   │   ├── database.js         # 数据库配置
│   │   │   ├── upload.js           # 上传配置
│   │   │   └── initDatabase.js     # 数据库初始化
│   │   ├── controllers/
│   │   │   ├── blogController.js   # 博客控制器
│   │   │   └── commentController.js# 评论控制器
│   │   ├── models/
│   │   │   ├── Blog.js             # 博客模型
│   │   │   ├── Comment.js          # 评论模型
│   │   │   └── MapMarker.js        # 地图标记模型
│   │   └── routes/
│   │       ├── blogRoutes.js       # 博客路由
│   │       ├── commentRoutes.js    # 评论路由
│   │       └── uploadRoutes.js     # 上传路由
│   ├── uploads/                    # 上传文件目录
│   ├── package.json
│   ├── .env                        # 后端环境变量
│   └── .env.example                # 环境变量示例
│
├── public/                         # 静态资源
│   ├── index.html                  # HTML 入口
│   ├── geoData/                    # 地理数据
│   │   ├── 中国_省.geojson         # 中国省级边界（GeoJSON）
│   │   ├── 北京边界.geojson        # 北京市边界
│   │   ├── 全国各省森林覆盖率2022.csv  # 森林覆盖率数据
│   │   ├── sample-import.geojson   # 示例导入数据
│   │   └── ...
│   ├── picture/                    # 图片资源
│   └── videos/                     # 视频资源
│
├── .env.local                      # 本地环境变量
├── .env.example                    # 环境变量示例
├── .gitignore                      # Git 忽略规则
├── index.html                      # Vite 入口 HTML
├── vite.config.js                  # Vite 配置
├── package.json                    # 项目依赖
├── package-lock.json               # 锁定版本
│
├── README.md                       # 项目说明
├── README_zh-CN.md                 # 中文说明
├── STARTUP_GUIDE.md                # 启动指南
├── PROJECT_STRUCTURE.md            # 本文档
│
├── start-all.bat                   # Windows 一键启动脚本
├── start-frontend.bat              # Windows 前端启动
├── start-backend.bat               # Windows 后端启动
├── start-all.sh                    # Linux/Mac 启动脚本
├── start-frontend.sh               # Linux/Mac 前端启动
├── start-backend.sh                # Linux/Mac 后端启动
│
└── dist/                           # 生产构建输出（npm run build）
    ├── index.html
    ├── assets/
    └── ...
```

## 核心模块说明

### 前端模块

#### Maps.vue（主要功能）
- **模板**: 地图容器、工具箱UI、图例、浮动按钮
- **功能**:
  - 地图初始化和交互
  - MapBox GL Draw 集成
  - 点线面绘制和样式定制
  - 图层显示/隐藏切换
  - 底图类型切换（矢量/卫星）
  - 数据导入导出（GeoJSON/KML/CSV/PNG/JPEG）
  - LocalStorage 持久化
  - 响应式设计

#### 主要脚本功能
- `switchBaseMap()` - 切换底图类型（矢量自建样式 / 卫星）
- `setDrawMode()` - 设置绘制模式
- `exportGeoJSON()` / `exportKML()` / `exportCSV()` - 数据导出
- `handleFileImport()` - 文件导入
- `resetMap()` - 重置地图

### 后端模块

#### Express 服务器（server.js）
- 路由配置
- 静态文件服务
- CORS 处理

#### 路由
- `/api/blog` - 博客相关
- `/api/comments` - 评论相关
- `/api/upload` - 文件上传

### 数据文件

#### GeoJSON 数据
- `中国_省.geojson` - 全国34个省级行政区边界
- `北京边界.geojson` - 北京市边界详细数据
- `sample-import.geojson` - 示例导入文件

#### CSV 数据
- `全国各省森林覆盖率2022.csv` - 2022年全国各省森林覆盖率统计

## 依赖关系

### 前端依赖
```
vue@3.2.0
mapbox-gl@3.18.0
@mapbox/mapbox-gl-draw@1.4.3
@mapbox/mapbox-gl-language@1.0.1
axios@1.13.2
```

### 后端依赖
```
express
cors
dotenv
multer (文件上传)
mysql/postgresql (可选)
```

## 数据流向

```
用户交互
    ↓
Vue 组件事件处理
    ↓
MapBox GL 操作
    ↓
地图绘制/图层更新
    ↓
特定操作（导出/导入/保存）
    ↓
本地存储/服务器/文件下载
```

## 配置说明

### vite.config.js
- 端口: 3000
- 代理配置: `/api` → http://127.0.0.1:3001
- 构建目标: es2020

### backend/.env
```env
PORT=3001
NODE_ENV=development
```

### .env.local（前端）
```env
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

## 构建和部署

### 开发模式
```bash
npm run dev              # 启动前端
npm run backend         # 启动后端（另一个终端）
```

### 生产构建
```bash
npm run build           # 构建前端
npm run serve           # 预览构建结果
```

### Docker 部署（可选）
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000 3001
CMD ["npm", "run", "backend"] & ["npm", "run", "serve"]
```

## 文件大小说明

- Maps.vue: ~2138 行（完整的地图编辑器实现）
- package.json: 依赖管理
- public/geoData/: 地理数据 (~5-10MB)

## 维护建议

1. **定期更新依赖**
   ```bash
   npm update
   npm audit fix
   ```

2. **性能优化**
   - 图层组织和索引
   - 绘制要素分页加载
   - 缓存策略

3. **扩展方向**
   - 在线数据持久化
   - 实时协作编辑
   - 高级分析工具
   - 3D 地形可视化

## 常见修改位置

| 功能 | 文件位置 |
|------|--------|
| UI 界面 | `src/views/Maps.vue` (template) |
| 样式主题 | `src/assets/styles/main.css` |
| 服务器配置 | `backend/src/server.js` |
| 路由定义 | `backend/src/routes/` |
| 环境变量 | `.env.local` / `backend/.env` |

---

**最后更新**: 2026年2月
**版本**: 1.0.0
