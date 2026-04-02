import { Language, text } from "../language/LocaleContext";
import TimeUtils from "./TimeUtils";
import TableUtils from "./TableUtils";
import ArrayUtils from "./ArrayUtils";
import Constant from "../common/Constant";
import Config from "../config/Config";
import { message } from "antd";

class DemoUtils {
  static messageInfo(msg) {
    message.info(msg);
  }

  static getIndicaterTypes = () => {
    // 进入人次 进入人数 客流批次 出人次
    return ["inCount", "inNum", "batchCount", "outCount", "outsideCount", "collectCount", "inRate"];
  };

  static getFlowStatsData = () => {
    let indicaterTypes = DemoUtils.getIndicaterTypes();
    let data = new Array();
    for (let i = 0; i < indicaterTypes.length; i++) {
      let item = {
        val: Math.ceil(Math.random() * 1000),
        qoq: Math.ceil(Math.random() * 10),
        yoy: Math.ceil(Math.random() * 10),
        type: indicaterTypes[i],
      };
      data.push(item);
    }
    return data;
  };

  static getFloorTransFormData = () => {
    var data = {
      converData: [
        { value: 100, name: "1F" },
        { value: 500, name: "2F" },
        { value: 50, name: "3F" },
        { value: 100, name: "4F" },
        { value: 200, name: "5F" },
      ],
      arriveData: {
        yAxis: ["1F", "2F", "3F", "4F", "5F"],
        data: [100, 500, 50, 100, 200],
      },
    };
    return data;
  };

  static getVisitingPeakData = (type = 1) => {
    if (type == 1) {
      var data1 = [
        Math.ceil(Math.random() * 6500), // 凌晨
        Math.ceil(Math.random() * 16000), // 早上
        Math.ceil(Math.random() * 30000), // 中午
        Math.ceil(Math.random() * 38000), // 下午
        Math.ceil(Math.random() * 52000), // 傍晚
        Math.ceil(Math.random() * 25000), // 晚上
      ];
      var data2 = [
        Math.ceil(Math.random() * 6500), // 凌晨
        Math.ceil(Math.random() * 16000), // 早上
        Math.ceil(Math.random() * 30000), // 中午
        Math.ceil(Math.random() * 38000), // 下午
        Math.ceil(Math.random() * 52000), // 傍晚
        Math.ceil(Math.random() * 25000), // 晚上
      ];
      var data3 = [
        Math.ceil(Math.random() * 6500), // 凌晨
        Math.ceil(Math.random() * 16000), // 早上
        Math.ceil(Math.random() * 30000), // 中午
        Math.ceil(Math.random() * 38000), // 下午
        Math.ceil(Math.random() * 52000), // 傍晚
        Math.ceil(Math.random() * 25000), // 晚上
      ];

      let peakTimeDesc = text(Language.PARAM_GUKEDAOFANGGAOFENGSHIDUANZAI, { value: text(Language.PARAM_ZAOSHANG, { value: "6:00-10:00" }) });
      let peakValueDesc = text(Language.PARAM_GUKEDAOFANGGAOFENGZHI, { value: 1000 });
      return { data1, data2, data3, peakTimeDesc, peakValueDesc };
    } else if (type == 2) {
      var xAxis = new Array();
      var yAxis1 = new Array();
      var yAxis2 = new Array();
      var yAxis3 = new Array();
      for (let i = 1; i <= 24; i++) {
        xAxis.push(`${i}:00`);
        yAxis1.push(Math.ceil(Math.random() * 1000));
        yAxis2.push(Math.ceil(Math.random() * 1000));
        yAxis3.push(Math.ceil(Math.random() * 1000));
      }
      var legend = [Language.GONGZUORIPINGJUNKELIU, Language.ZHOUMOPINGJUNKELIU, Language.ZHENGTIPINGJUNKELIU];
      var series = [yAxis1, yAxis2, yAxis3];
      let peakTimeDesc = text(Language.PARAM_GUKEDAOFANGGAOFENGSHIDUANZAI, { value: text(Language.PARAM_ZAOSHANG, { value: "6:00-10:00" }) });
      let peakValueDesc = text(Language.PARAM_GUKEDAOFANGGAOFENGZHI, { value: 1000 });
      let data = {
        legend,
        xAxis,
        series,
        peakTimeDesc,
        peakValueDesc,
      };
      return data;
    }
  };

  static getDoorRankingData = () => {
    var rosePieData = [
      { value: 1000, name: "1F-门口1" },
      { value: 1000, name: "1F-门口2" },
      { value: 1000, name: "1F-门口3" },
      { value: 1000, name: "2F-门口1" },
      { value: 1000, name: "2F-门口2" },
      { value: 1000, name: "2F-门口3" },
      { value: 1000, name: "3F-门口1" },
      { value: 1000, name: "3F-门口2" },
      { value: 1000, name: "3F-门口3" },
      { value: 1000, name: "4F-门口1" },
      { value: 1000, name: "4F-门口2" },
      { value: 1000, name: "5F-门口1" },
      { value: 1000, name: "5F-门口2" },
    ];
    var columns = new Array();
    columns.push({ title: Language.PAIMING, key: "ranking" });
    columns.push({ title: Language.CHURUKOU, key: "name" });
    columns.push({ title: Language.JINCHANGRENCI, key: "pInCount" });
    columns.push({ title: Language.JINCHANGRENSHU, key: "pInNum" });
    columns.push({ title: Language.KELIUPICI, key: "batchCount" });
    columns.push({ title: Language.HUANBI, key: "qoq" });
    var header = [Language.PAIMING, Language.CHURUKOU, Language.JINCHANGRENCI, Language.JINCHANGRENSHU, Language.KELIUPICI, Language.HUANBI];
    var list = [
      { key: 1, name: "1F-门口122", pInCount: 1000, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 2, name: "1F-门口", pInCount: 800, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 3, name: "1F-门口32", pInCount: 700, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 4, name: "2F-门口1", pInCount: 600, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 5, name: "2F-门口2", pInCount: 600, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 6, name: "2F-门口3", pInCount: 500, pInNum: 100, batchCount: 200, qoq: -5 },
      { key: 7, name: "2F-门口422", pInCount: 100, pInNum: 100, batchCount: 200, qoq: -10 },
      { key: 8, name: "2F-门口52", pInCount: 110, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 9, name: "2F-门口6", pInCount: 600, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 10, name: "2F-门口7", pInCount: 52, pInNum: 100, batchCount: 200, qoq: 5 },
      { key: 11, name: "2F-门口8", pInCount: 880, pInNum: 100, batchCount: 200, qoq: 5 },
    ];
    var ranking = { columns, list };
    return { chartData: rosePieData, ranking: ranking };
  };

  static getStayAnalysisData = () => {
    let xAxis = new Array();
    let yAxis = new Array();
    for (let i = 1; i <= 24; i++) {
      xAxis.push(`${i}:00`);
      yAxis.push(Math.ceil(Math.random() * 1000));
    }
    let peakValue = 1000;
    let peakTimeDesc = text(Language.PARAM_ZAOSHANG, { value: "6:00-10:00" });
    let data = { xAxis: xAxis, data: yAxis, peakValue: peakValue, peakTimeDesc: peakTimeDesc };
    return data;
  };

  static getGrowthRateData = (type = 1, startTime, endTime) => {
    if (type == "bar") {
      var growthRateData = {
        xAxis: [TimeUtils.ts2Date(startTime, "MM-dd")],
        data1: [80],
        data2: [90],
        data3: [70],
        type: type,
      };
      return growthRateData;
    } else if (type == "line") {
      let range = TimeUtils.getDateRangeByTs(startTime, endTime, 86400, "MM-dd");
      let xAxis = [];
      let data1 = [];
      let data2 = [];
      let data3 = [];
      for (let i = 0; i < range.length; i++) {
        xAxis.push(range[i]);
        data1.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
        data2.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
        data3.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
      }
      let growthRateData = {
        xAxis,
        data1,
        data2,
        data3,
        type,
      };
      return growthRateData;
    }
  };

  static getAnnualGrowthRateData = (yearTime) => {
    let range = [
      Language.YIYUE,
      Language.ERYUE,
      Language.SANYUE,
      Language.SIYUE,
      Language.WUYUE,
      Language.LIUYUE,
      Language.QIYUE,
      Language.BAYUE,
      Language.JIUYUE,
      Language.SHIYUE,
      Language.SHIYIYUE,
      Language.SHIERYUE,
    ];
    let xAxis = [];
    let data1 = [];
    let data2 = [];
    let data3 = [];
    for (let i = 0; i < range.length; i++) {
      xAxis.push(range[i]);
      data1.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
      data2.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
      data3.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
    }
    let growthRateData = {
      xAxis,
      data1,
      data2,
      data3,
      type: "line",
      names: [Language.GUOQUQIYUE, Language.GUOQUSHISIYUE, Language.GUOQUSANSHIYUE],
    };
    return growthRateData;
  };

  static getCustomerAttrData = () => {
    var customerAttr = {
      maleData: [20, 302, 400, 300, 50, 70, 100],
      femaleData: [10, 100, 60, 300, 150, 30, 40],
    };
    return customerAttr;
  };

  static getCustomerMoodData = () => {
    var customerMood = {
      unknowData: [
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
      ],
      maleData: [
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
      ],
      femaleData: [
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
        Math.ceil(Math.random() * 100),
      ],
    };
    return customerMood;
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
    return text(DemoUtils.getFlowTypeParam(type), { value: value });
  };

  static getTsInterval = (timeType) => {
    switch (timeType) {
      case Constant.INTERVAL_TYPE.HOUR:
        return 3600;
      case Constant.INTERVAL_TYPE.DAY:
        return 86400;
      case Constant.INTERVAL_TYPE.MINUTE:
        return 300;
      default:
        return 3600;
    }
  };

  static getFormatByIntervalType = (invervalType) => {
    switch (invervalType) {
      case Constant.INTERVAL_TYPE.HOUR:
      case Constant.INTERVAL_TYPE.MINUTE:
        return "HH:mm";
      case Constant.INTERVAL_TYPE.DAY:
        return "MM-dd";
      default:
        return "HH:mm";
    }
  };

  static getFlowTrendAnalysisData = (startTime, endTime, intervalType = Constant.INTERVAL_TYPE.HOUR, flowType = Constant.FLOW_TYPE.IN_COUNT) => {
    var xAxis = new Array();
    var data1 = new Array();
    var data2 = new Array();
    var data3 = new Array();
    var interval = this.getTsInterval(intervalType);
    var format = this.getFormatByIntervalType(intervalType);
    var timeRange = TimeUtils.getDateRangeByTs(startTime, endTime, interval, format);
    var days = TimeUtils.getDaysDiffByTs(startTime, endTime);
    for (let i = 0; i < timeRange.length; i++) {
      xAxis.push(timeRange[i]);
      data1.push(Math.ceil(Math.random() * 1000));
      if (days < 1) {
        data2.push(Math.ceil(Math.random() * 1000));
        data3.push(Math.ceil(Math.random() * 1000));
      }
    }
    var avg = Math.ceil(ArrayUtils.getAverageValue(data1));
    var sortArr = JSON.parse(JSON.stringify(data1));
    var medianValue = Math.ceil(ArrayUtils.getMedianValue(sortArr), Constant.SORT.ASC);
    var maxValue = Math.ceil(ArrayUtils.getMaxValue(data1));
    var peakValueDesc = this.getFlowTypeDesc(maxValue, flowType);
    var avgDesc = this.getFlowTypeDesc(avg, flowType);
    var medianDesc = this.getFlowTypeDesc(medianValue, flowType);
    var series = [
      { name: Language.JINRI, data: data1 },
      { name: Language.ZUORI, data: data2 },
      { name: Language.SHANGZHOUTONGQI, data: data3 },
    ];
    var chartData = {
      xAxis: xAxis,
      series: series,
      avg: avg,
      dataZoom: intervalType == Constant.INTERVAL_TYPE.MINUTE ? 1 : 0,
    };
    var info = {
      date: TimeUtils.ts2Date(TimeUtils.now(), "yyyy-MM-dd"),
      peakValueDesc: peakValueDesc,
      peakTime: "10:00-11:00",
      avgDesc: avgDesc,
      medianDesc: medianDesc,
      weather: "晴",
    };
    var data = {
      info,
      chartData,
      type: 1,
    };
    return data;
  };

  static getWeeklyFlowTrendAnalysisData = (startTime, endTime, flowType = Constant.FLOW_TYPE.IN_COUNT) => {
    var xAxis = new Array();
    var data1 = new Array();
    var data2 = new Array();
    var data3 = new Array();
    var interval = this.getTsInterval(Constant.INTERVAL_TYPE.DAY);
    var format = this.getFormatByIntervalType(Constant.INTERVAL_TYPE.DAY);
    var timeRange = TimeUtils.getDateRangeByTs(startTime, endTime, interval, format);
    for (let i = 0; i < timeRange.length; i++) {
      xAxis.push(timeRange[i]);
      data1.push(Math.ceil(Math.random() * 1000));
      data2.push(Math.ceil(Math.random() * 1000));
      data3.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
    }
    var avg = Math.ceil(ArrayUtils.getAverageValue(data1));
    var sortArr = JSON.parse(JSON.stringify(data1));
    var medianValue = Math.ceil(ArrayUtils.getMedianValue(sortArr), Constant.SORT.ASC);
    var maxValue = Math.ceil(ArrayUtils.getMaxValue(data1));
    var peakValueDesc = this.getFlowTypeDesc(maxValue, flowType);
    var avgDesc = this.getFlowTypeDesc(avg, flowType);
    var medianDesc = this.getFlowTypeDesc(medianValue, flowType);
    // var series = [
    //     { name: Language.JINRI, data: data1 },
    //     { name: Language.ZUORI, data: data2 },
    //     { name: Language.SHANGZHOUTONGQI, data: data3 }
    // ];
    var chartData = {
      xAxis,
      data1,
      data2,
      data3,
      avg,
    };
    var info = {
      date: TimeUtils.ts2Date(TimeUtils.now(), "yyyy-MM-dd"),
      peakValueDesc: peakValueDesc,
      peakTime: "10:00-11:00",
      avgDesc: avgDesc,
      medianDesc: medianDesc,
      weather: "晴",
      names: [Language.BENZHOU, Language.SHANGZHOU, Language.HUANBI],
    };
    var data = {
      info,
      chartData,
      type: 2,
    };
    return data;
  };

  static getMonthlyFlowTrendAnalysisData = (startTime, endTime, flowType = Constant.FLOW_TYPE.IN_COUNT) => {
    var xAxis = new Array();
    var data1 = new Array();
    var data2 = new Array();
    var data3 = new Array();
    var interval = this.getTsInterval(Constant.INTERVAL_TYPE.DAY);
    var format = this.getFormatByIntervalType(Constant.INTERVAL_TYPE.DAY);
    var timeRange = TimeUtils.getDateRangeByTs(startTime, endTime, interval, format);
    for (let i = 0; i < timeRange.length; i++) {
      xAxis.push(timeRange[i]);
      data1.push(Math.ceil(Math.random() * 1000));
      data2.push(Math.ceil(Math.random() * 1000));
      data3.push(Math.ceil(Math.random() * 1000));
    }
    var avg = Math.ceil(ArrayUtils.getAverageValue(data1));
    var sortArr = JSON.parse(JSON.stringify(data1));
    var medianValue = Math.ceil(ArrayUtils.getMedianValue(sortArr), Constant.SORT.ASC);
    var maxValue = Math.ceil(ArrayUtils.getMaxValue(data1));
    var peakValueDesc = this.getFlowTypeDesc(maxValue, flowType);
    var avgDesc = this.getFlowTypeDesc(avg, flowType);
    var medianDesc = this.getFlowTypeDesc(medianValue, flowType);
    var series = [
      { name: Language.BENYUE, data: data1 },
      { name: Language.SHANGYUE, data: data2 },
      { name: Language.QUNIANTONGYUE, data: data3 },
    ];
    var chartData = {
      xAxis,
      series,
      avg,
    };
    var info = {
      date: TimeUtils.ts2Date(TimeUtils.now(), "yyyy-MM-dd"),
      peakValueDesc: peakValueDesc,
      peakTime: "10:00-11:00",
      avgDesc: avgDesc,
      medianDesc: medianDesc,
      // weather: '晴',
    };
    var data = {
      info,
      chartData,
      type: 1,
    };
    return data;
  };
  static getAnnualFlowTrendAnalysisData = (startTime, flowType = Constant.FLOW_TYPE.IN_COUNT) => {
    var xAxis = new Array();
    var data1 = new Array();
    var data2 = new Array();
    var data3 = new Array();
    var timeRange = [
      Language.YIYUE,
      Language.ERYUE,
      Language.SANYUE,
      Language.SIYUE,
      Language.WUYUE,
      Language.LIUYUE,
      Language.QIYUE,
      Language.BAYUE,
      Language.JIUYUE,
      Language.SHIYUE,
      Language.SHIYIYUE,
      Language.SHIERYUE,
    ];
    for (let i = 0; i < timeRange.length; i++) {
      xAxis.push(timeRange[i]);
      data1.push(Math.ceil(Math.random() * 1000));
      data2.push(Math.ceil(Math.random() * 1000));
      data3.push(Math.ceil(Math.random() * 100 * (Math.ceil(Math.random() * 2) > 1 ? 1 : -1)));
    }
    var avg = Math.ceil(ArrayUtils.getAverageValue(data1));
    var sortArr = JSON.parse(JSON.stringify(data1));
    var medianValue = Math.ceil(ArrayUtils.getMedianValue(sortArr), Constant.SORT.ASC);
    var maxValue = Math.ceil(ArrayUtils.getMaxValue(data1));
    var peakValueDesc = this.getFlowTypeDesc(maxValue, flowType);
    var avgDesc = this.getFlowTypeDesc(avg, flowType);
    var medianDesc = this.getFlowTypeDesc(medianValue, flowType);
    // var series = [
    //     { name: Language.BENNIAN, data: data1 },
    //     { name: Language.SHANGNIAN, data: data2 },
    //     { name: Language.HUANBI, data: data3 }
    // ];
    var chartData = {
      xAxis,
      data1,
      data2,
      data3,
      avg,
      names: [Language.BENNIAN, Language.SHANGNIAN, Language.HUANBI],
    };
    var info = {
      date: `${TimeUtils.ts2Date(startTime, "yyyy-01-01")} ${Language.ZHI} ${TimeUtils.ts2Date(startTime, "yyyy-12-30")}`,
      peakValueDesc: peakValueDesc,
      peakTime: TimeUtils.ts2Date(startTime, "yyyy-MM"),
      avgDesc: avgDesc,
      medianDesc: medianDesc,
      // weather: '晴',
    };
    var data = {
      info,
      chartData,
      type: 2,
    };
    return data;
  };

  static getFlowDetailsData = () => {
    let columns = [
      {
        title: Language.RIQI,
        key: "date",
        dataIndex: "date",
        align: "center",
        render: (text, record, index) => (
          <div>
            {TimeUtils.ts2Date(record.date, "HH:mm")}-{TimeUtils.ts2Date(record.date + 3600, "HH:mm")}
          </div>
        ),
        showSorterTooltip: false,
        sorter: (a, b) => a.date - b.date,
      },
      { title: Language.SUOSHUJITUAN, key: "groupName", dataIndex: "groupName", align: "center" },
      { title: Language.JINCHANGRENCI, key: "inCount", dataIndex: "inCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.inCount - b.inCount },
      { title: Language.JINCHANGRENSHU, key: "inNum", dataIndex: "inNum", align: "center", showSorterTooltip: false, sorter: (a, b) => a.inNum - b.inNum },
      { title: Language.KELIUPICI, key: "batchCount", dataIndex: "batchCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.batchCount - b.batchCount },
      { title: Language.JIKELIPINGFANG, key: "collectCount", dataIndex: "collectCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.collectCount - b.collectCount },
      { title: Language.CHANGWAIKELIU, key: "outsideCount", dataIndex: "outsideCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.outsideCount - b.outsideCount },
      { title: Language.JINCHANGLV, key: "inRate", dataIndex: "inRate", align: "center", showSorterTooltip: false, sorter: (a, b) => a.inRate - b.inRate },
    ];
    let groupList = [
      { key: 1, groupName: "集团1", date: "00:00-01:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 2, groupName: "集团2", date: "01:00-02:00", inCount: 900, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 3, groupName: "集团3", date: "02:00-03:00", inCount: 800, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 4, groupName: "集团4", date: "03:00-04:00", inCount: 700, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 5, groupName: "集团5", date: "04:00-05:00", inCount: 600, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 6, groupName: "集团6", date: "05:00-06:00", inCount: 500, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 7, groupName: "集团7", date: "06:00-07:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 8, groupName: "集团8", date: "07:00-08:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 9, groupName: "集团9", date: "08:00-09:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 10, groupName: "集团10", date: "09:00-10:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 11, groupName: "集团11", date: "10:00-11:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 12, groupName: "集团12", date: "11:00-12:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 13, groupName: "集团13", date: "12:00-13:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 14, groupName: "集团14", date: "13:00-14:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 15, groupName: "集团15", date: "14:00-15:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 16, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 17, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 18, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 19, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 20, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 21, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 22, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 23, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 24, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 25, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 26, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 27, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
      { key: 28, groupName: "集团16", date: "15:00-16:00", inCount: 1000, inNum: 1000, batchCount: 1000, collectCount: 1000, inRate: 1000, outsideCount: 1000 },
    ];
    let timeStamp = 1746028800;
    groupList.map((item, index) => {
      item.date = timeStamp;
      timeStamp += 3600;
    });
    return { columns, dataSource: groupList };
  };

  static getCustomerAgeTableData = () => {
    let columns = [
      // {
      //   title: Language.RIQI,
      //   key: "date",
      //   dataIndex: "date",
      //   align: "center",
      //   width: "150px",
      //   render: (text, record, index) => (
      //     <div>
      //       {TimeUtils.ts2Date(record.date, "HH:mm")}-{TimeUtils.ts2Date(record.date + 3600, "HH:mm")}
      //     </div>
      //   ),
      //   showSorterTooltip: false,
      //   sorter: (a, b) => a.date - b.date,
      //   onCell: (record, index) => ({ rowSpan: record._rowSpan }),
      // },
      // {title:Language.RIQI,key:'date',dataIndex:'date',align:'center',onCell:(record,index)=>({rowSpan:record.rowSpan})},
      { title: Language.SUOSHUJITUAN, key: "groupName", dataIndex: "groupName", align: "center", onCell: (record, index) => ({ rowSpan: record._rowSpan }) },
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        align: "center",
        render: (value) => {
          let gender = Language.NAN;
          if (value == 2) {
            gender = Language.NV;
          } else if (value == 3) {
            gender = Language.WEIZHI;
          }
          return <div>{gender}</div>;
        },
        onCell: (record, index) => ({ className: record._rowSpan == 0 ? "row-span-cell" : "" }),
      },
      { title: Language.YINGERSUI, dataIndex: "yinger", align: "center" },
      { title: Language.ERTONGSUI, dataIndex: "ertong", align: "center" },
      { title: Language.SHAONIANSUI, dataIndex: "shaonian", align: "center" },
      { title: Language.QINGNIANSUI, dataIndex: "qingnian", align: "center" },
      { title: Language.ZHUANGNIANSUI, dataIndex: "zhuangnian", align: "center" },
      { title: Language.ZHONGLAONIANSUI, dataIndex: "zhonglaonian", align: "center" },
      { title: Language.WEIZHI, dataIndex: "unknow", align: "center" },
    ];
    let groupList = [
      { key: 1, groupName: "集团1", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 2, groupName: "集团1", gender: 2, inCount: 900, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 3, groupName: "集团1", gender: 3, inCount: 800, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 4, groupName: "集团2", gender: 1, inCount: 700, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 5, groupName: "集团2", gender: 2, inCount: 600, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 6, groupName: "集团2", gender: 3, inCount: 500, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 7, groupName: "集团3", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 8, groupName: "集团3", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 9, groupName: "集团3", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 10, groupName: "集团4", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 11, groupName: "集团4", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 12, groupName: "集团4", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 13, groupName: "集团5", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 14, groupName: "集团5", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 15, groupName: "集团5", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    ];
    // let groupList = [
    //   { key: 1,  date: "00:00-01:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 2,  date: "00:00-01:00", gender: 2, inCount: 900, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 3,  date: "00:00-01:00", gender: 3, inCount: 800, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 4,  date: "01:00-02:00", gender: 1, inCount: 700, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 5,  date: "01:00-02:00", gender: 2, inCount: 600, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 6,  date: "01:00-02:00", gender: 3, inCount: 500, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 7,  date: "02:00-03:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 8,  date: "02:00-03:00", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 9,  date: "02:00-03:00", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 10,  date: "03:00-04:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 11,  date: "03:00-04:00", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 12, date: "03:00-04:00", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 13,  date: "04:00-05:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 14,  date: "04:00-05:00", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    //   { key: 15,  date: "04:00-05:00", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    // ];
    let timeStamp = 1746028800;
    groupList.map((item, index) => {
      item.date = timeStamp;
      if ((index + 1) % 3 == 0) {
        timeStamp += 3600;
      }
    });
    // groupList = TableUtils.mergeRows(groupList);
    return { columns, dataSource: groupList };
  };

  static getCustomerMoodTableData = () => {
    let columns = [
      {
        title: Language.RIQI,
        key: "date",
        dataIndex: "date",
        align: "center",
        width: "150px",
        render: (text, record, index) => (
          <div>
            {TimeUtils.ts2Date(record.date, "HH:mm")}-{TimeUtils.ts2Date(record.date + 3600, "HH:mm")}
          </div>
        ),
        showSorterTooltip: false,
        sorter: (a, b) => a.date - b.date,
        onCell: (record, index) => ({ rowSpan: record._rowSpan }),
      },
      { title: Language.SUOSHUJITUAN, key: "groupName", dataIndex: "groupName", align: "center", onCell: (record, index) => ({ rowSpan: record._rowSpan }) },
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        align: "center",
        render: (value) => {
          let gender = Language.NAN;
          if (value == 2) {
            gender = Language.NV;
          } else if (value == 3) {
            gender = Language.WEIZHI;
          }
          return <div>{gender}</div>;
        },
      },
      { title: Language.JINCHANGRENCI, dataIndex: "inCount", align: "center" },
      { title: Language.FENNU, dataIndex: "fennu", align: "center" },
      { title: Language.KUNHUO, dataIndex: "kunhuo", align: "center" },
      { title: Language.GAOXIN, dataIndex: "gaoxin", align: "center" },
      { title: Language.PINGJING, dataIndex: "pingjing", align: "center" },
      { title: Language.JINGYA, dataIndex: "jingya", align: "center" },
      { title: Language.HAIPA, dataIndex: "haipa", align: "center" },
      { title: Language.YANWU, dataIndex: "yanwu", align: "center" },
      { title: Language.BEISHANG, dataIndex: "beishang", align: "center" },
      { title: Language.WEIZHI, dataIndex: "unknow", align: "center" },
    ];

    let groupList = [
      {
        key: 1,
        groupName: "集团1",
        date: "00:00-01:00",
        gender: 1,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 2,
        groupName: "集团1",
        date: "00:00-01:00",
        gender: 2,
        inCount: 900,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 3,
        groupName: "集团1",
        date: "00:00-01:00",
        gender: 3,
        inCount: 800,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 4,
        groupName: "集团2",
        date: "01:00-02:00",
        gender: 1,
        inCount: 700,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 5,
        groupName: "集团2",
        date: "01:00-02:00",
        gender: 2,
        inCount: 600,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 6,
        groupName: "集团2",
        date: "01:00-02:00",
        gender: 3,
        inCount: 500,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 7,
        groupName: "集团3",
        date: "02:00-03:00",
        gender: 1,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 8,
        groupName: "集团3",
        date: "02:00-03:00",
        gender: 2,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 9,
        groupName: "集团3",
        date: "02:00-03:00",
        gender: 3,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 10,
        groupName: "集团4",
        date: "03:00-04:00",
        gender: 1,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 11,
        groupName: "集团4",
        date: "03:00-04:00",
        gender: 2,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 12,
        groupName: "集团4",
        date: "03:00-04:00",
        gender: 3,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 13,
        groupName: "集团5",
        date: "04:00-05:00",
        gender: 1,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 14,
        groupName: "集团5",
        date: "04:00-05:00",
        gender: 2,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
      {
        key: 15,
        groupName: "集团5",
        date: "04:00-05:00",
        gender: 3,
        inCount: 1000,
        fennu: 100,
        kunhuo: 100,
        gaoxin: 100,
        pingjing: 100,
        jingya: 100,
        haipa: 100,
        yanwu: 100,
        beishang: 100,
        unknow: 100,
      },
    ];
    let timeStamp = 1746028800;
    groupList.map((item, index) => {
      item.date = timeStamp;
      if ((index + 1) % 3 == 0) {
        timeStamp += 3600;
      }
    });
    groupList = TableUtils.mergeRows(groupList, "date", "groupName");
    return { columns, dataSource: groupList };
  };

  static getWeeklyReportWorkWeekAnalysisData = () => {
    return this.getReportWorkWeekAnalysisData();
  };

  static getMonthlyReportWorkWeekAnalysisData = () => {
    let xAxis = [Language.BENYUEGONGZUORI, Language.SHANGYUEGONGZUORI, Language.BENYUEZHOUMO, Language.SHANGYUEZHOUMO];
    let data = this.getReportWorkWeekAnalysisData();
    data.xAxis = xAxis;
    return data;
  };

  static getAnnualReportWorkWeekAnalysisData = () => {
    let xAxis = [Language.BENNIANGONGZUORI, Language.SHANGNIANGONGZUORI, Language.BENNIANZHOUMO, Language.SHANGNIANZHOUMO];
    let data = this.getReportWorkWeekAnalysisData();
    data.xAxis = xAxis;
    return data;
  };

  static getReportWorkWeekAnalysisData = () => {
    let xAxis = [Language.BENZHOUGONGZUORI, Language.SHANGZHOUGONGZUORI, Language.BENZHOUZHOUMO, Language.SHANGZHOUZHOUMO];
    let data1 = [];
    let data2 = [];
    let data3 = [];
    for (let i = 0; i < xAxis.length; i++) {
      data1.push(Math.floor(Math.random() * 1000));
      data2.push(Math.floor(Math.random() * 1000));
      data3.push(Math.floor(Math.random() * 1000));
    }

    let data = {
      xAxis,
      data1,
      data2,
      data3,
    };
    return data;
  };

  static getWeatherAnalysisData = () => {
    var data = {
      pieData: [
        { value: 2, name: "晴天", avg: 10 },
        { value: 10, name: "阴天", avg: 30 },
        { value: 5, name: "雨天", avg: 30 },
        { value: 8, name: "多云", avg: 30 },
        { value: 9, name: "雷阵雨", avg: 30 },
      ],
      barData: {
        yAxis: ["晴天", "阴天", "雨天", "多云", "雷阵雨"],
        data: [100, 500, 50, 100, 200],
      },
    };
    return data;
  };

  static getAnnualHeaMapData = (year, flowType = Constant.FLOW_TYPE.IN_COUNT) => {
    const range = TimeUtils.getYearDateRangeFromDateStr(year);
    let valueData = [];
    for (let i = 0; i < range.length; i++) {
      valueData.push([range[i], Math.ceil(Math.random() * 1000)]);
    }
    let peakValue = 1000;
    let chartData = {
      data: valueData,
      year: year,
    };
    let info = {
      unit: this.getFlowTypeUnit(flowType),
      peakValue: peakValue.toLocaleString("en-US"),
      peakDate: "2025-05-01",
    };
    let data = {
      chartData,
      info,
    };
    return data;
  };

  static getFlowTypeUnit = (flowType) => {
    switch (flowType) {
      case Constant.FLOW_TYPE.IN_COUNT:
        return Language.RENCI;
      case Constant.FLOW_TYPE.IN_NUM:
        return Language.RENSHU;
      case Constant.FLOW_TYPE.BATCH_COUNT:
        return Language.PICI;
    }
  };

  static getSiteListTableData = () => {
    let columns = [
      { title: Language.CHANGDIMINGMINGCHENG, key: "siteName", dataIndex: "siteName", align: "center" },
      { title: Language.YINGYESHIJIAN, key: "openTime", dataIndex: "openTime", align: "center" },
      { title: Language.YINGYEMIANJI, key: "area", dataIndex: "area", align: "center" },
      { title: Language.CHURUKOU, key: "doorCount", dataIndex: "doorCount", align: "center" },
      { title: Language.LOUCENG, key: "floorCount", dataIndex: "floorCount", align: "center" },
      { title: Language.SHEBEISHULIANG, key: "deviceCount", dataIndex: "deviceCount", align: "center" },
      { title: Language.SUOSHUJITUAN, key: "groupName", dataIndex: "groupName", align: "center" },
      { title: Language.CHANGDIDIZHI, key: "address", dataIndex: "address", align: "center" },
      { title: Language.CHUANGJIANSHIJIAN, key: "createTimeDesc", dataIndex: "createTimeDesc", align: "center", sorter: true, showSorterTooltip: false },
    ];
    let groupList = [
      {
        key: 1,
        siteName: "场地1",
        openTime: "00:00-01:00",
        area: "100㎡",
        doorCount: 1000,
        floorCount: 1000,
        deviceCount: 1000,
        groupName: "g1g2g3g4",
        address: "广东省广州市天河区",
        groupId: "1",
        groups: ["1"],
      },
      { key: 2, siteName: "场地2", openTime: "01:00-02:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 3, siteName: "场地3", openTime: "02:00-03:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 4, siteName: "场地4", openTime: "03:00-04:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 5, siteName: "场地5", openTime: "04:00-05:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 6, siteName: "场地6", openTime: "05:00-06:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 7, siteName: "场地7", openTime: "06:00-07:00", area: "200㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 8, siteName: "场地8", openTime: "07:00-08:00", area: "200㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 9, siteName: "场地9", openTime: "08:00-09:00", area: "200㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 10, siteName: "场地10", openTime: "09:00-10:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 11, siteName: "场地11", openTime: "10:00-11:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 12, siteName: "场地12", openTime: "11:00-12:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 13, siteName: "场地13", openTime: "12:00-13:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 14, siteName: "场地14", openTime: "13:00-14:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      { key: 15, siteName: "场地15", openTime: "14:00-15:00", area: "100㎡", doorCount: 1000, floorCount: 1000, deviceCount: 1000, groupName: "g1g2g3g4", address: "广东省广州市天河区" },
      {
        key: 16,
        siteName: "场地16",
        openTime: "15:00-16:00",
        area: "100㎡",
        doorCount: 1000,
        floorCount: 1000,
        deviceCount: 1000,
        groupName: "g1g2g3g4",
        address: "广东省广州市天河区",
        groupId: "0",
        groups: ["0"],
      },
    ];
    groupList.map((item, index) => {
      item.createTime = TimeUtils.now();
      item.createTimeDesc = TimeUtils.getNowDate("yyyy-MM-dd HH:mm:ss");
    });
    return { columns, dataSource: groupList };
  };

  static getGroupTreeData = () => {
    let treeData = [
      {
        label: "集团A",
        value: "1",
        children: [
          {
            label: "直营",
            value: "2",
          },
          {
            label: "加盟",
            value: "3",

            children: [
              {
                label: "广东",
                value: "4",
              },
              {
                label: "广西",
                value: "5",
              },
            ],
          },
        ],
      },
      {
        label: "集团B",
        value: "6",
        children: [
          {
            label: "直营",
            value: "7",
          },
          {
            label: "加盟",
            value: "8",
            children: [
              {
                label: "云南云南云南云南云南云南云南云南",
                value: "9",
              },
              {
                label: "四川",
                value: "10",
              },
            ],
          },
        ],
      },
      {
        label: "未分配节点",
        value: "0",
      },
    ];
    return treeData;
  };

  static getGroupList = () => {
    let groups = [
      {
        key: 1,
        id: 1,
        name: "集团A",
        level: 1,
        parentId: 0,
        remark: "集团A的备注",
      },
      {
        key: 2,
        id: 2,
        name: "集团B",
        level: 1,
        parentId: 0,
        remark: "集团B的备注",
      },
      {
        key: 3,
        id: 3,
        name: "集团C",
        level: 1,
        parentId: 0,
        remark: "集团C的备注",
      },
      {
        key: 4,
        id: 4,
        name: "直营",
        level: 2,
        parentId: 1,
        remark: "直营的备注",
      },
      {
        key: 5,
        id: 5,
        name: "加盟",
        level: 2,
        parentId: 1,
        remark: "加盟的备注",
      },
      {
        key: 6,
        id: 6,
        name: "广东",
        level: 3,
        parentId: 4,
        remark: "广东的备注",
      },
      {
        key: 7,
        id: 7,
        name: "广西",
        level: 3,
        parentId: 5,
        remark: "广西边的备注",
      },
    ];
    return groups;
  };

  static getGroupTree = () => {
    let groupList = DemoUtils.getGroupList();
    let groupTree = DemoUtils.groupList2GroupTree(groupList);
    return groupTree;
  };

  static groupList2GroupTree(groupList) {
    var groupTree = DemoUtils.dataList2TreeNode(groupList);
    for (let i = 0; i < groupTree.length; i++) {
      groupTree[i] = DemoUtils.formatGroupTreeNode(groupTree[i]);
    }
    return groupTree;
  }

  static formatGroupTreeNode(node, parentNames = []) {
    node.parentNames = parentNames;
    node.createTime = TimeUtils.now();
    node.createTimeDesc = TimeUtils.getNowDate("yyyy-MM-dd HH:mm:ss");
    if (node.children) {
      node.children.map((child, index) => {
        DemoUtils.formatGroupTreeNode(child, parentNames.concat(node.name));
      });
    }
    return node;
  }

  static resetGroupParentNames(node) {
    if (node.children) {
      node.children.map((child, index) => {
        DemoUtils.formatGroupTreeNode(child, node.parentNames.concat(node.name));
      });
    }
    return node;
  }

  static dataList2TreeNode(dataList, idKey = "id", parentIdKey = "parentId", childrenKey = "children") {
    let treeNode = [];
    let dataMap = dataList.reduce((result, item) => {
      result[item[idKey]] = item;
      if (!item[parentIdKey]) {
        treeNode.push(item);
      }
      return result;
    }, {});
    for (const key in dataMap) {
      let item = dataMap[key];
      if (item[parentIdKey] > 0) {
        let parent = dataMap[item[parentIdKey]];
        if (parent) {
          if (!parent[childrenKey]) {
            parent[childrenKey] = [];
          }
          parent[childrenKey].push(item);
        }
      }
    }
    return treeNode;
  }

  static findTreeNode(tree, value, idKey = "id", childrenKey = "children") {
    for (let i = 0; i < tree.length; i++) {
      let node = tree[i];
      if (node[idKey] === value) {
        return node;
      }
      if (node[childrenKey]) {
        let result = DemoUtils.findTreeNode(node[childrenKey], value, idKey, childrenKey);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  static addTreeNode(tree, node, parentIdKey = "parentId", idKey = "id", childrenKey = "children") {
    if (node[parentIdKey] === 0) {
      tree.push(node);
    } else {
      let parent = DemoUtils.findTreeNode(tree, node[parentIdKey], idKey, childrenKey);
      if (parent) {
        if (!parent[childrenKey]) {
          parent[childrenKey] = [];
        }
        parent[childrenKey].push(node);
      }
    }
    return tree;
  }

  static deleteTreeNode(tree, value, idKey = "id", childrenKey = "children") {
    for (let i = 0; i < tree.length; i++) {
      let node = tree[i];
      if (node[idKey] === value) {
        tree.splice(i, 1);
        if (tree.length === 0) {
          tree = null;
        }
        return tree;
      }
      if (node[childrenKey]) {
        node[childrenKey] = DemoUtils.deleteTreeNode(node[childrenKey], value, idKey, childrenKey);
      }
    }
    return tree;
  }

  static getDeviceList = () => {
    let time = TimeUtils.now();
    let date = TimeUtils.getNowDate("yyyy-MM-dd HH:mm:ss");
    let devices = [
      {
        key: 1,
        id: 1,
        deviceName: "设备1",
        serialNumber: "asdcad221",
        siteName: "场地1",
        siteId: 1,
        doorName: "门1",
        doorId: [1],
        online: 1,
        assignTime: time,
        state: 1,
        heartTime: time,
        createTime: time,
      },
      {
        key: 1,
        id: 2,
        deviceName: "设备2",
        serialNumber: "asdcadasd",
        siteName: "场地1",
        siteId: 1,
        doorName: "门1",
        doorId: [1],
        online: 1,
        assignTime: time,
        state: 1,
        heartTime: time,
        createTime: time,
      },
      {
        key: 1,
        id: 3,
        deviceName: "设备3",
        serialNumber: "asdcaasddd",
        siteName: "场地1",
        siteId: 1,
        doorName: "门1",
        doorId: [1],
        online: 1,
        assignTime: time,
        state: 1,
        heartTime: time,
        createTime: time,
      },
      {
        key: 1,
        id: 4,
        deviceName: "设备1",
        serialNumber: "asdcad",
        siteName: "场地1",
        siteId: 1,
        doorName: "门1",
        doorId: [1],
        online: 1,
        assignTime: time,
        state: 1,
        heartTime: time,
        createTime: time,
      },
      // {
      //     key:1,
      //     id:5,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:6,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:7,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:8,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:9,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:10,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:11,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:12,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:13,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:14,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:15,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
      // {
      //     key:1,
      //     id:16,
      //     deviceName:'设备1',
      //     serialNumber:'asdcad',
      //     siteName:'场地1',
      //     siteId:1,
      //     doorName:'门1',
      //     doorId:[1],
      //     online:1,
      //     assignTime:time,
      //     state:1,
      //     heartTime:time,
      //     createTime:time,
      // },
    ];
    devices.map((device, index) => {
      device = DemoUtils.formatDevice(device);
    });
    return devices;
  };

  static formatDevice = (device) => {
    if (device.assignTime > 0) {
      device.assignTimeDesc = TimeUtils.ts2Date(device.assignTime, "yyyy-MM-dd HH:mm:ss");
      device.assignDesc = Language.YIGUANLIAN;
      device.assignState = 1;
    } else {
      device.assignTimeDesc = Language.WU;
      device.assignDesc = Language.WEIGUANLIAN;
      device.assignState = 0;
    }
    device.stateDesc = device.state == 1 ? Language.ZHENGCHANG : Language.TINGYONG;
    if (device.heartTime > 0) {
      device.heartTimeDesc = TimeUtils.ts2Date(device.heartTime, "yyyy-MM-dd HH:mm:ss");
    } else {
      device.heartTimeDesc = Language.WU;
    }
    device.createTimeDesc = TimeUtils.ts2Date(device.createTime, "yyyy-MM-dd HH:mm:ss");
    return device;
  };

  static getSiteTreeSelect = (all = true) => {
    let treeSelect = [
      {
        title: "jituan1",
        value: "g1",
        selectable: false,
        children: [
          {
            title: "guangdong",
            value: "g2",
            selectable: false,
            children: [
              {
                title: "场地",
                value: 1,
              },
              {
                title: "changdi999",
                value: 2,
              },
            ],
          },
        ],
      },
    ];
    if (all) {
      treeSelect.unshift({
        title: Language.QUANBU,
        value: 0,
      });
    }
    return treeSelect;
  };

  static getDoorTreeSelect = () => {
    let treeSelect = [
      {
        title: "总客流",
        value: "t1",
        selectable: false,
        children: [
          {
            title: "1F-3号门-01",
            value: 1,
          },
        ],
      },
      {
        title: "场外客流",
        value: "t2",
        selectable: false,
      },
      {
        title: "楼层",
        value: "t3",
        selectable: false,
      },
    ];
    return treeSelect;
  };

  static getSiteList() {
    let siteList = [
      {
        siteId: 1,
        siteName: "场地1",
        groupName: "group1",
        floors: DemoUtils.getFloorList(),
      },
      {
        siteId: 2,
        siteName: "changdi1",
        groupName: "group1",
        floors: [],
      },
      {
        siteId: 3,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 4,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 5,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 6,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 7,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 8,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 9,
        siteName: "changdi1",
        groupName: "group1",
      },
      {
        siteId: 10,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 11,
        siteName: "changdi1",
        groupName: "group1",
      },
      {
        siteId: 12,
        siteName: "changdi1",
        floors: [],
        groupName: "group1",
      },
      {
        siteId: 13,
        siteName: "changdi1",
        groupName: "group1",
      },
      {
        siteId: 14,
        siteName: "changdi14",
        floors: [],
        groupName: "group1",
      },
    ];
    return siteList;
  }

  static getDoorList() {
    let doorList = [
      {
        doorId: 1,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 2,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 3,
        doorName: "1F-3Door-01",
        deviceCount: 10,
        direction: 1,
        location: "total",
        devices: [
          {
            deviceId: 1,
            deviceName: "设备1",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 2,
            deviceName: "设备2",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 3,
            deviceName: "设备3",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 4,
            deviceName: "设备4",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 5,
            deviceName: "设备5",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 6,
            deviceName: "设备6",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 7,
            deviceName: "设备7",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 8,
            deviceName: "设备8",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 9,
            deviceName: "设备9",
            serialNumber: "asdcad221",
            state: 1,
          },
          {
            deviceId: 10,
            deviceName: "设备10",
            serialNumber: "asdcad221",
            state: 1,
          },
        ],
      },
      {
        doorId: 5,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 6,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 7,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 8,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 9,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 10,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 11,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 12,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 13,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 14,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
      {
        doorId: 15,
        doorName: "1F-3Door-01",
        deviceCount: 0,
        direction: 1,
        location: "total",
      },
    ];
    doorList.map((door, index) => {
      door.createTime = TimeUtils.now();
      door.createTimeDesc = TimeUtils.getNowDate("yyyy-MM-dd HH:mm:ss");
      door.directionDesc = door.direction == 1 ? Language.ZHENGXIANG : Language.FANXIANG;
    });
    return doorList;
  }

  static getDeviceTreeData() {
    let deviceList = [
      {
        title: "恒华1",
        value: "t1",
        selectable: false,
        children: [
          {
            title: "123456",
            value: 1,
            disabled: true,
          },
          {
            title: "123456a",
            value: 2,
          },
          {
            title: "123456b",
            value: 3,
          },
          {
            title: "123456c",
            value: 4,
          },
        ],
      },
    ];
    return deviceList;
  }

  static getFloorTreeData() {
    let floorList = [
      {
        label: "1F",
        value: 1,
      },
      {
        label: "2F",
        value: 2,
      },
      {
        label: "3F",
        value: 3,
      },
      {
        label: "4F",
        value: 4,
      },
      {
        label: "5F",
        value: 5,
      },
      {
        label: "6F",
        value: 6,
      },
      {
        label: "7F",
        value: 7,
      },
      {
        label: "8F",
        value: 8,
      },
      {
        label: "9F",
        value: 9,
      },
      {
        label: "10F",
        value: 10,
      },
      {
        label: "11F",
        value: 11,
      },
      {
        label: "12F",
        value: 12,
      },
      {
        label: "13F",
        value: 13,
      },
    ];
    return floorList;
  }

  static getFloorList() {
    let floorList = [
      {
        siteId: 1,
        floorId: 1,
        floorName: "1F",
      },
      {
        siteId: 1,
        floorId: 2,
        floorName: "2F",
      },
      {
        siteId: 1,
        floorId: 3,
        floorName: "3F",
      },
      {
        siteId: 1,
        floorId: 4,
        floorName: "4F",
      },
      {
        siteId: 1,
        floorId: 5,
        floorName: "5F",
      },
    ];
    return floorList;
  }

  static getAccountList() {
    let accountList = [
      {
        userId: 1,
        account: "test1",
        userName: "小明",
        contacts: "小明",
        phone: "13800138000",
        state: -1,
        roleId: 1,
        roleName: "管理员",
        siteName: "场地1",
        siteId: [1, 2],
        createTimeDesc: TimeUtils.getNowDate("yyyy-MM-dd HH:mm:ss"),
      },
    ];
    return accountList;
  }

  static getRoleList() {
    let roleList = [
      {
        roleId: 1,
        roleName: "管理员",
        createUserName: "admin",
      },
      {
        roleId: 2,
        roleName: "普通用户",
        createUserName: "admin",
      },
      {
        roleId: 3,
        roleName: "访客",
        createUserName: "admin",
      },
      {
        roleId: 4,
        roleName: "超级管理员",
        createUserName: "admin",
      },
      {
        roleId: 5,
        roleName: "测试",
        createUserName: "admin",
      },
      {
        roleId: 6,
        roleName: "测试2",
        createUserName: "admin",
      },
      {
        roleId: 7,
        roleName: "测试3",
        createUserName: "admin",
      },
      {
        roleId: 8,
        roleName: "测试4",
        createUserName: "admin",
      },
      {
        roleId: 9,
        roleName: "测试5",
        createUserName: "admin",
      },
      {
        roleId: 10,
        roleName: "测试6",
        createUserName: "admin",
      },
    ];
    console.log("aaaaaaaaaa", Config.API_URL);
    roleList.map((role) => {
      role.createTimeDesc = TimeUtils.getNowDate("yyyy-MM-dd HH:mm:ss");
    });
    return roleList;
  }

  // static getPrivilegeList(){
  //     let privilegeList = [
  //         {
  //             title:Language.ZHOUQIZONGJIE,
  //             last:1,
  //             id:20300,
  //             children:[
  //                 {
  //                     title:Language.RIBAO,
  //                     id:20301,
  //                 },
  //                 {
  //                     title:Language.ZHOUBAO,
  //                     id:20302,
  //                 },
  //                 // {
  //                 //     title:Language.YUEBAO,
  //                 //     id:20303,
  //                 // },
  //                 // {
  //                 //     title:Language.NIANBAO,
  //                 //     id:20304,
  //                 // },
  //             ]
  //         },
  //     ]
  //     return privilegeList;
  // }
  static getPrivilegeList() {
    let privilegeList = [
      {
        title: Language.SHOUYE,
        id: 1,
      },
      {
        title: Language.LIULIANG,
        id: 2,
        children: [
          {
            title: Language.JITUANFENXI,
            id: 2010000,
          },
          {
            title: Language.SHISHIKELIU,
            id: 2020000,
          },
          {
            title: Language.ZHOUQIZONGJIE,
            last: 1,
            id: 2030000,
            children: [
              {
                title: Language.RIBAO,
                id: 2030100,
                checked: 1,
              },
              {
                title: Language.ZHOUBAO,
                id: 2030200,
              },
              {
                title: Language.YUEBAO,
                id: 2030300,
              },
              {
                title: Language.NIANBAO,
                id: 2030400,
              },
            ],
          },
          {
            title: Language.CHURUKOUFENXI,
            id: 2040000,
          },
          {
            title: Language.CHURUKOUDUIBI,
            id: 2050000,
          },
          {
            title: Language.LOUCENGFENXI,
            id: 2060000,
          },
          {
            title: Language.CHANGWAIFENXI,
            id: 2070000,
          },
          {
            title: Language.GUKEDONGCHA,
            id: 2080000,
          },
        ],
      },
      {
        title: Language.GONGZUOTAI,
        id: 3,
        children: [
          {
            title: Language.ZONGTIGAILAN,
            id: 3010000,
          },
          {
            title: Language.ZUZHISHEZHI,
            id: 3020000,
            children: [
              {
                title: Language.CHANGDIGUANLI,
                id: 3020100,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3020101,
                  },
                  {
                    title: Language.JITUANGUANLI,
                    id: 3020102,
                  },
                ],
              },
              {
                title: Language.JITUANGUANLI,
                id: 3020200,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3020201,
                  },
                  {
                    title: Language.XINZENGJITUAN,
                    id: 3020202,
                  },
                  {
                    title: Language.XINZENGTONGJIJIEDIAN,
                    id: 3020203,
                  },
                  {
                    title: Language.XINZENGCIJIJIEDIAN,
                    id: 3020204,
                  },
                  {
                    title: Language.BIANJIJITUAN,
                    id: 3020205,
                  },
                  {
                    title: Language.SHANCHU,
                    id: 3020206,
                  },
                ],
              },
            ],
          },
          {
            title: Language.ZHANGHAOJUESE,
            id: 3030000,
            children: [
              {
                title: Language.ZHANGHAOGUANLI,
                id: 3030100,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3030101,
                  },
                  {
                    title: Language.BIANJIZIZHANGHAO,
                    id: 3030102,
                  },
                  {
                    title: Language.XINZENGZIZHANGHAO,
                    id: 3030103,
                  },
                  {
                    title: Language.SHANCHU,
                    id: 3030104,
                  },
                ],
              },
              {
                title: Language.JUESEQUANXIAN,
                id: 3030200,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3030201,
                  },
                  {
                    title: Language.BIANJIJUESE,
                    id: 3030202,
                  },
                  {
                    title: Language.XINZENGJUESE,
                    id: 3030203,
                  },
                  {
                    title: Language.SHANCHU,
                    id: 3030204,
                  },
                ],
              },
            ],
          },
          {
            title: Language.WEIZHIGUANLI,
            id: 3040000,
            children: [
              {
                title: Language.CHURUKOUGUANLI,
                id: 3040100,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3040101,
                  },
                  {
                    title: Language.BIANJICHURUKOU,
                    id: 3040102,
                  },
                  {
                    title: Language.XINZENGCHURUKOU,
                    id: 3040103,
                  },
                  {
                    title: Language.SHANCHU,
                    id: 3040104,
                  },
                ],
              },
              {
                title: Language.ZONGKELIU,
                id: 3040200,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3040201,
                  },
                  {
                    title: Language.BIANJICHURUKOU,
                    id: 3040202,
                  },
                  {
                    title: Language.GUANLIANCHURUKOU,
                    id: 3040203,
                  },
                  {
                    title: Language.JIECHUCHURUKOUGUANLIAN,
                    id: 3040204,
                  },
                ],
              },
              {
                title: Language.CHANGWAIKELIU,
                id: 3040300,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3040301,
                  },
                  {
                    title: Language.BIANJICHURUKOU,
                    id: 3040302,
                  },
                  {
                    title: Language.GUANLIANCHURUKOU,
                    id: 3040303,
                  },
                  {
                    title: Language.JIECHUCHURUKOUGUANLIAN,
                    id: 3040304,
                  },
                ],
              },
              {
                title: Language.LOUCENG,
                id: 3040400,
                last: 1,
                children: [
                  {
                    title: Language.CHAKAN,
                    id: 3040401,
                  },
                  {
                    title: Language.BIANJILOUCENG,
                    id: 3040402,
                  },
                  {
                    title: Language.XINZENGLOUCENG,
                    id: 3040403,
                  },
                  {
                    title: Language.SHANCHULOUCENG,
                    id: 3040404,
                  },
                  {
                    title: Language.BIANJICHURUKOU,
                    id: 3040405,
                  },
                  {
                    title: Language.GUANLIANCHURUKOU,
                    id: 3040406,
                  },
                  {
                    title: Language.JIECHUCHURUKOUGUANLIAN,
                    id: 3040407,
                  },
                ],
              },
            ],
          },
          {
            title: Language.SHEBEIGUANLI,
            id: 3050000,
            last: 1,
            children: [
              {
                title: Language.CHAKAN,
                id: 3050001,
              },
              {
                title: Language.SHEBEIGUANLIAN,
                id: 3050002,
              },
            ],
          },
          {
            title: Language.SHUJUXIUZHENG,
            id: 3060000,
            last: 1,
            children: [
              {
                title: Language.CHAKAN,
                id: 3060001,
              },
              {
                title: Language.BIANJI,
                id: 3060002,
              },
            ],
          },
          {
            title: Language.SHUJUSHITU,
            id: 3070000,
            last: 1,
            children: [
              {
                title: Language.CHAKAN,
                id: 3070001,
              },
              {
                title: Language.DAPINGZHANSHI,
                id: 3070002,
              },
              {
                title: Language.CANSHUPEIZHI,
                id: 3070003,
              },
            ],
          },
        ],
      },
    ];
    return privilegeList;
  }
}

export default DemoUtils;
