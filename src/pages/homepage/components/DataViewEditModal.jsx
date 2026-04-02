import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from "react";
import Http from "@/config/Http";
import { Modal, Select, Input, Checkbox, Switch, Button, Flex, Space, message } from "antd";
import "./DataViewEditModal.less";
import { dataViewMap, dataViewMapReverse, percentageOptionsDict } from "@/data/const";
import { TajMahal } from "@icon-park/react";
import StringUtils from "@/utils/StringUtils";

const { Option } = Select;

const DataViewEditModal = forwardRef(({ open, onCancel, onConfirm, getContainer, sites }, ref) => {
  // 组件选项数据
  const dataViewOption = [
    { label: "楼层转化分析（30%）", value: "floorConversion" },
    { label: "出入口客流数据（30%）", value: "entranceExit" },
    { label: "节日客流情况（40%）", value: "holidayFlow" },
    { label: "设备信息情况（20%）", value: "deviceInfo" },
    { label: "客群画像分析（40%）", value: "customerPortrait" },
    { label: "集团统计分析（40%）", value: "groupStatistics" },
  ];

  // 状态管理
  const [config, setConfig] = useState({
    title: "客流大数据可视化平台",
    showSiteName: 1,
    deduplication: 1,
    leftComponents: [{ component: "floorConversion" }, { component: "entranceExit" }, { component: "holidayFlow" }],
    rightComponents: [{ component: "deviceInfo" }, { component: "customerPortrait" }, { component: "groupStatistics" }],
  });
  const [loading, setLoading] = useState(false);
  const [siteId, setSiteId] = useState(null);
  const modalContentRef = useRef(null);
  useImperativeHandle(ref, () => ({
    setSiteId,
  }));

  // 每次打开 Modal 时滚动到顶部
  useEffect(() => {
    if (open) {
      // 使用 setTimeout 确保 Modal 已经完全渲染
      setTimeout(() => {
        // 查找 Ant Design Modal 的滚动容器
        const modalBody = document.querySelector(".data-view-edit-modal .ant-modal-body");
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
        // 如果找不到，尝试滚动 modal-content
        if (modalContentRef.current) {
          modalContentRef.current.scrollTop = 0;
        }
      }, 100);
    }
  }, [open]);

  const initConfig = useCallback(() => {
    const initData = {
      title: "客流大数据可视化平台",
      showSiteName: 1,
      deduplication: 1,
      leftComponents: [1, 2, 3],
      rightComponents: [4, 5, 6],
    };
    initData.leftComponents = initData.leftComponents.map((item) => {
      return { component: dataViewMap[item].value };
    });
    initData.rightComponents = initData.rightComponents.map((item) => {
      return { component: dataViewMap[item].value };
    });
    setConfig(initData);
  }, [siteId]);

  useEffect(() => {
    if (siteId) {
      Http.getDashboardSiteCfg(
        { siteId: siteId },
        (res) => {
          if (res.data) {
            console.log(res.data.title, 42);
            try {
              // 处理 Unicode 转义序列字符串
              let title = res.data.title;
              // 如果 title 是字符串格式的 JSON（包含引号），需要先解析
              if (typeof title === "string" && (title.startsWith('"') || title.includes("\\u"))) {
                title = JSON.parse(title);
              }
              // 使用辅助函数转换 Unicode 转义序列
              res.data.title = StringUtils.unicodeToString(title);
              res.data.leftComponents = res.data.leftComponents.map((item) => {
                return { component: dataViewMap[item].value };
              });
              res.data.rightComponents = res.data.rightComponents.map((item) => {
                return { component: dataViewMap[item].value };
              });
              setConfig(res.data);
            } catch (error) {
              console.error("解析 title 失败:", error);
              initConfig();
            }
          } else {
            initConfig();
          }
        },
        null,
        (error) => {
          initConfig();
        }
      );
    } else {
      console.log("82", "siteId is null");
    }
  }, [siteId, initConfig]);

  // 更新配置
  const updateConfig = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 更新组件（通用函数，支持左右侧）
  const updateComponent = (side, index, value) => {
    const isLeft = side === "left";
    const currentComponents = isLeft ? [...config.leftComponents] : [...config.rightComponents];
    const oppositeComponents = isLeft ? [...config.rightComponents] : [...config.leftComponents];

    // 如果清空组件
    if (!value) {
      currentComponents[index] = { ...currentComponents[index], component: undefined };
      setConfig((prev) => ({
        ...prev,
        [isLeft ? "leftComponents" : "rightComponents"]: currentComponents,
      }));
      return;
    }

    // 清除另一侧和同侧其他位置的重复组件
    oppositeComponents.forEach((item, idx) => {
      if (item.component === value) {
        oppositeComponents[idx] = { ...item, component: undefined };
      }
    });
    currentComponents.forEach((item, idx) => {
      if (item.component === value && idx !== index) {
        currentComponents[idx] = { ...item, component: undefined };
      }
      if (idx === index) {
        currentComponents[idx] = { ...item, component: value };
      }
    });

    setConfig((prev) => ({
      ...prev,
      leftComponents: isLeft ? currentComponents : oppositeComponents,
      rightComponents: isLeft ? oppositeComponents : currentComponents,
    }));
  };

  // 获取组件标签
  const getComponentLabel = (value) => {
    const option = dataViewOption.find((opt) => opt.value === value);
    return option ? option.label : "";
  };

  // 获取场地标签
  const getSiteLabel = (value) => {
    const option = sites && sites.length > 0 ? sites.find((opt) => opt.value === value) : null;
    // console.log("171", option?.option.label);
    return option ? option.label : "";
  };

  // 实时校验标题
  const validateTitle = (title) => {
    const trimmedTitle = title?.trim() || "";
    if (!trimmedTitle) {
      return { isValid: false, error: "大屏标题不能为空" };
    }
    if (trimmedTitle.length > 16) {
      return { isValid: false, error: "大屏标题最多只能输入16个字符" };
    }
    const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9，。、！!?？：；""''（）\s\-_()：.]+$/;
    if (!validPattern.test(trimmedTitle)) {
      return { isValid: false, error: "大屏标题包含非法字符，仅支持中文、英文、数字和常见标点符号" };
    }
    return { isValid: true, error: "" };
  };

  // 校验组件
  const validateComponents = (components, sideName) => {
    const validComponents = components.filter((item) => item.component);
    if (validComponents.length === 0) {
      message.error(`${sideName}组件至少需要选择一项`);
      return null;
    }
    const totalPercentage = validComponents.reduce((sum, item) => sum + (percentageOptionsDict[item.component] || 0), 0);
    if (totalPercentage > 100) {
      message.error(`${sideName}组件百分比总和不能超过100%，当前为${totalPercentage}%`);
      return null;
    }
    return validComponents;
  };

  // 处理确认
  const handleConfirm = () => {
    // 校验大屏标题
    const _config = { ...config, siteId: siteId };
    const titleValidation = validateTitle(_config.title);
    if (!titleValidation.isValid) {
      message.error(titleValidation.error);
      return;
    }

    // 校验组件
    const validLeftComponents = validateComponents(_config.leftComponents || [], "左侧");
    if (!validLeftComponents) return;
    const validRightComponents = validateComponents(_config.rightComponents || [], "右侧");
    if (!validRightComponents) return;

    // 校验重复
    const leftValues = validLeftComponents.map((item) => item.component);
    const rightValues = validRightComponents.map((item) => item.component);
    const duplicates = leftValues.filter((value) => rightValues.includes(value));
    if (duplicates.length > 0) {
      const duplicateNames = duplicates.map((value) => getComponentLabel(value)).join("、");
      message.error(`左右侧组件不能重复选择，重复的组件：${duplicateNames}`);
      return;
    }

    _config.siteName = getSiteLabel(siteId);
    _config.leftComponents = _config.leftComponents.map((item) => dataViewMapReverse[item.component] || 0);
    _config.rightComponents = _config.rightComponents.map((item) => dataViewMapReverse[item.component] || 0);

    const dashboardSiteCfgData = {
      siteId: siteId,
      cfg: JSON.stringify({
        title: _config.title || "客流大数据可视化平台",
        showSiteName: _config.showSiteName ? 1 : 0,
        deduplication: _config.deduplication ? 1 : 0,
        leftComponents: _config.leftComponents || [1, 2, 3],
        rightComponents: _config.rightComponents || [4, 5, 6],
      }),
    };

    Http.setDashboardSiteCfg(
      dashboardSiteCfgData,
      (res) => {
        // console.log("82", res);
      },
      null,
      (error) => {
        console.log("82", error);
      }
    );
    if (onConfirm) {
      onConfirm(_config);
      sessionStorage.setItem("dashboardSiteCfg", JSON.stringify(_config));
      // 新开窗口打开大屏页面
      const dataViewUrl = `${window.location.origin}/dataview`;
      window.open(dataViewUrl, "_blank");
    }
  };

  return (
    <Modal
      title={
        <>
          <div className="modal-title">
            <div className="modal-title-frame"></div>
            <div className="modal-title-text">参数配置</div>
          </div>
        </>
      }
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={null}
      className="data-view-edit-modal"
      getContainer={getContainer}>
      <div className="modal-content" ref={modalContentRef}>
        {/* 预览区域 */}
        <div className="preview-section">
          <div>预览区域:</div>
          <div className="preview-container">
            {/* 标题行 */}
            <div className="preview-header-row">
              {config.showSiteName === 1 ? <div className="preview-site-name">{getSiteLabel(siteId)}</div> : <div></div>}
              <div className="preview-title">{config.title}</div>
              <div className="preview-weather">时间</div>
            </div>

            {/* 主要内容区域 */}
            <div className="preview-main-content">
              {/* 左侧列 */}
              <div className="preview-left-column">
                {/* <div className="preview-column-title">{getSiteLabel(config.site)}</div> */}
                {config.leftComponents.map((item, index) => (
                  <div key={index} className="preview-component-item" style={{ height: `${percentageOptionsDict[item.component]}%` }}>
                    左{index + 1} {getComponentLabel(item.component)}
                  </div>
                ))}
              </div>

              {/* 中间区域 */}
              <div className="preview-center-area">
                <div className="preview-center-top">当前统计客流数据</div>
                <div className="preview-center-middle">
                  <div className="preview-center-item">今日客流趋势</div>
                  <div className="preview-center-item">近7日工作日、周末分析</div>
                </div>
                <div className="preview-center-bottom">近12个月客流趋势</div>
              </div>

              {/* 右侧列 */}
              <div className="preview-right-column">
                {/* <div className="preview-column-title">时间天气</div> */}
                {config.rightComponents.map((item, index) => (
                  <div key={index} className="preview-component-item" style={{ height: `${percentageOptionsDict[item.component]}%` }}>
                    右{index + 1} {getComponentLabel(item.component)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 配置表单区域 */}
        <div className="config-section">
          <Flex vertical gap={16}>
            {/* 场地选择 */}
            {(() => {
              const isSiteEmpty = !siteId;
              const isSitesEmpty = !sites || sites.length === 0;
              return (
                <Flex align="flex-start" gap={12}>
                  <span className="config-label required">场地选择：</span>
                  <Flex vertical gap={4} style={{ flex: 1 }}>
                    <Select
                      value={siteId}
                      onChange={(value) => setSiteId(value)}
                      style={{ width: 300 }}
                      placeholder="请选择场地"
                      status={isSiteEmpty ? "error" : ""}
                      notFoundContent={isSitesEmpty ? "暂无场地数据" : undefined}>
                      {!isSitesEmpty ? (
                        sites.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))
                      ) : (
                        <Option disabled value="">
                          暂无场地数据
                        </Option>
                      )}
                    </Select>
                    {isSitesEmpty && <div style={{ color: "#ff4d4f", fontSize: "14px" }}>暂无场地数据，请先添加场地</div>}
                    {!isSitesEmpty && isSiteEmpty && <div style={{ color: "#ff4d4f", fontSize: "14px" }}>请选择场地</div>}
                  </Flex>
                </Flex>
              );
            })()}

            {/* 大屏标题 */}
            {(() => {
              const titleValidation = config.title ? validateTitle(config.title) : { isValid: true, error: "" };
              return (
                <Flex align="flex-start" gap={12}>
                  <span className="config-label required">大屏标题：</span>
                  <Flex vertical gap={4} style={{ flex: 1 }}>
                    <Input
                      value={config.title}
                      onChange={(e) => updateConfig("title", e.target.value)}
                      placeholder="请输入大屏标题"
                      style={{ width: 300 }}
                      status={!titleValidation.isValid ? "error" : ""}
                    />
                    {!titleValidation.isValid && <div style={{ color: "#ff4d4f", fontSize: "14px" }}>{titleValidation.error}</div>}
                  </Flex>
                </Flex>
              );
            })()}

            {/* 标题行显示 */}
            <Flex align="center" gap={12}>
              <span className="config-label">标题行显示：</span>
              <Space>
                <Checkbox checked={config.showSiteName == 1} onChange={(e) => updateConfig("showSiteName", e.target.checked ? 1 : 0)}>
                  场地名称
                </Checkbox>
              </Space>
            </Flex>

            {/* 去重显示 */}
            <Flex align="center" gap={12}>
              <span className="config-label">去重显示：</span>
              <Switch checked={config.deduplication === 1} onChange={(value) => updateConfig("deduplication", value ? 1 : 0)} />
            </Flex>

            {/* 组件选择渲染函数 */}
            {["left", "right"].map((side) => {
              const components = config[`${side}Components`];
              const isEmpty = components.every((comp) => !comp.component);
              const sideName = side === "left" ? "左" : "右";
              return (
                <Flex key={side} align="flex-start" gap={12}>
                  <span className="config-label required">{sideName}侧组件：</span>
                  <Flex vertical gap={12} style={{ flex: 1 }}>
                    {components.map((item, index) => (
                      <Flex key={index} align="center" gap={12}>
                        <Select
                          value={item.component}
                          onSelect={(value) => updateComponent(side, index, value)}
                          allowClear
                          onClear={() => updateComponent(side, index, undefined)}
                          prefix={
                            <span>
                              {sideName}
                              {index + 1}：
                            </span>
                          }
                          style={{ width: 400 }}
                          placeholder="请选择组件"
                          status={isEmpty ? "error" : ""}>
                          {dataViewOption.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Flex>
                    ))}
                    {isEmpty && <div style={{ color: "#ff4d4f", fontSize: "14px" }}>至少选择一项组件</div>}
                  </Flex>
                </Flex>
              );
            })}

            {/* 底部按钮 */}
            <Flex justify="center" align="center" gap={12} style={{ marginTop: 20 }}>
              <Button onClick={onCancel}>取消</Button>
              <Button type="primary" onClick={handleConfirm}>
                保存并展示
              </Button>
            </Flex>
          </Flex>
        </div>
      </div>
    </Modal>
  );
});

export default DataViewEditModal;
