import React, { useState, useEffect, useContext, useCallback, use, useMemo, useRef } from "react";
import {
  FlowLineChartPanel,
  DoorRankingChartPanel,
  VisitingPeakChartPanel,
  GrowthRateChartPanel,
  StayAnalysisChartPanel,
  FloorTransformChartPanel,
  CustomerAttrBarChartPanel,
  CustomerMoodRadarChartPanel,
  OnlineDevicePieChartPanel,
  ForecastFlowLineChartPanel,
  BussinessGaugeChartPanel,
} from "../../components/common/panels/ChartPanel";
import { ICPComponent, UIContentLoading } from "../../components/ui/UIComponent";
import { RealFlowPanel, FestivalFlowPanel } from "../../components/common/panels/StatsPanel";
import { KPIPanel } from "../../components/common/panels/KPIPanel";
import { HomeFlowStatsPanel } from "../../components/common/panels/FlowStatsPanel";
import { Language, text } from "../../language/LocaleContext";
import { FlowSelect, UIContent } from "../../components/ui/UIComponent";
import { Button, DatePicker, Card, Space, Flex, Input } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import TimeUtils from "../../utils/TimeUtils";
import ArrayUtils from "../../utils/ArrayUtils";
import dayjs from "dayjs";

import "../../assets/styles/public.css";
import styles from "./HomePage.module.css";
import Http from "../../config/Http";
import { useSite } from "../../context/SiteContext";
import User from "../../data/UserData";
import Constant from "../../common/Constant";
import StringUtils from "../../utils/StringUtils";
import DataConverter from "@/data/DataConverter";

const { RangePicker } = DatePicker;

const HomePage = () => {
  const timeTypeOptions = [
    {
      label: Language.JINRI,
      value: Constant.TIME_TYPE.TODAY,
    },
    {
      label: Language.BENZHOU,
      value: Constant.TIME_TYPE.WEEK,
    },
    {
      label: Language.BENYUE,
      value: Constant.TIME_TYPE.MONTH,
    },
    {
      label: Language.BENNIAN,
      value: Constant.TIME_TYPE.YEAR,
    },
  ];
  const [trendData, setTrendData] = useState({
    flowType: User.flowTrendSelection[0].value,
    data: null,
  });
  const [kpiData, setKpiData] = useState({
    flowType: User.flowTrendSelection[0].value,
    data: null,
  });
  const [growthRateData, setGrowthRateData] = useState({
    flowType: User.flowTrendSelection[0].value,
    data: null,
  });
  const [visitingPeakData, setVisitingPeakData] = useState({
    chartType: 1,
    chartData: null,
    data: null,
  });
  const [floorTransformData, setFloorTransformData] = useState({
    flowSelection: [
      { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
      { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    ],
    flowType: Constant.FLOW_TYPE.IN_COUNT,
    data: null,
  });

  const FlowTypePropMap = {
    [Constant.FLOW_TYPE.IN_COUNT]: "ic",
    [Constant.FLOW_TYPE.IN_NUM]: "in",
    [Constant.FLOW_TYPE.BATCH_COUNT]: "bc",
  };
  const { siteId, setSiteId } = useSite();
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [realFlowData, setRealFlowData] = useState(0);
  const [doorRankingData, setDoorRankingData] = useState({ ranking: null });
  const [stats, setStats] = useState([]);
  const [stayAnalysis, setStayAnalysis] = useState(null);
  const [customerAttr, setCustomerAttr] = useState(null);
  const [customerMood, setCustomerMood] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [bussinessData, setBussinessData] = useState(null);
  const [festivalData, setFestivalData] = useState(null);
  const [timeType, setTimeType] = useState(Constant.TIME_TYPE.TODAY);
  const [rangePickerDate, setRangePickerDate] = useState(() => {
    let timeSlot = TimeUtils.getDayTimeSlotsByTs(TimeUtils.now());
    let clearTime = User.getSiteClearTime(User.selectedSiteId);
    timeSlot.startTime = timeSlot.startTime - clearTime;
    timeSlot.endTime = timeSlot.endTime - clearTime;
    return [dayjs(TimeUtils.ts2Date(timeSlot.startTime, "yyyy-MM-dd")), dayjs(TimeUtils.ts2Date(timeSlot.endTime, "yyyy-MM-dd"))];
  });

  useEffect(() => {
    if (siteId) {
      requestHomeInfo({ siteId });
      const [startDate, endDate] = rangePickerDate;
      timeType == Constant.TIME_TYPE.DATE
        ? requestHomeStat({ timeType, siteId, startDate: startDate.format("YYYY-MM-DD"), endDate: endDate.format("YYYY-MM-DD") })
        : requestHomeStat({ timeType, siteId });
      requestHomeRealFlowData({ siteId });
    }
  }, [siteId]);

  const requestHomeStat = (params) => {
    params.siteId = siteId;
    setLoading1(true);
    Http.getHomeStat(params, (res) => {
      if (res.result == 1) {
        setFlowStatsData(res.data.flowStats);
        setFlowTrendData(params.timeType, trendData.flowType, res.data.flowTrends);
        setSiteDoorRankingData(res.data.doorsRanking);
        setSiteStayAnalysisData(res.data.stayAnalysis);
        setSiteVisitingPeakData(visitingPeakData.chartType, res.data.visitingPeak);
        setSiteGrowthRateData(params.timeType, growthRateData.flowType, res.data.growthRate);
        setSiteFloorTransformData(floorTransformData.flowType, res.data.floorTransform);
        setSiteCustomerAttrData(res.data.faceData);
        setSiteCustomeMoodData(res.data.faceData);
      }
      setLoading1(false);
    });
  };

  // 设备信息、预测客流、节日客流、KPI
  const requestHomeInfo = (params) => {
    setLoading2(true);
    Http.getHomeData(params, (res) => {
      if (res.result == 1) {
        setFlowKpiData(kpiData.flowType, res.data.kpiData);
        setSiteDeviceData(res.data.deviceData);
        setSiteFestivalData(res.data.festivalData);
        setSitePredictFlowData(res.data.predictFlowData);
      }
      setLoading2(false);
    });
  };

  const requestHomeRealFlowData = (params) => {
    setLoading3(true);
    Http.getHomeRealFlowData(params, (res) => {
      if (res.result == 1) {
        setSiteRealFlowData(res.data);
      }
      setLoading3(false);
    });
  };

  const initData = () => {
    setBussinessData(getBussinessData());
  };

  const setFlowStatsData = (flowStats) => {
    let curFlow = flowStats.curFlow;
    let lastFlow = flowStats.lastFlow;
    // let statsType = [Constant.FLOW_TYPE.IN_COUNT, Constant.FLOW_TYPE.IN_NUM, Constant.FLOW_TYPE.BATCH_COUNT, Constant.FLOW_TYPE.OUT_COUNT, Constant.FLOW_TYPE.OUTSIDE_COUNT, Constant.FLOW_TYPE.COLLECT_COUNT, Constant.FLOW_TYPE.IN_RATE];
    let statsType = [Constant.FLOW_TYPE.IN_COUNT, Constant.FLOW_TYPE.IN_NUM, Constant.FLOW_TYPE.BATCH_COUNT];
    if (User.checkMasterPermission(Constant.MASTER_POWER.OUT_COUNT)) {
      statsType = [...statsType, Constant.FLOW_TYPE.OUT_COUNT];
    }
    statsType = [...statsType, Constant.FLOW_TYPE.OUTSIDE_COUNT, Constant.FLOW_TYPE.COLLECT_COUNT, Constant.FLOW_TYPE.IN_RATE];
    let statsData = [];
    for (let i = 0; i < statsType.length; i++) {
      let type = statsType[i];
      let item = {
        rate: 0,
        val: 0,
        preVal: 0,
        type,
      };
      if (type == Constant.FLOW_TYPE.IN_COUNT) {
        item.val = Number(curFlow[Constant.PROP.IN_COUNT]);
        item.preVal = Number(lastFlow[Constant.PROP.IN_COUNT]);
        item.rate = DataConverter.calcGrowthRate(item.val, item.preVal);
      } else if (type == Constant.FLOW_TYPE.IN_NUM) {
        item.val = Number(curFlow[Constant.PROP.IN_NUM]);
        item.preVal = Number(lastFlow[Constant.PROP.IN_NUM]);
        item.rate = DataConverter.calcGrowthRate(item.val, item.preVal);
      } else if (type == Constant.FLOW_TYPE.BATCH_COUNT) {
        item.val = Number(curFlow[Constant.PROP.BATCH_COUNT]);
        item.preVal = Number(lastFlow[Constant.PROP.BATCH_COUNT]);
        item.rate = DataConverter.calcGrowthRate(item.val, item.preVal);
      } else if (type == Constant.FLOW_TYPE.OUT_COUNT) {
        item.val = Number(curFlow[Constant.PROP.OUT_COUNT]);
        item.preVal = Number(lastFlow[Constant.PROP.OUT_COUNT]);
        item.rate = DataConverter.calcGrowthRate(item.val, item.preVal);
      } else if (type == Constant.FLOW_TYPE.OUTSIDE_COUNT) {
        item.val = Number(curFlow[Constant.PROP.OS_IN_COUNT]) + Number(curFlow[Constant.PROP.OS_OUT_COUNT]);
        item.preVal = Number(lastFlow[Constant.PROP.OS_IN_COUNT]) + Number(lastFlow[Constant.PROP.OS_OUT_COUNT]);
        item.rate = DataConverter.calcGrowthRate(item.val, item.preVal);
      } else if (type == Constant.FLOW_TYPE.COLLECT_COUNT) {
        let site = User.getSite(siteId);
        let area = Number(site.area);
        item.val = StringUtils.toFixed(Number(curFlow[Constant.PROP.IN_COUNT]) / area, 2);
        item.preVal = StringUtils.toFixed(Number(lastFlow[Constant.PROP.IN_COUNT]) / area, 2);
        item.rate = DataConverter.calcGrowthRate(item.val, item.preVal);
      } else if (type == Constant.FLOW_TYPE.IN_RATE) {
        let curOutsiteFlow = Number(curFlow[Constant.PROP.OS_IN_COUNT]) + Number(curFlow[Constant.PROP.OS_OUT_COUNT]);
        let lastOutsiteFlow = Number(lastFlow[Constant.PROP.OS_IN_COUNT]) + Number(lastFlow[Constant.PROP.OS_OUT_COUNT]);
        if (curOutsiteFlow > 0) {
          item.val = (Number(curFlow[Constant.PROP.IN_COUNT]) / curOutsiteFlow) * 100;
        }
        if (lastOutsiteFlow > 0) {
          item.preVal = (Number(lastFlow[Constant.PROP.IN_COUNT]) / lastOutsiteFlow) * 100;
        }
        item.rate = DataConverter.calcGrowthRate(item.val, item.preVal);
        item.val = `${StringUtils.toFixed(item.val, 2)}%`;
        item.preVal = `${StringUtils.toFixed(item.preVal, 2)}%`;
      }
      statsData.push(item);
    }
    setStats(statsData);
  };

  const setFlowTrendData = (timeType, flowType, data) => {
    const legendMap = {
      [Constant.TIME_TYPE.TODAY]: [Language.JINRIKELIU, Language.ZUORIKELIU, Language.SHANGZHOUTONGQI],
      [Constant.TIME_TYPE.WEEK]: [Language.JINZHOUKELIU, Language.SHANGZHOUKELIU],
      [Constant.TIME_TYPE.MONTH]: [Language.BENYUEKELIU, Language.SHANGYUEKELIU, Language.SHANGNIANTONGYUEKELIU],
      [Constant.TIME_TYPE.YEAR]: [Language.JINNIANKELIU, Language.SHANGNIANKELIU],
      [Constant.TIME_TYPE.DATE]: [Language.KELIUQUSHI],
    };
    const rangeFuncMap = {
      [Constant.TIME_TYPE.TODAY]: TimeUtils.getTsHourRangeByTs,
      [Constant.TIME_TYPE.WEEK]: TimeUtils.getTsDayRangeByTs,
      [Constant.TIME_TYPE.MONTH]: TimeUtils.getTsDayRangeByTs,
      [Constant.TIME_TYPE.YEAR]: TimeUtils.getTsMonthRangeByTs,
    };
    const dateFormatMap = {
      [Constant.TIME_TYPE.TODAY]: "HH:00",
      [Constant.TIME_TYPE.WEEK]: "MM-dd",
      [Constant.TIME_TYPE.MONTH]: "MM-dd",
      [Constant.TIME_TYPE.YEAR]: "yyyy-MM",
    };
    const todayData = data.todayData;
    const list = data.list;
    const legend = legendMap[timeType];
    const xAxis = [];
    const series = [];
    if (timeType != Constant.TIME_TYPE.DATE) {
      const seriesArr = [];
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let data = item.data;
        let startTime = Number(item.startTime);
        let endTime = Number(item.endTime);
        let rangeFunc = rangeFuncMap[timeType];
        let range = rangeFunc(startTime, endTime);
        let dataMap = {};
        let dataArr = [];
        if (i == 0 && todayData) {
          dataMap[todayData.dataTime] = Number(todayData[flowType]);
        }
        for (let j = 0; j < data.length; j++) {
          let dataItem = data[j];
          let dataTime = dataItem.dataTime;
          if (dataMap[dataTime] == null) {
            dataMap[dataTime] = 0;
          }
          dataMap[dataTime] += Number(dataItem[flowType]);
        }
        for (let j = 0; j < range.length; j++) {
          let dataTime = range[j];
          if (i == 0) {
            xAxis.push(TimeUtils.ts2Date(dataTime, dateFormatMap[timeType]));
          }
          if (dataMap[dataTime] && dataMap[dataTime] > 0) {
            dataArr.push(dataMap[dataTime]);
          } else {
            dataArr.push(0);
          }
        }
        seriesArr.push(dataArr);
        series.push([]);
      }
      for (let i = 0; i < xAxis.length; i++) {
        for (let j = 0; j < seriesArr.length; j++) {
          if (seriesArr[j].length > i) {
            series[j].push(seriesArr[j][i]);
          } else {
            series[j].push(0);
          }
        }
      }
    } else {
      let startTime = Number(list[0].startTime);
      let endTime = Number(list[0].endTime);
      let isHour = endTime - startTime < 86400;
      let range = isHour ? TimeUtils.getTsHourRangeByTs(startTime, endTime) : TimeUtils.getTsDayRangeByTs(startTime, endTime);
      let dataMap = {};
      let data = list[0].data;
      series.push([]);
      if (todayData) {
        dataMap[todayData.dataTime] = Number(todayData[flowType]);
      }
      for (let i = 0; i < data.length; i++) {
        let dataTime = data[i].dataTime;
        dataMap[dataTime] = Number(data[i][flowType]);
      }
      for (let i = 0; i < range.length; i++) {
        let dataTime = range[i];
        if (isHour) {
          xAxis.push(TimeUtils.ts2Date(dataTime, "HH:00"));
        } else {
          xAxis.push(TimeUtils.ts2Date(dataTime, "MM-dd"));
        }
        if (dataMap[dataTime] && dataMap[dataTime] > 0) {
          series[0].push(dataMap[dataTime]);
        } else {
          series[0].push(0);
        }
      }
    }
    let chartData = {
      xAxis,
      series,
      legend,
    };
    setTrendData({ ...trendData, chartData: chartData, flowType: flowType, data: data });
  };

  const setSiteDoorRankingData = (data) => {
    const columns = new Array();
    columns.push({ title: Language.PAIMING, key: "ranking" });
    columns.push({ title: Language.CHURUKOU, key: "name" });
    columns.push({ title: Language.JINCHANGRENCI, key: "inCount" });
    columns.push({ title: Language.JINCHANGRENSHU, key: "inNum" });
    columns.push({ title: Language.KELIUPICI, key: "batchCount" });
    columns.push({ title: Language.HUANBI, key: "qoq" });
    columns.push({ title: Language.ZHANBI, key: "ratio" });
    let list = DataConverter.getDooorRankingConvertData(data);
    let rankingData = {
      columns,
      list,
    };
    setDoorRankingData({ ranking: rankingData });
  };

  const setFlowKpiData = (flowType, data) => {
    const kpiTitle = [Language.ZUORISHUJU, Language.SHANGZHOUSHUJU, Language.SHANGYUESHUJU, Language.JINNIANSHUJU];
    const unitMap = {
      [Constant.FLOW_TYPE.IN_COUNT]: Language.PARAM_RENCI,
      [Constant.FLOW_TYPE.IN_NUM]: Language.PARAM_RENSHU,
      [Constant.FLOW_TYPE.BATCH_COUNT]: Language.PARAM_PICI,
    };
    const unitText = unitMap[flowType];
    const chartData = [];
    for (let i = 0; i < data.length; i++) {
      let kpiData = data[i];
      let value1 = Number(kpiData.data[0][flowType]);
      let value2 = Number(kpiData.data[1][flowType]);
      let kpiItem = {
        title: kpiTitle[i],
      };
      if (kpiData.startDate == kpiData.endDate) {
        kpiItem.date = kpiData.startDate;
      } else {
        kpiItem.date = `${kpiData.startDate} - ${kpiData.endDate}`;
      }
      kpiItem.value = text(unitText, { value: value1 });
      kpiItem.qoq = DataConverter.calcGrowthRate(value1, value2);
      if (kpiData.data.length > 2) {
        let value3 = Number(kpiData.data[2][flowType]);
        kpiItem.yoy = DataConverter.calcGrowthRate(value1, value3);
      }
      chartData.push(kpiItem);
    }
    setKpiData({ ...kpiData, flowType: flowType, data: data, chartData: chartData });
  };

  const setSiteDeviceData = (data) => {
    const onlineCount = Number(data.onlineCount);
    const offlineCount = Number(data.offlineCount);
    const totalCount = onlineCount + offlineCount;
    let onlineRate = 0;
    let offlineRate = 0;
    if (totalCount > 0) {
      onlineRate = Math.ceil((onlineCount / totalCount) * 100).toFixed(2);
      offlineRate = (100 - onlineRate).toFixed(2);
    }
    const deviceData = {
      onlineCount,
      offlineCount,
      onlineRate,
      offlineRate,
    };
    setDeviceData(deviceData);
  };

  const setSiteRealFlowData = (data) => {
    let inCount = Number(data.inCount);
    let outCount = Number(data.outCount);
    let count = inCount - outCount;
    if (count < 0) {
      count = 0;
    }
    setRealFlowData(count);
  };

  const setSiteStayAnalysisData = (data) => {
    const stayAnalysis = DataConverter.getStayAnalysisConvertData(data);
    setStayAnalysis(stayAnalysis);
  };

  const setSiteVisitingPeakData = (chartType, data) => {
    let chartData = DataConverter.getVisitingPeakConvertData(chartType, data);
    setVisitingPeakData({ chartType: chartType, data: data, chartData: chartData });
  };

  const setSiteFestivalData = (data) => {
    const festivalNameMap = {
      yuandan: Language.YUANDAN,
      chunjie: Language.CHUNJIE,
      qingming: Language.QINGMINGJIE,
      laodong: Language.LAODONGJIE,
      duanwu: Language.DUANWUJIE,
      zhongqiu: Language.ZHONGQIUJIE,
      guoqing: Language.GUOQINGJIE,
      qingren: Language.QINGRENJIE,
      funv: Language.FUNVJIE,
      muqin: Language.MUQINJIE,
      ertong: Language.ERTONGJIE,
      fuqin: Language.FUQINJIE,
      qixi: Language.QIXIJIE,
      jiaoshi: Language.JIAOSHIJIE,
      wansheng: Language.WANSHENGJIE,
      shuangshiyi: Language.SHUANGSHIYI,
      dongzhi: Language.DONGZHI,
      shengdan: Language.SHENGDANJIE,
    };
    let year = data.year;
    let lastYear = data.lastyear;
    let lastYearMap = {};

    for (let i = 0; i < lastYear.length; i++) {
      let item = lastYear[i];
      lastYearMap[item.f] = item;
    }
    let total = 0;

    for (let i = 0; i < year.length; i++) {
      let item = year[i];
      let inCount = Number(item.ic);
      total += inCount;
    }
    let list = [];

    for (let i = 0; i < year.length; i++) {
      let item = year[i];
      let inCount = Number(item.ic);
      let data = {
        key: i,
        name: festivalNameMap[item.f],
        value: inCount,
        rate: 0,
        yoy: 0,
      };
      if (total > 0) {
        data.rate = ((inCount / total) * 100).toFixed(2);
      }
      let lastYearInCount = 0;
      if (lastYearMap[item.f]) {
        lastYearInCount = Number(lastYearMap[item.f].ic);
        let yoyValue = inCount - lastYearInCount;
        if (inCount > 0 && lastYearInCount == 0) {
          data.yoy = 100;
        } else if (lastYearInCount > 0) {
          data.yoy = ((yoyValue / lastYearInCount) * 100).toFixed(2);
        }
      }
      list.push(data);
    }

    setFestivalData({ list: list });
  };

  const setSitePredictFlowData = (data) => {
    let startTime = data.startTime;
    let endTime = data.endTime;
    let dayRange = TimeUtils.getDateRangeByTs(startTime, endTime, 86400, "MM/dd");
    let flowData = data.data;
    let chartData = {
      xAxis: dayRange,
      realData: [],
      forecastData: [],
    };
    for (let i = 0; i < flowData.length; i++) {
      let inCount = Number(flowData[i]);
      if (i < 7) {
        chartData.realData.push(inCount);
        chartData.forecastData.push(null);
      } else if (i == 7) {
        chartData.realData.push(inCount);
        chartData.forecastData.push(inCount);
      } else {
        chartData.realData.push(null);
        chartData.forecastData.push(inCount);
      }
    }
    setForecastData(chartData);
  };

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

  // const setSiteGrowthRateData = (timeType, flowType, data) => {
  //   let startTime = data.startTime;
  //   let endTime = data.endTime;
  //   let range = TimeUtils.getDayRangeByTs(startTime, endTime, "MM-dd");
  //   let flowData = data.data;
  //   let d7FlowData = data.d7;
  //   let d14FlowData = data.d14;
  //   let d30FlowData = data.d30;
  //   let chartType = flowData.length == 0 ? 1 : 2;
  //   let legendData = [Language.GUOQUQIRI, Language.GUOQUSHISIRI, Language.GUOQUSANSHIRI];
  //   if (timeType == Constant.TIME_TYPE.YEAR) {
  //     legendData = [Language.GUOQUQIYUE, Language.GUOQUSHISIYUE, Language.GUOQUSANSHIYUE];
  //     range = TimeUtils.getMonthRangeByTs(startTime, endTime, "yyyy-MM");
  //   }
  //   let key = FlowTypePropMap[flowType];
  //   let seriesData = [[], [], []];
  //   for (let i = 0; i < flowData.length; i++) {
  //     let data = flowData[i];
  //     let d7Data = d7FlowData[i];
  //     let d14Data = d14FlowData[i];
  //     let d30Data = d30FlowData[i];
  //     let dValue = Number(data[key]);
  //     let d7Value = Math.ceil(Number(d7Data[key]) / 7);
  //     let d14Value = Math.ceil(Number(d14Data[key]) / 14);
  //     let d30Value = Math.ceil(d30Data[key] / 30);
  //     let d7Rate = 0;
  //     if (dValue > 0 && d7Value == 0) {
  //       d7Rate = 100;
  //     } else if (d7Value > 0) {
  //       d7Rate = Number((((dValue - d7Value) / d7Value) * 100).toFixed(2));
  //     }
  //     let d14Rate = 0;
  //     if (dValue > 0 && d14Value == 0) {
  //       d14Rate = 100;
  //     } else if (d14Value > 0) {
  //       d14Rate = Number((((dValue - d14Value) / d14Value) * 100).toFixed(2));
  //     }
  //     let d30Rate = 0;
  //     if (dValue > 0 && d30Value == 0) {
  //       d30Rate = 100;
  //     } else if (d30Value > 0) {
  //       d30Rate = Number((((dValue - d30Value) / d30Value) * 100).toFixed(2));
  //     }
  //     seriesData[0].push(d7Rate);
  //     seriesData[1].push(d14Rate);
  //     seriesData[2].push(d30Rate);
  //   }
  //   let chartData = {
  //     xAxis: range,
  //     seriesData: seriesData,
  //     legendData: legendData,
  //   };
  //   if (flowData.length > 1) {
  //     chartData.type = "line";
  //   }
  //   setGrowthRateData({ flowType: flowType, data: data, chartData: chartData });
  // };

  const setSiteFloorTransformData = (flowType, data) => {
    let key = FlowTypePropMap[flowType];
    let floors = data.floors;
    let doorsSum = data.doorsSum;
    let doorsSumMap = {};
    let inCount = Number(data.curFlow.inCount);
    let inNum = Number(data.curFlow.inNum);
    let total = flowType == Constant.FLOW_TYPE.IN_COUNT ? inCount : inNum;
    for (let i = 0; i < doorsSum.length; i++) {
      doorsSumMap[doorsSum[i].doorId] = doorsSum[i];
    }

    let converData = [];
    let arriveData = {
      yAxis: [],
      data: [],
      rateData: [],
    };
    for (let i = 0; i < floors.length; i++) {
      let floor = floors[i];
      let doors = floor.doors;
      let value = 0;
      if (doors.length > 0) {
        for (let j = 0; j < doors.length; j++) {
          let doorId = doors[j];
          if (doorsSumMap[doorId]) {
            value += Number(doorsSumMap[doorId][key]);
          }
        }
      }
      let cvData = {
        name: floor.floorName,
        value: value,
      };
      let rate = 0;
      if (rate > 0 && total == 0) {
        rate = 100;
      } else if (total > 0) {
        rate = Number((value / total) * 100);
        if (rate % 1 !== 0) {
          rate = Number(rate.toFixed(2));
        }
      }
      arriveData.yAxis.push(floor.floorName);
      arriveData.data.push(value);
      arriveData.rateData.push(rate);
      converData.push(cvData);
    }
    let chartData = {
      converData,
      arriveData,
    };
    console.log("chartData", chartData);
    setFloorTransformData({ ...floorTransformData, flowType: flowType, data: data, chartData: chartData });
  };

  const setSiteCustomerAttrData = (data) => {
    let isUnknow = true;
    let chartData = DataConverter.getCustomerAttrConvertData(data);
    setCustomerAttr(chartData);
  };

  const setSiteCustomeMoodData = (data) => {
    let chartData = DataConverter.getCustomerMoodConvertData(data);
    setCustomerMood(chartData);
  };

  const getBussinessData = () => {
    var bussinessData = {
      month: "5月份",
      day: "31天",
      monthCount: 1000,
      yearCount: 10000,
      monthRate: 30,
      yearRate: 10,
    };
    return bussinessData;
  };

  const onChangeTrendDataFlowType = (flowType) => {
    // setTrendData({...trendData,flowType:value});
    setFlowTrendData(timeType, flowType, trendData.data);
  };

  const onChangeKpiDataFlowType = (flowType) => {
    setFlowKpiData(flowType, kpiData.data);
  };

  const onChangeVisitingPeakChartType = (e) => {
    let chartType = e.target.value;
    setSiteVisitingPeakData(chartType, visitingPeakData.data);
  };

  const onChangeGrowthRateFlowType = (flowType) => {
    setSiteGrowthRateData(timeType, flowType, growthRateData.data);
  };

  const onChangeFloorTransformFlowType = (flowType) => {
    setSiteFloorTransformData(flowType, floorTransformData.data);
  };

  const selectTimeType = (type) => {
    let slots = null;
    let clearTime = User.getSiteClearTime(siteId);
    const time = TimeUtils.now() - clearTime;
    if (type == Constant.TIME_TYPE.TODAY) {
      slots = TimeUtils.getDayTimeSlotsByTs(time);
    } else if (type == Constant.TIME_TYPE.WEEK) {
      slots = TimeUtils.getWeekTimeSlotsByTs(time);
    } else if (type == Constant.TIME_TYPE.MONTH) {
      slots = TimeUtils.getMonthTimeSlotsByTs(time);
    } else if (type == Constant.TIME_TYPE.YEAR) {
      slots = TimeUtils.getYearTimeSlotsFromTs(time);
    }
    if (slots) {
      setRangePickerDate([dayjs(TimeUtils.ts2Date(slots.startTime, "yyyy-MM-dd")), dayjs(TimeUtils.ts2Date(slots.endTime, "yyyy-MM-dd"))]);
    }
    setTimeType(type);
    requestHomeStat({ timeType: type, siteId: siteId });
  };

  const onChangeRangePicker = (dates, dateStrings) => {
    setRangePickerDate([dayjs(dateStrings[0]), dayjs(dateStrings[1])]);
  };

  const onClickQuery = () => {
    setTimeType(Constant.TIME_TYPE.DATE);
    let startDate = rangePickerDate[0].format("YYYY-MM-DD");
    let endDate = rangePickerDate[1].format("YYYY-MM-DD");
    let params = {
      timeType: Constant.TIME_TYPE.DATE,
      startDate: startDate,
      endDate: endDate,
    };
    requestHomeStat(params);
  };

  useEffect(() => {
    initData();
  }, []);

  const openBussinessSetting = () => {
    return <div></div>;
  };

  return (
    <div className="home">
      <UIContent>
        <Flex gap="large" align="center">
          <Flex gap="large" align="center" className="date-picker">
            {timeTypeOptions.map((item, index) => {
              return (
                <div key={index} className={timeType == item.value ? "date-picker-selected" : ""} onClick={() => selectTimeType(item.value)}>
                  {item.label}
                </div>
              );
            })}
          </Flex>
          <RangePicker
            value={rangePickerDate}
            allowClear={false}
            defaultValue={rangePickerDate}
            separator={Language.ZHI}
            prefix={<CalendarOutlined />}
            suffixIcon={null}
            onChange={onChangeRangePicker}
          />
          <Button type="primary" style={{ height: "30px", backgroundColor: "#3867D6" }} onClick={onClickQuery}>
            {Language.CHAXUN}
          </Button>
        </Flex>
      </UIContent>
      <UIContentLoading loading={loading1 || loading2 || loading3}>
        <div className="layout-content layout-content-noScroll">
          <HomeFlowStatsPanel data={stats} adminName={User.userName}></HomeFlowStatsPanel>
          <div className={styles.chartContainer}>
            <div className={styles.leftChartContent}>
              <div className={styles.fullRow}>
                <FlowLineChartPanel
                  extra={<FlowSelect defaultValue={trendData?.flowType} options={User.flowTrendSelection} onChange={onChangeTrendDataFlowType} />}
                  title={text(Language.KELIUQUSHI)}
                  tooltip={"通过分析统计时间内场地客流数据的变化走势与规律，识别客流的固有规律，如工作日与周末的差异模式、早午晚市的客流曲线、季节性周期。可以有效的对客流变化进行归因分析与前瞻决策。"}
                  tooltipSize="big"
                  data={trendData?.chartData}></FlowLineChartPanel>
              </div>
              <div className={styles.dualRow}>
                <div className={styles.dualRowContent}>
                  <KPIPanel
                    title={text(Language.KELIUKPI)}
                    tooltipSize="big"
                    data={kpiData?.chartData}
                    tooltip={"监控核心客流指标，通过实时数据与历史基期（昨日、上周、上月、今年）的对标，即时捕捉经营波动的异常信号。帮助管理者快速判别客流变化情况，确保运营情况持续健康。"}
                    extra={<FlowSelect defaultValue={kpiData?.flowType} options={User.flowTrendSelection} onChange={onChangeKpiDataFlowType} />}></KPIPanel>
                  {/* <KPIPanel></KPIPanel> */}
                </div>
                <div className={styles.dualRowContent}>
                  <DoorRankingChartPanel title={Language.CHURUKOUREDU} data={doorRankingData} />
                </div>
              </div>
              <div className={styles.dualRow}>
                <div className={styles.dualRowContent}>
                  <VisitingPeakChartPanel title={Language.DAOFANGFENGZHI} data={visitingPeakData.chartData} type={visitingPeakData.chartType} onChange={onChangeVisitingPeakChartType} />
                </div>
                <div className={styles.dualRowContent}>
                  <GrowthRateChartPanel
                    title={Language.DINGJIZENGZHANGLV}
                    data={growthRateData.chartData}
                    extra={<FlowSelect defaultValue={trendData?.flowType} options={User.flowTrendSelection} onChange={onChangeGrowthRateFlowType} />}
                  />
                </div>
              </div>

              <div className={styles.dualRow}>
                <div className={styles.dualRowContent}>
                  <CustomerAttrBarChartPanel title={Language.KEQUNSHUXING} data={customerAttr} />
                </div>
                <div className={styles.dualRowContent}>
                  <CustomerMoodRadarChartPanel title={Language.XINQINGDONGCHA} data={customerMood} />
                </div>
              </div>
              <div className={styles.dualRow}>
                {/* <div className={styles.dualRowContent}>
              <StayAnalysisChartPanel title={Language.TINGLIUFENXI} data={stayAnalysis} />
            </div> */}
                <div className={styles.dualRowContent}>
                  <FloorTransformChartPanel
                    title={Language.LOUCENGZHUANHUA}
                    data={floorTransformData.chartData}
                    extra={<FlowSelect defaultValue={floorTransformData?.flowType} options={floorTransformData.flowSelection} onChange={onChangeFloorTransformFlowType} />}
                  />
                </div>
              </div>
            </div>
            <div className={styles.rightChartContent}>
              {User.checkMasterPermission(Constant.MASTER_POWER.HOME_PAGE.REALTIME_STAY_COUNT) && (
                <div className={styles.singleRow}>
                  <RealFlowPanel title={text(Language.SHISHIZAICHANGRENSHU)} data={realFlowData}></RealFlowPanel>
                </div>
              )}
              <div className={styles.singleRow}>
                <OnlineDevicePieChartPanel title={Language.SHEBEIXINXI} data={deviceData} />
              </div>
              <div className={styles.singleRow}>
                <ForecastFlowLineChartPanel title={Language.YUCEKELIU} data={forecastData} />
              </div>
              {/* <div className={styles.singleRow} style={{ height: "384px" }}>
            <BussinessGaugeChartPanel title={Language.JINGYINGMUBIAO} data={bussinessData} extra={<div style={{ width: 20, height: 20 }} className="home-stats-setting"></div>} />
          </div> */}
              <div className={styles.singleRow} style={{ height: "540px", flex: 1 }}>
                <FestivalFlowPanel data={festivalData} />
              </div>
            </div>
          </div>
          <ICPComponent />
        </div>
      </UIContentLoading>
    </div>
  );
};

const BussinessSetting = ({ siteName }) => {
  const [total, setTotal] = useState(0);
  return (
    <div>
      <div>
        <Space>
          <div>{Language.CHANGDIMINGMINGCHENG}</div>
          <div className="pb-text-not-editable">{siteName}</div>
        </Space>
        <Space>
          <DatePicker picker="year" />
          <div>{Language.NIANDUKELIUMUBIAO}</div>
          <div>{total}</div>
          <div>{Language.RENCI}</div>
        </Space>
      </div>
      <div style={{ border: "1px solid #BBBBBB" }}>
        <Space>
          <div>{Language.JINGYINGMUBIAOPEIZHIMEIYUEKELIUMUBIAOSHEZHI_TIP}</div>
          <Input />
          <div>%{Language.SHEZHI}</div>
          <Button type="primary" className="btn-primary">
            {Language.TIANRU}
          </Button>
        </Space>
      </div>
    </div>
  );
};

const BussinessQuarterSetting = () => {};
export default HomePage;
