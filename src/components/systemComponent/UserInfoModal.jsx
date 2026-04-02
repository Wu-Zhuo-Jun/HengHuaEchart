import React, { useState, useEffect } from "react";
import { Modal, Button, Input, Flex, message } from "antd";
import Http from "../../config/Http";
import { useNavigate } from "react-router-dom";
import { EditOutlined, CloseOutlined } from "@ant-design/icons";
import User, { UserData } from "../../data/UserData";
import DebounceUtils from "@/utils/DebounceUtils";
import ChangePasswordModal from "./ChangePasswordModal";
import "./UserInfoModal.less";

const UserInfoModal = ({ open, onCancel, onConfirm, avatarIconMap }) => {
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [temporaryIcon, setTemporaryIcon] = useState(null);
  const [userName, setUserName] = useState(User.userName || "");
  const [isEditingUserName, setIsEditingUserName] = useState(false);
  const [tempUserName, setTempUserName] = useState("");
  const [editUserNameStatus, setEditUserNameStatus] = useState(false);
  const [userNameError, setUserNameError] = useState("");
  const [showChangeIcon, setShowChangeIcon] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setUserName(User.userName || "");
      setIsEditingUserName(false);
    }
  }, [open]);

  useEffect(() => {
    setTemporaryIcon(User.icon);
  }, [User.icon]);

  const logout = () => {
    User.logout();
    navigate("/login");
  };

  const handleIconSelect = (iconIndex) => {
    setSelectedIcon(iconIndex);
  };

  const handleEditUserName = () => {
    setTempUserName(userName);
    setIsEditingUserName(true);
    setUserNameError("");
    setEditUserNameStatus(false);
  };

  // 实时校验用户名
  const validateUserName = (userName) => {
    const trimmedUserName = userName?.trim() || "";
    if (!trimmedUserName) {
      return { isValid: false, error: "请输入用户名" };
    }
    const validPattern = /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）.@]+$/;
    if (!validPattern.test(trimmedUserName)) {
      return { isValid: false, error: "仅支持中文，英文，数字，及符号(.-_@())", errorMsg: "用户名输入不符合要求，请检查后重试。" };
    }
    return { isValid: true, error: "" };
  };

  // 实时校验用户名
  const validateUserNameRealTime = DebounceUtils.debounce((value) => {
    const validation = validateUserName(value);
    if (validation.isValid) {
      setUserNameError("");
      setEditUserNameStatus(false);
    } else {
      setUserNameError(validation.error);
      setEditUserNameStatus(true);
    }
  }, 300);

  // 保存
  const handleSaveUserName = DebounceUtils.throttle(() => {
    const validation = validateUserName(tempUserName);
    if (!validation.isValid) {
      message.error(validation?.errorMsg || validation.error);
      return;
    }
    Http.setUserName({ userName: tempUserName }, (res) => {
      if (res.result == 1) {
        const session = User.session;
        setIsEditingUserName(false);
        setUserName(tempUserName);
        setIsEditingUserName(false);
        setUserNameError("");
        setEditUserNameStatus(false);
        if (session) {
          const param = { account: session.account, key: session.key };
          Http.getUserData(param, (getUserRes) => {
            if (getUserRes.result == 1) {
              message.success("修改用户名成功");
              User.setUserData(getUserRes.data);
              onCancel();
            }
          });
        } else {
          logout();
        }
      }
    });
  }, 1000);

  const handleCancelEditUserName = () => {
    setTempUserName("");
    setIsEditingUserName(false);
    setUserNameError("");
    setEditUserNameStatus(false);
    // 恢复 User.userName
    setUserName(User.userName || "");
  };

  const handleConfirm = DebounceUtils.throttle(() => {
    Http.setUserIcon(
      { icon: selectedIcon },
      (res) => {
        if (res.result == 1) {
          const session = User.session;
          if (session) {
            const param = { account: session.account, key: session.key };
            Http.getUserData(param, (getUserRes) => {
              if (getUserRes.result == 1) {
                message.success("更换头像成功");

                User.setUserData(getUserRes.data);
                // 更新临时头像状态
                setTemporaryIcon(selectedIcon);
                // 关闭选择头像界面
                setShowChangeIcon(false);
                setSelectedIcon(null);
                onCancel();
              }
            });
          } else {
            logout();
          }
        } else {
          message.error(res.msg);
        }
      },
      null,
      (error) => {
        message.error("更换头像失败");
      }
    );
  }, 3000);

  const handleModifyPassword = () => {
    setShowChangePasswordModal(true);
    onCancel();
  };

  const handleCloseChangeIcon = () => {
    setShowChangeIcon(false);
    setSelectedIcon(null);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        title={
          <div className="user-info-modal-title">
            <span>账号设置</span>
            <CloseOutlined className="user-info-modal-close" onClick={onCancel} />
          </div>
        }
        footer={null}
        width={720}
        className="user-info-modal"
        closable={false}>
        <div className="user-info-modal-content">
          <Flex gap={32}>
            {/* 左侧头像区域 */}
            <div className="user-info-modal-left">
              <div className="user-info-modal-avatar-label">账号头像</div>
              <div className="user-info-modal-avatar-large">
                <img src={selectedIcon !== null ? avatarIconMap[selectedIcon] : avatarIconMap[temporaryIcon] || avatarIconMap[0]} alt="avatar" />
              </div>
              <div
                className="user-info-modal-avatar-hint"
                onClick={() => {
                  setSelectedIcon(temporaryIcon);
                  setShowChangeIcon(true);
                }}>
                点击选择头像
              </div>
              {showChangeIcon && (
                <>
                  <div className="user-info-modal-avatar-options">
                    {[0, 1, 2].map((iconIndex) => (
                      <div key={iconIndex} className={`user-info-modal-avatar-option ${selectedIcon === iconIndex ? "selected" : ""}`} onClick={() => handleIconSelect(iconIndex)}>
                        <img src={avatarIconMap[iconIndex] || avatarIconMap[0]} alt={`avatar-${iconIndex}`} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
                    <Button type="primary" onClick={handleConfirm} style={{ fontSize: 14, fontFamily: "PingFang SC Medium", fontWeight: "normal" }}>
                      确认
                    </Button>
                    <Button onClick={handleCloseChangeIcon}>取消</Button>
                  </div>
                </>
              )}
            </div>

            {/* 右侧信息区域 */}
            <div className="user-info-modal-right">
              <div className="user-info-modal-info-row">
                <div className="user-info-modal-info-label">登录账号：</div>
                <div className="user-info-modal-info-value">{User.account || "-"}</div>
              </div>
              <div className="user-info-modal-info-row">
                <div className="user-info-modal-info-label">用户名：</div>
                <div className="user-info-modal-info-value-wrapper">
                  {isEditingUserName ? (
                    <div style={{ flex: 1 }}>
                      <Flex gap={8} align="center">
                        <Input
                          value={tempUserName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTempUserName(value);
                            validateUserNameRealTime(value);
                          }}
                          className="user-info-modal-input"
                          autoFocus
                          showCount
                          maxLength={32}
                          status={editUserNameStatus ? "error" : ""}
                        />
                        <Button type="primary" size="small" onClick={handleSaveUserName}>
                          保存
                        </Button>
                        <Button size="small" onClick={handleCancelEditUserName}>
                          取消
                        </Button>
                      </Flex>
                      {userNameError && <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px", marginLeft: "0px" }}>{userNameError}</div>}
                    </div>
                  ) : (
                    <Flex gap={8} align="center">
                      <span>{userName || "-"}</span>
                      <EditOutlined className="user-info-modal-edit-icon" onClick={handleEditUserName} />
                    </Flex>
                  )}
                </div>
              </div>
              <div className="user-info-modal-info-row">
                <div className="user-info-modal-info-label">联系人：</div>
                <div className="user-info-modal-info-value">{User.contacts || "-"}</div>
              </div>
              <div className="user-info-modal-info-row">
                <div className="user-info-modal-info-label">手机：</div>
                <div className="user-info-modal-info-value">{User.phone || "-"}</div>
              </div>
              <div className="user-info-modal-info-row">
                <div className="user-info-modal-info-label">角色：</div>
                <div className="user-info-modal-info-value">{User.roleName || "主账号"}</div>
              </div>
              <div className="user-info-modal-info-row">
                <div className="user-info-modal-info-label">密码：</div>
                <div className="user-info-modal-info-value">
                  <span className="user-info-modal-password-link" onClick={handleModifyPassword}>
                    修改密码
                  </span>
                </div>
              </div>
            </div>
          </Flex>
        </div>
      </Modal>

      <ChangePasswordModal
        open={showChangePasswordModal}
        onCancel={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          // 密码修改成功后的回调
        }}
      />
    </>
  );
};

export default UserInfoModal;
