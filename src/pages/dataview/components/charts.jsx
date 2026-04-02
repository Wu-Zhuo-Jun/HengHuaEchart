import React, { use, useEffect, useMemo, useState, useRef } from "react";
import "../DataView.less";
import { UIPanel, UISelect } from "@/components/ui/UIComponent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import {
  DVFlowTrendChart,
  DVSevenDaysAnalysisChart,
  DV12MonthsFlowTrendChart,
  DVFloorConverPieChart,
  DVFloorConverPieChartRose,
  DVcustomerTopChart,
  DVcustomerBottomChart,
} from "@/components/common/charts/Chart";
import { Skeleton } from "antd";
import { Language, text } from "@/language/LocaleContext";
import StringUtils from "@/utils/StringUtils";
import ArrayUtils from "@/utils/ArrayUtils";
import CommonUtils from "@/utils/CommonUtils";
import TimeUtils from "@/utils/TimeUtils";
import Constant from "@/common/Constant";
import { ageEnums } from "@/pages/flow/floorAnalyse/const";
import { useSite } from "@/context/SiteContext";
import Cake from "@/components/common/charts/Cake";
import blueTriangle from "@/assets/dataviewImages/blueTriangle.png";
import orangeTriangle from "@/assets/dataviewImages/organgeTriangle.png";
import Wave from "./Wave";

// 数据视图-客流趋势
export const TrendChart = React.memo(({ chartData, isFullscreen, isLoading }) => {
  const { xAxis, series } = chartData || {};
  const seriesData = series?.[0] || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [isFullscreen]);

  return <div style={{ width: "100%", height: "100%" }}>{isLoading ? <Skeleton active style={{ width: "100%", height: "100%" }} /> : <DVFlowTrendChart data={{ xAxis, seriesData }} />}</div>;
});

// 数据视图-近七日分析
export const RecentSevenDaysChart = React.memo(({ chartData, isLoading }) => {
  if (!chartData || !chartData.data1 || !chartData.data2 || !chartData.data3) {
    if (isLoading) {
      return <Skeleton active style={{ width: "100%", height: "100%" }} />;
    } else {
      return <div style={{ color: "#fff", padding: "20px" }}>暂无数据</div>;
    }
  }

  const { data1, data2, data3 } = chartData;

  // 时间段标签
  const timeLabels = [
    { name: text(Language.PARAM_LINGCHEN, { value: "(00:00-06:00)" }), range: "00:00-06:00" },
    { name: text(Language.PARAM_ZAOSHANG, { value: "(06:00-11:00)" }), range: "06:00-11:00" },
    { name: text(Language.PARAM_ZHONGWU, { value: "(11:00-14:00)" }), range: "11:00-14:00" },
    { name: text(Language.PARAM_XIAWU, { value: "(14:00-17:00)" }), range: "14:00-17:00" },
    { name: text(Language.PARAM_BANGWAN, { value: "(17:00-19:00)" }), range: "17:00-19:00" },
    { name: text(Language.PARAM_WANSHANG, { value: "(19:00-24:00)" }), range: "19:00-24:00" },
  ];

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", gap: "0.2rem" }}>
      {/* 左侧雷达图 */}
      <div style={{ flex: 1, minWidth: 0 }}>{isLoading ? <Skeleton active style={{ width: "100%", height: "100%" }} /> : <DVSevenDaysAnalysisChart data={{ data1, data2, data3 }} />}</div>

      {/* 右侧数据表格 */}
      <div style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <table
            style={{
              width: "100%",
              color: "#fff",
              fontSize: "1rem",
              borderCollapse: "collapse",
              boxSizing: "border-box",
              display: "table",
              tableLayout: "fixed",
              height: "100%",
              maxHeight: "100%",
            }}>
            <thead>
              <tr style={{ color: "#00FFFF" }}>
                <th style={{ textAlign: "center", fontWeight: "bold", wordBreak: "break-all", padding: "0.08rem", width: "30%" }}>时段</th>
                <th style={{ textAlign: "center", fontWeight: "bold", wordBreak: "break-all", padding: "0.08rem" }}>{Language.GONGZUORI}</th>
                <th style={{ textAlign: "center", fontWeight: "bold", wordBreak: "break-all", padding: "0.08rem" }}>{Language.ZHOUMO}</th>
                <th style={{ textAlign: "center", fontWeight: "bold", wordBreak: "break-all", padding: "0.08rem" }}>{Language.ZHENGTI}</th>
              </tr>
            </thead>

            <tbody style={{ fontSize: "0.96rem" }}>
              {timeLabels.map((item, index) => (
                <tr key={index} style={{ wordBreak: "break-all", lineHeight: "1.1" }}>
                  <td style={{ wordBreak: "break-all", padding: "0.08rem", width: "30%" }}>
                    <div style={{ textAlign: "center", lineHeight: "1.1" }}>{item.name.split("(")[0]}</div>
                    {/* <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", lineHeight: "1.1" }}>{item.range}</div> */}
                  </td>
                  <td style={{ textAlign: "center", wordBreak: "break-all", padding: "0.08rem", lineHeight: "1.1" }}>{data1[index] || 0}</td>
                  <td style={{ textAlign: "center", wordBreak: "break-all", padding: "0.08rem", lineHeight: "1.1" }}>{data2[index] || 0}</td>
                  <td style={{ textAlign: "center", wordBreak: "break-all", padding: "0.08rem", lineHeight: "1.1" }}>{data3[index] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

// 数据视图-最近12个月客流趋势
export const Last12MonthsFlowTrendChart = React.memo(({ chartData, isLoading }) => {
  const { xAxis, data, xAxisTooltips } = chartData || {};
  return (
    <div style={{ width: "100%", height: "100%" }}>
      {isLoading ? <Skeleton active style={{ width: "100%", height: "100%" }} /> : <DV12MonthsFlowTrendChart data={{ xAxis, data, xAxisTooltips }} />}
    </div>
  );
});

// 数据视图-楼层转化
export const FloorConversionChart = React.memo(({ chartData, isLoading }) => {
  const { converData, arriveData } = chartData || {};
  const extendedArriveData = useMemo(() => {
    if (arriveData && arriveData.yAxis && arriveData.yAxis.length > 5) {
      return {
        ...arriveData,
        yAxis: [...arriveData.yAxis, ...Array(2).fill("")],
        data: [...arriveData.data, ...Array(2).fill("")],
        rateData: [...arriveData.rateData, ...Array(2).fill("")],
      };
    }
    return arriveData;
  }, [arriveData]);

  // 计算每行高度，用于限制显示5行
  const rowHeight = useMemo(() => {
    // 根据 lineHeight: "1.1" 和 padding: "0.08rem" 计算
    return "calc(1.1em + 0.16rem)";
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row" }}>
      {/* 原配置：标准饼图（已注销，以备复原） */}
      {/* <div style={{ width: "25%", height: "100%" }}>{converData && <DVFloorConverPieChart data={converData} />}</div> */}
      {/* 新配置：南丁格尔玫瑰图 */}
      {isLoading ? (
        <Skeleton active style={{ width: "100%", height: "100%" }} />
      ) : (
        <>
          <div style={{ width: "50%", height: "100%" }}>{converData && <DVFloorConverPieChartRose data={converData} />}</div>
          <div style={{ width: "50%", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {arriveData && arriveData.yAxis && arriveData.yAxis.length > 0 ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", color: "#fff", fontSize: "0.9rem" }}>
                  {/* 表头 */}
                  <div style={{ display: "flex", flexDirection: "row", color: "#00FFFF", flexShrink: 0 }}>
                    <div style={{ flex: "0 0 30%", textAlign: "center", fontWeight: "bold", padding: "0.08rem" }}>{Language.LOUCENG}</div>
                    <div
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontWeight: "bold",
                        padding: "0.08rem",
                      }}>
                      {Language.JINCHANGRENCI}
                    </div>
                    <div style={{ flex: 1, textAlign: "center", fontWeight: "bold", padding: "0.08rem" }}>{Language.DIDAILV}</div>
                  </div>
                  {/* 数据行 */}
                  <div style={{ flex: 1, minHeight: 0, height: `calc(${rowHeight} * 5)` }}>
                    <Swiper
                      direction="vertical"
                      slidesPerView={5}
                      modules={[Autoplay]}
                      autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: false,
                      }}
                      speed={800}
                      style={{ height: "100%" }}
                      className="floor-conversion-swiper">
                      {extendedArriveData.yAxis.map((floorName, index) => (
                        <SwiperSlide key={index} style={{ height: rowHeight }}>
                          {floorName ? (
                            <div style={{ display: "flex", flexDirection: "row", lineHeight: "1.1", height: "100%" }}>
                              <div style={{ flex: "0 0 30%", textAlign: "center", padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {floorName}
                              </div>
                              <div style={{ flex: 1, textAlign: "center", padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {extendedArriveData.data[index] || 0}
                              </div>
                              <div style={{ flex: 1, textAlign: "center", padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {extendedArriveData.rateData[index] ? `${extendedArriveData.rateData[index]}%` : "0%"}
                              </div>
                            </div>
                          ) : (
                            <></>
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#fff", padding: "20px", textAlign: "center" }}>暂无数据</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

// 数据视图-设备详情
export const DeviceInfoChart = React.memo(({ chartData, isFullscreen }) => {
  const { offlineCount, offlineRate, onlineCount, onlineRate } = chartData || {};

  const containerRef = useRef(null);
  const cakeChartRef = useRef(null);
  const resizeHandlerRef = useRef(null);
  const chartDataArray = useMemo(() => {
    return [
      { name: "离线设备数量", value: offlineCount },
      { name: "在线设备数量", value: onlineCount },
    ];
  }, [offlineCount, onlineCount]);

  const chartDataArrayReverse = useMemo(() => {
    return [
      { name: "在线设备数量", value: onlineCount },
      { name: "离线设备数量", value: offlineCount },
    ];
  }, [offlineCount, onlineCount]);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化3D场景
    const cakeChart = new Cake();
    cakeChartRef.current = cakeChart;
    cakeChart.initThree(containerRef.current);

    // 根据全屏状态选择 viewControl 参数
    const defaultViewControl = isFullscreen
      ? {
          // 全屏模式参数
          autoCamera: true,
          width: 1.5,
          height: 0.75,
          depth: 0.4,
          centerX: -10,
          centerY: -40,
          centerZ: 1,
        }
      : {
          // 普通模式参数
          autoCamera: true,
          width: 1.2,
          height: 0.62,
          depth: 0.3,
          centerX: -10,
          centerY: -40,
          centerZ: 1,
        };

    // 准备图表数据（如果chartData有数据则使用，否则使用默认数据）
    const chartConfig = {
      // 颜色
      colors: chartData?.colors || ["#F9A231", "#668CE6"],
      // 数据
      // data: [
      // { name: "在线设备数量", value: onlineCount === 0 ? 1 : onlineCount },
      // { name: "离线设备数量", value: offlineCount === 0 ? 1 : offlineCount },
      // ],
      data: [
        { name: "小学", value: 1 },
        { name: "大学", value: 16 },
      ],
      // 是否显示标签
      isLabel: chartData?.isLabel !== undefined ? chartData.isLabel : true,
      // 最大高度
      maxHeight: chartData?.maxHeight || 40, // 基础高度
      baseHeight: chartData?.baseHeight || 30,
      // 半径（外半径）
      radius: chartData?.radius || 100,
      // 内半径（如果不提供，默认为外半径的60%）
      innerRadius: chartData?.innerRadius || chartData?.radius * 0.6 || 68,
      // 单位后缀
      suffix: chartData?.suffix || "",
      // 字体大小
      fontSize: chartData?.fontSize || 10,
      // 字体颜色
      fontColor: chartData?.fontColor || "rgba(255,255,255,1)",
      // 开启动画
      isAnimate: chartData?.isAnimate !== undefined ? chartData.isAnimate : true,
      // 视角控制（根据全屏状态使用不同参数）
      viewControl: chartData?.viewControl || defaultViewControl,
    };

    // 创建图表
    cakeChart.createChart(chartConfig);

    // 窗口大小调整处理
    resizeHandlerRef.current = () => {
      if (cakeChartRef.current) {
        cakeChartRef.current.onResize();
      }
    };
    window.addEventListener("resize", resizeHandlerRef.current);

    // 清理函数
    return () => {
      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
      }
      if (cakeChartRef.current) {
        cakeChartRef.current.cleanAll();
        cakeChartRef.current = null;
      }
    };
  }, [chartData, isFullscreen]);

  const colors = chartData?.colors || ["#F9A231", "#668CE6"];
  const colorsReverse = colors.reverse();
  const suffix = chartData?.suffix || "";
  const total = chartDataArray.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", gap: "1rem" }}>
      <div
        ref={containerRef}
        id="cake"
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          position: "relative",
        }}></div>
      <div
        style={{
          width: "100%",
          height: "100%",
          flex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        }}>
        {chartDataArrayReverse.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const color = colorsReverse[index % colors.length];
          const isFirst = index === 0;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: index < chartDataArray.length - 1 ? "1.2rem" : "0",
                position: "relative",
              }}>
              {/* 连接线和圆点 */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "4rem",
                }}>
                {/* 圆点 */}
                <div
                  style={{
                    width: "0.4rem",
                    height: "0.4rem",
                    borderRadius: "50%",
                    backgroundColor: color,
                    flexShrink: 0,
                    boxShadow: `0 0 4px ${color}`,
                  }}></div>
                {/* 连接线 */}
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    borderTop: isFirst ? `1px dashed ${color}` : `1px solid ${color}`,
                    marginLeft: "0.2rem",
                    marginRight: "0.2rem",
                    opacity: 0.8,
                  }}></div>
              </div>

              {/* 文本内容 */}
              <div style={{ color: "#fff", fontSize: "1.1rem", lineHeight: "1.5", whiteSpace: "nowrap", display: "flex", alignItems: "center", flex: 1, gap: "0.5rem" }}>
                <span style={{ color: "rgba(255,255,255,0.9)" }}>{item.name}: </span>
                <span style={{ color: color, fontWeight: "500", width: "2rem" }}>
                  {item.value}台{suffix}{" "}
                </span>
                <span style={{ color: color, fontWeight: "500" }}>{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// 数据视图-客户画像分析
export const CustomerPortraitChart = React.memo(({ chartData, isFullscreen, isLoading }) => {
  const { maleTotal, femaleTotal, maleRate, femaleRate, seriesData, yAxis, maleMaxDescForDv, femaleMaxDescForDv } = chartData || {};
  return (
    <div className="data-view-customer-portrait-chart">
      {isLoading ? (
        <Skeleton active style={{ width: "100%", height: "100%" }} />
      ) : (
        <>
          <div className="DVcustomerTop">
            <div className="DVcustomerTop-left">
              <div className="DVcustomerTop-left-item">
                <div>男性客流人次</div>
                <div className="value manValue">{maleRate ? maleRate?.toFixed(0) : 0}%</div>
              </div>
              <div className="DVcustomerTop-left-item">
                <div>女性客流人次</div>
                <div className="value girlValue">{femaleRate ? femaleRate?.toFixed(0) : 0}%</div>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "hidden", width: "100%", height: "100%" }}>
              <DVcustomerTopChart data={{ maleTotal, femaleTotal }} />
            </div>
          </div>
          <div className="DVcustomerBottom">
            <div className="DVcustomerBottom-left" style={{ flex: 3, width: "100%", height: "100%" }}>
              <DVcustomerBottomChart data={{ seriesData, yAxis }} />
            </div>
            <div className={`DVcustomerBottom-right ${isFullscreen ? "isFullscreen" : ""}`} style={{ flex: 1, overflow: "hidden", width: "100%", height: "100%" }}>
              <div>今日主力</div>
              <div>
                <Wave percentage={maleRate} isFullscreen={isFullscreen} gender="male" />
                <div>{maleMaxDescForDv}</div>
              </div>
              <div>
                <Wave percentage={femaleRate} isFullscreen={isFullscreen} gender="female" />
                <div>{femaleMaxDescForDv}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});
