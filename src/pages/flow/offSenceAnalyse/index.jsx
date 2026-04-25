import "./index.less";
import { Button, Select, message, Spin } from "antd";
import { useCallback, useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Language, text } from "@/language/LocaleContext";
import dayjs from "dayjs";
import DataIndicator from "./components/DataIndicator";
import { TimeGranulePicker } from "@/components/common/timeGranulePicker";
import { TableDetail } from "./components/TableDetail";
import { OffSenceFlowTrendChart, OffSenceDoorAnalysisChartPanel } from "./components/Charts";
import CommonUtils from "@/utils/CommonUtils";
import StringUtils from "@/utils/StringUtils";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import Empty from "@/components/common/Empty";
import { ICPComponent, UIContentLoading, NewFlowSelect } from "@/components/ui/UIComponent";
import { VisitingPeakChartPanelByOffSence } from "@/components/common/panels/ChartPanel";
import Http from "@/config/Http";
import { useSite } from "@/context/SiteContext";
import DataConverter from "@/data/DataConverter";
import Constant from "@/common/Constant";
import User from "@/data/UserData";
import { DoorTypeMap } from "./components/Charts";

/**外部分析 */
export default function OffSenceAnalyse() {
  const TimeGranulePickerRef = useRef(null);
  const [siteData, setSiteData] = useState({ curStats: null, preStats: null }); // 场地数据
  const [visitingPeakBaseData, setVisitingPeakBaseData] = useState({ osVisitingPeak: null, visitingPeak: null }); // 到访峰值基础数据
  const [baseData, setBaseData] = useState(null); // 基础数据
  const [hasPermission, setHasPermission] = useState({ OVER_STORE_FLOW: false, OUTSIDE_FLOW: false }); // 是否有权限

  const [isSameDay, setIsSameDay] = useState(false);
  const [isCurrentDay, setIsCurrentDay] = useState(false);

  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]); // 时间范围，默认为今天
  const timeRangeRef = useRef(timeRange);

  const [timeGranule, setTimeGranule] = useState("hour"); // 客流趋势时间粒度，默认为小时
  const [offSenceTimeGranule, setOffSenceTimeGranule] = useState("hour"); // 出入口分析时间粒度，默认为小时
  const [limit, setLimit] = useState(null); // 限制
  const [doorAnalysisOrder, setDoorAnalysisOrder] = useState("upOrder"); // 出入口分析排序方式
  const [doorAnalysisFlowType, setDoorAnalysisFlowType] = useState("passNum"); // 出入口分析流量类型

  const [doorList, setDoorList] = useState([]); // 总客流出入口列表
  const [osDoorList, setOsDoorList] = useState([]); // 场外客流出入口列表
  const [baseType, setBaseType] = useState(null); // 类型 os ALL
  // const [tempBaseType, setTempBaseType] = useState("ALL"); // 临时

  const [doorAnalysisBaseData, setDoorAnalysisBaseData] = useState(null); // 出入口分析基础数据

  const [empty, setEmpty] = useState(true); // 空状态
  const [loading, setLoading] = useState(false); // 加载状态
  const [analyLoading, setAnalyLoading] = useState(false); // 出入口分析加载状态
  const loadingTimerRef = useRef(null); // 存储 loading 定时器的引用
  const location = useLocation();
  const { siteId, setSiteId } = useSite();

  useEffect(() => {
    const OVER_STORE_FLOW_PERMISSION = User.checkMasterPermission(Constant.MASTER_POWER.OVER_STORE_COUNT);
    const OUTSIDE_FLOW_PERMISSION = User.checkMasterPermission(Constant.MASTER_POWER.OUTSIDE_COUNT);
    console.log(OVER_STORE_FLOW_PERMISSION, OUTSIDE_FLOW_PERMISSION, 61);
    setHasPermission({ OVER_STORE_FLOW: OVER_STORE_FLOW_PERMISSION, OUTSIDE_FLOW: OUTSIDE_FLOW_PERMISSION });
    if (OVER_STORE_FLOW_PERMISSION) {
      setBaseType("ALL");
      return;
    }

    if (OUTSIDE_FLOW_PERMISSION) {
      setBaseType("OS");
      return;
    }
  }, []);

  // 场地改变后获取场外分析数据
  useEffect(() => {
    if (siteId) {
      getOffSenceAnalysisDoorList();
      getOffSenceAnalysisTotalDoorList();
      searchFun();

      // if ( && siteId) {
      //   searchFun();
      // }
    }
  }, [siteId]);

  const DoorTypeMap = useMemo(() => {
    if (hasPermission.OVER_STORE_FLOW && hasPermission.OUTSIDE_FLOW) {
      return [
        { value: "ALL", label: Language.GUODIANKELIU },
        { value: "OS", label: Language.CHANGWAIKELIU },
      ];
    }
    if (hasPermission.OVER_STORE_FLOW) {
      return [{ value: "ALL", label: Language.GUODIANKELIU }];
    }
    if (hasPermission.OUTSIDE_FLOW) {
      return [{ value: "OS", label: Language.CHANGWAIKELIU }];
    }
    return [];
  }, [hasPermission]);

  // 当baseType改变时，更新doorAnalysisFlowType
  useEffect(() => {
    if (baseType === "ALL") {
      setDoorAnalysisFlowType("passNum");
    } else {
      setDoorAnalysisFlowType("osFlow");
    }
  }, [baseType]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, []);

  // 首次进入时，确保 baseType 确定且列表数据就绪后才请求热力图
  const initDoorAnalysisFetchedRef = useRef(false);
  useEffect(() => {
    initDoorAnalysisFetchedRef.current = false;
  }, [siteId]);

  // baseType 首次确定后，自动请求热力图数据（不动现有逻辑）
  useEffect(() => {
    if (!baseType || initDoorAnalysisFetchedRef.current) return;
    if (baseType === "ALL" && hasPermission.OVER_STORE_FLOW && doorList.length > 0) {
      initDoorAnalysisFetchedRef.current = true;
      getOffSenceDoorAnalysisFlowFunction(doorList.map((item) => item.value));
    } else if (baseType === "OS" && hasPermission.OUTSIDE_FLOW && osDoorList.length > 0) {
      initDoorAnalysisFetchedRef.current = true;
      getOffSenceDoorAnalysisFlowFunction(osDoorList.map((item) => item.value));
    }
  }, [baseType, hasPermission, doorList.length, osDoorList.length]);

  const handleTimeChange = useCallback((value) => {
    timeRangeRef.current = value;
    setTimeRange(value);
  }, []);

  // 获取出入口分析总客流门口列表
  const getOffSenceAnalysisTotalDoorList = () => {
    Http.getCompareDoorListData({ siteId: siteId }, (res) => {
      if (res.result === 1) {
        const arr = res.data.reduce((acc, item) => {
          if (item.isAllType === 1) acc.push({ label: item.doorName, value: item.doorId });
          return acc;
        }, []);
        setDoorList(arr);
      } else {
        message.warning({ content: res.msg });
      }
    });
  };

  // 获取出入口分析过店门口列表
  const getOffSenceAnalysisDoorList = () => {
    Http.getOffSenceAnalysisDoorList({ siteId: siteId }, (res) => {
      if (res.result === 1) {
        const osArr = res.data.reduce((acc, item) => {
          acc.push({ label: item.doorName, value: item.doorId });
          return acc;
        }, []);
        setOsDoorList(osArr);
      } else {
        message.warning({ content: res.msg });
      }
    });
  };

  // useEffect(() => {
  //   if (baseType === "ALL" && doorList.length > 0 && hasPermission.OVER_STORE_FLOW) {
  //     getOffSenceDoorAnalysisFlowFunction(doorList.map((item) => item.value));
  //   } else if (baseType === "OS" && osDoorList.length > 0 && hasPermission.OUTSIDE_FLOW) {
  //     getOffSenceDoorAnalysisFlowFunction(osDoorList.map((item) => item.value));
  //   } else {
  //     setDoorAnalysisBaseData(null);
  //   }
  // }, [baseType, doorList, osDoorList]);

  // 获取出入口分析数据(热力图)
  const getOffSenceDoorAnalysisFlowFunction = (doorIdsParam) => {
    if (!siteId || !timeRange || !timeRange[0] || !timeRange[1]) {
      return;
    }

    // 如果未显式传入，则使用当前类型下的全部出入口
    const doorIds = doorIdsParam && Array.isArray(doorIdsParam) && doorIdsParam.length > 0 ? doorIdsParam : (baseType === "ALL" ? doorList : osDoorList).map((item) => item.value);
    if (!Array.isArray(doorIds) || doorIds.length === 0) {
      setDoorAnalysisBaseData(null);
      return;
    }
    let params = {
      siteId: siteId,
      doorIds: doorIds.join(","),
      startDate: timeRange[0].format("YYYY-MM-DD"),
      endDate: timeRange[1].format("YYYY-MM-DD"),
      doorType: baseType === "ALL" ? 1 : 2,
    };
    setAnalyLoading(true);

    Http.getOffSenceDoorAnalysisFlow(params, (res) => {
      try {
        console.log(184);
        if (res.result == 1) {
          console.log(res.data, 185);
          setDoorAnalysisBaseData(res.data);
        } else {
          message.warning({ content: res.msg });
          setDoorAnalysisBaseData(null);
        }
        setAnalyLoading(false);
      } catch (error) {
        console.error("请求失败:", error);
        message.warning({ content: "请求失败" });
        setAnalyLoading(false);
      }
    });
  };

  // 确保 loading 至少显示指定时间的辅助函数
  const ensureMinLoadingTime = (callback, startTime, minTime) => {
    // 清理之前的定时器
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    const elapsed = Date.now() - startTime;
    const remaining = minTime - elapsed;
    if (remaining > 0) {
      loadingTimerRef.current = setTimeout(() => {
        callback();
        loadingTimerRef.current = null;
      }, remaining);
    } else {
      callback();
    }
  };

  // 查询
  const searchFun = async () => {
    message.config({
      maxCount: 3,
    });
    if (!timeRange || !timeRange[0]) {
      message.warning({ content: "时间范围不能为空" });
      return;
    }
    // setBaseType(tempBaseType);
    setLoading(true);
    const loadingStartTime = Date.now(); // 记录 loading 开始时间
    const minLoadingTime = 300; // 最少显示 0.5 秒
    console.log("loadingStartTime", loadingStartTime);
    let limit = calculateLimit();
    setLimit(limit);
    const isSameDay = timeRange[0].isSame(timeRange[1], "day");
    const isCurrentDay = timeRange[0].isSame(dayjs(), "day") && timeRange[1].isSame(dayjs(), "day");
    setIsSameDay(isSameDay);
    setIsCurrentDay(isCurrentDay);
    let Params = {
      siteId: siteId,
      timeType: 0,
      startDate: timeRange[0].format("YYYY-MM-DD"),
      endDate: timeRange[1].format("YYYY-MM-DD"),
    };

    try {
      Http.getOffSenceAnalysisStats(Params, (Response) => {
        try {
          if (Response.result === 1) {
            setSiteData({ curStats: Response.data.flowStats.curFlow, preStats: Response.data.flowStats.lastFlow });
            setBaseData(Response?.data?.flowTrend);
            setVisitingPeakBaseData({ osVisitingPeak: Response.data.osVisitingPeak, visitingPeak: Response.data.visitingPeak });
            setEmpty(false);
            // 查询主数据成功后，如果有选中的出入口，则获取出入口分析数据

            // getOffSenceDoorAnalysisFlowFunction();
          } else {
            message.warning({ content: Response.msg });
          }
          ensureMinLoadingTime(
            () => {
              setLoading(false);
            },
            loadingStartTime,
            minLoadingTime
          );
        } catch (innerError) {
          console.error("数据处理错误:", innerError);
          message.error({ content: "数据处理错误" });
          ensureMinLoadingTime(
            () => {
              setLoading(false);
            },
            loadingStartTime,
            minLoadingTime
          );
        }
      });
    } catch (error) {
      console.error("请求失败:", error);
      message.warning({ content: "请求失败" });
      ensureMinLoadingTime(
        () => {
          setLoading(false);
        },
        loadingStartTime,
        minLoadingTime
      );
    }
  };

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
    if (timeRange[1].diff(timeRange[0], "day") > 366) {
      return "week";
    }
    if (timeRange[1].diff(timeRange[0], "day") > 61) {
      return "day";
    }
    if (timeRange[1].diff(timeRange[0], "day") >= 1) {
      return "hour";
    }
    return null;
  };

  // 处理趋势图时间粒度变化
  const handleTimeGranuleChange = useCallback(
    (value) => {
      setTimeGranule(value);
    },
    [timeGranule]
  );

  // 数据指标
  const DataIndicatorData = useMemo(() => {
    const { curStats, preStats } = siteData || {};
    const { inNum, outNum, inCount, outCount, osInNum, osOutNum, osInCount, osOutCount, batchCount, passNum } = curStats || {};
    const {
      inNum: preInNum,
      outNum: preOutNum,
      inCount: preInCount,
      outCount: preOutCount,
      osInNum: preOsInNum,
      osOutNum: preOsOutNum,
      osInCount: preOsInCount,
      osOutCount: preOsOutCount,
      batchCount: preBatchCount,
      passNum: prePassNum,
    } = preStats || {};
    const storeOutNum = passNum; // 店外客流
    const preStoreOutNum = prePassNum;
    const storeOutNumPreRate = preStoreOutNum === 0 ? "100" : StringUtils.toFixed(((storeOutNum - preStoreOutNum) / (preStoreOutNum || 1)) * 100, 2);
    const siteOutNum = osInCount + osOutCount; // 场外客流
    const preSiteOutNum = preOsInCount + preOsOutCount;
    const siteOutNumPreRate = preSiteOutNum === 0 ? "100" : StringUtils.toFixed(((siteOutNum - preSiteOutNum) / (preSiteOutNum || 1)) * 100, 2);
    const inSiteCount = inCount; // 进场人次
    const preInSiteCount = preInCount;
    const inSiteCountPreRate = preInSiteCount === 0 ? "100" : StringUtils.toFixed(((inSiteCount - preInSiteCount) / (preInSiteCount || 1)) * 100, 2);
    const inSiteNum = inNum; // 进场人数
    const preInSiteNum = preInNum;
    const inSiteNumPreRate = preInSiteNum === 0 ? "100" : StringUtils.toFixed(((inSiteNum - preInSiteNum) / (preInSiteNum || 1)) * 100, 2);

    const storeEntryRate = storeOutNum === 0 ? "100" : StringUtils.toFixed((inSiteCount / storeOutNum) * 100, 2); // 进店率（进场人次/店外客流）
    const preStoreEntryRate = preStoreOutNum === 0 ? "100" : StringUtils.toFixed((preInSiteNum / preStoreOutNum) * 100, 2);
    const storeEntryRatePreRate = preStoreEntryRate === 0 ? "100" : StringUtils.toFixed(((storeEntryRate - preStoreEntryRate) / (preStoreEntryRate || 1)) * 100, 2);
    const siteEntryRate = siteOutNum === 0 ? "100" : StringUtils.toFixed((inSiteCount / siteOutNum) * 100, 2); // 进场率（进场人次/场外客流）
    const preSiteEntryRate = preSiteOutNum === 0 ? "100" : StringUtils.toFixed((preInSiteNum / preSiteOutNum) * 100, 2);
    const siteEntryRatePreRate = preSiteEntryRate === 0 ? "100" : StringUtils.toFixed(((siteEntryRate - preSiteEntryRate) / (preSiteEntryRate || 1)) * 100, 2);

    return {
      storeOutNum,
      preStoreOutNum,
      storeOutNumPreRate,
      siteOutNum,
      preSiteOutNum,
      siteOutNumPreRate,
      inSiteCount,
      preInSiteCount,
      inSiteCountPreRate,
      inSiteNum,
      preInSiteNum,
      inSiteNumPreRate,
      storeEntryRate,
      preStoreEntryRate,
      storeEntryRatePreRate,
      siteEntryRate,
      preSiteEntryRate,
      siteEntryRatePreRate,
    };
  }, [siteData]);

  // 客流趋势数据
  const OffSenceFlowTrend = useMemo(() => {
    const { total, outside } = baseData || {};
    const totalData = total?.data || [];
    const outsideData = outside?.data || [];
    // if (!total?.data || !siteFlowTrend) return;

    const calculateLimitType = calculateLimit();
    if (calculateLimitType === "hour" && ["halfHour", "mintue", "hour"].includes(timeGranule)) {
      setTimeGranule("day");
      return;
    }
    if (calculateLimitType === "day" && ["halfHour", "mintue", "hour", "day"].includes(timeGranule)) {
      setTimeGranule("week");
      return;
    }
    if (calculateLimitType === "week") {
      setTimeGranule("month");
      return;
    }

    const storeOutNumArr = []; // 过店客流-总客流下的passNum
    const siteOutNumArr = []; // 场外客流 = 进场人次 + 出场人次
    const inSiteCountArr = []; // 进场人次 = 总客流下出入口进场人次总和
    const inSiteNumArr = []; // 进场人数 = 总客流下出入口进场人数总和
    const storeEntryRateArr = []; // 进店率（进场人次/店外客流）
    const siteEntryRateArr = []; // 进场率（进场人次/场外客流）

    if (!timeRange || !timeRange[0]) return;
    // 使用真实的时间范围生成x轴数据
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRange, timeGranule);
    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      storeOutNumArr[i] = 0;
      siteOutNumArr[i] = 0;
      inSiteCountArr[i] = 0;
      inSiteNumArr[i] = 0;
      storeEntryRateArr[i] = 0;
      siteEntryRateArr[i] = 0;
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);

      totalData.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          storeOutNumArr[i] += item.passNum || 0;
          inSiteCountArr[i] += item.inCount || 0;
          inSiteNumArr[i] += item.inNum || 0;
        }
      });
      outsideData.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          siteOutNumArr[i] += item.inCount || 0;
          siteOutNumArr[i] += item.outCount || 0;
        }
      });

      storeEntryRateArr[i] = storeOutNumArr[i] === 0 ? 0 : StringUtils.toFixed((inSiteCountArr[i] / storeOutNumArr[i]) * 100, 2);
      siteEntryRateArr[i] = siteOutNumArr[i] === 0 ? 0 : StringUtils.toFixed((inSiteCountArr[i] / siteOutNumArr[i]) * 100, 2);
    }

    return {
      chartData: {
        storeOutNumArr,
        siteOutNumArr,
        inSiteCountArr,
        inSiteNumArr,
        storeEntryRateArr,
        siteEntryRateArr,
      },
      xAxisTooltips,
      xAxis,
    };
  }, [baseData, timeGranule]);

  // 客流峰值分析
  const VisitingPeakChartData = useMemo(() => {
    let data = baseType === "OS" ? visitingPeakBaseData.osVisitingPeak : visitingPeakBaseData.visitingPeak;
    if (!data) return null;
    let chartData = DataConverter.getVisitingPeakConvertData(2, data, { peakTimeDesc: Language.PARAM_KELIUGAOFENGSHIDUANZAI, peakValueDesc: Language.PARAM_KELIUGAOFENG });
    return chartData;
  }, [visitingPeakBaseData, baseType]);

  // 出入口分析热力图数据
  const OffSenceDoorAnalysisHeatMapData = useMemo(() => {
    // 数据验证
    if (!Array.isArray(doorAnalysisBaseData)) {
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }
    // 根据baseType选择出入口列表
    const outletList = baseType === "ALL" ? doorList : osDoorList;
    const doorIds = outletList.map((item) => item.value);

    if (doorIds.length === 0 || !doorAnalysisBaseData || doorAnalysisBaseData.length === 0) {
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }

    const timeRangeCurrent = timeRangeRef.current;
    console.log(timeRangeCurrent, "timeRangeCurrent");

    if (!timeRangeCurrent || !timeRangeCurrent[0] || !timeRangeCurrent[1]) {
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }

    // 检查时间粒度限制
    const calculateLimitType = calculateLimit();
    let _timeGranule = offSenceTimeGranule;
    if (calculateLimitType === "hour" && ["halfHour", "mintue", "hour"].includes(offSenceTimeGranule)) {
      _timeGranule = "day";
      setOffSenceTimeGranule("day");
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }
    if (calculateLimitType === "day" && ["halfHour", "mintue", "hour", "day"].includes(offSenceTimeGranule)) {
      _timeGranule = "week";
      setOffSenceTimeGranule("week");
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }
    if (calculateLimitType === "week") {
      _timeGranule = "month";
      setOffSenceTimeGranule("month");
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }

    let yAxis = [];

    try {
      const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRangeForHeatMap(timeRangeCurrent, _timeGranule);

      let doorMap = {};
      doorIds?.forEach((item) => {
        const door = outletList.find((outlet) => outlet.value === item);
        if (door) {
          doorMap[item] = { label: door.label, key: item, total: 0, arr: [] };
        }
      });

      // 根据x轴长度生成对应的y轴数据
      for (let i = 0; i < xAxis.length; i++) {
        // 获取当前时间段的时间戳范围
        const currentTimeSlot = CommonUtils.getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);

        // 每个出口单独时间轴对应数据
        let arrItemSet = {};
        doorIds?.forEach((item) => {
          arrItemSet[item] = [i + 1, 0];
        });

        // 当前时间段数据
        doorAnalysisBaseData.forEach((item) => {
          if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
            // 验证 doorId 是否存在，防止数组越界访问
            if (!arrItemSet[item.doorId] || !doorMap[item.doorId]) {
              return;
            }

            // 验证并转换数值字段，防止 NaN 或 undefined 值
            const passNum = Number(item.passNum) || 0;
            const inCount = Number(item.inCount) || 0;
            const inNum = Number(item.inNum) || 0;
            const outCount = Number(item.outCount) || 0;
            const osFlow = inCount + outCount; // 场外客流 = 进场人次 + 出场人次

            let value = 0;
            // 根据doorAnalysisFlowType选择对应的值
            if (doorAnalysisFlowType === "passNum") {
              value = passNum;
            } else if (doorAnalysisFlowType === "inCount") {
              value = inCount;
            } else if (doorAnalysisFlowType === "inNum") {
              value = inNum;
            } else if (doorAnalysisFlowType === "outCount") {
              value = outCount;
            } else if (doorAnalysisFlowType === "osFlow") {
              value = osFlow;
            }

            arrItemSet[item.doorId][1] += value;
            doorMap[item.doorId].total += value;
          }
        });

        Object.keys(arrItemSet).forEach((item) => {
          doorMap[item].arr.push(arrItemSet[item]);
        });
      }

      // 根据order方式对doorMap进行排序
      const sortedDoorKeys = Object.keys(doorMap).sort((a, b) => {
        if (doorAnalysisOrder === "upOrder") {
          // 总数由高到低
          return doorMap[a].total - doorMap[b].total;
        } else {
          // 总数由低到高
          return doorMap[b].total - doorMap[a].total;
        }
      });

      // 生成yAxis和series数据
      let series = [];
      sortedDoorKeys.forEach((key, index) => {
        yAxis.push(doorMap[key].label);
        const doorTotal = doorMap[key].total;
        // 合计行
        doorMap[key].arr.unshift([0, doorTotal]);

        // 使用数值
        const seriesData = doorMap[key].arr.map((item) => {
          const [timeIndex, value] = item;
          return [index, timeIndex, value];
        });

        series.push(...seriesData);
      });

      xAxis.unshift("合计");
      return {
        xAxis,
        yAxis,
        series,
        xAxisTooltips,
        isPercent: false,
      };
    } catch (error) {
      console.error("Error processing data:", error);
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }
  }, [doorAnalysisBaseData, doorAnalysisFlowType, doorAnalysisOrder, offSenceTimeGranule, baseType, doorList, osDoorList]);

  // 出入口分析时间粒度选项映射
  const doorAnalysisTimeSelectMap = useMemo(() => {
    const timeSelectMap = [
      { value: "hour", label: "按小时" },
      { value: "day", label: "按天" },
      { value: "week", label: "按周" },
      { value: "month", label: "按月" },
    ];
    if (limit === "hour") {
      return timeSelectMap.filter((item) => {
        return item.value !== "hour";
      });
    }
    if (limit === "day") {
      return timeSelectMap.filter((item) => {
        return item.value !== "hour" && item.value !== "day";
      });
    }
    if (limit === "week") {
      return timeSelectMap.filter((item) => {
        return item.value !== "hour" && item.value !== "day" && item.value !== "week";
      });
    }
    return timeSelectMap;
  }, [limit]);

  // 表格数据
  const tableDetailData = useMemo(() => {
    const { total, outside } = baseData || {};
    const totalData = total?.data || [];
    const outsideData = outside?.data || [];

    if (!timeRange || !timeRange[0] || !timeRange[1] || !baseData) {
      return [];
    }

    let tableDetailData = [];

    const isSameDay = timeRange[0].isSame(timeRange[1], "day");
    const _timeGranule = isSameDay ? "hour" : "day";
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRange, _timeGranule, "offSenceAnalyse");

    // 生成表格数据
    for (let i = 0; i < xAxis.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);

      let storeOutNum = 0; // 店外客流
      let siteOutNum = 0; // 场外客流
      let inSiteCount = 0; // 进场人次
      let inSiteNum = 0; // 进场人数

      // 遍历总客流数据，计算店外客流、进场人次、进场人数
      totalData.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          storeOutNum += item.passNum || 0;
          inSiteCount += item.inCount || 0;
          inSiteNum += item.inNum || 0;
        }
      });

      // 遍历场外客流数据，计算场外客流
      outsideData.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          siteOutNum += (item.inCount || 0) + (item.outCount || 0);
        }
      });

      // 计算进店率和进场率
      const storeEntryRate = storeOutNum === 0 ? "0" : StringUtils.toFixed((inSiteCount / storeOutNum) * 100, 2);
      const siteEntryRate = siteOutNum === 0 ? "0" : StringUtils.toFixed((inSiteCount / siteOutNum) * 100, 2);

      let rowObj = {
        key: i,
        date: xAxisTime[i],
        storeOutNum: storeOutNum,
        siteOutNum: siteOutNum,
        inSiteCount: inSiteCount,
        inSiteNum: inSiteNum,
        storeEntryRate: storeEntryRate,
        siteEntryRate: siteEntryRate,
        isSameDay,
      };

      tableDetailData.push(rowObj);
    }
    return tableDetailData;
  }, [baseData]);

  return (
    <Suspense fallback={<Spin size="large" />}>
      <div className="offSenceAnalyse">
        <div className="ui-search-bar">
          <div className="timeContrast" style={{ paddingBottom: "8px" }}>
            <span className="title">时间选择：</span>
            <TimeGranulePicker ref={TimeGranulePickerRef} onTimeChange={handleTimeChange} />
            <div style={{ marginLeft: "16px" }}>分析类型：</div>
            <Select value={baseType} style={{ paddingLeft: "0px", width: 179 }} options={DoorTypeMap} placeholder="请选择" onChange={(value) => setBaseType(value)} />
            <Button
              style={{ marginLeft: "16px" }}
              type="primary"
              size="default"
              onClick={() => {
                // setBaseType(tempBaseType);
                const OVER_STORE_FLOW_PERMISSION = User.checkMasterPermission(Constant.MASTER_POWER.OVER_STORE_COUNT);
                const OUTSIDE_FLOW_PERMISSION = User.checkMasterPermission(Constant.MASTER_POWER.OUTSIDE_COUNT);
                if (!OVER_STORE_FLOW_PERMISSION && !OUTSIDE_FLOW_PERMISSION) {
                  message.warning({ content: "您没有权限访问该页面，请联系管理员" });
                  return;
                }
                searchFun();
                getOffSenceDoorAnalysisFlowFunction();
              }}>
              查询
            </Button>
          </div>
        </div>
        <UIContentLoading loading={loading || analyLoading}>
          <div className="layout-content layout-content-noScroll">
            {(empty || baseType === null) && <Empty />}
            {!empty && baseType !== null && (
              <>
                {/* 数据指标 */}
                <DataIndicator data={DataIndicatorData} isCurrentDay={isCurrentDay} baseType={baseType} />
                {/* 客流趋势 */}
                {OffSenceFlowTrend && (
                  <div className="dualRow">
                    <div className="dualRowContent">
                      <OffSenceFlowTrendChart data={OffSenceFlowTrend} timeGranule={timeGranule} onTimeGranuleChange={handleTimeGranuleChange} limit={limit} baseType={baseType} />
                    </div>
                  </div>
                )}
                {/* 到访峰值 */}
                <div className="dualRow">
                  <div className="dualRowContent">
                    <VisitingPeakChartPanelByOffSence data={VisitingPeakChartData} type={baseType} />
                  </div>
                </div>
                {/* 出入口分析 */}
                <div className="dualRow">
                  <div className="dualRowContentSingle">
                    <OffSenceDoorAnalysisChartPanel
                      data={OffSenceDoorAnalysisHeatMapData}
                      timeGranule={offSenceTimeGranule}
                      onTimeGranuleChange={setOffSenceTimeGranule}
                      timeSelectMap={doorAnalysisTimeSelectMap}
                      flowType={doorAnalysisFlowType}
                      onFlowTypeChange={setDoorAnalysisFlowType}
                      order={doorAnalysisOrder}
                      onOrderChange={setDoorAnalysisOrder}
                      selectedDoorIds={(baseType === "ALL" ? doorList : osDoorList).map((item) => item.value)}
                    />
                  </div>
                </div>
                {/* 数据详情 */}
                <TableDetail data={tableDetailData} timeRange={timeRange} baseType={baseType} />
                <ICPComponent />
              </>
            )}
          </div>
        </UIContentLoading>
      </div>
    </Suspense>
  );
}
// export default OffSenceAnalyse;
