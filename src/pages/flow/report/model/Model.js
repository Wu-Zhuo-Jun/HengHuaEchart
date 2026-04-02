import Constant from "@/common/Constant";
import DataConverter from "@/data/DataConverter";
import User from "@/data/UserData";
import StringUtils from "@/utils/StringUtils";
import TimeUtils from "@/utils/TimeUtils";

export const getCustomerAgeTableDataSource = (data, rangeType = "day") => {
  const startTime = data.startTime;
  const endTime = data.endTime;
  const faceFlow = data.list;
  const multipleDay = endTime - startTime >= 86400 ? true : false;
  const ageProps = ["yinger", "ertong", "shaonian", "qingnian", "zhuangnian", "zhonglaonian", "unknow"];
  const genderLength = 2;
  const tmpData = {
    gender: 0,
    [ageProps[0]]: 0,
    [ageProps[1]]: 0,
    [ageProps[2]]: 0,
    [ageProps[3]]: 0,
    [ageProps[4]]: 0,
    [ageProps[5]]: 0,
    [ageProps[6]]: 0,
  };

  const dataMap = {};

  for (let i = 0; i < faceFlow.length; i++) {
    let faceData = faceFlow[i];
    let gender = faceData.g;
    let age = faceData.a;
    let count = faceData.c;
    let dataTime = faceData.t;
    if (dataMap[dataTime] == null) {
      dataMap[dataTime] = new Array();
      for (let j = 0; j < genderLength; j++) {
        dataMap[dataTime].push({ ...tmpData, gender: j + 1, dataTime: dataTime });
      }
    }
    dataMap[dataTime][gender - 1][ageProps[age - 1]] += count;
  }
  let range = [];
  if (rangeType == "hour") {
    range = TimeUtils.getTsHourRangeByTs(startTime, endTime, "HH:mm");
  } else if (rangeType == "day") {
    range = TimeUtils.getTsDayRangeByTs(startTime, endTime, "MM-dd");
  } else if (rangeType == "month") {
    range = TimeUtils.getTsMonthRangeByTs(startTime, endTime, "yyyy-MM");
  } else if (rangeType == "minute") {
    range = TimeUtils.getTs5MinuteRangeByTs(startTime, endTime);
  }

  let dataSource = [];
  for (let i = 0; i < range.length; i++) {
    let dataTime = range[i];
    if (dataMap[dataTime]) {
      let rowDatas = dataMap[dataTime];
      for (let j = 0; j < rowDatas.length; j++) {
        let rowData = rowDatas[j];
        if (rangeType == "hour") {
          let endTime = dataTime + 3600;
          if (TimeUtils.ts2Date(dataTime, "HH") == "23") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        } else if (rangeType == "day") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM-dd");
        } else if (rangeType == "month") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM");
        } else if (rangeType == "minute") {
          let endTime = dataTime + 300; // 5分钟后
          // 如果是23:55，结束时间显示为24:00
          if (TimeUtils.ts2Date(dataTime, "HH:mm") === "23:55") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        }
        rowData.key = i * genderLength + j;
        dataSource.push(rowData);
      }
    } else {
      for (let j = 0; j < genderLength; j++) {
        let rowData = { ...tmpData, gender: j + 1, dataTime: dataTime };
        if (rangeType == "hour") {
          let endTime = dataTime + 3600;
          if (TimeUtils.ts2Date(dataTime, "HH") == "23") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        } else if (rangeType == "day") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM-dd");
        } else if (rangeType == "month") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM");
        } else if (rangeType == "minute") {
          let endTime = dataTime + 300; // 5分钟后
          // 如果是23:55，结束时间显示为24:00
          if (TimeUtils.ts2Date(dataTime, "HH:mm") === "23:55") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        }
        rowData.key = i * genderLength + j;
        dataSource.push(rowData);
      }
    }
  }
  return dataSource;
};

export const getCustomerMoodtableDataSource = (data, rangeType = "day") => {
  const startTime = data.startTime;
  const endTime = data.endTime;
  const faceFlow = data.list;
  const props = ["fennu", "beishang", "yanwu", "haipa", "jingya", "pingjing", "gaoxin", "kunhuo", "unknow"];
  const genderLength = 2;
  const tmpData = {
    gender: 0,
    inCount: 0,
    [props[0]]: 0,
    [props[1]]: 0,
    [props[2]]: 0,
    [props[3]]: 0,
    [props[4]]: 0,
    [props[5]]: 0,
    [props[6]]: 0,
    [props[7]]: 0,
    [props[8]]: 0,
  };

  const dataMap = {};

  for (let i = 0; i < faceFlow.length; i++) {
    let faceData = faceFlow[i];
    let gender = faceData.g;
    let face = faceData.f;
    let count = faceData.c;
    let dataTime = faceData.t;
    if (dataMap[dataTime] == null) {
      dataMap[dataTime] = new Array();
      for (let j = 0; j < genderLength; j++) {
        dataMap[dataTime].push({ ...tmpData, gender: j + 1, dataTime: dataTime });
      }
    }
    dataMap[dataTime][gender - 1].inCount += count;
    dataMap[dataTime][gender - 1][props[face - 1]] += count;
  }

  let range = [];
  if (rangeType == "hour") {
    range = TimeUtils.getTsHourRangeByTs(startTime, endTime, "HH:mm");
  } else if (rangeType == "day") {
    range = TimeUtils.getTsDayRangeByTs(startTime, endTime, "MM-dd");
  } else if (rangeType == "month") {
    range = TimeUtils.getTsMonthRangeByTs(startTime, endTime, "yyyy-MM");
  } else if (rangeType == "minute") {
    range = TimeUtils.getTs5MinuteRangeByTs(startTime, endTime);
  }

  let dataSource = [];
  for (let i = 0; i < range.length; i++) {
    let dataTime = range[i];
    if (dataMap[dataTime]) {
      let rowDatas = dataMap[dataTime];
      for (let j = 0; j < rowDatas.length; j++) {
        let rowData = rowDatas[j];
        if (rangeType == "hour") {
          let endTime = dataTime + 3600;
          if (TimeUtils.ts2Date(dataTime, "HH") == "23") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        } else if (rangeType == "day") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM-dd");
        } else if (rangeType == "month") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM");
        } else if (rangeType == "minute") {
          let endTime = dataTime + 300; // 5分钟后
          // 如果是23:55，结束时间显示为24:00
          if (TimeUtils.ts2Date(dataTime, "HH:mm") === "23:55") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        }
        rowData.key = i * genderLength + j;
        dataSource.push(rowData);
      }
    } else {
      for (let j = 0; j < genderLength; j++) {
        let rowData = { ...tmpData, gender: j + 1, dataTime: dataTime };
        if (rangeType == "hour") {
          let endTime = dataTime + 3600;
          if (TimeUtils.ts2Date(dataTime, "HH") == "23") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        } else if (rangeType == "day") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM-dd");
        } else if (rangeType == "month") {
          rowData.date = TimeUtils.ts2Date(dataTime, "yyyy-MM");
        } else if (rangeType == "minute") {
          let endTime = dataTime + 300; // 5分钟后
          // 如果是23:55，结束时间显示为24:00
          if (TimeUtils.ts2Date(dataTime, "HH:mm") === "23:55") {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - 24:00`;
          } else {
            rowData.date = `${TimeUtils.ts2Date(dataTime, "HH:mm")} - ${TimeUtils.ts2Date(endTime, "HH:mm")}`;
          }
        }
        rowData.key = i * genderLength + j;
        dataSource.push(rowData);
      }
    }
  }
  return dataSource;
};

export const getSiteFlowStatsData = (data, area) => {
  let curFlow = data.curFlow;
  let lastFlow = data.lastFlow;
  let sameFlow = data.sameFlow;
  let statsType = [Constant.FLOW_TYPE.IN_COUNT, Constant.FLOW_TYPE.IN_NUM, Constant.FLOW_TYPE.BATCH_COUNT];
  if (User.checkMasterPermission(Constant.MASTER_POWER.OUT_COUNT)) {
    statsType = [...statsType, Constant.FLOW_TYPE.OUT_COUNT];
  }
  statsType = [...statsType, Constant.FLOW_TYPE.OUTSIDE_COUNT, Constant.FLOW_TYPE.COLLECT_COUNT, Constant.FLOW_TYPE.IN_RATE];
  let statsData = [];
  for (let i = 0; i < statsType.length; i++) {
    let type = statsType[i];
    let item = { val: 0, qoq: 0, yoy: 0, type };
    let val = 0,
      curVal = 0,
      lastVal = 0,
      sameVal = 0;
    if (type == Constant.FLOW_TYPE.IN_COUNT) {
      curVal = Number(curFlow[Constant.PROP.IN_COUNT]);
      lastVal = Number(lastFlow[Constant.PROP.IN_COUNT]);
      if (sameFlow) {
        sameVal = Number(sameFlow[Constant.PROP.IN_COUNT]);
      }
      val = curVal;
    } else if (type == Constant.FLOW_TYPE.IN_NUM) {
      curVal = Number(curFlow[Constant.PROP.IN_NUM]);
      lastVal = Number(lastFlow[Constant.PROP.IN_NUM]);
      if (sameFlow) {
        sameVal = Number(sameFlow[Constant.PROP.IN_NUM]);
      }
      val = curVal;
    } else if (type == Constant.FLOW_TYPE.BATCH_COUNT) {
      curVal = Number(curFlow[Constant.PROP.BATCH_COUNT]);
      lastVal = Number(lastFlow[Constant.PROP.BATCH_COUNT]);
      if (sameFlow) {
        sameVal = Number(sameFlow[Constant.PROP.BATCH_COUNT]);
      }
      val = curVal;
    } else if (type == Constant.FLOW_TYPE.OUT_COUNT) {
      curVal = Number(curFlow[Constant.PROP.OUT_COUNT]);
      lastVal = Number(lastFlow[Constant.PROP.OUT_COUNT]);
      if (sameFlow) {
        sameVal = Number(sameFlow[Constant.PROP.OUT_COUNT]);
      }
      val = curVal;
    } else if (type == Constant.FLOW_TYPE.OUTSIDE_COUNT) {
      curVal = Number(curFlow[Constant.PROP.OS_IN_COUNT]) + Number(curFlow[Constant.PROP.OS_OUT_COUNT]);
      lastVal = Number(lastFlow[Constant.PROP.OS_IN_COUNT]) + Number(lastFlow[Constant.PROP.OS_OUT_COUNT]);
      if (sameFlow) {
        sameVal = Number(sameFlow[Constant.PROP.OS_IN_COUNT]) + Number(sameFlow[Constant.PROP.OS_OUT_COUNT]);
      }
      val = curVal;
    } else if (type == Constant.FLOW_TYPE.COLLECT_COUNT) {
      curVal = StringUtils.toFixed(Number(curFlow[Constant.PROP.IN_COUNT]) / area, 2);
      lastVal = StringUtils.toFixed(Number(lastFlow[Constant.PROP.IN_COUNT]) / area, 2);
      if (sameFlow) {
        sameVal = StringUtils.toFixed(Number(sameFlow[Constant.PROP.IN_COUNT]) / area, 2);
      }
      val = curVal;
    } else if (type == Constant.FLOW_TYPE.IN_RATE) {
      let curInCount = Number(curFlow[Constant.PROP.IN_COUNT]);
      let lastInCount = Number(lastFlow[Constant.PROP.IN_COUNT]);
      let curOutsideCount = Number(curFlow[Constant.PROP.OS_IN_COUNT]) + Number(curFlow[Constant.PROP.OS_OUT_COUNT]);
      let lastOutsideCount = Number(lastFlow[Constant.PROP.OS_IN_COUNT]) + Number(lastFlow[Constant.PROP.OS_OUT_COUNT]);
      if (sameFlow) {
        let sameInCount = Number(sameFlow[Constant.PROP.IN_COUNT]);
        let sameOutsideCount = Number(sameFlow[Constant.PROP.OS_IN_COUNT]) + Number(sameFlow[Constant.PROP.OS_OUT_COUNT]);
        sameVal = sameInCount > 0 ? (sameOutsideCount > 0 ? (sameInCount / sameOutsideCount) * 100 : 100) : 0;
      }
      curVal = curInCount > 0 ? (curOutsideCount > 0 ? (curInCount / curOutsideCount) * 100 : 100) : 0;
      lastVal = lastInCount > 0 ? (lastOutsideCount > 0 ? (lastInCount / lastOutsideCount) * 100 : 100) : 0;

      val = `${StringUtils.toFixed(curVal, 2)}%`;
    }
    item.qoq = DataConverter.calcGrowthRate(curVal, lastVal);
    if (sameFlow) {
      item.yoy = DataConverter.calcGrowthRate(curVal, sameVal);
    }
    item.val = val;
    statsData.push(item);
  }
  return statsData;
};
