import { DataTable, NetDataTable } from "../../../components/common/tables/Table";
import React, { use, useCallback, useEffect, useState, useRef } from "react";
import { UIContent, UIPageHeader, ICPComponent } from "../../../components/ui/UIComponent";
import { Language } from "../../../language/LocaleContext";
import { Data, Label, RowHeight, Search } from "@icon-park/react";
import { Badge, Button, Drawer, Flex, Input, Radio, Select, Table, TreeSelect } from "antd";
import { SearchOutlined, MinusCircleFilled, PlusCircleFilled } from "@ant-design/icons";
import DemoUtils from "../../../utils/DemoUtils";
import { scroller, Element, animateScroll } from "react-scroll";
import Http from "../../../config/Http";
import Constant from "../../../common/Constant";
import TimeUtils from "../../../utils/TimeUtils";
import { data } from "jquery";
import ArrayUtils from "../../../utils/ArrayUtils";
import Message from "../../../components/common/Message";
import { all } from "axios";

const DeviceManagementModel = {
  queryModel: {
    page: 1,
    limit: Constant.PAGE_SIZES[0],
    allNumber: 1,
    search: null,
    sort: 0,
    sites: [],
  },
  device: null,
  resetQueryModel: () => {
    DeviceManagementModel.queryModel = {
      page: 1,
      limit: Constant.PAGE_SIZES[0],
      allNumber: 1,
      search: null,
      sort: 0,
    };
    DeviceManagementModel.device = null;
  },
};

const DeviceModel = {
  deviceList: null,
  device: null,
};

const DeviceManagement = () => {
  const onlieSelectOptions = [
    {
      label: Language.QUANBU,
      value: 0,
    },
    {
      label: Language.ZAIXIAN,
      value: 1,
    },
    {
      label: Language.LIXIAN,
      value: -1,
    },
  ];
  const assocSelectOptions = [
    {
      label: Language.QUANBU,
      value: 0,
    },
    {
      label: Language.YIGUANLIAN,
      value: 1,
    },
    {
      label: Language.WEIGUANLIAN,
      value: -1,
    },
  ];
  const stateSelectOptions = [
    {
      label: Language.QUANBU,
      value: 0,
    },
    {
      label: Language.ZHENGCHANG,
      value: 1,
    },
    {
      label: Language.TINGYONG,
      value: -1,
    },
  ];
  const [onlineDefaultValue, setOnlineDefaultValue] = useState(0);
  const [showDeviceDrawer, setShowDeviceDrawer] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [deviceList, setDeviceList] = useState(null);
  const [siteTreeData, setSiteTreeData] = useState(null);
  const [selectedSites, setSelectedSites] = useState([]);
  const [search, setSearch] = useState(null);
  const [queryData, setQueryData] = useState({});
  const [query, setQuery] = useState({
    search: null,
    pager: { current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 },
  });
  // const [pager, setPager] = useState({ current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 });

  useEffect(() => {
    requestGetGroupsSites();
    requestGetDeviceList(query);
  }, []);

  const onClickReset = () => {
    console.log("reset");
    setQueryData({
      // ...query,
      state: 0,
      online: 0,
      assoc: 0,
      search: null,
      sites: [],
    });
    // setOnlineDefaultValue(0);
  };

  const onClickQuery = () => {
    requestGetDeviceList({ ...query, pager: { current: 1, pageSize: query.pager.pageSize, total: query.pager.pageSize.total }, ...queryData });
  };

  const onClickDeviceAssign = (record) => {
    let device = {
      deviceId: record.deviceId,
      deviceName: record.deviceName,
      serialNumber: record.serialNumber,
      siteId: record.siteId != "0" ? record.siteId : null,
      // siteTreeData: siteTreeData,
      doors: record.doors,
    };
    setShowDeviceDrawer(true);
    setEditDevice(device);
  };

  const openDeviceDrawer = (device) => {
    setShowDeviceDrawer(true);
    setEditDevice(device);
  };

  const onChangeDevice = (device) => {
    // setShowDeviceDrawer(false);
    console.log("onChangeDevice", device);
    setEditDevice({ ...editDevice, ...device });
  };

  const onChangeQuery = (key, value) => {
    setQueryData({ ...queryData, [key]: value });
  };

  const onChangePage = (current, pageSize) => {
    console.log("onChangePage", query);
    requestGetDeviceList({ ...query, pager: { ...query.pager, current: current, pageSize: pageSize } });
  };

  const onChangeTable = (pagination, filters, sorter) => {
    console.log("onChangeTable", pagination, filters, sorter);
    let sortProp = null;
    let sort = null;
    if (sorter.columnKey == "assignTimeDesc") {
      sortProp = "assignTime";
    } else if (sorter.columnKey == "heartTimeDesc") {
      sortProp = "heartTime";
    } else if (sorter.columnKey == "createTimeDesc") {
      sortProp = "createTime";
    }
    if (sorter.order == "ascend") {
      sort = 1;
    } else if (sorter.order == "descend") {
      sort = -1;
    }
    requestGetDeviceList({ ...query, sortProp, sort });
  };

  const onCloseDeviceDrawer = (update = false) => {
    setShowDeviceDrawer(false);
    setEditDevice(null);
    if (update) {
      requestGetDeviceList(query);
    }
  };

  const requestGetDeviceList = (query) => {
    // setQuery(query);
    let params = {
      search: query.search,
      state: query.state,
      online: query.online,
      assoc: query.assoc,
      page: query.pager.current,
      limit: query.pager.pageSize,
      sort: query.sort,
      sortProp: query.sortProp,
      allNumber: 1,
    };
    if (query?.sites?.length > 0) {
      params.sites = query.sites.map((site) => site.value).join(",");
    }
    Http.getDeviceList(params, (res) => {
      let deviceList = formatDeviceList(res.data.data, res.data.doors);
      setDeviceList(deviceList);
      let pager = res.data.pager;
      setQuery({ ...query, pager: { current: pager.page, pageSize: pager.limit, total: pager.count } });
      // setPager(pager.page, pager.limit, pager.count);
    });
  };

  const requestGetGroupsSites = () => {
    const formatSites = (sites) => {
      sites.map((site) => {
        site.label = site.siteName;
        site.checkable = true;
        site.value = site.siteId;
        site.parentId = site.groupId == "0" || site.groupId == 0 ? "-1" : `group_${site.groupId}`;
        return site;
      });
      return sites;
    };

    const formatGroups = (groups) => {
      groups.map((group) => {
        group.label = group.groupName;
        group.checkable = false;
        if (group.parentId == "0") {
          group.parentId = null;
        } else {
          group.parentId = `group_${group.parentId}`;
        }
        group.value = `group_${group.groupId}`;
        return group;
      });
      groups.unshift({ label: Language.WEIFENPEIJIEDIAN, value: "-1", checkable: false, parentId: "0" });
      return groups;
    };
    Http.getGroupSiteSelection({}, (res) => {
      if (res.result == 1) {
        let sites = formatSites(res.data.sites);
        let groups = formatGroups(res.data.groups);
        let options = [...groups, ...sites];
        options = ArrayUtils.dataList2TreeNode(options, "value");
        setSiteTreeData(options);
      } else {
        Message.error(res.msg);
      }
    });
  };

  const setPager = (page, pageSize, total) => {
    let newQuery = { ...query, pager: { current: page, pageSize: pageSize, total: total } };
    console.log("setPager", newQuery);
    setQuery(newQuery);
  };

  const formatDeviceList = (deviceList, doorList) => {
    let door_map = {};
    for (let i = 0; i < doorList.length; i++) {
      door_map[doorList[i].doorId] = doorList[i];
    }
    deviceList.map((device) => {
      device.assignTime = Number(device.assignTime);
      device.assignTimeDesc = device.assignTime ? TimeUtils.ts2Date(device.assignTime, "yyyy-MM-dd HH:mm:ss") : Language.ZANWU;
      device.heartTime = Number(device.heartTime);
      device.heartTimeDesc = device.heartTime ? TimeUtils.ts2Date(device.heartTime, "yyyy-MM-dd HH:mm:ss") : Language.ZANWU;
      device.createTime = Number(device.createTime);
      device.createTimeDesc = TimeUtils.ts2Date(device.createTime, "yyyy-MM-dd HH:mm:ss");
      device.online = Number(device.online);
      device.onlineDesc = Number(device.online) == 1 ? Language.ZAIXIAN : Language.LIXIAN;
      device.state = Number(device.state);
      device.stateDesc = Number(device.state) == 1 ? Language.ZHENGCHANG : Language.TINGYONG;
      if (device.siteId != "0") {
        if (device.siteName == null) {
          device.siteName = Language.ZHAOBUDAOCHENGDIMINGCHENG;
        }
      } else {
        device.siteName = Language.ZANWU;
      }
      device.dataState = Number(device.dataState);
      if (!device.doors || device.doors.length == 0) {
        device.assocDesc = Language.WEIGUANLIAN;
        device.doorName = Language.ZANWU;
        device.doors = [];
      } else {
        let doorIds = device.doors.split(",");
        let doorNames = [];
        device.doors = [];
        doorIds.map((doorId) => {
          if (door_map[doorId]) {
            doorNames.push(door_map[doorId].doorName);
            device.doors.push({
              doorId: doorId,
              // doorName: door_map[doorId].doorName,
            });
          }
        });
        device.doorName = doorNames.join(" , ");
        device.assocDesc = Language.YIGUANLIAN;
      }
      return device;
    });
    return deviceList;
  };

  return (
    <div className="main">
      <UIPageHeader title={Language.SHEBEIGUANLI} introduce={Language.SHEBEIGUANLI_TIP} />
      <div className="layout-content layout-content-noScroll">
        <UIContent style={{ height: "139px", paddingTop: 15 }}>
          <Flex vertical={true} gap={"25px"}>
            <Flex align="center" gap={"33px"}>
              <Flex align="center" gap={"10px"}>
                <div>{Language.CHANGDIXUANZE}: </div>
                <TreeSelect
                  allowClear
                  showSearch
                  treeNodeFilterProp="label"
                  showCheckedStrategy="SHOW_ALL"
                  treeCheckStrictly
                  treeCheckable
                  value={queryData?.sites}
                  maxTagCount="responsive"
                  style={{ width: "234px" }}
                  treeData={siteTreeData}
                  // fieldNames={{ label: 'label', value: 'value', children: 'children' }}
                  placeholder={Language.QINGXUANZESHEBEISUOSHUDECHANGDI}
                  onChange={(value) => onChangeQuery("sites", value)}
                />
              </Flex>
              <Input
                prefix={<SearchOutlined />}
                value={queryData?.search}
                style={{ width: "220px", height: "32px" }}
                placeholder={`${Language.SHEBEIMINGCHENG}/${Language.XULIEHAO}`}
                onChange={(e) => onChangeQuery("search", e.target.value)}
              />
            </Flex>
            <Flex align="center" gap={"33px"}>
              <Flex align="center" gap={"10px"}>
                <div>{Language.WANGLUOZHUANGTAI}: </div>
                <Select style={{ width: "140px" }} options={onlieSelectOptions} defaultValue={0} value={queryData?.online} onChange={(value) => onChangeQuery("online", value)} />
              </Flex>
              <Flex align="center" gap={"10px"}>
                <div>{Language.GUANLIANZHUANGTAI}: </div>
                <Select style={{ width: "191px" }} options={assocSelectOptions} defaultValue={0} value={queryData?.assoc} onChange={(value) => onChangeQuery("assoc", value)} />
              </Flex>
              <Flex align="center" gap={"10px"}>
                <div>{Language.QIYONGZHUANGTAI}: </div>
                <Select style={{ width: "136px" }} options={stateSelectOptions} defaultValue={0} value={queryData?.state} onChange={(value) => onChangeQuery("state", value)} />
              </Flex>
              <Flex align="center" gap={"12px"}>
                <Button type="primary" className="btn-primary" onClick={onClickQuery}>
                  {Language.CHAXUN}
                </Button>
                <Button type="primary" className="btn-primary-s1" onClick={onClickReset}>
                  {Language.CHONGZHI}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </UIContent>
        <UIContent style={{ height: "785px" }}>
          <div style={{ padding: 2 }}>
            <NetDataTable
              onChangePage={onChangePage}
              onChangeTable={onChangeTable}
              responsive
              className="table-fix"
              rowKey="deviceId"
              style={{ height: "auto" }}
              scroll={{ x: "max-content", y: "680px" }}
              pager={query?.pager}
              dataSource={deviceList}>
              <Table.Column title={Language.SHEBEIMINGCHENG} dataIndex="deviceName" key="deviceName" width="150px" />
              <Table.Column title={Language.XULIEHAO} dataIndex="serialNumber" key="serialNumber" width="150px" />
              <Table.Column title={Language.BANGDINGCHANGDI} dataIndex="siteName" key="siteName" width="150px" />
              <Table.Column title={Language.GUANLIANCHURUKOU} dataIndex="doorName" key="doorName" width="150px" />
              <Table.Column
                title={Language.WANGLUOZHUANGTAI}
                dataIndex="online"
                key="online"
                width="150px"
                render={(value, record, index) => {
                  const content =
                    record.online == 1 ? (
                      <Badge classNames={{ indicator: "badge-dot" }} color="#15ba15" text={Language.ZAIXIAN}></Badge>
                    ) : (
                      <Badge color="red" classNames={{ indicator: "badge-dot" }} text={Language.LIXIAN}></Badge>
                    );
                  return <>{content}</>;
                }}
              />
              <Table.Column title={Language.GUANLIANZHUANGTAI} dataIndex="assocDesc" key="assocDesc" width="150px" />
              <Table.Column title={Language.QIYONGZHUANGTAI} dataIndex="stateDesc" key="stateDesc" width="150px" />
              <Table.Column title={Language.GUANLIANSHIJIAN} dataIndex="assignTimeDesc" key="assignTimeDesc" width="150px" sorter showSorterTooltip={false} />
              <Table.Column title={Language.ZUIHOUYICIZAIXIANSHIJIAN} dataIndex="heartTimeDesc" key="heartTimeDesc" width="160px" sorter showSorterTooltip={false} />
              <Table.Column title={Language.SHEBEIGOUMAISHIJIAN} dataIndex="createTimeDesc" key="createTimeDesc" width="150px" sorter showSorterTooltip={false} />
              <Table.Column
                title={Language.CAOZUO}
                align="center"
                width="150px"
                fixed={"right"}
                render={(value, record, index) => {
                  return (
                    <div className="font-style-1-16" style={{ textAlign: "center", cursor: "pointer" }} onClick={() => onClickDeviceAssign(record)}>
                      {Language.SHEBEIGUANLIAN}
                    </div>
                  );
                }}
              />
            </NetDataTable>
          </div>
        </UIContent>
        {showDeviceDrawer && <DeviceDrawer device={editDevice} siteTreeData={siteTreeData} onChange={onChangeDevice} onClose={onCloseDeviceDrawer} />}
        <ICPComponent />
      </div>
    </div>
  );
};

const DeviceDrawer = React.memo(({ device, siteTreeData, onChange, onClose, ...props }) => {
  const [siteDoorList, setSiteDoorList] = useState([]);
  const [doorList, setDoorList] = useState([]);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    console.log("updateSiteId", device.siteId);
    if (device?.siteId) {
      reuqestSiteDoorList(device.siteId);
    }
  }, []);

  useEffect(() => {
    setDeviceDoorList(device.doors, siteDoorList);
  }, [device.doors]);

  useEffect(() => {}, [device]);

  const onChangeSiteId = (options) => {
    setSiteDoorList([]);
    if (options.length == 0) {
      onChange?.call(null, { siteId: null, doors: [] });
    } else if (device.siteId != options[0].value) {
      onChange?.call(null, { siteId: options[0].value, doors: [] });
      reuqestSiteDoorList(options[0].value);
    }
  };

  const onChangeDoorList = (type, door) => {
    if (type == "updateDoor") {
      let doors = device.doors;
      doors = doors.map((item, i) => {
        if (i == door.index) {
          item.doorId = door.doorId;
        }
        return item;
      });
      onChange?.call(null, { doors: doors });
    } else if (type == "addDoor") {
      onChange?.call(null, { doors: [...device.doors, door] });
    } else if (type == "deleteDoor") {
      onChange?.call(null, { doors: device.doors.filter((item, i) => i !== door.index) });
    }
  };

  const reuqestSiteDoorList = (siteId) => {
    Http.getSiteDoorList({ siteId }, (res) => {
      if (res.result == 1) {
        setDeviceDoorList(device.doors, res.data);
        setSiteDoorList(res.data);
      }
    });
  };

  const requestEditDevice = () => {
    let params = {
      siteId: device.siteId,
      deviceId: device.deviceId,
    };
    let doorIds = [];
    device?.doors?.map((door) => {
      if (door.doorId) {
        doorIds.push(door.doorId);
      }
    });
    if (doorIds.length > 0) {
      params.doorIds = doorIds.join(",");
    }
    setRequestLoading(true);
    Http.editDevice(params, (res) => {
      if (res.result == 1) {
        Message.success(Language.XIUGAISHEBEICHENGGONG);
        onClose?.call(null, true);
      } else {
        Message.error(res.msg);
      }
      setRequestLoading(false);
    });
  };

  const setDeviceDoorList = (doors, siteDoorList) => {
    let doorIds = doors?.map((door) => door.doorId);
    let doorOptions = getDoorOptions(doorIds, siteDoorList);
    let doorList = [];
    let siteDoorMap = {};
    siteDoorList.map((door) => {
      siteDoorMap[door.doorId] = door;
    });
    doors?.map((door, index) => {
      if (siteDoorMap[door.doorId]) {
        doorList.push({ ...door, doorOptions: doorOptions });
      } else {
        doorList.push({ doorId: null, doorOptions: doorOptions });
      }
    });
    setDoorList(doorList);
  };

  const getDoorOptions = (doorIds, doorList) => {
    doorList.map((door) => {
      if (doorIds?.includes(door.doorId)) {
        door.disabled = true;
      } else {
        door.disabled = false;
      }
      return door;
    });
    return doorList;
  };

  return (
    <Drawer
      width={544}
      title={Language.SHEBEIGUANLI}
      closable={false}
      onClose={onClose}
      open={true}
      forceRender={true}
      destroyOnHidden={true}
      footer={
        <Flex style={{ height: "50px" }} align="center" justify="center" gap={50}>
          <Button type="primary" className="btn-primary-s2" onClick={onClose}>
            {Language.QUXIAO}
          </Button>
          <Button type="primary" className="btn-primary" onClick={requestEditDevice} loading={requestLoading}>
            {Language.QUEREN}
          </Button>
        </Flex>
      }>
      <div>
        <Flex vertical={true} gap={"33px"}>
          <DrawerItem>
            <div>{Language.SHEBEIMINGCHENG}: </div>
            <div className="pb-text-not-editable" style={{ height: "40px", lineHeight: "40px" }}>
              {device.deviceName}
            </div>
          </DrawerItem>
          <DrawerItem>
            <div>{Language.XULIEHAO}: </div>
            <div className="pb-text-not-editable" style={{ height: "40px", lineHeight: "40px" }}>
              {device.serialNumber}
            </div>
          </DrawerItem>
          {/* <DrawerItem>
              <div><span style={{ color: 'red' }}>*</span>{Language.CAOZUOXUANZE}:</div>
              <Radio.Group defaultValue={device.dataState} >
                <Flex align='center' gap={40}>
                  <Radio value={1} >{Language.SHEBEIGUANLIAN}</Radio>
                  <Radio value={-1} >{Language.JIECHUGUANLIAN}</Radio>
                </Flex>
              </Radio.Group>
            </DrawerItem> */}
          <DrawerItem>
            <div>
              <span style={{ color: "red" }}>*</span>
              {Language.SUOSHUCHANGDI}
            </div>
            <TreeSelect
              allowClear
              showSearch
              treeDefaultExpandedKeys={device.siteId ? [device.siteId] : []}
              defaultValue={device.siteId ? [device.siteId] : []}
              // value={device?.siteId}
              treeNodeFilterProp="label"
              showCheckedStrategy="SHOW_ALL"
              treeCheckStrictly
              treeCheckable
              maxCount={1}
              className="ui-modal-tree-select pb-tree-select"
              treeData={siteTreeData}
              maxTagTextLength={15}
              maxTagCount={"responsive"}
              style={{ width: "366px", height: "40px" }}
              placeholder={Language.QINGXUANZESHEBEISUOSHUDECHANGDI}
              onChange={onChangeSiteId}
            />
          </DrawerItem>
          <div style={{ height: 500 }}>
            <DrawerItem align="top" style={{ height: "100%" }}>
              <div>
                <span style={{ color: "red" }}>*</span>
                {Language.CHURUKOUGUANLI}
              </div>
              <DoorItemList doors={doorList} onChange={onChangeDoorList} />
            </DrawerItem>
          </div>
        </Flex>
      </div>
    </Drawer>
  );
});

const DoorItemList = ({ doors, onChange }) => {
  const [canScrollToBottom, setCanScrollToBottom] = useState(true);

  /**
   * 删除关联门口
   * @param {下标} key
   */
  const onClickDeleteDoorItem = (index) => {
    setCanScrollToBottom(false);
    onChange?.call(null, "deleteDoor", { index: index });
  };

  /**
   * 添加关联门口
   */
  const onClickAddDoorItem = () => {
    setCanScrollToBottom(true);
    onChange?.call(null, "addDoor", { index: doors.length, doorId: null });
  };

  useEffect(() => {
    scrollToBottom();
  }, [doors]);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, []);

  const scrollToBottom = () => {
    if (!canScrollToBottom) return;
    scroller.scrollTo("messagesEnd", {
      containerId: "scrollContainer",
      duration: 0,
      smooth: true,
      ignoreCancelEvents: true,
      isDynamic: true,
    });
  };

  const onChangeDoor = (door) => {
    onChange?.call(null, "updateDoor", door);
  };

  return (
    <div
      id="scrollContainer"
      style={{
        width: "353px",
        height: "100%",
        overflow: "auto",
        scrollbarWidth: "thin",
        scrollbarColor: "#eaeaea transparent",
        scrollbarGutter: "stable",
        display: "flex",
        flexDirection: "column",
        rowGap: "12px",
        padding: "0 10px 0px 10px",
      }}>
      {doors?.map((door, index) => (
        <DoorItem key={index} index={index} door={door} onClickDelete={onClickDeleteDoorItem} onChangeDoor={onChangeDoor}></DoorItem>
      ))}
      <div
        style={{
          borderRadius: "5px",
          backgroundColor: "#EDF3FF",
          height: "26px",
          width: "100%",
          border: "1px solid #bbbbbb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          columnGap: "5px",
          cursor: "pointer",
        }}
        onClick={onClickAddDoorItem}>
        <PlusCircleFilled style={{ color: "#3867d6", fontSize: "18px" }} />
        <div style={{ fontSize: "14px", lineHeight: "26px", height: "26px" }}>{Language.TIANJIACHURUKOU}</div>
      </div>
      <Element name="messagesEnd" />
    </div>
  );
};

const DoorItem = ({ door, index, onClickDelete, onChangeDoor, ...props }) => {
  const convertToTreeDataId = (doorId, doorOptions) => {
    let door = doorOptions.find((item) => {
      if (item.doorId == doorId) {
        return item;
      }
    });
    if (door.isAllType == 1) {
      doorId = `t1_${doorId}`;
    } else if (door.isOutType == 1) {
      doorId = `t2_${doorId}`;
    } else if (door.isFloorType == 1) {
      doorId = `t3_${doorId}`;
    } else {
      doorId = `t4_${doorId}`;
    }
    return doorId;
  };
  const doorOptions2TreeData = (options) => {
    let treeData = [
      {
        label: Language.ZONGKELIU,
        value: "t1",
        selectable: false,
        children: [],
      },
      {
        label: Language.CHANGWAIKELIU,
        value: "t2",
        selectable: false,
        children: [],
      },
      {
        label: Language.LOUCENG,
        value: "t3",
        selectable: false,
        children: [],
      },
      {
        label: Language.WEIFENPEIJIEDIAN,
        value: "t4",
        selectable: false,
        children: [],
      },
    ];
    options.map((item) => {
      let isAllType = Number(item.isAllType);
      let isOutType = Number(item.isOutType);
      let isFloorType = Number(item.isFloorType);
      let isUnknownType = isAllType + isOutType + isFloorType;
      let types = [isAllType, isOutType, isFloorType];
      if (isUnknownType == -3) {
        types.push(1);
      }
      let count = 0;
      for (let i = 0; i < types.length; i++) {
        if (types[i] == 1) {
          treeData[i].children.push({
            label: item.doorName,
            value: `t${i + 1}_${item.doorId}`,
            doorId: item.doorId,
            disabled: item.disabled == null ? false : item.disabled,
          });
        }
      }
    });
    return treeData;
  };
  const onSelectDoor = (index, value) => {
    let doorId = value ? value.split("_")[1] : value;
    onChangeDoor?.call(null, { doorId: doorId, index: index });
  };
  return (
    <Flex
      vertical
      style={{
        border: "1px dashed #bbbbbb",
        borderRadius: "5px",
        padding: "5px",
      }}
      gap={5}>
      <TreeSelect
        style={{ height: "40px" }}
        placeholder={Language.QINGXUANZEGUANLIANDECHURUKOU}
        treeData={doorOptions2TreeData(door?.doorOptions)}
        allowClear
        showSearch
        value={door?.doorId && convertToTreeDataId(door?.doorId, door?.doorOptions)}
        onChange={(value, label, extra) => onSelectDoor(index, value)}
      />
      <MinusCircleFilled
        style={{
          color: "#b4b4b4",
          fontSize: "20px",
          marginLeft: "7px",
          cursor: "pointer",
        }}
        onClick={() => onClickDelete(index)}
      />
    </Flex>
  );
};

const DrawerItem = ({ children, ...props }) => {
  return (
    <Flex align="center" gap={20} {...props}>
      {children}
    </Flex>
  );
};

export default DeviceManagement;
