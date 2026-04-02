import React, { useMemo, useState, useCallback, useEffect } from "react";
import "../index.less";
import { Tabs, Button, Space, Tooltip, message } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Language } from "@/language/LocaleContext";
import { genderAttrColumns, ageAttrColumns } from "./TableDetailColumns";
import { UIPanel } from "@/components/ui/UIComponent";
import { CommonDataTable } from "@/components/common/tables/Table";
import TableUtils from "@/utils/TableUtils";
import ExportUtils from "@/utils/ExportUtils";

export const TableDetail = React.memo(({ data, loading = false, onRefresh, timeRange, genderEnumsSelect, ageEnumsSelect }) => {
  const [activeKey, setActiveKey] = useState("1");

  const onChange = useCallback((key) => {
    setActiveKey(key);
  }, []);

  // 列配置
  const getColumnsByType = useMemo(() => {
    // 根据 genderEnumsSelect 筛选性别属性列
    let filteredGenderAttrColumns = [...genderAttrColumns];

    if (genderEnumsSelect && Object.keys(genderEnumsSelect).length > 0) {
      const selectedGenderKeys = Object.keys(genderEnumsSelect).map((key) => Number(key));
      const hasMale = selectedGenderKeys.includes(1);
      const hasFemale = selectedGenderKeys.includes(2);

      // 如果只选中了男性，只保留 maleNum 列
      // 如果只选中了女性，只保留 femaleNum 列
      // 如果两者都选中或全部选中，保留所有列
      if (hasMale && !hasFemale) {
        // 只显示男性列
        filteredGenderAttrColumns = genderAttrColumns.filter((col) => {
          return col.key === "date" || col.key === "maleNum";
        });
      } else if (hasFemale && !hasMale) {
        // 只显示女性列
        filteredGenderAttrColumns = genderAttrColumns.filter((col) => {
          return col.key === "date" || col.key === "femaleNum";
        });
      }
      // 如果两者都选中或全部选中，使用所有列（不需要过滤）
    }

    // 根据 ageEnumsSelect 筛选年龄属性列
    let filteredAgeAttrColumns = [...ageAttrColumns];

    if (ageEnumsSelect && Object.keys(ageEnumsSelect).length > 0) {
      const selectedAgeKeys = Object.keys(ageEnumsSelect).map((key) => Number(key));

      // 年龄枚举与列 key 的映射关系
      const ageKeyToColumnKeyMap = {
        1: "toddler", // 婴儿
        2: "child", // 儿童
        4: "youngAdult", // 青年
        5: "middleAge", // 壮年
        6: "elderly", // 中老年
        7: "ageUnknown", // 未知
      };

      // 获取需要保留的列 key（包括固定的 date 列）
      const allowedColumnKeys = ["date"];
      selectedAgeKeys.forEach((ageKey) => {
        if (ageKeyToColumnKeyMap[ageKey]) {
          allowedColumnKeys.push(ageKeyToColumnKeyMap[ageKey]);
        }
      });

      // 筛选列
      filteredAgeAttrColumns = ageAttrColumns.filter((col) => {
        return allowedColumnKeys.includes(col.key);
      });
    }

    return {
      genderAttr: filteredGenderAttrColumns,
      ageAttr: filteredAgeAttrColumns,
    };
  }, [genderEnumsSelect, ageEnumsSelect]);

  // 计算各个表格的宽度
  const genderAttrWidth = useMemo(() => {
    const width = TableUtils.calculateTableWidth(getColumnsByType.genderAttr);
    return width;
  }, [getColumnsByType.genderAttr]);

  const ageAttrWidth = useMemo(() => {
    const width = TableUtils.calculateTableWidth(getColumnsByType.ageAttr);
    return width;
  }, [getColumnsByType.ageAttr]);

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
  const genderAttrData = useMemo(() => {
    return data;
  }, [data]);

  // 生成年龄属性数据
  const ageAttrData = useMemo(() => {
    return data;
  }, [data]);

  const exportGenderAttrData = useMemo(() => {
    return genderAttrData.map((item) => {
      return {
        ...item,
        date: item.isSameDay
          ? `${item.date.format("HH:mm")}-${item.date.add(1, "hour").format("HH:mm") === "00:00" ? "24:00" : item.date.add(1, "hour").format("HH:mm")}`
          : `${item?.date ? item?.date?.format("MM-DD") : ""}`,
      };
    });
  }, [genderAttrData]);

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

  // 导出功能
  const handleExport = useCallback(() => {
    const isSameDay = timeRange[0].isSame(timeRange[1]);
    const time = isSameDay ? `${timeRange[0].format("YYYYMMDD")}` : `${timeRange[0].format("YYYYMMDD")}-${timeRange[1].format("YYYYMMDD")}`;
    const exportDataArray = [
      {
        columns: getColumnsByType.genderAttr,
        dataSource: exportGenderAttrData,
        title: `性别属性`,
      },
      {
        columns: getColumnsByType.ageAttr,
        dataSource: exportAgeAttrData,
        title: `年龄属性`,
      },
    ];
    ExportUtils.exportDynamicMerge(exportDataArray, { fileName: `顾客洞察-${time}` });
  }, [getColumnsByType, exportGenderAttrData, exportAgeAttrData, activeKey]);

  const items = [
    {
      key: "1",
      label: Language.KELIUMINGXI, // 性别属性
      children: (
        <div>
          <CommonDataTable
            dataSource={genderAttrData}
            className="outlet-comparison-table"
            columns={getColumnsByType.genderAttr}
            {...commonTableProps}
            scroll={{ ...commonTableProps.scroll, x: genderAttrWidth }}
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
