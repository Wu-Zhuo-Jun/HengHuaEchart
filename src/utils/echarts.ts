/**
 * ECharts 按需引入优化
 * 只引入项目中实际使用的图表类型和组件，减少打包体积
 */
import * as echarts from 'echarts/core';
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  HeatmapChart,
  GaugeChart,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  ToolboxComponent,
  GraphicComponent,
  CalendarComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  HeatmapChart,
  GaugeChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  VisualMapComponent,
  MarkPointComponent,
  MarkLineComponent,
  MarkAreaComponent,
  ToolboxComponent,
  GraphicComponent,
  CalendarComponent,
  CanvasRenderer,
]);

export default echarts;
export const graphic = echarts.graphic;
