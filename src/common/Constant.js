const Constant = {
  FLOW_TYPE: {
    IN_COUNT: "inCount",
    IN_NUM: "inNum",
    OUT_COUNT: "outCount",
    BATCH_COUNT: "batchCount",
    COLLECT_COUNT: "collectCount",
    OUTSIDE_COUNT: "outsideCount",
    IN_RATE: "inRate",
  },
  TIME_TYPE: {
    DATE: 0,
    TODAY: 1,
    WEEK: 2,
    MONTH: 3,
    YEAR: 4,
  },
  INTERVAL_TYPE: {
    HOUR: "hour",
    DAY: "day",
    MINUTE: "minute",
  },
  SORT: {
    ASC: "asc",
    DESC: "desc",
  },
  PAGE_SIZES: [12, 18, 24, 30, 36],
  PROP: {
    IN_COUNT: "inCount",
    IN_NUM: "inNum",
    OUT_COUNT: "outCount",
    OUT_NUM: "outNum",
    OS_OUT_COUNT: "osOutCount",
    OS_IN_COUNT: "osInCount",
    BATCH_COUNT: "batchCount",
    LAST_IN_COUNT: "lastInCount",
    LAST_IN_NUM: "lastInNum",
    LAST_BATCH_COUNT: "lastBatchCount",
    DOOR_NAME: "doorName",
    FACE: "f",
    AGE: "a",
    GENDER: "g",
    COUNT: "count",
  },
  MASTER_POWER: {
    IN_NUM: 10, //进场人数
    OUT_COUNT: 11, //出场次数
    OUTSIDE_COUNT: 12, //场外客流
    FACE_ATTR: 13, //人脸属性
    OVER_STORE_COUNT: 14, //过店客流
    DATA_VIEW: 15, //数据视图
    HOME_PAGE: {
      REALTIME_STAY_COUNT: 10090000, //实时在场人数
    },
    // OUTSIDE_ANALYSIS_PAGE: {
    //   OVER_STORE_FLOW: 11070600, // 外部分析-过店客流
    //   OUTSIDE_FLOW: 11070700, // 外部分析-场外客流
    // },
  },
  ROLE_POWER: {
    CONSOLE: 3,
    HOTSPOT: 4,
  },
};

export default Constant;
