import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const ScrollContext = createContext(null);

/**
 * ScrollContext Provider
 * 用于管理 Header 阴影状态，允许子页面注册自己的滚动容器
 */
export const ScrollProvider = ({ children }) => {
  const [hasShadow, setHasShadow] = useState(false);
  const currentScrollElement = useRef(null);
  const scrollHandlerRef = useRef(null);

  // 创建滚动处理函数
  const createScrollHandler = useCallback((threshold = 10) => {
    return () => {
      const element = currentScrollElement.current;
      if (element) {
        const scrollTop = element.scrollTop || 0;
        setHasShadow(scrollTop > threshold);
      }
    };
  }, []);

  // 注册滚动容器
  const registerScrollContainer = useCallback(
    (element, threshold = 10) => {
      // 清理旧的监听器
      if (currentScrollElement.current && scrollHandlerRef.current) {
        currentScrollElement.current.removeEventListener("scroll", scrollHandlerRef.current);
      }

      // 设置新的滚动元素
      currentScrollElement.current = element;

      if (element) {
        // 创建新的滚动处理函数
        const handler = createScrollHandler(threshold);
        scrollHandlerRef.current = handler;

        // 添加监听器
        element.addEventListener("scroll", handler, { passive: true });

        // 立即检查一次初始状态
        handler();
      } else {
        scrollHandlerRef.current = null;
        setHasShadow(false);
      }
    },
    [createScrollHandler]
  );

  // 清理函数
  useEffect(() => {
    return () => {
      if (currentScrollElement.current && scrollHandlerRef.current) {
        currentScrollElement.current.removeEventListener("scroll", scrollHandlerRef.current);
      }
    };
  }, []);

  return (
    <ScrollContext.Provider
      value={{
        hasShadow,
        registerScrollContainer,
      }}>
      {children}
    </ScrollContext.Provider>
  );
};

/**
 * Hook to use ScrollContext
 */
export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within ScrollProvider");
  }
  return context;
};
