import "../index.less";
import { Select, Space, DatePicker, Button } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Language, text } from "@/language/LocaleContext";
import comprise from "@/assets/newComponent/comprise.png";
import appiont from "@/assets/newComponent/appiont.png";
import iconParkArrowRight from "@/assets/newComponent/iconParkArrowRight.png";
import iconParkArrowRightTwo from "@/assets/newComponent/iconParkArrowRightTwo.png";
import useOutletStore from "@/stores/useOutletStore";
import { useNavigate } from "react-router-dom";

const OutCardItem = React.memo((props) => {
  const { name, index, inNum, batchCount, inCount, type = "appiont", analyseTimeRange = [], analyseDoorId, analyseDoorType } = props.props;
  const _analyseTimeRange = analyseTimeRange.map((item) => item.valueOf());
  const navigate = useNavigate();

  let mixtureClass = "outletCardItem";
  switch (true) {
    case type === "appiont" && index === 0:
      mixtureClass += " appiont appiontFirst";
      break;
    case type === "appiont":
      mixtureClass += " appiont";
      break;
    case type === "comparison" && index === 0:
      mixtureClass += " comparison comparisonFirst"; // 如果需要的话
      break;
    default:
      mixtureClass += " comparison";
      break;
  }

  return (
    <div className={mixtureClass}>
      {index === 0 ? <img className="outletCardItem-bg" src={type === "appiont" ? appiont : comprise}></img> : null}
      <div className="outletCardItem-name">{name}</div>
      <div className="outletCardItem-info">
        <div>进场人次:</div>
        <div>{inCount ? inCount?.toLocaleString("en-US") || 0 : 0}</div>
      </div>
      <div className="outletCardItem-info">
        <div>进场人数:</div>
        <div>{inNum ? inNum?.toLocaleString("en-US") || 0 : 0}</div>
      </div>
      <div className="outletCardItem-info">
        <div>客流批次:</div>
        <div>{batchCount ? batchCount?.toLocaleString("en-US") || 0 : 0}</div>
      </div>
      {index !== 0 && (
        <div
          className="outletCardItem-out"
          onClick={() => {
            useOutletStore.setState({ analyseDoorId: [analyseDoorId], analyseTimeRange: _analyseTimeRange, analyseDoorType });
            navigate(`/flow/outletAnalyse?analyseDoorId=${analyseDoorId}`, { state: { fromOutletComparison: true } });
          }}>
          <div>查看该出入口客流</div>
          <img className="outletCardItem-out-icon" src={type === "appiont" ? iconParkArrowRightTwo : iconParkArrowRight} />
        </div>
      )}
    </div>
  );
});

export default OutCardItem;
