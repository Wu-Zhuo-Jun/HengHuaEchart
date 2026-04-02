import React, { useState, useEffect, useCallback } from "react";
import { FlowStatsPanel } from "../../../components/common/panels/FlowStatsPanel";
import { Language, text } from "../../../language/LocaleContext";
import {
  VisitingPeakChartPanel,
  DoorRankingChartPanel,
  StayAnalysisChartPanel,
  GrowthRateChartPanel,
  CustomerAttrBarChartPanel,
  CustomerMoodRadarChartPanel,
  FlowTrendAnalysisPanelChartPanel,
  WeekWorkAnalysisLineBarChartPanel,
  WeatherAnalysisChartPanel,
} from "../../../components/common/panels/ChartPanel";
import { FlowSelect, UIContent, UIPanel, UISelect, ICPComponent, UIContentLoading } from "../../../components/ui/UIComponent";
import { DataTable } from "../../../components/common/tables/Table";
import { Tabs, DatePicker, Button, Flex, Select, ConfigProvider } from "antd";
import DemoUtils from "../../../utils/DemoUtils";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
// import isoWeek from 'dayjs/plugin/isoWeek';
// import 'dayjs/locale/zh-cn';
// import updateLocale from 'dayjs/plugin/updateLocale';
import Selection from "../../../common/Selection";
import TimeUtils from "../../../utils/TimeUtils";
import Constant from "../../../common/Constant";
const { RangePicker } = DatePicker;
// import zhCN from 'antd/es/locale/zh_CN';
import "./WeeklyReport.css";
import User from "@/data/UserData";
import { useSite } from "@/context/SiteContext";
import Http from "@/config/Http";
import { getCustomerAgeTableDataSource, getCustomerMoodtableDataSource, getSiteFlowStatsData } from "./model/Model";
import DataConverter from "@/data/DataConverter";
import { customerAgeColumns, customerMoodColumns, flowColumns } from "./components/TableColumns";
import StringUtils from "@/utils/StringUtils";
import ArrayUtils from "@/utils/ArrayUtils";
import ExportUtils from "@/utils/ExportUtils";

// dayjs.extend(updateLocale);
// // dayjs.extend(isoWeek);
// // dayjs.updateLocale('zh-cn', {
// //   weekStart: 1,
// // });
// dayjs.locale('zh-cn');
// dayjs.updateLocale('en', {
//   weekStart: 1,
//   weekNumbers: 'zh-cn',
// });

const WeeklyReport = () => {
  const { siteId, setSiteId } = useSite();
  const GROWTH_RATE_FLOW_TYPE_OPTIONS = [
    { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
    { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    { label: Language.KELIUPICI, value: Constant.FLOW_TYPE.BATCH_COUNT },
  ];
  const FLOW_TYPE_OPTIONS = [
    { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
    { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    { label: Language.KELIUPICI, value: Constant.FLOW_TYPE.BATCH_COUNT },
    { label: Language.JIKELI, value: Constant.FLOW_TYPE.COLLECT_COUNT },
    { label: Language.CHANGWAIKELIU, value: Constant.FLOW_TYPE.OUTSIDE_COUNT },
    { label: Language.JINCHANGLV, value: Constant.FLOW_TYPE.IN_RATE },
  ];
  const [flowStatsData, setFlowStatsData] = useState([]);
  const [visitingPeakData, setVisitingPeakData] = useState({
    chartType: 1,
    chartData: null,
    data: null,
  });
  const [doorRankingData, setDoorRankingData] = useState(null);
  const [stayAnalysisData, setStayAnalysisData] = useState(null);
  const [growthRateData, setGrowthRateData] = useState({
    flowType: GROWTH_RATE_FLOW_TYPE_OPTIONS[0].value,
    data: null,
  });
  const [customerAttrData, setCustomerAttrData] = useState(null);
  const [customerMoodData, setCustomerMoodData] = useState(null);
  const [flowTrendAnalysisData, setFlowTrendAnalysisData] = useState({
    chartData: null,
    data: null,
  });
  const [flowDetailTableData, setFlowDetailTableData] = useState(null);
  const [customerAgeTableData, setCustomerAgeTableData] = useState(null);
  const [customerMoodTableData, setCustomerMoodTableData] = useState(null);
  const [flowTypeOptions, setFlowTypeOptions] = useState({
    options: FLOW_TYPE_OPTIONS,
    value: FLOW_TYPE_OPTIONS[0].value,
  });
  const [workWeekAnalysisData, setWorkWeekAnalysisData] = useState(null);
  const [weatherAnalysisData, setWeatherAnalysisData] = useState(null);
  const [weekDate, setWeekDate] = useState(() => {
    let timeSlot = TimeUtils.getDayTimeSlotsByTs(TimeUtils.now());
    let clearTime = User.getSiteClearTime(User.selectedSiteId);
    timeSlot.startTime = timeSlot.startTime - clearTime;
    return dayjs(TimeUtils.ts2Date(timeSlot.startTime, "yyyy-MM-dd"));
  });
  const [growthRateFlowTypeOptions, setGrowthRateFlowTypeOptions] = useState({
    options: GROWTH_RATE_FLOW_TYPE_OPTIONS,
    value: GROWTH_RATE_FLOW_TYPE_OPTIONS[0].value,
  });
  const [loading, setLoading] = useState(false);

  const initData = () => {
    setWeatherAnalysisData(DemoUtils.getWeatherAnalysisData());
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (siteId) {
      let startDate = weekDate.format("YYYY-MM-DD");
      let params = {
        startDate,
      };
      requestWeeklyStats(params);
    }
  }, [siteId]);

  const onChangeVisitingPeakChartType = (e) => {
    const chartType = e.target.value;
    setSiteVisitingPeakData(chartType, visitingPeakData.data);
  };

  const tabItems = [
    {
      key: "1",
      label: Language.KELIUMINGXI,
      children: <DataTable columns={flowColumns()} dataSource={flowDetailTableData ? flowDetailTableData.dataSource : []} />,
    },
    {
      key: "2",
      label: Language.NIANLINGSHUXING,
      children: <DataTable mergeColumns={["date"]} columns={customerAgeColumns()} dataSource={customerAgeTableData ? customerAgeTableData.dataSource : []} />,
    },
    {
      key: "3",
      label: Language.XINQINGSHUXING,
      children: <DataTable mergeColumns={["date"]} columns={customerMoodColumns()} dataSource={customerMoodTableData ? customerMoodTableData.dataSource : []} />,
    },
  ];

  const FlowTrendAnalysisExtra = () => {
    return <UISelect options={flowTypeOptions?.options} defaultValue={flowTypeOptions?.defaultValue} style={{ width: "210px", height: "29px" }} onChange={onFlowTypeChange} />;
  };

  const onFlowTypeChange = useCallback(
    (value) => {
      setFlowTypeOptions({ ...flowTypeOptions, value: value });
      setSiteFlowTrendData(value, flowTrendAnalysisData.data);
    },
    [flowTrendAnalysisData]
  );

  const onChangeWeekPicker = (dates, dateStrings) => {
    setWeekDate(dates);
  };

  const onChangeGrowthRateFlowType = useCallback((value) => {
    setSiteGrowthRateData(value, growthRateData.data);
  });

  const onClickQuery = () => {
    let startDate = weekDate.format("YYYY-MM-DD");
    let params = {
      startDate,
    };
    requestWeeklyStats(params);
  };

  const onClickExport = useCallback(() => {
    const _flowColumns = flowColumns();
    const _customerAgeColumns = customerAgeColumns();
    const _customerMoodColumns = customerMoodColumns();
    const exportDataArray = [
      {
        columns: _flowColumns,
        title: Language.KELIUMINGXI,
        dataSource: flowDetailTableData.dataSource,
      },
      {
        columns: _customerAgeColumns,
        title: Language.NIANLINGSHUXING,
        dataSource: customerAgeTableData.dataSource.map((item) => {
          return {
            ...item,
            gender: item.gender === 1 ? Language.NAN : Language.NV,
          };
        }),
      },
      {
        columns: _customerMoodColumns,
        title: Language.XINQINGSHUXING,
        dataSource: customerMoodTableData.dataSource.map((item) => {
          return {
            ...item,
            gender: item.gender === 1 ? Language.NAN : Language.NV,
          };
        }),
      },
    ];

    const site = User.getSite(siteId) || "";
    const { startDate, endDate } = TimeUtils.getWeekDateSlotsFromDateStr(weekDate.format("YYYY-MM-DD 00:00:00"));
    const dateDesc = `${startDate}-${endDate}`;
    const fileName = `${site.siteName}-${Language.KELIU}${Language.ZHOUBAO}-${dateDesc}`;
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName });
  }, [flowDetailTableData, customerAgeTableData, customerMoodTableData]);

  const setSiteFlowStatsData = (data) => {
    let site = User.getSite(siteId);
    let area = Number(site.area);
    let statsData = getSiteFlowStatsData(data, area);
    setFlowStatsData(statsData);
  };

  const setSiteFlowTrendData = (flowType, data) => {
    const curTotal = data.curTotal;
    const curOutside = data.curOutside;
    const lastTotal = data.lastTotal;
    const lastOutside = data.lastOutside;
    const startTime = data.startTime;
    const endTime = data.endTime;
    const clearTime = data.clearTime;
    const tmpData = {
      inCount: 0,
      inNum: 0,
      outCount: 0,
      batchCount: 0,
      outsideCount: 0,
    };
    const weekDesc = [Language.XINGQIYI, Language.XINGQIER, Language.XINGQISAN, Language.XINGQISI, Language.XINGQIWU, Language.XINGQILIU, Language.XINGQIRI];

    let curDataMap = {};
    for (let i = 0; i < curTotal.length; i++) {
      let dataItem = curTotal[i];
      let dataTime = dataItem.dataTime;
      if (curDataMap[dataTime] == null) {
        curDataMap[dataTime] = { ...tmpData };
      }
      curDataMap[dataTime].inCount += Number(dataItem[Constant.PROP.IN_COUNT]);
      curDataMap[dataTime].inNum += Number(dataItem[Constant.PROP.IN_NUM]);
      curDataMap[dataTime].batchCount += Number(dataItem[Constant.PROP.BATCH_COUNT]);
      curDataMap[dataTime].outCount += Number(dataItem[Constant.PROP.OUT_COUNT]);
    }
    for (let i = 0; i < curOutside.length; i++) {
      let dataItem = curOutside[i];
      let dataTime = dataItem.dataTime;
      if (curDataMap[dataTime] == null) {
        curDataMap[dataTime] = { ...tmpData };
      }
      curDataMap[dataTime].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
    }
    let lastDataMap = {};
    for (let i = 0; i < lastTotal.length; i++) {
      let dataItem = lastTotal[i];
      let dataTime = dataItem.dataTime;
      if (lastDataMap[dataTime] == null) {
        lastDataMap[dataTime] = { ...tmpData };
      }
      lastDataMap[dataTime].inCount += Number(dataItem[Constant.PROP.IN_COUNT]);
      lastDataMap[dataTime].inNum += Number(dataItem[Constant.PROP.IN_NUM]);
      lastDataMap[dataTime].batchCount += Number(dataItem[Constant.PROP.BATCH_COUNT]);
      lastDataMap[dataTime].outCount += Number(dataItem[Constant.PROP.OUT_COUNT]);
    }
    for (let i = 0; i < lastOutside.length; i++) {
      let dataItem = lastOutside[i];
      let dataTime = dataItem.dataTime;
      if (lastDataMap[dataTime] == null) {
        lastDataMap[dataTime] = { ...tmpData };
      }
      lastDataMap[dataTime].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
    }

    const range = TimeUtils.getTsDayRangeByTs(startTime, endTime);
    const dataTimeList = [];
    const [data1, data2, data3] = [[], [], []];
    const xAxis = [];
    for (let i = 0; i < range.length; i++) {
      let dataTime = range[i];
      let lastDataTime = dataTime - 86400 * 7; //同步数据时间
      dataTimeList.push(dataTime);

      let dataStr = TimeUtils.ts2Date(dataTime, "MM-dd");
      let week = TimeUtils.getWeekByTs(dataTime);
      let weekStr = weekDesc[week - 1];
      dataStr = `${weekStr}(${dataStr})`;
      xAxis.push(dataStr);

      let curValue = 0;
      let lastValue = 0;
      let qoq = 0;
      switch (flowType) {
        case Constant.FLOW_TYPE.IN_COUNT:
        case Constant.FLOW_TYPE.IN_NUM:
        case Constant.FLOW_TYPE.OUT_COUNT:
        case Constant.FLOW_TYPE.BATCH_COUNT:
        case Constant.FLOW_TYPE.OUTSIDE_COUNT:
          if (curDataMap[dataTime] && curDataMap[dataTime][flowType] > 0) {
            curValue = curDataMap[dataTime][flowType];
          }
          if (lastDataMap[lastDataTime] && lastDataMap[lastDataTime][flowType] > 0) {
            lastValue = lastDataMap[lastDataTime][flowType];
          }
          break;
        case Constant.FLOW_TYPE.COLLECT_COUNT:
          let area = User.getSite(siteId).area;
          if (curDataMap[dataTime] && curDataMap[dataTime].inCount > 0 && area > 0) {
            curValue = StringUtils.toFixed(curDataMap[dataTime].inCount / area, 2);
          }
          if (lastDataMap[lastDataTime] && lastDataMap[lastDataTime].inCount > 0 && area > 0) {
            lastValue = StringUtils.toFixed(lastDataMap[lastDataTime].inCount / area, 2);
          }
          break;
        case Constant.FLOW_TYPE.IN_RATE:
          if (curDataMap[dataTime]) {
            let inCount = curDataMap[dataTime].inCount;
            let outsideCount = curDataMap[dataTime].outsideCount;
            curValue = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
          }
          if (lastDataMap[lastDataTime]) {
            let inCount = lastDataMap[lastDataTime].inCount;
            let outsideCount = lastDataMap[lastDataTime].outsideCount;
            lastValue = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
          }
          break;
      }

      data1.push(curValue);
      data2.push(lastValue);
      qoq = DataConverter.calcGrowthRate(curValue, lastValue);
      data3.push(qoq);
    }

    let avg = ArrayUtils.getAverageValue(data1);
    let medianValue = ArrayUtils.getMedianValue([...data1], Constant.SORT.ASC);
    let maxValue = ArrayUtils.getMaxValue(data1);

    //数据处理
    if (flowType != Constant.FLOW_TYPE.COLLECT_COUNT && flowType != Constant.FLOW_TYPE.IN_RATE) {
      medianValue = Math.ceil(medianValue);
      maxValue = Math.ceil(maxValue);
      avg = Math.ceil(avg);
    } else {
      medianValue = StringUtils.toFixed(medianValue, 2);
      maxValue = StringUtils.toFixed(maxValue, 2);
      avg = StringUtils.toFixed(avg, 2);
    }
    const names = [Language.BENZHOU, Language.SHANGZHOU, Language.HUANBI];
    const chartData = {
      xAxis,
      names,
      data1,
      data2,
      data3,
      avg,
    };

    if (flowType == Constant.FLOW_TYPE.IN_RATE) {
      chartData.unit = "%";
    }

    const peakValueDesc = maxValue > 0 ? DataConverter.getFlowTypeDesc(maxValue, flowType) : Language.ZANWU;
    const medianDesc = medianValue > 0 || maxValue > 0 ? DataConverter.getFlowTypeDesc(medianValue, flowType) : Language.ZANWU;
    const avgDesc = avg > 0 ? DataConverter.getFlowTypeDesc(avg, flowType) : Language.ZANWU;
    const maxValueDataTime = dataTimeList[ArrayUtils.getMaxValueIndex(data1)];
    const peakTime = maxValue <= 0 ? Language.ZANWU : TimeUtils.ts2Date(maxValueDataTime);
    const date = data1.length > 1 ? `${TimeUtils.ts2Date(startTime)} ${Language.ZHI} ${TimeUtils.ts2Date(endTime)}` : TimeUtils.ts2Date(startTime);
    const info = {
      date,
      peakValueDesc,
      peakTime,
      avgDesc,
      medianDesc,
    };
    const trendData = {
      info,
      chartData,
      type: 2,
    };
    setFlowTrendAnalysisData({ chartData: trendData, data: data });
  };

  const setSiteGrowthRateData = (flowType, data) => {
    let startTime = data.startTime;
    let endTime = data.endTime;
    let range = TimeUtils.getDayRangeByTs(startTime, endTime, "MM-dd");
    let flowData = data.data;
    let legendData = [Language.GUOQUQIRI, Language.GUOQUSHISIRI, Language.GUOQUSANSHIRI];
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

  const setSiteVisitingPeakData = (type, data) => {
    let chartData = DataConverter.getVisitingPeakConvertData(type, data);
    setVisitingPeakData({ chartType: type, data: data, chartData: chartData });
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
  const setSiteStayAnalysisData = (data) => {
    setStayAnalysisData(DataConverter.getStayAnalysisConvertData(data));
  };

  const setSiteCustomerAttrData = (data) => {
    let isUnknow = true;
    let chartData = DataConverter.getCustomerAttrConvertData(data);
    setCustomerAttrData(chartData);
  };

  const setSiteCustomeMoodData = (data) => {
    let chartData = DataConverter.getCustomerMoodConvertData(data);
    setCustomerMoodData(chartData);
  };

  const setSiteDetailTableData = (data) => {
    const totalData = data.curTotal;
    const outsideData = data.curOutside;
    const clearTime = data.clearTime;
    const startTime = data.startTime;
    const endTime = data.endTime;
    const tmpData = {
      inCount: 0,
      inNum: 0,
      outCount: 0,
      batchCount: 0,
      outsideCount: 0,
    };
    const tmpRowData = {
      inCount: 0,
      inNum: 0,
      outCount: 0,
      batchCount: 0,
      collectCount: 0,
      outsideCount: 0,
      inRate: 0,
      inRateDesc: "0%",
    };
    const dataMap = {};
    for (let j = 0; j < totalData.length; j++) {
      let dataItem = totalData[j];
      let dataTime = dataItem.dataTime;
      if (dataMap[dataTime] == null) {
        dataMap[dataTime] = { ...tmpData };
      }
      dataMap[dataTime].inCount += Number(dataItem[Constant.PROP.IN_COUNT]);
      dataMap[dataTime].inNum += Number(dataItem[Constant.PROP.IN_NUM]);
      dataMap[dataTime].batchCount += Number(dataItem[Constant.PROP.BATCH_COUNT]);
      dataMap[dataTime].outCount += Number(dataItem[Constant.PROP.OUT_COUNT]);
    }

    for (let j = 0; j < outsideData.length; j++) {
      let dataItem = outsideData[j];
      let dataTime = dataItem.dataTime;
      if (dataMap[dataTime] == null) {
        dataMap[dataTime] = { ...tmpData };
      }
      dataMap[dataTime].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
    }

    const range = TimeUtils.getTsDayRangeByTs(startTime, endTime, "MM-dd");
    const dataSource = [];
    const area = User.getSite(siteId).area;
    for (let j = 0; j < range.length; j++) {
      let rowData = { ...tmpRowData };
      rowData.key = j;
      let dataTime = range[j];
      rowData.dataTime = dataTime;
      rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM-dd");
      if (dataMap[dataTime]) {
        rowData.inCount = dataMap[dataTime].inCount;
        rowData.inCount = rowData.inCount > 0 ? rowData.inCount : 0;
        rowData.inNum = dataMap[dataTime].inNum;
        rowData.inNum = rowData.inNum > 0 ? rowData.inNum : 0;
        rowData.outCount = dataMap[dataTime].outCount;
        rowData.outCount = rowData.outCount > 0 ? rowData.outCount : 0;
        rowData.outsideCount = dataMap[dataTime].outsideCount;
        rowData.batchCount = dataMap[dataTime].batchCount;
        if (rowData.inCount > 0) {
          rowData.collectCount = StringUtils.toFixed(rowData.inCount / area, 2);
        }
        if (rowData.outsideCount > 0) {
          rowData.inRate = StringUtils.toFixed((rowData.inCount / rowData.outsideCount) * 100, 2);
          rowData.inRateDesc = `${rowData.inRate}%`;
        }
      }
      dataSource.push(rowData);
    }
    const columns = flowColumns();
    const tableData = {
      dataSource,
      columns,
    };
    setFlowDetailTableData(tableData);
  };

  const setSiteCustomerAgeTableData = (data) => {
    const columns = customerAgeColumns();
    const dataSource = getCustomerAgeTableDataSource(data);
    const tableData = {
      columns,
      dataSource,
    };
    setCustomerAgeTableData(tableData);
  };

  const setSiteCustomerMoodTableData = (data) => {
    const columns = customerMoodColumns();
    const dataSource = getCustomerMoodtableDataSource(data);
    const tableData = {
      columns,
      dataSource,
    };
    setCustomerMoodTableData(tableData);
  };

  const setSiteWorkWeekAnalysisData = (data) => {
    const curTotal = data.curTotal;
    const lastTotal = data.lastTotal;
    const startTime = data.startTime;
    const endTime = data.endTime;
    const [data1, data2, data3] = [
      //0.本周工作日 1.上周工作日 2.本周周末 3.上周周末
      [0, 0, 0, 0], //进场人次
      [0, 0, 0, 0], //进场人数
      [0, 0, 0, 0], //客流批次
    ];
    let workDays = 0;
    let weekendDays = 0;
    let time = startTime;
    while (time <= endTime) {
      let week = TimeUtils.getWeekByTs(time);
      if (week === 6 || week === 7) {
        weekendDays++;
      } else {
        workDays++;
      }
      time += 86400;
    }

    for (let i = 0; i < curTotal.length; i++) {
      const dataItem = curTotal[i];
      const dataTime = dataItem.dataTime;
      const week = TimeUtils.getWeekByTs(dataTime);
      const inCount = Number(dataItem.inCount);
      const inNum = Number(dataItem.inNum);
      const batchCount = Number(dataItem.batchCount);
      if (week == 6 || week == 7) {
        data1[2] += inCount;
        data2[2] += inNum;
        data3[2] += batchCount;
      } else {
        data1[0] += inCount;
        data2[0] += inNum;
        data3[0] += batchCount;
      }
    }

    for (let i = 0; i < lastTotal.length; i++) {
      const dataItem = lastTotal[i];
      const dataTime = dataItem.dataTime;
      const week = TimeUtils.getWeekByTs(dataTime);
      const inCount = Number(dataItem.inCount);
      const inNum = Number(dataItem.inNum);
      const batchCount = Number(dataItem.batchCount);
      if (week == 6 || week == 7) {
        data1[3] += inCount;
        data2[3] += inNum;
        data3[3] += batchCount;
      } else {
        data1[1] += inCount;
        data2[1] += inNum;
        data3[1] += batchCount;
      }
    }

    console.log("data", data1, data2, data3);
    for (let i = 0; i < data1.length; i++) {
      if (i < 2) {
        data1[i] = Math.ceil(data1[i] / workDays);
        data2[i] = Math.ceil(data2[i] / workDays);
        data3[i] = Math.ceil(data3[i] / workDays);
      } else {
        data1[i] = Math.ceil(data1[i] / weekendDays);
        data2[i] = Math.ceil(data2[i] / weekendDays);
        data3[i] = Math.ceil(data3[i] / weekendDays);
      }
    }
    const xAxis = [Language.BENZHOUGONGZUORI, Language.SHANGZHOUGONGZUORI, Language.BENZHOUZHOUMO, Language.SHANGZHOUZHOUMO];
    const chartData = {
      xAxis,
      data1,
      data2,
      data3,
    };
    setWorkWeekAnalysisData(chartData);
  };

  const requestWeeklyStats = (params) => {
    setLoading(true);
    params.siteId = siteId;
    Http.getWeeklyStats(params, (res) => {
      setSiteFlowStatsData(res.data.flowStats);
      setSiteFlowTrendData(flowTypeOptions.value, res.data.flowTrend);
      setSiteGrowthRateData(growthRateData.flowType, res.data.growthRate);
      setSiteVisitingPeakData(visitingPeakData.chartType, res.data.visitingPeak);
      setSiteDoorRankingData(res.data.doorsRanking);
      setSiteStayAnalysisData(res.data.stayAnalysis);
      const faceData = DataConverter.getCustomerDataSumConverData(res.data.faceFlow.list);
      setSiteCustomerAttrData(faceData);
      setSiteCustomeMoodData(faceData);
      setSiteCustomerAgeTableData(res.data.faceFlow);
      setSiteCustomerMoodTableData(res.data.faceFlow);
      setSiteDetailTableData(res.data.flowTrend);
      setSiteWorkWeekAnalysisData(res.data.flowTrend);
      setLoading(false);
    });
  };
  return (
    <div className="main">
      <UIContent>
        <Flex gap="large" align="center">
          <Flex gap="large" align="center" className="date-picker">
            <div style={{ fontSize: "16px", color: "#3867D6", fontWeight: "bold" }}>{Language.ZHOUBAO}</div>
          </Flex>
          <DatePicker defaultValue={weekDate} value={weekDate} allowClear={false} picker="week" prefix={<CalendarOutlined />} suffixIcon={null} onChange={onChangeWeekPicker} />
          <Button type="primary" style={{ height: "30px", backgroundColor: "#3867D6" }} onClick={onClickQuery}>
            {Language.CHAXUN}
          </Button>
        </Flex>
      </UIContent>
      <UIContentLoading loading={loading}>
        <div className="layout-content layout-content-noScroll">
          <FlowStatsPanel data={flowStatsData} yoyType={1} />
          <FlowTrendAnalysisPanelChartPanel
            style={{ width: "100%", height: "358px" }}
            data={flowTrendAnalysisData.chartData}
            extra={<UISelect options={flowTypeOptions?.options} defaultValue={flowTypeOptions?.value} style={{ width: "210px", height: "29px" }} onChange={onFlowTypeChange} />}
          />
          <div className="dual-row">
            <VisitingPeakChartPanel className="dual-row-content" data={visitingPeakData?.chartData} type={visitingPeakData?.chartType} onChange={onChangeVisitingPeakChartType} />
            <DoorRankingChartPanel className="dual-row-content" data={doorRankingData} />
          </div>
          <div className="dual-row">
            <CustomerAttrBarChartPanel className="dual-row-content" data={customerAttrData} />
            <CustomerMoodRadarChartPanel className="dual-row-content" data={customerMoodData} />
          </div>
          {/* <div className="dual-row">
        
        
        <WeatherAnalysisChartPanel className="dual-row-content" data={weatherAnalysisData} />
      </div> */}

          <div className="dual-row">
            <WeekWorkAnalysisLineBarChartPanel className="dual-row-content" data={workWeekAnalysisData} />
            {/* <StayAnalysisChartPanel className="dual-row-content" data={stayAnalysisData} /> */}
            <GrowthRateChartPanel
              className="dual-row-content"
              data={growthRateData.chartData}
              extra={<FlowSelect defaultValue={growthRateFlowTypeOptions.value} options={growthRateFlowTypeOptions.options} onChange={onChangeGrowthRateFlowType} />}
            />
          </div>
          <div style={{ width: "100%", height: "800px" }}>
            <UIPanel
              title={Language.SHUJUXIANGQING}
              extra={
                <Button type="primary" className="table-detail-export-button" onClick={onClickExport}>
                  {Language.DAOCHUSHUJU}
                </Button>
              }>
              <Tabs items={tabItems} />
            </UIPanel>
          </div>
          <ICPComponent />
        </div>
      </UIContentLoading>
    </div>
  );
};

export default WeeklyReport;
