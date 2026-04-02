import { Language } from "@/language/LocaleContext";

// 指定出入口-客流明细表格列配置
export const flowDetailColumns = [
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
    title: Language.ZHIDINGCHURUKOU, // 指定出入口
    children: [
      {
        title: Language.JINCHANGRENCI, // 进场人次
        dataIndex: "inCountA",
        key: "inCountA",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inCountA - b.inCountA,
        render: (text) => text,
      },
      {
        title: Language.JINCHANGRENSHU, // 进场人数
        dataIndex: "inNumA",
        key: "inNumA",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inNumA - b.inNumA,
        render: (text) => text,
      },
      {
        title: Language.KELIUPICI, // 客流批次
        dataIndex: "batchCountA",
        key: "batchCountA",
        width: 120,
        align: "center",
        sorter: (a, b) => a.batchCountA - b.batchCountA,
        render: (text) => text,
      },
    ],
  },
  {
    title: Language.DUIBICHURUKOU, // 对比出入口
    children: [
      {
        title: Language.JINCHANGRENCI, // 进场人次
        dataIndex: "inCountC",
        key: "inCountC",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inCountC - b.inCountC,
        render: (text) => text,
      },
      {
        title: Language.JINCHANGRENSHU, // 进场人数
        dataIndex: "inNumC",
        key: "inNumC",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inNumC - b.inNumC,

        render: (text) => text,
      },
      {
        title: Language.KELIUPICI, // 客流批次
        dataIndex: "batchCountC",
        key: "batchCountC",
        width: 120,
        align: "center",
        sorter: (a, b) => a.batchCountC - b.batchCountC,
        render: (text) => text,
      },
    ],
  },
  {
    title: "进场人次变化率",
    dataIndex: "inCountChangeRate",
    key: "inCountChangeRate",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: "进场人数变化率",
    dataIndex: "inNumChangeRate",
    key: "inNumChangeRate",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: "客流批次变化率",
    dataIndex: "batchCountChangeRate",
    key: "batchCountChangeRate",
    width: 120,
    align: "center",
    render: (text) => text,
  },
];

// 指定出入口-年龄属性表格列配置
export const ageAttrColumns = [
  {
    title: Language.RIQI, // 日期
    dataIndex: "date",
    key: "date",
    width: 150,
    align: "center",
    fixed: "left",
    sorter: (a, b) => a.date.unix() - b.date.unix(),
    render: (text, record, index) =>
      record.isSameDay
        ? `${record.date.format("HH:mm")}-${record.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : record.date.add(1, "hour").format("HH:mm")}`
        : `${record?.date ? record?.date?.format("MM-DD") : ""}`,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },

  {
    title: Language.ZHIDINGCHURUKOU, // 指定出入口
    children: [
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        key: "gender",
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
      {
        title: Language.YINGERSUI, // 婴儿(6岁以下)
        dataIndex: "toddlerA",
        key: "toddlerA",
        width: 120,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.ERTONGSUI, // 儿童(7-12岁)
        dataIndex: "childA",
        key: "childA",
        width: 120,

        align: "center",

        render: (text) => text,
      },
      // {
      //   title: Language.SHAONIANSUI, // 少年(13-17岁)
      //   dataIndex: "teenagerA",
      //   key: "teenagerA",
      //   width: 120,

      //   align: "center",

      //   render: (text) => text,
      // },
      {
        title: Language.QINGNIANSUI, // 青年(18-29岁)
        dataIndex: "youngAdultA",
        key: "youngAdultA",
        width: 120,

        align: "center",

        render: (text) => text,
      },
      {
        title: Language.ZHUANGNIANSUI, // 壮年(30-50岁)
        dataIndex: "middleAgeA",
        key: "middleAgeA",
        width: 140,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.ZHONGLAONIANSUI, // 中老年(51岁以上)
        dataIndex: "elderlyA",
        key: "elderlyA",
        width: 140,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "ageUnknownA",
        key: "ageUnknownA",
        width: 120,
        align: "center",

        render: (text) => text,
      },
    ],
  },
  {
    title: Language.DUIBICHURUKOU, // 对比出入口
    children: [
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        key: "gender",
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
      {
        title: Language.YINGERSUI, // 婴儿(6岁以下)
        dataIndex: "toddlerC",
        key: "toddlerC",
        width: 120,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.ERTONGSUI, // 儿童(7-12岁)
        dataIndex: "childC",
        key: "childC",
        width: 120,
        align: "center",

        render: (text) => text,
      },
      // {
      //   title: Language.SHAONIANSUI, // 少年(13-17岁)
      //   dataIndex: "teenagerC",
      //   key: "teenagerC",
      //   width: 120,
      //   align: "center",

      //   render: (text) => text,
      // },
      {
        title: Language.QINGNIANSUI, // 青年(18-29岁)
        dataIndex: "youngAdultC",
        key: "youngAdultC",
        width: 120,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.ZHUANGNIANSUI, // 壮年(30-50岁)
        dataIndex: "middleAgeC",
        key: "middleAgeC",
        align: "center",
        width: 140,
        render: (text) => text,
      },
      {
        title: Language.ZHONGLAONIANSUI, // 中老年(51岁以上)
        dataIndex: "elderlyC",
        key: "elderlyC",
        width: 140,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "ageUnknownC",
        key: "ageUnknownC",
        width: 120,
        align: "center",
        render: (text) => text,
      },
    ],
  },
];

// 心情属性表格列配置
export const moodAttrColumns = [
  {
    title: Language.RIQI, // 日期
    dataIndex: "date",
    key: "date",
    width: 150,
    align: "center",
    fixed: "left",
    sorter: (a, b) => a.date.unix() - b.date.unix(),
    render: (text, record, index) =>
      record.isSameDay
        ? `${record.date.format("HH:mm")}-${record.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : record.date.add(1, "hour").format("HH:mm")}`
        : `${record?.date ? record?.date?.format("MM-DD") : ""}`,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
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
    title: Language.ZHIDINGCHURUKOU, // 指定出入口
    children: [
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
      {
        title: Language.FENNU, // 愤怒
        dataIndex: "angerA",
        key: "angerA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.BEISHANG, // 悲伤
        dataIndex: "sadnessA",
        key: "sadnessA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.YANWU, // 厌恶
        dataIndex: "disgustA",
        key: "disgustA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.HAIPA, // 害怕
        dataIndex: "fearA",
        key: "fearA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.JINGYA, // 惊讶
        dataIndex: "surpriseA",
        key: "surpriseA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.PINGJING, // 平静
        dataIndex: "calmA",
        key: "calmA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.GAOXIN, // 高兴
        dataIndex: "happyA",
        key: "happyA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.KUNHUO, // 困惑
        dataIndex: "confusedA",
        key: "confusedA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "faceUnknownA",
        key: "faceUnknownA",
        width: 100,
        align: "center",

        render: (text) => text,
      },
    ],
  },
  {
    title: Language.DUIBICHURUKOU, // 对比出入口
    children: [
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
      {
        title: Language.FENNU, // 愤怒
        dataIndex: "angerC",
        key: "angerC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.BEISHANG, // 悲伤
        dataIndex: "sadnessC",
        key: "sadnessC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.YANWU, // 厌恶
        dataIndex: "disgustC",
        key: "disgustC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.HAIPA, // 害怕
        dataIndex: "fearC",
        key: "fearC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.JINGYA, // 惊讶
        dataIndex: "surpriseC",
        key: "surpriseC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.PINGJING, // 平静
        dataIndex: "calmC",
        key: "calmC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.GAOXIN, // 高兴
        dataIndex: "happyC",
        key: "happyC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.KUNHUO, // 困惑
        dataIndex: "confusedC",
        key: "confusedC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "faceUnknownC",
        key: "faceUnknownC",
        width: 100,
        align: "center",

        render: (text) => text,
      },
    ],
  },
];

export const timeFlowAttrColumns = [
  {
    title: Language.CHURUKOUMINGCHENG,
    dataIndex: "doorName",
    key: "doorName",
    width: 150,
    align: "center",
    render: (text) => text || "-",
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.ZHIDINGSHIJIAN,
    children: [
      {
        title: Language.JINCHANGRENCI, // 进场人次
        dataIndex: "inCountA",
        key: "inCountA",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inCountA - b.inCountA,
        render: (text) => text,
      },
      {
        title: Language.JINCHANGRENSHU, // 进场人数
        dataIndex: "inNumA",
        key: "inNumA",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inNumA - b.inNumA,
        render: (text) => text,
      },
      {
        title: Language.KELIUPICI, // 客流批次
        dataIndex: "batchCountA",
        key: "batchCountA",
        width: 120,
        align: "center",
        sorter: (a, b) => a.batchCountA - b.batchCountA,
        render: (text) => text,
      },
    ],
  },
  {
    title: Language.DUIBISHIJIAN,
    children: [
      {
        title: Language.JINCHANGRENCI, // 进场人次
        dataIndex: "inCountC",
        key: "inCountC",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inCountC - b.inCountC,
        render: (text) => text,
      },
      {
        title: Language.JINCHANGRENSHU, // 进场人数
        dataIndex: "inNumC",
        key: "inNumC",
        width: 120,
        align: "center",
        sorter: (a, b) => a.inNumC - b.inNumC,
        render: (text) => text,
      },
      {
        title: Language.KELIUPICI, // 客流批次
        dataIndex: "batchCountC",
        key: "batchCountC",
        width: 120,
        align: "center",
        sorter: (a, b) => a.batchCountC - b.batchCountC,
        render: (text) => text,
      },
    ],
  },
  {
    title: "进场人次变化率",
    dataIndex: "inCountChangeRate",
    key: "inCountChangeRate",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: "进场人数变化率",
    dataIndex: "inNumChangeRate",
    key: "inNumChangeRate",
    width: 120,
    align: "center",
    render: (text) => text,
  },
  {
    title: "客流批次变化率",
    dataIndex: "batchCountChangeRate",
    key: "batchCountChangeRate",
    width: 120,
    align: "center",
    render: (text) => text,
  },
];

export const timeAgeAttrColumns = [
  {
    title: Language.CHURUKOUMINGCHENG,
    dataIndex: "doorName",
    key: "doorName",
    width: 150,
    align: "center",
    render: (text) => text || "-",
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.ZHIDINGSHIJIAN,
    children: [
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        key: "gender",
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
      {
        title: Language.YINGERSUI, // 婴儿(6岁以下)
        dataIndex: "toddlerA",
        key: "toddlerA",
        width: 120,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.ERTONGSUI, // 儿童(7-12岁)
        dataIndex: "childA",
        key: "childA",
        width: 120,

        align: "center",

        render: (text) => text,
      },
      // {
      //   title: Language.SHAONIANSUI, // 少年(13-17岁)
      //   dataIndex: "teenagerA",
      //   key: "teenagerA",
      //   width: 120,

      //   align: "center",

      //   render: (text) => text,
      // },
      {
        title: Language.QINGNIANSUI, // 青年(18-29岁)
        dataIndex: "youngAdultA",
        key: "youngAdultA",
        width: 120,

        align: "center",

        render: (text) => text,
      },
      {
        title: Language.ZHUANGNIANSUI, // 壮年(30-50岁)
        dataIndex: "middleAgeA",
        key: "middleAgeA",
        width: 140,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.ZHONGLAONIANSUI, // 中老年(51岁以上)
        dataIndex: "elderlyA",
        key: "elderlyA",
        width: 140,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "ageUnknownA",
        key: "ageUnknownA",
        width: 120,
        align: "center",

        render: (text) => text,
      },
    ],
  },
  {
    title: Language.DUIBISHIJIAN,
    children: [
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        key: "gender",
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
      {
        title: Language.YINGERSUI, // 婴儿(6岁以下)
        dataIndex: "toddlerC",
        key: "toddlerC",
        width: 120,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.ERTONGSUI, // 儿童(7-12岁)
        dataIndex: "childC",
        key: "childC",
        width: 120,
        align: "center",

        render: (text) => text,
      },
      // {
      //   title: Language.SHAONIANSUI, // 少年(13-17岁)
      //   dataIndex: "teenagerC",
      //   key: "teenagerC",
      //   width: 120,
      //   align: "center",

      //   render: (text) => text,
      // },
      {
        title: Language.QINGNIANSUI, // 青年(18-29岁)
        dataIndex: "youngAdultC",
        key: "youngAdultC",
        width: 120,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.ZHUANGNIANSUI, // 壮年(30-50岁)
        dataIndex: "middleAgeC",
        key: "middleAgeC",
        align: "center",
        width: 140,
        render: (text) => text,
      },
      {
        title: Language.ZHONGLAONIANSUI, // 中老年(51岁以上)
        dataIndex: "elderlyC",
        key: "elderlyC",
        width: 140,
        align: "center",

        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "ageUnknownC",
        key: "ageUnknownC",
        width: 120,
        align: "center",
        render: (text) => text,
      },
    ],
  },
];

export const timeMoodAttrColumns = [
  {
    title: Language.CHURUKOUMINGCHENG,
    dataIndex: "doorName",
    key: "doorName",
    width: 150,
    align: "center",
    render: (text) => text || "-",
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.ZHIDINGSHIJIAN,
    children: [
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        key: "gender",
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
      {
        title: Language.FENNU, // 愤怒
        dataIndex: "angerA",
        key: "angerA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.BEISHANG, // 悲伤
        dataIndex: "sadnessA",
        key: "sadnessA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.YANWU, // 厌恶
        dataIndex: "disgustA",
        key: "disgustA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.HAIPA, // 害怕
        dataIndex: "fearA",
        key: "fearA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.JINGYA, // 惊讶
        dataIndex: "surpriseA",
        key: "surpriseA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.PINGJING, // 平静
        dataIndex: "calmA",
        key: "calmA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.GAOXIN, // 高兴
        dataIndex: "happyA",
        key: "happyA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.KUNHUO, // 困惑
        dataIndex: "confusedA",
        key: "confusedA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "faceUnknownA",
        key: "faceUnknownA",
        width: 100,
        align: "center",
        render: (text) => text,
      },
    ],
  },
  {
    title: Language.DUIBISHIJIAN,
    children: [
      {
        title: Language.XINGBIE,
        dataIndex: "gender",
        key: "gender",
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
      {
        title: Language.FENNU, // 愤怒
        dataIndex: "angerC",
        key: "angerC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.BEISHANG, // 悲伤
        dataIndex: "sadnessC",
        key: "sadnessC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.YANWU, // 厌恶
        dataIndex: "disgustC",
        key: "disgustC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.HAIPA, // 害怕
        dataIndex: "fearC",
        key: "fearC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.JINGYA, // 惊讶
        dataIndex: "surpriseC",
        key: "surpriseC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.PINGJING, // 平静
        dataIndex: "calmC",
        key: "calmC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.GAOXIN, // 高兴
        dataIndex: "happyC",
        key: "happyC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.KUNHUO, // 困惑
        dataIndex: "confusedC",
        key: "confusedC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
      {
        title: Language.WEIZHI, // 未知
        dataIndex: "faceUnknownC",
        key: "faceUnknownC",
        width: 100,
        align: "center",
        render: (text) => text,
      },
    ],
  },
];

// 为了向后兼容，保留原来的 columns 导出
export const columns = flowDetailColumns;

// /**
//  * 根据columns配置和指定长度生成数组对象
//  * @param {Array} columns - 列配置数组
//  * @param {number} x - 数组长度
//  * @returns {Array} 生成的数组对象，每个对象包含key值(index)和其他columns的key值作为属性
//  */
// export const generateArrayFromColumns = (columns, x) => {
//   // 提取所有columns中的key值
//   const extractKeys = (cols) => {
//     const keys = [];
//     cols.forEach((col) => {
//       if (col.key) {
//         keys.push(col.key);
//       }
//       if (col.children && Array.isArray(col.children)) {
//         keys.push(...extractKeys(col.children));
//       }
//     });
//     return keys;
//   };

//   const allKeys = extractKeys(columns);

//   // 生成指定长度的数组
//   return Array.from({ length: x }, (_, index) => {
//     const obj = { key: index };
//     allKeys.forEach((key) => {
//       obj[key] = null; // 或者可以根据需要设置默认值
//     });
//     return obj;
//   });
// };
