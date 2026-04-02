import { Button, Flex, Input, Radio, Tabs, TimePicker, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { Language } from "../../../language/LocaleContext";
import { LeftOutlined } from "@ant-design/icons";
import Http from "../../../config/Http";

import dayjs from "dayjs";

const MAX_REGION_COUNT = 10;

const DEFAULT_DAILY_RANGE = [dayjs().hour(9).minute(0).second(0).millisecond(0), dayjs().hour(21).minute(0).second(0).millisecond(0)];

const toOpHour = (range) => {
  const safe = Array.isArray(range) ? range : null;
  const s = safe?.[0] ? dayjs(safe[0]) : null;
  const e = safe?.[1] ? dayjs(safe[1]) : null;
  const sHour = s ? Math.max(0, Math.min(23, s.hour())) : 0;
  let eHour = e ? Math.max(0, Math.min(23, e.hour())) : 24;
  // 后端格式要求 eHours 为 1-24；用 24 表示 24:00
  if (eHour === 0) eHour = 24;
  return { sHour, eHour };
};

// 创建区域
const CreateRegionPage = ({ site, onChange }) => {
  const [regionList, setRegionList] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [requesting, setRequesting] = useState(false);
  const [activeKey, setActiveKey] = useState("0");

  useEffect(() => {
    requestSiteDeviceList();
  }, []);

  const createRegion = (deviceOptions) => {
    return {
      devices: [],
      deviceOptions: deviceOptions,
      direction: 1,
      isAllType: -1,
      isOutType: -1,
      isFloorType: -1,
      regionName: "",
      floors: [],
      floorOptions: site.floors,
      operationMode: "daily",
      dailyTimeRange: DEFAULT_DAILY_RANGE,
      weeklyTimeRanges: Array.from({ length: 7 }).map(() => DEFAULT_DAILY_RANGE),
    };
  };

  const onClickAddRegion = () => {
    if (regionList.length >= MAX_REGION_COUNT) {
      message.error({ content: `最多新增${MAX_REGION_COUNT}个区域` });
      return;
    }
    const next = [...regionList, createRegion(deviceList)];
    setRegionList(next);
    setActiveKey(String(next.length - 1));
  };

  const onRemoveRegion = (targetIndex) => {
    if (regionList.length <= 1) {
      return;
    }
    const next = regionList.filter((_, index) => index !== targetIndex);
    setRegionList(next);
    setActiveKey((prevKey) => {
      const prevIndex = Number(prevKey);
      if (prevIndex > targetIndex) {
        return String(prevIndex - 1);
      }
      if (prevIndex === targetIndex) {
        return String(Math.max(0, targetIndex - 1));
      }
      return prevKey;
    });
  };

  const updateCurrentRegion = (patch) => {
    const index = Number(activeKey);
    if (!regionList[index]) {
      return;
    }
    const next = regionList.map((region, regionIndex) => {
      if (regionIndex !== index) {
        return region;
      }
      return { ...region, ...patch };
    });
    setRegionList(next);
  };

  const validateRegionName = (name, index) => {
    const trimmed = name?.trim();
    if (!trimmed) {
      return { valid: false, message: `第 ${index} 个区域：未填写，请输入区域名称` };
    }
    if (trimmed.length > 32) {
      return { valid: false, message: `第 ${index} 个区域：格式错误，区域名称最大长度为32个字符` };
    }
    const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9._\-()/#&:]+$/;
    if (!validPattern.test(trimmed)) {
      return { valid: false, message: `第 ${index} 个区域：输入非法字符，仅支持中文、字母、数字及符号 (._-()/#&:)` };
    }
    return { valid: true };
  };

  const onClickConfrim = () => {
    for (let i = 0; i < regionList.length; i++) {
      const result = validateRegionName(regionList[i].regionName, i + 1);
      if (!result.valid) {
        setActiveKey(String(i));
        message.error({ content: result.message });
        return;
      }
    }
    let areaInfo = regionList2RequestAreaInfo(regionList);
    let params = {
      siteId: site.siteId,
      areaInfo: JSON.stringify(areaInfo),
    };
    requestAddArea(params);
  };

  const onClickCancel = () => {
    onChange?.call(null, "cancel", site.siteId);
  };

  const currentRegion = useMemo(() => {
    const index = Number(activeKey);
    return regionList[index] || regionList[0];
  }, [activeKey, regionList]);

  const tabItems = useMemo(() => {
    return regionList.map((region, index) => ({
      key: String(index),
      label: region.regionName?.trim() ? region.regionName : `区域 ${index + 1}`,
      closable: regionList.length > 1,
    }));
  }, [regionList]);

  const onEditTab = (targetKey, action) => {
    if (action === "add") {
      onClickAddRegion();
      return;
    }
    if (action === "remove") {
      onRemoveRegion(Number(targetKey));
    }
  };

  const renderWeeklyRows = () => {
    const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    return (
      <Flex vertical gap={8} style={{ padding: "8px 0" }}>
        {weekDays.map((label, idx) => (
          <Flex key={label}>
            <div style={{ width: "220px", padding: "0 24px", display: "flex", alignItems: "center", fontSize: "16px", lineHeight: "24px", color: "#1f2d3d" }}>{label}</div>
            <div style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center" }}>
              <TimePicker.RangePicker
                style={{ width: "340px", height: "36px" }}
                format="HH:mm"
                minuteStep={60}
                showNow={false}
                allowClear={false}
                value={currentRegion?.weeklyTimeRanges?.[idx]}
                onChange={(value) => {
                  const base = Array.isArray(currentRegion?.weeklyTimeRanges) ? [...currentRegion.weeklyTimeRanges] : Array.from({ length: 7 }).map(() => DEFAULT_DAILY_RANGE);
                  base[idx] = value || DEFAULT_DAILY_RANGE;
                  updateCurrentRegion({ weeklyTimeRanges: base });
                }}
              />
            </div>
          </Flex>
        ))}
      </Flex>
    );
  };

  const requestSiteDeviceList = () => {
    Http.getSiteDeviceList({ siteId: site.siteId }, (res) => {
      let devices = [];
      if (res.result == 1) {
        devices = res.data;
        setDeviceList(devices);
      }
      const initRegions = [createRegion(devices)];
      setRegionList(initRegions);
      setActiveKey("0");
    });
  };

  const requestAddArea = (params) => {
    setRequesting(true);
    Http.addArea(params, (res) => {
      if (res.result == 1) {
        onChange?.call(null, "success", site.siteId);
      } else {
        message.error({ content: res.msg });
      }
      setRequesting(false);
    });
  };

  const regionList2RequestAreaInfo = (regionList) => {
    return regionList.map((region) => {
      const type = region.operationMode === "weekly" ? 2 : 1;
      const hours = type === 1 ? [toOpHour(region.dailyTimeRange)] : (region.weeklyTimeRanges || []).slice(0, 7).map((r) => toOpHour(r));

      return {
        name: region.regionName,
        sType: region.direction === 1 ? 1 : 2,
        opHours: {
          type,
          hours,
        },
      };
    });
  };

  return (
    <Flex vertical style={{ width: "100%", height: "100%", backgroundColor: "#fff" }}>
      <Flex align="center" justify="space-between" style={{ padding: "16px 20px 8px 20px" }}>
        <Flex align="center" gap={19}>
          <Button type="text" shape="circle" style={{ width: "30px", height: "30px", color: "#fff", backgroundColor: "#f9a231" }} icon={<LeftOutlined />} onClick={onClickCancel} />
          <Flex vertical gap={2}>
            <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600, color: "#1f2d3d" }}>新增区域</div>
            <div style={{ fontSize: "14px", lineHeight: "18px", color: "#1f2d3d" }}>{site.siteName}</div>
          </Flex>
        </Flex>
        <Flex align="center" gap={12}>
          <Button onClick={onClickAddRegion} disabled={regionList.length >= MAX_REGION_COUNT}>
            新增区域
          </Button>
          <Button type="primary" className="btn-primary" onClick={onClickConfrim} loading={requesting}>
            提交
          </Button>
          {/* <Button className="btn-primary-s2" onClick={onClickCancel}>
            {Language.QUXIAO}
          </Button> */}
        </Flex>
      </Flex>

      <div style={{ padding: "0 20px 16px 20px", flex: 1, minHeight: 0 }}>
        <Flex vertical style={{ height: "100%" }}>
          <div>
            <Tabs type="editable-card" hideAdd activeKey={activeKey} onChange={setActiveKey} onEdit={onEditTab} items={tabItems} style={{ margin: 0 }} />
          </div>

          <div style={{ padding: "16px 20px", flex: 1, minHeight: 0, overflowY: "auto", border: "1px solid #efefef", borderRadius: "4px", overflowX: "hidden" }}>
            {currentRegion && (
              <Flex vertical gap={20}>
                <Flex vertical gap={10}>
                  <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>
                    <span style={{ color: "#ff4d4f", marginRight: 6 }}>*</span>区域名称
                  </div>
                  <Input
                    value={currentRegion.regionName}
                    placeholder="请输入"
                    style={{ width: "100%", maxWidth: "920px", height: "36px" }}
                    onChange={(e) => updateCurrentRegion({ regionName: e.target.value })}
                    maxLength={32}
                  />
                </Flex>

                <Flex vertical gap={10}>
                  <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>
                    <span style={{ color: "#ff4d4f", marginRight: 6 }}>*</span>实时统计
                  </div>
                  <Radio.Group value={currentRegion.direction} onChange={(e) => updateCurrentRegion({ direction: e.target.value })}>
                    <Flex align="center" gap={28} style={{ fontSize: "16px", lineHeight: "24px" }}>
                      <Radio value={1}>热区实时汇总</Radio>
                      <Radio value={2}>出入口实时汇总</Radio>
                    </Flex>
                  </Radio.Group>
                </Flex>

                <Flex vertical gap={10}>
                  <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>
                    <span style={{ color: "#ff4d4f", marginRight: 6 }}>*</span>运营时间
                  </div>
                  <Radio.Group value={currentRegion.operationMode} onChange={(e) => updateCurrentRegion({ operationMode: e.target.value })}>
                    <Flex align="center" gap={28} style={{ fontSize: "16px", lineHeight: "24px" }}>
                      <Radio value="daily">每日固定时间</Radio>
                      <Radio value="weekly">一周不同时间</Radio>
                    </Flex>
                  </Radio.Group>
                </Flex>

                <div style={{ border: "1px solid #efefef", width: "100%", maxWidth: "980px" }}>
                  <Flex style={{ height: "48px", backgroundColor: "#fafafa" }}>
                    <div style={{ width: "220px", padding: "0 24px", display: "flex", alignItems: "center", fontSize: "14px", lineHeight: "22px", fontWeight: 600 }}>日期</div>
                    <div style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center", fontSize: "14px", lineHeight: "22px", fontWeight: 600 }}>时间范围</div>
                  </Flex>

                  {currentRegion.operationMode === "daily" ? (
                    <div style={{ borderTop: "1px solid #efefef", padding: "8px 0" }}>
                      <Flex style={{ height: "48px" }}>
                        <div style={{ width: "220px", padding: "0 24px", display: "flex", alignItems: "center", fontSize: "14px", lineHeight: "22px", color: "#1f2d3d" }}>每日</div>
                        <div style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center" }}>
                          <TimePicker.RangePicker
                            style={{ width: "340px", height: "30px" }}
                            format="HH:mm"
                            minuteStep={60}
                            showNow={false}
                            allowClear={false}
                            value={currentRegion.dailyTimeRange}
                            onChange={(value) => updateCurrentRegion({ dailyTimeRange: value })}
                          />
                        </div>
                      </Flex>
                    </div>
                  ) : (
                    renderWeeklyRows()
                  )}
                </div>
              </Flex>
            )}
          </div>
        </Flex>
      </div>
    </Flex>
  );
};

export default CreateRegionPage;
