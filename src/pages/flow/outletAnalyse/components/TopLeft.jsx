import React from "react";
import { Language, text } from "@/language/LocaleContext";
import { UITooltipQuestion } from "@/components/ui/UIComponent";
import insideTotal from "@/assets/newComponent/insideTotal.png"; // 人次
import insideCount from "@/assets/newComponent/insideCount.png";
import outTotal from "@/assets/newComponent/outTotal.png";
import customBatch from "@/assets/newComponent/customBatch.png";
import StringUtils from "@/utils/StringUtils";
import vup from "@/assets/images/vup.png";
import vdown from "@/assets/images/vdown.png";
import "../index.less";

// KPI卡片组件
const KPICard = React.memo((props) => {
  const { inCount, inNum, batchCount, outCount, outNum, inCountChainRatio, inNumChainRatio, batchCountChainRatio, outCountChainRatio, outNumChainRatio } = props;
  return (
    <div className="KPICard">
      <div className={`KPICard_item insideTotal big`}>
        <img src={insideTotal} alt="insideTotal" />
        <div className="KPICard_item_value">{inCount}人次</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          进场总人次
          <UITooltipQuestion title="统计时间内，从指定门口进入的客流人次(人次：同一个人在当日内进入N次算N人次)。" />
        </div>
        <div className="KPICard_item_radio">
          <div>环比：</div>
          <img src={inCountChainRatio > 0 ? vup : vdown} alt="" />
          <div>
            {inCountChainRatio > 0 ? "+" : ""}
            {StringUtils.toFixed(inCountChainRatio * 100, 2)}%
          </div>
        </div>
      </div>
      <div className={`KPICard_item insideCount big`}>
        <img src={insideCount} alt="insideCount" />
        <div className="KPICard_item_value">{inNum}人数</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          进场总人数
          <UITooltipQuestion title="统计时间内，从指定门口进入的去重人数(人数：同一个人在去重时段内进入多次算1人数)。" />
        </div>
        <div className="KPICard_item_radio">
          <div>环比：</div>
          <img src={inNumChainRatio > 0 ? vup : vdown} alt="" />
          <div>
            {inNumChainRatio > 0 ? "+" : ""}
            {StringUtils.toFixed(inNumChainRatio * 100, 2)}%
          </div>
        </div>
      </div>
      {/* <div className={`KPICard_item outTotal`}>
        <img src={outTotal} alt="outTotal" />
        <div className="KPICard_item_value">{outCount}人次</div>
        <div>出场总人次</div>
        <div className="KPICard_item_radio">
          <div>环比：</div>
          <img src={vup} alt="" />
          <div>
            {outCountChainRatio > 0 ? "+" : ""}
            {StringUtils.toFixed(outCountChainRatio * 100, 1)}%
          </div>
        </div>
      </div> */}
      <div className={`KPICard_item customBatch big`}>
        <img src={customBatch} style={{ right: "2px" }} alt="customBatch" />
        <div className="KPICard_item_value">{batchCount}</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          客流总批次
          <UITooltipQuestion title="统计时间内，从指定门口进入的批次客流(批次：系统将间隔时间内的进场人次统计为一个批次，例如批次间隔为N秒，那么这N秒内进入的客流为1个批次。)" />
        </div>
        <div className="KPICard_item_radio">
          <div>环比：</div>
          <img src={batchCountChainRatio > 0 ? vup : vdown} alt="" />
          <div>
            {batchCountChainRatio > 0 ? "+" : ""}
            {StringUtils.toFixed(batchCountChainRatio * 100, 2)}%
          </div>
        </div>
      </div>
    </div>
  );
});

export default KPICard;
