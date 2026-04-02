import { useState, useLayoutEffect } from "react";

/**
 * 检测设备类型（移动端/桌面端）
 * @returns {{ isMobile: boolean, deviceType: "mobile" | "desktop" | null }} isMobile 是否为移动设备，deviceType 设备类型（null 表示正在检测）
 */
const useDeviceDetect = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [deviceType, setDeviceType] = useState(null); // 初始为 null，表示正在检测

  useLayoutEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent;
      const mobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry/.test(ua);
      const tablet = window.screen.width * 1.5 < window.screen.height;

      if (mobile || tablet) {
        setDeviceType("mobile");
        setIsMobile(true);
      } else {
        setDeviceType("desktop");
        setIsMobile(false);
      }
    };

    // 使用 useLayoutEffect 在 DOM 更新前同步执行检测，避免闪烁
    checkDevice();
  }, []);

  return { isMobile, deviceType };
};

export default useDeviceDetect;
