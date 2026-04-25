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
    let gender = faceData.gender;
    let age = faceData.age;
    let count = faceData.count;
    let dataTime = faceData.dataTime;
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
    let gender = faceData.gender;
    let face = faceData.face;
    let count = faceData.count;
    let dataTime = faceData.dataTime;
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