import React, { use, useCallback, useEffect, useState, useRef } from "react";
import { UIContent, UIPageHeader, UISelect, UIPagination, UIModal, UIModalEditConfirm, ICPComponent, UIContentLoading, UIModalConfirm } from "../../../components/ui/UIComponent";
import { Language, text } from "../../../language/LocaleContext";
import { Button, Flex, Input, Modal, Cascader, Table, TreeSelect } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import DemoUtils from "../../../utils/DemoUtils";
import TimeUtils from "../../../utils/TimeUtils";
import { NetDataTable } from "../../../components/common/tables/Table";
import style from "./SiteManagement.module.css";
import Http from "../../../config/Http";
import Constant from "../../../common/Constant";
import ArrayUtils from "../../../utils/ArrayUtils";
import Message from "../../../components/common/Message";
import "../../../assets/styles/public.css";
import User from "@/data/UserData";

const siteManagementModel = {
  queryModel: {
    page: 1,
    limit: Constant.PAGE_SIZES[0],
    allNumber: 1,
    search: null,
    sort: 0,
    groups: null,
  },
  groupOptions: null,
  resetQueryModel: () => {
    siteManagementModel.queryModel = {
      page: 1,
      limit: Constant.PAGE_SIZES[0],
      allNumber: 1,
      search: null,
      sort: 0,
      groups: null,
    };
  },
};

const SiteManagement = () => {
  // const groupOptions = DemoUtils.getGroupTreeData()
  // const siteList = DemoUtils.getSiteListTableData();
  const [sites, setSites] = useState(null);
  const [pager, setPager] = useState({ current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 });
  const [search, setSearch] = useState(null);
  const [siteListLoading, setSiteListLoading] = useState(false);
  const [groupOptions, setGroupOptions] = useState(null);
  const tableRef = useRef(null);
  const queryModel = siteManagementModel.queryModel;

  var modifySiteObj = {};

  useEffect(() => {
    requestGroupSelection(() => {
      querySiteList(queryModel);
    });
    return () => {
      siteManagementModel.resetQueryModel();
    };
  }, []);

  const requestGroupSelection = (finish) => {
    Http.getGroupSelection({}, (res) => {
      let options = [];
      if (res.result == 1) {
        let groups = res.data;
        groups = transformToOptions(groups);
        options = ArrayUtils.dataList2TreeNode(groups, "groupId");
        options = ArrayUtils.setTreeParentNames(options, [], "groupName");
      }
      siteManagementModel.groupOptions = options;
      setGroupOptions(options);
      finish?.call();
    });
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

  const formatSiteList = (siteList) => {
    siteList.map((item, index) => {
      item.openTime = TimeUtils.sec2Date(Number(item.openTime), "HH:mm") + "-" + TimeUtils.sec2Date(Number(item.closeTime), "HH:mm");
      item.address = `${item.region}  ${item.address}`;
      item.area = `${item.area}m²`;
      if (item.groupId == "0") {
        item.groupName = Language.WEIFENPEIJIEDIAN;
      } else {
        item.groupName = getSiteGroupParentNames(item.groupId);
      }
      if (item.siteId === User.defaultSiteId) {
        item.isDefault = true;
      }
      item.createTimeDesc = TimeUtils.ts2Date(Number(item.createTime), "yyyy-MM-dd HH:mm:ss");
      return item;
    });
    return siteList;
  };

  const getSiteGroupParentNames = (groupId) => {
    let group = ArrayUtils.findTreeNode(siteManagementModel.groupOptions, groupId, "groupId");
    if (group) {
      let parentNames = [...group.parentNames.concat(group.groupName)];
      return parentNames.join(",");
    }
    return Language.WEIZHAODAOQUNZU;
  };

  const querySiteList = (params) => {
    setSiteListLoading(true);
    Http.getSiteList(params, (res) => {
      let siteList = res.data.data;
      let pager = res.data.pager;
      siteList = formatSiteList(siteList);
      setSites(siteList);
      setPage(pager.page, pager.limit, pager.count);
      setSiteListLoading(false);
    });
  };

  const setPage = (page, pageSize, total) => {
    queryModel.page = page;
    queryModel.limit = pageSize;
    setPager({ current: page, pageSize: pageSize, total: total });
  };

  const clearModifySiteObj = () => {
    modifySiteObj.siteId = null;
    modifySiteObj.groupId = null;
  };

  const updateSiteGroup = (siteId, groupId) => {
    setSites(
      sites.map((site) => {
        if (site.siteId == siteId) {
          site.groupId = groupId;
          site.groupName = groupId == "0" ? Language.WEIFENPEIJIEDIAN : getSiteGroupParentNames(groupId);
        }
        return site;
      })
    );
  };

  const updateDefaultSite = (siteId) => {
    User.defaultSiteId = siteId;
    setSites(
      sites.map((site) => {
        if (site.siteId === siteId) {
          site.isDefault = true;
        } else {
          site.isDefault = false;
        }
        return site;
      })
    );
  };

  const updateTableRow = (siteId, value) => {
    const newSites = sites.map((site) => {
      if (site.key == siteId) {
        site.groupName = "11111";
      }
      site.key = Math.floor(Math.random() * 1000);
      return site;
    });
    setSites({ ...sites, dataSource: newSites });
  };

  const onPaginationChange = (page, pageSize) => {
    queryModel.page = page;
    queryModel.limit = pageSize;
    querySiteList(queryModel);
  };

  const onChangeTable = (pagination, filters, sorter, extra) => {
    if (sorter.order == "ascend") {
      queryModel.sort = 1;
    } else if (sorter.order == "descend") {
      queryModel.sort = -1;
    } else {
      queryModel.sort = 0;
    }
    querySiteList(queryModel);
  };

  const onClickAssocGroup = (record) => {
    openSiteModal(record);
  };

  const onClickSetDefaultSite = (record) => {
    if(!record.isDefault){
      const modal = UIModalConfirm({
        title: Language.TISHI,
        content: text(Language.PARAM_SHEWEIMORENCHANGDI, { value: record.siteName }),
        onOk: (close) => {
          modal.update({ okButtonProps: { loading: true } });
          sendSetDefaultSite(record.siteId)
            .then(() => {
              Message.success(Language.MORENCHANGDISHEZHICHENGGONG);
              modal.destroy();
            })
            .catch((error) => {
              modal.update({ okButtonProps: { loading: false } });
            });
        },
      });
    }
  };

  const onClickQuery = () => {
    queryModel.page = 1;
    querySiteList(queryModel);
  };

  const onChangeSearch = (e) => {
    queryModel.search = e.target.value;
    setSearch(e.target.value);
  };

  const onChangeGroup = (list) => {
    if (list.length > 0) {
      queryModel.groups = list.map((item) => item.value).join(",");
    } else {
      queryModel.groups = null;
    }
  };

  const openSiteModal = (record) => {
    let siteId = record.siteId;
    let groupId = record.groupId;
    const onChangeGroup = (list) => {
      if (list.length > 0) {
        groupId = list[0].value;
      } else {
        groupId = null;
      }
    };
    let modal = UIModalEditConfirm({
      title: Language.GUANLIANJITUAN,
      okButtonProps: { loading: false },
      content: <ModalContent siteName={record.siteName} groupId={record.groupId} groupOptions={groupOptions} onChangeGroup={onChangeGroup} />,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        sendModifySiteGroup(siteId, groupId)
          .then(() => {
            modal.update({ okButtonProps: { loading: false } });
            modal.destroy();
          })
          .catch((err) => {
            modal.update({ okButtonProps: { loading: false } });
          });
      },
    });
  };

  const ModalContent = ({ siteName, groupId, groupOptions, onChangeGroup }) => {
    return (
      <Flex vertical={true} style={{ width: "100%", height: "220px" }} gap={"11px"}>
        <Flex className={style.modalContentItem}>
          <div className={style.modalContentTitle} style={{ flexGrow: 1 }}>
            {Language.CHANGDIMINGMINGCHENG} :
          </div>
          <div className={style.siteName}>{siteName}</div>
        </Flex>
        <Flex className={style.modalContentItem}>
          <div className={style.modalContentTitle} style={{ flexGrow: 1 }}>
            <span style={{ color: "red" }}>*</span>
            {Language.GUISHUJITUAN} :
          </div>
          <TreeSelect
            allowClear
            showSearch
            treeNodeFilterProp="label"
            defaultValue={[groupId]}
            treeDefaultExpandedKeys={[groupId]}
            onChange={onChangeGroup}
            showCheckedStrategy="SHOW_ALL"
            treeCheckStrictly
            treeCheckable
            className="ui-modal-tree-select pb-tree-select"
            maxCount={1}
            treeData={groupOptions}
            maxTagTextLength={15}
          />
        </Flex>
      </Flex>
    );
  };

  const sendModifySiteGroup = async (siteId, groupId) => {
    await new Promise((resolve, reject) => {
      groupId = groupId || "0";
      let params = {
        siteId: siteId,
        groupId: groupId,
      };
      Http.changeSiteGroup(params, (res) => {
        if (res.result == 1) {
          Message.success(Language.XIUGAIJITUANCHENGGONG);
          updateSiteGroup(siteId, groupId);
          resolve();
        } else {
          Message.error(res.msg);
          reject();
        }
      });
    });
  };

  const sendSetDefaultSite = async (siteId) => {
    await new Promise((resolve, reject) => {
      Http.setDefaultSite({ siteId }, (res) => {
        if ((res.result = 1)) {
          updateDefaultSite(siteId);
          resolve();
        } else {
          Message.error(res.msg);
          reject();
        }
      });
    });
  };

  return (
    <div className="main">
      <UIPageHeader title={Language.CHANGDIGUANLI} introduce={Language.CHANGDIGUANLI_TIP} />
      <div className="layout-content layout-content-noScroll">
        <UIContent style={{ height: "907px" }}>
          <Flex vertical={true} gap={"16px"}>
            <Flex align="center" gap={"16px"}>
              <div style={{ fontSize: "16px", height: "26px" }}>{Language.GUISHUJITUAN}:</div>
              {/* <Cascader  displayRender={(label) => label.join(' / ')}  multiple maxTagCount={5}  maxTagTextLength={10} options={groupOptions} style={{minWidth:'200px',width:'auto'}} placeholder={Language.QUANBU} /> */}
              <TreeSelect
                allowClear
                showSearch
                treeNodeFilterProp="label"
                onChange={onChangeGroup}
                showCheckedStrategy="SHOW_ALL"
                treeCheckStrictly
                treeCheckable
                multiple
                maxTagCount={5}
                maxTagTextLength={10}
                treeData={groupOptions}
                style={{ minWidth: "200px", width: "auto" }}
                placeholder={Language.QUANBU}
              />
              <Input prefix={<SearchOutlined />} value={search} style={{ width: "220px", height: "32px" }} placeholder={Language.QINGSHURUCHANGDIMINGCHENG} onChange={onChangeSearch} />
              <Button type="primary" className="btn-primary" onClick={onClickQuery}>
                {Language.CHAXUN}
              </Button>
            </Flex>
            <div style={{ padding: 2 }}>
              <NetDataTable
                loading={siteListLoading}
                rowKey="siteId"
                pager={pager}
                onChangePage={onPaginationChange}
                onChangeTable={onChangeTable}
                style={{ height: "auto" }}
                scroll={{ x: "max-content", y: "700px" }}
                dataSource={sites}
              >
                <Table.Column title={Language.CHANGDIMINGMINGCHENG} key="siteName" dataIndex="siteName" align="center" width="130px" />
                <Table.Column title={Language.YINGYESHIJIAN} key="openTime" dataIndex="openTime" align="center" width={"auto"} minWidth="145px" />
                <Table.Column title={Language.YINGYEMIANJI} key="area" dataIndex="area" align="center" width={"auto"} minWidth="145px" />
                <Table.Column title={Language.CHURUKOU} key="doorCount" dataIndex="doorCount" align="center" width={"auto"} minWidth="145px" />
                <Table.Column title={Language.LOUCENG} key="floorCount" dataIndex="floorCount" align="center" width={"auto"} minWidth="90px" />
                <Table.Column title={Language.SHEBEISHULIANG} key="deviceCount" dataIndex="deviceCount" align="center" width={"auto"} minWidth="120px" />
                <Table.Column title={Language.SUOSHUJITUAN} key="groupName" dataIndex="groupName" align="center" width={"auto"} minWidth="160px" />
                <Table.Column title={Language.CHANGDIDIZHI} key="address" dataIndex="address" align="center" width={"auto"} minWidth="280px" />
                <Table.Column
                  title={Language.CHUANGJIANSHIJIAN}
                  key="createTimeDesc"
                  dataIndex="createTimeDesc"
                  align="center"
                  sorter={true}
                  showSorterTooltip={false}
                  width={"auto"}
                  minWidth="195px"
                />
                <Table.Column
                  title={Language.CAOZUO}
                  align="center"
                  render={(value, record, index) => (
                    <Flex align="center" justify="center" gap={"5px"}>
                      <div className={style.operationItem} onClick={onClickAssocGroup.bind(null, record)}>
                        {Language.GUANLIANJITUAN}
                      </div>
                      <div>|</div>
                      <div className={record.isDefault ? style.defaultSite : style.operationItem} onClick={onClickSetDefaultSite.bind(null, record)}>
                        {record.isDefault ? Language.MORENCHANGDI : Language.SHEWEIMOREN}
                      </div>
                    </Flex>
                    // <div className={style.btnAssocGroup} onClick={onClickAssocGroup.bind(null, record)}>
                    //   {Language.GUANLIANJITUAN}
                    // </div>
                  )}
                  width={"auto"}
                  minWidth="150px"
                />
              </NetDataTable>
            </div>
            {/* {pager?.total> 0 &&<UIPagination tableRef={tableRef} scrollToFirstRowOnChange={true} pager={pager} onChange={onPaginationChange}/>} */}
          </Flex>
        </UIContent>
        <ICPComponent />
      </div>
    </div>
  );
};

export default React.memo(SiteManagement);
