import Constant from "@/common/Constant";
import { Language, text } from "@/language/LocaleContext";
import ArrayUtils from "@/utils/ArrayUtils";
import StringUtils from "@/utils/StringUtils";
import TimeUtils from "@/utils/TimeUtils";
export default class DataConverter {
  static calcGrowthRate = (nVal, dVal) => {
    nVal = Number(nVal);
    dVal = Number(dVal);
    if (nVal == 0 && dVal == 0) {
      return 0;
    } else if (nVal > 0 && dVal == 0) {
      return 100;
    } else if (dVal > 0) {
      return StringUtils.toFixed(((nVal - dVal) / dVal) * 100, 2);
    }
    return 0;
  };

  static getFlowTypeParam = (type) => {
    switch (type) {
      case Constant.FLOW_TYPE.IN_COUNT:
      case Constant.FLOW_TYPE.OUT_COUNT:
      case Constant.FLOW_TYPE.OUTSIDE_COUNT:
        return Language.PARAM_RENCI;
      case Constant.FLOW_TYPE.IN_NUM:
        return Language.PARAM_RENSHU;
      case Constant.FLOW_TYPE.BATCH_COUNT:
        return Language.PARAM_PICI;
      case Constant.FLOW_TYPE.COLLECT_COUNT:
        return Language.PARAM_RENMEIPINGFANG;
      case Constant.FLOW_TYPE.IN_RATE:
        return Language.PARAM_BAIFENHAO;
      default:
        return "{value}";
    }
  };
  static getFlowTypeDesc = (value, type) => {
    return text(DataConverter.getFlowTypeParam(type), { value: value });
  };

  static getVisitingPeakConvertData = (type, data, textObject = null) => {
    if (data == null) {
      return;
    }
    const peakTimeArr = [
      text(Language.PARAM_LINGCHEN, { value: "(0:00-6:00)" }),
      text(Language.PARAM_ZAOSHANG, { value: "(6:00-11:00)" }),
      text(Language.PARAM_ZHONGWU, { value: "(11:00-14:00)" }),
      text(Language.PARAM_XIAWU, { value: "(14:00-17:00)" }),
      text(Language.PARAM_BANGWAN, { value: "(17:00-19:00)" }),
      text(Language.PARAM_WANSHANG, { value: "(19:00-24:00)" }),
    ];
    const zone = [5, 10, 13, 16, 18, 23];
    const workDays = Number(data.wkd);
    const weekendDays = Number(data.wkdd);
    const totalDays = workDays + weekendDays;
    const workAvgData = [];
    const weekendAvgData = [];
    const totalAvgData = [];
    const flowData = data.data;
    let xAxis = [];
    let convertData = {};

    for (let i = 0; i < flowData.length; i++) {
      let itemData = flowData[i];
      xAxis.push(`${i}:00`);
      let workDayInCount = Number(itemData.wkic);
      let weekendDayInCount = Number(itemData.wkdic);
      let totalDayInCount = workDayInCount + weekendDayInCount;
      let workDayInCountAvg = workDays ? Math.ceil(workDayInCount / workDays) : 0;
      workDayInCountAvg = workDayInCountAvg < 0 ? 0 : workDayInCountAvg;
      let weekendDayInCountAvg = weekendDays ? Math.ceil(weekendDayInCount / weekendDays) : 0;
      weekendDayInCountAvg = weekendDayInCountAvg < 0 ? 0 : weekendDayInCountAvg;
      let totalDayInCountAvg = totalDays ? Math.ceil(totalDayInCount / totalDays) : 0;
      totalDayInCountAvg = totalDayInCountAvg < 0 ? 0 : totalDayInCountAvg;
      workAvgData.push(workDayInCountAvg);
      weekendAvgData.push(weekendDayInCountAvg);
      totalAvgData.push(totalDayInCountAvg);
    }

    if (type == 1) {
      let workAvgPieData = [0, 0, 0, 0, 0, 0];
      let weekendAvgPieData = [0, 0, 0, 0, 0, 0];
      let totalAvgPieData = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < flowData.length; i++) {
        for (let j = 0; j < zone.length; j++) {
          if (i <= zone[j]) {
            workAvgPieData[j] += workAvgData[i];
            weekendAvgPieData[j] += weekendAvgData[i];
            totalAvgPieData[j] += totalAvgData[i];
            break;
          }
        }
      }
      let maxTotalValue = ArrayUtils.getMaxValue(totalAvgPieData);
      let index = totalAvgPieData.indexOf(maxTotalValue);
      let peakValueDesc = null;
      let peakTimeDesc = null;
      if (maxTotalValue > 0) {
        peakTimeDesc = text(Language.PARAM_GUKEDAOFANGGAOFENGSHIDUANZAI, { value: peakTimeArr[index] });
        peakValueDesc = text(Language.PARAM_GUKEDAOFANGGAOFENGZHI, { value: maxTotalValue });
      }
      convertData = {
        data1: workAvgPieData,
        data2: weekendAvgPieData,
        data3: totalAvgPieData,
        peakTimeDesc,
        peakValueDesc,
      };
    } else {
      let maxTotalValue = ArrayUtils.getMaxValue(totalAvgData);
      let index = totalAvgData.indexOf(maxTotalValue);
      let peakValueDesc = null;
      let peakTimeDesc = null;
      if (maxTotalValue > 0) {
        peakTimeDesc = text(textObject ? textObject.peakTimeDesc : Language.PARAM_GUKEDAOFANGGAOFENGSHIDUANZAI, { value: `${index}:00-${index}:59` });
        peakValueDesc = text(textObject ? textObject.peakValueDesc : Language.PARAM_GUKEDAOFANGGAOFENGZHI, { value: maxTotalValue });
      }
      var legend = [Language.GONGZUORIPINGJUNKELIU, Language.ZHOUMOPINGJUNKELIU, Language.ZHENGTIPINGJUNKELIU];
      convertData = {
        legend,
        xAxis,
        series: [workAvgData, weekendAvgData, totalAvgData],
        peakTimeDesc,
        peakValueDesc,
      };
    }

    return convertData;
  };

  static getDooorRankingConvertData = (data) => {
    let total = 0;
    let convertData = [];
    for (let i = 0; i < data.length; i++) {
      let doorData = data[i];
      let inCount = Number(doorData[Constant.PROP.IN_COUNT]);
      let inNum = Number(doorData[Constant.PROP.IN_NUM]);
      let batchCount = Number(doorData[Constant.PROP.BATCH_COUNT]);
      let lastInCount = Number(doorData[Constant.PROP.LAST_IN_COUNT]);
      let lastInNum = Number(doorData[Constant.PROP.LAST_IN_NUM]);
      let lastBatchCount = Number(doorData[Constant.PROP.LAST_BATCH_COUNT]);
      let door = {
        key: i,
        name: doorData[Constant.PROP.DOOR_NAME],
        inCount,
        inNum,
        batchCount,
        qoq: 0,
        ratio: 0,
      };
      door.qoq = StringUtils.toFixed(DataConverter.calcGrowthRate(inCount, lastInCount), 2);
      total += inCount;
      convertData.push(door);
    }
    convertData.map((item) => {
      item.ratio = total > 0 ? StringUtils.toFixed(Math.round((item.inCount / total) * 100), 2) : 0;
      return item;
    });
    convertData.sort((a, b) => {
      return b.inCount - a.inCount;
    });
    return convertData;
  };

  static getStayAnalysisConvertData = (data) => {
    const typeMap = {
      1: {
        interval: 300,
        format: "HH:mm",
      },
      2: {
        interval: 3600,
        format: "HH:00",
      },
    };
    let type = Number(data.type);
    let timeInterval = typeMap[type]?.interval || 0;
    let format = typeMap[type]?.format || "HH:mm";
    let startTime = Number(data.startTime);
    let endTime = Number(data.endTime);
    let xAxis = [];
    let stayAnalysisData = [];
    let series = [];
    let list = data.data;
    let days = Math.ceil((endTime + 1 - startTime) / 86400);
    endTime = startTime + 86399;
    let stayAnalysisDataMap = {};
    for (let i = 0; i < list.length; i++) {
      stayAnalysisDataMap[list[i].time] = list[i];
    }
    let nowDate = TimeUtils.ts2Date(Math.floor(TimeUtils.now() / timeInterval) * timeInterval, format);
    let add = true;
    while (startTime <= endTime) {
      let dtime = TimeUtils.ts2Date(startTime, format);
      xAxis.push(dtime);
      //未达当前时间的不显示
      if (add) {
        stayAnalysisData.push(stayAnalysisDataMap[dtime] ? stayAnalysisDataMap[dtime] : { time: dtime });
      }
      if (dtime == nowDate) {
        add = false;
      }
      startTime += timeInterval;
    }
    let inCount = 0;
    let outCount = 0;
    let maxStayCount = 0;
    let maxStayTimeIndex = 0;
    for (let i = 0; i < stayAnalysisData.length; i++) {
      let itemData = stayAnalysisData[i];
      let stayCount = 0;
      let pInCount = itemData.pInCount ? Number(itemData.pInCount) : 0;
      let pOutCount = itemData.pOutCount ? Number(itemData.pOutCount) : 0;
      inCount += pInCount;
      outCount += pOutCount;
      stayCount = inCount - outCount;
      stayCount = stayCount < 0 ? 0 : stayCount;
      stayCount = Math.ceil(stayCount / days);
      series.push(stayCount);
      if (stayCount > maxStayCount) {
        maxStayCount = stayCount;
        maxStayTimeIndex = i;
      }
    }
    const convertData = {
      xAxis,
      data: series,
      peakValue: maxStayCount,
      peakTimeDesc: xAxis[maxStayTimeIndex],
    };
    return convertData;
  };

  static getGrowthRateConvertData = (data, flowType = Constant.FLOW_TYPE.IN_COUNT) => {
    const FlowTypePropMap = {
      [Constant.FLOW_TYPE.IN_COUNT]: "ic",
      [Constant.FLOW_TYPE.IN_NUM]: "in",
      [Constant.FLOW_TYPE.BATCH_COUNT]: "bc",
    };
    let flowData = data.data;
    let d7FlowData = data.d7;
    let d14FlowData = data.d14;
    let d30FlowData = data.d30;
    let key = FlowTypePropMap[flowType];
    let convertData = [[], [], []];
    for (let i = 0; i < flowData.length; i++) {
      let data = flowData[i];
      let d7Data = d7FlowData[i];
      let d14Data = d14FlowData[i];
      let d30Data = d30FlowData[i];
      let dValue = Number(data[key]);
      let d7Value = Math.ceil(Number(d7Data[key]) / 7);
      let d14Value = Math.ceil(Number(d14Data[key]) / 14);
      let d30Value = Math.ceil(d30Data[key] / 30);
      let d7Rate = DataConverter.calcGrowthRate(dValue, d7Value);
      let d14Rate = DataConverter.calcGrowthRate(dValue, d14Value);
      let d30Rate = DataConverter.calcGrowthRate(dValue, d30Value);
      convertData[0].push(d7Rate);
      convertData[1].push(d14Rate);
      convertData[2].push(d30Rate);
    }
    return convertData;
  };

  static getCustomerAttrConvertData = (data) => {
    let ageAttrMap = {
      1: 0,
      2: 1,
      4: 2,
      5: 3,
      6: 4,
      7: 5,
    };
    let ageAttrArr = [Language.YINGER, Language.ERTONG, Language.QINGNIAN, Language.ZHUANGNIAN, Language.ZHONGLAONIAN, Language.WEIZHI];
    let genderArr = [0, 0, 0];
    let ageArr = [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let gender = Number(item.g);
      let age = Number(item.a);
      let count = Number(item.count);
      genderArr[gender - 1] += count;
      if (gender < 3) {
        //不计算未知性别
        ageArr[gender - 1][ageAttrMap[age]] += count;
      }
      total += count;
    }

    const maleTotal = genderArr[0]; // 男性总数
    const femaleTotal = genderArr[1]; // 女性总数
    let genderAll = maleTotal + femaleTotal;
    let maleRate = genderAll > 0 ? StringUtils.toFixed((maleTotal / genderAll) * 100, 2) : 0;
    let femaleRate = genderAll > 0 ? StringUtils.toFixed((10000 - maleRate * 100) / 100, 2) : 0;
    let maleMaxRate = 0;
    let femaleMaxRate = 0;
    let maleMaxDesc = null;
    let femaleMaxDesc = null;
    let maleMaxDescForDv = null;
    let femaleMaxDescForDv = null;
    let maleMax = ArrayUtils.getMaxValue(ageArr[0]);
    let femaleMax = ArrayUtils.getMaxValue(ageArr[1]);
    if (maleMax > 0 && total > 0) {
      maleMaxRate = StringUtils.toFixed((maleMax / total) * 100, 2);
      maleMaxDesc = `${ageAttrArr[ageArr[0].indexOf(maleMax)]}    ${Language.NAN}  ${Language.ZHANBI} ${StringUtils.toFixed(maleMaxRate, 0)}%`;
      maleMaxDescForDv = `${ageAttrArr[ageArr[0].indexOf(maleMax)]}  ${Language.NAN}`;
    }
    if (femaleMax > 0 && total > 0) {
      femaleMaxRate = StringUtils.toFixed((femaleMax / total) * 100, 2);
      femaleMaxDesc = `${ageAttrArr[ageArr[1].indexOf(femaleMax)]}    ${Language.NV}  ${Language.ZHANBI} ${StringUtils.toFixed(femaleMaxRate, 0)}%`;
      femaleMaxDescForDv = `${ageAttrArr[ageArr[1].indexOf(femaleMax)]}  ${Language.NV}`;
    }
    const seriesData = [
      { name: Language.NAN, data: ageArr[0] },
      { name: Language.NV, data: ageArr[1] },
    ];
    const convertData = {
      seriesData,
      maleMaxRate,
      femaleMaxRate,
      maleMaxDesc,
      femaleMaxDesc,
      maleRate,
      femaleRate,
      maleTotal,
      femaleTotal,
      yAxis: ageAttrArr,
      maleMaxDescForDv,
      femaleMaxDescForDv,
    };
    return convertData;
  };

  static getCustomerMoodConvertData = (data) => {
    const legendData = [Language.NAN, Language.NV, Language.WEIZHI];
    const indicatorData = [Language.FENNU, Language.BEISHANG, Language.YANWU, Language.HAIPA, Language.JINGYA, Language.PINGJING, Language.GAOXIN, Language.KUNHUO, Language.WEIZHI];
    let genderArr = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    let total = 0;
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      let gender = Number(item[Constant.PROP.GENDER]);
      let mood = Number(item[Constant.PROP.FACE]);
      let count = Number(item[Constant.PROP.COUNT]);
      genderArr[gender - 1][mood - 1] += count;
      total += count;
    }

    let maleMaxRate = 0;
    let femaleMaxRate = 0;
    let maleMaxDesc = null;
    let femaleMaxDesc = null;
    let maleMax = ArrayUtils.getMaxValue(genderArr[0]);
    let femaleMax = ArrayUtils.getMaxValue(genderArr[1]);
    if (maleMax > 0 && total > 0) {
      maleMaxRate = (maleMax / total) * 100;
      if (maleMaxRate % 1 !== 0) {
        maleMaxRate = Number(maleMaxRate.toFixed(0));
      }
      maleMaxDesc = `${indicatorData[genderArr[0].indexOf(maleMax)]}    ${Language.NAN}  ${Language.ZHANBI} ${maleMaxRate}%`;
    }
    if (femaleMax > 0 && total > 0) {
      femaleMaxRate = (femaleMax / total) * 100;
      if (femaleMaxRate % 1 !== 0) {
        femaleMaxRate = Number(femaleMaxRate.toFixed(0));
      }
      femaleMaxDesc = `${indicatorData[genderArr[1].indexOf(femaleMax)]}    ${Language.NV}  ${Language.ZHANBI} ${femaleMaxRate}%`;
    }
    let convertData = {
      legendData,
      indicatorData,
      maleMaxDesc,
      femaleMaxDesc,
      seriesData: genderArr,
    };
    return convertData;
  };

  static getCustomerDataSumConverData = (data) => {
    const faceDataMap = {};
    for (let i = 0; i < data.length; i++) {
      const dataItem = data[i];
      const face = dataItem.f;
      const age = dataItem.a;
      const gender = dataItem.g;
      const count = dataItem.c;
      const key = `${gender}_${age}_${face}`;
      if (!faceDataMap[key]) {
        faceDataMap[key] = {
          f: face,
          a: age,
          g: gender,
          count: 0,
        };
      }
      faceDataMap[key].count += count;
    }
    const faceData = Object.values(faceDataMap);
    return faceData;
  };

  // 客户属性（出入口对比、出入口分析）
  static getCustomerAttrHandleData = (data) => {
    const groupDataByAgeAndGender = (data) => {
      let maleData = [0, 0, 0, 0, 0, 0];
      let femaleData = [0, 0, 0, 0, 0, 0];
      data.forEach((item) => {
        let age = item.age;
        let gender = item.gender;
        let count = item.count;
        if (gender === 1) {
          age === 1
            ? (maleData[0] = maleData[0] + count)
            : age === 2
            ? (maleData[1] = maleData[1] + count)
            : // : age === 3
            // ? (maleData[2] = maleData[2] + count)
            age === 4
            ? (maleData[2] = maleData[2] + count)
            : age === 5
            ? (maleData[3] = maleData[3] + count)
            : age === 6
            ? (maleData[4] = maleData[4] + count)
            : (maleData[5] = maleData[5] + count);
        } else if (gender === 2) {
          age === 1
            ? (femaleData[0] = femaleData[0] + count)
            : age === 2
            ? (femaleData[1] = femaleData[1] + count)
            : // : age === 3
            // ? (femaleData[2] = femaleData[2] + count)
            age === 4
            ? (femaleData[2] = femaleData[2] + count)
            : age === 5
            ? (femaleData[3] = femaleData[3] + count)
            : age === 6
            ? (femaleData[4] = femaleData[4] + count)
            : (femaleData[5] = femaleData[5] + count);
        }
      });
      return { maleData, femaleData };
    };
    return groupDataByAgeAndGender(data);
  };

  // 客户心情（出入口对比、出入口分析）
  static getCustomerMoodHandleData = (data) => {
    // face 1.愤怒 2.悲伤 3.厌恶 4.害怕 5.惊讶 6.平静 7.高兴 8.困惑 9.未知
    let faceMoodMap = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      7: 6,
      8: 7,
      9: 8,
    };
    // 根据 face和gender 分类数据
    const groupDataByFaceAndGender = (data) => {
      let maleData = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      let femaleData = [0, 0, 0, 0, 0, 0, 0, 0, 0];
      let unknowData = [0, 0, 0, 0, 0, 0, 0, 0, 0];

      data.forEach((item) => {
        let face = item.face;
        let gender = item.gender;
        let count = item.count;
        if (gender === 1) {
          maleData[faceMoodMap[face]] = maleData[faceMoodMap[face]] + count;
        } else if (gender === 2) {
          femaleData[faceMoodMap[face]] = femaleData[faceMoodMap[face]] + count;
        } else {
          unknowData[faceMoodMap[face]] = unknowData[faceMoodMap[face]] + count;
        }
      });
      return { maleData, femaleData, unknowData };
    };
    return groupDataByFaceAndGender(data);
  };
}
