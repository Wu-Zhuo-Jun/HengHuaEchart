import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import zhCN from "antd/locale/zh_CN";
import en_US from "antd/locale/en_US";
import { ConfigProvider } from "antd";
import "dayjs/locale/zh-cn";
import "./utils/rem";
import dayjs from "dayjs";
// 配置dayjs格式默认为中文
dayjs.locale("zh-cn");

import { SiteProvider } from "./context/SiteContext";
import { UserProvider } from "./context/UserContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <SiteProvider>
        <ConfigProvider locale={zhCN}>
          <App />
        </ConfigProvider>
      </SiteProvider>
    </UserProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
