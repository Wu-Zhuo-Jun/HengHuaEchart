import React, { use, useCallback, useEffect, useState, useRef } from "react";
import { UIPageHeader, UIContent, UIModalEditConfirm, UITitle, UIModalConfirm, ICPComponent } from "../../../components/ui/UIComponent";
import { Language } from "../../../language/LocaleContext";
import { Flex, Tabs, Cascader, Divider, Input, TreeSelect } from "antd";
import { EditAreasDrawer, SiteItemList } from "./LocalComponent";
import { SearchOutlined } from "@ant-design/icons";
import Http from "../../../config/Http";
import ArrayUtils from "../../../utils/ArrayUtils";
import Message from "../../../components/common/Message";
import TimeUtils from "../../../utils/TimeUtils";
import Region from "./Region";
import CreateRegionPage from "./CreateRegionPage";
import CreatePlanGraphPage from "./CreatePlanGraphPage";

const DoorManagementModel = {
  // 将筛选条件提升到组件外，便于在不同事件回调中共享同一份查询参数
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

// 区域管理
const DistrictManagement = () => {
  const [createRegionSite, setCreateRegionSite] = useState(null);
  const [planGraphContext, setPlanGraphContext] = useState(null);
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

  //   const onClickAddAreas = (siteId) => {
  //     openAddRegionPage(siteId);
  //   };

  const openAddRegionPage = (siteId) => {
    // 从当前场地列表中找到目标场地，切换到“新增区域”页面
    siteList.map((site) => {
      if (site.siteId === siteId) {
        setCreateRegionSite(site);
      }
    });
  };

  const onCloseAddRegionPage = (type, siteId) => {
    if (type == "success") {
      setUpdateTime(TimeUtils.now());
    }
    setCreateRegionSite(null);
  };

  const onClosePlanGraph = () => {
    setPlanGraphContext(null);
  };

  const onClickOpenPlanGraph = (region) => {
    setCreateRegionSite(null);
    setPlanGraphContext({ site: selectedSite, region });
  };

  const onCloseEditDoorDrawer = () => {
    setOpenEditDoorDrawer(false);
  };

  const onClickOperate = (type, value) => {
    if (type === "edit") {
      setOpenEditDoorDrawer(true);
    } else if (type === "delete") {
    } else if (type === "addAreas") {
      openAddRegionPage(value);
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

    // 通过闭包暂存输入值，供弹窗 onOk 时读取并提交
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
    // 统一复用一个弹窗：isAdd 决定是新增楼层还是编辑楼层
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
      label: Language.REQU,
    },
    {
      key: 2,
      label: Language.QUYU,
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
      // 组织树准备好后再请求场地列表，确保 groupName 可被正确回填
      requestSiteList();
    });
  };

  const requestSiteList = (params = {}) => {
    Http.getDoorSiteList(params, (res) => {
      if (res.result == 1) {
        let siteList = formatSiteList(res.data.sites, res.data.floors);
        console.log("siteList", siteList);
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
    // 本地移除楼层，避免每次删除都全量刷新列表
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
    // 本地更新楼层名称，提升编辑后的界面反馈速度
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
    // 先按 siteId 聚合楼层，再挂载回场地，便于 Region 直接渲染树形数据
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
      <UIPageHeader title={Language.QUYUGUANLI} introduce={Language.QUYUGUANLI_TIP} />
      <div className="layout-content layout-content-noScroll">
        <UIContent style={{ height: "940px", padding: "0px" }}>
          {/* <Tabs className='full-height-content-tabs' items={tabItems} style={{ height: '100%',...openDoorPage && {display:'none'}}} tabBarStyle={{padding:'0px 25px'}}  /> */}
          <Flex vertical style={{ height: "100%", ...((createRegionSite || planGraphContext) && { display: "none" }) }}>
            <Tabs items={tabItems} tabBarStyle={{ padding: "0px 25px" }} onTabClick={onTabClick} />
            <Flex style={{ width: "100%", flex: 1, minHeight: 0 }} gap={16}>
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
                    <SiteItemList isFloor={false} siteList={siteList} siteId={selectedSite?.siteId} onSelectSite={onSelectSite} />
                  </div>
                </Flex>
              </Flex>
              {selectedSite && <Region site={selectedSite} type={1} onClickOperate={onClickOperate} updateTime={updateTime} onOpenPlanGraph={onClickOpenPlanGraph} />}
              {/* {tabKey === 2 && selectedSite &&} */}
              {/* 
              {tabKey === 1 && selectedSite && <ExitManagement updateTime={updateTime} site={selectedSite} onClickAddDoor={onClickAddDoor} onClickOperate={onClickOperate} />}
             
              {tabKey === 3 && selectedSite && <FlowManagement site={selectedSite} type={2} />}
              {tabKey === 4 && selectedFloor && <FloorManagement floor={selectedFloor} />} */}
            </Flex>
          </Flex>
          {createRegionSite && <CreateRegionPage site={createRegionSite} onChange={onCloseAddRegionPage} />}
          {planGraphContext && <CreatePlanGraphPage site={planGraphContext.site} region={planGraphContext.region} onClose={onClosePlanGraph} />}
        </UIContent>
        <ICPComponent style={{ height: "auto" }} />
      </div>
      {/* <EditAreasDrawer onClose={onCloseEditDoorDrawer} title={Language.BIANJICHURUKOU} open={openEditDoorDrawer} /> */}
    </div>
  );
};

export default DistrictManagement;
