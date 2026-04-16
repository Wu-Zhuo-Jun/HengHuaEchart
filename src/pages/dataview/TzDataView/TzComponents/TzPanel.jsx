import React, { useState, useMemo } from "react";
import "../TzDataView.less";
import middleDataBottom from "@/assets/dataviewImages/middleDataBottom.png";
import CommonUtils from "@/utils/CommonUtils";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Language } from "@/language/LocaleContext";
import TzRankOne from "@/assets/dataviewImages/TzRankOne.png";
import TzRanKTwo from "@/assets/dataviewImages/TzRanKTwo.png";
import fieldBlock from "@/assets/dataviewImages/fieldBlock.png";
import fieldBeam from "@/assets/dataviewImages/field.png";
import TzFieldOne from "@/assets/dataviewImages/TzFieldOne.png";
import TzFieldTwo from "@/assets/dataviewImages/TzFieldTwo.png";
import TzFieldThree from "@/assets/dataviewImages/TzFieldThree.png";
import TzFieldFour from "@/assets/dataviewImages/TzFieldFour.png";
import { Skeleton } from "antd";

const DEFAULT_FIELD_POSITION_ITEMS = [
  { label: "区级", value: 1, icon: TzFieldOne },
  { label: "街道乡镇级", value: 29, icon: TzFieldTwo },
  { label: "社区村级", value: 459, icon: TzFieldThree },
  { label: "网络级", value: 7, icon: TzFieldFour },
];

/**
 * 阵地数量面板：左侧总面积 + 底座图，右侧四级阵地数量 2×2 网格
 */
export const FieldNumberPanel = React.memo(({ areaMainText = "21.35", areaSubText = "万平方米", areaLabel = "阵地面积", items = DEFAULT_FIELD_POSITION_ITEMS }) => {
  return (
    <div className="tz-field-position-pane">
      <div className="tz-field-position-pane__body">
        <div className="tz-field-position-pane__left">
          <div className="tz-field-position-pane__left-inner">
            <div className="tz-field-position-pane__area-value">
              <span className="tz-field-position-pane__area-main">{areaMainText}</span>
              <span className="tz-field-position-pane__area-sub">{areaSubText}</span>
            </div>
            <div className="tz-field-position-pane__area-label">{areaLabel}</div>
            {/* <div className="tz-field-position-pane__beam-wrap"><img className="tz-field-position-pane__beam" src={fieldBeam} alt="" /></div> */}
            <img className="tz-field-position-pane__pedestal" src={middleDataBottom} alt="" />
          </div>
        </div>
        <div className="tz-field-position-pane__grid">
          {items.map((row, idx) => (
            <div key={`${row.label}-${idx}`} className="tz-field-position-pane__card">
              {/* <div className="tz-field-position-pane__card-bg" style={{ backgroundImage: `url(${fieldBlock})` }} /> */}
              <div className="tz-field-position-pane__card-inner">
                <div className="tz-field-position-pane__card-icon-wrap">
                  <img className="tz-field-position-pane__card-icon" src={row.icon} alt="" />
                </div>
                <div className="tz-field-position-pane__card-text">
                  <div className="tz-field-position-pane__card-label">{row.label}</div>
                  {/* <div className="tz-field-position-pane__card-value-wrap"> */}
                  <div className="tz-field-position-pane__card-value">{row.value}</div>
                  <img className="tz-field-position-pane__card-beam" src={fieldBeam} alt="" />

                  {/* </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export const DashboardPanel = ({ dashboardData, deduplication }) => {
  const {
    dailyCount,
    dailyCountRate,
    dailyNum,
    dailyNumRate,
    weeklyCount,
    weeklyCountRate,
    weeklyNum,
    weeklyNumRate,
    monthlyCount,
    monthlyCountRate,
    monthlyNum,
    monthlyNumRate,
    annualCount,
    annualCountRate,
    annualNum,
    annualNumRate,
  } = dashboardData;
  return (
    <div className="dashboard-panel">
      <div className="dashboard-panel-item">
        <div className="dashboard-panel-item-title">今日客流</div>
        <div className="dashboard-panel-item-count">
          <div className="dashboard-panel-item-count-value">{CommonUtils.formatNumberToUnit(dailyCount).fullText}</div>
          <div className="dashboard-panel-item-count-value-rate">
            <span>人次</span>
            <span className="rate" style={{ color: dailyCountRate < 0 ? "#00FF00" : " #FF0000 " }}>
              {dailyCountRate < 0 ? "" : "+"}
              {dailyCountRate}%
            </span>
          </div>
        </div>
        {deduplication === 1 ? (
          <div className="dashboard-panel-item-num ">
            <div className="dashboard-panel-item-num-value">{CommonUtils.formatNumberToUnit(dailyNum).fullText}</div>

            <div className="dashboard-panel-item-num-value-rate">
              <span>人数</span>
              <span className="rate" style={{ color: dailyNumRate < 0 ? "#00FF00" : " #FF0000 " }}>
                {dailyNumRate < 0 ? "" : "+"}
                {dailyNumRate}%
              </span>
            </div>
          </div>
        ) : null}
        <img className="bottomImg" src={middleDataBottom} alt="middleDataBottom" />
      </div>
      <div className="dashboard-panel-item">
        <div className="dashboard-panel-item-title">本周客流</div>
        <div className="dashboard-panel-item-count">
          <div className="dashboard-panel-item-count-value">{CommonUtils.formatNumberToUnit(weeklyCount).fullText}</div>
          <div className="dashboard-panel-item-count-value-rate">
            <span>人次</span>
            <span className="rate" style={{ color: weeklyCountRate < 0 ? "#00FF00" : " #FF0000 " }}>
              {weeklyCountRate < 0 ? "" : "+"}
              {weeklyCountRate}%
            </span>
          </div>
        </div>
        {deduplication === 1 ? (
          <div className="dashboard-panel-item-num">
            <div className="dashboard-panel-item-num-value">{CommonUtils.formatNumberToUnit(weeklyNum).fullText}</div>
            <div className="dashboard-panel-item-num-value-rate">
              <span>人数</span>
              <span className="rate" style={{ color: weeklyNumRate < 0 ? "#00FF00" : " #FF0000 " }}>
                {weeklyNumRate < 0 ? "" : "+"}
                {weeklyNumRate}%
              </span>
            </div>
          </div>
        ) : null}
        <img className="bottomImg" src={middleDataBottom} alt="middleDataBottom" />
      </div>
      <div className="dashboard-panel-item">
        <div className="dashboard-panel-item-title">本月客流</div>
        <div className="dashboard-panel-item-count">
          <div className="dashboard-panel-item-count-value">{CommonUtils.formatNumberToUnit(monthlyCount).fullText}</div>
          <div className="dashboard-panel-item-count-value-rate">
            <span>人次</span>
            <span className="rate" style={{ color: monthlyCountRate < 0 ? "#00FF00" : " #FF0000 " }}>
              {monthlyCountRate < 0 ? "" : "+"}
              {monthlyCountRate}%
            </span>
          </div>
        </div>
        {deduplication === 1 ? (
          <div className="dashboard-panel-item-num">
            <div className="dashboard-panel-item-num-value">{CommonUtils.formatNumberToUnit(monthlyNum).fullText}</div>
            <div className="dashboard-panel-item-num-value-rate">
              <span>人数</span>
              <span className="rate" style={{ color: monthlyNumRate < 0 ? "#00FF00" : " #FF0000 " }}>
                {monthlyNumRate < 0 ? "" : "+"}
                {monthlyNumRate}%
              </span>
            </div>
          </div>
        ) : null}
        <img className="bottomImg" src={middleDataBottom} alt="middleDataBottom" />
      </div>
      <div className="dashboard-panel-item">
        <div className="dashboard-panel-item-title">年度客流</div>
        <div className="dashboard-panel-item-count">
          <div className="dashboard-panel-item-count-value">{CommonUtils.formatNumberToUnit(annualCount).fullText}</div>
          <div className="dashboard-panel-item-count-value-rate">
            <span>人次</span>
            <span className="rate" style={{ color: annualCountRate < 0 ? "#00FF00" : " #FF0000 " }}>
              {annualCountRate < 0 ? "" : "+"}
              {annualCountRate}%
            </span>
          </div>
        </div>
        {deduplication === 1 ? (
          <div className="dashboard-panel-item-num">
            <div className="dashboard-panel-item-num-value">{CommonUtils.formatNumberToUnit(annualNum).fullText}</div>
            <div className="dashboard-panel-item-num-value-rate">
              <span>人数</span>
              <span className="rate" style={{ color: annualNumRate < 0 ? "#00FF00" : " #FF0000 " }}>
                {annualNumRate < 0 ? "" : "+"}
                {annualNumRate}%
              </span>
            </div>
          </div>
        ) : null}
        <img className="bottomImg" src={middleDataBottom} alt="middleDataBottom" />
      </div>
    </div>
  );
};

// 数据视图-节假日客流情况
export const FestivalFlowPanel = React.memo(({ data, maxNumber }) => {
  // 计算每行高度，用于限制显示5行
  const rowHeight = useMemo(() => {
    // 根据 lineHeight: "1.1" 和 padding: "0.08rem" 计算
    return "calc(1.1em + 0.16rem)";
  }, []);

  // 扩展数据数组，如果数据超过5条，添加空行用于轮播
  const extendedData = useMemo(() => {
    if (data && data.length > 7) {
      return [...data, ...Array(2).fill(null)];
    }
    return data;
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", color: "#fff", fontSize: "1rem" }}>
      {/* 表头 */}
      <div style={{ display: "flex", flexDirection: "row", flexShrink: 0, marginBottom: "0.4rem" }}>
        <div style={{ flex: "0 0 6rem", textAlign: "left", padding: "0.08rem", paddingLeft: "0.7rem" }}>节日</div>
        <div style={{ flex: 3, textAlign: "left", padding: "0.08rem" }}>服务人次</div>
        <div style={{ flex: 1, textAlign: "left", padding: "0.08rem" }}>{Language.TONGBISHANGNIAN}</div>
      </div>
      {/* 数据行 */}
      <div style={{ flex: 1, minHeight: 0, height: `calc(${rowHeight} * 7)` }}>
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
          className="outlet-flow-swiper">
          {extendedData.map((item, index) => {
            const rate = parseFloat(item?.rate) || 0;
            const isPositive = rate > 0;
            const rateText = rate === 0 ? "0%" : `${isPositive ? "+" : ""}${rate}%`;
            return (
              <SwiperSlide key={item ? (item.key !== undefined ? item.key : index) : `empty-${index}`} style={{ height: rowHeight }}>
                {item ? (
                  <div style={{ display: "flex", flexDirection: "row", lineHeight: "1.1", height: "100%" }}>
                    {(() => {
                      return (
                        <>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                              marginRight: "0.4rem",
                            }}>
                            <div
                              style={{
                                width: 0,
                                height: 0,
                                borderTop: "0.4rem solid transparent",
                                borderBottom: "0.4rem solid transparent",
                                borderLeft: "0.45rem solid #00ffff",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              flex: "0 0 5rem",
                              textAlign: "left",
                              padding: "0.08rem",
                              lineHeight: "1.1",
                              display: "flex",
                              alignItems: "center",
                            }}>
                            {item.name || "-"}
                          </div>
                          <div style={{ flex: 3, padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FestivalProgressItem value={item.value} maxNumber={maxNumber} />
                          </div>
                          <div
                            style={{
                              flex: 1,
                              textAlign: "center",
                              padding: "0.08rem",
                              lineHeight: "1.1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isPositive ? "#FF0000" : rate < 0 ? "#00FF00" : "#fff",
                            }}>
                            {rateText}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <></>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
});

const FestivalProgressItem = ({ value, maxNumber }) => {
  const radio = maxNumber !== 0 ? ((value / maxNumber) * 100).toFixed(2) : 0;
  return (
    <div className="festival-flow-progress-container">
      <div style={{ textAlign: "right", lineHeight: "1.1" }}>{value}</div>
      <div className="festival-flow-progress">
        <div className="festival-flow-progress-bar" style={{ width: `${radio}%` }}></div>
        {/* <div className="festival-flow-progress-point"></div> */}
      </div>
    </div>
  );
};

// 数据视图-出入口客流情况
export const OutLetFlowPanel = React.memo(({ data, deduplication, isLoading }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    if (isLoading) {
      return <Skeleton active style={{ width: "100%", height: "100%" }} />;
    } else {
      return <div style={{ color: "#fff", padding: "20px", textAlign: "center" }}>暂无数据</div>;
    }
  }

  // 计算每行高度，用于限制显示5行
  const rowHeight = useMemo(() => {
    // 根据 lineHeight: "1.1" 和 padding: "0.08rem" 计算
    return "calc(1.1em + 0.16rem)";
  }, []);

  // 扩展数据数组，如果数据超过5条，添加空行用于轮播
  const extendedData = useMemo(() => {
    if (data && data.length > 5) {
      return [...data, ...Array(2).fill(null)];
    }
    return data;
  }, [data]);

  // 获取排名颜色
  const getRankingColor = (ranking) => {
    if (ranking === 1) {
      return "#FF4500"; // 1st place: deeper, more saturated with red
    } else if (ranking === 2) {
      return "#FFA500"; // 2nd place: orange
    } else if (ranking === 3) {
      return "#00FFFF"; // 3rd place: cyan/blue
    }
    return "#fff"; // others: white
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", color: "#fff", fontSize: "0.9rem" }}>
      {/* 表头 */}
      <div style={{ display: "flex", flexDirection: "row", color: "#00FFFF", flexShrink: 0 }}>
        <div style={{ flex: "0 0 2rem", textAlign: "left", fontWeight: "bold", padding: "0.08rem" }}>{Language.PAIMING}</div>
        <div style={{ flex: 2, textAlign: "center", fontWeight: "bold", padding: "0.08rem" }}>{Language.CHURUKOU}</div>
        <div style={{ flex: 1, textAlign: "center", fontWeight: "bold", padding: "0.08rem" }}>{Language.JINCHANGRENCI}</div>
        {deduplication === 1 ? <div style={{ flex: 1, textAlign: "center", fontWeight: "bold", padding: "0.08rem" }}>{Language.JINCHANGRENSHU}</div> : null}
        <div style={{ flex: 1, textAlign: "center", fontWeight: "bold", padding: "0.08rem" }}>{Language.KELIUPICI}</div>
        <div style={{ flex: 1, textAlign: "center", fontWeight: "bold", padding: "0.08rem" }}>{Language.HUANBI}</div>
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
          className="outlet-flow-swiper">
          {extendedData.map((item, index) => {
            // 排名：数据已经排好序，直接使用索引 + 1（extendedData 前 data.length 项就是原始数据）
            const ranking = item ? index + 1 : null;

            return (
              <SwiperSlide key={item ? (item.key !== undefined ? item.key : index) : `empty-${index}`} style={{ height: rowHeight }}>
                {item ? (
                  <div style={{ display: "flex", flexDirection: "row", lineHeight: "1.1", height: "100%" }}>
                    {(() => {
                      const qoqValue = parseFloat(item.qoq) || 0;
                      const isPositive = qoqValue > 0;
                      const qoqText = qoqValue === 0 ? "0%" : `${isPositive ? "+" : ""}${qoqValue}%`;

                      return (
                        <>
                          <div
                            style={{
                              flex: "0 0 2rem",
                              textAlign: "left",
                              padding: "0.08rem",
                              lineHeight: "1.1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.3rem",
                              fontWeight: "bold",
                              color: getRankingColor(ranking),
                            }}>
                            {ranking}
                          </div>
                          <div className="text-ellipsis" style={{ flex: 2, padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {item.name || "-"}
                          </div>
                          <div style={{ flex: 1, textAlign: "center", padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {CommonUtils.formatNumberToUnit(item.inCount).fullText || 0}
                          </div>
                          {deduplication === 1 ? (
                            <div style={{ flex: 1, textAlign: "center", padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {CommonUtils.formatNumberToUnit(item.inNum).fullText || 0}
                            </div>
                          ) : null}
                          <div style={{ flex: 1, textAlign: "center", padding: "0.08rem", lineHeight: "1.1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {CommonUtils.formatNumberToUnit(item.batchCount).fullText || 0}
                          </div>
                          <div
                            style={{
                              flex: 1,
                              textAlign: "center",
                              padding: "0.08rem",
                              lineHeight: "1.1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isPositive ? "#FF0000" : qoqValue < 0 ? "#00FF00" : "#fff",
                            }}>
                            {qoqText}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <></>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
});

// 数据视图-集团统计分析
export const GroupStatisticsPanel = React.memo(({ data, deduplication, isLoading }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    if (isLoading) {
      return <Skeleton active style={{ width: "100%", height: "100%" }} />;
    } else {
      return <div style={{ color: "#fff", padding: "20px", textAlign: "center" }}>暂无数据</div>;
    }
  }

  // 计算每行高度，用于限制显示8行
  const rowHeight = useMemo(() => {
    // 根据 lineHeight: "1.1" 和 padding: "0.08rem" 计算
    return "calc(1.1em + 0.16rem)";
  }, []);

  // 扩展数据数组，如果数据超过8条，添加空行用于轮播
  const extendedData = useMemo(() => {
    if (data && data.length > 5) {
      return [...data, ...Array(2).fill(null)];
    }
    return data;
  }, [data]);

  // 获取排名颜色
  const getRankingColor = (ranking) => {
    if (ranking === 1) {
      return "#FF4500"; // 1st place: deeper, more saturated with red
    } else if (ranking === 2) {
      return "#FFA500"; // 2nd place: orange
    } else if (ranking === 3) {
      return "#00FFFF"; // 3rd place: cyan/blue
    }
    return "#fff"; // others: white
  };

  const inCountTotal = Array.isArray(data) ? data?.reduce((acc, item) => acc + item.inCount, 0) : 0;
  const inNumTotal = Array.isArray(data) ? data?.reduce((acc, item) => acc + item.inNum, 0) : 0;

  return (
    <div className="group-statistics-panel" style={{ width: "100%", height: "100%", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", color: "#fff" }}>
      <div className="group-statistics-panel-header">
        <div className="group-statistics-panel-header-item">
          <img className="icon" src={TzRankOne} alt="TzRankOne" />
          <div className="total-value-container">
            <div className="total-value-unit">总服务人次</div>
            <div className="total-value">{inCountTotal}</div>
          </div>
        </div>
        {deduplication === 1 ? (
          <div className="group-statistics-panel-header-item">
            <img className="icon" src={TzRanKTwo} alt="TzRanKTwo" />
            <div className="total-value-container">
              <div className="total-value-unit"> 总服务人数</div>
              <div className="total-value">{inNumTotal}</div>
            </div>
          </div>
        ) : null}
      </div>
      {/* 表格部分 */}
      <div style={{ flex: 4.4, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", fontSize: "0.9rem" }}>
        {/* 表头 */}
        <div style={{ display: "flex", flexDirection: "row", flexShrink: 0 }}>
          <div style={{ flex: "0 0 2.2rem", textAlign: "left", padding: "0.08rem" }}>{Language.PAIMING}</div>
          <div style={{ flex: 2.8, textAlign: "center", padding: "0.08rem" }}>服务中心</div>
          <div style={{ flex: 1, textAlign: "center", padding: "0.08rem" }}>服务人次</div>
          {deduplication === 1 ? <div style={{ flex: 1, textAlign: "center", padding: "0.08rem" }}>服务人数</div> : null}
        </div>
        {/* 数据行 */}
        <div style={{ flex: 1, minHeight: 0, height: `calc(${rowHeight} * 8)` }}>
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
            className="outlet-flow-swiper">
            {extendedData.map((item, index) => {
              // 排名：数据已经排好序，直接使用索引 + 1（extendedData 前 data.length 项就是原始数据）
              const ranking = item ? index + 1 : null;

              return (
                <SwiperSlide key={item ? (item.key !== undefined ? item.key : index) : `empty-${index}`} style={{ height: rowHeight }}>
                  {item ? (
                    <div style={{ display: "flex", flexDirection: "row", lineHeight: "1.1", height: "100%" }}>
                      {/* 排名 */}
                      <div
                        style={{
                          flex: "0 0 2rem",
                          textAlign: "left",
                          padding: "0.08rem",
                          lineHeight: "1.05",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem",
                          color: getRankingColor(ranking),
                        }}>
                        {String(ranking).padStart(2, "0")}
                      </div>
                      {/* 场地名称 */}
                      <div
                        style={{
                          flex: 2.8,
                          padding: "0.08rem",
                          lineHeight: "1.05",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.9rem",
                          wordBreak: "break-all",
                          textAlign: "center",
                        }}>
                        {item.siteName || "-"}
                      </div>
                      {/* 进场人次 */}
                      <div style={{ flex: 1, textAlign: "center", padding: "0.08rem", lineHeight: "1.05", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {CommonUtils.formatNumberToUnit(item.inCount || item.count || 0).fullText}
                      </div>
                      {/* 进场人数 */}
                      {deduplication === 1 ? (
                        <div style={{ flex: 1, textAlign: "center", padding: "0.08rem", lineHeight: "1.05", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {CommonUtils.formatNumberToUnit(item.inNum || item.num || 0).fullText}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <></>
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
});
