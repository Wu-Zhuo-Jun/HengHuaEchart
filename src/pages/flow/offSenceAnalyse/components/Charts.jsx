import React, { use, useEffect, useMemo, useState } from "react";
import "../index.less";
import { UIPanel } from "@/components/ui/UIComponent";
import { Switch, Select, message } from "antd";
import { OffSenceAnalyseFlowTrendChart, CustomerAnalyseTimeHeatMapChart } from "@/components/common/charts/Chart";
import { Empty } from "antd";
import { NewFlowSelect } from "@/components/ui/UIComponent";
import { Language } from "@/language/LocaleContext";

// 时间粒度选项映射
const timeSelectMap = [
  // { value: "mintue", label: "按5分钟" },
  // { value: "halfHour", label: "按半小时" },
  { value: "hour", label: "按小时" },
  { value: "day", label: "按天" },
  { value: "week", label: "按周" },
  { value: "month", label: "按月" },
];

export const DoorTypeMap = [
  { value: "ALL", label: Language.GUODIANKELIU }, // 过店客流
  { value: "OS", label: Language.CHANGWAIKELIU }, // 场外客流
];

const orderMap = [
  { value: "upOrder", label: "由高到低" },
  { value: "downOrder", label: "由低到高" },
];

// 客流趋势Chart
export const OffSenceFlowTrendChart = React.memo((props) => {
  const { data, timeGranule, onTimeGranuleChange, limit, baseType } = props;
  const [showInStoreRate, setShowInStoreRate] = useState(false); // 是否显示进店率
  const [showInSiteRate, setShowInSiteRate] = useState(false); // 是否显示进场率
  const { storeOutNumArr, siteOutNumArr, inSiteNumArr, inSiteCountArr, storeEntryRateArr, siteEntryRateArr } = data?.chartData || {};

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
      title="客流趋势"
      tooltipSize="big"
      tooltip="通过分析统计时间内场地外部的“流量底色”与周期性规律，判别场内波动的外部归因。通过分析工作日与周末、早中晚市及季节性的客流曲线差异，辅助管理者精准区分是“自身运营带动”还是“外部大盘增长”，从而为前瞻性的资源预调、营销排期及店铺选址扩张提供科学的决策底数。"
      extra={
        <>
          <div style={{ display: "flex", alignItems: "center", columnGap: "30px", color: "#000000", fontSize: "14px" }}>
            {baseType === "ALL" && (
              <div>
                <span>进店率：</span>
                <Switch checked={showInStoreRate} onChange={(value) => setShowInStoreRate(value)} />
              </div>
            )}
            {baseType === "OS" && (
              <div>
                <span>进场率：</span>
                <Switch checked={showInSiteRate} onChange={(value) => setShowInSiteRate(value)} />
              </div>
            )}
            <NewFlowSelect value={timeGranule} options={_timeSelectMap} onChange={onTimeGranuleChange} />
          </div>
        </>
      }>
      <div className="OffSenceFlowTrendChart">{data?.chartData && <OffSenceAnalyseFlowTrendChart data={{ ...data, showInStoreRate, showInSiteRate, baseType }} />}</div>
    </UIPanel>
  );
});

// 场外-出入口分析Chart（热力图形式）
export const OffSenceDoorAnalysisChartPanel = React.memo((props) => {
  const { data, timeGranule, onTimeGranuleChange, timeSelectMap, order, onOrderChange, selectedDoorIds } = props;

  return (
    <UIPanel
      title="出入口分析"
      tooltip="通过分析统计时间内场地外部的出入口客流量，量化不同点位的“流量权重”与拥堵风险，判断出入口布局的科学性。通过识别外部集散高峰，管理者可以精准定位关键动线，有效指导安保力量调配、外场广告位定价及疏导方案优化，确保在保障进场效率的同时，最大限度挖掘各出入口的商业曝光价值。"
      tooltipSize="big"
      bodyStyle={{ paddingTop: "0px" }}
      extra={
        <div style={{ display: "flex", alignItems: "center", columnGap: "30px" }}>
          <NewFlowSelect value={timeGranule} options={timeSelectMap} onChange={onTimeGranuleChange} />
          <NewFlowSelect value={order} options={orderMap} onChange={onOrderChange} />
        </div>
      }>
      <div className="CustomerFlowTimeHeatMapChart" style={{ height: selectedDoorIds?.length > 8 ? selectedDoorIds?.length * 20 + 160 : "300px" }}>
        {data && data.xAxis.length > 0 && <CustomerAnalyseTimeHeatMapChart data={data} />}
        {(!data || data.xAxis.length === 0) && <Empty description="暂无数据" />}
      </div>
    </UIPanel>
  );
});
