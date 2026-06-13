/** 7 日挑战地图 · 文字块固定偏移（px，相对锚点 + 相切基准） */
export const GUIDE_MAP_LABEL_LS_KEY = "tencent-hr-sim:guide-map-label-offsets";

export type GuideMapLabelOffset = { x: number; y: number };

/** 手调固化偏移（localStorage 无数据时使用） */
export const GUIDE_MAP_LABEL_OFFSETS: Record<number, GuideMapLabelOffset> = {
  2: { x: 89, y: 2 },
  3: { x: -49, y: 5 },
  4: { x: 69, y: -6 },
  5: { x: -63, y: 6 },
  6: { x: 35, y: 2 },
  7: { x: -23, y: 0 },
};

export function readGuideMapLabelOffsets(): Record<number, GuideMapLabelOffset> {
  if (typeof window === "undefined") return { ...GUIDE_MAP_LABEL_OFFSETS };
  try {
    const raw = localStorage.getItem(GUIDE_MAP_LABEL_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, GuideMapLabelOffset>;
      const out: Record<number, GuideMapLabelOffset> = { ...GUIDE_MAP_LABEL_OFFSETS };
      for (const [k, v] of Object.entries(parsed)) {
        if (v && typeof v.x === "number" && typeof v.y === "number") {
          out[Number(k)] = v;
        }
      }
      return out;
    }
  } catch {
    /* ignore */
  }
  return { ...GUIDE_MAP_LABEL_OFFSETS };
}

export function writeGuideMapLabelOffsets(offsets: Record<number, GuideMapLabelOffset>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUIDE_MAP_LABEL_LS_KEY, JSON.stringify(offsets));
}

export function hasSavedGuideMapLabelOffsets(): boolean {
  if (typeof window === "undefined") return Object.keys(GUIDE_MAP_LABEL_OFFSETS).length > 0;
  try {
    if (localStorage.getItem(GUIDE_MAP_LABEL_LS_KEY)) return true;
  } catch {
    /* ignore */
  }
  return Object.keys(GUIDE_MAP_LABEL_OFFSETS).length > 0;
}
