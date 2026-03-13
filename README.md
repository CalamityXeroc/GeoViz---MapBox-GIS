# 🗺️ GeoViz - MapBox GIS 可视化编辑器

一个功能强大的**地理信息系统（GIS）可视化编辑工具**，基于 MapBox GL 构建。支持地理数据的绘制、编辑、导入导出，以及中国地理数据的可视化展示。

**🌐 在线演示**: https://www.bst-note.top/maps

![GeoViz Map Editor](https://raw.githubusercontent.com/your-repo/gis-viz-editor/main/public/preview.png)

## ✨ 功能特性

- 🗺️ **智能底图** - 支持矢量自建样式/卫星底图切换（Mapbox）
- 🎨 **专业绘制工具** - 点、线、面绘制和高级样式定制
- 📥 **灵活的数据处理** - 支持 GeoJSON、KML、CSV、PNG/JPEG 格式的导入导出
- 🎯 **丰富的交互功能** - 地图缩放、飞入、绘制要素查询
- 📱 **完美的响应式设计** - 无缝支持桌面、平板和移动设备

## 技术栈

- **前端**: Vue 3 + Vite
- **地图**: MapBox GL、MapBox GL Draw
- **底图源**: Mapbox 自建样式 + Mapbox 卫星样式
- **构建**: Vite 2.x
- **后端**: Node.js/Express

## 快速开始

### 安装依赖

```bash
npm install
cd backend && npm install
cd ..
```

### 开发模式

启动前端开发服务器：
```bash
npm run dev
```

启动后端代理服务器（另一个终端）：
```bash
npm run backend
```

或一键启动所有服务：
```bash
start-all.bat  # Windows
bash start-all.sh  # Linux/macOS
```

访问 http://localhost:3000 即可使用

### 生产构建

```bash
npm run build
```

## 📸 项目演示

### 在线体验
🌐 **完整版演示**: https://www.bst-note.top/maps

可以直接访问在线版本体验完整功能，包括：
- 实时地图编辑
- 数据导入导出
- 多底图切换（自建矢量样式 / 卫星）

## 项目结构

```
src/
├── App.vue                      # 主应用组件
├── main.js                      # 应用入口
├── views/
│   └── Maps.vue                 # 地图编辑器主组件
└── assets/
    └── styles/
        └── main.css             # 全局样式

backend/
├── src/
│   ├── server.js                # Express 服务器
│   ├── config/                  # 配置文件
│   ├── controllers/             # 业务逻辑
│   ├── models/                  # 数据模型
│   └── routes/                  # 路由
├── package.json
└── .env                         # 后端环境变量

public/
├── index.html                   # HTML 模板
├── geoData/
│   ├── 中国_省.geojson          # 中国省级边界
│   ├── 全国各省森林覆盖率2022.csv  # 森林数据
│   └── ...
└── ...
```

## 环境变量配置

### 后端环境配置
在 `backend/.env` 中配置：

```env
# 必需
PORT=3001

# 可选（如使用数据库）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_website
DB_USER=postgres
DB_PASSWORD=123456

# 其他
NODE_ENV=development
UPLOAD_PATH=./uploads
```

### 前端环境配置
在项目根目录 `.env.local` 中配置：

```env
VITE_MAPBOX_TOKEN=your_mapbox_access_token
```

当前默认示例样式：
- 矢量底图：`mapbox://styles/xeroc/cmknj1u67000901ra8gc956tv`
- 卫星底图：`mapbox://styles/mapbox/satellite-streets-v12`

## 使用指南

### 底图操作
- 点击左侧面板的"矢量"/"卫星"切换底图类型
- 使用右上角导航控件缩放和旋转地图
- 勾选图层复选框显示/隐藏特定图层

### 绘制工具
1. 点击左侧工具栏选择绘制工具（点/线/面）
2. 在地图上点击绘制几何
3. 使用样式面板自定义颜色、宽度、透明度等
4. 按 `Esc` 键退出绘制模式

### 数据管理
- **导入**: 支持 GeoJSON 和 KML 格式的文件导入
- **导出**: 支持导出为 GeoJSON、KML、CSV、PNG/JPEG 等格式
- **保存**: 数据自动保存到浏览器 LocalStorage

### 地图操作
- 点击"重置地图"恢复默认视角（北京城区）

## 外部数据源

- **阿里云区域选择器**: 快速选择行政区域
- **POI86**: 获取高德 POI 数据
- **Mapbox Studio**: 自定义地图样式管理

## 许可证

MIT

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。
