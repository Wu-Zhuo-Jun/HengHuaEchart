import React, { useState, useEffect, useMemo } from "react";
import { Modal, Checkbox, Button, message } from "antd";
import { HolderOutlined, CloseOutlined } from "@ant-design/icons";
import { faceRankingIndicators, FACE_RANKING_DEFAULT_SELECTED } from "../floorAnalyse/const";

/** 客群属性榜指标配置弹窗 - 男性、女性、婴儿、儿童、青年、壮年、中老年、未知 */
const FaceIndicatorConfigModal = ({ open, onClose, value = FACE_RANKING_DEFAULT_SELECTED, onApply }) => {
  const [selectedKeys, setSelectedKeys] = useState(() => [...(value || FACE_RANKING_DEFAULT_SELECTED)]);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  useEffect(() => {
    if (open) {
      const raw = value || FACE_RANKING_DEFAULT_SELECTED;
      const filtered = raw.filter((k) => faceRankingIndicators.some((i) => i.key === k));
      setSelectedKeys(filtered.length > 0 ? filtered : [...FACE_RANKING_DEFAULT_SELECTED]);
    }
  }, [open, value]);

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedKeys(faceRankingIndicators.map((i) => i.key));
    } else {
      setSelectedKeys([FACE_RANKING_DEFAULT_SELECTED[0]]);
    }
  };

  const handleCheckOne = (key, checked) => {
    if (checked) {
      setSelectedKeys((prev) => [...prev, key]);
    } else {
      setSelectedKeys((prev) => {
        const next = prev.filter((k) => k !== key);
        if (next.length === 0) {
          message.warning("指标配置最少选择一项");
          return prev;
        }
        return next;
      });
    }
  };

  const handleRemove = (key) => {
    setSelectedKeys((prev) => {
      const next = prev.filter((k) => k !== key);
      if (next.length === 0) {
        message.warning("指标配置最少选择一项");
        return prev;
      }
      return next;
    });
  };

  const handleRestore = () => {
    try {
      const saved = localStorage.getItem("faceRankingIndicatorConfig");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter((k) => faceRankingIndicators.some((i) => i.key === k));
        setSelectedKeys(filtered.length > 0 ? filtered : [...FACE_RANKING_DEFAULT_SELECTED]);
      } else {
        setSelectedKeys([...FACE_RANKING_DEFAULT_SELECTED]);
      }
    } catch {
      setSelectedKeys([...FACE_RANKING_DEFAULT_SELECTED]);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", String(index));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const fromIndex = Number(e.dataTransfer.getData("index"));
    if (isNaN(fromIndex) || fromIndex === targetIndex) return;
    setSelectedKeys((prev) => {
      const next = [...prev];
      const [removed] = next.splice(fromIndex, 1);
      next.splice(targetIndex, 0, removed);
      return next;
    });
  };

  const handleApply = () => {
    if (selectedKeys.length === 0) {
      message.warning("指标配置最少选择一项");
      return;
    }
    onApply?.(selectedKeys, saveAsDefault);
    onClose?.();
  };

  const selectedItems = selectedKeys.map((key) => faceRankingIndicators.find((i) => i.key === key)).filter(Boolean);
  const allChecked = selectedKeys.length === faceRankingIndicators.length;
  const indeterminate = selectedKeys.length > 0 && selectedKeys.length < faceRankingIndicators.length;

  return (
    <Modal title="客群属性指标配置" open={open} onCancel={onClose} footer={null} width={640} destroyOnClose className="indicator-config-modal">
      <div className="indicator-config-modal__subtitle">排行榜默认以第一列的指标进行排序</div>
      <div className="indicator-config-modal__body">
        <div className="indicator-config-modal__left">
          <div className="indicator-config-modal__section-title">可添加的指标</div>
          <div className="indicator-config-modal__group">
            <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={handleCheckAll}>
              客群属性指标
            </Checkbox>
          </div>
          <div className="indicator-config-modal__list">
            {faceRankingIndicators.map((item) => (
              <div key={item.key} className="indicator-config-modal__item">
                <Checkbox checked={selectedKeys.includes(item.key)} onChange={(e) => handleCheckOne(item.key, e.target.checked)}>
                  {item.label}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
        <div className="indicator-config-modal__right">
          <div className="indicator-config-modal__right-header">
            <span className="indicator-config-modal__section-title">已选指标</span>
            <Button type="link" size="small" onClick={handleRestore}>
              恢复默认
            </Button>
          </div>
          <div className="indicator-config-modal__selected-list">
            {selectedItems.map((item, index) => (
              <div
                key={item.key}
                className="indicator-config-modal__selected-item"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}>
                <HolderOutlined className="indicator-config-modal__drag-handle" />
                <span className="indicator-config-modal__selected-label">{item.label}</span>
                <CloseOutlined
                  className={`indicator-config-modal__remove ${selectedItems.length === 1 ? "indicator-config-modal__remove--disabled" : ""}`}
                  onClick={() => selectedItems.length > 1 && handleRemove(item.key)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="indicator-config-modal__footer">
        <Checkbox checked={saveAsDefault} onChange={(e) => setSaveAsDefault(e.target.checked)}>
          保存为默认配置
        </Checkbox>
        <Button type="primary" onClick={handleApply}>
          应用
        </Button>
      </div>
    </Modal>
  );
};

export default FaceIndicatorConfigModal;
export { faceRankingIndicators, FACE_RANKING_DEFAULT_SELECTED };
