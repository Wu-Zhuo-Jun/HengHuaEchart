import React, { use, useEffect, useMemo, useState } from "react";
import "../index.less";
import { UIPanel, UISelect } from "@/components/ui/UIComponent";
import { Radio, Switch } from "antd";
import triangle from "@/assets/newComponent/triangle.png";

import { NewFlowSelect } from "@/components/ui/UIComponent";
import { OutletAnalyseFlowLTrendChart, OutletComparisonCustomerAttrChart, OutletComparisonCustomerMoodRadarChart, CustomerAnalyseTimeHeatMapChart } from "@/components/common/charts/Chart";
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
  { value: "inCount", label: "进场人次" },
  { value: "inNum", label: "进场人数" },
  // { value: "outCount", label: "出场人次" },
  { value: "batchCount", label: "客流批次" },
];

const orderMap = [
  { value: "upOrder", label: " 由高到低" },
  { value: "downOrder", label: "由低到高" },
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

// 客流趋势Chart
export const CustomerFlowOutletTrendChart = React.memo((props) => {
  const { data, onTimeGranuleChange, timeGranule, limit } = props;
  const [showLineChart, setShowLineChart] = useState(false); // 是否显示折线图

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
    <>
      <UIPanel
        title="客流趋势"
        extra={
          <>
            <div style={{ display: "flex", alignItems: "center", columnGap: "30px", color: "#000000", fontSize: "14px" }}>
              <div>
                <span className="CustomerFloorTrendChart_text">分时占比：</span>
                <Switch checked={showLineChart} onChange={(value) => setShowLineChart(value)} />
              </div>
              <NewFlowSelect value={timeGranule} options={_timeSelectMap} onChange={onTimeGranuleChange} />
            </div>
          </>
        }
        tooltip="分析在统计时间内的出入口客流数据的变化走势。通过与历史数据进行对比，了解客流量波动趋势，优化运营，提升服务效率。注：当查询的时间范围是非完整周期时，仅查询该非完整周期时间范围内的数据。"
        tooltipSize="biggest">
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}>
          <div style={{ flex: 6 }}>{data && <OutletAnalyseFlowLTrendChart data={{ ...data, showLineChart }} />}</div>
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

// 百分比和数值切换
const PercentRadioGroup = ({ onChange }) => {
  const options = [
    { label: "客流值", value: "1" },
    { label: "分时占比", value: "2" },
  ];
  return <Radio.Group className="time-radio-group" block options={options} defaultValue="1" optionType="button" buttonStyle="solid" onChange={onChange} />;
};

// 客流时间热力图
export const CustomerFlowTimeHeatMapChart = React.memo((props) => {
  const { baseData, limit, timeRange, outletList, doorIds } = props;
  const [order, setOrder] = useState("upOrder"); // 排序方式 upOrder downOrder
  const [percent, setPercent] = useState("1"); // 1为数值 2为百分比
  const [customerFlowTimeHeatMap, setCustomerFlowTimeHeatMap] = useState("inCount"); // inCount inNum outCount batchCount
  const [timeGranule, setTimeGranule] = useState("hour");

  // 时间粒度选项映射
  const _timeSelectMap = useMemo(() => {
    if (limit === "hour") {
      if (timeGranule === "hour") {
        setTimeGranule("day");
      }
      return timeSelectMap.filter((item) => {
        return item.value !== "hour";
      });
    }
    if (limit === "day") {
      if (timeGranule === "day" || timeGranule === "hour") {
        setTimeGranule("week");
      }
      return timeSelectMap.filter((item) => {
        return item.value !== "hour" && item.value !== "day";
      });
    }
    if (limit === "week") {
      if (timeGranule === "week" || timeGranule === "day" || timeGranule === "hour") {
        setTimeGranule("month");
      }
      return timeSelectMap.filter((item) => {
        return item.value !== "hour" && item.value !== "day" && item.value !== "week";
      });
    }
    return timeSelectMap;
  }, [limit]);

  // 处理数据
  const handleData = useMemo(() => {
    // 数据验证
    if (!Array.isArray(baseData) || !Array.isArray(doorIds) || !Array.isArray(outletList)) {
      console.error("Invalid input data: baseData, doorIds, or outletList is not an array");
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }

    if (doorIds.length === 0) {
      console.warn("No doorIds provided");
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }

    let yAxis = [];
    // [出入口,日期,值];

    try {
      const { xAxis, xAxisTime, xAxisTooltips } = CommonUtils.generateXAxisFromTimeRangeForHeatMap(timeRange, timeGranule);

      let doorMap = {};
      doorIds?.forEach((item) => {
        doorMap[item] = { label: outletList.find((outlet) => outlet.value === item)?.label, key: item, total: 0, arr: [] };
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
        baseData.forEach((item) => {
          if (item.dataTime >= currentTimeSlot.startTime && item.dataTime < currentTimeSlot.endTime) {
            // 验证 doorId 是否存在，防止数组越界访问
            if (!arrItemSet[item.doorId] || !doorMap[item.doorId]) {
              console.warn(`Invalid doorId: ${item.doorId}, skipping this item`);
              return;
            }

            // 验证并转换数值字段，防止 NaN 或 undefined 值
            const inCount = Number(item.inCount) || 0;
            const inNum = Number(item.inNum) || 0;
            const batchCount = Number(item.batchCount) || 0;
            const outCount = Number(item.outCount) || 0;

            // 安全地更新 arrItemSet
            if (customerFlowTimeHeatMap === "inCount") {
              arrItemSet[item.doorId][1] += inCount;
            } else if (customerFlowTimeHeatMap === "inNum") {
              arrItemSet[item.doorId][1] += inNum;
            } else if (customerFlowTimeHeatMap === "batchCount") {
              arrItemSet[item.doorId][1] += batchCount;
            } else {
              arrItemSet[item.doorId][1] += outCount;
            }

            if (customerFlowTimeHeatMap === "inCount") {
              doorMap[item.doorId].total += inCount;
            } else if (customerFlowTimeHeatMap === "inNum") {
              doorMap[item.doorId].total += inNum;
            } else if (customerFlowTimeHeatMap === "batchCount") {
              doorMap[item.doorId].total += batchCount;
            } else {
              doorMap[item.doorId].total += outCount;
            }
          }
        });

        Object.keys(arrItemSet).forEach((item) => {
          doorMap[item].arr.push(arrItemSet[item]);
        });
      }

      // 根据order方式对doorMap进行排序
      const sortedDoorKeys = Object.keys(doorMap).sort((a, b) => {
        if (order === "upOrder") {
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

        // 根据percent决定是使用数值还是百分比
        const seriesData = doorMap[key].arr.map((item) => {
          const [timeIndex, value] = item;
          // 如果是百分比模式（值为"2"），计算占该出入口总数的百分比
          const finalValue = percent === "2" && doorTotal > 0 ? StringUtils.toFixed((value / doorTotal) * 100, 1) : value;
          return [index, timeIndex, finalValue];
        });

        series.push(...seriesData);
      });

      xAxis.unshift("合计");
      return {
        xAxis,
        yAxis,
        series,
        xAxisTooltips,
        isPercent: percent === "2", // 标识是否为百分比模式
      };
    } catch (error) {
      console.error("Error processing data:", error);
      return { xAxis: [], yAxis: [], series: [], xAxisTooltips: [], isPercent: false };
    }
  }, [baseData, customerFlowTimeHeatMap, percent, order, timeGranule]);

  return (
    <>
      <UIPanel
        title="客流时间热力图"
        bodyStyle={{ paddingTop: "0px" }}
        extra={
          <div style={{ display: "flex", alignItems: "center", columnGap: "30px" }}>
            <NewFlowSelect
              value={timeGranule}
              options={_timeSelectMap}
              onChange={(v) => {
                setTimeGranule(v);
              }}
            />
            {/* <PercentRadioGroup value={percent} onChange={(e) => setPercent(e.target.value)}></PercentRadioGroup> */}
            <NewFlowSelect value={customerFlowTimeHeatMap} options={CustomerFlowTypeMap} onChange={setCustomerFlowTimeHeatMap} />
            <NewFlowSelect
              value={order}
              options={orderMap}
              onChange={(v) => {
                setOrder(v);
              }}
            />
          </div>
        }
        tooltip="采用矩阵式热力看板，直观展示出入口在不同时段的客流密度分布。将抽象的时间转化为可视化的密度分布。通过精准锚定各时段的客流压强，管理者可以科学界定运营的“黄金时段”与“压力区间”，为各出入口引流活动的错峰排期提供高精度的数据依据，实现运营资源的按需分配。"
        tooltipSize="biggest">
        <div className="CustomerFlowTimeHeatMapChart" style={{ height: doorIds?.length > 8 ? doorIds?.length * 20 + 160 : "300px" }}>
          {handleData && <CustomerAnalyseTimeHeatMapChart data={handleData} />}
        </div>
      </UIPanel>
    </>
  );
});
