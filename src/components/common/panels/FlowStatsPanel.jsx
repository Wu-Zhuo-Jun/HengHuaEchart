import React from "react";
import { Space, Flex } from "antd";
import { text, Language } from "../../../language/LocaleContext";
import "./FlowStatsPanel.css";
import Res from "../../../config/Res";
import Constant from "@/common/Constant";
import CommonUtils from "@/utils/CommonUtils";
import { UITooltipQuestion } from "@/components/ui/UIComponent";

// const RateItem = ({preVal,rate}) =>{
//     let url = null;
//     if(rate > 0){
//         url = Res.vup;
//     }else if(rate < 0){
//         url = Res.vdown;
//     }
//     return(
//         <div style={{display:"flex",alignItems:"center"}}>
//             <div className={styles.qoqValue}>{text(Language.PARAM_HUANBI,{value:preVal.toLocaleString(("en-US"))})}</div>
//             <div style={{display:"flex",alignItems:"center"}}>
//                 {url != null && <div className={styles.rateIcon} style={{backgroundImage:`url(${url})`}}></div>}
//                 <div className={styles.rateValue}>{rate}%</div>
//             </div>
//         </div>
//     )
// }
// export const StatsCard =({val,preVal,rate,type}) =>{
//     let title = statTypeObj[type].title;
//     let url = statTypeObj[type].url;
//     return(
//         <div className={styles.statsCard}>
//             <div className={styles.statsHead}>
//                 <div>
//                     <div className={styles.statsVal}>{val.toLocaleString(("en-US"))}</div>
//                     <div className={styles.statsTitle}>{title}</div>
//                 </div>
//                 <div className={`${styles.statsIcon}`} style={{backgroundImage:`url(${url})`}}></div>
//             </div>
//             <RateItem rate={rate} preVal={preVal}/>
//         </div>
//     );
// }

const HomeRateItem = React.memo(({ preVal, rate }) => {
  let url = null;
  if (rate > 0) {
    url = Res.vup;
  } else if (rate < 0) {
    url = Res.vdown;
  }
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div className="home-qoq-value">{text(Language.PARAM_HUANBI, { value: preVal.toLocaleString("en-US") })}</div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {url != null && <div className="home-rate-icon" style={{ backgroundImage: `url(${url})` }}></div>}
        <div className="home-rate-value">{rate}%</div>
      </div>
    </div>
  );
});

const HomeStatsCard = React.memo(({ val, preVal, rate, type }) => {
  const HomeStatsType = {
    inCount: { title: Language.JINCHANGRENCI, url: Res.hp_in_count, tooltip: "统计时间内，进入场地的客流人次(人次：同一个人在当日内进入N次算N人次)。" },
    inNum: { title: Language.JINCHANGRENSHU, url: Res.hp_in_num, tooltip: "统计时间内，进入场地的去重人数(人数：同一个人在去重时段内进入多次算1人数)。" },
    batchCount: {
      title: Language.KELIUPICI,
      url: Res.hp_batch_count,
      tooltip: "统计时间内，进入场地的批次客流(批次：系统将间隔时间内的进场人次统计为一个批次，例如批次间隔为N秒，那么这N秒内进入的客流为1个批次。)",
    },
    outCount: { title: Language.CHUCHANGRENCI, url: Res.hp_out_count, tooltip: "统计时间内，离开场地的客流人次(人次：同一个人在当日内离开N次算N人次)。" },
    outsideCount: {
      title: Language.CHANGWAIKELIU,
      url: Res.hp_outside_count,
      tooltip: (
        <>
          统计时间内，经过场地外部及周边区域的客流人次。
          <br />
          <span style={{ fontSize: "12px" }}>
            注：核心价值在于衡量店铺吸引力与转化效率，判断产品、服务、促销活动的实际效果。长期跟踪能发现时段、季节、竞品活动等对客流的影响，辅助店铺扩张、调整运营策略（如优化门头、推出针对性引流活动）
          </span>
        </>
      ),
      tooltipSize: "big",
    },
    collectCount: {
      title: Language.JIKELI,
      url: Res.hp_collect_count,
      tooltip: (
        <>
          统计时间内，场地单位营业面积的客流量。(计算逻辑：集客力=进场人次÷营业面积)
          <br />
          <span style={{ fontSize: "12px" }}>注：核心价值在于衡量空间经营效率与客流承载质量，长期跟踪能揭示经营深度与决策依据。</span>
        </>
      ),
      tooltipSize: "big",
    },
    inRate: {
      title: Language.JINCHANGLV,
      url: Res.hp_in_rate,
      tooltip: (
        <>
          统计时间内，场地外部客流转化为进场客流的比例。(计算逻辑：进场率=进场人次÷场外客流)
          <br />
          <span style={{ fontSize: "12px" }}>
            注：进场率衡量了场地的导流效率与入口吸引力，判断外场营销、美陈装置及入口动线设计的实际效果。通过监测进场率的波动，可以识别外部环境（如天气、交通管制）与内部干预（如限流、主题活动）对流量转化的影响，辅助管理者优化场外引流策略、调整出入口设置或开展针对性的异业合作。
          </span>
        </>
      ),
      tooltipSize: "big",
      placement: "leftBottom",
    },
  };
  let title = HomeStatsType[type].title;
  let url = HomeStatsType[type].url;
  let tooltipSize = HomeStatsType[type].tooltipSize;
  let placement = HomeStatsType[type].placement || "top";
  return (
    <div className="home-stats-card">
      <div className="home-stats-head">
        <div>
          <div className="home-stats-val">{val.toLocaleString("en-US")}</div>
          <div className="home-stats-title" style={{ display: "flex", alignItems: "center" }}>
            <div>{title}</div>
            <UITooltipQuestion title={HomeStatsType[type].tooltip} tooltipSize={tooltipSize} placement={placement} />
          </div>
        </div>
        <div className="home-stats-icon " style={{ backgroundImage: `url(${url})` }}></div>
      </div>
      <HomeRateItem rate={rate} preVal={preVal} />
    </div>
  );
});

export const HomeFlowStatsGroup = React.memo(({ data }) => {
  return (
    <div style={{ display: "flex", columnGap: "8px", width: "auto" }}>
      {data.map((item, index) => (
        <HomeStatsCard val={item.val} preVal={item.preVal} rate={item.rate} type={item.type} key={index} />
      ))}
    </div>
  );
});

const FlowRateItem = React.memo(({ title, rate }) => {
  let url = null;
  if (rate > 0) {
    url = Res.vup;
  } else if (rate < 0) {
    url = Res.vdown;
  }
  return (
    <div className="normal-stats-rate-item">
      <div className="normal-stats-rate-item-title">{title}</div>
      {rate != 0 && <div className="normal-stats-rate-item-icon" style={{ backgroundImage: `url(${url})` }}></div>}
      <div className="normal-stats-rate-item-value">{rate}%</div>
    </div>
  );
});

const FlowStatsCard = React.memo(({ val, qoq, yoy, type, yoyType }) => {
  const statsType = {
    [Constant.FLOW_TYPE.IN_COUNT]: {
      title: Language.JINCHANGRENCI,
      url: Res.in_count,
      backGroundColor: "#ECEBFF",
      tooltip: "统计时间内，进入场地的客流人次(人次：同一个人在当日内进入N次算N人次)。",
    },
    [Constant.FLOW_TYPE.IN_NUM]: {
      title: Language.JINCHANGRENSHU,
      url: Res.in_num,
      backGroundColor: "#F3F7FF",
      tooltip: "统计时间内，进入场地的去重人数(人数：同一个人在去重时段内进入多次算1人数)。",
    },
    [Constant.FLOW_TYPE.BATCH_COUNT]: {
      title: Language.KELIUPICI,
      url: Res.batch_count,
      backGroundColor: "#F3FCFF",
      tooltip: "统计时间内，进入场地的批次客流(批次：系统将间隔时间内的进场人次统计为一个批次，例如批次间隔为N秒，那么这N秒内进入的客流为1个批次。)",
    },
    [Constant.FLOW_TYPE.OUT_COUNT]: {
      title: Language.CHUCHANGRENCI,
      url: Res.out_count,
      backGroundColor: "#FFF5F1",
      tooltip: "统计时间内，离开场地的客流人次(人次：同一个人在当日内离开N次算N人次)。",
    },
    [Constant.FLOW_TYPE.OUTSIDE_COUNT]: {
      title: Language.CHANGWAIKELIU,
      url: Res.outside_count,
      backGroundColor: "#ECEBFF",
      tooltip: (
        <>
          统计时间内，经过场地外部及周边区域的客流人次。
          <br />
          <span style={{ fontSize: "12px" }}>
            注：核心价值在于衡量店铺吸引力与转化效率，判断产品、服务、促销活动的实际效果。长期跟踪能发现时段、季节、竞品活动等对客流的影响，辅助店铺扩张、调整运营策略（如优化门头、推出针对性引流活动）
          </span>
        </>
      ),
      tooltipSize: "big",
    },
    [Constant.FLOW_TYPE.COLLECT_COUNT]: {
      title: Language.JIKELIPINGFANG,
      url: Res.collect_count,
      backGroundColor: "#FFF8EB",
      tooltip: (
        <>
          统计时间内，场地单位营业面积的客流量。(计算逻辑：集客力=进场人次÷营业面积)
          <br />
          <span style={{ fontSize: "12px" }}>注：核心价值在于衡量空间经营效率与客流承载质量，长期跟踪能揭示经营深度与决策依据。</span>
        </>
      ),
      tooltipSize: "big",
    },
    [Constant.FLOW_TYPE.IN_RATE]: {
      title: Language.JINCHANGLV,
      url: Res.in_rate,
      backGroundColor: "#EDF3FF",
      tooltip: (
        <>
          统计时间内，场地外部客流转化为进场客流的比例。(计算逻辑：进场率=进场人次÷场外客流)
          <br />
          <span style={{ fontSize: "12px" }}>
            注：进场率衡量了场地的导流效率与入口吸引力，判断外场营销、美陈装置及入口动线设计的实际效果。通过监测进场率的波动，可以识别外部环境（如天气、交通管制）与内部干预（如限流、主题活动）对流量转化的影响，辅助管理者优化场外引流策略、调整出入口设置或开展针对性的异业合作。
          </span>
        </>
      ),
      tooltipSize: "big",
      placement: "leftBottom",
    },
  };
  const title = statsType[type].title;
  const url = statsType[type].url;
  const backGroundColor = statsType[type].backGroundColor;
  const tooltip = statsType[type].tooltip;
  const tooltipSize = statsType[type].tooltipSize;
  const placement = statsType[type].placement || "top";
  const formattedValue = CommonUtils.formatNumberToUnit(val);
  const value = formattedValue.value;
  const unit = formattedValue.unit;
  const fullText = formattedValue.fullText;
  return (
    <div className="normal-stats-card" style={{ backgroundColor: backGroundColor }}>
      <div className="normal-stats-head">
        <div>
          <div className="normal-stats-val">
            {value}
            {unit && <span style={{ fontSize: "12px" }}>{unit}</span>}
          </div>
          <div className="normal-stats-title">
            <span style={{ marginRight: "6px" }}>{title}</span>
            <UITooltipQuestion title={tooltip} marginLeft="0px" tooltipSize={tooltipSize} placement={placement} />
          </div>
        </div>
        <div className="normal-stats-icon" style={{ backgroundImage: `url(${url})` }}></div>
      </div>
      <div>
        <FlowRateItem rate={qoq} title={Language.HUANBI} />
        {yoyType > 0 && <FlowRateItem rate={yoy} title={yoyType == 2 ? Language.ZHOUTONGBI : Language.TONGBI} />}
      </div>
    </div>
  );
});

export const FlowStatsGroup = React.memo(({ data, yoyType }) => {
  return (
    <div style={{ display: "flex", columnGap: "8px", width: "auto" }}>
      {data.map((item, index) => (
        <FlowStatsCard val={item.val} qoq={item.qoq} yoy={item.yoy} type={item.type} key={index} yoyType={yoyType} />
      ))}
    </div>
  );
});

export const HomeFlowStatsPanel = React.memo(({ adminName, data }) => {
  return (
    <div className="home-flow-stats-panel">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <div className="home-flow-stats-panel-welcome">{text(Language.PARAM_HUANYINHUILAI, { value: adminName })}</div>
        <div className="home-stats-setting"></div>
      </div>
      <HomeFlowStatsGroup data={data}></HomeFlowStatsGroup>
    </div>
  );
});

export const FlowStatsPanel = React.memo(({ data, yoyType = 0 }) => {
  return (
    <div className="normal-flow-stats-panel">
      <FlowStatsGroup data={data} yoyType={yoyType} />
    </div>
  );
});
