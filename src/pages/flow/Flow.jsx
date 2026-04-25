import React, { use, useState, useEffect, useRef, useMemo } from "react";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
  CodepenOutlined,
  FileDoneOutlined,
  ClusterOutlined,
  InsertRowRightOutlined,
  EyeOutlined,
  GatewayOutlined,
  BarChartOutlined,
  ProductOutlined,
  RadarChartOutlined,
} from "@ant-design/icons";
import { Menu, Layout, Flex } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import { UIMenu, UISider } from "../../components/ui/UIComponent";
import { Language } from "../../language/LocaleContext";
import DailyReport from "./report/DailyReport";
import HomePage from "../homepage/HomePage";
import StringUtils from "../../utils/StringUtils";
import User from "../../data/UserData";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, createBrowserRouter, Outlet } from "react-router-dom";
import { useScroll } from "../../context/ScrollContext";
import "../Main.less";

const items = [
  // {
  //   key: "groupAnalysis",
  //   label: Language.JITUANFENXI,
  //   icon: <CodepenOutlined />,
  // },
  {
    key: "group",
    label: Language.JITUANGAILAN,
    icon: <ProductOutlined />,
    children: [
      {
        key: "venueRanking",
        label: Language.CHANGDIPAIXING,
        icon: <BarChartOutlined />,
        state: 1,
      },
      {
        key: "groupAnalysis",
        label: Language.JITUANFENXI,
        icon: <CodepenOutlined />,
      },
    ],
  },
  {
    key: "report",
    label: Language.ZHOUQIZONGJIE,
    icon: <FileDoneOutlined />,
    children: [
      {
        key: "dailyReport",
        label: Language.RIBAO,
        icon: <ClusterOutlined />,
        state: 1,
      },
      {
        key: "weeklyReport",
        label: Language.ZHOUBAO,
        icon: <ClusterOutlined />,
      },
      {
        key: "monthlyReport",
        label: Language.YUEBAO,
        icon: <ClusterOutlined />,
      },
      {
        key: "annualReport",
        label: Language.NIANBAO,
        icon: <ClusterOutlined />,
      },
    ],
  },

  {
    key: "outletComparison",
    label: Language.CHURUKOUDUIBI,
    icon: <CodepenOutlined />,
  },
  {
    key: "outletAnalyse",
    label: Language.CHURUKOUFENXI,
    icon: <AppstoreOutlined />,
  },
  {
    key: "floorAnalyse",
    label: Language.LOUCENGFENXI,
    icon: <InsertRowRightOutlined />,
  },
  {
    key: "customerInsight",
    label: Language.GUKEDONGCHA,
    icon: <EyeOutlined />,
  },
  {
    key: "offSenceAnalyse",
    label: Language.WAIBUFENXI,
    icon: <GatewayOutlined />,
  },
];

const menuSelectedKeys = {
  dailyreport: ["report", "dailyReport"],
  weeklyreport: ["report", "weeklyReport"],
  monthlyreport: ["report", "monthlyReport"],
  annualreport: ["report", "annualReport"],
  groupanalysis: ["groupAnalysis"],
  outletcomparison: ["outletComparison"],
  outletanalyse: ["outletAnalyse"],
  flooranalyse: ["floorAnalyse"],
  customerinsight: ["customerInsight"],
  offsenceanalyse: ["offSenceAnalyse"],
  venueranking: ["group", "venueRanking"],
};

/** ranking=1 时仅展示集团概览的场地排行 */
const RANKING_ONLY_ITEMS = [
  {
    key: "group",
    label: Language.JITUANGAILAN,
    icon: <ProductOutlined />,
    children: [
      {
        key: "venueRanking",
        label: Language.CHANGDIPAIXING,
        icon: <BarChartOutlined />,
        state: 1,
      },
    ],
  },
];

/** 从 selectedKeys 中提取父级 submenu 的 key，用于 openKeys（只包含有 children 的项） */
const getOpenKeysFromSelected = (keys, menuItems) => {
  if (!keys?.length || !menuItems) return [];
  const parentKeys = [];
  for (const item of menuItems) {
    if (item.children && keys.some((k) => k === item.key || item.children?.some((c) => c.key === k))) {
      parentKeys.push(item.key);
    }
  }
  return parentKeys;
};

const Flow = React.memo(() => {
  const [collapsed, setCollapsed] = useState(true);
  const [showMenu, setShowSider] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const contentRef = useRef(null);
  const isRankingOnly = User.ranking === 1;

  const displayItems = useMemo(() => (isRankingOnly ? RANKING_ONLY_ITEMS : items), [isRankingOnly]);

  useEffect(() => {
    if (isRankingOnly) {
      const pathArray = StringUtils.urlPathToArray(location.pathname);
      const lastPath = pathArray[pathArray.length - 1]?.toLowerCase();
      if (lastPath !== "venueranking") {
        navigate("/flow/venueRanking", { replace: true });
        return;
      }
    }
  }, [isRankingOnly, location.pathname, navigate]);

  useEffect(() => {
    const pathArray = StringUtils.urlPathToArray(location.pathname);
    const keys = menuSelectedKeys[pathArray[pathArray.length - 1]?.toLowerCase()];
    setSelectedKeys(keys || []);
    setOpenKeys((prev) => {
      const fromSelected = getOpenKeysFromSelected(keys, displayItems);
      return fromSelected.length ? fromSelected : prev;
    });
    if (keys || isRankingOnly) {
      setShowSider(true);
    }
  }, [location, isRankingOnly, displayItems]);

  // // 注册 Flow 页面的 Content 作为滚动容器
  // useEffect(() => {
  //   if (contentRef.current) {
  //     registerScrollContainer(contentRef.current, 10);
  //   }
  //   // 当 Flow 页面卸载时，不需要手动恢复
  //   // MainContent 会根据路由变化自动重新注册 Main Content
  // }, [registerScrollContainer]);

  const onClick = (e) => {
    const path = e.key;
    // 如果当前路径已经是目标路径，则不跳转
    if (location.pathname === `/flow/${path}`) {
      return;
    }
    navigate(path, { state: { parent: "/flow", keyPath: e.keyPath } });
  };
  // const onOpenChange = (openKeys) => {
  //   setSelectedKeys(openKeys);
  // };
  return (
    <div className="layout" style={{ height: "100%", overflow: "hidden" }}>
      <Layout>
        <UISider breakpoint="lg" collapsedWidth="0" width={240} collapsible={true}>
          {showMenu && (
            <UIMenu
              selectedKeys={selectedKeys}
              openKeys={openKeys}
              onOpenChange={setOpenKeys}
              forceSubMenuRender={true}
              onClick={onClick}
              inlineCollapsed={false}
              items={displayItems}
              mode="inline"
            />
          )}
        </UISider>
        <Content ref={contentRef}>
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
});

export default Flow;
