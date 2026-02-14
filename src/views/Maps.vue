<template>
  <div class="maps">
    <div class="map-header">
      <h1>我也不知道在做什么（（</h1>
      <p>正在开发中……</p>
    </div>
    
    <div class="map-wrapper">
      <div v-if="loading" class="loading-message">
        <span class="loader">Loading</span>
      </div>
      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      
      <!-- 手机端模态背景 -->
      <div
        class="toolbox-modal-overlay"
        v-show="!loading && !error && !toolboxCollapsed && isMobile"
        @click="toolboxCollapsed = true"
      ></div>

      <!-- 手机端浮动按钮 - 使用 v-if 保证在移动端始终存在 DOM -->
      <button
        v-if="isMobile"
        class="toolbox-fab"
        :style="{ display: toolboxCollapsed ? 'flex !important' : 'none !important' }"
        @click="toolboxCollapsed = false"
      >
        🧰
      </button>

      <!-- 工具箱面板 -->
      <div
        class="toolbox"
        :class="{ collapsed: toolboxCollapsed, mobile: isMobile }"
        v-show="!loading && !error && (!isMobile || !toolboxCollapsed)"
        :style="isMobile ? {} : { left: toolboxPos.x + 'px', top: toolboxPos.y + 'px' }"
      >
        <div class="toolbox-header" @mousedown="startDrag" style="cursor: grab;">
          <h3>图层控制</h3>
          <div style="display: flex; gap: 8px;">
            <button class="toolbox-close-btn" @click="toolboxCollapsed = true" title="折叠">
              ✕
            </button>
            <button class="toolbox-toggle" @click="toggleToolbox" :title="isToolboxOpen ? '收起' : '展开'">
              {{ isToolboxOpen ? '▼' : '▶' }}
            </button>
          </div>
        </div>
        <div v-if="isToolboxOpen" class="toolbox-content">
          <!-- 底图切换 -->
          <div class="layer-item">
            <label class="slider-control">
              <span>底图类型</span>
              <div class="button-group">
                <button 
                  @click="switchBaseMap('vec')"
                  :class="{ active: currentBaseMap === 'vec' }"
                  class="btn-map-type"
                >
                  矢量
                </button>
                <button 
                  @click="switchBaseMap('img')"
                  :class="{ active: currentBaseMap === 'img' }"
                  class="btn-map-type"
                >
                  卫星
                </button>
              </div>
            </label>
          </div>

          <!-- 图层开关 -->
          <div class="layer-item">
            <label class="layer-control">
              <input 
                type="checkbox" 
                :checked="getLayerVisibility('tdt-vec-layer')"
                @change="toggleLayer('tdt-vec-layer')"
              />
              <span>基础地图</span>
            </label>
          </div>
          
          <div class="layer-item">
            <label class="layer-control">
              <input 
                type="checkbox" 
                :checked="getLayerVisibility('tdt-cva-layer')"
                @change="toggleLayer('tdt-cva-layer')"
              />
              <span>地名注记</span>
            </label>
          </div>
          
          <div class="layer-item">
            <label class="layer-control">
              <input 
                type="checkbox" 
                :checked="getLayerVisibility('china-forest-fill')"
                @change="toggleLayer('china-forest-fill')"
              />
              <span>森林数据</span>
            </label>
          </div>

          <!-- 透明度控制 -->
          <div class="layer-item">
            <label class="slider-control">
              <span>森林数据透明度</span>
              <div class="slider-wrapper">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  v-model="layerOpacity" 
                  @input="updateLayerOpacity"
                  class="opacity-slider"
                />
                <span class="opacity-value">{{ layerOpacity }}%</span>
              </div>
            </label>
          </div>

          <!-- 分割线 -->
          <div class="divider"></div>



          <!-- 绘制工具 -->
          <div class="layer-item">
            <label class="slider-control">
              <span>绘制工具</span>
            </label>
          </div>

          <!-- 📍 点工具 + 样式 -->
          <div class="tool-with-style">
            <button 
              @click="setDrawMode('draw_point')"
              :class="{ active: currentDrawMode === 'draw_point' }"
              class="btn-draw-mode"
              style="width: 100%;"
            >
              📍 点工具
            </button>
            <div class="style-panel" v-show="currentDrawMode === 'draw_point'">
              <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">填充</label>
                  <input type="color" v-model="pointStyle.color" style="width: 100%; height: 20px; border: 1px solid #ddd; border-radius: 2px;">
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">描边</label>
                  <input type="color" v-model="pointStyle.strokeColor" style="width: 100%; height: 20px; border: 1px solid #ddd; border-radius: 2px;">
                </div>
              </div>
              <div style="display: flex; gap: 4px;">
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">半径 {{ pointStyle.radius }}</label>
                  <input type="range" v-model.number="pointStyle.radius" min="2" max="20" style="width: 100%;">
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">边宽 {{ pointStyle.strokeWidth }}</label>
                  <input type="range" v-model.number="pointStyle.strokeWidth" min="1" max="5" style="width: 100%;">
                </div>
              </div>
            </div>
          </div>

          <!-- 📏 线工具 + 样式 -->
          <div class="tool-with-style">
            <button 
              @click="setDrawMode('draw_line_string')"
              :class="{ active: currentDrawMode === 'draw_line_string' }"
              class="btn-draw-mode"
              style="width: 100%;"
            >
              📏 线工具
            </button>
            <div class="style-panel" v-show="currentDrawMode === 'draw_line_string'">
              <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                <div style="flex: 2;">
                  <label style="font-size: 9px; color: #666;">颜色</label>
                  <input type="color" v-model="lineStyle.color" style="width: 100%; height: 20px; border: 1px solid #ddd; border-radius: 2px;">
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">宽 {{ lineStyle.width }}</label>
                  <input type="range" v-model.number="lineStyle.width" min="1" max="10" style="width: 100%;">
                </div>
              </div>
              <div>
                <label style="font-size: 9px; color: #666;">线型</label>
                <select v-model="lineStyle.dashType" style="width: 100%; padding: 2px; font-size: 10px; border: 1px solid #ddd; border-radius: 2px;">
                  <option value="solid">实线</option>
                  <option value="dash">虚线</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 🔷 面工具 + 样式 -->
          <div class="tool-with-style">
            <button 
              @click="setDrawMode('draw_polygon')"
              :class="{ active: currentDrawMode === 'draw_polygon' }"
              class="btn-draw-mode"
              style="width: 100%;"
            >
              🔷 面工具
            </button>
            <div class="style-panel" v-show="currentDrawMode === 'draw_polygon'">
              <div style="display: flex; gap: 4px; margin-bottom: 4px;">
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">填充</label>
                  <input type="color" v-model="polygonStyle.fillColor" style="width: 100%; height: 20px; border: 1px solid #ddd; border-radius: 2px;">
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">边线</label>
                  <input type="color" v-model="polygonStyle.strokeColor" style="width: 100%; height: 20px; border: 1px solid #ddd; border-radius: 2px;">
                </div>
              </div>
              <div style="display: flex; gap: 4px;">
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">透明 {{ Math.round(polygonStyle.fillOpacity * 100) }}%</label>
                  <input type="range" v-model.number="polygonStyle.fillOpacity" min="0" max="1" step="0.1" style="width: 100%;">
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 9px; color: #666;">边宽 {{ polygonStyle.strokeWidth }}</label>
                  <input type="range" v-model.number="polygonStyle.strokeWidth" min="1" max="5" style="width: 100%;">
                </div>
              </div>
            </div>
          </div>

          <!-- 选择/删除工具 -->
          <div class="layer-item" style="margin-top: 8px;">
            <div class="button-group-vertical">
              <button 
                @click="setDrawMode('simple_select')"
                :class="{ active: currentDrawMode === 'simple_select' }"
                class="btn-draw-mode"
              >
                ✋ 选择
              </button>
              <button 
                @click="deleteSelected"
                class="btn-draw-mode btn-delete"
              >
                🗑️ 删除
              </button>
              <button @click="applyStyleToSelected" class="btn-draw-mode">
                🎯 应用样式到选中
              </button>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="divider"></div>

          <!-- 数据导入/导出 -->
          <div class="layer-item">
            <label class="slider-control">
              <span>导入/导出</span>
            </label>
          </div>

          <div class="layer-item">
            <div class="button-group-vertical">
              <button @click="triggerFileInput" class="btn-draw-mode">
                📥 导入GeoJSON/KML
              </button>
              <input 
                type="file" 
                ref="fileInput" 
                style="display: none" 
                accept=".geojson,.json,.kml"
                @change="handleFileImport"
              />
              <button @click="exportGeoJSON" class="btn-draw-mode">
                📤 导出GeoJSON
              </button>
              <button @click="exportKML" class="btn-draw-mode">
                🗺️ 导出KML
              </button>
              <button @click="exportCSV" class="btn-draw-mode">
                📊 导出CSV
              </button>
              <button @click="exportImage('png')" class="btn-draw-mode">
                🖼️ 导出PNG
              </button>
              <button @click="exportImage('jpeg')" class="btn-draw-mode">
                📸 导出JPEG
              </button>
            </div>
          </div>

          <!-- 数据下载 -->
          <div class="divider"></div>
          <div class="layer-item">
            <label class="slider-control">
              <span>📥 数据下载</span>
            </label>
          </div>
          <div class="layer-item">
            <div class="button-group-vertical">
              <button @click="openAliDataPortal" class="btn-draw-mode" style="font-size: 11px;">
                阿里云区域选择器
              </button>
              <button @click="openPOI86Portal" class="btn-draw-mode" style="font-size: 11px;">
                POI86（高德POI）
              </button>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="divider"></div>

          <!-- 快速操作 -->
          <div class="toolbox-actions">
            <button @click="clearAllFeatures" class="btn-danger">清空绘制</button>
            <button @click="resetMap" class="btn-reset">重置地图</button>
          </div>
        </div>
      </div>
      
      <!-- 图例组件 -->
      <div class="map-legend" v-show="!loading">
        <h4>中国森林覆盖率</h4>
        <div class="legend-scale">
          <span style="background: #f7fcf5"></span>
          <span style="background: #e5f5e0"></span>
          <span style="background: #c7e9c0"></span>
          <span style="background: #a1d99b"></span>
          <span style="background: #74c476"></span>
          <span style="background: #41ab5d"></span>
          <span style="background: #238b45"></span>
          <span style="background: #005a32"></span>
        </div>
        <div class="legend-labels">
          <span>0%</span>
          <span style="margin-left: auto">70%+</span>
        </div>
        <p class="legend-source">点击省份查看详情</p>
      </div>

      <div id="map" class="map-container"></div>
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from 'vue';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  name: 'Maps',
  setup() {
    let map = null;
    let draw = null; // 新增：MapboxDraw 实例
    const loading = ref(true);
    const error = ref(null);
    
    // 工具箱状态
    const isToolboxOpen = ref(true);
    const toolboxCollapsed = ref(false); // 手机端折叠状态
    const toolboxPos = ref({ x: 20, y: 100 });
    const isDragging = ref(false);
    const dragStart = ref({ x: 0, y: 0 });
    const currentBaseMap = ref('vec');
    const layerOpacity = ref(80);
    const isMobile = ref(false); // 是否手机端
    
    // 绘制工具状态
    const currentDrawMode = ref(null);
    const fileInput = ref(null);
    const drawnFeatures = ref([]);

    // 样式设置状态
    const pointStyle = ref({
      color: '#3bb2d0',
      strokeColor: '#ffffff',
      strokeWidth: 2,
      radius: 6
    });

    const lineStyle = ref({
      color: '#3bb2d0',
      width: 3,
      dashType: 'solid'
    });

    const polygonStyle = ref({
      fillColor: '#95E1D3',
      fillOpacity: 0.5,
      strokeColor: '#38a169',
      strokeWidth: 2
    });

    // 检查是否处于绘制模式
    const isDrawingMode = () => {
      return draw && draw.getMode && draw.getMode().startsWith('draw_');
    };

    // 手机端检测函数 - 使用多种方法确保准确检测
    const checkMobile = () => {
      // 方法1: 检查User Agent
      const userAgent = navigator.userAgent.toLowerCase();
      const isUserAgentMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // 方法2: 检查触摸设备
      const isTouchDevice = () => {
        return (('ontouchstart' in window) ||
                (navigator.maxTouchPoints > 0) ||
                (navigator.msMaxTouchPoints > 0));
      };
      
      // 方法3: 检查窗口宽度（降低阈值以涵盖更多设备）
      const isWindowMobile = window.innerWidth <= 1024;
      
      // 综合判断：User Agent 识别为移动设备，或是触摸设备，或窗口宽度小于1024px
      isMobile.value = isUserAgentMobile || (isTouchDevice() && isWindowMobile) || isWindowMobile;
      
      // 调试信息
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`📱 移动设备检测 - User Agent: ${isUserAgentMobile}, 触摸设备: ${isTouchDevice()}, 窗口宽: ${window.innerWidth}, 最终判定: ${isMobile.value}`);
      }
      
      // 手机端默认折叠工具箱（但先显示FAB）
      if (isMobile.value) {
        toolboxCollapsed.value = true;
      }
    };

    // 保持当前绘制模式（防止被 MapboxDraw 自动切回 simple_select）
    const keepCurrentMode = () => {
      if (!draw || !currentDrawMode.value) return;
      const targetMode = currentDrawMode.value;
      // 只有点模式需要重新进入（因为点是单次绘制）
      if (targetMode === 'draw_point') {
        setTimeout(() => {
          if (draw && currentDrawMode.value === 'draw_point') {
            draw.changeMode('draw_point');
            map.getCanvas().style.cursor = 'crosshair';
          }
        }, 0);
      }
    };

    // 获取图层可见性
    const getLayerVisibility = (layerId) => {
      if (!map || !map.getLayer(layerId)) {
        // 如果图层还未加载，返回 true（默认可见）
        return true;
      }
      const visibility = map.getLayoutProperty(layerId, 'visibility');
      // 默认情况下，如果没有设置 visibility，视为 'visible'
      return visibility !== 'none';
    };

    // 切换图层显示/隐藏
    const toggleLayer = (layerId) => {
      if (!map || !map.getLayer(layerId)) return;
      
      const visibility = map.getLayoutProperty(layerId, 'visibility');
      // 修复逻辑：如果是 'none' 则变为 'visible'，否则变为 'none'
      const newVisibility = visibility === 'none' ? 'visible' : 'none';
      map.setLayoutProperty(layerId, 'visibility', newVisibility);
    };

    // 更新图层透明度
    const updateLayerOpacity = () => {
      if (!map || !map.getLayer('china-forest-fill')) return;
      const opacity = layerOpacity.value / 100;
      map.setPaintProperty('china-forest-fill', 'fill-opacity', opacity * 0.8); // 保持基础透明度0.8
    };

    // 底图切换
    const switchBaseMap = (type) => {
      if (!map || !map.getSource('tdt-vec')) return;
      
      currentBaseMap.value = type;
      const vectorSource = map.getSource('tdt-vec');
      const tiledSource = map.getSource('tdt-cva');
      
      if (type === 'vec') {
        // 矢量图
        vectorSource.setTiles([
          '/api/tdt/vec_w/{z}/{x}/{y}'
        ]);
        tiledSource.setTiles([
          '/api/tdt/cva_w/{z}/{x}/{y}'
        ]);
      } else if (type === 'img') {
        // 卫星图 - 通过后端代理避免跨域问题
        vectorSource.setTiles([
          '/api/tdt/img_w/{z}/{x}/{y}'
        ]);
        tiledSource.setTiles([
          '/api/tdt/cia_w/{z}/{x}/{y}'
        ]);
      }
    };

    // 重置地图到初始位置和状态
    const resetMap = () => {
      if (!map) return;
      map.flyTo({
        center: [105, 36],
        zoom: 3.5,
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
      layerOpacity.value = 80;
      
      map.setLayoutProperty('tdt-vec-layer', 'visibility', 'visible');
      map.setLayoutProperty('tdt-cva-layer', 'visibility', 'visible');
      map.setLayoutProperty('china-forest-fill', 'visibility', 'visible');
      map.setPaintProperty('china-forest-fill', 'fill-opacity', 0.8);
    };

    // 设置绘制模式（驱动 MapboxDraw）
    const setDrawMode = (mode) => {
      if (!draw) return;
      
      // 再次点击同一模式 -> 切回 simple_select
      const target = currentDrawMode.value === mode ? 'simple_select' : mode;
      currentDrawMode.value = target === 'simple_select' ? null : mode;

      const modeMap = {
        draw_point: 'draw_point',
        draw_line_string: 'draw_line_string',
        draw_polygon: 'draw_polygon',
        simple_select: 'simple_select'
      };
      
      draw.changeMode(modeMap[target] || 'simple_select');
      
      // 光标反馈
      if (target === 'draw_point' || target === 'draw_line_string' || target === 'draw_polygon') {
        map.getCanvas().style.cursor = 'crosshair';
      } else {
        map.getCanvas().style.cursor = '';
      }
    };

    // 样式应用函数
    const applyDefaultStyleProps = (feature) => {
      if (feature.geometry.type === 'Point') {
        feature.properties = {
          ...(feature.properties || {}),
          user_pointColor: pointStyle.value.color,
          user_pointRadius: pointStyle.value.radius,
          user_pointStrokeColor: pointStyle.value.strokeColor,
          user_pointStrokeWidth: pointStyle.value.strokeWidth
        };
      } else if (feature.geometry.type === 'LineString') {
        feature.properties = {
          ...(feature.properties || {}),
          user_lineColor: lineStyle.value.color,
          user_lineWidth: lineStyle.value.width,
          user_lineDash: lineStyle.value.dashType
        };
      } else if (feature.geometry.type === 'Polygon') {
        feature.properties = {
          ...(feature.properties || {}),
          user_fillColor: polygonStyle.value.fillColor,
          user_fillOpacity: polygonStyle.value.fillOpacity,
          user_strokeColor: polygonStyle.value.strokeColor,
          user_strokeWidth: polygonStyle.value.strokeWidth
        };
      }
    };

    // 应用样式到选中要素
    const applyStyleToSelected = () => {
      if (!draw) return;
      const selected = draw.getSelectedIds();
      if (!selected.length) {
        alert('请先选择要修改样式的要素');
        return;
      }
      
      selected.forEach(id => {
        const feature = draw.get(id);
        if (feature.geometry.type === 'Point') {
          draw.setFeatureProperty(id, 'pointColor', pointStyle.value.color);
          draw.setFeatureProperty(id, 'pointRadius', pointStyle.value.radius);
          draw.setFeatureProperty(id, 'pointStrokeColor', pointStyle.value.strokeColor);
          draw.setFeatureProperty(id, 'pointStrokeWidth', pointStyle.value.strokeWidth);
        } else if (feature.geometry.type === 'LineString') {
          draw.setFeatureProperty(id, 'lineColor', lineStyle.value.color);
          draw.setFeatureProperty(id, 'lineWidth', lineStyle.value.width);
          draw.setFeatureProperty(id, 'lineDash', lineStyle.value.dashType);
        } else if (feature.geometry.type === 'Polygon') {
          draw.setFeatureProperty(id, 'fillColor', polygonStyle.value.fillColor);
          draw.setFeatureProperty(id, 'fillOpacity', polygonStyle.value.fillOpacity);
          draw.setFeatureProperty(id, 'strokeColor', polygonStyle.value.strokeColor);
          draw.setFeatureProperty(id, 'strokeWidth', polygonStyle.value.strokeWidth);
        }
      });
      
      drawnFeatures.value = draw.getAll().features || [];
      saveFeaturesToStorage();
      alert('样式已应用');
    };

    // 数据下载入口
    const openAliDataPortal = () => {
      window.open('https://datav.aliyun.com/portal/school/atlas/area_selector', '_blank');
    };

    const openPOI86Portal = () => {
      window.open('https://www.poi86.com/poi/amap.html', '_blank');
    };

    // 删除选中的要素
    const deleteSelected = () => {
      if (!draw) return;
      
      const selected = draw.getSelectedIds();
      if (selected.length > 0) {
        draw.delete(selected);
      } else {
        if (confirm('没有选中要素，是否删除全部？')) {
          draw.deleteAll();
        }
      }
      
      // 同步状态
      const fc = draw.getAll();
      drawnFeatures.value = fc.features || [];
      saveFeaturesToStorage();
    };

    // 清空所有绘制
    const clearAllFeatures = () => {
      if (!draw) return;
      
      if (confirm('确定要清空所有绘制吗？此操作不可恢复。')) {
        draw.deleteAll();
        drawnFeatures.value = [];
        localStorage.removeItem('mapDrawnFeatures');
        currentDrawMode.value = null;
        alert('已清空所有绘制');
      }
    };

    // 保存要素到 localStorage
    const saveFeaturesToStorage = () => {
      localStorage.setItem('mapDrawnFeatures', JSON.stringify(drawnFeatures.value));
    };

    // 从 localStorage 恢复要素
    const loadFeaturesFromStorage = () => {
      const saved = localStorage.getItem('mapDrawnFeatures');
      if (saved) {
        try {
          drawnFeatures.value = JSON.parse(saved);
        } catch (e) {
          console.error('加载保存的要素失败', e);
        }
      }
    };

    // 导出为 GeoJSON
    const exportGeoJSON = () => {
      if (drawnFeatures.value.length === 0) {
        alert('没有要素可导出');
        return;
      }
      const geojson = {
        type: 'FeatureCollection',
        features: drawnFeatures.value
      };
      const dataStr = JSON.stringify(geojson, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `map-export-${new Date().toISOString().replace(/[:.]/g, '-')}.geojson`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('已导出 GeoJSON');
    };

    // 导出为图片（PNG/JPEG）
    const exportImage = (format = 'png') => {
      if (!map) return;
      try {
        const canvas = map.getCanvas();
        const link = document.createElement('a');
        link.href = canvas.toDataURL(`image/${format}`, 1.0);
        link.download = `map-export-${new Date().toISOString().replace(/[:.]/g, '-')}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`已导出 ${format.toUpperCase()} 格式的地图`);
      } catch (e) {
        console.error('导出图片失败', e);
        alert('导出图片失败，可能是因为瓦片跨域。请确保后端代理已配置 CORS 响应头 Access-Control-Allow-Origin: *');
      }
    };

    // 触发文件选择
    const triggerFileInput = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    // 处理文件导入
    const handleFileImport = async (event) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let geojson = null;

          if (file.name.endsWith('.kml')) {
            alert('KML 导入需要后端支持。当前支持 GeoJSON 格式');
            return;
          } else if (file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
            geojson = JSON.parse(content);
          } else {
            alert('不支持的文件格式。请上传 .geojson 或 .kml 文件');
            return;
          }

          // 验证 GeoJSON 格式
          if (!geojson.features) {
            alert('无效的 GeoJSON 格式');
            return;
          }

          // 使用 MapboxDraw 添加要素
          if (draw) {
            draw.add({
              type: 'FeatureCollection',
              features: geojson.features
            });
          }

          // 同步状态
          const fc = draw.getAll();
          drawnFeatures.value = fc.features || [];
          saveFeaturesToStorage();

          // 自动缩放到导入数据范围
          const bbox = calculateBoundingBox(geojson.features);
          if (bbox && map) {
            map.fitBounds(bbox, { padding: 50 });
          }

          alert(`已导入 ${geojson.features.length} 个要素`);
        } catch (error) {
          console.error('文件导入失败', error);
          alert('文件导入失败，请检查文件格式');
        }
      };

      reader.readAsText(file);
      // 重置 input 以允许再次选择相同文件
      event.target.value = '';
    };

    // 计算要素集合的边界框
    const calculateBoundingBox = (features) => {
      if (!features || features.length === 0) return null;
      
      let minLng = Infinity, minLat = Infinity;
      let maxLng = -Infinity, maxLat = -Infinity;

      features.forEach(feature => {
        const coords = feature.geometry.coordinates;
        if (feature.geometry.type === 'Point') {
          minLng = Math.min(minLng, coords[0]);
          minLat = Math.min(minLat, coords[1]);
          maxLng = Math.max(maxLng, coords[0]);
          maxLat = Math.max(maxLat, coords[1]);
        } else if (feature.geometry.type === 'LineString') {
          coords.forEach(c => {
            minLng = Math.min(minLng, c[0]);
            minLat = Math.min(minLat, c[1]);
            maxLng = Math.max(maxLng, c[0]);
            maxLat = Math.max(maxLat, c[1]);
          });
        } else if (feature.geometry.type === 'Polygon') {
          coords[0].forEach(c => {
            minLng = Math.min(minLng, c[0]);
            minLat = Math.min(minLat, c[1]);
            maxLng = Math.max(maxLng, c[0]);
            maxLat = Math.max(maxLat, c[1]);
          });
        }
      });

      return [[minLng, minLat], [maxLng, maxLat]];
    };

    // 工具箱拖动相关
    const startDrag = (e) => {
      // 防止与地图交互冲突
      e.preventDefault();
      isDragging.value = true;
      dragStart.value = {
        x: e.clientX - toolboxPos.value.x,
        y: e.clientY - toolboxPos.value.y
      };
      document.body.style.userSelect = 'none';
    };

    const onMouseMove = (e) => {
      if (!isDragging.value) return;
      e.preventDefault();
      toolboxPos.value.x = e.clientX - dragStart.value.x;
      toolboxPos.value.y = e.clientY - dragStart.value.y;
    };

    const onMouseUp = () => {
      isDragging.value = false;
      document.body.style.userSelect = 'auto';
    };

    // 导出为 KML（基础版本，无需外部库）
    const exportKML = () => {
      if (drawnFeatures.value.length === 0) {
        alert('没有要素可导出');
        return;
      }

      // 简单的 GeoJSON to KML 转换
      let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Map Export</name>`;

      drawnFeatures.value.forEach((feature, idx) => {
        const props = feature.properties || {};
        const name = props.name || `Feature ${idx + 1}`;
        const coords = feature.geometry.coordinates;

        if (feature.geometry.type === 'Point') {
          kml += `
    <Placemark>
      <name>${name}</name>
      <Point>
        <coordinates>${coords[0]},${coords[1]},0</coordinates>
      </Point>
    </Placemark>`;
        } else if (feature.geometry.type === 'LineString') {
          const coordStr = coords.map(c => `${c[0]},${c[1]},0`).join(' ');
          kml += `
    <Placemark>
      <name>${name}</name>
      <LineString>
        <coordinates>${coordStr}</coordinates>
      </LineString>
    </Placemark>`;
        } else if (feature.geometry.type === 'Polygon') {
          const coordStr = coords[0].map(c => `${c[0]},${c[1]},0`).join(' ');
          kml += `
    <Placemark>
      <name>${name}</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>${coordStr}</coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>`;
        }
      });

      kml += `
  </Document>
</kml>`;

      const dataBlob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `map-export-${new Date().toISOString().replace(/[:.]/g, '-')}.kml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('已导出 KML 格式');
    };

    // 导出为 CSV（表格格式）
    const exportCSV = () => {
      if (drawnFeatures.value.length === 0) {
        alert('没有要素可导出');
        return;
      }

      let csv = 'id,type,name,description,coordinates\n';
      drawnFeatures.value.forEach((feature, idx) => {
        const props = feature.properties || {};
        const name = (props.name || '').replace(/"/g, '""');
        const desc = (props.description || '').replace(/"/g, '""');
        const type = feature.geometry.type;
        const coords = JSON.stringify(feature.geometry.coordinates).replace(/"/g, '""');
        
        csv += `${idx + 1},"${type}","${name}","${desc}","${coords}"\n`;
      });

      const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `map-export-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert('已导出 CSV 格式');
    };

    // 在地图上绘制要素（用于显示导入或保存的要素）
    const renderDrawnFeatures = () => {
      if (!map) return;

      // 检查是否已有 source 和 layer
      if (!map.getSource('drawn-features')) {
        map.addSource('drawn-features', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: drawnFeatures.value
          }
        });

        // 添加点图层
        map.addLayer({
          id: 'drawn-points',
          type: 'circle',
          source: 'drawn-features',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 8,
            'circle-color': '#FF6B6B',
            'circle-opacity': 0.8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }
        });

        // 添加线图层
        map.addLayer({
          id: 'drawn-lines',
          type: 'line',
          source: 'drawn-features',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#4ECDC4',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });

        // 添加面图层
        map.addLayer({
          id: 'drawn-polygons',
          type: 'fill',
          source: 'drawn-features',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#95E1D3',
            'fill-opacity': 0.5
          }
        });

        map.addLayer({
          id: 'drawn-polygons-stroke',
          type: 'line',
          source: 'drawn-features',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'line-color': '#38a169',
            'line-width': 2
          }
        });
      } else {
        // 更新现有数据
        map.getSource('drawn-features').setData({
          type: 'FeatureCollection',
          features: drawnFeatures.value
        });
      }
    };

    // 切换工具箱展开/收起
    const toggleToolbox = () => {
      isToolboxOpen.value = !isToolboxOpen.value;
    };

    // 在 onMounted 前设置鼠标事件监听
    const setupMouseListeners = () => {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    const removeMouseListeners = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    onMounted(async () => {
      // 手机端检测
      checkMobile();
      window.addEventListener('resize', checkMobile);

      // 立即设置鼠标监听
      setupMouseListeners();
      
      try {
        console.log('开始初始化天地图...');
        
        // 从环境变量获取 Mapbox Token
        mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
        
        // 禁用遥测，消除 events.mapbox.com 报错
        try {
          mapboxgl.config.EVENTS_URL = null; 
        } catch (e) {
          // 忽略旧版本可能不支持的错误
        }

        map = new mapboxgl.Map({
          container: 'map',
          style: {
            version: 8,
            sources: {
              'tdt-vec': {
                type: 'raster',
                tiles: [
                  // 使用相对路径，由 Vite 代理转发，解决手机端访问 localhost 失败的问题
                  '/api/tdt/vec_w/{z}/{x}/{y}'
                ],
                tileSize: 256
              },
              'tdt-cva': {
                type: 'raster',
                tiles: [
                  '/api/tdt/cva_w/{z}/{x}/{y}'
                ],
                tileSize: 256
              }
            },
            layers: [
              {
                id: 'tdt-vec-layer',
                type: 'raster',
                source: 'tdt-vec',
                minzoom: 0,
                maxzoom: 18,
                paint: { 'raster-opacity': 1 }
              }
            ]
          },
          center: [105, 36],
          zoom: 3.5,
          minZoom: 3,
          maxZoom: 18,
          pitch: 0, // 初始倾斜角度
          bearing: 0,
          preserveDrawingBuffer: true // 启用绘制缓冲以支持截图
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        map.on('load', async () => {
          console.log('天地图加载完成');
          // 注意：不要在这里直接置为 false，而是在数据处理完成后（finally块中）
          
          try {
            const [geoRes, csvRes] = await Promise.all([
              fetch('/geoData/中国_省.geojson'),
              fetch('/geoData/全国各省森林覆盖率2022.csv')
            ]);


            if (!geoRes.ok) throw new Error(`GeoJSON加载失败: ${geoRes.status}`);
            if (!csvRes.ok) throw new Error(`CSV加载失败: ${csvRes.status}`);

            const geoData = await geoRes.json();
            const csvText = await csvRes.text();

            const forestDataMap = {};
            const rows = csvText.split('\n');
            rows.forEach((row, index) => {
              if (index === 0 || !row.trim()) return; 
              const cols = row.split(',');
              if (cols.length >= 3) {
                const provinceName = cols[1].trim();
                const rate = parseFloat(cols[2].trim());
                forestDataMap[provinceName] = rate;
              }
            });

            geoData.features.forEach(feature => {
              const name = feature.properties.name;
              let rate = forestDataMap[name];
              if (rate === undefined) {
                 const key = Object.keys(forestDataMap).find(k => k.includes(name) || name.includes(k));
                 if (key) rate = forestDataMap[key];
              }
              // 平面展示不需要 height
              feature.properties.forestRate = rate || 0;
            });

            map.addSource('china-provinces', {
              type: 'geojson',
              data: geoData
            });

            // 1. 平面分级设色层 (Fill)
            map.addLayer({
              id: 'china-forest-fill',
              type: 'fill',
              source: 'china-provinces',
              paint: {
                'fill-color': [
                  'interpolate',
                  ['linear'],
                  ['get', 'forestRate'],
                  0, '#f7fcf5',
                  10, '#e5f5e0',
                  20, '#c7e9c0',
                  30, '#a1d99b',
                  40, '#74c476',
                  50, '#41ab5d',
                  60, '#238b45',
                  70, '#005a32'
                ],
                'fill-opacity': 0.8,
                'fill-outline-color': '#00441b' // 添加边界线
              }
            });

            // 2. 高亮轮廓层 (点击选中时显示)
            map.addLayer({
              id: 'china-forest-highlight',
              type: 'line',
              source: 'china-provinces',
              paint: {
                'line-color': '#fbb03b',
                'line-width': 3,
                'line-opacity': [
                  'case',
                  ['boolean', ['feature-state', 'hover'], false],
                  1,
                  0
                ]
              }
            });

            // 3. 将注记层放在最上面，保证文字不被遮挡
            map.addLayer({
              id: 'tdt-cva-layer',
              type: 'raster',
              source: 'tdt-cva',
              minzoom: 0,
              maxzoom: 18
            });

            // ============ 初始化 MapboxDraw with 自定义样式 ============
            draw = new MapboxDraw({
              displayControlsDefault: false,
              userProperties: true,
              styles: [
                // 点样式 - inactive
                {
                  id: 'gl-draw-point-inactive',
                  type: 'circle',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'Point'], ['!=', 'active', 'true']],
                  paint: {
                    'circle-radius': ['coalesce', ['get', 'user_pointRadius'], 6],
                    'circle-color': ['coalesce', ['get', 'user_pointColor'], '#3bb2d0'],
                    'circle-stroke-color': ['coalesce', ['get', 'user_pointStrokeColor'], '#ffffff'],
                    'circle-stroke-width': ['coalesce', ['get', 'user_pointStrokeWidth'], 2]
                  }
                },
                // 点样式 - active
                {
                  id: 'gl-draw-point-active',
                  type: 'circle',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'Point'], ['==', 'active', 'true']],
                  paint: {
                    'circle-radius': ['coalesce', ['get', 'user_pointRadius'], 6],
                    'circle-color': '#fbb03b',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 3
                  }
                },
                // 线样式 - inactive
                {
                  id: 'gl-draw-line-inactive',
                  type: 'line',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'LineString'], ['!=', 'active', 'true']],
                  paint: {
                    'line-color': ['coalesce', ['get', 'user_lineColor'], '#3bb2d0'],
                    'line-width': ['coalesce', ['get', 'user_lineWidth'], 3]
                  }
                },
                // 线样式 - active
                {
                  id: 'gl-draw-line-active',
                  type: 'line',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'LineString'], ['==', 'active', 'true']],
                  paint: {
                    'line-color': '#fbb03b',
                    'line-width': 4
                  }
                },
                // 面样式 - fill inactive
                {
                  id: 'gl-draw-polygon-fill-inactive',
                  type: 'fill',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'Polygon'], ['!=', 'active', 'true']],
                  paint: {
                    'fill-color': ['coalesce', ['get', 'user_fillColor'], '#95E1D3'],
                    'fill-opacity': ['coalesce', ['get', 'user_fillOpacity'], 0.5]
                  }
                },
                // 面样式 - stroke inactive
                {
                  id: 'gl-draw-polygon-stroke-inactive',
                  type: 'line',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'Polygon'], ['!=', 'active', 'true']],
                  paint: {
                    'line-color': ['coalesce', ['get', 'user_strokeColor'], '#38a169'],
                    'line-width': ['coalesce', ['get', 'user_strokeWidth'], 2]
                  }
                },
                // 面样式 - active fill
                {
                  id: 'gl-draw-polygon-fill-active',
                  type: 'fill',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
                  paint: {
                    'fill-color': '#fbb03b',
                    'fill-opacity': 0.6
                  }
                },
                // 面样式 - active stroke
                {
                  id: 'gl-draw-polygon-stroke-active',
                  type: 'line',
                  filter: ['all', ['==', 'meta', 'feature'], ['==', '$type', 'Polygon'], ['==', 'active', 'true']],
                  paint: {
                    'line-color': '#fbb03b',
                    'line-width': 3
                  }
                },
                // 绘制中的顶点
                {
                  id: 'gl-draw-point-point-stroke-inactive',
                  type: 'circle',
                  filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'active', 'true']],
                  paint: {
                    'circle-radius': 5,
                    'circle-color': '#ffffff'
                  }
                },
                {
                  id: 'gl-draw-point-stroke-active',
                  type: 'circle',
                  filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['==', 'active', 'true']],
                  paint: {
                    'circle-radius': 7,
                    'circle-color': '#fbb03b'
                  }
                },
                // 中点
                {
                  id: 'gl-draw-point-midpoint',
                  type: 'circle',
                  filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
                  paint: {
                    'circle-radius': 3,
                    'circle-color': '#fbb03b'
                  }
                }
              ]
            });
            map.addControl(draw); // 必须添加到 map

            // 定义同步函数
            const syncDrawToState = () => {
              const fc = draw.getAll();
              drawnFeatures.value = fc.features || [];
              saveFeaturesToStorage();
            };

            // 绑定 Draw 事件
            map.on('draw.create', (e) => {
              // 只处理新创建的要素
              (e.features || []).forEach(feature => {
                const geomType = feature.geometry?.type;
                const id = feature.id;
                console.log('新建要素:', { id, type: geomType, pointColor: pointStyle.value.color });
                
                // 注意：userProperties:true 时，setFeatureProperty 会自动加 user_ 前缀
                if (geomType === 'Point') {
                  draw.setFeatureProperty(id, 'pointColor', pointStyle.value.color);
                  draw.setFeatureProperty(id, 'pointRadius', pointStyle.value.radius);
                  draw.setFeatureProperty(id, 'pointStrokeColor', pointStyle.value.strokeColor);
                  draw.setFeatureProperty(id, 'pointStrokeWidth', pointStyle.value.strokeWidth);
                } else if (geomType === 'LineString') {
                  draw.setFeatureProperty(id, 'lineColor', lineStyle.value.color);
                  draw.setFeatureProperty(id, 'lineWidth', lineStyle.value.width);
                  draw.setFeatureProperty(id, 'lineDash', lineStyle.value.dashType);
                } else if (geomType === 'Polygon') {
                  draw.setFeatureProperty(id, 'fillColor', polygonStyle.value.fillColor);
                  draw.setFeatureProperty(id, 'fillOpacity', polygonStyle.value.fillOpacity);
                  draw.setFeatureProperty(id, 'strokeColor', polygonStyle.value.strokeColor);
                  draw.setFeatureProperty(id, 'strokeWidth', polygonStyle.value.strokeWidth);
                }
                
                // 验证属性
                setTimeout(() => {
                  const saved = draw.get(id);
                  console.log('保存后属性:', saved?.properties);
                }, 50);
              });
              
              syncDrawToState();
              
              // 保持当前绘制模式（支持连续绘制）
              keepCurrentMode();
            });
            
            map.on('draw.update', (e) => {
              // update 事件不覆盖已有样式，只同步存储
              // 这样旧要素保持原有样式，新要素使用当前样式
              syncDrawToState();
            });
            
            map.on('draw.delete', syncDrawToState);

            // 从 localStorage 恢复要素到 Draw
            loadFeaturesFromStorage();
            if (drawnFeatures.value.length > 0) {
              draw.add({
                type: 'FeatureCollection',
                features: drawnFeatures.value
              });
            }

            // Esc 键退出绘制模式
            window.handleKeyDown = (e) => {
              if (e.key === 'Escape' && draw) {
                draw.changeMode('simple_select');
                currentDrawMode.value = null;
              }
            };
            window.addEventListener('keydown', window.handleKeyDown);

            // --- 交互逻辑 ---

            const popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25
            });

            let hoveredStateId = null;

            // 鼠标移动交互
            map.on('mousemove', 'china-forest-fill', (e) => {
              // 防护：绘制模式下禁用此交互
              if (isDrawingMode()) {
                map.getCanvas().style.cursor = 'crosshair';
                return;
              }

              if (e.features.length > 0) {
                map.getCanvas().style.cursor = 'pointer';
                const feature = e.features[0];
                
                const props = feature.properties;
                
                popup.setLngLat(e.lngLat)
                  .setHTML(`
                    <div style="font-family: 'PingFang SC', sans-serif; padding: 8px; min-width: 120px;">
                      <h3 style="margin:0 0 8px 0; font-size:16px; color:#333; border-bottom:2px solid #41ab5d; padding-bottom:4px;">${props.name}</h3>
                      <div style="font-size:14px; color:#666;">
                        森林覆盖率: <b style="color:#238b45; font-size:18px;">${props.forestRate}%</b>
                      </div>
                    </div>
                  `)
                  .addTo(map);
              }
            });

            map.on('mouseleave', 'china-forest-fill', () => {
              // 防护：绘制模式下禁用此交互
              if (isDrawingMode()) return;

              map.getCanvas().style.cursor = '';
              popup.remove();
            });

            // 点击飞入交互 (FlyTo)
            map.on('click', 'china-forest-fill', (e) => {
              // 防护：绘制模式下禁用
              if (isDrawingMode()) return;

              const feature = e.features[0];
              
              // 简单的飞入效果
              map.flyTo({
                center: e.lngLat,
                zoom: 6,
                speed: 0.8,
                curve: 1,
                essential: true
              });
            });

            // 点击空白处复位
            map.on('click', (e) => {
              // 防护：绘制模式下禁用
              if (isDrawingMode()) return;

              const features = map.queryRenderedFeatures(e.point, { layers: ['china-forest-fill'] });
              if (!features.length) {
                map.flyTo({
                  center: [105, 36],
                  zoom: 3.5,
                  pitch: 0,
                  bearing: 0
                });
              }
            });

          } catch (err) {
            console.error('加载并处理数据失败:', err);
          } finally {
             // 只有当所有数据都准备好并添加到地图上后，才移除 loading
             loading.value = false;
          }
        });

        map.on('error', (e) => {
          console.error('地图错误:', e);
        });
        
      } catch (err) {
        console.error('地图初始化失败:', err);
        error.value = `地图初始化失败: ${err.message}`;
        loading.value = false;
      }
    });

    onBeforeUnmount(() => {
      if (map) {
        map.remove();
      }
      removeMouseListeners();
      window.removeEventListener('resize', checkMobile);

      // 清理 Esc 键监听
      if (window.handleKeyDown) {
        window.removeEventListener('keydown', window.handleKeyDown);
        delete window.handleKeyDown;
      }
    });

    return {
      loading,
      error,
      isToolboxOpen,
      toolboxCollapsed,
      layerOpacity,
      toolboxPos,
      currentBaseMap,
      currentDrawMode,
      fileInput,
      drawnFeatures,
      pointStyle,
      lineStyle,
      polygonStyle,
      isMobile,
      toggleLayer,
      updateLayerOpacity,
      resetMap,
      toggleToolbox,
      switchBaseMap,
      getLayerVisibility,
      startDrag,
      setDrawMode,
      deleteSelected,
      clearAllFeatures,
      saveFeaturesToStorage,
      loadFeaturesFromStorage,
      exportGeoJSON,
      exportImage,
      exportKML,
      exportCSV,
      triggerFileInput,
      handleFileImport,
      renderDrawnFeatures,
      applyStyleToSelected,
      openAliDataPortal,
      openPOI86Portal,
      isDrawingMode
    };
  }
};
</script>

<style scoped>
.maps {
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.map-header {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: transparent;
  padding: 0;
  pointer-events: none;
}

.map-header h1 {
  margin: 0;
  font-size: 50px;
  font-weight: 700;
  text-align: center;
  color: #ecd01d;
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.map-header p {
  margin: 8px 0 0 0;
  font-size: 30px;
  text-align: center;
  color: #f7eca7;
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.2);
  font-weight: 300;
  letter-spacing: 0.5px;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  cursor: default !important;
}

.map-container >>> .mapboxgl-canvas-container {
  cursor: default !important;
}

.map-container >>> .mapboxgl-canvas {
  cursor: inherit !important;
}

.loading-message,
.error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #666;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.error-message {
  color: #f56c6c;
}

/* Legend Styles */
.map-legend {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  z-index: 100;
  min-width: 250px;
  backdrop-filter: blur(5px);
}

.map-legend h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.legend-scale {
  display: flex;
  width: 100%;
  height: 12px;
  margin-bottom: 5px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.05);
}

.legend-scale span {
  flex: 1;
  height: 100%;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.legend-source {
  margin: 0;
  font-size: 12px;
  color: #888;
  text-align: left;
  border-top: 1px solid #eee;
  padding-top: 8px;
  line-height: 1.5;
}

.mapboxgl-ctrl-top-right {
  top: 20px;
  right: 20px;
}

.loader {
  font-size: 48px;
  display: inline-block;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  color: #263238;
  letter-spacing: 2px;
  position: relative;
  box-sizing: border-box;
}

.loader::after {
  content: 'Loading';
  position: absolute;
  left: 0;
  top: 0;
  color: #fff;
  text-shadow: 0 0 2px #000000, 0 0 1px #000000, 0 0 1px #000000;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  animation: animloader 6s linear infinite;
}

@keyframes animloader {
  0% {
    height: 100%;
  }

  100% {
    height: 0%;
  }
}

.toolbox {
  position: absolute;
  top: 100px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 200;
  font-family: "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  backdrop-filter: blur(5px);
  max-width: 280px;
}

/* 手机端工具箱样式 */
.toolbox.mobile {
  position: fixed !important;
  top: auto !important;
  left: 10px !important;
  right: 10px !important;
  bottom: 80px !important;
  width: auto !important;
  max-width: none !important;
  max-height: 65vh !important;
  border-radius: 16px !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25) !important;
}

.toolbox-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
}

.toolbox-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.toolbox-toggle {
  background: none;
  border: none;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.toolbox-toggle:hover {
  color: #333;
}

.toolbox-content {
  padding: 12px 16px;
  max-height: 400px;
  overflow-y: auto;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.layer-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.layer-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.layer-control {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: #333;
}

.layer-control input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
  accent-color: #41ab5d;
}

.layer-control span {
  flex: 1;
}

.slider-control {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  color: #333;
  cursor: pointer;
}

.slider-control span {
  margin-bottom: 8px;
  font-weight: 500;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.opacity-slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #ccc, #41ab5d);
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #41ab5d;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.opacity-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.opacity-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #41ab5d;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.opacity-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.opacity-value {
  font-size: 12px;
  color: #666;
  min-width: 35px;
  text-align: right;
}

.toolbox-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.btn-reset {
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(135deg, #41ab5d, #238b45);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: linear-gradient(135deg, #238b45, #005a32);
  box-shadow: 0 2px 8px rgba(65, 171, 93, 0.3);
  transform: translateY(-1px);
}

.btn-reset:active {
  transform: translateY(0);
}

/* 底图切换按钮样式 */
.button-group {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.btn-map-type {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
}

.btn-map-type:hover {
  border-color: #41ab5d;
  color: #41ab5d;
}

.btn-map-type.active {
  background: #41ab5d;
  color: white;
  border-color: #41ab5d;
  box-shadow: 0 2px 6px rgba(65, 171, 93, 0.3);
}

/* 绘制工具按钮和垂直按钮组 */
.button-group-vertical {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-draw-mode {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.btn-draw-mode:hover {
  border-color: #4ECDC4;
  color: #4ECDC4;
  background: rgba(78, 205, 196, 0.05);
}

.btn-draw-mode.active {
  background: #4ECDC4;
  color: white;
  border-color: #4ECDC4;
  box-shadow: 0 2px 6px rgba(78, 205, 196, 0.3);
}

.btn-delete {
  border-color: #f56c6c;
}

.btn-delete:hover {
  border-color: #f56c6c;
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.05);
}

.btn-delete.active {
  background: #f56c6c;
  color: white;
  border-color: #f56c6c;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.3);
}

.btn-danger {
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(135deg, #f56c6c, #dd001b);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 6px;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dd001b, #c70015);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
  transform: translateY(-1px);
}

.btn-danger:active {
  transform: translateY(0);
}

/* 分割线 */
.divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #d0d0d0, transparent);
  margin: 12px 0;
}

/* 工具+样式面板容器 */
.tool-with-style {
  margin-bottom: 8px;
}

.style-panel {
  background: #f5f7fa;
  padding: 8px;
  border-radius: 0 0 4px 4px;
  margin-top: -1px;
  border: 1px solid #4ECDC4;
  border-top: none;
  animation: slideDown 0.2s ease;
}

.style-panel input[type="range"] {
  cursor: pointer;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #ddd;
  border-radius: 2px;
}

.style-panel input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4ECDC4;
  cursor: pointer;
}

.style-panel input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4ECDC4;
  border: none;
  cursor: pointer;
}

/* 手机端模态背景 */
.toolbox-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.5) !important;
  z-index: 180 !important;
  animation: fadeIn 0.3s ease !important;
  pointer-events: auto !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 手机端浮动按钮 */
.toolbox-fab {
  display: flex !important;
  position: fixed !important;
  bottom: 20px !important;
  right: 20px !important;
  width: 56px !important;
  height: 56px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #4ECDC4, #38a169) !important;
  color: white !important;
  border: none !important;
  font-size: 28px !important;
  cursor: pointer !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
  z-index: 250 !important;
  transition: all 0.3s ease !important;
  align-items: center !important;
  justify-content: center !important;
}

.toolbox-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

.toolbox-fab:active {
  transform: scale(0.95);
}

/* 工具箱关闭按钮 */
.toolbox-close-btn {
  background: none;
  border: none;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
  display: flex;
}

.toolbox-close-btn:hover {
  color: #f56c6c;
}

/* 手机端适配 - 更高的阈值以涵盖所有移动设备 */
@media (max-width: 1024px) {
  .toolbox-modal-overlay {
    display: block;
  }

  .toolbox-fab {
    display: flex;
  }

  .toolbox-close-btn {
    display: flex;
  }

  .toolbox {
    position: fixed !important;
    top: auto !important;
    left: 10px !important;
    right: 10px !important;
    bottom: 80px !important;
    width: auto !important;
    max-width: none !important;
    max-height: 65vh !important;
    border-radius: 16px !important;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.25) !important;
    z-index: 200 !important;
  }

  .toolbox.mobile .toolbox-content {
    max-height: 55vh;
    overflow-y: auto;
    padding-right: 8px;
  }

  .toolbox.mobile .toolbox-content::-webkit-scrollbar {
    width: 6px;
  }

  .toolbox.mobile .toolbox-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .toolbox.mobile .toolbox-content::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .toolbox.mobile .toolbox-content::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

  .map-legend {
    display: none;
  }

  .map-header {
    top: 10px;
  }

  .map-header h1 {
    font-size: 18px !important;
  }

  .map-header p {
    font-size: 12px !important;
  }
}
</style>