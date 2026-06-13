import { Link } from "react-router-dom";
import PenguinMascot from "./PenguinMascot";

export default function Layout({
  children,
  title,
  hero = false,
}: {
  children: React.ReactNode;
  title?: string;
  hero?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/95 backdrop-blur border-b border-slate-100 sticky top-0 z-50">
        <div className="tx-page-center max-w-4xl flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <PenguinMascot size={32} pose="stand" />
            <span className="font-semibold text-slate-800 hidden sm:inline">腾讯 HR 模拟场</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <a
              href="https://join.qq.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-[#006EFF]"
            >
              腾讯招聘
            </a>
            {title && <span className="text-[#006EFF] font-medium">{title}</span>}
          </nav>
        </div>
      </header>

      {hero ? (
        <div className="tx-hero">{children}</div>
      ) : (
        <main className="flex-1 tx-page-center max-w-4xl py-8">{children}</main>
      )}

      <footer className="text-center text-xs text-slate-400 py-6">
        本产品为模拟实训，非腾讯官方招聘/培训系统 · 设计风格参考 join.qq.com
      </footer>
    </div>
  );
}
