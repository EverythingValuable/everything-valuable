import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, RotateCcw, RotateCw, Check, Crop } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";

// Simple canvas-based rotate + crop editor
export default function ImageEditorModal({ url, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  // crop state: { x, y, w, h } as fractions 0-1 of the image natural size
  const [cropMode, setCropMode] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [dragging, setDragging] = useState(null); // null | 'move' | corner key
  const [dragStart, setDragStart] = useState(null);
  const [saving, setSaving] = useState(false);
  const imgRef = useRef(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = url;
  }, [url]);

  // Draw canvas
  useEffect(() => {
    if (!imgLoaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const maxW = Math.min(600, window.innerWidth - 80);
    const maxH = 480;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rotW = img.width * cos + img.height * sin;
    const rotH = img.width * sin + img.height * cos;
    const scale = Math.min(maxW / rotW, maxH / rotH);
    canvas.width = rotW * scale;
    canvas.height = rotH * scale;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.width * scale / 2, -img.height * scale / 2, img.width * scale, img.height * scale);
    ctx.restore();

    if (cropMode) {
      // Dim outside crop
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      const cx = cropBox.x * canvas.width;
      const cy = cropBox.y * canvas.height;
      const cw = cropBox.w * canvas.width;
      const ch = cropBox.h * canvas.height;
      ctx.fillRect(0, 0, canvas.width, cy);
      ctx.fillRect(0, cy + ch, canvas.width, canvas.height - cy - ch);
      ctx.fillRect(0, cy, cx, ch);
      ctx.fillRect(cx + cw, cy, canvas.width - cx - cw, ch);
      // Crop border
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(cx, cy, cw, ch);
      ctx.setLineDash([]);
      // Corner handles
      const hs = 8;
      [
        [cx, cy], [cx + cw - hs, cy],
        [cx, cy + ch - hs], [cx + cw - hs, cy + ch - hs]
      ].forEach(([hx, hy]) => {
        ctx.fillStyle = "#fff";
        ctx.fillRect(hx, hy, hs, hs);
      });
    }
  }, [imgLoaded, rotation, cropMode, cropBox]);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  };

  const handleMouseDown = (e) => {
    if (!cropMode) return;
    const pos = getCanvasPos(e);
    const { x, y, w, h } = cropBox;
    const hs = 12 / canvasRef.current.width; // handle size in fraction
    const corners = {
      tl: [x, y], tr: [x + w, y],
      bl: [x, y + h], br: [x + w, y + h]
    };
    for (const [key, [cx, cy]] of Object.entries(corners)) {
      if (Math.abs(pos.x - cx) < hs && Math.abs(pos.y - cy) < hs) {
        setDragging(key);
        setDragStart(pos);
        return;
      }
    }
    if (pos.x > x && pos.x < x + w && pos.y > y && pos.y < y + h) {
      setDragging("move");
      setDragStart(pos);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !dragStart) return;
    const pos = getCanvasPos(e);
    const dx = pos.x - dragStart.x;
    const dy = pos.y - dragStart.y;
    setDragStart(pos);
    setCropBox(prev => {
      let { x, y, w, h } = prev;
      const minS = 0.05;
      if (dragging === "move") {
        x = Math.max(0, Math.min(1 - w, x + dx));
        y = Math.max(0, Math.min(1 - h, y + dy));
      } else if (dragging === "tl") {
        const nx = Math.min(x + w - minS, x + dx);
        const ny = Math.min(y + h - minS, y + dy);
        w = w + (x - nx); h = h + (y - ny); x = nx; y = ny;
      } else if (dragging === "tr") {
        const nw = Math.max(minS, w + dx);
        const ny = Math.min(y + h - minS, y + dy);
        h = h + (y - ny); y = ny; w = nw;
      } else if (dragging === "bl") {
        const nx = Math.min(x + w - minS, x + dx);
        w = w + (x - nx); x = nx; h = Math.max(minS, h + dy);
      } else if (dragging === "br") {
        w = Math.max(minS, w + dx); h = Math.max(minS, h + dy);
      }
      // Clamp
      x = Math.max(0, x); y = Math.max(0, y);
      w = Math.min(1 - x, w); h = Math.min(1 - y, h);
      return { x, y, w, h };
    });
  }, [dragging, dragStart]);

  const handleMouseUp = () => { setDragging(null); setDragStart(null); };

  const handleSave = async () => {
    setSaving(true);
    const img = imgRef.current;
    const rad = (rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const rotW = img.width * cos + img.height * sin;
    const rotH = img.width * sin + img.height * cos;

    // Rotated canvas at full resolution
    const rotCanvas = document.createElement("canvas");
    rotCanvas.width = rotW;
    rotCanvas.height = rotH;
    const ctx = rotCanvas.getContext("2d");
    ctx.translate(rotW / 2, rotH / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    let finalCanvas = rotCanvas;

    if (cropMode) {
      // Apply crop
      const cropCanvas = document.createElement("canvas");
      const cx = cropBox.x * rotW;
      const cy = cropBox.y * rotH;
      const cw = cropBox.w * rotW;
      const ch = cropBox.h * rotH;
      cropCanvas.width = cw;
      cropCanvas.height = ch;
      const cropCtx = cropCanvas.getContext("2d");
      cropCtx.drawImage(rotCanvas, cx, cy, cw, ch, 0, 0, cw, ch);
      finalCanvas = cropCanvas;
    }

    finalCanvas.toBlob(async (blob) => {
      const file = new File([blob], "edited-image.jpg", { type: "image/jpeg" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onSave(file_url);
      setSaving(false);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white shadow-2xl flex flex-col max-w-3xl w-full max-h-[95vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-sm font-bold tracking-[0.12em] uppercase text-neutral-700">Edit Photo</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-neutral-100 p-4 min-h-0">
          {!imgLoaded ? (
            <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
          ) : (
            <canvas
              ref={canvasRef}
              className={cn("max-w-full max-h-full select-none", cropMode ? "cursor-crosshair" : "")}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          )}
        </div>

        {/* Toolbar */}
        <div className="px-5 py-4 border-t border-neutral-100 flex items-center gap-3 flex-wrap">
          {/* Rotate */}
          <div className="flex items-center gap-1 border border-neutral-200 p-1">
            <button
              onClick={() => setRotation(r => r - 90)}
              className="p-2 hover:bg-neutral-100 transition-colors text-neutral-600"
              title="Rotate left"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <span className="text-xs text-neutral-400 px-1 tabular-nums min-w-[36px] text-center">{rotation}°</span>
            <button
              onClick={() => setRotation(r => r + 90)}
              className="p-2 hover:bg-neutral-100 transition-colors text-neutral-600"
              title="Rotate right"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Crop toggle */}
          <button
            onClick={() => {
              if (!cropMode) setCropBox({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
              setCropMode(v => !v);
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-semibold border transition-colors",
              cropMode
                ? "border-neutral-800 bg-neutral-800 text-white"
                : "border-neutral-200 text-neutral-600 hover:border-neutral-500"
            )}
          >
            <Crop className="w-3.5 h-3.5" />
            {cropMode ? "Crop On — drag handles" : "Crop"}
          </button>

          <div className="flex-1" />

          {/* Cancel + Save */}
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold border border-neutral-200 text-neutral-600 hover:border-neutral-400 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-neutral-900 hover:bg-black text-white transition-colors disabled:opacity-50"
          >
            {saving ? (
              <><div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Check className="w-3.5 h-3.5" /> Apply & Save</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}