import "./index.less";
import { Button, Select, message, Spin } from "antd";
import { useCallback, useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Language, text } from "@/language/LocaleContext";
import dayjs from "dayjs";
import { CustomerFloorTrendChart, CustomerAttrChart, CustomerMoodChart } from "./components/Charts";
import {
  GrowthRateChartPanel,
  VisitingPeakChartPanel,
  CustomerPortraitCompareBarChartPanel,
  CustomerMoodCompareBarChartPanel,
  SmallFloorTransformChartPanel,
  DoorRankingChartPanel,
} from "@/components/common/panels/ChartPanel";
import { TimeGranulePicker } from "@/components/common/timeGranulePicker";
import { TableDetail } from "./components/TableDetail";
import CommonUtils from "@/utils/CommonUtils";
import StringUtils from "@/utils/StringUtils";

import Empty from "@/components/common/Empty";
import { FlowSelect, ICPComponent, UIContentLoading } from "@/components/ui/UIComponent";
import TimeUtils from "@/utils/TimeUtils";
import Constant from "@/common/Constant";
import DataConverter from "@/data/DataConverter";
import User from "@/data/UserData";

import Http from "@/config/Http";
import { useSite } from "@/context/SiteContext";
import { isArray, set, sum } from "lodash";
import { ageEnums, genderEnums, faceEnums } from "./const";

/**楼层分析 */
function FloorAnalyse() {
  const TimeGranulePickerRef = useRef(null);
  // const [FloorFlowTrend, setFloorFlowTrend] = useState(null);
  const [baseData, setBaseData] = useState({ flowTrend: null, siteFlowTrend: null }); // 基础数据
  const [doorRankingData, setDoorRankingData] = useState({ ranking: null });
  const [customerAttrData, setCustomerAttrData] = useState(null);
  const [customerMoodData, setCustomerMoodData] = useState(null);
  const [customerPortraitData, setCustomerPortraitData] = useState(null); // 客群属性对比
  const [customerMoodCompareData, setCustomerMoodCompareData] = useState(null); // 客群心情对比
  const [visitingPeakData, setVisitingPeakData] = useState({
    chartType: 1,
    chartData: null,
    data: null,
  }); // 到访峰值
  const [growthRateData, setGrowthRateData] = useState({
    flowType: User.flowTrendSelection[0].value,
    data: null,
  });
  // 楼层客流转换
  const [floorTransformData, setFloorTransformData] = useState({
    flowSelection: [
      { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
      { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
    ],
    flowType: Constant.FLOW_TYPE.IN_COUNT,
    chartData: null,
  });
  const [doorFlowTotals, setDoorFlowTotals] = useState({});
  const [siteTotal, setSiteTotal] = useState({ siteTotalInCount: 0, siteTotalInNum: 0 });
  const [flowTableData, setFlowTableData] = useState([]);
  const [faceTableData, setFaceTableData] = useState([]);

  const [floorList, setFloorList] = useState([]); // 楼层列表
  const [floorObject, setFloorObject] = useState({}); // 楼层对象 {floorId, floorName, doors}
  const [doorsMap, setDoorsMap] = useState({}); // 出入口映射表 用于记录出入口id所属楼层
  const [selectedFloorIds, setSelectedFloorIds] = useState([]); // 选择器楼层ID列表
  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]); // 时间范围，默认为今天
  const [timeGranule, setTimeGranule] = useState("hour"); // 时间粒度，默认为小时
  const [customerFlowType, setCustomerFlowType] = useState("inCount"); // 客流类型
  const [limit, setLimit] = useState(null); // 限制

  const [empty, setEmpty] = useState(true); // 空状态
  const [loading, setLoading] = useState(false); // 加载状态
  const location = useLocation();
  const { siteId, setSiteId, businessHours } = useSite();

  // 场地改变后获取楼层
  useEffect(() => {
    if (siteId) {
      getFloorList();
    }
  }, [siteId]);

  const getFloorList = () => {
    Http.getFloorList({ siteId: siteId }, (res) => {
      if (res.result === 1) {
        let _floorObject = {};
        let _doorsMap = {};

        const _floorList = res.data.map((item) => {
          _floorObject[item.floorId] = item;

          isArray(item.doors) &&
            item.doors.length > 0 &&
            item.doors.forEach((door) => {
              _doorsMap[door] = { floorId: item.floorId, floorName: item.floorName };
            });

          return {
            label: item.floorName,
            value: item.floorId,
            key: item.floorId,
            doors: item.doors,
          };
        });

        res.data.forEach((item) => {
          _doorsMap[item.outletId] = item;
        });

        setDoorsMap(_doorsMap);
        setFloorList(_floorList);
        setFloorObject(_floorObject);
      } else {
        message.warning({ content: Response.msg });
      }
    });
  };

  const handleTimeChange = useCallback((value) => {
    setTimeRange(value);
  }, []);

  // 查询
  const searchFun = async () => {
    message.config({
      maxCount: 3,
    });
    if (!timeRange || !timeRange[0]) {
      message.warning({ content: "时间范围不能为空" });
      return;
    }
    if (!selectedFloorIds || !Array.isArray(selectedFloorIds) || selectedFloorIds.length === 0) {
      message.warning({ content: "楼层不能为空" });
      return;
    }
    setLoading(true);
    setLimit(calculateLimit());

    let Params = {
      siteId: siteId,
      floorIds: selectedFloorIds.join(","),
      startDate: timeRange[0].format("YYYY-MM-DD"),
      endDate: timeRange[1].format("YYYY-MM-DD"),
    };

    try {
      Http.getFloorData(Params, (Response) => {
        try {
          if (Response.result === 1) {
            const { siteFlowTrend, flowTrend } = Response.data;
            // 累加场地 inCount 和 inNum 的值
            let siteTotalInCount = 0;
            let siteTotalInNum = 0;
            if (Array.isArray(siteFlowTrend)) {
              siteFlowTrend.forEach((item) => {
                siteTotalInCount += Number(item.inCount) < 0 ? 0 : Number(item.inCount) || 0;
                siteTotalInNum += Number(item.inNum) < 0 ? 0 : Number(item.inNum) || 0;
              });
            }
            // 将每个 doorId 的 inCount, batchCount, inNum, outNum, outCount 累加
            let doorFlowTotals = {};
            if (Array.isArray(flowTrend)) {
              flowTrend.forEach((item) => {
                const doorId = item.doorId;
                if (!doorFlowTotals[doorId]) {
                  doorFlowTotals[doorId] = {
                    inCount: 0,
                    batchCount: 0,
                    inNum: 0,
                    outNum: 0,
                    outCount: 0,
                  };
                }
                doorFlowTotals[doorId].inCount += Number(item.inCount) < 0 ? 0 : Number(item.inCount) || 0;
                doorFlowTotals[doorId].batchCount += Number(item.batchCount) < 0 ? 0 : Number(item.batchCount) || 0;
                doorFlowTotals[doorId].inNum += Number(item.inNum) < 0 ? 0 : Number(item.inNum) || 0;
                doorFlowTotals[doorId].outNum += Number(item.outNum) < 0 ? 0 : Number(item.outNum) || 0;
                doorFlowTotals[doorId].outCount += Number(item.outCount) < 0 ? 0 : Number(item.outCount) || 0;
              });
            }
            setDoorFlowTotals(doorFlowTotals);
            setSiteTotal({ siteTotalInCount: siteTotalInCount, siteTotalInNum: siteTotalInNum });
            setBaseData({ flowTrend: flowTrend, siteFlowTrend: siteFlowTrend });

            let timeType = timeRange[1].diff(timeRange[0], "day") >= 364 ? Constant.TIME_TYPE.YEAR : Constant.TIME_TYPE.DATE;
            setSiteGrowthRateData(timeType, growthRateData.flowType, Response.data.growthRate);
            setSiteVisitingPeakData(visitingPeakData.chartType, Response.data.visitingPeak);
            getCustomeAttrData(Response.data.faceData);
            getCustomeMoodData(Response.data.faceData);
            getCustomerMoodAndPortraitCompareData(Response.data.faceData);
            setSiteDoorRankingData(Response.data.doorsRanking);
            setSiteFloorTransformData(floorTransformData.flowType, siteTotalInCount, siteTotalInNum, doorFlowTotals);
            getTableDetailData(flowTrend, Response.data.faceData);
            // getCustomerFlowTimeHeatMapData(flowTrend);
            setEmpty(false);
          } else {
            message.warning({ content: Response.msg });
          }
          setLoading(false);
        } catch (innerError) {
          console.error("数据处理错误:", innerError);
          message.error({ content: "数据处理错误" });
        }
      });
    } catch (error) {
      console.error("请求失败:", error);
      message.warning({ content: "请求失败" });
      setLoading(false);
    }
  };

  // 处理趋势图时间粒度变化
  const handleTimeGranuleChange = useCallback(
    (value) => {
      setTimeGranule(value);
    },
    [timeGranule]
  );

  const onChangeCustomerFlowType = useCallback(
    (value) => {
      setCustomerFlowType(value);
    },
    [customerFlowType]
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
    if (timeRange[1].diff(timeRange[0], "day") > 61) {
      return "day";
    }
    if (timeRange[1].diff(timeRange[0], "day") >= 1) {
      return "hour";
    }

    return null;
  };

  // 楼层客流趋势数据
  const FloorFlowTrend = useMemo(() => {
    const { flowTrend, siteFlowTrend } = baseData;
    if (!Array.isArray(selectedFloorIds) || selectedFloorIds.length === 0) return;
    // const type = customerFlowType;
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
    if (!timeRange || !timeRange[0]) return;
    // 使用真实的时间范围生成x轴数据
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRange, timeGranule);
    // 场地总数
    let siteIntervalTotal = [];
    let floorIntervalTotal = {};

    // 初始化 floorIntervalTotal，为每个选中的楼层创建对象
    if (Array.isArray(selectedFloorIds) && selectedFloorIds.length > 0) {
      selectedFloorIds.forEach((floorId) => {
        const floor = floorObject[floorId];
        if (floor) {
          floorIntervalTotal[floorId] = {
            floorId: floorId,
            floorName: floor.floorName,
            data: new Array(xAxis.length).fill(0), // 初始化时间段数组
            sum: 0,
          };
        }
      });
    }

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      // 初始化当前时间段的场地总数
      if (siteIntervalTotal[i] === undefined) {
        siteIntervalTotal[i] = 0;
      }

      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);
      siteFlowTrend.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          siteIntervalTotal[i] += item[customerFlowType] < 0 ? 0 : item[customerFlowType] || 0;
        }
      });

      flowTrend.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          // 判断 item 的 doorId 所属的 floorId
          const doorInfo = doorsMap[item.doorId];
          if (doorInfo && doorInfo.floorId) {
            const floorId = doorInfo.floorId;
            // 如果该楼层在 floorIntervalTotal 中，则累加到对应时间段的数据中
            if (floorIntervalTotal[floorId]) {
              floorIntervalTotal[floorId].data[i] += item[customerFlowType] < 0 ? 0 : item[customerFlowType] || 0;
              floorIntervalTotal[floorId].sum += item[customerFlowType] < 0 ? 0 : item[customerFlowType] || 0;
            }
          }
        }
      });
    }

    // 抵达率计算
    Object.values(floorIntervalTotal).forEach((floor) => {
      floor.arriveRate = floor.data.map((val, idx) => {
        const total = siteIntervalTotal[idx] || 0;
        if (total <= 0) return 0;
        return StringUtils.toFixed((val / total) * 100, 2);
      });
    });

    let peakFloor = null;
    let PeakFloorName = "";
    let PeakFloorValue = 0;
    let PeakFloorTime = "";
    let PeakFloorAvg = 0;
    let PeakFloorMedian = 0;

    const floors = Object.values(floorIntervalTotal);

    // 峰值楼层
    peakFloor = floors[0];
    for (let i = 1; i < floors.length; i++) {
      const cur = floors[i];
      if ((cur.sum || 0) > (peakFloor.sum || 0)) {
        peakFloor = cur;
      }
    }

    const dataArr = Array.isArray(peakFloor.data) ? peakFloor.data : [];
    if (dataArr.length > 0) {
      // 峰值与峰值时间
      let maxIdx = 0;
      for (let i = 1; i < dataArr.length; i++) {
        if ((dataArr[i] || 0) > (dataArr[maxIdx] || 0)) {
          maxIdx = i;
        }
      }
      PeakFloorValue = dataArr[maxIdx] || 0;
      PeakFloorTime = xAxisTooltips && xAxisTooltips[maxIdx] ? xAxisTooltips[maxIdx] : "";
      PeakFloorName = peakFloor.floorName || "";

      // 过滤有效数据：排除未来时间段的数据
      const currentTime = dayjs().unix();
      let validDataArr = [];

      for (let i = 0; i < dataArr.length; i++) {
        const dataValue = dataArr[i];
        const timeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);
        if (currentTime >= timeSlot.startTime) {
          validDataArr.push(dataValue);
        }
      }

      // 超过当前时间的数据不做为有效数据，且如果是单日的情况下有效数据采用营业时间段内数据
      const isSameDay = timeRange[0].isSame(timeRange[1]);
      if (isSameDay && timeGranule === "hour") {
        validDataArr = validDataArr?.slice(businessHours[0], businessHours[1]);
      }

      // 平均数（使用有效数据）
      PeakFloorAvg = validDataArr.length ? StringUtils.toFixed(sum(validDataArr) / validDataArr.length, 0) : 0;

      // 中位数（使用有效数据）
      const sorted = [...validDataArr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      PeakFloorMedian = sorted.length > 0 ? StringUtils.toFixed(median, 0) : 0;
    }
    return {
      floorIntervalTotal,
      xAxisTooltips,
      xAxis,
      peakFloor,
      PeakFloorName,
      PeakFloorValue,
      PeakFloorTime,
      PeakFloorAvg,
      PeakFloorMedian,
    };
  }, [baseData, customerFlowType, timeGranule]);

  // 楼层转化类型切换
  const onChangeFloorTransformFlowType = (flowType) => {
    const { siteTotalInCount, siteTotalInNum } = siteTotal;
    setSiteFloorTransformData(flowType, siteTotalInCount, siteTotalInNum, doorFlowTotals);
  };

  // 楼层转化
  const setSiteFloorTransformData = (flowType, siteTotalInCount, siteTotalInNum, doorFlowTotals) => {
    let total = flowType == Constant.FLOW_TYPE.IN_COUNT ? siteTotalInCount : siteTotalInNum;
    let converData = [];
    let arriveData = {
      yAxis: [],
      data: [],
      rateData: [],
    };

    Object.values(floorObject).forEach((floor) => {
      if (!selectedFloorIds.includes(floor.floorId)) return;
      let value = 0;
      let doors = floor.doors;

      if (doors?.length > 0) {
        for (let j = 0; j < doors?.length; j++) {
          let doorId = doors[j];
          if (doorFlowTotals[doorId]) {
            value += Number(doorFlowTotals[doorId][flowType]);
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
        rate = StringUtils.toFixed(rate, 2);

        arriveData.yAxis.push(floor.floorName);
        arriveData.data.push(value);
        arriveData.rateData.push(rate);
        converData.push(cvData);
      }
    });

    let chartData = {
      converData,
      arriveData,
    };
    setFloorTransformData({ ...floorTransformData, flowType: flowType, chartData: chartData });
  };

  // 出入口热度
  const setSiteDoorRankingData = (data) => {
    const columns = new Array();
    columns.push({ title: Language.PAIMING, key: "ranking" });
    columns.push({ title: Language.CHURUKOU, key: "name" });
    columns.push({ title: Language.JINCHANGRENCI, key: "inCount" });
    columns.push({ title: Language.JINCHANGRENSHU, key: "inNum" });
    columns.push({ title: Language.KELIUPICI, key: "batchCount" });
    columns.push({ title: Language.ZHANBI, key: "ratio" });
    columns.push({ title: Language.HUANBI, key: "qoq" });
    let list = DataConverter.getDooorRankingConvertData(data);
    let rankingData = {
      columns,
      list,
    };
    setDoorRankingData({ ranking: rankingData });
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

  // 定基类型切换
  const onChangeGrowthRateFlowType = (flowType) => {
    let timeType = timeRange[1].diff(timeRange[0], "day") >= 364 ? Constant.TIME_TYPE.YEAR : Constant.TIME_TYPE.DATE;
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

  // 获取客户心情和客群属性对比数据
  const getCustomerMoodAndPortraitCompareData = (faceData) => {
    let baseData = {};
    // 遍历字典初始化 返回例如{1: 0, 2: 0, 3: 0}
    const initGender = Object.keys(genderEnums).reduce((obj, key) => {
      obj[key] = 0;
      return obj;
    }, {});
    const initAge = Object.keys(ageEnums).reduce((obj, key) => {
      obj[key] = 0;
      return obj;
    }, {});
    const initMood = Object.keys(faceEnums).reduce((obj, key) => {
      obj[key] = 0;
      return obj;
    }, {});

    floorList.forEach((floor) => {
      baseData[floor.key] = {
        floorId: floor.key,
        floorName: floor.label,
        male: { ...initMood },
        female: { ...initMood },
        gender: { ...initGender },
        age: { ...initAge },
      };
    });
    let maleArr = [];
    let femaleArr = [];
    let ageArr = [];
    let siteArr = [];
    let genderArr = [];

    if (isArray(faceData) && faceData.length > 0) {
      // 分类数据生成每层楼数据 baseData为每个楼层数据
      faceData.forEach((item) => {
        const floorId = doorsMap[item.doorId].floorId; // 找到数据所属楼层id
        if (baseData[floorId]) {
          item.gender === 1 ? (baseData[floorId].male[item.face] = item.count) : (baseData[floorId].female[item.face] += item.count);
          baseData[floorId].gender[item.gender] = baseData[floorId].gender[item.gender] + item.count;
          baseData[floorId].age[item.age] += item.count;
        }
      });

      // let genderTotal = 0
      Object.values(genderEnums).forEach((item) => {
        let data = selectedFloorIds.map((floorId) => {
          const floorData = baseData[floorId];
          return floorData.gender[item.key];
        });
        genderArr.push({ title: item.title, data });
      });

      Object.values(ageEnums).forEach((item) => {
        let data = selectedFloorIds.map((floorId) => {
          const floorData = baseData[floorId];
          return floorData.age[item.key];
        });
        ageArr.push({ title: item.title, data });
      });

      Object.values(faceEnums).forEach((item) => {
        let data = selectedFloorIds.map((floorId) => {
          const floorData = baseData[floorId];
          return floorData.male[item.key];
        });
        maleArr.push({ title: item.title, data });
      });

      Object.values(faceEnums).forEach((item) => {
        let data = selectedFloorIds.map((floorId) => {
          const floorData = baseData[floorId];
          return floorData.female[item.key];
        });
        femaleArr.push({ title: item.title, data });
      });

      selectedFloorIds.forEach((floorId) => {
        const floorData = baseData[floorId];
        siteArr.push(floorData.floorName);
      });
    }
    setCustomerPortraitData({ site: siteArr, gender: genderArr, age: ageArr });
    setCustomerMoodCompareData({ site: siteArr, male: maleArr, female: femaleArr });
  };

  // 获取表格详情数据
  const getTableDetailData = (flowTrend, faceData, compareFlowTrend) => {
    let xAxisLength = 0;
    let _xAxisTime = [];
    let _passXAxisTime = [];
    let flowTableData = [];
    let faceTableData = [];
    let timeSpan = 1;
    timeSpan = timeRange[1].diff(timeRange[0], "day") + 1;
    const passTimeRange = [timeRange[0].add(-timeSpan, "day"), timeRange[1].add(-timeSpan, "day")];
    const isSameDay = timeRange[0].isSame(timeRange[1]);
    const floorNames = selectedFloorIds
      .map((floorId) => floorObject[floorId]?.floorName)
      .filter(Boolean)
      .join(",");

    // 24小时版本
    if (isSameDay) {
      const { xAxis, xAxisTime } = CommonUtils.generateXAxisFromTimeRange(timeRange, "hour");
      const { xAxis: passXAxis, xAxisTime: passXAxisTime } = CommonUtils.generateXAxisFromTimeRange(passTimeRange, "hour");
      xAxisLength = xAxis.length;
      _xAxisTime = xAxisTime;
      _passXAxisTime = passXAxisTime;
    } else {
      const { xAxis, xAxisTime } = CommonUtils.generateXAxisFromTimeRange(timeRange, "day");
      const { xAxis: passXAxis, xAxisTime: passXAxisTime } = CommonUtils.generateXAxisFromTimeRange(passTimeRange, "day");
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

    // 处理对比数据
    const safeCompareFlowTrend = Array.isArray(compareFlowTrend) && compareFlowTrend.length > 0 ? compareFlowTrend : [];
    const safeFaceData = Array.isArray(faceData) ? faceData : [];

    // 按时间段处理数据（不区分楼层，汇总所有选中楼层的数据）
    for (let i = 0; i < xAxisLength; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(_xAxisTime[i], _xAxisTime[i + 1]);
      const passTimeSlot = getTimeSlotByIndex(_passXAxisTime[i], _passXAxisTime[i + 1]);
      let rowObj = {
        key: i,
        date: _xAxisTime[i],
        floorName: floorNames,
        inCount: 0,
        batchCount: 0,
        inNum: 0,
        inCountCompare: 0,
        batchCountCompare: 0,
        inNumCompare: 0,
        isSameDay,
        _rowSpan: 1,
      };

      flowTrend.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
          const doorInfo = doorsMap[item.doorId];
          // 只统计选中楼层的数据
          if (doorInfo && doorInfo.floorId && selectedFloorIds.includes(doorInfo.floorId)) {
            rowObj.inCount = rowObj.inCount + (item.inCount || 0);
            rowObj.inNum = rowObj.inNum + (item.inNum || 0);
            rowObj.batchCount = rowObj.batchCount + (item.batchCount || 0);
          }
        }
      });
      safeCompareFlowTrend.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= passTimeSlot.startTime && dataTime < passTimeSlot.endTime) {
          const doorInfo = doorsMap[item.doorId];
          // 只统计选中楼层的数据
          if (doorInfo && doorInfo.floorId && selectedFloorIds.includes(doorInfo.floorId)) {
            rowObj.inCountCompare = rowObj.inCountCompare + (item.inCount || 0);
            rowObj.inNumCompare = rowObj.inNumCompare + (item.inNum || 0);
            rowObj.batchCountCompare = rowObj.batchCountCompare + (item.batchCount || 0);
          }
        }
      });
      // 分时占比
      rowObj.inCountRatio = StringUtils.toFixed((rowObj.inCount / (baseFlowTotal.inCount || 1)) * 100, 2);
      rowObj.inNumRatio = StringUtils.toFixed((rowObj.inNum / (baseFlowTotal.inNum || 1)) * 100, 2);
      rowObj.batchRatio = StringUtils.toFixed((rowObj.batchCount / (baseFlowTotal.batchCount || 1)) * 100, 2);

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
        floorName: floorNames,
        _rowSpan: 2, // 设置行合并数为2（男性和女性两行）
      };

      let rowAgeObj2 = {
        ...rowAgeObj,
        key: i * 2 + 1,
        gender: 2,
        _rowSpan: 0, // 第二行不显示日期，被合并
      };

      safeFaceData.map((item) => {
        const dataTime = item.dataTime;
        if (dataTime >= currentTimeSlot.startTime && dataTime < currentTimeSlot.endTime) {
          const doorInfo = doorsMap[item.doorId];
          // 只统计选中楼层的数据
          if (doorInfo && doorInfo.floorId && selectedFloorIds.includes(doorInfo.floorId)) {
            if (item.gender === 1) {
              rowAgeObj.toddler = item.age === 1 ? rowAgeObj.toddler + (item.count || 0) : rowAgeObj.toddler;
              rowAgeObj.child = item.age === 2 ? rowAgeObj.child + (item.count || 0) : rowAgeObj.child;

              rowAgeObj.youngAdult = item.age === 4 ? rowAgeObj.youngAdult + (item.count || 0) : rowAgeObj.youngAdult;
              rowAgeObj.middleAge = item.age === 5 ? rowAgeObj.middleAge + (item.count || 0) : rowAgeObj.middleAge;
              rowAgeObj.elderly = item.age === 6 ? rowAgeObj.elderly + (item.count || 0) : rowAgeObj.elderly;
              rowAgeObj.ageUnknown = item.age === 7 ? rowAgeObj.ageUnknown + (item.count || 0) : rowAgeObj.ageUnknown;
              rowAgeObj.anger = item.face === 1 ? rowAgeObj.anger + (item.count || 0) : rowAgeObj.anger;
              rowAgeObj.sadness = item.face === 2 ? rowAgeObj.sadness + (item.count || 0) : rowAgeObj.sadness;
              rowAgeObj.disgust = item.face === 3 ? rowAgeObj.disgust + (item.count || 0) : rowAgeObj.disgust;
              rowAgeObj.fear = item.face === 4 ? rowAgeObj.fear + (item.count || 0) : rowAgeObj.fear;
              rowAgeObj.surprise = item.face === 5 ? rowAgeObj.surprise + (item.count || 0) : rowAgeObj.surprise;
              rowAgeObj.calm = item.face === 6 ? rowAgeObj.calm + (item.count || 0) : rowAgeObj.calm;
              rowAgeObj.happy = item.face === 7 ? rowAgeObj.happy + (item.count || 0) : rowAgeObj.happy;
              rowAgeObj.confused = item.face === 8 ? rowAgeObj.confused + (item.count || 0) : rowAgeObj.confused;
              rowAgeObj.faceUnknown = item.face === 9 ? rowAgeObj.faceUnknown + (item.count || 0) : rowAgeObj.faceUnknown;
            } else if (item.gender === 2) {
              rowAgeObj2.toddler = item.age === 1 ? rowAgeObj2.toddler + (item.count || 0) : rowAgeObj2.toddler;
              rowAgeObj2.child = item.age === 2 ? rowAgeObj2.child + (item.count || 0) : rowAgeObj2.child;

              rowAgeObj2.youngAdult = item.age === 4 ? rowAgeObj2.youngAdult + (item.count || 0) : rowAgeObj2.youngAdult;
              rowAgeObj2.middleAge = item.age === 5 ? rowAgeObj2.middleAge + (item.count || 0) : rowAgeObj2.middleAge;
              rowAgeObj2.elderly = item.age === 6 ? rowAgeObj2.elderly + (item.count || 0) : rowAgeObj2.elderly;
              rowAgeObj2.ageUnknown = item.age === 7 ? rowAgeObj2.ageUnknown + (item.count || 0) : rowAgeObj2.ageUnknown;
              rowAgeObj2.anger = item.face === 1 ? rowAgeObj2.anger + (item.count || 0) : rowAgeObj2.anger;
              rowAgeObj2.sadness = item.face === 2 ? rowAgeObj2.sadness + (item.count || 0) : rowAgeObj2.sadness;
              rowAgeObj2.disgust = item.face === 3 ? rowAgeObj2.disgust + (item.count || 0) : rowAgeObj2.disgust;
              rowAgeObj2.fear = item.face === 4 ? rowAgeObj2.fear + (item.count || 0) : rowAgeObj2.fear;
              rowAgeObj2.surprise = item.face === 5 ? rowAgeObj2.surprise + (item.count || 0) : rowAgeObj2.surprise;
              rowAgeObj2.calm = item.face === 6 ? rowAgeObj2.calm + (item.count || 0) : rowAgeObj2.calm;
              rowAgeObj2.happy = item.face === 7 ? rowAgeObj2.happy + (item.count || 0) : rowAgeObj2.happy;
              rowAgeObj2.confused = item.face === 8 ? rowAgeObj2.confused + (item.count || 0) : rowAgeObj2.confused;
              rowAgeObj2.faceUnknown = item.face === 9 ? rowAgeObj2.faceUnknown + (item.count || 0) : rowAgeObj2.faceUnknown;
            }
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
    <Suspense fallback={<Spin size="large" />}>
      <div className="floorAnalyse">
        <div className="ui-search-bar">
          <div className="timeContrast">
            <span className="title">时间选择：</span>
            <TimeGranulePicker ref={TimeGranulePickerRef} onTimeChange={handleTimeChange} />
            <span className="title" style={{ paddingLeft: "16px" }}>
              楼层选择：
            </span>
            <Select
              size="default"
              value={selectedFloorIds}
              mode="multiple"
              allowClear
              onClear={() => {
                setSelectedFloorIds([]);
              }}
              style={{ width: 300 }}
              options={floorList}
              onChange={(v) => {
                if (v.length > 5) {
                  message.error("最多选择5个楼层");
                  return;
                }
                setSelectedFloorIds(v);
              }}
              maxTagCount={2}
              maxTagTextLength={5}
              placeholder="请选择楼层"
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
        <UIContentLoading loading={loading}>
          <div className="layout-content layout-content-noScroll">
            {empty && <Empty />}
            {!empty && (
              <>
                {/* 楼层趋势 */}
                <div className="dualRow">
                  <div className="dualRowContent">
                    <CustomerFloorTrendChart
                      data={FloorFlowTrend}
                      onTimeGranuleChange={handleTimeGranuleChange}
                      customerFlowType={customerFlowType}
                      onChangeCustomerFlowType={onChangeCustomerFlowType}
                      timeGranule={timeGranule}
                      timeRange={timeRange}
                      limit={limit}
                    />
                  </div>
                </div>
                <div className="dualRow">
                  {/* 楼层转化 */}
                  <div className="dualRowContent">
                    <SmallFloorTransformChartPanel
                      title={Language.LOUCENGZHUANHUA}
                      data={floorTransformData.chartData}
                      extra={<FlowSelect defaultValue={floorTransformData?.flowType} options={floorTransformData.flowSelection} onChange={onChangeFloorTransformFlowType} />}
                    />
                  </div>
                  {/* 出入口热度 */}
                  <div className="dualRowContent">
                    <DoorRankingChartPanel title={Language.CHURUKOUREDU} data={doorRankingData} />
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
                  {/* 客户属性 */}
                  <div className="dualRowContent">{customerAttrData && <CustomerAttrChart data={customerAttrData} />}</div>
                  {/* 客户心情 */}
                  <div className="dualRowContent">{customerMoodData && <CustomerMoodChart data={customerMoodData} />}</div>
                </div>
                <div className="dual-row" style={{ minHeight: "697px" }}>
                  <CustomerPortraitCompareBarChartPanel title={Language.KEQUNHUAXIANGDUIBI} className="dual-row-content" data={customerPortraitData} />
                  <CustomerMoodCompareBarChartPanel title={Language.KEQUNXINQINGDUIBI} className="dual-row-content" data={customerMoodCompareData} />
                </div>
                {/* 数据详情 */}
                <TableDetail flowData={flowTableData} faceTableData={faceTableData} timeRange={timeRange} />
                <ICPComponent />
              </>
            )}
          </div>
        </UIContentLoading>
      </div>
    </Suspense>
  );
}
export default FloorAnalyse;
