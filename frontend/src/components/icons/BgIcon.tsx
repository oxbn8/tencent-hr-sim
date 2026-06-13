/** 腾讯事业群 · 卡通图标 */
export default function BgIcon({
  bgId,
  size = 40,
  className = "",
}: {
  bgId: string;
  size?: number;
  className?: string;
}) {
  const common = { width: size, height: size, viewBox: "0 0 48 48", className };

  switch (bgId) {
    case "wxg":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#E8F8EE" stroke="#07C160" strokeWidth="2" />
          <ellipse cx="24" cy="26" rx="14" ry="11" fill="#fff" stroke="#07C160" strokeWidth="2" />
          <circle cx="18" cy="24" r="2" fill="#07C160" />
          <circle cx="24" cy="24" r="2" fill="#07C160" />
          <circle cx="30" cy="24" r="2" fill="#07C160" />
          <path d="M16 32 L12 36 L18 34 Z" fill="#07C160" opacity="0.6" />
        </svg>
      );
    case "pcg":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#FFF0F0" stroke="#FF6B6B" strokeWidth="2" />
          <rect x="14" y="16" width="20" height="16" rx="3" fill="#fff" stroke="#FF6B6B" strokeWidth="2" />
          <path d="M22 20 L28 24 L22 28 Z" fill="#FF6B6B" />
          <rect x="18" y="34" width="12" height="2" rx="1" fill="#FF6B6B" opacity="0.5" />
        </svg>
      );
    case "ieg":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#F3EEFF" stroke="#7C3AED" strokeWidth="2" />
          <rect x="12" y="20" width="24" height="12" rx="6" fill="#fff" stroke="#7C3AED" strokeWidth="2" />
          <circle cx="18" cy="26" r="3" fill="#7C3AED" opacity="0.3" stroke="#7C3AED" strokeWidth="1.5" />
          <circle cx="30" cy="26" r="3" fill="#7C3AED" opacity="0.3" stroke="#7C3AED" strokeWidth="1.5" />
          <rect x="20" y="14" width="8" height="4" rx="2" fill="#7C3AED" opacity="0.4" />
        </svg>
      );
    case "teg":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <ellipse cx="24" cy="20" rx="12" ry="6" fill="#fff" stroke="#006EFF" strokeWidth="2" />
          <rect x="16" y="24" width="16" height="4" rx="1" fill="#006EFF" opacity="0.3" />
          <rect x="18" y="29" width="12" height="3" rx="1" fill="#006EFF" opacity="0.5" />
          <rect x="20" y="34" width="8" height="3" rx="1" fill="#006EFF" opacity="0.7" />
        </svg>
      );
    case "csig":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#E0F4FF" stroke="#0EA5E9" strokeWidth="2" />
          <path d="M14 30 Q24 14 34 30" fill="#fff" stroke="#0EA5E9" strokeWidth="2" />
          <rect x="20" y="28" width="8" height="10" rx="1" fill="#0EA5E9" opacity="0.3" stroke="#0EA5E9" strokeWidth="1.5" />
          <circle cx="24" cy="22" r="3" fill="#0EA5E9" opacity="0.5" />
        </svg>
      );
    case "cdg":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#FFF8E8" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="24" cy="24" r="10" fill="#fff" stroke="#F59E0B" strokeWidth="2" />
          <text x="24" y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F59E0B">
            ¥
          </text>
          <path d="M14 34 L20 28 M34 34 L28 28" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="22" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <text x="24" y="28" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#006EFF">
            TX
          </text>
        </svg>
      );
  }
}
