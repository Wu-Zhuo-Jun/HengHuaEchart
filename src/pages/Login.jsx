import React, { useState, useEffect } from "react";
import { Language } from "../language/LocaleContext";
import { Checkbox, Input } from "antd";
import Http from "../config/Http";
import axios from "axios";
import $ from "jquery";
import cryptoJs from "crypto-js";
import { useUser } from "../context/UserContext";
import User from "../data/UserData";
import remAdapter from "../utils/rem";

import "./Login.css";
import { useNavigate } from "react-router-dom";
import loginContent from "../assets/images/login_content.webp";
import neutralLoginContent from "../assets/images/mingkebi_login_content.webp";
import mobileLoginBg from "../assets/images/moblie_login_bg.webp";
import neutralLoginBg from "../assets/images/mingkebi_moblie_login_bg.webp";
import Message from "../components/common/Message";
import useDeviceDetect from "../hooks/useDeviceDetect";

const Login = () => {
  const { isMobile, deviceType } = useDeviceDetect();
  const { setUserId } = useUser();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberPassword, setIsRememberPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(window.localStorage.getItem("user"));
    if (user) {
      setAccount(user.account);
      setPassword(user.password);
      setIsRememberPassword(true);
    }
  }, []);

  const onChangeAccount = (e) => {
    setAccount(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onClickLogin = () => {
    let param = {
      account: account,
      password: cryptoJs.MD5(password).toString(),
    };

    if (isRememberPassword) {
      window.localStorage.setItem("user", JSON.stringify({ account: account, password: password }));
    } else {
      window.localStorage.removeItem("user");
    }

    Http.login(param, (res) => {
      if (res.result == 1) {
        navigate("/");
        setUserId(User.userId);
      } else {
        Message.error(res.msg);
      }
    });
  };

  if (!deviceType) {
    return null;
  }

  // 判断是否为中性登录页
  const hostname = typeof window !== "undefined" ? window.location.host : "";
  const isNeutralDomain = hostname.includes("mingkebi");
  // const isNeutralDomain = hostname.includes("henghuayun.cn");
  const mobileBackground = isNeutralDomain ? neutralLoginBg : mobileLoginBg;
  const loginContentBackGround = isNeutralDomain ? neutralLoginContent : loginContent;
  if (isNeutralDomain) {
    window.localStorage.setItem("isNeutralDomain", "true");
  } else {
    window.localStorage.setItem("isNeutralDomain", "false");
  }

  if (deviceType === "mobile") {
    return (
      <div className="login-mobile" style={{ height: document.documentElement.clientHeight }}>
        <img className="login-mobile-bg" src={mobileBackground} alt="mobileLoginBg"></img>
        <div className="login-mobile-content">
          <img src={loginContentBackGround} alt="loginContent" />
          <div className="login-mobile-account-title">
            <div>{Language.ZHANGHAO}</div>
            <Input onChange={onChangeAccount} value={account} className="login-input" placeholder={Language.QINGSHURUZHANGHAO} />
          </div>
          <div className="login-mobile-pwd-title">
            <div>{Language.MIMA}</div>
            <Input.Password onChange={onChangePassword} value={password} className="login-input" placeholder={Language.QINGSHURUMIMA} />
          </div>
          <Checkbox checked={isRememberPassword} onChange={(e) => setIsRememberPassword(e.target.checked)} className="login-mobile-checkbox">
            {Language.JIZHUMIMA}
          </Checkbox>
          <div className="login-mobile-submit" onClick={onClickLogin}>
            {Language.DENGLU}
          </div>
        </div>
        <div className="ICP ICP_mobile">
          <a href="https://beian.miit.gov.cn/" target="_blank">
            CopyRight 2025 {isNeutralDomain ? null : <span>广州恒华科技有限公司</span>} 粤ICP备18155924号
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className={`login-bg ${isNeutralDomain ? "login-bg-neutral" : null}`}>
        <div className={`login-content ${isNeutralDomain ? "login-content-neutral" : null}`}>
          <Checkbox checked={isRememberPassword} onChange={(e) => setIsRememberPassword(e.target.checked)} className="login-checkbox">
            {Language.JIZHUMIMA}
          </Checkbox>
          <div className="login-account-title">{Language.ZHANGHAO}</div>
          <div className="login-pwd-title">{Language.MIMA}</div>
          <Input onChange={onChangeAccount} value={account} style={{ top: "154px", left: "115px" }} className="login-input" placeholder={Language.QINGSHURUZHANGHAO} />
          <Input.Password onChange={onChangePassword} value={password} style={{ top: "237px", left: "115px" }} className="login-input" placeholder={Language.QINGSHURUMIMA} />
          <div className="login-submit" onClick={onClickLogin}>
            {Language.DENGLU}
          </div>
        </div>
        <div className="ICP">
          <a href="https://beian.miit.gov.cn/" target="_blank">
            CopyRight 2025 {isNeutralDomain ? null : <span>广州恒华科技有限公司</span>} 粤ICP备18155924号
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
