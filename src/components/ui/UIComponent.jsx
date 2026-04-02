import React, { useRef, useEffect, useState, use, forwardRef } from "react";
import { Select, Radio, Table, Menu, Modal, Button, Tooltip, Spin } from "antd";
import { Language, text } from "../../language/LocaleContext";
import { Pagination } from "antd";
import { CaretLeftOutlined, CaretRightOutlined, PlusCircleFilled } from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import { scroller, Element } from "react-scroll";
import { QuestionCircleOutlined } from "@ant-design/icons";

import "./UIComponent.css";
import Constant from "../../common/Constant";

export const UIPanel = React.memo(({ children, title, className, bodyStyle, ...props }) => {
  className = `ui-panel ${className || ""}`;
  // Tooltip 内容
  const chartContent = (
    <div>
      <div className="ui-panel-tooltip-title">{title}</div>
      <div className="ui-panel-tooltip-tooltip">{props?.tooltip}</div>
    </div>
  );

  // Tooltip 尺寸映射表
  const TOOLTIP_SIZE_MAP = {
    normal: "300px",
    big: "400px",
    biggest: "500px",
  };

  // 根据 tooltipSize 获取对应的宽度
  const getTooltipWidth = () => {
    if (!props?.tooltipSize) return undefined;
    return TOOLTIP_SIZE_MAP[props.tooltipSize];
  };

  // 构建默认的 Tooltip 样式（基于 tooltipSize）
  const buildDefaultTooltipStyles = () => {
    const width = getTooltipWidth();
    return {
      body: {
        ...(width && { width }),
      },
    };
  };

  // 合并默认样式和自定义样式
  const mergeTooltipStyles = () => {
    const defaultStyles = buildDefaultTooltipStyles();

    if (!props?.tooltipStyles) {
      return defaultStyles;
    }

    return {
      ...defaultStyles,
      ...props.tooltipStyles,
      body: {
        ...defaultStyles.body,
        ...(props.tooltipStyles.body || {}),
      },
      root: {
        ...(defaultStyles.root || {}),
        ...(props.tooltipStyles.root || {}),
      },
    };
  };

  const tooltipStyles = mergeTooltipStyles();

  return (
    <div style={props.style} className={className}>
      {title && (
        <div className="ui-panel-header">
          <div className="ui-panel-title-bar">
            <div className="ui-panel-title-icon"></div>
            <div className="ui-panel-title">{title}</div>
            {props?.tooltip && (
              <Tooltip trigger="hover" placement={props.tooltipPlacement || "top"} arrow={false} title={chartContent} styles={tooltipStyles}>
                <QuestionCircleOutlined className="ui-panel-title-tooltip" style={{ fontSize: "14px", color: "#333", marginLeft: "6px" }} />
              </Tooltip>
            )}
          </div>
          <div>{props.extra}</div>
        </div>
      )}
      <div className="ui-panel-body" style={bodyStyle}>
        {children}
        <Element name="messagesEnd" />
      </div>
    </div>
  );
});

export const UISelect = ({ ...props }) => {
  const className = `ui-select ${props.className || ""}`;
  const classNames = { ...props.classNames, popup: { root: "ui-select-popup" } };
  return <Select {...props} className={className} classNames={classNames} onChange={props.onChange}></Select>;
};

export const FlowSelect = ({ options, onChange, ...props }) => {
  return <UISelect className="flow-select" {...props} options={options} onChange={onChange} />;
};

export const TimeRadioGroup = ({ onChange }) => {
  const options = [
    { label: Language.SHIQU, value: "1" },
    { label: Language.XIAOSHI, value: "2" },
  ];
  return <Radio.Group className="time-radio-group" block options={options} defaultValue="1" optionType="button" buttonStyle="solid" onChange={onChange} />;
};

export const UITable = forwardRef(({ ...props }, ref) => {
  // const tableRef = useRef(ref);
  // const [scrollY, setScrollY] = useState(0);
  // const getTableScrollY = () => {
  //     if(tableRef){
  //         const headerHeight = tableRef.current.parentElement.querySelector('.ant-table-thead').offsetHeight;
  //         const tableHeight = tableRef.current.offsetHeight;
  //         return tableHeight - headerHeight;
  //     }
  // }

  // useEffect(() => {
  //     setScrollY(getTableScrollY());
  // }, [props.scroll]);

  // console.log(props.pagination);
  // const scroll = props.scroll &&{...props.scroll, y: props.scroll.y === 'auto' ? scrollY : props.scroll.y};
  let className = `${props.className || ""}`;
  let scroll = props.scroll;
  if (props.scroll && props.scroll.y === "auto") {
    scroll = { ...props.scroll, y: "1px" };
    className = `${className} table-auto-scroll`;
  }
  if (props.pagination) {
    className = `${className} table-auto-scroll-pagination`;
  }

  // useEffect(() => {
  //     if(tableRef && tableRef.current){

  //         const tableBody = tableRef.current.ownerDocument.querySelector('.ant-table-body');
  //         if(tableBody){
  //             console.log("asdsad",tableBody,tableBody.scrollHeight,tableBody.clientHeight);
  //             if(tableBody.scrollHeight <= tableBody.clientHeight){
  //                 tableBody.style.overflow = 'unset !important';
  //             }
  //         }
  //     }
  // }, [props]);

  return <Table ref={ref} tableLayout="auto" {...props} className={className} scroll={scroll} />;
});

export const UIContent = ({ ...props }) => {
  const className = `ui-content ${props.className || ""}`;
  return (
    <div {...props} className={className}>
      {props.children}
    </div>
  );
};

export const UIMenu = ({ ...props }) => {
  const className = `ui-menu ${props.className || ""}`;
  return (
    <Menu mode="inline" {...props} className={className}>
      {props.children}
    </Menu>
  );
};

export const UISider = ({ ...props }) => {
  const [collapsed, setCollapsed] = useState(props.defaultCollapsed || false);
  const className = `ui-sider ${props.className || ""}`;
  const onCollapse = (collapsed, type) => {
    setCollapsed(collapsed);
    props.onCollapse?.call(null, collapsed, type);
    //侧边栏伸缩后,发送resize事件,强行调整图表宽高
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  };
  return (
    <Sider
      onCollapse={onCollapse}
      trigger={collapsed ? <CaretRightOutlined className="ui-sider-trigger-icon" /> : <CaretLeftOutlined className="ui-sider-trigger-icon" />}
      className={className}
      {...props}>
      {props.children}
    </Sider>
  );
};

export const UIPageHeader = ({ title, introduce, ...props }) => {
  return (
    <UIContent {...props} style={{ with: "100%", height: "46px", padding: "12px 27px" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", columnGap: "19px" }}>
        <div className="ui-page-header-title">{title}</div>
        <div className="ui-page-header-introduce">{introduce}</div>
      </div>
    </UIContent>
  );
};

export const UIPagination = React.memo(({ onChange, tableRef, pager, scrollToFirstRowOnChange, ...props }) => {
  const pageSizeOptions = Constant.PAGE_SIZES;
  const showTotal = (total) => text(Language.PARAM_GONGTIAO, { value: total });
  const local = {
    jump_to: Language.QIANWANG,
    page: Language.YE,
    items_per_page: Language.TIAOYE,
    prev_page: Language.SHANGYIYE,
    next_page: Language.XIAYIYE,
  };
  const onPaginationChange = (page, pageSize) => {
    if (scrollToFirstRowOnChange) {
      if (tableRef && tableRef.current) {
        tableRef.scrollTo({ top: 0, behavior: "smooth" });
        // const scrollContainer = tableRef.current.ownerDocument.querySelector('.ant-table-body'); // 根据实际类名调整
        // if (scrollContainer) {
        //     scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }); // 使用 'smooth' 实现平滑滚动
        // }
      }
    }
    if (onChange && typeof onChange === "function") {
      onChange.call(null, page, pageSize);
    }
  };
  return (
    <Pagination
      align="end"
      showQuickJumper={true}
      showSizeChanger={{ showSearch: false, mode: "mutiple" }}
      showTotal={showTotal}
      defaultCurrent={1}
      current={pager?.current}
      total={pager?.total}
      locale={local}
      pageSize={pager?.pageSize}
      defaultPageSize={pageSizeOptions[0]}
      pageSizeOptions={pageSizeOptions}
      onChange={onPaginationChange}
      {...props}
    />
  );
});

export const UIModal = React.memo(({ title, okText, cancelText, ...props }) => {
  const TitleElement = ({ title }) => {
    return (
      <div className="ui-panel-title-bar">
        <div className="ui-panel-title-icon" style={{ width: "3px", height: "20px" }}></div>
        <div className="ui-panel-title" style={{ fontSize: "14px", marginLeft: "6px" }}>
          {title}
        </div>
      </div>
    );
  };
  return (
    <Modal
      title={<TitleElement title={title} />}
      styles={{ body: { paddingTop: "20px" } }}
      okText={okText ? okText : Language.QUEREN}
      style={{ minWidth: "711px", top: "50%", transform: "translateY(-50%)" }}
      width={props.width || 711}
      transitionName=""
      open={true}
      cancelText={cancelText ? cancelText : Language.QUXIAO}
      footer={(originNode, extra) => {
        return (
          <div style={{ textAlign: "center" }}>
            <extra.CancelBtn />
            <extra.OkBtn />
          </div>
        );
      }}
      {...props}>
      {props.children}
    </Modal>
  );
});

export const UIModalEditConfirm = ({ title, okText, cancelText, content, ...props }) => {
  const TitleElement = ({ title }) => {
    return (
      <div className="ui-panel-title-bar">
        <div className="ui-panel-title-icon" style={{ width: "3px", height: "20px" }}></div>
        <div className="ui-panel-title" style={{ fontSize: "14px", marginLeft: "6px" }}>
          {title}
        </div>
      </div>
    );
  };
  return UIModalConfirm({
    title: <TitleElement title={title} />,
    icon: null,
    okButtonProps: { loading: false },
    style: { minWidth: "711px", top: "50%", transform: "translateY(-50%)" },
    width: props.width || 711,
    okText: okText,
    cancelText: cancelText,
    // closeIcon: <Button></Button>,
    content: content,
    ...props,
  });
};

export const UIModalConfirm = ({ title, okText, cancelText, content, ...props }) => {
  return Modal.confirm({
    className: "ui-modal-confirm",
    title: title,
    style: { minWidth: "503px", height: "229px", top: "50%", transform: "translateY(-50%)" },
    okText: okText ? okText : Language.QUEREN,
    cancelText: cancelText ? cancelText : Language.QUXIAO,
    closable: true,
    transitionName: "",
    content: content,
    okButtonProps: { loading: false },
    footer: (originNode, { CancelBtn, OkBtn }) => {
      return (
        <div style={{ textAlign: "center" }}>
          <CancelBtn />
          <OkBtn />
        </div>
      );
    },
    ...props,
  });
};

export const UIPlusCricleButton = ({ onClick, children, style }) => {
  return (
    <div
      style={{
        borderRadius: "5px",
        backgroundColor: "#EDF3FF",
        height: "26px",
        width: "auto",
        border: "1px solid #bbbbbb",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        columnGap: "5px",
        cursor: "pointer",
        ...style,
      }}
      onClick={onClick}>
      <PlusCircleFilled style={{ color: "#3867d6", fontSize: "18px" }} />
      <div style={{ fontSize: "14px", lineHeight: "26px", height: "26px" }}>{children}</div>
    </div>
  );
};

export const UITitle = ({ children, required, ...props }) => {
  const className = `ui-title ${props.className || ""}`;
  return (
    <div {...props} className={className}>
      {" "}
      {required && <span style={{ color: "red", marginLeft: "-4px" }}>*</span>}
      {children}
    </div>
  );
};

// export const UIScrollContainer = ({children,id,className,scrollToBottom,scroll,...props})=>{
//     const className = `ui-scroll-container ${className || ''}`;
//     const setScrollToBottom = () => {
//         if(scrollToBottom){
//             scroller.scrollTo('messagesEnd', {
//                 containerId: id?id:'scrollContainer',
//                 duration: 0,
//                 smooth: true,
//                 ignoreCancelEvents: true,
//                 isDynamic: true,
//                 ...scroll,
//             });
//         }
//     }
//     useEffect(() => {
//         setTimeout(() => {
//             scrollToBottom();
//           }, 100);
//     }, []);
//     useEffect(() => {
//         setScrollToBottom();
//     }, [children]);
//     return (
//         <div {...props} className={className} id={id?id:'scrollContainer'}                                                       >
//             {children}
//         </div>
//     );
// }

/**wuzhuojun */
/**panel内通用select */
export const NewFlowSelect = ({ onChange, value, options, ...props }) => {
  return <UISelect className="flow-select" options={options} value={value} onChange={onChange} {...props} />;
};

/**备案组件 */
export const ICPComponent = ({ style }) => {
  return (
    <div className="ICPComponent" style={style}>
      <a href="https://beian.miit.gov.cn/" target="_blank">
        CopyRight 2025 {localStorage.getItem("isNeutralDomain") == "true" ? null : <span>广州恒华科技有限公司</span>} 粤ICP备18155924号
      </a>
    </div>
  );
};

/**内容加载中组件 */
export const UIContentLoading = ({ children, loading = fasle, customHeight = "100%" }) => {
  return (
    <div style={{ height: loading ? customHeight : "100%", position: "relative", overflow: "auto" }}>
      <Spin spinning={loading} size="large" className="UIContentLoading" wrapperClassName="UIContentLoadingWrapper">
        {children}
      </Spin>
    </div>
  );
};

/**问题提示Icon */
export const UITooltipQuestion = React.memo(({ title, color, triggerEvent = "hover", fontSize = "14px", marginLeft = "6px", marginRight = "0px", tooltipSize, placement = "top" }) => {
  // Tooltip 尺寸映射表
  const TOOLTIP_SIZE_MAP = {
    normal: "300px",
    big: "400px",
    biggest: "500px",
  };
  const getTooltipWidth = () => {
    if (!tooltipSize) return undefined;
    return TOOLTIP_SIZE_MAP[tooltipSize];
  };
  const tooltipStyles = {
    body: {
      ...(getTooltipWidth() && { width: getTooltipWidth() }),
    },
  };

  return (
    <Tooltip trigger={triggerEvent} title={title} styles={tooltipStyles || {}} placement={placement}>
      <QuestionCircleOutlined className="ui-panel-title-tooltip" style={{ fontSize: fontSize, color: color || "#555555", marginLeft: marginLeft, marginRight: marginRight }} />
    </Tooltip>
  );
});
