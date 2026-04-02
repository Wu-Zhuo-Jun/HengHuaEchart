import React from "react";
import "../DataView.less";

const Wave = React.memo(({ percentage, isFullscreen, gender }) => {
  return (
    <div className="loader-container">
      <div className={`wave-loader ${isFullscreen ? "fullscreen-wave-loader" : ""} ${gender === "female" ? "wave-loader-female" : ""}`}>
        <div className={`wave wave1 ${gender === "female" ? "wave1-female" : ""}`}></div>
        <div className={`wave wave2 ${gender === "female" ? "wave2-female" : ""}`}></div>
        <div className="percentage">{percentage ? `${percentage.toFixed(0)}%` : "0%"} </div>
      </div>
    </div>
  );
});

export default Wave;
