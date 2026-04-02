import React from "react";
import { UIPanel } from "../../ui/UIComponent";
import { FestivalTable, GroupSiteRankingTable } from "../tables/Table";
import styles from "./StatsPanel.module.css";
import { Language } from "../../../language/LocaleContext";

export const RealFlowPanel = React.memo(({ title, data }) => {
  return (
    <UIPanel title={title} bodyStyle={{ paddingTop: "0px" }}>
      <div className={styles.realFlow}>
        <div className={styles.realFlowValue}>{data}</div>
        <div className={styles.realFlowUnit}>{Language.RENSHU}</div>
      </div>
    </UIPanel>
  );
});

export const FestivalFlowPanel = ({ data }) => {
  return (
    <UIPanel
      title={Language.JIERIHUODONGKELIU}
      tooltipSize="big"
      // tooltipPlacement="leftBottom"
      tooltip="统计特定节日期间的客流总量，量化节日活动的“引流爆发力”与品牌溢价效果，评估活动投入产出比（ROI）。通过精准捕捉节日期间的客流波峰，管理者可以科学复盘活动主题、赠品策略或演出内容对流量的实际拉动作用，为未来的节庆排期、资源错峰配置提供量化依据，确保营销策略发挥最大长效价值。">
      <div style={{ maxWidth: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <FestivalTable style={{ Flex: 1 }} data={data} />
      </div>
    </UIPanel>
  );
};

export const GroupSiteRankingPanel = ({ data, ...props }) => {
  return (
    <div {...props}>
      <UIPanel title={Language.CHANGDIKELIUPAIHANG}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", columnGap: "14px", marginBottom: "20px" }}>
            <div style={{ fontSize: "14px", textAlign: "left", fontWeight: "600" }}>{Language.CHANGDIPAIHANGTOPSHI}</div>
            <div className="icon-swap"></div>
          </div>
          <GroupSiteRankingTable columns={data && data.columns} dataSource={data && data.dataSource} />
        </div>
      </UIPanel>
    </div>
  );
};
