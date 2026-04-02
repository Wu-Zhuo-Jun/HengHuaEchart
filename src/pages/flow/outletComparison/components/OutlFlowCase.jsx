import "../index.less";
import { Pagination } from "antd";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { UIPanel } from "@/components/ui/UIComponent";
import OutCardItem from "./OutCardItem";

const OutlFlowCase = React.memo((props) => {
  const { OutlFlowCaseDate, timeRangeA, timeRangeC, outlFlowCaseTotalA, outlFlowCaseTotalC, type = "outlet" } = props;
  const [pageA, setPageA] = useState(1);
  const [pageC, setPageC] = useState(1);
  const { resultA, resultC } = OutlFlowCaseDate;

  useEffect(() => {
    setPageA(1);
    setPageC(1);
  }, [OutlFlowCaseDate]);

  // 汇总总是第一位
  const currentShowCardA = useMemo(() => {
    return [outlFlowCaseTotalA, ...resultA.slice((pageA - 1) * 9, pageA * 9)];
  }, [pageA, outlFlowCaseTotalA, resultA]);

  const currentShowCardC = useMemo(() => {
    return [outlFlowCaseTotalC, ...resultC.slice((pageC - 1) * 9, pageC * 9)];
  }, [pageC, outlFlowCaseTotalC, resultC]);

  return (
    <UIPanel
      style={{ paddingRight: "20px" }}
      title={type === "outlet" ? "指定出入口VS对比出入口" : "指定时间VS对比时间"}
      tooltipSize="big"
      tooltip={
        <>
          {type === "outlet"
            ? "通过差异化对标识别各出入口的客流强弱项。帮助管理者判别特定出入口的客流异常是“全场共性”还是“单点特性”，从而科学界定不同方位的商业权重，为租金差异化定价、分众营销资源分配以及针对性的动线改造提供量化决策依据。"
            : "通过差异化对标识别不同时间的客流强弱项。排除空间差异带来的变量，纯粹量化时间维度下的运营成效。帮助管理者识别该出入口的“潜力上限”与“疲劳周期”，从而为单点位的精细化资源投入、季节性运营调整及维护排期提供数据支撑。"}
        </>
      }>
      <div className="outletFlowPanel">
        <div className="outletFlowCase">
          <div className="outletFlowCase-title">{type === "outlet" ? "指定出入口" : "指定时间"}</div>

          {timeRangeA && (
            <div className="outletFlowCase-timeRage">
              {timeRangeA[0]?.format("YYYY-MM-DD")}
              <span>至</span>
              {timeRangeA[1]?.format("YYYY-MM-DD")}
            </div>
          )}

          {resultA.length >= 10 && (
            <Pagination style={{ justifyContent: "center", paddingBottom: "13px" }} simple current={pageA} total={resultA.length} onChange={(page) => setPageA(page)} pageSize={9} />
          )}
          <div className="outletFlowCase-box">
            {currentShowCardA.map((item, index) => (
              <OutCardItem key={index} props={{ ...item, type: "appiont", index }} />
            ))}
          </div>
        </div>
        <div className="outletFlowCase" style={{ marginTop: "30px" }}>
          <div className="outletFlowCase-title">{type === "outlet" ? "对比出入口" : "对比时间"}</div>
          {timeRangeC && (
            <div className="outletFlowCase-timeRage">
              {timeRangeC[0]?.format("YYYY-MM-DD")}
              <span>至</span>
              {timeRangeC[1]?.format("YYYY-MM-DD")}
            </div>
          )}
          {resultC.length >= 10 && (
            <Pagination style={{ justifyContent: "center", paddingBottom: "13px" }} simple current={pageC} total={resultC.length} onChange={(page) => setPageC(page)} pageSize={9} />
          )}

          <div className="outletFlowCase-box">
            {currentShowCardC?.map((item, index) => (
              <OutCardItem key={index} props={{ ...item, type: "comparison", index }} />
            ))}
          </div>
        </div>
      </div>
    </UIPanel>
  );
});

export default OutlFlowCase;
