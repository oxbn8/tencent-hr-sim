/** 能力模型 · 卡通 icon（按关键词匹配） */
function resolveKey(name: string): string {
  if (/审美|想象/.test(name)) return "imagination";
  if (/创作/.test(name)) return "creation";
  if (/AIGC|绘图|写作|视频/.test(name)) return "aigc";
  if (/人际|感知/.test(name)) return "empathy";
  if (/灵活|解决/.test(name)) return "solve";
  if (/沟通|协作/.test(name)) return "communicate";
  if (/逻辑/.test(name)) return "logic";
  if (/AI|工具/.test(name)) return "ai_tool";
  return "default";
}

export default function AbilityIcon({
  name,
  size = 32,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const s = size;
  const common = { width: s, height: s, viewBox: "0 0 48 48", className };
  const key = resolveKey(name);

  switch (key) {
    case "imagination":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="20" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <path
            d="M24 10 L26 18 L34 18 L28 23 L30 31 L24 27 L18 31 L20 23 L14 18 L22 18 Z"
            fill="#FFD700"
            stroke="#D97706"
            strokeWidth="1"
          />
          <circle cx="34" cy="14" r="2" fill="#006EFF" opacity="0.6" />
        </svg>
      );
    case "creation":
      return (
        <svg {...common} aria-hidden>
          <rect x="10" y="8" width="28" height="32" rx="3" fill="#fff" stroke="#006EFF" strokeWidth="2" />
          <path d="M16 16 H32 M16 22 H28 M16 28 H24" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
          <path d="M30 28 L38 36 L34 38 L26 30 Z" fill="#006EFF" />
        </svg>
      );
    case "aigc":
      return (
        <svg {...common} aria-hidden>
          <rect x="6" y="10" width="36" height="26" rx="4" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <circle cx="20" cy="22" r="5" fill="#FF6B35" opacity="0.85" />
          <path d="M24 26 L34 16" stroke="#006EFF" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 12 L36 10 L34 16" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "empathy":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="20" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <path
            d="M24 14 C20 14 17 17 17 21 C17 25 24 32 24 32 C24 32 31 25 31 21 C31 17 28 14 24 14 Z"
            fill="#EF4444"
          />
        </svg>
      );
    case "solve":
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="20" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <path
            d="M24 12 C18 12 14 16 14 21 C14 26 24 36 24 36 C24 36 34 26 34 21 C34 16 30 12 24 12 Z"
            fill="#FFD700"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <rect x="22" y="20" width="4" height="8" rx="1" fill="#006EFF" />
        </svg>
      );
    case "communicate":
      return (
        <svg {...common} aria-hidden>
          <rect x="6" y="12" width="22" height="16" rx="4" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <rect x="20" y="20" width="22" height="16" rx="4" fill="#fff" stroke="#006EFF" strokeWidth="2" />
          <circle cx="14" cy="20" r="2" fill="#006EFF" />
          <circle cx="20" cy="20" r="2" fill="#006EFF" opacity="0.5" />
          <circle cx="28" cy="28" r="2" fill="#006EFF" />
        </svg>
      );
    case "logic":
      return (
        <svg {...common} aria-hidden>
          <rect x="8" y="8" width="32" height="32" rx="4" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <path d="M14 32 L14 24 L20 24 L20 18 L26 18 L26 12 L32 12" fill="none" stroke="#006EFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="32" cy="12" r="3" fill="#006EFF" />
        </svg>
      );
    case "ai_tool":
      return (
        <svg {...common} aria-hidden>
          <rect x="10" y="14" width="28" height="20" rx="3" fill="#1e293b" stroke="#006EFF" strokeWidth="2" />
          <rect x="14" y="18" width="20" height="12" rx="1" fill="#006EFF" opacity="0.3" />
          <rect x="18" y="8" width="12" height="6" rx="1" fill="#006EFF" />
          <circle cx="24" cy="24" r="3" fill="#FFD700" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="24" cy="24" r="20" fill="#E8F2FF" stroke="#006EFF" strokeWidth="2" />
          <path d="M24 14 V34 M14 24 H34" stroke="#006EFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
}
