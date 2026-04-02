import React from "react";
import { Empty as AntEmpty } from "antd";
import "./index.less";

/**
 * 空状态组件
 *
 * @param {Object} props - 组件属性
 * @param {string} props.className - 自定义类名
 * @param {Object} props.style - 自定义样式
 * @param {string|ReactNode|boolean} props.description - 描述文字
 * @param {string|ReactNode} props.image - 自定义图片
 * @param {ReactNode} props.children - 子元素
 * @param {'default'|'small'|'large'} props.size - 大小
 */
const Empty = ({ className = "", style = {}, description = "暂无数据", image, imageStyle, children, size = "default", ...restProps }) => {
  return (
    <div className={`custom-empty ${className}`.trim()} style={style}>
      <AntEmpty description={description} image={image} size={size} {...restProps}>
        {children}
      </AntEmpty>
    </div>
  );
};

export default Empty;
