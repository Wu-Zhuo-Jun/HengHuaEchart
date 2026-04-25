import React, { use, useEffect, useMemo, useState } from "react";
import "../GroupAnalysis.less";
import { UIPanel } from "@/components/ui/UIComponent";
import { CustomerAnalyseTimeHeatMapChart } from "@/components/common/charts/Chart";
import { Empty } from "antd";
import { NewFlowSelect } from "@/components/ui/UIComponent";
import { Language } from "@/language/LocaleContext";

export const GroupAnalysisHeatMapChartPanel = React.memo((props) => {
  const { data, extra } = props;
  console.log("gd",data);
  return (
    <UIPanel
      title={Language.CHANGDIKELIURELI}
      tooltip="展示在统计时间内集团内所有场地每日各时段的客流分布情况。"
      tooltipSize="big"
      bodyStyle={{ paddingTop: "0px" }}
      extra={
        extra
      }
    >
      <div className="CustomerFlowTimeHeatMapChart" style={{ height: data?.yAxis.length > 8 ? data?.yAxis.length * 20 + 160 : "300px" }}>
        {data && data.xAxis.length > 0 && <CustomerAnalyseTimeHeatMapChart data={data} />}
        {(!data || data.xAxis.length === 0) && <Empty description={Language.ZANWUSHUJU} />}
      </div>
    </UIPanel>
  );
});
