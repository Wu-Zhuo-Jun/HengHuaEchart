import echarts, { graphic } from "@/utils/echarts";
import React, { useContext } from "react";
import { text, Language } from "../../../../language/LocaleContext";
import Constant from "../../../../common/Constant";
import TimeUtils from "../../../../utils/TimeUtils";
import StringUtils from "@/utils/StringUtils";

class ChartsFlowOptHelper {
  static Colors = {
    ColorList: ["#3867D6", "#668CE6", "#5951E2", "#A3BDF9", "#507FEE", "#15BA15", "#6D92D7", "#68BBC4", "#58A55C", "#F2BD42", "#EE752F", "#D940A9"],
    ColorListPie: ["#3867D6", "#668CE6", "#5951E2", "#A3BDF9", "#507FEE", "#15BA15", "#6D92D7", "#68BBC4", "#58A55C", "#F2BD42", "#EE752F", "#D940A9"],
    ColorListLine: ["#3867D6", "#5838D6", "#F9A231", "#67D638"],
    ColorListLine2: ["#3867D6", "#F9A231"],
    RGBListLinnear: ["56,103,214", "249,162,49", "103,214,56", "88,56,214", "231,76,60", "109,189,253", "56,214,197"], // 蓝橙绿紫红浅蓝洋红青蓝
    HEXListLinnear: ["#3867D6", "#F9A231", "#67D638", "#5838D6", "#E74C3C", "#6DBDFD", "#D638A1", "#38D6C5"], // 蓝橙绿紫红浅蓝洋红青蓝
    ColorAxisLabel: "#101010",
    ColorLine: ["#BBBBBB", "#6E7079"],
    GenderColors: ["#3867D6", "#F9A231", "#67D638"],
    GenderColorsLinnear: ["56,103,214", "249,162,49", "103,214,56"],
    AvgLineColor: ["rgb(255,67,0)", "rgb(67,214,56)"],
  };

  // 出入口流量对比option
  static createFlowComparisonOpt({ legend, xAxis, series, xAxisTooltips }) {
    let option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: {
            color: "#999",
            width: 1,
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#eee",
        borderWidth: 1,
        textStyle: { color: "#333" },
        padding: [8, 12],
        formatter: function (params) {
          let result = "";
          // 确保参数存在
          if (!params || params.length === 0) return result;

          const index = params[0].dataIndex;
          const day = xAxisTooltips[index];
          const AppoiontValue = series[0][index] !== undefined ? series[0][index] : undefined;

          if (AppoiontValue !== undefined) {
            result += `<div style="margin-bottom:6px;text-align:start;">${day}</div>`;

            // 添加制定时间数据（如果存在）

            const comparisonColor = ChartsFlowOptHelper.Colors.ColorListLine[0];

            result += `<div style="display:flex;align-items:center;margin-bottom:10px;font-size:14px;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${comparisonColor};"></span>
                    <span style="flex-grow:1 text-align:start;">指定时间：</span>
                    <span style="font-weight:bold;">${AppoiontValue}</span>
                </div>`;
          }

          const CompareValue = series[1][index] !== undefined ? series[1][index] : undefined;

          // 如果是第一个位置，且指定时间数据存在，则显示指定时间数据
          if (CompareValue !== undefined) {
            const specifiedColor = ChartsFlowOptHelper.Colors.ColorListLine[2];

            // 添加指定时间数据
            result += `<div style="display:flex;align-items:center;margin-bottom:4px;font-size:14px;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${specifiedColor};"></span>
                    <span style="flex-grow:1 text-align:start;">对比时间：</span>
                    <span style="font-weight:bold;">${CompareValue}</span>
                </div>`;
          }

          return result;
        },
      },
      legend: {
        bottom: 45,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 75,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        axisLabel: {
          show: true, // 确保显示
          rotate: 0,
          margin: 15,
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 10,
        },
      ],
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
      series: [],
    };
    option.legend.data = legend;
    option.xAxis.data = xAxis;
    var series = series;
    for (let i = 0; i < series.length; i++) {
      let yAxis = series[i];
      let tmp = ChartsFlowOptHelper.createFlowComparisonSeries(i);
      tmp.data = yAxis;
      tmp.name = legend[i];
      option.series.push(tmp);
    }
    return option;
  }

  static createFlowComparisonSeries(index) {
    index = index % ChartsFlowOptHelper.Colors.ColorListLine2.length;
    var color = ChartsFlowOptHelper.Colors.ColorListLine2[index];
    var data = {
      type: "line",
      smooth: true,
      lineStyle: {
        color: `${color}`,
        width: 1,
      },
      itemStyle: {
        color: `${color}`,
      },
      areaStyle: {
        opacity: 1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: color,
          },
          {
            offset: 1,
            color: "rgba(255,255,255,0)",
          },
        ]),
      },
      symbol: "circle", // 形状为圆形
      symbolSize: 4, // 节点大小
      itemStyle: {
        color: `${color}`, // 实心填充颜色
        borderColor: `${color}`, // 边框颜色（与填充色一致）
        borderWidth: 0, // 边框宽度设为0（可选）
      },
    };
    return data;
  }

  // 出入口对比-时间对比-双Y轴流量对比option
  static createDualTimeFlowComparisonOpt({ legend, xAxis, series, xAxisA, xAxisC, xAxisTooltipsA, xAxisTooltipsC }) {
    let option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: {
            color: "#999",
            width: 1,
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#eee",
        borderWidth: 1,
        textStyle: { color: "#333" },
        padding: [8, 12],
        formatter: function (params) {
          let result = "";
          // 确保参数存在
          if (!params || params.length === 0) return result;

          const index = params[0].dataIndex;
          const AppointDay = xAxisTooltipsA[index];
          const AppoiontValue = series[0][index] !== undefined ? series[0][index] : undefined;

          if (AppoiontValue !== undefined) {
            // 先添加日期和天气信息
            result += `<div style="margin-bottom:6px;text-align:start;">${AppointDay}</div>`;

            // 添加制定时间数据（如果存在）

            const comparisonColor = ChartsFlowOptHelper.Colors.ColorListLine[0];

            result += `<div style="display:flex;align-items:center;margin-bottom:10px;font-size:14px;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${comparisonColor};"></span>
                    <span style="flex-grow:1 text-align:start;">指定时间：</span>
                    <span style="font-weight:bold;">${AppoiontValue}</span>
                </div>`;
          }

          const CompareDay = xAxisTooltipsC[index];
          const CompareValue = series[1][index] !== undefined ? series[1][index] : undefined;

          // 如果是第一个位置，且指定时间数据存在，则显示指定时间数据
          if (CompareValue !== undefined) {
            const specifiedColor = ChartsFlowOptHelper.Colors.ColorListLine[2];

            // 添加指定时间的日期
            result += `<div style="margin-bottom:6px;text-align:start;">${CompareDay}</div>`;

            // 添加指定时间数据
            result += `<div style="display:flex;align-items:center;margin-bottom:4px;font-size:14px;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${specifiedColor};"></span>
                    <span style="flex-grow:1 text-align:start;">对比时间：</span>
                    <span style="font-weight:bold;">${CompareValue}</span>
                </div>`;
          }

          return result;
        },
      },
      legend: {
        bottom: 45,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 75,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        axisLabel: {
          show: true, // 确保显示
          rotate: 0,
          margin: 15,
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 10,
        },
      ],
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
      series: [],
    };
    option.legend.data = legend;
    option.xAxis.data = xAxis;
    var series = series;
    for (let i = 0; i < series.length; i++) {
      let yAxis = series[i];
      let tmp = ChartsFlowOptHelper.createFlowComparisonSeries(i);
      tmp.data = yAxis;
      tmp.name = legend[i];
      option.series.push(tmp);
    }
    return option;
  }

  // 出入口分析-客流趋势图option
  static createOutletAnalyseFlowLTrendChartOpt(data) {
    const { names, xAxis, xAxisTooltips, data1, data2, data3, data4, percentData1, percentData2, percentData3, avg, type, showLineChart } = data;
    let linnearRGB = ChartsFlowOptHelper.Colors.RGBListLinnear;

    // 获取公共配置
    const commonConfig = ChartsFlowOptHelper.getOutletAnalyseFlowLTrendCommonConfig(xAxisTooltips, xAxis, showLineChart);

    // 根据类型获取图例和系列配置
    const legendConfig = ChartsFlowOptHelper.getOutletAnalyseFlowLTrendLegendConfig(names, type);
    const seriesConfig = ChartsFlowOptHelper.getOutletAnalyseFlowLTrendSeriesConfig(names, data1, data2, data3, data4, percentData1, percentData2, percentData3, avg, type, linnearRGB, showLineChart);

    return {
      ...commonConfig,
      legend: legendConfig,
      series: seriesConfig,
    };
  }

  // 出入口分析-客流趋势图公共配置
  static getOutletAnalyseFlowLTrendCommonConfig(xAxisTooltips, xAxis, showLineChart) {
    return {
      grid: {
        top: 10,
        left: 0,
        right: 20,
        bottom: 45,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {
          let flex1 = "";
          let flex2 = "";
          let flex3 = "";
          let date = xAxisTooltips[params[0].dataIndex];
          let formatter = `${date}<br>`;
          params.map((item, index) => {
            if (item.seriesType === "bar") {
              let seriesName = item.seriesName;
              let marker = item.marker;
              let value = item.value;
              flex1 += `<div>${marker}${seriesName}</div>`;
              flex2 += `${value}<br>`;
            } else if (item.seriesType === "line") {
              // 折线图数据（抵达率）
              let value = item.value || 0;
              flex3 += `<div>分时占比：${value}%</div>`;
            }
          });
          flex1 = `<div style="width:auto;">${flex1}</div>`;
          flex2 = `<div style="width:auto;text-align:right;">${flex2}</div>`;
          flex3 = `<div style="width:auto;">${flex3}</div>`;

          formatter = `${date}<br><div style="width:auto;display:flex;flex-direction:row;column-gap:20px;">${flex1}${flex2}${flex3}</div>`;
          return formatter;
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 30,
          height: 15,
          bottom: 5,
        },
      ],
      xAxis: {
        type: "category",
        data: xAxis || [],
        axisLabel: {
          show: true, // 确保显示
          rotate: 0,
          margin: 15,
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
          onZero: false,
        },
      },
      yAxis: [
        {
          type: "value",
          position: "left",
          alignTicks: true,
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
          splitLine: {
            lineStyle: {
              color: ChartsFlowOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          splitNumber: 5,
          scale: true,
        },
        {
          type: "value",
          position: "right",
          alignTicks: true,
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
            formatter: function (value) {
              return value + "%";
            },
          },
          splitLine: {
            lineStyle: {
              color: ChartsFlowOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          splitNumber: 5,
          scale: true,
        },
      ],
    };
  }

  // 出入口分析-客流趋势图图例配置
  static getOutletAnalyseFlowLTrendLegendConfig(names, type) {
    const baseLegend = {
      bottom: 20,
      textStyle: {
        fontSize: 12,
      },
    };

    if (type === "singleDay") {
      // 单天：进场人次、进场人数、客流批次
      return {
        ...baseLegend,
        data: [
          {
            name: names[0], // 进场人次
            itemStyle: {
              color: "#3867D6",
            },
          },
          {
            name: names[1], // 进场人数
            itemStyle: {
              color: "#F9A231",
            },
          },
          {
            name: names[2], // 客流批次
            itemStyle: {
              color: "rgb(103,214,56)",
            },
          },
        ],
      };
    } else if (type === "multiDay") {
      // 多天：进场人次、出场人次、进场人数、客流批次
      return {
        ...baseLegend,
        data: [
          {
            name: names[0], // 进场人次
            itemStyle: {
              color: "#3867D6",
            },
          },
          {
            name: names[1], // 出场人次
            itemStyle: {
              color: "#5838D6",
            },
          },
          {
            name: names[2], // 进场人数
            itemStyle: {
              color: "#F9A231",
            },
          },
          {
            name: names[3], // 客流批次
            itemStyle: {
              color: "#C702E7",
            },
          },
        ],
      };
    }
    return baseLegend;
  }

  // 出入口分析-客流趋势图系列配置
  static getOutletAnalyseFlowLTrendSeriesConfig(names, data1, data2, data3, data4, percentData1, percentData2, percentData3, avg, type, linnearRGB, showLineChart) {
    const createBarSeries = (name, data, rgbIndex) => ({
      name,
      type: "bar",
      smooth: true,
      yAxisIndex: 0,
      barMaxWidth: 70,
      itemStyle: {
        opacity: 1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: `rgba(${linnearRGB[rgbIndex]},1)`,
          },
          {
            offset: 0.5,
            color: `rgba(${linnearRGB[rgbIndex]},0.5)`,
          },
          {
            offset: 1,
            color: `rgba(${linnearRGB[rgbIndex]},0)`,
          },
        ]),
      },
      data,
    });

    const createLineSeries = (name, data, rgbIndex) => ({
      name: name,
      type: "line",
      smooth: true,
      yAxisIndex: 1, // 使用右侧Y轴
      data: data,
      symbol: "circle", // 镂空圆点
      symbolSize: 4,
      lineStyle: {
        color: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        width: 1.5,
      },
      itemStyle: {
        color: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        borderColor: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        borderWidth: 0.5,
      },
    });

    if (type === "singleDay") {
      // 单天
      return [
        createBarSeries(names[0], data1, 0), // 进场人次 - 蓝色
        showLineChart ? createLineSeries(names[0], percentData1, 0) : null, // 进场人次 - 蓝色

        createBarSeries(names[1], data2, 1), // 进场人数 - 橙色
        showLineChart ? createLineSeries(names[1], percentData2, 1) : null, // 进场人数 - 橙色

        createBarSeries(names[2], data3, 2), // 客流批次 - 绿色
        showLineChart ? createLineSeries(names[3], percentData3, 2) : null, // 客流批次 - 绿色折线
      ];
    }
    return [];
  }

  // 出入口分析-热力图option
  static createCustomerAnalyseTimeHeatMapChartOpt(param) {
    const { xAxis, yAxis, series, xAxisTooltips, isPercent } = param;
    var option;

    let maxValue = 0;
    const heatMapData = series.map(function (item) {
      // 找最大值排除合计
      if (item[1] != 0 && typeof item[2] === "number" && item[2] > maxValue) {
        maxValue = item[2];
      }
      return [item[1], item[0], item[2] || "-"];
    });

    option = {
      tooltip: {
        position: "top",
        formatter: function (params) {
          // params.value[0]是x轴索引，params.value[1]是y轴索引
          const xIndex = params.value[0];
          const date = xAxisTooltips[xIndex];
          const yLabel = yAxis[params.value[1]];
          const value = params.value[2];
          const displayValue = isPercent && value !== "-" ? `${value}%` : value;
          return ` ${date}<br/>${yLabel}: ${displayValue}`;
        },
      },
      grid: {
        height: "80%",
        top: "10%",
        right: "0%",
      },
      xAxis: {
        type: "category",
        data: xAxis,
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: "category",
        data: yAxis,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        show: false,
        min: 0,
        max: maxValue,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "5%",
        color: ["rgba(56,103,214,1)", "rgba(215,225,247,1)"],
      },
      series: [
        {
          name: "Punch Card",
          type: "heatmap",
          data: heatMapData,
          label: {
            show: true,
            formatter: function (params) {
              const value = params.value[2];
              // 如果是百分比模式，直接显示百分比
              if (isPercent) {
                return value !== "-" ? `${value}%` : value;
              }
              // 数值模式，进行数值格式化
              if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + "M";
              } else if (value >= 10000) {
                return (value / 10000).toFixed(1) + "w";
              } else if (value >= 1000) {
                return (value / 1000).toFixed(1) + "k";
              }
              return value;
            },
            overflow: "truncate",
            fontSize: 12,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
    return option;
  }

  // 新心情雷达图option
  static createNewCustomerMoodRadarChartOpt({ unknowData, maleData, femaleData, globalMax, maleTotal, femaleTotal, unknowTotal }) {
    const moodNames = [Language.FENNU, Language.BEISHANG, Language.YANWU, Language.HAIPA, Language.JINGYA, Language.PINGJING, Language.GAOXIN, Language.KUNHUO, Language.WEIZHI];

    var option = {
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: function (params) {
          const dataIndex = params.dataIndex;
          const label = params.data.name;
          const valueArr = params.data.value;
          let total = dataIndex === 0 ? maleTotal : dataIndex === 1 ? femaleTotal : unknowTotal;
          let str = `${label}<br>`;
          let marker = `<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${params.color}; margin-right: 6px;"></span>`;
          for (let i = 0; i < valueArr.length; i++) {
            const value = valueArr[i];
            const percent = total > 0 ? StringUtils.toFixed((value / total) * 100, 2) : 0;
            str += `${marker}${moodNames[i]}: ${value} (${percent}%)<br>`;
          }
          return str;
        },
      },
      legend: {
        data: [Language.NAN, Language.NV, Language.WEIZHI],
        bottom: 0,
        icon: "roundRect",
        textStyle: {
          fontSize: 14,
          color: "#333",
        },
        itemGap: 10,
        itemWidth: 28,
        itemHeight: 14,
      },
      radar: {
        indicator: [
          { name: Language.FENNU, max: globalMax }, // 愤怒
          { name: Language.BEISHANG, max: globalMax }, // 悲伤
          { name: Language.YANWU, max: globalMax }, // 厌恶
          { name: Language.HAIPA, max: globalMax }, // 害怕
          { name: Language.JINGYA, max: globalMax }, // 惊讶
          { name: Language.PINGJING, max: globalMax }, // 平静
          { name: Language.GAOXIN, max: globalMax }, // 高兴
          { name: Language.KUNHUO, max: globalMax }, // 困惑
          { name: Language.WEIZHI, max: globalMax }, // 未知
        ],
        nameGap: 10,
        radius: "68%",
        shape: "circle",
        splitNumber: 5, // 同心圆分割段数
        axisName: {
          color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
          fontSize: 14,
        },
        splitArea: {
          areaStyle: {
            color: "rgb(255,255,255)",
          },
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
      },
      series: [
        {
          name: Language.FENBUSHUJU,
          type: "radar",
          data: [
            {
              value: maleData,
              name: Language.NAN,
              areaStyle: {
                color: `rgba(${ChartsFlowOptHelper.Colors.RGBListLinnear[0]}, 0.4)`,
              },
              lineStyle: {
                color: ChartsFlowOptHelper.Colors.ColorListLine[0],
                width: 1,
              },
              itemStyle: {
                color: ChartsFlowOptHelper.Colors.ColorListLine[0],
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: femaleData,
              name: Language.NV,
              areaStyle: {
                color: `rgba(${ChartsFlowOptHelper.Colors.RGBListLinnear[2]}, 0.4)`,
              },
              lineStyle: {
                color: ChartsFlowOptHelper.Colors.ColorListLine[2],
                width: 1,
              },
              itemStyle: {
                color: ChartsFlowOptHelper.Colors.ColorListLine[2],
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: unknowData,
              name: Language.WEIZHI,
              areaStyle: {
                color: `rgba(${ChartsFlowOptHelper.Colors.RGBListLinnear[3]}, 0.4)`,
              },
              lineStyle: {
                color: ChartsFlowOptHelper.Colors.ColorListLine[3],
                width: 1,
              },
              itemStyle: {
                color: ChartsFlowOptHelper.Colors.ColorListLine[3],
              },
              symbol: "circle",
              symbolSize: 4,
            },
          ],
        },
      ],
    };
    return option;
  }

  // 楼层分析-客流趋势图option
  static createFloorAnalyseTrendChartOpt(data) {
    const { floorIntervalTotal, xAxis, xAxisTooltips, type, showLineChart } = data;
    let linnearRGB = ChartsFlowOptHelper.Colors.RGBListLinnear;

    // 如果没有数据，返回空配置
    if (!floorIntervalTotal || Object.keys(floorIntervalTotal).length === 0) {
      return ChartsFlowOptHelper.getFloorAnalyseTrendCommonConfig(xAxisTooltips || [], xAxis || []);
    }

    // 获取公共配置
    const commonConfig = ChartsFlowOptHelper.getFloorAnalyseTrendCommonConfig(xAxisTooltips, xAxis, type, showLineChart);

    // 根据 floorIntervalTotal 生成图例和系列配置
    const floors = Object.values(floorIntervalTotal);
    const legendConfig = ChartsFlowOptHelper.getFloorAnalyseTrendLegendConfig(floors);
    const seriesConfig = ChartsFlowOptHelper.getFloorAnalyseTrendSeriesConfig(floors, linnearRGB, showLineChart);

    return {
      ...commonConfig,
      legend: legendConfig,
      series: seriesConfig,
    };
  }

  // 楼层分析-客流趋势图公共配置
  static getFloorAnalyseTrendCommonConfig(xAxisTooltips, xAxis, type) {
    return {
      grid: {
        top: 10,
        left: 10,
        right: 20,
        bottom: 45,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {
          let flex1 = "";
          let flex2 = "";
          let flex3 = "";
          let date = xAxisTooltips && xAxisTooltips[params[0].dataIndex] ? xAxisTooltips[params[0].dataIndex] : params[0].name;
          let formatter = `${date}<br>`;

          // 按系列类型分组处理
          params.forEach((item) => {
            if (item.seriesType === "bar") {
              // 柱状图数据（楼层数据）
              let seriesName = item.seriesName;
              let marker = item.marker;
              let value = item.value || 0;
              flex1 += `<div>${marker}${seriesName}：</div>`;
              flex2 += `${value}<br>`;
            } else if (item.seriesType === "line") {
              // 折线图数据（抵达率）
              let value = item.value || 0;
              flex3 += `<div>抵达率: ${value}%</div>`;
            }
          });
          flex1 = `<div style="width:auto;">${flex1}</div>`;
          flex2 = `<div style="width:auto;text-align:left;margin-right: 20px;">${flex2}</div>`;
          flex3 = flex3 ? `<div style="width:auto;">${flex3}</div>` : "";

          formatter = `${date}<br><div style="width:auto;display:flex;flex-direction:row">${flex1}${flex2}${flex3 ? flex3 : ""}</div>`;
          return formatter;
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 30,
          height: 15,
          bottom: 5,
        },
      ],
      xAxis: {
        type: "category",
        data: xAxis || [],
        axisLabel: {
          show: true, // 确保显示
          rotate: 0,
          margin: 15,
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
          onZero: false,
        },
      },
      yAxis: [
        {
          type: "value",
          position: "left",
          alignTicks: true,
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
          splitLine: {
            lineStyle: {
              color: ChartsFlowOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          splitNumber: 5,
          scale: true,
        },
        {
          type: "value",
          position: "right",
          alignTicks: true,
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
            formatter: function (value) {
              return value + "%";
            },
          },
          splitLine: {
            lineStyle: {
              color: ChartsFlowOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          splitNumber: 5,
          scale: true,
        },
      ],
    };
  }

  // 楼层分析-客流趋势图图例配置
  static getFloorAnalyseTrendLegendConfig(floors) {
    const baseLegend = {
      bottom: 20,
      textStyle: {
        fontSize: 12,
      },
      data: [],
    };

    // 为每个楼层创建图例项（只添加柱状图，折线图共用名称不显示在图例中）
    floors.forEach((floor, index) => {
      // const rgbIndex = index % ChartsFlowOptHelper.Colors.RGBListLinnear.length;
      const color = ChartsFlowOptHelper.Colors.RGBListLinnear[index] || ChartsFlowOptHelper.Colors.RGBListLinnear[0];

      // 楼层数据柱状图
      baseLegend.data.push({
        name: floor.floorName,
        itemStyle: {
          color: `rgba(${color})`,
        },
      });
    });

    return baseLegend;
  }

  // 楼层分析-客流趋势图系列配置
  static getFloorAnalyseTrendSeriesConfig(floors, linnearRGB, showLineChart) {
    const createBarSeries = (name, data, rgbIndex) => ({
      name,
      type: "bar",
      smooth: true,
      yAxisIndex: 0,
      barMaxWidth: 70,
      itemStyle: {
        opacity: 1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: `rgba(${linnearRGB[rgbIndex]},1)`,
          },
          {
            offset: 0.5,
            color: `rgba(${linnearRGB[rgbIndex]},0.5)`,
          },
          {
            offset: 1,
            color: `rgba(${linnearRGB[rgbIndex]},0)`,
          },
        ]),
      },
      data,
    });

    const createLineSeries = (name, data, rgbIndex) => ({
      name: name,
      type: "line",
      smooth: true,
      yAxisIndex: 1, // 使用右侧Y轴
      data: data,
      symbol: "circle", // 镂空圆点
      symbolSize: 4,
      lineStyle: {
        color: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        width: 1.5,
      },
      itemStyle: {
        color: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        borderColor: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        borderWidth: 0.5,
      },
      legendHoverLink: false, // 不响应图例hover
    });

    const series = [];

    // 为每个楼层创建柱状图和折线图
    floors.forEach((floor, index) => {
      const rgbIndex = index % linnearRGB.length;

      // 确保数据是数组
      const floorData = Array.isArray(floor.data) ? floor.data : [];
      const arriveRateData = Array.isArray(floor.arriveRate) ? floor.arriveRate.map((val) => parseFloat(val) || 0) : [];

      // 创建柱状图（楼层数据）1
      series.push(createBarSeries(floor.floorName, floorData, rgbIndex));

      if (showLineChart) {
        // 创建折线图（抵达率）- 使用相同的名称，但不显示在图例中
        const lineSeries = createLineSeries(floor.floorName, arriveRateData, rgbIndex);
        // 设置 showInLegend: false，让折线图不显示在图例中
        lineSeries.showInLegend = false;
        series.push(lineSeries);
      }
    });

    return series;
  }

  /**顾客洞察-顾客分群图系列配置 */
  static createCustomerGroupAgeCompareBarOpt(data) {
    const { curBaseData, preBaseData, lastWeekBaseData, isSameDay, isCurrentDay, ageEnums, genderEnums } = data || {};
    let barWidth = 35;
    let series = [];
    let xAxis = [];

    // 如果没有数据，返回空配置
    if (!curBaseData || !preBaseData || !ageEnums) {
      return {
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: [],
      };
    }

    // 判断是否显示男性和女性数据
    // genderEnums 为空或未定义时，显示所有性别（兼容旧逻辑）
    // 否则根据 genderEnums 中是否包含对应的键来判断
    const showMale = !genderEnums || Object.keys(genderEnums).length === 0 || genderEnums[1];
    const showFemale = !genderEnums || Object.keys(genderEnums).length === 0 || genderEnums[2];

    // 按年龄段和性别组织数据
    const sortedAgeKeys = Object.keys(ageEnums).sort((a, b) => Number(a) - Number(b));

    // 生成x轴数据（年龄段名称）
    xAxis = sortedAgeKeys.map((ageKey) => ageEnums[ageKey].title);

    // 创建标签
    const curLabel = isCurrentDay ? "今日客流" : "本期客流";
    const preLabel = isCurrentDay ? "昨日客流" : "上期客流";
    const lastWeekLabel = isCurrentDay ? "上周同天客流" : "上周同期客流";

    // 标签显示文字
    const curLabelText = isCurrentDay ? "今日" : "本期";
    const preLabelText = isCurrentDay ? "昨日" : "上期";
    const lastWeekLabelText = isCurrentDay ? "上周同天" : "上周同期";

    // 生成当前期男性数据
    const curMaleData = sortedAgeKeys.map((ageKey) => {
      const ageKeyNum = Number(ageKey);
      return curBaseData.male?.[ageKey] || curBaseData.male?.[ageKeyNum] || 0;
    });

    // 生成当前期女性数据
    const curFemaleData = sortedAgeKeys.map((ageKey) => {
      const ageKeyNum = Number(ageKey);
      return curBaseData.female?.[ageKey] || curBaseData.female?.[ageKeyNum] || 0;
    });

    // 生成往期男性数据
    const preMaleData = sortedAgeKeys.map((ageKey) => {
      const ageKeyNum = Number(ageKey);
      return preBaseData.male?.[ageKey] || preBaseData.male?.[ageKeyNum] || 0;
    });

    // 生成往期女性数据
    const preFemaleData = sortedAgeKeys.map((ageKey) => {
      const ageKeyNum = Number(ageKey);
      return preBaseData.female?.[ageKey] || preBaseData.female?.[ageKeyNum] || 0;
    });

    // 生成上周同天男性数据
    const lastWeekMaleData = sortedAgeKeys.map((ageKey) => {
      const ageKeyNum = Number(ageKey);
      return lastWeekBaseData.male?.[ageKey] || lastWeekBaseData.male?.[ageKeyNum] || 0;
    });

    // 生成上周同天女性数据
    const lastWeekFemaleData = sortedAgeKeys.map((ageKey) => {
      const ageKeyNum = Number(ageKey);
      return lastWeekBaseData.female?.[ageKey] || lastWeekBaseData.female?.[ageKeyNum] || 0;
    });

    // 创建堆叠柱状图系列
    // 根据性别筛选条件决定是否显示男性和女性数据
    // 当前期：男性 + 女性（堆叠）
    // 往期：男性 + 女性（堆叠）

    // 计算每个堆叠的总和，用于在顶部显示标签
    const curTotalData = sortedAgeKeys.map((ageKey, index) => {
      let total = 0;
      if (showMale) total += curMaleData[index] || 0;
      if (showFemale) total += curFemaleData[index] || 0;
      return total;
    });

    const preTotalData = sortedAgeKeys.map((ageKey, index) => {
      let total = 0;
      if (showMale) total += preMaleData[index] || 0;
      if (showFemale) total += preFemaleData[index] || 0;
      return total;
    });

    const lastWeekTotalData = sortedAgeKeys.map((ageKey, index) => {
      let total = 0;
      if (showMale) total += lastWeekMaleData[index] || 0;
      if (showFemale) total += lastWeekFemaleData[index] || 0;
      return total;
    });

    if (showMale) {
      // 如果只显示男性（不显示女性），则在男性系列上显示标签
      const showLabelOnMale = !showFemale;

      series.push({
        type: "bar",
        name: `${curLabel}-${Language.NAN}`,
        stack: curLabel, // 使用相同的stack名称实现堆叠
        data: curMaleData,
        barWidth,
        itemStyle: {
          color: ChartsFlowOptHelper.Colors.GenderColors[0], // 男性颜色（蓝色）
        },
        // 如果只显示男性，在顶部显示文字标签
        ...(showLabelOnMale && {
          label: {
            show: true,
            position: "top",
            formatter: (params) => {
              const index = params.dataIndex;
              const value = curTotalData[index];
              return value > 0 ? curLabelText : "";
            },
            textStyle: {
              color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
        }),
      });
      series.push({
        type: "bar",
        name: `${preLabel}-${Language.NAN}`,
        stack: preLabel, // 使用不同的stack名称，与当前期分开
        data: preMaleData,
        barWidth,
        itemStyle: {
          color: ChartsFlowOptHelper.Colors.GenderColors[0], // 男性颜色（蓝色）
        },
        // 如果只显示男性，在顶部显示文字标签
        ...(showLabelOnMale && {
          label: {
            show: true,
            position: "top",
            formatter: (params) => {
              const index = params.dataIndex;
              const value = preTotalData[index];
              return value > 0 ? preLabelText : "";
            },
            textStyle: {
              color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
        }),
      });
      isSameDay &&
        series.push({
          type: "bar",
          name: `${lastWeekLabel}-${Language.NAN}`,
          stack: lastWeekLabel, // 使用不同的stack名称，与当前期分开
          data: lastWeekMaleData,
          barWidth,
          itemStyle: {
            color: ChartsFlowOptHelper.Colors.GenderColors[0], // 男性颜色（蓝色）
          },
          // 如果只显示男性，在顶部显示文字标签
          ...(showLabelOnMale && {
            label: {
              show: true,
              position: "top",
              formatter: (params) => {
                const index = params.dataIndex;
                const value = lastWeekTotalData[index];
                return value > 0 ? lastWeekLabelText : "";
              },
              textStyle: {
                color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
                fontSize: 12,
              },
            },
          }),
        });
    }

    if (showFemale) {
      series.push({
        type: "bar",
        name: `${curLabel}-${Language.NV}`,
        stack: curLabel, // 与上面的系列堆叠
        data: curFemaleData,
        barWidth,
        itemStyle: {
          color: ChartsFlowOptHelper.Colors.GenderColors[1], // 女性颜色（橙色）
        },
        // 在堆叠顶部显示文字标签
        label: {
          show: true,
          position: "top",
          formatter: (params) => {
            const index = params.dataIndex;
            const value = curTotalData[index];
            return value > 0 ? curLabelText : "";
          },
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
      });
      series.push({
        type: "bar",
        name: `${preLabel}-${Language.NV}`,
        stack: preLabel, // 与上面的系列堆叠
        data: preFemaleData,
        barWidth,
        itemStyle: {
          color: ChartsFlowOptHelper.Colors.GenderColors[1], // 女性颜色（橙色）
        },
        // 在堆叠顶部显示文字标签
        label: {
          show: true,
          position: "top",
          formatter: (params) => {
            const index = params.dataIndex;
            const value = preTotalData[index];
            return value > 0 ? preLabelText : "";
          },
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
      });
      isSameDay &&
        series.push({
          type: "bar",
          name: `${lastWeekLabel}-${Language.NV}`,
          stack: lastWeekLabel, // 使用不同的stack名称，与当前期分开
          data: lastWeekFemaleData,
          barWidth,
          itemStyle: {
            color: ChartsFlowOptHelper.Colors.GenderColors[1], // 女性颜色（橙色）
          },
          // 在堆叠顶部显示总数值标签
          label: {
            show: true,
            position: "top",
            formatter: (params) => {
              const index = params.dataIndex;
              const value = lastWeekTotalData[index];
              return value > 0 ? lastWeekLabelText : "";
            },
            textStyle: {
              color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
        });
    }

    // 动态生成图例数据
    const legendData = [];
    if (showMale) {
      legendData.push(Language.NAN);
    }
    if (showFemale) {
      legendData.push(Language.NV);
    }

    var option = {
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left",
        },
        formatter: (params) => {
          if (!params || params.length === 0) return "无数据";
          let name = params[0]?.name || "未知";
          let formatter = `${name}<br>`;

          const curParams = params.filter((item) => item.seriesName?.includes(curLabel));
          const preParams = params.filter((item) => item.seriesName?.includes(preLabel));
          const lastWeekParams = params.filter((item) => item.seriesName?.includes(lastWeekLabel));

          // 根据性别筛选条件显示数据
          if (showMale) {
            const curMaleParam = curParams.find((item) => item.seriesName?.includes(Language.NAN));
            const preMaleParam = preParams.find((item) => item.seriesName?.includes(Language.NAN));
            const lastWeekMaleParam = lastWeekParams.find((item) => item.seriesName?.includes(Language.NAN));
            if (curMaleParam || preMaleParam) {
              formatter += `<div style="margin-bottom: 8px;">${curMaleParam?.marker || preMaleParam?.marker || ""} ${Language.NAN}<br>`;
              if (curMaleParam) {
                formatter += `<span style="margin-left: 10px;">${curLabel}   <span style="padding:0 6px;">${curMaleParam.value}</span></span><br>`;
              }
              if (preMaleParam) {
                formatter += `<span style="margin-left: 10px;">${preLabel}   <span style="padding:0 6px;">${preMaleParam.value}</span></span><br>`;
              }
              if (lastWeekMaleParam && isSameDay) {
                formatter += `<span style="margin-left: 10px;">${lastWeekLabel}   <span style="padding:0 6px;">${lastWeekMaleParam.value}</span></span><br>`;
              }
              formatter += `</div>`;
            }
          }

          if (showFemale) {
            const curFemaleParam = curParams.find((item) => item.seriesName?.includes(Language.NV));
            const preFemaleParam = preParams.find((item) => item.seriesName?.includes(Language.NV));
            const lastWeekFemaleParam = lastWeekParams.find((item) => item.seriesName?.includes(Language.NV));
            if (curFemaleParam || preFemaleParam) {
              formatter += `<div>${curFemaleParam?.marker || preFemaleParam?.marker || ""} ${Language.NV}<br>`;
              if (curFemaleParam) {
                formatter += `<span style="margin-left: 10px;">${curLabel}  <span style="padding:0 6px;">${curFemaleParam.value}</span></span><br>`;
              }
              if (preFemaleParam) {
                formatter += `<span style="margin-left: 10px;">${preLabel}  <span style="padding:0 6px;">${preFemaleParam.value}</span></span><br>`;
              }
              if (lastWeekFemaleParam && isSameDay) {
                formatter += `<span style="margin-left: 10px;">${lastWeekLabel}   <span style="padding:0 6px;">${lastWeekFemaleParam.value}</span></span><br>`;
              }
              formatter += `</div>`;
            }
          }

          return formatter;
        },
      },
      legend: {
        data: legendData,
        bottom: 0,
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 10,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xAxis,
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
        axisLabel: {
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
          rotate: 0, // 可以设置旋转角度
        },
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        axisLabel: {
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
          formatter: "{value}",
        },
      },
      series,
    };
    return option;
  }

  /**顾客洞察-性别统计图option */
  static createGenderStatisticsOpt({ xAxis, maleData, femaleData, xAxisTooltips, genderEnumsSelect, femaleAvg, maleAvg }) {
    let option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: {
            color: "#999",
            width: 1,
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#eee",
        borderWidth: 1,
        textStyle: { color: "#333" },
        padding: [8, 12],
        formatter: function (params) {
          let result = "";
          // 确保参数存在
          if (!params || params.length === 0) return result;

          const index = params[0].dataIndex;
          const day = xAxisTooltips && xAxisTooltips[index] ? xAxisTooltips[index] : "";

          if (day) {
            result += `<div style="margin-bottom:6px;text-align:start;">${day}</div>`;
          }

          // 根据筛选条件显示对应的数据
          params.forEach((param) => {
            const seriesName = param.seriesName;
            const value = param.value !== undefined ? param.value : 0;
            let color = param.color;

            if (value !== undefined) {
              result += `<div style="display:flex;align-items:center;margin-bottom:4px;font-size:14px;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${color};"></span>
                    <span style="flex-grow:1;text-align:start;">${seriesName}：</span>
                    <span style="font-weight:bold;">${value}</span>
                </div>`;
            }
          });

          return result;
        },
      },
      legend: {
        bottom: 45,
        textStyle: {
          fontSize: 12,
        },
        data: [],
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 75,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        data: xAxis || [],
        axisLabel: {
          show: true,
          rotate: 0,
          margin: 15,
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 10,
        },
      ],
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
      series: [],
    };

    // 判断是否显示男性和女性数据
    const showMale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[1];
    const showFemale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[2];

    // 根据筛选条件添加系列
    if (showMale && maleData) {
      const maleSeries = ChartsFlowOptHelper.createGenderStatisticsSeries(0, maleAvg);
      maleSeries.data = maleData;
      maleSeries.name = Language.NAN;
      option.series.push(maleSeries);
      option.legend.data.push(Language.NAN);
    }

    if (showFemale && femaleData) {
      const femaleSeries = ChartsFlowOptHelper.createGenderStatisticsSeries(1, femaleAvg);
      femaleSeries.data = femaleData;
      femaleSeries.name = Language.NV;
      option.series.push(femaleSeries);
      option.legend.data.push(Language.NV);
    }

    return option;
  }

  /**顾客洞察-性别统计图系列配置 */
  static createGenderStatisticsSeries(index, avg) {
    // 使用性别颜色，男性用第一个颜色，女性用第二个颜色
    const genderColors = ChartsFlowOptHelper.Colors.GenderColors;
    index = index % genderColors.length;
    var color = genderColors[index];
    var data = {
      type: "line",
      smooth: true,
      lineStyle: {
        color: `${color}`,
        width: 1,
      },
      areaStyle: {
        opacity: 1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: color,
          },
          {
            offset: 1,
            color: "rgba(255,255,255,0)",
          },
        ]),
      },
      symbol: "circle",
      symbolSize: 4,
      itemStyle: {
        color: `${color}`,
        borderColor: `${color}`,
        borderWidth: 0,
      },
      markLine: {
        silent: true,
        emphasis: {
          disabled: true,
        },
        symbol: ["none", "none"],
        label: {
          position: "insideEndTop",
          color: ChartsFlowOptHelper.Colors.AvgLineColor[index],
          formatter: (param) => `${index === 0 ? Language.NAN : Language.NV}-${Language.PINGJUNZHI}: ${param.value}`,
        },
        data: [
          {
            yAxis: avg,
            lineStyle: {
              color: ChartsFlowOptHelper.Colors.AvgLineColor[index],
            },
          },
        ],
      },
    };
    return data;
  }

  /**顾客洞察-年龄统计图option */
  static createAgeStatisticsOpt({ xAxis, YINGERArr, ERTONGArr, QINGNIANArr, ZHUANGNIANArr, ZHONGLAONIANArr, WEIZHIArr, xAxisTooltips, ageEnumsSelect }) {
    let option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: {
            color: "#999",
            width: 1,
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#eee",
        borderWidth: 1,
        textStyle: { color: "#333" },
        padding: [8, 12],
        formatter: function (params) {
          let result = "";
          // 确保参数存在
          if (!params || params.length === 0) return result;

          const index = params[0].dataIndex;
          const day = xAxisTooltips && xAxisTooltips[index] ? xAxisTooltips[index] : "";

          if (day) {
            result += `<div style="margin-bottom:6px;text-align:start;">${day}</div>`;
          }

          // 根据筛选条件显示对应的数据
          params.forEach((param) => {
            const seriesName = param.seriesName;
            const value = param.value !== undefined ? param.value : 0;
            let color = param.color;

            if (value !== undefined) {
              result += `<div style="display:flex;align-items:center;margin-bottom:4px;font-size:14px;">
                    <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${color};"></span>
                    <span style="flex-grow:1;text-align:start;">${seriesName}：</span>
                    <span style="font-weight:bold;">${value}</span>
                </div>`;
            }
          });

          return result;
        },
      },
      legend: {
        bottom: 45,
        textStyle: {
          fontSize: 12,
        },
        data: [],
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 75,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        data: xAxis || [],
        axisLabel: {
          show: true,
          rotate: 0,
          margin: 15,
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 10,
        },
      ],
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
      series: [],
    };

    // 定义年龄段配置：key, title, data, colorIndex
    // 为每个年龄段分配固定的颜色索引，确保颜色一致性
    const ageGroups = [
      { key: 1, title: Language.YINGER, data: YINGERArr, colorIndex: 0 },
      { key: 2, title: Language.ERTONG, data: ERTONGArr, colorIndex: 1 },
      { key: 4, title: Language.QINGNIAN, data: QINGNIANArr, colorIndex: 2 },
      { key: 5, title: Language.ZHUANGNIAN, data: ZHUANGNIANArr, colorIndex: 3 },
      { key: 6, title: Language.ZHONGLAONIAN, data: ZHONGLAONIANArr, colorIndex: 4 },
      { key: 7, title: Language.WEIZHI, data: WEIZHIArr, colorIndex: 5 },
    ];

    // 获取颜色列表
    const ageColors = ChartsFlowOptHelper.Colors.HEXListLinnear;

    // 根据筛选条件添加系列
    ageGroups.forEach((ageGroup) => {
      // 判断是否显示该年龄段数据
      // ageEnumsSelect 为空或未定义时，显示所有年龄段
      // 否则根据 ageEnumsSelect 中是否包含对应的键来判断
      const shouldShow = !ageEnumsSelect || Object.keys(ageEnumsSelect).length === 0 || ageEnumsSelect[ageGroup.key];

      if (shouldShow && ageGroup.data) {
        const ageSeries = ChartsFlowOptHelper.createAgeStatisticsSeries(ageGroup.colorIndex % ageColors.length);
        ageSeries.data = ageGroup.data;
        ageSeries.name = ageGroup.title;
        option.series.push(ageSeries);
        option.legend.data.push(ageGroup.title);
      }
    });

    return option;
  }

  /**顾客洞察-年龄统计图系列配置 */
  static createAgeStatisticsSeries(colorIndex) {
    // 使用颜色列表，循环使用
    const ageColors = ChartsFlowOptHelper.Colors.HEXListLinnear;
    const color = ageColors[colorIndex % ageColors.length];
    var data = {
      type: "line",
      smooth: true,
      lineStyle: {
        color: `${color}`,
        width: 1,
      },
      areaStyle: {
        opacity: 1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: color,
          },
          {
            offset: 1,
            color: "rgba(255,255,255,0)",
          },
        ]),
      },
      symbol: "circle",
      symbolSize: 4,
      itemStyle: {
        color: `${color}`,
        borderColor: `${color}`,
        borderWidth: 0,
      },
    };
    return data;
  }

  // 外部分析-客流趋势图option
  static createOffSenceFlowTrendChartOpt(data) {
    const { chartData, xAxis, xAxisTooltips, showInStoreRate, showInSiteRate, baseType } = data;
    const { storeOutNumArr, siteOutNumArr, inSiteNumArr, inSiteCountArr, storeEntryRateArr, siteEntryRateArr } = chartData || {};

    let linnearRGB = ChartsFlowOptHelper.Colors.RGBListLinnear;

    // 确保 xAxis 和 xAxisTooltips 有默认值
    const _xAxis = xAxis || [];
    const _xAxisTooltips = xAxisTooltips || [];

    // 获取公共配置（和楼层分析共用一套）
    const commonConfig = ChartsFlowOptHelper.getFloorAnalyseTrendCommonConfig(_xAxisTooltips, _xAxis);

    // 自定义 tooltip formatter，用于显示进店率和进场率
    const customTooltip = {
      trigger: "axis",
      textStyle: {
        align: "left", // 控制文本对齐方式
      },
      formatter: (params) => {
        if (!params || params.length === 0) return "";
        let flex1 = "";
        let flex2 = "";
        let flex3 = "";
        let date = _xAxisTooltips && _xAxisTooltips[params[0].dataIndex] ? _xAxisTooltips[params[0].dataIndex] : params[0].name;
        let formatter = `${date}<br>`;

        // 按系列类型分组处理
        params.forEach((item) => {
          // if (item.seriesType === "bar") {
          // 柱状图数据（客流数据）
          let seriesName = item.seriesName;
          let marker = item.marker;
          let value = item.value || 0;
          flex1 += `<div>${marker}${seriesName}：</div>`;
          if (item.seriesType === "line") {
            value = value + "%";
          }
          flex2 += `${value}<br>`;
        });
        flex1 = `<div style="width:auto;">${flex1}</div>`;
        flex2 = `<div style="width:auto;text-align:left;margin-right: 20px;">${flex2}</div>`;
        // flex3 = flex3 ? `<div style="width:auto;">${flex3}</div>` : "";

        formatter = `${date}<br><div style="width:auto;display:flex;flex-direction:row">${flex1}${flex2}</div>`;
        return formatter;
      },
    };

    const baseLegend = {
      bottom: 20,
      textStyle: {
        fontSize: 12,
      },
      data: [],
    };
    baseLegend.data.push({
      name: baseType === "ALL" ? Language.GUODIANKELIU : Language.CHANGWAIKELIU,
      itemStyle: {
        color: `rgba(${linnearRGB[0]})`,
      },
    });
    baseLegend.data.push({
      name: Language.JINCHANGRENCI,
      itemStyle: {
        color: `rgba(${linnearRGB[1]})`,
      },
    });
    baseLegend.data.push({
      name: Language.JINCHANGRENSHU,
      itemStyle: {
        color: `rgba(${linnearRGB[2]})`,
      },
    });

    if (showInStoreRate && baseType === "ALL") {
      baseLegend.data.push({
        name: Language.JINDIANLV,
        itemStyle: {
          color: `rgba(${linnearRGB[4]})`,
        },
      });
    }
    if (showInSiteRate && baseType === "OS") {
      baseLegend.data.push({
        name: Language.JINCHANGLV,
        itemStyle: {
          color: `rgba(${linnearRGB[4]})`,
        },
      });
    }

    const createBarSeries = (name, data, rgbIndex) => ({
      name,
      type: "bar",
      smooth: true,
      yAxisIndex: 0,
      barMaxWidth: 70,
      itemStyle: {
        opacity: 1,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: `rgba(${linnearRGB[rgbIndex]},1)`,
          },
          {
            offset: 0.5,
            color: `rgba(${linnearRGB[rgbIndex]},0.5)`,
          },
          {
            offset: 1,
            color: `rgba(${linnearRGB[rgbIndex]},0)`,
          },
        ]),
      },
      data: Array.isArray(data) ? data : [],
    });

    const createLineSeries = (name, data, rgbIndex) => ({
      name: name,
      type: "line",
      smooth: true,
      yAxisIndex: 1, // 使用右侧Y轴
      data: data,
      symbol: "circle", // 镂空圆点
      symbolSize: 4,
      lineStyle: {
        color: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        width: 1.5,
      },
      itemStyle: {
        color: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        borderColor: `rgba(${linnearRGB[rgbIndex]},0.8)`,
        borderWidth: 0.5,
      },
      legendHoverLink: false, // 不响应图例hover
    });

    const seriesConfig = [];
    if (baseType === "ALL") {
      seriesConfig.push(createBarSeries(Language.GUODIANKELIU, storeOutNumArr, 0));
    } else if (baseType === "OS") {
      seriesConfig.push(createBarSeries(Language.CHANGWAIKELIU, siteOutNumArr, 0));
    }
    // 始终添加三个柱状图系列，即使数据为空
    seriesConfig.push(createBarSeries(Language.JINCHANGRENCI, inSiteCountArr, 1));
    seriesConfig.push(createBarSeries(Language.JINCHANGRENSHU, inSiteNumArr, 2));

    if (showInStoreRate && baseType === "ALL") {
      seriesConfig.push(createLineSeries(Language.JINDIANLV, storeEntryRateArr, 4));
    }
    if (showInSiteRate && baseType === "OS") {
      seriesConfig.push(createLineSeries(Language.JINCHANGLV, siteEntryRateArr, 4));
    }

    return {
      ...commonConfig,
      tooltip: customTooltip,
      legend: baseLegend,
      series: seriesConfig,
    };
  }

  /**外部分析-出入口分析图系列配置 */
  static createOffSenceDoorAnalysisOpt(data) {
    const { xAxis, xAxisTooltips, doorDataMap } = data;
    if (!xAxis || !doorDataMap || doorDataMap.length === 0) {
      return null;
    }

    const ageColors = ChartsFlowOptHelper.Colors.HEXListLinnear;

    // 动态生成 legend
    const legendData = doorDataMap.map((door, index) => ({
      name: door.doorName,
      itemStyle: {
        color: ageColors[index % ageColors.length],
      },
    }));

    // 动态生成 series
    const series = doorDataMap.map((door, index) => {
      const color = ageColors[index % ageColors.length];
      return {
        name: door.doorName,
        type: "line",
        smooth: true,
        data: door.data,
        symbol: "circle",
        symbolSize: 4,
        lineStyle: {
          color: color,
          width: 1,
        },
        itemStyle: {
          color: color,
          borderColor: color,
          borderWidth: 0,
        },
        areaStyle: {
          opacity: 1,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: color,
            },
            {
              offset: 1,
              color: "rgba(255,255,255,0)",
            },
          ]),
        },
      };
    });

    return {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          snap: true,
          lineStyle: {
            color: "#999",
            width: 1,
          },
        },
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#eee",
        borderWidth: 1,
        textStyle: { color: "#333" },
        padding: [8, 12],
        formatter: function (params) {
          let result = "";
          if (!params || params.length === 0) return result;

          const index = params[0].dataIndex;
          const day = xAxisTooltips[index];
          result += `<div style="margin-bottom:6px;text-align:start;">${day}</div>`;

          params.forEach((item) => {
            const color = item.color;
            const name = item.seriesName;
            const value = item.value !== undefined ? item.value : 0;
            result += `<div style="display:flex;align-items:center;margin-bottom:4px;font-size:14px;">
              <span style="display:inline-block;margin-right:8px;border-radius:50%;width:12px;height:12px;background-color:${color};"></span>
              <span style="flex-grow:1;text-align:start;">${name}：</span>
              <span style="font-weight:bold;">${value}</span>
            </div>`;
          });

          return result;
        },
      },
      legend: {
        data: legendData,
        bottom: 20,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 75,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xAxis || [],
        boundaryGap: true,
        axisLabel: {
          show: true,
          rotate: 0,
          margin: 15,
          color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[1],
            width: 1,
          },
          onZero: false,
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsFlowOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsFlowOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 100,
        },
        {
          start: 0,
          end: 30,
          height: 15,
          bottom: 5,
        },
      ],
      series: series,
    };
  }
}

export default ChartsFlowOptHelper;
