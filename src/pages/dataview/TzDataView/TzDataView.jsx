import React, { useState, useEffect, useRef } from "react";
import { TzDataViewMap, festivalNameMap } from "@/data/const";
import { siteMap } from "./siteMap";
import Http from "@/config/Http";
import {
  TodayTrendPanel,
  RecentSevenDaysPanel,
  TrendChart,
  RecentSevenDaysChart,
  Last12MonthsFlowTrendChart,
  FloorConversionChart,
  DeviceInfoChart,
  CustomerPortraitChart,
} from "./TzComponents/TzChart";
import { TzMapDrawBoard } from "./TzComponents/TzMapDrawBoard";
import { FestivalFlowPanel, OutLetFlowPanel, GroupStatisticsPanel, FieldNumberPanel, DashboardPanel } from "./TzComponents/TzPanel";
import TimeUtils from "@/utils/TimeUtils";
import CommonUtils from "@/utils/CommonUtils";
import StringUtils from "@/utils/StringUtils";
import ArrayUtils from "@/utils/ArrayUtils";
import Constant from "@/common/Constant";
import DataConverter from "@/data/DataConverter";
import { Language } from "@/language/LocaleContext";
import dayjs from "dayjs";
import User from "@/data/UserData";
import "./TzDataView.less";
import { siteList as mockSiteList } from "./mockData";

// 通州默认大屏配置
const DEFAULT_CONFIG = {
  siteId: null,
  title: "北京市通州区党群服务阵地体系一屏通览",
  showSiteName: 1,
  deduplication: 0,
  leftComponents: [
    { component: "deviceInfo", percentage: 10 },
    { component: "fieldNumber", percentage: 20 },
    { component: "todayTrend", percentage: 30 },
    { component: "customerPortrait", percentage: 40 },
  ],
  rightComponents: [
    { component: "recentSevenDays", percentage: 30 },
    { component: "holidayFlow", percentage: 30 },
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
  const [tagList, setTagList] = useState([]);
  const [siteList, setSiteList] = useState([]);
  const [selectSiteList, setSelectSiteList] = useState([]);
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

  useEffect(() => {
    initTagAndSiteData();
  }, []);

  const initTagAndSiteData = () => {
    Http.getTagManagementGetTagList(
      {},
      (res) => {
        setTagList(res.data || []);
        Http.getTagManagementGetAssocSites(
          { tagIds: null },
          (res2) => {
            setSiteList(res2.data || []);
          },
          null,
          (error) => console.error("getAssocSites 失败:", error)
        );
      },
      null,
      (error) => {
        console.error("getTagList 失败:", error);
        setSiteList([...mockSiteList]);
        setSelectSiteList([...mockSiteList]);
      }
    );
  };

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
    const ids = selectSiteList.length === siteList.length ? null : selectSiteList.map((item) => item.siteId); // 请求场地id 全部请求就缺省null 否则 [1,2,3..]
    const year = dayjs(dateString).year();

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

    Http.getDeviceOnlineInfo(
      { siteIds: ids },
      (res) => {
        getSiteDeviceData(res.data);
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );

    Http.getFlowTrend(
      { siteIds: ids, clearTime: 0, startDate: dateString, endDate: dateString },
      (res) => {
        const timeRange = [dayjs(dateString), dayjs(dateString)];
        setFlowTrendData(Constant.TIME_TYPE.TODAY, "inCount", timeRange, [res.data.inCount]);
        setIsLoadingData((prevData) => ({
          ...prevData,
          trendData: false,
        }));
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );

    Http.getFaceTotal(
      { siteIds: ids, clearTime: 0, startDate: dateString, endDate: dateString },
      (res) => {
        getSiteCustomerAttrData(res.data);
        setIsLoadingData((prevData) => ({
          ...prevData,
          customerAttr: false,
        }));
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );

    // 请求近12个月以及本年度客流
    const TimeReuqestList = TimeUtils.getLast12MonthsRangeArray();
    Promise.all(
      TimeReuqestList.map(({ start, end }) =>
        httpToPromise(Http.getFlowTotal, {
          siteIds: ids,
          clearTime: 0,
          startDate: start,
          endDate: end,
        })
      )
    )
      .then((results) => {
        const Last12MonthsArray = [];
        results.forEach((item) => {
          if (item.result == 1) {
            Last12MonthsArray.unshift(item?.data?.inCount || 0);
          } else {
            Last12MonthsArray.unshift(0);
          }
        });
        getLast12MonthsFlowTrendData(Last12MonthsArray, [startDateLast12Months, endDateLast12Months]);
        setIsLoadingData((prevData) => ({
          ...prevData,
          last12MonthsFlowTrendData: false,
        }));
      })
      .catch((error) => {
        console.error("请求数据失败:", error);
      });

    // 请求节假日
    const currentYear = year;
    const lastYear = year - 1;
    Promise.all([
      // 节假日今年
      httpToPromise(Http.getFestivalTotal, { siteIds: ids, year: currentYear, clearTime: 0 }),
      // 节假日去年
      httpToPromise(Http.getFestivalTotal, { siteIds: ids, year: lastYear, clearTime: 0 }),
      // 7-9月今年
      httpToPromise(Http.getFlowTotal, { siteIds: ids, clearTime: 0, startDate: TimeUtils.getJulyToSeptemberRange(currentYear).start, endDate: TimeUtils.getJulyToSeptemberRange(currentYear).end }),
      // 7-9月去年
      httpToPromise(Http.getFlowTotal, { siteIds: ids, clearTime: 0, startDate: TimeUtils.getJulyToSeptemberRange(lastYear).start, endDate: TimeUtils.getJulyToSeptemberRange(lastYear).end }),
      // 1-2月今年
      httpToPromise(Http.getFlowTotal, {
        siteIds: ids,
        clearTime: 0,
        startDate: TimeUtils.getJanuaryToFebruaryRange(currentYear).start,
        endDate: TimeUtils.getJanuaryToFebruaryRange(currentYear).end,
      }),
      // 1-2月去年
      httpToPromise(Http.getFlowTotal, { siteIds: ids, clearTime: 0, startDate: TimeUtils.getJanuaryToFebruaryRange(lastYear).start, endDate: TimeUtils.getJanuaryToFebruaryRange(lastYear).end }),
    ])
      .then((results) => {
        console.log("节假日客流数据:", results[0], results[1]);
        console.log("暑期(7-9月)客流数据:", results[2], results[3]);
        console.log("寒假(1-2月)客流数据:", results[4], results[5]);

        const summerHolidayThisYear = results[2].data.inCount;
        const summerHolidayLastYear = results[3].data.inCount;
        const winterHolidayThisYear = results[4].data.inCount;
        const winterHolidayLastYear = results[5].data.inCount;
        let year = [];
        let lastYear = [];

        results[0]?.data?.inCount.forEach((item, i) => {
          year.push({ festivalKey: results[0]?.data?.festival[i], inCount: item });
        });
        year.push({ festivalKey: "shujia", inCount: summerHolidayThisYear });
        year.push({ festivalKey: "hanjia", inCount: winterHolidayThisYear });
        results[1]?.data?.inCount.forEach((item, i) => {
          lastYear.push({ festivalKey: results[1]?.data?.festival[i], inCount: item });
        });
        lastYear.push({ festivalKey: "shujia", inCount: summerHolidayLastYear });
        lastYear.push({ festivalKey: "hanjia", inCount: winterHolidayLastYear });
        getSiteFestivalData({ year: year, lastYear: lastYear });
      })
      .catch((error) => {
        console.error("请求数据失败:", error);
      });

    Http.getSiteRanking(
      { siteIds: ids, clearTime: 0, startDate: dateString, endDate: dateString },
      (res) => {
        console.log(res);
      },
      null,
      (error) => {
        console.error("请求数据失败:", error);
      }
    );

    // 获取近7天数据并区分工作日和周末
    const last7DaysData = TimeUtils.getLast7DaysWithWeekday();
    const weekdayRequests = last7DaysData.filter((d) => !d.isWeekend).map((d) => httpToPromise(Http.getFlowTrend, { siteIds: ids, clearTime: 0, startDate: d.date, endDate: d.date }));
    const weekendRequests = last7DaysData.filter((d) => d.isWeekend).map((d) => httpToPromise(Http.getFlowTrend, { siteIds: ids, clearTime: 0, startDate: d.date, endDate: d.date }));

    Promise.all([...weekdayRequests, ...weekendRequests])
      .then((results) => {
        const weekdayCount = weekdayRequests.length;
        const weekdayData = results.slice(0, weekdayCount).map((res) => res.data.inCount || 0);
        const weekendData = results.slice(weekdayCount).map((res) => res.data.inCount || 0);
        console.log("近7日工作日数据:", weekdayData);
        console.log("近7日周末数据:", weekendData);
        let chartData = DataConverter.getNewVisitingPeakConvertData(1, { data: { weekdayData, weekendData } });
        setIsLoadingData((prevData) => ({
          ...prevData,
          recentSevenDaysData: false,
        }));
      })
      .catch((error) => {
        console.error("请求近7日数据失败:", error);
      });
  };

  // 客流趋势
  const setFlowTrendData = (timeType = Constant.TIME_TYPE.TODAY, flowType = "inCount", timeRange, data) => {
    const legendMap = {
      [Constant.TIME_TYPE.TODAY]: [Language.JINRIKELIU, Language.ZUORIKELIU, Language.SHANGZHOUTONGQI],
      [Constant.TIME_TYPE.WEEK]: [Language.JINZHOUKELIU, Language.SHANGZHOUKELIU],
      [Constant.TIME_TYPE.MONTH]: [Language.BENYUEKELIU, Language.SHANGYUEKELIU, Language.SHANGNIANTONGYUEKELIU],
      [Constant.TIME_TYPE.YEAR]: [Language.JINNIANKELIU, Language.SHANGNIANKELIU],
      [Constant.TIME_TYPE.DATE]: [Language.KELIUQUSHI],
    };
    const { xAxis } = CommonUtils.generateXAxisFromTimeRange(timeRange, "hour");
    const xAxisLength = xAxis.length;
    const legend = legendMap[timeType];
    const series = [];

    for (let i = 0; i < legend.length; i++) {
      // 当后端 API 数据长度小于 xAxisLength 时，用 0 填充至完整长度
      const rawData = data[i] || [];
      series[i] = rawData.length < xAxisLength ? [...rawData, ...Array(xAxisLength - rawData.length).fill(0)] : rawData.slice(0, xAxisLength);
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

    let chartData = {
      xAxis: xAxis,
      xAxisTooltips,
      data: flowTrend,
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

  // 节日客流情况
  const getSiteFestivalData = (data) => {
    let year = data.year;
    let lastYear = data.lastYear;
    let lastYearMap = {};
    let maxNumber = 0;

    // 构建去年数据Map，便于查询
    for (let i = 0; i < lastYear.length; i++) {
      let item = lastYear[i];
      lastYearMap[item.festivalKey] = item;
    }

    // 按指定顺序筛选并处理节日数据
    const filterFestivalKeys = ["yuandan", "chunjie", "funv", "laodong", "duanwu", "shujia", "zhongqiu", "guoqing", "hanjia"];
    let list = [];

    for (let i = 0; i < filterFestivalKeys.length; i++) {
      let festivalKey = filterFestivalKeys[i];
      let yearItem = year.find((item) => item.festivalKey === festivalKey);
      let inCount = yearItem ? Number(yearItem.inCount) : 0;

      // 计算最大 inCount 值
      if (inCount > maxNumber) {
        maxNumber = inCount;
      }

      let lastYearInCount = 0;
      if (lastYearMap[festivalKey]) {
        lastYearInCount = Number(lastYearMap[festivalKey].inCount);
      }

      let rate = 0;
      if (inCount > 0 && lastYearInCount === 0) {
        rate = 100;
      } else if (inCount > 0 && lastYearInCount > 0) {
        rate = Number(StringUtils.toFixed(((inCount - lastYearInCount) / lastYearInCount) * 100, 2));
      }

      list.push({
        key: i,
        name: festivalNameMap[festivalKey],
        value: inCount,
        rate: rate,
      });
    }

    setFestivalData({ list: list, maxValue: maxNumber });
  };

  // 客户画像分析
  const getSiteCustomerAttrData = (data) => {
    let chartData = DataConverter.getNewCustomerAttrConvertData(data);

    // 合并seriesData[0].data和seriesData[1].data的第0、1项，并删除最后一项 最后简化为幼儿、青少年、中年、老年四项
    if (chartData && chartData.seriesData && chartData.seriesData.length >= 2) {
      // 对每个seriesData的data处理
      chartData.seriesData.forEach((series) => {
        if (series.data && series.data.length >= 2) {
          // 合并第0项和第1项
          series.data[0] = series.data[0] + series.data[1];
          // 删除第1项
          series.data.splice(1, 1);
        }
        // 删除最后一项
        series.data.pop();
      });
    }
    // 通州项目处理
    let ageAttrArr = ["幼年", "青少年", "中年", "老年"];
    const ageMale = chartData.seriesData[0].data;
    const ageFemale = chartData.seriesData[1].data;
    let total = chartData?.maleTotal + chartData?.femaleTotal;
    let maleMaxRate = 0;
    let femaleMaxRate = 0;
    let maleMaxDesc = null;
    let femaleMaxDesc = null;
    let maleMax = ArrayUtils.getMaxValue(ageMale);
    let femaleMax = ArrayUtils.getMaxValue(ageFemale);
    if (maleMax > 0 && total > 0) {
      maleMaxRate = StringUtils.toFixed((maleMax / total) * 100, 2);
      maleMaxDesc = `${ageAttrArr[ageMale.indexOf(maleMax)]}${StringUtils.toFixed(maleMaxRate, 0)}%`;
    }
    if (femaleMax > 0 && total > 0) {
      femaleMaxRate = StringUtils.toFixed((femaleMax / total) * 100, 2);
      femaleMaxDesc = `${ageAttrArr[ageFemale.indexOf(femaleMax)]}    ${Language.NV}  ${Language.ZHANBI} ${StringUtils.toFixed(femaleMaxRate, 0)}%`;
    }
    const seriesData = [
      { name: Language.NAN, data: ageMale },
      { name: Language.NV, data: ageFemale },
    ];
    const convertData = {
      ...chartData,
      seriesData,
      maleMaxRate,
      femaleMaxRate,
      maleMaxDesc,
      femaleMaxDesc,
      yAxis: ageAttrArr,
    };
    setCustomerAttr(convertData);
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
      case "fieldNumber":
        return <FieldNumberPanel />;
      case "floorConversion":
        return <FloorConversionChart chartData={floorTransformData} isLoading={isLoadingData.floorTransformData} />;
      case "deviceInfo":
        return <DeviceInfoChart chartData={deviceData} isFullscreen={isFullscreen} />;
      case "customerPortrait":
        return <CustomerPortraitChart chartData={customerAttr} isFullscreen={isFullscreen} isLoading={isLoadingData.customerAttr} />;
      case "entranceExit":
        return <OutLetFlowPanel data={doorRankingData} deduplication={config.deduplication} isLoading={isLoadingData.doorRankingData} />;
      case "holidayFlow":
        return <FestivalFlowPanel data={festivalData?.list || []} maxNumber={festivalData?.maxValue || 0} />;
      case "groupStatistics":
        return <GroupStatisticsPanel data={groupAnalysisMemberData} deduplication={config.deduplication} isLoading={isLoadingData.groupAnalysisMemberDataLoading} />;
      case "todayTrend":
        return <TodayTrendPanel chartData={trendData.chartData} isFullscreen={isFullscreen} isLoading={isLoadingData.trendData} />;
      case "recentSevenDays":
        return <RecentSevenDaysPanel chartData={recentSevenDaysData} isLoading={isLoadingData.recentSevenDaysData} />;
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
                        {/* <div className="component-title-icon"></div> */}
                        <div className="component-title-text">{getComponentLabel(item.component)}</div>
                      </div>
                      <div className="component-content">{renderComponent(item.component)}</div>
                    </div>
                  );
                })}
          </div>

          {/* 中间区域 */}
          <div className="TZdata-view-center-area">
            <div style={{ flex: 4 }}>
              <TzMapDrawBoard />
            </div>
            <div className="TZdata-view-component-item" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              <div style={{ flex: 3, display: "flex", flexDirection: "column" }}>
                <div className="component-title">
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
                        {/* <div className="component-title-icon"></div> */}
                        <div className="component-title-text">{getComponentLabel(item.component)}</div>
                      </div>
                      <div className="component-content">{renderComponent(item.component)}</div>
                    </div>
                  );
                })}
          </div>
        </div>
        {/* {isNeutralDomain ? null : <div className="TZdata-view-footer-row">由广州恒华科技提供技术支持，经理热线:13380018134梁工</div>} */}
      </div>
    </div>
  );
};

export default DataView;
