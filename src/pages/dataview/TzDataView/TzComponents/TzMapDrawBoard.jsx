import React, { useState, useRef, useCallback, useMemo, useEffect, forwardRef } from "react";
import "./TzMapDrawBoard.less";
import { siteAllMap, siteTzTagTypeMap } from "../siteMap";
import CommonUtils from "@/utils/CommonUtils";
import TzMapImage from "@/assets/dataviewImages/TzMap.webp";
import CommunistPartyIcon from "@/assets/dataviewImages/communistPartyIcon.png";
import { ArrowUpOutlined } from "@ant-design/icons";
import { ArrowDownOutlined } from "@ant-design/icons";
import User from "@/data/UserData";

// 地图尺寸（与底图比例对应）
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const MIN_SCALE = 0.9;
const MAX_SCALE = 4;

export const TzMapDrawBoard = React.memo(
  forwardRef((props, ref) => {
    const { onSiteSelect, onSiteInfoSelect, onSiteClick, mapTotalInfo } = props;
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [levelSelected, setLevelSelected] = useState(null);
    const [typeSelected, setTypeSelected] = useState(null);
    const [selectedSiteId, setSelectedSiteId] = useState(null);
    const [highlightedSiteId, setHighlightedSiteId] = useState(null);
    const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
    const initializedRef = useRef(false);
    const lastClickTimeRef = useRef(0);
    const lastClickSiteRef = useRef(null);

    const userSiteIds = useMemo(() => new Set((User.sites || []).map((s) => Number(s.siteId))), [User.sites]);
    const siteMap = useMemo(() => {
      const filtered = {};
      Object.entries(siteAllMap).forEach(([id, site]) => {
        if (userSiteIds.has(site.siteId)) {
          filtered[id] = site;
        }
      });
      return filtered;
    }, [siteAllMap, userSiteIds]);

    // level 和 type 的 ID 映射
    const levelIdMap = { 区级: "1000", 街道级: "1001", 乡镇级: "1002", 园区级: "1003" };
    const typeIdMap = { 民生服务型: "1004", 文旅辐射型: "1005", 园区助企型: "1006", 乡村振兴型: "1007", 治理融合型: "1008" };

    // 从 siteMap 读取站点坐标，根据 levelSelected 和 typeSelected 筛选（AND 关系）
    const siteCoords = useMemo(() => {
      const coords = {};
      setSelectedSiteId(null);
      setHighlightedSiteId(null);
      onSiteClick(null, "clear");
      Object.entries(siteMap).forEach(([siteId, site]) => {
        if (!site.siteCoord) return;

        // 筛选条件：level 和 type 必须同时满足（如果有选择的话）
        const levelId = levelIdMap[levelSelected];
        const typeId = typeIdMap[typeSelected];

        const matchLevel = levelId ? site.typeIds && site.typeIds.includes(levelId) : true;
        const matchType = typeId ? site.typeIds && site.typeIds.includes(typeId) : true;

        if (matchLevel && matchType) {
          coords[siteId] = site.siteCoord;
        }
      });
      return coords;
    }, [levelSelected, typeSelected]);

    // 筛选站点并通知父组件
    useEffect(() => {
      const filteredSiteIds =
        Object.entries(siteMap)
          .filter(([siteId, site]) => {
            const levelId = levelIdMap[levelSelected];
            const typeId = typeIdMap[typeSelected];

            const matchLevel = levelId ? site.typeIds && site.typeIds.split(",").includes(levelId) : true;
            const matchType = typeId ? site.typeIds && site.typeIds.split(",").includes(typeId) : true;

            return matchLevel && matchType;
          })
          .map(([siteId, site]) => site) ?? [];
      onSiteSelect?.(filteredSiteIds);
      console.log(filteredSiteIds, 75);

      onSiteInfoSelect?.(filteredSiteIds);
    }, [levelSelected, typeSelected]);

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

    // 绑定 wheel 事件（使用 passive: false 以支持 preventDefault）
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const wheelHandler = (e) => {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta));

        const scaleDiff = newScale - scale;
        const offsetX = (mouseX - position.x) * (scaleDiff / scale);
        const offsetY = (mouseY - position.y) * (scaleDiff / scale);

        setScale(newScale);
        setPosition({
          x: position.x - offsetX,
          y: position.y - offsetY,
        });
      };

      container.addEventListener("wheel", wheelHandler, { passive: false });
      return () => {
        container.removeEventListener("wheel", wheelHandler);
      };
    }, [scale, position]);

    // 图片加载完成后自适应容器
    useEffect(() => {
      const OFFSET_RATIO = 0.1;
      if (!imageLoaded || initializedRef.current) return;
      if (containerSize.width === 0 || containerSize.height === 0) return;

      // 计算自适应缩放比例，使地图完整显示在容器内并留有边距
      const scaleX = (containerSize.width * 1.02) / MAP_WIDTH;
      const scaleY = (containerSize.height * 1.02) / MAP_HEIGHT;
      const fitScale = Math.min(scaleX, scaleY, 1.5);

      // 计算居中偏移量
      const offsetX = (containerSize.width - MAP_WIDTH * fitScale) / 2 + containerSize.width * OFFSET_RATIO;
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

    // 处理站点点击事件（区分单击和双击）
    const handleSiteClick = useCallback(
      (siteId, e) => {
        e.stopPropagation();
        const site = siteMap[siteId];
        if (!site) return;

        const now = Date.now();
        const timeDiff = now - lastClickTimeRef.current;

        // 双击判断：300ms 内连续点击同一站点
        if (timeDiff < 300 && lastClickSiteRef.current === siteId) {
          // 双击：将站点保存到 infoSelectSiteLIst 和 selectSiteList，并高亮显示
          setSelectedSiteId(siteId);
          setHighlightedSiteId(siteId);
          onSiteClick?.(site, "double");
          lastClickTimeRef.current = 0;
          lastClickSiteRef.current = null;
        } else {
          // 单击：判断是否取消选中（再次单击已选中的站点）
          if (selectedSiteId === siteId) {
            // 取消选中
            setSelectedSiteId(null);
            setHighlightedSiteId(null);
            const filteredSiteIds =
              Object.entries(siteMap)
                .filter(([siteId, site]) => {
                  const levelId = levelIdMap[levelSelected];
                  const typeId = typeIdMap[typeSelected];

                  const matchLevel = levelId ? site.typeIds && site.typeIds.split(",").includes(levelId) : true;
                  const matchType = typeId ? site.typeIds && site.typeIds.split(",").includes(typeId) : true;

                  return matchLevel && matchType;
                })
                .map(([siteId, site]) => site) ?? [];

            onSiteSelect?.(filteredSiteIds);
            onSiteInfoSelect?.(filteredSiteIds);
            onSiteClick?.(filteredSiteIds, "clear");
          } else {
            // 选中该站点
            setSelectedSiteId(siteId);
            setHighlightedSiteId(null);
            onSiteClick?.(site, "single");
          }
          lastClickTimeRef.current = now;
          lastClickSiteRef.current = siteId;
        }
      },
      [onSiteClick, selectedSiteId, levelSelected, typeSelected]
    );

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ touchAction: "none", ...containerStyle }}>
        <div className="map-info">
          <div className="map-info-title">
            <img src={CommunistPartyIcon} alt="map-info-title" />
            {selectedSiteId ? (
              <div className="map-info-title-text">{siteMap[selectedSiteId].siteName}</div>
            ) : (
              <>
                {!levelSelected && !typeSelected && <div className="map-info-title-text">全区</div>}
                {levelSelected && <div className="map-info-title-text">{levelSelected}-</div>}
                {typeSelected && <div className="map-info-title-text">{typeSelected}-</div>}
                <div className="map-info-title-text">服务中心总览</div>
              </>
            )}
          </div>
          <div className="map-info-content">
            <div className="map-info-content-item">
              <div className="title">今日服务人次</div>
              <div className="value"> {CommonUtils.formatNumberToUnit(mapTotalInfo.todayCount).fullText}</div>
              <div className="rate" style={mapTotalInfo.todayCountRate >= 0 ? { color: "#00FF00" } : { color: "#FF0000" }}>
                <span style={{ color: "#fff" }}> 环比:</span>
                {mapTotalInfo.todayCountRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {mapTotalInfo.todayCountRate}%
              </div>
            </div>
            <div className="map-info-content-item">
              <div className="title">本月服务人次</div>
              <div className="value"> {CommonUtils.formatNumberToUnit(mapTotalInfo.thisMonthCount).fullText}</div>
              <div className="rate" style={mapTotalInfo.thisMonthCountRate >= 0 ? { color: "#00FF00" } : { color: "#FF0000" }}>
                <span style={{ color: "#fff" }}> 环比:</span>
                {mapTotalInfo.thisMonthCountRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {mapTotalInfo.thisMonthCountRate}%
              </div>
            </div>
            <div className="map-info-content-item">
              <div className="title">年度服务人次</div>
              <div className="value"> {CommonUtils.formatNumberToUnit(mapTotalInfo.thisYearCount).fullText}</div>
              <div className="rate" style={mapTotalInfo.thisYearCountRate >= 0 ? { color: "#00FF00" } : { color: "#FF0000" }}>
                <span style={{ color: "#fff" }}> 环比:</span>
                {mapTotalInfo.thisYearCountRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {mapTotalInfo.thisYearCountRate}%
              </div>
            </div>
          </div>
          <div className="map-info-content">
            <div className="map-info-content-item">
              <div className="title">今日服务人数</div>
              <div className="value"> {CommonUtils.formatNumberToUnit(mapTotalInfo.todayNum).fullText}</div>
              <div className="rate" style={mapTotalInfo.todayNumRate >= 0 ? { color: "#00FF00" } : { color: "#FF0000" }}>
                <span style={{ color: "#fff" }}> 环比:</span>
                {mapTotalInfo.todayNumRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {mapTotalInfo.todayNumRate}%
              </div>
            </div>
            <div className="map-info-content-item">
              <div className="title">本月服务人数</div>
              <div className="value"> {CommonUtils.formatNumberToUnit(mapTotalInfo.thisMonthNum).fullText}</div>
              <div className="rate" style={mapTotalInfo.thisMonthNumRate >= 0 ? { color: "#00FF00" } : { color: "#FF0000" }}>
                <span style={{ color: "#fff" }}> 环比:</span>
                {mapTotalInfo.thisMonthNumRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {mapTotalInfo.thisMonthNumRate}%
              </div>
            </div>
            <div className="map-info-content-item">
              <div className="title">年度服务人数</div>
              <div className="value"> {CommonUtils.formatNumberToUnit(mapTotalInfo.thisYearNum).fullText}</div>
              <div className="rate" style={mapTotalInfo.thisYearNumRate >= 0 ? { color: "#00FF00" } : { color: "#FF0000" }}>
                <span style={{ color: "#fff" }}> 环比:</span>
                {mapTotalInfo.thisYearNumRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {mapTotalInfo.thisYearNumRate}%
              </div>
            </div>
          </div>
        </div>
        {/* 顶部右侧横向按钮组 */}
        <div className="map-toolbar map-toolbar-horizontal">
          {["区级", "街道级", "乡镇级", "园区级"].map((level) => (
            <div key={level} className={`map-toolbar-h-btn ${levelSelected === level ? "selected" : ""}`} onClick={() => setLevelSelected(levelSelected === level ? null : level)}>
              {level}
            </div>
          ))}
        </div>

        {/* 右侧垂直按钮组 */}
        <div className="map-toolbar map-toolbar-vertical">
          {["民生服务型", "文旅辐射型", "园区助企型", "乡村振兴型", "治理融合型"].map((type) => (
            <div key={type} className={`map-toolbar-v-btn ${typeSelected === type ? "selected" : ""}`} onClick={() => setTypeSelected(typeSelected === type ? null : type)}>
              {type}
            </div>
          ))}
        </div>

        <div className="map-container" style={mapContainerStyle}>
          {/* 地图底图 */}
          <img className={`map-background ${imageLoaded ? "loaded" : "loading"}`} src={TzMapImage} alt="通州地图" onLoad={() => setImageLoaded(true)} />

          {/* 点位标记 */}
          {imageLoaded &&
            Object.entries(siteCoords).map(([siteId, coord]) => {
              const site = siteMap[siteId];
              const isSelected = selectedSiteId === Number(siteId);
              const isHighlighted = highlightedSiteId === Number(siteId);
              return (
                <div
                  key={siteId}
                  className="site-marker"
                  style={{
                    left: (coord.x * MAP_WIDTH) / 10000,
                    top: (coord.y * MAP_HEIGHT) / 10000,
                    transform: isSelected ? "translate(-50%, -50%) scale(1.5)" : "translate(-50%, -50%)",
                    background: isSelected ? "linear-gradient(135deg, #ffff00, #ff8800)" : isHighlighted ? "linear-gradient(135deg, #00ff00, #00aa00)" : "linear-gradient(135deg, #00ffff, #0088ff)",
                    boxShadow: isSelected
                      ? "0 0 12px rgba(255, 255, 0, 0.9), 0 0 24px rgba(255, 136, 0, 0.7)"
                      : isHighlighted
                      ? "0 0 12px rgba(0, 255, 0, 0.9), 0 0 24px rgba(0, 170, 0, 0.7)"
                      : "0 0 8px rgba(0, 255, 255, 0.8), 0 0 16px rgba(0, 136, 255, 0.5)",
                  }}
                  title={site?.siteName}
                  onClick={(e) => handleSiteClick(Number(siteId), e)}>
                  <div className="site-marker-pulse" />
                </div>
              );
            })}
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
  })
);
