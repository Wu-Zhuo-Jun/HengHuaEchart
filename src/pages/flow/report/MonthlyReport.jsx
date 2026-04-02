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
import User from "@/data/UserData";
import Http from "@/config/Http";
import { getCustomerAgeTableDataSource, getCustomerMoodtableDataSource, getSiteFlowStatsData } from "./model/Model";
import { customerAgeColumns, customerMoodColumns, doorRankingColumns, flowColumns } from "./components/TableColumns";
import DataConverter from "@/data/DataConverter";
import StringUtils from "@/utils/StringUtils";
import ArrayUtils from "@/utils/ArrayUtils";
import ExportUtils from "@/utils/ExportUtils";

const { RangePicker } = DatePicker;

const MonthlyReport = () => {
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
  const [growthRateFlowTypeOptions, setGrowthRateFlowTypeOptions] = useState({
    options: GROWTH_RATE_FLOW_TYPE_OPTIONS,
    value: GROWTH_RATE_FLOW_TYPE_OPTIONS[0].value,
  });
  const [flowStatsData, setFlowStatsData] = useState([]);
  const [visitingPeakData, setVisitingPeakData] = useState({
    chartType: 1,
    chartData: null,
    data: null,
  });
  const [visitingChartType, setVisitingChartType] = useState(1);
  const [floorTransformData, setFloorTransformData] = useState(null);
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
  const [invertalTypeOptions, setIntervalTypeOptions] = useState(null);
  const [flowTypeOptions, setFlowTypeOptions] = useState({
    options: FLOW_TYPE_OPTIONS,
    value: FLOW_TYPE_OPTIONS[0].value,
  });
  const [workWeekAnalysisData, setWorkWeekAnalysisData] = useState(null);
  const [weatherAnalysisData, setWeatherAnalysisData] = useState(null);
  const [monthDate, setMonthDate] = useState(() => {
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
      let startDate = monthDate.format("YYYY-MM-DD");
      let params = {
        startDate,
      };
      requestMonthlyStats(params);
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
    setMonthDate(dates);
  };

  const onChangeGrowthRateFlowType = (value) => {
    setSiteGrowthRateData(value, growthRateData.data);
  };

  const onClickQuery = () => {
    let startDate = monthDate.format("YYYY-MM-DD");
    let params = {
      startDate,
    };
    requestMonthlyStats(params);
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
    const dateDesc = monthDate.format("YYYYMM");
    const fileName = `${site.siteName}-${Language.KELIU}${Language.YUEBAO}-${dateDesc}`;
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName });
  }, [flowDetailTableData, customerAgeTableData, customerMoodTableData]);

  const setSiteFlowStatsData = (data) => {
    let site = User.getSite(siteId);
    let area = Number(site.area);
    let statsData = getSiteFlowStatsData(data, area);
    setFlowStatsData(statsData);
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
    const columns = doorRankingColumns();
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

  const setSiteFlowTrendData = (flowType, data) => {
    const curTotal = data.curTotal;
    const curOutside = data.curOutside;
    const lastTotal = data.lastTotal;
    const lastOutside = data.lastOutside;
    const sameTotal = data.sameTotal;
    const sameOutside = data.sameOutside;
    const clearTime = data.clearTime;
    const startTime = data.startTime;
    const endTime = data.endTime;

    const dataMapArr = [{}, {}, {}];
    const flowDataArr = [
      {
        total: curTotal,
        outside: curOutside,
      },
      {
        total: lastTotal,
        outside: lastOutside,
      },
      {
        total: sameTotal,
        outside: sameOutside,
      },
    ];
    const tmpData = {
      inCount: 0,
      inNum: 0,
      outCount: 0,
      batchCount: 0,
      outsideCount: 0,
    };

    for (let i = 0; i < dataMapArr.length; i++) {
      let dataMap = dataMapArr[i];
      let totalData = flowDataArr[i].total;
      let outsideData = flowDataArr[i].outside;
      for (let j = 0; j < totalData.length; j++) {
        let dataItem = totalData[j];
        let dataTime = dataItem.dataTime;
        let day = TimeUtils.ts2Date(dataTime, "dd");
        if (dataMap[day] == null) {
          dataMap[day] = { ...tmpData };
        }
        dataMap[day].inCount += Number(dataItem[Constant.PROP.IN_COUNT]);
        dataMap[day].inNum += Number(dataItem[Constant.PROP.IN_NUM]);
        dataMap[day].batchCount += Number(dataItem[Constant.PROP.BATCH_COUNT]);
        dataMap[day].outCount += Number(dataItem[Constant.PROP.OUT_COUNT]);
      }

      for (let j = 0; j < outsideData.length; j++) {
        let dataItem = outsideData[j];
        let dataTime = dataItem.dataTime;
        let day = TimeUtils.ts2Date(dataTime, "dd");
        if (dataMap[day] == null) {
          dataMap[day] = { ...tmpData };
        }
        dataMap[day].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
      }
    }
    const dateList = [];
    const xAxis = [];
    const [data1, data2, data3] = [[], [], []];
    const range = TimeUtils.getTsDayRangeByTs(startTime, endTime);
    for (let i = 0; i < range.length; i++) {
      let dataTime = range[i];
      let day = TimeUtils.ts2Date(dataTime, "dd");
      xAxis.push(TimeUtils.ts2Date(dataTime, "MM-dd"));
      dateList.push(TimeUtils.ts2Date(dataTime));

      let curValue = 0;
      let lastValue = 0;
      let sameValue = 0;
      let curDataMap = dataMapArr[0];
      let lastDataMap = dataMapArr[1];
      let sameDataMap = dataMapArr[2];
      switch (flowType) {
        case Constant.FLOW_TYPE.IN_COUNT:
        case Constant.FLOW_TYPE.IN_NUM:
        case Constant.FLOW_TYPE.OUT_COUNT:
        case Constant.FLOW_TYPE.BATCH_COUNT:
        case Constant.FLOW_TYPE.OUTSIDE_COUNT:
          if (curDataMap[day] && curDataMap[day][flowType] > 0) {
            curValue = curDataMap[day][flowType];
          }
          if (lastDataMap[day] && lastDataMap[day][flowType] > 0) {
            lastValue = lastDataMap[day][flowType];
          }
          if (sameDataMap[day] && sameDataMap[day][flowType] > 0) {
            sameValue = sameDataMap[day][flowType];
          }
          break;
        case Constant.FLOW_TYPE.COLLECT_COUNT:
          let area = User.getSite(siteId).area;
          if (curDataMap[day] && curDataMap[day].inCount > 0 && area > 0) {
            curValue = StringUtils.toFixed(curDataMap[day].inCount / area, 2);
          }
          if (lastDataMap[day] && lastDataMap[day].inCount > 0 && area > 0) {
            lastValue = StringUtils.toFixed(lastDataMap[day].inCount / area, 2);
          }
          if (sameDataMap[day] && sameDataMap[day].inCount > 0 && area > 0) {
            sameValue = StringUtils.toFixed(sameDataMap[day].inCount / area, 2);
          }
          break;
        case Constant.FLOW_TYPE.IN_RATE:
          if (curDataMap[day]) {
            let inCount = curDataMap[day].inCount;
            let outsideCount = curDataMap[day].outsideCount;
            curValue = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
          }
          if (lastDataMap[day]) {
            let inCount = lastDataMap[day].inCount;
            let outsideCount = lastDataMap[day].outsideCount;
            lastValue = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
          }
          if (sameDataMap[day]) {
            let inCount = sameDataMap[day].inCount;
            let outsideCount = sameDataMap[day].outsideCount;
            sameValue = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
          }
          break;
      }
      data1.push(curValue);
      data2.push(lastValue);
      data3.push(sameValue);
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
    const series = [
      { name: Language.BENYUE, data: data1 },
      { name: Language.SHANGYUE, data: data2 },
      { name: Language.QUNIANTONGYUE, data: data3 },
    ];
    const chartData = {
      xAxis,
      series,
      avg,
    };
    if (flowType == Constant.FLOW_TYPE.IN_RATE) {
      chartData.option = {
        tooltip: {
          valueFormatter: (value) => {
            return value + "%";
          },
        },
        yAxis: {
          axisLabel: {
            formatter: "{value}%",
          },
        },
      };
      chartData.series[0].markLine = {
        label: {
          formatter: (param) => `${Language.PINGJUNZHI}: ${param.value}%`,
        },
      };
    }

    const peakValueDesc = maxValue > 0 ? DataConverter.getFlowTypeDesc(maxValue, flowType) : Language.ZANWU;
    const medianDesc = medianValue > 0 || maxValue > 0 ? DataConverter.getFlowTypeDesc(medianValue, flowType) : Language.ZANWU;
    const avgDesc = avg > 0 ? DataConverter.getFlowTypeDesc(avg, flowType) : Language.ZANWU;
    const maxValueDate = dateList[ArrayUtils.getMaxValueIndex(data1)];
    const peakTime = maxValue <= 0 ? Language.ZANWU : maxValueDate;
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
      type: 1,
    };
    setFlowTrendAnalysisData({ chartData: trendData, data: data });
  };

  const setSiteWorkWeekAnalysisData = (data) => {
    const curTotal = data.curTotal;
    const lastTotal = data.lastTotal;
    const startTime = data.startTime;
    const endTime = data.endTime;
    const startTimeLastMonth = data.startTimeLastMonth;
    const endTimeLastMonth = data.endTimeLastMonth;
    const [data1, data2, data3] = [
      //0.本月工作日 1.上月工作日 2.本月周末 3.上月周末
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

    let lastMonthWorkDays = 0;
    let lastMonthWeekendDays = 0;
    time = startTimeLastMonth;
    while (time <= endTimeLastMonth) {
      let week = TimeUtils.getWeekByTs(time);
      if (week === 6 || week === 7) {
        lastMonthWeekendDays++;
      } else {
        lastMonthWorkDays++;
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

    const daysArr = [curWorkDays, lastMonthWorkDays, curWeekendDays, lastMonthWeekendDays];
    for (let i = 0; i < data1.length; i++) {
      data1[i] = daysArr[i] > 0 ? Math.ceil(data1[i] / daysArr[i]) : 0;
      data2[i] = daysArr[i] > 0 ? Math.ceil(data2[i] / daysArr[i]) : 0;
      data3[i] = daysArr[i] > 0 ? Math.ceil(data3[i] / daysArr[i]) : 0;
    }
    const xAxis = [Language.BENYUEGONGZUORI, Language.SHANGYUEGONGZUORI, Language.BENYUEZHOUMO, Language.SHANGYUEZHOUMO];
    const chartData = {
      xAxis,
      data1,
      data2,
      data3,
    };
    setWorkWeekAnalysisData(chartData);
  };

  const requestMonthlyStats = (params) => {
    params.siteId = siteId;
    setLoading(true);
    Http.getMonthlyStats(params, (res) => {
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
            <div style={{ fontSize: "16px", color: "#3867D6", fontWeight: "bold" }}>{Language.YUEBAO}</div>
          </Flex>
          <DatePicker defaultValue={monthDate} value={monthDate} allowClear={false} picker="month" prefix={<CalendarOutlined />} suffixIcon={null} onChange={onChangeWeekPicker} />
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
            {/* <StayAnalysisChartPanel className="dual-row-content" data={stayAnalysisData} /> */}
            <WeekWorkAnalysisLineBarChartPanel className="dual-row-content" data={workWeekAnalysisData} />
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

export default MonthlyReport;
