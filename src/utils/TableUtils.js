class TableUtils {
  static mergeRows(rows, ...keys) {
    let matchIndex = -1;
    rows.map((item, index) => {
      item._rowSpan = 1;
      if (index > 0) {
        let preItem = rows[index - 1];
        let isMatch = true;
        keys.map((key) => {
          if (!item.hasOwnProperty(key) || !preItem.hasOwnProperty(key)) {
            isMatch = false;
            return;
          }
          if (item[key] != preItem[key]) {
            isMatch = false;
            return;
          }
        });
        if (isMatch) {
          if (matchIndex == -1) {
            matchIndex = index - 1;
          }
          rows[matchIndex]._rowSpan += 1;
          item._rowSpan = 0;
        } else {
          matchIndex = -1;
        }
      }
    });
    return rows;
  }

  static getDataSourceSlice(dataSource, curPage, pageSize) {
    let start = (curPage - 1) * pageSize;
    let end = start + pageSize;
    start = start < 0 ? 0 : start;
    end = end > dataSource.length ? dataSource.length : end;
    if (!dataSource || typeof dataSource != "array" || dataSource.length == 0) {
      return [];
    }
    return dataSource.slice(start, end);
  }

  // 计算表格宽度的工具函数
  static calculateTableWidth(columns) {
    let totalWidth = 0;

    const calculateColumnWidth = (column) => {
      if (column.children && Array.isArray(column.children)) {
        // 如果是分组列，递归计算子列宽度
        return column.children.reduce((sum, child) => sum + calculateColumnWidth(child), 0);
      } else {
        // 如果是普通列，返回其宽度或默认宽度
        return column.width || 120; // 默认宽度120px
      }
    };

    columns.forEach((column) => {
      totalWidth += calculateColumnWidth(column);
    });

    // 添加一些额外的边距和边框宽度
    const extraWidth = 50; // 边框、内边距等额外宽度

    return totalWidth + extraWidth;
  }
}
export default TableUtils;
