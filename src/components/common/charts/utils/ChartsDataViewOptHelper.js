import echarts, { graphic } from "@/utils/echarts";
import React, { useContext } from "react";
import { text, Language } from "../../../../language/LocaleContext";
import Constant from "../../../../common/Constant";
import TimeUtils from "../../../../utils/TimeUtils";
import StringUtils from "@/utils/StringUtils";
import { Topic } from "@icon-park/react";

class ChartsDataViewOptHelper {
  static Colors = {
    ColorList: ["#3867D6", "#668CE6", "#5951E2", "#A3BDF9", "#507FEE", "#15BA15", "#6D92D7", "#68BBC4", "#58A55C", "#F2BD42", "#EE752F", "#D940A9"],
    ColorListPie: ["#3867D6", "#668CE6", "#5951E2", "#A3BDF9", "#507FEE", "#15BA15", "#6D92D7", "#68BBC4", "#58A55C", "#F2BD42", "#EE752F", "#D940A9"],
    ColorListLine: ["#3867D6", "#5838D6", "#", "#67D638"],
    ColorListLine2: ["#3867D6", "#F9A231"],
    RGBListLinnear: ["56,103,214", "249,162,49", "103,214,56", "88,56,214", "231,76,60", "109,189,253", "56,214,197"], // 蓝橙绿紫红浅蓝洋红青蓝
    HEXListLinnear: ["#3867D6", "#F9A231", "#67D638", "#5838D6", "#E74C3C", "#6DBDFD", "#D638A1", "#38D6C5"], // 蓝橙绿紫红浅蓝洋红青蓝
    ColorAxisLabel: "#101010",
    ColorLine: ["#BBBBBB", "#6E7079"],
    GenderColors: ["#3867D6", "#F9A231", "#67D638"],
    GenderColorsLinnear: ["56,103,214", "249,162,49", "103,214,56"],
    AvgLineColor: ["rgb(255,67,0)", "rgb(67,214,56)"],
    DataViewLineColor: "#00FFFF",
  };

  /**客流趋势  */
  static createDVFlowTrendChartOpt({ xAxis, seriesData }) {
    // 将数据数组转换为 ECharts 系列配置对象
    const lineColor = "#00FFFF"; // 青色线条
    const series =
      Array.isArray(seriesData) && seriesData.length > 0
        ? [
            {
              type: "line",
              smooth: true,
              data: seriesData,
              lineStyle: {
                color: lineColor,
                width: 1,
              },
              areaStyle: {
                opacity: 1,
                color: new graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#00FFFF",
                  },
                  {
                    offset: 1,
                    color: "rgba(0,255,255,0)",
                  },
                ]),
              },
              symbol: "circle",
              symbolSize: 4,
              itemStyle: {
                color: "#FFFFFF",
                borderColor: "#FFFFFF",
                borderWidth: 0,
              },
            },
          ]
        : [];

    const customTooltip = {
      trigger: "axis",
      textStyle: {
        align: "left",
        color: "#000",
        fontSize: 12,
      },
      formatter: (params) => {
        if (!params || params.length === 0) return "";
        let date = "";
        if (xAxis[params[0].dataIndex + 1] == undefined) {
          date = `${xAxis[params[0].dataIndex]}-${xAxis[0]}`;
        } else {
          date = xAxis && xAxis[params[0].dataIndex] ? `${xAxis[params[0].dataIndex]}-${xAxis[params[0].dataIndex + 1]}` : params[0].name;
        }
        const value = params[0].value || 0;
        const markerColor = ChartsDataViewOptHelper.Colors.DataViewLineColor;
        const customMarker = `<span style="display:inline-block;margin-right:4px;border-radius:50%;width:10px;height:10px;background-color:${markerColor};"></span>`;
        return `${date}<br>${customMarker}${Language.JINCHANGRENCI}：${value}`;
      },
    };

    let option = {
      tooltip: customTooltip,

      grid: {
        top: 10,
        left: 20,
        right: 20,
        bottom: 20,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: true,
        data: xAxis || [],
        axisLabel: {
          show: true,
          rotate: 30,
          margin: 15,
          textStyle: {
            color: "#ffffff",
            fontSize: 8,
          },
        },
        axisLine: {
          lineStyle: {
            color: "#ffffff",
            width: 1,
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        axisLabel: {
          show: true,
          textStyle: {
            color: "#ffffff",
            fontSize: 12,
          },
        },
        axisLine: {
          lineStyle: {
            color: "#ffffff",
            width: 1,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#ffffff",
            width: 1,
            type: "dashed",
          },
          z: 0,
          zlevel: 0,
        },
        splitNumber: 3,
        scale: true,
      },
      series: series,
    };

    return option;
  }

  /**近7日工作日、周末分析雷达图 */
  static createDVSevenDaysAnalysisChartOpt({ data1, data2, data3 }) {
    if (!data1 || !data2 || !data3) {
      return null;
    }

    const globalData = [];
    for (let i = 0; i < data1.length; i++) {
      const data1Value = data1 && data1[i] ? data1[i] : 0;
      const data2Value = data2 && data2[i] ? data2[i] : 0;
      const data3Value = data3 && data3[i] ? data3[i] : 0;
      const valueMax = Math.max(data1Value, data2Value, data3Value);
      globalData.push(valueMax);
    }
    // 计算全局最大值，用于设置雷达图的最大值
    const globalMax = Math.max(...globalData, 1);

    // 时段名称数组
    const indicatorNames = [Language.LINGCHEN, Language.ZAOSHANG, Language.ZHONGWU, Language.XIAWU, Language.BANGWAN, Language.WANSHANG];

    const option = {
      tooltip: {
        trigger: "item",
        textStyle: {
          color: "#000",
          fontSize: 12,
          align: "left", // 控制文本对齐方式
        },
        formatter: function (params) {
          const dataIndex = params.dataIndex;
          const label = params.data.name;
          const valueArr = params.data.value;
          let str = `${label}<br>`;
          let marker = `<span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${params.color}; margin-right: 6px;"></span>`;
          for (let i = 0; i < valueArr.length; i++) {
            const value = valueArr[i];
            str += `${marker}${indicatorNames[i]}: ${value}<br>`;
          }
          return str;
        },
      },
      color: ["#00FFFF", "#F9A231", "#67D638"], // 蓝色、橙色、绿色
      legend: {
        data: [Language.GONGZUORIPINGJUNKELIU, Language.ZHOUMOPINGJUNKELIU, Language.ZHENGTIPINGJUNKELIU],
        bottom: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: "#ffffff",
          fontSize: 8,
        },
      },
      radar: {
        center: ["50%", "43%"], // 居中显示
        indicator: [
          { name: Language.LINGCHEN, max: globalMax, min: 0 },
          { name: Language.ZAOSHANG, max: globalMax, min: 0 },
          { name: Language.ZHONGWU, max: globalMax, min: 0 },
          { name: Language.XIAWU, max: globalMax, min: 0 },
          { name: Language.BANGWAN, max: globalMax, min: 0 },
          { name: Language.WANSHANG, max: globalMax, min: 0 },
        ],
        axisNameGap: 5,
        radius: "55%", // 缩小雷达图半径，从70%减小到55%
        shape: "polygon", // 多边形雷达图
        splitNumber: 5, // 同心圆分割段数
        axisName: {
          color: "#ffffff",
          fontSize: 12,
        },
        splitArea: {
          areaStyle: {
            color: "rgba(255,255,255,0.1)",
          },
        },
        axisLine: {
          lineStyle: {
            color: "rgba(255,255,255,0.3)",
            width: 1,
          },
        },
        splitLine: {
          lineStyle: {
            color: "rgba(255,255,255,0.2)",
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
              value: data1,
              name: Language.GONGZUORIPINGJUNKELIU,
              areaStyle: {
                color: "#00FFFF", // 浅蓝色
              },
              lineStyle: {
                color: "#00FFFF",
                width: 2,
              },
              itemStyle: {
                color: "#00FFFF",
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: data2,
              name: Language.ZHOUMOPINGJUNKELIU,
              areaStyle: {
                color: "rgba(249,162,49, 0.4)", // 浅橙色
              },
              lineStyle: {
                color: "#F9A231",
                width: 2,
              },
              itemStyle: {
                color: "#F9A231",
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: data3,
              name: Language.ZHENGTIPINGJUNKELIU,
              areaStyle: {
                color: "rgba(103,214,56, 0.4)", // 浅绿色
              },
              lineStyle: {
                color: "#67D638",
                width: 2,
              },
              itemStyle: {
                color: "#67D638",
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

  /**近12个月客流趋势柱状图 */
  static createDV12MonthsFlowTrendChartOpt({ xAxis, data, xAxisTooltips }) {
    if (!xAxis || !data) {
      return null;
    }

    const _xAxis = xAxis || [];
    const _xAxisTooltips = xAxisTooltips || [];
    const _data = Array.isArray(data) ? data : [];

    // 使用数据视图的颜色配置
    const barColor = ChartsDataViewOptHelper.Colors.DataViewLineColor; // #00FFFF 青色

    // 自定义 tooltip formatter
    const customTooltip = {
      trigger: "axis",
      textStyle: {
        align: "left",
        color: "#000",
        fontSize: 12,
      },
      formatter: (params) => {
        if (!params || params.length === 0) return "";
        const date = _xAxisTooltips && _xAxisTooltips[params[0].dataIndex] ? _xAxisTooltips[params[0].dataIndex] : params[0].name;
        const value = params[0].value || 0;
        return `${date}<br>${params[0].marker}${Language.JINCHANGRENCI}：${value}`;
      },
    };

    const option = {
      grid: {
        top: 16,
        left: 20,
        right: 20,
        bottom: 0,
        containLabel: true,
      },
      tooltip: customTooltip,
      xAxis: {
        type: "category",
        data: _xAxis,
        axisLabel: {
          show: true,
          rotate: 0,
          interval: 0, // 强制显示所有月份标签
          margin: 15,
          textStyle: {
            color: "#ffffff",
            fontSize: 10,
          },
        },
        axisLine: {
          lineStyle: {
            color: "#ffffff",
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
            color: "#ffffff",
            fontSize: 12,
          },
        },
        axisLine: {
          lineStyle: {
            color: "#ffffff",
            width: 1,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#ffffff",
            width: 1,
            type: "dashed",
          },
        },
        splitNumber: 3,
        scale: true,
      },
      series: [
        {
          name: Language.JINCHANGRENCI,
          type: "bar",
          barMaxWidth: 20,
          data: _data,
          itemStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: barColor,
              },
              {
                offset: 0.5,
                color: "rgba(0,255,255,0.5)",
              },
              {
                offset: 1,
                color: "rgba(0,255,255,0)",
              },
            ]),
          },
          label: {
            show: true,
            position: "top",
            textStyle: {
              color: "#ffffff",
              fontSize: 12,
            },
          },
          z: 10,
          zlevel: 10,
        },
      ],
    };

    return option;
  }

  // 标准饼图
  static createDVFloorConverPieChartOpt(data, isSmall = false) {
    var option = {
      color: ChartsDataViewOptHelper.Colors.HEXListLinnear,
      tooltip: {
        trigger: "item",
        position: function (point, params, dom, rect, size) {
          // 让 tooltip 显示在鼠标位置的右侧
          return [point[0] + 10, point[1] - 10];
        },
        textStyle: {
          align: "left",
        },
        formatter: (param) => {
          let name = param.data.name;
          let percent = param.percent;
          let marker = param.marker;
          let seriesName = Language.KELIUBILV;
          return `${name}<br>${marker}${seriesName}: ${percent}%`;
        },
      },
      title: {
        text: Language.GELOUCENGKELIUBILV,
        Topic: 0,
        left: "center",
        textStyle: {
          fontSize: 12,
          color: "#ffffff",
          fontWeight: "normal",
        },
      },
      series: [
        {
          name: Language.GELOUCENGKELIUBILV,
          type: "pie",
          radius: isSmall ? ["20%", "60%"] : ["35%", "50%"], // 缩小圆环图尺寸，使其更紧凑
          center: ["50%", "58%"], // 调整中心位置，为标题留出空间
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: "#fff",
            borderWidth: 0,
          },
          label: {
            show: true,
            position: "outside",
            formatter: (param) => {
              const percent = isSmall ? Math.round(param.percent) : param.percent.toFixed(0);
              return `${percent}%`;
            },
            fontSize: 10,
            color: "#ffffff",
            fontWeight: "normal",
          },
          labelLine: {
            show: true,
            length: 4,
            length2: 8,
            lineStyle: {
              width: 1,
            },
          },
          data: data,
        },
      ],
    };
    return option;
  }

  // 南丁格尔玫瑰图
  static createDVFloorConverPieChartOptRose(data, isSmall = false) {
    var option = {
      color: ChartsDataViewOptHelper.Colors.HEXListLinnear,
      tooltip: {
        trigger: "item",
        position: function (point, params, dom, rect, size) {
          // 让 tooltip 显示在鼠标位置的右侧
          return [point[0] + 10, point[1] - 10];
        },
        textStyle: {
          align: "left",
        },
        formatter: (param) => {
          let name = param.data.name;
          let percent = param.percent;
          let marker = param.marker;
          let seriesName = Language.KELIUBILV;
          return `${name}<br>${marker}${seriesName}: ${percent}%`;
        },
      },
      title: {
        text: Language.GELOUCENGKELIUBILV,
        Topic: 0,
        left: "center",
        textStyle: {
          fontSize: 12,
          color: "#ffffff",
          fontWeight: "normal",
        },
      },
      series: [
        {
          name: Language.GELOUCENGKELIUBILV,
          type: "pie",
          roseType: "radius", // 南丁格尔玫瑰图：扇形的半径根据数值大小变化
          radius: isSmall ? ["12%", "50%"] : ["15%", "45%"], // 玫瑰图需要更大的半径范围来展示效果
          center: ["50%", "54%"], // 调整中心位置，为标题留出空间
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 1, // 添加圆角使视觉效果更好
            borderColor: "#fff",
            borderWidth: 1, // 添加边框以区分扇形
          },
          label: {
            show: true,
            position: "outside",
            formatter: (param) => {
              const percent = isSmall ? Math.round(param.percent) : param.percent.toFixed(0);
              return `${param.name}\n${percent}%`;
            },
            fontSize: 10,
            color: "#ffffff",
            fontWeight: "normal",
          },
          labelLine: {
            show: true,
            length: 6,
            length2: 10,
            lineStyle: {
              width: 1,
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          data: data,
        },
      ],
    };
    return option;
  }

  static createDVcustomerTopChartOpt({ maleTotal = 0, femaleTotal = 0 }) {
    // if (!maleTotal || !femaleTotal) {
    //   return null;
    // }

    // const _xAxis = xAxis || [];
    // const _xAxisTooltips = xAxisTooltips || [];
    // const _data = Array.isArray(data) ? data : [];

    // 使用性别颜色配置
    const genderColors = ChartsDataViewOptHelper.Colors.GenderColors;

    // 自定义 tooltip formatter
    // const customTooltip = {
    //   trigger: "axis",
    //   textStyle: {
    //     align: "left",
    //     color: "#000",
    //     fontSize: 12,
    //   },
    //   formatter: (params) => {
    //     if (!params || params.length === 0) return "";
    //     const date = _xAxisTooltips && _xAxisTooltips[params[0].dataIndex] ? _xAxisTooltips[params[0].dataIndex] : params[0].name;
    //     const value = params[0].value || 0;
    //     return `${date}<br>${params[0].marker}${Language.JINCHANGRENCI}：${value}`;
    //   },
    // };

    const option = {
      grid: {
        top: 16,
        left: 0,
        // right: 20,
        bottom: 0,
        containLabel: true,
      },
      // tooltip: customTooltip,
      xAxis: {
        type: "category",
        data: [Language.NAN, Language.NV],
        axisLabel: {
          show: true,
          rotate: 0,
          interval: 0, // 强制显示所有月份标签
          margin: 5,
          textStyle: {
            color: "#ffffff",
            fontSize: 10,
          },
        },
        axisLine: {
          lineStyle: {
            color: "#ffffff",
            width: 1,
          },
          onZero: false,
        },
      },
      yAxis: {
        show: false,
        // splitLine: {
        //   show: true,
        //   lineStyle: {
        //     color: "#ffffff",
        //     width: 1,
        //     type: "dashed",
        //   },
        // },
        // splitNumber: 2,
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 20,
          data: [maleTotal, femaleTotal],
          itemStyle: {
            opacity: 1,
            color: (params) => {
              const baseColor = genderColors[params.dataIndex] || genderColors[0];
              // 将十六进制颜色转换为 rgba，底部设置为透明
              const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
              };
              return new graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: baseColor,
                },
                {
                  offset: 0.5,
                  color: baseColor,
                },
                {
                  offset: 1,
                  color: hexToRgba(baseColor, 0),
                },
              ]);
            },
          },
          label: {
            show: true,
            position: "top",
            textStyle: {
              color: "#ffffff",
              fontSize: 12,
            },
          },
        },
      ],
    };

    return option;
  }

  // 客户年龄图
  static createDVcustomerBottomChartOpt({ yAxis, seriesData, portraitBar }) {
    var barWidth = portraitBar ? 14 : 24;
    var option = {
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {
          let axisValueLabel = params[0].axisValueLabel;
          let total = 0;
          for (let i = 0; i < params.length; i++) {
            let param = params[i];
            total += param.value;
          }
          let str = `${axisValueLabel}<br>`;
          for (let i = 0; i < params.length; i++) {
            let param = params[i];
            let marker = param.marker;
            let seriesName = param.seriesName;
            let value = param.value;
            let percent = 0;
            if (total > 0) {
              percent = (value / total) * 100;
              if (percent % 1 !== 0) {
                percent = percent.toFixed(2);
              }
            }
            str += `${marker}${seriesName}:     ${value} (${percent}%)<br>`;
          }
          return str;
        },
      },
      grid: portraitBar
        ? { left: 6, right: 6, top: 22, bottom: 2, containLabel: true }
        : {
            left: 0,
            top: 0,
            bottom: 0,
            containLabel: true,
          },
      xAxis: {
        type: "category",
        data: yAxis ? yAxis : [Language.YINGER, Language.ERTONG, Language.SHAONIAN, Language.QINGNIAN, Language.ZHUANGNIAN, Language.ZHONGLAONIAN, Language.WEIZHI],
        axisLine: {
          lineStyle: {
            color: ChartsDataViewOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
        axisLabel: {
          show: true,
          rotate: 0,
          interval: 0, // 强制显示所有标签
          margin: portraitBar ? 8 : 10,
          textStyle: {
            color: "#ffffff",
            fontSize: portraitBar ? 11 : 10,
          },
        },
      },
      yAxis: {
        // max: "dataMax",
        type: "value",
        // min: 0,
        // minInterval: 1,
        splitLine: {
          lineStyle: {
            color: portraitBar ? "rgba(255, 255, 255, 0.28)" : ChartsDataViewOptHelper.Colors.ColorLine[0],
            width: 1,
            type: "dashed",
          },
        },
        splitNumber: 2,
        axisLabel: {
          show: false, // 不显示y轴坐标label
        },
      },
      series: [],
    };
    option.series = [];
    if (seriesData && seriesData.length > 0) {
      let max = 0;
      for (let i = 0; i < seriesData.length; i++) {
        let item = seriesData[i];
        max = Math.max(max, Math.max(...item.data));
        let color = ChartsDataViewOptHelper.Colors.GenderColors[i % ChartsDataViewOptHelper.Colors.GenderColors.length];
        let data = {
          type: "bar",
          stack: "total",
          name: item.name,
          itemStyle: {
            color,
          },
          barWidth,
          barCategoryGap: portraitBar ? "48%" : undefined,
          data: item.data,
        };

        option.series.push(data);
      }
      if (portraitBar && option.series.length > 0) {
        const yLabels = yAxis || [];
        const totals = yLabels.map((_, col) =>
          seriesData.reduce((sum, s) => sum + (Number(s.data[col]) || 0), 0),
        );
        const lastIdx = option.series.length - 1;
        option.series[lastIdx] = {
          ...option.series[lastIdx],
          label: {
            show: true,
            position: "top",
            distance: 4,
            color: "#ffffff",
            fontSize: 11,
            formatter: (p) => {
              const v = totals[p.dataIndex];
              return v > 0 ? String(v) : "";
            },
          },
        };
      }
      if (max == 0) {
        option.yAxis.max = 500;
      }
    } else {
      option.yAxis.max = 500;
    }
    return option;
  }
}

export default ChartsDataViewOptHelper;
