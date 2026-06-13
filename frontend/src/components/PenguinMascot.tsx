export type PenguinPose = "think" | "wave" | "stand" | "celebrate" | "guide";

/** @deprecated 使用 pose */
export type PenguinVariant = "default" | "wave" | "think";

interface Props {
  size?: number;
  pose?: PenguinPose;
  /** 兼容旧 API：default→stand, wave→wave, think→think */
  variant?: PenguinVariant;
  className?: string;
  badge?: "ai" | "none";
}

const POSE_SRC: Record<PenguinPose, string> = {
  think: "/assets/tencent-penguin-think.png",
  wave: "/assets/tencent-penguin-wave.png",
  stand: "/assets/tencent-penguin-stand.png",
  celebrate: "/assets/tencent-penguin-celebrate.png",
  guide: "/assets/tencent-penguin-guide.png",
};

const VARIANT_TO_POSE: Record<PenguinVariant, PenguinPose> = {
  default: "stand",
  wave: "wave",
  think: "think",
};

/** 腾讯 QQ 3D 企鹅 · 多动作姿态 */
function PenguinMascot({
  size = 72,
  pose,
  variant = "default",
  className = "",
  badge,
}: Props) {
  const resolvedPose = pose ?? VARIANT_TO_POSE[variant];
  const src = POSE_SRC[resolvedPose];
  const showAiBadge = badge === "ai" || (badge == null && resolvedPose === "think");

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title="腾讯企鹅"
    >
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        draggable={false}
        className="w-full h-full object-cover rounded-2xl select-none pointer-events-none drop-shadow-sm"
        style={{ objectPosition: "50% 42%" }}
      />
      {showAiBadge && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[22px] h-[22px] px-1 flex items-center justify-center rounded-full bg-[#006EFF] text-white text-[10px] font-bold border-2 border-white shadow-sm">
          AI
        </span>
      )}
    </div>
  );
}

export default PenguinMascot;
