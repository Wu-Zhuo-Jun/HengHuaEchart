import React, { Component, forwardRef, useEffect, useRef, useState } from "react";
import "./Table.css";
import { UIPagination, UITable } from "../../ui/UIComponent";
import { Pagination, Table, ConfigProvider } from "antd";
import { Language, text } from "../../../language/LocaleContext";
import Column from "antd/es/table/Column";
import locale from "antd/es/date-picker/locale/en_US";
import TableUtils from "../../../utils/TableUtils";
import FirstPoint from "@/assets/images/FirstPoint (1).png";
import SecondPoint from "@/assets/images/FirstPoint (2).png";
import ThirdPoint from "@/assets/images/FirstPoint (3).png";

export const RankingTable = ({ data }) => {
  if (!data) return <div>No data available</div>;
  return (
    <table className="table-ranking">
      <thead>
        <tr>
          {data.header.map((text, index) => (
            <th key={index}>{text}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.list.map((item, index) => (
          <tr key={index}>
            <td>
              <div className="circle">{index + 1}</div>
            </td>
            <td>{item.name}</td>
            {item.pInCount != null && <td>{item.pInCount}</td>}
            {item.pInNum != null && <td>{item.pInNum}</td>}
            {item.batchCount != null && <td>{item.batchCount}</td>}
            <td>{item.qoq > 0 ? <div style={{ color: "red" }}>+{item.qoq}%</div> : <div style={{ color: "green" }}>{item.qoq}%</div>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const DoorRankingTable = ({ data }) => {
  if (!data) return;
  const columns = data.columns;
  const list = data.list;
  const columnsList = [];
  if (columns) {
    columns.map((item, index) => {
      let column = {
        title: item.title,
        dataIndex: item.key,
        key: item.key,
        align: "center",
      };
      if (item.key == "ranking") {
        column.width = 60;
        column.render = (value, record, index) => {
          if (index == 0) {
            return (
              <div className="circle-image">
                <img src={FirstPoint} alt="" />
              </div>
            );
          }
          if (index == 1) {
            return (
              <div className="circle-image">
                <img src={SecondPoint} alt="" />
              </div>
            );
          }
          if (index == 2) {
            return (
              <div className="circle-image">
                <img src={ThirdPoint} alt="" />
              </div>
            );
          }
          return <div className="circle">{index + 1}</div>;
        };
      } else if (item.key == "qoq") {
        column.render = (value, record, index) => {
          if (value == 0) {
            return <div>{value}%</div>;
          } else {
            return <div>{value > 0 ? <div style={{ color: "red" }}>+{value}%</div> : <div style={{ color: "green" }}>{value}%</div>}</div>;
          }
        };
      } else if (item.key == "ratio") {
        column.render = (value, record, index) => {
          return <div>{value}%</div>;
        };
      } else {
        column.minWidth = "100px";
      }
      columnsList.push(column);
    });
  }
  return <UITable className="table-door-ranking" tableLayout="auto" columns={columnsList} dataSource={list ? list : []} pagination={false} scroll={list && { x: "max-content", y: "auto" }} />;
};

export const FestivalTable = ({ data }) => {
  // const CustomerWrapper = ({ children, ...props }) => {
  //     return (
  //         <thead {...props} className="custom-wrapper">
  //             {children}
  //         </thead>
  //     );
  // }

  // const CustomerRow = ({ children, ...props }) => {

  //     return (
  //         <tr {...props} className="custom-row">
  //             {children}
  //         </tr>
  //     );
  // }

  // const CustomerHeaderCell = ({ children, ...props }) => {
  //     return (
  //         <th {...props} className="custom-header-cell">
  //             {children}
  //         </th>
  //     );
  // }
  const FestivalProgressItem = ({ value }) => {
    return (
      <div className="festival-flow-progress">
        <div className="festival-flow-progress-bar" style={{ width: `${value > 100 ? 100 : value}%` }}></div>
        <div className="festival-flow-progress-point"></div>
      </div>
    );
  };

  const YoYRateItem = ({ value }) => {
    let className = "";
    if (value > 0) {
      className = "yoy-rate-item-up";
    } else if (value < 0) {
      className = "yoy-rate-item-down";
    }
    value = Math.abs(value);
    return <div className={className}>{value}%</div>;
  };

  return (
    <UITable
      onRow={(record, rowIndex) => ({
        title: record.name,
      })}
      tableLayout="auto"
      loading={!data}
      className="table-festival"
      dataSource={data ? data.list : []}
      pagination={false}
      scroll={data && { x: "max-content", y: "auto" }}>
      <Column title={Language.MINGCHENG} dataIndex="name" ellipsis={true} key="name" align="center"></Column>
      <Column title="" dataIndex="rate" key="rate" minWidth="155px" width="155px" align="center" render={(value) => <FestivalProgressItem value={value} />}></Column>
      <Column title={Language.KELIU} dataIndex="value" key="value" align="center"></Column>
      <Column title={Language.TONGBISHANGNIAN} dataIndex="yoy" key="yoy" align="center" render={(value) => <YoYRateItem value={value} />}></Column>
    </UITable>
  );
};

export const GroupSiteRankingTable = React.memo(({ columns, dataSource }) => {
  const columnsList = [];
  if (columns) {
    columns.map((item, index) => {
      let column = {
        title: item.title,
        dataIndex: item.key,
        key: item.key,
        align: "center",
      };
      if (item.key == "genderRate") {
        column.minWidth = "250px";
        column.width = "250px";
        column.align = "left";
        column.render = (value, record, index) => (
          <div style={{ width: "100%", height: "14px" }}>
            <GenderRateBar maleRate={value.maleRate} femaleRate={value.femaleRate} unknowRate={value.unknowRate} />
          </div>
        );
      }
      columnsList.push(column);
    });
  }
  const GenderRateBar = ({ maleRate, femaleRate, unknowRate }) => {
    const background =
      maleRate + femaleRate + unknowRate > 0
        ? `linear-gradient(to right, #3867D6 0%, #3867D6 ${maleRate}%, #F9A231 ${maleRate}%, #F9A231 ${maleRate + femaleRate}%, #67D638 ${maleRate + femaleRate}%, #67D638 ${
            maleRate + femaleRate + unknowRate
          }%)`
        : "#B0B0B0";
    return (
      <div
        style={{
          background: background,
          borderRadius: "5px",
          width: "100%",
          height: "100%",
        }}
      />
    );
  };
  return (
    <UITable className="table-group-site-ranking" columns={columnsList} dataSource={dataSource ? dataSource : []} pagination={false} scroll={{ x: "max-content", y: "auto" }} />
  ) 
});

export const FlowDetailTable = ({ data }) => {
  return <UITable className="table-group-site-ranking" columns={data ? data.columns : []} tableLayout="auto" dataSource={data ? data.list : []}></UITable>;
};

export const DataTable = forwardRef(({ mergeColumns, dataSource, ...props }, ref) => {
  const pageSizeOptions = [12, 18, 24, 30, 36];
  const [pagination, setPagination] = useState({
    pageSize: pageSizeOptions[0],
    showQuickJumper: true,
    showSizeChanger: { mode: "mutiple", showSearch: false },
    pageSizeOptions: pageSizeOptions,
    locale: {
      jump_to: Language.QIANWANG,
      page: Language.YE,
      items_per_page: Language.TIAOYE,
      prev_page: Language.SHANGYIYE,
      next_page: Language.XIAYIYE,
    },
    showTotal: (total) => text(Language.PARAM_GONGTIAO, { value: total }),
  });

  useEffect(() => {
    setPagination({ ...pagination, current: 1 });
  }, [dataSource]);

  const onChange = (pagination, filters, sorter, extra) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
      // showQuickJumper: true,
      // showSizeChanger: {mode:'mutiple',showSearch:false},
      showTotal: (total) => text(Language.PARAM_GONGTIAO, { value: total }),
    });
    if (mergeColumns) {
      TableUtils.mergeRows(TableUtils.getDataSourceSlice(extra.currentDataSource, pagination.current, pagination.pageSize), ...mergeColumns);
    }
    // console.log('onChange',pagination, filters, sorter, extra);
    if (ref && ref.current) {
      ref.current.scrollTo({ top: 0, behavior: "smooth" });
      // const scrollContainer = tableRef.current.ownerDocument.querySelector('.ant-table-body'); // 根据实际类名调整
      // if (scrollContainer) {
      //     scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }); // 使用 'smooth' 实现平滑滚动
      // }
    }
    props.onChange && props.onChange(pagination, filters, sorter, extra);
  };
  const className = `table-data ${props.className ? props.className : ""}`;
  if (mergeColumns) {
    TableUtils.mergeRows(dataSource, ...mergeColumns);
  }
  return (
    <UITable
      ref={ref}
      scroll={{ x: "max-content", y: "auto", scrollToFirstRowOnChange: false, ...props.scroll }}
      pagination={pagination}
      {...props}
      className={className}
      onChange={onChange}
      bordered
      dataSource={dataSource}
    />
  );
});

export const NetDataTable = ({ mergeColumns, dataSource, pager, onChangePage, onChangeTable, ...props }) => {
  const tableRef = useRef(null);

  if (props.scroll.scrollToFirstRowOnChange) {
    if (tableRef && tableRef.current) {
      // tableRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      console.log("scrollToFirstRowOnChange");
      const scrollContainer = tableRef.current.ownerDocument.querySelector(".ant-table-body"); // 根据实际类名调整
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0 }); // 使用 'smooth' 实现平滑滚动
      }
    }
  }

  const onChange = (pagination, filters, sorter, extra) => {
    if (mergeColumns) {
      TableUtils.mergeRows(TableUtils.getDataSourceSlice(extra.currentDataSource, pagination.current, pagination.pageSize), ...mergeColumns);
    }
    onChangeTable?.call(null, pagination, filters, sorter, extra);
  };
  const className = `table-data ${props.className ? props.className : ""}`;
  if (mergeColumns) {
    TableUtils.mergeRows(dataSource, ...mergeColumns);
  }
  return (
    <>
      <UITable
        ref={tableRef}
        scroll={{ x: "max-content", y: "auto", ...props.scroll, scrollToFirstRowOnChange: false }}
        pagination={false}
        {...props}
        className={className}
        onChange={onChange}
        bordered
        dataSource={dataSource}
      />
      {pager?.total > 0 && dataSource.length > 0 && (
        <div style={{ paddingRight: "12px", marginTop: "10px" }}>
          <UIPagination pager={pager} onChange={onChangePage} />
        </div>
      )}
    </>
  );
};

export const CommonDataTable = forwardRef(({ mergeColumns, dataSource, ...props }, ref) => {
  const pageSizeOptions = [12, 18, 24, 30, 36];
  const [pagination, setPagination] = useState({
    pageSize: pageSizeOptions[0],
    showQuickJumper: true,
    showSizeChanger: { mode: "mutiple", showSearch: false },
    pageSizeOptions: pageSizeOptions,
    locale: {
      jump_to: Language.QIANWANG,
      page: Language.YE,
      items_per_page: Language.TIAOYE,
      prev_page: Language.SHANGYIYE,
      next_page: Language.XIAYIYE,
    },
    showTotal: (total) => text(Language.PARAM_GONGTIAO, { value: total }),
  });

  useEffect(() => {
    setPagination({ ...pagination, current: 1 });
  }, [dataSource]);

  const onChange = (pagination, filters, sorter, extra) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
      // showQuickJumper: true,
      // showSizeChanger: {mode:'mutiple',showSearch:false},
      showTotal: (total) => text(Language.PARAM_GONGTIAO, { value: total }),
    });
    // if (mergeColumns) {
    //   TableUtils.mergeRows(TableUtils.getDataSourceSlice(extra.currentDataSource, pagination.current, pagination.pageSize), ...mergeColumns);
    // }
    // console.log('onChange',pagination, filters, sorter, extra);
    if (ref && ref.current) {
      ref.current.scrollTo({ top: 0, behavior: "smooth" });
      // const scrollContainer = tableRef.current.ownerDocument.querySelector('.ant-table-body'); // 根据实际类名调整
      // if (scrollContainer) {
      //     scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }); // 使用 'smooth' 实现平滑滚动
      // }
    }
    props.onChange && props.onChange(pagination, filters, sorter, extra);
  };
  const className = `common-table-data ${props.className ? props.className : ""}`;
  // if (mergeColumns) {
  //   TableUtils.mergeRows(dataSource, ...mergeColumns);
  // }
  return (
    <ConfigProvider theme={{ components: { Table: { borderColor: "#bbbbbb" } } }}>
      <Table
        ref={ref}
        scroll={
          {
            // y: "auto",
            // scrollToFirstRowOnChange: false,
            // ...props.scroll,
            // 如果用户没有明确设置 x，则不设置（让表格自适应容器宽度）
            // 如果用户设置了 x，则使用用户的设置
          }
        }
        pagination={pagination}
        {...props}
        className={className}
        onChange={onChange}
        // bordered
        dataSource={dataSource}
      />
    </ConfigProvider>
  );
});
