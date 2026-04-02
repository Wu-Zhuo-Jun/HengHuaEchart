import React, { useState, useEffect, use } from "react";
import { FlowStatsPanel } from "../../components/common/panels/FlowStatsPanel";
import {
  GroupFlowCompareLineChartPanel,
  WeekWorkAnalysisLineBarChartPanel,
  SiteHeatMapChartPanel,
  CustomerAttrBarChartPanel,
  CustomerMoodRadarChartPanel,
  CustomerPortraitCompareBarChartPanel,
  CustomerMoodCompareBarChartPanel,
  CompetitiveAnalysisScatterChartPanel,
} from "../../components/common/panels/ChartPanel";
import { GroupSiteRankingPanel } from "../../components/common/panels/StatsPanel";
import { Language } from "../../language/LocaleContext";
import { FlowDetailTable } from "../../components/common/tables/Table";
import { Select, Table, Tabs } from "antd";

import "../../assets/styles/public.css";
import styles from "./GroupAnalysis.module.css";
import { UIPanel, UITable } from "../../components/ui/UIComponent";
import { DataTable } from "../../components/common/tables/Table";
import TimeUtils from "../../utils/TimeUtils";
import TableUtils from "../../utils/TableUtils";

const GroupAnalysis = () => {
  const [statsData, setStatsData] = useState([]);
  const [groupFlowCompareData, setGroupFlowCompareData] = useState(null);
  const [mainGroupList, setMainGroupList] = useState(null);
  const [targetGroupList, setTargetGroupList] = useState(null);
  const [siteRankingData, setSiteRankingData] = useState(null);
  const [workWeekAnalysisData, setWorkWeekAnalysisData] = useState(null);
  const [siteHeatMapData, setSiteHeatMapData] = useState(null);
  const [customerAttrData, setCustomerAttrData] = useState(null);
  const [customerMoodData, setCustomerMoodData] = useState(null);
  const [customerPortraitData, setCustomerPortraitData] = useState(null);
  const [customerMoodCompareData, setCustomerMoodCompareData] = useState(null);
  const [flowDetailTableData, setFlowDetailTableData] = useState(null);
  const [customerAgeTableData, setCustomerAgeTableData] = useState(null);
  const [customerMoodTableData, setCustomerMoodTableData] = useState(null);

  const initData = () => {
    setStatsData(getFlowStatsData());
    setGroupFlowCompareData(getGroupFlowCompareData());
    setMainGroupList(getMainGroupList());
    setTargetGroupList(getTargetGroupList());
    setSiteRankingData(getSiteRankingData());
    setWorkWeekAnalysisData(getWorkWeekAnalysisData());
    setSiteHeatMapData(getSiteHeatMapData());
    setCustomerAttrData(getCustomeAttrData());
    setCustomerMoodData(getCustomeMoodData());
    setCustomerPortraitData(getSiteCustomerPortraitData());
    setCustomerMoodCompareData(getSiteCustomerMoodData());
    setFlowDetailTableData(getFlowDetailsData());
    setCustomerAgeTableData(getCustomerAgeTableData());
    setCustomerMoodTableData(getCustomerMoodTableData());
  };

  useEffect(() => {
    initData();
  }, []);

  const getFlowStatsData = () => {
    let stats = [
      { val: 1000, qoq: 10, yoy: -10, type: "inCount" },
      { val: 1000, qoq: 0, yoy: 20, type: "inNum" },
      { val: 1000, qoq: 10, yoy: 10, type: "batchCount" },
      { val: 1000, qoq: 10, yoy: 5, type: "outCount" },
      { val: 1000, qoq: 10, yoy: 8, type: "outsideCount" },
      { val: 1000, qoq: 10, yoy: 10, type: "collectCount" },
      { val: 1000, qoq: 10, yoy: -20, type: "inRate" },
    ];
    return stats;
  };

  const getGroupFlowCompareData = () => {
    var xAxis = new Array();
    var yAxis1 = new Array();
    var yAxis2 = new Array();
    var yAxis3 = new Array();
    for (let i = 1; i <= 24; i++) {
      xAxis.push(`${i}:00`);
      yAxis1.push(Math.ceil(Math.random() * 1000));
      yAxis2.push(Math.ceil(Math.random() * 1000));
    }
    var legend = [Language.ZHIDINGJITUAN, Language.DUIBIJITUAN];
    var series = [yAxis1, yAxis2];
    let data = {
      legend: legend,
      xAxis: xAxis,
      series: series,
    };
    return data;
  };

  const getMainGroupList = () => {
    let groups = [
      { label: "集团1", value: 1 },
      { label: "集团2", value: 2 },
      { label: "集团3", value: 3 },
    ];
    return groups;
  };

  const getTargetGroupList = () => {
    let groups = [
      { label: "集团3", value: 3 },
      { label: "集团4", value: 4 },
      { label: "集团5", value: 5 },
    ];
    return groups;
  };

  const getSiteRankingData = () => {
    let columns = [
      { title: Language.PAIMING, key: "ranking" },
      { title: Language.SUOSHUJITUAN, key: "groupName" },
      { title: Language.CHANGDIMINGMINGCHENG, key: "siteName" },
      { title: Language.XINGBIEFENBU, key: "genderRate" },
      { title: Language.JINCHANGRENCI, key: "pInCount" },
      { title: Language.JINCHANGRENSHU, key: "pInNum" },
      { title: Language.KELIUPICI, key: "batchCount" },
      { title: Language.JIKELIPINGFANG, key: "collectCount" },
      { title: Language.JINCHANGLV, key: "inRate" },
    ];
    let dataSource = [
      {
        key: 1,
        ranking: 1,
        groupName: "集团1",
        siteName: "站点1",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 2,
        ranking: 2,
        groupName: "集团2",
        siteName: "站点2",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 3,
        ranking: 3,
        groupName: "集团3",
        siteName: "站点3",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 4,
        ranking: 4,
        groupName: "集团4",
        siteName: "站点4",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 5,
        ranking: 5,
        groupName: "集团5",
        siteName: "站点5",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 6,
        ranking: 6,
        groupName: "集团6",
        siteName: "站点6",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 7,
        ranking: 7,
        groupName: "集团7",
        siteName: "站点7",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 8,
        ranking: 8,
        groupName: "集团8",
        siteName: "站点8",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 9,
        ranking: 9,
        groupName: "集团9",
        siteName: "站点9",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
      {
        key: 10,
        ranking: 10,
        groupName: "集团10",
        siteName: "站点10",
        genderRate: { maleRate: 20, femaleRate: 60, unknowRate: 20 },
        pInCount: "1000",
        pInNum: "1000",
        batchCount: "1000",
        collectCount: "1000",
        inRate: "1000",
      },
    ];
    return { columns, dataSource };
  };

  const getWorkWeekAnalysisData = () => {
    let xAxis = [Language.GONGZUORI, Language.ZHOUMO];
    let avgInCount = [1000, 2000];
    let avgInNum = [500, 10000];
    let avgBatchCount = [100, 200];
    let data = {
      xAxis: xAxis,
      data1: avgInCount,
      data2: avgInNum,
      data3: avgBatchCount,
    };
    return data;
  };

  const getSiteHeatMapData = () => {
    let yAxis = ["站点1", "站点2", "站点3", "站点4", "站点5", "站点6", "站点7", "站点8", "站点9", "站点10"];
    let xAxis = new Array();
    for (let i = 0; i < 24; i++) {
      xAxis.push(`${i}:00`);
    }
    var data = Array();
    var max = 0;
    for (let i = 0; i < xAxis.length; i++) {
      for (let j = 0; j < yAxis.length; j++) {
        let v = Math.ceil(Math.random() * 1000);
        let d = [i, j, v];
        max = Math.max(max, v);
        data.push(d);
      }
    }
    return { xAxis, yAxis, data, max };
  };

  const getCustomeAttrData = () => {
    var customerAttr = {
      maleData: [20, 302, 400, 300, 50, 70, 100],
      femaleData: [10, 100, 60, 300, 150, 30, 40],
      maleRate: 30,
      femaleRate: 70,
    };
    return customerAttr;
  };

  const getCustomeMoodData = () => {
    var customerMood = {
      unknowData: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ],
      maleData: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ],
      femaleData: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 100,
      ],
    };
    return customerMood;
  };

  const getSiteCustomerPortraitData = () => {
    const sites = [
      { siteName: "站点1", gender: { 1: 20, 2: 60, 3: 20 }, age: { 1: 5, 2: 10, 3: 10, 4: 10, 5: 10, 6: 50 } },
      { siteName: "站点2", gender: { 1: 20, 2: 60, 3: 20 }, age: { 1: 5, 2: 10, 3: 10, 4: 10, 5: 10, 6: 50 } },
      { siteName: "站点3", gender: { 1: 20, 2: 60, 3: 20 }, age: { 1: 5, 2: 10, 3: 10, 4: 10, 5: 10, 6: 50 } },
      { siteName: "站点4", gender: { 1: 20, 2: 60, 3: 20 }, age: { 1: 5, 2: 10, 3: 10, 4: 10, 5: 10, 6: 50 } },
      { siteName: "站点5", gender: { 1: 20, 2: 60, 3: 20 }, age: { 1: 5, 2: 10, 3: 10, 4: 10, 5: 10, 6: 50 } },
    ];

    let siteNameArr = [];
    sites.map((site) => {
      siteNameArr.push(site.siteName);
    });

    let genders = [
      { title: Language.NAN, gender: 1 },
      { title: Language.NV, gender: 2 },
      { title: Language.WEIZHI, gender: 3 },
    ];
    let ages = [
      { title: Language.YINGER, age: 1 },
      { title: Language.ERTONG, age: 2 },
      { title: Language.SHAONIAN, age: 3 },
      { title: Language.QINGNIAN, age: 4 },
      { title: Language.ZHUANGNIAN, age: 5 },
      { title: Language.ZHONGLAONIAN, age: 6 },
    ];

    let genderArr = [];
    for (let i = 0; i < genders.length; i++) {
      let gender = genders[i];
      let data = {
        title: gender.title,
        data: [],
      };
      sites.map((site) => {
        data.data.push(site.gender[gender.gender]);
      });
      genderArr.push(data);
    }

    let ageArr = [];
    for (let i = 0; i < ages.length; i++) {
      let age = ages[i];
      let data = {
        title: age.title,
        data: [],
      };
      sites.map((site) => {
        data.data.push(site.age[age.age]);
      });
      ageArr.push(data);
    }

    let data = { site: siteNameArr, gender: genderArr, age: ageArr };
    return data;
    // return {genderArr,ageArr};
  };

  const getSiteCustomerMoodData = () => {
    const sites = [
      { siteName: "站点1", male: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 }, female: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 } },
      { siteName: "站点2", male: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 }, female: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 } },
      { siteName: "站点3", male: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 }, female: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 } },
      { siteName: "站点4", male: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 }, female: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 } },
      { siteName: "站点5", male: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 }, female: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 10, 7: 10, 8: 20, 9: 10 } },
    ];

    let faces = [
      { title: Language.FENNU, face: 1 },
      { title: Language.KUNHUO, face: 2 },
      { title: Language.GAOXIN, face: 3 },
      { title: Language.PINGJING, face: 4 },
      { title: Language.JINGYA, face: 5 },
      { title: Language.HAIPA, face: 6 },
      { title: Language.YANWU, face: 7 },
      { title: Language.BEISHANG, face: 8 },
      { title: Language.WEIZHI, face: 9 },
    ];

    let siteNameArr = [];
    sites.map((site) => {
      siteNameArr.push(site.siteName);
    });
    let maleArr = [];
    let femaleArr = [];
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      let maleData = {
        title: face.title,
        data: [],
      };
      let femaleData = {
        title: face.title,
        data: [],
      };
      sites.map((site) => {
        maleData.data.push(site.male[face.face]);
        femaleData.data.push(site.female[face.face]);
      });
      maleArr.push(maleData);
      femaleArr.push(femaleData);
    }
    return { site: siteNameArr, male: maleArr, female: femaleArr };
  };

  const getFlowDetailsData = () => {
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
    ];
    let timeStamp = 1746028800;
    groupList.map((item, index) => {
      item.date = timeStamp;
      timeStamp += 3600;
    });
    return { columns, dataSource: groupList };
  };

  const getCustomerAgeTableData = () => {
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
      { key: 1, groupName: "集团1", date: "00:00-01:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 2, groupName: "集团1", date: "00:00-01:00", gender: 2, inCount: 900, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 3, groupName: "集团1", date: "00:00-01:00", gender: 3, inCount: 800, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 4, groupName: "集团2", date: "01:00-02:00", gender: 1, inCount: 700, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 5, groupName: "集团2", date: "01:00-02:00", gender: 2, inCount: 600, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 6, groupName: "集团2", date: "01:00-02:00", gender: 3, inCount: 500, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 7, groupName: "集团3", date: "02:00-03:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 8, groupName: "集团3", date: "02:00-03:00", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 9, groupName: "集团3", date: "02:00-03:00", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 10, groupName: "集团4", date: "03:00-04:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 11, groupName: "集团4", date: "03:00-04:00", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 12, groupName: "集团4", date: "03:00-04:00", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 13, groupName: "集团5", date: "04:00-05:00", gender: 1, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 14, groupName: "集团5", date: "04:00-05:00", gender: 2, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
      { key: 15, groupName: "集团5", date: "04:00-05:00", gender: 3, inCount: 1000, yinger: 100, ertong: 100, shaonian: 100, qingnian: 100, zhuangnian: 100, zhonglaonian: 100, unknow: 100 },
    ];
    let timeStamp = 1746028800;
    groupList.map((item, index) => {
      item.date = timeStamp;
      if ((index + 1) % 3 == 0) {
        timeStamp += 3600;
      }
    });
    return { columns, dataSource: groupList };
  };

  const getCustomerMoodTableData = () => {
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
    return { columns, dataSource: groupList };
  };

  // const handleTableChange = (pagination, filters, sorter, extra) => {
  //     const currentData = TableUtils.getDataSourceSlice(extra.currentDataSource,pagination.current,pagination.pageSize);
  //     TableUtils.mergeRows(currentData, 'date', 'groupName');
  // }

  const tabItems = [
    {
      key: "1",
      label: Language.KELIUMINGXI,
      children: <DataTable columns={flowDetailTableData ? flowDetailTableData.columns : []} dataSource={flowDetailTableData ? flowDetailTableData.dataSource : []} />,
    },
    {
      key: "2",
      label: Language.NIANLINGSHUXING,
      children: (
        <DataTable mergeColumns={["date", "groupName"]} columns={customerAgeTableData ? customerAgeTableData.columns : []} dataSource={customerAgeTableData ? customerAgeTableData.dataSource : []} />
      ),
    },
    {
      key: "3",
      label: Language.XINQINGSHUXING,
      children: (
        <DataTable
          mergeColumns={["date", "groupName"]}
          columns={customerMoodTableData ? customerMoodTableData.columns : []}
          dataSource={customerMoodTableData ? customerMoodTableData.dataSource : []}
        />
      ),
    },
  ];

  return (
    <div className="main">
      <FlowStatsPanel data={statsData} />
      <GroupFlowCompareLineChartPanel style={{ width: "100%", minHeight: "352px" }} data={groupFlowCompareData} mainGroupList={mainGroupList} targetGroupList={targetGroupList} />
      <GroupSiteRankingPanel style={{ width: "100%", minHeight: "593px" }} data={siteRankingData} />
      <CompetitiveAnalysisScatterChartPanel style={{ width: "100%", minHeight: "457px" }} />
      <div className="dual-row">
        <WeekWorkAnalysisLineBarChartPanel className="dual-row-content" data={workWeekAnalysisData} />
        <SiteHeatMapChartPanel className="dual-row-content" data={siteHeatMapData} />
      </div>
      <div className="dual-row">
        <CustomerAttrBarChartPanel className="dual-row-content" data={customerAttrData} />
        <CustomerMoodRadarChartPanel className="dual-row-content" data={customerMoodData} />
      </div>
      <div className="dual-row" style={{ minHeight: "697px" }}>
        <CustomerPortraitCompareBarChartPanel title={Language.KEQUNHUAXIANGDUIBI} className="dual-row-content" data={customerPortraitData} />
        <CustomerMoodCompareBarChartPanel title={Language.KEQUNXINQINGDUIBI} className="dual-row-content" data={customerMoodCompareData} />
      </div>
      <div style={{ width: "100%", minHeight: "800px" }}>
        <UIPanel title={Language.SHUJUXIANGQING}>
          <Tabs items={tabItems} />
        </UIPanel>
      </div>
    </div>
  );
};

export default GroupAnalysis;
