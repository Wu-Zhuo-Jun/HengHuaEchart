import React, { Component } from "react";
import echarts from "@/utils/echarts";
import ChartsOptHelper from "./utils/ChartsOptHelper";
import ChartsFlowOptHelper from "./utils/ChartsFlowOptHelper";
import ChartsDataViewOptHelper from "./utils/ChartsDataViewOptHelper";
// import { graphic } from "echarts/components";
import { Language } from "@/language/LocaleContext";
import "./styles/Charts.css";

// const OptHelper = ChartsOptHelper;

export class Chart extends React.PureComponent {
  // static OptHelper = ChartsOptHelper
  constructor(props) {
    super(props);
    this.chartRef = React.createRef();
    this.chartInstance = React.createRef();
    // this.state = {option: props.data};
  }
  componentDidMount() {
    if (!this.chartRef.current) return;
    if (!this.chartInstance.current) {
      this.chartInstance.current = echarts.init(this.chartRef.current);
    }
    window.addEventListener("resize", this.handleResize);
    this.setOption(this.props.data);
    // 确保图表在挂载后正确调整尺寸
    // setTimeout(() => {
    //   this.chartInstance.current?.resize();
    // }, 50);
  }

  componentDidUpdate(prevProps) {
    if (!this.chartRef.current) return;
    if (!this.chartInstance.current) {
      this.chartInstance.current = echarts.init(this.chartRef.current);
    }
    this.chartInstance.current?.resize();
    this.setOption(this.props.data);
    // this.handleResize();
    // 确保图表在更新后正确调整尺寸
    // setTimeout(() => {
    //   this.chartInstance.current?.resize();
    // }, 100);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    this.chartInstance.current?.dispose();
    this.chartInstance.current = null;
  }

  setOption = (data) => {
    if (!data) return null;
    const option = this.getOption(data);
    if (option) {
      // 添加动画配置
      const optionWithAnimation = {
        ...option,
        animation: true,
        animationDuration: 800,
        animationEasing: "cubicOut",
        animationDelay: 50,
      };
      this.chartInstance.current?.setOption(optionWithAnimation, { notMerge: true });
    }
  };

  getOption = (data) => {
    return ChartsOptHelper.createFlowTrendOpt(data);
  };

  handleResize = () => {
    this.chartInstance.current?.resize();
  };

  render() {
    return <div className="chart" ref={this.chartRef}></div>;
  }
}

export class RosePieChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createRosePieOpt(data);
    return option;
  };
}

export class FlowLineChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createFlowTrendOpt(data);
    return option;
  };
}

export class VisitingPeakChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createVisitingPeakChartOpt(data);
    return option;
  };
}

export class GrowthRateBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createGrowthRateBarChartOpt(data);
    return option;
  };
}

export class GrowthRateLineChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createGrowthRateLineChartOpt(data);
    return option;
  };
}

export class StayAnalysisChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createStayAnalysisChartOpt(data);
    return option;
  };
}

export class FloorConverPieChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createFloorConverPieChartOpt(data);
    return option;
  };
}

export class SmallFloorConverPieChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createFloorConverPieChartOpt(data, true);
    return option;
  };
}

export class FloorArriveBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createFloorArriveBarChartOpt(data);
    return option;
  };
}

export class CustomerAttrBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createCustomerAttrBarChartOpt(data);
    return option;
  };
}

export class CustomerMoodRadarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createCustomerMoodRadarChartOpt(data);
    // const option = ChartsOptHelper.createCustomerMoodRadarChartOptTest(data);
    return option;
  };
}

export class OnlineDevicePieChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createOnlineDevicePieChartOpt(data);
    return option;
  };
}

export class ForecastFlowLineChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createForecastFlowLineChartOpt(data);
    return option;
  };
}

export class BussinessGaugeChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createBussinessGaugeChartOpt(data);
    return option;
  };
}

export class VisitingPeakLineChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createVisitingPeakLineChartOpt(data);
    return option;
  };
}

export class WorkWeekAnalysisLineBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createWorkWeekAnalysisLineBarChartOpt(data);
    return option;
  };
}

export class HeadMapChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createHeatMapChartOpt(data);
    return option;
  };
}

export class CustomerPortraitCompareBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createCustomerPortraitCompareBarOpt(data);
    return option;
  };
}

export class CustomerMoodCompareBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createCustomerMoodCompareBarOpt(data);
    return option;
  };
}

/**顾客洞察-顾客分群年龄段对比柱状图 */
export class CustomerGroupAgeCompareBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsFlowOptHelper.createCustomerGroupAgeCompareBarOpt(data);
    return option;
  };
}

/**顾客洞察-性别统计 */
export class CustomerInsightGenderStatisticsChart extends Chart {
  getOption = (data) => {
    const option = ChartsFlowOptHelper.createGenderStatisticsOpt(data);
    return option;
  };
}

/**顾客洞察-年龄统计 */
export class CustomerInsightAgeStatisticsChart extends Chart {
  getOption = (data) => {
    const option = ChartsFlowOptHelper.createAgeStatisticsOpt(data);
    return option;
  };
}

export class CompetitiveAnalysisScatterChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createCompetitiveAnalysisScatterOpt(data);
    return option;
  };

  setOption = (data) => {
    if (!data) return null;
    const option = this.getOption(data);
    if (option) {
      // 添加动画配置
      const optionWithAnimation = {
        ...option,
        animation: true,
        animationDuration: 800,
        animationEasing: "cubicOut",
        animationDelay: 0,
      };
      this.chartInstance.current?.setOption(optionWithAnimation);
      const width = this.chartInstance.current?.getWidth();
      this.chartInstance.current?.setOption({
        graphic: {
          elements: [
            {
              x: width / 4,
              left: null,
              type: "text",
              style: {
                textAlign: "center",
              },
            },
            {
              x: (width / 4) * 3,
              left: null,
              type: "text",
              style: {
                textAlign: "center",
              },
            },
            {
              x: width / 4,
              left: null,
              type: "text",
              style: {
                textAlign: "center",
              },
            },
            {
              x: (width / 4) * 3,
              left: null,
              type: "text",
              style: {
                textAlign: "center",
              },
            },
          ],
        },
      });
    }
  };

  handleResize = () => {
    this.chartInstance.current?.resize();
    const width = this.chartInstance.current?.getWidth();
    this.chartInstance.current?.setOption({
      graphic: {
        elements: [
          {
            x: width / 4,
            left: null,
            type: "text",
            style: {
              textAlign: "center",
            },
          },
          {
            x: (width / 4) * 3,
            left: null,
            type: "text",
            style: {
              textAlign: "center",
            },
          },
          {
            x: width / 4,
            left: null,
            type: "text",
            style: {
              textAlign: "center",
            },
          },
          {
            x: (width / 4) * 3,
            left: null,
            type: "text",
            style: {
              textAlign: "center",
            },
          },
        ],
      },
    });
  };
}

export class FlowTrendLineChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createFlowTrendLineChartOpt(data);
    return option;
  };
}

export class FlowTrendBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createFlowTrendBarChartOpt(data);
    return option;
  };
}

export class WeatherAnalysisPieChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createWeatherAnalysisPieChartOpt(data);
    return option;
  };
}

export class WeatherAnalysisBarChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createWeatherAnalysisBarChartOpt(data);
    return option;
  };
}

export class AnnualHeatMapChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createAnnualHeatMapChartOpt(data);
    return option;
  };

  setOption = (data) => {
    if (!data) return null;
    const option = this.getOption(data);
    if (option) {
      this.handleResize();
      // 添加动画配置
      const optionWithAnimation = {
        ...option,
        animation: true,
        animationDuration: 800,
        animationEasing: "cubicOut",
        animationDelay: 50,
      };
      this.chartInstance.current?.setOption(optionWithAnimation, { notMerge: false });
    }
  };
}

export class OverviewOnlineDevicePieChart extends Chart {
  getOption = (data) => {
    const option = ChartsOptHelper.createOverviewOnlineDevicePieChartOpt(data);
    return option;
  };
}

/**出入口对比-流量对比 */
export class OutletComparisonFlowLComparisonChart extends Chart {
  getOption = (data) => {
    const option = ChartsFlowOptHelper.createFlowComparisonOpt(data);
    return option;
  };
}

/**出入口对比-时间对比-流量对比 */
export class OutletComparisonTimeFlowLComparisonChart extends Chart {
  getOption = (data) => {
    const option = ChartsFlowOptHelper.createDualTimeFlowComparisonOpt(data);
    return option;
  };
}

/**出入口对比-客户属性对比 */
export class OutletComparisonCustomerAttrChart extends Chart {
  getOption = (data) => {
    const { yAxis, seriesData } = data;

    const option = ChartsOptHelper.createCustomerAttrBarChartOpt(data);
    option.tooltip = {
      trigger: "axis",
      show: true,
      textStyle: {
        color: "#000",
        fontSize: 14,
        align: "left", // 控制文本对齐方式
      },
      formatter: function (params) {
        if (!params || params.length === 0) return "无数据";

        const dataIndex = params[0].dataIndex;

        const ageGroup = yAxis ? yAxis[dataIndex] : [Language.YINGER, Language.ERTONG, Language.QINGNIAN, Language.ZHUANGNIAN, Language.ZHONGLAONIAN][dataIndex];

        let maleValue = 0;
        let femaleValue = 0;

        params.forEach((param) => {
          if (param.seriesName === Language.NAN) {
            maleValue = param.value;
          } else if (param.seriesName === Language.NV) {
            femaleValue = param.value;
          }
        });
        const ageGroupText = {
          [Language.YINGER]: "(6岁以下)",
          [Language.ERTONG]: "(6-12岁)",
          // [Language.SHAONIAN]: "(13-17岁)",
          [Language.QINGNIAN]: "(18-29岁)",
          [Language.ZHUANGNIAN]: "(30-50岁)",
          [Language.ZHONGLAONIAN]: "(51岁以上)",
          [Language.WEIZHI]: "",
        };

        const total = maleValue + femaleValue;
        const malePercent = total > 0 ? ((maleValue / total) * 100).toFixed(2) : "0.00";
        const femalePercent = total > 0 ? ((femaleValue / total) * 100).toFixed(2) : "0.00";
        // <div style="margin-bottom: 8px; color: #000;">${ageGroup}<span style="margin-left: 4px;">${ageGroupText[ageGroup]}</span></div>

        return `
            <div style="padding: 8px; color: #000;  width: 200px">
              <div style="margin-bottom: 8px; color: #000;">${ageGroup}</div>
              <div style="margin-bottom: 4px; color: #000;">总计: ${total}</div>
              <div style="display: flex; align-items: center; margin-bottom: 2px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #3867D6; margin-right: 6px;"></span>
                <span style="color: #000;">${Language.NAN}: ${maleValue} (${malePercent}%)</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #F9A231; margin-right: 6px;"></span>
                <span style="color: #000;">${Language.NV}: ${femaleValue} (${femalePercent}%)</span>
              </div>
            </div>
          `;
      },
    };
    return option;
  };
}

/**出入口对比-客户心情对比 */
export class OutletComparisonCustomerMoodRadarChart extends Chart {
  getOption = (data) => {
    const option = ChartsFlowOptHelper.createNewCustomerMoodRadarChartOpt(data);
    option.radar.radius = "68%";
    return option;
  };
}

/**出入口分析-客流趋势 */
export class OutletAnalyseFlowLTrendChart extends Chart {
  getOption = (data) => {
    return ChartsFlowOptHelper.createOutletAnalyseFlowLTrendChartOpt(data);
  };
}

/** 出入口分析-热力图 */
export class CustomerAnalyseTimeHeatMapChart extends Chart {
  componentWillUpdate() {
    this.handleResize();
  }

  getOption = (param) => {
    return ChartsFlowOptHelper.createCustomerAnalyseTimeHeatMapChartOpt(param);
  };
}

/**楼层分析-客流趋势 */
export class FloorAnalyseTrendChart extends Chart {
  getOption = (data) => {
    return ChartsFlowOptHelper.createFloorAnalyseTrendChartOpt(data);
  };
}

/**外部分析-客流趋势 */
export class OffSenceAnalyseFlowTrendChart extends Chart {
  getOption = (data) => {
    return ChartsFlowOptHelper.createOffSenceFlowTrendChartOpt(data);
  };
}

/**外部分析-出入口分析 */
export class OffSenceDoorAnalysisChart extends Chart {
  getOption = (data) => {
    return ChartsFlowOptHelper.createOffSenceDoorAnalysisOpt(data);
  };
}

/**数据视图-客流趋势 */
export class DVFlowTrendChart extends Chart {
  getOption = (data) => {
    return ChartsDataViewOptHelper.createDVFlowTrendChartOpt(data);
  };
}

/**数据视图-近7日工作日、周末分析 */
export class DVSevenDaysAnalysisChart extends Chart {
  getOption = (data) => {
    return ChartsDataViewOptHelper.createDVSevenDaysAnalysisChartOpt(data);
  };
}

/**数据视图-近12个月客流趋势柱状图 */
export class DV12MonthsFlowTrendChart extends Chart {
  getOption = (data) => {
    return ChartsDataViewOptHelper.createDV12MonthsFlowTrendChartOpt(data);
  };
}

/**数据视图-楼层转化分析图 */
export class DVFloorConverPieChart extends Chart {
  getOption = (data) => {
    const option = ChartsDataViewOptHelper.createDVFloorConverPieChartOpt(data, true);
    return option;
  };
}

/**数据视图-楼层转化分析图（南丁格尔玫瑰图） */
export class DVFloorConverPieChartRose extends Chart {
  getOption = (data) => {
    const option = ChartsDataViewOptHelper.createDVFloorConverPieChartOptRose(data, true);
    return option;
  };
}

/**数据视图-客群画像男女比例图 */
export class DVcustomerTopChart extends Chart {
  getOption = (data) => {
    const option = ChartsDataViewOptHelper.createDVcustomerTopChartOpt(data);
    return option;
  };
}

/**数据视图-客群画像年龄属性图 */
export class DVcustomerBottomChart extends Chart {
  getOption = (data) => {
    const option = ChartsDataViewOptHelper.createDVcustomerBottomChartOpt(data);
    return option;
  };
}
