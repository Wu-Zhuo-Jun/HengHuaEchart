import React, { useState, useEffect, useContext, use } from "react";

import HomePage from "./pages/homepage/HomePage";
import GroupAnalysis from "./pages/flow/group/GroupAnalysis";
import DailyReport from "./pages/flow/report/DailyReport";
import WeeklyReport from "./pages/flow/report/WeeklyReport";
import MonthlyReport from "./pages/flow/report/MonthlyReport";
import AnnualReport from "./pages/flow/report/AnnualReport";
import OverView from "./pages/console/overview/OverView";
import Login from "./pages/Login";
import Main from "./pages/Main";
import DataView from "./pages/dataview/DataView";
import TzDataView from "./pages/dataview/TzDataView/TzDataView";
import axios from "axios";
import User, { UserData } from "./data/UserData";
import { useUser } from "./context/UserContext";
import Http from "./config/Http";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate, createBrowserRouter } from "react-router-dom";
import { Flex, Layout, Menu, Dropdown } from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { Language } from "./language/LocaleContext";
import { HomeFilled, DownOutlined } from "@ant-design/icons";
import { UISelect } from "./components/ui/UIComponent";

import "../src/assets/styles/public.css";
import "../src/assets/styles/ant.css";
import Flow from "./pages/flow/Flow";
import Console from "./pages/console/Console";
import HotSpot from "./pages/hotSpot/HotSpot";
import SiteManagement from "./pages/console/groupsetting/SiteManagement";
import GroupManagement from "./pages/console/groupsetting/GroupManagement";
import DeviceManagement from "./pages/console/device/DeviceManagement";
import DoorManagement from "./pages/console/local/DoorManagement";
import AccountManagement from "./pages/console/account/AccountManagement";
import RoleManagement from "./pages/console/account/RoleManagement";
import Constant from "./common/Constant";

const DistrictManagement = React.lazy(() => import("@/pages/console/district/DistrictManagement"));

const OutletComparison = React.lazy(() => import("@/pages/flow/outletComparison"));
const OutletAnalyse = React.lazy(() => import("@/pages/flow/outletAnalyse"));
const FloorAnalyse = React.lazy(() => import("@/pages/flow/floorAnalyse"));
const CustomerInsight = React.lazy(() => import("@/pages/flow/customerInsight/index.jsx"));
const OffSenceAnalyse = React.lazy(() => import("@/pages/flow/offSenceAnalyse/index.jsx"));
const VenueRanking = React.lazy(() => import("@/pages/flow/group/VenueRanking"));
const RegionAnalyse = React.lazy(() => import("@/pages/hotSpot/regionAnalyse/index.jsx"));

function App() {
  const [loading, setLoading] = useState(true);
  const { userId, setUserId } = useUser();

  // const AppRoutes = createBrowserRouter([
  //   { path: '/', element: <HomePage /> },
  //   { path: '/dailyReport', element: <DailyReport /> },
  // ])

  useEffect(() => {
    setLoading(true);
    if (User.userId == null) {
      let session = User.session;
      if (session == null) {
        logout();
        return;
      } else {
        let account = session.account;
        let key = session.key;
        let param = { account, key };
        Http.getUserData(param, (res) => {
          if (res.result == 1) {
            User.setUserData(res.data);
            User.setUserKey(key);
            setUserId(User.userId);
            setLoading(false);
          } else {
            logout();
            return;
          }
        });
      }
    } else {
      setLoading(false);
      setUserId(User.userId);
    }
  }, []);

  const logout = () => {
    setUserId(null);
    setLoading(false);
  };

  const routers = [
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: <Main />,
      children: [{}],
    },
  ];

  const AnimatedRoutes = ({ userId }) => {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="dataview" element={!userId ? <Navigate to="/login" /> : <DataView />} />
        <Route path="tzdataview" element={!userId ? <Navigate to="/login" /> : <TzDataView />} />
        <Route path="/" element={!userId ? <Navigate to="/login" /> : <Main />}>
          <Route index element={<Navigate to={User.ranking === 1 ? "/flow/venueRanking" : "/homepage"} />} />
          <Route path="homepage" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <HomePage />} />
          <Route path="flow" element={<Flow />}>
            <Route index element={<Navigate to={User.ranking === 1 ? "/flow/venueRanking" : "/flow/dailyReport"} />} />
            {/* ranking=1 时仅允许查看流量-集团概览(场地排行)，其他路由重定向 */}
            <Route path="groupAnalysis" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <GroupAnalysis />} />
            <Route path="dailyReport" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <DailyReport />} />
            <Route path="monthlyReport" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <MonthlyReport />} />
            <Route path="weeklyReport" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <WeeklyReport />} />
            <Route path="annualReport" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <AnnualReport />} />
            <Route path="outletComparison" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <OutletComparison />} />
            <Route path="outletAnalyse" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <OutletAnalyse />} />
            <Route path="floorAnalyse" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <FloorAnalyse />} />
            <Route path="customerInsight" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <CustomerInsight />} />
            <Route path="offSenceAnalyse" element={User.ranking === 1 ? <Navigate to="/flow/venueRanking" replace /> : <OffSenceAnalyse />} />
            <Route path="venueRanking" element={<VenueRanking />} />
          </Route>
          {userId && User.checkRolePermission(Constant.ROLE_POWER.CONSOLE) && (
            <Route path="console" element={<Console />}>
              <Route index element={<Navigate to="overview" />} />
              <Route path="overview" element={<OverView />} />
              <Route path="siteManagement" element={<SiteManagement />} />
              <Route path="groupManagement" element={<GroupManagement />} />
              <Route path="deviceManagement" element={<DeviceManagement />} />
              <Route path="DoorManagement" element={<DoorManagement />} />
              <Route path="DistrictManagement" element={<DistrictManagement />} />
              <Route path="accountManagement" element={<AccountManagement />} />
              <Route path="roleManagement" element={<RoleManagement />} />
            </Route>
          )}
          {userId && User.checkRolePermission(Constant.ROLE_POWER.CONSOLE) && (
            <Route path="hotSpot" element={<HotSpot />}>
              <Route index element={<Navigate to="regionAnalyse" />} />
              <Route path="regionAnalyse" element={<RegionAnalyse />} />
            </Route>
          )}
        </Route>
        <Route path="*" element={<div>404</div>} />
      </Routes>
    );
  };

  const items = [
    {
      key: "1",
      label: <div>{Language.TUICHU}</div>,
    },
  ];

  return <Router>{!loading && <AnimatedRoutes userId={userId} />}</Router>;
}

export default App;
