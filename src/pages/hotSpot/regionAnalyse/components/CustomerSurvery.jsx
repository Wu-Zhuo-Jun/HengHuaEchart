import React from "react";
import { useState, useMemo, useEffect } from "react";
import { UIPanel, UITooltipQuestion } from "@/components/ui/UIComponent";

import { Language, text } from "@/language/LocaleContext";
import Story_entry_rate from "@/assets/images/Story_entry_rate.png";
import storeEntryRate from "@/assets/images/storeEntryRate.png";
import PeakTime from "@/assets/images/PeakTime.png";
import entrySiteCount from "@/assets/images/entrySiteCount.png";
import Visitor_flow from "@/assets/images/Visitor_flow.png";
import vup from "@/assets/images/vup.png";
import vdown from "@/assets/images/vdown.png";
import "../index.less";

/** 顾客洞悉 */
const CustomerSurvery = React.memo((props) => {
  const { data } = props;
  const { male = {}, female = {} } = data || {};
  const [singleData, setSingleData] = useState({});

  useEffect(() => {
    setSingleData(male);
  }, [male]);

  const ratelabel = "环比";

  return (
    <div className="CustomerSurvery">
      <UIPanel title={Language.GUKEDONGXI} style={{ paddingRight: "20px" }} bodyStyle={{ paddingTop: "0px" }}>
        <div className="CustomerSurvery_content">
          <div className="item" style={{ backgroundColor: `#CCD6FF40` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">1</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>区域人次</div>
                  <UITooltipQuestion title="统计时间内，进入区域的客流人次(人次：同一个人在当日内进入N次算N人次)。" fontSize="12px" />
                </div>
              </div>
              <div className="item_top_right" style={{ backgroundColor: "#3664D0" }}>
                <img src={Story_entry_rate} alt="vup" style={{ width: "44px", height: "44px" }} />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">
                {ratelabel}：{singleData.contributionDegree || 0}%
              </div>
              <div className="item_bottom_right">
                <img src={singleData?.VisitorFlowPreRate > 0 ? vup : vdown} alt="vup" />
                {singleData?.VisitorFlowPreRate || 0}%
              </div>
            </div>
          </div>
          <div className="item" style={{ backgroundColor: `#F3FCFF` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">{singleData?.VisitorFlow?.toLocaleString("en-US") || 0}</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>区域人数</div>
                  <UITooltipQuestion title={<>统计时间内，进入热区的去重人数(人数：同一个人在去重时段内进入多次算1人数)。</>} fontSize="12px" />
                </div>
              </div>
              <div className="item_top_right" style={{ backgroundColor: `#1177C2` }}>
                <img src={storeEntryRate} alt="vup" />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">
                {ratelabel}：{singleData?.VisitorFlowPre?.toLocaleString("en-US") || 0}
              </div>
              <div className="item_bottom_right">
                <img src={singleData?.VisitorFlowPreRate > 0 ? vup : vdown} alt="vup" />
                {singleData?.VisitorFlowPreRate || 0}%
              </div>
            </div>
          </div>
          <div className="item" style={{ backgroundColor: `#F1E9FA` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">{singleData?.MaxAgePeakValue?.toLocaleString("en-US") || 0}</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>区域批次</div>
                  <UITooltipQuestion title="统计时间内，进入区域的批次客流(批次：系统将间隔时间内的区域人次统计为一个批次，例如批次间隔为N秒，那么这N秒内进入的客流为1个批次。)" fontSize="12px" />
                </div>
              </div>
              <div className="item_top_right" style={{ backgroundColor: `#7900FF` }}>
                <img src={entrySiteCount} alt="vup" />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">
                {ratelabel}：{singleData?.MaxAgePeakValuepercent || 0}%
              </div>
              <div className="item_bottom_right">
                <img src={singleData?.VisitorFlowPreRate > 0 ? vup : vdown} alt="vup" />
                {singleData?.VisitorFlowPreRate || 0}%
              </div>
            </div>
          </div>
          <div className="item" style={{ backgroundColor: `#E0E9FF` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">{singleData?.PeakValueTime?.toLocaleString("en-US") || 0}</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>域外客流</div>
                  <UITooltipQuestion
                    title={
                      <>
                        <>反映统计时段内，热区对客流的有效吸引力，即产生实质性停留的客流占比。(计算逻辑：(停留时长符合条件的关注人次 ÷ 关注总人次) × 100%)</>
                        <br />
                        <span>
                          核心价值在于衡量区域的“截流能力”与转化效率，是计算到访率的基础指标。通过长期观察区域内外的流量分布，可以判断该区域的吸引力、导购引流的效果；辅助优化场内的动线设计，调整区域布局以提升空间运营坪效。
                        </span>
                      </>
                    }
                    fontSize="12px"
                  />
                </div>
              </div>
              <div className="item_top_right " style={{ backgroundColor: "#3664D0" }}>
                <img src={PeakTime || ""} alt="vup" />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">
                {ratelabel}：{singleData?.PeakValueTimepercent || 0}%
              </div>
              <div className="item_bottom_right">
                <img src={singleData?.VisitorFlowPreRate > 0 ? vup : vdown} alt="vup" />
                {singleData?.VisitorFlowPreRate || 0}%
              </div>
            </div>
          </div>
          <div className="item" style={{ backgroundColor: `#FFF5F1` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">{singleData?.EnterRate || 0}%</div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>到访率</div>
                  <UITooltipQuestion
                    title={
                      <>
                        <>统计时间内，区域外部客流转化为进入区域客流的比例。(计算逻辑：到访率=区域人次÷域外客流)</>
                        <br />
                        <span style={{ fontSize: "12px" }}>
                          注：到访率衡量了不同区域的引流效率与核心吸引力，是判断区域室内导视系统设计效果的关键指标。通过监测到访率，管理者可以识别场内的“冷区”与“热区”，评估主要区域对周边区域的带动效应，从而辅助优化室内导视动线或策划精准的跨区域交叉营销活动。
                        </span>
                      </>
                    }
                    tooltipSize="big"
                    fontSize="12px"
                    placement="leftBottom"
                  />
                </div>
              </div>
              <div className="item_top_right" style={{ backgroundColor: "#DF7C22" }}>
                <img src={Visitor_flow} alt="vup" />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">
                {ratelabel}：{singleData?.preEnterRate || 0}%
              </div>
              <div className="item_bottom_right">
                <img src={singleData?.EnterRatePre > 0 ? vup : vdown} alt="vup" />
                {singleData?.EnterRatePre || 0}%
              </div>
            </div>
          </div>
        </div>
      </UIPanel>
    </div>
  );
});

export default CustomerSurvery;
