import { useState } from "react";
import TrailDayIcon from "./icons/TrailDayIcon";
import PenguinMascot from "./PenguinMascot";
import type { SubmissionRecord } from "../types";

const DAY_LABEL: Record<number, { label: string; place: string }> = {
  1: { label: "入职报到", place: "S3 HR 大厅" },
  2: { label: "文案训练", place: "雇主品牌工位" },
  3: { label: "AIGC 海报", place: "创意工坊" },
  4: { label: "视频脚本", place: "传播实验室" },
  5: { label: "内容结构", place: "内容中台" },
  6: { label: "Campaign", place: "联合校招广场" },
  7: { label: "结业答辩", place: "HR Star 终点" },
};

const PATH_POINTS = [
  { x: 180, y: 488 },
  { x: 108, y: 418 },
  { x: 252, y: 352 },
  { x: 96, y: 286 },
  { x: 264, y: 218 },
  { x: 112, y: 148 },
  { x: 180, y: 72 },
];

type Pt = { x: number; y: number };

function segmentCurve(p0: Pt, p1: Pt, pPrev: Pt, pNext: Pt): string {
  const cp1x = p0.x + (p1.x - pPrev.x) / 6;
  const cp1y = p0.y + (p1.y - pPrev.y) / 6;
  const cp2x = p1.x - (pNext.x - p0.x) / 6;
  const cp2y = p1.y - (pNext.y - p0.y) / 6;
  return `M ${p0.x} ${p0.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
}

function LockIcon({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 10}, ${y - 10})`}>
      <circle cx="10" cy="10" r="11" fill="#94a3b8" stroke="#fff" strokeWidth="2" />
      <rect x="6" y="9" width="8" height="7" rx="1" fill="#fff" />
      <path d="M8 9 V7.5 a2 2 0 0 1 4 0 V9" fill="none" stroke="#fff" strokeWidth="1.5" />
    </g>
  );
}

interface TaskNode {
  day: number;
  id: string;
  title: string;
  title_rendered?: string;
  map_brief?: string;
  time_limit_seconds?: number;
}

interface Props {
  tasks: TaskNode[];
  role: string;
  currentDay: number;
  clearedDays: number[];
  submissions?: Record<string, SubmissionRecord>;
  onSelectDay?: (day: number, taskId: string) => void;
  onRecap?: (day: number, taskId: string) => void;
}

export default function MapPath({
  tasks,
  role,
  currentDay,
  clearedDays,
  submissions = {},
  onSelectDay,
  onRecap,
}: Props) {
  const sorted = [...tasks].sort((a, b) => a.day - b.day);
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const segmentLit = (day: number) => clearedDays.includes(day) || day < currentDay;
  const hoverTask = sorted.find((t) => t.day === hoverDay);
  const hoverIdx = hoverDay != null ? sorted.findIndex((t) => t.day === hoverDay) : -1;
  const hoverPt = hoverIdx >= 0 ? PATH_POINTS[hoverIdx] : null;

  const nodeState = (day: number) => {
    if (clearedDays.includes(day)) return "cleared";
    if (day === currentDay) return "current";
    if (day > currentDay) return "locked";
    return "available";
  };

  return (
    <div className="trail-map relative overflow-visible rounded-3xl">
      <div className="trail-map-bg absolute inset-0 rounded-3xl" />
      <div className="trail-hill trail-hill-1" />
      <div className="trail-hill trail-hill-2" />

      <div className="relative z-10 px-5 pt-5 pb-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-800 text-sm">七日实训路线</span>
          <span className="text-xs font-semibold text-[#006EFF] bg-blue-50 px-2.5 py-1 rounded-full">
            Day {currentDay} / 7
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">悬停关卡查看 Brief · 已通关高亮 · 未解锁灰显</p>
      </div>

      <div className="relative z-10 px-1 pb-6">
        <div className="relative max-w-sm mx-auto">
          <svg viewBox="0 0 360 540" className="w-full block" role="img" aria-label="D1-D7 实训路线">
            <defs>
              <linearGradient id="trailActive" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0052cc" />
                <stop offset="100%" stopColor="#006EFF" />
              </linearGradient>
              <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#006EFF" floodOpacity="0.15" />
              </filter>
            </defs>

            {PATH_POINTS.slice(0, -1).map((p0, i) => {
              const p1 = PATH_POINTS[i + 1];
              const pPrev = PATH_POINTS[Math.max(0, i - 1)];
              const pNext = PATH_POINTS[Math.min(PATH_POINTS.length - 1, i + 2)];
              const day = sorted[i]?.day ?? i + 1;
              const lit = segmentLit(day);
              return (
                <path
                  key={`seg-${day}`}
                  d={segmentCurve(p0, p1, pPrev, pNext)}
                  fill="none"
                  stroke={lit ? "url(#trailActive)" : "#e2e8f0"}
                  strokeWidth={lit ? 7 : 6}
                  strokeLinecap="round"
                  className="trail-segment"
                />
              );
            })}

            {sorted.map((t, i) => {
              const pt = PATH_POINTS[i] ?? PATH_POINTS[0];
              const meta = DAY_LABEL[t.day] || { label: `Day ${t.day}`, place: "" };
              const state = nodeState(t.day);
              const cleared = state === "cleared";
              const current = state === "current";
              const locked = state === "locked";
              const available = !locked;
              const r = current ? 30 : 26;

              const fill =
                cleared ? "#006EFF" : current ? "#ffffff" : locked ? "#f1f5f9" : "#ffffff";
              const stroke =
                cleared ? "#0052cc" : current ? "#006EFF" : locked ? "#cbd5e1" : "#93c5fd";
              const strokeW = current ? 4 : cleared ? 3 : 2.5;

            const sub = submissions[t.id];
            const hasRecap = cleared && sub;

            return (
              <g
                key={t.id}
                filter={available ? "url(#nodeShadow)" : undefined}
                onMouseEnter={() => setHoverDay(t.day)}
                onMouseLeave={() => setHoverDay(null)}
                style={{ cursor: hasRecap ? "pointer" : available ? "pointer" : "default" }}
                onClick={() => {
                  if (hasRecap) onRecap?.(t.day, t.id);
                  else if (available) onSelectDay?.(t.day, t.id);
                }}
              >
                  {current && (
                    <circle cx={pt.x} cy={pt.y} r={40} fill="#006EFF" opacity="0.12" className="trail-node-pulse" />
                  )}

                  {/* 扩大 hover 热区 */}
                  <circle cx={pt.x} cy={pt.y} r={36} fill="transparent" />

                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={r}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    opacity={locked ? 0.85 : 1}
                  />

                  <foreignObject
                    x={pt.x - 16}
                    y={pt.y - 16}
                    width="32"
                    height="32"
                    style={{ pointerEvents: "none" }}
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <TrailDayIcon day={t.day} role={role} size={28} dimmed={locked} />
                    </div>
                  </foreignObject>

                  {cleared && sub && (
                  <g transform={`translate(${pt.x - 14}, ${pt.y - r - 8})`}>
                    <rect x="0" y="0" width="28" height="16" rx="8" fill="#fff" stroke="#0052cc" strokeWidth="1.5" />
                    <text x="14" y="11" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#006EFF">
                      {sub.scores.overall}
                    </text>
                  </g>
                )}

                {cleared && (
                    <g transform={`translate(${pt.x + r - 14}, ${pt.y - r + 2})`}>
                      <circle cx="8" cy="8" r="9" fill="#fff" stroke="#0052cc" strokeWidth="2" />
                      <path d="M4 8 L7 11 L13 5" fill="none" stroke="#006EFF" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )}

                  {locked && <LockIcon x={pt.x + r - 6} y={pt.y - r + 4} />}

                  <text
                    x={pt.x}
                    y={pt.y + r + 18}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="600"
                    fill={locked ? "#94a3b8" : cleared ? "#006EFF" : "#334155"}
                  >
                    D{t.day} · {meta.label}
                  </text>
                  <text
                    x={pt.x}
                    y={pt.y + r + 32}
                    textAnchor="middle"
                    fontSize="9"
                    fill={locked ? "#cbd5e1" : "#94a3b8"}
                  >
                    {meta.place}
                  </text>
                </g>
              );
            })}

            {(() => {
              const idx = Math.min(Math.max(currentDay - 1, 0), PATH_POINTS.length - 1);
              const pt = PATH_POINTS[idx];
              return (
                <foreignObject x={pt.x - 24} y={pt.y - 62} width="48" height="48" style={{ pointerEvents: "none" }}>
                  <div className="trail-mascot-bounce flex justify-center">
                    <PenguinMascot size={42} pose="guide" />
                  </div>
                </foreignObject>
              );
            })()}
          </svg>

          {/* Hover Brief 浮层 */}
          {hoverTask && hoverPt && (
            <div
              className={`trail-brief-tooltip pointer-events-none absolute z-20 w-52 px-3 py-2.5 rounded-xl text-xs leading-relaxed shadow-lg transition-opacity ${
                nodeState(hoverTask.day) === "cleared"
                  ? "trail-brief-cleared"
                  : nodeState(hoverTask.day) === "locked"
                    ? "trail-brief-locked"
                    : nodeState(hoverTask.day) === "current"
                      ? "trail-brief-current"
                      : "trail-brief-available"
              }`}
              style={{
                left: `${(hoverPt.x / 360) * 100}%`,
                top: `${((hoverPt.y - 88) / 540) * 100}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div className="font-bold text-[11px] mb-1">
                D{hoverTask.day} · {hoverTask.title_rendered || hoverTask.title}
              </div>
              <p className="opacity-90 line-clamp-4">{hoverTask.map_brief || "加载任务简介…"}</p>
              {hoverTask.time_limit_seconds && (
                <p className="mt-1.5 text-[10px] opacity-70">
                  ⏱ {Math.round(hoverTask.time_limit_seconds / 60)} 分钟
                  {hoverTask.day === 3 && role === "creative" ? " · 双维评分" : ""}
                </p>
              )}
              {nodeState(hoverTask.day) === "locked" && (
                <p className="mt-1 text-[10px] font-medium">🔒 通关上一关后解锁</p>
              )}
              {submissions[hoverTask.id] && (
                <p className="mt-1 text-[10px] font-medium opacity-90">点击查看复盘卡片</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 px-5 pb-5">
        <div className="flex items-center gap-1">
          {sorted.map((t) => {
            const state = nodeState(t.day);
            return (
              <button
                key={t.id}
                type="button"
                disabled={state === "locked"}
                onMouseEnter={() => setHoverDay(t.day)}
                onMouseLeave={() => setHoverDay(null)}
                onClick={() => state !== "locked" && onSelectDay?.(t.day, t.id)}
                title={t.title_rendered || t.title}
                className={`trail-progress-dot flex-1 h-2 rounded-full transition ${
                  state === "cleared"
                    ? "bg-[#006EFF]"
                    : state === "current"
                      ? "bg-[#006EFF]/60 ring-2 ring-[#006EFF]/30"
                      : state === "locked"
                        ? "bg-slate-200 opacity-50"
                        : "bg-blue-100"
                } ${state === "locked" ? "cursor-not-allowed" : "cursor-pointer hover:opacity-90"}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-0.5">
          <span>D1 起点</span>
          <span>{clearedDays.length}/7 已通关</span>
          <span>D7 终点</span>
        </div>
      </div>
    </div>
  );
}
