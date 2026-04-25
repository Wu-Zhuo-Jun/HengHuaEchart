import { Language } from "@/language/LocaleContext";
// 大屏模块字典
export const dataViewMap = {
  0: { moduleLabel: "未知", value: undefined, type: 0, percentage: 0 },
  1: { moduleLabel: "楼层转化分析", value: "floorConversion", type: 1, percentage: 30 },
  2: { moduleLabel: "出入口客流数据", value: "entranceExit", type: 2, percentage: 30 },
  3: { moduleLabel: "节日客流情况", value: "holidayFlow", type: 3, percentage: 40 },
  4: { moduleLabel: "设备信息情况", value: "deviceInfo", type: 4, percentage: 20 },
  5: { moduleLabel: "客群画像分析", value: "customerPortrait", type: 5, percentage: 40 },
  6: { moduleLabel: "集团统计分析", value: "groupStatistics", type: 6, percentage: 40 },
};

// 通州大屏
export const TzDataViewMap = {
  0: { moduleLabel: "未知", value: undefined, type: 0, percentage: 0 },
  1: { moduleLabel: "楼层转化分析", value: "floorConversion", type: 1, percentage: 30 },
  2: { moduleLabel: "出入口客流数据", value: "entranceExit", type: 2, percentage: 30 },
  3: { moduleLabel: "节假日服务情况", value: "holidayFlow", type: 3, percentage: 40 },
  4: { moduleLabel: "设备状态", value: "deviceInfo", type: 4, percentage: 20 },
  5: { moduleLabel: "服务人群分析", value: "customerPortrait", type: 5, percentage: 40 },
  6: { moduleLabel: "服务热力排行榜", value: "groupStatistics", type: 6, percentage: 40 },
  7: { moduleLabel: "阵地数量", value: "fieldNumber", type: 7, percentage: 20 },
  8: { moduleLabel: "阵地服务实时趋势", value: "todayTrend", type: 8, percentage: 30 },
  9: { moduleLabel: "近7日工作日、周末分析", value: "recentSevenDays", type: 9, percentage: 35 },
  // 10: { moduleLabel: "当前统计客流数据", value: "dashboard", type: 10, percentage: 30 },
};

// 大屏模块字典反转
export const dataViewMapReverse = {
  floorConversion: 1,
  entranceExit: 2,
  holidayFlow: 3,
  deviceInfo: 4,
  customerPortrait: 5,
  groupStatistics: 6,
};

// 大屏模块组件百分比映射
export const percentageOptionsDict = {
  floorConversion: 30,
  entranceExit: 30,
  holidayFlow: 40,
  deviceInfo: 20,
  customerPortrait: 40,
  groupStatistics: 40,
};

// 年龄枚举
export const ageEnums = {
  1: { title: Language.YINGER, key: 1 },
  2: { title: Language.ERTONG, key: 2 },
  4: { title: Language.QINGNIAN, key: 4 },
  5: { title: Language.ZHUANGNIAN, key: 5 },
  6: { title: Language.ZHONGLAONIAN, key: 6 },
  7: { title: Language.WEIZHI, key: 7 },
};

// 性别枚举
export const genderEnums = {
  1: { title: Language.NAN, key: 1 },
  2: { title: Language.NV, key: 2 },
  // 3: { title: Language.WEIZHI, key: 3 },
};

// 表情枚举
export const faceEnums = {
  1: { title: Language.FENNU, key: 1 },
  2: { title: Language.KUNHUO, key: 2 },
  3: { title: Language.GAOXIN, key: 3 },
  4: { title: Language.PINGJING, key: 4 },
  5: { title: Language.JINGYA, key: 5 },
  6: { title: Language.HAIPA, key: 6 },
  7: { title: Language.YANWU, key: 7 },
  8: { title: Language.BEISHANG, key: 8 },
  9: { title: Language.WEIZHI, key: 9 },
};

// 节假日枚举
export const festivalNameMap = {
  yuandan: Language.YUANDAN,
  chunjie: Language.CHUNJIE,
  qingming: Language.QINGMINGJIE,
  laodong: Language.LAODONGJIE,
  duanwu: Language.DUANWUJIE,
  zhongqiu: Language.ZHONGQIUJIE,
  guoqing: Language.GUOQINGJIE,
  qingren: Language.QINGRENJIE,
  funv: Language.FUNVJIE,
  muqin: Language.MUQINJIE,
  ertong: Language.ERTONGJIE,
  fuqin: Language.FUQINJIE,
  qixi: Language.QIXIJIE,
  jiaoshi: Language.JIAOSHIJIE,
  wansheng: Language.WANSHENGJIE,
  shuangshiyi: Language.SHUANGSHIYI,
  dongzhi: Language.DONGZHI,
  shengdan: Language.SHENGDANJIE,
  shujia: Language.SHUJIA,
  hanjia: Language.HANJIA,
};

// 时间粒度跨度限制（单位：天）
export const timeGranuleSpanLimits = {
  hour: 14,
  day: 366,
  week: null, // 不设限
  month: null, // 不设限
};

// 时间粒度选项映射
export const timeSelectMap = [
  { value: "hour", label: "按小时" },
  { value: "day", label: "按天" },
  { value: "week", label: "按周" },
  { value: "month", label: "按月" },
];
