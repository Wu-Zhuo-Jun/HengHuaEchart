import React, { use, useEffect, useMemo, useState } from "react";
import "../index.less";
import { UIPanel, UISelect } from "@/components/ui/UIComponent";
import insideTotal from "@/assets/newComponent/insideTotal.png"; // 人次
import insideCount from "@/assets/newComponent/insideCount.png";
import outTotal from "@/assets/newComponent/outTotal.png";
import customBatch from "@/assets/newComponent/customBatch.png";

import { NewFlowSelect } from "@/components/ui/UIComponent";
import { CustomerGroupAgeCompareBarChart, CustomerInsightGenderStatisticsChart, CustomerInsightAgeStatisticsChart } from "@/components/common/charts/Chart";
import { Language, text } from "@/language/LocaleContext";
import StringUtils from "@/utils/StringUtils";
import ArrayUtils from "@/utils/ArrayUtils";
import CommonUtils from "@/utils/CommonUtils";
import TimeUtils from "@/utils/TimeUtils";
import Constant from "@/common/Constant";
import { ageEnums } from "../../floorAnalyse/const";
import { useSite } from "@/context/SiteContext";

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

/** 顾客分群*/
export const CustomerGroupChart = React.memo((props) => {
  const { curBaseData, preBaseData, lastWeekBaseData, isSameDay, isCurrentDay, ageEnumsSelect, genderEnumsSelect } = props;

  // 计算图表数据
  const chartData = useMemo(() => {
    if (!curBaseData || !preBaseData) return null;
    return {
      curBaseData,
      preBaseData,
      lastWeekBaseData,
      isSameDay,
      isCurrentDay,
      ageEnums: ageEnumsSelect,
      genderEnums: genderEnumsSelect,
    };
  }, [curBaseData, preBaseData, lastWeekBaseData, isSameDay, isCurrentDay, ageEnumsSelect, genderEnumsSelect]);

  // 计算主力年龄段信息
  const chartInfoData = useMemo(() => {
    if (!curBaseData || !preBaseData) return null;
    // 判断是否显示男性和女性数据
    const showMale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[1];
    const showFemale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[2];

    // 计算当前期主力年龄段（只考虑选中的年龄段和性别）
    let curMaxAge = null;
    let curMaxValue = 0;
    Object.keys(ageEnumsSelect || ageEnums).forEach((ageKey) => {
      let total = 0;
      if (showMale) {
        total += curBaseData.male?.[ageKey] || curBaseData.male?.[Number(ageKey)] || 0;
      }
      if (showFemale) {
        total += curBaseData.female?.[ageKey] || curBaseData.female?.[Number(ageKey)] || 0;
      }
      if (total > curMaxValue) {
        curMaxValue = total;
        curMaxAge = ageKey;
      }
    });

    // 计算往期主力年龄段
    let preMaxAge = null;
    let preMaxValue = 0;
    Object.keys(ageEnumsSelect || ageEnums).forEach((ageKey) => {
      let total = 0;
      if (showMale) {
        total += preBaseData.male?.[ageKey] || preBaseData.male?.[Number(ageKey)] || 0;
      }
      if (showFemale) {
        total += preBaseData.female?.[ageKey] || preBaseData.female?.[Number(ageKey)] || 0;
      }
      if (total > preMaxValue) {
        preMaxValue = total;
        preMaxAge = ageKey;
      }
    });

    // 计算上周主力年龄段
    let lastWeekMaxAge = null;
    let lastWeekMaxValue = 0;
    Object.keys(ageEnumsSelect || ageEnums).forEach((ageKey) => {
      let total = 0;
      if (showMale) {
        total += lastWeekBaseData.male?.[ageKey] || lastWeekBaseData.male?.[Number(ageKey)] || 0;
      }
      if (showFemale) {
        total += lastWeekBaseData.female?.[ageKey] || lastWeekBaseData.female?.[Number(ageKey)] || 0;
      }
      if (total > lastWeekMaxValue) {
        lastWeekMaxValue = total;
        lastWeekMaxAge = ageKey;
      }
    });
    return {
      isSameDay,
      isCurrentDay,
      curMajorGroup: curMaxAge,
      preMajorGroup: preMaxAge,
      lastWeekMajorGroup: lastWeekMaxAge,
      curMajorGroupValue: curMaxValue,
      preMajorGroupValue: preMaxValue,
      lastWeekMajorGroupValue: lastWeekMaxValue,
    };
  }, [curBaseData, preBaseData, lastWeekBaseData, ageEnumsSelect, genderEnumsSelect]);

  return (
    <UIPanel
      title="顾客分群"
      extra={<></>}
      tooltip={
        <>
          通过分析统计时间内的客群数据，构建清晰的访客画像，验证实际到场客群与预期目标定位的匹配度。通过识别核心受众的特征分布，辅助管理层精准调整分众营销活动，从而实现资源的精准投放，提升运营转化率与客户忠诚度。
          <br />
          性别属性：男、女
          <br />
          年龄属性：婴儿、儿童、青年、壮年、中老年
        </>
      }
      tooltipSize="biggest">
      <div className="panel" style={{ width: "100%", height: "100%" }}>
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
            {chartInfoData && <CustomerGroupChartInfo data={chartInfoData} />}
          </div>
          <div style={{ flex: 1, height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            {chartData && (
              <div style={{ width: "100%", height: "100%", flex: 12 }}>
                <CustomerGroupAgeCompareBarChart data={chartData} />
              </div>
            )}
            <div style={{ flex: 1 }} className="CustomerGroupChart_bottom">
              <CustomerGroupChartLegend genderEnumsSelect={genderEnumsSelect} />
            </div>
          </div>
        </div>
      </div>
    </UIPanel>
  );
});

// 顾客分群图例组件
export const CustomerGroupChartLegend = React.memo(({ genderEnumsSelect }) => {
  // 判断是否显示男性和女性数据
  const showMale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[1];
  const showFemale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[2];

  const maleColor = "#3867D6"; // 蓝色
  const femaleColor = "#F9A231"; // 橙色

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        gap: "24px",
      }}>
      {showMale && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <div
            style={{
              width: "20px",
              height: "14px",
              backgroundColor: maleColor,
              borderRadius: "4px",
            }}
          />
          <span style={{ fontSize: "14px", color: "#101010" }}>{Language.NAN}</span>
        </div>
      )}
      {showFemale && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
          <div
            style={{
              width: "20px",
              height: "14px",
              backgroundColor: femaleColor,
              borderRadius: "4px",
            }}
          />
          <span style={{ fontSize: "14px", color: "#101010" }}>{Language.NV}</span>
        </div>
      )}
    </div>
  );
});

export const CustomerGroupChartInfo = React.memo(({ data }) => {
  const { isSameDay, isCurrentDay, curMajorGroup, preMajorGroup, curMajorGroupValue, preMajorGroupValue, lastWeekMajorGroup, lastWeekMajorGroupValue } = data || {};
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        justifyContent: isSameDay ? "space-between" : "start",
        gap: isSameDay ? "10px" : "20px",
      }}>
      <div className="common_item insideTotal big">
        <img src={insideTotal} alt="" />
        <div>
          {isCurrentDay ? "今日主力" : "本期主力"}-{ageEnums[curMajorGroup]?.title || "未知"}
        </div>
        <strong>
          {curMajorGroupValue.toLocaleString("en-US")}
          人次
        </strong>
      </div>
      <div className="common_item insideCount big">
        <img src={insideCount} alt="" />
        {isCurrentDay ? "昨日主力" : "上期主力"}-{ageEnums[preMajorGroup]?.title || "未知"}
        <strong>
          {preMajorGroupValue.toLocaleString("en-US")}
          人次
        </strong>
      </div>
      {isSameDay && (
        <div className="common_item outTotal big ">
          <img src={outTotal} alt="" />
          <div>
            {isCurrentDay ? "上周同天主力" : "上周同期主力"}-{ageEnums[lastWeekMajorGroup]?.title || "未知"}
          </div>
          <strong>{lastWeekMajorGroupValue.toLocaleString("en-US")} 人次</strong>
        </div>
      )}
    </div>
  );
});

/** 性别统计 */
export const GenderStatisticsChart = React.memo((props) => {
  const { businessHours } = useSite();
  const { genderStatisticsData, limit, onTimeGranuleChange, timeGranule, genderEnumsSelect, timeRangeReal } = props || {};
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

  // 计算统计信息数据
  const GenderChartData = useMemo(() => {
    if (!genderStatisticsData || !genderStatisticsData.maleData || !genderStatisticsData.femaleData) {
      return null;
    }
    console.log("genderStatisticsData", genderStatisticsData);
    // 判断是否需要清空Array尾部处理（主要处理平均数和中位数处理）
    const needToClearTailZero = CommonUtils.needToClearTailZero(timeRangeReal[1]);
    const isSameDay = timeRangeReal[0].isSame(timeRangeReal[1]);

    let { maleData, femaleData, xAxisTooltips } = genderStatisticsData;
    let maleAverage = 0;
    let maleMedian = 0;
    let femaleAverage = 0;
    let femaleMedian = 0;
    // 计算男性统计数据
    const malePeakValue = ArrayUtils.getMaxValue(maleData);
    const malePeakIndex = ArrayUtils.getMaxValueIndex(maleData);
    const malePeakTime = xAxisTooltips && xAxisTooltips[malePeakIndex] ? xAxisTooltips[malePeakIndex] : "";

    // 计算女性统计数据
    const femalePeakValue = ArrayUtils.getMaxValue(femaleData);
    const femalePeakIndex = ArrayUtils.getMaxValueIndex(femaleData);
    const femalePeakTime = xAxisTooltips && xAxisTooltips[femalePeakIndex] ? xAxisTooltips[femalePeakIndex] : "";

    // 计算中位数和平均数
    if (needToClearTailZero) {
      // 如果是单日的情况下有效数据采用营业时间段内数据
      if (isSameDay && timeGranule === "hour") {
        maleData = maleData.slice(businessHours[0], businessHours[1]);
        femaleData = femaleData.slice(businessHours[0], businessHours[1]);
      }
      maleAverage = maleData?.length > 0 ? ArrayUtils.getAverageValueClearTailZero(maleData, true) : 0;
      maleMedian = maleData?.length > 0 ? ArrayUtils.getMedianValueClearTailZero(maleData, true) : 0;
      femaleAverage = femaleData?.length > 0 ? ArrayUtils.getAverageValueClearTailZero(femaleData, true) : 0;
      femaleMedian = femaleData?.length > 0 ? ArrayUtils.getMedianValueClearTailZero(femaleData, true) : 0;
    } else {
      // 如果是单日的情况下且采用小时选择器有效数据采用营业时间段内数据
      if (isSameDay && timeGranule === "hour") {
        maleData = maleData.slice(businessHours[0], businessHours[1]);
        femaleData = femaleData.slice(businessHours[0], businessHours[1]);
      }
      maleAverage = maleData?.length > 0 ? ArrayUtils.getAverageValue(maleData, Constant.SORT.ASC, true) : 0;
      maleMedian = maleData?.length > 0 ? ArrayUtils.getMedianValue(maleData, Constant.SORT.ASC, true) : 0;
      femaleAverage = femaleData?.length > 0 ? ArrayUtils.getAverageValue(femaleData, Constant.SORT.ASC, true) : 0;
      femaleMedian = femaleData?.length > 0 ? ArrayUtils.getMedianValue(femaleData, Constant.SORT.ASC, true) : 0;
    }

    return {
      // 男性数据
      malePeakValue: StringUtils.toFixed(malePeakValue, 0),
      malePeakTime,
      maleAverage: StringUtils.toFixed(maleAverage, 0),
      maleMedian: StringUtils.toFixed(maleMedian, 0),
      // 女性数据
      femalePeakValue: StringUtils.toFixed(femalePeakValue, 0),
      femalePeakTime,
      femaleAverage: StringUtils.toFixed(femaleAverage, 0),
      femaleMedian: StringUtils.toFixed(femaleMedian, 0),
    };
  }, [genderStatisticsData, timeRangeReal]);

  // 计算图表配置数据
  const chartOptionData = useMemo(() => {
    if (!genderStatisticsData || !genderStatisticsData.maleData || !genderStatisticsData.femaleData) {
      return null;
    }

    return {
      xAxis: genderStatisticsData.xAxis,
      maleData: genderStatisticsData.maleData,
      femaleData: genderStatisticsData.femaleData,
      xAxisTooltips: genderStatisticsData.xAxisTooltips,
      genderEnumsSelect: genderEnumsSelect,
    };
  }, [genderStatisticsData, genderEnumsSelect]);

  return (
    <UIPanel
      title="性别统计"
      extra={
        <>
          <NewFlowSelect value={timeGranule} options={_timeSelectMap} onChange={onTimeGranuleChange} />
        </>
      }
      tooltip={
        <>
          <>
            通过分析统计时间内的访客性别，识别场地的性别属性，判断空间氛围与业态组合对不同性别客群的吸引力差异。通过掌握性别的分布规律，辅助管理者在运营策略上实现“按需定制”，从而消除服务盲区，提升特定性别客群的到场体验与最终转化效率。
            <br />
            性别属性：男、女
          </>
        </>
      }
      tooltipSize="biggest">
      <div className="panel" style={{ width: "100%", height: "100%" }}>
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
              justifyContent: "flex-start",
              gap: "10px",
            }}>
            <GenderStatisticsChartInfo data={GenderChartData} genderEnumsSelect={genderEnumsSelect} />
          </div>
          <div style={{ flex: 1, height: "100%" }}>
            {chartOptionData && <CustomerInsightGenderStatisticsChart data={{ ...chartOptionData, femaleAvg: GenderChartData.femaleAverage, maleAvg: GenderChartData.maleAverage }} />}
          </div>
        </div>
      </div>
    </UIPanel>
  );
});

// 性别统计info
export const GenderStatisticsChartInfo = React.memo(({ data, genderEnumsSelect }) => {
  const { malePeakValue, malePeakTime, maleAverage, maleMedian, femalePeakValue, femalePeakTime, femaleAverage, femaleMedian } = data || {};

  // 判断是否显示男性和女性数据
  const showMale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[1];
  const showFemale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[2];

  return (
    <>
      {showMale && (
        <div className="genderStatisticsChartInfo_item FirstItemImage">
          <div>{Language.NAN}-到访峰值</div>
          <div>{malePeakValue || 0} 人次</div>
          <div>
            {Language.FENGZHISHIJIAN}: {malePeakTime || ""}
          </div>
          <div>
            {Language.KELIUPINGJUNZHI}: {maleAverage || 0} 人次
          </div>
          <div>
            {Language.KELIUZHONGWEISHU}: {maleMedian || 0} 人次
          </div>
        </div>
      )}
      {showFemale && (
        <div className="genderStatisticsChartInfo_item SecondItemImage">
          <div>{Language.NV}-到访峰值</div>
          <div>{femalePeakValue || 0} 人次</div>
          <div>
            {Language.FENGZHISHIJIAN}: {femalePeakTime || ""}
          </div>
          <div>
            {Language.KELIUPINGJUNZHI}: {femaleAverage || 0} 人次
          </div>
          <div>
            {Language.KELIUZHONGWEISHU}: {femaleMedian || 0} 人次
          </div>
        </div>
      )}
    </>
  );
});

/**年龄统计chart */
export const AgeStatisticsChart = React.memo((props) => {
  const { businessHours } = useSite();
  const { ageStatisticsData, limit, onTimeGranuleChange, timeGranule, ageEnumsSelect, genderEnumsSelect, timeRangeReal } = props || {};
  const { xAxisTooltips } = ageStatisticsData;

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

  const convertToPureArray = (data) => {
    const showMale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[1];
    const showFemale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[2];
    const pureArray = [];
    for (let i = 0; i < data.length; i++) {
      let total = 0;
      if (showMale) {
        total += data[i].male || 0;
      }
      if (showFemale) {
        total += data[i].female || 0;
      }
      pureArray.push(total);
    }
    return pureArray;
  };

  const AgeChartData = useMemo(() => {
    if (!ageStatisticsData) {
      return null;
    }

    // 将对象数组（{male, female}）转换为纯数组（对应位置相加）

    // 年龄段数组映射
    const ageArrayMap = {
      1: convertToPureArray(ageStatisticsData.YINGERArr),
      2: convertToPureArray(ageStatisticsData.ERTONGArr),
      4: convertToPureArray(ageStatisticsData.QINGNIANArr),
      5: convertToPureArray(ageStatisticsData.ZHUANGNIANArr),
      6: convertToPureArray(ageStatisticsData.ZHONGLAONIANArr),
      7: convertToPureArray(ageStatisticsData.WEIZHIArr),
    };

    // 判断是否显示所有年龄段（如果没有筛选条件或筛选条件为空，则显示所有）
    const showAllAges = !ageEnumsSelect || Object.keys(ageEnumsSelect).length === 0;
    const selectedAgeKeys = showAllAges ? Object.keys(ageArrayMap) : Object.keys(ageEnumsSelect);

    // 计算每个年龄段的总数
    const ageTotals = {};
    selectedAgeKeys.forEach((ageKey) => {
      const ageArray = ageArrayMap[ageKey] || [];
      ageTotals[ageKey] = ArrayUtils.getSumValue(ageArray);
    });

    // 找出总数最多的年龄段
    let maxAgeKey = null;
    let maxTotal = 0;
    Object.keys(ageTotals).forEach((ageKey) => {
      if (ageTotals[ageKey] > maxTotal) {
        maxTotal = ageTotals[ageKey];
        maxAgeKey = ageKey;
      }
    });
    const needToClearTailZero = CommonUtils.needToClearTailZero(timeRangeReal[1]);
    const isSameDay = timeRangeReal[0].isSame(timeRangeReal[1]);

    // 获取最多群体的名称
    const maxAgeName = maxAgeKey ? ageEnums[maxAgeKey]?.title || "未知" : "未知";
    const maxPeakValue = ArrayUtils.getMaxValue(ageArrayMap[maxAgeKey]) || 0;
    const maxPeakIndex = ArrayUtils.getMaxValueIndex(ageArrayMap[maxAgeKey]) || 0;
    const maxPeakTime = xAxisTooltips && xAxisTooltips[maxPeakIndex] ? xAxisTooltips[maxPeakIndex] : "";
    // const maxAverage = ageArrayMap[maxAgeKey]?.length > 0 ? ArrayUtils.getAverageValueClearTailZero(ageArrayMap[maxAgeKey], true) : 0;
    // const maxMedian = ageArrayMap[maxAgeKey]?.length > 0 ? ArrayUtils.getMedianValueClearTailZero([...ageArrayMap[maxAgeKey]], true) : 0;
    let maxAverage = 0;
    let maxMedian = 0;
    if (needToClearTailZero) {
      if (isSameDay && timeGranule === "hour") {
        ageArrayMap[maxAgeKey] = ageArrayMap[maxAgeKey]?.slice(businessHours[0], businessHours[1]);
      }
      maxAverage = ageArrayMap[maxAgeKey]?.length > 0 ? ArrayUtils.getAverageValueClearTailZero(ageArrayMap[maxAgeKey], true) : 0;
      maxMedian = ageArrayMap[maxAgeKey]?.length > 0 ? ArrayUtils.getMedianValueClearTailZero([...ageArrayMap[maxAgeKey]], true) : 0;
    } else {
      if (isSameDay && timeGranule === "hour") {
        ageArrayMap[maxAgeKey] = ageArrayMap[maxAgeKey]?.slice(businessHours[0], businessHours[1]);
      }
      maxAverage = ageArrayMap[maxAgeKey]?.length > 0 ? ArrayUtils.getAverageValue(ageArrayMap[maxAgeKey], Constant.SORT.ASC, true) : 0;
      maxMedian = ageArrayMap[maxAgeKey]?.length > 0 ? ArrayUtils.getMedianValue(ageArrayMap[maxAgeKey], Constant.SORT.ASC, true) : 0;
    }

    return {
      maxAgeKey,
      maxTotal,
      maxAgeName,
      ageTotals,
      maxPeakValue,
      maxPeakTime,
      maxAverage,
      maxMedian,
    };
  }, [ageStatisticsData, ageEnumsSelect]);

  // 图表配置数据
  const chartOptionData = useMemo(() => {
    if (!ageStatisticsData) {
      return null;
    }
    return {
      xAxis: ageStatisticsData.xAxis,
      YINGERArr: convertToPureArray(ageStatisticsData.YINGERArr),
      ERTONGArr: convertToPureArray(ageStatisticsData.ERTONGArr),
      QINGNIANArr: convertToPureArray(ageStatisticsData.QINGNIANArr),
      ZHUANGNIANArr: convertToPureArray(ageStatisticsData.ZHUANGNIANArr),
      ZHONGLAONIANArr: convertToPureArray(ageStatisticsData.ZHONGLAONIANArr),
      WEIZHIArr: convertToPureArray(ageStatisticsData.WEIZHIArr),
      xAxisTooltips: ageStatisticsData.xAxisTooltips,
      ageEnumsSelect: ageEnumsSelect,
    };
  }, [ageStatisticsData, ageEnumsSelect]);

  return (
    <UIPanel
      title="年龄统计"
      extra={
        <>
          <NewFlowSelect value={timeGranule} options={_timeSelectMap} onChange={onTimeGranuleChange} />
        </>
      }
      tooltip={
        <>
          通过分析统计时间内的访客年龄，通过洞察不同年龄层的到访偏好，辅助管理者精准调整业态布局、优化服务配套（如母婴设施或无障碍通道）并策划跨代际的营销活动，从而挖掘潜在消费力，实现全龄段客流的价值最大化。
          <br />
          年龄属性：婴儿、儿童、青年、壮年、中老年
        </>
      }
      tooltipSize="biggest">
      <div className="panel" style={{ width: "100%", height: "100%" }}>
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
              justifyContent: "flex-start",
              gap: "10px",
            }}>
            <AgeStatisticsChartInfo data={AgeChartData} ageEnumsSelect={ageEnumsSelect} />
          </div>
          <div style={{ flex: 1, height: "100%" }}>{chartOptionData && <CustomerInsightAgeStatisticsChart data={chartOptionData} />}</div>
        </div>
      </div>
    </UIPanel>
  );
});

// 年龄统计info
export const AgeStatisticsChartInfo = React.memo(({ data }) => {
  const { maxAgeKey, maxTotal, maxAgeName, maxPeakValue, maxPeakTime, maxAverage, maxMedian } = data || {};

  return (
    <>
      <div style={{ flex: 1 }}>核心群体:{maxAgeName}</div>
      <div className="genderStatisticsChartInfo_item FirstItemImage" style={{ flex: 5 }}>
        <div>核心群体-到访峰值</div>
        <div>{maxPeakValue || 0} 人次</div>
        <div>
          {Language.FENGZHISHIJIAN}: {maxPeakTime || ""}
        </div>
      </div>
      <div className="genderStatisticsChartInfo_item SecondItemImage" style={{ flex: 5 }}>
        <div>核心群体-客流平均值</div>
        <div>{maxAverage || 0} 人次</div>
        <div>核心群体-客流中位数</div>
        <div>{maxMedian || 0} 人次</div>
      </div>
    </>
  );
});
