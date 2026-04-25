import React, { useEffect, useRef, useState } from "react";
import { Home, PeoplesTwo, Devices, Local, Change, DateComesBack } from "@icon-park/react";
import { AppstoreOutlined, MailOutlined, SettingOutlined, CodepenOutlined, FileDoneOutlined, ClusterOutlined } from "@ant-design/icons";
import { Menu, Layout, Flex } from "antd";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";
import { UIMenu, UISider, ICPComponent } from "../../components/ui/UIComponent";
import { Language } from "../../language/LocaleContext";

import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, createBrowserRouter, Outlet } from "react-router-dom";
import { useScroll } from "../../context/ScrollContext";
import "../Main.less";

const items = [
  {
    key: "regionAnalyse",
    label: Language.QUYUFENXI,
    icon: <Home />,
  },
];

const HotSpot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKeys = location.state?.keyPath || ["regionAnalyse"];
  const contentRef = useRef(null);
  const { registerScrollContainer } = useScroll();

  const onClick = (e) => {
    const path = e.key;
    navigate(path, { state: { parent: "/hotspot", keyPath: e.keyPath } });
  };

  // 将 HotSpot 自己的 Content 注册为滚动容器（与 Flow 方式一致）主要为了hotspot主页服务
  useEffect(() => {
    if (contentRef.current) {
      registerScrollContainer(contentRef.current, 10);
    }
  }, [registerScrollContainer]);

  return (
    <div className="layout">
      <div className="layout">
        <Layout>
          <UISider breakpoint="lg" collapsedWidth="0" width={240} collapsible={true}>
            <UIMenu forceSubMenuRender={true} onClick={onClick} items={items} defaultOpenKeys={selectedKeys} defaultSelectedKeys={selectedKeys} mode="inline" />
          </UISider>
          <Content ref={contentRef}>
            <Outlet />
          </Content>
        </Layout>
      </div>
    </div>
  );
};
export default HotSpot;
