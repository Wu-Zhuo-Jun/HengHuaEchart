import React, { use, useEffect, useState } from "react";

import "./OverView.css";
import { Badge } from "antd";
import { UIPanel, ICPComponent } from "../../../components/ui/UIComponent";
import { Language, text } from "../../../language/LocaleContext";
import { OverviewOnlineDevicePieChart } from "../../../components/common/charts/Chart";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import TimeUtils from "../../../utils/TimeUtils";
import Res from "../../../config/Res";
import { useSite } from "../../../context/SiteContext";
import Config from "../../../config/Config";
import Http from "../../../config/Http";
import User from "../../../data/UserData";
import { useNavigate } from "react-router-dom";
import Message from "../../../components/common/Message";

const SiteInfoItem = ({ label, value, icon }) => {
  return (
    <div className="overview-site-info-item">
      <div className="overview-site-info-item-icon" style={{ backgroundImage: `url(${icon})` }}></div>
      <div className="overview-site-info-item-content">
        <div className="overview-site-info-item-label font-style-2-16" title={label}>
          {label}
        </div>
        <div className="overview-site-info-item-value" title={value}>
          {value != null ? value : Language.JIAZAIZHONG}
        </div>
      </div>
    </div>
  );
};

const ShortCutItem = ({ label, path, icon, onClick }) => {
  return (
    <div className="overview-shorcut-item" onClick={() => onClick(path)}>
      <div className="overview-shorcut-item-icon" style={{ backgroundImage: `url(${icon})` }}></div>
      <div className="overview-shorcut-item-title">{label}</div>
    </div>
  );
};

const ShortCutList = ({ shortcuts, onClick }) => {
  return (
    <div className="overview-shorcut-list">
      {shortcuts.map((item, index) => {
        return <ShortCutItem key={index} path={item.path} label={item.label} icon={item.icon} onClick={onClick} />;
      })}
    </div>
  );
};

const DeviceCountBarItem = ({ label, value, rate, color }) => {
  const barWidth = (rate > 100 ? 100 : rate) * 0.8;
  const barStyle = { width: `${barWidth}%`, backgroundColor: color };
  return (
    <div className="overview-device-count-bar-item">
      <div className="overview-device-count-bar-item-label">{label}</div>
      <div className="overview-device-count-bar-item-content">
        <div className="overview-device-count-bar-item-icon"></div>
        <div className="overview-device-count-bar-item-progress">
          <div className="bar" style={barStyle}></div>
          <div className="overview-device-count-bar-item-value" style={{ color: color, marginLeft: barWidth > 0 ? "17px" : "0px" }}>
            {text(Language.PARAM_TAI, { value: value })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ label, value }) => {
  return (
    <div className="overview-contact-item">
      <div className="overview-contact-item-icon"></div>
      <div className="overview-contact-item-content">
        <div className="overview-contact-item-label">{label}</div>
        <div className="overview-contact-item-value">{value}</div>
      </div>
    </div>
  );
};

const UserInfoItem = ({ useName, account, roleName, headIcon }) => {
  let headUrl = Res.other_icon;
  if (headIcon == 1) {
    headUrl = Res.male_icon;
  } else if (headIcon == 2) {
    headUrl = Res.female_icon;
  }
  return (
    <div className="overview-user-info-item">
      <div className="overview-user-info-item-content">
        <div className="overview-user-info-item-icon" style={{ backgroundImage: `url(${headUrl})` }}></div>
        <div>
          <div className="overview-user-info-item-username font-style-2-16">{useName}</div>
          <div className="overview-user-info-item-account font-style-2-14">{account}</div>
        </div>
      </div>
      <div className="overview-user-info-item-rolename font-style-2-16">{roleName}</div>
    </div>
  );
};

const OverView = () => {
  const navigate = useNavigate();
  const { siteId, setSiteId } = useSite();
  const [onlineStatus, setOnlineStatus] = useState({
    onlineCount: 0,
    offlineCount: 0,
    onlineTotal: 0,
    offlineTotal: 0,
    total: 0,
    allTotal: 0,
    totalRate: 0,
    onlineRate: 0,
    offlineRate: 0,
    onlineTotalRate: 0,
    offlineTotalRate: 0,
  });
  const [users, setUsers] = useState([]);
  const [siteInfo, setSiteInfo] = useState(null);

  //   const headerTitle = `Hi，${User.userName} 下午好~ `;
  const headerTitle = `Hi，${User.userName}`;
  const shortcuts = [
    {
      label: Language.CHANGDIGUANLI,
      icon: Res.overview_site_icon,
      path: "/console/siteManagement",
    },
    {
      label: Language.WEIZHIGUANLI,
      icon: Res.overview_local_icon,
      path: "/console/doorManagement",
    },
    {
      label: Language.SHEBEIGUANLI,
      icon: Res.overview_device_icon,
      path: "/console/deviceManagement",
    },
    {
      label: Language.ZHANGHAOGUANLI,
      icon: Res.overview_account_icon,
      path: "/console/accountManagement",
    },
    {
      label: Language.SHIYONGSHOUCE,
      icon: Res.overview_manul_icon,
      path: "",
    },
  ];
  const contacts = [
    {
      label: Language.YEWUZHICHI,
      value: "梁工  13380018134",
    },
    {
      label: Language.SHOUHOUJISHU,
      value: "彭工  13450848750",
    },
  ];

  const getDate = () => {
    var month = TimeUtils.getNowDate("MM/dd");
    var time = TimeUtils.getNowDate("HH:mm:ss");
    var weekDay = Language.getWeekStr(TimeUtils.getNowWeekDay());
    return { month, time, weekDay };
  };

  const [date, setDate] = useState(getDate());

  useEffect(() => {
    var timer = setInterval(() => {
      setDate(getDate());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (siteId != null) {
      getSiteInfo();
    }
  }, [siteId]);

  const getSiteInfo = () => {
    Http.getConsoleInfo(siteId, (res) => {
      if (res.result == 1) {
        setSiteInfo({
          ...siteInfo,
          siteName: res.data.siteName,
          siteArea: `${res.data.area}m²`,
          siteDoorCount: res.data.doorCount,
          siteGroupName: (!res.data.groupId && Language.ZANWU) || res.data.groupName,
          siteOpenTime: TimeUtils.sec2Date(Number(res.data.openTime), "HH:mm") + "-" + TimeUtils.sec2Date(Number(res.data.closeTime), "HH:mm"),
        });
        let onlineCount = Number(res.data.onlineCount);
        let offlineCount = Number(res.data.offlineCount);
        let onlineTotal = Number(res.data.onlineTotal);
        let offlineTotal = Number(res.data.offlineTotal);
        let total = onlineCount + offlineCount;
        let allTotal = onlineTotal + offlineTotal;

        let totalRate = total > 0 ? 100 : 0;
        let onlineRate = total > 0 ? Math.round((onlineCount / total) * 100) : 0;
        let offlineRate = total > 0 ? Math.round((offlineCount / total) * 100) : 0;
        let onlineTotalRate = allTotal > 0 ? Math.round((onlineTotal / allTotal) * 100) : 0;
        let offlineTotalRate = allTotal > 0 ? Math.round((offlineTotal / allTotal) * 100) : 0;
        setOnlineStatus({
          onlineCount,
          offlineCount,
          onlineTotal,
          offlineTotal,
          total,
          allTotal,
          totalRate,
          onlineRate,
          offlineRate,
        });
        let users = res.data.users;
        users.map((item, index) => {
          if (item.roleId == 0) {
            item.roleName = Language.GUANLIYUAN;
          } else {
            item.roleName = Language.ZANWU;
          }
        });
        setUsers(users);
      } else {
        Message.error(res.msg);
      }
    });
  };
  const weekDay = TimeUtils.getNowWeekDay();
  const onClickShourtcut = (path) => {
    if (path != null && path != "") {
      navigate(path);
    }
  };
  return (
    <div className="main">
      <div style={{ display: "flex", flexDirection: "row", columnGap: "19px" }}>
        <div style={{ display: "flex", flexDirection: "column", rowGap: "14px", width: "100%", justifyContent: "space-between" }}>
          <div className="overview-header">
            <div className="overview-header-icon"></div>
            <div className="overview-header-title">{headerTitle}</div>
          </div>
          <UIPanel bodyStyle={{ paddingTop: 0 }} className="overview-panel" title={Language.CHANGDIXINXI} style={{ height: "188px" }}>
            <div style={{ display: "flex", flexDirection: "row", columnGap: "10px", alignItems: "center", height: "100%" }}>
              <SiteInfoItem label={Language.CHANGDIXINXI} value={siteInfo?.siteName} icon={Res.overview_site_name_icon} />
              <SiteInfoItem label={Language.YINGYESHIJIAN} value={siteInfo?.siteOpenTime} icon={Res.overview_site_opentime_icon} />
              <SiteInfoItem label={Language.YINGYEMIANJI} value={siteInfo?.siteArea} icon={Res.overview_site_area_icon} />
              <SiteInfoItem label={Language.CHURUKOU} value={siteInfo?.siteDoorCount} icon={Res.overview_site_door_icon} />
              <SiteInfoItem label={Language.SUOSHUJITUAN} value={siteInfo?.siteGroupName} icon={Res.overview_site_groupname_icon} />
            </div>
          </UIPanel>
          <UIPanel className="overview-panel" title={Language.KUAIJIERUKOU} style={{ height: "214px" }}>
            <ShortCutList shortcuts={shortcuts} onClick={onClickShourtcut} />
          </UIPanel>
          <UIPanel className="overview-panel" title={Language.SHEBEIZHUANGTAI} bodyStyle={{ paddingTop: "46px" }} style={{ height: "438px" }}>
            <div className="overview-device-status">
              <div>
                <div className="overview-device-status-title">{Language.SUOYOUSHEBEIYUNXINGQINGKUANG}</div>
                <div style={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
                  <div style={{ flex: "5" }}>
                    <OverviewOnlineDevicePieChart data={{ onlineCount: onlineStatus.onlineTotal, offlineCount: onlineStatus.offlineTotal }} />
                  </div>
                  <div style={{ flex: "5", display: "flex", flexDirection: "column", rowGap: "49px", paddingTop: "50px" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge color="#3867D6" classNames={{ indicator: "badge-dot" }} text={<span className="online-device-title">{Language.ZAIXIANSHEBEISHULIANG}</span>} />
                      <div className="online-device-count">{text(Language.PARAM_TAI, { value: onlineStatus.onlineTotal })}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Badge color="#F9A231" classNames={{ indicator: "badge-dot" }} text={<span className="online-device-title">{Language.LIXIANSHEBEISHULIANG}</span>} />
                      <div className="online-device-count" style={{ color: "#F9A231" }}>
                        {text(Language.PARAM_TAI, { value: onlineStatus.offlineTotal })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="overview-device-status-title">{Language.DANGQIANCHANGDIDESHEBEIZHUANGTAI}</div>
                <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-evenly" }}>
                  <DeviceCountBarItem label={Language.SHEBEISHU} color="#68BBC4" value={onlineStatus.total} rate={onlineStatus.totalRate} />
                  <DeviceCountBarItem label={Language.ZAIXIAN} color="#3867D6" value={onlineStatus.onlineCount} rate={onlineStatus.onlineRate} />
                  <DeviceCountBarItem label={Language.LIXIAN} color="#F9A231" value={onlineStatus.offlineCount} rate={onlineStatus.offlineRate} />
                </div>
              </div>
            </div>
          </UIPanel>
        </div>
        <div style={{ display: "flex", flexDirection: "column", rowGap: "14px", width: "446px" }}>
          <div className="overview-time-info">
            <CalendarOutlined style={{ fontSize: "34px", color: "#3867D6", marginLeft: "54px" }} />
            <div style={{ marginLeft: "5px" }}>{date.month}</div>
            <div style={{ marginLeft: "14px" }}>{date.weekDay}</div>
            <ClockCircleOutlined style={{ fontSize: "34px", color: "#3867D6", marginLeft: "45px" }} />
            <div style={{ marginLeft: "10px" }}>{date.time}</div>
          </div>
          {localStorage.getItem("isNeutralDomain") == "true" ? null : (
            <>
              <UIPanel bodyStyle={{ paddingTop: "0px" }} title={Language.LIANXIWOMEN} style={{ height: "211px", padding: "0px 10px" }}>
                <div className="overview-contact">
                  <div className="overview-contact-logo"></div>
                  <div style={{ display: "flex", flexDirection: "column", rowGap: "10px", flexGrow: 1 }}>
                    {contacts.map((item, index) => {
                      return <ContactItem key={index} label={item.label} value={item.value} />;
                    })}
                  </div>
                </div>
              </UIPanel>
              <UIPanel bodyStyle={{ paddingTop: "10px" }} title={Language.WEIXINGONGZHONGHAO} style={{ height: "138px" }}>
                <div className="overview-wechat">
                  <div className="overview-wechat-icon"></div>
                  <div className="overview-wechat-content">
                    <div className="font-style-2-16">{Language.SAOMAGUANZHU}</div>
                    <div className="font-style-2-16">{Language.KAIQIXIAOXITUISONGFUWU}</div>
                  </div>
                </div>
              </UIPanel>
            </>
          )}
          <>
            <UIPanel title={Language.TUANDUICHENGYUAN} style={{ height: localStorage.getItem("isNeutralDomain") == "true" ? "865px" : "499px", paddingLeft: "39px", paddingRight: "10px" }}>
              <div style={{ height: "30px", width: "90%" }}>
                <div className="overview-user-write" onClick={() => onClickShourtcut("/console/accountManagement")}></div>
              </div>
              <div className="overview-user-info pb-scroll-container" style={{ height: "370px", paddingRight: "29px" }}>
                {users.map((item, index) => {
                  return <UserInfoItem key={index} useName={item.userName} account={item.account} roleName={item.roleName} headIcon={item.icon} />;
                })}
              </div>
            </UIPanel>
          </>
        </div>
      </div>
      {/* {localStorage.getItem("isNeutralDomain") == "true" ? null : <ICPComponent />} */}
      <ICPComponent />
    </div>
  );
};

export default OverView;
