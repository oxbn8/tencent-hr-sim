/** 必备装备 · 卡通 icon */
export default function EquipmentIcon({
  id,
  size = 36,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 48 48", className };

  switch (id) {
    case "eq_aigc_draw":
      return (
        <svg {...common} aria-hidden>
          <rect x="6" y="8" width="36" height="28" rx="4" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <rect x="10" y="12" width="28" height="18" rx="2" fill="#fff" />
          <circle cx="18" cy="20" r="4" fill="#FF6B35" opacity="0.8" />
          <path d="M22 24 L32 14" stroke="#006EFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M28 10 L34 8 L32 14" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "eq_aigc_write":
      return (
        <svg {...common} aria-hidden>
          <rect x="10" y="6" width="28" height="36" rx="3" fill="#fff" stroke="#006EFF" strokeWidth="2" />
          <path d="M16 14 H32 M16 20 H30 M16 26 H28" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 30 L38 38 L34 40 L26 32 Z" fill="#006EFF" />
          <path d="M30 30 L34 34" stroke="#0052cc" strokeWidth="1.5" />
        </svg>
      );
    case "eq_listener":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="20" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <path
            d="M24 12 C18 12 14 18 14 24 V28 H18 V24 C18 20 20 16 24 16 C28 16 30 20 30 24 V28 H34 V24 C34 18 30 12 24 12 Z"
            fill="#D97706"
          />
          <path d="M20 28 C20 32 22 36 24 36 C26 36 28 32 28 28" fill="none" stroke="#D97706" strokeWidth="2" />
        </svg>
      );
    case "eq_script_helper":
      return (
        <svg {...common} aria-hidden>
          <rect x="8" y="10" width="32" height="24" rx="6" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <circle cx="18" cy="22" r="3" fill="#006EFF" />
          <rect x="24" y="18" width="12" height="3" rx="1.5" fill="#006EFF" opacity="0.5" />
          <rect x="24" y="24" width="8" height="3" rx="1.5" fill="#006EFF" opacity="0.35" />
          <path d="M24 6 L26 2 L28 6" fill="#006EFF" />
          <circle cx="26" cy="2" r="2" fill="#FFD700" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="20" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <rect x="16" y="18" width="16" height="14" rx="2" fill="#006EFF" opacity="0.2" />
          <path d="M20 24 H28" stroke="#006EFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
