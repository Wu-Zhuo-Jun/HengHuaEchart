import echarts, { graphic } from "@/utils/echarts";
import React, { useContext } from "react";
import { text, Language } from "../../../../language/LocaleContext";
import Constant from "../../../../common/Constant";
import TimeUtils from "../../../../utils/TimeUtils";
import CommonUtils from "../../../../utils/CommonUtils";
import StringUtils from "@/utils/StringUtils";
import merge from "lodash/merge";
import ChartsFlowOptHelper from "./ChartsFlowOptHelper";

class ChartsOptHelper {
  static Colors = {
    ColorList: ["#3867D6", "#668CE6", "#5951E2", "#A3BDF9", "#507FEE", "#15BA15", "#6D92D7", "#68BBC4", "#58A55C", "#F2BD42", "#EE752F", "#D940A9"],
    ColorListPie: ["#3867D6", "#668CE6", "#5951E2", "#A3BDF9", "#507FEE", "#15BA15", "#6D92D7", "#68BBC4", "#58A55C", "#F2BD42", "#EE752F", "#D940A9"],
    ColorListLine: ["#3867D6", "#5838D6", "#F9A231", "#67D638"],
    ColorByPortraitStackedBar: ["#3867D6", "#D63867", "#5838D6", "#6DBDFD", "#F9A231", "#5087EC", "#11C25C"], // 客群属性对比
    ColorByMoodStackedBar: ["#38B6D6", "#F9A231", "#5838D6", "#6DBDFD", "#D63867", "#5087EC", "#3867D6", "#D6A738", "#11C25C"], // 客群心情对比
    RGBListLinnear: ["56,103,214", "88,56,214", "249,162,49", "103,214,56"],
    ColorAxisLabel: "#101010",
    ColorLine: ["#BBBBBB", "#6E7079"],
    GenderColors: ["#3867D6", "#F9A231", "#67D638"],
    GenderColorsLinnear: ["56,103,214", "249,162,49", "103,214,56"],
  };

  static createFlowTrendOpt({ legend, xAxis, series }) {
    var option = ChartsOptHelper.createFlowTrendOptTmp();
    option.legend.data = legend;
    option.xAxis.data = xAxis;
    var series = series;
    let max = 0;
    for (let i = 0; i < series.length; i++) {
      let yAxis = series[i];
      max = Math.max(max, Math.max(...yAxis));
      let tmp = ChartsOptHelper.createFlowTrendSeries(i);
      tmp.data = yAxis;
      tmp.name = legend[i];
      option.series.push(tmp);
    }
    if (max > 0) {
      option.yAxis.max = null;
    }
    // option.yAxis.max = max > 0 ? max : 1000;
    return option;
  }

  static createVisitingPeakLineChartOpt({ legend, xAxis, series }) {
    let option = ChartsOptHelper.createFlowTrendOpt({ legend, xAxis, series });
    option.xAxis.axisLabel.interval = "auto";
    option.xAxis.axisLabel.rotate = 45;
    option.grid.bottom = 20;
    return option;
  }

  static createFlowTrendOptTmp() {
    var option = {
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
      },
      legend: {
        bottom: 5,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        // boundaryGap: false,
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          rotate: 0,
          interval: "auto",
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 1000,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        minInterval: 1,
        scale: true,
      },
      series: [],
    };
    return option;
  }
  static createFlowTrendSeries(index) {
    index = index % ChartsOptHelper.Colors.ColorListLine.length;
    var color = ChartsOptHelper.Colors.ColorListLine[index];
    var linnearRGB = ChartsOptHelper.Colors.RGBListLinnear[index];
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
            color: `rgba(${linnearRGB},1)`,
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
    // 对今日数据做特别加深
    if (index == 0) {
      data.areaStyle.color = new graphic.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: `rgba(${linnearRGB},1)`, // 增加透明度，让颜色更深
        },
        {
          offset: 0.5,
          color: `rgba(${linnearRGB},0.4)`, // 中间位置保持一定透明度
        },
        {
          offset: 1,
          color: `rgba(${linnearRGB},0.1)`, // 底部保持轻微透明度而不是完全透明
        },
      ]);
    }
    return data;
  }
  static createRosePieOpt(data) {
    var option = {
      title: {
        text: Language.KELIUZHANBI,
        bottom: -5,
        left: "center",
        textStyle: {
          fontSize: 14,
          color: "rgb(51,51,51)",
          fontWeight: "normal",
        },
      },
      color: ChartsOptHelper.Colors.ColorListPie,
      legend: {
        show: false,
      },
      series: [
        {
          type: "pie",
          radius: [20, 100],
          center: ["50%", "50%"],
          roseType: "area",
          itemStyle: {
            borderRadius: 8,
          },
          label: {
            show: false,
          },
          data: data,
        },
      ],
    };
    return option;
  }
  static createVisitingPeakChartOpt({ data1, data2, data3 }) {
    const globalData = [];
    for (let i = 0; i < data1.length; i++) {
      const data1Value = data1 && data1[i] ? data1[i] : 0;
      const data2Value = data2 && data2[i] ? data2[i] : 0;
      const data3Value = data3 && data3[i] ? data3[i] : 0;
      const valueMax = Math.max(data1Value, data2Value, data3Value);
      globalData.push(valueMax);
    }
    // 计算全局最大值，用于设置雷达图的最大值
    const globalMax = Math.max(...globalData);
    const option = {
      tooltip: {
        // trigger: 'item',
        // formatter: '{b}<br/>{a}: {c}'
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
      },
      color: ["#5470c6", "#91cc75", "#fac858"],
      legend: {
        data: [Language.GONGZUORIPINGJUNKELIU, Language.ZHOUMOPINGJUNKELIU, Language.ZHENGTIPINGJUNKELIU],
        bottom: 0,
        icon: "circle",
      },
      radar: {
        indicator: [
          { name: text(Language.PARAM_LINGCHEN, { value: "(0:00-6:00)" }), max: globalMax, min: 0 },
          { name: text(Language.PARAM_ZAOSHANG, { value: "(6:00-11:00)" }), max: globalMax, min: 0 },
          { name: text(Language.PARAM_ZHONGWU, { value: "(11:00-14:00)" }), max: globalMax, min: 0 },
          { name: text(Language.PARAM_XIAWU, { value: "(14:00-17:00)" }), max: globalMax, min: 0 },
          { name: text(Language.PARAM_BANGWAN, { value: "(17:00-19:00)" }), max: globalMax, min: 0 },
          { name: text(Language.PARAM_WANSHANG, { value: "(19:00-24:00)" }), max: globalMax, min: 0 },
        ],
        axisNameGap: 5,
        radius: "70%",
        shape: "polygon", // 多边形雷达图
        splitNumber: 5, // 同心圆分割段数
        axisName: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          fontSize: 12,
        },
        splitArea: {
          areaStyle: {
            color: "rgb(255,255,255)",
          },
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
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
                color: "rgba(56,103,214, 0.4)",
              },
              lineStyle: {
                color: "#3867D6",
                width: 1,
              },
              itemStyle: {
                color: "#3867D6",
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: data2,
              name: Language.ZHOUMOPINGJUNKELIU,
              areaStyle: {
                color: "rgba(88,56,214, 0.4)",
              },
              lineStyle: {
                color: "#5838D6",
                width: 1,
              },
              itemStyle: {
                color: "#5838D6",
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: data3,
              name: Language.ZHENGTIPINGJUNKELIU,
              areaStyle: {
                color: "rgba(249,162,49, 0.4)",
              },
              lineStyle: {
                color: "#F9A231",
                width: 1,
              },
              itemStyle: {
                color: "#F9A231",
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

  static createGrowthRateBarChartOpt({ xAxis, legendData, seriesData }) {
    var linnearRGB = ChartsOptHelper.Colors.RGBListLinnear;
    var barWidth = 26;
    var option = {
      grid: {
        top: 20,
        left: 20,
        right: 0,
        bottom: 35,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        valueFormatter: (value) => `${value}%`,
      },
      legend: {
        // bottom: 5,
        top: "bottom",
        textStyle: {
          fontSize: 12,
        },
      },
      xAxis: {
        type: "category",
        data: xAxis,
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          rotate: 0,
          interval: 0,
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
          formatter: "{value}%",
        },
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
    };
    option.legend.data = [];
    if (legendData == null || legendData.length == 0) {
      legendData = [Language.GUOQUQIRI, Language.GUOQUSHISIRI, Language.GUOQUSANSHIRI];
    }
    for (let i = 0; i < legendData.length; i++) {
      let index = i % ChartsOptHelper.Colors.ColorListLine.length;
      let color = ChartsOptHelper.Colors.ColorListLine[index];
      option.legend.data.push({
        name: legendData[i],
        itemStyle: {
          color: color,
        },
      });
    }
    if (seriesData && seriesData.length > 0) {
      option.series = [];
      let min = 0;
      let max = 100;
      let length = seriesData.length > 3 ? 3 : seriesData.length;
      for (let i = 0; i < length; i++) {
        min = Math.min(min, Math.min(...seriesData[i]));
        max = Math.max(max, Math.max(...seriesData[i]));
        let index = i % linnearRGB.length;
        let data = seriesData[i];
        let item = {
          name: legendData[i],
          type: "bar",
          smooth: true,
          itemStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${linnearRGB[index]},1)`,
              },
              {
                offset: 0.5,
                color: `rgba(${linnearRGB[index]},0.5)`,
              },
              {
                offset: 1,
                color: `rgba(${linnearRGB[index]},0)`,
              },
            ]),
          },
          barWidth,
          data: data,
        };
        option.series.push(item);
      }
      option.yAxis.min = min;
      option.yAxis.max = max;
    }

    return option;
  }

  static createGrowthRateLineChartOpt({ xAxis, legendData, seriesData }) {
    var option = {
      color: ChartsOptHelper.Colors.ColorListLine,
      grid: {
        top: 20,
        left: 20,
        right: 0,
        bottom: 35,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        valueFormatter: (value) => `${value}%`,
      },
      legend: {
        data: [
          {
            name: Language.GUOQUQIRI,
            itemStyle: {
              color: "#3867D6",
            },
          },
          {
            name: Language.GUOQUSHISIRI,
            itemStyle: {
              color: "#5838D6",
            },
          },
          {
            name: Language.GUOQUSANSHIRI,
            itemStyle: {
              color: "#F9A231",
            },
          },
        ],
        // bottom: 5,
        top: "bottom",
        textStyle: {
          fontSize: 12,
        },
      },
      xAxis: {
        type: "category",
        data: xAxis,
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
          formatter: "{value}%",
        },
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
    };
    option.legend.data = [];
    if (legendData == null || legendData.length == 0) {
      legendData = [Language.GUOQUQIRI, Language.GUOQUSHISIRI, Language.GUOQUSANSHIRI];
    }
    for (let i = 0; i < legendData.length; i++) {
      let index = i % ChartsOptHelper.Colors.ColorListLine.length;
      let color = ChartsOptHelper.Colors.ColorListLine[index];
      option.legend.data.push({
        name: legendData[i],
        itemStyle: {
          color: color,
        },
      });
    }
    if (seriesData && seriesData.length > 0) {
      option.series = [];
      let min = 0;
      let max = 100;
      let length = seriesData.length > 3 ? 3 : seriesData.length;
      for (let i = 0; i < length; i++) {
        min = Math.min(min, Math.min(...seriesData[i]));
        max = Math.max(max, Math.max(...seriesData[i]));
        let data = seriesData[i];
        let item = {
          name: legendData[i],
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 4,
          itemStyle: {
            borderWidth: 0,
          },
          data: data,
        };
        option.series.push(item);
      }
      option.yAxis.min = min;
      option.yAxis.max = max;
    }
    return option;
  }

  static createStayAnalysisChartOpt({ xAxis, data }) {
    var max = Math.max(...data);
    max = max == 0 ? 1000 : max;
    var option = {
      grid: {
        top: 20,
        bottom: 70,
        left: 15,
        right: 0,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
      },
      legend: {
        data: [Language.TINGLIURENSHU],
        bottom: 50,
        textStyle: {
          fontSize: 12,
        },
      },
      xAxis: {
        type: "category",
        // boundaryGap: false,
        data: xAxis,
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          rotate: 45,
          interval: "auto",
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: max,
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        splitNumber: 5,
        scale: true,
      },
      series: [
        {
          name: Language.TINGLIURENSHU,
          type: "line",
          smooth: true,
          lineStyle: {
            color: "#3867D6",
            width: 1,
          },
          itemStyle: {
            color: "#3867D6",
          },
          areaStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[0]},1)`,
              },
              {
                offset: 1,
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[0]},0)`,
              },
            ]),
          },
          symbol: "circle", // 形状为圆形
          symbolSize: 4, // 节点大小
          itemStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[0], // 实心填充颜色
            borderColor: ChartsOptHelper.Colors.ColorListLine[0], // 边框颜色（与填充色一致）
            borderWidth: 0, // 边框宽度设为0（可选）
          },
          data: data,
        },
      ],
      dataZoom: [
        {
          start: 0,
          end: 100,
          height: 26,
        },
      ],
    };
    return option;
  }

  static createFloorConverPieChartOpt(data, isSmall = false) {
    var option = {
      color: ChartsFlowOptHelper.Colors.HEXListLinnear,
      tooltip: {
        trigger: "item",
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
        bottom: -5,
        left: "center",
        textStyle: {
          fontSize: 14,
          color: "rgb(51,51,51)",
          fontWeight: "normal",
        },
      },
      series: [
        {
          name: Language.GELOUCENGKELIUBILV,
          type: "pie",
          radius: isSmall ? ["40%", "55%"] : ["50%", "70%"], // 小尺寸时缩小饼图
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 1,
          },
          // emphasis: {
          //     label: {
          //     show: true,
          //     fontSize: 40,
          //     fontWeight: 'bold'
          //     }
          // },
          label: {
            formatter: (param) => {
              const percent = isSmall ? Math.round(param.percent) : param.percent;
              return `${param.name}\n${percent}%`;
            },
          },
          labelLine: {
            show: true,
          },
          data: data,
        },
      ],
    };
    return option;
  }

  static createFloorArriveBarChartOpt({ yAxis, data, rateData }) {
    const barWidth = 15;
    let max = Math.max(100, Math.max(...data));
    var option = {
      grid: {
        top: "2%",
        bottom: "8%",
        right: "12%",
      },
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left",
        },
      },
      xAxis: {
        max: max,
        type: "value",
        min: 0,
        minInterval: 1,
        splitNumber: 5,
        // scale: true,
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
      },
      yAxis: {
        type: "category",
        data: yAxis,
        axisLabel: {
          width: 20,
          overflow: "truncate",
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      series: [
        {
          type: "bar",
          barWidth,
          data: rateData.map((value) => {
            return {
              value: 0,
              label: {
                formatter: function (param) {
                  return text(Language.PARAM_DIDALV, { value: value });
                },
                show: true,
                position: "right",
                valueAnimation: true,
                color: ChartsOptHelper.Colors.ColorListLine[0],
              },
              itemStyle: {
                emphasis: {
                  silent: true,
                },
              },
            };
          }),
          silent: true,
        },
        {
          type: "bar",
          barWidth,
          data: data,
          itemStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[0],
          },
          label: {
            show: true,
            position: "right",
            valueAnimation: true,
            color: ChartsOptHelper.Colors.ColorListLine[0],
          },
        },
      ],
    };
    return option;
  }

  static createWeatherAnalysisPieChartOpt(data) {
    var option = {
      color: ChartsOptHelper.Colors.ColorListPie,
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (param) => {
          let str = `${param.data.name}<br>${Language.TIANSHU}: ${param.data.value} (${param.percent}%)<br>${Language.PINGJUNRENSHU}: ${param.data.avg}`;
          return str;
        },
      },
      title: {
        text: Language.TIANQIBILV,
        bottom: -5,
        left: "center",
        textStyle: {
          fontSize: 14,
          color: "rgb(51,51,51)",
          fontWeight: "normal",
        },
      },
      series: [
        {
          name: Language.TIANQIBILV,
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: "#fff",
            borderWidth: 1,
          },
          // emphasis: {
          //     label: {
          //     show: true,
          //     fontSize: 40,
          //     fontWeight: 'bold'
          //     }
          // },
          label: {
            formatter: "{b}\n{d}%",
          },
          labelLine: {
            show: true,
          },
          data: data,
        },
      ],
    };
    return option;
  }

  static createWeatherAnalysisBarChartOpt({ yAxis, data, flowType }) {
    var barWidth = 15;
    flowType = flowType ? flowType : Constant.FLOW_TYPE.IN_COUNT;
    let name = flowType === Constant.FLOW_TYPE.IN_COUNT ? Language.JINCHANGRENCI : Language.JINCHANGRENSHU;
    var option = {
      grid: {
        left: 0,
        top: "10%",
        bottom: "10%",
        containLabel: true,
      },
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: "{b}<br/>{a}: {c}",
      },
      xAxis: {
        max: "dataMax",
        type: "value",
        min: 0,
        splitNumber: 5,
        scale: true,
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
      },
      yAxis: {
        type: "category",
        data: yAxis,
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      series: [
        {
          name: name,
          type: "bar",
          barWidth,
          data: data,
          itemStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[0],
          },
          label: {
            show: true,
            position: "right",
            valueAnimation: true,
            color: ChartsOptHelper.Colors.ColorListLine[0],
          },
        },
      ],
    };
    return option;
  }

  static createCustomerAttrBarChartOpt({ yAxis, seriesData }) {
    var barWidth = 15;
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
      grid: {
        left: 0,
        top: 0,
        bottom: 0,
        // right: 0,
        containLabel: true,
      },
      xAxis: {
        max: "dataMax",
        type: "value",
        min: 0,
        // splitNumber:7,
        // scale: true,
        minInterval: 1,
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
      },
      yAxis: {
        type: "category",
        data: yAxis ? yAxis : [Language.YINGER, Language.ERTONG, Language.SHAONIAN, Language.QINGNIAN, Language.ZHUANGNIAN, Language.ZHONGLAONIAN, Language.WEIZHI],
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
        axisLabel: {
          textStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            fontSize: 12,
          },
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
        let color = ChartsOptHelper.Colors.GenderColors[i % ChartsOptHelper.Colors.GenderColors.length];
        let data = {
          type: "bar",
          stack: "total",
          name: item.name,
          itemStyle: {
            color,
          },
          barWidth,
          data: item.data,
        };
        option.series.push(data);
      }
      if (max == 0) {
        option.xAxis.max = 500;
      }
    } else {
      option.xAxis.max = 500;
    }
    return option;
  }

  static createCustomerMoodRadarChartOptTest({ unknowData, maleData, femaleData }) {
    var option = {
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        // formatter: '{b}<br/>{a}: {c}'
      },
      legend: {
        data: [Language.NAN, Language.NV, Language.WEIZHI],
        bottom: 0,
        icon: "roundRect",
      },
      radar: {
        indicator: [
          { name: Language.FENNU, max: "dataMax" },
          { name: Language.WEIZHI, max: "dataMax" },
          { name: Language.KUNHUO, max: "dataMax" },
          { name: Language.GAOXIN, max: "dataMax" },
          { name: Language.PINGJING, max: "dataMax" },
          { name: Language.JINGYA, max: "dataMax" },
          { name: Language.HAIPA, max: "dataMax" },
          { name: Language.YANWU, max: "dataMax" },
          { name: Language.BEISHANG, max: "dataMax" },
        ],
        nameGap: 10,
        radius: "75%",
        shape: "circle",
        splitNumber: 5, // 同心圆分割段数
        axisName: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          fontSize: 12,
        },
        splitArea: {
          areaStyle: {
            color: "rgb(255,255,255)",
          },
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
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
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[0]}, 0.4)`,
              },
              lineStyle: {
                color: ChartsOptHelper.Colors.ColorListLine[0],
                width: 1,
              },
              itemStyle: {
                color: ChartsOptHelper.Colors.ColorListLine[0],
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: femaleData,
              name: Language.NV,
              areaStyle: {
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[2]}, 0.4)`,
              },
              lineStyle: {
                color: ChartsOptHelper.Colors.ColorListLine[2],
                width: 1,
              },
              itemStyle: {
                color: ChartsOptHelper.Colors.ColorListLine[2],
              },
              symbol: "circle",
              symbolSize: 4,
            },
            {
              value: unknowData,
              name: Language.WEIZHI,
              areaStyle: {
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[3]}, 0.4)`,
              },
              lineStyle: {
                color: ChartsOptHelper.Colors.ColorListLine[3],
                width: 1,
              },
              itemStyle: {
                color: ChartsOptHelper.Colors.ColorListLine[3],
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

  static createCustomerMoodRadarChartOpt({ legendData, indicatorData, seriesData }) {
    const moodNames = [Language.FENNU, Language.BEISHANG, Language.YANWU, Language.HAIPA, Language.JINGYA, Language.PINGJING, Language.GAOXIN, Language.KUNHUO, Language.WEIZHI];

    const globalMoodData = [];
    const maleData = seriesData[0];
    const femaleData = seriesData[1];
    const unknowData = seriesData[2];
    let maleTotal = 0;
    let femaleTotal = 0;
    let unknowTotal = 0;
    for (let i = 0; i < maleData.length; i++) {
      const maleValue = maleData && maleData[i] ? maleData[i] : 0;
      const femaleValue = femaleData && femaleData[i] ? femaleData[i] : 0;
      const unknowValue = unknowData && unknowData[i] ? unknowData[i] : 0;
      maleTotal = maleTotal + maleValue;
      femaleTotal = femaleTotal + femaleValue;
      unknowTotal = unknowTotal + unknowValue;
      const valueMax = Math.max(maleValue, femaleValue, unknowValue);
      globalMoodData.push(valueMax);
    }
    // 计算全局最大值，用于设置雷达图的最大值
    const globalMax = Math.max(...globalMoodData);

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
      },
      radar: {
        indicator: [
          { name: Language.FENNU, max: globalMax },
          { name: Language.WEIZHI, max: globalMax },
          { name: Language.KUNHUO, max: globalMax },
          { name: Language.GAOXIN, max: globalMax },
          { name: Language.PINGJING, max: globalMax },
          { name: Language.JINGYA, max: globalMax },
          { name: Language.HAIPA, max: globalMax },
          { name: Language.YANWU, max: globalMax },
          { name: Language.BEISHANG, max: globalMax },
        ],
        nameGap: 10,
        radius: "75%",
        shape: "circle",
        splitNumber: 5, // 同心圆分割段数
        axisName: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          fontSize: 12,
        },
        splitArea: {
          areaStyle: {
            color: "rgb(255,255,255)",
          },
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
      },
      series: [
        {
          name: Language.FENBUSHUJU,
          type: "radar",
          data: [],
        },
      ],
    };
    if (legendData && legendData.length > 0) {
      option.legend.data = legendData;
    }
    if (indicatorData && indicatorData.length > 0) {
      option.radar.indicator = [];
      for (let i = 0; i < indicatorData.length; i++) {
        const name = indicatorData[i];
        const indicator = {
          name,
          max: globalMax,
        };
        option.radar.indicator.push(indicator);
      }
    }
    if (seriesData && seriesData.length > 0) {
      option.series = [];
      option.series[0] = {
        name: Language.FENBUSHUJU,
        type: "radar",
        data: [],
      };
      for (let i = 0; i < seriesData.length; i++) {
        const item = seriesData[i];
        const name = legendData[i % legendData.length];
        const data = {
          value: item,
          name,
          areaStyle: {
            color: `rgba(${ChartsOptHelper.Colors.GenderColorsLinnear[i % ChartsOptHelper.Colors.GenderColorsLinnear.length]}, 0.4)`,
          },
          lineStyle: {
            color: ChartsOptHelper.Colors.GenderColors[i % ChartsOptHelper.Colors.GenderColors.length],
            width: 1,
          },
          itemStyle: {
            color: ChartsOptHelper.Colors.GenderColors[i % ChartsOptHelper.Colors.GenderColors.length],
          },
          symbol: "circle",
          symbolSize: 4,
        };
        option.series[0].data.push(data);
      }
    }
    return option;
  }

  static createOnlineDevicePieChartOpt({ onlineCount, offlineCount }) {
    var data = [
      { value: onlineCount, name: Language.ZAIXIANSHEBEISHULIANG, label: { show: false } },
      { value: offlineCount, name: Language.LIXIANSHEBEISHULIANG, label: { show: false } },
    ];
    var total = onlineCount + offlineCount;
    var colors = ["#3867D6", "#F9A231"];
    var option = {
      color: colors,
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        position: "right",
      },
      series: [
        {
          startAngle: 180,
          endAngle: 540,
          name: Language.SHEBEIXINXI,
          type: "pie",
          radius: ["62%", "90%"],
          itemStyle: {
            borderRadius: 4,
          },
          data: data,
        },
      ],
      graphic: {
        elements: [
          {
            type: "text",
            left: "center",
            top: "30%",
            silent: true,
            style: {
              text: total,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
            },
          },
          {
            type: "text",
            left: "center",
            top: "43%",
            silent: true,
            style: {
              text: Language.SHEBEI,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
            },
          },
          {
            type: "text",
            left: "center",
            top: "60%",
            silent: true,
            style: {
              text: Language.ZONGSHU,
              textAlign: "center",
              fontSize: 18,
              lineHeight: 25,
              fill: "#555555",
            },
          },
        ],
      },
    };
    return option;
  }

  static createOverviewOnlineDevicePieChartOpt({ onlineCount, offlineCount }) {
    var data = [
      { value: onlineCount, name: Language.ZAIXIAN, label: { show: true } },
      { value: offlineCount, name: Language.LIXIAN, label: { show: true } },
    ];
    var total = onlineCount + offlineCount;
    var colors = ["#3867D6", "#F9A231"];
    var option = {
      color: colors,
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        position: "right",
      },
      series: [
        {
          startAngle: 180,
          endAngle: 540,
          name: Language.SHEBEIXINXI,
          type: "pie",
          radius: ["55%", "65%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
          },
          label: {
            formatter: function (params) {
              return params.name + "\n" + Math.round(params.percent) + "%"; // 四舍五入取整显示百分比
            },
          },
          labelLine: {
            show: true,
          },
          data: data,
        },
      ],
      graphic: {
        elements: [
          {
            type: "text",
            left: "center",
            top: "33%",
            silent: true,
            style: {
              text: total,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
            },
          },
          {
            type: "text",
            left: "center",
            top: "46%",
            silent: true,
            style: {
              text: Language.SHEBEI,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
            },
          },
          {
            type: "text",
            left: "center",
            top: "60%",
            silent: true,
            style: {
              text: Language.ZONGSHU,
              textAlign: "center",
              fontSize: 18,
              lineHeight: 25,
              fill: "#555555",
            },
          },
        ],
      },
    };
    return option;
  }

  static createForecastFlowLineChartOpt({ xAxis, realData, forecastData }) {
    var option = {
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: function (params) {
          let value = 0;
          let date = "";
          let valueType = 0; // 0:预测流量  1: 历史流量
          for (let i = 0; i < params.length; i++) {
            let item = params[i];
            if (item.value != null) {
              valueType = i;
              value = item.value;
              date = item.axisValue;
              break;
            }
          }
          if (valueType === 0) {
            return `${date}<br/>${text(Language.PARAM_YUCEKELIURENCI_HISTORY, { value: value })}`;
          } else {
            return `${date}<br/>${text(Language.PARAM_YUCEKELIURENCI, { value: value })}`;
          }
        },
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 0,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xAxis,
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: "dataMax",
        axisLabel: {
          show: true,
          textStyle: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            fontSize: 12,
          },
        },
        splitLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[0],
            width: 1,
          },
        },
        minInterval: 1,
        splitNumber: 5,
        scale: true,
      },
      series: [
        {
          type: "line",
          data: realData,
          symbolSize: 0,
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[0],
            width: 1,
          },
          itemStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[0],
          },
          areaStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[0]},1)`,
              },
              {
                offset: 1,
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[0]},0)`,
              },
            ]),
          },
        },
        {
          type: "line",
          data: forecastData,
          symbolSize: 0,
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[2],
            width: 1,
          },
          itemStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[2],
          },
          areaStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[2]},1)`,
              },
              {
                offset: 1,
                color: `rgba(${ChartsOptHelper.Colors.RGBListLinnear[2]},0)`,
              },
            ]),
          },
        },
      ],
    };
    let max = Math.max(...realData, ...forecastData);
    if (max == 0) {
      option.yAxis.max = 1000;
    }
    return option;
  }

  static createBussinessGaugeChartOpt({ month, day, monthRate, yearRate }) {
    monthRate = [{ value: monthRate }];
    yearRate = [{ value: yearRate }];
    var option = {
      legend: {
        show: true,
        left: "70%",
        top: "40%",
        orient: "vertical",
        selectedMode: false,
        data: [
          {
            name: Language.YUEDUMUBIAO,
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[0],
            },
            textStyle: {
              fontSize: 14,
            },
          },
          {
            name: Language.NIANDUMUBIAO,
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[2],
            },
            textStyle: {
              fontSize: 14,
            },
          },
        ],
      },
      series: [
        {
          name: Language.YUEDUMUBIAO,
          type: "gauge",
          startAngle: 90,
          endAngle: -270,
          radius: "100%",
          center: ["25%", "50%"],
          pointer: {
            show: false,
          },
          progress: {
            show: true,
            overlap: false,
            clip: false,
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[0],
            },
          },
          axisLine: {
            lineStyle: {
              width: 10,
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          data: monthRate,
          detail: {
            show: true,
            fontSize: 14,
            formatter: month,
            fontWeight: "normal",
            offsetCenter: ["0%", "-10%"],
          },
        },
        {
          name: Language.NIANDUMUBIAO,
          type: "gauge",
          startAngle: 90,
          endAngle: -270,
          radius: "75%",
          center: ["25%", "50%"],
          pointer: {
            show: false,
          },
          progress: {
            show: true,
            overlap: false,
            clip: false,
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[2],
            },
          },
          axisLine: {
            lineStyle: {
              width: 10,
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          data: yearRate,
          detail: {
            show: true,
            fontSize: 14,
            formatter: day,
            fontWeight: "normal",
            offsetCenter: ["0%", "20%"],
          },
        },
      ],
    };
    return option;
  }
  static createWorkWeekAnalysisLineBarChartOpt({ xAxis, data1, data2, data3 }) {
    var linnearRGB = ChartsOptHelper.Colors.RGBListLinnear;
    var barWidth = 26;
    var option = {
      grid: {
        top: 30,
        left: 0,
        right: 20,
        bottom: 30,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
      },
      legend: {
        data: [
          {
            name: Language.RIJUNJINCHANGRENCI,
            itemStyle: {
              color: "#67D638",
            },
          },
          {
            name: Language.RIJUNJINCHANGRENSHU,
            itemStyle: {
              color: "#F9A231",
            },
          },
          {
            name: Language.RIJUNKELIUPICI,
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[0],
            },
          },
        ],
        bottom: 5,
        textStyle: {
          fontSize: 12,
        },
      },
      xAxis: {
        type: "category",
        data: xAxis,
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          rotate: 0,
          interval: 0,
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
            width: 1,
          },
        },
      },
      yAxis: [
        {
          name: Language.KELIULIANG,
          type: "value",
          position: "left",
          alignTicks: true,
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          splitNumber: 5,
          // scale: true
        },
        {
          name: Language.PICI,
          type: "value",
          position: "right",
          alignTicks: true,
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          splitNumber: 5,
          scale: true,
        },
      ],
      series: [
        {
          name: Language.RIJUNJINCHANGRENCI,
          type: "bar",
          smooth: true,
          yAxisIndex: 0,
          itemStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${linnearRGB[3]},1)`,
              },
              {
                offset: 0.5,
                color: `rgba(${linnearRGB[3]},0.5)`,
              },
              {
                offset: 1,
                color: `rgba(${linnearRGB[3]},0)`,
              },
            ]),
          },
          barWidth,
          data: data1,
        },
        {
          name: Language.RIJUNJINCHANGRENSHU,
          type: "bar",
          smooth: true,
          yAxisIndex: 0,
          itemStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${linnearRGB[2]},1)`,
              },
              {
                offset: 0.5,
                color: `rgba(${linnearRGB[2]},0.5)`,
              },
              {
                offset: 1,
                color: `rgba(${linnearRGB[2]},0)`,
              },
            ]),
          },
          barWidth,
          data: data2,
        },
        {
          name: Language.RIJUNKELIUPICI,
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: data3,
          symbol: "circle", // 形状为圆形
          symbolSize: 4, // 节点大小
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[0],
            width: 1,
          },
        },
      ],
    };
    return option;
  }

  static createHeatMapChartOpt({ xAxis, yAxis, data, max = 100 }) {
    var option = {
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {
          var yLabel = yAxis[params.data[1]];
          var xLabel = xAxis[params.data[0]];
          var value = params.data[2];
          return `${xLabel}<br/>${yLabel}<br/>${value}`;
        },
      },
      grid: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          interval: "auto",
          fontSize: 14,
        },
        data: xAxis,
      },
      yAxis: {
        type: "category",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: true,
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          fontSize: 12,
        },
        data: yAxis,
      },
      visualMap: {
        min: 0,
        max: max,
        show: false,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: "15%",
        color: ["rgba(56,103,214,1)", "rgba(215,225,247,1)"],
        // 从蓝色到红色渐变
      },
      series: [
        {
          type: "heatmap",
          data: data,
          itemStyle: {
            borderWidth: 1,
            borderColor: "white",
          },
          pointSize: 50,
        },
      ],
    };
    return option;
  }

  static createAnnualHeatMapChartOpt({ year, data, min = 0, max = 1000 }) {
    let month = Language.MONTHS;
    let week = Language.WEEKS;
    let weekday = Language.WEEKDAYS;
    var option = {
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left",
        },
        formatter: (param) => {
          let date = param.data[0];
          let value = param.data[1];
          let dateTime = TimeUtils.getDateTimeFromDateStr(date);
          let w = dateTime.weekday;
          let wd = weekday[w - 1];
          return `${param.marker}${date}<br>${wd}<br>${value}`;
        },
      },
      visualMap: {
        min,
        max,
        show: false,
        calculable: true,
        orient: "horizontal",
        left: "center",
        color: ["rgba(56,103,214,1)", "rgba(215,225,247,1)"],
        // 从蓝色到红色渐变
      },
      calendar: {
        top: 0,
        left: 30,
        right: 0,
        bottom: 30,
        cellSize: [37, 26],
        range: year,
        itemStyle: {
          borderWidth: 1,
          borderColor: "white",
        },
        splitLine: {
          show: false,
        },
        monthLabel: {
          silent: true,
          align: "left",
          fontSize: 14,
          margin: 10,
          position: "end",
          nameMap: month,
        },
        dayLabel: {
          fontSize: 14,
          margin: 10,
          verticalAlign: "bottom",
          firstDay: 1,
          nameMap: week,
        },
        yearLabel: { show: false },
      },
      series: {
        type: "heatmap",
        coordinateSystem: "calendar",
        data: data,
      },
    };
    return option;
  }

  /**客群属性对比 */
  static createCustomerPortraitCompareBarOpt(data) {
    let barWidth = 15;
    let series = [];
    let xAxis = [];
    // if (data) {
    let site = data?.site || [];
    let gender = data?.gender || [];
    let age = data?.age || [];
    let genderRate = CommonUtils.percentByIndex(gender); // 比率
    let ageRate = CommonUtils.percentByIndex(age); // 比率
    let genderSeries = [];
    let ageSeries = [];
    genderRate.map((item, index) => {
      let serie = {
        type: "bar",
        stack: "gender",
        name: item.title,
        itemStyle: {
          color: ChartsOptHelper.Colors.GenderColors[index],
        },
        barWidth,
        data: item.percent,
        dataSource: "gender", // 标识数据源为性别
      };
      genderSeries.push(serie);
    });
    ageRate.map((item, index) => {
      let serie = {
        type: "bar",
        stack: "age",
        name: item.title,
        barWidth,
        data: item.percent,
        xAxisIndex: 1,
        yAxisIndex: 1,
        dataSource: "age", // 标识数据源为年龄
      };
      ageSeries.push(serie);
    });
    series = [...genderSeries, ...ageSeries];
    xAxis = site;
    // }

    var option = {
      color: ChartsOptHelper.Colors.ColorByPortraitStackedBar,
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {
          if (!params || params.length === 0) return "无数据";

          let name = params[0]?.name || "未知";
          let formatter = `${name}<br>`;
          let flex1 = "";
          let flex2 = "";
          let flex3 = "";
          params.map((item, index) => {
            let seriesName = item.seriesName;
            let marker = item.marker;
            let value = item.value;
            let dataIndex = item.dataIndex;
            // 通过 seriesIndex 访问对应系列的 dataSource 标识
            let dataSource = series[item.seriesIndex]?.dataSource || "";
            // 可以根据 dataSource 进行不同的处理
            if (dataSource === "gender") {
              flex3 += `${gender[index].data[dataIndex]}<br>`;
            } else if (dataSource === "age") {
              flex3 += `${age[index].data[dataIndex]}<br>`;
            }
            flex1 += `<div>${marker}${seriesName}</div>`;
            flex2 += `(${value}%)<br>`;
          });
          flex1 = `<div style="width:auto; margin-right: 20px;">${flex1}</div>`;
          flex2 = `<div style="width:auto;">${flex2}</div>`;
          flex3 = `<div style="width:auto; text-align:right;margin-right: 4px;">${flex3}</div>`;
          formatter = `${name}<br><div style="width:auto;display:flex;flex-direction:row;">${flex1}${flex3}${flex2}</div>`;
          return formatter;
        },
        console,
      },
      grid: [
        {
          top: 30,
          left: 20,
          right: 0,
          bottom: "58%",
          containLabel: true,
        },
        {
          left: 20,
          right: 0,
          top: "50%",
          bottom: "15%",
          containLabel: true,
        },
      ],
      xAxis: [
        {
          type: "category",
          gridIndex: 0,
          data: xAxis,
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[1],
              width: 1,
            },
          },
          axisLabel: {
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
        },
        {
          type: "category",
          gridIndex: 1,
          data: xAxis,
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[1],
              width: 1,
            },
          },
          axisLabel: {
            show: false,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
        },
      ],
      yAxis: [
        {
          gridIndex: 0,
          max: 100,
          type: "value",
          min: 0,
          splitNumber: 5,
          scale: true,
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
            formatter: "{value}%",
          },
        },
        {
          gridIndex: 1,
          max: 100,
          type: "value",
          min: 0,
          splitNumber: 5,
          scale: true,
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },

            formatter: "{value}%",
          },
        },
      ],
      series,
      dataZoom: [
        {
          start: 0,
          end: 100,
          xAxisIndex: [0, 1],
          height: 26,
          bottom: 35,
        },
      ],
    };
    return option;
  }

  static createCustomerMoodCompareBarOpt(data) {
    let barWidth = 15;
    let series = [];
    let xAxis = [];
    // if (data) {
    let site = data.site;
    let male = data.male;
    let female = data.female;
    let maleSeries = [];
    let femaleSeries = [];
    let maleRate = CommonUtils.percentByIndex(male); // 比率
    let femaleRate = CommonUtils.percentByIndex(female); // 比率
    maleRate.map((item, index) => {
      let serie = {
        type: "bar",
        stack: "male",
        name: item.title,
        barWidth,
        dataSource: "male", // 标识数据源为男性
        data: item.percent,
      };
      maleSeries.push(serie);
    });
    femaleRate.map((item, index) => {
      let serie = {
        type: "bar",
        stack: "female",
        name: item.title,
        barWidth,
        dataSource: "female", // 标识数据源为女性
        data: item.percent,
        xAxisIndex: 1,
        yAxisIndex: 1,
      };
      femaleSeries.push(serie);
    });
    series = [...maleSeries, ...femaleSeries];
    xAxis = site;
    // }

    var option = {
      color: ChartsOptHelper.Colors.ColorByMoodStackedBar,
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {
          if (!params || params.length === 0) return "无数据";

          let name = params[0]?.name || "未知";
          let axisName = params[0]?.axisIndex == 0 ? Language.NAN : Language.NV;
          let flex1 = "";
          let flex2 = "";
          let flex3 = "";
          params.map((item, index) => {
            let seriesName = item.seriesName;
            let marker = item.marker;
            let value = item.value;
            let dataIndex = item.dataIndex;
            let dataSource = series[item.seriesIndex]?.dataSource || "";
            if (dataSource === "male") {
              flex3 += `${male[index].data[dataIndex]}<br>`;
            } else if (dataSource === "female") {
              flex3 += `${female[index].data[dataIndex]}<br>`;
            }
            flex1 += `<div>${marker}${seriesName}</div>`;
            flex2 += `(${value}%)<br>`;
          });
          flex1 = `<div style="width:auto; margin-right: 20px;">${flex1}</div>`;
          flex2 = `<div style="width:auto;">${flex2}</div>`;
          flex3 = `<div style="width:auto; text-align:right;margin-right: 4px;">${flex3}</div>`;
          let formatter = `${axisName}<br>${name}<br><div style="width:auto;display:flex;flex-direction:row;">${flex1}${flex3}${flex2}</div>`;
          return formatter;
        },
      },
      grid: [
        {
          top: 30,
          left: 20,
          right: 0,
          bottom: "58%",
          containLabel: true,
        },
        {
          left: 20,
          right: 0,
          top: "50%",
          bottom: "15%",
          containLabel: true,
        },
      ],
      xAxis: [
        {
          type: "category",
          gridIndex: 0,
          data: xAxis,
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[1],
              width: 1,
            },
          },
          axisLabel: {
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
        },
        {
          type: "category",
          gridIndex: 1,
          data: xAxis,
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[1],
              width: 1,
            },
          },
          axisLabel: {
            show: false,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
        },
      ],
      yAxis: [
        {
          gridIndex: 0,
          max: 100,
          type: "value",
          min: 0,
          splitNumber: 5,
          scale: true,
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
            formatter: "{value}%",
          },
        },
        {
          gridIndex: 1,
          max: 100,
          type: "value",
          min: 0,
          splitNumber: 5,
          scale: true,
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },

            formatter: "{value}%",
          },
        },
      ],
      series,
      dataZoom: [
        {
          start: 0,
          end: 100,
          xAxisIndex: [0, 1],
          height: 26,
          bottom: 35,
        },
      ],
    };
    return option;
  }

  static createCompetitiveAnalysisScatterOpt() {
    var option = {
      tooltip: {
        trigger: "item",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {},
      },
      graphic: {
        elements: [
          {
            top: "20%",
            type: "text",
            style: {
              text: Language.DIJINGZHENGLIGAOZENGZHANGLV,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
              // width:300,
            },
          },
          {
            top: "20%",
            type: "text",
            style: {
              text: Language.GAOJINGZHEENGLIGAOZENGZHANGLV,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
              // width:300,
            },
          },
          {
            top: "60%",
            type: "text",
            style: {
              text: Language.DIJINGZHENGLIDIZENGZHANGLV,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
              // width:300,
            },
          },
          {
            top: "60%",
            type: "text",
            style: {
              text: Language.DIJINGZHENGLIGAOZENGZHANGLV,
              textAlign: "center",
              fontSize: 20,
              fontWeight: "bold",
              lineHeight: 30,
              fill: "#333333",
              // width:300,
            },
          },
        ],
      },
      grid: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      xAxis: [
        {
          type: "value",
          position: "bottom",
          axisLabel: {
            color: ChartsOptHelper.Colors.ColorAxisLabel,
            rotate: 0,
            interval: 0,
            fontSize: 12,
          },
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
            onZero: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
        {
          type: "value",
          position: "top",
          axisLabel: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
            onZero: false,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          // min: 0,
          // max: 1000,
          axisLabel: {
            show: true,
            textStyle: {
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
            formatter: "{value}%",
          },
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
            onZero: false,
          },
          splitLine: {
            show: false,
          },
          splitNumber: 5,
          scale: true,
          axisTick: {
            show: false,
          },
        },
        {
          type: "value",
          position: "right",
          axisLabel: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
            show: true,
            onZero: false,
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
      ],
      series: [
        {
          symbolSize: 19,
          itemStyle: {
            color: "#3867D6",
          },
          name: "abc",
          type: "scatter",
          data: [[160, 5, "asd"]],
          markLine: {
            silent: true,
            symbol: ["none", "none"],
            lineStyle: {
              type: "solid",
            },
            data: [
              {
                type: "average", // 中位线（将数据范围平分为两部分）
                // name: '中位值',
                valueIndex: 1,
              },
              {
                // type: 'average',  // 中位线（将数据范围平分为两部分）
                // name: '中位值',
                xAxis: 90,
                valueIndex: 0,
              },
              // {
              //     xAxis:'50%',
              //     emphasis:{
              //         disabled:true,
              //     },
              //     label:{
              //         show:false,
              //     },
              //     lineStyle:{
              //         color: ChartsOptHelper.Colors.ColorLine[0],
              //         width: 1,
              //     }
              // },
              // {
              //     yAxis:'50%',
              //     emphasis:{
              //         disabled:true,
              //     },
              //     label:{
              //         show:false,
              //     },
              //     lineStyle:{
              //         color: ChartsOptHelper.Colors.ColorLine[0],
              //         width: 1,
              //     }
              // },
            ],
          },
        },
      ],
    };
    return option;
  }

  static createFlowTrendLineChartOpt(data) {
    var option = ChartsOptHelper.createFlowTrendOptTmp();
    option = { ...option, legend: { ...option.legend, show: true }, xAxis: { data: data.xAxis } };
    option = merge(option, data.option);
    var series = data.series;
    var avg = data.avg;
    var maxValue = 0;
    for (let i = 0; i < series.length; i++) {
      let seriesData = series[i].data;
      maxValue = Math.max(maxValue, Math.max(...seriesData));
      let ser = ChartsOptHelper.createFlowTrendSeries(i);

      // ser.name = series[i].name;
      // ser.data = seriesData;
      if (i == 0) {
        ser.markLine = {
          silent: true,
          emphasis: {
            disabled: true,
          },
          symbol: ["none", "none"],
          label: {
            position: "insideEndTop",
            color: "rgb(255,67,0)",
            formatter: (param) => `${Language.PINGJUNZHI}: ${param.value}`,
          },
          data: [
            {
              yAxis: avg,
              lineStyle: {
                color: "rgb(255,67,0)",
              },
            },
          ],
        };
      }

      ser = merge(ser, series[i]);

      option.series.push(ser);
      if (seriesData.length > 31) {
        data.dataZoom = 1;
      }
    }
    option.yAxis.max = maxValue == 0 ? 1000 : null;
    // option.grid.right = 0;
    if (data.dataZoom) {
      option.dataZoom = [
        {
          type: "slider",
          start: 0,
          end: 100,
          height: 26,
          bottom: 10,
          left: "7%",
          right: "7%",
        },
      ];
      option.grid.bottom = 70;
      option.legend.bottom = 40;
    } else {
      option.grid.bottom = 30;
    }
    return option;
  }

  static createAnnualFlowTrendAnalysisLineChartOpt(data) {
    var option = ChartsOptHelper.createFlowTrendOptTmp();
    option = { ...option, legend: { show: false }, xAxis: { data: data.xAxis } };
    var series = data.series;
    var avg = data.avg;
    for (let i = 0; i < series.length; i++) {
      let seriesData = series[i].data;
      let ser = ChartsOptHelper.createFlowTrendSeries(i);
      ser.name = series[i].name;
      if (i == 0) {
        ser.markLine = {
          silent: true,
          emphasis: {
            disabled: true,
          },
          symbol: ["none", "none"],
          label: {
            position: "insideEndTop",
            color: "rgb(255,67,0)",
            formatter: (param) => `${Language.PINGJUNZHI}: ${Math.floor(param.value)}`,
          },
          data: [
            {
              yAxis: avg,
              lineStyle: {
                color: "rgb(255,67,0)",
              },
            },
          ],
        };
      }
      ser.data = seriesData;
      option.series.push(ser);
      if (seriesData.length > 31) {
        data.dataZoom = 1;
      }
    }
    // option.grid.right = 0;
    if (data.dataZoom) {
      option.dataZoom = [
        {
          type: "slider",
          start: 0,
          end: 100,
          height: 26,
          bottom: 10,
          left: "7%",
          right: "4%",
        },
      ];
    } else {
      option.grid.bottom = 0;
    }
    return option;
  }

  static createFlowTrendBarChartOpt({ names, xAxis, data1, data2, data3, avg, unit }) {
    var linnearRGB = ChartsOptHelper.Colors.RGBListLinnear;
    var barWidth = 26;
    names = names ? names : [Language.BENZHOU, Language.SHANGZHOU, Language.HUANBI];
    var option = {
      grid: {
        top: 20,
        left: 0,
        right: 20,
        bottom: 35,
        containLabel: true,
      },
      tooltip: {
        trigger: "axis",
        textStyle: {
          align: "left", // 控制文本对齐方式
        },
        formatter: (params) => {
          if (!params || params.length === 0) return "无数据";

          let name = params[0]?.name || "未知";
          let formatter = `${name}<br>`;
          let flex1 = "";
          let flex2 = "";
          params.map((item, index) => {
            let seriesName = item.seriesName;
            let marker = item.marker;
            let value = item.value;
            flex1 += `<div>${marker}${seriesName}</div>`;
            if (index == 2) {
              flex2 += `${value}%<br>`;
            } else {
              flex2 += `${value}${unit ? unit : ""}<br>`;
            }
          });
          flex1 = `<div style="width:auto;">${flex1}</div>`;
          flex2 = `<div style="width:auto;text-align:right;">${flex2}</div>`;
          formatter = `${name}<br><div style="width:auto;display:flex;flex-direction:row;column-gap:20px;">${flex1}${flex2}</div>`;
          return formatter;
        },
      },
      legend: {
        data: [
          {
            name: names[0],
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[3],
            },
          },
          {
            name: names[1],
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[2],
            },
          },
          {
            name: names[2],
            itemStyle: {
              color: ChartsOptHelper.Colors.ColorListLine[0],
            },
          },
        ],
        bottom: 5,
        textStyle: {
          fontSize: 12,
        },
      },
      xAxis: {
        type: "category",
        data: xAxis,
        axisLabel: {
          color: ChartsOptHelper.Colors.ColorAxisLabel,
          rotate: 0,
          interval: 0,
          fontSize: 12,
        },
        axisLine: {
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorLine[1],
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
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
          },
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
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
              color: ChartsOptHelper.Colors.ColorAxisLabel,
              fontSize: 12,
            },
            formatter: "{value}%",
          },
          splitLine: {
            lineStyle: {
              color: ChartsOptHelper.Colors.ColorLine[0],
              width: 1,
            },
          },
          splitNumber: 5,
          scale: true,
        },
      ],
      series: [
        {
          name: names[0],
          type: "bar",
          smooth: true,
          yAxisIndex: 0,
          itemStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${linnearRGB[3]},1)`,
              },
              {
                offset: 0.5,
                color: `rgba(${linnearRGB[3]},0.5)`,
              },
              {
                offset: 1,
                color: `rgba(${linnearRGB[3]},0)`,
              },
            ]),
          },
          barWidth,
          data: data1,
          markLine: {
            silent: true,
            emphasis: {
              disabled: true,
            },
            symbol: ["none", "none"],
            label: {
              position: "insideEndTop",
              color: "rgb(255,67,0)",
              formatter: (param) => `${Language.PINGJUNZHI}: ${param.value}${unit ? unit : ""}`,
            },
            data: [
              {
                yAxis: avg,
                lineStyle: {
                  color: "rgb(255,67,0)",
                },
              },
            ],
          },
        },
        {
          name: names[1],
          type: "bar",
          smooth: true,
          yAxisIndex: 0,
          itemStyle: {
            opacity: 1,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${linnearRGB[2]},1)`,
              },
              {
                offset: 0.5,
                color: `rgba(${linnearRGB[2]},0.5)`,
              },
              {
                offset: 1,
                color: `rgba(${linnearRGB[2]},0)`,
              },
            ]),
          },
          barWidth,
          data: data2,
        },
        {
          name: names[2],
          type: "line",
          smooth: true,
          yAxisIndex: 1,
          data: data3,
          symbol: "circle", // 形状为圆形
          symbolSize: 4, // 节点大小
          lineStyle: {
            color: ChartsOptHelper.Colors.ColorListLine[0],
            width: 1,
          },
        },
      ],
    };
    if (unit) {
      option.yAxis[0].axisLabel.formatter = (value) => `${value}${unit}`;
    }
    return option;
  }

  static getVirtualData(year) {
    const date = +echarts.time.parse(year + "-01-01");
    const end = +echarts.time.parse(+year + 1 + "-01-01");
    const dayTime = 3600 * 24 * 1000;
    const data = [];
    for (let time = date; time < end; time += dayTime) {
      data.push([echarts.time.format(time, "{yyyy}-{MM}-{dd}", false), Math.floor(Math.random() * 10000)]);
    }
    return data;
  }
}

export default ChartsOptHelper;
