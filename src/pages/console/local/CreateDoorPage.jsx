import { Button, Checkbox, Flex, Radio, TreeSelect, Input, Select } from "antd";
import React, { use, useEffect, useState } from "react";
import { Language } from "../../../language/LocaleContext";
import { DeleteOutlined, DotNetOutlined, MinusCircleFilled } from "@ant-design/icons";
import { UIPlusCricleButton, UITitle } from "../../../components/ui/UIComponent";
import { DeviceItemList } from "./LocalComponent";
import { scroller, Element } from "react-scroll";
import DemoUtils from "../../../utils/DemoUtils";
import ArrayUtils from "../../../utils/ArrayUtils";
import Http from "../../../config/Http";
import Message from "../../../components/common/Message";

const DoorItem = React.memo(({ door, onChange }) => {
  const onClickDeleteDoor = (index) => {
    onChange?.call(null, "deleteDoor", index);
  };

  const onChangeDirection = (e) => {
    let modifyDoor = { ...door, direction: e.target.value };
    onChange?.call(null, "updateDoor", modifyDoor);
  };

  const onChangeDevices = (type, devices) => {
    let ids = [];
    devices.map((device) => {
      if (device.deviceId) {
        ids.push(device.deviceId);
      }
    });
    let options = door.deviceOptions;
    options.map((option) => {
      option.disabled = ids.includes(option.deviceId);
      return option;
    });
    let modifyDoor = { ...door, devices: devices, deviceOptions: options };
    onChange?.call(null, "updateDoor", modifyDoor);
  };

  const onChangeDoorName = (e) => {
    let modifyDoor = { ...door, doorName: e.target.value };
    onChange?.call(null, "updateDoor", modifyDoor);
  };

  const onChangeIsAllType = (e) => {
    let modifyDoor = { ...door, isAllType: e.target.checked ? 1 : -1 };
    onChange?.call(null, "updateDoor", modifyDoor);
  };
  const onChangeIsOutType = (e) => {
    let modifyDoor = { ...door, isOutType: e.target.checked ? 1 : -1 };
    onChange?.call(null, "updateDoor", modifyDoor);
  };

  const onChangeIsFloorType = (e) => {
    let modifyDoor = { ...door, isFloorType: e.target.checked ? 1 : -1 };
    onChange?.call(null, "updateDoor", modifyDoor);
  };

  const onChangeDoorFloor = (value) => {
    console.log("value", value);
    let modifyDoor = { ...door, floors: value };
    onChange?.call(null, "updateDoor", modifyDoor);
  };

  const onChangeDoorType = (e) => {
    let type = e.target.value;
    let modifyDoor = { ...door };
    if (e.target.checked) {
      if (!modifyDoor.doorTypes) {
        modifyDoor.doorTypes = [];
      }
      if (!modifyDoor.doorTypes.includes(type)) {
        modifyDoor.doorTypes.push(type);
      }
    } else {
      if (modifyDoor.doorTypes && modifyDoor.doorTypes.includes(type)) {
        modifyDoor.doorTypes = modifyDoor.doorTypes.filter((t) => t !== type);
      }
    }
    onChange?.call(null, "updateDoor", modifyDoor);
  };

  return (
    <Flex
      vertical
      gap={14}
      style={{
        borderRadius: "8px",
        border: "1px solid #bbbbbb",
        width: "100%",
        minHeight: "175px",
        overflow: "clip",
      }}>
      <div
        style={{
          width: "100%",
          height: "36px",
          backgroundColor: "#3867d6",
          textAlign: "left",
          padding: "0 22px",
        }}>
        <Flex
          align="center"
          justify="space-between"
          style={{
            height: "100%",
            width: "100%",
          }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
            }}>
            ID{door.index + 1}
          </div>
          <DeleteOutlined
            style={{
              fontSize: "20px",
              color: "white",
              cursor: "pointer",
            }}
            onClick={() => onClickDeleteDoor(door.index)}
          />
        </Flex>
      </div>
      <Flex
        vertical
        style={{
          padding: "0 22px 10px 22px",
          width: "100%",
        }}
        gap={21}>
        <Flex
          align="center"
          gap={60}
          style={{
            width: "100%",
          }}>
          <Flex align="center" gap={16}>
            <UITitle
              required
              className="font-style-2-14"
              style={{
                whiteSpace: "nowrap",
              }}>
              {Language.CHURUKOUMINGCHENG}:
            </UITitle>
            <Input style={{ width: "200px", height: "40px" }} value={door.doorName} placeholder={Language.QINGSHURUCHURUKOUMINGCHENG} onChange={onChangeDoorName} />
          </Flex>
          <Flex align="center" gap={16}>
            <UITitle className="font-style-2-14" required>
              {Language.JINCHUFANGXIANG}:
            </UITitle>
            <Radio.Group defaultValue={door.direction} value={door.direction} onChange={onChangeDirection}>
              <Flex align="center" gap={16}>
                <Radio value={1}>{Language.ZHENGXIANG}</Radio>
                <Radio value={-1}>{Language.FANXIANG}</Radio>
              </Flex>
            </Radio.Group>
          </Flex>
          <Flex align="center" gap={16}>
            <div>{Language.GUANLIANWEIZHI}</div>
            <Checkbox defaultChecked={door.isAllType == 1} onChange={onChangeIsAllType}>
              {Language.ZONGKELIU}
            </Checkbox>
            <Checkbox defaultChecked={door.isOutType == 1} onChange={onChangeIsOutType}>
              {Language.CHANGWAIKELIU}
            </Checkbox>
            <Flex align="center" gap={8}>
              <Checkbox checked={door.isFloorType == 1} onChange={onChangeIsFloorType}>
                {Language.LOUCENG}:
              </Checkbox>
              <Select
                mode="multiple"
                fieldNames={{ label: "floorName", value: "floorId" }}
                optionLabelProp="floorName"
                optionFilterProp="floorName"
                maxTagCount="responsive"
                options={door.floorOptions}
                className="pb-tree-select"
                style={{
                  width: "148px",
                  height: "40px",
                }}
                placeholder={Language.LOUCENG}
                onChange={(value) => onChangeDoorFloor(value)}
              />
              {/* <TreeSelect maxTagCount='responsive' className='pb-tree-select' style={{
                                width: '148px',
                                height: '40px',
                            }} multiple popupMatchSelectWidth={false} treeData={door.floorTreeData} treeCheckable  placeholder={Language.LOUCENG} /> */}
            </Flex>
          </Flex>
        </Flex>

        <Flex align="top" gap={16}>
          <div className="font-style-2-14">{Language.SHEBEIBANGDING}:</div>
          <div style={{ width: "250px" }}>
            <DeviceItemList devices={door.devices} deviceOptions={door.deviceOptions} onChange={onChangeDevices} />
          </div>
        </Flex>
      </Flex>
    </Flex>
  );
});

const CreateDoorPage = ({ site, onChange }) => {
  const [doorList, setDoorList] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [deviceTreeData, setDeviceTreeData] = useState([]);
  const [needScrollToBottom, setNeedScrollToBottom] = useState(false);
  const [requesting, setRequesting] = useState(false);
  useEffect(() => {
    requestSiteDeviceList();
    console.log("aaaa", site);
  }, []);

  useEffect(() => {
    // scrollToBottom();
  }, [doorList]);

  const createDoor = (deviceOptions) => {
    let door = {
      devices: [],
      deviceOptions: deviceOptions,
      direction: 1,
      isAllType: -1,
      isOutType: -1,
      isFloorType: -1,
      doorName: null,
      floors: [],
      floorOptions: site.floors,
    };
    return door;
  };

  const onClickAddDoor = () => {
    setDoorList([...doorList, createDoor(deviceList)]);
  };
  const onClickConfrim = () => {
    console.log("doorLit", doorList);
    let doors = doorList2RequestDoors(doorList);
    let params = {
      siteId: site.siteId,
      doors: JSON.stringify(doors),
    };
    requestAddDoors(params);
    console.log("doors", doors);
    // onChange('add', doorList);
  };

  const onClickCancel = () => {
    onChange?.call(null, "cancel", site.siteId);
  };

  const onChangeDoor = (type, value) => {
    // if(type === 'deleteDoor'){
    //     setDoorList(doorList.filter((door, doorIndex) => doorIndex !== value));
    // }else if(type === 'addDevice'){
    //     let list = [...doorList];
    //     list.map((door, doorIndex) => {
    //         if(doorIndex === value.index){
    //             door.devices = value.deviceList;
    //         }
    //     });
    //     setDoorList(list);
    // }else if(type === 'deleteDevice'){
    //     let list = [...doorList];
    //     list.map((door, doorIndex) => {
    //         if(doorIndex === value.index){
    //             door.devices = value.deviceList;
    //         }
    //     });
    //     console.log(doorList);
    //     setDoorList(list);
    // }else if(type === 'updateDevice'){
    //     doorList.map((door, doorIndex) => {
    //         if(doorIndex === value.index){
    //             door.devices = value.deviceList;
    //             let deviceTreeData = DemoUtils.getDeviceTreeData();
    //         }
    //     });
    //     console.log(doorList);
    //     setDoorList([...doorList]);
    // }else if(type === 'updateDoor'){
    //     doorList.map((door, doorIndex) => {
    //         if(doorIndex === value.index){
    //             doorList[doorIndex] = {...value};
    //         }
    //     });
    //     setDoorList([...doorList]);
    // }
    if (type === "deleteDoor") {
      setDoorList(doorList.filter((door, doorIndex) => doorIndex !== value));
    } else if (type === "updateDoor") {
      doorList.map((door, doorIndex) => {
        if (doorIndex === value.index) {
          doorList[doorIndex] = { ...value };
        }
      });
      console.log(doorList);
      setDoorList([...doorList]);
    }
  };

  const scrollToBottom = () => {
    scroller.scrollTo("doorScrollContainerMessagesEnd", {
      containerId: "doorScrollContainer",
      duration: 0,
      smooth: true,
      ignoreCancelEvents: true,
      isDynamic: true,
    });
  };

  const requestSiteDeviceList = () => {
    Http.getSiteDeviceList({ siteId: site.siteId }, (res) => {
      let devices = deviceList;
      if (res.result == 1) {
        devices = res.data;
        setDeviceList(devices);
      }
      setDoorList([createDoor(devices)]);
    });
  };

  const requestAddDoors = (params) => {
    setRequesting(true);
    Http.addDoors(params, (res) => {
      if (res.result == 1) {
        onChange?.call(null, "success", site.siteId);
      } else {
        Message.error(res.msg);
      }
      setRequesting(false);
    });
  };

  const doorList2RequestDoors = (doorList) => {
    let doors = [];
    for (let i = 0; i < doorList.length; i++) {
      let door = doorList[i];
      let new_door = {
        doorName: door.doorName,
        direction: door.direction,
        isAllType: door.isAllType,
        isOutType: door.isOutType,
        isFloorType: door.isFloorType,
        devices: [],
        floors: [],
      };
      door.devices.map((device) => {
        if (device.deviceId) {
          new_door.devices.push(device.deviceId);
        }
      });
      if (new_door.isFloorType == 1) {
        door.floors.map((floorId) => {
          new_door.floors.push(floorId);
        });
      }
      doors.push(new_door);
    }
    return doors;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "15px 20px",
      }}>
      <Flex style={{ width: "100%", height: "100%" }} vertical gap={16}>
        <Flex align="center" gap={19}>
          <div
            style={{
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              backgroundColor: "#f9a231",
              textAlign: "center",
              fontWeight: "bold",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
            }}
            onClick={onClickCancel}>
            {"<"}
          </div>
          <div className="font-style-2-16">
            {site.siteName}
            {Language.XINZENGCHURUKOU}
          </div>
        </Flex>
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={16}>
            <Button style={{ height: "40px" }} type="primary" className="btn-primary" onClick={onClickAddDoor}>
              {Language.TIANJIACHURUKOU}
            </Button>
          </Flex>
          <Flex align="center" gap={44}>
            <Button type="primary" className="btn-primary" onClick={onClickConfrim} loading={requesting}>
              {Language.BAOCUN}
            </Button>
            <Button type="primary" className="btn-primary-s2" onClick={onClickCancel}>
              {Language.QUXIAO}
            </Button>
          </Flex>
        </Flex>
        <div
          id="doorScrollContainer"
          className="pb-scroll-container"
          style={{
            flex: 1,
            minHeight: 0,
          }}>
          <Flex vertical gap={9}>
            {doorList.map((door, index) => {
              door.index = index;
              return <DoorItem key={index} door={door} onChange={onChangeDoor} />;
            })}
            <Element name="doorScrollContainerMessagesEnd" />
          </Flex>
        </div>
      </Flex>
    </div>
  );
};

export default CreateDoorPage;
