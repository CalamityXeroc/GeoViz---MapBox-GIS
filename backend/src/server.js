const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');
const blogRoutes = require('./routes/blogRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;  // 默认端口改为 5000，与测试环境一致

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json({ limit: '50mb' })); // 解析 JSON 请求体，支持大文件
app.use(express.urlencoded({ limit: '50mb', extended: true })); // 解析 URL 编码请求体
app.use(morgan('dev')); // 请求日志

// --- 调试中间件：打印所有请求路径，用于排查 Nginx 代理错误 ---
app.use((req, res, next) => {
  // 忽略 Vite 的心跳请求日志
  if (req.url === '/__vite_ping') return next();
  console.log(`🔍 [收到请求] ${req.method} ${req.url}`);
  next();
});

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: '🎉 个人网站 API 服务正在运行',
    version: '1.0.0',
    endpoints: {
      blogs: '/api/blog',
      upload: '/api/upload',
      comments: '/api/comments'
    }
  });
});

// API 路由
app.use('/api/blog', blogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/comments', commentRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 强制监听 0.0.0.0 以允许外部访问（容器/服务器环境必要）
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 服务器成功启动！`);
      console.log(`📡 监听地址: http://0.0.0.0:${PORT}`);
      console.log(`📝 本地访问: http://localhost:${PORT}`);
      console.log(`📦 当前环境: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
