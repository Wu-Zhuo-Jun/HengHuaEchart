import "./index.less";
import { Select, Space, Button, message, TreeSelect } from "antd";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Language, text } from "@/language/LocaleContext";
import CommonUtils from "@/utils/CommonUtils";
import TimeUtils from "@/utils/TimeUtils";
import StringUtils from "@/utils/StringUtils";
import dayjs from "dayjs";
import { ICPComponent, UIContentLoading } from "@/components/ui/UIComponent";

import OutlFlowCase from "./components/OutlFlowCase";
import { FlowComparisonChart, CustomerAttrChart, CustomerMoodChart } from "./components/Charts";
import { TimeGranulePicker } from "@/components/common/timeGranulePicker";
import Empty from "@/components/common/Empty";
import { TableDetail } from "./components/TableDetail";
import { useSite } from "@/context/SiteContext";
import { outletTypeList, ageEnum, genderEnum, faceEnum } from "./const";
import Http from "@/config/Http";

import useOutletStore from "@/stores/useOutletStore";

const TimeComparisonPage = React.memo((props) => {
  const { tab } = props;
  const TimeGranulePickerRefA = useRef(null);
  const TimeGranulePickerRefC = useRef(null);

  const [flowComparison, setFlowComparison] = useState(null);
  const [customerAttrData, setCustomerAttrData] = useState({ appiontData: [], compareData: [] });
  const [customerMoodData, setCustomerMoodData] = useState({});
  const [outlFlowCase, setOutlFlowCase] = useState({ resultA: [], resultC: [] });
  const [flowTableData, setFlowTableData] = useState([]);
  const [faceTableData, setFaceTableData] = useState([]);
  const [outlFlowCaseTotalA, setOutlFlowCaseTotalA] = useState(null);
  const [outlFlowCaseTotalC, setOutlFlowCaseTotalC] = useState(null);

  // 方法订阅
  const outletList = useOutletStore((state) => state.outletList);
  const outletLoading = useOutletStore((state) => state.loading);
  const fetchOutletList = useOutletStore((state) => state.fetchOutletList);
  const getOutletNameById = useOutletStore((state) => state.getOutletNameById);
  const outletError = useOutletStore((state) => state.error);
  const handleOutletChange = useOutletStore((state) => state.handleOutletChange);

  const [outletType, setOutletType] = useState("ALL"); // 出入口类型，ALL:总客流 OUTSIDE:场外客流 FLOOR:楼层 UNKNOWN:未知

  const [appiontSite, setAppiontSite] = useState(null);
  const [selectedOutletIds, setSelectedOutletIds] = useState([]); // 选择器选中Ids

  const [timeRangeA, setTimeRangeA] = useState([dayjs(), dayjs()]); // 时间范围，默认为今天
  const [timeRangeC, setTimeRangeC] = useState([dayjs(), dayjs()]); // 时间范围，默认为今天
  const [timeGranule, setTimeGranule] = useState("hour"); // 时间粒度，默认为小时
  const [flowLineChartType, setFlowLineChartType] = useState("1"); // 流量对比类型  1:进场人次 2:进场人数 3:客流批次
  const [limit, setLimit] = useState(null); // 限制
  const [empty, setEmpty] = useState(true); // 空状态
  const [loading, setLoading] = useState(false); // 加载状态

  const [baseData, setBaseData] = useState(null);

  const { siteId, setSiteId } = useSite();

  // 场地改变后获取出入口
  useEffect(() => {
    if (siteId) {
      setAppiontSite(null);
      fetchOutletList(siteId);
    }
  }, [siteId, fetchOutletList]);

  useEffect(() => {
    if (outletError) {
      message.error(outletError);
    }
  }, [outletError]);

  // 处理时间粒度变化
  const handleTimeGranuleChange = useCallback(
    (value) => {
      setTimeGranule(value);
      getFlowComparisonDate({ _flowData: baseData.flowTrend, flowLineChartType, timeGranule: value });
    },
    [flowLineChartType, baseData]
  );

  // 流量对比类型切换
  const FlowLineChartTypeChange = useCallback(
    (value) => {
      setFlowLineChartType(value);
      getFlowComparisonDate({ _flowData: baseData.flowTrend, flowLineChartType: value, timeGranule: timeGranule });
    },
    [timeGranule, baseData]
  );

  // 创建Http Promise辅助函数
  const createHttpPromise = (params) => {
    return new Promise((resolve, reject) => {
      Http.getCompareTimeStatsData(params, resolve, null, reject);
    });
  };

  // 查询
  const searchFun = async () => {
    message.config({
      maxCount: 3,
    });
    if (!timeRangeA[0] || !timeRangeA[1] || !timeRangeC[0] || !timeRangeC[1]) {
      message.warning({ content: "时间范围不能为空" });
      return;
    }
    if (!appiontSite || appiontSite?.length === 0) {
      message.warning({ content: "出入口不能为空" });
      return;
    }
    setLoading(true);
    setLimit(calculateLimit());
    let doorTypeEnum = {
      ALL: 1,
      OUTSIDE: 2,
      FLOOR: 3,
    };
    let Params = {
      siteId: siteId,
      doorIds: appiontSite.join(","),
      doorType: doorTypeEnum[outletType] || 1,
      startDate: timeRangeA[0].format("YYYY-MM-DD"),
      endDate: timeRangeA[1].format("YYYY-MM-DD"),
      startDateCompare: timeRangeC[0].format("YYYY-MM-DD"),
      endDateCompare: timeRangeC[1].format("YYYY-MM-DD"),
    };

    try {
      const [Response] = await Promise.all([createHttpPromise(Params)]);
      if (Response.result === 1) {
        console.log(Response.data, "Response.data");
        setBaseData(Response.data);
        if (Response.data?.flowTrend) {
          getFlowComparisonDate({ _flowData: Response.data.flowTrend, flowLineChartType, timeGranule: timeGranule });
          getOutlFlowCaseDate(Response.data?.flowTrend);
        }

        if (Response.data?.faceData) {
          getCustomeMoodData(Response.data?.faceData);
          getCustomeAttrData(Response.data?.faceData);
        }
        handleTableDetailData(Response.data);
      }
      setLoading(false);
      setEmpty(false);
    } catch (error) {
      console.error("请求失败:", error);
      setLoading(false);
    }
  };

  const calculateLimit = () => {
    // if (timeRangeA[1].diff(timeRangeA[0], "day") >= 3 || timeRangeC[1].diff(timeRangeC[0], "day") >= 3) {
    //   return "hour";
    // }
    // timeRangeA[1].diff(timeRangeA[0], "day");
    // if (timeRangeA[1].diff(timeRangeA[0], "day") >= 1 || timeRangeC[1].diff(timeRangeC[0], "day") >= 1) {
    //   return "mintue";
    // }
    if (timeRangeA[1].diff(timeRangeA[0], "day") >= 1 || timeRangeC[1].diff(timeRangeC[0], "day") >= 1) {
      return "hour";
    }
    return null;
  };

  // dayjs范围转时间戳
  const getTimeSlotByIndex = (startTime, endTime) => {
    return {
      startTime: startTime.unix(),
      endTime: endTime.unix(),
    };
  };

  // 辅助函数：根据流量类型获取对应数值
  const getValueByFlowType = (item, flowLineChartType) => {
    switch (flowLineChartType) {
      case "1": // 进场人次
        return Number(item.inCount || 0);
      case "2": // 进场人数
        return Number(item.inNum || 0);
      case "3": // 客流批次
        return Number(item.batchCount || 0);
      default:
        return Number(item.inCount || 0);
    }
  };

  // 获取流量对比
  const getFlowComparisonDate = (params) => {
    const calculateLimitType = calculateLimit();
    const { _flowData, flowLineChartType, timeGranule } = params;
    let _timeGranule = timeGranule;
    let xAxisType = null;

    // 判断选择较长的时间段作为x轴

    xAxisType = timeRangeC[1].unix() - timeRangeC[0].unix() > timeRangeA[1].unix() - timeRangeA[0].unix() ? "C" : "A";

    if ((calculateLimitType === "hour" && ["halfHour", "mintue", "hour"].includes(_timeGranule)) || (calculateLimitType === "mintue" && _timeGranule === "mintue")) {
      _timeGranule = "day";
      setTimeGranule("day");
    }

    if (!timeRangeA || !timeRangeA[0] || !timeRangeC || !timeRangeC[0]) return;
    // 使用真实的时间范围生成x轴数据
    const { xAxis: xAxisA, xAxisTime: xAxisTimeA, xAxisTooltips: xAxisTooltipsA } = CommonUtils.generateXAxisFromTimeRange(timeRangeA, _timeGranule);
    const { xAxis: xAxisC, xAxisTime: xAxisTimeC, xAxisTooltips: xAxisTooltipsC } = CommonUtils.generateXAxisFromTimeRange(timeRangeC, _timeGranule);

    const yAxis1 = []; // 指定时间
    const yAxis2 = []; // 对比时间

    let xAxis = xAxisType === "C" ? xAxisC : xAxisA;

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxisA.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTimeA[i], xAxisTimeA[i + 1]);

      // 获取当前时间段数据
      const calcGroupValue = (data, timeSlot) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce((sum, item) => {
          const dataTime = item.dataTime;

          if (dataTime < xAxisTimeA[0].unix() || dataTime > xAxisTimeA[xAxisTimeA.length - 1].unix()) {
            return sum;
          }
          if (dataTime >= timeSlot.startTime && dataTime < timeSlot.endTime) {
            return sum + (getValueByFlowType(item, flowLineChartType) || 0);
          }
          return sum;
        }, 0);
      };
      yAxis1.push(calcGroupValue(_flowData, currentTimeSlot));
      // yAxis2.push(calcGroupValue(_flowDataC, currentTimeSlot));
    }

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxisC.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTimeC[i], xAxisTimeC[i + 1]);

      // 获取当前时间段数据
      const calcGroupValue = (data, timeSlot) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce((sum, item) => {
          const dataTime = item.dataTime;
          if (dataTime < xAxisTimeC[0].unix() || dataTime > xAxisTimeC[xAxisTimeC.length - 1].unix()) {
            return sum;
          }
          if (dataTime >= timeSlot.startTime && dataTime < timeSlot.endTime) {
            return sum + (getValueByFlowType(item, flowLineChartType) || 0);
          }
          return sum;
        }, 0);
      };
      yAxis2.push(calcGroupValue(_flowData, currentTimeSlot));
    }

    const appiontSum = yAxis1.reduce((sum, item) => sum + item, 0);
    const compareSum = yAxis2.reduce((sum, item) => sum + item, 0);

    var legend = [Language.ZHIDINGSHIJIAN, Language.DUIBISHIJIAN];
    var series = [yAxis1, yAxis2];
    let data = {
      legend: legend,
      xAxis: xAxis,
      series: series,
      appiontSum,
      compareSum,
      xAxisType,
      xAxisA: xAxisA,
      xAxisC: xAxisC,
      xAxisTooltipsA: xAxisTooltipsA,
      xAxisTooltipsC: xAxisTooltipsC,
    };
    setFlowComparison(data);
  };

  // 获取卡片客流
  const getOutlFlowCaseDate = (_flowData) => {
    const resultA = [];
    const resultC = [];
    const _timeRangeA = timeRangeA;
    const _timeRangeC = timeRangeC;

    const isSameDayA = _timeRangeA[0].isSame(_timeRangeA[1]);
    const isSameDayC = _timeRangeC[0].isSame(_timeRangeC[1]);

    const totalDataA = {
      name: "汇总指定时间",
      inNum: 0,
      outNum: 0,
      inCount: 0,
      outCount: 0,
      batchCount: 0,
      passNum: 0,
      count: 0,
      key: "TOTAL_A",
    };
    const totalDataC = {
      name: "汇总对比时间",
      inNum: 0,
      outNum: 0,
      inCount: 0,
      outCount: 0,
      batchCount: 0,
      passNum: 0,
      count: 0,
      key: "TOTAL_C",
    };

    const aTimeSoltArr = isSameDayA ? TimeUtils.getHourlyTimeSlotsByDayjs(_timeRangeA[0]) : TimeUtils.getDailyTimeSlotsByDayjs(_timeRangeA[0], _timeRangeA[1]);
    const cTimeSoltArr = isSameDayC ? TimeUtils.getHourlyTimeSlotsByDayjs(_timeRangeC[0]) : TimeUtils.getDailyTimeSlotsByDayjs(_timeRangeC[0], _timeRangeC[1]);
    console.log(aTimeSoltArr, "aTimeSoltArr");

    // 先初始化 resultA，遍历时间槽
    aTimeSoltArr.forEach((timeSlot, index) => {
      resultA[index] = {
        name: timeSlot.dateStr,
        key: index,
        inNum: 0,
        outNum: 0,
        inCount: 0,
        outCount: 0,
        batchCount: 0,
        analyseTimeRange: [dayjs(timeSlot.startTime * 1000), dayjs(timeSlot.startTime * 1000)],
        analyseDoorId: appiontSite,
        analyseDoorType: outletType,
      };
    });

    // 先初始化 resultC，遍历时间槽
    cTimeSoltArr.forEach((timeSlot, index) => {
      resultC[index] = {
        name: timeSlot.dateStr,
        key: index,
        inNum: 0,
        outNum: 0,
        inCount: 0,
        outCount: 0,
        batchCount: 0,
        analyseTimeRange: [dayjs(timeSlot.startTime * 1000), dayjs(timeSlot.startTime * 1000)],
        analyseDoorId: appiontSite,
        analyseDoorType: outletType,
      };
    });

    _flowData.forEach((item) => {
      // 统计 A 时间段数据
      aTimeSoltArr.forEach((timeSlot, index) => {
        if (item.dataTime >= timeSlot.startTime && item.dataTime < timeSlot.endTime) {
          resultA[index].inNum += item.inNum;
          resultA[index].inCount += item.inCount;
          resultA[index].batchCount += item.batchCount;
          totalDataA.inNum += item.inNum;
          totalDataA.inCount += item.inCount;
          totalDataA.batchCount += item.batchCount;
        }
      });

      // 统计 C 时间段数据
      cTimeSoltArr.forEach((timeSlot, index) => {
        if (item.dataTime >= timeSlot.startTime && item.dataTime < timeSlot.endTime) {
          resultC[index].inNum += item.inNum;
          resultC[index].inCount += item.inCount;
          resultC[index].batchCount += item.batchCount;
          totalDataC.inNum += item.inNum;
          totalDataC.inCount += item.inCount;
          totalDataC.batchCount += item.batchCount;
        }
      });
    });

    setOutlFlowCase({ resultA, resultC });
    setOutlFlowCaseTotalA(totalDataA);
    setOutlFlowCaseTotalC(totalDataC);
  };

  // 获取客户属性
  const getCustomeAttrData = (faceData) => {
    const groupDataByAgeAndGender = (data, timeRange) => {
      let maleData = [0, 0, 0, 0, 0, 0];
      let femaleData = [0, 0, 0, 0, 0, 0];
      const { startTime, endTime } = TimeUtils.getDayRangeByDayjs(timeRange[0], timeRange[1]);
      data.forEach((item) => {
        let age = item.age;
        let gender = item.gender;
        let count = item.count;
        let dataTime = item.dataTime;
        if (dataTime >= startTime && dataTime < endTime) {
          if (gender === 1) {
            age === 1
              ? (maleData[0] = maleData[0] + count)
              : age === 2
              ? (maleData[1] = maleData[1] + count)
              : // : age === 3
              // ? (maleData[2] = maleData[2] + count)
              age === 4
              ? (maleData[2] = maleData[2] + count)
              : age === 5
              ? (maleData[3] = maleData[3] + count)
              : age === 6
              ? (maleData[4] = maleData[4] + count)
              : (maleData[5] = maleData[5] + count);
          } else if (gender === 2) {
            age === 1
              ? (femaleData[0] = femaleData[0] + count)
              : age === 2
              ? (femaleData[1] = femaleData[1] + count)
              : age === 4
              ? (femaleData[2] = femaleData[2] + count)
              : age === 5
              ? (femaleData[3] = femaleData[3] + count)
              : age === 6
              ? (femaleData[4] = femaleData[4] + count)
              : (femaleData[5] = femaleData[5] + count);
          }
        }
      });
      return { maleData, femaleData };
    };

    const appiontData = groupDataByAgeAndGender(faceData, timeRangeA);
    const compareData = groupDataByAgeAndGender(faceData, timeRangeC);

    setCustomerAttrData({ appiontData, compareData });
  };

  // 获取表格详情数据
  const handleTableDetailData = (data) => {
    const TrandData = data.flowTrend;
    const faceData = data.faceData;
    const _timeRangeA = timeRangeA;
    const _timeRangeC = timeRangeC;

    const currentTimeSlotA = TimeUtils.getDayRangeByDayjs(_timeRangeA[0], _timeRangeA[1]);
    const currentTimeSlotC = TimeUtils.getDayRangeByDayjs(_timeRangeC[0], _timeRangeC[1]);

    let tableflowData = [];
    let faceTableData = [];

    let rowObj = {
      inCountA: 0,
      inNumA: 0,
      batchCountA: 0,
      inCountC: 0,
      inNumC: 0,
      batchCountC: 0,
      inCountChangeRate: 0,
      inNumChangeRate: 0,
      batchCountChangeRate: 0,
      timeA: `${_timeRangeA[0].format("YYYY-MM-DD")} - ${_timeRangeA[1].format("YYYY-MM-DD")}`,
      timeC: `${_timeRangeC[0].format("YYYY-MM-DD")} - ${_timeRangeC[1].format("YYYY-MM-DD")}`,
      doorName: getOutletNameById(appiontSite),
    };

    // 客流table
    TrandData.map((item) => {
      const dataTime = item.dataTime;
      if (dataTime >= currentTimeSlotA.startTime && dataTime < currentTimeSlotA.endTime) {
        rowObj.inCountA = rowObj.inCountA + item.inCount;
        rowObj.inNumA = rowObj.inNumA + item.inNum;
        rowObj.batchCountA = rowObj.batchCountA + item.batchCount;
      }
      if (dataTime >= currentTimeSlotC.startTime && dataTime < currentTimeSlotC.endTime) {
        rowObj.inCountC = rowObj.inCountC + item.inCount;
        rowObj.inNumC = rowObj.inNumC + item.inNum;
        rowObj.batchCountC = rowObj.batchCountC + item.batchCount;
      }
    });

    rowObj.inCountChangeRate = StringUtils.toFixed(rowObj.inCountC !== 0 ? ((rowObj.inCountA - rowObj.inCountC) / rowObj.inCountC) * 100 : 100, 2) + "%";
    rowObj.inNumChangeRate = StringUtils.toFixed(rowObj.inNumC !== 0 ? ((rowObj.inNumA - rowObj.inNumC) / rowObj.inNumC) * 100 : 100, 2) + "%";
    rowObj.batchCountChangeRate = StringUtils.toFixed(rowObj.batchCountC !== 0 ? ((rowObj.batchCountA - rowObj.batchCountC) / rowObj.batchCountC) * 100 : 100, 2) + "%";

    // male
    let rowAgeObj = {
      key: 1,
      gender: 1,
      toddlerA: 0,
      childA: 0,

      youngAdultA: 0,
      middleAgeA: 0,
      elderlyA: 0,
      ageUnknownA: 0,
      toddlerC: 0,
      childC: 0,

      youngAdultC: 0,
      middleAgeC: 0,
      elderlyC: 0,
      ageUnknownC: 0,
      angerA: 0,
      sadnessA: 0,
      disgustA: 0,
      fearA: 0,
      surpriseA: 0,
      calmA: 0,
      happyA: 0,
      confusedA: 0,
      faceUnknownA: 0,
      angerC: 0,
      sadnessC: 0,
      disgustC: 0,
      fearC: 0,
      surpriseC: 0,
      calmC: 0,
      happyC: 0,
      confusedC: 0,
      faceUnknownC: 0,
      _rowSpan: 2, // 设置行合并数为2（男性和女性两行）

      timeA: `${_timeRangeA[0].format("YYYY-MM-DD")} - ${_timeRangeA[1].format("YYYY-MM-DD")}`,
      timeC: `${_timeRangeC[0].format("YYYY-MM-DD")} - ${_timeRangeC[1].format("YYYY-MM-DD")}`,
      doorName: getOutletNameById(appiontSite),
    };

    // female
    let rowAgeObj2 = {
      ...rowAgeObj,
      key: 2,
      gender: 2,
      _rowSpan: 0, // 设置行合并数为2（男性和女性两行）
    };

    faceData.map((item) => {
      const dataTime = item.dataTime;
      if (dataTime >= currentTimeSlotA.startTime && dataTime < currentTimeSlotA.endTime) {
        if (item.gender === 1) {
          rowAgeObj.toddlerA = item.age === 1 ? rowAgeObj.toddlerA + item.count : rowAgeObj.toddlerA;
          rowAgeObj.childA = item.age === 2 ? rowAgeObj.childA + item.count : rowAgeObj.childA;

          rowAgeObj.youngAdultA = item.age === 4 ? rowAgeObj.youngAdultA + item.count : rowAgeObj.youngAdultA;
          rowAgeObj.middleAgeA = item.age === 5 ? rowAgeObj.middleAgeA + item.count : rowAgeObj.middleAgeA;
          rowAgeObj.elderlyA = item.age === 6 ? rowAgeObj.elderlyA + item.count : rowAgeObj.elderlyA;
          rowAgeObj.ageUnknownA = item.age === 7 ? rowAgeObj.ageUnknownA + item.count : rowAgeObj.ageUnknownA;
          rowAgeObj.angerA = item.face === 1 ? rowAgeObj.angerA + item.count : rowAgeObj.angerA;
          rowAgeObj.sadnessA = item.face === 2 ? rowAgeObj.sadnessA + item.count : rowAgeObj.sadnessA;
          rowAgeObj.disgustA = item.face === 3 ? rowAgeObj.disgustA + item.count : rowAgeObj.disgustA;
          rowAgeObj.fearA = item.face === 4 ? rowAgeObj.fearA + item.count : rowAgeObj.fearA;
          rowAgeObj.surpriseA = item.face === 5 ? rowAgeObj.surpriseA + item.count : rowAgeObj.surpriseA;
          rowAgeObj.calmA = item.face === 6 ? rowAgeObj.calmA + item.count : rowAgeObj.calmA;
          rowAgeObj.happyA = item.face === 7 ? rowAgeObj.happyA + item.count : rowAgeObj.happyA;
          rowAgeObj.confusedA = item.face === 8 ? rowAgeObj.confusedA + item.count : rowAgeObj.confusedA;
          rowAgeObj.faceUnknownA = item.face === 9 ? rowAgeObj.faceUnknownA + item.count : rowAgeObj.faceUnknownA;
        } else if (item.gender === 2) {
          rowAgeObj2.toddlerA = item.age === 1 ? rowAgeObj2.toddlerA + item.count : rowAgeObj2.toddlerA;
          rowAgeObj2.childA = item.age === 2 ? rowAgeObj2.childA + item.count : rowAgeObj2.childA;

          rowAgeObj2.youngAdultA = item.age === 4 ? rowAgeObj2.youngAdultA + item.count : rowAgeObj2.youngAdultA;
          rowAgeObj2.middleAgeA = item.age === 5 ? rowAgeObj2.middleAgeA + item.count : rowAgeObj2.middleAgeA;
          rowAgeObj2.elderlyA = item.age === 6 ? rowAgeObj2.elderlyA + item.count : rowAgeObj2.elderlyA;
          rowAgeObj2.ageUnknownA = item.age === 7 ? rowAgeObj2.ageUnknownA + item.count : rowAgeObj2.ageUnknownA;
          rowAgeObj2.angerA = item.face === 1 ? rowAgeObj2.angerA + item.count : rowAgeObj2.angerA;
          rowAgeObj2.sadnessA = item.face === 2 ? rowAgeObj2.sadnessA + item.count : rowAgeObj2.sadnessA;
          rowAgeObj2.disgustA = item.face === 3 ? rowAgeObj2.disgustA + item.count : rowAgeObj2.disgustA;
          rowAgeObj2.fearA = item.face === 4 ? rowAgeObj2.fearA + item.count : rowAgeObj2.fearA;
          rowAgeObj2.surpriseA = item.face === 5 ? rowAgeObj2.surpriseA + item.count : rowAgeObj2.surpriseA;
          rowAgeObj2.calmA = item.face === 6 ? rowAgeObj2.calmA + item.count : rowAgeObj2.calmA;
          rowAgeObj2.happyA = item.face === 7 ? rowAgeObj2.happyA + item.count : rowAgeObj2.happyA;
          rowAgeObj2.confusedA = item.face === 8 ? rowAgeObj2.confusedA + item.count : rowAgeObj2.confusedA;
          rowAgeObj2.faceUnknownA = item.face === 9 ? rowAgeObj2.faceUnknownA + item.count : rowAgeObj2.faceUnknownA;
        }
      }
      if (dataTime >= currentTimeSlotC.startTime && dataTime < currentTimeSlotC.endTime) {
        if (item.gender === 1) {
          rowAgeObj.toddlerC = item.age === 1 ? rowAgeObj.toddlerC + item.count : rowAgeObj.toddlerC;
          rowAgeObj.childC = item.age === 2 ? rowAgeObj.childC + item.count : rowAgeObj.childC;

          rowAgeObj.youngAdultC = item.age === 4 ? rowAgeObj.youngAdultC + item.count : rowAgeObj.youngAdultC;
          rowAgeObj.middleAgeC = item.age === 5 ? rowAgeObj.middleAgeC + item.count : rowAgeObj.middleAgeC;
          rowAgeObj.elderlyC = item.age === 6 ? rowAgeObj.elderlyC + item.count : rowAgeObj.elderlyC;
          rowAgeObj.ageUnknownC = item.age === 7 ? rowAgeObj.ageUnknownC + item.count : rowAgeObj.ageUnknownC;
          rowAgeObj.angerC = item.face === 1 ? rowAgeObj.angerC + item.count : rowAgeObj.angerC;
          rowAgeObj.sadnessC = item.face === 2 ? rowAgeObj.sadnessC + item.count : rowAgeObj.sadnessC;
          rowAgeObj.disgustC = item.face === 3 ? rowAgeObj.disgustC + item.count : rowAgeObj.disgustC;
          rowAgeObj.fearC = item.face === 4 ? rowAgeObj.fearC + item.count : rowAgeObj.fearC;
          rowAgeObj.surpriseC = item.face === 5 ? rowAgeObj.surpriseC + item.count : rowAgeObj.surpriseC;
          rowAgeObj.calmC = item.face === 6 ? rowAgeObj.calmC + item.count : rowAgeObj.calmC;
          rowAgeObj.happyC = item.face === 7 ? rowAgeObj.happyC + item.count : rowAgeObj.happyC;
          rowAgeObj.confusedC = item.face === 8 ? rowAgeObj.confusedC + item.count : rowAgeObj.confusedC;
          rowAgeObj.faceUnknownC = item.face === 9 ? rowAgeObj.faceUnknownC + item.count : rowAgeObj.faceUnknownC;
        }
        if (item.gender === 2) {
          rowAgeObj2.toddlerC = item.age === 1 ? rowAgeObj2.toddlerC + item.count : rowAgeObj2.toddlerC;
          rowAgeObj2.childC = item.age === 2 ? rowAgeObj2.childC + item.count : rowAgeObj2.childC;

          rowAgeObj2.youngAdultC = item.age === 4 ? rowAgeObj2.youngAdultC + item.count : rowAgeObj2.youngAdultC;
          rowAgeObj2.middleAgeC = item.age === 5 ? rowAgeObj2.middleAgeC + item.count : rowAgeObj2.middleAgeC;
          rowAgeObj2.elderlyC = item.age === 6 ? rowAgeObj2.elderlyC + item.count : rowAgeObj2.elderlyC;
          rowAgeObj2.ageUnknownC = item.age === 7 ? rowAgeObj2.ageUnknownC + item.count : rowAgeObj2.ageUnknownC;
          rowAgeObj2.angerC = item.face === 1 ? rowAgeObj2.angerC + item.count : rowAgeObj2.angerC;
          rowAgeObj2.sadnessC = item.face === 2 ? rowAgeObj2.sadnessC + item.count : rowAgeObj2.sadnessC;
          rowAgeObj2.disgustC = item.face === 3 ? rowAgeObj2.disgustC + item.count : rowAgeObj2.disgustC;
          rowAgeObj2.fearC = item.face === 4 ? rowAgeObj2.fearC + item.count : rowAgeObj2.fearC;
          rowAgeObj2.surpriseC = item.face === 5 ? rowAgeObj2.surpriseC + item.count : rowAgeObj2.surpriseC;
          rowAgeObj2.calmC = item.face === 6 ? rowAgeObj2.calmC + item.count : rowAgeObj2.calmC;
          rowAgeObj2.happyC = item.face === 7 ? rowAgeObj2.happyC + item.count : rowAgeObj2.happyC;
          rowAgeObj2.confusedC = item.face === 8 ? rowAgeObj2.confusedC + item.count : rowAgeObj2.confusedC;
          rowAgeObj2.faceUnknownC = item.face === 9 ? rowAgeObj2.faceUnknownC + item.count : rowAgeObj2.faceUnknownC;
        }
      }
    });

    tableflowData.push(rowObj);
    faceTableData.push(rowAgeObj);
    faceTableData.push(rowAgeObj2);

    setFaceTableData(faceTableData);
    setFlowTableData(tableflowData);
  };

  // 获取时间对比客户心情
  const getCustomeMoodData = (_faceData) => {
    let faceMoodMap = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      7: 6,
      8: 7,
      9: 8,
    };
    // 根据 face和gender 分类数据
    const groupDataByFaceAndGender = (data, timeRange) => {
      let maleData = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      let femaleData = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      let unknowData = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      const { startTime, endTime } = TimeUtils.getDayRangeByDayjs(timeRange[0], timeRange[1]);

      data.forEach((item) => {
        let face = item.face;
        let gender = item.gender;
        let count = item.count;
        let dataTime = item.dataTime;
        if (dataTime >= startTime && dataTime < endTime) {
          if (gender === 1) {
            maleData[faceMoodMap[face]] = maleData[faceMoodMap[face]] + count;
          } else if (gender === 2) {
            femaleData[faceMoodMap[face]] = femaleData[faceMoodMap[face]] + count;
          } else {
            unknowData[faceMoodMap[face]] = unknowData[faceMoodMap[face]] + count;
          }
        }
      });
      return { maleData, femaleData, unknowData };
    };

    const appiontData = groupDataByFaceAndGender(_faceData, timeRangeA);
    const compareData = groupDataByFaceAndGender(_faceData, timeRangeC);
    setCustomerMoodData({ appiontData, compareData });
  };

  return (
    <div className="outletComparisonPage">
      <div className="ui-search-bar">
        <div className="timeContrast" style={{ paddingBottom: "8px" }}>
          <span className="title">出入口选择：</span>
          <Select
            size="default"
            value={outletType}
            style={{ width: 100, marginRight: "15px" }}
            options={outletTypeList}
            onChange={(v) => {
              setOutletType(v);
              setAppiontSite([]);
            }}
          />
          <Select
            size="default"
            value={selectedOutletIds}
            mode="multiple"
            allowClear
            onClear={() => {
              setAppiontSite([]);
              setSelectedOutletIds([]);
            }}
            loading={outletLoading}
            style={{ width: 300 }}
            options={outletList[outletType]?.children || []}
            onSelect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(outletType, v, selectedOutletIds, "select");
              setSelectedOutletIds(newSelectedIds);
              setAppiontSite(actualIds);
            }}
            onDeselect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(outletType, v, selectedOutletIds, "deselect");
              setSelectedOutletIds(newSelectedIds);
              setAppiontSite(actualIds);
            }}
            maxTagCount={2}
            maxTagTextLength={10}
            placeholder="请选择出入口"
          />
        </div>
        <div className="timeContrast">
          <span className="title">时间对比：</span>
          <TimeGranulePicker ref={TimeGranulePickerRefA} onTimeChange={(val) => setTimeRangeA(val)} />
          <span style={{ padding: "0 16px", color: "#3867d6" }}>VS</span>
          <TimeGranulePicker ref={TimeGranulePickerRefC} onTimeChange={(val) => setTimeRangeC(val)} />
          <Button
            style={{ marginLeft: "16px" }}
            type="primary"
            size="default"
            onClick={() => {
              searchFun();
            }}>
            查询
          </Button>
        </div>
      </div>
      <UIContentLoading loading={loading} customHeight="700px">
        <div className="layout-content layout-content-noScroll">
          {empty && <Empty />}
          {!empty && (
            <>
              {/* 流量对比 */}
              <FlowComparisonChart
                data={flowComparison}
                flowLineChartType={flowLineChartType}
                onFlowLineChartTypeChange={FlowLineChartTypeChange}
                onTimeGranuleChange={handleTimeGranuleChange}
                timeGranule={timeGranule}
                limit={limit}
                type={tab}
                tab={tab}
              />
              {/* 出入口流量 */}
              <OutlFlowCase
                OutlFlowCaseDate={outlFlowCase}
                timeRangeA={timeRangeA}
                timeRangeC={timeRangeC}
                outlFlowCaseTotalA={outlFlowCaseTotalA}
                outlFlowCaseTotalC={outlFlowCaseTotalC}
                type={tab}
              />
              {/* 客户属性对比 */}
              <CustomerAttrChart appiontData={customerAttrData.appiontData} compareData={customerAttrData.compareData} timeRangeA={timeRangeA} timeRangeC={timeRangeC} type={tab} />
              {/* 客户心情对比 */}
              <CustomerMoodChart data={customerMoodData} type={tab} />
              {/* 数据详情 */}
              <TableDetail flowData={flowTableData} faceTableData={faceTableData} type={tab} />
              <ICPComponent />
            </>
          )}
        </div>
      </UIContentLoading>
    </div>
  );
});

export default TimeComparisonPage;
