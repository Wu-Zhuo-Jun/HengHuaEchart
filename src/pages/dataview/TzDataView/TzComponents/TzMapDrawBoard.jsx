import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import "./TzMapDrawBoard.less";
import { siteMap } from "../siteMap";
import TzMapImage from "@/assets/dataviewImages/TzMap.webp";

// 地图尺寸（与底图比例对应）
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const MIN_SCALE = 0.8;
const MAX_SCALE = 4;

export const TzMapDrawBoard = () => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // 生成随机坐标（基于地图尺寸比例）
  // const siteCoords = useMemo(() => {
  //   const coords = {};
  //   const siteIds = Object.keys(siteMap);
  //   siteIds.forEach((siteId) => {
  //     const x = Math.random() * 0.85 + 0.05;
  //     const y = Math.random() * 0.85 + 0.05;
  //     coords[siteId] = { x, y };
  //     // 更新 siteMap 中的坐标（浅拷贝）
  //     if (siteMap[siteId]) {
  //       siteMap[siteId].siteCoord = { x, y };
  //     }
  //   });
  //   return coords;
  // }, []);

  // 鼠标/触摸事件处理
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        posX: position.x,
        posY: position.y,
      };
    },
    [position]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));

      // 计算缩放中心点偏移
      const scaleDiff = newScale - scale;
      const offsetX = (mouseX - position.x) * (scaleDiff / scale);
      const offsetY = (mouseY - position.y) * (scaleDiff / scale);

      setScale(newScale);
      setPosition({
        x: position.x - offsetX,
        y: position.y - offsetY,
      });
    },
    [scale, position]
  );

  // 双击重置
  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 绑定全局鼠标事件
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging) return;
      const container = containerRef.current;
      if (!container) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      setPosition({
        x: dragStartRef.current.posX + deltaX,
        y: dragStartRef.current.posY + deltaY,
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging]);

  const containerStyle = {
    cursor: isDragging ? "grabbing" : "grab",
    userSelect: "none",
  };

  const mapContainerStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
    transformOrigin: "0 0",
  };

  return (
    <div
      ref={containerRef}
      className={`tz-map-drawboard ${isDragging ? "dragging" : ""}`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}>
      <div className="map-container" style={mapContainerStyle}>
        {/* 地图底图 */}
        <img className={`map-background ${imageLoaded ? "loaded" : "loading"}`} src={TzMapImage} alt="通州地图" onLoad={() => setImageLoaded(true)} />

        {/* 点位标记 */}
        {/* {imageLoaded &&
          Object.entries(siteCoords).map(([siteId, coord]) => (
            <div
              key={siteId}
              className="site-marker"
              style={{
                left: coord.x * MAP_WIDTH,
                top: coord.y * MAP_HEIGHT,
              }}
              title={siteMap[siteId]?.siteName}>
              <div className="site-marker-pulse" />
            </div>
          ))} */}
      </div>

      {/* 缩放控制按钮 */}
      {/* <div className="map-controls">
        <button
          className="map-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.min(MAX_SCALE, s + 0.2));
          }}>
          +
        </button>
        <span className="map-scale-label">{Math.round(scale * 100)}%</span>
        <button
          className="map-control-btn"
          onClick={(e) => {
            e.stopPropagation();
            setScale((s) => Math.max(MIN_SCALE, s - 0.2));
          }}>
          −
        </button>
        <button
          className="map-control-btn reset-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleDoubleClick();
          }}>
          重置
        </button>
      </div> */}
    </div>
  );
};
