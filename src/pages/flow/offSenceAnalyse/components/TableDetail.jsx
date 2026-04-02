import React, { useMemo, useState, useCallback, useEffect } from "react";
import "../index.less";
import { Tabs, Button, Space, Tooltip, message } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Language } from "@/language/LocaleContext";
import { offSenceAnalyseColumns, getOffSenceAnalyseColumns } from "./TableDetailColumns";
import { UIPanel } from "@/components/ui/UIComponent";
import { CommonDataTable } from "@/components/common/tables/Table";
import TableUtils from "@/utils/TableUtils";
import ExportUtils from "@/utils/ExportUtils";

export const TableDetail = React.memo(({ data, loading = false, onRefresh, timeRange, baseType = "ALL", genderEnumsSelect, ageEnumsSelect }) => {
  const [activeKey, setActiveKey] = useState("1");

  const onChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  // 根据 baseType 获取过滤后的列配置
  const filteredColumns = useMemo(() => {
    return getOffSenceAnalyseColumns(baseType);
  }, [baseType]);

  // 计算各个表格的宽度
  const offSenceAnalyseWidth = useMemo(() => {
    const width = TableUtils.calculateTableWidth(filteredColumns);
    return width;
  }, [filteredColumns]);

  // 公共表格配置
  const commonTableProps = {
    size: "small",
    bordered: true,
    tableLayout: "fixed",
    scroll: {
      x: "max-content", // 水平自适应内容宽度
      y: 480, // 固定高度，超出时显示垂直滚动条
    },
    loading,
  };

  // 生成性别数据
  const offSenceAnalyseData = useMemo(() => {
    return data;
  }, [data]);

  const exportOffSenceAnalyseData = useMemo(() => {
    return offSenceAnalyseData.map((item) => {
      return {
        ...item,
        date: item.isSameDay
          ? `${item.date.format("HH:mm")}-${item.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : item.date.add(1, "hour").format("HH:mm")}`
          : `${item?.date ? item?.date?.format("MM-DD") : ""}`,
        siteEntryRate: `${item.siteEntryRate}%`,
        storeEntryRate: `${item.storeEntryRate}%`,
      };
    });
  }, [offSenceAnalyseData]);

  // 导出功能
  const handleExport = useCallback(() => {
    const isSameDay = timeRange[0].isSame(timeRange[1]);
    const time = isSameDay ? `${timeRange[0].format("YYYYMMDD")}` : `${timeRange[0].format("YYYYMMDD")}-${timeRange[1].format("YYYYMMDD")}`;
    const exportDataArray = [
      {
        columns: filteredColumns,
        dataSource: exportOffSenceAnalyseData,
        title: `外部分析`,
      },
    ];
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName: `外部分析-${baseType === "ALL" ? Language.GUODIANKELIU : Language.CHANGWAIKELIU}-${time}` });
  }, [filteredColumns, exportOffSenceAnalyseData, timeRange, baseType]);

  const items = [
    {
      key: "1",
      label: Language.KELIUMINGXI,
      children: (
        <div>
          <CommonDataTable
            dataSource={offSenceAnalyseData}
            className="outlet-comparison-table"
            columns={filteredColumns}
            {...commonTableProps}
            scroll={{ ...commonTableProps.scroll, x: offSenceAnalyseWidth }}
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
