import React, { useMemo, useState, useCallback, useEffect } from "react";
import "../index.less";
import { Tabs, Button, Space, Tooltip, message } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Language } from "@/language/LocaleContext";
import { flowDetailColumns, ageAttrColumns, moodAttrColumns } from "./TableDetailColumns";
import { UIPanel } from "@/components/ui/UIComponent";
import { CommonDataTable } from "@/components/common/tables/Table";
import TableUtils from "@/utils/TableUtils";
import ExportUtils from "@/utils/ExportUtils";

export const TableDetail = React.memo(({ data, loading = false, onRefresh, flowData, faceTableData, timeRange }) => {
  const [activeKey, setActiveKey] = useState("1");

  const onChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  // 根据type选择不同的列配置
  const getColumnsByType = useMemo(() => {
    // if (type === "time") {
    //   return {
    //     flowDetail: handleTimeFlowAttrColumns,
    //     ageAttr: handleTimeAgeAttrColumns,
    //     moodAttr: handleTimeMoodAttrColumns,
    //   };
    // }
    return {
      flowDetail: flowDetailColumns,
      ageAttr: ageAttrColumns,
      moodAttr: moodAttrColumns,
    };
  }, [faceTableData, flowData]);

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
    tableLayout: "fixed",
    scroll: {
      x: "max-content", // 水平自适应内容宽度
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
        inCountRatio: `${item.inCountRatio}%`,
        inNumRatio: `${item.inNumRatio}%`,
        batchRatio: `${item.batchRatio}%`,
        specifiedEntryCountRatio: `${item.specifiedEntryCountRatio ? (item.specifiedEntryCountRatio >= 0 ? `+${item.specifiedEntryCountRatio}%` : `${item.specifiedEntryCountRatio}%`) : "0%"}`,
        specifiedEntryPeopleRadio: `${item.specifiedEntryPeopleRadio ? (item.specifiedEntryPeopleRadio >= 0 ? `+${item.specifiedEntryPeopleRadio}%` : `${item.specifiedEntryPeopleRadio}%`) : "0%"}`,
        specifiedFlowBatchRadio: `${item.specifiedFlowBatchRadio ? (item.specifiedFlowBatchRadio >= 0 ? `+${item.specifiedFlowBatchRadio}%` : `${item.specifiedFlowBatchRadio}%`) : "0%"}`,
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
    const isSameDay = timeRange[0].isSame(timeRange[1]);
    const time = isSameDay ? `${timeRange[0].format("YYYYMMDD")}` : `${timeRange[0].format("YYYYMMDD")}-${timeRange[1].format("YYYYMMDD")}`;
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
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName: `出入口分析-${time}`, colWidths: [16, 14, 14] });
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
            // summary={(pageData) => {
            //   let totalBorrow = 0;
            //   let totalRepayment = 0;
            //   pageData.forEach(({ borrow, repayment }) => {
            //     totalBorrow += borrow;
            //     totalRepayment += repayment;
            //   });
            //   return (
            //     <Table.Summary fixed={"top"}>
            //       <Table.Summary.Row>
            //         <Table.Summary.Cell index={0} colSpan={2}>
            //           <Switch
            //             checkedChildren="Fixed Top"
            //             unCheckedChildren="Fixed Top"
            //             checked={fixedTop}
            //             onChange={() => {
            //               setFixedTop(!fixedTop);
            //             }}
            //           />
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell index={2} colSpan={8}>
            //           Scroll Context
            //         </Table.Summary.Cell>
            //         <Table.Summary.Cell index={10}>Fix Right</Table.Summary.Cell>
            //       </Table.Summary.Row>
            //     </Table.Summary>
            //   );
            // }}
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
