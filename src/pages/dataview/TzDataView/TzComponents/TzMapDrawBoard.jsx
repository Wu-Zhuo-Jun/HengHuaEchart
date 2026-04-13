import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import "./TzMapDrawBoard.less";
import { siteMap } from "../siteMap";
import TzMapImage from "@/assets/dataviewImages/TzMap.webp";
import CommunistPartyIcon from "@/assets/dataviewImages/communistPartyIcon.png";

// 地图尺寸（与底图比例对应）
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const MIN_SCALE = 0.5;
const MAX_SCALE = 4;

export const TzMapDrawBoard = () => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [levelSelected, setLevelSelected] = useState(null);
  const [typeSelected, setTypeSelected] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const initializedRef = useRef(false);

  // 从 siteMap 读取站点坐标
  const siteCoords = useMemo(() => {
    const coords = {};
    Object.entries(siteMap).forEach(([siteId, site]) => {
      if (site.siteCoord) {
        coords[siteId] = site.siteCoord;
      }
    });
    return coords;
  }, []);

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
    [position],
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
    [isDragging],
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
    [scale, position],
  );

  // 监听容器尺寸变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 图片加载完成后自适应容器
  useEffect(() => {
    if (!imageLoaded || initializedRef.current) return;
    if (containerSize.width === 0 || containerSize.height === 0) return;

    // 计算自适应缩放比例，使地图完整显示在容器内并留有边距
    const scaleX = (containerSize.width * 1) / MAP_WIDTH;
    const scaleY = (containerSize.height * 1) / MAP_HEIGHT;
    const fitScale = Math.min(scaleX, scaleY, 1.5);

    // 计算居中偏移量
    const offsetX = (containerSize.width - MAP_WIDTH * fitScale) / 2;
    const offsetY = (containerSize.height - MAP_HEIGHT * fitScale) / 2;

    setScale(fitScale);
    setPosition({ x: offsetX, y: offsetY });
    initializedRef.current = true;
  }, [imageLoaded, containerSize]);

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
    >
      <div className="map-info">
        <div className="map-info-title">
          <img src={CommunistPartyIcon} alt="map-info-title" />
          <div className="map-info-title-text">街道级-</div>
          <div className="map-info-title-text">街道级-</div>
          <div className="map-info-title-text">服务中心总览</div>
        </div>
        <div className="map-info-content">
          <div className="map-info-content-item">
            <div className="title">今日服务人次</div>
            <div className="value">100</div>
            <div className="rate">环比:</div>
          </div>
          <div className="map-info-content-item">
            <div className="title">本月服务人次</div>
            <div className="value">100</div>
            <div className="rate">环比:</div>
          </div>
          <div className="map-info-content-item">
            <div className="title">年度服务人次</div>
            <div className="value">100</div>
            <div className="rate">环比:</div>
          </div>
        </div>
        <div className="map-info-content">
          <div className="map-info-content-item">
            <div className="title">今日服务人数</div>
            <div className="value">100</div>
            <div className="rate">环比:</div>
          </div>
          <div className="map-info-content-item">
            <div className="title">本月服务人数</div>
            <div className="value">100</div>
            <div className="rate">环比:</div>
          </div>
          <div className="map-info-content-item">
            <div className="title">年度服务人数</div>
            <div className="value">100</div>
            <div className="rate">环比:</div>
          </div>
        </div>
      </div>
      {/* 顶部右侧横向按钮组 */}
      <div className="map-toolbar map-toolbar-horizontal">
        {["区级", "街道级", "乡镇级", "园区级"].map((level) => (
          <div
            key={level}
            className={`map-toolbar-h-btn ${levelSelected === level ? "selected" : ""}`}
            onClick={() => setLevelSelected(levelSelected === level ? null : level)}
          >
            {level}
          </div>
        ))}
      </div>

      {/* 右侧垂直按钮组 */}
      <div className="map-toolbar map-toolbar-vertical">
        {["民生服务型", "文旅辐射型", "园区助企型", "乡村振兴型", "治理融合型"].map((type) => (
          <div
            key={type}
            className={`map-toolbar-v-btn ${typeSelected === type ? "selected" : ""}`}
            onClick={() => setTypeSelected(typeSelected === type ? null : type)}
          >
            {type}
          </div>
        ))}
      </div>

      <div className="map-container" style={mapContainerStyle}>
        {/* 地图底图 */}
        <img className={`map-background ${imageLoaded ? "loaded" : "loading"}`} src={TzMapImage} alt="通州地图" onLoad={() => setImageLoaded(true)} />

        {/* 点位标记 */}
        {imageLoaded &&
          Object.entries(siteCoords).map(([siteId, coord]) => (
            <div
              key={siteId}
              className="site-marker"
              style={{
                left: (coord.x * MAP_WIDTH) / 10000,
                top: (coord.y * MAP_HEIGHT) / 10000,
              }}
              title={siteMap[siteId]?.siteName}
            >
              <div className="site-marker-pulse" />
            </div>
          ))}
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
