import React, { useState } from "react";
import { Modal, Button, Input, Form, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Http from "../../config/Http";
import User from "../../data/UserData";
import cryptoJs from "crypto-js";
import "./ChangePasswordModal.less";

const ChangePasswordModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    form.resetFields();
    onCancel?.();
  };

  // 阻止输入空格和特殊字符
  const handleKeyDown = (e) => {
    // 阻止空格键
    if (e.key === " " || e.key === "Space" || e.keyCode === 32) {
      e.preventDefault();
      return;
    }
    // 阻止 < > , 字符
    if (e.key === "<" || e.key === ">" || e.key === "," || e.keyCode === 188 || e.keyCode === 60 || e.keyCode === 62) {
      e.preventDefault();
      return;
    }
  };

  // 处理输入事件，过滤掉空格、中文和特殊字符
  const handleInput = (e, fieldName) => {
    const value = e.target.value;
    // 移除空格、中文、< > , 字符
    const filteredValue = value.replace(/[\s\u4e00-\u9fa5<>,]/g, "");
    if (value !== filteredValue) {
      // 更新表单字段值
      form.setFieldsValue({ [fieldName]: filteredValue });
    }
  };

  const logout = () => {
    User.logout();
    navigate("/login");
  };

  const handleConfirm = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      Http.setUserPassword(
        {
          oldPassword: cryptoJs.MD5(values.oldPassword).toString(),
          password: values.newPassword,
        },
        (res) => {
          setLoading(false);
          if (res.result == 1) {
            form.resetFields();
            onSuccess?.();
            onCancel?.();
            message.success({ content: "修改密码成功，请重新登录", duration: 3 });
            logout();
          } else {
            message.error({ content: res.msg || "修改密码失败", duration: 3 });
          }
        },
        null,
        (error) => {
          setLoading(false);
          message.error({ content: "修改密码失败，请稍后重试", duration: 3 });
        }
      );
    } catch (error) {
      // 表单验证失败
      console.log("表单验证失败:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title={
        <div className="change-password-modal-title">
          <span>修改密码</span>
          <CloseOutlined className="change-password-modal-close" onClick={handleCancel} />
        </div>
      }
      footer={null}
      width={720}
      className="change-password-modal"
      closable={false}>
      <div className="change-password-modal-content">
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label={<span>旧密码</span>}
            name="oldPassword"
            rules={[
              { required: true, message: "请输入旧密码" },
              { max: 64, message: "密码长度最多64位" },
              {
                pattern: /^[^\s\u4e00-\u9fa5<>,]+$/,
                message: "密码不能包含空格、中文和特殊字符(< > ,)",
              },
            ]}>
            <Input.Password placeholder="请输入旧密码" size="large" className="change-password-input" maxLength={64} onKeyDown={handleKeyDown} onInput={(e) => handleInput(e, "oldPassword")} />
          </Form.Item>

          <Form.Item
            label={<span>新密码</span>}
            name="newPassword"
            dependencies={["oldPassword"]}
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 8, message: "密码长度至少8位" },
              { max: 64, message: "密码长度最多64位" },
              {
                pattern: /^[^\s\u4e00-\u9fa5<>,]+$/,
                message: "密码不能包含空格、中文和特殊字符(< > ,)",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const oldPassword = getFieldValue("oldPassword");
                  if (!value || !oldPassword || value !== oldPassword) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("新密码不能与旧密码相同"));
                },
              }),
            ]}>
            <Input.Password placeholder="请输入新密码" size="large" className="change-password-input" maxLength={64} onKeyDown={handleKeyDown} onInput={(e) => handleInput(e, "newPassword")} />
          </Form.Item>

          <Form.Item
            label={<span>确认密码</span>}
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请再次输入新密码" },
              { max: 64, message: "密码长度最多64位" },
              {
                pattern: /^[^\s\u4e00-\u9fa5<>,]+$/,
                message: "密码不能包含空格、中文和特殊字符(< > ,)",
              },
              ({ getFieldValue }) => ({
                validator: (() => {
                  let timeout = null;
                  return (_, value) =>
                    new Promise((resolve, reject) => {
                      if (timeout) clearTimeout(timeout);
                      timeout = setTimeout(() => {
                        if (!value || getFieldValue("newPassword") === value) {
                          resolve();
                        } else {
                          reject(new Error("两次输入的密码不一致"));
                        }
                      }, 500);
                    });
                })(),
              }),
            ]}>
            <Input.Password placeholder="请再次输入新密码" size="large" className="change-password-input" maxLength={64} onKeyDown={handleKeyDown} onInput={(e) => handleInput(e, "confirmPassword")} />
          </Form.Item>
        </Form>

        <div className="change-password-modal-footer">
          <Button onClick={handleCancel}>取消</Button>
          <Button type="primary" onClick={handleConfirm} loading={loading}>
            确认
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangePasswordModal;
