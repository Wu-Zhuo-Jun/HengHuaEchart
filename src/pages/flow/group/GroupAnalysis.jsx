import React, { useState, useEffect, use, useMemo, useCallback } from "react";
import { FlowStatsPanel } from "../../../components/common/panels/FlowStatsPanel";
import {
  GroupFlowCompareLineChartPanel,
  WeekWorkAnalysisLineBarChartPanel,
  SiteHeatMapChartPanel,
  CustomerAttrBarChartPanel,
  CustomerMoodRadarChartPanel,
  CustomerPortraitCompareBarChartPanel,
  CustomerMoodCompareBarChartPanel,
  CompetitiveAnalysisScatterChartPanel,
} from "../../../components/common/panels/ChartPanel";
import { GroupSiteRankingPanel } from "../../../components/common/panels/StatsPanel";
import { Language } from "../../../language/LocaleContext";
import { FlowDetailTable } from "../../../components/common/tables/Table";
import { Button, Flex, Select, Table, Tabs, TreeSelect } from "antd";

import "../../../assets/styles/public.css";
import styles from "./GroupAnalysis.module.css";
import { FlowSelect, UIContent, UIContentLoading, UIPanel, UITable } from "../../../components/ui/UIComponent";
import { DataTable } from "../../../components/common/tables/Table";
import TimeUtils from "../../../utils/TimeUtils";
import TableUtils from "../../../utils/TableUtils";
import { TimeGranulePicker } from "@/components/common/timeGranulePicker";
import Http from "@/config/Http";
import ArrayUtils from "@/utils/ArrayUtils";
import Empty from "@/components/common/Empty";
import dayjs from "dayjs";
import Constant from "@/common/Constant";
import User, { UserData } from "@/data/UserData";
import StringUtils from "@/utils/StringUtils";
import DataConverter from "@/data/DataConverter";
import { FlowLineChart } from "@/components/common/charts/Chart";
import { customerAgeColumns, customerMoodColumns, flowColumns } from "./components/TableColumns";
import { getCustomerAgeTableDataSource, getCustomerMoodtableDataSource } from "./model/Model";
import Message from "@/components/common/Message";
import ExportUtils from "@/utils/ExportUtils";
import { GroupAnalysisHeatMapChartPanel } from "./components/Charts";
import CommonUtils from "@/utils/CommonUtils";

const GroupAnalysis = () => {
  const [flowStatsData, setFlowStatsData] = useState([]);
  const [siteHeatMapData, setSiteHeatMapData] = useState(null);
  const [customerAttrData, setCustomerAttrData] = useState(null);
  const [customerMoodData, setCustomerMoodData] = useState(null);
  const [flowDetailTableData, setFlowDetailTableData] = useState(null);
  const [customerAgeTableData, setCustomerAgeTableData] = useState(null);
  const [customerMoodTableData, setCustomerMoodTableData] = useState(null);
  const [queryTime, setQueryTime] = useState(0);
  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]);
  const [empty, setEmpty] = useState(true);
  const [loading, setLoading] = useState(false);
  const [groupOptions, setGroupOptions] = useState([]);
  const [groupMap, setGroupMap] = useState({});
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [clearTime, setClearTime] = useState(null);
  const [groupClearTimeMap, setGroupClearTimeMap] = useState(UserData.groupClearTimeMap);
  const [flowTrendData, setFlowTrendData] = useState(null);
  const [faceTrendData, setFaceTrendData] = useState(null);
  const [compareSitesMap, setCompareSitesMap] = useState({});
  const [rankingSort, setRankingSort] = useState(1);
  const FLOW_TYPE_OPTIONS = [
    { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
    { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    { label: Language.KELIUPICI, value: Constant.FLOW_TYPE.BATCH_COUNT },
  ];
  const [selectedFlowType, setSelectedFlowType] = useState(Constant.FLOW_TYPE.IN_COUNT);
  const initData = () => {
    requestGetGroupSelection();
    setCustomerAttrData(getCustomeAttrData());
    setCustomerMoodData(getCustomeMoodData());
    // setFlowDetailTableData(getFlowDetailsData());
    // setCustomerAgeTableData(getCustomerAgeTableData());
    // setCustomerMoodTableData(getCustomerMoodTableData());
  };

  useEffect(() => {
    initData();
  }, []);

  const clearTimeOptions = useMemo(() => {
    const map = groupClearTimeMap || {};
    const includeAll = selectedGroups.some((obj) => obj.value === "all");
    const groups = includeAll ? Object.keys(map).map((groupId) => ({ value: groupId })) : selectedGroups.filter((obj) => obj.value !== "all");

    const clearTimeSet = new Set();
    groups.forEach((group) => {
      const times = map[group.value];
      if (Array.isArray(times)) times.forEach((t) => clearTimeSet.add(Math.floor(Number(t))));
    });
    const options = [...clearTimeSet]
      .sort((a, b) => a - b)
      .map((hour) => {
        const str = String(hour).padStart(2, "0") + ":00";
        return { label: str, value: hour };
      });
    return options;
  }, [selectedGroups, groupOptions]);

  const getSiteGroupParentNames = (groupId) => {
    const group = ArrayUtils.findTreeNode(groupOptions, groupId, "groupId");
    return group ? [...group.parentNames.concat(group.groupName)].join("-") : Language.WEIFENPEIJIEDIAN;
  };

  const getGroupNames = () => {
    const groupNames = [];
    for (let i = 0; i < selectedGroups.length; i++) {
      const groupId = selectedGroups[i].value;
      if (groupMap[groupId]) {
        groupNames.push(groupMap[groupId]);
      }
    }
    const names = groupNames.join(",");
    return names;
  };

  const sitesRankingList = useMemo(() => {
    const totalTrend = flowTrendData?.total || [];
    const outsideTrend = flowTrendData?.outside || [];
    const faceTrend = faceTrendData || [];
    const createItem = (siteId) => {
      return {
        key: siteId,
        [Constant.FLOW_TYPE.IN_COUNT]: 0,
        [Constant.FLOW_TYPE.IN_NUM]: 0,
        [Constant.FLOW_TYPE.BATCH_COUNT]: 0,
        [Constant.FLOW_TYPE.COLLECT_COUNT]: 0,
        [Constant.FLOW_TYPE.OUTSIDE_COUNT]: 0,
        [Constant.FLOW_TYPE.IN_RATE]: 0,
        gender: [0, 0, 0],
      };
    };

    const columns = [
      { title: Language.PAIMING, key: "ranking" },
      { title: Language.SUOSHUJITUAN, key: "groupName" },
      { title: Language.CHANGDIMINGMINGCHENG, key: "siteName" },
      { title: Language.XINGBIEFENBU, key: "genderRate" },
      { title: Language.JINCHANGRENCI, key: Constant.FLOW_TYPE.IN_COUNT },
      { title: Language.JINCHANGRENSHU, key: Constant.FLOW_TYPE.IN_NUM },
      { title: Language.KELIUPICI, key: Constant.FLOW_TYPE.BATCH_COUNT },
      { title: Language.JIKELIPINGFANG, key: Constant.FLOW_TYPE.COLLECT_COUNT },
      { title: Language.CHANGWAIKELIU, key: Constant.FLOW_TYPE.OUTSIDE_COUNT },
      { title: Language.JINCHANGLV, key: Constant.FLOW_TYPE.IN_RATE },
    ];

    let dataMap = {};
    for (let i = 0; i < totalTrend.length; i++) {
      const fData = totalTrend[i];
      if (!dataMap[fData.siteId]) {
        dataMap[fData.siteId] = createItem(fData.siteId);
      }
      dataMap[fData.siteId][Constant.FLOW_TYPE.IN_COUNT] += fData[Constant.PROP.IN_COUNT];
      dataMap[fData.siteId][Constant.FLOW_TYPE.IN_NUM] += fData[Constant.PROP.IN_NUM];
      dataMap[fData.siteId][Constant.FLOW_TYPE.BATCH_COUNT] += fData[Constant.PROP.BATCH_COUNT];
    }

    for (let i = 0; i < outsideTrend.length; i++) {
      const fData = outsideTrend[i];
      if (!dataMap[fData.siteId]) {
        dataMap[fData.siteId] = createItem(fData.siteId);
      }
      dataMap[fData.siteId][Constant.FLOW_TYPE.OUTSIDE_COUNT] += fData[Constant.PROP.OS_IN_COUNT] + fData[Constant.PROP.OS_OUT_COUNT];
    }

    for (let i = 0; i < faceTrend.length; i++) {
      const fData = faceTrend[i];
      const gender = fData.gender;
      const count = fData.count;
      const siteId = fData.siteId;
      if (!dataMap[siteId]) {
        dataMap[siteId] = createItem(siteId);
      }
      dataMap[siteId].gender[gender - 1] += count;
    }

    const dataSource = Object.values(dataMap).map((item) => {
      const inCount = item[Constant.FLOW_TYPE.IN_COUNT];
      const outsideCount = item[Constant.FLOW_TYPE.OUTSIDE_COUNT];
      const inRateVal = inCount > 0 ? (outsideCount > 0 ? (inCount / outsideCount) * 100 : 100) : 0;
      const site = compareSitesMap[item.key];
      const male = item.gender[0];
      const female = item.gender[1];
      const unknow = item.gender[2];
      const gender = male + female;
      const maleRate = gender > 0 ? (male / gender) * 100 : 0;
      const femaleRate = gender > 0 ? (female / gender) * 100 : 0;
      item.genderRate = {
        maleRate: StringUtils.toFixed(maleRate, 2),
        femaleRate: StringUtils.toFixed(femaleRate, 2),
        unknowRate: 0,
      };
      if (site) {
        const area = site.area;
        item[Constant.FLOW_TYPE.COLLECT_COUNT] = StringUtils.toFixed(inCount / area, 2);
        item.groupName = site.groupName;
        item.siteName = site.siteName;
      }
      item[Constant.FLOW_TYPE.IN_RATE] = `${StringUtils.toFixed(inRateVal, 2)}%`;
      return item;
    });

    dataSource
      .sort((a, b) => {
        return rankingSort == 1 ? b[Constant.FLOW_TYPE.IN_COUNT] - a[Constant.FLOW_TYPE.IN_COUNT] : a[Constant.FLOW_TYPE.IN_COUNT] - b[Constant.FLOW_TYPE.IN_COUNT];
      })
      .map((item, index) => {
        item.ranking = index + 1;
        return item;
      });

    return { columns, dataSource: dataSource.slice(0, 10) };
  }, [flowTrendData, faceTrendData, compareSitesMap, rankingSort]);

  const workWeekAnalysisData = useMemo(() => {
    const flowTrend = flowTrendData?.total || [];
    const startTime = flowTrendData?.startTime || 0;
    const endTime = flowTrendData?.endTime || 0;
    const [data1, data2, data3] = [
      [0, 0],
      [0, 0],
      [0, 0],
    ];
    const xAxis = [Language.GONGZUORI, Language.ZHOUMO];
    let workDays = 0;
    let weekendDays = 0;
    let time = startTime;
    while (time <= endTime) {
      const week = TimeUtils.getWeekByTs(time);
      if (week === 6 || week === 7) {
        weekendDays++;
      } else {
        workDays++;
      }
      time += 86400;
    }
    for (let i = 0; i < flowTrend.length; i++) {
      const dataItem = flowTrend[i];
      const dataTime = dataItem.dataTime;
      const week = TimeUtils.getWeekByTs(dataTime);
      const inCount = Number(dataItem.inCount);
      const inNum = Number(dataItem.inNum);
      const batchCount = Number(dataItem.batchCount);
      if (week == 6 || week == 7) {
        data1[1] += inCount;
        data2[1] += inNum;
        data3[1] += batchCount;
      } else {
        data1[0] += inCount;
        data2[0] += inNum;
        data3[0] += batchCount;
      }
    }
    for (let i = 0; i < data1.length; i++) {
      const days = i == 0 ? workDays : weekendDays;
      data1[i] = Math.ceil(data1[i] / days);
      data2[i] = Math.ceil(data2[i] / days);
      data3[i] = Math.ceil(data3[i] / days);
    }
    let data = {
      xAxis,
      data1,
      data2,
      data3,
    };
    return data;
  }, [flowTrendData]);

  const getHeatMapData = useMemo(() => {
    const total = flowTrendData?.total;
    const startTime = flowTrendData?.startTime || 0;
    const endTime = flowTrendData?.endTime || 0;
    const multipleDay = endTime - startTime >= 86400 ? true : false;
    const rangeType = multipleDay ? "day" : "hour";
    if (!total) {
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [] };
    }
    let yAxis = [];
    const timeRange = [TimeUtils.dateTime2Dayjs(TimeUtils.getDateTimeFromTs(startTime)), TimeUtils.dateTime2Dayjs(TimeUtils.getDateTimeFromTs(endTime))];
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRangeForHeatMap(timeRange, rangeType);
    xAxis.unshift(Language.HEJI);
    const siteMap = {};
    for (let i = 0; i < total.length; i++) {
      const item = total[i];
      if (!siteMap[item.siteId]) {
        const siteData = {
          siteId: item.siteId,
          total: 0,
          siteName: compareSitesMap[item.siteId] ? compareSitesMap[item.siteId].siteName : "",
          dataMap: {},
        };
        siteMap[item.siteId] = siteData;
      }
      const dataTime = item.dataTime;
      const value = item.hasOwnProperty(selectedFlowType) ? item[selectedFlowType] : 0;
      let dateStr = "";
      if (rangeType == "day") {
        dateStr = TimeUtils.ts2Date(dataTime, "MM-dd");
      } else if (rangeType == "hour") {
        dateStr = TimeUtils.ts2Date(dataTime, "HH:00");
      }
      if (!siteMap[item.siteId].dataMap[dateStr]) {
        siteMap[item.siteId].dataMap[dateStr] = 0;
      }
      siteMap[item.siteId].dataMap[dateStr] += value;
      siteMap[item.siteId].total += value;
    }
    const siteArr = Object.values(siteMap);
    const series = [];
    for (let i = 0; i < siteArr.length; i++) {
      yAxis.push(siteArr[i].siteName);
    }
    for (let i = 0; i < xAxis.length; i++) {
      for (let j = 0; j < siteArr.length; j++) {
        let value = 0;
        if (i == 0) {
          value = siteArr[j].total;
        } else {
          value = siteArr[j]?.dataMap[xAxis[i]] ? siteArr[j].dataMap[xAxis[i]] : 0;
        }
        series.push([j, i, value]);
      }
    }
    return { xAxis, yAxis, series, xAxisTooltips };
  }, [flowTrendData, compareSitesMap, selectedFlowType]);

  const getCustomeAttrData = () => {
    var customerAttr = {
      maleData: [20, 302, 400, 300, 50, 70, 100],
      femaleData: [10, 100, 60, 300, 150, 30, 40],
      maleRate: 30,
      femaleRate: 70,
    };
    return customerAttr;
  };

  const getCustomeMoodData = () => {
    var customerMood = {
      unknowData: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ],
      maleData: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ],
      femaleData: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ],
    };
    return customerMood;
  };

  const siteCustomerPortraitData = useMemo(() => {
    const faceTrend = faceTrendData || [];
    let siteMap = {};
    const ageAttrMap = {
      1: 0,
      2: 1,
      4: 2,
      5: 3,
      6: 4,
      7: 5,
    };
    for (let i = 0; i < faceTrend.length; i++) {
      const fData = faceTrend[i];
      const face = fData.face;
      const age = fData.age;
      const gender = fData.gender;
      const count = fData.count;
      const dataTime = fData.dataTime;
      const siteId = fData.siteId;
      let siteFaceData = siteMap[siteId];
      if (!siteFaceData) {
        siteFaceData = {
          gender: [0, 0, 0],
          age: [0, 0, 0, 0, 0, 0],
          genderTotal: 0,
          ageTotal: 0,
        };
        const site = compareSitesMap[siteId];
        siteFaceData.siteName = site ? site.siteName : "";
        siteMap[siteId] = siteFaceData;
      }
      siteFaceData.gender[gender - 1] += count;
      siteFaceData.genderTotal += count;
      siteFaceData.age[ageAttrMap[age]] += count;
      siteFaceData.ageTotal += count;
    }

    const siteFaceDataArr = Object.values(siteMap) || [];
    const siteNameArr = siteFaceDataArr.map((item) => item.siteName);
    const genderAttrs = [
      { title: Language.NAN, gender: 0 },
      { title: Language.NV, gender: 1 },
      { title: Language.WEIZHI, gender: 2 },
    ];
    const ageAttrs = [
      { title: Language.YINGER, age: 0 },
      { title: Language.ERTONG, age: 1 },
      { title: Language.QINGNIAN, age: 2 },
      { title: Language.ZHUANGNIAN, age: 3 },
      { title: Language.ZHONGLAONIAN, age: 4 },
      { title: Language.WEIZHI, age: 5 },
    ];

    const genderArr = [];
    for (let i = 0; i < genderAttrs.length; i++) {
      const gender = genderAttrs[i];
      const data = {
        title: gender.title,
        data: [],
      };
      siteFaceDataArr.map((faceData) => {
        data.data.push(faceData.gender[gender.gender]);
      });
      genderArr.push(data);
    }

    const ageArr = [];
    for (let i = 0; i < ageAttrs.length; i++) {
      const age = ageAttrs[i];
      const data = {
        title: age.title,
        data: [],
      };
      siteFaceDataArr.map((faceData) => {
        data.data.push(faceData.age[age.age]);
      });
      ageArr.push(data);
    }
    const data = { site: siteNameArr, gender: genderArr, age: ageArr };
    return data;
  }, [faceTrendData, compareSitesMap]);

  const siteCustomerMoodData = useMemo(() => {
    const faceTrend = faceTrendData || [];
    let siteMap = {};
    for (let i = 0; i < faceTrend.length; i++) {
      const fData = faceTrend[i];
      const face = fData.face;
      const age = fData.age;
      const gender = fData.gender;
      const count = fData.count;
      const dataTime = fData.dataTime;
      const siteId = fData.siteId;
      let siteFaceData = siteMap[siteId];
      if (!siteFaceData) {
        siteFaceData = {
          male: [0, 0, 0, 0, 0, 0, 0, 0, 0],
          female: [0, 0, 0, 0, 0, 0, 0, 0, 0],
          maleTotal: 0,
          femaleTotal: 0,
        };
        const site = compareSitesMap[siteId];
        siteFaceData.siteName = site ? site.siteName : "";
        siteMap[siteId] = siteFaceData;
      }
      if (gender == 1) {
        siteFaceData.male[age - 1] += count;
        siteFaceData.maleTotal += count;
      } else if (gender == 2) {
        siteFaceData.female[age - 1] += count;
        siteFaceData.femaleTotal += count;
      }
    }

    const siteFaceDataArr = Object.values(siteMap) || [];
    const siteNameArr = siteFaceDataArr.map((item) => item.siteName);

    const faceAttrs = [
      { title: Language.FENNU, face: 0 },
      { title: Language.KUNHUO, face: 1 },
      { title: Language.GAOXIN, face: 2 },
      { title: Language.PINGJING, face: 3 },
      { title: Language.JINGYA, face: 4 },
      { title: Language.HAIPA, face: 5 },
      { title: Language.YANWU, face: 6 },
      { title: Language.BEISHANG, face: 7 },
      { title: Language.WEIZHI, face: 8 },
    ];

    const maleArr = [];
    const femaleArr = [];
    for (let i = 0; i < faceAttrs.length; i++) {
      const face = faceAttrs[i];
      const maleData = {
        title: face.title,
        data: [],
      };
      const femaleData = {
        title: face.title,
        data: [],
      };
      siteFaceDataArr.map((faceData) => {
        maleData.data.push(faceData.male[face.face]);
        femaleData.data.push(faceData.female[face.face]);
      });
      maleArr.push(maleData);
      femaleArr.push(femaleData);
    }
    return { site: siteNameArr, male: maleArr, female: femaleArr };
  }, [faceTrendData, compareSitesMap]);

  const getFlowDetailsData = useMemo(() => {
    const totalData = flowTrendData?.total || [];
    const outsideData = flowTrendData?.outside || [];
    const clearTime = flowTrendData?.clearTime || 0;
    const startTime = flowTrendData?.startTime || 0;
    const endTime = flowTrendData?.endTime || 0;
    const multipleDay = endTime - startTime > 86400 ? true : false;
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
      range = TimeUtils.getTsDayRangeByTs(startTime, endTime, "MM-dd");
    } else {
      range = TimeUtils.getTsHourRangeByTs(startTime, endTime, "HH:mm");
    }
    const dataMap = {};
    for (let j = 0; j < totalData.length; j++) {
      let dataItem = totalData[j];
      let dataTime = dataItem.dataTime;

      if (!multipleDay) {
        dataTime = Math.floor(dataTime / 3600) * 3600; // 小时对齐
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
        dataTime = Math.floor(dataTime / 3600) * 3600; // 小时对齐
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
    let area = flowStatsData?.area || 0;
    for (let j = 0; j < range.length; j++) {
      let rowData = { ...tmpRowData };
      rowData.key = j;
      let dataTime = range[j];
      rowData.dataTime = dataTime;
      if (multipleDay) {
        rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM-dd");
      } else {
        // 小时类型：显示为 "HH:mm - HH:mm"
        let endTime = dataTime + 3600;
        if (TimeUtils.ts2Date(dataTime, "HH") == "23") {
          rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
        } else {
          rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
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
    dataSource.map((item) => {
      item.groupName = getGroupNames();
      return item;
    });
    return dataSource;
  }, [flowTrendData, flowStatsData]);

  const getCustomerAgeTableData = useMemo(() => {
    const list = faceTrendData || [];
    const startTime = flowTrendData?.startTime || 0;
    const endTime = flowTrendData?.endTime || 0;
    const multipleDay = endTime - startTime >= 86400 ? true : false;
    const rangeType = multipleDay ? "day" : "hour";
    const dataSource = getCustomerAgeTableDataSource({ list, startTime, endTime }, rangeType);
    dataSource.map((item) => {
      item.groupName = getGroupNames();
      return item;
    });
    return dataSource;
  }, [flowTrendData, faceTrendData]);

  const getCustomerMoodTableData = useMemo(() => {
    const list = faceTrendData || [];
    const startTime = flowTrendData?.startTime || 0;
    const endTime = flowTrendData?.endTime || 0;
    const multipleDay = endTime - startTime >= 86400 ? true : false;
    const rangeType = multipleDay ? "day" : "hour";
    const dataSource = getCustomerMoodtableDataSource({ list, startTime, endTime }, rangeType);
    dataSource.map((item) => {
      item.groupName = getGroupNames();
      return item;
    });
    return dataSource;
  }, [flowTrendData, faceTrendData]);

  const onClickExport = useCallback(() => {
    const _flowColumns = flowColumns();
    const _customerAgeColumns = customerAgeColumns();
    const _customerMoodColumns = customerMoodColumns();
    const exportDataArray = [
      {
        columns: _flowColumns,
        title: Language.KELIUMINGXI,
        dataSource: getFlowDetailsData,
      },
      {
        columns: _customerAgeColumns,
        title: Language.NIANLINGSHUXING,
        dataSource: getCustomerAgeTableData.map((item) => {
          return {
            ...item,
            gender: item.gender === 1 ? Language.NAN : Language.NV,
          };
        }),
      },
      {
        columns: _customerMoodColumns,
        title: Language.XINQINGSHUXING,
        dataSource: getCustomerMoodTableData.map((item) => {
          return {
            ...item,
            gender: item.gender === 1 ? Language.NAN : Language.NV,
          };
        }),
      },
    ];

    let [startDate, endDate] = timeRange;
    startDate = startDate.format("YYYYMMDD");
    endDate = endDate.format("YYYYMMDD");
    const dateDesc = startDate === endDate ? startDate : `${startDate}-${endDate}`;
    const fileName = `${Language.JITUANFENXI}-${dateDesc}`;
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName });
  }, [flowTrendData, faceTrendData, groupOptions, groupMap]);

  /** 集团选项转换（与 SiteManagement 保持一致，使用 getGroupSelection 接口） */
  const transformToOptions = (data) => {
    const options = data.map((item) => {
      item.label = item.groupName;
      item.title = item.groupName;
      item.value = item.groupId;
      return item;
    });
    options.push({ label: Language.WEIFENPEIJIEDIAN, title: Language.WEIFENPEIJIEDIAN, value: "0" });
    return options;
  };

  const siteFlowStatsData = useMemo(() => {
    const curFlow = flowStatsData?.curFlow || [];
    const lastFlow = flowStatsData?.lastFlow || [];
    const sameFlow = flowStatsData?.sameFlow || [];
    const area = flowStatsData?.area || 1;
    let statsType = [Constant.FLOW_TYPE.IN_COUNT, Constant.FLOW_TYPE.IN_NUM, Constant.FLOW_TYPE.BATCH_COUNT];
    if (User.checkMasterPermission(Constant.MASTER_POWER.OUT_COUNT)) {
      statsType = [...statsType, Constant.FLOW_TYPE.OUT_COUNT];
    }
    statsType = [...statsType, Constant.FLOW_TYPE.OUTSIDE_COUNT, Constant.FLOW_TYPE.COLLECT_COUNT, Constant.FLOW_TYPE.IN_RATE];
    let statsData = [];

    for (let i = 0; i < statsType.length; i++) {
      let type = statsType[i];
      let item = { val: 0, qoq: 0, yoy: 0, type };
      let val = 0,
        curVal = 0,
        lastVal = 0,
        sameVal = 0;
      if (type == Constant.FLOW_TYPE.IN_COUNT) {
        curVal = Number(curFlow[Constant.PROP.IN_COUNT]);
        lastVal = Number(lastFlow[Constant.PROP.IN_COUNT]);
        if (sameFlow) {
          sameVal = Number(sameFlow[Constant.PROP.IN_COUNT]);
        }
        val = curVal;
      } else if (type == Constant.FLOW_TYPE.IN_NUM) {
        curVal = Number(curFlow[Constant.PROP.IN_NUM]);
        lastVal = Number(lastFlow[Constant.PROP.IN_NUM]);
        if (sameFlow) {
          sameVal = Number(sameFlow[Constant.PROP.IN_NUM]);
        }
        val = curVal;
      } else if (type == Constant.FLOW_TYPE.BATCH_COUNT) {
        curVal = Number(curFlow[Constant.PROP.BATCH_COUNT]);
        lastVal = Number(lastFlow[Constant.PROP.BATCH_COUNT]);
        if (sameFlow) {
          sameVal = Number(sameFlow[Constant.PROP.BATCH_COUNT]);
        }
        val = curVal;
      } else if (type == Constant.FLOW_TYPE.OUT_COUNT) {
        curVal = Number(curFlow[Constant.PROP.OUT_COUNT]);
        lastVal = Number(lastFlow[Constant.PROP.OUT_COUNT]);
        if (sameFlow) {
          sameVal = Number(sameFlow[Constant.PROP.OUT_COUNT]);
        }
        val = curVal;
      } else if (type == Constant.FLOW_TYPE.OUTSIDE_COUNT) {
        curVal = Number(curFlow[Constant.PROP.OS_IN_COUNT]) + Number(curFlow[Constant.PROP.OS_OUT_COUNT]);
        lastVal = Number(lastFlow[Constant.PROP.OS_IN_COUNT]) + Number(lastFlow[Constant.PROP.OS_OUT_COUNT]);
        if (sameFlow) {
          sameVal = Number(sameFlow[Constant.PROP.OS_IN_COUNT]) + Number(sameFlow[Constant.PROP.OS_OUT_COUNT]);
        }
        val = curVal;
      } else if (type == Constant.FLOW_TYPE.COLLECT_COUNT) {
        curVal = StringUtils.toFixed(Number(curFlow[Constant.PROP.IN_COUNT]) / area, 2);
        lastVal = StringUtils.toFixed(Number(lastFlow[Constant.PROP.IN_COUNT]) / area, 2);
        if (sameFlow) {
          sameVal = StringUtils.toFixed(Number(sameFlow[Constant.PROP.IN_COUNT]) / area, 2);
        }
        val = curVal;
      } else if (type == Constant.FLOW_TYPE.IN_RATE) {
        let curInCount = Number(curFlow[Constant.PROP.IN_COUNT]);
        let lastInCount = Number(lastFlow[Constant.PROP.IN_COUNT]);
        let curOutsideCount = Number(curFlow[Constant.PROP.OS_IN_COUNT]) + Number(curFlow[Constant.PROP.OS_OUT_COUNT]);
        let lastOutsideCount = Number(lastFlow[Constant.PROP.OS_IN_COUNT]) + Number(lastFlow[Constant.PROP.OS_OUT_COUNT]);
        if (sameFlow) {
          let sameInCount = Number(sameFlow[Constant.PROP.IN_COUNT]);
          let sameOutsideCount = Number(sameFlow[Constant.PROP.OS_IN_COUNT]) + Number(sameFlow[Constant.PROP.OS_OUT_COUNT]);
          sameVal = sameInCount > 0 ? (sameOutsideCount > 0 ? (sameInCount / sameOutsideCount) * 100 : 100) : 0;
        }
        curVal = curInCount > 0 ? (curOutsideCount > 0 ? (curInCount / curOutsideCount) * 100 : 100) : 0;
        lastVal = lastInCount > 0 ? (lastOutsideCount > 0 ? (lastInCount / lastOutsideCount) * 100 : 100) : 0;

        val = `${StringUtils.toFixed(curVal, 2)}%`;
      }
      item.qoq = DataConverter.calcGrowthRate(curVal, lastVal);
      if (sameFlow) {
        item.yoy = DataConverter.calcGrowthRate(curVal, sameVal);
      }
      item.val = val;
      statsData.push(item);
    }
    return statsData;
  }, [flowStatsData]);

  const requestGetGroupSelection = () => {
    Http.getGroupSelection({}, (res) => {
      let options = [];
      if (res.result == 1) {
        let groups = res.data;
        groups = transformToOptions(groups);
        options = ArrayUtils.dataList2TreeNode(groups, "groupId");
        options = ArrayUtils.setTreeParentNames(options, [], "groupName");
        options = [{ label: Language.QUANBU, title: Language.QUANBU, value: "all", key: "all" }, ...options];
        setGroupMap(
          groups.reduce((acc, item) => {
            acc[item.value] = item.label;
            return acc;
          }, {})
        );
      }
      setGroupOptions(options);
    });
  };

  const requestGetGroupAnalysis = useCallback(() => {
    const includeAll = selectedGroups.some((obj) => obj.value === "all");
    const groupIds = selectedGroups
      .filter((obj) => obj.value !== "all")
      .map((obj) => obj.value)
      .join(",");
    const startDate = timeRange[0].format("YYYY-MM-DD");
    const endDate = timeRange[1].format("YYYY-MM-DD");
    const param = includeAll ? { startDate, endDate, clearTime } : { startDate, endDate, clearTime, groupIds };
    if (selectedGroups.length === 0) {
      Message.warning(Language.QINGXUANZEJITUAN);
      return;
    }
    if (clearTime == null) {
      Message.warning(Language.QINGXUANZEJIZHUNSHIJIAN);
      return;
    }
    setLoading(true);
    setQueryTime(TimeUtils.now());
    Http.getGroupAnalysis(param, (res) => {
      setLoading(false);
      if (res.result == 1) {
        setEmpty(false);
        const flowStats = res.data?.flowStats;
        if (flowStats) {
          setFlowStatsData(flowStats);
        }

        const sites = res.data?.sites;
        if (sites) {
          const siteMap = sites.reduce((acc, item) => {
            const groupName = getSiteGroupParentNames(item.groupId);
            acc[item.siteId] = { ...item, groupName };
            return acc;
          }, {});
          setCompareSitesMap(siteMap);
        }

        const flowTrend = res.data?.flowTrend;
        if (flowTrend) {
          const total = flowTrend?.total || {};
          const totalList = [];
          for (let i = 0; i < total.siteId.length; i++) {
            const siteId = total.siteId[i];
            const inNum = total.inNum[i];
            const inCount = total.inCount[i];
            const outNum = total.outNum[i];
            const outCount = total.outCount[i];
            const passNum = total.passNum[i];
            const batchCount = total.batchCount[i];
            const dataTime = total.dataTime[i];
            totalList.push({ siteId, inNum, inCount, outNum, outCount, passNum, batchCount, dataTime });
          }
          flowTrend.total = totalList;
          const outside = flowTrend?.outside || {};
          const outSideList = [];
          for (let i = 0; i < outside.siteId.length; i++) {
            const siteId = outside.siteId[i];
            const osInNum = outside.osInNum[i];
            const osInCount = outside.osInCount[i];
            const osOutNum = outside.osOutNum[i];
            const osOutCount = outside.osOutCount[i];
            const dataTime = outside.dataTime[i];
            outSideList.push({ siteId, osInNum, osInCount, osOutNum, osOutCount, dataTime });
          }
          flowTrend.outside = outSideList;
          flowTrend.startTime = res.data?.startTime || 0;
          flowTrend.endTime = res.data?.endTime || 0;
          flowTrend.clearTime = res.data?.clearTime || 0;
          setFlowTrendData(flowTrend);
        }

        const faceTrend = res.data?.faceTrend;
        if (faceTrend) {
          const a = [];
          const _faceTrendData = faceTrend.map((item) => {
            const face = item[0];
            const age = item[1];
            const gender = item[2];
            const count = item[3];
            const dataTime = item[4];
            const siteId = item[5];
            const newItem = {
              face,
              age,
              gender,
              count,
              dataTime,
              siteId,
            };
            return newItem;
          });
          setFaceTrendData(_faceTrendData);
        }
      } else {
        Message.error(res.msg);
      }
    });
  }, [selectedGroups, timeRange, clearTime]);

  const tabItems = [
    {
      key: "1",
      label: Language.KELIUMINGXI,
      children: (
        <div style={{ padding: 2 }}>
          <DataTable columns={flowColumns()} dataSource={getFlowDetailsData} />
        </div>
      ),
    },
    {
      key: "2",
      label: Language.NIANLINGSHUXING,
      children: <DataTable mergeColumns={["date"]} columns={customerAgeColumns()} dataSource={getCustomerAgeTableData} />,
    },
    {
      key: "3",
      label: Language.XINQINGSHUXING,
      children: <DataTable mergeColumns={["date"]} columns={customerMoodColumns()} dataSource={getCustomerMoodTableData} />,
    },
  ];

  return (
    <div className="main">
      <UIContent>
        <Flex gap="middle" align="center">
          <span>{Language.SHIJIANXUANZE}:</span>
          <TimeGranulePicker onTimeChange={setTimeRange} />
          <span>{Language.JITUANXUANZE}:</span>
          <TreeSelect
            allowClear
            showSearch
            treeNodeFilterProp="label"
            treeData={groupOptions || []}
            treeCheckable
            treeCheckStrictly
            multiple
            placeholder={Language.QINGXUANZEJITUAN}
            value={selectedGroups}
            onChange={(v, _, c) => {
              const rawList = Array.isArray(v) ? v : [];
              const newVal = rawList.map((item) => (typeof item === "object" && item?.value != null ? item.value : item));
              const allGroupIds = collectAllGroupValues(groupOptions || []);
              const allGroupObjs = allGroupIds.map((groupId) => ({ value: groupId }));
              const isAllGroupsSelected = allGroupIds.length > 0 && allGroupIds.every((id) => newVal.includes(id));
              const isAllChecked = c.triggerValue === "all";
              const includeAll = selectedGroups.some((obj) => obj.value === "all");
              if (includeAll) {
                // 已勾选「全部」
                if (isAllChecked) {
                  // 取消「全部」时全部取消勾选

                  setSelectedGroups([]);
                } else if (!isAllGroupsSelected) {
                  // 取消部分集团时，取消「全部」
                  setSelectedGroups(newVal.filter((x) => x !== "all").map((groupId) => ({ value: groupId })));
                }
              } else if (isAllGroupsSelected) {
                // 手动勾选全部集团时，自动勾选「全部」
                setSelectedGroups([{ value: "all" }, ...allGroupObjs]);
              } else if (isAllChecked) {
                // 手动勾选「全部」时，自动勾选全部集团
                setSelectedGroups([{ value: "all" }, ...allGroupObjs]);
              } else {
                setSelectedGroups(newVal.map((groupId) => ({ value: groupId })));
              }
            }}
            showCheckedStrategy={TreeSelect.SHOW_ALL}
            maxTagCount={1}
            style={{ minWidth: 280 }}
          />
          <span>{Language.JIZHUNSHIJIAN}:</span>
          <Select value={clearTime} onChange={setClearTime} options={clearTimeOptions} style={{ width: 150 }} placeholder={Language.QINGXUANZE} />
          <Button type="primary" style={{ height: "30px", backgroundColor: "#3867D6" }} onClick={requestGetGroupAnalysis}>
            {Language.CHAXUN}
          </Button>
        </Flex>
      </UIContent>
      <UIContentLoading loading={loading}>
        {empty && <Empty />}
        {!empty && (
          <>
            <div className="layout-content layout-content-noScroll">
              <FlowStatsPanel data={siteFlowStatsData} yoyType={1} />
              <GroupCompareChart timeRange={timeRange} groupOptions={groupOptions} clearTime={clearTime} queryTime={queryTime} />
              {/* <GroupFlowCompareLineChartPanel style={{ width: "100%", minHeight: "352px" }} data={groupFlowCompareData} mainGroupList={mainGroupList} targetGroupList={targetGroupList} /> */}
              <GroupSiteRankingPanel
                style={{ width: "100%", minHeight: "593px" }}
                data={sitesRankingList}
                sort={rankingSort}
                onChange={() => {
                  setRankingSort(rankingSort * -1);
                }}
              />
              {/* <CompetitiveAnalysisScatterChartPanel style={{ width: "100%", minHeight: "457px" }} /> */}
              <div className="dual-row">
                <WeekWorkAnalysisLineBarChartPanel className="dual-row-content" data={workWeekAnalysisData} />
              </div>
              <div className="dualRow">
                <div className="dualRowContentSingle">
                  <GroupAnalysisHeatMapChartPanel extra={<FlowSelect options={FLOW_TYPE_OPTIONS} value={selectedFlowType} onChange={setSelectedFlowType} />} data={getHeatMapData} />
                </div>
                {/* <SiteHeatMapChartPanel className="dual-row-content" data={siteHeatMapData} /> */}
              </div>
              {/* <div className="dual-row">
              <CustomerAttrBarChartPanel className="dual-row-content" data={customerAttrData} />
              <CustomerMoodRadarChartPanel className="dual-row-content" data={customerMoodData} />
            </div> */}
              <div className="dual-row" style={{ minHeight: "697px" }}>
                <CustomerPortraitCompareBarChartPanel title={Language.KEQUNHUAXIANGDUIBI} className="dual-row-content" data={siteCustomerPortraitData} />
                <CustomerMoodCompareBarChartPanel title={Language.KEQUNXINQINGDUIBI} className="dual-row-content" data={siteCustomerMoodData} />
              </div>
              <div style={{ width: "100%", minHeight: "800px" }}>
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
            </div>
          </>
        )}
      </UIContentLoading>
    </div>
  );
};

const GroupCompareChart = React.memo(({ groupOptions, timeRange, clearTime, queryTime }) => {
  const [selectedAGroups, setSelectedAGroups] = useState(() => {
    const site = User.getSite(User.selectedSiteId);
    if (site) {
      const groupId = site.groupId;
      return [{ value: groupId }];
    }
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [selectedBGroups, setSelectedBGroups] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [flowTrend, setFlowTrend] = useState(null);
  const [selectedFlowType, setSelectedFlowType] = useState(Constant.FLOW_TYPE.IN_COUNT);
  const FLOW_TYPE_OPTIONS = [
    { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
    { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    { label: Language.KELIUPICI, value: Constant.FLOW_TYPE.BATCH_COUNT },
  ];
  useEffect(() => {
    initData();
  }, [queryTime]);

  const initData = () => {
    // const site = User.getSite(User.selectedSiteId);
    // if(site && selectedAGroups.length === 0){
    //   const groupId = site.groupId;
    //   setSelectedAGroups([{value:groupId}]);
    // }
    requestCompareTrend();
  };

  const changeCompareFlowType = useMemo(() => {}, [selectedFlowType]);

  const getSelectedGroupNames = (selectedGroups, tree) => {
    let names = [];
    const walk = (nodes) => {
      if (!Array.isArray(nodes)) return;
      nodes.forEach((node) => {
        if (selectedGroups.includes(node.value)) {
          if (node.value == "all") {
            names = [node.label];
            return;
          } else {
            names.push(node.label);
          }
        }
        if (node.children) walk(node.children);
      });
    };
    walk(tree);
    return names;
  };

  const requestCompareTrend = () => {
    setLoading(true);
    const aGroupAll = selectedAGroups.length > 0 ? selectedAGroups.some((obj) => obj.value === "all") : false;
    const aGroupIds =
      selectedAGroups.length > 0
        ? selectedAGroups
            .filter((obj) => obj.value !== "all")
            .map((obj) => obj.value)
            .join(",")
        : -1;
    const bGroupAll = selectedBGroups.length > 0 ? selectedBGroups.some((obj) => obj.value === "all") : null;
    const bGroupIds =
      selectedBGroups.length > 0
        ? selectedBGroups
            .filter((obj) => obj.value !== "all")
            .map((obj) => obj.value)
            .join(",")
        : -1;

    const startDate = timeRange[0].format("YYYY-MM-DD");
    const endDate = timeRange[1].format("YYYY-MM-DD");
    const param = {
      startDate,
      endDate,
      clearTime,
      aGroupIds: aGroupAll ? null : aGroupIds,
      bGroupIds: bGroupAll ? null : bGroupIds,
    };
    const flowType = selectedFlowType;
    Http.getGroupCompareTrend(param, (res) => {
      setLoading(false);
      if (res.result == 1) {
        // const aFlowTrend = res.data?.aFlowTrend;
        // const bFlowTrend = res.data?.bFlowTrend ? res.data?.bFlowTrend : aFlowTrend;
        // const aGroupIds = selectedAGroups.map((item)=>item.value);
        // const bGroupIds = selectedBGroups.map((item)=>item.value);
        // const aGroupNames = getSelectedGroupNames(aGroupIds,groupOptions).join(",");
        // const bGroupNames = getSelectedGroupNames(bGroupIds,groupOptions).join(",");
        setFlowTrend(res.data);
      } else {
      }
    });
  };

  const setGroupCompareTrend = useMemo(() => {
    const data = flowTrend;
    if (!flowTrend) {
      return;
    }
    const flowType = selectedFlowType;
    const clearTime = data.clearTime || 0;
    const startTime = data.startTime;
    const endTime = data.endTime;
    const multipleDay = endTime - startTime > 86400 ? true : false;
    const range = !multipleDay ? TimeUtils.getTsHourRangeByTs(startTime, endTime) : TimeUtils.getTsDayRangeByTs(startTime, endTime);
    const xAxis = [];
    const series = [[], []];
    const aFlowTrend = data.aFlowTrend;
    const bFlowTrend = data.bFlowTrend;

    let aDataMap = {};
    let bDataMap = {};
    const legend = [Language.ZHIDINGJITUAN, Language.DUIBIJITUAN];
    for (let i = 0; i < aFlowTrend.length; i++) {
      let dataItem = aFlowTrend[i];
      let dataTime = dataItem.dataTime;
      let value = dataItem.hasOwnProperty(flowType) ? dataItem[flowType] : 0;
      value = value >= 0 ? value : 0;
      aDataMap[dataTime] = value;
    }
    for (let i = 0; i < bFlowTrend.length; i++) {
      let dataItem = bFlowTrend[i];
      let dataTime = dataItem.dataTime;
      let value = dataItem.hasOwnProperty(flowType) ? dataItem[flowType] : 0;
      value = value >= 0 ? value : 0;
      bDataMap[dataTime] = value;
    }
    for (let i = 0; i < range.length; i++) {
      let dataTime = range[i];
      if (multipleDay) {
        xAxis.push(TimeUtils.ts2Date(dataTime, "HH:00"));
      } else {
        xAxis.push(TimeUtils.ts2Date(dataTime, "HH:00"));
      }
      if (aDataMap[dataTime]) {
        series[0].push(aDataMap[dataTime]);
      } else {
        series[0].push(0);
      }
      if (bDataMap[dataTime]) {
        series[1].push(bDataMap[dataTime]);
      } else {
        series[1].push(0);
      }
    }
    const chartData = {
      xAxis,
      series,
      legend,
    };
    setChartData(chartData);
  }, [flowTrend, selectedFlowType]);
  return (
    <UIPanel
      style={{ width: "100%", minHeight: "352px", height: "352px" }}
      title={Language.JITUANKELIUDUIBI}
      extra={<FlowSelect options={FLOW_TYPE_OPTIONS} value={selectedFlowType} onChange={setSelectedFlowType} />}
      bodyStyle={{ paddingTop: "0px" }}>
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", columnGap: "10px", paddingLeft: "15px", paddingTop: "10px" }}>
          <TreeSelect
            allowClear
            showSearch
            treeNodeFilterProp="label"
            treeData={groupOptions || []}
            treeCheckable
            treeCheckStrictly
            multiple
            placeholder={Language.ZHIDINGJITUAN}
            value={selectedAGroups}
            onChange={(v, _, c) => {
              const rawList = Array.isArray(v) ? v : [];
              const newVal = rawList.map((item) => (typeof item === "object" && item?.value != null ? item.value : item));
              const allGroupIds = collectAllGroupValues(groupOptions || []);
              const allGroupObjs = allGroupIds.map((groupId) => ({ value: groupId }));
              const isAllGroupsSelected = allGroupIds.length > 0 && allGroupIds.every((id) => newVal.includes(id));
              const isAllChecked = c.triggerValue === "all";
              const includeAll = selectedAGroups.some((obj) => obj.value === "all");
              if (includeAll) {
                // 已勾选「全部」
                if (isAllChecked) {
                  // 取消「全部」时全部取消勾选

                  setSelectedAGroups([]);
                } else if (!isAllGroupsSelected) {
                  // 取消部分集团时，取消「全部」
                  setSelectedAGroups(newVal.filter((x) => x !== "all").map((groupId) => ({ value: groupId })));
                }
              } else if (isAllGroupsSelected) {
                // 手动勾选全部集团时，自动勾选「全部」
                setSelectedAGroups([{ value: "all" }, ...allGroupObjs]);
              } else if (isAllChecked) {
                // 手动勾选「全部」时，自动勾选全部集团
                setSelectedAGroups([{ value: "all" }, ...allGroupObjs]);
              } else {
                setSelectedAGroups(newVal.map((groupId) => ({ value: groupId })));
              }
            }}
            showCheckedStrategy={TreeSelect.SHOW_ALL}
            maxTagCount={1}
            style={{ minWidth: 200 }}
          />
          <div style={{ color: "#3867D6", fontWeight: "bold" }}>VS</div>
          <TreeSelect
            allowClear
            showSearch
            treeNodeFilterProp="label"
            treeData={groupOptions || []}
            treeCheckable
            treeCheckStrictly
            multiple
            placeholder={Language.DUIBIJITUAN}
            value={selectedBGroups}
            onChange={(v, _, c) => {
              const rawList = Array.isArray(v) ? v : [];
              const newVal = rawList.map((item) => (typeof item === "object" && item?.value != null ? item.value : item));
              const allGroupIds = collectAllGroupValues(groupOptions || []);
              const allGroupObjs = allGroupIds.map((groupId) => ({ value: groupId }));
              const isAllGroupsSelected = allGroupIds.length > 0 && allGroupIds.every((id) => newVal.includes(id));
              const isAllChecked = c.triggerValue === "all";
              const includeAll = selectedBGroups.some((obj) => obj.value === "all");
              if (includeAll) {
                // 已勾选「全部」
                if (isAllChecked) {
                  // 取消「全部」时全部取消勾选

                  setSelectedBGroups([]);
                } else if (!isAllGroupsSelected) {
                  // 取消部分集团时，取消「全部」
                  setSelectedBGroups(newVal.filter((x) => x !== "all").map((groupId) => ({ value: groupId })));
                }
              } else if (isAllGroupsSelected) {
                // 手动勾选全部集团时，自动勾选「全部」
                setSelectedBGroups([{ value: "all" }, ...allGroupObjs]);
              } else if (isAllChecked) {
                // 手动勾选「全部」时，自动勾选全部集团
                setSelectedBGroups([{ value: "all" }, ...allGroupObjs]);
              } else {
                setSelectedBGroups(newVal.map((groupId) => ({ value: groupId })));
              }
            }}
            showCheckedStrategy={TreeSelect.SHOW_ALL}
            maxTagCount={1}
            style={{ minWidth: 200 }}
          />
        </div>
        <UIContentLoading loading={loading}>{chartData && <FlowLineChart data={chartData} />}</UIContentLoading>
      </div>
    </UIPanel>
  );
});

/** 从树结构中收集所有 value（不含 all） */
const collectAllGroupValues = (tree) => {
  const values = [];
  const walk = (nodes) => {
    if (!Array.isArray(nodes)) return;
    nodes.forEach((node) => {
      if (node.value && node.value !== "all") values.push(node.value);
      if (node.children) walk(node.children);
    });
  };
  walk(tree);
  return values;
};

export default GroupAnalysis;
