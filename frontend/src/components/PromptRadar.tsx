interface RubricItem {
  id: string;
  name: string;
  max: number;
}

interface Props {
  items: RubricItem[];
  dimensions: Record<string, number>;
  size?: number;
}

/** Prompt 质量五维雷达图 */
export default function PromptRadar({ items, dimensions, size = 200 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = items.length;
  if (n < 3) return null;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, ratio: number) => {
    const r = maxR * Math.min(1, ratio);
    return { x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = items.map((item, i) => {
    const val = dimensions[item.id] ?? 0;
    const ratio = item.max > 0 ? val / item.max : 0;
    return point(i, ratio);
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {gridLevels.map((lv) => (
          <polygon
            key={lv}
            points={items
              .map((_, i) => {
                const p = point(i, lv);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {items.map((_, i) => {
          const p = point(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        <path d={dataPath} fill="rgba(0,110,255,0.2)" stroke="#006EFF" strokeWidth="2" />
        {dataPoints.map((p, i) => (
          <circle key={items[i].id} cx={p.x} cy={p.y} r="4" fill="#006EFF" />
        ))}
        {items.map((item, i) => {
          const lp = point(i, 1.22);
          return (
            <text
              key={item.id}
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fill="#64748b"
            >
              {item.name}
            </text>
          );
        })}
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 w-full max-w-xs">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name}</span>
            <span className="font-medium text-[#006EFF]">
              {dimensions[item.id] ?? 0}/{item.max}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
