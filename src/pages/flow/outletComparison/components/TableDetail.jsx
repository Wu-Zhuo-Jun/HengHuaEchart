import React, { useMemo, useState, useCallback, useEffect } from "react";
import "../index.less";
import { Tabs, Button, Space, Tooltip, message } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Language } from "@/language/LocaleContext";
import { flowDetailColumns, ageAttrColumns, moodAttrColumns, timeFlowAttrColumns, timeAgeAttrColumns, timeMoodAttrColumns } from "./TableDetailColumns";
import { UIPanel } from "@/components/ui/UIComponent";
import { CommonDataTable } from "@/components/common/tables/Table";
import TableUtils from "@/utils/TableUtils";
import ExportUtils from "@/utils/ExportUtils";

export const TableDetail = React.memo(({ data, loading = false, onRefresh, flowData, faceTableData, type = "outlet", timeRange, doorNameListA = "", doorNameListC = "" }) => {
  const [activeKey, setActiveKey] = useState("1");

  const onChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  const handleTimeFlowAttrColumns = useMemo(() => {
    let columnsCopy = [];
    if (type === "outlet") {
      // 使用浅拷贝避免丢失函数
      columnsCopy = flowDetailColumns.map((column) => ({ ...column }));

      columnsCopy[1].title = `${Language.ZHIDINGCHURUKOU}  (${doorNameListA.slice(0, 10)}${doorNameListA.length > 10 ? "..." : ""})`;
      columnsCopy[2].title = `${Language.DUIBICHURUKOU}  (${doorNameListC.slice(0, 10)}${doorNameListC.length > 10 ? "..." : ""})`;
      return columnsCopy;
    }
    if (type === "time") {
      // 使用浅拷贝避免丢失函数
      columnsCopy = timeFlowAttrColumns.map((column) => ({ ...column }));
      if (Array.isArray(flowData) && flowData[0]) {
        columnsCopy[1].title = `${Language.ZHIDINGSHIJIAN}  (${flowData[0].timeA})`;
        columnsCopy[2].title = `${Language.DUIBISHIJIAN}  (${flowData[0].timeC})`;
        return columnsCopy;
      }
      return columnsCopy;
    }
  }, [flowData, type]);

  const handleTimeAgeAttrColumns = useMemo(() => {
    let columnsCopy = [];
    if (type === "outlet") {
      // 使用浅拷贝避免丢失函数
      columnsCopy = ageAttrColumns.map((column) => ({ ...column }));

      columnsCopy[1].title = `${Language.ZHIDINGCHURUKOU}  (${doorNameListA.slice(0, 10)}${doorNameListA.length > 10 ? "..." : ""})`;
      columnsCopy[2].title = `${Language.DUIBICHURUKOU}  (${doorNameListC.slice(0, 10)}${doorNameListC.length > 10 ? "..." : ""})`;
      return columnsCopy;
    }
    if (type === "time") {
      // 使用浅拷贝避免丢失函数
      columnsCopy = timeAgeAttrColumns.map((column) => ({ ...column }));
      if (Array.isArray(faceTableData) && faceTableData[0]) {
        columnsCopy[1].title = `${Language.ZHIDINGSHIJIAN}  (${faceTableData[0].timeA})`;
        columnsCopy[2].title = `${Language.DUIBISHIJIAN}  (${faceTableData[0].timeC})`;
        return columnsCopy;
      }
      return columnsCopy;
    }
  }, [faceTableData]);

  const handleTimeMoodAttrColumns = useMemo(() => {
    let columnsCopy = [];
    if (type === "outlet") {
      // 使用浅拷贝避免丢失函数
      columnsCopy = moodAttrColumns.map((column) => ({ ...column }));
      columnsCopy[1].title = `${Language.ZHIDINGCHURUKOU}  (${doorNameListA.slice(0, 10)}${doorNameListA.length > 10 ? "..." : ""})`;
      columnsCopy[2].title = `${Language.DUIBICHURUKOU}  (${doorNameListC.slice(0, 10)}${doorNameListC.length > 10 ? "..." : ""})`;
      return columnsCopy;
    }
    if (type === "time") {
      // 使用浅拷贝避免丢失函数
      const columnsCopy = timeMoodAttrColumns.map((column) => ({ ...column }));
      if (Array.isArray(faceTableData) && faceTableData[0]) {
        columnsCopy[1].title = `${Language.ZHIDINGSHIJIAN}  (${faceTableData[0].timeA})`;
        columnsCopy[2].title = `${Language.DUIBISHIJIAN}  (${faceTableData[0].timeC})`;
        return columnsCopy;
      }
      return columnsCopy;
    }
  }, [faceTableData]);

  /**专门为出入口对比导出服务 */
  const handleFlowAttrColumnsForExport = useMemo(() => {
    let columnsCopy = [];
    // 使用浅拷贝避免丢失函数
    columnsCopy = flowDetailColumns.map((column) => ({ ...column }));

    columnsCopy[1].title = `${Language.ZHIDINGCHURUKOU}  (${doorNameListA})`;
    columnsCopy[2].title = `${Language.DUIBICHURUKOU}  (${doorNameListC})`;
    return columnsCopy;
  }, [doorNameListA, doorNameListC]);

  const handleMoodAttrColumnsForExport = useMemo(() => {
    let columnsCopy = [];
    columnsCopy = moodAttrColumns.map((column) => ({ ...column }));

    columnsCopy[1].title = `${Language.ZHIDINGCHURUKOU}  (${doorNameListA})`;
    columnsCopy[2].title = `${Language.DUIBICHURUKOU}  (${doorNameListC})`;
    return columnsCopy;
  }, [doorNameListA, doorNameListC]);

  const handleAgeAttrColumnsForExport = useMemo(() => {
    let columnsCopy = [];
    columnsCopy = ageAttrColumns.map((column) => ({ ...column }));

    columnsCopy[1].title = `${Language.ZHIDINGCHURUKOU}  (${doorNameListA})`;
    columnsCopy[2].title = `${Language.DUIBICHURUKOU}  (${doorNameListC})`;
    return columnsCopy;
  }, [doorNameListA, doorNameListC]);

  // 根据type选择不同的列配置
  const getColumnsByType = useMemo(() => {
    // if (type === "time") {
    return {
      flowDetail: handleTimeFlowAttrColumns,
      ageAttr: handleTimeAgeAttrColumns,
      moodAttr: handleTimeMoodAttrColumns,
      exportFlowDetail: handleFlowAttrColumnsForExport,
      exportAgeAttr: handleAgeAttrColumnsForExport,
      exportMoodAttr: handleMoodAttrColumnsForExport,
    };
    // }
    // return {
    //   flowDetail: flowDetailColumns,
    //   ageAttr: ageAttrColumns,
    //   moodAttr: moodAttrColumns,
    // };
  }, [type, faceTableData, flowData]);

  // 计算各个表格的宽度
  const flowDetailWidth = useMemo(() => {
    const width = TableUtils.calculateTableWidth(getColumnsByType.flowDetail);
    return width;
  }, [getColumnsByType.flowDetail]);

  const ageAttrWidth = useMemo(() => {
    const width = TableUtils.calculateTableWidth(getColumnsByType.ageAttr);
    return width;
  }, [getColumnsByType.ageAttr]);

  const moodAttrWidth = useMemo(() => {
    const width = TableUtils.calculateTableWidth(getColumnsByType.moodAttr);
    return width;
  }, [getColumnsByType.moodAttr]);

  // 公共表格配置
  const commonTableProps = {
    size: "small",
    bordered: true,
    scroll: {
      y: 480, // 固定高度，超出时显示垂直滚动条
    },
    loading,
  };

  // 生成客流明细数据
  const flowDetailData = useMemo(() => {
    return flowData;
  }, [flowData]);

  // 生成年龄属性数据
  const ageAttrData = useMemo(() => {
    return faceTableData;
  }, [faceTableData]);

  // 生成心情属性数据
  const moodAttrData = useMemo(() => {
    return faceTableData;
  }, [faceTableData]);

  const exportFlowDetailData = useMemo(() => {
    return flowDetailData.map((item) => {
      return {
        ...item,
        date: item.isSameDay
          ? `${item.date.format("HH:mm")}-${item.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : item.date.add(1, "hour").format("HH:mm")}`
          : `${item?.date ? item?.date?.format("MM-DD") : ""}`,
      };
    });
  }, [flowDetailData]);

  const exportAgeAttrData = useMemo(() => {
    return ageAttrData.map((item) => {
      return {
        ...item,
        date: item.isSameDay
          ? `${item.date.format("HH:mm")}-${item.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : item.date.add(1, "hour").format("HH:mm")}`
          : `${item?.date ? item?.date?.format("MM-DD") : ""}`,
        gender: item.gender === 1 ? Language.NAN : item.gender === 2 ? Language.NV : Language.WEIZHI,
      };
    });
  }, [ageAttrData]);

  const exportMoodAttrData = useMemo(() => {
    return moodAttrData.map((item) => {
      return {
        ...item,
        date: item.isSameDay
          ? `${item.date.format("HH:mm")}-${item.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : item.date.add(1, "hour").format("HH:mm")}`
          : `${item?.date ? item?.date?.format("MM-DD") : ""}`,
        gender: item.gender === 1 ? Language.NAN : item.gender === 2 ? Language.NV : Language.WEIZHI,
      };
    });
  }, [moodAttrData]);

  // 导出功能
  const handleExport = useCallback(() => {
    if (type === "outlet") {
      const isSameDay = timeRange[0].isSame(timeRange[1]);
      const time = isSameDay ? `${timeRange[0].format("YYYYMMDD")}` : `${timeRange[0].format("YYYYMMDD")}-${timeRange[1].format("YYYYMMDD")}`;
      const exportDataArray = [
        {
          columns: getColumnsByType.exportFlowDetail,
          dataSource: exportFlowDetailData,
          title: `客流明细`,
        },
        {
          columns: getColumnsByType.exportAgeAttr,
          dataSource: exportAgeAttrData,
          title: `年龄属性`,
        },
        {
          columns: getColumnsByType.exportMoodAttr,
          dataSource: exportMoodAttrData,
          title: `心情属性`,
        },
      ];
      ExportUtils.exportDynamicMerge(exportDataArray, { fileName: `出入口对比-出入口对比-${time}` });
    } else {
      const exportDataArray = [
        {
          columns: getColumnsByType.flowDetail,
          dataSource: exportFlowDetailData,
          title: `客流明细`,
        },
        {
          columns: getColumnsByType.ageAttr,
          dataSource: exportAgeAttrData,
          title: `年龄属性`,
        },
        {
          columns: getColumnsByType.moodAttr,
          dataSource: exportMoodAttrData,
          title: `心情属性`,
        },
      ];
      ExportUtils.exportDynamicMerge(exportDataArray, { fileName: `出入口对比-时间对比`, colWidths: [20, 12, 12] });
    }
  }, [getColumnsByType, exportFlowDetailData, exportAgeAttrData, exportMoodAttrData, activeKey]);

  const items = [
    {
      key: "1",
      label: Language.KELIUMINGXI, // 客流明细
      children: (
        <div>
          <CommonDataTable
            dataSource={flowDetailData}
            className="outlet-comparison-table"
            columns={getColumnsByType.flowDetail}
            {...commonTableProps}
            scroll={{ ...commonTableProps.scroll, x: flowDetailWidth }}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: Language.NIANLINGSHUXING, // 年龄属性
      children: (
        <div>
          <CommonDataTable
            dataSource={ageAttrData}
            className="outlet-comparison-table"
            columns={getColumnsByType.ageAttr}
            {...commonTableProps}
            scroll={{ ...commonTableProps.scroll, x: ageAttrWidth }}
          />
        </div>
      ),
    },
    {
      key: "3",
      label: Language.XINQINGSHUXING, // 心情属性
      children: (
        <div>
          <CommonDataTable
            dataSource={moodAttrData}
            className="outlet-comparison-table"
            columns={getColumnsByType.moodAttr}
            {...commonTableProps}
            scroll={{ ...commonTableProps.scroll, x: moodAttrWidth }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="table-detail">
      <UIPanel
        title="数据详情"
        extra={
          <Button className="table-detail-export-button" type="primary" onClick={handleExport}>
            导出数据
          </Button>
        }>
        <div>
          <Tabs activeKey={activeKey} defaultActiveKey="1" items={items} onChange={onChange} />
        </div>
      </UIPanel>
    </div>
  );
});
