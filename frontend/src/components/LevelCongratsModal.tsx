import { useEffect, useMemo } from "react";
import PenguinMascot from "./PenguinMascot";

interface Props {
  open: boolean;
  day: number;
  title?: string;
  onContinue: () => void;
}

const CONFETTI_COLORS = ["#006EFF", "#58CC02", "#FFC800", "#FF4B4B", "#CE82FF", "#FF9600"];

function ConfettiLayer() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${(i * 17 + 7) % 100}%`,
        delay: `${(i % 12) * 0.12}s`,
        duration: `${2.2 + (i % 5) * 0.35}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + (i % 4) * 2,
        round: i % 3 === 0,
      })),
    []
  );

  return (
    <div className="congrats-confetti pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`congrats-confetti-piece ${p.round ? "rounded-full" : "rounded-sm"}`}
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            backgroundColor: p.color,
            width: p.size,
            height: p.round ? p.size : p.size * 0.55,
          }}
        />
      ))}
    </div>
  );
}

function Fireworks() {
  const bursts = useMemo(
    () =>
      [
        { x: "18%", y: "22%", delay: "0s", color: "#FFC800" },
        { x: "78%", y: "18%", delay: "0.35s", color: "#58CC02" },
        { x: "50%", y: "12%", delay: "0.7s", color: "#006EFF" },
        { x: "32%", y: "28%", delay: "1s", color: "#FF4B4B" },
        { x: "68%", y: "26%", delay: "1.2s", color: "#CE82FF" },
      ] as const,
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {bursts.map((b, i) => (
        <div
          key={i}
          className="congrats-firework"
          style={{ left: b.x, top: b.y, animationDelay: b.delay, ["--fw-color" as string]: b.color }}
        />
      ))}
    </div>
  );
}

/** 关卡通关庆祝 · 多邻国风格 */
export default function LevelCongratsModal({ open, day, title, onContinue }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="congrats-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal
      aria-labelledby="congrats-title"
    >
      <div className="congrats-backdrop absolute inset-0 bg-[#006EFF]/92" />

      <ConfettiLayer />
      <Fireworks />

      <div className="congrats-card relative z-10 w-full max-w-sm text-center">
        <div className="congrats-penguin-wrap mx-auto mb-4">
          <PenguinMascot size={120} pose="celebrate" badge="none" className="congrats-penguin" />
        </div>

        <p className="text-white/90 text-sm font-semibold tracking-wide uppercase mb-1">Day {day} 通关</p>
        <h2 id="congrats-title" className="congrats-title text-3xl sm:text-4xl font-black text-white mb-2">
          恭喜通关！
        </h2>
        {title && <p className="text-white/85 text-sm px-4 mb-6 leading-relaxed">{title}</p>}

        <div className="flex justify-center gap-2 mb-8">
          {["🎉", "✨", "🏆", "✨", "🎉"].map((emoji, i) => (
            <span
              key={i}
              className="congrats-emoji text-2xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="congrats-cta w-full max-w-xs mx-auto block py-4 px-8 rounded-2xl bg-[#58CC02] text-white text-lg font-bold shadow-lg border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition"
        >
          继续
        </button>
      </div>
    </div>
  );
}
