import React from "react";
import { Table, Button, message } from "antd";
import X_STYLE from "xlsx-js-style";
const { utils, write } = X_STYLE;
import { saveAs } from "file-saver";

export default class ExportUtils {
  // 递归处理表头配置，提取所有叶子节点和层级信息
  static flattenColumns = (columns, result = [], parentTitles = [], parentKeys = []) => {
    columns.forEach((col, index) => {
      const currentKey = [...parentKeys, col.key || col.dataIndex || `col_${index}`].join("-");

      if (col.children) {
        this.flattenColumns(col.children, result, [...parentTitles, col.title], [...parentKeys, currentKey]);
      } else {
        result.push({
          ...col,
          fullTitle: [...parentTitles, col.title],
          fullKey: currentKey,
          dataIndex: col.dataIndex, // 确保 dataIndex 存在
        });
      }
    });
    return result;
  };

  // 计算表头层级和合并信息
  static calculateHeaderInfo = (flatColumns) => {
    if (!flatColumns.length) return { headerRows: [], merges: [] };

    // 计算最大深度
    const maxDepth = Math.max(...flatColumns.map((col) => col.fullTitle.length));
    const headerRows = Array.from({ length: maxDepth }, () => []);
    const merges = [];

    // 按列分组，处理相同父级的列
    const columnGroups = {};
    flatColumns.forEach((col, colIndex) => {
      col.fullTitle.forEach((title, depth) => {
        headerRows[depth][colIndex] = title;
      });

      // 为每个层级创建分组
      for (let depth = 0; depth < col.fullTitle.length - 1; depth++) {
        const groupKey = col.fullTitle.slice(0, depth + 1).join("|");
        if (!columnGroups[groupKey]) {
          columnGroups[groupKey] = {
            depth,
            columns: [],
            title: col.fullTitle[depth],
          };
        }
        columnGroups[groupKey].columns.push(colIndex);
      }
    });

    // 处理合并
    Object.values(columnGroups).forEach((group) => {
      if (group.columns.length > 1) {
        const startCol = Math.min(...group.columns);
        const endCol = Math.max(...group.columns);
        merges.push({
          s: { r: group.depth, c: startCol },
          e: { r: group.depth, c: endCol },
        });
      }
    });

    // 处理跨行合并（叶子节点）
    flatColumns.forEach((col, colIndex) => {
      const depth = col.fullTitle.length - 1;
      if (depth < maxDepth - 1) {
        merges.push({
          s: { r: depth, c: colIndex },
          e: { r: maxDepth - 1, c: colIndex },
        });
      }
    });

    return { headerRows, merges, maxDepth };
  };

  // 获取单元格数据
  static getCellData = (item, col) => {
    if (!col.dataIndex) return "";

    if (Array.isArray(col.dataIndex)) {
      return col.dataIndex.reduce((obj, key) => obj?.[key], item);
    }
    return item[col.dataIndex];
  };

  /**
   * 导出Excel的默认配置项
   * @type {Object}
   * @property {string} title - Excel文件名和表头标题，默认为"导出数据"
   * @property {string} bookType - Excel文件格式类型，默认为"xlsx"，支持xlsx、xls等格式
   * @property {number|Array<number|null>} colWidths - 列宽度设置，默认为16，单位为字符宽度 可以传数组也可以穿数字
   * @property {array}  customColWidthsArrays - 自定义列宽 根据扁平化列配置数组长度配置 例如：[{ wch: 20 },  wch: 10 }]
   * @property {object}   customHeaderStyle - 自定义表头样式
   * @property {object}   customCenterStyle - 自定义内容样式
   */
  static defaultConfig = {
    fileName: "导出数据",
    bookType: "xlsx",
    colWidths: 16,
    customColWidthsArrays: [],
    customHeaderStyle: {},
    customCenterStyle: {},
  };

  /**
   * 导出动态合并表头的Excel文件
   * @param {Array<Object>} dataArray - 数据对象数组，每个对象包含属性：columns（表格列配置数组）、dataSource（数据源数组）、title（该表标题）
   * @param {Object} config - 导出配置项，可选参数
   */
  static exportDynamicMerge = (dataArray, config) => {
    const { fileName, bookType, colWidths, customColWidthsArrays, customHeaderStyle, customCenterStyle } = { ...this.defaultConfig, ...config };
    try {
      const wb = utils.book_new();

      // 处理函数
      const handleTable = (columns, dataSource, index) => {
        try {
          const flatCols = this.flattenColumns(columns);
          console.log("扁平化列配置:", flatCols);

          const { headerRows, merges } = this.calculateHeaderInfo(flatCols);
          console.log("表头行数据:", headerRows);
          console.log("合并配置:", merges);

          // 构建 Excel 数据
          const excelData = [...headerRows, ...dataSource.map((item) => flatCols.map((col) => this.getCellData(item, col)))];

          // 创建工作表
          const ws = utils.aoa_to_sheet(excelData);

          // 设置合并单元格
          if (merges.length > 0) {
            ws["!merges"] = merges;
          }

          // 设置列宽
          const colWidthsArray = Array.isArray(colWidths)
            ? colWidths[index]
              ? flatCols.map(() => ({ wch: colWidths[index] }))
              : flatCols.map(() => ({ wch: 16 }))
            : flatCols.map(() => ({ wch: colWidths }));
          // 判断 customColWidthsArrays 是否为二元数组（二维数组）
          console.log(colWidthsArray, 150);
          ws["!cols"] = customColWidthsArrays.length > 0 && Array.isArray(customColWidthsArrays[index]) ? customColWidthsArrays[index] : colWidthsArray;

          let headerStyle = {
            font: { bold: true, sz: 14, name: "宋体" },
            alignment: {
              horizontal: "center",
              vertical: "center",
            },
            // fill: { fgColor: { rgb: "E6F3FF" } }, // 浅蓝色背景
          };
          headerStyle = { ...headerStyle, ...customHeaderStyle };

          let centerStyle = {
            font: { sz: 12, name: "宋体" },
            alignment: {
              horizontal: "right",
            },
          };
          centerStyle = { ...centerStyle, ...customCenterStyle };

          const range = utils.decode_range(ws["!ref"]);
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellAddress = utils.encode_cell({ r: R, c: C });

              // 确保单元格存在
              if (!ws[cellAddress]) {
                const cellValue = excelData[R]?.[C];
                if (cellValue !== undefined) {
                  ws[cellAddress] = { v: cellValue };
                } else {
                  continue;
                }
              }

              // // 设置样式：表头使用 headerStyle，内容使用 centerStyle
              if (R < headerRows.length) {
                // 表头行
                ws[cellAddress].s = headerStyle;
              } else {
                // 数据行
                ws[cellAddress].s = centerStyle;
              }
            }
          }
          return ws;
        } catch (error) {
          console.error("处理表格时出错:", error);
          message.warning("导出失败，请查看控制台错误信息");
        }
      };

      dataArray.forEach((data, index) => {
        const { columns, dataSource, title } = data;
        const ws = handleTable(columns, dataSource, index);
        utils.book_append_sheet(wb, ws, title);
      });

      // 生成并下载
      const wbout = write(wb, { bookType: bookType || "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${fileName}.${bookType}`);
      message.success("导出成功");
    } catch (error) {
      console.error("导出Excel时出错:", error);
      message.warning("导出失败，请查看控制台错误信息");
    }
  };
}
