import "./index.less";
import { Button, Select, message } from "antd";
import { useCallback, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Language, text } from "@/language/LocaleContext";
import dayjs from "dayjs";
import { CustomerFlowOutletTrendChart, CustomerFlowTimeHeatMapChart, CustomerAttrChart, CustomerMoodChart } from "./components/Charts";
import { GrowthRateChartPanel, VisitingPeakChartPanel } from "@/components/common/panels/ChartPanel";
import { TimeGranulePicker } from "@/components/common/timeGranulePicker";
import { TableDetail } from "./components/TableDetail";
import useOutletStore from "@/stores/useOutletStore";
import CommonUtils from "@/utils/CommonUtils";
import StringUtils from "@/utils/StringUtils";

import Empty from "@/components/common/Empty";
import { FlowSelect, ICPComponent, UIContentLoading } from "@/components/ui/UIComponent";
import TimeUtils from "@/utils/TimeUtils";
import Constant from "@/common/Constant";
import { outletTypeList } from "@/pages/flow/outletComparison/const";
import DataConverter from "@/data/DataConverter";
import User from "@/data/UserData";

import Http from "@/config/Http";
import { useSite } from "@/context/SiteContext";
import TopLeft from "./components/TopLeft";

/**出入口分析 */
function OutletAnalyse() {
  const TimeGranulePickerRef = useRef(null);
  const [FlowOutletTrend, setFlowOutletTrend] = useState(null);
  const [customerAttrData, setCustomerAttrData] = useState(null);
  const [customerMoodData, setCustomerMoodData] = useState(null);
  // const [customerFlowTimeHeatMapData, setCustomerFlowTimeHeatMapData] = useState(null);
  const [visitingPeakData, setVisitingPeakData] = useState({
    chartType: 1,
    chartData: null,
    data: null,
  }); // 到访峰值
  const [growthRateData, setGrowthRateData] = useState({
    flowType: User.flowTrendSelection[0].value,
    data: null,
  });
  const [countFlowData, setCountFlowData] = useState(null); // 计算客流数据
  const [baseFlowData, setBaseFlowData] = useState(null); // 基础客流数据

  const [timeGranule, setTimeGranule] = useState("hour"); // 时间粒度，默认为小时
  const [selectedOutletIds, setSelectedOutletIds] = useState([]); // 选择器的出入口ID
  const [limit, setLimit] = useState(null); // 限制
  const [limitHeatMap, setLimitHeatMap] = useState(null); // 热力图限制
  const [flowTableData, setFlowTableData] = useState([]);
  const [faceTableData, setFaceTableData] = useState([]);

  const [empty, setEmpty] = useState(true); // 空状态
  const [loading, setLoading] = useState(false); // 加载状态

  const location = useLocation();
  const outletList = useOutletStore((state) => state.outletList);
  const fetchOutletList = useOutletStore((state) => state.fetchOutletList); // 获取出入口接口
  const clearAnalyseSelection = useOutletStore((state) => state.clearAnalyseSelection);
  const analyseDoorId = useOutletStore((state) => state.analyseDoorId);
  const _analyseTimeRange = useOutletStore((state) => state.analyseTimeRange) || [];
  const analyseTimeRange = _analyseTimeRange.map((item) => dayjs(item)); // 时间戳转dayjs
  const currentSiteId = useOutletStore((state) => state.currentSiteId);
  const analyseDoorType = useOutletStore((state) => state.analyseDoorType);
  const handleOutletChange = useOutletStore((state) => state.handleOutletChange);
  const { siteId, setSiteId } = useSite();

  // 组件挂载时清除选定的出入口分析数据
  // 只有在不是从出入口对比页面跳转过来时才清空
  useEffect(() => {
    const fromOutletComparison = location.state?.fromOutletComparison;
    if (!fromOutletComparison) {
      clearAnalyseSelection();
    } else {
      console.log("analyseDoorId", analyseDoorId);
      setSelectedOutletIds([...analyseDoorId[0]]);
    }
  }, [clearAnalyseSelection, location.state]);

  // 从出入口对比页面跳转过来时，自动加载 store 中的数据并请求
  useEffect(() => {
    const fromOutletComparison = location.state?.fromOutletComparison;
    if (fromOutletComparison) {
      window.scrollTo(0, 0);
      TimeGranulePickerRef.current.setTimeRange(analyseTimeRange);
      searchFun();
    }
  }, []);

  useEffect(() => {
    if (siteId && siteId !== currentSiteId) {
      useOutletStore.setState({ analyseDoorId: [] });
      setSelectedOutletIds([]);
      fetchOutletList(siteId);
    }
  }, [siteId, currentSiteId]);

  const handleTimeChange = useCallback((value) => {
    useOutletStore.setState({ analyseTimeRange: value ? value?.map((item) => item.valueOf()) : [] });
  }, []);

  // 查询
  const searchFun = async () => {
    message.config({
      maxCount: 3,
    });
    if (!analyseTimeRange || !analyseTimeRange[0]) {
      message.warning({ content: "时间范围不能为空" });
      return;
    }
    if (!analyseDoorId || !Array.isArray(analyseDoorId) || analyseDoorId.length === 0) {
      message.warning({ content: "出入口不能为空" });
      return;
    }
    setLoading(true);
    setLimit(calculateLimit());
    setLimitHeatMap(calculateLimitHeatMap());
    let doorTypeEnum = {
      ALL: 1,
      // OUTSIDE: 2,
      FLOOR: 3,
    };
    let Params = {
      siteId: currentSiteId,
      doorIds: analyseDoorId.join(","),
      doorType: doorTypeEnum[analyseDoorType] || 1,
      startDate: analyseTimeRange[0].format("YYYY-MM-DD"),
      endDate: analyseTimeRange[1].format("YYYY-MM-DD"),
    };

    try {
      Http.getDoorAnalysisStatsData(Params, (Response) => {
        try {
          if (Response.result === 1) {
            const { flowTrend, compareFlowTrend } = Response.data;
            const _flowTrend = flowTrend.map((item) => {
              return {
                ...item,
                inCount: item.inCount < 0 ? 0 : item.inCount,
                inNum: item.inNum < 0 ? 0 : item.inNum,
                outCount: item.outCount < 0 ? 0 : item.outCount,
                outNum: item.outNum < 0 ? 0 : item.outNum,
                batchCount: item.batchCount < 0 ? 0 : item.batchCount,
              };
            });
            setBaseFlowData(_flowTrend);
            getCountFlowData({ flowTrend: _flowTrend, compareFlowTrend });
            getFlowTrendData({ flowTrend: _flowTrend, timeGranule });
            let timeType = analyseTimeRange[1].diff(analyseTimeRange[0], "day") >= 364 ? Constant.TIME_TYPE.YEAR : Constant.TIME_TYPE.DATE;
            setSiteGrowthRateData(timeType, growthRateData.flowType, Response.data.growthRate);
            setSiteVisitingPeakData(visitingPeakData.chartType, Response.data.visitingPeak);
            getCustomeAttrData(Response.data.faceData);
            getCustomeMoodData(Response.data.faceData);
            getTableDetailData(_flowTrend, Response.data.faceData, Response.data.compareFlowTrend, Response.data.compareFaceData);
            // getCustomerFlowTimeHeatMapData(flowTrend);
            setEmpty(false);
          } else {
            message.warning({ content: Response.msg });
          }
          setLoading(false);
        } catch (innerError) {
          console.error("数据处理错误:", innerError);
          message.error({ content: "数据处理错误" });
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("请求失败:", error);
      message.warning({ content: "请求失败" });
      setLoading(false);
    }
  };

  // 统计客流
  const getCountFlowData = ({ flowTrend, compareFlowTrend }) => {
    const baseFlowTotal = flowTrend.reduce(
      (acc, item) => ({
        inCount: acc.inCount + (item.inCount || 0),
        inNum: acc.inNum + (item.inNum || 0),
        batchCount: acc.batchCount + (item.batchCount || 0),
        outCount: acc.outCount + (item.outCount || 0),
        outNum: acc.outNum + (item.outNum || 0),
      }),
      { inCount: 0, inNum: 0, batchCount: 0, outCount: 0, outNum: 0 }
    );

    // 确保 compareFlowTrend 是数组，如果不是则使用空数组
    const safeCompareFlowTrend = Array.isArray(compareFlowTrend) ? compareFlowTrend : [];

    const compareFlowTotal = safeCompareFlowTrend.reduce(
      (acc, item) => ({
        inCount: acc.inCount + (item.inCount || 0),
        inNum: acc.inNum + (item.inNum || 0),
        batchCount: acc.batchCount + (item.batchCount || 0),
        outCount: acc.outCount + (item.outCount || 0),
        outNum: acc.outNum + (item.outNum || 0),
      }),
      { inCount: 0, inNum: 0, batchCount: 0, outCount: 0, outNum: 0 }
    );

    setCountFlowData({
      ...baseFlowTotal,
      inCountChainRatio: (baseFlowTotal.inCount - compareFlowTotal.inCount) / (compareFlowTotal.inCount || 1),
      inNumChainRatio: (baseFlowTotal.inNum - compareFlowTotal.inNum) / (compareFlowTotal.inNum || 1),
      batchCountChainRatio: (baseFlowTotal.batchCount - compareFlowTotal.batchCount) / (compareFlowTotal.batchCount || 1),
      outCountChainRatio: (baseFlowTotal.outCount - compareFlowTotal.outCount) / (compareFlowTotal.outCount || 1),
      outNumChainRatio: (baseFlowTotal.outNum - compareFlowTotal.outNum) / (compareFlowTotal.outNum || 1),
    });
  };

  // 处理时间粒度变化
  const handleTimeGranuleChange = useCallback(
    (value) => {
      setTimeGranule(value);
      getFlowTrendData({ flowTrend: baseFlowData, timeGranule: value });
    },
    [timeGranule, baseFlowData]
  );

  // dayjs范围转时间戳
  const getTimeSlotByIndex = (startTime, endTime) => {
    return {
      startTime: startTime.unix(),
      endTime: endTime.unix(),
    };
  };

  // 计算限制
  const calculateLimit = () => {
    // if (timeRange[1].diff(timeRange[0], "day") >= 3) {
    //   return "hour";
    // }
    // if (timeRange[1].diff(timeRange[0], "day") >= 1) {
    //   return "mintue";
    // }
    // if (analyseTimeRange[1].diff(analyseTimeRange[0], "day") > 182) {
    //   return "week";
    // }
    if (analyseTimeRange[1].diff(analyseTimeRange[0], "day") > 61) {
      return "day";
    }
    if (analyseTimeRange[1].diff(analyseTimeRange[0], "day") >= 1) {
      return "hour";
    }

    return null;
  };

  // 计算限制
  const calculateLimitHeatMap = () => {
    // if (timeRange[1].diff(timeRange[0], "day") >= 3) {
    //   return "hour";
    // }
    // if (timeRange[1].diff(timeRange[0], "day") >= 1) {
    //   return "mintue";
    // }
    if (analyseTimeRange[1].diff(analyseTimeRange[0], "day") > 182) {
      return "week";
    }
    if (analyseTimeRange[1].diff(analyseTimeRange[0], "day") > 31) {
      return "day";
    }
    if (analyseTimeRange[1].diff(analyseTimeRange[0], "day") >= 1) {
      return "hour";
    }

    return null;
  };

  // 获取流量趋势数据
  const getFlowTrendData = (params) => {
    const { flowTrend, timeGranule } = params;
    let _timeGranule = timeGranule;
    const calculateLimitType = calculateLimit();
    if (calculateLimitType === "hour" && ["halfHour", "mintue", "hour"].includes(timeGranule)) {
      _timeGranule = "day";
      setTimeGranule("day");
    }
    if (calculateLimitType === "day" && ["halfHour", "mintue", "hour", "day"].includes(timeGranule)) {
      _timeGranule = "week";
      setTimeGranule("week");
    }
    if (calculateLimitType === "week") {
      _timeGranule = "month";
      setTimeGranule("month");
    }
    if (!analyseTimeRange || !analyseTimeRange[0]) return;
    // 使用真实的时间范围生成x轴数据
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(analyseTimeRange, _timeGranule);
    const yAxisInCount = new Array(); // 进场人次
    const yAxisInNum = new Array(); // 进场人数
    const yAxisBatchCount = new Array(); // 客流批次
    const yAxisOutCount = new Array();
    let baseFlowTotal = { inCount: 0, inNum: 0, batchCount: 0, outCount: 0, outNum: 0 };

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);
      let inCount = 0;
      let inNum = 0;
      let batchCount = 0;
      let outCount = 0;
      // 当前时间段数据
      flowTrend.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          inCount += item.inCount || 0;
          inNum += item.inNum || 0;
          batchCount += item.batchCount || 0;
          outCount += item.outCount || 0;
        }

        baseFlowTotal = flowTrend.reduce(
          (acc, item) => ({
            inCount: acc.inCount + (item.inCount || 0),
            inNum: acc.inNum + (item.inNum || 0),
            batchCount: acc.batchCount + (item.batchCount || 0),
            outCount: acc.outCount + (item.outCount || 0),
            outNum: acc.outNum + (item.outNum || 0),
          }),
          { inCount: 0, inNum: 0, batchCount: 0, outCount: 0, outNum: 0 }
        );
      });

      yAxisInCount.push(inCount);
      yAxisInNum.push(inNum);
      yAxisBatchCount.push(batchCount);
      yAxisOutCount.push(outCount);
    }

    // 计算yAxisInCount每一项占比（百分比
    const yAxisInCountPercent = yAxisInCount.map((val) => {
      if (baseFlowTotal.inCount === 0) return 0;
      return StringUtils.toFixed((val / baseFlowTotal.inCount) * 100, 2);
    });

    const yAxisInNumPercent = yAxisInNum.map((val) => {
      if (baseFlowTotal.inNum === 0) return 0;
      return StringUtils.toFixed((val / baseFlowTotal.inNum) * 100, 2);
    });

    const yAxisBatchCountPercent = yAxisBatchCount.map((val) => {
      if (baseFlowTotal.batchCount === 0) return 0;
      return StringUtils.toFixed((val / baseFlowTotal.batchCount) * 100, 2);
    });

    // 根据是否为同一天来决定图例和数据
    let legend, data;
    // if (isSameDay) {
    // 同一天：只显示进场人次、进场人数、客流批次
    legend = ["进场人次", "进场人数", "客流批次", "进场人次占比", "进场人数占比", "客流批次占比"];
    data = {
      legend: legend,

      xAxis: xAxis,
      xAxisTooltips,
      names: legend,
      data1: yAxisInCount,
      data2: yAxisInNum,
      data3: yAxisBatchCount,
      percentData1: yAxisInCountPercent,
      percentData2: yAxisInNumPercent,
      percentData3: yAxisBatchCountPercent,
      type: "singleDay",
    };
    // } else {
    //   // 多天：显示进场人次、出场人次、进场人数、客流批次
    //   legend = ["进场人次", "出场人次", "进场人数", "客流批次"];
    //   data = {
    //     legend: legend,
    //     xAxis: xAxis,
    //     names: legend,
    //     data1: yAxisInCount,
    //     data2: yAxisOutCount,
    //     data3: yAxisInNum,
    //     data4: yAxisBatchCount,
    //     type: "multiDay",
    //   };
    // }
    setFlowOutletTrend(data);
  };

  // 到访峰值
  const setSiteVisitingPeakData = (chartType, data) => {
    let chartData = DataConverter.getVisitingPeakConvertData(chartType, data);
    setVisitingPeakData({ chartType: chartType, data: data, chartData: chartData });
  };

  // 定基增长率
  const setSiteGrowthRateData = (timeType, flowType, data) => {
    let startTime = data.startTime;
    let endTime = data.endTime;
    let range = TimeUtils.getDayRangeByTs(startTime, endTime, "MM-dd");
    let flowData = data.data;
    let legendData = [Language.GUOQUQIRI, Language.GUOQUSHISIRI, Language.GUOQUSANSHIRI];
    if (timeType == Constant.TIME_TYPE.YEAR) {
      legendData = [Language.GUOQUQIYUE, Language.GUOQUSHISIYUE, Language.GUOQUSANSHIYUE];
      range = TimeUtils.getMonthRangeByTs(startTime, endTime, "yyyy-MM");
    }
    let seriesData = DataConverter.getGrowthRateConvertData(data, flowType);
    let chartData = {
      xAxis: range,
      seriesData: seriesData,
      legendData: legendData,
    };
    if (flowData.length > 1) {
      chartData.type = "line";
    }
    setGrowthRateData({ flowType: flowType, data: data, chartData: chartData });
  };

  const onChangeGrowthRateFlowType = (flowType) => {
    let timeType = analyseTimeRange[1].diff(analyseTimeRange[0], "day") >= 364 ? Constant.TIME_TYPE.YEAR : Constant.TIME_TYPE.DATE;
    setSiteGrowthRateData(timeType, flowType, growthRateData.data);
  };

  // 到访峰值类型切换
  const onChangeVisitingPeakChartType = (e) => {
    let chartType = e.target.value;
    setSiteVisitingPeakData(chartType, visitingPeakData.data);
  };

  // 获取客户属性
  const getCustomeAttrData = (data) => {
    let chartData = DataConverter.getCustomerAttrHandleData(data);
    setCustomerAttrData(chartData);
  };

  // 获取客户心情
  const getCustomeMoodData = (data) => {
    let chartData = DataConverter.getCustomerMoodHandleData(data);
    setCustomerMoodData(chartData);
  };

  // 获取表格详情数据
  const getTableDetailData = (flowTrend, faceData, compareFlowTrend) => {
    let xAxisLength = 0;
    let _xAxisTime = [];
    let _passXAxisTime = [];
    let flowTableData = [];
    let faceTableData = [];
    let timeSpan = 1;
    timeSpan = analyseTimeRange[1].diff(analyseTimeRange[0], "day") + 1;
    const passAjalyseTImeRange = [analyseTimeRange[0].add(-timeSpan, "day"), analyseTimeRange[1].add(-timeSpan, "day")];
    // console.log(analyseTimeRange[1].diff(analyseTimeRange[0], "day"), 444);
    const isSameDay = analyseTimeRange[0].isSame(analyseTimeRange[1]);
    const doorNames = outletList[analyseDoorType]?.children?.filter((item) => analyseDoorId.includes(item.value))?.map((item) => item.label);

    // 24小时版本
    if (isSameDay) {
      const { xAxis, xAxisTime } = CommonUtils.generateXAxisFromTimeRange(analyseTimeRange, "hour");
      const { xAxis: passXAxis, xAxisTime: passXAxisTime } = CommonUtils.generateXAxisFromTimeRange(passAjalyseTImeRange, "hour");
      xAxisLength = xAxis.length;
      _xAxisTime = xAxisTime;
      _passXAxisTime = passXAxisTime;
    } else {
      const { xAxis, xAxisTime } = CommonUtils.generateXAxisFromTimeRange(analyseTimeRange, "day");
      const { xAxis: passXAxis, xAxisTime: passXAxisTime } = CommonUtils.generateXAxisFromTimeRange(passAjalyseTImeRange, "day");
      xAxisLength = xAxis.length;
      _xAxisTime = xAxisTime;
      _passXAxisTime = passXAxisTime;
    }

    let baseFlowTotal = { inCount: 0, inNum: 0, batchCount: 0, outCount: 0, outNum: 0 };
    baseFlowTotal = flowTrend.reduce(
      (acc, item) => ({
        inCount: acc.inCount + (item.inCount || 0),
        inNum: acc.inNum + (item.inNum || 0),
        batchCount: acc.batchCount + (item.batchCount || 0),
        outCount: acc.outCount + (item.outCount || 0),
        outNum: acc.outNum + (item.outNum || 0),
      }),
      { inCount: 0, inNum: 0, batchCount: 0, outCount: 0, outNum: 0 }
    );

    for (let i = 0; i < xAxisLength; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(_xAxisTime[i], _xAxisTime[i + 1]);
      const passTimeSlot = getTimeSlotByIndex(_passXAxisTime[i], _passXAxisTime[i + 1]);
      let rowObj = {
        key: i,
        date: _xAxisTime[i],
        inCount: 0,
        batchCount: 0,
        inNum: 0,
        inCountCompare: 0,
        batchCountCompare: 0,
        inNumCompare: 0,
        isSameDay,
        doorNames: doorNames?.join(","),
      };

      flowTrend.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
          rowObj.inCount = rowObj.inCount + item.inCount;
          rowObj.inNum = rowObj.inNum + item.inNum;
          rowObj.batchCount = rowObj.batchCount + item.batchCount;
        }
      });
      compareFlowTrend.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= passTimeSlot.startTime && dataTime < passTimeSlot.endTime) {
          rowObj.inCountCompare = rowObj.inCountCompare + item.inCount;
          rowObj.inNumCompare = rowObj.inNumCompare + item.inNum;
          rowObj.batchCountCompare = rowObj.batchCountCompare + item.batchCount;
        }
      });
      // 分时占比
      rowObj.inCountRatio = StringUtils.toFixed((rowObj.inCount / baseFlowTotal.inCount) * 100, 2);
      rowObj.inNumRatio = StringUtils.toFixed((rowObj.inNum / baseFlowTotal.inNum) * 100, 2);
      rowObj.batchRatio = StringUtils.toFixed((rowObj.batchCount / baseFlowTotal.batchCount) * 100, 2);

      // 计算环比
      rowObj.specifiedEntryCountRatio = StringUtils.toFixed(((rowObj.inCount - rowObj.inCountCompare) / (rowObj.inCountCompare || 1)) * 100, 2);
      rowObj.specifiedEntryPeopleRadio = StringUtils.toFixed(((rowObj.inNum - rowObj.inNumCompare) / (rowObj.inNumCompare || 1)) * 100, 2);
      rowObj.specifiedFlowBatchRadio = StringUtils.toFixed(((rowObj.batchCount - rowObj.batchCountCompare) / (rowObj.batchCountCompare || 1)) * 100, 2);

      let rowAgeObj = {
        key: i * 2,
        date: _xAxisTime[i],
        isSameDay,
        gender: 1,
        toddler: 0,
        child: 0,

        youngAdult: 0,
        middleAge: 0,
        elderly: 0,
        ageUnknown: 0,

        anger: 0,
        sadness: 0,
        disgust: 0,
        fear: 0,
        surprise: 0,
        calm: 0,
        happy: 0,
        confused: 0,
        faceUnknown: 0,
        doorNames: doorNames?.join(","),
        _rowSpan: 2, // 设置行合并数为2（男性和女性两行）
      };

      let rowAgeObj2 = {
        ...rowAgeObj,
        key: i * 2 + 1,
        gender: 2,
        _rowSpan: 0, // 第二行不显示日期，被合并
      };

      faceData.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
          if (item.gender === 1) {
            rowAgeObj.toddler = item.age === 1 ? rowAgeObj.toddler + item.count : rowAgeObj.toddler;
            rowAgeObj.child = item.age === 2 ? rowAgeObj.child + item.count : rowAgeObj.child;

            rowAgeObj.youngAdult = item.age === 4 ? rowAgeObj.youngAdult + item.count : rowAgeObj.youngAdult;
            rowAgeObj.middleAge = item.age === 5 ? rowAgeObj.middleAge + item.count : rowAgeObj.middleAge;
            rowAgeObj.elderly = item.age === 6 ? rowAgeObj.elderly + item.count : rowAgeObj.elderly;
            rowAgeObj.ageUnknown = item.age === 7 ? rowAgeObj.ageUnknown + item.count : rowAgeObj.ageUnknown;
            rowAgeObj.anger = item.face === 1 ? rowAgeObj.anger + item.count : rowAgeObj.anger;
            rowAgeObj.sadness = item.face === 2 ? rowAgeObj.sadness + item.count : rowAgeObj.sadness;
            rowAgeObj.disgust = item.face === 3 ? rowAgeObj.disgust + item.count : rowAgeObj.disgust;
            rowAgeObj.fear = item.face === 4 ? rowAgeObj.fear + item.count : rowAgeObj.fear;
            rowAgeObj.surprise = item.face === 5 ? rowAgeObj.surprise + item.count : rowAgeObj.surprise;
            rowAgeObj.calm = item.face === 6 ? rowAgeObj.calm + item.count : rowAgeObj.calm;
            rowAgeObj.happy = item.face === 7 ? rowAgeObj.happy + item.count : rowAgeObj.happy;
            rowAgeObj.confused = item.face === 8 ? rowAgeObj.confused + item.count : rowAgeObj.confused;
            rowAgeObj.faceUnknown = item.face === 9 ? rowAgeObj.faceUnknown + item.count : rowAgeObj.faceUnknown;
          } else if (item.gender === 2) {
            rowAgeObj2.toddler = item.age === 1 ? rowAgeObj2.toddler + item.count : rowAgeObj2.toddler;
            rowAgeObj2.child = item.age === 2 ? rowAgeObj2.child + item.count : rowAgeObj2.child;

            rowAgeObj2.youngAdult = item.age === 4 ? rowAgeObj2.youngAdult + item.count : rowAgeObj2.youngAdult;
            rowAgeObj2.middleAge = item.age === 5 ? rowAgeObj2.middleAge + item.count : rowAgeObj2.middleAge;
            rowAgeObj2.elderly = item.age === 6 ? rowAgeObj2.elderly + item.count : rowAgeObj2.elderly;
            rowAgeObj2.ageUnknown = item.age === 7 ? rowAgeObj2.ageUnknown + item.count : rowAgeObj2.ageUnknown;
            rowAgeObj2.anger = item.face === 1 ? rowAgeObj2.anger + item.count : rowAgeObj2.anger;
            rowAgeObj2.sadness = item.face === 2 ? rowAgeObj2.sadness + item.count : rowAgeObj2.sadness;
            rowAgeObj2.disgust = item.face === 3 ? rowAgeObj2.disgust + item.count : rowAgeObj2.disgust;
            rowAgeObj2.fear = item.face === 4 ? rowAgeObj2.fear + item.count : rowAgeObj2.fear;
            rowAgeObj2.surprise = item.face === 5 ? rowAgeObj2.surprise + item.count : rowAgeObj2.surprise;
            rowAgeObj2.calm = item.face === 6 ? rowAgeObj2.calm + item.count : rowAgeObj2.calm;
            rowAgeObj2.happy = item.face === 7 ? rowAgeObj2.happy + item.count : rowAgeObj2.happy;
            rowAgeObj2.confused = item.face === 8 ? rowAgeObj2.confused + item.count : rowAgeObj2.confused;
            rowAgeObj2.faceUnknown = item.face === 9 ? rowAgeObj2.faceUnknown + item.count : rowAgeObj2.faceUnknown;
          }
        }
      });

      flowTableData.push(rowObj);
      faceTableData.push(rowAgeObj);
      faceTableData.push(rowAgeObj2);
    }

    setFaceTableData(faceTableData);
    setFlowTableData(flowTableData);
  };

  return (
    // <Suspense fallback={<></>}>
    <div className="outletAnalyse">
      <div className="ui-search-bar">
        <div className="timeContrast">
          <span className="title">时间选择：</span>
          <TimeGranulePicker ref={TimeGranulePickerRef} onTimeChange={handleTimeChange} />
          <span className="title" style={{ paddingLeft: "16px" }}>
            出入口选择：
          </span>
          <Select
            size="default"
            value={analyseDoorType}
            style={{ width: 100, marginRight: "15px" }}
            options={outletTypeList}
            onChange={(v) => {
              setSelectedOutletIds([]);
              useOutletStore.setState({ analyseDoorType: v, analyseDoorId: [] });
            }}
          />
          <Select
            size="default"
            value={selectedOutletIds}
            mode="multiple"
            allowClear
            onClear={() => {
              setSelectedOutletIds([]);
              useOutletStore.setState({ analyseDoorId: [] });
            }}
            style={{ width: 300 }}
            options={outletList[analyseDoorType]?.children || []}
            onSelect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(analyseDoorType, v, selectedOutletIds, "select");
              setSelectedOutletIds(newSelectedIds);
              useOutletStore.setState({ analyseDoorId: actualIds });
            }}
            onDeselect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(analyseDoorType, v, selectedOutletIds, "deselect");
              setSelectedOutletIds(newSelectedIds);
              useOutletStore.setState({ analyseDoorId: actualIds });
            }}
            maxTagCount={1}
            maxTagTextLength={15}
            placeholder="请选择出入口"
          />

          {/* <TreeSelect
            size="default"
            value={analyseDoorId}
            allowClear
            style={{ width: 300 }}
            treeData={outletTree}
            onChange={(v) => {
              useOutletStore.setState({ analyseDoorId: v });
            }}
          /> */}
          <Button
            style={{ marginLeft: "16px" }}
            type="primary"
            size="default"
            onClick={() => {
              searchFun();
            }}
            // loading={isPending}
          >
            查询
          </Button>
        </div>
      </div>

      <UIContentLoading loading={loading}>
        <div className="layout-content layout-content-noScroll">
          {empty && <Empty />}
          {!empty && (
            <>
              <div className="topPanel">
                {/* 总结客流趋势 */}
                <div className="topPanel-left">
                  <TopLeft
                    inCount={countFlowData.inCount || 0}
                    inNum={countFlowData.inNum || 0}
                    batchCount={countFlowData.batchCount || 0}
                    outCount={countFlowData.outCount || 0}
                    outNum={countFlowData.outNum || 0}
                    inCountChainRatio={countFlowData.inCountChainRatio || 0}
                    inNumChainRatio={countFlowData.inNumChainRatio || 0}
                    batchCountChainRatio={countFlowData.batchCountChainRatio || 0}
                    outCountChainRatio={countFlowData.outCountChainRatio || 0}
                    outNumChainRatio={countFlowData.outNumChainRatio || 0}
                  />
                </div>
                <div className="topPanel-right">
                  {/* 客流趋势 */}
                  <CustomerFlowOutletTrendChart data={FlowOutletTrend} onTimeGranuleChange={handleTimeGranuleChange} timeGranule={timeGranule} timeRange={analyseTimeRange} limit={limit} />
                </div>
              </div>
              <div className="dualRow">
                <div className="dualRowContent">
                  {/* 到访峰值 */}
                  <VisitingPeakChartPanel title={Language.DAOFANGFENGZHI} data={visitingPeakData.chartData} type={visitingPeakData.chartType} onChange={onChangeVisitingPeakChartType} />
                </div>
                <div className="dualRowContent">
                  {/* 定基增长率 */}
                  <GrowthRateChartPanel
                    title={Language.DINGJIZENGZHANGLV}
                    data={growthRateData.chartData}
                    extra={<FlowSelect defaultValue={growthRateData?.flowType} options={User.flowTrendSelection} onChange={onChangeGrowthRateFlowType} />}
                  />
                </div>
              </div>
              <div className="dualRow">
                {/* 客群属性 */}
                <div className="dualRowContent">{customerAttrData && <CustomerAttrChart data={customerAttrData} />}</div>
                {/* <div className="dualRowContent">{customerAttrData && <CustomerAttrBarChartPanel title={Language.KEQUNSHUXING} data={customerAttrData} />}</div> */}
                {/* 客群心情 */}
                <div className="dualRowContent">{customerMoodData && <CustomerMoodChart data={customerMoodData} />}</div>
                {/* <div className="dualRowContent">{customerMoodData && <CustomerMoodRadarChartPanel title={Language.XINQINGDONGCHA} data={customerMoodData} />}</div> */}
              </div>
              <div className="dualRow">
                <div className="dualRowContentSingle">
                  {baseFlowData && (
                    <CustomerFlowTimeHeatMapChart baseData={baseFlowData} limit={limitHeatMap} timeRange={analyseTimeRange} doorIds={analyseDoorId} outletList={outletList[analyseDoorType].children} />
                  )}
                </div>
              </div>
              {/* 数据详情 */}
              <TableDetail flowData={flowTableData} faceTableData={faceTableData} timeRange={analyseTimeRange} />
              <ICPComponent />
            </>
          )}
        </div>
      </UIContentLoading>
    </div>
  );
}
export default OutletAnalyse;
