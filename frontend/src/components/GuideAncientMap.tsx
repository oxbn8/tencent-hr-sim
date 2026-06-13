import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import {
  readGuideMapLabelOffsets,
  writeGuideMapLabelOffsets,
  type GuideMapLabelOffset,
} from "../data/guideMapLabelOffsets";

type LabelSide = "left" | "right";

/** 临时开启：文字块拖拽 + 保存按钮（已固化偏移后可设为 false） */
const DRAG_LABELS_TEMP = false;

/** 7 日挑战 · 节点在路线上，简介 shade 与圆外缘相切 */
const MAP_NODES: {
  x: number;
  y: number;
  day: number;
  side: LabelSide;
  ty?: number;
}[] = [
  { x: 48, y: 88, day: 1, side: "right", ty: -2 },
  { x: 22, y: 72, day: 2, side: "left" },
  { x: 68, y: 58, day: 3, side: "right" },
  { x: 28, y: 44, day: 4, side: "left" },
  { x: 72, y: 30, day: 5, side: "right", ty: -4 },
  { x: 38, y: 16, day: 6, side: "left", ty: -6 },
  { x: 58, y: 6, day: 7, side: "right" },
];

const PATH_D =
  "M 48 88 C 34 82, 22 78, 22 72 C 22 66, 52 62, 68 58 C 78 54, 72 48, 28 44 C 18 40, 38 34, 72 30 C 82 26, 62 20, 38 16 C 32 12, 48 8, 58 6";

function stripDayPrefix(text: string) {
  return text.replace(/^Day\d+:\s*/i, "");
}

interface Props {
  items: string[];
}

export default function GuideAncientMap({ items }: Props) {
  const labels = items.slice(0, 7);
  const [dragEnabled, setDragEnabled] = useState(DRAG_LABELS_TEMP);
  const [offsets, setOffsets] = useState<Record<number, GuideMapLabelOffset>>({});
  const [savedTip, setSavedTip] = useState(false);
  const dragRef = useRef<{ day: number; startX: number; startY: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    setOffsets(readGuideMapLabelOffsets());
  }, []);

  const handleSave = useCallback(() => {
    writeGuideMapLabelOffsets(offsets);
    console.log("[GuideAncientMap] 已保存文字块偏移:", JSON.stringify(offsets, null, 2));
    setSavedTip(true);
    window.setTimeout(() => setSavedTip(false), 2200);
  }, [offsets]);

  const onShadePointerDown = useCallback(
    (day: number, e: ReactPointerEvent<HTMLSpanElement>) => {
      if (!dragEnabled) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const cur = offsets[day] ?? { x: 0, y: 0 };
      dragRef.current = { day, startX: e.clientX, startY: e.clientY, ox: cur.x, oy: cur.y };
      e.currentTarget.classList.add("ancient-map-shade-dragging");
    },
    [dragEnabled, offsets],
  );

  const onShadePointerMove = useCallback((day: number, e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!dragEnabled) return;
    const d = dragRef.current;
    if (!d || d.day !== day) return;
    const next = {
      x: d.ox + e.clientX - d.startX,
      y: d.oy + e.clientY - d.startY,
    };
    setOffsets((prev) => ({ ...prev, [day]: next }));
  }, [dragEnabled]);

  const onShadePointerUp = useCallback((day: number, e: ReactPointerEvent<HTMLSpanElement>) => {
    if (!dragEnabled) return;
    const d = dragRef.current;
    if (!d || d.day !== day) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    e.currentTarget.classList.remove("ancient-map-shade-dragging");
  }, [dragEnabled]);

  return (
    <div className="ancient-map" role="img" aria-label="七日征途路线">
      <div className="ancient-map-corner ancient-map-corner-tl" />
      <div className="ancient-map-corner ancient-map-corner-tr" />
      <div className="ancient-map-corner ancient-map-corner-bl" />
      <div className="ancient-map-corner ancient-map-corner-br" />
      <p className="ancient-map-title">七日征途</p>

      {DRAG_LABELS_TEMP && (
        <div className="ancient-map-edit-bar">
          <span className="ancient-map-edit-bar-label">
            {dragEnabled ? "拖拽调位中" : "预览模式"}
          </span>
          <div className="ancient-map-edit-bar-actions">
            <button
              type="button"
              className="ancient-map-edit-btn ancient-map-edit-btn-primary"
              onClick={handleSave}
            >
              保存位置
            </button>
            <button
              type="button"
              className="ancient-map-edit-btn"
              onClick={() => setDragEnabled((v) => !v)}
            >
              {dragEnabled ? "锁定" : "调整"}
            </button>
          </div>
          {savedTip && <span className="ancient-map-edit-saved">已保存</span>}
        </div>
      )}

      <div className="ancient-map-stage">
        <svg viewBox="0 0 100 100" className="ancient-map-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="parchmentGrid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#c5d9eb" strokeWidth="0.15" opacity="0.5" />
            </pattern>
          </defs>
          <rect x="2" y="2" width="96" height="96" fill="url(#parchmentGrid)" opacity="0.4" />

          <path
            d={PATH_D}
            fill="none"
            stroke="#6b8aa8"
            strokeWidth="1.2"
            strokeDasharray="3 2"
            strokeLinecap="round"
            className="ancient-map-route"
          />

          {MAP_NODES.map((node) => (
            <g key={node.day} className="ancient-map-pin-svg">
              <circle cx={node.x} cy={node.y} r="3.8" fill="#f8fbff" stroke="#8fafcf" strokeWidth="1" />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="3.4"
                fontWeight="bold"
                fill="#006EFF"
              >
                {node.day}
              </text>
            </g>
          ))}

          <text x="50" y="97" textAnchor="middle" fontSize="2.8" fill="#6b8aa8" opacity="0.75">
            ✦ S3 大厅 → HR Star ✦
          </text>
        </svg>

        <div className={`ancient-map-captions${dragEnabled ? " ancient-map-captions-draggable" : ""}`}>
          {MAP_NODES.map((node, i) => {
            const raw = labels[i] || `Day ${node.day}`;
            const text = stripDayPrefix(raw);
            const off = offsets[node.day] ?? { x: 0, y: 0 };
            return (
              <div
                key={node.day}
                className="ancient-map-anchor"
                style={
                  {
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    "--ty": `${node.ty ?? 0}px`,
                  } as CSSProperties
                }
              >
                <span
                  className={`ancient-map-shade ancient-map-shade-${node.side}${dragEnabled ? " ancient-map-shade-draggable" : ""}`}
                  style={{
                    transform: `translate(${off.x}px, calc(-50% + var(--ty, 0px) + ${off.y}px))`,
                  }}
                  onPointerDown={(e) => onShadePointerDown(node.day, e)}
                  onPointerMove={(e) => onShadePointerMove(node.day, e)}
                  onPointerUp={(e) => onShadePointerUp(node.day, e)}
                  onPointerCancel={(e) => onShadePointerUp(node.day, e)}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ol className="sr-only">
        {labels.map((g, i) => (
          <li key={g}>
            Day {i + 1}: {stripDayPrefix(g)}
          </li>
        ))}
      </ol>
    </div>
  );
}
