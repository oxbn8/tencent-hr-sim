import type { CSSProperties, ReactNode } from "react";

/** 水墨粒子落点（对应地图局部 → 整体晕染） */
const INK_PARTICLES = [
  { x: 48, y: 78, delay: 0.5, scale: 1.15 },
  { x: 22, y: 62, delay: 0.56, scale: 0.95 },
  { x: 68, y: 52, delay: 0.6, scale: 1.05 },
  { x: 28, y: 40, delay: 0.66, scale: 0.9 },
  { x: 72, y: 28, delay: 0.72, scale: 1 },
  { x: 38, y: 14, delay: 0.78, scale: 0.85 },
  { x: 56, y: 8, delay: 0.84, scale: 0.8 },
  { x: 42, y: 48, delay: 0.62, scale: 1.2 },
  { x: 62, y: 66, delay: 0.54, scale: 0.88 },
  { x: 16, y: 44, delay: 0.7, scale: 0.75 },
  { x: 84, y: 36, delay: 0.76, scale: 0.82 },
  { x: 50, y: 24, delay: 0.82, scale: 0.92 },
  { x: 34, y: 70, delay: 0.58, scale: 1.08 },
  { x: 66, y: 18, delay: 0.88, scale: 0.78 },
  { x: 52, y: 56, delay: 0.64, scale: 0.86 },
  { x: 30, y: 22, delay: 0.8, scale: 0.7 },
];

interface Props {
  children: ReactNode;
  className?: string;
}

/** 7 日挑战区块 · 卷轴展开后粒子化水墨晕染 */
export default function ScrollInkSection({ children, className = "" }: Props) {
  return (
    <section className={`scroll-ink-section ${className}`.trim()}>
      <div className="scroll-ink-field" aria-hidden>
        {INK_PARTICLES.map((p, i) => (
          <span
            key={i}
            className="scroll-ink-particle"
            style={
              {
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.delay}s`,
                "--ink-scale": p.scale,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="scroll-ink-veil" aria-hidden />
      {children}
    </section>
  );
}
