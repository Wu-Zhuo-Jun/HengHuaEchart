import "./index.less";
import { Button, Select, Radio, message, Spin } from "antd";
import { useCallback, useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Language, text } from "@/language/LocaleContext";
import dayjs from "dayjs";
import { CustomerGroupChart, GenderStatisticsChart } from "./components/Charts";
import CustomerSurvery from "./components/CustomerSurvery";
import { TimeGranulePicker } from "@/components/common/timeGranulePicker";
import { TableDetail } from "./components/TableDetail";
import CommonUtils from "@/utils/CommonUtils";
import StringUtils from "@/utils/StringUtils";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import Empty from "@/components/common/Empty";
import { FlowSelect, ICPComponent, UIContentLoading, UITooltipQuestion } from "@/components/ui/UIComponent";
import Constant from "@/common/Constant";
import ArrayUtils from "@/utils/ArrayUtils";

import Http from "@/config/Http";
import { useSite } from "@/context/SiteContext";
import { ageEnums, genderEnums, timeSelectMap, timeGranuleSpanLimits } from "@/data/const";

/**顾客洞察 */
function RegionAnalyse() {
  const TimeGranulePickerRef = useRef(null);
  const [genderSelect, setGenderSelect] = useState(["ALL"]);
  const [ageSelect, setAgeSelect] = useState(["ALL"]);
  const [expand, setExpand] = useState(false);

  const [siteData, setSiteData] = useState({ curStats: null, preStats: null });
  const [curBaseData, setCurBaseData] = useState({ female: [], male: [] }); // 基础数据
  const [preBaseData, setPreBaseData] = useState({ female: [], male: [] }); // 往期数据
  const [lastWeekBaseData, setLastWeekBaseData] = useState({ female: [], male: [] }); // 上周基础数据
  const [isSameDay, setIsSameDay] = useState(false);
  const [isCurrentDay, setIsCurrentDay] = useState(false);
  const [baseData, setBaseData] = useState(null);
  const [tableDetailData, setTableDetailData] = useState(null);

  const [timeRange, setTimeRange] = useState([dayjs(), dayjs()]); // 时间范围，默认为今天
  const [timeRangeReal, setTimeRangeReal] = useState([dayjs(), dayjs()]); // 实际时间范围，默认为今天
  const [genderTimeGranule, setGenderTimeGranule] = useState("hour"); // 性别时间粒度，默认为小时
  const [ageTimeGranule, setAgeTimeGranule] = useState("hour"); // 年龄时间粒度，默认为小时
  const [limit, setLimit] = useState(null); // 限制
  const [timeGranule, setTimeGranule] = useState("hour"); // 时间粒度，默认为小时
  const [selectedRegions, setSelectedRegions] = useState([]); // 选中的区域
  const [regionOptions, setRegionOptions] = useState([]); // 区域选项
  const [statisticsPeriod, setStatisticsPeriod] = useState("fullDay"); // 统计时段：fullDay-全天查询, timeSlot-时段查询
  const [startHour, setStartHour] = useState(null); // 时段查询开始时间
  const [endHour, setEndHour] = useState(null); // 时段查询结束时间

  // 开始时间选项（0-23点）
  const startHourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      label: `${String(i).padStart(2, "0")}:00`,
      value: i,
    }));
  }, []);

  // 结束时间选项（1-24点），根据开始时间过滤
  const endHourOptions = useMemo(() => {
    if (startHour === null) {
      return Array.from({ length: 24 }, (_, i) => ({
        label: `${String(i + 1).padStart(2, "0")}:00`,
        value: i + 1,
      }));
    }
    return Array.from({ length: 24 - startHour }, (_, i) => ({
      label: `${String(startHour + i + 1).padStart(2, "0")}:00`,
      value: startHour + i + 1,
    }));
  }, [startHour]);

  // 处理开始时间变化
  const handleStartHourChange = useCallback(
    (value) => {
      setStartHour(value);
      // 如果结束时间小于等于新的开始时间，清除结束时间
      if (endHour !== null && endHour <= value) {
        setEndHour(null);
      }
    },
    [endHour]
  );

  const [empty, setEmpty] = useState(true); // 空状态
  const [loading, setLoading] = useState(false); // 加载状态
  const location = useLocation();
  const { siteId, setSiteId } = useSite();

  // 年龄筛选条件
  const ageEnumsSelect = useMemo(() => {
    if (ageSelect.includes("ALL")) {
      return ageEnums;
    } else {
      const selectedAgeEnums = {};
      ageSelect.forEach((ageValue) => {
        if (ageEnums[ageValue]) {
          selectedAgeEnums[ageValue] = ageEnums[ageValue];
        }
      });
      return selectedAgeEnums;
    }
  }, [ageSelect]);

  // 性别筛选条件
  const genderEnumsSelect = useMemo(() => {
    if (genderSelect.includes("ALL")) {
      return genderEnums;
    } else {
      const selectedGenderEnums = {};
      genderSelect.forEach((genderValue) => {
        if (genderEnums[genderValue]) {
          selectedGenderEnums[genderValue] = genderEnums[genderValue];
        }
      });
      return selectedGenderEnums;
    }
  }, [genderSelect]);

  // 场地改变
  useEffect(() => {
    setSelectedRegions([]); // 切换站点时清空已选区域
    const genderSelect = localStorage.getItem("customerInsight_genderSelect");
    if (genderSelect) {
      setGenderSelect(genderSelect.split(",").map((item) => Number(item)));
    }
    const ageSelect = localStorage.getItem("customerInsight_ageSelect");
    if (ageSelect) {
      setAgeSelect(ageSelect.split(",").map((item) => Number(item)));
    }
    if (siteId) {
      searchFun();
    }
  }, [siteId]);

  // 加载区域列表
  useEffect(() => {
    if (!siteId) return;
    Http.getSiteAreas(
      { siteId, state: 0, page: 1, limit: 1000 },
      (res) => {
        if (res.result === 1) {
          const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
          const options = list.map((item) => ({
            value: item.areaId,
            label: item.name,
          }));
          setRegionOptions(options);
        }
      },
      null,
      () => {
        console.error("获取区域列表失败");
      }
    );
  }, [siteId]);

  // timeGranule 变化时校验 timeRange
  useEffect(() => {
    if (!timeRange || !timeRange[0] || !timeRange[1]) return;

    const spanLimit = timeGranuleSpanLimits[timeGranule];
    if (spanLimit !== null && spanLimit !== undefined) {
      const spanDays = timeRange[1].diff(timeRange[0], "day");
      if (spanDays > spanLimit) {
        const truncatedEndDate = timeRange[0].add(spanLimit, "day");
        const truncatedDates = [timeRange[0], truncatedEndDate];
        const granuleLabelMap = { hour: "小时", day: "天", week: "周", month: "月" };
        message.warning({
          content: `按${granuleLabelMap[timeGranule]}查看，时间范围一次最多展示${spanLimit}天`,
        });
        setTimeRange(truncatedDates);
        TimeGranulePickerRef.current?.setTimeRange(truncatedDates);
      }
    }
  }, [timeGranule]);

  const handleTimeChange = useCallback(
    (value) => {
      if (!value || !value[0] || !value[1]) {
        setTimeRange(value);
        return;
      }

      const spanLimit = timeGranuleSpanLimits[timeGranule];
      // 如果该粒度没有限制，直接返回
      if (spanLimit !== null && spanLimit !== undefined) {
        const spanDays = value[1].diff(value[0], "day");

        // 如果跨度超过限制，需要截断
        if (spanDays > spanLimit) {
          const truncatedEndDate = value[0].add(spanLimit, "day");
          const truncatedDates = [value[0], truncatedEndDate];

          // 显示警告消息
          const granuleLabelMap = { hour: "小时", day: "天", week: "周", month: "月" };
          message.warning({
            content: `按${granuleLabelMap[timeGranule]}查看，时间范围一次最多展示${spanLimit}天`,
          });

          setTimeRange(truncatedDates);
          TimeGranulePickerRef.current?.setTimeRange(truncatedDates);
          return;
        }
      }

      setTimeRange(value);
    },
    [timeGranule]
  );

  // 查询
  const searchFun = async () => {
    message.config({
      maxCount: 3,
    });
    if (!timeRange || !timeRange[0]) {
      message.warning({ content: "时间范围不能为空" });
      return;
    }
    setTimeRangeReal(timeRange);
    setLoading(true);
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
      Http.getCustomerInsightData(Params, (Response) => {
        try {
          if (Response.result === 1) {
            getCustomerGroupData(Response.data.faceStats);
            setBaseData(Response.data.faceFlow);
            setSiteData({ curStats: Response.data.siteStats.curStats, preStats: Response.data.siteStats.lastStats });
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

  // 处理性别时间粒度变化
  const handleGenderTimeGranuleChange = useCallback(
    (value) => {
      setGenderTimeGranule(value);
    },
    [genderTimeGranule]
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
    // if (timeRange[1].diff(timeRange[0], "day") > 61) {
    //   return "day";
    // }
    if (timeRange[1].diff(timeRange[0], "day") >= 1) {
      return "hour";
    }

    return null;
  };

  /**顾客分群 */
  const getCustomerGroupData = (data) => {
    const initAge = Object.keys(ageEnums).reduce((obj, key) => {
      obj[key] = 0;
      return obj;
    }, {});
    const curBaseData = { female: { ...initAge }, male: { ...initAge } };
    const preBaseData = { female: { ...initAge }, male: { ...initAge } };
    const lastWeekBaseData = { female: { ...initAge }, male: { ...initAge } };

    data[0].forEach((item) => {
      if (item.g === 1) {
        curBaseData.male[item.a] += item.count;
      } else {
        curBaseData.female[item.a] += item.count;
      }
    });
    data.length > 1 &&
      data[1].forEach((item) => {
        if (item.g === 1) {
          preBaseData.male[item.a] += item.count;
        } else {
          preBaseData.female[item.a] += item.count;
        }
      });
    data.length > 2 &&
      data[2].forEach((item) => {
        if (item.g === 1) {
          lastWeekBaseData.male[item.a] += item.count;
        } else {
          lastWeekBaseData.female[item.a] += item.count;
        }
      });

    setCurBaseData(curBaseData);
    setPreBaseData(preBaseData);
    setLastWeekBaseData(lastWeekBaseData);
  };

  /**性别统计 */
  const genderStatisticsData = useMemo(() => {
    if (!baseData || !genderTimeGranule) return;
    const { curFlow } = baseData;
    const { list } = curFlow;
    let _timeGranule = genderTimeGranule;
    const calculateLimitType = calculateLimit();
    if ((calculateLimitType === "hour" && ["halfHour", "mintue", "hour"].includes(_timeGranule)) || (calculateLimitType === "mintue" && _timeGranule === "mintue")) {
      _timeGranule = "day";
      setGenderTimeGranule("day");
    }

    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRangeReal, _timeGranule, "customerInsight");
    var yAxis1 = new Array();
    var yAxis2 = new Array();
    const ageKeys = Object.keys(ageEnumsSelect);

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);

      // 获取当前时间段数据
      const calcGroupValue = (data, timeSlot, gender) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce((sum, item) => {
          const dataTime = item.t;

          if (dataTime >= timeSlot.startTime && dataTime < timeSlot.endTime) {
            if (ageKeys.includes(String(item.a))) {
              if (gender === item.g) {
                return sum + item.c || 0;
              }
            }
          }
          return sum;
        }, 0);
      };

      yAxis1.push(calcGroupValue(list, currentTimeSlot, 1)); // male
      yAxis2.push(calcGroupValue(list, currentTimeSlot, 2)); // female
    }

    return {
      maleData: yAxis1,
      femaleData: yAxis2,
      xAxisTooltips,
      xAxis,
    };
  }, [baseData, genderTimeGranule, ageEnumsSelect]);

  /**年龄统计 */
  const ageStatisticsData = useMemo(() => {
    if (!baseData || !ageTimeGranule) return;
    const { curFlow } = baseData;
    const { list } = curFlow;
    let _timeGranule = ageTimeGranule;
    const calculateLimitType = calculateLimit();
    if ((calculateLimitType === "hour" && ["halfHour", "mintue", "hour"].includes(_timeGranule)) || (calculateLimitType === "mintue" && _timeGranule === "mintue")) {
      _timeGranule = "day";
      setAgeTimeGranule("day");
    }

    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRangeReal, _timeGranule, "customerInsight");
    var YINGERArr = new Array();
    var ERTONGArr = new Array();
    var QINGNIANArr = new Array();
    var ZHUANGNIANArr = new Array();
    var ZHONGLAONIANArr = new Array();
    var WEIZHIArr = new Array();
    // const genderKeys = Object.keys(genderEnumsSelect);

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);

      // 获取当前时间段数据
      const calcGroupValue = (data, timeSlot, age) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce(
          (sum, item) => {
            const dataTime = item.t;

            if (dataTime >= timeSlot.startTime && dataTime < timeSlot.endTime) {
              if (item.a === age) {
                if (item.g === 1) {
                  sum.male += item.c || 0;
                } else {
                  sum.female += item.c || 0;
                }
                return sum;
              }
            }
            return { male: sum.male || 0, female: sum.female || 0 };
          },
          { male: 0, female: 0 }
        );
      };
      YINGERArr.push(calcGroupValue(list, currentTimeSlot, 1)); // ERTONG
      ERTONGArr.push(calcGroupValue(list, currentTimeSlot, 2)); // QINGNIAN
      QINGNIANArr.push(calcGroupValue(list, currentTimeSlot, 4)); // ZHUANGNIAN
      ZHUANGNIANArr.push(calcGroupValue(list, currentTimeSlot, 5)); // ZHUANGNIAN
      ZHONGLAONIANArr.push(calcGroupValue(list, currentTimeSlot, 6)); // ZHUANGNIAN
      WEIZHIArr.push(calcGroupValue(list, currentTimeSlot, 7)); // ZHUANGNIAN
    }

    return {
      YINGERArr,
      ERTONGArr,
      QINGNIANArr,
      ZHUANGNIANArr,
      ZHONGLAONIANArr,
      WEIZHIArr,
      xAxisTooltips,
      xAxis,
    };
  }, [baseData, ageTimeGranule, genderEnumsSelect]);

  /** 顾客洞悉 */
  const customerSurveryData = useMemo(() => {
    if (!baseData || !siteData) return;
    const { curStats, preStats } = siteData;
    const { curFlow } = baseData;
    const { list } = curFlow;

    if (!curStats || !preStats) return;
    const curOSCount = curStats.osInCount + curStats.osOutCount; // 场外总人数
    const preOSCount = preStats.osInCount + preStats.osOutCount;
    let maleVisitSum = 0; // 到访客流
    let femaleVisitSum = 0;
    let maleVisitSumPre = 0; // 到访客流环比
    let femaleVisitSumPre = 0;
    let visitSum = 0;
    let visitSumPre = 0;

    Object.keys(ageEnumsSelect || ageEnums).forEach((ageKey) => {
      maleVisitSum += curBaseData.male?.[ageKey] || curBaseData.male?.[Number(ageKey)] || 0;
      femaleVisitSum += curBaseData.female?.[ageKey] || curBaseData.female?.[Number(ageKey)] || 0;
      maleVisitSumPre += preBaseData.male?.[ageKey] || preBaseData.male?.[Number(ageKey)] || 0;
      femaleVisitSumPre += preBaseData.female?.[ageKey] || preBaseData.female?.[Number(ageKey)] || 0;
    });

    visitSum = maleVisitSum + femaleVisitSum;
    visitSumPre = maleVisitSumPre + femaleVisitSumPre;

    // 到访客流环比增长率
    let maleVisitSumPreRate = maleVisitSumPre === 0 ? "100" : StringUtils.toFixed(((maleVisitSum - maleVisitSumPre) / (maleVisitSumPre || 1)) * 100, 2);
    let femaleVisitSumPreRate = femaleVisitSumPre === 0 ? "100" : StringUtils.toFixed(((femaleVisitSum - femaleVisitSumPre) / (femaleVisitSumPre || 1)) * 100, 2);
    // 贡献率
    let maleContributionDegree = StringUtils.toFixed((maleVisitSum / visitSum) * 100, 2) || 0;
    let femaleContributionDegree = StringUtils.toFixed((femaleVisitSum / visitSum) * 100, 2) || 0;

    const isSameDay = timeRangeReal[0].isSame(timeRangeReal[1], "day");
    const _timeGranule = isSameDay ? "hour" : "day";
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRangeReal, _timeGranule, "customerInsight");

    let YINGERArr = new Array();
    let ERTONGArr = new Array();
    let QINGNIANArr = new Array();
    let ZHUANGNIANArr = new Array();
    let ZHONGLAONIANArr = new Array();
    let WEIZHIArr = new Array();

    let maleData = new Array();
    let femaleData = new Array();
    const ageKeys = Object.keys(ageEnumsSelect);

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);

      // 获取当前时间段数据Gender
      const calcGroupValueGender = (data, timeSlot, gender) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce((sum, item) => {
          const dataTime = item.t;

          if (dataTime >= timeSlot.startTime && dataTime < timeSlot.endTime) {
            if (ageKeys.includes(String(item.a))) {
              if (gender === item.g) {
                return sum + item.c || 0;
              }
            }
          }
          return sum;
        }, 0);
      };

      // 获取当前时间段数据Age
      const calcGroupValueAge = (data, timeSlot, age) => {
        if (!Array.isArray(data)) return 0;
        return data.reduce(
          (sum, item) => {
            const dataTime = item.t;

            if (dataTime >= timeSlot.startTime && dataTime < timeSlot.endTime) {
              if (item.a === age) {
                if (item.g === 1) {
                  sum.male += item.c || 0;
                  sum.total += item.c || 0;
                } else {
                  sum.female += item.c || 0;
                  sum.total += item.c || 0;
                }
                return sum;
              }
            }
            return { male: sum.male || 0, female: sum.female || 0, total: sum.total || 0 };
          },
          { male: 0, female: 0, total: 0 }
        );
      };
      YINGERArr.push(calcGroupValueAge(list, currentTimeSlot, 1)); // ERTONG
      ERTONGArr.push(calcGroupValueAge(list, currentTimeSlot, 2)); // QINGNIAN
      QINGNIANArr.push(calcGroupValueAge(list, currentTimeSlot, 4)); // ZHUANGNIAN
      ZHUANGNIANArr.push(calcGroupValueAge(list, currentTimeSlot, 5)); // ZHUANGNIAN
      ZHONGLAONIANArr.push(calcGroupValueAge(list, currentTimeSlot, 6)); // ZHUANGNIAN
      WEIZHIArr.push(calcGroupValueAge(list, currentTimeSlot, 7)); // ZHUANGNIAN
      maleData.push(calcGroupValueGender(list, currentTimeSlot, 1)); // male
      femaleData.push(calcGroupValueGender(list, currentTimeSlot, 2)); // female
    }

    // 男女性时间峰值
    const malePeakValueTime = ArrayUtils.getMaxValue(maleData);
    const malePeakIndexTime = ArrayUtils.getMaxValueIndex(maleData);
    const malePeakTimeTime = xAxisTooltips && xAxisTooltips[malePeakIndexTime] ? xAxisTooltips[malePeakIndexTime] : "";
    const femalePeakValueTime = ArrayUtils.getMaxValue(femaleData);
    const femalePeakIndexTime = ArrayUtils.getMaxValueIndex(femaleData);
    const femalePeakTimeTime = xAxisTooltips && xAxisTooltips[femalePeakIndexTime] ? xAxisTooltips[femalePeakIndexTime] : "";
    const maleMaxTimepercent = StringUtils.toFixed((malePeakValueTime / maleData.reduce((acc, curr) => acc + curr, 0)) * 100, 2);
    const femaleMaxTimepercent = StringUtils.toFixed((femalePeakValueTime / femaleData.reduce((acc, curr) => acc + curr, 0)) * 100, 2);

    const convertToPureArray = (data, type) => {
      const pureArray = [];
      if (type === "male") {
        data.forEach((item) => {
          pureArray.push(item.male);
        });
      } else {
        data.forEach((item) => {
          pureArray.push(item.female);
        });
      }
      return pureArray;
    };
    // 男女年龄段峰值// 年龄段数组映射
    const ageArrayMaleMap = {
      1: convertToPureArray(YINGERArr, "male"),
      2: convertToPureArray(ERTONGArr, "male"),
      4: convertToPureArray(QINGNIANArr, "male"),
      5: convertToPureArray(ZHUANGNIANArr, "male"),
      6: convertToPureArray(ZHONGLAONIANArr, "male"),
      7: convertToPureArray(WEIZHIArr, "male"),
    };
    const ageArrayFemaleMap = {
      1: convertToPureArray(YINGERArr, "female"),
      2: convertToPureArray(ERTONGArr, "female"),
      4: convertToPureArray(QINGNIANArr, "female"),
      5: convertToPureArray(ZHUANGNIANArr, "female"),
      6: convertToPureArray(ZHONGLAONIANArr, "female"),
      7: convertToPureArray(WEIZHIArr, "female"),
    };

    // 判断是否显示所有年龄段（如果没有筛选条件或筛选条件为空，则显示所有）
    const showAllAges = !ageEnumsSelect || Object.keys(ageEnumsSelect).length === 0;
    const selectedAgeKeysMale = showAllAges ? Object.keys(ageArrayMaleMap) : Object.keys(ageEnumsSelect);
    const selectedAgeKeysFemale = showAllAges ? Object.keys(ageArrayFemaleMap) : Object.keys(ageEnumsSelect);

    // 计算每个年龄段的总数
    const ageTotals = { male: {}, female: {} };
    selectedAgeKeysMale.forEach((ageKey) => {
      const ageArray = ageArrayMaleMap[ageKey] || [];
      ageTotals.male[ageKey] = ArrayUtils.getSumValue(ageArray);
    });
    selectedAgeKeysFemale.forEach((ageKey) => {
      const ageArray = ageArrayFemaleMap[ageKey] || [];
      ageTotals.female[ageKey] = ArrayUtils.getSumValue(ageArray);
    });

    // 找出总数最多的年龄段
    let maxAgeKeyMale = null;
    let maxAgeKeyFemale = null;
    let maxTotalMale = 0;
    let maxTotalFemale = 0;
    Object.keys(ageTotals.male).forEach((ageKey) => {
      if (ageTotals.male[ageKey] > maxTotalMale) {
        maxTotalMale = ageTotals.male[ageKey];
        maxAgeKeyMale = ageKey;
      }
    });
    Object.keys(ageTotals.female).forEach((ageKey) => {
      if (ageTotals.female[ageKey] > maxTotalFemale) {
        maxTotalFemale = ageTotals.female[ageKey];
        maxAgeKeyFemale = ageKey;
      }
    });

    const totalMale = Object.values(ageArrayMaleMap)
      .flat()
      .reduce((acc, curr) => acc + curr, 0);
    const totalFemale = Object.values(ageArrayFemaleMap)
      .flat()
      .reduce((acc, curr) => acc + curr, 0);

    // 获取最多群体的名称
    const maxAgeNameMale = maxAgeKeyMale ? ageEnums[maxAgeKeyMale]?.title || "未知" : "未知";
    const maxAgeNameFemale = maxAgeKeyFemale ? ageEnums[maxAgeKeyFemale]?.title || "未知" : "未知";
    const maxAgePeakValueMale = maxAgeKeyMale ? ageTotals.male[maxAgeKeyMale] : 0;
    const maxAgePeakValueFemale = maxAgeKeyFemale ? ageTotals.female[maxAgeKeyFemale] : 0;
    const maxAgePeakValueMalepercent = maxAgeKeyMale ? StringUtils.toFixed((maxAgePeakValueMale / totalMale) * 100, 2) : 0;
    const maxAgePeakValueFemalepercent = maxAgeKeyFemale ? StringUtils.toFixed((maxAgePeakValueFemale / totalFemale) * 100, 2) : 0;

    // 进场率
    const curEnterRateMale = curOSCount === 0 ? 100 : StringUtils.toFixed((maleVisitSum / curOSCount) * 100, 2);
    const curEnterRateFemale = curOSCount === 0 ? 100 : StringUtils.toFixed((femaleVisitSum / curOSCount) * 100, 2);
    const preEnterRateMale = preOSCount === 0 ? 100 : StringUtils.toFixed((maleVisitSumPre / preOSCount) * 100, 2);
    const preEnterRateFemale = preOSCount === 0 ? 100 : StringUtils.toFixed((femaleVisitSumPre / preOSCount) * 100, 2);
    const curEnterRateMalePreRate = preEnterRateMale === 0 ? "100" : StringUtils.toFixed(((curEnterRateMale - preEnterRateMale) / (preEnterRateMale || 1)) * 100, 2);
    const curEnterRateFemalePreRate = preEnterRateFemale === 0 ? "100" : StringUtils.toFixed(((curEnterRateFemale - preEnterRateFemale) / (preEnterRateFemale || 1)) * 100, 2);

    const male = {
      contributionDegree: maleContributionDegree, // 贡献度
      VisitorFlow: maleVisitSum || 0, // 到访客流
      VisitorFlowPre: maleVisitSumPre || 0, // 环比到访客流
      VisitorFlowPreRate: maleVisitSumPreRate, // 环比到访客流率
      MaxAgeName: maxAgeNameMale, // 最多群体名称
      MaxAgePeakValue: maxAgePeakValueMale, // 最多群体峰值
      MaxAgePeakValuepercent: maxAgePeakValueMalepercent, // 最多群体峰值百分比
      PeakTimeTime: malePeakTimeTime, // 最多群体峰值时间标题
      PeakValueTime: malePeakValueTime, // 最多群体峰值时间值
      PeakValueTimepercent: maleMaxTimepercent, // 最多群体峰值时间百分比
      EnterRate: curEnterRateMale, // 进场率
      preEnterRate: preEnterRateMale, // 环比进场率
      EnterRatePre: curEnterRateMalePreRate, // 进场率环比
    };
    const female = {
      contributionDegree: femaleContributionDegree, // 贡献度
      VisitorFlow: femaleVisitSum || 0, // 到访客流
      VisitorFlowPre: femaleVisitSumPre || 0, // 环比到访客流
      VisitorFlowPreRate: femaleVisitSumPreRate, // 环比到访客流率
      MaxAgeName: maxAgeNameFemale, // 最多群体名称
      MaxAgePeakValue: maxAgePeakValueFemale, // 最多群体峰值
      MaxAgePeakValuepercent: maxAgePeakValueFemalepercent, // 最多群体峰值百分比
      PeakTimeTime: femalePeakTimeTime, // 最多群体峰值时间标题
      PeakValueTime: femalePeakValueTime, // 最多群体峰值时间值
      PeakValueTimepercent: femaleMaxTimepercent, // 最多群体峰值时间百分比
      EnterRate: curEnterRateFemale, // 进场率
      preEnterRate: preEnterRateFemale, // 环比进场率
      EnterRatePre: curEnterRateFemalePreRate, // 进场率环比
    };

    const selectedGenderKeys = Object.keys(genderEnumsSelect).map((key) => Number(key));
    const hasMale = selectedGenderKeys.includes(1);
    const hasFemale = selectedGenderKeys.includes(2);
    const bothSelected = hasMale && hasFemale;
    // 顺便生成表格数据
    const tableDetailData = [];
    for (let i = 0; i < xAxis.length; i++) {
      let rowObj = {
        key: i,
        date: xAxisTime[i],
        toddler: 0,
        child: 0,
        youngAdult: 0,
        middleAge: 0,
        elderly: 0,
        ageUnknown: 0,
        maleNum: 0,
        femaleNum: 0,
        isSameDay,
      };
      rowObj.toddler = bothSelected ? YINGERArr[i].total : hasMale ? YINGERArr[i].male : YINGERArr[i].female;
      rowObj.child = bothSelected ? ERTONGArr[i].total : hasMale ? ERTONGArr[i].male : ERTONGArr[i].female;
      rowObj.youngAdult = bothSelected ? QINGNIANArr[i].total : hasMale ? QINGNIANArr[i].male : QINGNIANArr[i].female;
      rowObj.middleAge = bothSelected ? ZHUANGNIANArr[i].total : hasMale ? ZHUANGNIANArr[i].male : ZHUANGNIANArr[i].female;
      rowObj.elderly = bothSelected ? ZHONGLAONIANArr[i].total : hasMale ? ZHONGLAONIANArr[i].male : ZHONGLAONIANArr[i].female;
      rowObj.ageUnknown = bothSelected ? WEIZHIArr[i].total : hasMale ? WEIZHIArr[i].male : WEIZHIArr[i].female;
      rowObj.maleNum = maleData[i];
      rowObj.femaleNum = femaleData[i];
      tableDetailData.push(rowObj);
    }
    setTableDetailData(tableDetailData);
    return {
      male,
      female,
    };
  }, [baseData, siteData, curBaseData, preBaseData, genderEnumsSelect, ageEnumsSelect]);

  const showColor = useMemo(() => {
    return !genderSelect.includes("ALL") || !ageSelect.includes("ALL");
  }, [genderSelect, ageSelect]);

  return (
    <Suspense fallback={<Spin size="large" />}>
      <div className="RegionAnalyse">
        <div className="ui-search-bar">
          <div className="timeContrast" style={{ paddingBottom: "8px" }}>
            <span className="title">时间选择：</span>
            <Select
              size="default"
              value={timeGranule}
              style={{ width: 100, marginRight: "10px" }}
              options={timeSelectMap}
              onChange={(v) => {
                setTimeGranule(v);
              }}
            />
            <TimeGranulePicker ref={TimeGranulePickerRef} onTimeChange={handleTimeChange} />
            <span className="title" style={{ marginLeft: "16px" }}>
              区域选择：
            </span>
            <Select mode="multiple" allowClear style={{ minWidth: 200, marginLeft: 4 }} placeholder="请选择区域" value={selectedRegions} onChange={setSelectedRegions} options={regionOptions} />
            <div style={{ marginLeft: "16px", cursor: "pointer", userSelect: "none" }} onClick={() => setExpand(!expand)}>
              <span style={{ marginRight: "4px", color: showColor ? "#1890ff" : "#333" }}>{expand ? "收起" : "展开"}</span>
              {expand ? <UpOutlined style={{ color: showColor ? "#1890ff" : "#333", fontSize: "12px" }} /> : <DownOutlined style={{ color: showColor ? "#1890ff" : "#333", fontSize: "12px" }} />}
            </div>
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
          <div className={`ui-search-bar-expand ${expand ? "ui-search-bar-expand-open" : ""}`}>
            <div className="timeContrast" style={{ paddingBottom: "8px" }}>
              <span className="title">
                统计时段
                <UITooltipQuestion
                  marginLeft="2px"
                  marginRight="2px"
                  title="统计时段分为“全天查询”、“时段查询”；全天查询：统计起止时间内每日的完整数据；时段查询：仅统计起止时间内所选时间窗口的数据。"
                />
                ：
              </span>
              <Radio.Group
                options={[
                  { value: "fullDay", label: "全天查询" },
                  { value: "timeSlot", label: "时段查询" },
                ]}
                onChange={(e) => {
                  setStatisticsPeriod(e.target.value);
                  // 切换到全天查询时清空时段选择
                  if (e.target.value === "fullDay") {
                    setStartHour(null);
                    setEndHour(null);
                  }
                }}
                value={statisticsPeriod}
                optionType="button"
                buttonStyle="solid"
              />
              {statisticsPeriod === "timeSlot" && (
                <>
                  <span className="title" style={{ marginLeft: "16px" }}>
                    开始时间：
                  </span>
                  <Select value={startHour} onChange={handleStartHourChange} options={startHourOptions} style={{ width: 100, marginLeft: 4 }} placeholder="请选择" />
                  <span className="title" style={{ marginLeft: "16px" }}>
                    结束时间：
                  </span>
                  <Select value={endHour} onChange={setEndHour} options={endHourOptions} style={{ width: 100, marginLeft: 4 }} placeholder="请选择" disabled={startHour === null} />
                </>
              )}
            </div>
          </div>
        </div>
        <UIContentLoading loading={loading}>
          <div className="layout-content layout-content-noScroll">
            {empty && <Empty />}
            {!empty && (
              <>
                {/* 顾客洞悉 */}
                <CustomerSurvery data={customerSurveryData} genderEnumsSelect={genderEnumsSelect} ageEnumsSelect={ageEnumsSelect} isCurrentDay={isCurrentDay} />
                {/* 顾客分群 */}
                <div className="dualRow">
                  <div className="dualRowContent">
                    <CustomerGroupChart
                      isSameDay={isSameDay}
                      isCurrentDay={isCurrentDay}
                      curBaseData={curBaseData}
                      preBaseData={preBaseData}
                      lastWeekBaseData={lastWeekBaseData}
                      ageEnumsSelect={ageEnumsSelect}
                      genderEnumsSelect={genderEnumsSelect}
                    />
                  </div>
                </div>
                {/* 性别统计 */}
                <div className="dualRow">
                  <div className="dualRowContent">
                    <GenderStatisticsChart
                      isSameDay={isSameDay}
                      timeGranule={genderTimeGranule}
                      timeRangeReal={timeRangeReal}
                      onTimeGranuleChange={handleGenderTimeGranuleChange}
                      genderStatisticsData={genderStatisticsData}
                      ageEnumsSelect={ageEnumsSelect}
                      genderEnumsSelect={genderEnumsSelect}
                      limit={limit}
                    />
                  </div>
                </div>
                {/* 数据详情 */}
                <TableDetail data={tableDetailData} timeRange={timeRangeReal} />
                <ICPComponent />
              </>
            )}
          </div>
        </UIContentLoading>
      </div>
    </Suspense>
  );
}
export default RegionAnalyse;
