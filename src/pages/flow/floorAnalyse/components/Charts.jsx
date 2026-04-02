import React, { use, useEffect, useMemo, useState } from "react";
import "../index.less";
import { UIPanel, UISelect } from "@/components/ui/UIComponent";
import { Switch } from "antd";
import Constant from "@/common/Constant";
import insideTotal from "@/assets/newComponent/insideTotal.png"; // 人次
import insideCount from "@/assets/newComponent/insideCount.png";

import { NewFlowSelect } from "@/components/ui/UIComponent";
import { FloorAnalyseTrendChart, OutletComparisonCustomerAttrChart, OutletComparisonCustomerMoodRadarChart, CustomerAnalyseTimeHeatMapChart } from "@/components/common/charts/Chart";
import { CustomerAttrInfo } from "@/components/common/Attachment";
import { Language, text } from "@/language/LocaleContext";
import StringUtils from "@/utils/StringUtils";
import ArrayUtils from "@/utils/ArrayUtils";
import CommonUtils from "@/utils/CommonUtils";

// 时间粒度选项映射
const timeSelectMap = [
  // { value: "mintue", label: "按5分钟" },
  // { value: "halfHour", label: "按半小时" },
  { value: "hour", label: "按小时" },
  { value: "day", label: "按天" },
  { value: "week", label: "按周" },
  { value: "month", label: "按月" },
];

const CustomerFlowTypeMap = [
  { value: "inCount", label: Language.JINCHANGRENCI },
  { value: "inNum", label: Language.JINCHANGRENSHU },
  // { value: "outCount", label: "出场人次" },
  { value: "batchCount", label: Language.KELIUPICI },
];

export const faceEnum = {
  1: "愤怒",
  2: "悲伤",
  3: "厌恶",
  4: "害怕",
  5: "惊讶",
  6: "平静",
  7: "高兴",
  8: "困惑",
  9: "未知",
};

// 楼层趋势Chart
export const CustomerFloorTrendChart = React.memo((props) => {
  const { data, onTimeGranuleChange, customerFlowType, onChangeCustomerFlowType, timeGranule, limit } = props;
  const [showLineChart, setShowLineChart] = useState(false); // 是否显示折线图
  const { floorIntervalTotal, xAxisTooltips, xAxis, peakFloor, PeakFloorName, PeakFloorValue, PeakFloorTime, PeakFloorAvg, PeakFloorMedian } = data || {};

  const _timeSelectMap = useMemo(() => {
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

  return (
    <UIPanel
      title="楼层趋势"
      extra={
        <>
          <div style={{ display: "flex", alignItems: "center", columnGap: "30px", color: "#000000", fontSize: "14px" }}>
            <div>
              <span>抵达率：</span>
              <Switch checked={showLineChart} onChange={(value) => setShowLineChart(value)} />
            </div>
            <NewFlowSelect value={timeGranule} options={_timeSelectMap} onChange={onTimeGranuleChange} />
            <NewFlowSelect value={customerFlowType} options={CustomerFlowTypeMap} onChange={onChangeCustomerFlowType} />
          </div>
        </>
      }
      tooltip="追踪并展示楼层客流量随时间变化的波动情况，支持多楼层间的流量变化同步对标。通过监测各楼层客流波峰波谷的同步性或滞后性，管理者可以判断场内动线的“引流时效”，为各楼层实施精准的错峰引流、及判定特定楼层经营活跃度提供了动态的数据基准。"
      tooltipSize="biggest">
      <div className="CustomerFloorTrendChart">
        <div style={{ marginBottom: "10px" }}>人气楼层：{PeakFloorName}</div>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            gap: "10px",
          }}>
          <div
            style={{
              width: "240px",
              display: "flex",
              flexDirection: "column",
            }}>
            <CustomerFloorTrendChartInfo data={{ ...data, customerFlowType }} />
          </div>
          <div style={{ flex: 3 }}>{data && <FloorAnalyseTrendChart data={{ ...data, type: customerFlowType, showLineChart }} />}</div>
        </div>
      </div>
    </UIPanel>
  );
});

export const CustomerFloorTrendChartInfo = React.memo(({ data }) => {
  const { PeakFloorName, PeakFloorValue, PeakFloorTime, PeakFloorAvg, PeakFloorMedian, customerFlowType } = data || {};
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        width: "100%",
        rowGap: "10px",
      }}>
      <div style={{ display: "flex", flexDirection: "column", rowGap: "11px" }}>
        <div className="flow-trend-analysis-info-value-content flow-trend-analysis-info-peak-img">
          <div>人气楼层-{Language.FENGZHI}</div>
          <div>
            {PeakFloorValue}
            {customerFlowType === Constant.FLOW_TYPE.IN_COUNT ? "人次" : customerFlowType === Constant.FLOW_TYPE.IN_NUM ? "人数" : ""}
          </div>
          <div>
            {Language.FENGZHISHIJIAN}: {PeakFloorTime}
          </div>
        </div>
        <div className="flow-trend-analysis-info-value-content flow-trend-analysis-info-avg-img">
          <div>人气楼层-{Language.KELIUPINGJUNZHI}</div>
          <div>
            {PeakFloorAvg}
            {customerFlowType === Constant.FLOW_TYPE.IN_COUNT ? "人次" : customerFlowType === Constant.FLOW_TYPE.IN_NUM ? "人数" : ""}
          </div>
          <div>
            {Language.KELIUZHONGWEISHU}: {PeakFloorMedian}
            {customerFlowType === Constant.FLOW_TYPE.IN_COUNT ? "人次" : customerFlowType === Constant.FLOW_TYPE.IN_NUM ? "人数" : ""}
          </div>
        </div>
      </div>
    </div>
  );
});

// 客户属性项组件
const CustomerAttrItem = React.memo(({ title, data, timeRange }) => {
  const { maleData = [], femaleData = [] } = data || {};
  const yAxis = [Language.YINGER, Language.ERTONG, Language.QINGNIAN, Language.ZHUANGNIAN, Language.ZHONGLAONIAN, Language.WEIZHI];

  const rate = useMemo(() => {
    // 验证数据有效性
    if (!data || !Array.isArray(data.maleData) || !Array.isArray(data.femaleData)) {
      return {
        maleRate: 0,
        femaleRate: 0,
        maleMaxDesc: "",
        femaleMaxDesc: "",
        maleTotal: 0,
        femaleTotal: 0,
        maleRateDetail: 0,
        femaleRateDetail: 0,
      };
    }

    const maleTotal = data.maleData.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    const femaleTotal = data.femaleData.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
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
      <div
        style={{
          width: "100%",
          height: "100%",
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
          />
        </div>
        <div style={{ flex: 2, minHeight: "200px" }}>{data && <OutletComparisonCustomerAttrChart data={{ yAxis, seriesData }} />}</div>
      </div>
    </div>
  );
});

// 客户属性对比Chart
export const CustomerAttrChart = React.memo((props) => {
  const { data } = props;

  return (
    <>
      <UIPanel
        title="客群属性"
        bodyStyle={{ paddingTop: "0px" }}
        tooltip={
          <>
            通过识别统计时间内核心客群的年龄层级与性别特征，构建清晰的客群画像，辅助管理者验证目标市场定位是否准确，制定精准的营销推广策略，并据此优化服务设施（如增设亲子区或休息区），调整业态布局，制定针对性营销活动，挖掘潜在消费需求的关键依据，有助于提升客流转化率，实现精细化运营。
            <br />
            性别属性：男、女
            <br />
            年龄属性：婴儿、儿童、青年、壮年、中老年
          </>
        }
        tooltipSize="biggest">
        <div className="CustomerAttrChart">
          <CustomerAttrItem data={data} />
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

// 客户心情对比Chart
export const CustomerMoodChart = React.memo((props) => {
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
    <>
      <UIPanel
        title="心情洞察"
        bodyStyle={{ paddingTop: "0px" }}
        tooltip={
          <>
            识别统计时间内访客在游逛过程中的情感表达（如高兴、平静、困惑等），以此衡量场地的服务满意度与环境舒适度，辅助管理者评估场地美陈布置、互动装置或营销活动的吸引力，验证空间场景能否激发访客的情绪共鸣。
            <br />
            心情属性：愤怒、悲伤、厌恶、害怕、惊讶、平静、高兴、困惑
          </>
        }
        tooltipSize="biggest">
        <div className="CustomerMoodChart">
          <div className="CustomerMoodChart-item">
            <div className="CustomerMoodChart-item-content">
              <div style={{ flex: 2 }}>
                {data && (
                  <OutletComparisonCustomerMoodRadarChart
                    data={{
                      ...data,
                      globalMax,
                      maleTotal,
                      femaleTotal,
                      unknowTotal,
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1 }}>
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
        </div>
      </UIPanel>
    </>
  );
});

// // 百分比和数值切换
// const PercentRadioGroup = ({ onChange }) => {
//   const options = [
//     { label: "客流值", value: "1" },
//     { label: "分时占比", value: "2" },
//   ];
//   return <Radio.Group className="time-radio-group" block options={options} defaultValue="1" optionType="button" buttonStyle="solid" onChange={onChange} />;
// };
