import React, { use, useCallback, useEffect, useState, useRef } from "react";
import { UIPageHeader, UIContent, UIModalEditConfirm, UITitle, UIModalConfirm, ICPComponent } from "../../../components/ui/UIComponent";
import { Language } from "../../../language/LocaleContext";
import { Flex, Tabs, Cascader, Divider, Input, TreeSelect } from "antd";
import ExitManagement from "./ExitManagement";
import CreateDoorPage from "./CreateDoorPage";
import DemoUtils from "../../../utils/DemoUtils";
import { EditDoorDrawer, SiteItemList } from "./LocalComponent";
import { SearchOutlined } from "@ant-design/icons";
import FloorManagement from "./FloorManagement";
import FlowManagement from "./FlowManagement";
import Http from "../../../config/Http";
import ArrayUtils from "../../../utils/ArrayUtils";
import Message from "../../../components/common/Message";
import TimeUtils from "../../../utils/TimeUtils";
import useOutletStore from "@/stores/useOutletStore";

const DoorManagementModel = {
  queryModel: {
    groupIds: null,
    search: null,
  },
  groupOptions: null,
  resetModel: () => {
    DoorManagementModel.groupOptions = null;
    DoorManagementModel.queryModel.groupIds = null;
    DoorManagementModel.queryModel.search = null;
  },
};

const DoorManagement = () => {
  const [createDoorSite, setCreateDoorSite] = useState(null);
  const [openEditDoorDrawer, setOpenEditDoorDrawer] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedSiteId, setSelectedSiteId] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [tabKey, setTabKey] = useState(1);
  const [siteList, setSiteList] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [updateTime, setUpdateTime] = useState(null);

  useEffect(() => {
    requestGroupSelection();
    setOpenEditDoorDrawer(false);
  }, []);

  const onClickAddDoor = (siteId) => {
    openAddDoorPage(siteId);
  };

  const openAddDoorPage = (siteId) => {
    siteList.map((site) => {
      if (site.siteId === siteId) {
        setCreateDoorSite(site);
      }
    });
  };

  const refreshOutletList = useOutletStore((state) => state.refreshOutletList);

  const onCloseAddDoorPage = (type, siteId) => {
    if (type == "success") {
      setUpdateTime(TimeUtils.now());
      // 刷新出入口列表缓存
      refreshOutletList();
    }
    setCreateDoorSite(null);
  };

  const onCloseEditDoorDrawer = () => {
    setOpenEditDoorDrawer(false);
  };

  const onClickOperate = (type, value) => {
    if (type === "edit") {
      setOpenEditDoorDrawer(true);
    } else if (type === "delete") {
    } else if (type === "addDoor") {
      openAddDoorPage(value);
    }
  };

  /**
   * 选中的场地
   * @param {string} siteId
   */
  const onSelectSite = (siteId) => {
    siteList?.map((site) => {
      if (site.siteId == siteId) {
        setSelectedSite(site);
      }
    });
    setSelectedSiteId(siteId);
  };

  const onSelectFloor = (floor) => {
    setSelectedFloor(floor);
  };

  const onOperateFloor = (type, data) => {
    if (type == "addFloor") {
      openEditFloorModal(data.siteId, null, true);
    } else if (type == "editFloor") {
      openEditFloorModal(data.siteId, data.floorId, false);
    } else if (type == "deleteFloor") {
      openDeleteFloorModal(data);
    }
  };

  const openEditFloorModal = (siteId, floorId, isAdd) => {
    if (!siteId) {
      return;
    }
    let siteName = "";
    let floorName = "";
    siteList.map((item) => {
      if (item.siteId === siteId) {
        siteName = item.siteName;
        if (!isAdd) {
          item.floors.map((floor) => {
            if (floor.floorId === floorId) {
              floorName = floor.floorName;
            }
          });
        }
      }
    });

    const onChangeFloorName = (value) => {
      floorName = value;
    };

    const Content = ({ siteName, floorName, onChange }) => {
      return (
        <Flex vertical style={{ width: "100%", height: "220px" }} gap={"11px"}>
          <Flex className="ui-modal-content">
            <UITitle className="ui-modal-title">{Language.CHANGDIMINGMINGCHENG}:</UITitle>
            <div className="pb-text-not-editable ui-modal-text">{siteName}</div>
          </Flex>
          <Flex className="ui-modal-content">
            <UITitle required className="ui-modal-title">
              {Language.LOUCENGMINGCHENG}
            </UITitle>
            <Input className="ui-modal-input" placeholder={Language.QINGSHURULOUCENGMINGCHENG} defaultValue={floorName} onChange={(e) => onChange?.call(null, e.target.value)} />
          </Flex>
        </Flex>
      );
    };
    let modal = UIModalEditConfirm({
      title: Language.XINZENGLOUCENG,
      content: <Content siteName={siteName} floorName={floorName} onChange={onChangeFloorName} />,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        if (isAdd) {
          requestAddFloor({ siteId: siteId, floorName: floorName }, (res) => {
            modal.update({ okButtonProps: { loading: false } });
            if (res.result == 1) {
              Message.success(Language.XINZENGLOUCENGCHENGGONG);
              modal.destroy();
              requestSiteList();
            } else {
              Message.error(res.msg);
            }
          });
        } else {
          requestEditFloor({ floorId: floorId, floorName: floorName }, (res) => {
            modal.update({ okButtonProps: { loading: false } });
            if (res.result == 1) {
              Message.success(Language.XIUGAILOUCENGCHENGGONG);
              modal.destroy();
              updateFloor(siteId, floorId, floorName);
            } else {
              Message.error(res.msg);
            }
          });
        }
      },
    });
  };

  const openDeleteFloorModal = (data) => {
    let modal = UIModalConfirm({
      title: Language.JINGGAO,
      content: Language.SHANCHULOUCENG_TIP,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        requestDeleteFloor({ floorId: data.floorId }, (res) => {
          modal.update({ okButtonProps: { loading: false } });
          if (res.result == 1) {
            Message.success(Language.SHANCHULOUCENGCHENGGONG);
            modal.destroy();
            removeFloor(data.siteId, data.floorId);
          } else {
            Message.error(res.msg);
          }
        });
      },
    });
  };

  const onTabClick = (key) => {
    setTabKey(key);
    if (key == 4) {
      setSelectedSite(null);
    }
    setSelectedFloor(null);
  };

  const onChangeGroup = (list) => {
    if (list.length > 0) {
      DoorManagementModel.queryModel.groupIds = list.map((item) => item.value).join(",");
      console.log(DoorManagementModel.queryModel.groupIds);
    } else {
      DoorManagementModel.queryModel.groupIds = null;
    }
  };

  const onChangeSearch = (e) => {
    DoorManagementModel.queryModel.search = e.target.value;
  };

  const onSearchSite = () => {
    setSelectedFloor(null);
    setSelectedSiteId(null);
    requestSiteList(DoorManagementModel.queryModel);
  };

  const tabItems = [
    {
      key: 1,
      label: Language.CHURUKOU,
    },
    {
      key: 2,
      label: Language.ZONGKELIU,
    },
    {
      key: 3,
      label: Language.CHANGWAIKELIU,
    },
    {
      key: 4,
      label: Language.LOUCENG,
    },
  ];

  const requestGroupSelection = () => {
    Http.getGroupSelection({}, (res) => {
      let options = [];
      if (res.result == 1) {
        let groups = res.data;
        groups = transformToOptions(groups);
        options = ArrayUtils.dataList2TreeNode(groups, "groupId");
        options = ArrayUtils.setTreeParentNames(options, [], "groupName");
      }
      DoorManagementModel.groupOptions = options;
      setGroupOptions(options);
      requestSiteList();
    });
  };

  const requestSiteList = (params = {}) => {
    Http.getDoorSiteList(params, (res) => {
      if (res.result == 1) {
        let siteList = formatSiteList(res.data.sites, res.data.floors);
        setSiteList(siteList);
      }
    });
  };

  const requestAddFloor = (params, sucess) => {
    Http.addFloor(params, sucess);
  };

  const requestEditFloor = (params, sucess) => {
    Http.editFloor(params, sucess);
  };

  const requestDeleteFloor = (params, sucess) => {
    Http.deleteFloor(params, sucess);
  };

  const removeFloor = (siteId, floorId) => {
    setSiteList(
      siteList.map((site) => {
        if (site.siteId == siteId) {
          site.floors = site.floors.filter((floor) => {
            return floor.floorId != floorId;
          });
        }
        return site;
      })
    );
  };

  const updateFloor = (siteId, floorId, floorName) => {
    setSiteList(
      siteList.map((site) => {
        if (site.siteId == siteId) {
          site.floors = site.floors.map((floor) => {
            if (floor.floorId == floorId) {
              floor.floorName = floorName;
            }
            return floor;
          });
        }
        return site;
      })
    );
  };

  const transformToOptions = (data) => {
    let options = data.map((item) => {
      item.label = item.groupName;
      item.value = item.groupId;
      return item;
    });
    options.push({ label: Language.WEIFENPEIJIEDIAN, value: "0" });
    return options;
  };

  const formatSiteList = (siteList, floorList) => {
    let floorMap = {};
    for (let i = 0; i < floorList.length; i++) {
      let floor = floorList[i];
      if (!floorMap[floor.siteId]) {
        floorMap[floor.siteId] = [];
      }
      floorMap[floor.siteId].push(floor);
    }
    siteList.map((site) => {
      if (site.groupId == "0") {
        site.groupName = Language.WEIFENPEIJIEDIAN;
      } else {
        site.groupName = getSiteGroupParentNames(site.groupId);
      }
      if (floorMap[site.siteId]) {
        site.floors = floorMap[site.siteId];
      }
      return site;
    });
    return siteList;
  };

  const getSiteGroupParentNames = (groupId) => {
    let group = ArrayUtils.findTreeNode(DoorManagementModel.groupOptions, groupId, "groupId");
    if (group) {
      let parentNames = [...group.parentNames.concat(group.groupName)];
      return parentNames.join(",");
    }
    return Language.WEIZHAODAOQUNZU;
  };

  return (
    <div className="main">
      <UIPageHeader title={Language.WEIZHIGUANLI} introduce={Language.WEIZHIGUANLI_TIP} />
      <div className="layout-content layout-content-noScroll">
        <UIContent style={{ height: "940px", padding: "0px" }}>
          {/* <Tabs className='full-height-content-tabs' items={tabItems} style={{ height: '100%',...openDoorPage && {display:'none'}}} tabBarStyle={{padding:'0px 25px'}}  /> */}
          <Flex vertical style={{ height: "100%", ...(createDoorSite && { display: "none" }) }}>
            <Tabs items={tabItems} tabBarStyle={{ padding: "0px 25px" }} onTabClick={onTabClick} />
            <Flex style={{ width: "100%", flex: 1, minHeight: 0 }} gap={26}>
              <Flex
                vertical
                gap={10}
                style={{
                  width: "231px",
                  minWidth: "231px",
                  maxWidth: "231px",
                  height: "100%",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  borderTop: "1px solid #bbbbbb",
                  borderRight: "1px solid #bbbbbb",
                  borderLeft: "1px solid #bbbbbb",
                }}>
                <TreeSelect
                  allowClear
                  showSearch
                  treeNodeFilterProp="label"
                  showCheckedStrategy="SHOW_ALL"
                  treeCheckStrictly
                  treeCheckable
                  multiple
                  maxTagTextLength={10}
                  treeData={groupOptions}
                  variant="borderless"
                  maxTagCount="responsive"
                  style={{ width: "96%", marginTop: "15px", paddingLeft: "10px" }}
                  placeholder={Language.GUISHUJITUAN}
                  onChange={onChangeGroup}
                  onBlur={onSearchSite}
                />
                <Divider style={{ margin: 0 }} />
                <Flex style={{ flex: 1, minHeight: 0 }} vertical gap={10}>
                  <div style={{ padding: "0 10px 0 10px" }}>
                    <Input suffix={<SearchOutlined />} placeholder={Language.QINGSHURUCHANGDIMINGCHENG} onChange={onChangeSearch} onBlur={onSearchSite} />
                  </div>
                  <div style={{ flex: 1, minHeight: 0, padding: "0 0px 10px 10px" }}>
                    <SiteItemList
                      isFloor={tabKey == 4 ? true : false}
                      siteList={siteList}
                      siteId={selectedSite?.siteId}
                      onSelectSite={onSelectSite}
                      onSelectFloor={onSelectFloor}
                      selectedFloorId={selectedFloor?.floorId}
                      onOperateFloor={onOperateFloor}
                    />
                  </div>
                </Flex>
              </Flex>

              {tabKey === 1 && selectedSite && <ExitManagement updateTime={updateTime} site={selectedSite} onClickAddDoor={onClickAddDoor} onClickOperate={onClickOperate} />}
              {tabKey === 2 && selectedSite && <FlowManagement site={selectedSite} type={1} />}
              {tabKey === 3 && selectedSite && <FlowManagement site={selectedSite} type={2} />}
              {tabKey === 4 && selectedFloor && <FloorManagement floor={selectedFloor} />}
            </Flex>
          </Flex>
          {createDoorSite && <CreateDoorPage site={createDoorSite} onChange={onCloseAddDoorPage} />}
        </UIContent>
        <ICPComponent />
      </div>
      <EditDoorDrawer onClose={onCloseEditDoorDrawer} title={Language.BIANJICHURUKOU} open={openEditDoorDrawer} />
    </div>
  );
};

export default DoorManagement;
