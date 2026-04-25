import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Flex, Input, Modal, Radio, Select, Spin, Switch, Tabs, message } from "antd";
import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import Empty from "@/components/common/Empty";
import Message from "@/components/common/Message";
import Http from "@/config/Http";
import "./CreatePlanGraphPage.less";

const CLOSE_THRESHOLD = 12;
const CLOSE_POINT_COUNT = 3;
const DRAG_RADIUS = 10;

let mappingIdCounter = Date.now();

const CreatePlanGraphPage = ({ site, region, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imageContainerSize, setImageContainerSize] = useState({ width: 0, height: 0 });

  const [doorMappings, setDoorMappings] = useState([]);
  const [hotspotMappings, setHotspotMappings] = useState([]);

  // 编辑模式 none | draw(新增绘制) | drag(拖拽点)
  const [editMode, setEditMode] = useState("none");
  // 绘制中新建单元的草稿
  const [draftTitle, setDraftTitle] = useState(null);
  const [draftPoints, setDraftPoints] = useState([]);
  // 拖拽模式下，正在拖拽的单元 id
  const [dragMappingId, setDragMappingId] = useState(null);
  // 拖拽时鼠标是否按下
  const isDragging = useRef(false);
  const dragPointIndex = useRef(-1);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOrigPoints = useRef([]);

  // 侧边栏
  const [activeTab, setActiveTab] = useState("door");
  const [showAll, setShowAll] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMappingName, setAddMappingName] = useState("");
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [allDoors, setAllDoors] = useState([]);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const filteredDoors = useCallback(
    (doorType) => {
      if (doorType === undefined) return [];
      return allDoors.filter((d) => d.doorType === doorType);
    },
    [allDoors]
  );

  const getAvailableDoors = useCallback(
    (selfId, doorType) => {
      const takenIds = doorMappings
        .filter((m) => m.id !== selfId && m.doorId != null && m.doorType === doorType)
        .map((m) => m.doorId);
      return filteredDoors(doorType).filter((d) => !takenIds.includes(d.id));
    },
    [doorMappings, filteredDoors]
  );

  // 页面挂载：加载已保存映射
  useEffect(() => {
    if (!site?.siteId || !region?.areaId) return;
    setSidebarLoading(true);
    Http.getAreaMapping(
      { siteId: site.siteId, areaId: region.areaId },
      (res) => {
        setSidebarLoading(false);
        if (res.result === 1 && res.data) {
          if (res.data.imgUrl) setImageUrl(res.data.imgUrl);
          if (Array.isArray(res.data.mapping)) {
            setDoorMappings(
              res.data.mapping
                .filter((m) => m.type === 2)
                .map((m, idx) => ({
                  id: m.id ?? `dm-${idx}`,
                  title: m.title ?? m.doorName ?? "",
                  doorId: m.doorId ?? null,
                  doorName: m.doorName ?? m.title ?? "",
                  doorType: m.doorType ?? 0,
                  visible: true,
                  points: m.points ?? [],
                }))
            );
            setHotspotMappings(res.data.mapping.filter((m) => m.type === 1));
          }
        }
      },
      null,
      () => setSidebarLoading(false)
    );
  }, [site?.siteId, region?.areaId]);

  // 加载出入口列表
  useEffect(() => {
    if (!site?.siteId || !region?.areaId) return;
    Http.getAreaDoors(
      { siteId: site.siteId, areaId: region.areaId, state: -1, page: 1, limit: 999 },
      (res) => {
        if (res.result === 1) {
          const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
          setAllDoors(list);
        }
      }
    );
  }, [site?.siteId, region?.areaId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setImageContainerSize({ width, height });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = imageContainerSize;
    const canvas = canvasRef.current;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    redraw(ctx, width, height);
  }, [imageContainerSize, doorMappings, hotspotMappings, draftTitle, draftPoints, imageUrl, dragMappingId, editMode]);

  const toRelative = (clientX, clientY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  };

  const toAbsolute = (rel, width, height) => ({ x: rel.x * width, y: rel.y * height });

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  const centroid = (points) => {
    const n = points.length;
    if (n === 0) return { x: 0, y: 0 };
    const cx = points.reduce((s, p) => s + p.x, 0) / n;
    const cy = points.reduce((s, p) => s + p.y, 0) / n;
    return { x: cx, y: cy };
  };

  const drawPoint = (ctx, x, y, fill, radius = 5) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  };

  // 查找距离最近的映射点
  const findNearestPoint = (rel, allMappings, width, height) => {
    let minDist = Infinity;
    let foundMapping = null;
    let foundIndex = -1;
    const radius = DRAG_RADIUS / Math.max(width, height);
    for (const mapping of allMappings) {
      if (!showAll && mapping.visible === false) continue;
      const pts = mapping.points || [];
      for (let i = 0; i < pts.length; i++) {
        const d = dist(rel, pts[i]);
        if (d < radius && d < minDist) {
          minDist = d;
          foundMapping = mapping;
          foundIndex = i;
        }
      }
    }
    return { mapping: foundMapping, pointIndex: foundIndex };
  };

  const redraw = (ctx, width, height) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    const allMappings = [...doorMappings, ...hotspotMappings];

    // 拖拽模式下，找到当前映射的闭合多边形
    const dragMapping = dragMappingId ? allMappings.find((m) => m.id === dragMappingId) : null;

    for (const mapping of allMappings) {
      if (!showAll && mapping.visible === false) continue;
      const pts = mapping.points?.map((p) => toAbsolute(p, width, height));
      if (!pts || pts.length < 2) continue;

      const isDraggingMapping = mapping.id === dragMappingId;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = isDraggingMapping ? "rgba(24, 144, 255, 0.2)" : "rgba(255, 0, 0, 0.15)";
      ctx.fill();
      ctx.strokeStyle = isDraggingMapping ? "#1890ff" : "#ff4d4f";
      ctx.lineWidth = isDraggingMapping ? 3 : 2;
      ctx.stroke();

      const c = centroid(pts);
      ctx.font = `bold ${Math.max(12, Math.min(16, width / 30))}px sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 3;
      const label = mapping.doorName || mapping.title;
      ctx.strokeText(label, c.x, c.y);
      ctx.fillText(label, c.x, c.y);

      drawPoint(ctx, pts[0].x, pts[0].y, isDraggingMapping ? "#1890ff" : "#ff4d4f", 5);
      for (let i = 1; i < pts.length; i++) {
        const isDragPoint = isDraggingMapping && dragMapping && dragPointIndex.current === i;
        drawPoint(ctx, pts[i].x, pts[i].y, isDragPoint ? "#1890ff" : "#ffffff", 4);
      }
    }

    // 绘制草稿（新增模式）
    if (draftTitle && draftPoints.length > 0) {
      const pts = draftPoints.map((p) => toAbsolute(p, width, height));
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      for (let i = 0; i < pts.length; i++) {
        drawPoint(ctx, pts[i].x, pts[i].y, i === 0 ? "#1890ff" : "#ffffff", 5);
      }
    }
  };

  // ---- Canvas 鼠标事件 ----
  const handleCanvasMouseDown = useCallback(
    (e) => {
      if (!canvasRef.current) return;
      const { width, height } = imageContainerSize;
      if (width === 0 || height === 0) return;
      const rel = toRelative(e.clientX, e.clientY, canvasRef.current);

      // 拖拽模式：查找最近点
      if (editMode === "drag" && dragMappingId !== null) {
        const allMappings = [...doorMappings, ...hotspotMappings];
        const { mapping, pointIndex } = findNearestPoint(rel, allMappings, width, height);
        if (mapping && mapping.id === dragMappingId && pointIndex >= 0) {
          isDragging.current = true;
          dragPointIndex.current = pointIndex;
          dragStartPos.current = rel;
          const m = allMappings.find((m) => m.id === dragMappingId);
          dragOrigPoints.current = m ? [...(m.points || [])] : [];
          e.preventDefault();
          return;
        }
      }

      // 绘制模式：点击添加点
      if (editMode === "draw" && draftTitle) {
        const pts = [...draftPoints, rel];
        if (pts.length >= CLOSE_POINT_COUNT && dist(rel, pts[0]) < CLOSE_THRESHOLD / Math.max(width, height)) {
          const finalPoints = pts.slice(0, -1);
          // 绘制完成，自动创建映射单元并切换到拖拽模式
          const newMapping = {
            id: `dm-${mappingIdCounter++}`,
            title: draftTitle,
            doorId: null,
            doorName: "",
            doorType: null,
            visible: true,
            points: finalPoints,
          };
          setDoorMappings((prev) => [...prev, newMapping]);
          setDraftTitle(null);
          setDraftPoints([]);
          setDragMappingId(newMapping.id);
          setEditMode("drag");
          message.success({ content: "映射绘制完成，可拖动点微调" });
          return;
        }
        setDraftPoints(pts);
      }
    },
    [editMode, dragMappingId, draftTitle, draftPoints, doorMappings, hotspotMappings, imageContainerSize]
  );

  const handleCanvasMouseMove = useCallback(
    (e) => {
      if (!isDragging.current || editMode !== "drag" || dragMappingId === null) return;
      if (!canvasRef.current) return;
      const { width, height } = imageContainerSize;
      if (width === 0 || height === 0) return;
      const rel = toRelative(e.clientX, e.clientY, canvasRef.current);
      const idx = dragPointIndex.current;
      const orig = dragOrigPoints.current;
      if (idx < 0 || idx >= orig.length) return;

      const deltaX = rel.x - dragStartPos.current.x;
      const deltaY = rel.y - dragStartPos.current.y;

      const updateMapping = (prev) =>
        prev.map((m) => {
          if (m.id !== dragMappingId) return m;
          const newPoints = orig.map((p, i) => (i === idx ? { x: p.x + deltaX, y: p.y + deltaY } : p));
          return { ...m, points: newPoints };
        });

      if (editMode === "drag") {
        setDoorMappings(updateMapping);
      }
    },
    [editMode, dragMappingId, imageContainerSize]
  );

  const handleCanvasMouseUp = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      dragPointIndex.current = -1;
      dragOrigPoints.current = [];
    }
  }, []);

  // 取消绘制（新增模式）
  const handleCancelDraft = () => {
    setDraftTitle(null);
    setDraftPoints([]);
    setEditMode("none");
  };

  // 退出拖拽模式
  const handleExitDrag = () => {
    setDragMappingId(null);
    setEditMode("none");
  };

  // 新增映射：弹窗确认后直接进入绘制模式
  const handleAddMapping = () => {
    const name = addMappingName.trim();
    if (!name) {
      message.warning({ content: "请输入映射名称" });
      return;
    }
    setDraftTitle(name);
    setDraftPoints([]);
    setEditMode("draw");
    setAddModalOpen(false);
    setAddMappingName("");
  };

  // 统计类型变化
  const handleDoorTypeChange = (id, doorType) => {
    setDoorMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, doorType, doorId: null, doorName: "", points: [] } : m))
    );
  };

  // 出入口 Select 变化
  const handleDoorChange = (id, doorId) => {
    const door = allDoors.find((d) => d.id === doorId);
    setDoorMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, doorId, doorName: door?.doorName ?? "" } : m))
    );
  };

  // 显示开关变化
  const handleVisibleChange = (id, visible) => {
    setDoorMappings((prev) => prev.map((m) => (m.id === id ? { ...m, visible } : m)));
  };

  // 编辑：进入拖拽模式
  const handleEditMapping = (mapping) => {
    if (!mapping.points || mapping.points.length < 2) {
      message.warning({ content: "请先完成绘制" });
      return;
    }
    setDragMappingId(mapping.id);
    setEditMode("drag");
  };

  // 删除单元
  const handleDeleteMapping = (id) => {
    if (editMode === "drag" && dragMappingId === id) {
      handleExitDrag();
    }
    setDoorMappings((prev) => prev.filter((m) => m.id !== id));
  };

  const handleConfig = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["png", "jpg", "jpeg"].includes(ext)) {
      message.error({ content: "仅支持 PNG、JPG、JPEG 格式" });
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setUploadedFile(file);
  };

  const handleSave = () => {
    setSaveLoading(true);
    const formData = new FormData();
    formData.append("siteId", site.siteId);
    formData.append("areaId", region.areaId);
    if (uploadedFile) {
      formData.append("img", uploadedFile);
    }
    const allMappings = [
      ...doorMappings.map((m) => ({ ...m, type: 2 })),
      ...hotspotMappings.map((m) => ({ ...m, type: 1 })),
    ];
    formData.append("data", JSON.stringify(allMappings));
    Http.setAreaMappingFile(
      formData,
      (res) => {
        setSaveLoading(false);
        if (res.result === 1) {
          Message.success("保存成功");
          onClose();
        } else {
          message.error({ content: res.msg || "保存失败" });
        }
      },
      null,
      () => {
        message.error({ content: "网络请求失败" });
        setSaveLoading(false);
      }
    );
  };

  const canSave = editMode === "none";
  const hasImage = !!imageUrl;

  const getCursor = () => {
    if (editMode === "draw") return "crosshair";
    if (editMode === "drag") return "move";
    return "default";
  };

  // ---- 出入口映射 Tab 内容 ----
  const renderDoorTab = () => {
    if (sidebarLoading) {
      return (
        <Flex align="center" justify="center" style={{ padding: 24 }}>
          <Spin size="small" />
        </Flex>
      );
    }
    return (
      <Flex vertical style={{ height: "100%" }}>
        {/* 工具栏 */}
        <Flex align="center" justify="space-between" style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            className="btn-primary"
            disabled={editMode !== "none" || !hasImage}
            onClick={() => {
              if (!hasImage) {
                message.warning({ content: "请先在「平面图配置」中上传平面图" });
                return;
              }
              setAddModalOpen(true);
            }}>
            新增映射
          </Button>
          <Flex align="center" gap={6}>
            <span style={{ fontSize: 12, color: "#888" }}>显示全部</span>
            <Switch size="small" checked={showAll} onChange={setShowAll} />
          </Flex>
        </Flex>

        {/* 列表 */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {doorMappings.length === 0 ? (
            <div className="plan-graph-sidebar-empty">暂无映射单元，请点击上方新增</div>
          ) : (
            doorMappings.map((m) => {
              const available = getAvailableDoors(m.id, m.doorType ?? 0);
              const availableExt = getAvailableDoors(m.id, 1);
              const noDoorType = m.doorType === null || m.doorType === undefined;
              // 只有闭合图形后才可用
              const isClosed = m.points && m.points.length >= CLOSE_POINT_COUNT;
              const isDraggingThis = editMode === "drag" && dragMappingId === m.id;

              return (
                <div key={m.id} style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0", background: "#fff" }}>
                  {/* 单元头部 */}
                  <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{m.title}</span>
                    <Flex align="center" gap={4}>
                      <Switch
                        size="small"
                        checked={m.visible}
                        onChange={(v) => handleVisibleChange(m.id, v)}
                        checkedChildren="显"
                        unCheckedChildren="隐"
                      />
                      <Button
                        type="link"
                        size="small"
                        disabled={!isClosed || editMode !== "none"}
                        onClick={() => handleEditMapping(m)}>
                        {isDraggingThis ? "拖拽中" : "编辑"}
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        danger
                        disabled={editMode === "drag" && dragMappingId === m.id}
                        onClick={() => handleDeleteMapping(m.id)}>
                        删除
                      </Button>
                    </Flex>
                  </Flex>

                  {/* 统计类型 Radio */}
                  <Flex align="center" gap={12} style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: noDoorType ? "#bfbfbf" : "#888" }}>统计类型：</span>
                    <Radio.Group
                      size="small"
                      value={m.doorType}
                      disabled={!isClosed}
                      onChange={(e) => handleDoorTypeChange(m.id, e.target.value)}>
                      <Radio.Button value={0}>入区计数</Radio.Button>
                      <Radio.Button value={1}>外部计数</Radio.Button>
                    </Radio.Group>
                  </Flex>

                  {/* 出入口 Select */}
                  <Flex align="center" gap={8}>
                    <span style={{ fontSize: 12, color: noDoorType ? "#bfbfbf" : "#888", flexShrink: 0 }}>映射出入口：</span>
                    <Select
                      size="small"
                      style={{ flex: 1, minWidth: 0 }}
                      placeholder={noDoorType ? "请先选统计类型" : isClosed ? "请选择出入口" : "请先完成绘制"}
                      disabled={!isClosed || noDoorType}
                      allowClear
                      value={m.doorId}
                      onChange={(v) => handleDoorChange(m.id, v)}
                      options={noDoorType ? [] : (m.doorType === 0 ? available : availableExt).map((d) => ({
                        value: d.id,
                        label: d.doorName || d.title || "未命名",
                      }))}
                    />
                  </Flex>

                  {/* 映射状态提示 */}
                  <div style={{ fontSize: 11, color: isClosed ? "#52c41a" : "#bfbfbf", marginTop: 4 }}>
                    {isClosed ? `已映射（${m.points.length} 点）` : "未映射"}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Flex>
    );
  };

  // ---- 热区映射 Tab 内容（占位）----
  const renderHotspotTab = () => {
    if (sidebarLoading) {
      return (
        <Flex align="center" justify="center" style={{ padding: 24 }}>
          <Spin size="small" />
        </Flex>
      );
    }
    return (
      <Flex vertical style={{ height: "100%" }}>
        <Flex align="center" justify="space-between" style={{ padding: "8px 12px", borderBottom: "1px solid #f0f0f0" }}>
          <span style={{ fontSize: 12, color: "#888" }}>热区映射（待开发）</span>
          <Flex align="center" gap={6}>
            <span style={{ fontSize: 12, color: "#888" }}>显示全部</span>
            <Switch size="small" checked={showAll} onChange={setShowAll} />
          </Flex>
        </Flex>
        <div style={{ padding: 16, color: "#bfbfbf", fontSize: 12 }}>热区映射功能开发中</div>
      </Flex>
    );
  };

  const getTipText = () => {
    if (editMode === "draw") {
      return (
        <>
          正在绘制：{draftTitle}（{draftPoints.length} 点，已{" "}
          {draftPoints.length >= CLOSE_POINT_COUNT ? "可" : "需 " + (CLOSE_POINT_COUNT - draftPoints.length)} 点闭合）
          <Button size="small" type="link" danger onClick={handleCancelDraft} className="plan-graph-tip-cancel">
            取消绘制
          </Button>
        </>
      );
    }
    if (editMode === "drag") {
      const m = doorMappings.find((m) => m.id === dragMappingId) || hotspotMappings.find((m) => m.id === dragMappingId);
      const title = m?.doorName || m?.title || "";
      return (
        <>
          拖拽点微调：{title}
          <Button size="small" type="link" onClick={handleExitDrag} className="plan-graph-tip-exit">
            完成
          </Button>
        </>
      );
    }
    return null;
  };

  return (
    <Flex vertical className="plan-graph-root">
      <Flex align="center" justify="space-between" className="plan-graph-header">
        <Flex align="center" gap={19} className="plan-graph-header-left">
          <Button type="text" shape="circle" className="plan-graph-back-btn" icon={<LeftOutlined />} onClick={onClose} />
          <Flex vertical gap={2}>
            <div className="plan-graph-title">平面图映射</div>
            <div className="plan-graph-subtitle">
              {site.siteName} / {region.name}
            </div>
          </Flex>
        </Flex>
        <Flex align="center" gap={12} className="plan-graph-header-right">
          <Button className="btn-primary-s3" onClick={handleConfig}>
            平面图配置
          </Button>
          <Button type="primary" className="btn-primary" onClick={handleSave} disabled={!canSave} loading={saveLoading}>
            保存
          </Button>
        </Flex>
      </Flex>

      <div className="plan-graph-body" style={{ display: "flex" }}>
        <Flex style={{ flex: 1, minHeight: 0, height: "100%" }} gap={16}>
          <Flex vertical className="plan-graph-left">
            <div className="plan-graph-container" ref={containerRef}>
              {hasImage ? (
                <div className="plan-graph-canvas-wrap">
                  <img src={imageUrl} alt="平面图" className="plan-graph-image" />
                  <canvas
                    ref={canvasRef}
                    className="plan-graph-canvas"
                    style={{ cursor: getCursor() }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                  {editMode !== "none" && (
                    <div className="plan-graph-drawing-tip">{getTipText()}</div>
                  )}
                </div>
              ) : (
                <div className="plan-graph-empty">
                  <Empty description="请先上传平面图" image={null} />
                </div>
              )}
            </div>
          </Flex>

          <Flex vertical className="plan-graph-sidebar">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => {
                setActiveTab(key);
                if (editMode === "draw") handleCancelDraft();
                else if (editMode === "drag") handleExitDrag();
              }}
              size="small"
              items={[
                { key: "door", label: "出入口映射", children: renderDoorTab() },
                { key: "hotspot", label: "热区映射", children: renderHotspotTab() },
              ]}
            />
          </Flex>
        </Flex>
      </div>

      <input ref={fileInputRef} type="file" accept=".png,.jpeg,.jpg,image/png,image/jpeg" style={{ display: "none" }} onChange={handleFileChange} />

      <Modal
        title="新增映射"
        open={addModalOpen}
        onOk={handleAddMapping}
        onCancel={() => {
          setAddModalOpen(false);
          setAddMappingName("");
        }}
        okText="确定"
        cancelText="取消">
        <Flex vertical gap={8}>
          <div style={{ fontSize: 13, color: "#888" }}>映射名称</div>
          <Input
            placeholder="请输入映射名称"
            value={addMappingName}
            onChange={(e) => setAddMappingName(e.target.value)}
            onPressEnter={handleAddMapping}
          />
        </Flex>
      </Modal>
    </Flex>
  );
};

export default CreatePlanGraphPage;
