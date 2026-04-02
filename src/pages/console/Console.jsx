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
    key: "overview",
    label: Language.ZONGTIGAILAN,
    icon: <Home />,
  },
  {
    key: "groupsetting",
    label: Language.ZUZHISHEZHI,
    icon: <SettingOutlined />,
    children: [
      {
        key: "siteManagement",
        label: Language.CHANGDIGUANLI,
        icon: <ClusterOutlined />,
      },
      {
        key: "groupManagement",
        label: Language.JITUANGUANLI,
        icon: <ClusterOutlined />,
      },
    ],
  },
  {
    key: "userManagement",
    label: Language.ZHANGHAOJUESE,
    icon: <PeoplesTwo />,
    children: [
      {
        key: "accountManagement",
        label: Language.ZHANGHAOGUANLI,
        icon: <ClusterOutlined />,
      },
      {
        key: "roleManagement",
        label: Language.JUESEQUANXIAN,
        icon: <ClusterOutlined />,
      },
    ],
  },
  {
    key: "deviceManagement",
    label: Language.SHEBEIGUANLI,
    icon: <Devices />,
  },
  {
    key: "localManagement",
    label: Language.WEIZHIGUANLI,
    icon: <Local />,
    children: [
      {
        key: "doorManagement",
        label: Language.CHURUKOUGUANLI,
        icon: <ClusterOutlined />,
      },
      {
        key: "districtManagement",
        label: Language.QUYUGUANLI,
        icon: <ClusterOutlined />,
      },
    ],
  },
  // {
  //   key: "dataCorrection",
  //   label: Language.SHUJUXIUZHENG,
  //   icon: <Change />,
  // },
  // {
  //   key: "dataView",
  //   label: Language.SHUJUSHITU,
  //   icon: <DateComesBack />,
  // },
];

const Console = () => {
  const [collapsed, setCollapsed] = useState(true);
  // const [selectedKeys, setSelectedKeys] = useState(['WeeklyReport', 'report']);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKeys = location.state?.keyPath || ["overview"];
  // setSelectedKeys(location.state?.keyPath || ['WeeklyReport', 'report'])
  const contentRef = useRef(null);
  const { registerScrollContainer } = useScroll();

  const onClick = (e) => {
    console.log("click ", e);
    const path = e.key;
    navigate(path, { state: { parent: "/console", keyPath: e.keyPath } });
  };

  // 将 Console 自己的 Content 注册为滚动容器（与 Flow 方式一致）主要为了console主页服务
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
export default Console;
