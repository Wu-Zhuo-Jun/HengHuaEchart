import React from "react";
import { useState, useMemo, useEffect } from "react";
import { UIPanel, UISelect, UITooltipQuestion } from "@/components/ui/UIComponent";

import { Language, text } from "@/language/LocaleContext";
import storeOut from "@/assets/images/storeOut.png";
import Story_entry_rate from "@/assets/images/Story_entry_rate.png";

import entrySiteCount from "@/assets/images/entrySiteCount.png";
import outSiteFlow from "@/assets/images/outSiteFlow.png";
import entryHumanNum from "@/assets/images/entryHumanNum.png";
import storeEntryRateIcon from "@/assets/images/storeEntryRate.png";
import vup from "@/assets/images/vup.png";
import vdown from "@/assets/images/vdown.png";
import "../index.less";

/** 数据指标 */
const DataIndicator = React.memo((props) => {
  const { data, isCurrentDay, baseType } = props;
  const {
    storeOutNum,
    preStoreOutNum,
    storeOutNumPreRate,
    siteOutNum,
    preSiteOutNum,
    siteOutNumPreRate,
    inSiteCount,
    preInSiteCount,
    inSiteCountPreRate,
    inSiteNum,
    preInSiteNum,
    inSiteNumPreRate,
    storeEntryRate,
    preStoreEntryRate,
    storeEntryRatePreRate,
    siteEntryRate,
    preSiteEntryRate,
    siteEntryRatePreRate,
  } = data || {};

  const ratelabel = isCurrentDay ? "昨日" : "上期";

  return (
    <div className="DataIndicator">
      <UIPanel style={{ paddingRight: "20px" }} bodyStyle={{ paddingTop: "0px" }}>
        <div className="DataIndicator_content">
          <div className="item" style={{ backgroundColor: `#F1E9FA` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">{baseType === "ALL" ? storeOutNum?.toLocaleString("en-US") || 0 : siteOutNum?.toLocaleString("en-US") || 0}</div>
                <div>
                  {baseType === "ALL" ? Language.GUODIANKELIU : Language.CHANGWAIKELIU}
                  <UITooltipQuestion
                    title={
                      baseType === "ALL" ? (
                        <>
                          统计时间内，经过门店外部但没有进入门店的客流人次。
                          <br />
                          <span style={{ fontSize: "12px" }}>
                            注：核心价值在于衡量店铺吸引力与转化效率，判断产品、服务、促销活动的实际效果。长期跟踪能发现时段、季节、竞品活动等对客流的影响，辅助店铺扩张、调整运营策略（如优化门头、推出针对性引流活动）。
                          </span>
                        </>
                      ) : (
                        <>
                          统计时间内，经过场地外部及周边区域的客流人次。
                          <br />
                          <span style={{ fontSize: "12px" }}>
                            注：核心价值在于衡量店铺吸引力与转化效率，判断产品、服务、促销活动的实际效果。长期跟踪能发现时段、季节、竞品活动等对客流的影响，辅助店铺扩张、调整运营策略（如优化门头、推出针对性引流活动）。
                          </span>
                        </>
                      )
                    }
                    tooltipSize="big"></UITooltipQuestion>
                </div>
              </div>
              <div className="item_top_right" style={{ backgroundColor: `#5838D6` }}>
                <img src={baseType === "ALL" ? storeOut : outSiteFlow} alt="vup" />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">环比：{baseType === "ALL" ? preStoreOutNum?.toLocaleString("en-US") || 0 : preSiteOutNum?.toLocaleString("en-US") || 0}</div>
              <div className="item_bottom_right">
                <img src={baseType === "ALL" ? (storeOutNumPreRate > 0 ? vup : vdown) : siteOutNumPreRate > 0 ? vup : vdown} alt="vup" />
                {baseType === "ALL" ? storeOutNumPreRate || 0 : siteOutNumPreRate || 0}%
              </div>
            </div>
          </div>
          <div className="item" style={{ backgroundColor: `#CCD6FF40` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">{inSiteCount?.toLocaleString("en-US") || 0}</div>
                <div>
                  进场人次<UITooltipQuestion title="统计时间内，进入场地的客流人次(人次：同一个人在当日内进入N次算N人次)。"></UITooltipQuestion>
                </div>
              </div>
              <div className="item_top_right" style={{ backgroundColor: `#3867D6` }}>
                <img src={entrySiteCount} alt="vup" />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">环比：{preInSiteCount?.toLocaleString("en-US") || 0}</div>
              <div className="item_bottom_right">
                <img src={inSiteCountPreRate > 0 ? vup : vdown} alt="vup" />
                {inSiteCountPreRate || 0}%
              </div>
            </div>
          </div>
          <div className="item" style={{ backgroundColor: `#F3FCFF` }}>
            <div className="item_top">
              <div className="item_top_left">
                <div className="item_top_left_title">{inSiteNum?.toLocaleString("en-US") || 0}</div>
                <div>
                  进场人数<UITooltipQuestion title="统计时间内，进入场地的去重人数(人数：同一个人在去重时段内进入多次算1人数)。"></UITooltipQuestion>
                </div>
              </div>
              <div className="item_top_right" style={{ backgroundColor: "#1177C2" }}>
                <img src={entryHumanNum} alt="vup" />
              </div>
            </div>
            <div className="item_bottom">
              <div className="item_bottom_left">
                {ratelabel}：{preInSiteNum?.toLocaleString("en-US") || 0}
              </div>
              <div className="item_bottom_right">
                <img src={inSiteNumPreRate > 0 ? vup : vdown} alt="vup" />
                {inSiteNumPreRate || 0}%
              </div>
            </div>
          </div>

          {baseType === "ALL" && (
            <div className="item" style={{ backgroundColor: `#FFF5F1` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{storeEntryRate?.toLocaleString("en-US") || 0}%</div>
                  <div>
                    进店率
                    <UITooltipQuestion
                      title={
                        <>
                          <>统计时间内，门店外部客流转化为进店客流的比例。(计算逻辑：进店率=进场人次÷店外客流)</>
                          <br />
                          <span style={{ fontSize: "12px" }}>
                            注：进场率衡量了门面吸客力与漏斗转化效率，直观反映品牌号召力、橱窗陈列及门头活动的有效性。通过对比不同时段的进店率，能精准识别出到底是“路过的人少了”还是“门店不再吸引人”，是调整外场引流策略最直接的数据支撑。
                          </span>
                        </>
                      }
                      tooltipSize="big"
                      placement="leftBottom"
                    />
                  </div>
                </div>
                <div className="item_top_right " style={{ backgroundColor: "#DF7C22" }}>
                  <img src={storeEntryRateIcon || ""} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">环比：{preStoreEntryRate?.toLocaleString("en-US") || 0}%</div>
                <div className="item_bottom_right">
                  <img src={storeEntryRatePreRate > 0 ? vup : vdown} alt="vup" />
                  {storeEntryRatePreRate || 0}%
                </div>
              </div>
            </div>
          )}
          {baseType === "OS" && (
            <div className="item" style={{ backgroundColor: `#FFF5F1` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{siteEntryRate?.toLocaleString("en-US") || 0}%</div>
                  <div>
                    进场率
                    <UITooltipQuestion
                      title={
                        <>
                          <>统计时间内，场地外部客流转化为进场客流的比例。(计算逻辑：进场率=进场人次÷场外客流)</>
                          <br />
                          <span style={{ fontSize: "12px" }}>
                            注：进场率衡量了场地的导流效率与入口吸引力，判断外场营销、美陈装置及入口动线设计的实际效果。通过监测进场率的波动，可以识别外部环境（如天气、交通管制）与内部干预（如限流、主题活动）对流量转化的影响，辅助管理者优化场外引流策略、调整出入口设置或开展针对性的异业合作。
                          </span>
                        </>
                      }
                      tooltipSize="big"
                      placement="leftBottom"
                    />
                  </div>
                </div>
                <div className="item_top_right" style={{ backgroundColor: "#DF7C22" }}>
                  <img src={Story_entry_rate} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">
                  {ratelabel}：{preSiteEntryRate?.toLocaleString("en-US") || 0}%
                </div>
                <div className="item_bottom_right">
                  <img src={siteEntryRatePreRate > 0 ? vup : vdown} alt="vup" />
                  {siteEntryRatePreRate || 0}%
                </div>
              </div>
            </div>
          )}
        </div>
      </UIPanel>
    </div>
  );
});

export default DataIndicator;
