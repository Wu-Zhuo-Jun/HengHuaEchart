import React, { useState, useEffect, use } from "react";
import "./LocalComponent.less";
import { Drawer, Flex, Input, TreeSelect, Radio, Checkbox, Button, Table, Dropdown, Space, Select, TimePicker } from "antd";
import { UITitle, UIPlusCricleButton } from "../../../components/ui/UIComponent";
import { Language } from "../../../language/LocaleContext";
import { MinusCircleFilled, UpOutlined, DownOutlined, PlusOutlined, MoreOutlined } from "@ant-design/icons";
import TimeUtils from "../../../utils/TimeUtils";
import dayjs from "dayjs";
import { DataTable } from "../../../components/common/tables/Table";
import Http from "../../../config/Http";
import Message from "../../../components/common/Message";

export const SiteItem = React.memo(({ site, selected, isFloor, onSelectSite, onSelectFloor, selectedFloorId, onOperateFloor }) => {
  const [showFloor, setShowFloor] = useState(false);

  let className = selected ? "local-district-site-item local-district-site-item-selected" : "local-district-site-item";
  //   if (isFloor) {
  //     className = selected ? "local-district-site-item local-district-site-floor-item local-district-site-item-selected" : "local-district-site-item local-district-site-floor-item";
  //   }
  const onClick = () => {
    if (!isFloor) {
      onSelectSite?.call(null, site.siteId);
    }
  };
  //   const onClickShowFloor = () => {
  //     setShowFloor(!showFloor);
  //   };
  //   const onClickAddFloor = () => {
  //     onOperateFloor?.call(null, "addFloor", { siteId: site.siteId });
  //   };
  //   const onSelect = (floorId) => {
  //     onSelectFloor?.call(null, { floorId, site });
  //     onSelectSite?.call(null, site.siteId);
  //   };
  return (
    <div className="district" onClick={onClick}>
      <div className={className}>
        <div className="site-name">{site.siteName}</div>
        {/* <div className="group-name">{site.groupName}</div> */}
        {/* {isFloor && (
          <Flex style={{ marginTop: "15px" }} align="center" gap={15}>
            <Button
              type="primary"
              className="btn-primary-s4"
              style={{ width: "78px", height: "20px" }}
              icon={showFloor ? <DownOutlined style={{ fontSize: "10px", lineHeight: "20px" }} /> : <UpOutlined style={{ fontSize: "10px", lineHeight: "20px" }} />}
              iconPosition="end"
              onClick={onClickShowFloor}>
              {Language.CHAKANLOUCENG}
            </Button>
            <Button
              type="primary"
              className="btn-primary-s4"
              style={{ width: "78px", height: "20px" }}
              icon={<PlusOutlined style={{ fontSize: "10px", lineHeight: "20px" }} />}
              onClick={onClickAddFloor}>
              {Language.XINZENGLOUCENG}
            </Button>
          </Flex>
        )} */}
      </div>
      {/* {showFloor && isFloor && <FloorItemList selectedFloorId={selectedFloorId} floorList={site.floors} onSelect={onSelect} onOperateFloor={onOperateFloor} />} */}
    </div>
  );
});

export const SiteItemList = React.memo(({ siteList, siteId, onSelectSite, onSelectFloor, selectedFloorId, onOperateFloor, isFloor }) => {
  const [selectedSiteId, setSelectedSiteId] = useState(null);

  useEffect(() => {
    setSelectedSiteId(siteId);
  }, [siteId]);

  // const onSelected = (siteId) => {
  //     setSelectedSiteId(siteId);
  // }
  return (
    <div className="local-district-site-list">
      {siteList.map((site, index) => {
        return (
          <SiteItem
            key={index}
            site={site}
            selected={selectedSiteId === site.siteId}
            onSelectSite={onSelectSite}
            isFloor={isFloor}
            onSelectFloor={onSelectFloor}
            selectedFloorId={selectedFloorId}
            onOperateFloor={onOperateFloor}
          />
        );
      })}
    </div>
  );
});

export const FloorItemList = React.memo(({ floorList, selectedFloorId, onSelect, onOperateFloor }) => {
  return (
    <div style={{ marginTop: "5px" }}>
      <Flex vertical>
        {floorList?.map((floor, index) => {
          return <FloorItem key={index} floor={floor} selected={selectedFloorId === floor.floorId} onSelected={(floorId) => onSelect?.call(null, floorId)} onOperateFloor={onOperateFloor} />;
        })}
      </Flex>
    </div>
  );
});

export const FloorItem = React.memo(({ floor, selected, onSelected, onOperateFloor }) => {
  const onClickEdit = () => {
    onOperateFloor?.call(null, "editFloor", { siteId: floor.siteId, floorId: floor.floorId });
  };
  const onClickDelete = () => {
    onOperateFloor?.call(null, "deleteFloor", { siteId: floor.siteId, floorId: floor.floorId });
  };

  const className = selected ? "local-floor-item local-floor-item-selected" : "local-floor-item";
  const menu = [
    {
      key: 1,
      label: Language.BIANJI,
      onClick: onClickEdit,
    },
    {
      key: 2,
      label: Language.SHANCHU,
      onClick: onClickDelete,
    },
  ];

  const onClick = () => {
    onSelected?.call(null, floor.floorId);
  };

  return (
    <Flex className={className} align="center" justify="space-between" onClick={onClick}>
      <div>{floor.floorName}</div>
      <Dropdown menu={{ items: menu }} trigger={["click"]}>
        <MoreOutlined style={{ fontSize: "14px" }} />
      </Dropdown>
    </Flex>
  );
});

export const DeviceItem = ({ device, deviceOptions, onChange }) => {
  console.log("DeviceItem", device, deviceOptions);
  // const [serialNumber, setSerialNumber] = useState(device.serialNumber);
  const onClickDeleteDevice = (index) => {
    onChange?.call(null, "deleteDevice", index);
  };
  const onSelectDevice = (index, value) => {
    console.log("onSelectDevice", index, value);
    onChange?.call(null, "updateDevice", { index, value });
  };

  const deviceOptions2TreeData = (options) => {
    console.log("deviceOptions2TreeData", options);
    let treeData = [
      {
        label: Language.HENGHUAD3,
        value: "t1",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAD4,
        value: "t2",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAD4W,
        value: "t3",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAD5,
        value: "t4",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAD6W,
        value: "t5",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAZ4,
        value: "t6",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAZ5,
        value: "t7",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAH9,
        value: "t8",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUAD7PRO,
        value: "t9",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUADR8,
        value: "t10",
        selectable: false,
        children: [],
      },
      {
        label: Language.HENGHUADR9,
        value: "t11",
        selectable: false,
        children: [],
      },
    ];
    options.map((device) => {
      treeData
        .find((item) => item.value === `t${device.deviceType}`)
        .children.push({
          label: device.serialNumber,
          value: device.deviceId,
          disabled: device.disabled == null ? false : device.disabled,
        });
    });
    return treeData;
  };

  return (
    <Flex align="center" gap={16}>
      <TreeSelect
        style={{ width: "202px", height: "40px" }}
        treeData={deviceOptions && deviceOptions2TreeData(deviceOptions)}
        showSearch
        treeNodeFilterProp="label"
        value={device?.deviceId}
        allowClear
        placeholder={Language.QINGXUANZESHEBEIXULIEHAO}
        onChange={(value) => onSelectDevice(device?.index, value)}
      />
      <MinusCircleFilled
        style={{
          color: "#b4b4b4",
          fontSize: "20px",
          marginLeft: "7px",
          cursor: "pointer",
        }}
        onClick={() => onClickDeleteDevice(device?.index)}
      />
    </Flex>
  );
};

export const DeviceItemList = ({ deviceOptions, devices, onChange }) => {
  console.log("DeviceItemList", devices);
  const [deviceList, setDeviceList] = useState(devices);
  useEffect(() => {
    setDeviceList(devices);
  }, [devices]);

  const deleteDeviceByIndex = (index) => {
    // setDeviceList(deviceList.filter((device, deviceIndex) => deviceIndex !== index));
    onChange?.call(null, "deleteDevice", [...devices.filter((device, deviceIndex) => deviceIndex !== index)]);
  };

  const updateDeviceByIndex = (index, value) => {
    devices.map((device, deviceIndex) => {
      if (deviceIndex === index) {
        device.deviceId = value;
      }
    });
    // setDeviceList([...deviceList]);
    onChange?.call(null, "updateDevice", [...devices]);
  };

  const addDevice = () => {
    // setDeviceList([...deviceList, {}]);
    onChange?.call(null, "addDevice", [...devices, {}]);
  };

  const onChangeDevice = (type, value) => {
    if (type === "deleteDevice") {
      deleteDeviceByIndex(value);
    } else if (type === "updateDevice") {
      updateDeviceByIndex(value.index, value.value);
    }
  };

  const onClickAddDevice = () => {
    addDevice();
  };

  return (
    <Flex vertical gap={9}>
      {deviceList?.map((device, index) => (
        <DeviceItem key={index} device={{ ...device, index }} deviceOptions={deviceOptions} onChange={onChangeDevice} />
      ))}
      <UIPlusCricleButton onClick={onClickAddDevice}>{Language.TIANJIA}</UIPlusCricleButton>
    </Flex>
  );
};

export const DeviceDrawer = ({ title, door, open, onClose, ...props }) => {
  return (
    <Drawer maskClosable destroyOnHidden closable={false} title={title} width={544} open={open} {...props} footer={null} onClose={onClose}>
      <Flex vertical gap={23}>
        <Flex align="center" gap={20}>
          <UITitle>{Language.CHURUKOUMINGCHENG}:</UITitle>
          <div className="pb-text-not-editable" style={{ width: "353px", height: "40px", lineHeight: "40px" }}>
            {door?.doorName}
          </div>
        </Flex>
        <DataTable rowKey="deviceId" pagination={false} dataSource={door?.devices} style={{ height: "auto" }} scroll={{ x: "max-content", y: "500px" }}>
          <Table.Column title={Language.SHEBEIMINGCHENG} width="auto" dataIndex={"deviceName"} />
          <Table.Column title={Language.XULIEHAO} width="auto" dataIndex={"serialNumber"} />
        </DataTable>
      </Flex>
    </Drawer>
  );
};

const DEFAULT_DAILY_RANGE = [dayjs().hour(9).minute(0).second(0).millisecond(0), dayjs().hour(21).minute(0).second(0).millisecond(0)];

const toOpHour = (range) => {
  const safe = Array.isArray(range) ? range : null;
  const s = safe?.[0] ? dayjs(safe[0]) : null;
  const e = safe?.[1] ? dayjs(safe[1]) : null;
  const sHour = s ? Math.max(0, Math.min(23, s.hour())) : 0;
  let eHour = e ? Math.max(0, Math.min(23, e.hour())) : 24;
  if (eHour === 0) eHour = 24;
  return { sHour, eHour };
};

const fromOpHour = ({ sHour = 9, eHour = 21 }) => {
  const endHour = eHour >= 24 ? 23 : eHour;
  const endMinute = eHour >= 24 ? 59 : 0;
  return [dayjs().hour(sHour).minute(0).second(0).millisecond(0), dayjs().hour(endHour).minute(endMinute).second(0).millisecond(0)];
};

// 规范化区域状态
const buildRegionFormState = (area) => {
  if (!area) return null;
  const opHours = JSON.parse(area.opHours);
  let operationMode = "daily";
  let dailyTimeRange = DEFAULT_DAILY_RANGE;
  let weeklyTimeRanges = Array.from({ length: 7 }).map(() => DEFAULT_DAILY_RANGE);
  if (opHours) {
    operationMode = opHours.type == 2 ? "weekly" : "daily";
    if (opHours.type == 1 && opHours.hours?.[0]) {
      dailyTimeRange = fromOpHour(opHours.hours[0]);
    } else if (opHours.type == 2 && Array.isArray(opHours.hours)) {
      weeklyTimeRanges = opHours.hours.slice(0, 7).map((h) => fromOpHour(h));
    }
  }

  return {
    areaId: area.areaId,
    siteId: area.siteId,
    siteName: area.siteName,
    regionName: area.name ?? area.regionName ?? "",
    direction: area.sType ?? area.sType ?? 1,
    operationMode,
    dailyTimeRange,
    weeklyTimeRanges,
  };
};

export const EditAreasDrawer = ({ title, onClose, open, areaData, loading, onEditAreas, ...props }) => {
  const [requesting, setRequesting] = useState(false);
  const [region, setRegion] = useState(null);

  useEffect(() => {
    console.log("381", region);
  }, [region]);

  useEffect(() => {
    if (open && areaData && !loading) {
      setRegion(buildRegionFormState(areaData));
    }
  }, [open, areaData, loading]);

  const updateRegion = (patch) => {
    setRegion((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const onClickSave = () => {
    if (!region) return;
    const areaInfo = {
      name: region.regionName,
      sType: region.direction,
      opHours: {
        type: region.operationMode === "weekly" ? 2 : 1,
        hours: region.operationMode === "daily" ? [toOpHour(region.dailyTimeRange)] : (region.weeklyTimeRanges || []).slice(0, 7).map((r) => toOpHour(r)),
      },
    };
    requestEditArea(region, areaInfo);
  };

  const requestEditArea = (region, areaInfo) => {
    setRequesting(true);
    console.log("requestEditArea", areaInfo);
    Http.editArea(
      {
        siteId: region.siteId,
        areaId: region.areaId,
        name: areaInfo.name,
        sType: areaInfo.sType,
        opHours: JSON.stringify(areaInfo.opHours),
      },
      (res) => {
        if (res.result == 1) {
          Message.success("修改成功");
          onClose?.call(null, true);
        } else {
          Message.error(res.msg ?? "修改失败");
        }
        setRequesting(false);
      }
    );
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
                value={region?.weeklyTimeRanges?.[idx]}
                onChange={(value) => {
                  const base = Array.isArray(region?.weeklyTimeRanges) ? [...region.weeklyTimeRanges] : Array.from({ length: 7 }).map(() => DEFAULT_DAILY_RANGE);
                  base[idx] = value || DEFAULT_DAILY_RANGE;
                  updateRegion({ weeklyTimeRanges: base });
                }}
              />
            </div>
          </Flex>
        ))}
      </Flex>
    );
  };

  return (
    <Drawer
      width={544}
      title={title}
      closable={false}
      open={open}
      onClose={() => onClose?.call(null, false)}
      destroyOnHidden={true}
      {...props}
      footer={
        <Flex style={{ height: "50px" }} align="center" justify="center" gap={50}>
          <Button type="primary" className="btn-primary-s2" onClick={() => onClose?.call(null, false)}>
            {Language.QUXIAO}
          </Button>
          <Button type="primary" className="btn-primary" onClick={onClickSave} loading={requesting}>
            {Language.QUEREN}
          </Button>
        </Flex>
      }>
      {region && (
        <Flex vertical gap={20}>
          <Flex vertical gap={10}>
            <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>所属位置</div>
            <p style={{ margin: 0, fontSize: "14px", lineHeight: "22px", color: "#1f2d3d" }}>{region.siteName ?? "-"}</p>
          </Flex>
          <Flex vertical gap={10}>
            <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>
              <span style={{ color: "#ff4d4f", marginRight: 6 }}>*</span>区域名称
            </div>
            <Input value={region.regionName} placeholder="请输入" style={{ width: "100%", maxWidth: "100%", height: "36px" }} onChange={(e) => updateRegion({ regionName: e.target.value })} />
          </Flex>

          <Flex vertical gap={10}>
            <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>
              <span style={{ color: "#ff4d4f", marginRight: 6 }}>*</span>实时统计
            </div>
            <Radio.Group value={region.direction} onChange={(e) => updateRegion({ direction: e.target.value })}>
              <Flex align="center" gap={28} style={{ fontSize: "16px", lineHeight: "24px" }}>
                <Radio value={"1"}>热区实时汇总</Radio>
                <Radio value={"2"}>出入口实时汇总</Radio>
              </Flex>
            </Radio.Group>
          </Flex>

          <Flex vertical gap={10}>
            <div style={{ fontSize: "16px", lineHeight: "22px", fontWeight: 600 }}>
              <span style={{ color: "#ff4d4f", marginRight: 6 }}>*</span>运营时间
            </div>
            <Radio.Group value={region.operationMode} onChange={(e) => updateRegion({ operationMode: e.target.value })}>
              <Flex align="center" gap={28} style={{ fontSize: "16px", lineHeight: "24px" }}>
                <Radio value="daily">每日固定时间</Radio>
                <Radio value="weekly">一周不同时间</Radio>
              </Flex>
            </Radio.Group>
          </Flex>

          <div style={{ border: "1px solid #efefef", width: "100%", maxWidth: "100%" }}>
            <Flex style={{ height: "48px", backgroundColor: "#fafafa" }}>
              <div style={{ width: "220px", padding: "0 24px", display: "flex", alignItems: "center", fontSize: "14px", lineHeight: "22px", fontWeight: 600 }}>日期</div>
              <div style={{ flex: 1, padding: "0 24px", display: "flex", alignItems: "center", fontSize: "14px", lineHeight: "22px", fontWeight: 600 }}>时间范围</div>
            </Flex>

            {region.operationMode === "daily" ? (
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
                      value={region.dailyTimeRange}
                      onChange={(value) => updateRegion({ dailyTimeRange: value })}
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
    </Drawer>
  );
};
