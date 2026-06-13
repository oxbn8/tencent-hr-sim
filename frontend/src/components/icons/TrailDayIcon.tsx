import type { ReactNode } from "react";

/** 关卡节点 · 按日与实训方向区分的卡通小图标 */
const CREATIVE_DAYS: Record<number, ReactNode> = {
  1: (
    <>
      <path d="M14 30 L30 18" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />
      <text x="24" y="34" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#006EFF">
        Slogan
      </text>
    </>
  ),
  2: (
    <>
      <rect x="14" y="16" width="6" height="6" rx="1" fill="#006EFF" opacity="0.3" />
      <rect x="21" y="16" width="6" height="6" rx="1" fill="#006EFF" opacity="0.5" />
      <rect x="28" y="16" width="6" height="6" rx="1" fill="#006EFF" opacity="0.3" />
      <rect x="17" y="24" width="14" height="3" rx="1" fill="#006EFF" opacity="0.4" />
    </>
  ),
  3: (
    <>
      <rect x="16" y="18" width="16" height="12" rx="2" fill="#006EFF" opacity="0.2" stroke="#006EFF" strokeWidth="1.5" />
      <circle cx="30" cy="20" r="2" fill="#FFD700" />
    </>
  ),
  4: (
    <>
      <polygon points="22,16 32,20 22,24" fill="#006EFF" opacity="0.6" />
      <rect x="14" y="26" width="20" height="3" rx="1" fill="#006EFF" opacity="0.3" />
    </>
  ),
  5: (
    <>
      <rect x="16" y="16" width="16" height="18" rx="2" fill="#fff" stroke="#006EFF" strokeWidth="1.5" />
      <line x1="19" y1="21" x2="29" y2="21" stroke="#006EFF" strokeWidth="1" opacity="0.5" />
      <line x1="19" y1="25" x2="29" y2="25" stroke="#006EFF" strokeWidth="1" opacity="0.5" />
    </>
  ),
  6: (
    <>
      <path d="M24 14 L28 22 L24 20 L20 22 Z" fill="#006EFF" opacity="0.7" />
      <ellipse cx="24" cy="28" rx="8" ry="3" fill="#006EFF" opacity="0.2" />
    </>
  ),
  7: (
    <>
      <path d="M24 14 L27 22 L24 20 L21 22 Z" fill="#FFD700" stroke="#F59E0B" strokeWidth="1" />
      <rect x="18" y="26" width="12" height="6" rx="2" fill="#006EFF" opacity="0.3" />
    </>
  ),
};

const COMM_DAYS: Record<number, ReactNode> = {
  1: (
    <>
      <rect x="14" y="18" width="20" height="14" rx="2" fill="#fff" stroke="#006EFF" strokeWidth="1.5" />
      <line x1="17" y1="22" x2="31" y2="22" stroke="#006EFF" strokeWidth="1" opacity="0.4" />
      <circle cx="30" cy="16" r="4" fill="#FF6B35" opacity="0.8" />
      <text x="30" y="18" textAnchor="middle" fontSize="6" fill="#fff">
        !
      </text>
    </>
  ),
  2: (
    <>
      <rect x="15" y="17" width="18" height="12" rx="2" fill="#E8F2FF" stroke="#006EFF" strokeWidth="1.5" />
      <path d="M18 26 L15 30 L20 28 Z" fill="#006EFF" opacity="0.4" />
      <text x="24" y="25" textAnchor="middle" fontSize="7" fill="#006EFF">
        Offer
      </text>
    </>
  ),
  3: (
    <>
      <circle cx="18" cy="22" r="5" fill="#006EFF" opacity="0.2" stroke="#006EFF" strokeWidth="1.5" />
      <circle cx="30" cy="22" r="5" fill="#FF6B35" opacity="0.2" stroke="#FF6B35" strokeWidth="1.5" />
      <path d="M23 22 L25 22" stroke="#64748B" strokeWidth="1.5" strokeDasharray="1 1" />
    </>
  ),
  4: (
    <>
      <circle cx="24" cy="20" r="6" fill="#006EFF" opacity="0.15" stroke="#006EFF" strokeWidth="1.5" />
      <path d="M21 24 Q24 28 27 24" fill="none" stroke="#006EFF" strokeWidth="1.5" />
    </>
  ),
  5: (
    <>
      <rect x="14" y="16" width="8" height="10" rx="1" fill="#006EFF" opacity="0.2" />
      <rect x="24" y="18" width="10" height="8" rx="1" fill="#006EFF" opacity="0.4" />
      <path d="M22 28 L26 28" stroke="#006EFF" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  6: (
    <>
      <circle cx="18" cy="22" r="4" fill="#006EFF" opacity="0.3" />
      <circle cx="30" cy="22" r="4" fill="#FF6B35" opacity="0.3" />
      <path d="M22 22 L26 22" stroke="#64748B" strokeWidth="2" />
    </>
  ),
  7: (
    <>
      <rect x="16" y="16" width="16" height="14" rx="2" fill="#fff" stroke="#006EFF" strokeWidth="1.5" />
      <path d="M19 22 L23 26 L29 20" fill="none" stroke="#006EFF" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
};

export default function TrailDayIcon({
  day,
  role,
  size = 28,
  dimmed = false,
  className = "",
}: {
  day: number;
  role: string;
  size?: number;
  dimmed?: boolean;
  className?: string;
}) {
  const icons = role === "comm" ? COMM_DAYS : CREATIVE_DAYS;
  const inner = icons[day] || icons[1];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`${className} ${dimmed ? "opacity-40 grayscale" : ""}`}
      aria-hidden
    >
      {inner}
    </svg>
  );
}
