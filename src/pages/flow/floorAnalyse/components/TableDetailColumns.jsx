import { Language } from "@/language/LocaleContext";

// 楼层分析-客流明细表格列配置
export const flowDetailColumns = [
  {
    title: Language.RIQI, // 日期
    dataIndex: "date",
    key: "date",
    width: 160,
    align: "center",
    sorter: (a, b) => a.date.unix() - b.date.unix(),
    fixed: "left",
    render: (text, record, index) =>
      record.isSameDay
        ? `${record.date.format("HH:mm")}-${record.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : record.date.add(1, "hour").format("HH:mm")}`
        : `${record?.date ? record?.date?.format("MM-DD") : ""}`,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  // {
  //   title: "天气", // 天气
  //   dataIndex: "weather",
  //   key: "weather",
  //   width: 100,
  //   align: "center",
  //   render: (text) => text || "-",
  // },

  {
    title: Language.LOUCENG, // 楼层
    dataIndex: "floorName",
    key: "floorName",
    width: 200,
    align: "center",
    ellipsis: true,
    render: (text) => text,
  },
  {
    title: Language.JINCHANGRENCI, // 进场人次
    dataIndex: "inCount",
    key: "inCount",
    width: 120,
    align: "center",
    sorter: (a, b) => a.inCount - b.inCount,
    render: (text) => text,
  },
  {
    title: Language.FENSHIZHANBI, // 分时占比
    dataIndex: "inCountRatio",
    key: "inCountRatio",
    width: 100,
    align: "center",
    sorter: (a, b) => parseFloat(a.inCountRatio) - parseFloat(b.inCountRatio),
    render: (text) => `${text}%`,
  },
  // {
  //   title: "环比", // 进场人次-环比
  //   dataIndex: "specifiedEntryCountRatio",
  //   key: "specifiedEntryCountRatio",
  //   width: 100,
  //   align: "center",
  //   sorter: (a, b) => parseFloat(a.specifiedEntryCountRatio) - parseFloat(b.specifiedEntryCountRatio),
  //   render: (text) => (text ? (parseFloat(text) >= 0 ? `+${text}%` : `${text}%`) : "0%"),
  //   onCell: (record) => ({
  //     style: {
  //       color: parseFloat(record.specifiedEntryCountRatio) > 0 ? "red" : "green",
  //     },
  //   }),
  // },
  {
    title: Language.JINCHANGRENSHU, // 进场人数
    dataIndex: "inNum",
    key: "inNum",
    width: 120,
    align: "center",
    sorter: (a, b) => a.inNum - b.inNum,
    render: (text) => text,
  },
  {
    title: Language.FENSHIZHANBI, // 分时占比
    dataIndex: "inNumRatio",
    key: "inNumRatio",
    width: 100,
    align: "center",
    sorter: (a, b) => parseFloat(a.inNumRatio) - parseFloat(b.inNumRatio),
    render: (text) => `${text}%`,
  },
  // {
  //   title: "环比", // 进场人数-环比
  //   dataIndex: "specifiedEntryPeopleRadio",
  //   key: "specifiedEntryPeopleRadio",
  //   width: 100,
  //   align: "center",
  //   sorter: (a, b) => parseFloat(a.specifiedEntryPeopleRadio) - parseFloat(b.specifiedEntryPeopleRadio),
  //   render: (text) => (text ? (parseFloat(text) >= 0 ? `+${text}%` : `${text}%`) : "0%"),
  //   onCell: (record) => ({
  //     style: {
  //       color: parseFloat(record.specifiedEntryPeopleRadio) > 0 ? "red" : "green",
  //     },
  //   }),
  // },
  {
    title: Language.KELIUPICI, // 客流批次
    dataIndex: "batchCount",
    key: "batchCount",
    width: 120,
    align: "center",
    sorter: (a, b) => a.batchCount - b.batchCount,
    render: (text) => text,
  },
  {
    title: Language.FENSHIZHANBI, // 分时占比
    dataIndex: "batchRatio",
    key: "batchRatio",
    width: 100,
    align: "center",
    sorter: (a, b) => parseFloat(a.batchRatio) - parseFloat(b.batchRatio),
    render: (text) => `${text}%`,
  },
  // {
  //   title: "环比", // 客流批次-环比
  //   dataIndex: "specifiedFlowBatchRadio",
  //   key: "specifiedFlowBatchRadio",
  //   width: 100,
  //   align: "center",
  //   sorter: (a, b) => parseFloat(a.specifiedFlowBatchRadio) - parseFloat(b.specifiedFlowBatchRadio),
  //   render: (text) => (text ? (parseFloat(text) >= 0 ? `+${text}%` : `${text}%`) : "0%"),
  //   onCell: (record) => ({
  //     style: {
  //       color: parseFloat(record.specifiedFlowBatchRadio) > 0 ? "red" : "green",
  //     },
  //   }),
  // },
];

// 楼层分析-年龄属性表格列配置
export const ageAttrColumns = [
  {
    title: Language.RIQI, // 日期
    dataIndex: "date",
    key: "date",
    width: 120,
    align: "center",
    sorter: (a, b) => a.date.unix() - b.date.unix(),
    fixed: "left",
    render: (text, record, index) =>
      record.isSameDay
        ? `${record.date.format("HH:mm")}-${record.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : record.date.add(1, "hour").format("HH:mm")}`
        : `${record?.date ? record?.date?.format("MM-DD") : ""}`,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.LOUCENG, // 楼层
    dataIndex: "floorName",
    key: "floorName",
    width: 200,
    align: "center",
    render: (text) => text,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
    ellipsis: true,
  },
  {
    title: Language.XINGBIE,
    dataIndex: "gender",
    key: "gender",
    align: "center",
    width: 80,
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
  {
    title: Language.YINGERSUI, // 婴儿(6岁以下)
    dataIndex: "toddler",
    key: "toddler",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: Language.ERTONGSUI, // 儿童(7-12岁)
    dataIndex: "child",
    key: "child",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  // {
  //   title: Language.SHAONIANSUI, // 少年(13-17岁)
  //   dataIndex: "teenager",
  //   key: "teenager",
  //   width: 120,
  //   align: "center",
  //   sorter: true,
  //   render: (text) => text || "-",
  // },
  {
    title: Language.QINGNIANSUI, // 青年(18-29岁)
    dataIndex: "youngAdult",
    key: "youngAdult",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: Language.ZHUANGNIANSUI, // 壮年(30-50岁)
    dataIndex: "middleAge",
    key: "middleAge",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: Language.ZHONGLAONIANSUI, // 中老年(51岁以上)
    dataIndex: "elderly",
    key: "elderly",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: Language.WEIZHI, // 未知
    dataIndex: "ageUnknown",
    key: "ageUnknown",
    width: 120,
    align: "center",
    render: (text) => text,
  },
];

// 楼层分析-心情属性表格列配置
export const moodAttrColumns = [
  {
    title: Language.RIQI, // 日期
    dataIndex: "date",
    key: "date",
    width: 160,
    align: "center",
    sorter: (a, b) => a.date.unix() - b.date.unix(),
    fixed: "left",
    render: (text, record, index) =>
      record.isSameDay
        ? `${record.date.format("HH:mm")}-${record.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : record.date.add(1, "hour").format("HH:mm")}`
        : `${record?.date ? record?.date?.format("MM-DD") : ""}`,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.LOUCENG, // 楼层
    dataIndex: "floorName",
    key: "floorName",
    width: 200,
    align: "center",
    render: (text) => text,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
    ellipsis: true,
  },
  {
    title: Language.XINGBIE,
    dataIndex: "gender",
    key: "gender",
    align: "center",
    width: 80,
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
  // {
  //   title: "天气",
  //   dataIndex: "weather",
  //   key: "weather",
  //   width: 100,
  //   align: "center",
  //   render: (text) => text || "-",
  // },
  {
    title: Language.FENNU, // 愤怒
    dataIndex: "anger",
    key: "anger",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.BEISHANG, // 悲伤
    dataIndex: "sadness",
    key: "sadness",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.YANWU, // 厌恶
    dataIndex: "disgust",
    key: "disgust",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.HAIPA, // 害怕
    dataIndex: "fear",
    key: "fear",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.JINGYA, // 惊讶
    dataIndex: "surprise",
    key: "surprise",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.PINGJING, // 平静
    dataIndex: "calm",
    key: "calm",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.GAOXIN, // 高兴
    dataIndex: "happy",
    key: "happy",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.KUNHUO, // 困惑
    dataIndex: "confused",
    key: "confused",
    width: 100,
    align: "center",

    render: (text) => text,
  },
  {
    title: Language.WEIZHI, // 未知
    dataIndex: "faceUnknown",
    key: "faceUnknown",
    width: 100,
    align: "center",

    render: (text) => text,
  },
];

// 为了向后兼容，保留原来的 columns 导出
export const columns = flowDetailColumns;
