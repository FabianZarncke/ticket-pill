"use client";
import {
  getNotionViewUrl,
  isLocalhostClient
} from "./chunk-FRX46ESE.js";

// src/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Crosshair,
  Plus,
  X,
  ExternalLink,
  Check,
  Send,
  Loader2,
  GripVertical
} from "lucide-react";

// src/styles/overlayCss.ts
var OVERLAY_STYLES = ':root {\n  --tp-accent: #6366f1;\n  --tp-accent-hover: #4f46e5;\n  --tp-accent-text: #ffffff;\n  --tp-bg: #18181b;\n  --tp-bg-card: #202024;\n  --tp-border: rgba(255, 255, 255, 0.12);\n  --tp-text: #f8fafc;\n  --tp-muted: #94a3b8;\n  --tp-focus-ring: rgba(99, 102, 241, 0.35);\n}\n\n/* Base resets for Ticket Pill elements */\n[data-tp-root] *,\n[data-tp-root] *::before,\n[data-tp-root] *::after {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased;\n}\n\n/* Floating Pill Toolbar */\n.tp-pill {\n  height: 38px !important;\n  max-height: 38px !important;\n  box-sizing: border-box !important;\n  background-color: var(--tp-bg) !important;\n  border: 1px solid var(--tp-border) !important;\n  border-radius: 9999px !important;\n  padding: 4px !important;\n  display: flex !important;\n  flex-direction: row !important;\n  flex-wrap: nowrap !important;\n  align-items: center !important;\n  gap: 6px !important;\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;\n  color: var(--tp-text) !important;\n  user-select: none !important;\n  z-index: 2147483647 !important;\n  flex-shrink: 0 !important;\n}\n\n.tp-pill-dragging {\n  cursor: grabbing !important;\n  opacity: 0.92 !important;\n  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7) !important;\n  transition: none !important;\n}\n\n.tp-pill-resetting {\n  transition: top 0.22s cubic-bezier(0.16, 1, 0.3, 1), left 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;\n}\n\n.tp-pill-grab {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding-left: 6px;\n  padding-right: 2px;\n  color: var(--tp-muted);\n  cursor: grab;\n  transition: color 0.15s ease;\n}\n\n.tp-pill-grab:hover {\n  color: var(--tp-text);\n}\n\n.tp-pill-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n  height: 28px;\n  padding: 0 10px;\n  border-radius: 9999px;\n  font-size: 12px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  background: rgba(255, 255, 255, 0.08);\n  color: var(--tp-text);\n  transition: all 0.15s ease;\n  white-space: nowrap;\n}\n\n.tp-pill-btn:hover {\n  background: rgba(255, 255, 255, 0.14);\n}\n\n.tp-pill-btn-active {\n  background-color: var(--tp-accent) !important;\n  color: var(--tp-accent-text) !important;\n  box-shadow: 0 0 0 2px var(--tp-focus-ring) !important;\n}\n\n.tp-pill-icon-btn {\n  width: 28px;\n  height: 28px;\n  padding: 0;\n  border-radius: 9999px;\n}\n\n.tp-pill-icon-btn:hover {\n  color: var(--tp-accent);\n}\n\n.tp-pill-divider {\n  width: 1px;\n  height: 16px;\n  background-color: var(--tp-border);\n  margin: auto 2px;\n}\n\n/* Hover Highlight Box */\n.tp-hover-box {\n  position: fixed;\n  border: 2px dashed var(--tp-accent);\n  background-color: rgba(99, 102, 241, 0.12);\n  border-radius: 3px;\n  pointer-events: none;\n  z-index: 2147483646;\n  display: flex;\n  align-items: flex-start;\n  justify-content: flex-end;\n}\n\n.tp-hover-tag {\n  background-color: var(--tp-accent);\n  color: var(--tp-accent-text);\n  font-size: 10px;\n  font-weight: 700;\n  padding: 2px 6px;\n  border-radius: 4px;\n  transform: translateY(-100%);\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);\n}\n\n/* Modal Backing & Card */\n.tp-modal-overlay {\n  position: fixed;\n  inset: 0;\n  z-index: 2147483647;\n  pointer-events: auto;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 16px;\n  user-select: none;\n  background: rgba(0, 0, 0, 0.45);\n  backdrop-filter: blur(2px);\n}\n\n.tp-modal-card {\n  background-color: var(--tp-bg);\n  border: 1px solid var(--tp-border);\n  border-radius: 20px;\n  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);\n  width: 100%;\n  max-width: 520px;\n  overflow: hidden;\n  color: var(--tp-text);\n  user-select: text;\n}\n\n.tp-modal-header {\n  background-color: var(--tp-bg);\n  border-bottom: 1px solid var(--tp-border);\n  padding: 14px 20px;\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  user-select: none;\n  cursor: grab;\n}\n\n.tp-modal-header-dragging {\n  cursor: grabbing;\n}\n\n.tp-modal-title {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--tp-text);\n}\n\n.tp-modal-title-accent {\n  color: var(--tp-accent);\n}\n\n.tp-modal-close {\n  background: transparent;\n  border: none;\n  color: var(--tp-muted);\n  cursor: pointer;\n  padding: 4px;\n  border-radius: 6px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  transition: all 0.15s ease;\n}\n\n.tp-modal-close:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: var(--tp-text);\n}\n\n.tp-modal-body {\n  padding: 18px 20px;\n  display: flex;\n  flex-direction: column;\n  gap: 14px;\n  max-height: 80vh;\n  overflow-y: auto;\n}\n\n/* Context Badge */\n.tp-context-box {\n  background: rgba(255, 255, 255, 0.04);\n  border: 1px solid var(--tp-border);\n  border-radius: 12px;\n  padding: 10px 14px;\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.tp-context-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  font-size: 11px;\n}\n\n.tp-context-label {\n  color: var(--tp-muted);\n  font-weight: 600;\n  min-width: 65px;\n}\n\n.tp-context-code {\n  color: var(--tp-accent);\n  background: rgba(99, 102, 241, 0.1);\n  padding: 2px 6px;\n  border-radius: 4px;\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;\n  font-size: 11px;\n  word-break: break-all;\n}\n\n/* Form Controls */\n.tp-form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n}\n\n.tp-form-label {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--tp-text);\n}\n\n.tp-input,\n.tp-textarea {\n  width: 100%;\n  background: rgba(255, 255, 255, 0.06);\n  border: 1px solid var(--tp-border);\n  border-radius: 10px;\n  padding: 9px 12px;\n  font-size: 13px;\n  color: var(--tp-text);\n  outline: none;\n  transition: border-color 0.15s ease, box-shadow 0.15s ease;\n}\n\n.tp-input:focus,\n.tp-textarea:focus {\n  border-color: var(--tp-accent);\n  box-shadow: 0 0 0 3px var(--tp-focus-ring);\n}\n\n.tp-textarea {\n  min-height: 100px;\n  resize: vertical;\n  line-height: 1.45;\n}\n\n/* Modal Actions */\n.tp-modal-footer {\n  padding: 14px 20px;\n  border-top: 1px solid var(--tp-border);\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 10px;\n  background-color: var(--tp-bg);\n}\n\n.tp-btn {\n  height: 36px;\n  padding: 0 16px;\n  border-radius: 10px;\n  font-size: 13px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n  transition: all 0.15s ease;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 6px;\n}\n\n.tp-btn-secondary {\n  background: rgba(255, 255, 255, 0.08);\n  color: var(--tp-text);\n}\n\n.tp-btn-secondary:hover {\n  background: rgba(255, 255, 255, 0.14);\n}\n\n.tp-btn-primary {\n  background-color: var(--tp-accent);\n  color: var(--tp-accent-text);\n}\n\n.tp-btn-primary:hover {\n  filter: brightness(1.1);\n}\n\n.tp-btn-primary:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n\n/* Toast */\n.tp-toast {\n  position: fixed;\n  bottom: 75px;\n  left: 50%;\n  transform: translateX(-50%);\n  z-index: 2147483647;\n  background-color: var(--tp-bg);\n  border: 1px solid rgba(34, 197, 94, 0.4);\n  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);\n  padding: 10px 18px;\n  border-radius: 12px;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  color: #ffffff;\n  font-size: 12px;\n  animation: tpFadeInUp 0.2s ease-out;\n}\n\n.tp-toast-icon {\n  width: 22px;\n  height: 22px;\n  border-radius: 9999px;\n  background: rgba(34, 197, 94, 0.2);\n  color: #22c55e;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n@keyframes tpFadeInUp {\n  from {\n    opacity: 0;\n    transform: translate(-50%, 10px);\n  }\n  to {\n    opacity: 1;\n    transform: translate(-50%, 0);\n  }\n}\n';

// src/index.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function getContrastColor(hexColor) {
  if (!hexColor) return "#ffffff";
  let hex = hexColor.replace("#", "").trim();
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  if (hex.length !== 6) return "#ffffff";
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? "#0f172a" : "#ffffff";
}
function detectModuleFromPath(pathname) {
  if (!pathname || pathname === "/") return "Dashboard";
  const segments = pathname.split("/").filter(Boolean);
  const segment = segments[0];
  if (segment) {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
  return "Allgemein";
}
function getReactFiberFromDOM(dom) {
  const key = Object.keys(dom).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")
  );
  return key ? dom[key] : null;
}
function getReactSource(dom) {
  let fiber = getReactFiberFromDOM(dom);
  while (fiber) {
    if (fiber._debugSource) {
      const componentName = typeof fiber.type === "function" ? fiber.type.displayName || fiber.type.name : typeof fiber.elementType === "function" ? fiber.elementType.displayName || fiber.elementType.name : void 0;
      return {
        fileName: fiber._debugSource.fileName,
        lineNumber: fiber._debugSource.lineNumber,
        componentName
      };
    }
    fiber = fiber.return;
  }
  return null;
}
function DevOverlay({
  project = "Allgemein",
  theme,
  accentColor,
  apiEndpoint = "/api/dev-tickets"
}) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetInfo, setTargetInfo] = useState(null);
  const [reactSource, setReactSource] = useState(null);
  const [hoveredRect, setHoveredRect] = useState(null);
  const [hoveredTag, setHoveredTag] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleName, setModuleName] = useState("Allgemein");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [pillPos, setPillPos] = useState(null);
  const [isDraggingPill, setIsDraggingPill] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const pillDragRef = useRef(null);
  const pillRef = useRef(null);
  const handleResetPosition = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.removeItem("tp-pill-pos");
    } catch {
    }
    const pillWidth = pillRef.current?.offsetWidth || 140;
    const targetX = Math.max(10, window.innerWidth - pillWidth - 20);
    const targetY = Math.max(10, window.innerHeight - 38 - 20);
    setIsResetting(true);
    setPillPos({ x: targetX, y: targetY });
    setTimeout(() => {
      setPillPos(null);
      setIsResetting(false);
    }, 240);
  };
  const [modalPos, setModalPos] = useState(null);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const modalDragRef = useRef(null);
  const modalCardRef = useRef(null);
  useEffect(() => {
    if (isLocalhostClient()) {
      setIsLocalhost(true);
      setIsMounted(true);
      try {
        const saved = localStorage.getItem("tp-pill-pos");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed?.x === "number" && typeof parsed?.y === "number" && parsed.x >= 0 && parsed.y >= 0 && parsed.y <= window.innerHeight - 30) {
            setPillPos(parsed);
          }
        }
      } catch {
      }
    }
  }, []);
  const generatePrefilledTitle = useCallback(
    (target, source) => {
      if (source?.componentName) {
        const cleanSnippet = target?.textSnippet ? target.textSnippet.replace(/\s+/g, " ").trim() : "";
        if (cleanSnippet && cleanSnippet.length <= 30) {
          return `<${source.componentName} />: "${cleanSnippet}"`;
        }
        return `Feedback zu <${source.componentName} />`;
      }
      if (target) {
        const cleanSnippet = target.textSnippet ? target.textSnippet.replace(/\s+/g, " ").trim() : "";
        if (cleanSnippet) {
          const shortSnippet = cleanSnippet.length > 40 ? cleanSnippet.slice(0, 40) + "..." : cleanSnippet;
          return `Anpassung: "${shortSnippet}"`;
        }
        const cleanSelector = target.selector.split(" > ").pop() || target.selector;
        return `Feedback zu <${target.tag.toLowerCase()}> (${cleanSelector})`;
      }
      return "Neues Dev Feedback";
    },
    []
  );
  useEffect(() => {
    if (isModalOpen) {
      setModalPos(null);
      if (typeof window !== "undefined") {
        setModuleName(detectModuleFromPath(window.location.pathname));
      }
      if (!title.trim()) {
        setTitle(generatePrefilledTitle(targetInfo, reactSource));
      }
    }
  }, [isModalOpen, targetInfo, reactSource, generatePrefilledTitle, title]);
  useEffect(() => {
    if (!isDraggingPill) return;
    const handleMouseMove = (e) => {
      if (!pillDragRef.current) return;
      const dx = e.clientX - pillDragRef.current.startX;
      const dy = e.clientY - pillDragRef.current.startY;
      const pillWidth = pillRef.current?.offsetWidth || 140;
      const pillHeight = 38;
      const minX = 10;
      const maxX = Math.max(10, window.innerWidth - pillWidth - 10);
      const minY = 10;
      const maxY = Math.max(10, window.innerHeight - pillHeight - 10);
      const nextX = Math.min(Math.max(minX, pillDragRef.current.initialX + dx), maxX);
      const nextY = Math.min(Math.max(minY, pillDragRef.current.initialY + dy), maxY);
      setPillPos({ x: nextX, y: nextY });
    };
    const handleMouseUp = () => {
      setIsDraggingPill(false);
      if (pillPos) {
        try {
          localStorage.setItem("tp-pill-pos", JSON.stringify(pillPos));
        } catch {
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPill, pillPos]);
  const handlePillMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button, a")) return;
    const rect = pillRef.current?.getBoundingClientRect();
    if (!rect) return;
    pillDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top
    };
    setIsDraggingPill(true);
    e.preventDefault();
  };
  useEffect(() => {
    if (!isDraggingModal) return;
    const handleMouseMove = (e) => {
      if (!modalDragRef.current) return;
      const dx = e.clientX - modalDragRef.current.startX;
      const dy = e.clientY - modalDragRef.current.startY;
      const modalWidth = modalCardRef.current?.offsetWidth || 480;
      const modalHeight = modalCardRef.current?.offsetHeight || 400;
      const minX = 10;
      const maxX = Math.max(10, window.innerWidth - modalWidth - 10);
      const minY = 10;
      const maxY = Math.max(10, window.innerHeight - modalHeight - 10);
      const nextX = Math.min(Math.max(minX, modalDragRef.current.initialX + dx), maxX);
      const nextY = Math.min(Math.max(minY, modalDragRef.current.initialY + dy), maxY);
      setModalPos({ x: nextX, y: nextY });
    };
    const handleMouseUp = () => {
      setIsDraggingModal(false);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingModal]);
  const handleModalHeaderMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button, a, input, textarea")) return;
    const rect = modalCardRef.current?.getBoundingClientRect();
    if (!rect) return;
    modalDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top
    };
    setIsDraggingModal(true);
    e.preventDefault();
  };
  useEffect(() => {
    if (!isReviewMode) {
      setHoveredRect(null);
      return;
    }
    const handlePointerOver = (e) => {
      const target = e.target;
      if (!target || target.closest("[data-tp-root]")) return;
      const rect = target.getBoundingClientRect();
      setHoveredRect(rect);
      setHoveredTag(target.tagName.toLowerCase());
    };
    const handleClick = (e) => {
      const target = e.target;
      if (!target || target.closest("[data-tp-root]")) return;
      e.preventDefault();
      e.stopPropagation();
      const tag = target.tagName.toLowerCase();
      let selector = tag;
      if (target.id) selector += `#${target.id}`;
      if (target.className && typeof target.className === "string") {
        const classes = target.className.split(" ").filter(Boolean).slice(0, 2);
        if (classes.length) selector += `.${classes.join(".")}`;
      }
      const textSnippet = target.textContent?.slice(0, 80).trim() || void 0;
      const source = getReactSource(target);
      setTargetInfo({ tag, selector, textSnippet });
      setReactSource(source);
      setIsReviewMode(false);
      setHoveredRect(null);
      setIsModalOpen(true);
    };
    document.addEventListener("mouseover", handlePointerOver, true);
    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("mouseover", handlePointerOver, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isReviewMode]);
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      const currentRoute = typeof window !== "undefined" ? window.location.pathname : "";
      const sourceFile = reactSource ? `${reactSource.fileName || "unknown"}:${reactSource.lineNumber || 0} ${reactSource.componentName ? `<${reactSource.componentName} />` : ""}`.trim() : void 0;
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          project,
          moduleName: moduleName.trim() || "Allgemein",
          route: currentRoute,
          sourceFile,
          selector: targetInfo?.selector,
          snippet: targetInfo?.textSnippet
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setTargetInfo(null);
        setReactSource(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4e3);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Fehler beim Speichern in Notion: ${data.error || res.statusText}`);
      }
    } catch (err) {
      alert(`Netzwerkfehler: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const notionUrl = getNotionViewUrl(project);
  if (!isMounted || !isLocalhost) {
    return null;
  }
  const activeAccent = theme?.accent || accentColor || "#6366f1";
  const accentTextColor = theme?.accentText || getContrastColor(activeAccent);
  const themeStyle = {
    "--tp-accent": activeAccent,
    "--tp-accent-text": accentTextColor,
    "--tp-bg": theme?.background || "#18181b",
    "--tp-border": theme?.border || "rgba(255, 255, 255, 0.12)",
    "--tp-text": theme?.text || "#f8fafc",
    "--tp-focus-ring": `${activeAccent}44`
  };
  return /* @__PURE__ */ jsxs("div", { "data-tp-root": "true", style: themeStyle, children: [
    /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: { __html: OVERLAY_STYLES } }),
    isReviewMode && hoveredRect && /* @__PURE__ */ jsx(
      "div",
      {
        className: "tp-hover-box",
        style: {
          top: hoveredRect.top,
          left: hoveredRect.left,
          width: hoveredRect.width,
          height: hoveredRect.height
        },
        children: /* @__PURE__ */ jsx("span", { className: "tp-hover-tag", children: hoveredTag })
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: pillRef,
        onMouseDown: handlePillMouseDown,
        style: {
          position: "fixed",
          top: pillPos ? `${pillPos.y}px` : "auto",
          bottom: pillPos ? "auto" : "20px",
          left: pillPos ? `${pillPos.x}px` : "auto",
          right: pillPos ? "auto" : "20px"
        },
        className: `tp-pill ${isDraggingPill ? "tp-pill-dragging" : ""} ${isResetting ? "tp-pill-resetting" : ""}`,
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "tp-pill-grab",
              onDoubleClick: handleResetPosition,
              title: "Ziehen zum Bewegen \xB7 Doppelklick zum Zur\xFCcksetzen",
              children: /* @__PURE__ */ jsx(GripVertical, { style: { width: 14, height: 14 } })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsReviewMode(!isReviewMode),
              className: `tp-pill-btn tp-pill-icon-btn ${isReviewMode ? "tp-pill-btn-active" : ""}`,
              title: isReviewMode ? "Review-Modus aktiv: Klicke ein Element" : "Review-Modus aktivieren",
              children: /* @__PURE__ */ jsx(
                Crosshair,
                {
                  style: { width: 14, height: 14 },
                  className: isReviewMode ? "animate-spin" : ""
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setTargetInfo(null);
                setReactSource(null);
                setIsModalOpen(true);
              },
              title: "Neues Feedback-Ticket anlegen",
              className: "tp-pill-btn tp-pill-icon-btn",
              children: /* @__PURE__ */ jsx(Plus, { style: { width: 15, height: 15 } })
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "tp-pill-divider" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => window.open(notionUrl, "_blank"),
              title: `Notion Board (${project}) in neuem Tab \xF6ffnen`,
              className: "tp-pill-btn tp-pill-icon-btn",
              children: /* @__PURE__ */ jsx(ExternalLink, { style: { width: 14, height: 14 } })
            }
          )
        ]
      }
    ),
    showSuccessToast && /* @__PURE__ */ jsxs("div", { className: "tp-toast", children: [
      /* @__PURE__ */ jsx("div", { className: "tp-toast-icon", children: /* @__PURE__ */ jsx(Check, { style: { width: 14, height: 14 } }) }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Ticket erfolgreich in ",
        /* @__PURE__ */ jsx("strong", { children: "Notion" }),
        " gespeichert!"
      ] })
    ] }),
    isModalOpen && /* @__PURE__ */ jsx("div", { className: "tp-modal-overlay", children: /* @__PURE__ */ jsxs(
      "div",
      {
        ref: modalCardRef,
        style: modalPos ? {
          position: "fixed",
          top: `${modalPos.y}px`,
          left: `${modalPos.x}px`,
          margin: 0
        } : {
          position: "relative",
          margin: 0
        },
        className: "tp-modal-card",
        children: [
          /* @__PURE__ */ jsxs(
            "div",
            {
              onMouseDown: handleModalHeaderMouseDown,
              className: `tp-modal-header ${isDraggingModal ? "tp-modal-header-dragging" : ""}`,
              children: [
                /* @__PURE__ */ jsxs("div", { className: "tp-modal-title", children: [
                  /* @__PURE__ */ jsx("span", { className: "tp-modal-title-accent", children: "\u25CF" }),
                  /* @__PURE__ */ jsx("span", { children: "Feedback / Bug Report" })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setIsModalOpen(false),
                    className: "tp-modal-close",
                    children: /* @__PURE__ */ jsx(X, { style: { width: 16, height: 16 } })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmitTicket, children: [
            /* @__PURE__ */ jsxs("div", { className: "tp-modal-body", children: [
              (targetInfo || reactSource) && /* @__PURE__ */ jsxs("div", { className: "tp-context-box", children: [
                reactSource?.componentName && /* @__PURE__ */ jsxs("div", { className: "tp-context-row", children: [
                  /* @__PURE__ */ jsx("span", { className: "tp-context-label", children: "Komponente:" }),
                  /* @__PURE__ */ jsxs("code", { className: "tp-context-code", children: [
                    "<",
                    reactSource.componentName,
                    " />"
                  ] })
                ] }),
                reactSource?.fileName && /* @__PURE__ */ jsxs("div", { className: "tp-context-row", children: [
                  /* @__PURE__ */ jsx("span", { className: "tp-context-label", children: "Datei:" }),
                  /* @__PURE__ */ jsxs("code", { className: "tp-context-code", children: [
                    reactSource.fileName.split("/").slice(-2).join("/"),
                    ":",
                    reactSource.lineNumber
                  ] })
                ] }),
                targetInfo?.selector && /* @__PURE__ */ jsxs("div", { className: "tp-context-row", children: [
                  /* @__PURE__ */ jsx("span", { className: "tp-context-label", children: "Selektor:" }),
                  /* @__PURE__ */ jsx("code", { className: "tp-context-code", children: targetInfo.selector })
                ] }),
                targetInfo?.textSnippet && /* @__PURE__ */ jsxs("div", { className: "tp-context-row", children: [
                  /* @__PURE__ */ jsx("span", { className: "tp-context-label", children: "Inhalt:" }),
                  /* @__PURE__ */ jsxs("span", { style: { fontSize: 11, color: "var(--tp-muted)", fontStyle: "italic" }, children: [
                    '"',
                    targetInfo.textSnippet,
                    '"'
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "tp-form-group", children: [
                /* @__PURE__ */ jsx("label", { className: "tp-form-label", children: "Modul / Bereich" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    value: moduleName,
                    onChange: (e) => setModuleName(e.target.value),
                    placeholder: "z.B. Dashboard, Kalender, Vertrieb...",
                    className: "tp-input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "tp-form-group", children: [
                /* @__PURE__ */ jsx("label", { className: "tp-form-label", children: "Titel / Zusammenfassung" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    required: true,
                    value: title,
                    onChange: (e) => setTitle(e.target.value),
                    placeholder: "Kurze Zusammenfassung des Problems oder Wunsches",
                    className: "tp-input"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "tp-form-group", children: [
                /* @__PURE__ */ jsx("label", { className: "tp-form-label", children: "Anweisungen f\xFCr KI / Notizen" }),
                /* @__PURE__ */ jsx(
                  "textarea",
                  {
                    value: description,
                    onChange: (e) => setDescription(e.target.value),
                    placeholder: "Beschreibe genau, was angepasst oder behoben werden soll...",
                    className: "tp-textarea"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "tp-modal-footer", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setIsModalOpen(false),
                  className: "tp-btn tp-btn-secondary",
                  children: "Abbrechen"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "submit",
                  disabled: isSubmitting || !title.trim(),
                  className: "tp-btn tp-btn-primary",
                  children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Loader2, { style: { width: 14, height: 14 }, className: "animate-spin" }),
                    /* @__PURE__ */ jsx("span", { children: "Speichern..." })
                  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(Send, { style: { width: 14, height: 14 } }),
                    /* @__PURE__ */ jsx("span", { children: "Ticket an Notion senden" })
                  ] })
                }
              )
            ] })
          ] })
        ]
      }
    ) })
  ] });
}
export {
  DevOverlay,
  getNotionViewUrl
};
//# sourceMappingURL=index.js.map