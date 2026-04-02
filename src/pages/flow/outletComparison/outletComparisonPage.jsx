import "./index.less";
import { Select, Space, Button, message } from "antd";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Language, text } from "@/language/LocaleContext";
import CommonUtils from "@/utils/CommonUtils";
import DataConverter from "@/data/DataConverter";
import dayjs from "dayjs";
import StringUtils from "@/utils/StringUtils";
import { useNavigate } from "react-router-dom";
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

const OutletComparisonPage = React.memo((props) => {
  const { tab } = props;
  const TimeGranulePickerRef = useRef(null);

  const [flowComparison, setFlowComparison] = useState(null);
  const [customerAttrData, setCustomerAttrData] = useState({ appiontData: [], compareData: [] });
  const [customerMoodData, setCustomerMoodData] = useState({});
  const [outlFlowCase, setOutlFlowCase] = useState({ resultA: [], resultC: [] });
  const [outlFlowCaseTotalA, setOutlFlowCaseTotalA] = useState(null); // 汇总 A 组各个出入口数据
  const [outlFlowCaseTotalC, setOutlFlowCaseTotalC] = useState(null); // 汇总 C 组各个出入口数据
  const [flowTableData, setFlowTableData] = useState([]);
  const [faceTableData, setFaceTableData] = useState([]);
  const [doorNameListA, setDoorNameListA] = useState(""); // A组出入口名称列表
  const [doorNameListC, setDoorNameListC] = useState(""); // C组出入口名称列表

  // 方法订阅
  const outletList = useOutletStore((state) => state.outletList);
  const outletLoading = useOutletStore((state) => state.loading);
  const fetchOutletList = useOutletStore((state) => state.fetchOutletList);
  const getOutletNameById = useOutletStore((state) => state.getOutletNameById);
  const outletError = useOutletStore((state) => state.error);
  const handleOutletChange = useOutletStore((state) => state.handleOutletChange);

  const [outletType, setOutletType] = useState("ALL"); // 出入口类型，ALL:总客流 OUTSIDE:场外客流 FLOOR:楼层 UNKNOWN:未知

  const [appiontSite, setAppiontSite] = useState(null);
  const [compareSite, setCompareSite] = useState(null);
  // 选中的出入口IDA 和选中的出入口IDC 这个和appiontSite和compareSite的区别是有ALL ，控制Select选择器的ID
  const [selectedOutletIdsA, setSelectedOutletIdsA] = useState([]); // 选中的出入口IDA
  const [selectedOutletIdsC, setSelectedOutletIdsC] = useState([]); // 选中的出入口IDC
  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]); // 时间范围，默认为今天
  const [timeGranule, setTimeGranule] = useState("hour"); // 时间粒度，默认为小时
  const [flowLineChartType, setFlowLineChartType] = useState("1"); // 流量对比类型  1:进场人次 2:进场人数 3:客流批次
  const [limit, setLimit] = useState(null); // 限制
  const [empty, setEmpty] = useState(true); // 空状态
  const [loading, setLoading] = useState(false); // 加载状态

  const [baseDataA, setBaseDataA] = useState(null);
  const [baseDataC, setBaseDataC] = useState(null);

  const { siteId, setSiteId } = useSite();

  // 错误提示
  useEffect(() => {
    if (outletError) {
      message.error(outletError);
    }
  }, [outletError]);

  // 场地改变后获取出入口
  useEffect(() => {
    if (siteId) {
      setAppiontSite([]);
      setCompareSite([]);
      setSelectedOutletIdsA([]);
      setSelectedOutletIdsC([]);
      fetchOutletList(siteId);
    }
  }, [siteId, fetchOutletList]);

  // 处理时间选择器的时间变化
  const handleTimeChange = useCallback((value) => {
    setTimeRange(value);
  }, []);

  // 处理时间粒度变化
  const handleTimeGranuleChange = useCallback(
    (value) => {
      setTimeGranule(value);
      getFlowComparisonDate({ _flowDataA: baseDataA.flowTrend, _flowDataC: baseDataC.flowTrend, flowLineChartType, timeGranule: value });
    },
    [flowLineChartType, baseDataA, baseDataC]
  );

  // 流量对比类型切换
  const FlowLineChartTypeChange = useCallback(
    (value) => {
      setFlowLineChartType(value);
      getFlowComparisonDate({ _flowDataA: baseDataA.flowTrend, _flowDataC: baseDataC.flowTrend, flowLineChartType: value, timeGranule: timeGranule });
    },
    [timeGranule, baseDataA, baseDataC]
  );

  // 创建Http Promise辅助函数
  const createHttpPromise = (params) => {
    return new Promise((resolve, reject) => {
      Http.getCompareDoorStatsData(params, resolve, null, reject);
    });
  };

  // 查询
  const searchFun = async (type = "outlet") => {
    message.config({
      maxCount: 3,
    });
    if (!timeRange[0] || !timeRange[1]) {
      message.warning({ content: "时间范围不能为空" });
      return;
    }
    if (!Array.isArray(appiontSite) || appiontSite.length === 0 || !Array.isArray(compareSite) || compareSite.length === 0) {
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
    let AParams = {
      siteId: siteId,
      doorIds: appiontSite.join(","),
      doorType: doorTypeEnum[outletType] || 1,
      startDate: timeRange[0].format("YYYY-MM-DD"),
      endDate: timeRange[1].format("YYYY-MM-DD"),
    };

    let CParams = {
      siteId: siteId,
      doorIds: compareSite.join(","),
      doorType: doorTypeEnum[outletType] || 1,

      startDate: timeRange[0].format("YYYY-MM-DD"),
      endDate: timeRange[1].format("YYYY-MM-DD"),
    };

    try {
      const [AResponse, CResponse] = await Promise.all([createHttpPromise(AParams), createHttpPromise(CParams)]);
      if (AResponse.result === 1 && CResponse.result === 1) {
        console.log("A组数据:", AResponse.data);
        setBaseDataA(AResponse.data);
        console.log("C组数据:", CResponse.data);
        setBaseDataC(CResponse.data);

        if (AResponse.data?.flowTrend && CResponse.data?.flowTrend) {
          getFlowComparisonDate({ _flowDataA: AResponse.data.flowTrend, _flowDataC: CResponse.data.flowTrend, flowLineChartType, timeGranule: timeGranule });
          getOutlFlowCaseDate(AResponse.data?.flowTrend, CResponse.data?.flowTrend);
        }

        if (AResponse.data?.faceData && CResponse.data?.faceData) {
          getCustomeMoodData(AResponse.data?.faceData, CResponse.data?.faceData);
          getCustomeAttrData(AResponse.data?.faceData, CResponse.data?.faceData);
        }
        handleTableDetailData(AResponse.data, CResponse.data);
      }
      setEmpty(false);
      setLoading(false);
    } catch (error) {
      console.error("请求失败:", error);
      setLoading(false);
    }
  };

  const calculateLimit = () => {
    // if (timeRange[1].diff(timeRange[0], "day") >= 3) {
    //   return "hour";
    // }
    // if (timeRange[1].diff(timeRange[0], "day") >= 1) {
    //   return "mintue";
    // }
    if (timeRange[1].diff(timeRange[0], "day") >= 1) {
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
    const { _flowDataA, _flowDataC, flowLineChartType, timeGranule } = params;
    let _timeGranule = timeGranule;

    if ((calculateLimitType === "hour" && ["halfHour", "mintue", "hour"].includes(_timeGranule)) || (calculateLimitType === "mintue" && _timeGranule === "mintue")) {
      _timeGranule = "day";
      setTimeGranule("day");
    }

    if (!timeRange || !timeRange[0]) return;
    // 使用真实的时间范围生成x轴数据
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRange, _timeGranule);

    var yAxis1 = new Array();
    var yAxis2 = new Array();

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);

      // 获取当前时间段数据
      const calcGroupValue = (data, timeSlot) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce((sum, item) => {
          const dataTime = item.dataTime;
          if (dataTime >= timeSlot.startTime && dataTime < timeSlot.endTime) {
            return sum + (getValueByFlowType(item, flowLineChartType) || 0);
          }
          return sum;
        }, 0);
      };
      // console.log(calcGroupValue(_flowDataA, currentTimeSlot), 231);

      yAxis1.push(calcGroupValue(_flowDataA, currentTimeSlot));
      yAxis2.push(calcGroupValue(_flowDataC, currentTimeSlot));
    }

    const appiontSum = yAxis1.reduce((sum, item) => sum + item, 0);
    const compareSum = yAxis2.reduce((sum, item) => sum + item, 0);

    var legend = [Language.ZHIDINGCHURUKOU, Language.DUIBICHURUKOU];
    var series = [yAxis1, yAxis2];
    let data = {
      legend: legend,
      xAxis: xAxis,
      series: series,
      appiontSum,
      compareSum,
      xAxisTooltips,
    };
    setFlowComparison(data);
  };

  // 根据 doorId 分类数据
  const groupDataByDoorId = (data, ids) => {
    if (!data || !Array.isArray(data)) {
      return {};
    }

    const grouped = {};

    ids.forEach((id) => {
      if (!grouped[id]) {
        grouped[id] = {
          inNum: 0,
          outNum: 0,
          inCount: 0,
          outCount: 0,
          batchCount: 0,
          passNum: 0,
          count: 0,
          doorId: id,
          name: getOutletNameById(id),
        };
      }
    });

    data.forEach((item) => {
      const doorId = item.doorId;
      // 累加数据
      grouped[doorId].inNum += Number(item.inNum || 0);
      grouped[doorId].outNum += Number(item.outNum || 0);
      grouped[doorId].inCount += Number(item.inCount || 0);
      grouped[doorId].outCount += Number(item.outCount || 0);
      grouped[doorId].batchCount += Number(item.batchCount || 0);
      grouped[doorId].passNum += Number(item.passNum || 0);
      grouped[doorId].count += Number(item.count || 0);
    });

    return grouped;
  };

  // 获取卡片客流
  const getOutlFlowCaseDate = (_flowDataA, _flowDataC) => {
    const groupedDataA = groupDataByDoorId(_flowDataA, appiontSite);
    const groupedDataC = groupDataByDoorId(_flowDataC, compareSite);

    const resultA = [];
    const resultC = [];

    const totalDataA = {
      name: "汇总指定出入口",
      inNum: 0,
      outNum: 0,
      inCount: 0,
      outCount: 0,
      batchCount: 0,
      passNum: 0,
      count: 0,
      doorId: "TOTAL_A",
      key: "TOTAL_A",
    };
    const totalDataC = {
      name: "汇总对比出入口",
      inNum: 0,
      outNum: 0,
      inCount: 0,
      outCount: 0,
      batchCount: 0,
      passNum: 0,
      count: 0,
      doorId: "TOTAL_C",
      key: "TOTAL_C",
    };

    // resultA.push(totalDataA);
    // 汇总 A 组各个出入口数据
    Object.values(groupedDataA).forEach((doorData, index) => {
      totalDataA.inNum += doorData.inNum;
      totalDataA.outNum += doorData.outNum;
      totalDataA.inCount += doorData.inCount;
      totalDataA.outCount += doorData.outCount;
      totalDataA.batchCount += doorData.batchCount;
      totalDataA.passNum += doorData.passNum;
      totalDataA.count += doorData.count;

      resultA.push({
        name: doorData.name,
        key: index,
        inNum: doorData.inNum,
        outNum: doorData.outNum,
        inCount: doorData.inCount,
        outCount: doorData.outCount,
        batchCount: doorData.batchCount,
        passNum: doorData.passNum,
        count: doorData.count,
        analyseDoorId: doorData.doorId,
        analyseDoorType: outletType,
        analyseTimeRange: [timeRange[0], timeRange[1]],
      });
    });

    // resultC.push(totalDataC);
    // 汇总 A 组各个出入口数据
    Object.values(groupedDataC).forEach((doorData, index) => {
      totalDataC.inNum += doorData.inNum;
      totalDataC.outNum += doorData.outNum;
      totalDataC.inCount += doorData.inCount;
      totalDataC.outCount += doorData.outCount;
      totalDataC.batchCount += doorData.batchCount;
      totalDataC.passNum += doorData.passNum;
      totalDataC.count += doorData.count;

      resultC.push({
        name: doorData.name,
        key: index,
        inNum: doorData.inNum,
        outNum: doorData.outNum,
        inCount: doorData.inCount,
        outCount: doorData.outCount,
        batchCount: doorData.batchCount,
        passNum: doorData.passNum,
        count: doorData.count,
        analyseDoorId: doorData.doorId,
        analyseDoorType: outletType,
        analyseTimeRange: [timeRange[0], timeRange[1]],
      });
    });

    setOutlFlowCase({ resultA, resultC });
    setOutlFlowCaseTotalA(totalDataA);
    setOutlFlowCaseTotalC(totalDataC);
  };

  // 获取客户属性
  const getCustomeAttrData = (_flowDataA, _flowDataC) => {
    const groupDataByAgeAndGender = (data) => {
      let maleData = [0, 0, 0, 0, 0, 0];
      let femaleData = [0, 0, 0, 0, 0, 0];
      data.forEach((item) => {
        let age = item.age;
        let gender = item.gender;
        let count = item.count;
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
            : // : age === 3
            // ? (femaleData[2] = femaleData[2] + count)
            age === 4
            ? (femaleData[2] = femaleData[2] + count)
            : age === 5
            ? (femaleData[3] = femaleData[3] + count)
            : age === 6
            ? (femaleData[4] = femaleData[4] + count)
            : (femaleData[5] = femaleData[5] + count);
        }
      });
      return { maleData, femaleData };
    };

    const appiontData = groupDataByAgeAndGender(_flowDataA);
    const compareData = groupDataByAgeAndGender(_flowDataC);

    setCustomerAttrData({ appiontData, compareData });
  };

  // 获取表格详情数据
  const handleTableDetailData = (_flowDataA, _flowDataC) => {
    const TrandDataA = _flowDataA.flowTrend;
    const faceDataA = _flowDataA.faceData;
    const TrandDataC = _flowDataC.flowTrend;
    const faceDataC = _flowDataC.faceData;

    let xAxisLength = 0;
    let _xAxisTime = [];
    let tableData = [];
    let faceTableData = [];

    const isSameDay = timeRange[0].isSame(timeRange[1]);

    // 24小时版本
    if (isSameDay) {
      const { xAxis, xAxisTime } = CommonUtils.generateXAxisFromTimeRange(timeRange, "hour");
      xAxisLength = xAxis.length;
      _xAxisTime = xAxisTime;
    } else {
      const { xAxis, xAxisTime } = CommonUtils.generateXAxisFromTimeRange(timeRange, "day");
      xAxisLength = xAxis.length;
      _xAxisTime = xAxisTime;
    }
    for (let i = 0; i < xAxisLength; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(_xAxisTime[i], _xAxisTime[i + 1]);
      let rowObj = {
        key: i,
        date: _xAxisTime[i],
        inCountA: 0,
        batchCountA: 0,
        inNumA: 0,
        inCountC: 0,
        batchCountC: 0,
        inNumC: 0,
        isSameDay,
        inCountChangeRate: 0,
        inNumChangeRate: 0,
        batchCountChangeRate: 0,
      };

      TrandDataA.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
          rowObj.inCountA = rowObj.inCountA + item.inCount;
          rowObj.inNumA = rowObj.inNumA + item.inNum;
          rowObj.batchCountA = rowObj.batchCountA + item.batchCount;
        }
      });
      TrandDataC.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
          rowObj.inCountC = rowObj.inCountC + item.inCount;
          rowObj.inNumC = rowObj.inNumC + item.inNum;
          rowObj.batchCountC = rowObj.batchCountC + item.batchCount;
        }
      });

      rowObj.inCountChangeRate = StringUtils.toFixed(rowObj.inCountC !== 0 ? ((rowObj.inCountA - rowObj.inCountC) / rowObj.inCountC) * 100 : 100, 2) + "%";
      rowObj.inNumChangeRate = StringUtils.toFixed(rowObj.inNumC !== 0 ? ((rowObj.inNumA - rowObj.inNumC) / rowObj.inNumC) * 100 : 100, 2) + "%";
      rowObj.batchCountChangeRate = StringUtils.toFixed(rowObj.batchCountC !== 0 ? ((rowObj.batchCountA - rowObj.batchCountC) / rowObj.batchCountC) * 100 : 100, 2) + "%";

      let rowAgeObj = {
        key: i * 2,
        date: _xAxisTime[i],
        isSameDay,
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
      };

      let rowAgeObj2 = {
        ...rowAgeObj,
        key: i * 2 + 1,
        gender: 2,
        _rowSpan: 0, // 第二行不显示日期，被合并
      };

      faceDataA.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
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
      });
      faceDataC.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
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
          } else if (item.gender === 2) {
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
      tableData.push(rowObj);
      faceTableData.push(rowAgeObj);
      faceTableData.push(rowAgeObj2);
    }

    let doorNameListA = "";
    let doorNameListC = "";
    const groupedDataA = groupDataByDoorId(TrandDataA, appiontSite);
    const groupedDataC = groupDataByDoorId(TrandDataC, compareSite);
    Object.values(groupedDataA).forEach((item) => {
      doorNameListA += item.name + ",";
    });
    Object.values(groupedDataC).forEach((item) => {
      doorNameListC += item.name + ",";
    });

    setDoorNameListA(doorNameListA);
    setDoorNameListC(doorNameListC);
    setFaceTableData(faceTableData);
    setFlowTableData(tableData);
  };

  // 获取客户心情
  const getCustomeMoodData = (_flowDataA, _flowDataC) => {
    const appiontData = DataConverter.getCustomerMoodHandleData(_flowDataA);
    const compareData = DataConverter.getCustomerMoodHandleData(_flowDataC);
    setCustomerMoodData({ appiontData, compareData });
  };

  return (
    <div className="outletComparisonPage">
      <div className="ui-search-bar">
        <div className="timeContrast" style={{ paddingBottom: "8px" }}>
          <span className="title">{text("时间对比")}：</span>
          <TimeGranulePicker ref={TimeGranulePickerRef} onTimeChange={handleTimeChange} />
        </div>
        <div className="timeContrast">
          <span className="title">位置对比：</span>
          <Select
            size="default"
            value={outletType}
            style={{ width: 100, marginRight: "15px" }}
            options={outletTypeList}
            onChange={(v) => {
              setOutletType(v);
              setAppiontSite([]);
              setCompareSite([]);
              setSelectedOutletIdsA([]);
              setSelectedOutletIdsC([]);
            }}
          />
          <Select
            size="default"
            value={selectedOutletIdsA}
            mode="multiple"
            allowClear
            onClear={() => {
              setSelectedOutletIdsA([]);
              setAppiontSite([]);
            }}
            loading={outletLoading}
            style={{ width: 300 }}
            options={outletList[outletType]?.children || []}
            // onChange={(v) => {
            //   setAppiontSite(v);
            // }}
            onSelect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(outletType, v, selectedOutletIdsA, "select");
              setSelectedOutletIdsA(newSelectedIds);
              setAppiontSite(actualIds);
            }}
            onDeselect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(outletType, v, selectedOutletIdsA, "deselect");
              setSelectedOutletIdsA(newSelectedIds);
              setAppiontSite(actualIds);
            }}
            maxTagCount={1}
            maxTagTextLength={15}
            placeholder="请选择出入口"
          />
          <span style={{ padding: "0 16px", color: "#3867d6" }}>VS</span>
          <Select
            size="default"
            value={selectedOutletIdsC}
            mode="multiple"
            allowClear
            onClear={() => {
              setSelectedOutletIdsC([]);
              setCompareSite([]);
            }}
            loading={outletLoading}
            style={{ width: 300 }}
            options={outletList[outletType].children || []}
            // onChange={(v) => {
            //   setCompareSite(v);
            // }}
            onSelect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(outletType, v, selectedOutletIdsC, "select");
              setSelectedOutletIdsC(newSelectedIds);
              setCompareSite(actualIds);
            }}
            onDeselect={(v) => {
              const { newSelectedIds, actualIds } = handleOutletChange(outletType, v, selectedOutletIdsC, "deselect");
              setSelectedOutletIdsC(newSelectedIds);
              setCompareSite(actualIds);
            }}
            maxTagCount={1}
            maxTagTextLength={15}
            placeholder="请选择出入口"
          />
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
                timeRange={timeRange}
                limit={limit}
                type={tab}
              />
              {/* 出入口流量 */}
              <OutlFlowCase OutlFlowCaseDate={outlFlowCase} timeRangeA={timeRange} timeRangeC={timeRange} outlFlowCaseTotalA={outlFlowCaseTotalA} outlFlowCaseTotalC={outlFlowCaseTotalC} type={tab} />
              {/* 客户属性对比 */}
              <CustomerAttrChart appiontData={customerAttrData.appiontData} compareData={customerAttrData.compareData} timeRangeA={timeRange} timeRangeC={timeRange} type={tab} />
              {/* 客户心情对比 */}
              <CustomerMoodChart data={customerMoodData} type={tab} />
              {/* 数据详情 */}
              {flowTableData.length > 0 && (
                <TableDetail flowData={flowTableData} faceTableData={faceTableData} type={tab} timeRange={timeRange} doorNameListA={doorNameListA} doorNameListC={doorNameListC} />
              )}
              <ICPComponent />
            </>
          )}
        </div>
      </UIContentLoading>
    </div>
  );
});
export default OutletComparisonPage;
