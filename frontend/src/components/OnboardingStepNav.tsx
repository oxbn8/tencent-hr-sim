import { useNavigate } from "react-router-dom";

export type OnboardingStep = "org" | "role" | "guide";

const STEPS: { id: OnboardingStep; label: string; path: string }[] = [
  { id: "org", label: "事业群", path: "/onboarding/org" },
  { id: "role", label: "实训方向", path: "/onboarding/role" },
  { id: "guide", label: "通关指南", path: "/onboarding/guide" },
];

function canGoTo(step: OnboardingStep): boolean {
  const hasOrg = !!sessionStorage.getItem("onboarding_org");
  const hasRole = !!sessionStorage.getItem("onboarding_role");
  if (step === "org") return true;
  if (step === "role") return hasOrg;
  if (step === "guide") return hasOrg && hasRole;
  return false;
}

interface Props {
  current: OnboardingStep;
}

/** Onboarding 顶部步骤条 · 可点击返回前序页面 */
export default function OnboardingStepNav({ current }: Props) {
  const nav = useNavigate();
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <nav className="mb-6 flex flex-wrap gap-2 text-sm" aria-label="实训引导步骤">
      {STEPS.map((step, i) => {
        const isCurrent = step.id === current;
        const isPast = i < currentIdx;
        const reachable = canGoTo(step.id) && !isCurrent;

        if (isCurrent) {
          return (
            <span
              key={step.id}
              className="px-4 py-1.5 rounded-full bg-[#006EFF] text-white font-medium shadow-sm"
              aria-current="step"
            >
              {step.label}
            </span>
          );
        }

        if (reachable || isPast) {
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => nav(step.path)}
              className="px-4 py-1.5 rounded-full bg-white border-2 border-[#006EFF]/30 text-[#006EFF] font-medium hover:bg-blue-50 hover:border-[#006EFF] transition cursor-pointer"
            >
              ← {step.label}
            </button>
          );
        }

        return (
          <span
            key={step.id}
            className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-400 cursor-not-allowed"
            title="请先完成前一步"
          >
            {step.label}
          </span>
        );
      })}
    </nav>
  );
}
