import Constant from "../common/Constant";
import { Language } from "../language/LocaleContext";
import cryptoJs from "crypto-js";

export const UserData = {
  account: null,
  phone: null,
  password: null,
  userId: null,
  roleId: null,
  roleName: null,
  rolePower: null,
  token: null,
  sites: null,
  icon: null,
  userName: null,
  contacts: null,
  selectedSiteId: null,
  defaultSiteId: null,
  businessHours: null,
  businessHoursBy5Minutes: null,
  expireTime: 0,
  /** groupId -> [clearTime] 映射，每个 groupId 对应多个去重后的 clearTime */
  ranking: 0,
  groupClearTimeMap: null,
};

export default class User {
  static getSiteOptions() {
    let sites = UserData.sites;
    let options = [];
    if (sites?.length > 0) {
      for (let i = 0; i < sites.length; i++) {
        options.push({ label: sites[i].siteName, value: sites[i].siteId, openTime: sites[i].openTime, closeTime: sites[i].closeTime });
      }
    } else {
      options.push({ label: Language.ZANWU, value: 0, openTime: 0, closeTime: 0 });
    }
    return options;
  }

  static initUserData(data) {
    User.setUserData(data);
    this.setUserKey(cryptoJs.MD5(User.userId.toString() + User.account + User.token + data.password).toString());
    const session = {
      account: User.account,
      key: User.key,
    };
    User.session = session;
  }

  static setUserData(data) {
    UserData.userId = data.userId;
    UserData.account = data.account;
    UserData.roleId = data.roleId;
    UserData.roleName = data.roleName;
    UserData.phone = data.phone;
    UserData.token = data.token;
    UserData.userName = data.userName;
    UserData.contacts = data.contacts;
    UserData.expireTime = data.expireTime;
    UserData.masterPower = data.masterPower ? data.masterPower.split(",") : [];
    UserData.ranking = data.ranking != null ? Number(data.ranking) : 0; // 特殊客户
    UserData.icon = Number(data.icon);
    if (UserData.roleId != "0") {
      UserData.rolePower = data.rolePower ? data.rolePower.split(",") : [];
    }
    UserData.sites = data.sites;
    UserData.selectedSiteId = data.sites.length > 0 ? data.sites[0].siteId : 0;
    // 每次请求 getUserData 将 site 里的 clearTime 和 groupId 对应保存，groupId 可对应多个 clearTime，clearTime 去重
    const groupClearTimeMap = {};
    (data.sites || []).forEach((site) => {
      const groupId = site.groupId != null ? String(site.groupId) : "0";
      const clearTime = site.clearTime != null ? Number(site.clearTime) : 0;
      if (!groupClearTimeMap[groupId]) groupClearTimeMap[groupId] = new Set();
      groupClearTimeMap[groupId].add(clearTime);
    });
    UserData.groupClearTimeMap = Object.fromEntries(Object.entries(groupClearTimeMap).map(([k, v]) => [k, [...v]]));
    let foundDefaultSite = false;
    for (let i = 0; i < UserData.sites.length; i++) {
      let site = UserData.sites[i];
      if (site.isDefault) {
        UserData.defaultSiteId = site.siteId;
        UserData.selectedSiteId = site.siteId;
        // 保存营业时间(取整)
        const openTime = Math.floor(site.openTime / 3600);
        let _closeTime = site.closeTime / 3600;
        if (site.closeTime % 3600 !== 0) {
          _closeTime = Math.floor(_closeTime) + 1;
        }
        // 如果无余数则取整，如果有余数则取整+1
        const openTimeBy5Minutes = Math.floor(site.openTime / 300);
        let _closeTimeBy5Minutes = site.closeTime / 300;
        if (site.closeTime % 300 !== 0) {
          _closeTimeBy5Minutes = Math.floor(_closeTimeBy5Minutes) + 1;
        }
        UserData.businessHours = [openTime, _closeTime];
        UserData.businessHoursBy5Minutes = [openTimeBy5Minutes, _closeTimeBy5Minutes];
        sessionStorage.setItem("clearTime", site.clearTime || 0);
        foundDefaultSite = true;
      }
    }
    // 如果没有找到默认站点，使用第一个站点的营业时间
    if (!foundDefaultSite && data.sites.length > 0) {
      const defaultSite = data.sites[0];
      const openTime = Math.floor(defaultSite.openTime / 3600);
      let _closeTime = defaultSite.closeTime / 3600;
      if (defaultSite.closeTime % 3600 !== 0) {
        _closeTime = Math.floor(_closeTime) + 1;
      }
      const openTimeBy5Minutes = Math.floor(defaultSite.openTime / 300);
      let _closeTimeBy5Minutes = defaultSite.closeTime / 300;
      if (defaultSite.closeTime % 300 !== 0) {
        _closeTimeBy5Minutes = Math.floor(_closeTimeBy5Minutes) + 1;
      }
      UserData.businessHours = [openTime, _closeTime];
      UserData.businessHoursBy5Minutes = [openTimeBy5Minutes, _closeTimeBy5Minutes];
      sessionStorage.setItem("clearTime", defaultSite.clearTime || 0);
    }
    UserData.logo = data.logo || "";
  }

  static setUserKey(key) {
    UserData.key = key;
  }

  static set session(session) {
    sessionStorage.setItem("session", JSON.stringify(session));
  }

  static set selectedSiteId(siteId) {
    UserData.selectedSiteId = siteId;
  }

  static set defaultSiteId(siteId) {
    UserData.defaultSiteId = siteId;
  }

  static get userId() {
    return UserData.userId;
  }

  static get userName() {
    return UserData.userName;
  }

  static get account() {
    return UserData.account;
  }

  static get token() {
    return UserData.token;
  }

  static get contacts() {
    return UserData.contacts;
  }

  static get roleName() {
    return UserData.roleName;
  }

  static get roleId() {
    return UserData.roleId;
  }

  static get key() {
    return UserData.key;
  }

  static get session() {
    return JSON.parse(sessionStorage.getItem("session"));
  }

  static get ranking() {
    return UserData.ranking;
  }

  static getSite(siteId) {
    let site = UserData.sites.find((item) => item.siteId == siteId);
    return site;
  }

  static get selectedSiteId() {
    return UserData.selectedSiteId;
  }

  static getSiteClearTime(siteId) {
    let site = User.getSite(siteId);
    if (!site) {
      return 0;
    }
    return Number(site.clearTime) * 3600;
  }

  static getBusinessHours(openTime, closeTime) {
    const _openTime = Math.floor(openTime / 3600);
    let _closeTime = closeTime / 3600;
    if (closeTime % 3600 !== 0) {
      _closeTime = Math.floor(_closeTime) + 1;
    }
    UserData.businessHours = [_openTime, _closeTime];
    return [_openTime, _closeTime];
  }

  static getBusinessHoursBy5Minutes(openTime, closeTime) {
    const _openTimeBy5Minutes = Math.floor(openTime / 300);
    let _closeTimeBy5Minutes = closeTime / 300;
    if (closeTime % 300 !== 0) {
      _closeTimeBy5Minutes = Math.floor(_closeTimeBy5Minutes) + 1;
    }
    UserData.businessHoursBy5Minutes = [_openTimeBy5Minutes, _closeTimeBy5Minutes];
    return [_openTimeBy5Minutes, _closeTimeBy5Minutes];
  }

  static get businessHours() {
    return UserData.businessHours;
  }

  static get businessHoursBy5Minutes() {
    return UserData.businessHoursBy5Minutes;
  }

  static get logo() {
    return UserData.logo;
  }

  static get icon() {
    return UserData.icon;
  }

  static get expireTime() {
    return UserData.expireTime;
  }

  static get phone() {
    return UserData.phone;
  }

  static get defaultSiteId() {
    return UserData.defaultSiteId;
  }

  /** 获取 groupId -> [clearTime] 映射，每个 groupId 对应多个去重后的 clearTime */
  static get groupClearTimeMap() {
    return UserData.groupClearTimeMap || {};
  }

  static logout() {
    sessionStorage.removeItem("session");
    UserData.userId = null;
    UserData.account = null;
    UserData.roleId = null;
    UserData.roleName = null;
    UserData.phone = null;
    UserData.token = null;
    UserData.userName = null;
    UserData.icon = null;
    UserData.rolePower = null;
    UserData.sites = null;
    UserData.key = null;
    UserData.masterPower = null;
    UserData.businessHours = null;
    UserData.businessHoursBy5Minutes = null;
    UserData.selectedSiteId = null;
    UserData.defaultSiteId = null;
    UserData.expireTime = 0;
    UserData.groupClearTimeMap = null;
    UserData.ranking = 0;
    sessionStorage.removeItem("clearTime");
  }

  static get flowTrendSelection() {
    let options = [
      { label: Language.JINCHANGRENCI, value: Constant.FLOW_TYPE.IN_COUNT },
      { label: Language.JINCHANGRENSHU, value: Constant.FLOW_TYPE.IN_NUM },
      { label: Language.KELIUPICI, value: Constant.FLOW_TYPE.BATCH_COUNT },
    ];
    return options;
  }

  static checkMasterPermission(powerId) {
    if (UserData.masterPower.indexOf(powerId.toString()) >= 0) {
      return true;
    }
    return false;
  }
  static checkRolePermission(powerId) {
    if (UserData.roleId == "0") {
      return true;
    }
    return UserData.rolePower.indexOf(powerId.toString()) >= 0;
  }
}
