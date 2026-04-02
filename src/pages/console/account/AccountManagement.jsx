import React, { use, useEffect, useState } from "react";
import { Language } from "../../../language/LocaleContext";
import { UIContent, UIModalConfirm, UIModalEditConfirm, UIPageHeader, UITitle, ICPComponent } from "../../../components/ui/UIComponent";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Cascader, Flex, Input, message, Radio, Select, Space, Switch, Table, TreeSelect } from "antd";
import { DataTable, NetDataTable } from "../../../components/common/tables/Table";
import DemoUtils from "../../../utils/DemoUtils";
import Http from "../../../config/Http";
import Message from "../../../components/common/Message";
import ArrayUtils from "../../../utils/ArrayUtils";
import Constant from "../../../common/Constant";
import TimeUtils from "../../../utils/TimeUtils";

const AccountManagementModel = {
  queryModel: {
    page: 1,
    limit: Constant.PAGE_SIZES[0],
    allNumber: 1,
    search: null,
    sort: 0,
  },
  siteMap: {},
  roleMap: {},
  resetQueryModel: () => {
    AccountManagementModel.queryModel = {
      page: 1,
      limit: Constant.PAGE_SIZES[0],
      allNumber: 1,
      search: null,
      sort: 0,
    };
  },
};

const CreateAccountContent = ({ user, onChange, siteTreeData, roleOptions }) => {
  const sites = user?.sites?.split(",").map((siteId) => {
    return `site_${siteId}`;
  });
  return (
    <Flex vertical gap={24} style={{ width: "100%", height: "450px" }}>
      <Flex align="center" className="ui-modal-content">
        <UITitle required className="ui-modal-title">
          {Language.DENGLUZHANGHAO}
        </UITitle>
        {user?.targetId ? (
          <div className="pb-text-not-editable">{user?.account}</div>
        ) : (
          <Input className="ui-modal-input" value={user?.account} placeholder={Language.QINGSHURUZIZHANGHAODEDENGLUZHANGHAO} onChange={(e) => onChange?.call(null, "account", e.target.value)} />
        )}
      </Flex>
      <Flex align="center" className="ui-modal-content">
        <UITitle required={user?.targetId ? false : true} className="ui-modal-title">
          {Language.DENGLUMIMA}
        </UITitle>
        <Input.Password className="ui-modal-input" placeholder={Language.RUOXIXIUGAIMIMAQINGSHURU} onChange={(e) => onChange.call(null, "password", e.target.value)} />
      </Flex>
      <Flex align="center" className="ui-modal-content">
        <UITitle required className="ui-modal-title">
          {Language.YONGHUMING}
        </UITitle>
        <Input className="ui-modal-input" defaultValue={user?.userName} placeholder={Language.QINGSHURUZIZHANGHAODEYONGHUMING} onChange={(e) => onChange?.call(null, "userName", e.target.value)} />
      </Flex>
      <Flex align="center" className="ui-modal-content">
        <UITitle required className="ui-modal-title">
          {Language.CHANGDIQUANXIAN}
        </UITitle>
        <TreeSelect
          allowClear
          showSearch
          treeDefaultExpandedKeys={sites}
          defaultValue={sites}
          treeNodeFilterProp="label"
          showCheckedStrategy="SHOW_ALL"
          treeCheckStrictly
          treeCheckable
          className="ui-modal-tree-select pb-tree-select"
          treeData={siteTreeData}
          maxTagTextLength={15}
          maxTagCount={"responsive"}
          onChange={(list) => onChange?.call(null, "sites", list)}
          placeholder={Language.QINGXUANZEZIZHANGHAODECHANGDIQUANXIAN}
        />
      </Flex>
      <Flex align="center" className="ui-modal-content">
        <UITitle required className="ui-modal-title">
          {Language.ZHANGHAOZHUANGTAI}
        </UITitle>
        <Radio.Group defaultValue={user?.targetId ? user?.state : 1} onChange={(e) => onChange?.call(null, "state", e.target.value)}>
          <Space className="ui-modal-input" size={50}>
            <Radio value={1}>{Language.ZHENGCHANG}</Radio>
            <Radio value={-1}>{Language.JINYONG}</Radio>
          </Space>
        </Radio.Group>
      </Flex>
      <Flex align="center" className="ui-modal-content">
        <UITitle className="ui-modal-title">{Language.SUOSHUJUESE}</UITitle>
        <Select
          className="ui-modal-tree-select"
          optionFilterProp="label"
          showSearch
          defaultValue={user?.roleId == "-1" ? null : user?.roleId}
          options={roleOptions}
          placeholder={Language.QINGXUANZEZIZHANGHAODEJUESE}
          onChange={(value) => onChange?.call(null, "roleId", value)}
        />
      </Flex>
      <Flex align="center" className="ui-modal-content">
        <UITitle className="ui-modal-title">{Language.LIANXIREN}</UITitle>
        <Input className="ui-modal-input" defaultValue={user?.contacts} placeholder={Language.QINGSHURUZIZHANGHAODELIANXIREN} onChange={(e) => onChange?.call(null, "contacts", e.target.value)} />
      </Flex>
      <Flex align="center" className="ui-modal-content">
        <UITitle className="ui-modal-title">{Language.LIANXIFANGSHI}</UITitle>
        <Input className="ui-modal-input" defaultValue={user?.phone} placeholder={Language.QINGSHURUZIZHANGHAODELIANXIFANGSHI} onChange={(e) => onChange?.call(null, "phone", e.target.value)} />
      </Flex>
    </Flex>
  );
};

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [pager, setPager] = useState({ current: 1, pageSize: Constant.PAGE_SIZES[0], total: 0 });
  const [search, setSearch] = useState(null);
  const [siteTreeData, setSiteTreeData] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  useEffect(() => {
    // setUsers(DemoUtils.getAccountList());
    requestGroupSiteSelection();
    return () => {
      AccountManagementModel.resetQueryModel();
    };
  }, []);

  const openAddAccountModal = (user) => {
    if (user == null) {
      user = {
        state: 1,
      };
    }
    const onChange = (key, value) => {
      if (key == "sites") {
        let siteIds = value.map((site) => site.value.split("_")[1]);
        user[key] = siteIds.join(",");
      } else {
        user[key] = value;
      }
      console.log("user", user);
    };

    let modal = UIModalEditConfirm({
      title: user?.targetId ? Language.BIANJIZIZHANGHAO : Language.XINZENGZHANGHAO,
      content: <CreateAccountContent siteTreeData={siteTreeData} roleOptions={roleOptions} onChange={onChange} user={user} />,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        let request = user?.targetId ? requestEditUser : requestAddUser;
        request(user, (res) => {
          modal.update({ okButtonProps: { loading: false } });
          if (res.result == 1) {
            if (user?.targetId) {
              Message.success(Language.XIUGAIZHANGHAOCHENGGONG);
            } else {
              Message.success(Language.XINZENGZHANGHAOCHENGGONG);
            }
            modal.destroy();
            requestQueryUsers(AccountManagementModel.queryModel);
          } else {
            Message.error(res.msg);
          }
        });
      },
    });
  };

  const openEditAccountModal = (record) => {
    let user = {
      account: record.account,
      userName: record.userName,
      state: record.state,
      contacts: record.contacts,
      phone: record.phone,
      targetId: record.userId,
      roleId: record.roleId,
      sites: record?.siteIds?.join(","),
    };
    console.log(user);
    openAddAccountModal(user);
  };

  const onClickEditUserState = (checked, userId) => {
    let params = {
      state: checked ? 1 : -1,
      targetId: userId,
    };
    requestSetUserState(params);
  };

  const onClickAddUser = () => {
    openAddAccountModal();
  };

  const onClickReset = () => {
    setSearch(null);
  };

  const onClickQuery = () => {
    AccountManagementModel.queryModel.search = search;
    AccountManagementModel.queryModel.page = 1;
    requestQueryUsers(AccountManagementModel.queryModel);
  };

  const onClickDeleteUser = (userId) => {
    let modal = UIModalConfirm({
      title: Language.JINGGAO,
      content: Language.SHANCHUZHANGHAO_TIP,
      onOk: () => {
        modal.update({ okButtonProps: { loading: true } });
        requestDeleteUser({ targetId: userId }, (res) => {
          if (res.result == 1) {
            Message.success(Language.SHANCHUZHANGHAOCHENGGONG);
            requestQueryUsers(AccountManagementModel.queryModel);
          } else {
            Message.error(res.msg);
          }
          modal.update({ okButtonProps: { loading: false } });
          modal.destroy();
        });
      },
    });
  };

  const onChangeSearch = (e) => {
    setSearch(e.target.value);
  };

  const onChangePage = (page, pageSize) => {
    AccountManagementModel.queryModel.page = page;
    AccountManagementModel.queryModel.limit = pageSize;
    requestQueryUsers(AccountManagementModel.queryModel);
  };

  const onChangeTable = (pagination, filters, sorter, extra) => {
    if (sorter.order == "ascend") {
      AccountManagementModel.queryModel.sort = 1;
    } else if (sorter.order == "descend") {
      AccountManagementModel.queryModel.sort = -1;
    } else {
      AccountManagementModel.queryModel.sort = 0;
    }
    requestQueryUsers(AccountManagementModel.queryModel);
  };

  const requestGroupSiteSelection = () => {
    Http.getGroupSiteSelection({}, (res) => {
      if (res.result == 1) {
        let sites = formatSites(res.data.sites);
        let groups = formatGroups(res.data.groups);
        let options = [...groups, ...sites];
        options = ArrayUtils.dataList2TreeNode(options, "value");
        console.log("options", options);
        setSiteTreeData(options);
      } else {
        Message.error(res.msg);
      }
      requestGetUserRoleSelection((res) => {
        if (res.result == 1) {
          let roles = res.data.map((role) => {
            role.label = role.roleName;
            role.value = role.roleId;
            AccountManagementModel.roleMap[role.roleId] = role.roleName;
            return role;
          });
          setRoleOptions(roles);
        }
        requestQueryUsers(AccountManagementModel.queryModel);
      });
    });
  };

  const requestQueryUsers = (params) => {
    Http.getUserList(params, (res) => {
      if (res.result == 1) {
        let data = res.data.data;
        let pager = res.data.pager;
        let users = formatUsers(data);
        setUsers(users);
        setPage(pager.page, pager.limit, pager.count);
      } else {
        Message.error(res.msg);
      }
    });
  };

  const requestAddUser = (user, success) => {
    Http.addUser(user, (res) => {
      success?.call(null, res);
    });
  };

  const requestEditUser = (user, success) => {
    Http.editUser(user, (res) => {
      success?.call(null, res);
    });
  };

  const requestSetUserState = (params) => {
    Http.setUserState(params, (res) => {
      if (res.result == 1) {
        setUserState(params.targetId, params.state);
      } else {
        message.error(res.msg);
      }
    });
  };

  const requestDeleteUser = (params, success) => {
    Http.deleteUser(params, success);
  };

  const requestGetUserRoleSelection = (success) => {
    Http.getUserRoleSelection({}, success);
  };

  const setUserState = (userId, state) => {
    setUsers(
      users?.map((user) => {
        if (user.userId == userId) {
          user.state = state;
        }
        return user;
      })
    );
  };

  const formatSites = (sites) => {
    sites.map((site) => {
      site.label = site.siteName;
      site.checkable = true;
      site.value = `site_${site.siteId}`;
      site.parentId = site.groupId == "0" || site.groupId == 0 ? "-1" : site.groupId;
      AccountManagementModel.siteMap[site.siteId] = site.siteName;
      return site;
    });
    return sites;
  };

  const formatGroups = (groups) => {
    groups.map((group) => {
      group.label = group.groupName;
      group.checkable = false;
      group.value = group.groupId;
      return group;
    });
    groups.unshift({ label: Language.WEIFENPEIJIEDIAN, value: "-1", checkable: false, parentId: "0" });
    return groups;
  };

  const formatUsers = (users) => {
    console.log("formatUsers");
    users.map((user) => {
      if (user.siteIds && user.siteIds.length > 0) {
        user.siteName = user.siteIds
          .map((siteId) => {
            if (AccountManagementModel.siteMap[siteId]) {
              return AccountManagementModel.siteMap[siteId];
            }
            return Language.CHANGDIMINGCHENGWEIZHAODAO;
          })
          .join(",");
      } else {
        user.siteName = Language.WEISHEZHICHANGDIQUANXIAN;
      }
      user.createTimeDesc = TimeUtils.ts2Date(Number(user.createTime), "yyyy-MM-dd HH:mm:ss");
      if (String(user.roleId) == "-1") {
        user.roleName = Language.WEISHENZHIJUESE;
      } else {
        if (AccountManagementModel.roleMap[user.roleId]) {
          user.roleName = AccountManagementModel.roleMap[user.roleId];
        } else {
          user.roleName = Language.ZHAOBUDAOMINGCHENG;
        }
      }
      if (!user.contacts) {
        user.contactsDesc = Language.WEISHEZHI;
      } else {
        user.contactsDesc = user.contacts;
      }
      if (!user.phone) {
        user.phoneDesc = Language.WEISHEZHI;
      } else {
        user.phoneDesc = user.phone;
      }
      user.state = Number(user.state);
    });
    return users;
  };

  const setPage = (page, pageSize, total) => {
    AccountManagementModel.queryModel.page = page;
    AccountManagementModel.queryModel.limit = pageSize;
    setPager({ current: page, pageSize: pageSize, total: total });
  };

  return (
    <div className="main">
      <UIPageHeader title={Language.ZHANGHUGUANLI} introduce={Language.ZHANGHUGUANLI_TIP} />
      <div className="layout-content layout-content-noScroll">
        <UIContent style={{ height: "940px" }}>
          <Flex vertical gap={20}>
            <Flex align="center" gap={16}>
              <Input
                prefix={<SearchOutlined />}
                value={search}
                allowClear
                style={{ width: "375px", height: "32px" }}
                placeholder={`${Language.DENGLUZHANGHAO}/${Language.YONGHUMING}/${Language.LIANXIFANGSHI}`}
                onChange={onChangeSearch}
              />
              <Space align="center" size={19}>
                <Button type="primary" className="btn-primary" onClick={onClickQuery}>
                  {Language.CHAXUN}
                </Button>
                <Button type="primary" className="btn-primary-s1" onClick={onClickReset}>
                  {Language.CHONGZHI}
                </Button>
              </Space>
            </Flex>
            <Button type="primary" className="btn-primary" style={{ width: "111px" }} onClick={onClickAddUser}>
              {Language.XINZENGZHANGHU}
            </Button>
            <div>
              <NetDataTable
                onChangePage={onChangePage}
                onChangeTable={onChangeTable}
                rowKey="userId"
                style={{ height: "auto" }}
                scroll={{ x: "max-content", y: "600px" }}
                pager={pager}
                dataSource={users}>
                <Table.Column title={Language.DENGLUZHANGHAO} dataIndex="account" width={160} minWidth={160} />
                <Table.Column title={Language.YONGHUMING} dataIndex="userName" width={120} minWidth={120} />
                <Table.Column title={Language.CHANGDIQUANXIAN} dataIndex="siteName" width={315} minWidth={315} />
                <Table.Column title={Language.LIANXIREN} dataIndex="contactsDesc" width={130} minWidth={130} />
                <Table.Column title={Language.SHOUJIHAOMA} dataIndex="phoneDesc" width={180} minWidth={180} />
                <Table.Column title={Language.SUOSHUJUESE} dataIndex="roleName" width={120} minWidth={120} />
                <Table.Column
                  title={Language.ZHANGHAOZHUANGTAI}
                  dataIndex="state"
                  align="center"
                  width={140}
                  minWidth={140}
                  render={(value, record, index) => {
                    return <Switch checked={value == 1} onChange={(checked) => onClickEditUserState(checked, record.userId)} />;
                  }}
                />
                <Table.Column title={Language.CHUANGJIANSHIJIAN} dataIndex="createTimeDesc" sorter showSorterTooltip={false} width={200} minWidth={200} />
                <Table.Column
                  title={Language.CAOZUO}
                  width={"auto"}
                  minWidth={200}
                  align="center"
                  render={(value, record, index) => {
                    return (
                      <Flex align="center" justify="center" gap={10}>
                        <div
                          className="font-style-1-16"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => openEditAccountModal(record)}>
                          {Language.BIANJI}
                        </div>
                        <div
                          style={{
                            width: "1px",
                            backgroundColor: "#3867d6",
                            height: "10px",
                          }}></div>
                        <div
                          className="font-style-1-16"
                          style={{
                            color: "red",
                            cursor: "pointer",
                          }}
                          onClick={() => onClickDeleteUser(record.userId)}>
                          {Language.SHANCHU}
                        </div>
                      </Flex>
                    );
                  }}
                />
              </NetDataTable>
            </div>
          </Flex>
        </UIContent>
        <ICPComponent />
      </div>
    </div>
  );
};

export default AccountManagement;
