import Config from "./Config";
import axios from "axios";
import User from "../data/UserData";
export class Cmd {
  static CMD_LOGIN = Config.API_URL + "/user/login";
  static CMD_GET_USER_DATA = Config.API_URL + "/user/getUserData";
  static CMD_GET_CONSOLE_INFO = Config.API_URL + "/overview/getInfo";
  static CMD_GET_SITE_LIST = Config.API_URL + "/sitemanagement/getSites";
  static CMD_SITE_CHANGE_GROUP = Config.API_URL + "/sitemanagement/changeGroup";
  static CMD_CREATE_GROUP = Config.API_URL + "/groupmanagement/createGroup";
  static CMD_GET_GROUP_LIST = Config.API_URL + "/groupmanagement/getGroupList";
  static CMD_EDIT_GROUP = Config.API_URL + "/groupmanagement/editGroup";
  static CMD_DELETE_GROUP = Config.API_URL + "/groupmanagement/deleteGroup";
  static CMD_GET_GROUP_SELECTION = Config.API_URL + "/groupmanagement/getGroupSelection";
  static CMD_GET_GROUP_FACE_RANKING = Config.API_URL + "/groupanalysis/getGroupFaceRanking";
  static CMD_GET_GROUP_FLOW_RANKING = Config.API_URL + "/groupanalysis/getGroupFlowRanking";
  static CMD_GET_GROUP_SITE_SELECTION = Config.API_URL + "/sitemanagement/getGroupsSites";
  static CMD_ADD_USER = Config.API_URL + "/accountmanagement/addUser";
  static CMD_GET_USER_LIST = Config.API_URL + "/accountmanagement/getUserList";
  static CMD_SET_USER_STATE = Config.API_URL + "/accountmanagement/setUserState";
  static CMD_EDIT_USER = Config.API_URL + "/accountmanagement/editUser";
  static CMD_DELETE_USER = Config.API_URL + "/accountmanagement/deleteUser";
  static CMD_GET_USER_ROLE_SELECTION = Config.API_URL + "/accountmanagement/getRoles";
  static CMD_SET_USER_ICON = Config.API_URL + "/accountmanagement/setIcon";
  static CMD_SET_USER_NAME = Config.API_URL + "/accountmanagement/setUserName";
  static CMD_SET_USER_PASSWORD = Config.API_URL + "/accountmanagement/setPassword";
  static CMD_ADD_ROLE = Config.API_URL + "/rolemanagement/addRole";
  static CMD_EDIT_ROLE = Config.API_URL + "/rolemanagement/editRole";
  static CMD_GET_ROLE_LIST = Config.API_URL + "/rolemanagement/getRoleList";
  static CMD_DELETE_ROLE = Config.API_URL + "/rolemanagement/deleteRole";
  static CMD_SAVE_ROLE_POWER = Config.API_URL + "/rolemanagement/saveRolePower";
  static CMD_GET_DEVICE_LIST = Config.API_URL + "/devicemanagement/getDeviceList";
  static CMD_GET_SITE_DEVICE_LIST = Config.API_URL + "/devicemanagement/getSiteDeviceList";
  static CMD_GET_DOOR_SITE_LIST = Config.API_URL + "/doormanagement/getSiteList";
  static CMD_GET_DOOR_LIST = Config.API_URL + "/doormanagement/getDoorList";
  static CMD_ADD_FLOOR = Config.API_URL + "/doormanagement/addFloor";
  static CMD_EDIT_FLOOR = Config.API_URL + "/doormanagement/editFloor";
  static CMD_DELETE_FLOOR = Config.API_URL + "/doormanagement/deleteFloor";
  static CMD_ADD_DOORS = Config.API_URL + "/doormanagement/addDoors";
  static CMD_EDIT_DOOR = Config.API_URL + "/doormanagement/editDoor";
  static CMD_DELETE_DOOR = Config.API_URL + "/doormanagement/deleteDoor";
  static CMD_GET_SITE_DOOR_LIST = Config.API_URL + "/devicemanagement/getSiteDoorList";
  static CMD_EDIT_DEVICE = Config.API_URL + "/devicemanagement/editDevice";
  static CMD_GET_DOOR_ALLTYPE_LIST = Config.API_URL + "/doormanagement/getDoorAllTypeList";
  static CMD_GET_DOOR_OUTTYPE_LIST = Config.API_URL + "/doormanagement/getDoorOutTypeList";
  static CMD_SET_DOOR_ALL_TYPE = Config.API_URL + "/doormanagement/setDoorAllType";
  static CMD_SET_DOOR_OUT_TYPE = Config.API_URL + "/doormanagement/setDoorOutType";
  static CMD_GET_FLOOR_DOOR_LIST = Config.API_URL + "/doormanagement/getFloorDoorList";
  static CMD_ADD_ASSOC_FLOOR = Config.API_URL + "/doormanagement/addAssocFloor";
  static CMD_REMOVE_ASSOC_FLOOR = Config.API_URL + "/doormanagement/removeAssocFloor";
  static CMD_GET_SITE_AREAS = Config.API_URL + "/areamanagement/getSiteAreas";
  static CMD_GET_AREA = Config.API_URL + "/areamanagement/getArea";
  static CMD_ADD_AREA = Config.API_URL + "/areamanagement/addArea";
  static CMD_EDIT_AREA = Config.API_URL + "/areamanagement/editArea";
  static CMD_DELETE_AREA = Config.API_URL + "/areamanagement/deleteArea";
  static CMD_GET_AREA_DOORS = Config.API_URL + "/areamanagement/getAreaDoors";
  static CMD_ADD_ASSOC_DOOR = Config.API_URL + "/areamanagement/addAssocDoor";
  static CMD_REMOVE_ASSOC_DOOR = Config.API_URL + "/areamanagement/removeAssocDoor";
  static CMD_SET_AREA_MAPPING = Config.API_URL + "/areamanagement/setAreaMapping";
  static CMD_GET_AREA_MAPPING = Config.API_URL + "/areamanagement/getAreaMapping";

  static CMD_GET_HOME_STAT = Config.API_URL + "/home/getHomeStat";
  static CMD_GET_HOME_DATA = Config.API_URL + "/home/getHomeData";
  static CMD_GET_HOME_REALFLOW_DATA = Config.API_URL + "/home/getRealFlowData";

  static CMD_GET_COMPARE_DOORLIST_DATA = Config.API_URL + "/doorcompare/getCompareDoorList";
  static CMD_GET_COMPARE_DOOR_STATS_DATA = Config.API_URL + "/doorcompare/getDoorCompareStats";
  static CMD_GET_COMPARE_DATE_STATS_DATA = Config.API_URL + "/doorcompare/getDateCompareStats";
  static CMD_GET_DOOR_ANALYSIS_STATS = Config.API_URL + "/dooranalysis/getDoorAnalysisStats";
  static CMD_GET_FLOOR_LIST = Config.API_URL + "/flooranalysis/getFloors";
  static CMD_GET_FLOOR_DATA = Config.API_URL + "/flooranalysis/getFloorAnalysisStats";
  static CMD_GET_CUSTOMER_INSIGHT_DATA = Config.API_URL + "/customeranalysis/getCustomerAnalysis";
  static CMD_GET_OFFSENCE_ANALYSIS_DOOR_LIST = Config.API_URL + "/outsideanalysis/getOutsideDoorList";
  static CMD_GET_OFFSENCE_ANALYSIS_STATS = Config.API_URL + "/outsideanalysis/getOutsideAnalysis";
  static CMD_GET_OFFSENCE_DOOR_ANALYSIS_FLOW = Config.API_URL + "/outsideanalysis/getOutSideDoorAnalysisFlow";

  static CMD_GET_DAILY_STATS = Config.API_URL + "/dailyreport/getDailyStats";
  static CMD_GET_WEEKLY_STATS = Config.API_URL + "/weeklyreport/getWeeklyStats";
  static CMD_GET_MONTHLY_STATS = Config.API_URL + "/monthlyreport/getMonthlyStats";
  static CMD_GET_ANNUAL_STATS = Config.API_URL + "/annualreport/getAnnualStats";

  static CMD_GET_DASHBOARD_SITE_CFG = Config.API_URL + "/dashboard/getSiteCfg";
  static CMD_SET_DASHBOARD_SITE_CFG = Config.API_URL + "/dashboard/setSiteCfg";
  static CMD_GET_DASHBOARD_LIST = Config.API_URL + "/dashboard/getTemplateList";

  static CMD_GET_GROUPANALYSIS_MEMBER = Config.API_URL + "/groupanalysis/getMemberRealTime";

  static CMD_SET_DEFAULT_SITE = Config.API_URL + "/sitemanagement/setDefaultSite";

  // tagManagement
  static CMD_GET_TAG_LIST = Config.API_URL + "/tagmanagement//getTagList";
  static CMD_GET_ASSOC_SITES = Config.API_URL + "/tagmanagement//getAssocSites";

  // siteAnalysis
  static CMD_GET_DEVICE_ONLINE_INFO = Config.API_URL + "/siteAnalysis/getDeviceOnlineInfo";
  static CMD_GET_FLOW_TREND = Config.API_URL + "/siteAnalysis/getFlowTrend";
  static CMD_GET_FACE_TOTAL = Config.API_URL + "/siteAnalysis/getFaceTotal";
  static CMD_GET_SITE_RANKING = Config.API_URL + "/siteAnalysis/getRanking";
  static CMD_GET_FLOW_TOTAL = Config.API_URL + "/siteAnalysis/getFlowTotal";
  static CMD_GET_FESTIVAL_TOTAL = Config.API_URL + "/siteAnalysis/getFestivalTotal";

  static CMD_GET_GROUPANALYSIS = Config.API_URL + "/groupanalysis/getGroupAnalysis";
  static CMD_GET_GROUPANALYSIS_COMPARE = Config.API_URL + "/groupanalysis/getGroupCompareTrend";
}

class Http {
  static cancelTokenSource() {
    return axios.CancelToken.source();
  }

  static postForm(cmd, data, success, token = null, error = null) {
    let config = {
      timeout: 30000, // 请求超时时间
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
    };
    if (token) {
      console.log("token", token, cmd);
      config.cancelToken = token;
    }
    axios
      .create(config)
      .postForm(cmd, data)
      .then((res) => {
        if (success) {
          res.data.result = Number(res.data.result);
          return success(res.data);
        }
      })
      .catch((err) => {
        error?.call(null, err);
      });
  }

  static post(cmd, data, success, token, error) {
    data.key = User.key;
    data.userId = User.userId;
    Http.postForm(cmd, data, success, token, error);
  }

  /**
   * 上传 FormData（含文件），自动注入 key / userId
   */
  static postFile(cmd, formData, success, token = null, error = null) {
    let config = {
      timeout: 60000,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    if (token) {
      config.cancelToken = token;
    }
    formData.append("key", User.key);
    formData.append("userId", User.userId);
    axios
      .create(config)
      .post(cmd, formData)
      .then((res) => {
        if (success) {
          res.data.result = Number(res.data.result);
          success(res.data);
        }
      })
      .catch((err) => {
        error?.call(null, err);
      });
  }

  static login(data, success, error) {
    Http.postForm(
      Cmd.CMD_LOGIN,
      data,
      (res) => {
        if (res.result == 1) {
          res.data.password = data.password;
          User.initUserData(res.data);
        }
        success(res);
      },
      null,
      error
    );
  }

  static getUserData(data, success, error) {
    Http.postForm(Cmd.CMD_GET_USER_DATA, data, success, error);
  }

  static getConsoleInfo(siteId, success, error) {
    let params = {
      siteId: siteId,
    };
    Http.post(
      Cmd.CMD_GET_CONSOLE_INFO,
      params,
      (res) => {
        success(res);
      },
      error
    );
  }

  static getSiteList(params, success, error) {
    Http.post(Cmd.CMD_GET_SITE_LIST, params, success);
  }

  static createGroup(params, success, token, error) {
    Http.post(Cmd.CMD_CREATE_GROUP, params, success, token, error);
  }

  static getGroupList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUP_LIST, params, success, token, error);
  }

  static editGroup(params, success, token, error) {
    Http.post(Cmd.CMD_EDIT_GROUP, params, success, token, error);
  }

  static deleteGroup(params, success, token, error) {
    Http.post(Cmd.CMD_DELETE_GROUP, params, success, token, error);
  }

  static getGroupSelection(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUP_SELECTION, params, success, token, error);
  }

  static getGroupFlowRanking(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUP_FLOW_RANKING, params, success, token, error);
  }

  static getGroupFaceRanking(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUP_FACE_RANKING, params, success, token, error);
  }

  static changeSiteGroup(params, success, token, error) {
    Http.post(Cmd.CMD_SITE_CHANGE_GROUP, params, success, token, error);
  }

  static getGroupSiteSelection(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUP_SITE_SELECTION, params, success, token, error);
  }

  static addUser(params, success, token, error) {
    Http.post(Cmd.CMD_ADD_USER, params, success, token, error);
  }
  static getUserList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_USER_LIST, params, success, token, error);
  }
  static setUserState(params, success, token, error) {
    Http.post(Cmd.CMD_SET_USER_STATE, params, success, token, error);
  }

  static editUser(params, success, token, error) {
    Http.post(Cmd.CMD_EDIT_USER, params, success, token, error);
  }

  static deleteUser(params, success, token, error) {
    Http.post(Cmd.CMD_DELETE_USER, params, success, token, error);
  }

  static addRole(params, success, token, error) {
    Http.post(Cmd.CMD_ADD_ROLE, params, success, token, error);
  }

  static editRole(params, success, token, error) {
    Http.post(Cmd.CMD_EDIT_ROLE, params, success, token, error);
  }

  static getRoleList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_ROLE_LIST, params, success, token, error);
  }

  static deleteRole(params, success, token, error) {
    Http.post(Cmd.CMD_DELETE_ROLE, params, success, token, error);
  }

  static getUserRoleSelection(params, success, token, error) {
    Http.post(Cmd.CMD_GET_USER_ROLE_SELECTION, params, success, token, error);
  }

  static saveRolePower(params, success, token, error) {
    Http.post(Cmd.CMD_SAVE_ROLE_POWER, params, success, token, error);
  }

  static getDeviceList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DEVICE_LIST, params, success, token, error);
  }

  static getDoorSiteList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DOOR_SITE_LIST, params, success, token, error);
  }

  static getDoorList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DOOR_LIST, params, success, token, error);
  }

  static addFloor(params, success, token, error) {
    Http.post(Cmd.CMD_ADD_FLOOR, params, success, token, error);
  }

  static editFloor(params, success, token, error) {
    Http.post(Cmd.CMD_EDIT_FLOOR, params, success, token, error);
  }

  static deleteFloor(params, success, token, error) {
    Http.post(Cmd.CMD_DELETE_FLOOR, params, success, token, error);
  }

  static getSiteDeviceList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_SITE_DEVICE_LIST, params, success, token, error);
  }

  static addDoors(params, success, token, error) {
    Http.post(Cmd.CMD_ADD_DOORS, params, success, token, error);
  }

  static editDoor(params, success, token, error) {
    Http.post(Cmd.CMD_EDIT_DOOR, params, success, token, error);
  }

  static deleteDoor(params, success, token, error) {
    Http.post(Cmd.CMD_DELETE_DOOR, params, success, token, error);
  }

  static getSiteDoorList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_SITE_DOOR_LIST, params, success, token, error);
  }

  static editDevice(params, success, token, error) {
    Http.post(Cmd.CMD_EDIT_DEVICE, params, success, token, error);
  }

  static getDoorAllTypeList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DOOR_ALLTYPE_LIST, params, success, token, error);
  }

  static getDoorOutTypeList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DOOR_OUTTYPE_LIST, params, success, token, error);
  }

  static setDoorAllType(params, success, token, error) {
    Http.post(Cmd.CMD_SET_DOOR_ALL_TYPE, params, success, token, error);
  }

  static setDoorOutType(params, success, token, error) {
    Http.post(Cmd.CMD_SET_DOOR_OUT_TYPE, params, success, token, error);
  }

  static getFloorDoorList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_FLOOR_DOOR_LIST, params, success, token, error);
  }

  static addAssocFloor(params, success, token, error) {
    Http.post(Cmd.CMD_ADD_ASSOC_FLOOR, params, success, token, error);
  }

  static removeAssocFloor(params, success, token, error) {
    Http.post(Cmd.CMD_REMOVE_ASSOC_FLOOR, params, success, token, error);
  }

  static getHomeStat(params, success, token, error) {
    Http.post(Cmd.CMD_GET_HOME_STAT, params, success, token, error);
  }

  static getHomeData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_HOME_DATA, params, success, token, error);
  }

  static getHomeRealFlowData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_HOME_REALFLOW_DATA, params, success, token, error);
  }

  /**获取出入口列表 */
  static getCompareDoorListData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_COMPARE_DOORLIST_DATA, params, success, token, error);
  }

  /**获取出入口比较-出入口对比数据 */
  static getCompareDoorStatsData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_COMPARE_DOOR_STATS_DATA, params, success, token, error);
  }

  /**获取出入口比较-时间对比数据 */
  static getCompareTimeStatsData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_COMPARE_DATE_STATS_DATA, params, success, token, error);
  }

  /**获取出入口分析-出入口分析数据 */
  static getDoorAnalysisStatsData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DOOR_ANALYSIS_STATS, params, success, token, error);
  }

  /**获取楼层分析-楼层列表 */
  static getFloorList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_FLOOR_LIST, params, success, token, error);
  }

  /**获取楼层分析-楼层数据 */
  static getFloorData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_FLOOR_DATA, params, success, token, error);
  }

  /**获取顾客洞察-顾客洞察数据 */
  static getCustomerInsightData(params, success, token, error) {
    Http.post(Cmd.CMD_GET_CUSTOMER_INSIGHT_DATA, params, success, token, error);
  }

  /**场外分析-获取场地场外客流门口 */
  static getOffSenceAnalysisDoorList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_OFFSENCE_ANALYSIS_DOOR_LIST, params, success, token, error);
  }

  /**场外分析-场外分析数据 */
  static getOffSenceAnalysisStats(params, success, token, error) {
    Http.post(Cmd.CMD_GET_OFFSENCE_ANALYSIS_STATS, params, success, token, error);
  }

  /**场外分析-场外门口客流分析 */
  static getOffSenceDoorAnalysisFlow(params, success, token, error) {
    Http.post(Cmd.CMD_GET_OFFSENCE_DOOR_ANALYSIS_FLOW, params, success, token, error);
  }

  static getDailyStats(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DAILY_STATS, params, success, token, error);
  }

  static getWeeklyStats(params, success, token, error) {
    Http.post(Cmd.CMD_GET_WEEKLY_STATS, params, success, token, error);
  }

  static getMonthlyStats(params, success, token, error) {
    Http.post(Cmd.CMD_GET_MONTHLY_STATS, params, success, token, error);
  }

  static getAnnualStats(param, success, token, error) {
    Http.post(Cmd.CMD_GET_ANNUAL_STATS, param, success, token, error);
  }

  static setDefaultSite(params, success, token, error) {
    Http.post(Cmd.CMD_SET_DEFAULT_SITE, params, success, token, error);
  }

  static getDashboardSiteCfg(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DASHBOARD_SITE_CFG, params, success, token, error);
  }

  /**大屏预览-站点配置设置  */
  static setDashboardSiteCfg(params, success, token, error) {
    Http.post(Cmd.CMD_SET_DASHBOARD_SITE_CFG, params, success, token, error);
  }

  /***大屏预览-获取集团分析成员实时数据 */
  static getGroupAnalysisMember(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUPANALYSIS_MEMBER, params, success, token, error);
  }

  /**用户中心-更换头像  */
  static setUserIcon(params, success, token, error) {
    Http.post(Cmd.CMD_SET_USER_ICON, params, success, token, error);
  }

  /**用户中心-修改用户名  */
  static setUserName(params, success, token, error) {
    Http.post(Cmd.CMD_SET_USER_NAME, params, success, token, error);
  }

  /**用户中心-修改密码  */
  static setUserPassword(params, success, token, error) {
    Http.post(Cmd.CMD_SET_USER_PASSWORD, params, success, token, error);
  }

  /** 获取区域列表*/
  static getSiteAreas(params, success, token, error) {
    Http.post(Cmd.CMD_GET_SITE_AREAS, params, success, token, error);
  }

  /** 获取指定区域详情 */
  static getArea(params, success, token, error) {
    Http.post(Cmd.CMD_GET_AREA, params, success, token, error);
  }

  /** 新增区域 */
  static addArea(params, success, token, error) {
    Http.post(Cmd.CMD_ADD_AREA, params, success, token, error);
  }

  /** 编辑区域 */
  static editArea(params, success, token, error) {
    Http.post(Cmd.CMD_EDIT_AREA, params, success, token, error);
  }

  /** 删除区域 */
  static deleteAreas(params, success, token, error) {
    Http.post(Cmd.CMD_DELETE_AREA, params, success, token, error);
  }

  /** 获取区域出入口列表 */
  static getAreaDoors(params, success, token, error) {
    Http.post(Cmd.CMD_GET_AREA_DOORS, params, success, token, error);
  }

  /** 关联出入口到区域 */
  static addAssocDoor(params, success, token, error) {
    Http.post(Cmd.CMD_ADD_ASSOC_DOOR, params, success, token, error);
  }

  /** 解除出入口关联 */
  static removeAssocDoor(params, success, token, error) {
    Http.post(Cmd.CMD_REMOVE_ASSOC_DOOR, params, success, token, error);
  }

  /** 获取区域映射列表 */
  static getAreaMapping(params, success, token, error) {
    Http.post(Cmd.CMD_GET_AREA_MAPPING, params, success, token, error);
  }

  /** 设置区域映射 */
  static setAreaMapping(params, success, token, error) {
    Http.post(Cmd.CMD_SET_AREA_MAPPING, params, success, token, error);
  }

  /** 标签管理-获取标签列表-通州 */
  static getTagManagementGetTagList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_TAG_LIST, params, success, token, error);
  }

  /** 标签管理-获取标签关联场地-通州 */
  static getTagManagementGetAssocSites(params, success, token, error) {
    Http.post(Cmd.CMD_GET_ASSOC_SITES, params, success, token, error);
  }

  /** 场地分析-获取设备在线离线数量信息-通州 */
  static getDeviceOnlineInfo(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DEVICE_ONLINE_INFO, params, success, token, error);
  }

  /** 场地分析-获取场地趋势-通州 */
  static getFlowTrend(params, success, token, error) {
    Http.post(Cmd.CMD_GET_FLOW_TREND, params, success, token, error);
  }

  /** 场地分析-获取场地人群分析 -通州*/
  static getFaceTotal(params, success, token, error) {
    Http.post(Cmd.CMD_GET_FACE_TOTAL, params, success, token, error);
  }

  /** 场地分析-获取场地排行-通州 */
  static getSiteRanking(params, success, token, error) {
    Http.post(Cmd.CMD_GET_SITE_RANKING, params, success, token, error);
  }

  /** 场地分析-获取指定日期合计-通州 */
  static getFlowTotal(params, success, token, error) {
    Http.post(Cmd.CMD_GET_FLOW_TOTAL, params, success, token, error);
  }

  /** 场地分析-获取指定日期节假日人次-通州 */
  static getFestivalTotal(params, success, token, error) {
    Http.post(Cmd.CMD_GET_FESTIVAL_TOTAL, params, success, token, error);
  }

  /** 大屏预览-获取大屏模板列表  */
  static getDashboardList(params, success, token, error) {
    Http.post(Cmd.CMD_GET_DASHBOARD_LIST, params, success, token, error);
  }

  static getGroupAnalysis(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUPANALYSIS, params, success, token, error);
  }

  static getGroupCompareTrend(params, success, token, error) {
    Http.post(Cmd.CMD_GET_GROUPANALYSIS_COMPARE, params, success, token, error);
  }

  /** 区域映射-含图片上传（FormData） */
  static setAreaMappingFile(formData, success, token, error) {
    Http.postFile(Cmd.CMD_SET_AREA_MAPPING, formData, success, token, error);
  }
}
export default Http;
