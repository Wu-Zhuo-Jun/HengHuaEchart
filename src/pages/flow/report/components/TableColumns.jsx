import Constant from "@/common/Constant";
import User from "@/data/UserData";
import { Language } from "@/language/LocaleContext";
import React from "react";

export const customerAgeColumns = () => {
  const props = ["yinger", "ertong", "qingnian", "zhuangnian", "zhonglaonian", "unknow"];
  const columns = [
    {
      title: Language.RIQI,
      key: "date",
      dataIndex: "date",
      align: "center",
      // render: (text, record, index) => <div>{record.date}</div>,
      showSorterTooltip: false,
      sorter: (a, b) => a.dataTime - b.dataTime,
      onCell: (record, index) => ({ rowSpan: record._rowSpan }),
    },
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
    { title: Language.YINGERSUI, dataIndex: [props[0]], align: "center" },
    { title: Language.ERTONGSUI, dataIndex: [props[1]], align: "center" },
    { title: Language.QINGNIANSUI, dataIndex: [props[2]], align: "center" },
    { title: Language.ZHUANGNIANSUI, dataIndex: [props[3]], align: "center" },
    { title: Language.ZHONGLAONIANSUI, dataIndex: [props[4]], align: "center" },
    { title: Language.WEIZHI, dataIndex: [props[5]], align: "center" },
  ];
  return columns;
};

export const customerMoodColumns = () => {
  const props = ["fennu", "kunhuo", "gaoxin", "pingjing", "jingya", "haipa", "yanwu", "beishang", "unknow"];
  const columns = [
    {
      title: Language.RIQI,
      key: "date",
      dataIndex: "date",
      align: "center",
      // render: (text, record, index) => <div>{record.date}</div>,
      showSorterTooltip: false,
      sorter: (a, b) => a.dataTime - b.dataTime,
      onCell: (record, index) => ({ rowSpan: record._rowSpan }),
    },
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
    { title: Language.JINCHANGRENCI, dataIndex: "inCount", align: "center" },
    { title: Language.FENNU, dataIndex: props[0], align: "center" },
    { title: Language.KUNHUO, dataIndex: props[1], align: "center" },
    { title: Language.GAOXIN, dataIndex: props[2], align: "center" },
    { title: Language.PINGJING, dataIndex: props[3], align: "center" },
    { title: Language.JINGYA, dataIndex: props[4], align: "center" },
    { title: Language.HAIPA, dataIndex: props[5], align: "center" },
    { title: Language.YANWU, dataIndex: props[6], align: "center" },
    { title: Language.BEISHANG, dataIndex: props[7], align: "center" },
    { title: Language.WEIZHI, dataIndex: props[8], align: "center" },
  ];
  return columns;
};

export const flowColumns = () => {
  let columns = [
    {
      title: Language.RIQI,
      key: "date",
      dataIndex: "date",
      align: "center",
      // render: (text, record, index) => <div>{record.date}</div>,
      showSorterTooltip: false,
      sorter: (a, b) => a.dataTime - b.dataTime,
    },
    { title: Language.JINCHANGRENCI, key: "inCount", dataIndex: "inCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.inCount - b.inCount },
    { title: Language.JINCHANGRENSHU, key: "inNum", dataIndex: "inNum", align: "center", showSorterTooltip: false, sorter: (a, b) => a.inNum - b.inNum },
    // { title: Language.CHUCHANGRENCI, key: "outCount", dataIndex: "outCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.outCount - b.outCount },
  ];
  if(User.checkMasterPermission(Constant.MASTER_POWER.OUT_COUNT)){
    columns.push({ title: Language.CHUCHANGRENCI, key: "outCount", dataIndex: "outCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.outCount - b.outCount });
  }
  columns = [
    ...columns,
    { title: Language.KELIUPICI, key: "batchCount", dataIndex: "batchCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.batchCount - b.batchCount },
    { title: Language.JIKELIPINGFANG, key: "collectCount", dataIndex: "collectCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.collectCount - b.collectCount },
    { title: Language.CHANGWAIKELIU, key: "outsideCount", dataIndex: "outsideCount", align: "center", showSorterTooltip: false, sorter: (a, b) => a.outsideCount - b.outsideCount },
    {
      title: Language.JINCHANGLV,
      key: "inRateDesc",
      dataIndex: "inRateDesc",
      align: "center",
      showSorterTooltip: false,
      sorter: (a, b) => a.inRate - b.inRate,
      render: (text, record, index) => <div>{record.inRateDesc}</div>,
    },
  ];
  return columns;
};

export const doorRankingColumns = () => {
  const columns = [
    { title: Language.PAIMING, key: "ranking" },
    { title: Language.CHURUKOU, key: "name" },
    { title: Language.JINCHANGRENCI, key: "inCount" },
    { title: Language.JINCHANGRENSHU, key: "inNum" },
    { title: Language.KELIUPICI, key: "batchCount" },
    { title: Language.HUANBI, key: "qoq" },
    { title: Language.ZHANBI, key: "ratio" },
  ];
  return columns;
};
