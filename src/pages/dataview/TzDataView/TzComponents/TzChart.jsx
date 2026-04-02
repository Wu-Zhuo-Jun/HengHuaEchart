import React, { use, useEffect, useMemo, useState, useRef } from "react";
import "../TzDataView.less";
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
import blueTriangle from "@/assets/dataviewImages/blueTriangle.png";
import orangeTriangle from "@/assets/dataviewImages/organgeTriangle.png";
import Wave from "./TzWave";

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
  const { offlineCount, onlineCount } = chartData || {};

  const chartDataArray = useMemo(() => {
    return [
      { name: "在线设备", value: onlineCount, color: "#00FF00" },
      { name: "离线设备", value: offlineCount, color: "#FF4444" },
    ];
  }, [offlineCount, onlineCount]);

  const suffix = chartData?.suffix || "";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", gap: "2rem", alignItems: "center", justifyContent: "center" }}>
      {chartDataArray.map((item, index) => (
        <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
          <span style={{ color: "#fff", fontSize: "1rem" }}>{item.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                width: "0.8rem",
                height: "0.8rem",
                borderRadius: "50%",
                backgroundColor: item.color,
                boxShadow: `0 0 8px ${item.color}`,
              }}
            />
            <span style={{ color: item.color, fontSize: "1.2rem", fontWeight: "bold" }}>
              {item.value || 0}
              {suffix}台
            </span>
          </div>
        </div>
      ))}
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
