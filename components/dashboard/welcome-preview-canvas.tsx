"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { WelcomeImageConfig } from "@/types/api";

interface WelcomePreviewCanvasProps {
  imageConfig?: WelcomeImageConfig | null;
  serverName?: string;
  selectedElement?: string | null;
  onSelectElement?: (element: string) => void;
  onPositionChange?: (element: string, x: number, y: number) => void;
}

export function WelcomePreviewCanvas({
  imageConfig,
  serverName = "Vada SMP",
  selectedElement = null,
  onSelectElement,
  onPositionChange
}: WelcomePreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [avatarImage, setAvatarImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);

  const canvasWidth = imageConfig?.canvas?.width || 1020;
  const canvasHeight = imageConfig?.canvas?.height || 450;
  const bgType = imageConfig?.canvas?.background_type || "gradient";
  const bgImageUrl = imageConfig?.canvas?.background_image_url || "";
  const bgColor = imageConfig?.canvas?.background_color || "#080808";
  const grad1 = imageConfig?.canvas?.gradient_color1 || "#080808";
  const grad2 = imageConfig?.canvas?.gradient_color2 || "#140B17";
  const overlayOpacity = imageConfig?.canvas?.overlay_opacity !== undefined ? imageConfig.canvas.overlay_opacity : 0.4;
  
  const borderEnabled = imageConfig?.canvas?.border_enabled !== false;
  const borderThickness = borderEnabled ? (imageConfig?.canvas?.border_thickness !== undefined ? imageConfig.canvas.border_thickness : 8) : 0;
  const borderColor = imageConfig?.canvas?.border_color || "#FF6B00";

  const avX = imageConfig?.avatar?.x !== undefined ? imageConfig.avatar.x : 510;
  const avY = imageConfig?.avatar?.y !== undefined ? imageConfig.avatar.y : 180;
  const avSize = imageConfig?.avatar?.size !== undefined ? imageConfig.avatar.size : 180;
  const avShape = imageConfig?.avatar?.shape || "rounded";
  
  const avBorderEnabled = imageConfig?.avatar?.border_enabled !== false;
  const avBorderThickness = avBorderEnabled ? (imageConfig?.avatar?.border_thickness !== undefined ? imageConfig.avatar.border_thickness : 8) : 0;
  const avBorderColor = imageConfig?.avatar?.border_color || "#FF6B00";

  // Preload Background Image if bgType is image
  useEffect(() => {
    if (bgType === "image" && bgImageUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImageUrl;
      img.onload = () => setBgImage(img);
      img.onerror = () => {
        console.error("Failed to load welcome background preview image");
        setBgImage(null);
      };
    } else {
      setBgImage(null);
    }
  }, [bgType, bgImageUrl]);

  // Preload Avatar Image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/mc-head.png";
    img.onload = () => setAvatarImage(img);
    img.onerror = () => {
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = "anonymous";
      fallbackImg.src = "https://cdn.discordapp.com/embed/avatars/0.png";
      fallbackImg.onload = () => setAvatarImage(fallbackImg);
      fallbackImg.onerror = () => setAvatarImage(null);
    };
  }, []);

  // Format placeholders
  const formatText = useCallback((text: string) => {
    if (!text) return "";
    return text
      .replace(/{user}/g, "@dinixooji.")
      .replace(/{user_name}/g, "dinixooji.")
      .replace(/{user_id}/g, "123456789012345678")
      .replace(/{user_nick}/g, "dinixooji.")
      .replace(/{server_name}/g, serverName)
      .replace(/{server_membercount}/g, "364")
      .replace(/{user_joindate}/g, "Tue, Aug 25, 2026")
      .replace(/{user_createdate}/g, "Sun, Jan 10, 2021");
  }, [serverName]);

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Background
    if (bgType === "solid") {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === "gradient") {
      const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      grad.addColorStop(0, grad1);
      grad.addColorStop(1, grad2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else if (bgType === "image" && bgImage) {
      // Draw cover image
      const scale = Math.max(canvasWidth / bgImage.width, canvasHeight / bgImage.height);
      const x = (canvasWidth / 2) - (bgImage.width / 2) * scale;
      const y = (canvasHeight / 2) - (bgImage.height / 2) * scale;
      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);

      // Draw overlay
      if (overlayOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    } else {
      // Fallback background color
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Draw Canvas Border (if enabled and thickness > 0)
    if (borderEnabled && borderThickness > 0) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderThickness;
      ctx.strokeRect(borderThickness / 2, borderThickness / 2, canvasWidth - borderThickness, canvasHeight - borderThickness);
    }

    // 3. Draw Avatar
    if (avatarImage) {
      ctx.save();
      if (avShape === "rounded") {
        ctx.beginPath();
        ctx.arc(avX, avY, avSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, avX - avSize / 2, avY - avSize / 2, avSize, avSize);
        ctx.restore();

        // Draw Border
        if (avBorderEnabled && avBorderThickness > 0) {
          ctx.strokeStyle = avBorderColor;
          ctx.lineWidth = avBorderThickness;
          ctx.beginPath();
          ctx.arc(avX, avY, avSize / 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.drawImage(avatarImage, avX - avSize / 2, avY - avSize / 2, avSize, avSize);
        ctx.restore();

        // Draw Border
        if (avBorderEnabled && avBorderThickness > 0) {
          ctx.strokeStyle = avBorderColor;
          ctx.lineWidth = avBorderThickness;
          ctx.strokeRect(avX - avSize / 2, avY - avSize / 2, avSize, avSize);
        }
      }

      // Highlight if selected
      if (selectedElement === "avatar") {
        ctx.save();
        ctx.strokeStyle = "#5865F2";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(avX - avSize / 2 - 6, avY - avSize / 2 - 6, avSize + 12, avSize + 12);
        ctx.restore();
      }
    }

    // 4. Draw Texts
    ctx.textBaseline = "middle";

    const texts = imageConfig?.texts || {};
    const accent = borderColor || "#FF6B00";

    Object.entries(texts).forEach(([key, value]) => {
      if (value && value.content) {
        const textContent = formatText(value.content);
        const fontColor = value.color || "#ffffff";
        const fontSize = value.font_size || 24;
        const isBold = value.is_bold !== undefined ? value.is_bold : true;
        const tx = value.x;
        const ty = value.y;

        ctx.font = `${isBold ? "bold" : "normal"} ${fontSize}px sans-serif`;

        // Split into segments using Regex for word coloring: [accent:...] or [#hex:...]
        const segments: { text: string; color: string }[] = [];
        const regex = /\[(accent|#[0-9a-fA-F]{6}):(.*?)\]/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(textContent)) !== null) {
          const matchIndex = match.index;
          if (matchIndex > lastIndex) {
            segments.push({
              text: textContent.substring(lastIndex, matchIndex),
              color: fontColor
            });
          }
          const colorSpec = match[1];
          const segmentText = match[2];
          const segmentColor = colorSpec === "accent" ? accent : colorSpec;
          segments.push({
            text: segmentText,
            color: segmentColor
          });
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < textContent.length) {
          segments.push({
            text: textContent.substring(lastIndex),
            color: fontColor
          });
        }
        if (segments.length === 0) {
          segments.push({ text: textContent, color: fontColor });
        }

        // Measure total width
        let totalWidth = 0;
        const measuredSegments = segments.map(seg => {
          const width = ctx.measureText(seg.text).width;
          totalWidth += width;
          return { ...seg, width };
        });

        // Draw segments centered horizontally
        let currentX = tx - totalWidth / 2;
        ctx.textAlign = "left";
        measuredSegments.forEach(seg => {
          ctx.fillStyle = seg.color;
          ctx.fillText(seg.text, currentX, ty);
          currentX += seg.width;
        });

        // Highlight if this text element is selected
        if (selectedElement === key) {
          ctx.save();
          ctx.strokeStyle = "#5865F2";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          const boxPadding = 6;
          ctx.strokeRect(
            tx - totalWidth / 2 - boxPadding,
            ty - fontSize / 2 - boxPadding,
            totalWidth + boxPadding * 2,
            fontSize + boxPadding * 2
          );
          ctx.restore();
        }
      }
    });

  }, [
    canvasWidth, canvasHeight, bgType, bgImage, bgColor, grad1, grad2,
    overlayOpacity, borderEnabled, borderThickness, borderColor, avatarImage, avX, avY,
    avSize, avShape, avBorderEnabled, avBorderThickness, avBorderColor, imageConfig,
    formatText, selectedElement
  ]);

  // Coordinate conversion from mouse event to canvas space
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY)
    };
  };

  // Find clicked element (Avatar or Text1-5)
  const hitTestElement = (x: number, y: number): string | null => {
    // Check avatar
    const distToAvatar = Math.hypot(x - avX, y - avY);
    if (distToAvatar <= avSize / 2 + 10) {
      return "avatar";
    }

    // Check texts
    const texts = imageConfig?.texts || {};
    const entries = Object.entries(texts);
    for (let i = entries.length - 1; i >= 0; i--) {
      const [key, val] = entries[i];
      if (val && val.content) {
        const tx = val.x;
        const ty = val.y;
        const fontSize = val.font_size || 24;
        const estWidth = Math.max(80, val.content.length * fontSize * 0.55);
        if (
          x >= tx - estWidth / 2 - 15 &&
          x <= tx + estWidth / 2 + 15 &&
          y >= ty - fontSize / 2 - 12 &&
          y <= ty + fontSize / 2 + 12
        ) {
          return key;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const hit = hitTestElement(coords.x, coords.y);
    if (hit) {
      setDraggedElement(hit);
      setIsDragging(true);
      if (onSelectElement) onSelectElement(hit);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !draggedElement || !onPositionChange) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;
    const clampedX = Math.max(0, Math.min(canvasWidth, coords.x));
    const clampedY = Math.max(0, Math.min(canvasHeight, coords.y));
    onPositionChange(draggedElement, clampedX, clampedY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedElement(null);
  };

  return (
    <div ref={containerRef} className="w-full relative rounded-2xl overflow-hidden bg-slate-950/60 p-2 shadow-2xl border border-white/5">
      <div className="flex items-center justify-between px-2 py-1 mb-1">
        <div className="flex items-center gap-2">
          <span className="bg-white/[0.06] border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] uppercase font-bold text-white/70 tracking-wider">
            Live Card Preview
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {canvasWidth} × {canvasHeight}px
          </span>
        </div>
        {selectedElement && (
          <span className="text-[10px] font-semibold text-[#5865F2] bg-[#5865F2]/15 px-2 py-0.5 rounded-md capitalize">
            Selected: {selectedElement}
          </span>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-auto block rounded-xl cursor-crosshair select-none"
        style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
      />

      <div className="text-[11px] text-white/40 text-center py-1.5 flex items-center justify-center gap-3">
        <span>💡 Click or drag text/avatar on the canvas to reposition in real-time</span>
      </div>
    </div>
  );
}
