#!/bin/bash
# 移动端工具箱修复 - 快速测试脚本

echo "🧰 MapBox 移动端工具箱 - 快速验证"
echo "===================================="
echo ""

# 检查 dist 文件夹
if [ -d "dist" ]; then
    echo "✅ 生产构建文件存在"
    echo "   位置: $(pwd)/dist"
    echo "   大小: $(du -sh dist | cut -f1)"
else
    echo "❌ 未找到 dist 文件夹，需要先运行: npm run build"
    exit 1
fi

echo ""
echo "📱 测试清单："
echo ""
echo "桌面浏览器测试 (F12 进入手机模拟):"
echo "  [ ] iPhone 12 - 390px"
echo "  [ ] iPad - 820px"
echo "  [ ] Galaxy S21 - 360px"
echo ""
echo "真实设备测试:"
echo "  [ ] iOS 设备 - Safari 浏览器"
echo "  [ ] Android 设备 - Chrome 浏览器"
echo ""
echo "验证项目:"
echo "  [ ] FAB 按钮显示 (绿色圆形，右下角)"
echo "  [ ] 点击 FAB 打开工具箱"
echo "  [ ] 工具箱显示地图控制选项"
echo "  [ ] 点击背景关闭工具箱"
echo "  [ ] 旋转屏幕，工具箱适配"
echo ""
echo "===================================="
echo ""
echo "🚀 启动后端:"
echo "   npm run backend"
echo ""
echo "🌐 启动前端 (开发模式):"
echo "   npm run dev"
echo ""
echo "📂 完整文档:"
echo "   MOBILE_TOOLBOX_FIX.md"
echo ""
