import React, { useMemo, useState, useCallback } from "react";
import "../index.less";
import { Tabs, Button, Tooltip } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Language } from "@/language/LocaleContext";
import { passengerDetailColumns, profileAttrColumns } from "./TableDetailColumns";
import { UIPanel } from "@/components/ui/UIComponent";
import { CommonDataTable } from "@/components/common/tables/Table";
import TableUtils from "@/utils/TableUtils";
import ExportUtils from "@/utils/ExportUtils";

export const TableDetail = React.memo(({ data, loading = false, onRefresh, timeRange }) => {
  const [activeKey, setActiveKey] = useState("1");

  const onChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  // 获取表格列
  const getColumnsByType = useMemo(
    () => ({
      passengerDetail: passengerDetailColumns,
      profileAttr: profileAttrColumns,
    }),
    []
  );

  // 计算各个表格的宽度
  const passengerDetailWidth = useMemo(() => {
    return TableUtils.calculateTableWidth(getColumnsByType.passengerDetail);
  }, [getColumnsByType.passengerDetail]);

  const profileAttrWidth = useMemo(() => {
    return TableUtils.calculateTableWidth(getColumnsByType.profileAttr);
  }, [getColumnsByType.profileAttr]);

  // 公共表格配置
  const commonTableProps = {
    size: "small",
    bordered: true,
    tableLayout: "fixed",
    scroll: {
      x: "max-content",
      y: 480,
    },
    loading,
  };

  // 生成客流明细数据
  const passengerDetailData = useMemo(() => {
    return data;
  }, [data]);

  // 生成画像属性数据
  const profileAttrData = useMemo(() => {
    return data;
  }, [data]);

  const exportPassengerDetailData = useMemo(() => {
    return passengerDetailData.map((item) => {
      return {
        ...item,
        date: item.isSameDay
          ? `${item.date.format("HH:mm")}-${item.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : item.date.add(1, "hour").format("HH:mm")}`
          : `${item?.date ? item?.date?.format("MM-DD") : ""}`,
      };
    });
  }, [passengerDetailData]);

  const exportProfileAttrData = useMemo(() => {
    return profileAttrData.map((item) => {
      return {
        ...item,
        date: item.isSameDay
          ? `${item.date.format("HH:mm")}-${item.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : item.date.add(1, "hour").format("HH:mm")}`
          : `${item?.date ? item?.date?.format("MM-DD") : ""}`,
      };
    });
  }, [profileAttrData]);

  // 导出功能
  const handleExport = useCallback(() => {
    const isSameDay = timeRange[0].isSame(timeRange[1]);
    const time = isSameDay ? `${timeRange[0].format("YYYYMMDD")}` : `${timeRange[0].format("YYYYMMDD")}-${timeRange[1].format("YYYYMMDD")}`;
    const exportDataArray = [
      {
        columns: getColumnsByType.passengerDetail,
        dataSource: exportPassengerDetailData,
        title: Language.KELIUMINGXI,
      },
      {
        columns: getColumnsByType.profileAttr,
        dataSource: exportProfileAttrData,
        title: Language.KEQUNSHUXING,
      },
    ];
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName: `${Language.QUYUFENXI}-${time}` });
  }, [getColumnsByType, exportPassengerDetailData, exportProfileAttrData, timeRange]);

  const items = [
    {
      key: "1",
      label: Language.KELIUMINGXI,
      children: (
        <div>
          <CommonDataTable
            dataSource={passengerDetailData}
            className="outlet-comparison-table"
            columns={getColumnsByType.passengerDetail}
            {...commonTableProps}
            scroll={{ ...commonTableProps.scroll, x: passengerDetailWidth }}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: Language.KEQUNSHUXING,
      children: (
        <div>
          <CommonDataTable
            dataSource={profileAttrData}
            className="outlet-comparison-table"
            columns={getColumnsByType.profileAttr}
            {...commonTableProps}
            scroll={{ ...commonTableProps.scroll, x: profileAttrWidth }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="table-detail">
      <UIPanel
        title={Language.SHUJUXIANGQING}
        extra={
          <Button className="table-detail-export-button" type="primary" onClick={handleExport}>
            {Language.DAOCHUSHUJU}
          </Button>
        }>
        <div>
          <Tabs activeKey={activeKey} defaultActiveKey="1" items={items} onChange={onChange} />
        </div>
      </UIPanel>
    </div>
  );
});
