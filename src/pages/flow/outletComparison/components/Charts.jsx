import React, { use, useEffect, useMemo, useState } from "react";
import "../index.less";
import { UIPanel, UISelect } from "@/components/ui/UIComponent";
import triangle from "@/assets/newComponent/triangle.png";

import { NewFlowSelect } from "@/components/ui/UIComponent";
import {
  OutletComparisonFlowLComparisonChart,
  OutletComparisonCustomerAttrChart,
  OutletComparisonCustomerMoodRadarChart,
  OutletComparisonTimeFlowLComparisonChart,
} from "@/components/common/charts/Chart";
import { CustomerAttrInfo } from "@/components/common/Attachment";
import { Language, text } from "@/language/LocaleContext";
import { ageEnum2, faceEnum } from "../const";
import ArrayUtils from "@/utils/ArrayUtils";
import StringUtils from "@/utils/StringUtils";

// 时间粒度选项映射
const timeSelectMap = [
  // { value: "mintue", label: "按5分钟" },
  // { value: "halfHour", label: "按半小时" },
  { value: "hour", label: "按小时" },
  { value: "day", label: "按天" },
  // { value: "week", label: "按周" },
  // { value: "month", label: "按月" },
];

// 流量对比Chart
export const FlowComparisonChart = React.memo((props) => {
  const { data, flowLineChartType, onFlowLineChartTypeChange, onTimeGranuleChange, timeGranule, limit, type = "outlet", tab } = props;
  const [rightMove, setRightMove] = useState("100%");
  const [leftPx, setLeftPx] = useState("279px");

  // limit: mintue hour
  const _timeSelectMap = useMemo(() => {
    if (limit === "mintue") {
      return timeSelectMap.filter((item) => {
        return item.value !== "mintue";
      });
    }
    if (limit === "hour") {
      return timeSelectMap.filter((item) => {
        return item.value !== "mintue" && item.value !== "hour" && item.value !== "halfHour";
      });
    }
    return timeSelectMap;
  }, [limit]);

  useEffect(() => {
    const { appiontSum = 0, compareSum = 0 } = data || {};
    const p = compareSum / (appiontSum + compareSum) || 0.5;
    setRightMove(`${(1 - p) * 100}%`);
    setLeftPx(`${p * 300 - 21}px`);
  }, [data]);

  return (
    <>
      <UIPanel
        title="流量对比"
        extra={
          <>
            <NewFlowSelect value={timeGranule} style={{ marginRight: "30px" }} options={_timeSelectMap} onChange={onTimeGranuleChange} />
            <NewFlowSelect
              onChange={onFlowLineChartTypeChange}
              value={flowLineChartType}
              options={[
                { label: Language.JINCHANGRENCI, value: "1" },
                { label: Language.JINCHANGRENSHU, value: "2" },
                { label: Language.KELIUPICI, value: "3" },
              ]}
            />
          </>
        }
        tooltipSize="big"
        tooltip={
          <>
            {type === "outlet"
              ? "横向比对不同出入口在同一时段下的客流走势与变化幅度。判断不同方位对外部客流的截流效能。帮助管理者直观评估不同出入口对流量的贡献差异，从而科学分配各入口的安保资源、合理布局周边业态，并为不同出入口间的营销资源置换或导流补偿策略提供数据支撑。"
              : "纵向比对同一出入口在不同历史时段的客流走势及变化幅度，通过出入口历史数据的深度对比，指引优化或营销投放的实际转化效果，帮助管理者识别该位置的流量峰值变迁规律，为单点位的精细化策略运营提供科学的参照基准。"}
          </>
        }>
        <div
          style={{
            width: "100%",
            height: "360px",
            display: "flex",
            flexDirection: "column",
          }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              paddingLeft: "5px",
            }}>
            <div className="comparisonPart">
              <div className="comparisonPart-ratio">
                <div className="comparisonPart-trapezoid">
                  <div className="comparisonPart-trapezoid-fill" style={{ width: rightMove }}></div>
                </div>
                <img className="triangle" src={triangle} alt="triangle" style={{ right: leftPx }} />
                <div className="appiontSum">{data?.appiontSum || 0}人次</div>
                <div className="comparisonSum">{data?.compareSum || 0}人次</div>
              </div>
              <div className="comparisonPart-info">
                {type === "outlet" ? "指定出入口" : "指定时间"}
                <span>VS</span>
                {type === "outlet" ? "对比出入口" : "对比时间"}
              </div>
            </div>
          </div>
          {type === "outlet" ? (
            <div style={{ flex: 4, minHeight: "280px" }}>{data && <OutletComparisonFlowLComparisonChart data={data} />}</div>
          ) : (
            <div style={{ flex: 4, minHeight: "280px" }}>{data && <OutletComparisonTimeFlowLComparisonChart data={data} />}</div>
          )}
        </div>
      </UIPanel>
    </>
  );
});

// 客户属性项组件
const CustomerAttrItem = React.memo(({ title, data, timeRange }) => {
  const { maleData = [], femaleData = [] } = data || {};
  const yAxis = [Language.YINGER, Language.ERTONG, Language.QINGNIAN, Language.ZHUANGNIAN, Language.ZHONGLAONIAN, Language.WEIZHI];

  const rate = useMemo(() => {
    const maleTotal = data?.maleData?.reduce((acc, curr) => acc + curr, 0) || 0;
    const femaleTotal = data?.femaleData?.reduce((acc, curr) => acc + curr, 0) || 0;
    const total = maleTotal + femaleTotal;
    let maleRate = total > 0 ? Math.floor((maleTotal / total) * 100) : 0;
    let femaleRate = 100 - maleRate;
    let maleRateDetail = total > 0 ? StringUtils.toFixed((maleTotal / total) * 100, 2) : 0;
    let femaleRateDetail = total > 0 ? StringUtils.toFixed((femaleTotal / total) * 100, 2) : 0;

    let maleMaxRate = 0;
    let femaleMaxRate = 0;
    let maleMaxDesc = null;
    let femaleMaxDesc = null;
    let maleMax = maleData.length > 0 ? ArrayUtils.getMaxValue(maleData) : 0;
    let femaleMax = femaleData.length > 0 ? ArrayUtils.getMaxValue(femaleData) : 0;
    maleMaxRate = maleTotal > 0 ? (maleMax / maleTotal) * 100 : 0;
    femaleMaxRate = femaleTotal > 0 ? (femaleMax / femaleTotal) * 100 : 0;

    if (maleMaxRate % 1 !== 0) {
      maleMaxRate = Number(maleMaxRate.toFixed(2));
    }
    if (femaleMaxRate % 1 !== 0) {
      femaleMaxRate = Number(femaleMaxRate.toFixed(2));
    }
    if (maleTotal === 0 && femaleTotal === 0) {
      maleRate = 50;
      femaleRate = 50;
    }

    // 在字符串模板中直接在花括号外部插入空格即可
    // maleMaxDesc = maleMax ? `${yAxis[maleData.indexOf(maleMax)]}${ageEnum2[maleData.indexOf(maleMax)]}  ${Language.NAN}  ${Language.ZHANBI} ${maleMaxRate.toFixed(0)}%` : "";
    // femaleMaxDesc = femaleMax ? `${yAxis[femaleData.indexOf(femaleMax)]}${ageEnum2[femaleData.indexOf(femaleMax)]}  ${Language.NV}  ${Language.ZHANBI} ${femaleMaxRate.toFixed(0)}%` : "";
    maleMaxDesc = maleMax ? `${yAxis[maleData.indexOf(maleMax)]}  ${Language.NAN}  ${Language.ZHANBI} ${maleMaxRate.toFixed(0)}%` : "";
    femaleMaxDesc = femaleMax ? `${yAxis[femaleData.indexOf(femaleMax)]}  ${Language.NV}  ${Language.ZHANBI} ${femaleMaxRate.toFixed(0)}%` : "";

    return { maleRate, femaleRate, maleMaxDesc, femaleMaxDesc, maleTotal, femaleTotal, maleRateDetail, femaleRateDetail };
  }, [data]);

  const seriesData = [
    { name: Language.NAN, data: maleData },
    { name: Language.NV, data: femaleData },
  ];

  return (
    <div className="CustomerAttrChart-item">
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0px 3vw" }}>
          <div className="CustomerAttrChart-item-title">{title}</div>
          {timeRange && (
            <div className="CustomerAttrChart-item-timeRage">
              {timeRange[0]?.format("YYYY-MM-DD")}
              <span>至</span>
              {timeRange[1]?.format("YYYY-MM-DD")}
            </div>
          )}
          <CustomerAttrInfo
            data={{
              maleRate: rate?.maleRate || 0,
              femaleRate: rate?.femaleRate || 0,
              maleMaxDesc: rate.maleMaxDesc,
              femaleMaxDesc: rate.femaleMaxDesc,
              maleTotal: rate.maleTotal || 0,
              femaleTotal: rate.femaleTotal || 0,
              maleRateDetail: rate.maleRateDetail || 0,
              femaleRateDetail: rate.femaleRateDetail || 0,
            }}
            vertical={true}
          />
        </div>
        <div style={{ flex: 2 }}>{data && <OutletComparisonCustomerAttrChart data={{ yAxis, seriesData }} />}</div>
      </div>
    </div>
  );
});

// 客户属性对比Chart
export const CustomerAttrChart = React.memo((props) => {
  const { appiontData, compareData, timeRangeA, timeRangeC, type = "outlet" } = props;

  return (
    <>
      <UIPanel
        title="客群属性对比"
        tooltip={
          <>
            {type === "outlet"
              ? "通过洞察同一时间不同出入口客群画像的独特性，帮助管理者针对性地在特定出入口精准运营策略，从而实现空间效益与精准营销的深度融合。"
              : "通过洞察同一出入口不同时间的客群画像的独特性，帮助管理者针对性地在出入口不同时间精准运营策略，从而实现空间效益与精准营销的深度融合。"}
          </>
        }
        tooltipSize="big">
        <div className="CustomerAttrChart">
          <CustomerAttrItem title={type === "outlet" ? "指定出入口" : "指定时间"} data={appiontData} timeRange={timeRangeA} />
          <CustomerAttrItem title={type === "outlet" ? "对比出入口" : "对比时间"} data={compareData} timeRange={timeRangeC} />
        </div>
      </UIPanel>
    </>
  );
});

export const CustomerMoodVerivalInfo = ({ data }) => {
  const { maleMax, femaleMax, maleMaxRate, femaleMaxRate, maleMaxDesc, femaleMaxDesc } = data || {};
  return (
    <>
      <div className="customer-mood-info">
        <div>{Language.ZHUYAOXINQING}</div>
        <div>{data && data.maleMaxRate > 0 ? maleMaxDesc : Language.ZANWU}</div>
        <div>{data && data.femaleMaxRate > 0 ? femaleMaxDesc : Language.ZANWU}</div>
      </div>
    </>
  );
};

// 客户心情对比Charts
export const CustomerMoodChart = React.memo((props) => {
  const { data, type = "outlet" } = props;
  const { appiontData, compareData } = data;

  return (
    <UIPanel
      title="客群心情对比"
      tooltip={
        <>
          {type === "outlet"
            ? "通过洞察同一时间不同出入口的访客心情的独特性，帮助管理者精准发现引起负面情绪的“痛点位置”，从而针对性地优化运营策略，将出入口从单纯的流量通道转化为“情感升温区”，为后续的深度游逛建立积极的心理基础。"
            : "通过洞察同一出入口不同时间的访客心情的独特性，帮助管理者精准发现引起负面情绪的“痛点时间”，从而针对性地优化运营策略，将出入口从单纯的流量通道转化为“情感升温区”，为后续的深度游逛建立积极的心理基础。"}
        </>
      }
      tooltipSize="big">
      <div className="CustomerMoodChart">
        <CustomerMoodChartItem data={appiontData} title={type === "outlet" ? "指定出入口" : "指定时间"} />
        <CustomerMoodChartItem data={compareData} title={type === "outlet" ? "对比出入口" : "对比时间"} />
      </div>
    </UIPanel>
  );
});

export const CustomerMoodChartItem = React.memo((props) => {
  const { data, title } = props;
  const { maleData = [], femaleData = [], unknowData = [] } = data || {};

  // 计算全局数据（三个数组的总和）
  const globalData = [];
  const maleTotal = maleData && maleData?.reduce((acc, curr) => acc + curr, 0);
  const femaleTotal = femaleData && femaleData?.reduce((acc, curr) => acc + curr, 0);
  const unknowTotal = unknowData && unknowData?.reduce((acc, curr) => acc + curr, 0);

  // 计算每个心情维度的全局总和
  for (let i = 0; i < 9; i++) {
    const maleValue = maleData && maleData[i] ? maleData[i] : 0;
    const femaleValue = femaleData && femaleData[i] ? femaleData[i] : 0;
    const unknownValue = unknowData && unknowData[i] ? unknowData[i] : 0;
    const valueMax = Math.max(maleValue, femaleValue, unknownValue);
    globalData.push(valueMax);
  }
  // 计算全局最大值，用于设置雷达图的最大值
  const globalMax = Math.max(...globalData);

  let maleMax = maleData.length > 0 ? ArrayUtils.getMaxValue(maleData) : 0;
  let femaleMax = femaleData.length > 0 ? ArrayUtils.getMaxValue(femaleData) : 0;
  let maleMaxRate = maleTotal > 0 ? (maleMax / maleTotal) * 100 : 0;
  let femaleMaxRate = femaleTotal > 0 ? (femaleMax / femaleTotal) * 100 : 0;
  if (maleMaxRate % 1 !== 0) {
    maleMaxRate = Number(maleMaxRate.toFixed(0));
  }
  if (femaleMaxRate % 1 !== 0) {
    femaleMaxRate = Number(femaleMaxRate.toFixed(0));
  }

  // 在字符串模板中直接在花括号外部插入空格即可
  let maleMaxDesc = maleMax ? `${faceEnum[maleData.indexOf(maleMax) + 1]}  ${Language.NAN}  ${Language.ZHANBI} ${maleMaxRate}%` : "";
  let femaleMaxDesc = femaleMax ? `${faceEnum[femaleData.indexOf(femaleMax) + 1]}  ${Language.NV}  ${Language.ZHANBI} ${femaleMaxRate}%` : "";

  return (
    <div className="CustomerMoodChart-item">
      <div className="CustomerMoodChart-item-title">{title}</div>
      <div className="CustomerMoodChart-item-content">
        <div style={{ flex: 4 }}>{<OutletComparisonCustomerMoodRadarChart data={{ ...data, globalMax, maleTotal, femaleTotal, unknowTotal }} />}</div>
        <div style={{ position: "absolute", right: "1%", top: 20 }}>
          <CustomerMoodVerivalInfo
            data={{
              maleMax,
              femaleMax,
              maleMaxRate,
              femaleMaxRate,
              maleMaxDesc,
              femaleMaxDesc,
            }}></CustomerMoodVerivalInfo>
        </div>
      </div>
    </div>
  );
});
