import React, { useState, useEffect } from "react";
import { Modal, List, Radio, Flex, Tag, message } from "antd";
import { RightOutlined } from "@ant-design/icons";
import "./UserDataViewList.less";

const UserDataViewList = ({ open, onCancel, onConfirm, dashboardList }) => {
  const [selectedValue, setSelectedValue] = useState("TzDataView");

  useEffect(() => {
    if (open) {
      // 默认选中通用大屏
      setSelectedValue("common");
    }
  }, [open]);

  const dataViewOptions = [
    {
      value: "common",
      label: "通用大屏",
      description: "支持多种组件配置的数据可视化大屏",
    },
    {
      value: "TzDataView",
      label: "自定义大屏",
      description: "定制化可视化数据大屏",
    },
  ];

  const handleConfirm = () => {
    const selected = dataViewOptions.find((item) => item.value === selectedValue);
    if (onConfirm) {
      onConfirm(selected?.value);
    }
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={<div className="user-data-view-list-modal-title">选择大屏类型</div>}
      footer={
        <Flex justify="flex-end" gap={12}>
          <div className="user-data-view-list-modal-btn" onClick={onCancel}>
            取消
          </div>
          <div className="user-data-view-list-modal-btn primary" onClick={handleConfirm}>
            确定
          </div>
        </Flex>
      }
      width={440}
      className="user-data-view-list-modal"
      closable={false}>
      <div className="user-data-view-list-content">
        <Radio.Group value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)} className="user-data-view-list-radio-group">
          {dataViewOptions.map((item) => (
            <div key={item.value} className="user-data-view-list-item">
              <Radio value={item.value} className="user-data-view-list-radio">
                <Flex vertical gap={4}>
                  <span className="user-data-view-list-item-label">{item.label}</span>
                  <span className="user-data-view-list-item-desc">{item.description}</span>
                </Flex>
              </Radio>
              <RightOutlined className="user-data-view-list-arrow" />
            </div>
          ))}
        </Radio.Group>
      </div>
    </Modal>
  );
};

export default UserDataViewList;
