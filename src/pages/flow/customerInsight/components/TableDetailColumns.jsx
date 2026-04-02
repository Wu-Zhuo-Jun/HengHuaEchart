import { Language } from "@/language/LocaleContext";

// 顾客洞察-性别属性
export const genderAttrColumns = [
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
    title: Language.NAN, // 男
    dataIndex: "maleNum",
    key: "maleNum",
    width: 200,
    align: "center",
    ellipsis: true,
    render: (text) => text,
  },
  {
    title: Language.NV, // 女
    dataIndex: "femaleNum",
    key: "femaleNum",
    width: 200,
    align: "center",
    ellipsis: true,
    render: (text) => text,
  },
];

// 顾客洞察-年龄属性
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

// 为了向后兼容，保留原来的 columns 导出
export const columns = {
  genderAttrColumns,
  ageAttrColumns,
};
