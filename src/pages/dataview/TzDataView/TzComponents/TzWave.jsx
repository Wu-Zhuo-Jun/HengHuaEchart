import React from "react";
import "../TzDataView.less";
import CommonUtils from "@/utils/CommonUtils";

const Wave = React.memo(({ totalNum, isFullscreen, gender, showPercentage = true, fillPercent, portraitSize }) => {
  const { value, unit, fullText } = CommonUtils.formatNumberToUnit(totalNum || 0);
  return (
    <div className="loader-container">
      <div className={`wave-loader  ${gender === "female" ? "wave-loader-female" : ""}`}>
        <div className={`wave wave1 ${gender === "female" ? "wave1-female" : ""}`}></div>
        <div className={`wave wave2 ${gender === "female" ? "wave2-female" : ""}`}></div>
        {/* <div className="wave-loader__clip" style={clipStyle}> */}
        <div className="total-num">{fullText || 0}</div>
        <div className="percentage">{fillPercent ? `${fillPercent.toFixed(2)}%` : "0%"} </div>
      </div>
    </div>
  );
});

export default Wave;
