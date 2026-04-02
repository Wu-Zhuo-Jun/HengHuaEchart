import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, Checkbox, Button, message } from "antd";
import { HolderOutlined, CloseOutlined } from "@ant-design/icons";
import { Language } from "@/language/LocaleContext";
import User from "@/data/UserData";
import Constant from "@/common/Constant";

// 客流指标全部可选项（key, label）
export const ALL_INDICATORS = [
  { key: "inCount", label: Language.JINCHANGRENCI },
  { key: "inNum", label: Language.JINCHANGRENSHU },
  { key: "batchCount", label: Language.KELIUPICI },
  { key: "collectCount", label: Language.JIKELIPINGFANG },
  { key: "outsideCount", label: Language.CHANGWAIKELIU },
  { key: "inRate", label: Language.JINCHANGLV },
  { key: "outCount", label: Language.CHUCHANGRENCI },
  { key: "passNum", label: Language.GUODIANKELIU },
  { key: "inStoreRate", label: Language.JINDIANLV },
];

// 默认已选指标及顺序
export const DEFAULT_SELECTED = ["inCount", "inNum", "batchCount", "collectCount"];

const IndicatorConfigModal = ({ open, onClose, value = DEFAULT_SELECTED, onApply }) => {
  const hasOverStoreFlowPermission = User.checkMasterPermission(Constant.MASTER_POWER.OVER_STORE_COUNT);
  const hasOutsideCountPermission = User.checkMasterPermission(Constant.MASTER_POWER.OUTSIDE_COUNT);
  const hasOutCountPermission = User.checkMasterPermission(Constant.MASTER_POWER.OUT_COUNT);
  const visibleIndicators = useMemo(() => {
    return ALL_INDICATORS.filter((i) => {
      if (i.key === "passNum" || i.key === "inStoreRate") return hasOverStoreFlowPermission;
      if (i.key === "outsideCount" || i.key === "inRate") return hasOutsideCountPermission;
      if (i.key === "outCount") return hasOutCountPermission;
      return true;
    });
  }, [hasOverStoreFlowPermission, hasOutsideCountPermission, hasOutCountPermission]);

  const [selectedKeys, setSelectedKeys] = useState(() => [...(value || DEFAULT_SELECTED)]);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  const isKeyVisible = useCallback(
    (k) => {
      if (k === "passNum" || k === "inStoreRate") return hasOverStoreFlowPermission;
      if (k === "outsideCount" || k === "inRate") return hasOutsideCountPermission;
      if (k === "outCount") return hasOutCountPermission;
      return true;
    },
    [hasOverStoreFlowPermission, hasOutsideCountPermission, hasOutCountPermission]
  );

  useEffect(() => {
    if (open) {
      const raw = value || DEFAULT_SELECTED;
      const filtered = [...raw].filter((k) => isKeyVisible(k));
      setSelectedKeys(filtered.length > 0 ? filtered : [DEFAULT_SELECTED[0]]);
    }
  }, [open, value, isKeyVisible]);

  const handleCheckAll = (e) => {
    if (e.target.checked) {
      setSelectedKeys(visibleIndicators.map((i) => i.key));
    } else {
      setSelectedKeys([DEFAULT_SELECTED[0]]);
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
      const saved = localStorage.getItem("flowRankingIndicatorConfig");
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter((k) => visibleIndicators.some((i) => i.key === k));
        setSelectedKeys(filtered.length > 0 ? filtered : [...DEFAULT_SELECTED]);
      } else {
        setSelectedKeys([...DEFAULT_SELECTED]);
      }
    } catch {
      setSelectedKeys([...DEFAULT_SELECTED]);
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

  const selectedItems = selectedKeys.map((key) => visibleIndicators.find((i) => i.key === key)).filter(Boolean);
  const allChecked = selectedKeys.length === visibleIndicators.length;
  const indeterminate = selectedKeys.length > 0 && selectedKeys.length < visibleIndicators.length;

  return (
    <Modal title="指标配置" open={open} onCancel={onClose} footer={null} width={640} destroyOnClose className="indicator-config-modal">
      <div className="indicator-config-modal__subtitle">排行榜默认以第一列的指标进行排序</div>
      <div className="indicator-config-modal__body">
        <div className="indicator-config-modal__left">
          <div className="indicator-config-modal__section-title">可添加的指标</div>
          <div className="indicator-config-modal__group">
            <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={handleCheckAll}>
              客流指标
            </Checkbox>
          </div>
          <div className="indicator-config-modal__list">
            {visibleIndicators.map((item) => (
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

export default IndicatorConfigModal;
