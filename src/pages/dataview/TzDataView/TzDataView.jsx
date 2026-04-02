import React, { useState, useEffect, useRef } from "react";
import { TzDataViewMap } from "@/data/const";
import Http from "@/config/Http";
import { TrendChart, RecentSevenDaysChart, Last12MonthsFlowTrendChart, FloorConversionChart, DeviceInfoChart, CustomerPortraitChart } from "./TzComponents/TzChart";
import { FestivalFlowPanel, OutLetFlowPanel, GroupStatisticsPanel } from "./TzComponents/TzPanel";
import TimeUtils from "@/utils/TimeUtils";
import CommonUtils from "@/utils/CommonUtils";
import StringUtils from "@/utils/StringUtils";
import Constant from "@/common/Constant";
import DataConverter from "@/data/DataConverter";
import { Language } from "@/language/LocaleContext";
import dayjs from "dayjs";
import User from "@/data/UserData";
import "./TzDataView.less";

// 默认大屏配置
const DEFAULT_CONFIG = {
  siteId: null,
  title: "北京市通州区党群服务阵地体系一屏通览",
  showSiteName: 1,
  deduplication: 0,
  leftComponents: [
    { component: "floorConversion", percentage: 30 },
    { component: "entranceExit", percentage: 30 },
    { component: "holidayFlow", percentage: 40 },
  ],
  rightComponents: [
    { component: "deviceInfo", percentage: 10 },
    { component: "customerPortrait", percentage: 40 },
    { component: "groupStatistics", percentage: 40 },
  ],
};

const DataView = () => {
  const [config] = useState(DEFAULT_CONFIG);
  const [currentTime, setCurrentTime] = useState(new Date());
  const siteIdRef = useRef(null);
  // 宽高比16:9，根据宽度计算高度
  const calculateHeight = (width) => {
    return Math.round((width * 9) / 16);
  };
  const [containerSize, setContainerSize] = useState({ width: 1420, height: calculateHeight(1420) });
  const [minContainerSize, setMinContainerSize] = useState({ width: 1420, height: 780 });
  const [dashboardData, setDashboardData] = useState({
    dailyCount: 0,
    dailyNum: 0,
    dailyCountRate: 0,
    dailyNumRate: 0,
    weeklyCount: 0,
    weeklyNum: 0,
    weeklyCountRate: 0,
    weeklyNumRate: 0,
    monthlyCount: 0,
    monthlyNum: 0,
    monthlyCountRate: 0,
    monthlyNumRate: 0,
    annualCount: 0,
    annualNum: 0,
    annualCountRate: 0,
    annualNumRate: 0,
  });
  const [trendData, setTrendData] = useState({
    flowType: "inCount",
    data: null,
  });
  const [recentSevenDaysData, setRecentSevenDaysData] = useState(null);
  const [last12MonthsFlowTrendData, setLast12MonthsFlowTrendData] = useState(null);
  const [floorTransformData, setFloorTransformData] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [doorRankingData, setDoorRankingData] = useState(null);
  const [festivalData, setFestivalData] = useState(null);
  const [customerAttr, setCustomerAttr] = useState(null);
  const fullscreenHandlerRef = useRef(null);
  const resizeTimerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [groupAnalysisMemberData, setGroupAnalysisMemberData] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState({
    trendData: false,
    recentSevenDaysData: false,
    last12MonthsFlowTrendData: false,
    floorTransformData: false,
    doorRankingData: false,
    customerAttr: false,
    groupAnalysisMemberDataLoading: false,
  });
  const isNeutralDomain = window.localStorage.getItem("isNeutralDomain") === "true";
  const [isMobile, setIsMobile] = useState(false);
  // 移动端viewport处理：保持PC端比例，允许缩放查看
  useEffect(() => {
    // 检测是否是移动设备
    const isMobileDevice = () => {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      if (window.screen.width * 1.5 < window.screen.height) {
        return true;
      }
      return mobileRegex.test(ua);
    };
    setIsMobile(isMobileDevice());
    // // 保存原始的viewport设置
    const originalViewport = document.querySelector('meta[name="viewport"]')?.getAttribute("content") || "";

    if (isMobileDevice()) {
      // 移动端：设置固定宽度为1420px（PC端最小宽度），允许缩放
      const viewportWidth = 1420;
      const deviceWidth = window.screen.width || 375;
      // 计算初始缩放比例，让页面能完整显示但可以缩放
      let initialScale = deviceWidth / viewportWidth;
      // 限制最小缩放比例为0.1，最大为1.0
      initialScale = Math.max(0.1, Math.min(1.0, initialScale));

      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute("content", `width=${viewportWidth}, initial-scale=${initialScale.toFixed(2)}, maximum-scale=10.0, minimum-scale=0.1, user-scalable=yes`);
      }
    }

    // 组件卸载时恢复原始viewport设置
    return () => {
      if (isMobileDevice()) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport && originalViewport) {
          viewport.setAttribute("content", originalViewport);
        }
      }
    };
  }, []);

  // 检测全屏状态
  useEffect(() => {
    const checkFullscreen = () => {
      // 优先使用标准全屏 API 检测
      const hasFullscreenElement = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

      // F11 全屏检测：通过窗口大小判断
      // 使用 outerHeight/outerWidth 更准确（包含浏览器边框）
      // 或者使用 innerHeight/innerWidth（不包含浏览器 UI）
      const windowHeight = window.outerHeight || window.innerHeight;
      const windowWidth = window.outerWidth || window.innerWidth;
      const screenHeight = screen.height;
      const screenWidth = screen.width;

      // 计算窗口占屏幕的比例
      const heightRatio = windowHeight / screenHeight;
      const widthRatio = windowWidth / screenWidth;

      // F11 全屏时，窗口通常占据屏幕的 95% 以上
      // 同时窗口尺寸应该接近屏幕尺寸（允许一些误差，考虑任务栏、地址栏等）
      const isWindowFullscreen =
        heightRatio > 0.98 &&
        widthRatio > 0.98 &&
        windowHeight > 600 && // 确保不是小窗口
        windowWidth > 800;

      const isFullscreenMode = hasFullscreenElement || isWindowFullscreen;

      setIsFullscreen((prev) => {
        // if (prev !== isFullscreenMode) {
        //   console.log("全屏状态变化:", prev, "->", isFullscreenMode);
        // }
        return isFullscreenMode;
      });
    };

    // 监听全屏状态变化
    const handleFullscreenChange = (e) => {
      setTimeout(checkFullscreen, 100);
    };

    // 监听窗口大小变化（F11 全屏会触发此事件）
    const handleResize = () => {
      // 使用防抖，避免频繁触发
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      resizeTimerRef.current = setTimeout(() => {
        checkFullscreen();
      }, 100);
    };

    // 初始检查
    checkFullscreen();

    // 添加全屏事件监听器（兼容不同浏览器）
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    // 监听窗口大小变化（F11 全屏主要依赖此事件）
    window.addEventListener("resize", handleResize);

    fullscreenHandlerRef.current = handleFullscreenChange;

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      window.removeEventListener("resize", handleResize);
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
    };
  }, []);

  // 计算并更新容器尺寸（保持16:9的宽高比，居中显示，空余部分留白）
  useEffect(() => {
    if (isMobile) {
      const updateContainerSize = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // 根据视口宽度计算16:9的高度
        const widthBasedHeight = calculateHeight(viewportWidth);
        // 根据视口高度计算16:9的宽度
        const heightBasedWidth = Math.round((viewportHeight * 16) / 9);

        // 取较小的值，确保容器能完整显示在视口中
        if (widthBasedHeight <= viewportHeight) {
          // 宽度限制，使用视口宽度
          setContainerSize({ width: viewportWidth, height: widthBasedHeight });
        } else {
          // 高度限制，使用计算出的宽度
          setContainerSize({ width: heightBasedWidth, height: viewportHeight });
        }
      };

      updateContainerSize();
      window.addEventListener("resize", updateContainerSize);
      return () => window.removeEventListener("resize", updateContainerSize);
    } else {
      const updateMinContainerSize = () => {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const minWidth = screenWidth - 60;
        const minHeight = calculateHeight(minWidth);
        if (minHeight > screenHeight - 180) {
          const MaxHeight = screenHeight - 180;
          const MaxWidth = Math.round((MaxHeight * 16) / 9);
          setMinContainerSize({ width: MaxWidth, height: MaxHeight });
        } else {
          setMinContainerSize({ width: minWidth, height: minHeight });
        }
      };
      updateMinContainerSize();
      window.addEventListener("resize", updateMinContainerSize);
      return () => window.removeEventListener("resize", updateMinContainerSize);
    }
  }, [isMobile]);

  useEffect(() => {
    const defaultSiteId = User.selectedSiteId || User.defaultSiteId;
    siteIdRef.current = defaultSiteId;
    if (defaultSiteId) {
      requestDataViewConfig(defaultSiteId);
    }
  }, []);

  // 每分钟请求一次数据
  useEffect(() => {
    if (!siteIdRef.current) return;

    const interval = setInterval(() => {
      requestDataViewConfig(siteIdRef.current);
    }, 60000); // 60000毫秒 = 1分钟

    return () => clearInterval(interval);
  }, [isFirstLoad]);

  // 将回调式 HTTP 方法转换为 Promise 的辅助函数
  const httpToPromise = (httpMethod, params) => {
    return new Promise((resolve, reject) => {
      httpMethod(
        params,
        (res) => resolve(res),
        null,
        (error) => reject(error)
      );
    });
  };

  const requestDataViewConfig = async (siteId) => {
    const dateString = new Date().toISOString().split("T")[0];
    const [endDateLast7Days, startDateLast7Days] = TimeUtils.getLast7DaysRange();
    const [endDateLast12Months, startDateLast12Months] = TimeUtils.getLast12MonthsRange();

    if (isFirstLoad) {
      setIsFirstLoad(false);
      setIsLoadingData({
        trendData: true,
        recentSevenDaysData: true,
        last12MonthsFlowTrendData: true,
        floorTransformData: true,
        doorRankingData: true,
        customerAttr: true,
        groupAnalysisMemberDataLoading: true,
      });
    }
    Http.getHomeData(
      { siteId: siteId },
      (res) => {
        getSiteDeviceData(res.data.deviceData);
        getSiteFestivalData(res.data.festivalData); // 节日客流情况
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );
    Http.getHomeStat(
      { siteId: siteId, timeType: 1 },
      (res) => {
        // 当前统计客流
        const flowStats = res.data.flowStats;
        const { curFlow, lastFlow } = flowStats;
        const { inCount: dailyCount, inNum: dailyNum } = curFlow;
        const { inCount: lastCount, inNum: lastNum } = lastFlow;
        const dailyCountRate = lastCount === 0 ? 100 : StringUtils.toFixed(((dailyCount - lastCount) / lastCount) * 100, 2);
        const dailyNumRate = lastNum === 0 ? 100 : StringUtils.toFixed(((dailyNum - lastNum) / lastNum) * 100, 2);
        setDashboardData((prevData) => ({
          ...prevData,
          dailyCount,
          dailyNum,
          dailyCountRate,
          dailyNumRate,
        }));

        setFlowTrendData(Constant.TIME_TYPE.TODAY, "inCount", res.data.flowTrends); // 客流趋势
        getSiteFloorTransformData("inCount", res.data.floorTransform); // 楼层转化
        getSiteDoorRankingData(res.data.doorsRanking); // 出入口客流情况
        getSiteCustomerAttrData(res.data.faceData); // 客户画像分析

        setIsLoadingData((prevData) => ({
          ...prevData,
          floorTransformData: false,
          trendData: false,
          doorRankingData: false,
          customerAttr: false,
        }));
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );

    // 请求前7日
    Http.getDailyStats(
      {
        siteId: siteId,
        timeType: 0,
        startDate: startDateLast7Days,
        endDate: endDateLast7Days,
      },
      (res) => {
        let chartData = DataConverter.getVisitingPeakConvertData(1, res.data.visitingPeak);
        setRecentSevenDaysData(chartData);
        setIsLoadingData((prevData) => ({
          ...prevData,
          recentSevenDaysData: false,
        }));
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );

    // Http.getAnnualStats(
    //   {
    //     siteId: siteId,
    //     startDate: startDateLast12Months,
    //   },
    //   (res) => {
    //     console.log("res", res);
    //   }
    // );
    // // 请求最近12个月数据
    // Http.getDailyStats(
    //   {
    //     siteId: siteId,
    //     timeType: 0,
    //     startDate: startDateLast12Months,
    //     endDate: endDateLast12Months,
    //   },
    //   (res) => {
    //     getLast12MonthsFlowTrendData(res.data.flowTrend?.list?.[0]?.total, [startDateLast12Months, endDateLast12Months]);
    //     setIsLoadingData((prevData) => ({
    //       ...prevData,
    //       last12MonthsFlowTrendData: false,
    //     }));
    //   },
    //   null,
    //   (error) => {
    //     console.error("请求最近12个月数据失败:", error);
    //   }
    // );

    Http.getWeeklyStats(
      {
        siteId: siteId,
        startDate: dateString,
      },
      (res) => {
        const flowStats = res.data.flowStats;
        const { curFlow, lastFlow } = flowStats;
        const { inCount: weeklyCount, inNum: weeklyNum } = curFlow;
        const { inCount: lastCount, inNum: lastNum } = lastFlow;

        const weeklyCountRate = lastCount === 0 ? 100 : StringUtils.toFixed(((weeklyCount - lastCount) / lastCount) * 100, 2);
        const weeklyNumRate = lastNum === 0 ? 100 : StringUtils.toFixed(((weeklyNum - lastNum) / lastNum) * 100, 2);
        setDashboardData((prevData) => ({
          ...prevData,
          weeklyCount,
          weeklyNum,
          weeklyCountRate,
          weeklyNumRate,
        }));
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );
    Http.getMonthlyStats(
      {
        siteId: siteId,
        startDate: dateString,
      },
      (res) => {
        const flowStats = res.data.flowStats;
        const { curFlow, lastFlow } = flowStats;
        const { inCount: monthlyCount, inNum: monthlyNum } = curFlow;
        const { inCount: lastCount, inNum: lastNum } = lastFlow;
        const monthlyCountRate = lastCount === 0 ? 100 : StringUtils.toFixed(((monthlyCount - lastCount) / lastCount) * 100, 2);
        const monthlyNumRate = lastNum === 0 ? 100 : StringUtils.toFixed(((monthlyNum - lastNum) / lastNum) * 100, 2);
        setDashboardData((prevData) => ({
          ...prevData,
          monthlyCount,
          monthlyNum,
          monthlyCountRate,
          monthlyNumRate,
        }));
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );

    // 请求近12个月以及本年度客流
    const isSameYear = TimeUtils.isSameYearByDayjs(dayjs(startDateLast12Months), dayjs(endDateLast12Months));
    const get12monthPromiseArray = isSameYear
      ? [
          httpToPromise(Http.getAnnualStats, {
            siteId: siteId,
            timeType: 0,
            startDate: endDateLast12Months,
          }),
        ]
      : [
          httpToPromise(Http.getAnnualStats, {
            siteId: siteId,
            timeType: 0,
            startDate: endDateLast12Months,
          }),
          httpToPromise(Http.getAnnualStats, {
            siteId: siteId,
            timeType: 0,
            startDate: startDateLast12Months,
          }),
        ];

    Promise.all(get12monthPromiseArray)
      .then((res) => {
        const [annualStatsRes, annualStatsRes2] = res;

        // 处理年度统计数据
        const flowStats = annualStatsRes.data.flowStats;
        const { curFlow, lastFlow } = flowStats;
        const { inCount: annualCount, inNum: annualNum } = curFlow;
        const { inCount: lastCount, inNum: lastNum } = lastFlow;

        const annualCountRate = lastCount === 0 ? 100 : StringUtils.toFixed(((annualCount - lastCount) / lastCount) * 100, 2);
        const annualNumRate = lastNum === 0 ? 100 : StringUtils.toFixed(((annualNum - lastNum) / lastNum) * 100, 2);
        setDashboardData((prevData) => ({
          ...prevData,
          annualCount,
          annualNum,
          annualCountRate,
          annualNumRate,
        }));

        // 处理近12个月数据
        if (isSameYear) {
          getLast12MonthsFlowTrendData(annualStatsRes.data.flowTrend?.curFlowTrend, [startDateLast12Months, endDateLast12Months]);
        } else {
          getLast12MonthsFlowTrendData([...annualStatsRes.data.flowTrend?.curFlowTrend, ...annualStatsRes2.data.flowTrend?.curFlowTrend], [startDateLast12Months, endDateLast12Months]);
        }

        setIsLoadingData((prevData) => ({
          ...prevData,
          last12MonthsFlowTrendData: false,
        }));
      })
      .catch((error) => {
        console.error("请求数据失败:", error);
      });

    Http.getGroupAnalysisMember(
      {
        siteId: siteId,
      },
      (res) => {
        if (res.result == 1) {
          const data = Array.isArray(res?.data) ? res?.data.sort((a, b) => (b.result || 0) - (a.result || 0)) : null;
          setGroupAnalysisMemberData(data);
          setIsLoadingData((prevData) => ({
            ...prevData,
            groupAnalysisMemberDataLoading: false,
          }));
        }
      },
      null,
      (error) => {}
    );
  };

  // 客流趋势(copy by homePage)
  const setFlowTrendData = (timeType = Constant.TIME_TYPE.TODAY, flowType = "inCount", data) => {
    const legendMap = {
      [Constant.TIME_TYPE.TODAY]: [Language.JINRIKELIU, Language.ZUORIKELIU, Language.SHANGZHOUTONGQI],
      [Constant.TIME_TYPE.WEEK]: [Language.JINZHOUKELIU, Language.SHANGZHOUKELIU],
      [Constant.TIME_TYPE.MONTH]: [Language.BENYUEKELIU, Language.SHANGYUEKELIU, Language.SHANGNIANTONGYUEKELIU],
      [Constant.TIME_TYPE.YEAR]: [Language.JINNIANKELIU, Language.SHANGNIANKELIU],
      [Constant.TIME_TYPE.DATE]: [Language.KELIUQUSHI],
    };
    const rangeFuncMap = {
      [Constant.TIME_TYPE.TODAY]: TimeUtils.getTsHourRangeByTs,
      [Constant.TIME_TYPE.WEEK]: TimeUtils.getTsDayRangeByTs,
      [Constant.TIME_TYPE.MONTH]: TimeUtils.getTsDayRangeByTs,
      [Constant.TIME_TYPE.YEAR]: TimeUtils.getTsMonthRangeByTs,
    };
    const dateFormatMap = {
      [Constant.TIME_TYPE.TODAY]: "HH:00",
      [Constant.TIME_TYPE.WEEK]: "MM-dd",
      [Constant.TIME_TYPE.MONTH]: "MM-dd",
      [Constant.TIME_TYPE.YEAR]: "yyyy-MM",
    };
    const todayData = data?.todayData || null;
    const list = data.list;
    const legend = legendMap[timeType];
    const xAxis = [];
    const series = [];
    if (timeType != Constant.TIME_TYPE.DATE) {
      const seriesArr = [];
      for (let i = 0; i < list.length; i++) {
        let item = list[i];
        let data = item.data;
        let startTime = Number(item.startTime);
        let endTime = Number(item.endTime);
        let rangeFunc = rangeFuncMap[timeType];
        let range = rangeFunc(startTime, endTime);
        let dataMap = {};
        let dataArr = [];
        if (i == 0 && todayData) {
          dataMap[todayData.dataTime] = Number(todayData[flowType]);
        }
        for (let j = 0; j < data.length; j++) {
          let dataItem = data[j];
          let dataTime = dataItem.dataTime;
          if (dataMap[dataTime] == null) {
            dataMap[dataTime] = 0;
          }
          dataMap[dataTime] += Number(dataItem[flowType]);
        }
        for (let j = 0; j < range.length; j++) {
          let dataTime = range[j];
          if (i == 0) {
            xAxis.push(TimeUtils.ts2Date(dataTime, dateFormatMap[timeType]));
          }
          if (dataMap[dataTime] && dataMap[dataTime] > 0) {
            dataArr.push(dataMap[dataTime]);
          } else {
            dataArr.push(0);
          }
        }
        seriesArr.push(dataArr);
        series.push([]);
      }
      for (let i = 0; i < xAxis.length; i++) {
        for (let j = 0; j < seriesArr.length; j++) {
          if (seriesArr[j].length > i) {
            series[j].push(seriesArr[j][i]);
          } else {
            series[j].push(0);
          }
        }
      }
    } else {
      let startTime = Number(list[0].startTime);
      let endTime = Number(list[0].endTime);
      let isHour = endTime - startTime < 86400;
      let range = isHour ? TimeUtils.getTsHourRangeByTs(startTime, endTime) : TimeUtils.getTsDayRangeByTs(startTime, endTime);
      let dataMap = {};
      let data = list[0].data;
      series.push([]);
      if (todayData) {
        dataMap[todayData.dataTime] = Number(todayData[flowType]);
      }
      for (let i = 0; i < data.length; i++) {
        let dataTime = data[i].dataTime;
        dataMap[dataTime] = Number(data[i][flowType]);
      }
      for (let i = 0; i < range.length; i++) {
        let dataTime = range[i];
        if (isHour) {
          xAxis.push(TimeUtils.ts2Date(dataTime, "HH:00"));
        } else {
          xAxis.push(TimeUtils.ts2Date(dataTime, "MM-dd"));
        }
        if (dataMap[dataTime]) {
          series[0].push(dataMap[dataTime]);
        } else {
          series[0].push(0);
        }
      }
    }
    let chartData = {
      xAxis,
      series,
      legend,
    };

    setTrendData({ ...trendData, chartData: chartData, flowType: "inCount", data: data });
  };

  // 最近12个月客流趋势
  const getLast12MonthsFlowTrendData = (flowTrend, timeRange) => {
    const timeRangeReal = [dayjs(timeRange[0]), dayjs(timeRange[1])];
    if (flowTrend == null) return;
    const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRange(timeRangeReal, "month");

    const yAxisInCount = new Array(); // 进场人次

    // 根据x轴长度生成对应的y轴数据
    for (let i = 0; i < xAxis.length; i++) {
      // 获取当前时间段的时间戳范围
      const currentTimeSlot = CommonUtils.getTimeSlotByIndex(xAxisTime[i], xAxisTime[i + 1]);
      let inCount = 0;
      // 当前时间段数据
      flowTrend.forEach((item) => {
        if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
          inCount += item.inCount || 0;
        }
      });

      yAxisInCount.push(inCount);
    }
    let chartData = {
      xAxis: xAxis,
      xAxisTooltips,
      data: yAxisInCount,
    };
    setLast12MonthsFlowTrendData(chartData);
  };

  // 设备在线情况（copy by homePage)
  const getSiteDeviceData = (data) => {
    const onlineCount = Number(data.onlineCount);
    const offlineCount = Number(data.offlineCount);
    const totalCount = onlineCount + offlineCount;
    let onlineRate = 0;
    let offlineRate = 0;
    if (totalCount > 0) {
      onlineRate = Math.ceil((onlineCount / totalCount) * 100).toFixed(2);
      offlineRate = (100 - onlineRate).toFixed(2);
    }
    const deviceData = {
      onlineCount,
      offlineCount,
      onlineRate,
      offlineRate,
    };
    setDeviceData(deviceData);
  };

  // 楼层转化（copy by homePage)
  const getSiteFloorTransformData = (flowType = "inCount", data) => {
    const FlowTypePropMap = {
      [Constant.FLOW_TYPE.IN_COUNT]: "ic",
      [Constant.FLOW_TYPE.IN_NUM]: "in",
      [Constant.FLOW_TYPE.BATCH_COUNT]: "bc",
    };
    let key = FlowTypePropMap[flowType];
    let floors = data.floors;
    let doorsSum = data.doorsSum;
    let doorsSumMap = {};
    let inCount = Number(data.curFlow.inCount);
    let inNum = Number(data.curFlow.inNum);
    let total = flowType == Constant.FLOW_TYPE.IN_COUNT ? inCount : inNum;
    for (let i = 0; i < doorsSum.length; i++) {
      doorsSumMap[doorsSum[i].doorId] = doorsSum[i];
    }

    let converData = [];
    let arriveData = {
      yAxis: [],
      data: [],
      rateData: [],
    };
    for (let i = 0; i < floors.length; i++) {
      let floor = floors[i];
      let doors = floor.doors;
      let value = 0;
      if (doors.length > 0) {
        for (let j = 0; j < doors.length; j++) {
          let doorId = doors[j];
          if (doorsSumMap[doorId]) {
            value += Number(doorsSumMap[doorId][key]);
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
        if (rate % 1 !== 0) {
          rate = Number(rate.toFixed(2));
        }
      }
      arriveData.yAxis.push(floor.floorName);
      arriveData.data.push(value);
      arriveData.rateData.push(rate);
      converData.push(cvData);
    }
    let chartData = {
      converData,
      arriveData,
    };
    setFloorTransformData(chartData);
  };

  // 出入口客流情况（copy by homePage)
  const getSiteDoorRankingData = (data) => {
    let rankingData = DataConverter.getDooorRankingConvertData(data);
    setDoorRankingData(rankingData);
  };

  // 节日客流情况（copy by homePage)
  const getSiteFestivalData = (data) => {
    const festivalNameMap = {
      yuandan: Language.YUANDAN,
      chunjie: Language.CHUNJIE,
      qingming: Language.QINGMINGJIE,
      laodong: Language.LAODONGJIE,
      duanwu: Language.DUANWUJIE,
      zhongqiu: Language.ZHONGQIUJIE,
      guoqing: Language.GUOQINGJIE,
      qingren: Language.QINGRENJIE,
      funv: Language.FUNVJIE,
      muqin: Language.MUQINJIE,
      ertong: Language.ERTONGJIE,
      fuqin: Language.FUQINJIE,
      qixi: Language.QIXIJIE,
      jiaoshi: Language.JIAOSHIJIE,
      wansheng: Language.WANSHENGJIE,
      shuangshiyi: Language.SHUANGSHIYI,
      dongzhi: Language.DONGZHI,
      shengdan: Language.SHENGDANJIE,
    };
    let year = data.year;
    let lastYear = data.lastyear;
    let lastYearMap = {};

    for (let i = 0; i < lastYear.length; i++) {
      let item = lastYear[i];
      lastYearMap[item.f] = item;
    }
    let total = 0;

    for (let i = 0; i < year.length; i++) {
      let item = year[i];
      let inCount = Number(item.ic);
      total += inCount;
    }
    let list = [];

    for (let i = 0; i < year.length; i++) {
      let item = year[i];
      let inCount = Number(item.ic);
      let data = {
        key: i,
        name: festivalNameMap[item.f],
        value: inCount,
        rate: 0,
        yoy: 0,
      };
      if (total > 0) {
        data.rate = ((inCount / total) * 100).toFixed(2);
      }
      let lastYearInCount = 0;
      if (lastYearMap[item.f]) {
        lastYearInCount = Number(lastYearMap[item.f].ic);
        let yoyValue = inCount - lastYearInCount;
        if (inCount > 0 && lastYearInCount == 0) {
          data.yoy = 100;
        } else if (lastYearInCount > 0) {
          data.yoy = ((yoyValue / lastYearInCount) * 100).toFixed(2);
        }
      }
      list.push(data);
    }
    setFestivalData({ list: list });
  };

  const getSiteCustomerAttrData = (data) => {
    let chartData = DataConverter.getCustomerAttrConvertData(data);
    setCustomerAttr(chartData);
  };

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 格式化时间
  const formatTime = (date) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // 获取组件标签
  const getComponentLabel = (value) => {
    if (!value) return "";
    TzDataViewMap;
    const option = Object.values(TzDataViewMap).find((item) => item.value === value);
    return option ? option.moduleLabel : "";
  };

  // 渲染组件内容
  const renderComponent = (componentType) => {
    // 根据组件类型传递相应的 props
    switch (componentType) {
      case "floorConversion":
        return <FloorConversionChart chartData={floorTransformData} isLoading={isLoadingData.floorTransformData} />;
      case "deviceInfo":
        return <DeviceInfoChart chartData={deviceData} isFullscreen={isFullscreen} />;
      case "customerPortrait":
        return <CustomerPortraitChart chartData={customerAttr} isFullscreen={isFullscreen} isLoading={isLoadingData.customerAttr} />;
      case "entranceExit":
        return <OutLetFlowPanel data={doorRankingData} deduplication={config.deduplication} isLoading={isLoadingData.doorRankingData} />;
      case "holidayFlow":
        return <FestivalFlowPanel data={festivalData?.list || []} />;
      case "groupStatistics":
        return <GroupStatisticsPanel data={groupAnalysisMemberData} deduplication={config.deduplication} isLoading={isLoadingData.groupAnalysisMemberDataLoading} />;
      default:
        return <div style={{ color: "#fff", padding: "20px" }}>组件内容区域</div>;
    }
  };

  return (
    <div className={isMobile ? "TZdata-view-wrapper" : ""}>
      <div
        className="TZdata-view-container"
        style={
          isMobile
            ? { width: `${containerSize.width}px`, height: `${containerSize.height}px` }
            : { width: "100vw", height: "100vh", minWidth: `${minContainerSize.width}px`, minHeight: `${minContainerSize.height}px` }
        }>
        {/* 标题行 */}
        <div className="TZdata-view-header-row">
          {/* <div className="TZdata-view-site-name">{config.showSiteName === 1 ? <div>{config?.siteName || ""}</div> : <div></div>}</div> */}
          <div className="TZdata-view-title">{config.title || "北京市通州区党群服务阵地体系一屏通览"}</div>
          <div className="TZdata-view-time">{formatTime(currentTime)}</div>
        </div>

        {/* 主要内容区域 */}
        <div className="TZdata-view-main-content">
          {/* 左侧列 */}
          <div className="TZdata-view-left-column">
            {config.leftComponents &&
              config.leftComponents
                .filter((item) => item != null && item.component)
                .map((item, index) => {
                  return (
                    <div key={index} className="TZdata-view-component-item" style={{ height: `${item.percentage}%` }}>
                      <div className="component-title">
                        <div className="component-title-icon"></div>
                        <div className="component-title-text">{getComponentLabel(item.component)}</div>
                      </div>
                      <div className="component-content">{renderComponent(item.component)}</div>
                    </div>
                  );
                })}
          </div>

          {/* 中间区域 */}
          <div className="TZdata-view-center-area">
            <div className="TZdata-view-component-item" style={{ flex: 4 }}>
              {/* <div className="component-title">
                <div className="component-title-icon"></div>
                <div className="component-title-text">当前统计客流数据</div>
              </div>
              <DashboardPanel dashboardData={dashboardData} deduplication={config.deduplication} /> */}
            </div>
            <div className="TZdata-view-component-item" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {/* <div style={{ display: "flex", flex: 4, gap: "0.2rem" }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div className="component-title">
                    <div className="component-title-icon"></div>
                    <div className="component-title-text">今日客流趋势</div>
                  </div>
                  <div className="component-content">
                    <TrendChart chartData={trendData.chartData} isFullscreen={isFullscreen} isLoading={isLoadingData.trendData} />
                  </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div className="component-title" style={{ marginBottom: "0" }}>
                    <div className="component-title-icon"></div>
                    <div className="component-title-text">近7日工作日、周末分析</div>
                  </div>
                  <div className="component-content" style={{ flex: 1 }}>
                    <RecentSevenDaysChart chartData={recentSevenDaysData} isLoading={isLoadingData.recentSevenDaysData} />
                  </div>
                </div>
              </div> */}
              <div style={{ flex: 3, display: "flex", flexDirection: "column" }}>
                <div className="component-title">
                  <div className="component-title-icon"></div>
                  <div className="component-title-text">12个月服务人次趋势图</div>
                </div>
                <div className="component-content" style={{ flex: 1 }}>
                  <Last12MonthsFlowTrendChart chartData={last12MonthsFlowTrendData} isLoading={isLoadingData.last12MonthsFlowTrendData} />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧列 */}
          <div className="TZdata-view-right-column">
            {config.rightComponents &&
              config.rightComponents
                .filter((item) => item != null && item.component)
                .map((item, index) => {
                  return (
                    <div key={index} className="TZdata-view-component-item" style={{ height: `${item.percentage}%` }}>
                      <div className="component-title">
                        <div className="component-title-icon"></div>
                        <div className="component-title-text">{getComponentLabel(item.component)}</div>
                      </div>
                      <div className="component-content">{renderComponent(item.component)}</div>
                    </div>
                  );
                })}
          </div>
        </div>
        {isNeutralDomain ? null : <div className="TZdata-view-footer-row">由广州恒华科技提供技术支持，经理热线:13380018134梁工</div>}
      </div>
    </div>
  );
};

export default DataView;
