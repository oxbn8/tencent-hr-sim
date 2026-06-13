import { useEffect, useState } from "react";
import PenguinMascot from "./PenguinMascot";

interface Props {
  tip: string | null;
  side?: "left" | "right";
  onDismiss?: () => void;
}

/** 侧边 Mentor 鹅 · 随机 Tips */
export default function MentorPenguin({ tip, side = "right", onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!tip) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 9000);
    return () => clearTimeout(t);
  }, [tip, onDismiss]);

  if (!tip || !visible) return null;

  return (
    <div
      className={`mentor-penguin fixed bottom-8 z-40 flex items-end gap-2 max-w-[280px] ${
        side === "right" ? "right-4 flex-row-reverse" : "left-4"
      }`}
      role="status"
    >
      <div
        className={`mentor-bubble flex-1 px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg border ${
          side === "right" ? "rounded-br-sm" : "rounded-bl-sm"
        } bg-white border-blue-100 text-slate-700`}
      >
        <p className="text-[10px] font-bold text-[#006EFF] mb-1">腾讯 Mentor 鹅</p>
        {tip}
      </div>
      <div className="shrink-0">
        <PenguinMascot size={88} pose="guide" />
      </div>
    </div>
  );
}
