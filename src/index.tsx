"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Crosshair,
  Plus,
  X,
  ExternalLink,
  Check,
  Send,
  Loader2,
  GripVertical,
} from "lucide-react";
import { isLocalhostClient } from "./lib/guard";
import { getNotionViewUrl } from "./lib/notion";
import { OVERLAY_STYLES } from "./styles/overlayCss";

export interface DevOverlayTheme {
  accent?: string;
  accentText?: string;
  background?: string;
  border?: string;
  text?: string;
}

export interface DevOverlayProps {
  project?: string;
  theme?: DevOverlayTheme;
  accentColor?: string;
  apiEndpoint?: string;
}

interface ReactSourceInfo {
  fileName?: string;
  lineNumber?: number;
  componentName?: string;
}

function getContrastColor(hexColor?: string): string {
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

function detectModuleFromPath(pathname: string): string {
  if (!pathname || pathname === "/") return "Dashboard";
  const segments = pathname.split("/").filter(Boolean);
  const segment = segments[0];
  if (segment) {
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
  return "Allgemein";
}

function getReactFiberFromDOM(dom: Element): any {
  const key = Object.keys(dom).find(
    (k) =>
      k.startsWith("__reactFiber$") ||
      k.startsWith("__reactInternalInstance$")
  );
  return key ? (dom as any)[key] : null;
}

function getReactSource(dom: Element): ReactSourceInfo | null {
  let fiber = getReactFiberFromDOM(dom);
  while (fiber) {
    if (fiber._debugSource) {
      const componentName =
        typeof fiber.type === "function"
          ? fiber.type.displayName || fiber.type.name
          : typeof fiber.elementType === "function"
          ? fiber.elementType.displayName || fiber.elementType.name
          : undefined;

      return {
        fileName: fiber._debugSource.fileName,
        lineNumber: fiber._debugSource.lineNumber,
        componentName,
      };
    }
    fiber = fiber.return;
  }
  return null;
}

export function DevOverlay({
  project = "Allgemein",
  theme,
  accentColor,
  apiEndpoint = "/api/dev-tickets",
}: DevOverlayProps) {
  // Production guard (compiled out in production builds)
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const [isLocalhost, setIsLocalhost] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [targetInfo, setTargetInfo] = useState<{
    tag: string;
    selector: string;
    textSnippet?: string;
  } | null>(null);
  const [reactSource, setReactSource] = useState<ReactSourceInfo | null>(null);

  // Hover highlight state in Review Mode
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null);
  const [hoveredTag, setHoveredTag] = useState<string>("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleName, setModuleName] = useState<string>("Allgemein");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Floating Pill Dragging State
  const [pillPos, setPillPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingPill, setIsDraggingPill] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const pillDragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);

  const handleResetPosition = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.removeItem("tp-pill-pos");
    } catch {}

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

  // Modal Dragging State
  const [modalPos, setModalPos] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingModal, setIsDraggingModal] = useState(false);
  const modalDragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);
  const modalCardRef = useRef<HTMLDivElement | null>(null);

  // Client-side localhost check & position loading
  useEffect(() => {
    if (isLocalhostClient()) {
      setIsLocalhost(true);
      setIsMounted(true);

      try {
        const saved = localStorage.getItem("tp-pill-pos");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            typeof parsed?.x === "number" &&
            typeof parsed?.y === "number" &&
            parsed.x >= 0 &&
            parsed.y >= 0 &&
            parsed.y <= window.innerHeight - 30
          ) {
            setPillPos(parsed);
          }
        }
      } catch {}
    }
  }, []);

  // Title generator based on clicked element
  const generatePrefilledTitle = useCallback(
    (
      target?: { tag: string; selector: string; textSnippet?: string } | null,
      source?: ReactSourceInfo | null
    ) => {
      if (source?.componentName) {
        const cleanSnippet = target?.textSnippet
          ? target.textSnippet.replace(/\s+/g, " ").trim()
          : "";
        if (cleanSnippet && cleanSnippet.length <= 30) {
          return `<${source.componentName} />: "${cleanSnippet}"`;
        }
        return `Feedback zu <${source.componentName} />`;
      }
      if (target) {
        const cleanSnippet = target.textSnippet
          ? target.textSnippet.replace(/\s+/g, " ").trim()
          : "";
        if (cleanSnippet) {
          const shortSnippet =
            cleanSnippet.length > 40
              ? cleanSnippet.slice(0, 40) + "..."
              : cleanSnippet;
          return `Anpassung: "${shortSnippet}"`;
        }
        const cleanSelector = target.selector.split(" > ").pop() || target.selector;
        return `Feedback zu <${target.tag.toLowerCase()}> (${cleanSelector})`;
      }
      return "Neues Dev Feedback";
    },
    []
  );

  // Prefill defaults on modal open
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

  // Pill Dragging Listeners
  useEffect(() => {
    if (!isDraggingPill) return;

    const handleMouseMove = (e: MouseEvent) => {
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
        } catch {}
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPill, pillPos]);

  const handlePillMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a")) return;

    const rect = pillRef.current?.getBoundingClientRect();
    if (!rect) return;

    pillDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
    setIsDraggingPill(true);
    e.preventDefault();
  };

  // Modal Dragging Listeners
  useEffect(() => {
    if (!isDraggingModal) return;

    const handleMouseMove = (e: MouseEvent) => {
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

  const handleModalHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button, a, input, textarea")) return;

    const rect = modalCardRef.current?.getBoundingClientRect();
    if (!rect) return;

    modalDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
    setIsDraggingModal(true);
    e.preventDefault();
  };

  // Review Mode Element Hover & Click Handlers
  useEffect(() => {
    if (!isReviewMode) {
      setHoveredRect(null);
      return;
    }

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("[data-tp-root]")) return;

      const rect = target.getBoundingClientRect();
      setHoveredRect(rect);
      setHoveredTag(target.tagName.toLowerCase());
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
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

      const textSnippet = target.textContent?.slice(0, 80).trim() || undefined;
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

  // Submit Feedback Ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const currentRoute = typeof window !== "undefined" ? window.location.pathname : "";
      const sourceFile = reactSource
        ? `${reactSource.fileName || "unknown"}:${reactSource.lineNumber || 0} ${
            reactSource.componentName ? `<${reactSource.componentName} />` : ""
          }`.trim()
        : undefined;

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
          snippet: targetInfo?.textSnippet,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setTargetInfo(null);
        setReactSource(null);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(`Fehler beim Speichern in Notion: ${data.error || res.statusText}`);
      }
    } catch (err: any) {
      alert(`Netzwerkfehler: ${err.message || String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const notionUrl = getNotionViewUrl(project);

  if (!isMounted || !isLocalhost) {
    return null;
  }

  // Active theme variables & automated contrast calculation
  const activeAccent = theme?.accent || accentColor || "#6366f1";
  const accentTextColor = theme?.accentText || getContrastColor(activeAccent);
  const themeStyle = {
    "--tp-accent": activeAccent,
    "--tp-accent-text": accentTextColor,
    "--tp-bg": theme?.background || "#18181b",
    "--tp-border": theme?.border || "rgba(255, 255, 255, 0.12)",
    "--tp-text": theme?.text || "#f8fafc",
    "--tp-focus-ring": `${activeAccent}44`,
  } as React.CSSProperties;

  return (
    <div data-tp-root="true" style={themeStyle}>
      <style dangerouslySetInnerHTML={{ __html: OVERLAY_STYLES }} />
      {/* Element Hover Highlight */}
      {isReviewMode && hoveredRect && (
        <div
          className="tp-hover-box"
          style={{
            top: hoveredRect.top,
            left: hoveredRect.left,
            width: hoveredRect.width,
            height: hoveredRect.height,
          }}
        >
          <span className="tp-hover-tag">{hoveredTag}</span>
        </div>
      )}

      {/* Floating Pill Toolbar */}
      <div
        ref={pillRef}
        onMouseDown={handlePillMouseDown}
        style={{
          position: "fixed",
          top: pillPos ? `${pillPos.y}px` : "auto",
          bottom: pillPos ? "auto" : "20px",
          left: pillPos ? `${pillPos.x}px` : "auto",
          right: pillPos ? "auto" : "20px",
        }}
        className={`tp-pill ${isDraggingPill ? "tp-pill-dragging" : ""} ${
          isResetting ? "tp-pill-resetting" : ""
        }`}
      >
        <div
          className="tp-pill-grab"
          onDoubleClick={handleResetPosition}
          title="Ziehen zum Bewegen · Doppelklick zum Zurücksetzen"
        >
          <GripVertical style={{ width: 14, height: 14 }} />
        </div>

        {/* Review Mode Toggle Button (Compact Icon-Only) */}
        <button
          type="button"
          onClick={() => setIsReviewMode(!isReviewMode)}
          className={`tp-pill-btn tp-pill-icon-btn ${isReviewMode ? "tp-pill-btn-active" : ""}`}
          title={isReviewMode ? "Review-Modus aktiv: Klicke ein Element" : "Review-Modus aktivieren"}
        >
          <Crosshair
            style={{ width: 14, height: 14 }}
            className={isReviewMode ? "animate-spin" : ""}
          />
        </button>

        {/* Open Ticket Modal Button */}
        <button
          type="button"
          onClick={() => {
            setTargetInfo(null);
            setReactSource(null);
            setIsModalOpen(true);
          }}
          title="Neues Feedback-Ticket anlegen"
          className="tp-pill-btn tp-pill-icon-btn"
        >
          <Plus style={{ width: 15, height: 15 }} />
        </button>

        <div className="tp-pill-divider" />

        {/* Open Notion Board View */}
        <button
          type="button"
          onClick={() => window.open(notionUrl, "_blank")}
          title={`Notion Board (${project}) in neuem Tab öffnen`}
          className="tp-pill-btn tp-pill-icon-btn"
        >
          <ExternalLink style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Success Notification Toast */}
      {showSuccessToast && (
        <div className="tp-toast">
          <div className="tp-toast-icon">
            <Check style={{ width: 14, height: 14 }} />
          </div>
          <span>Ticket erfolgreich in <strong>Notion</strong> gespeichert!</span>
        </div>
      )}

      {/* Ticket Creation Modal */}
      {isModalOpen && (
        <div className="tp-modal-overlay">
          <div
            ref={modalCardRef}
            style={
              modalPos
                ? {
                    position: "fixed",
                    top: `${modalPos.y}px`,
                    left: `${modalPos.x}px`,
                    margin: 0,
                  }
                : {
                    position: "relative",
                    margin: 0,
                  }
            }
            className="tp-modal-card"
          >
            {/* Draggable Header */}
            <div
              onMouseDown={handleModalHeaderMouseDown}
              className={`tp-modal-header ${isDraggingModal ? "tp-modal-header-dragging" : ""}`}
            >
              <div className="tp-modal-title">
                <span className="tp-modal-title-accent">●</span>
                <span>Feedback / Bug Report</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="tp-modal-close"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitTicket}>
              <div className="tp-modal-body">
                {/* Element Context (if selected via Review Mode) */}
                {(targetInfo || reactSource) && (
                  <div className="tp-context-box">
                    {reactSource?.componentName && (
                      <div className="tp-context-row">
                        <span className="tp-context-label">Komponente:</span>
                        <code className="tp-context-code">&lt;{reactSource.componentName} /&gt;</code>
                      </div>
                    )}
                    {reactSource?.fileName && (
                      <div className="tp-context-row">
                        <span className="tp-context-label">Datei:</span>
                        <code className="tp-context-code">
                          {reactSource.fileName.split("/").slice(-2).join("/")}:{reactSource.lineNumber}
                        </code>
                      </div>
                    )}
                    {targetInfo?.selector && (
                      <div className="tp-context-row">
                        <span className="tp-context-label">Selektor:</span>
                        <code className="tp-context-code">{targetInfo.selector}</code>
                      </div>
                    )}
                    {targetInfo?.textSnippet && (
                      <div className="tp-context-row">
                        <span className="tp-context-label">Inhalt:</span>
                        <span style={{ fontSize: 11, color: "var(--tp-muted)", fontStyle: "italic" }}>
                          "{targetInfo.textSnippet}"
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Module Input */}
                <div className="tp-form-group">
                  <label className="tp-form-label">Modul / Bereich</label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    placeholder="z.B. Dashboard, Kalender, Vertrieb..."
                    className="tp-input"
                  />
                </div>

                {/* Title Input */}
                <div className="tp-form-group">
                  <label className="tp-form-label">Titel / Zusammenfassung</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Kurze Zusammenfassung des Problems oder Wunsches"
                    className="tp-input"
                  />
                </div>

                {/* Description Input */}
                <div className="tp-form-group">
                  <label className="tp-form-label">Anweisungen für KI / Notizen</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Beschreibe genau, was angepasst oder behoben werden soll..."
                    className="tp-textarea"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="tp-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="tp-btn tp-btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="tp-btn tp-btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                      <span>Speichern...</span>
                    </>
                  ) : (
                    <>
                      <Send style={{ width: 14, height: 14 }} />
                      <span>Ticket an Notion senden</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { getNotionViewUrl };
