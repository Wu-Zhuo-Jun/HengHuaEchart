import React, { useState, useEffect, use, useCallback } from "react";
import { FlowStatsPanel } from "@/components/common/panels/FlowStatsPanel";
import { Language, text } from "../../../language/LocaleContext";
import {
  VisitingPeakChartPanel,
  DoorRankingChartPanel,
  StayAnalysisChartPanel,
  GrowthRateChartPanel,
  CustomerAttrBarChartPanel,
  CustomerMoodRadarChartPanel,
  FlowTrendAnalysisPanelChartPanel,
} from "../../../components/common/panels/ChartPanel";
import { FlowSelect, UIContent, UIPanel, UISelect, ICPComponent, UIContentLoading } from "../../../components/ui/UIComponent";
import { DataTable } from "../../../components/common/tables/Table";
import { Tabs, DatePicker, Button, Flex, Select } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import Selection from "../../../common/Selection";
import TimeUtils from "../../../utils/TimeUtils";
import Constant from "../../../common/Constant";

import "./DailyReport.css";
import User from "../../../data/UserData";
import { useSite } from "../../../context/SiteContext";
import Http from "../../../config/Http";
import StringUtils from "@/utils/StringUtils";
import DataConverter from "@/data/DataConverter";
import ArrayUtils from "@/utils/ArrayUtils";
import { customerAgeColumns, customerMoodColumns, flowColumns } from "./components/TableColumns";
import { getCustomerAgeTableDataSource, getCustomerMoodtableDataSource, getSiteFlowStatsData } from "./model/Model";
import ExportUtils from "@/utils/ExportUtils";
import CommonUtils from "@/utils/CommonUtils";
import { columns } from "../outletAnalyse/components/TableDetailColumns";

const { RangePicker } = DatePicker;

const FlowTrendAnalysisExtra = React.memo(({ invertalTypeOptions, flowTypeOptions, onIntervalTypeChange, onFlowTypeChange }) => {
  return (
    <Flex gap="large" align="center">
      <UISelect options={invertalTypeOptions?.options} value={invertalTypeOptions?.value} style={{ width: "210px", height: "29px" }} onChange={onIntervalTypeChange} />
      <UISelect options={flowTypeOptions?.options} value={flowTypeOptions?.value} style={{ width: "210px", height: "29px" }} onChange={onFlowTypeChange} />
    </Flex>
  );
});

const DailyReport = () => {
  const { siteId, setSiteId, businessHours, businessHoursBy5Minutes } = useSite();

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
  ];
  const MULTIPLE_DAYS_OPTIONS = [
    { label: Language.ANTIAN, value: Constant.INTERVAL_TYPE.DAY },
    { label: Language.ANXIAOSHI, value: Constant.INTERVAL_TYPE.HOUR },
  ];
  const SINGLE_DAY_OPTIONS = [
    { label: Language.ANXIAOSHI, value: Constant.INTERVAL_TYPE.HOUR },
    { label: Language.ANWUFENZHONG, value: Constant.INTERVAL_TYPE.MINUTE },
  ];
  const FLOW_TYPE_OPTIONS = [
    { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
    { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    { label: Language.CHUCHANGRENCI, value: Constant.FLOW_TYPE.OUT_COUNT },
    { label: Language.KELIUPICI, value: Constant.FLOW_TYPE.BATCH_COUNT },
    { label: Language.JIKELI, value: Constant.FLOW_TYPE.COLLECT_COUNT },
    { label: Language.CHANGWAIKELIU, value: Constant.FLOW_TYPE.OUTSIDE_COUNT },
    { label: Language.JINCHANGLV, value: Constant.FLOW_TYPE.IN_RATE },
  ];
  const GROWTH_RATE_FLOW_TYPE_OPTIONS = [
    { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
    { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    { label: Language.KELIUPICI, value: Constant.FLOW_TYPE.BATCH_COUNT },
  ];
  const [timeType, setTimeType] = useState(Constant.TIME_TYPE.TODAY);
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
  const [customerAttrData, setCustomerAttrData] = useState(null);
  const [customerMoodData, setCustomerMoodData] = useState(null);
  const [flowTrendAnalysisData, setFlowTrendAnalysisData] = useState({
    chartData: null,
    data: null,
  });
  const [flowDetailTableData, setFlowDetailTableData] = useState(null);
  const [baseFaceData, setBaseFaceData] = useState(null);
  const [customerAgeTableData, setCustomerAgeTableData] = useState(null);
  const [customerMoodTableData, setCustomerMoodTableData] = useState(null);
  const [selectedBtn, setSelectedBtn] = useState("btn-today");
  const [rangePickerDate, setRangePickerDate] = useState(() => {
    let timeSlot = TimeUtils.getDayTimeSlotsByTs(TimeUtils.now());
    let clearTime = User.getSiteClearTime(User.selectedSiteId);
    timeSlot.startTime = timeSlot.startTime - clearTime;
    timeSlot.endTime = timeSlot.endTime - clearTime;
    return [dayjs(TimeUtils.ts2Date(timeSlot.startTime, "yyyy-MM-dd")), dayjs(TimeUtils.ts2Date(timeSlot.endTime, "yyyy-MM-dd"))];
  });
  const [intervalTypeOptions, setIntervalTypeOptions] = useState({
    options: SINGLE_DAY_OPTIONS,
    value: SINGLE_DAY_OPTIONS[0].value,
  });
  const [flowTypeOptions, setFlowTypeOptions] = useState({
    options: FLOW_TYPE_OPTIONS,
    value: FLOW_TYPE_OPTIONS[0].value,
  });
  const [growthRateFlowTypeOptions, setGrowthRateFlowTypeOptions] = useState({
    options: GROWTH_RATE_FLOW_TYPE_OPTIONS,
    value: GROWTH_RATE_FLOW_TYPE_OPTIONS[0].value,
  });
  const [tableInvertalType, setTableInvertalType] = useState({
    options: SINGLE_DAY_OPTIONS,
    value: SINGLE_DAY_OPTIONS[0].value,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (siteId) {
      let params = { timeType, siteId };
      if (timeType === Constant.TIME_TYPE.DATE) {
        let [startDate, endDate] = rangePickerDate;
        startDate = startDate.format("YYYY-MM-DD");
        endDate = endDate.format("YYYY-MM-DD");
        params = { ...params, startDate, endDate };
      }
      requestDailyStats(intervalTypeOptions.value, flowTypeOptions.value, params);
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
      children: (
        <div style={{ padding: 2 }}>
          <DataTable columns={flowColumns()} dataSource={flowDetailTableData ? flowDetailTableData.dataSource : []} />
        </div>
      ),
    },
    {
      key: "2",
      label: Language.NIANLINGSHUXING,
      children: (
        <div style={{ padding: 2 }}>
          <DataTable mergeColumns={["date"]} columns={customerAgeColumns()} dataSource={customerAgeTableData ? customerAgeTableData.dataSource : []} />
        </div>
      ),
    },
    {
      key: "3",
      label: Language.XINQINGSHUXING,
      children: (
        <div style={{ padding: 2 }}>
          <DataTable mergeColumns={["date"]} columns={customerMoodColumns()} dataSource={customerMoodTableData ? customerMoodTableData.dataSource : []} />
        </div>
      ),
    },
  ];

  const onIntervalTypeChange = useCallback(
    (value) => {
      setIntervalTypeOptions({
        options: intervalTypeOptions.options,
        value: value,
      });
      setSiteFlowTrendData(value, flowTypeOptions.value, flowTrendAnalysisData.data);
    },
    [flowTrendAnalysisData]
  );

  const onTableIntervalTypeChange = useCallback(
    (value) => {
      setTableInvertalType({
        options: SINGLE_DAY_OPTIONS,
        value: value,
      });
      setSiteDetailTableData(flowTrendAnalysisData.data, value);
      setSiteCustomerAgeTableData(baseFaceData, value);
      setSiteCustomerMoodTableData(baseFaceData, value);
    },
    [flowTrendAnalysisData, baseFaceData]
  );

  const onFlowTypeChange = useCallback(
    (value) => {
      setFlowTypeOptions({ ...flowTypeOptions, value: value });
      setSiteFlowTrendData(intervalTypeOptions.value, value, flowTrendAnalysisData.data);
    },
    [flowTrendAnalysisData]
  );

  const onChangeRangePicker = (dates, dateStrings) => {
    setRangePickerDate([dayjs(dateStrings[0]), dayjs(dateStrings[1])]);
  };

  const onChangeGrowthRateFlowType = useCallback((value) => {
    setSiteGrowthRateData(value, growthRateData.data);
  });

  const onClickQuery = () => {
    let [startDate, endDate] = rangePickerDate;
    startDate = startDate.format("YYYY-MM-DD");
    endDate = endDate.format("YYYY-MM-DD");
    let days = TimeUtils.getDaysDiffByDate(startDate, endDate) + 1;
    let intervalType = intervalTypeOptions.value;
    if (days > 1) {
      setIntervalTypeOptions({
        options: MULTIPLE_DAYS_OPTIONS,
        value: MULTIPLE_DAYS_OPTIONS[0].value,
      });
      setTableInvertalType({
        options: MULTIPLE_DAYS_OPTIONS.slice(0, 1), // 多天无需小时
        value: MULTIPLE_DAYS_OPTIONS[0].value,
      });
      intervalType = MULTIPLE_DAYS_OPTIONS[0].value;
    } else {
      setIntervalTypeOptions({
        options: SINGLE_DAY_OPTIONS,
        value: SINGLE_DAY_OPTIONS[0].value,
      });
      setTableInvertalType({
        options: SINGLE_DAY_OPTIONS,
        value: SINGLE_DAY_OPTIONS[0].value,
      });
      intervalType = SINGLE_DAY_OPTIONS[0].value;
    }
    setTimeType(Constant.TIME_TYPE.DATE);
    requestDailyStats(intervalType, flowTypeOptions.value, { timeType: Constant.TIME_TYPE.DATE, siteId, startDate, endDate });
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
    let [startDate, endDate] = rangePickerDate;
    startDate = startDate.format("YYYYMMDD");
    endDate = endDate.format("YYYYMMDD");
    const dateDesc = startDate === endDate ? startDate : `${startDate}-${endDate}`;
    const fileName = `${site.siteName}-${Language.KELIU}${Language.RIBAO}-${dateDesc}`;
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName });
  }, [flowDetailTableData, customerAgeTableData, customerMoodTableData]);

  const selectTimeType = (type) => {
    let slots = null;
    const clearTime = User.getSiteClearTime(siteId);
    const time = TimeUtils.now() - clearTime;
    let isMultipleDay = false;
    if (type == Constant.TIME_TYPE.TODAY) {
      slots = TimeUtils.getDayTimeSlotsByTs(time);
    } else if (type == Constant.TIME_TYPE.WEEK) {
      isMultipleDay = true;
      slots = TimeUtils.getWeekTimeSlotsByTs(time);
    } else if (type == Constant.TIME_TYPE.MONTH) {
      isMultipleDay = true;
      slots = TimeUtils.getMonthTimeSlotsByTs(time);
    }
    if (slots) {
      setRangePickerDate([dayjs(TimeUtils.ts2Date(slots.startTime, "yyyy-MM-dd")), dayjs(TimeUtils.ts2Date(slots.endTime, "yyyy-MM-dd"))]);
    }
    setTimeType(type);

    let intervalType = intervalTypeOptions.value;
    if (isMultipleDay) {
      setIntervalTypeOptions({
        options: MULTIPLE_DAYS_OPTIONS,
        value: MULTIPLE_DAYS_OPTIONS[0].value,
      });
      intervalType = MULTIPLE_DAYS_OPTIONS[0].value;
    } else {
      setIntervalTypeOptions({
        options: SINGLE_DAY_OPTIONS,
        value: SINGLE_DAY_OPTIONS[0].value,
      });
      intervalType = SINGLE_DAY_OPTIONS[0].value;
    }

    requestDailyStats(intervalType, flowTypeOptions.value, { timeType: type, siteId });
  };

  const setSiteFlowStatsData = (data) => {
    let site = User.getSite(siteId);
    let area = Number(site.area);
    let statsData = getSiteFlowStatsData(data, area);
    setFlowStatsData(statsData);
  };

  const setSiteFlowTrendData = (intervalType, flowType, data) => {
    const list = [...data.list];
    const clearTime = data.clearTime;
    const startTime = list[0].startTime;
    const endTime = list[0].endTime;
    const multipleDay = endTime - startTime > 86400 ? true : false;
    //因为有清0时间所以计算相差天数时需要减去清0时间获取实际的开始结束年月日
    const days = multipleDay ? TimeUtils.getDaysDiffByTs(startTime - clearTime, endTime - clearTime) + 1 : 1;

    const dateFormatMap = {
      [Constant.INTERVAL_TYPE.MINUTE]: "HH:mm",
      [Constant.INTERVAL_TYPE.HOUR]: "MM-dd HH:00",
      [Constant.INTERVAL_TYPE.DAY]: "MM-dd",
    };
    const rangeFuncMap = {
      [Constant.INTERVAL_TYPE.MINUTE]: TimeUtils.getTs5MinuteRangeByTs,
      [Constant.INTERVAL_TYPE.HOUR]: TimeUtils.getTsHourRangeByTs,
      [Constant.INTERVAL_TYPE.DAY]: TimeUtils.getTsDayRangeByTs,
    };
    const flowTypeDescMap = {
      [Constant.FLOW_TYPE.IN_COUNT]: Language.JINCHANGRENCI,
      [Constant.FLOW_TYPE.IN_NUM]: Language.JINCHANGRENSHU,
      [Constant.FLOW_TYPE.BATCH_COUNT]: Language.KELIUPICI,
      [Constant.FLOW_TYPE.OUT_COUNT]: Language.CHUCHANGRENCI,
      [Constant.FLOW_TYPE.OUTSIDE_COUNT]: Language.CHANGWAIKELIU,
      [Constant.FLOW_TYPE.COLLECT_COUNT]: Language.JIKELI,
      [Constant.FLOW_TYPE.IN_RATE]: Language.JINCHANGLV,
    };
    const tmpData = {
      inCount: 0,
      inNum: 0,
      outCount: 0,
      batchCount: 0,
      outsideCount: 0,
    };
    const xAxis = [];
    const dataTimeList = [];
    const series = [];
    for (let i = 0; i < list.length; i++) {
      let item = list[i];
      let totalData = item.total;
      let outsideData = item.outside;
      let startTime = item.startTime;
      let endTime = item.endTime;
      let dataMap = {};
      let dataArr = [];

      for (let j = 0; j < totalData.length; j++) {
        let dataItem = totalData[j];
        let dataTime = dataItem.dataTime;
        if (intervalType == Constant.INTERVAL_TYPE.HOUR) {
          dataTime = Math.floor(dataTime / 3600) * 3600;
        } else if (intervalType == Constant.INTERVAL_TYPE.DAY) {
          //因为有清0时间所以计算相差天数时需要减去清0时间获取数据归属实际的年月日
          dataTime = dataTime - 3600 * clearTime;
          dataTime = TimeUtils.date2Ts(`${TimeUtils.ts2Date(dataTime)} 00:00:00`);
        }
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

        if (intervalType == Constant.INTERVAL_TYPE.HOUR) {
          dataTime = Math.floor(dataTime / 3600) * 3600;
        } else if (intervalType == Constant.INTERVAL_TYPE.DAY) {
          //因为有清0时间所以计算相差天数时需要减去清0时间获取数据归属实际的年月日
          dataTime = dataTime - 3600 * clearTime;
          dataTime = TimeUtils.date2Ts(`${TimeUtils.ts2Date(dataTime)} 00:00:00`);
        }
        if (dataMap[dataTime] == null) {
          dataMap[dataTime] = { ...tmpData };
        }
        dataMap[dataTime].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
      }

      let rangeFunc = rangeFuncMap[Constant.INTERVAL_TYPE.HOUR];
      let dateformatType = Constant.INTERVAL_TYPE.HOUR;
      let range = [];
      if (days <= 1) {
        if (intervalType == Constant.INTERVAL_TYPE.MINUTE || intervalType == Constant.INTERVAL_TYPE.HOUR) {
          dateformatType = intervalType;
          rangeFunc = rangeFuncMap[intervalType];
          range = rangeFunc(startTime, endTime, dateFormatMap[intervalType]);
        }
      } else {
        if (intervalType == Constant.INTERVAL_TYPE.DAY || intervalType == Constant.INTERVAL_TYPE.HOUR) {
          dateformatType = intervalType;
          rangeFunc = rangeFuncMap[intervalType];
          range = rangeFunc(startTime, endTime, dateFormatMap[intervalType]);
        }
      }
      series.push({ data: [] });

      for (let j = 0; j < range.length; j++) {
        let dataTime = range[j];
        if (i == 0) {
          dataTimeList.push(dataTime);
        }
        let dateStr = TimeUtils.ts2Date(dataTime, dateFormatMap[dateformatType]);
        if (i == 0) {
          xAxis.push(dateStr);
        }

        switch (flowType) {
          case Constant.FLOW_TYPE.IN_COUNT:
          case Constant.FLOW_TYPE.IN_NUM:
          case Constant.FLOW_TYPE.OUT_COUNT:
          case Constant.FLOW_TYPE.BATCH_COUNT:
          case Constant.FLOW_TYPE.OUTSIDE_COUNT:
            if (dataMap[dataTime] && dataMap[dataTime][flowType] > 0) {
              dataArr.push(dataMap[dataTime][flowType]);
            } else {
              dataArr.push(0);
            }
            break;
          case Constant.FLOW_TYPE.COLLECT_COUNT:
            let area = User.getSite(siteId).area;
            let collectCount = 0;
            if (dataMap[dataTime] && dataMap[dataTime].inCount > 0 && area > 0) {
              collectCount = StringUtils.toFixed(dataMap[dataTime].inCount / area, 2);
            }
            dataArr.push(collectCount);
            break;
          case Constant.FLOW_TYPE.IN_RATE:
            let inRate = 0;
            if (dataMap[dataTime]) {
              let inCount = dataMap[dataTime].inCount;
              let outsideCount = dataMap[dataTime].outsideCount;
              inRate = outsideCount > 0 ? StringUtils.toFixed((inCount / outsideCount) * 100, 2) : 0;
            }
            dataArr.push(inRate);
            break;
        }
      }
      series[i].data = dataArr;
    }

    //计算平均值
    let avg = 0;
    // const dataTime = data.dataTime;
    let isToday = false;
    if (days <= 1) {
      if (TimeUtils.ts2Date(startTime) == TimeUtils.ts2Date(endTime)) {
        isToday = true;
      }
    }

    // 现逻辑是无论多日还是单日,只要时间未发生都不算有效计算平均值和中位数
    const needToClearTailZero = CommonUtils.needToClearTailZero(endTime);

    //今日的平均值为当天有效营业时间数据/营业时间已过时间
    if (isToday) {
      const validDataArr =
        intervalType == Constant.INTERVAL_TYPE.MINUTE ? series[0].data?.slice(businessHoursBy5Minutes[0], businessHoursBy5Minutes[1]) : series[0].data?.slice(businessHours[0], businessHours[1]);
      // if (intervalType == Constant.INTERVAL_TYPE.MINUTE) {
      // let pass5Minutes = Math.ceil((dataTime - startTime) / 300);
      // pass5Minutes = pass5Minutes == 0 ? 1 : pass5Minutes;
      // const sum = ArrayUtils.getSumValue(series[0].data);
      // avg = StringUtils.toFixed(sum / pass5Minutes, 2);
      avg = ArrayUtils.getAverageValueClearTailZero(validDataArr);
      // } else {
      //   let passHours = Math.ceil((dataTime - startTime) / 3600);
      // passHours = passHours == 0 ? 1 : passHours;
      // const sum = ArrayUtils.getSumValue(series[0].data);
      // avg = StringUtils.toFixed(sum / passHours, 2);
      //   avg = ArrayUtils.getAverageValueClearTailZero(validDataArr);
      // }
    } else {
      if (needToClearTailZero) {
        avg = ArrayUtils.getAverageValueClearTailZero(series[0].data);
      } else {
        avg = ArrayUtils.getAverageValue(series[0].data);
      }
    }

    //计算中位数
    let sortArr = [...series[0].data];

    if (isToday) {
      sortArr = intervalType == Constant.INTERVAL_TYPE.MINUTE ? sortArr?.slice(businessHoursBy5Minutes[0], businessHoursBy5Minutes[1]) : sortArr?.slice(businessHours[0], businessHours[1]);
    }

    let medianValue = 0;
    if (needToClearTailZero) {
      medianValue = ArrayUtils.getMedianValueClearTailZero(sortArr, Constant.SORT.ASC);
    } else {
      medianValue = ArrayUtils.getMedianValue(sortArr, Constant.SORT.ASC);
    }
    //计算最大值
    let maxValue = ArrayUtils.getMaxValue(series[0].data);

    let minInterval = 1;
    //数据处理
    if (flowType != Constant.FLOW_TYPE.COLLECT_COUNT && flowType != Constant.FLOW_TYPE.IN_RATE) {
      medianValue = Math.ceil(medianValue);
      maxValue = Math.ceil(maxValue);
      avg = Math.ceil(avg);
    } else {
      medianValue = StringUtils.toFixed(medianValue, 2);
      maxValue = StringUtils.toFixed(maxValue, 2);
      avg = StringUtils.toFixed(avg, 2);
      minInterval = 0;
    }

    series[0].name = flowTypeDescMap[flowType];
    if (series.length > 1) {
      series[0].name = Language.DANGRI;
      series[1].name = Language.ZUORI;
      series[2].name = Language.SHANGZHOUTONGRI;
    }

    const chartData = {
      xAxis,
      series,
      avg,
      option: { yAxis: { minInterval: minInterval } },
      dataZoom: 1,
    };

    if (flowType == Constant.FLOW_TYPE.IN_RATE) {
      chartData.option.yAxis.axisLabel = { formatter: "{value}%" };
      const valueFormatter = (value) => {
        return value + "%";
      };
      chartData.option.tooltip = {
        valueFormatter: valueFormatter,
      };
    }

    var peakValueDesc = maxValue > 0 ? DataConverter.getFlowTypeDesc(maxValue, flowType) : Language.ZANWU;
    var medianDesc = medianValue > 0 || maxValue > 0 ? DataConverter.getFlowTypeDesc(medianValue, flowType) : Language.ZANWU;
    var avgDesc = avg > 0 ? DataConverter.getFlowTypeDesc(avg, flowType) : Language.ZANWU;
    let date = TimeUtils.ts2Date(startTime);

    if (days > 1) {
      date = `${date} ${Language.ZHI} ${TimeUtils.ts2Date(endTime)}`;
    }

    const maxValueIndex = ArrayUtils.getMaxValueIndex(series[0].data);
    const maxValueDataTime = dataTimeList[maxValueIndex];
    let peakTime = TimeUtils.ts2Date(maxValueDataTime);

    if (intervalType == Constant.INTERVAL_TYPE.MINUTE) {
      peakTime = TimeUtils.ts2Date(maxValueDataTime, "HH:mm");
    } else if (intervalType == Constant.INTERVAL_TYPE.HOUR) {
      peakTime = TimeUtils.ts2Date(maxValueDataTime, "MM-dd HH:mm");
      // const endPeakTime = TimeUtils.ts2Date(maxValueDataTime + 3600 - 1, "MM-dd HH:mm");
      const endPeakTime = TimeUtils.ts2Date(maxValueDataTime + 3600, "MM-dd HH:mm");
      peakTime = `${peakTime} - ${endPeakTime}`;
    }
    if (maxValue <= 0) {
      peakTime = Language.ZANWU;
    }

    const info = {
      date,
      peakValueDesc,
      peakTime,
      avgDesc,
      medianDesc,
    };
    const resData = {
      info,
      chartData,
      type: 1,
    };
    setFlowTrendAnalysisData({ chartData: resData, data: data });
  };

  const setSiteDetailTableData = (data, intervalType) => {
    const list = { ...data.list[0] };
    const totalData = list.total;
    const outsideData = list.outside;
    const clearTime = data.clearTime;
    const startTime = list.startTime;
    const endTime = list.endTime;
    const multipleDay = endTime - startTime > 86400 ? true : false;
    // 如果未传入intervalType，使用默认值（小时）
    if (!intervalType) {
      intervalType = Constant.INTERVAL_TYPE.HOUR;
    }
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
    let range = [];
    if (multipleDay) {
      // range = TimeUtils.getTsDayRangeByTs(startTime - clearTime*3600, endTime - clearTime*3600, "MM-dd");
      range = TimeUtils.getTsDayRangeByTs(startTime, endTime, "MM-dd");
    } else {
      // 单天情况下，根据intervalType选择不同的时间范围
      if (intervalType === Constant.INTERVAL_TYPE.MINUTE) {
        // 5分钟类型：从开始时间到结束时间，每5分钟生成一个时间戳
        // 开始时间对齐到5分钟的整数倍
        const alignedStartTime = Math.floor(startTime / 300) * 300;
        // 结束时间对齐到5分钟的整数倍（向下取整），确保最后一项是23:55
        let alignedEndTime = Math.floor(endTime / 300) * 300;
        // 获取当天的结束时间
        const dayEndTime = startTime + 86400;
        const maxEndTime = Math.floor(dayEndTime / 300) * 300;
        if (alignedEndTime > maxEndTime) {
          alignedEndTime = maxEndTime;
        }
        range = TimeUtils.getTsRangeByTs(alignedStartTime, alignedEndTime, 300);
      } else {
        // range = TimeUtils.getTsHourRangeByTs(startTime - clearTime*3600, endTime - clearTime*3600, "HH:mm");
        range = TimeUtils.getTsHourRangeByTs(startTime, endTime, "HH:mm");
      }
    }
    const dataMap = {};

    for (let j = 0; j < totalData.length; j++) {
      let dataItem = totalData[j];
      let dataTime = dataItem.dataTime;

      if (!multipleDay) {
        // 单天情况下，根据intervalType进行不同的时间对齐
        if (intervalType === Constant.INTERVAL_TYPE.MINUTE) {
          dataTime = Math.floor(dataTime / 300) * 300; // 5分钟对齐
        } else {
          dataTime = Math.floor(dataTime / 3600) * 3600; // 小时对齐
        }
      } else {
        //因为有清0时间所以计算相差天数时需要减去清0时间获取数据归属实际的年月日
        // dataTime = dataTime - 3600*clearTime;
        dataTime = TimeUtils.date2Ts(`${TimeUtils.ts2Date(dataTime)} 00:00:00`);
      }

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

      if (!multipleDay) {
        // 单天情况下，根据intervalType进行不同的时间对齐
        if (intervalType === Constant.INTERVAL_TYPE.MINUTE) {
          dataTime = Math.floor(dataTime / 300) * 300; // 5分钟对齐
        } else {
          dataTime = Math.floor(dataTime / 3600) * 3600; // 小时对齐
        }
      } else {
        //因为有清0时间所以计算相差天数时需要减去清0时间获取数据归属实际的年月日
        dataTime = dataTime - 3600 * clearTime;
        dataTime = TimeUtils.date2Ts(`${TimeUtils.ts2Date(dataTime)} 00:00:00`);
      }
      if (dataMap[dataTime] == null) {
        dataMap[dataTime] = { ...tmpData };
      }
      dataMap[dataTime].outsideCount += Number(dataItem[Constant.PROP.OS_IN_COUNT]) + Number(dataItem[Constant.PROP.OS_OUT_COUNT]);
    }

    let dataSource = [];
    let area = User.getSite(siteId).area;
    for (let j = 0; j < range.length; j++) {
      let rowData = { ...tmpRowData };
      rowData.key = j;
      let dataTime = range[j];
      rowData.dataTime = dataTime;
      if (multipleDay) {
        rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM-dd");
      } else {
        // 单天情况下，根据intervalType进行不同的日期格式化
        if (intervalType === Constant.INTERVAL_TYPE.MINUTE) {
          // 5分钟类型：显示为 "HH:mm - HH:mm"
          let endTime = dataTime + 300; // 5分钟后
          // 如果是23:55，结束时间显示为24:00
          if (TimeUtils.ts2Date(dataTime, "HH:mm") === "23:55") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        } else {
          // 小时类型：显示为 "HH:mm - HH:mm"
          let endTime = dataTime + 3600;
          if (TimeUtils.ts2Date(dataTime, "HH") == "23") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        }
      }
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

  const setSiteCustomerAgeTableData = (data, intervalType) => {
    const startTime = data.startTime;
    const endTime = data.endTime;
    const multipleDay = endTime - startTime >= 86400 ? true : false;
    const rangeType = multipleDay ? "day" : intervalType === Constant.INTERVAL_TYPE.MINUTE ? "minute" : "hour";
    const columns = customerAgeColumns();
    const dataSource = getCustomerAgeTableDataSource(data, rangeType);
    const tableData = {
      columns,
      dataSource,
    };
    setCustomerAgeTableData(tableData);
  };

  const setSiteCustomerMoodTableData = (data, intervalType) => {
    const startTime = data.startTime;
    const endTime = data.endTime;
    const multipleDay = endTime - startTime >= 86400 ? true : false;
    const rangeType = multipleDay ? "day" : intervalType === Constant.INTERVAL_TYPE.MINUTE ? "minute" : "hour";
    const columns = customerMoodColumns();
    const dataSource = getCustomerMoodtableDataSource(data, rangeType);
    const tableData = {
      columns,
      dataSource,
    };
    setCustomerMoodTableData(tableData);
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

  const setSiteCustomerAttrData = (data) => {
    let isUnknow = true;
    let chartData = DataConverter.getCustomerAttrConvertData(data);
    setCustomerAttrData(chartData);
  };

  const setSiteCustomeMoodData = (data) => {
    let chartData = DataConverter.getCustomerMoodConvertData(data);
    setCustomerMoodData(chartData);
  };

  const requestDailyStats = (intertalType, flowType, params) => {
    setLoading(true);
    params.siteId = siteId;
    Http.getDailyStats(
      params,
      (res) => {
        try {
          setSiteFlowStatsData(res.data.flowStats);
          setSiteVisitingPeakData(visitingPeakData.chartType, res.data.visitingPeak);
          setSiteDoorRankingData(res.data.doorsRanking);
          setSiteStayAnalysisData(res.data.stayAnalysis);
          setSiteGrowthRateData(growthRateData.flowType, res.data.growthRate);
          const faceData = DataConverter.getCustomerDataSumConverData(res.data.faceFlow.list);
          setSiteCustomerAttrData(faceData);
          setSiteCustomeMoodData(faceData);
          setSiteFlowTrendData(intertalType, flowType, res.data.flowTrend);
          setSiteDetailTableData(res.data.flowTrend, intertalType);
          setSiteCustomerAgeTableData(res.data.faceFlow, intertalType);
          setSiteCustomerMoodTableData(res.data.faceFlow, intertalType);
          setBaseFaceData(res.data.faceFlow);
          setLoading(false);
        } catch (error) {
          console.error("处理数据时发生错误:", error);
          setLoading(false);
        }
      },
      null,
      (error) => {
        console.error("请求失败:", error);
        setLoading(false);
      }
    );
  };

  return (
    <div className="main">
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
      <UIContentLoading loading={loading}>
        <div className="layout-content layout-content-noScroll">
          <FlowStatsPanel data={flowStatsData} yoyType={2} />
          <FlowTrendAnalysisPanelChartPanel
            style={{ width: "100%", height: "358px" }}
            data={flowTrendAnalysisData.chartData}
            extra={
              <FlowTrendAnalysisExtra invertalTypeOptions={intervalTypeOptions} flowTypeOptions={flowTypeOptions} onIntervalTypeChange={onIntervalTypeChange} onFlowTypeChange={onFlowTypeChange} />
            }
          />
          <div className="dual-row">
            <VisitingPeakChartPanel className="dual-row-content" data={visitingPeakData?.chartData} type={visitingPeakData?.chartType} onChange={onChangeVisitingPeakChartType} />
            <DoorRankingChartPanel className="dual-row-content" data={doorRankingData} />
          </div>
          <div className="dual-row">
            <CustomerAttrBarChartPanel className="dual-row-content" data={customerAttrData} />
            <CustomerMoodRadarChartPanel className="dual-row-content" data={customerMoodData} />
          </div>
          <div className="dual-row">
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
                <Flex gap="large" align="center">
                  <UISelect options={tableInvertalType?.options} value={tableInvertalType.value} style={{ width: "210px", height: "29px" }} onChange={onTableIntervalTypeChange} />
                  <Button type="primary" className="table-detail-export-button" onClick={onClickExport}>
                    {Language.DAOCHUSHUJU}
                  </Button>
                </Flex>
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

export default DailyReport;
