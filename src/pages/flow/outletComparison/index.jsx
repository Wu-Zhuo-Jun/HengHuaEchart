import "./index.less";
import { Select, Space, Button, message, Tabs } from "antd";
import { useCallback, useEffect, useState, useRef } from "react";
import { Language, text } from "@/language/LocaleContext";
import OutletComparisonPage from "./outletComparisonPage";
import TimeComparisonPage from "./timeComparisonPage";

/**出入口对比 */
function OutletComparison() {
  const [tab, setTabs] = useState("outlet"); // outlet time

  const handleTabChange = (key) => {
    setTabs(key);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 50);
  };

  return (
    <>
      <div className="outletComparison noScroll">
        <Tabs
          className="ui-content"
          size="middel"
          activeKey={tab}
          // renderTabBar={}
          items={[
            { label: "出入口对比", key: "outlet", children: <OutletComparisonPage tab={tab} /> },
            { label: "时间对比", key: "time", children: <TimeComparisonPage tab={tab} /> },
          ]}
          onChange={handleTabChange}
        />
      </div>
    </>
  );
}

export default OutletComparison;
