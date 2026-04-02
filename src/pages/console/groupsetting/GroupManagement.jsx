import React, { use, useCallback, useEffect, useState, useRef } from "react";
import { UIContent, UIPageHeader, UISelect, UIPagination, UIModal, UIModalEditConfirm, UIModalConfirm } from "../../../components/ui/UIComponent";
import { Language } from "../../../language/LocaleContext";
import { Button, Flex, Input, Modal, Cascader, Table, TreeSelect } from "antd";
import DemoUtils from "../../../utils/DemoUtils";
import TimeUtils from "../../../utils/TimeUtils";
import { DataTable, NetDataTable } from "../../../components/common/tables/Table";
import style from "./GroupManagement.module.css";
import modalStyle from "./ModalContent.module.css";
import Http from "../../../config/Http";
import Constant from "../../../common/Constant";
import Message from "../../../components/common/Message";
import ArrayUtils from "../../../utils/ArrayUtils";
import StringUtils from "../../../utils/StringUtils";
import { ICPComponent } from "@/components/ui/UIComponent";

const GroupModel = {
  groupTree: null,
  group: null,
  resetModel: () => {
    GroupModel.groupTree = null;
    GroupModel.group = null;
  },
};

const GroupManagementModel = {
  queryModel: {
    page: 1,
    limit: Constant.PAGE_SIZES[0],
    allNumber: 1,
    sort: 0,
  },
  groupModel: {
    groupId: null,
    groupName: null,
  },
  resetQueryModel: () => {
    GroupManagementModel.queryModel = {
      page: 1,
      limit: Constant.PAGE_SIZES[0],
      allNumber: 1,
      sort: 0,
    };
  },
};

const GroupManagement = () => {
  const tableRef = useRef(null);
  const [groupTreeDataSource, setGroupTreeDataSource] = useState(null);
  const [pager, setPager] = useState({ current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 });
  const TEXTAREA_MAX_LENGTH = 150;
  const tokenRef = useRef(null);
  const queryModel = GroupManagementModel.queryModel;
  // const cancelTokenSource = Http.cancelTokenSource();
  // tokenRef.current = cancelTokenSource;

  useEffect(() => {
    queryGroupList(queryModel);
    return () => {
      // if(tokenRef.current){
      //     tokenRef.current.cancel();
      // }
      GroupModel.resetModel();
      GroupManagementModel.resetQueryModel();
    };
  }, []);

  const queryGroupList = (params) => {
    Http.getGroupList(params, (res) => {
      if (res.result == 1) {
        let groupList = formatGroupList(res.data.data);
        let pager = res.data.pager;
        let groupTree = ArrayUtils.dataList2TreeNode(groupList, "groupId");
        groupTree.map((item, index) => {
          item = formatGroupTreeNode(item);
          return item;
        });
        groupTree = formatGroupTreeNode(groupTree);
        setGroupTreeDataSource(groupTree);
        console.log("groupTreeDataSource", groupTree);
        setPage(pager.page, pager.limit, pager.count);
      } else {
        Message.error(res.msg);
      }
    });
  };

  const setPage = (page, pageSize, total) => {
    queryModel.page = page;
    queryModel.limit = pageSize;
    console.log("setPage", page, pageSize, total);
    setPager({ current: page, pageSize: pageSize, total: total });
  };

  const formatGroupList = (gorupList) => {
    gorupList.map((item, index) => {
      item.createTime = Number(item.createTime);
      item.createTimeDesc = TimeUtils.ts2Date(Number(item.createTime), "yyyy-MM-dd HH:mm:ss");
      if (item.sites) {
        if (Array.isArray(item.sites)) {
          item.sitesDesc = item.sites.join(",");
        }
      } else {
        item.sitesDesc = Language.ZANWU;
      }
      item.groupRemarkDesc = item.groupRemark ? item.groupRemark : Language.ZANWU;
      item.level = Number(item.groupLevel);
      // item.type = Number(item.type);
      // if(item.type == 1){
      //     if(item.groupName == Language.ZHISHU){
      //         item.groupName = Language.ZHISHU
      //     }
      // }
      return item;
    });
    return gorupList;
  };

  const formatGroupTreeNode = (node, parentNames = []) => {
    node.parentNames = parentNames;
    if (node.children) {
      node.children.map((child, index) => {
        formatGroupTreeNode(child, parentNames.concat(node.groupName));
      });
    }
    return node;
  };

  const setModifyGroupName = (value) => {
    GroupModel.group.name = value;
  };

  const setModifyGroupRemark = (value) => {
    GroupModel.group.remark = value;
  };

  const sendModifyGroup = async (group) => {
    await new Promise((resolve, reject) => {
      let params = {
        groupName: group.groupName,
        remark: group.groupRemark,
      };

      console.log("sendModifyGroup", params);
      if (StringUtils.isNullorspace(params.groupName)) {
        Message.warning(Language.QINGSHURUJITUANMINGCHENG);
        reject();
        return;
      }
      if (!StringUtils.isMatchLength(params.groupName, 20)) {
        Message.warning(Language.JITUANMINGCHENGCHANGDUZUIDAWEIGEZIFU);
        reject();
        return;
      }
      if (!StringUtils.isNullorspace(params.remark)) {
        if (!StringUtils.isMatchLength(params.remark, 150)) {
          Message.warning(Language.JITUANSHUOMINGZUIDAWEIGEZIFU);
          reject();
          return;
        }
      }

      if (group.groupId) {
        params = {
          ...params,
          groupId: group.groupId,
        };
        Http.editGroup(params, (res) => {
          if (res.result == 1) {
            Message.success(Language.XIUGAIJITUANCHENGGONG);
            queryGroupList(queryModel);
            resolve();
          } else {
            Message.error(res.msg);
            reject();
          }
        });
      } else {
        params = {
          ...params,
          level: group.level,
          parentId: group.parentId,
        };

        Http.createGroup(params, (res) => {
          if (res.result == 1) {
            Message.success(Language.CHUANGJIANQUNZUCHENGGONG);
            queryGroupList(queryModel);
            resolve();
          } else {
            Message.error(res.msg);
            reject();
          }
        });
      }
    });
  };

  const EditGroupContent = ({ name, remark, onChange }) => {
    return (
      <Flex vertical={true} style={{ width: "100%", height: "220px" }} gap={"11px"}>
        <Flex className={modalStyle.modalContentItem}>
          <div className={modalStyle.modalContentTitle}>
            <span style={{ color: "red" }}>*</span>
            {Language.JITUANMINGCHENG}
          </div>
          <Input className={modalStyle.modalValueInput} placeholder={Language.QINGSHURUJITUANMINGCHENG} defaultValue={name} onChange={(e) => onChange?.call(null, "name", e.target.value)} />
        </Flex>
        <Flex className={modalStyle.modalContentItem} style={{ alignItems: "flex-start" }}>
          <div className={modalStyle.modalContentTitle}>{Language.JITUANSHUOMING}</div>
          <Input.TextArea
            className={modalStyle.modalValueTextArea}
            showCount
            maxLength={TEXTAREA_MAX_LENGTH}
            placeholder={Language.QINGSHURUJITUANSHUOMING}
            defaultValue={remark}
            onChange={(e) => onChange?.call(null, "remark", e.target.value)}
          />
        </Flex>
      </Flex>
    );
  };

  const EditChildContent = ({ topName, name, remark, onChange }) => {
    return (
      <Flex vertical={true} style={{ width: "100%", height: "220px" }} gap={"11px"}>
        <Flex className={modalStyle.modalContentItem}>
          <div className={modalStyle.modalContentTitle}>{Language.JITUANMINGCHENG}</div>
          <div className={modalStyle.modalValueContent}>{topName}</div>
        </Flex>
        <Flex className={modalStyle.modalContentItem}>
          <div className={modalStyle.modalContentTitle}>
            <span style={{ color: "red" }}>*</span>
            {Language.ERJIJIEDIANMINGCHENG}
          </div>
          <Input className={modalStyle.modalValueInput} placeholder={Language.QINGSHURUERJIJIEDIANMINGCHENG} defaultValue={name} onChange={(e) => onChange?.call(null, "name", e.target.value)} />
        </Flex>
        <Flex className={modalStyle.modalContentItem} style={{ alignItems: "flex-start" }}>
          <div className={modalStyle.modalContentTitle}>{Language.ERJIJIEDIANSHUOMING}</div>
          <Input.TextArea
            className={modalStyle.modalValueTextArea}
            showCount
            maxLength={TEXTAREA_MAX_LENGTH}
            placeholder={Language.QINGSHURUERJIJIEDIANSHUOMING}
            defaultValue={remark}
            onChange={(e) => onChange?.call(null, "remark", e.target.value)}
          />
        </Flex>
      </Flex>
    );
  };

  const EditGrandsonContent = ({ topName, secondName, name, remark, onChange }) => {
    return (
      <Flex vertical={true} style={{ width: "100%", height: "260px" }} gap={"11px"}>
        <Flex className={modalStyle.modalContentItem}>
          <div className={modalStyle.modalContentTitle}>{Language.JITUANMINGCHENG}</div>
          <div className={modalStyle.modalValueContent}>{topName}</div>
        </Flex>
        <Flex className={modalStyle.modalContentItem}>
          <div className={modalStyle.modalContentTitle}>{Language.ERJIJIEDIANMINGCHENG}</div>
          <div className={modalStyle.modalValueContent}>{secondName}</div>
        </Flex>
        <Flex className={modalStyle.modalContentItem}>
          <div className={modalStyle.modalContentTitle}>
            <span style={{ color: "red" }}>*</span>
            {Language.SANJIJIEDIANMINGCHENG}
          </div>
          <Input className={modalStyle.modalValueInput} placeholder={Language.QINGSHURUSANJIJIEDIANMINGCHENG} defaultValue={name} onChange={(e) => onChange?.call(null, "name", e.target.value)} />
        </Flex>
        <Flex className={modalStyle.modalContentItem} style={{ alignItems: "flex-start" }}>
          <div className={modalStyle.modalContentTitle}>{Language.SANJIJIEDIANSHUOMING}</div>
          <Input.TextArea
            className={modalStyle.modalValueTextArea}
            showCount
            maxLength={TEXTAREA_MAX_LENGTH}
            placeholder={Language.QINGSHURUSANJIJIEDIANSHUOMING}
            defaultValue={remark}
            onChange={(e) => onChange?.call(null, "remark", e.target.value)}
          />
        </Flex>
      </Flex>
    );
  };

  const openEditGroupModal = (group, isEdit = true) => {
    const onChange = (type, value) => {
      if (type == "name") {
        group.groupName = value;
      } else if (type == "remark") {
        group.groupRemark = value;
      }
    };
    let content = null;
    let title = "";
    if (group.level == 1) {
      title = group.groupId ? Language.JITUANBIANJI : Language.XINZENGJITUAN;
      content = <EditGroupContent name={group?.groupName} remark={group?.groupRemark} onChange={onChange} />;
    } else if (group.level == 2) {
      title = group.groupId ? Language.ERJIJIEDIANBIANJI : Language.XINZENGERJIJIEDIAN;
      content = <EditChildContent topName={group?.topName} name={group?.groupName} remark={group?.groupremark} onChange={onChange} />;
    } else if (group.level == 3) {
      title = group.groupId ? Language.SANJIJIEDIANBIANJI : Language.XINZENGSANJIJIEDIAN;
      content = <EditGrandsonContent topName={group?.topName} secondName={group?.secondName} name={group?.groupName} remark={group?.groupremark} onChange={onChange} />;
    }
    const modal = UIModalEditConfirm({
      title: group.groupId ? Language.JITUANBIANJI : Language.XINZENGJITUAN,
      content: content,
      okButtonProps: { loading: false },
      open: true,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        sendModifyGroup(group)
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

  const onClickEditGroup = (record) => {
    let group = {
      groupId: record.groupId,
      level: record.level,
      parentNames: record.parentNames,
      groupName: record.groupName,
      groupRemark: record.groupRemark,
    };
    if (record.level == 2) {
      group.topName = record.parentNames[0];
    } else if (record.level == 3) {
      group.topName = record.parentNames[0];
      group.secondName = record.parentNames[1];
    }
    openEditGroupModal(group);
  };

  const onClickAddGroup = (record) => {
    record = record || { parentId: 0, level: 1, parentNames: [] };
    console.log("onClickAddGroup", record);
    let group = {
      level: record.level,
      parentId: record.parentId,
    };
    if (record.level == 2) {
      group.topName = record.parentNames[0];
    } else if (record.level == 3) {
      group.topName = record.parentNames[0];
      group.secondName = record.parentNames[1];
    }
    openEditGroupModal(group);
  };

  const onClickAddChild = (record) => {
    let group = {
      parentId: record.groupId,
      parentNames: record.parentNames.concat(record.groupName),
      level: record.level + 1,
    };
    group.topName = group.parentNames[0];
    if (record.level == 2) {
      group.secondName = group.parentNames[1];
    }
    openEditGroupModal(group);
  };

  const onDelectGroup = (record) => {
    const modal = UIModalConfirm({
      title: Language.JINGGAO,
      content: Language.SHANCHUQUNZU_TIP,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        sendDeleteGroup(record.groupId)
          .then(() => {
            modal.destroy();
          })
          .catch((error) => {
            modal.update({ okButtonProps: { loading: false } });
          });
      },
    });
  };

  const onPaginationChange = (page, pageSize) => {
    queryModel.page = page;
    queryModel.limit = pageSize;
    queryGroupList(queryModel);
  };

  const onChangeTable = (pagination, filters, sorter) => {
    if (sorter.order == "ascend") {
      queryModel.sort = 1;
    } else if (sorter.order == "descend") {
      queryModel.sort = -1;
    } else {
      queryModel.sort = 0;
    }
    queryGroupList(queryModel);
  };

  const sendDeleteGroup = async (groupId) => {
    await new Promise((resolve, reject) => {
      Http.deleteGroup({ groupId: groupId }, (res) => {
        if (res.result == 1) {
          Message.success(Language.SHANCHUJITUANCHENGGONG);
          queryGroupList(queryModel);
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
      <UIPageHeader title={Language.JITUANGUANLI} introduce={Language.JITUANGUANLI_TIP} />
      <div className="layout-content layout-content-noScroll">
        <UIContent style={{ height: "907px" }}>
          <Flex vertical={true} gap={"16px"}>
            <Flex align="center" gap={"16px"}>
              <Button type="primary" className="btn-primary" onClick={() => onClickAddGroup(null)}>
                {Language.XINZENGJITUAN}
              </Button>
            </Flex>
            <div>
              <NetDataTable
                rowKey="groupId"
                pager={pager}
                onChangePage={onPaginationChange}
                onChangeTable={onChangeTable}
                style={{ height: "auto" }}
                scroll={{ x: "max-content", y: "700px", scrollToFirstRowOnChange: true }}
                dataSource={groupTreeDataSource}>
                <Table.Column title={Language.JITUANMINGCHENG} key="groupName" dataIndex="groupName" align="left" width={150} />
                <Table.Column title={Language.GUANLIANCHANGDI} key="sitesDesc" dataIndex="sitesDesc" align="left" width={150} />
                <Table.Column title={Language.SHUOMING} key="groupRemarkDesc" dataIndex="groupRemarkDesc" align="left" width={150} />
                <Table.Column title={Language.CHUANGJIANSHIJIAN} key="createTimeDesc" dataIndex="createTimeDesc" align="left" width={150} sorter={true} showSorterTooltip={false} />
                <Table.Column
                  title={Language.CAOZUO}
                  align="left"
                  width={100}
                  render={(value, record, index) => {
                    return (
                      <Flex align="center" gap={"30px"}>
                        <div title={Language.BIANJI} className={style.editIcon} onClick={() => onClickEditGroup(record)}></div>
                        <div title={Language.XINZENGTONGJIJIEDIAN} className={style.addIcon1} onClick={() => onClickAddGroup(record)}></div>
                        {record.level < 3 && <div title={Language.XINZENGCIJIJIEDIAN} className={style.addIcon2} onClick={() => onClickAddChild(record)}></div>}
                        <div title={Language.SHANCHU} className={style.deleteIcon} onClick={() => onDelectGroup(record)}></div>
                      </Flex>
                    );
                  }}
                />
              </NetDataTable>
            </div>
            {/* {pager?.total > 0 && <UIPagination tableRef={tableRef} scrollToFirstRowOnChange={true} pager={pager} onChange={onPaginationChange} />} */}
          </Flex>
        </UIContent>
        <ICPComponent />
      </div>
    </div>
  );
};

export default GroupManagement;
