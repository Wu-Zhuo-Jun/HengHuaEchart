import React, { use, useEffect, useState } from "react";
import { Language } from "../../../language/LocaleContext";
import { UIContent, UIPageHeader, UITitle, UIModalEditConfirm, UIModalConfirm, ICPComponent, UIContentLoading } from "../../../components/ui/UIComponent";
import { Flex, Button, Divider, Dropdown, Space, Tree, Checkbox, Input } from "antd";
import DemoUtils from "../../../utils/DemoUtils";
import { MoreOutlined, CaretDownFilled, CaretRightFilled } from "@ant-design/icons";
import TimeUtils from "../../../utils/TimeUtils";
import Http from "../../../config/Http";
import Message from "../../../components/common/Message";
import $ from "jquery";

const RoleItem = ({ role, selected, onSelect, onOperate }) => {
  const onClickEdit = () => {
    onOperate?.call(null, "editRole", role);
  };
  const onClickDelete = () => {
    onOperate?.call(null, "deleteRole", role);
  };

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

  let style = {};
  if (selected) {
    style = { backgroundColor: "#e9effe", outline: "1px solid #3867d6" };
  }

  return (
    <div style={{ padding: "0px 10px 0px 10px", height: "36px", boxSizing: "border-box" }}>
      <Flex
        onClick={() => onSelect?.call(null, role?.roleId)}
        align="center"
        justify="space-between"
        style={{ padding: "0px 10px 0px 10px", boxSizing: "border-box", height: "34px", borderRadius: "6px", ...style }}>
        <div>{role?.roleName}</div>
        <Dropdown menu={{ items: menu }} trigger={["click"]}>
          <MoreOutlined style={{ fontSize: "14px", fontWeight: "bold" }} />
        </Dropdown>
      </Flex>
    </div>
  );
};

const TreeNode = ({ node, checkedKeys, onChange, checked = false, indeterminate = false, level = 0 }) => {
  const [ownIndeterminate, setOwnIndeterminate] = useState(indeterminate);
  const [ownChecked, setOwnChecked] = useState(checked);
  const [expand, setExpand] = useState(true);
  const [children, setChildren] = useState(node?.children);

  useEffect(() => {
    if (node.state == 1) {
      setOwnChecked(true);
      setOwnIndeterminate(false);
      if (children) {
        let childs = [...children];
        childs.map((child) => {
          child.state = 1;
        });
        setChildren(childs);
      }
    } else if (node.state == 2) {
      setOwnChecked(false);
      setOwnIndeterminate(true);
    } else {
      setOwnChecked(false);
      setOwnIndeterminate(false);
      if (children) {
        let childs = [...children];
        childs.map((child) => {
          child.state = 0;
        });
        setChildren(childs);
      }
    }
  }, [checked]);

  useEffect(() => {
    if (checkedKeys.includes(node.id)) {
      changeChecked(true);
    } else {
      changeChecked(false);
    }
  }, [checkedKeys]);

  useEffect(() => {
    setOwnIndeterminate(indeterminate);
  }, [indeterminate]);

  const onClickExpand = () => {
    setExpand(!expand);
  };
  const ExpandButton = ({ expand, style }) => {
    return (
      <div onClick={onClickExpand} style={{ cursor: "pointer", ...style }}>
        {expand ? <CaretDownFilled /> : <CaretRightFilled />}
      </div>
    );
  };
  const style = level > 0 ? { paddingLeft: `30px` } : {};

  const onClickChecked = (e) => {
    changeChecked(e.target.checked);
  };

  const changeChecked = (checked) => {
    callChange(checked ? 1 : 0);
    if (children) {
      let childs = [...children];
      childs?.map((child) => {
        child.state = checked ? 1 : 0;
      });
      setChildren(childs);
    }
  };

  const callChange = (state) => {
    if (onChange) {
      onChange.call(null, state, node.id);
    } else {
      if (state == 0) {
        setOwnChecked(false);
        setOwnIndeterminate(false);
      } else if (state == 1) {
        setOwnChecked(true);
        setOwnIndeterminate(false);
      } else if (state == 2) {
        setOwnChecked(false);
        setOwnIndeterminate(true);
      }
    }
  };

  const onChangeChildren = (state, id) => {
    let childs = [...children];
    let checkedCount = 0;
    let status = 0;
    childs.map((child) => {
      if (child.id == id) {
        child.state = state;
      }
      if (child.state == 2) {
        status = 2;
      }
      if (child.state == 1) {
        checkedCount++;
      }
    });
    setChildren(childs);
    if (status != 2) {
      if (checkedCount == childs.length) {
        status = 1;
      } else if (checkedCount > 0 && checkedCount < childs.length) {
        status = 2;
      }
    }
    callChange(status);
  };
  return (
    <div style={{ ...style, boxSizing: "border-box" }}>
      <Flex vertical gap={16}>
        <Space>
          <ExpandButton expand={expand} style={{ visibility: node?.children?.length > 0 ? "visible" : "hidden" }} />
          <Checkbox value={node.id} name="checkbox" indeterminate={ownIndeterminate} checked={ownChecked} onClick={onClickChecked}>
            {node?.title}
          </Checkbox>
        </Space>
        {children?.length > 0 && (
          <Flex vertical={node?.last == 1 ? false : true} gap={16} wrap style={{ display: expand ? "flex" : "none" }}>
            {children?.map((child, index) => {
              return <TreeNode key={index} node={child} checkedKeys={checkedKeys} indeterminate={child.state == 2} checked={child.state == 1} level={level + 1} onChange={onChangeChildren} />;
            })}
          </Flex>
        )}
      </Flex>
    </div>
  );
};

const RoleManagement = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const treeRef = React.useRef(null);

  const privilege = DemoUtils.getPrivilegeList();

  useEffect(() => {
    requestRoleList();
  }, []);

  const onSelectRole = (roleId) => {
    roles.map((role) => {
      if (role.roleId === roleId) {
        setSelectedRole(role);
      }
      return role;
    });
  };

  const EditRoleModalContent = ({ role, onChange }) => {
    return (
      <Flex vertical style={{ width: "100%", height: "220px" }} gap={"11px"}>
        <Flex className="ui-modal-content">
          <UITitle required className="ui-modal-title">
            {Language.JUESEMINGCHENG}:
          </UITitle>
          <Input className="ui-modal-input" placeholder={Language.QINGSHURUJUESEMINGCHENG} defaultValue={role?.roleName} onChange={(e) => onChange({ roleName: e.target.value })} />
        </Flex>
        <Flex className="ui-modal-content" style={{ alignItems: "flex-start" }}>
          <UITitle className="ui-modal-title">{Language.JUESESHUOMING}</UITitle>
          <Input.TextArea
            className="pb-unresize-textarea"
            showCount
            maxLength={150}
            placeholder={Language.QINGSHURUJUESESHUOMING}
            defaultValue={role?.roleDesc}
            onChange={(e) => onChange({ roleDesc: e.target.value })}
          />
        </Flex>
      </Flex>
    );
  };

  const onClickCreateRole = () => {
    openEditRoleModal();
  };

  const onOperateRole = (type, role) => {
    if (type === "editRole") {
      openEditRoleModal(role);
    } else if (type === "deleteRole") {
      openDeleteRoleModal(role);
    }
  };

  const openEditRoleModal = (role) => {
    if (role == null) {
      role = {};
    }
    let title = role?.roleId ? Language.BIANJIJUESE : Language.XINZENGJUESE;
    const onChange = (data) => {
      role = { ...role, ...data };
    };
    let modal = UIModalEditConfirm({
      title: title,
      content: <EditRoleModalContent role={role} onChange={onChange} />,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        let request = role?.roleId ? requestEditRole : requestAddRole;
        request(role, (res) => {
          modal.update({ okButtonProps: { loading: false } });
          if (res.result == 1) {
            Message.success(role?.roleId ? Language.XIUGAIJUESECHENGGONG : Language.XINZENGJUESECHENGGONG);
            modal.destroy();
            if (role?.roleId == null) {
              requestRoleList();
            } else {
              setRoles(
                roles.map((item) => {
                  if (item.roleId === role.roleId) {
                    item.roleName = role.roleName;
                    item.roleDesc = role.roleDesc;
                    setSelectedRole(role);
                  }
                  return item;
                })
              );
            }
          } else {
            Message.error(res.msg);
          }
        });
      },
    });
  };

  const openDeleteRoleModal = (role) => {
    let modal = UIModalConfirm({
      title: Language.JINGGAO,
      content: Language.SHANCHUJUESE_TIP,
      onOk: (close) => {
        modal.update({ okButtonProps: { loading: true } });
        requestDeleteRole({ roleId: role.roleId }, (res) => {
          modal.update({ okButtonProps: { loading: false } });
          if (res.result == 1) {
            Message.success(Language.SHANCHUJUESECHENGGONG);
            modal.destroy();
            let newRoles = roles.filter((item) => {
              return item.roleId !== role.roleId;
            });
            setRoles(newRoles);
            if (newRoles.length > 0) {
              onSelectRole(newRoles[0].roleId);
            }
          } else {
            Message.error(res.msg);
          }
        });
      },
    });
  };

  const requestAddRole = (params, success) => {
    Http.addRole(params, success);
  };

  const requestEditRole = (params, success) => {
    Http.editRole(params, success);
  };

  const requestRoleList = () => {
    setLoading(true);
    Http.getRoleList({}, (res) => {
      if (res.result == 1) {
        let newRoles = formatRoleList(res.data);
        setRoles(newRoles);
        if (selectedRole.roleId == null && newRoles.length > 0) {
          setSelectedRole(newRoles[0]);
        }
      } else {
        Message.error(res.msg);
      }
      setLoading(false);
    });
  };

  const requestSaveRolePower = (roleId, power) => {
    let params = {
      roleId: roleId,
      power: power.join(","),
    };
    Http.saveRolePower(params, (res) => {
      if (res.result == 1) {
        setRoles(
          roles.map((role) => {
            if (role.roleId === params.roleId) {
              role.rolePower = power;
            }
            return role;
          })
        );
        Message.success(Language.XIUGAIJUESEQUANXIANCHENGGONG);
      } else {
        Message.error(res.msg);
      }
    });
  };

  const requestDeleteRole = (params, success) => {
    Http.deleteRole(params, success);
  };

  const formatRoleList = (roles) => {
    roles.map((role) => {
      role.createTimeDesc = TimeUtils.ts2Date(role.createTime, "yyyy-MM-dd HH:mm:ss");
      role.rolePower = role.rolePower ? role.rolePower.split(",").map((power) => Number(power)) : [];
      return role;
    });
    return roles;
  };

  const onClickSave = () => {
    let power = [];
    $(treeRef.current)
      .find('input[type="checkbox"]')
      .each(function () {
        let value = $(this).prop("value");
        let checked = $(this).prop("checked");
        if (checked) {
          power.push(Number(value));
        }
      });
    requestSaveRolePower(selectedRole.roleId, power);
  };

  return (
    <div className="main">
      <UIPageHeader title={Language.JUESEQUANXIAN} introduce={Language.JUESEQUANXIAN_TIP} />
      <UIContentLoading loading={false}>
        <div className="layout-content layout-content-noScroll">
          <Flex style={{ height: "940px" }} gap={12}>
            <UIContent style={{ with: "231px", maxWidth: "231px", height: "100%", paddingLeft: "0px", paddingRight: "0px" }}>
              <div style={{ width: "100%", padding: "0px 19px" }}>
                <Button type="primary" className="btn-primary" style={{ width: "100%", height: "36px" }} onClick={onClickCreateRole}>
                  {Language.XINZENGJUESE}
                </Button>
              </div>
              <Divider style={{ margin: "8px 0px 8px 0px" }} />
              <div>
                <Flex vertical>
                  {roles.map((role, index) => {
                    return <RoleItem key={index} role={role} selected={role.roleId === selectedRole.roleId} roleName={role.roleName} onSelect={onSelectRole} onOperate={onOperateRole} />;
                  })}
                </Flex>
              </div>
            </UIContent>
            <Flex vertical style={{ flex: 1, minWidth: "0px" }} gap={14}>
              <UIContent style={{ height: "46px" }}>
                <Flex align="center" style={{ height: "100%" }} gap={58}>
                  {selectedRole.roleId && (
                    <>
                      <Flex align="center" gap={12}>
                        <UITitle className="font-style-3-16">{Language.JUESEMINGCHENG}:</UITitle>
                        <div className="font-style-2-16">{selectedRole.roleName}</div>
                      </Flex>
                      <Flex align="center" gap={12}>
                        <UITitle className="font-style-3-16">{Language.CHUANGJIANZHE}:</UITitle>
                        <div className="font-style-2-16">{selectedRole.userName ? selectedRole.userName : Language.ZHAOBUDAOMINGCHENG}</div>
                      </Flex>
                      <Flex align="center" gap={12}>
                        <UITitle className="font-style-3-16">{Language.CHUANGJIANSHIJIAN}:</UITitle>
                        <div className="font-style-2-16">{selectedRole.createTimeDesc}</div>
                      </Flex>
                      <Flex align="center" gap={12}>
                        <UITitle className="font-style-3-16">{Language.BEIZHU}:</UITitle>
                        <div className="font-style-2-16">{selectedRole.roleDesc ? selectedRole.roleDesc : Language.WEISHEZHI}</div>
                      </Flex>
                    </>
                  )}
                  {selectedRole.roleId == null && <UITitle className="font-style-3-16">{Language.QINGXUANZEJUESE}</UITitle>}
                </Flex>
              </UIContent>
              <UIContent style={{ height: "885px" }}>
                {selectedRole?.roleId && (
                  <Flex vertical gap={31}>
                    <Flex align="center" justify="space-between">
                      <Space align="center">
                        <div
                          className="font-style-2-16"
                          style={{
                            height: "32px",
                            backgroundColor: "#e4e4e4",
                            textAlign: "center",
                            lineHeight: "32px",
                            borderRadius: "5px",
                            padding: "0px 10px",
                          }}>
                          {Language.MOKUAIGONGNENG}
                        </div>
                        <div className="font-style-2-14" style={{ color: "#555555" }}>
                          {Language.SHEBEIJUESEDUIYINGDEYEMINANQUANXIAN}
                        </div>
                      </Space>
                      <Button type="primary" className="btn-primary" onClick={onClickSave}>
                        {Language.BAOCUN}
                      </Button>
                    </Flex>
                    <div className="pb-scroll-container" style={{ height: "800px" }}>
                      <Flex ref={treeRef} vertical gap={9}>
                        {privilege.map((item, index) => {
                          return (
                            <div
                              key={index}
                              style={{
                                padding: "12px 10px 10px 10px",
                                backgroundColor: "#edf3ff",
                              }}>
                              <TreeNode key={index} node={item} checkedKeys={selectedRole?.rolePower || []} />
                            </div>
                          );
                        })}
                      </Flex>
                    </div>
                  </Flex>
                )}
              </UIContent>
            </Flex>
          </Flex>
          <ICPComponent />
        </div>
      </UIContentLoading>
    </div>
  );
};

export default RoleManagement;
