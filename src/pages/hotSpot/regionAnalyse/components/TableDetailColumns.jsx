import { Language } from "@/language/LocaleContext";

// 客流明细表 - 客流明细：日期、区域名称、区域人次、区域人数、区域批次、域外客流、到访率
export const passengerDetailColumns = [
  {
    title: Language.RIQI, // 日期
    dataIndex: "date",
    key: "date",
    width: 160,
    align: "center",
    sorter: (a, b) => a.date?.unix?.() - b.date?.unix?.() || 0,
    fixed: "left",
    render: (text, record) =>
      record.isSameDay
        ? `${record.date.format("HH:mm")}-${record.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : record.date.add(1, "hour").format("HH:mm")}`
        : `${record?.date ? record?.date?.format("MM-DD") : ""}`,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.QUYUMINGCHENG, // 区域名称
    dataIndex: "regionName",
    key: "regionName",
    width: 150,
    align: "center",
    fixed: "left",
    render: (text) => text,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.QUYURENCI, // 区域人次
    dataIndex: "regionVisits",
    key: "regionVisits",
    width: 120,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.QUYURENSHU, // 区域人数
    dataIndex: "regionPeople",
    key: "regionPeople",
    width: 120,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.QUYUPICI, // 区域批次
    dataIndex: "regionBatches",
    key: "regionBatches",
    width: 120,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.CHANGWAIKELIU, // 域外客流
    dataIndex: "outsideFlow",
    key: "outsideFlow",
    width: 120,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.DAOFANGLV, // 到访率
    dataIndex: "visitRate",
    key: "visitRate",
    width: 100,
    align: "center",
    render: (text) => (text !== undefined && text !== null ? `${text}%` : "-"),
  },
];

// 画像属性表 - 画像属性：日期、区域名称、性别、总计、婴儿、儿童、青年、壮年、中老年、未知
export const profileAttrColumns = [
  {
    title: Language.RIQI, // 日期
    dataIndex: "date",
    key: "date",
    width: 160,
    align: "center",
    sorter: (a, b) => a.date?.unix?.() - b.date?.unix?.() || 0,
    fixed: "left",
    render: (text, record) =>
      record.isSameDay
        ? `${record.date.format("HH:mm")}-${record.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : record.date.add(1, "hour").format("HH:mm")}`
        : `${record?.date ? record?.date?.format("MM-DD") : ""}`,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.QUYUMINGCHENG, // 区域名称
    dataIndex: "regionName",
    key: "regionName",
    width: 150,
    align: "center",
    fixed: "left",
    render: (text) => text,
    onCell: (record, index) => ({ rowSpan: record._rowSpan }),
  },
  {
    title: Language.XINGBIE, // 性别
    dataIndex: "gender",
    key: "gender",
    width: 100,
    align: "center",
    render: (value) => {
      let gender = Language.NAN;
      if (value == 2) {
        gender = Language.NV;
      } else if (value == 3) {
        gender = Language.ZONGSHU;
      }
      return <div>{gender}</div>;
    },
  },

  {
    title: Language.YINGERSUI, // 婴儿
    dataIndex: "toddler",
    key: "toddler",
    width: 100,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.ERTONGSUI, // 儿童
    dataIndex: "child",
    key: "child",
    width: 100,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.QINGNIANSUI, // 青年
    dataIndex: "youngAdult",
    key: "youngAdult",
    width: 100,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.ZHUANGNIANSUI, // 壮年
    dataIndex: "middleAge",
    key: "middleAge",
    width: 100,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.ZHONGLAONIANSUI, // 中老年
    dataIndex: "elderly",
    key: "elderly",
    width: 100,
    align: "center",
    render: (text) => text ?? "-",
  },
  {
    title: Language.WEIZHI, // 未知
    dataIndex: "unknown",
    key: "unknown",
    width: 100,
    align: "center",
    render: (text) => text ?? "-",
  },
];

// 为了向后兼容，保留原来的导出
export const columns = {
  passengerDetailColumns,
  profileAttrColumns,
};

// 旧的导出别名（保持兼容性）
export const genderAttrColumns = passengerDetailColumns;
export const ageAttrColumns = profileAttrColumns;
