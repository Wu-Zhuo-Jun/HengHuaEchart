import React, { useState, useEffect, use, useCallback } from "react";
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
  AnnualHeatMapChartPanel,
} from "../../../components/common/panels/ChartPanel";
import { FlowSelect, UIContent, UIPanel, UISelect, ICPComponent, UIContentLoading } from "../../../components/ui/UIComponent";
import { DataTable } from "../../../components/common/tables/Table";
import { Tabs, DatePicker, Button, Flex, Select } from "antd";
import DemoUtils from "../../../utils/DemoUtils";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Selection from "../../../common/Selection";
import TimeUtils from "../../../utils/TimeUtils";
import Constant from "../../../common/Constant";

import "./WeeklyReport.css";
import { useSite } from "@/context/SiteContext";
import Http from "@/config/Http";
import DataConverter from "@/data/DataConverter";
import User from "@/data/UserData";
import { getCustomerAgeTableDataSource, getCustomerMoodtableDataSource, getSiteFlowStatsData } from "./model/Model";
import StringUtils from "@/utils/StringUtils";
import { customerAgeColumns, customerMoodColumns, flowColumns } from "./components/TableColumns";
import ArrayUtils from "@/utils/ArrayUtils";
import ExportUtils from "@/utils/ExportUtils";

const { RangePicker } = DatePicker;

const AnnualReport = () => {
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
  const [visitingChartType, setVisitingChartType] = useState(1);
  const [doorRankingData, setDoorRankingData] = useState(null);
  const [stayAnalysisData, setStayAnalysisData] = useState(null);
  const [growthRateData, setGrowthRateData] = useState({
    flowType: GROWTH_RATE_FLOW_TYPE_OPTIONS[0].value,
    data: null,
  });
  const [growthRateFlowTypeOptions, setGrowthRateFlowTypeOptions] = useState({
    options: GROWTH_RATE_FLOW_TYPE_OPTIONS,
    value: GROWTH_RATE_FLOW_TYPE_OPTIONS[0].value,
  });
  const [heatMapFlowType, setHeatMapFlowType] = useState({
    options: GROWTH_RATE_FLOW_TYPE_OPTIONS,
    value: GROWTH_RATE_FLOW_TYPE_OPTIONS[0].value,
  });
  const [flowTypeOptions, setFlowTypeOptions] = useState({
    options: FLOW_TYPE_OPTIONS,
    value: FLOW_TYPE_OPTIONS[0].value,
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
  const [rangePickerDate, setRangePickerDate] = useState([]);
  const [invertalTypeOptions, setIntervalTypeOptions] = useState(null);
  const [workWeekAnalysisData, setWorkWeekAnalysisData] = useState(null);
  const [weatherAnalysisData, setWeatherAnalysisData] = useState(null);
  const [heatMapData, setHeatMapData] = useState({
    chartData: null,
    info: null,
    data: null,
  });
  const [yearDate, setYearDate] = useState(() => {
    let timeSlot = TimeUtils.getDayTimeSlotsByTs(TimeUtils.now());
    let clearTime = User.getSiteClearTime(User.selectedSiteId);
    timeSlot.startTime = timeSlot.startTime - clearTime;
    return dayjs(TimeUtils.ts2Date(timeSlot.startTime, "yyyy-MM-dd"));
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
      let startDate = yearDate.format("YYYY-MM-DD");
      let params = {
        startDate,
      };
      requestAnnualStats(params);
    }
  }, [siteId]);

  const onChangeVisitingPeakChartType = useCallback(
    (e) => {
      const chartType = e.target.value;
      setSiteVisitingPeakData(chartType, visitingPeakData.data);
    },
    [visitingPeakData]
  );

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

  const onFlowTypeChange = useCallback(
    (value) => {
      setSiteFlowTrendData(value, flowTrendAnalysisData.data);
    },
    [flowTrendAnalysisData]
  );

  const onChangeWeekPicker = (dates, dateStrings) => {
    setYearDate(dates);
  };

  const onChangeGrowthRateFlowType = useCallback(
    (value) => {
      setSiteGrowthRateData(value, growthRateData.data);
    },
    [growthRateData]
  );

  const onChangeHeatMapFlowType = useCallback(
    (value) => {
      setSiteHeatMapData(value, heatMapData.data);
    },
    [heatMapData]
  );

  const onClickQuery = () => {
    let startDate = yearDate.format("YYYY-MM-DD");
    let params = {
      startDate,
    };
    requestAnnualStats(params);
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
    const dateDesc = yearDate.format("YYYY");
    const fileName = `${site.siteName}-${Language.KELIU}${Language.NIANBAO}-${dateDesc}`;
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName });
  }, [flowDetailTableData, customerAgeTableData, customerMoodTableData]);

  const setSiteFlowStatsData = (data) => {
    let site = User.getSite(siteId);
    let area = Number(site.area);
    let statsData = getSiteFlowStatsData(data, area);
    setFlowStatsData(statsData);
  };

  const setSiteVisitingPeakData = (type, data) => {
    let chartData = DataConverter.getVisitingPeakConvertData(type, data);
    setVisitingPeakData({ chartType: type, data: data, chartData: chartData });
  };

  const setSiteStayAnalysisData = (data) => {
    setStayAnalysisData(DataConverter.getStayAnalysisConvertData(data));
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

  const setSiteGrowthRateData = (flowType, data) => {
    let startTime = data.startTime;
    let endTime = data.endTime;
    let range = TimeUtils.getMonthRangeByTs(startTime, endTime, "yyyy-MM");
    let flowData = data.data;
    let legendData = [Language.GUOQUQIYUE, Language.GUOQUSHISIYUE, Language.GUOQUSANSHIYUE];
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

  const setSiteDetailTableData = (data) => {
    const curFlowTrend = data.curFlowTrend;
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
    for (let j = 0; j < curFlowTrend.length; j++) {
      let dataItem = curFlowTrend[j];
      let dataTime = dataItem.dataTime;
      dataTime = TimeUtils.date2Ts(`${TimeUtils.ts2Date(dataTime, "yyyy-MM")}-01 00:00:00`);
      if (dataMap[dataTime] == null) {
        dataMap[dataTime] = { ...tmpData };
      }
      dataMap[dataTime].inCount += Number(dataItem[Constant.PROP.IN_COUNT]);
      dataMap[dataTime].inNum += Number(dataItem[Constant.PROP.IN_NUM]);
      dataMap[dataTime].batchCount += Number(dataItem[Constant.PROP.BATCH_COUNT]);
      dataMap[dataTime].outCount += Number(dataItem[Constant.PROP.OUT_COUNT]);
      dataMap[dataTime].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
    }

    const range = TimeUtils.getTsMonthRangeByTs(startTime, endTime);
    const dataSource = [];
    const area = User.getSite(siteId).area;
    for (let j = 0; j < range.length; j++) {
      let rowData = { ...tmpRowData };
      rowData.key = j;
      let dataTime = range[j];
      rowData.dataTime = dataTime;
      rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM");
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
    const tableData = {
      dataSource,
    };
    setFlowDetailTableData(tableData);
  };

  const setSiteCustomerAgeTableData = (data) => {
    const columns = customerAgeColumns();
    const dataSource = getCustomerAgeTableDataSource(data, "month");
    const tableData = {
      columns,
      dataSource,
    };
    setCustomerAgeTableData(tableData);
  };

  const setSiteCustomerMoodTableData = (data) => {
    const columns = customerMoodColumns();
    const dataSource = getCustomerMoodtableDataSource(data, "month");
    const tableData = {
      columns,
      dataSource,
    };
    setCustomerMoodTableData(tableData);
  };

  const setSiteWorkWeekAnalysisData = (data) => {
    const curTotal = data.curFlowTrend;
    const lastTotal = data.lastFlowTrend;
    const startTime = data.startTime;
    const endTime = data.endTime;
    const lastStartTime = data.lastStartTime;
    const lastEndTime = data.lastEndTime;
    const [data1, data2, data3] = [
      //0.本年工作日 1.上年工作日 2.本年周末 3.上年周末
      [0, 0, 0, 0], //进场人次
      [0, 0, 0, 0], //进场人数
      [0, 0, 0, 0], //客流批次
    ];
    let curWorkDays = 0;
    let curWeekendDays = 0;
    let time = startTime;
    while (time <= endTime) {
      let week = TimeUtils.getWeekByTs(time);
      if (week === 6 || week === 7) {
        curWeekendDays++;
      } else {
        curWorkDays++;
      }
      time += 86400;
    }

    let lastWorkDays = 0;
    let lastWeekendDays = 0;
    time = lastStartTime;
    while (time <= lastEndTime) {
      let week = TimeUtils.getWeekByTs(time);
      if (week === 6 || week === 7) {
        lastWeekendDays++;
      } else {
        lastWorkDays++;
      }
      time += 86400;
    }
    console.log("asdad");
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

    const daysArr = [curWorkDays, lastWorkDays, curWeekendDays, lastWeekendDays];
    for (let i = 0; i < data1.length; i++) {
      data1[i] = daysArr[i] > 0 ? Math.ceil(data1[i] / daysArr[i]) : 0;
      data2[i] = daysArr[i] > 0 ? Math.ceil(data2[i] / daysArr[i]) : 0;
      data3[i] = daysArr[i] > 0 ? Math.ceil(data3[i] / daysArr[i]) : 0;
    }
    const xAxis = [Language.BENNIANGONGZUORI, Language.SHANGNIANGONGZUORI, Language.BENNIANZHOUMO, Language.SHANGNIANZHOUMO];
    const chartData = {
      xAxis,
      data1,
      data2,
      data3,
    };
    setWorkWeekAnalysisData(chartData);
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

  const setSiteHeatMapData = (flowType, data) => {
    const flowTrend = data.curFlowTrend;
    const startTime = data.startTime;
    const endTime = data.endTime;
    const year = TimeUtils.ts2Date(startTime, "yyyy");
    const range = TimeUtils.getYearDateRangeFromDateStr(year);
    const tmpData = {
      inCount: 0,
      inNum: 0,
      batchCount: 0,
    };
    const unitMap = {
      [Constant.FLOW_TYPE.IN_COUNT]: Language.RENCI,
      [Constant.FLOW_TYPE.IN_NUM]: Language.RENSHU,
      [Constant.FLOW_TYPE.BATCH_COUNT]: Language.KELIUPICI,
    };
    const dataMap = {};

    for (let i = 0; i < flowTrend.length; i++) {
      const dataItem = flowTrend[i];
      const dataTime = dataItem.dataTime;
      const dateStr = TimeUtils.ts2Date(dataTime);
      if (dataMap[dateStr] == null) {
        dataMap[dateStr] = { ...tmpData };
      }
      dataMap[dateStr].inCount += Number(dataItem[Constant.PROP.IN_COUNT]);
      dataMap[dateStr].inNum += Number(dataItem[Constant.PROP.IN_NUM]);
      dataMap[dateStr].batchCount += Number(dataItem[Constant.PROP.BATCH_COUNT]);
    }

    const dayDataList = [];
    let maxValue = 0;
    let peakDate = null;
    for (let i = 0; i < range.length; i++) {
      let dateStr = range[i];
      let value = 0;
      switch (flowType) {
        case Constant.FLOW_TYPE.IN_COUNT:
        case Constant.FLOW_TYPE.IN_NUM:
        case Constant.FLOW_TYPE.BATCH_COUNT:
          if (dataMap[dateStr] && dataMap[dateStr][flowType] > 0) {
            value = dataMap[dateStr][flowType];
          }
          break;
      }
      dayDataList.push([dateStr, value]);
      if (value > maxValue) {
        maxValue = value;
        peakDate = dateStr;
      }
    }
    const chartData = {
      data: dayDataList,
      year: year,
      max: maxValue > 1000 ? maxValue : 1000,
    };
    const info = {
      unit: unitMap[flowType],
      peakValue: maxValue.toLocaleString("en-US"),
      peakDate: peakDate,
    };
    setHeatMapData({ chartData, info, data });
  };

  const setSiteFlowTrendData = (flowType, data) => {
    const curFlowTrend = data.curFlowTrend;
    const lastFlowTrend = data.lastFlowTrend;
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
    const monthDesc = [
      Language.YIYUE,
      Language.ERYUE,
      Language.SANYUE,
      Language.SIYUE,
      Language.WUYUE,
      Language.LIUYUE,
      Language.QIYUE,
      Language.BAYUE,
      Language.JIUYUE,
      Language.SHIYUE,
      Language.SHIYIYUE,
      Language.SHIERYUE,
    ];

    const curDataMap = {};
    for (let i = 0; i < curFlowTrend.length; i++) {
      const dataItem = curFlowTrend[i];
      const dataTime = dataItem.dataTime;
      const month = Number(TimeUtils.ts2Date(dataTime, "MM"));
      // const monthTime = TimeUtils.date2Ts(`${month} 00:00:00`);
      if (curDataMap[month] == null) {
        curDataMap[month] = { ...tmpData };
      }
      curDataMap[month].inCount += Number(dataItem[Constant.PROP.IN_COUNT]);
      curDataMap[month].inNum += Number(dataItem[Constant.PROP.IN_NUM]);
      curDataMap[month].batchCount += Number(dataItem[Constant.PROP.BATCH_COUNT]);
      curDataMap[month].outCount += Number(dataItem[Constant.PROP.OUT_COUNT]);
      curDataMap[month].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
    }
    const lastDataMap = {};
    for (let i = 0; i < lastFlowTrend.length; i++) {
      const dataItem = lastFlowTrend[i];
      const dataTime = dataItem.dataTime;
      const month = Number(TimeUtils.ts2Date(dataTime, "MM"));
      if (lastDataMap[month] == null) {
        lastDataMap[month] = { ...tmpData };
      }
      lastDataMap[month].inCount -= Number(dataItem[Constant.PROP.IN_COUNT]);
      lastDataMap[month].inNum -= Number(dataItem[Constant.PROP.IN_NUM]);
      lastDataMap[month].batchCount -= Number(dataItem[Constant.PROP.BATCH_COUNT]);
      lastDataMap[month].outCount -= Number(dataItem[Constant.PROP.OUT_COUNT]);
      lastDataMap[month].outsideCount -= Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
    }
    console.log("curDataMap", curDataMap);
    const range = TimeUtils.getTsMonthRangeByTs(startTime, endTime);
    const dataTimeList = [];
    const [data1, data2, data3] = [[], [], []];
    const xAxis = [];
    for (let i = 0; i < range.length; i++) {
      let dataTime = range[i];
      dataTimeList.push(dataTime);
      let month = Number(TimeUtils.ts2Date(dataTime, "MM"));
      xAxis.push(monthDesc[month - 1]);

      let curValue = 0;
      let lastValue = 0;
      let qoq = 0;

      switch (flowType) {
        case Constant.FLOW_TYPE.IN_COUNT:
        case Constant.FLOW_TYPE.IN_NUM:
        case Constant.FLOW_TYPE.OUT_COUNT:
        case Constant.FLOW_TYPE.BATCH_COUNT:
        case Constant.FLOW_TYPE.OUTSIDE_COUNT:
          if (curDataMap[month] && curDataMap[month][flowType] > 0) {
            curValue = curDataMap[month][flowType];
          }
          if (lastDataMap[month] && lastDataMap[month][flowType] > 0) {
            lastValue = lastDataMap[month][flowType];
          }
          break;
        case Constant.FLOW_TYPE.COLLECT_COUNT:
          let area = User.getSite(siteId).area;
          if (curDataMap[month] && curDataMap[month].inCount > 0 && area > 0) {
            curValue = StringUtils.toFixed(curDataMap[month].inCount / area, 2);
          }
          if (lastDataMap[month] && lastDataMap[month].inCount > 0 && area > 0) {
            lastValue = StringUtils.toFixed(lastDataMap[month].inCount / area, 2);
          }
          break;
        case Constant.FLOW_TYPE.IN_RATE:
          if (curDataMap[month]) {
            let inCount = curDataMap[month].inCount;
            let outsideCount = curDataMap[month].outsideCount;
            curValue = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
          }
          if (lastDataMap[month]) {
            let inCount = lastDataMap[month].inCount;
            let outsideCount = lastDataMap[month].outsideCount;
            lastValue = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
          }
          break;
      }
      data1.push(curValue);
      data2.push(lastValue);
      qoq = DataConverter.calcGrowthRate(curValue, lastValue);
      data3.push(qoq);
    }
    console.log("asdadsssssssss");
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

    const names = [Language.BENNIAN, Language.SHANGNIAN, Language.HUANBI];
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
    const peakTime = maxValue <= 0 ? Language.ZANWU : TimeUtils.ts2Date(maxValueDataTime, "yyyy-MM");
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

  const requestAnnualStats = (params) => {
    params.siteId = siteId;
    setLoading(true);
    Http.getAnnualStats(params, (res) => {
      setSiteFlowStatsData(res.data.flowStats);
      setSiteVisitingPeakData(visitingPeakData.chartType, res.data.visitingPeak);
      setSiteDoorRankingData(res.data.doorsRanking);
      setSiteStayAnalysisData(res.data.stayAnalysis);
      setSiteGrowthRateData(growthRateData.flowType, res.data.growthRate);
      const faceData = DataConverter.getCustomerDataSumConverData(res.data.faceFlow.list);
      setSiteCustomerAttrData(faceData);
      setSiteCustomeMoodData(faceData);
      setSiteDetailTableData(res.data.flowTrend);
      setSiteCustomerAgeTableData(res.data.faceFlow);
      setSiteCustomerMoodTableData(res.data.faceFlow);
      setSiteWorkWeekAnalysisData(res.data.flowTrend);
      setSiteHeatMapData(heatMapFlowType.value, res.data.flowTrend);
      setSiteFlowTrendData(flowTypeOptions.value, res.data.flowTrend);
      setLoading(false);
    });
  };

  return (
    <div className="main">
      <UIContent>
        <Flex gap="large" align="center">
          <Flex gap="large" align="center" className="date-picker">
            <div style={{ fontSize: "16px", color: "#3867D6", fontWeight: "bold" }}>{Language.NIANBAO}</div>
          </Flex>
          <DatePicker defaultValue={yearDate} value={yearDate} allowClear={false} picker="year" prefix={<CalendarOutlined />} suffixIcon={null} onChange={onChangeWeekPicker} />
          <Button type="primary" style={{ height: "30px", backgroundColor: "#3867D6" }} onClick={onClickQuery}>
            {Language.CHAXUN}
          </Button>
        </Flex>
      </UIContent>
      <UIContentLoading loading={loading}>
        <div className="layout-content layout-content-noScroll">
          <FlowStatsPanel data={flowStatsData} />
          <FlowTrendAnalysisPanelChartPanel
            style={{ width: "100%", height: "358px" }}
            data={flowTrendAnalysisData?.chartData}
            extra={<FlowTrendAnalysisExtra options={flowTypeOptions.options} value={flowTypeOptions.value} onChange={onFlowTypeChange} />}
          />
          <div className="dual-row">
            <VisitingPeakChartPanel className="dual-row-content" data={visitingPeakData?.chartData} type={visitingPeakData?.chartType} onChange={onChangeVisitingPeakChartType} />
            <DoorRankingChartPanel className="dual-row-content" data={doorRankingData} />
          </div>
          {/* <div className="dual-row">
        <WeekWorkAnalysisLineBarChartPanel className="dual-row-content" data={workWeekAnalysisData} />
        <WeatherAnalysisChartPanel className="dual-row-content" data={weatherAnalysisData} />
      </div> */}
          <div className="dual-row">
            {/* <StayAnalysisChartPanel className="dual-row-content" data={stayAnalysisData} /> */}
            <WeekWorkAnalysisLineBarChartPanel className="dual-row-content" data={workWeekAnalysisData} />
            <GrowthRateChartPanel
              className="dual-row-content"
              data={growthRateData.chartData}
              extra={<FlowSelect defaultValue={growthRateFlowTypeOptions.value} options={growthRateFlowTypeOptions.options} onChange={onChangeGrowthRateFlowType} />}
            />
          </div>
          <div className="dual-row">
            <CustomerAttrBarChartPanel className="dual-row-content" data={customerAttrData} />
            <CustomerMoodRadarChartPanel className="dual-row-content" data={customerMoodData} />
          </div>
          <div style={{ width: "100%", minHeight: "352px" }}>
            <AnnualHeatMapChartPanel data={heatMapData} extra={<FlowSelect defaultValue={heatMapFlowType.value} options={heatMapFlowType.options} onChange={onChangeHeatMapFlowType} />} />
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

const FlowTrendAnalysisExtra = React.memo(({ options, value, onChange }) => {
  return <UISelect options={options} defaultValue={value} style={{ width: "210px", height: "29px" }} onChange={onChange} />;
});

export default AnnualReport;
