import React, { useEffect, useState, useRef, useCallback } from "react";
import { Flex, Layout, Menu, Dropdown, message, Popover, Avatar, Tag } from "antd";
import Http from "@/config/Http";
import other_icon from "@/assets/images/other_icon.png";
import male_icon from "@/assets/images/male_icon.png";
import female_icon from "@/assets/images/female_icon.png";
import { Content, Footer, Header } from "antd/es/layout/layout";
import { UISelect } from "../components/ui/UIComponent";
import { SiteProvider, useSite } from "../context/SiteContext";
import { ScrollProvider, useScroll } from "../context/ScrollContext";
import User, { UserData } from "../data/UserData";
import hhCompanyLogo from "@/assets/images/hhCompanyLogo.png";
import neutralLogo from "@/assets/images/neutralLogo.png";
import Config from "../config/Config";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, createBrowserRouter, Outlet } from "react-router-dom";
import { Language } from "../language/LocaleContext";
import { DownOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import DemoUtils from "../utils/DemoUtils";
import StringUtils from "../utils/StringUtils";
import TimeUtils from "../utils/TimeUtils";
import Constant from "@/common/Constant";
import DataViewEditModal from "./homepage/components/DataViewEditModal";
import UserInfoModal from "../components/systemComponent/UserInfoModal";
import UserDataViewList from "../components/systemComponent/UserDataViewList";
import useDeviceDetect from "@/hooks/useDeviceDetect";
import "./Main.less";

const AvatarIconMap = {
  0: other_icon,
  1: male_icon,
  2: female_icon,
};

export const leftMenus = () => {
  const menus = [];
  // ranking=1 时仅展示流量-集团概览，不显示首页
  if (User.ranking !== 1) {
    menus.push({
      label: Language.SHOUYE,
      path: "homepage",
    });
  }
  menus.push({
    label: Language.LIULIANG,
    path: "flow",
  });
  if (User.checkRolePermission(Constant.ROLE_POWER.CONSOLE)) {
    menus.push({
      label: Language.GONGZUOTAI,
      path: "console",
    });
  }
  return menus;
};

const LeftMenu = ({ menus }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const path = location.state? location.state.parent : location.pathname;
  const path = StringUtils.urlPathToArray(location.pathname)[0];

  const onClick = (e) => {
    let path = e.target.getAttribute("path");
    if (path == "/flow") {
      const flowSubPath = User.ranking === 1 ? "/venueRanking" : "/dailyReport";
      navigate(path + flowSubPath, { state: { parent: path } });
    } else if (path == "/console") {
      navigate(path + "/overview", { state: { parent: path } });
    } else {
      navigate(path, { state: { parent: path } });
    }
  };

  return (
    <>
      {menus.map((menu, index) => (
        <div className={path == menu.path ? "navigation-bar-menu-item-selected" : "navigation-bar-menu-item"} path={menu.path} onClick={onClick} key={index}>
          {menu.label}
        </div>
      ))}
    </>
  );
};

const MainContent = () => {
  const contentRef = useRef(null);
  const layoutRef = useRef(null);
  const dataViewEditModalRef = useRef(null);
  const { hasShadow, registerScrollContainer } = useScroll();
  const { siteId, setSiteId, setBusinessHours, setBusinessHoursBy5Minutes } = useSite();
  const navigate = useNavigate();
  const [sites, setSites] = useState(null);
  const [defaultSiteId, setDefaultSiteId] = useState(null);
  const [dataViewModalOpen, setDataViewModalOpen] = useState(false);
  const [userInfoModalOpen, setUserInfoModalOpen] = useState(false);
  const [userDataListModalOpen, setUserDataListModalOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { isMobile } = useDeviceDetect();
  const [dashboardList, setDashboardList] = useState(["common"]);
  useEffect(() => {
    const options = User.getSiteOptions();
    const selectedSiteId = User.selectedSiteId;
    const defaultSiteId = User.defaultSiteId;
    setSiteId(selectedSiteId);
    setSites(options);
    setDefaultSiteId(defaultSiteId);
    setBusinessHours(User.businessHours || [0, 24]);
    setBusinessHoursBy5Minutes(User.businessHoursBy5Minutes || [0, 288]);
  }, []);

  useEffect(() => {
    Http.getDashboardList({}, (res) => {
      setDashboardList([...dashboardList, ...res.data]);
    });
  }, []);

  const location = useLocation();

  // 注册默认滚动容器（Main Content）
  // 当不在 Flow 页面时，确保 Main Content 被注册为滚动容器
  useEffect(() => {
    // 如果不在 Flow 页面，注册 Main Content
    if (!location.pathname.startsWith("/flow") && contentRef.current) {
      registerScrollContainer(contentRef.current, 10);
    }
  }, [registerScrollContainer, location.pathname]);

  const onClickDropdown = (e) => {
    if (e.key == "logout") {
      logout();
    }
  };

  const dropDownMenus = [
    {
      key: "logout",
      label: <div>{Language.TUICHU}</div>,
      onClick: onClickDropdown,
    },
  ];

  const onChangeSite = (value) => {
    const site = User.getSite(value);
    setSiteId(value);
    User.selectedSiteId = value;
    // 切换站点时更新营业时间并通知子组件
    const businessHours = User.getBusinessHours(site.openTime, site.closeTime);
    const businessHoursBy5Minutes = User.getBusinessHoursBy5Minutes(site.openTime, site.closeTime);
    setBusinessHours(businessHours);
    setBusinessHoursBy5Minutes(businessHoursBy5Minutes);
    sessionStorage.setItem("clearTime", site.clearTime || 0);
  };

  const logout = () => {
    User.logout();
    navigate("/login");
  };

  const isNeutralDomain = window.localStorage.getItem("isNeutralDomain") === "true";

  return (
    <Layout className="main-layout" ref={layoutRef}>
      <Header className={`main-header ${hasShadow ? "main-header-shadow" : ""}`}>
        <div className="main-header-logo">
          {!isNeutralDomain ? (
            <img
              src={User.logo ? User.logo : hhCompanyLogo}
              alt="logo"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src = hhCompanyLogo;
              }}
            />
          ) : (
            <img
              src={User.logo ? User.logo : neutralLogo}
              alt="logo"
              onError={(event) => {
                event.target.onerror = null;
                event.target.src = neutralLogo;
              }}
            />
          )}
        </div>
        <div className="main-navigation-bar">
          <Flex align="center" gap="35px">
            <LeftMenu menus={leftMenus()} />
          </Flex>
          <Flex align="center" gap="21px">
            <UISelect className="navigation-bar-site-select" value={siteId} options={sites} onChange={onChangeSite} />
            {User.ranking !== 1 && <div className="navigation-bar-item-icon navigation-bar-home-icon" onClick={() => navigate("/homepage")}></div>}
            {User.checkMasterPermission(Constant.MASTER_POWER.DATA_VIEW) && (
              <div
                className="navigation-bar-item-icon navigation-bar-dataView-icon"
                onClick={() => {
                  if (isMobile) {
                    message.warning({ content: "移动端不支持数据视图功能" });
                    return;
                  }
                  if (siteId) {
                    if (dashboardList.includes("TzDataView")) {
                      setUserDataListModalOpen(true);
                    } else {
                      dataViewEditModalRef.current.setSiteId(siteId);
                      setDataViewModalOpen(true);
                    }
                  } else {
                    message.warning({ content: "请先添加场地" });
                  }
                }}></div>
            )}
            <div className="navigation-bar-item-icon navigation-bar-notify-icon" onClick={() => message.warning({ content: "功能开发中..." })}></div>
            <div className="navigation-bar-item-icon navigation-bar-translate-icon" onClick={() => message.warning({ content: "功能开发中..." })}></div>
            <Popover
              classNames={{ root: "user-popover-root" }}
              content={
                <div className="user-popover-panel">
                  <div className="user-popover-header">
                    <div className="user-popover-avatar">
                      <img draggable={false} src={AvatarIconMap[User.icon] || other_icon} alt="avatar" />
                    </div>
                    <div className="user-popover-info">
                      <div className="user-popover-name">{User.userName || "用户"}</div>
                      <div className="user-popover-phone">{User.account || ""}</div>
                      <div className="user-popover-tags">
                        {User.roleId == 0 && <Tag color="blue">主账号</Tag>}
                        {User.roleId == -1 && <Tag>无权限</Tag>}
                        {User.roleId != 0 && User.roleId != -1 && User.roleName && (
                          <Tag color="blue" title={User.roleName}>
                            {User.roleName.length > 6 ? User.roleName.substring(0, 6) + "..." : User.roleName}
                          </Tag>
                        )}
                        {User.expireTime != 0 && (
                          <>
                            {TimeUtils.getRemainingDays(User.expireTime) >= 1 && <Tag color="orange">{TimeUtils.getRemainingDays(User.expireTime)}天后到期</Tag>}
                            {TimeUtils.getRemainingDays(User.expireTime) < 1 && TimeUtils.getRemainingDays(User.expireTime) > 0 && <Tag color="orange">即将到期</Tag>}
                            {TimeUtils.getRemainingDays(User.expireTime) < 0 && <Tag color="orange">已到期</Tag>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="user-popover-content">
                    <div
                      className="user-popover-menu-item"
                      onClick={() => {
                        setUserInfoModalOpen(true);
                        setPopoverOpen(false);
                      }}>
                      <UserOutlined className="user-popover-menu-icon" />
                      <span>账号设置</span>
                    </div>
                    <div className="user-popover-menu-item" onClick={logout}>
                      <LogoutOutlined className="user-popover-menu-icon" />
                      <span>退出登录</span>
                    </div>
                  </div>
                </div>
              }
              trigger="click"
              placement="bottomRight"
              open={popoverOpen}
              onOpenChange={setPopoverOpen}>
              <div className="navigation-bar-user-avatar-wrapper">
                <Avatar size={33} src={<img draggable={false} src={AvatarIconMap[User.icon] || other_icon} alt="avatar" />} />
              </div>
            </Popover>
          </Flex>
        </div>
      </Header>
      <Content className="main-content" ref={contentRef}>
        <Outlet />
      </Content>
      {/* <Footer className='main-footer'></Footer> */}
      {/* 大屏参数配置 */}
      <DataViewEditModal
        sites={sites || []}
        ref={dataViewEditModalRef}
        open={dataViewModalOpen}
        onCancel={() => setDataViewModalOpen(false)}
        onConfirm={(config) => {
          setDataViewModalOpen(false);
        }}
        getContainer={() => layoutRef.current}
      />
      {/* 账号设置 */}
      <UserInfoModal
        open={userInfoModalOpen}
        onCancel={() => setUserInfoModalOpen(false)}
        onConfirm={(data) => {
          console.log("用户信息更新:", data);
          // TODO: 调用API更新用户信息
          // 更新成功后关闭模态框
          setUserInfoModalOpen(false);
          message.success("账号设置已保存");
        }}
        avatarIconMap={AvatarIconMap}
      />
      {/* 大屏类型选择 */}
      <UserDataViewList
        open={userDataListModalOpen}
        onCancel={() => setUserDataListModalOpen(false)}
        onConfirm={(value) => {
          if (value === "common") {
            dataViewEditModalRef.current?.setSiteId(siteId);
            setDataViewModalOpen(true);
          }
          if (value === "TzDataView") {
            navigate("/tzdataview");
          }
        }}
        dashboardList={dashboardList}
      />
    </Layout>
  );
};

const Main = () => {
  return (
    <ScrollProvider>
      <MainContent />
    </ScrollProvider>
  );
};

export default Main;
