import { useEffect, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  title?: string;
}

/** 通关指南 · 封存卷轴，进入后上下展开 */
export default function ScrollGuideBook({ children, title = "通关指南" }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setOpen(true), 180);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={`scroll-guide ${open ? "scroll-guide-open" : ""}`}>
      <div className="scroll-guide-cap scroll-guide-cap-top" aria-hidden />
      <div className="scroll-guide-paper">
        <div className="scroll-guide-sealed" aria-hidden={open}>
          <div className="scroll-guide-seal">{title}</div>
          <div className="scroll-guide-sealed-text">轻触展开 · 实训密卷</div>
        </div>
        <div className="scroll-guide-content">
          <div className="scroll-guide-inner">{children}</div>
        </div>
      </div>
      <div className="scroll-guide-cap scroll-guide-cap-bottom" aria-hidden />
    </div>
  );
}
