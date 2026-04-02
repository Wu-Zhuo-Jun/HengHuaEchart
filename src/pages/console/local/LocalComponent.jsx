import React, { useState, useEffect, use } from "react";
import "./LocalComponent.css";
import { Drawer, Flex, Input, TreeSelect, Radio, Checkbox, Button, Table, Dropdown, Space, Select } from "antd";
import { UITitle, UIPlusCricleButton } from "../../../components/ui/UIComponent";
import { Language } from "../../../language/LocaleContext";
import { MinusCircleFilled, UpOutlined, DownOutlined, PlusOutlined, MoreOutlined } from "@ant-design/icons";
import { scroller, Element } from "react-scroll";
import TimeUtils from "../../../utils/TimeUtils";
import { DataTable } from "../../../components/common/tables/Table";
import Http from "../../../config/Http";
import Message from "../../../components/common/Message";

export const SiteItem = React.memo(({ site, selected, isFloor, onSelectSite, onSelectFloor, selectedFloorId, onOperateFloor }) => {
  const [showFloor, setShowFloor] = useState(false);

  let className = selected ? "local-site-item local-site-item-selected" : "local-site-item";
  if (isFloor) {
    className = selected ? "local-site-item local-site-floor-item local-site-item-selected" : "local-site-item local-site-floor-item";
  }
  const onClick = () => {
    if (!isFloor) {
      onSelectSite?.call(null, site.siteId);
    }
  };
  const onClickShowFloor = () => {
    setShowFloor(!showFloor);
  };
  const onClickAddFloor = () => {
    onOperateFloor?.call(null, "addFloor", { siteId: site.siteId });
  };
  const onSelect = (floorId) => {
    onSelectFloor?.call(null, { floorId, site });
    onSelectSite?.call(null, site.siteId);
  };
  return (
    <div onClick={onClick}>
      <div className={className}>
        <div className="site-name">{site.siteName}</div>
        <div className="group-name">{site.groupName}</div>
        {isFloor && (
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
        )}
      </div>
      {showFloor && isFloor && <FloorItemList selectedFloorId={selectedFloorId} floorList={site.floors} onSelect={onSelect} onOperateFloor={onOperateFloor} />}
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
    <div className="local-site-list">
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

export const EditDoorDrawer = ({ title, onClose, open, door, onEditDoor, ...props }) => {
  const [requesting, setRequesting] = useState(false);
  const onChange = (type, value) => {
    switch (type) {
      case "addDevice":
        scroller.scrollTo("deviceListEnd", {
          containerId: "scrollContainer",
          duration: 0,
          smooth: true,
          ignoreCancelEvents: true,
          isDynamic: true,
        });
        onEditDoor?.call(null, { ...door, devices: value });
        break;
      case "deleteDevice":
      case "updateDevice":
        onEditDoor?.call(null, { ...door, devices: value });
        break;
      case "update":
        onEditDoor?.call(null, { ...door, ...value });
        break;
      case "updateFloor":
        onEditDoor?.call(null, { ...door, floors: value });
        break;
    }
    // if (type === 'addDevice') {
    //     scroller.scrollTo('deviceListEnd', {
    //         containerId: 'scrollContainer',
    //         duration: 0,
    //         smooth: true,
    //         ignoreCancelEvents: true,
    //         isDynamic: true
    //     });
    //     onEditDoor?.call(null, { ...door, devices: value });
    // } else if (type === 'deleteDevice') {
    //     onEditDoor?.call(null, { ...door, devices: value });
    // } else if (type === 'updateDevice') {
    //     onEditDoor?.call(null, { ...door, devices: value });
    // } else if (type === 'update') {
    //     onEditDoor?.call(null, { ...door, ...value });
    // } else if (type === 'updateFloor') {

    // }
  };

  const onClickSave = () => {
    requestEditDoor(door);
  };

  const requestEditDoor = (door) => {
    setRequesting(true);
    Http.editDoor(getEditDoorParams(door), (res) => {
      if (res.result == 1) {
        Message.success(Language.XIUGAICHURUKOUCHENGGONG);
        onClose?.call(null, true);
      } else {
        Message.error(res.msg);
      }
      setRequesting(false);
    });
  };

  const getEditDoorParams = (door) => {
    let params = {
      doorName: door.doorName,
      direction: door.direction,
      isAllType: door.isAllType,
      isOutType: door.isOutType,
      isFloorType: door.isFloorType,
      doorId: door.doorId,
    };
    let devices = door.devices.map((device) => {
      return device.deviceId;
    });
    let floors = door.floors.map((floor) => {
      return floor.floorId;
    });
    params.floors = floors.join(",");
    params.devices = devices.join(",");
    return params;
  };

  return (
    <Drawer
      width={544}
      title={title}
      closable={false}
      open={open}
      onClose={onClose}
      destroyOnHidden={true}
      {...props}
      footer={
        <Flex style={{ height: "50px" }} align="center" justify="center" gap={50}>
          <Button type="primary" className="btn-primary-s2" onClick={onClose}>
            {Language.QUXIAO}
          </Button>
          <Button type="primary" className="btn-primary" onClick={onClickSave} loading={requesting}>
            {Language.QUEREN}
          </Button>
        </Flex>
      }>
      <Flex vertical gap={16}>
        <Flex align="center" gap={16}>
          <UITitle required>{Language.BANGDINGCHANGDI}</UITitle>
          <div className="pb-text-not-editable">{door?.siteName}</div>
          {/* <TreeSelect className='pb-tree-select' style={{
                        width: '356px',
                        height: '40px',
                    }} treeData={door?.treeData} placeholder={Language.QINGXUANZECHANGDIBANGDING} /> */}
        </Flex>
        <Flex align="center" gap={16}>
          <UITitle required>{Language.CHURUKOUMINGCHENG}</UITitle>
          <Input
            style={{
              width: "342px",
              height: "40px",
            }}
            placeholder={Language.QINGSHURUCHURUKOUMINGCHENG}
            defaultValue={door?.doorName}
            onChange={(e) => onChange("update", { doorName: e.target.value })}
          />
        </Flex>
        <Flex align="top" gap={16}>
          <UITitle>{Language.SHEBEIBANGDING}</UITitle>
          <div
            id="scrollContainer"
            className="pb-scroll-container"
            style={{
              width: "250px",
              padding: "0px 10px",
              maxHeight: "300px",
            }}>
            <DeviceItemList onChange={onChange} devices={door?.devices} deviceOptions={door?.deviceOptions} />
            <Element name="deviceListEnd" />
          </div>
        </Flex>
        <Flex align="top" gap={16}>
          <UITitle required>{Language.JINCHUFANGXIANG}</UITitle>
          <Radio.Group defaultValue={door?.direction} onChange={(e) => onChange("update", { direction: e.target.value })}>
            <Flex align="center" gap={16}>
              <Radio value={1}>{Language.ZHENGXIANG}</Radio>
              <Radio value={-1}>{Language.FANXIANG}</Radio>
            </Flex>
          </Radio.Group>
        </Flex>
        <Flex align="top" gap={16}>
          <UITitle>{Language.GUANLIANWEIZHI}:</UITitle>
          <Flex vertical gap={16}>
            <Flex align="center" gap={16}>
              <Checkbox defaultChecked={door?.isAllType == 1} onChange={(e) => onChange("update", { isAllType: e.target.checked ? 1 : -1 })}>
                {Language.ZONGKELIU}
              </Checkbox>
              <Checkbox defaultChecked={door?.isOutType == 1} onChange={(e) => onChange("update", { isOutType: e.target.checked ? 1 : -1 })}>
                {Language.CHANGWAIKELIU}
              </Checkbox>
              <Checkbox defaultChecked={door?.isFloorType == 1} onChange={(e) => onChange("update", { isFloorType: e.target.checked ? 1 : -1 })}>
                {Language.LOUCENG}
              </Checkbox>
            </Flex>
            <Select
              mode="multiple"
              fieldNames={{ label: "floorName", value: "floorId" }}
              optionLabelProp="floorName"
              optionFilterProp="floorName"
              maxTagCount="responsive"
              defaultValue={door?.floors?.map((floor) => floor.floorId)}
              options={door?.floorOptions}
              className="pb-tree-select"
              style={{
                width: "295px",
                height: "40px",
              }}
              placeholder={Language.LOUCENG}
              onChange={(list, option) => onChange("updateFloor", option)}
            />
            {/* <TreeSelect maxTagCount='responsive' className='pb-tree-select' style={{
                            width: '295px',
                            height: '40px',
                        }} multiple popupMatchSelectWidth={false} treeData={door?.floorTreeData} placeholder={Language.LOUCENG} /> */}
          </Flex>
        </Flex>
      </Flex>
    </Drawer>
  );
};
