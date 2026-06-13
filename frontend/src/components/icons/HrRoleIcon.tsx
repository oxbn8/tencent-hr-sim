/** HR 实训方向 · 卡通图标 */
export default function HrRoleIcon({
  role,
  size = 40,
  className = "",
}: {
  role: string;
  size?: number;
  className?: string;
}) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 48 48", className };

  switch (role) {
    case "creative":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <rect x="14" y="28" width="20" height="10" rx="2" fill="#006EFF" opacity="0.15" />
          <path d="M16 30 L32 18" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 18 L28 14 M32 18 L36 22" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="34" cy="12" r="3" fill="#FFD700" />
          <circle cx="38" cy="16" r="2" fill="#006EFF" opacity="0.6" />
          <ellipse cx="20" cy="34" rx="4" ry="2" fill="#0052cc" opacity="0.3" />
        </svg>
      );
    case "comm":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <ellipse cx="18" cy="22" rx="10" ry="8" fill="#fff" stroke="#006EFF" strokeWidth="2" />
          <ellipse cx="30" cy="26" rx="9" ry="7" fill="#006EFF" opacity="0.2" stroke="#006EFF" strokeWidth="2" />
          <circle cx="15" cy="20" r="1.5" fill="#006EFF" />
          <circle cx="19" cy="20" r="1.5" fill="#006EFF" />
          <circle cx="23" cy="20" r="1.5" fill="#006EFF" />
          <path d="M27 29 Q30 32 33 28" fill="none" stroke="#006EFF" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 28 L8 32 L14 30 Z" fill="#fff" stroke="#006EFF" strokeWidth="1.5" />
        </svg>
      );
    case "analyst":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
          <rect x="12" y="28" width="6" height="10" rx="1" fill="#94A3B8" opacity="0.5" />
          <rect x="21" y="22" width="6" height="16" rx="1" fill="#94A3B8" opacity="0.7" />
          <rect x="30" y="16" width="6" height="22" rx="1" fill="#94A3B8" opacity="0.4" />
          <circle cx="33" cy="14" r="7" fill="#fff" stroke="#94A3B8" strokeWidth="2" />
          <path d="M31 14 L33 16 L36 12" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "tech":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
          <rect x="13" y="16" width="22" height="16" rx="2" fill="#fff" stroke="#94A3B8" strokeWidth="2" />
          <rect x="16" y="19" width="16" height="10" rx="1" fill="#E2E8F0" />
          <circle cx="24" cy="36" r="2" fill="#94A3B8" />
          <path
            d="M30 12 L32 8 L34 12"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="32" cy="8" r="2" fill="#006EFF" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <text x="24" y="28" textAnchor="middle" fontSize="14" fill="#006EFF">
            HR
          </text>
        </svg>
      );
  }
}
