import { Language } from "@/language/LocaleContext";

// 外部分析
export const offSenceAnalyseColumns = [
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
    onCell: (record, index) => ({ rowSpan: record._rowSpan || 1 }),
  },
  {
    title: Language.GUODIANKELIU, // 过店客流
    dataIndex: "storeOutNum",
    key: "storeOutNum",
    width: 200,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a.storeOutNum || 0) - (b.storeOutNum || 0),
    render: (text) => text || 0,
  },
  {
    title: Language.CHANGWAIKELIU, // 场外客流
    dataIndex: "siteOutNum",
    key: "siteOutNum",
    width: 200,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => (a.siteOutNum || 0) - (b.siteOutNum || 0),
    render: (text) => text || 0,
  },
  {
    title: Language.JINCHANGRENCI, // 进场人次
    dataIndex: "inSiteCount",
    key: "inSiteCount",
    width: 200,
    align: "center",
    sorter: (a, b) => (a.inSiteCount || 0) - (b.inSiteCount || 0),
    render: (text) => text || 0,
  },
  {
    title: Language.JINCHANGRENSHU, // 进场人数
    dataIndex: "inSiteNum",
    key: "inSiteNum",
    width: 200,
    align: "center",
    sorter: (a, b) => (a.inSiteNum || 0) - (b.inSiteNum || 0),
    render: (text) => text || 0,
  },
  {
    title: Language.JINDIANLV, // 进店率
    dataIndex: "storeEntryRate",
    key: "storeEntryRate",
    width: 200,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => {
      const aValue = typeof a.storeEntryRate === "string" ? parseFloat(a.storeEntryRate) || 0 : a.storeEntryRate || 0;
      const bValue = typeof b.storeEntryRate === "string" ? parseFloat(b.storeEntryRate) || 0 : b.storeEntryRate || 0;
      return aValue - bValue;
    },
    render: (text) => (text ? `${text}%` : "0%"),
  },
  {
    title: Language.JINCHANGLV, // 进场率
    dataIndex: "siteEntryRate",
    key: "siteEntryRate",
    width: 200,
    align: "center",
    ellipsis: true,
    sorter: (a, b) => {
      const aValue = typeof a.siteEntryRate === "string" ? parseFloat(a.siteEntryRate) || 0 : a.siteEntryRate || 0;
      const bValue = typeof b.siteEntryRate === "string" ? parseFloat(b.siteEntryRate) || 0 : b.siteEntryRate || 0;
      return aValue - bValue;
    },
    render: (text) => (text ? `${text}%` : "0%"),
  },
];

export const getOffSenceAnalyseColumns = (baseType) => {
  if (baseType === "ALL") {
    // baseType=ALL 时，不展示场外客流和进场率
    return offSenceAnalyseColumns.filter((col) => col.key !== "siteOutNum" && col.key !== "siteEntryRate");
  } else if (baseType === "OS") {
    // baseType=OS 时，不展示店外客流和进店率
    return offSenceAnalyseColumns.filter((col) => col.key !== "storeOutNum" && col.key !== "storeEntryRate");
  }
  return offSenceAnalyseColumns;
};
