import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Flex, Input, Modal, Switch, message } from "antd";
import { LeftOutlined, PlusOutlined } from "@ant-design/icons";
import Empty from "@/components/common/Empty";
import Message from "@/components/common/Message";
import "./CreatePlanGraphPage.less";

const CLOSE_THRESHOLD = 12;
const CLOSE_POINT_COUNT = 3;

const CreatePlanGraphPage = ({ site, region, onClose }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageContainerSize, setImageContainerSize] = useState({ width: 0, height: 0 });
  const [mappings, setMappings] = useState([]);
  const [draftTitle, setDraftTitle] = useState(null);
  const [draftPoints, setDraftPoints] = useState([]);
  const [showAll, setShowAll] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addMappingName, setAddMappingName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

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
  }, [imageContainerSize, mappings, draftTitle, draftPoints, showAll, imageUrl]);

  const toRelative = (clientX, clientY, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };

  const toAbsolute = (rel, width, height) => ({
    x: rel.x * width,
    y: rel.y * height,
  });

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

  const redraw = (ctx, width, height) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const allMappings = showAll ? mappings : [];
    for (const mapping of allMappings) {
      const pts = mapping.points.map((p) => toAbsolute(p, width, height));
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
      ctx.fill();
      ctx.strokeStyle = "#ff4d4f";
      ctx.lineWidth = 2;
      ctx.stroke();
      const c = centroid(pts);
      ctx.font = `bold ${Math.max(12, Math.min(16, width / 30))}px sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "rgba(0,0,0,0.5)";
      ctx.lineWidth = 3;
      ctx.strokeText(mapping.title, c.x, c.y);
      ctx.fillText(mapping.title, c.x, c.y);
      drawPoint(ctx, pts[0].x, pts[0].y, "#ff4d4f", 5);
      for (let i = 1; i < pts.length; i++) drawPoint(ctx, pts[i].x, pts[i].y, "#ffffff", 4);
    }
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
      for (let i = 0; i < pts.length; i++) drawPoint(ctx, pts[i].x, pts[i].y, i === 0 ? "#ff4d4f" : "#ffffff", 5);
    }
  };

  const handleCanvasClick = useCallback(
    (e) => {
      if (!draftTitle || !canvasRef.current) return;
      const { width, height } = imageContainerSize;
      if (width === 0 || height === 0) return;
      const rel = toRelative(e.clientX, e.clientY, canvasRef.current);
      const pts = [...draftPoints, rel];
      if (pts.length >= CLOSE_POINT_COUNT && dist(rel, pts[0]) < CLOSE_THRESHOLD / Math.max(width, height)) {
        const newMapping = { title: draftTitle, points: pts.slice(0, -1) };
        setMappings((prev) => [...prev, newMapping]);
        setDraftTitle(null);
        setDraftPoints([]);
        setAddModalOpen(false);
        setAddMappingName("");
        message.success({ content: "映射绘制完成" });
        return;
      }
      setDraftPoints(pts);
    },
    [draftTitle, draftPoints, imageContainerSize]
  );

  const handleCancelDraft = () => {
    setDraftTitle(null);
    setDraftPoints([]);
    if (addModalOpen) {
      setAddModalOpen(false);
      setAddMappingName("");
    }
  };

  const handleAddMapping = () => {
    const name = addMappingName.trim();
    if (!name) {
      message.warning({ content: "请输入映射名称" });
      return;
    }
    setDraftTitle(name);
    setDraftPoints([]);
    setAddModalOpen(false);
    setAddMappingName("");
  };

  const handleDeleteMapping = (index) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
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
  };

  const handleSave = () => {
    setSaveLoading(true);
    const data = {
      siteId: site.siteId,
      areaId: region.areaId,
      regionName: region.name,
      floorPlanFileName: imageUrl ? "已上传图片" : null,
      mappings,
    };
    console.log("平面图映射数据:", data);
    setTimeout(() => {
      setSaveLoading(false);
      Message.success("保存成功");
      onClose();
    }, 500);
  };

  const canSave = draftTitle === null;
  const hasImage = !!imageUrl;

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
                  <canvas ref={canvasRef} className="plan-graph-canvas" onClick={handleCanvasClick} style={{ cursor: draftTitle ? "crosshair" : "default" }} />
                  {draftTitle && (
                    <div className="plan-graph-drawing-tip">
                      正在绘制：{draftTitle}（{draftPoints.length} 点，已 {draftPoints.length >= CLOSE_POINT_COUNT ? "可" : "需 " + (CLOSE_POINT_COUNT - draftPoints.length)} 点闭合）
                      <Button size="small" type="link" danger onClick={handleCancelDraft} className="plan-graph-tip-cancel">
                        取消绘制
                      </Button>
                    </div>
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
            <div className="plan-graph-sidebar-header">
              <Flex align="center" justify="space-between">
                <span className="plan-graph-sidebar-title">出入口映射</span>
                <Flex align="center" gap={8} className="plan-graph-sidebar-toggle">
                  <span className="plan-graph-sidebar-toggle-label">显示全部</span>
                  <Switch size="small" checked={showAll} onChange={setShowAll} />
                </Flex>
              </Flex>
            </div>

            <div className="plan-graph-sidebar-list">
              {mappings.length === 0 ? (
                <div className="plan-graph-sidebar-empty">暂无映射单元</div>
              ) : (
                mappings.map((m, i) => (
                  <Flex key={i} align="center" justify="space-between" style={{ padding: "8px 16px", borderBottom: "1px solid #f0f0f0" }} className="mapping-item">
                    <Flex align="center" gap={8}>
                      <div className="mapping-dot" />
                      <span className="mapping-item-text">{m.title}</span>
                      <span className="mapping-item-count">({m.points.length} 点)</span>
                    </Flex>
                    <Button type="link" size="small" danger onClick={() => handleDeleteMapping(i)} className="mapping-item-delete">
                      删除
                    </Button>
                  </Flex>
                ))
              )}
            </div>

            <div className="plan-graph-sidebar-footer">
              <Button type="primary" icon={<PlusOutlined />} className="btn-primary" block disabled={!!draftTitle} onClick={() => setAddModalOpen(true)}>
                新增映射
              </Button>
            </div>
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
        okText="开始绘制"
        cancelText="取消">
        <Flex vertical gap={8}>
          <div className="plan-graph-modal-label">映射名称</div>
          <Input placeholder="请输入映射名称" value={addMappingName} onChange={(e) => setAddMappingName(e.target.value)} onPressEnter={handleAddMapping} />
        </Flex>
      </Modal>
    </Flex>
  );
};

export default CreatePlanGraphPage;
