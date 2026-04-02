import React from "react";
import { useState, useMemo, useEffect } from "react";
import { UIPanel, UITooltipQuestion } from "@/components/ui/UIComponent";

import { Language, text } from "@/language/LocaleContext";
import customer_female from "@/assets/images/customer_female.webp";
import customer_male from "@/assets/images/customer_male.webp";
import Story_entry_rate from "@/assets/images/Story_entry_rate.png";
import PeakTime from "@/assets/images/PeakTime.png";
import avgAge from "@/assets/images/avgAge.png";
import Visitor_flow from "@/assets/images/Visitor_flow.png";
import vup from "@/assets/images/vup.png";
import vdown from "@/assets/images/vdown.png";
import "../index.less";

/** 顾客洞悉 */
const CustomerSurvery = React.memo((props) => {
  const { data, genderEnumsSelect, isCurrentDay } = props;
  const { male = {}, female = {} } = data || {};
  const [showBoth, setShowBoth] = useState(true);
  const [singleData, setSingleData] = useState({});
  const [showMale, setShowMale] = useState(true);

  useEffect(() => {
    if (Object.keys(genderEnumsSelect).length == 2) {
      setShowBoth(true);
    } else {
      const showMale = !genderEnumsSelect || Object.keys(genderEnumsSelect).length === 0 || genderEnumsSelect[1];
      setSingleData(showMale ? male : female);
      setShowMale(showMale);
      setShowBoth(false);
    }
  }, [genderEnumsSelect, data]);

  const ratelabel = isCurrentDay ? "昨日" : "上期";

  return (
    <div className="CustomerSurvery">
      <UIPanel title={Language.GUKEDONGXI} style={{ paddingRight: "20px" }} bodyStyle={{ paddingTop: "0px" }}>
        {!showBoth && (
          <div className="CustomerSurvery_content">
            <div className="item" style={{ backgroundColor: `#CCD6FF40` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{showMale ? "男" : "女"}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>性别</div>
                    <UITooltipQuestion title="统计时间内，指定群体进入场地的客流人次比例。" fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right" s>
                  <img src={showMale ? customer_male : customer_female} alt="vup" style={{ width: "44px", height: "44px" }} />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">贡献度：{singleData.contributionDegree || 0}%</div>
                <div className="item_bottom_right"></div>
              </div>
            </div>
            <div className="item" style={{ backgroundColor: `#F3FCFF` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{singleData.VisitorFlow.toLocaleString("en-US") || 0}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>到访客流</div>
                    <UITooltipQuestion title={<>统计时间内，指定群体进入场地的客流人次。</>} fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right" style={{ backgroundColor: `#1177C2` }}>
                  <img src={Story_entry_rate} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">
                  {ratelabel}：{singleData.VisitorFlowPre.toLocaleString("en-US") || 0}
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
                  <div className="item_top_left_title">{singleData.MaxAgePeakValue.toLocaleString("en-US") || 0}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>核心群体：{singleData.MaxAgeName || ""}</div>
                    <UITooltipQuestion title="统计时间内，指定群体中哪个年龄段更喜欢进入场地。" fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right" style={{ backgroundColor: `#7900FF` }}>
                  <img src={avgAge} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">占比：{singleData.MaxAgePeakValuepercent || 0}%</div>
                <div className="item_bottom_right"></div>
              </div>
            </div>
            <div className="item" style={{ backgroundColor: `#E0E9FF` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{singleData.PeakValueTime.toLocaleString("en-US") || 0}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>时段偏好:{singleData.PeakTimeTime || ""}</div>
                    <UITooltipQuestion title="统计时间内，指定群体更喜欢在哪个时间段进入场地。" fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right " style={{ backgroundColor: "#3664D0" }}>
                  <img src={PeakTime || ""} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">占比：{singleData.PeakValueTimepercent || 0}%</div>
                <div className="item_bottom_right"></div>
              </div>
            </div>
            <div className="item" style={{ backgroundColor: `#FFF5F1` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{singleData.EnterRate || 0}%</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>进场率</div>
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
                  {ratelabel}：{singleData.preEnterRate || 0}%
                </div>
                <div className="item_bottom_right">
                  <img src={singleData?.EnterRatePre > 0 ? vup : vdown} alt="vup" />
                  {singleData?.EnterRatePre || 0}%
                </div>
              </div>
            </div>
          </div>
        )}
        {showBoth && (
          <div className="CustomerGroupChart_both">
            <div className="item grid-item large" style={{ backgroundColor: `#CCD6FF40` }}>
              <img src={customer_male} alt="vup" />
              <div className="item_bottom">贡献度：{male.contributionDegree || 0}%</div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#F3FCFF` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{male.VisitorFlow.toLocaleString("en-US") || 0}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>到访客流</div>
                    <UITooltipQuestion title={<>统计时间内，指定群体进入场地的客流人次。</>} fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right" style={{ backgroundColor: `#1177C2` }}>
                  <img src={Story_entry_rate} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">
                  {ratelabel}：{male.VisitorFlowPre.toLocaleString("en-US") || 0}
                </div>
                <div className="item_bottom_right">
                  <img src={male?.VisitorFlowPreRate > 0 ? vup : vdown} alt="vup" />
                  {male?.VisitorFlowPreRate || 0}%
                </div>
              </div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#F1E9FA` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{male.MaxAgePeakValue.toLocaleString("en-US") || 0}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>核心群体：{male.MaxAgeName || ""}</div>
                    <UITooltipQuestion title="统计时间内，指定群体中哪个年龄段更喜欢进入场地。" fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right" style={{ backgroundColor: `#7900FF` }}>
                  <img src={avgAge} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">占比：{male.MaxAgePeakValuepercent || 0}%</div>
                <div className="item_bottom_right"></div>
              </div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#E0E9FF` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{male.PeakValueTime.toLocaleString("en-US") || 0}</div>
                  <div>
                    <div>时段偏好:{male.PeakTimeTime || ""}</div>
                    <UITooltipQuestion title="统计时间内，指定群体更喜欢在哪个时间段进入场地。" fontSize="12px" marginLeft="0px" />
                  </div>
                </div>
                <div className="item_top_right " style={{ backgroundColor: "#3664D0" }}>
                  <img src={PeakTime || ""} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">占比：{male.PeakValueTimepercent || 0}%</div>
                <div className="item_bottom_right"></div>
              </div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#FFF5F1` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{male.EnterRate || 0}%</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>进场率</div>
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
                  {ratelabel}：{male.preEnterRate || 0}%
                </div>
                <div className="item_bottom_right">
                  <img src={male?.EnterRatePre > 0 ? vup : vdown} alt="vup" />
                  {male?.EnterRatePre || 0}%
                </div>
              </div>
            </div>
            <div className="item grid-item large" style={{ backgroundColor: `#CCD6FF40` }}>
              <img src={customer_female} alt="vup" />
              <div className="item_bottom">贡献度：{female.contributionDegree || 0}%</div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#F3FCFF` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{female.VisitorFlow.toLocaleString("en-US") || 0}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>到访客流</div>
                    <UITooltipQuestion title={<>统计时间内，指定群体进入场地的客流人次。</>} fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right" style={{ backgroundColor: `#1177C2` }}>
                  <img src={Story_entry_rate} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">
                  {ratelabel}：{female.VisitorFlowPre.toLocaleString("en-US") || 0}
                </div>
                <div className="item_bottom_right">
                  <img src={female?.VisitorFlowPreRate > 0 ? vup : vdown} alt="vup" />
                  {female?.VisitorFlowPreRate || 0}%
                </div>
              </div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#F1E9FA` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{female.MaxAgePeakValue.toLocaleString("en-US") || 0}</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>核心群体：{female.MaxAgeName || ""}</div>
                    <UITooltipQuestion title="统计时间内，指定群体中哪个年龄段更喜欢进入场地。" fontSize="12px" />
                  </div>
                </div>
                <div className="item_top_right" style={{ backgroundColor: `#7900FF` }}>
                  <img src={avgAge} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">占比：{female.MaxAgePeakValuepercent || 0}%</div>
                <div className="item_bottom_right"></div>
              </div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#E0E9FF` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{female.PeakValueTime.toLocaleString("en-US") || 0}</div>
                  <div>
                    <div>时段偏好:{female.PeakTimeTime || ""}</div>
                    <UITooltipQuestion title="统计时间内，指定群体更喜欢在哪个时间段进入场地。" fontSize="12px" marginLeft="0px" />
                  </div>
                </div>
                <div className="item_top_right " style={{ backgroundColor: "#3664D0" }}>
                  <img src={PeakTime || ""} alt="vup" />
                </div>
              </div>
              <div className="item_bottom">
                <div className="item_bottom_left">占比：{female.PeakValueTimepercent || 0}%</div>
                <div className="item_bottom_right"></div>
              </div>
            </div>
            <div className="item grid-item" style={{ backgroundColor: `#FFF5F1` }}>
              <div className="item_top">
                <div className="item_top_left">
                  <div className="item_top_left_title">{female.EnterRate || 0}%</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div>进场率</div>
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
                  {ratelabel}：{female.preEnterRate || 0}%
                </div>
                <div className="item_bottom_right">
                  <img src={female?.EnterRatePre > 0 ? vup : vdown} alt="vup" />
                  {female?.EnterRatePre || 0}%
                </div>
              </div>
            </div>
          </div>
        )}
      </UIPanel>
    </div>
  );
});

export default CustomerSurvery;
