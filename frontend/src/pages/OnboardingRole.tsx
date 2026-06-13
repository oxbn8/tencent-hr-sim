import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";
import OnboardingStepNav from "../components/OnboardingStepNav";
import PenguinMascot from "../components/PenguinMascot";
import HrRoleIcon from "../components/icons/HrRoleIcon";
import BgIcon from "../components/icons/BgIcon";
import type { RoleId } from "../types";

interface Role {
  id: string;
  name: string;
  slogan: string;
  available: boolean;
  hot: boolean;
  directions: string[];
  track_focus?: string;
}

interface OnboardingNotes {
  job_family: string;
  formal_hiring_hint: string;
  track_selection_label: string;
  track_selection_desc: string;
}

export default function OnboardingRole() {
  const nav = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [notes, setNotes] = useState<OnboardingNotes | null>(null);
  const [selected, setSelected] = useState<RoleId | "">("");

  const orgRaw = sessionStorage.getItem("onboarding_org");

  useEffect(() => {
    if (!orgRaw) {
      nav("/onboarding/org");
      return;
    }
    Promise.all([api.getRoles(), api.getOrg()]).then(([rolesData, orgData]) => {
      setRoles(rolesData.roles as Role[]);
      const notesData = (orgData as { onboarding_notes?: OnboardingNotes }).onboarding_notes;
      if (notesData) setNotes(notesData);
    });
  }, [nav, orgRaw]);

  const orgSummary = useMemo(() => {
    if (!orgRaw) return null;
    return JSON.parse(orgRaw) as {
      bg_id: string;
      bg_name: string;
      team_name: string;
      player_name: string;
    };
  }, [orgRaw]);

  return (
    <Layout title="实训方向">
      <OnboardingStepNav current="role" />

      {notes && (
        <div className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
          <div className="font-semibold text-slate-800">{notes.job_family}</div>
          <p className="text-slate-600 mt-1 leading-relaxed">{notes.formal_hiring_hint}</p>
          <p className="text-xs text-slate-400 mt-2">{notes.track_selection_desc}</p>
        </div>
      )}

      {orgSummary && (
        <div className="mb-5 flex gap-3 items-center p-4 rounded-xl bg-blue-50 border border-blue-100">
          <BgIcon bgId={orgSummary.bg_id} size={44} className="shrink-0" />
          <PenguinMascot size={44} pose="stand" />
          <div className="text-sm">
            <div className="font-medium text-[#006EFF]">
              {orgSummary.bg_name} · {orgSummary.team_name}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">培训生 {orgSummary.player_name} · 请选择实训方向</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-1">选择实训方向</h2>
      <p className="text-slate-600 text-sm mb-5">
        决定七日闯关的任务类型（非正式定岗）。MVP 开放沟通型与创意型，可按兴趣自由选择。
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={!r.available}
            onClick={() => r.available && setSelected(r.id as RoleId)}
            className={`text-left p-5 rounded-xl border-2 transition relative ${
              !r.available
                ? "opacity-45 cursor-not-allowed border-slate-200"
                : selected === r.id
                  ? "border-[#006EFF] bg-blue-50 shadow-sm"
                  : "border-slate-200 hover:border-blue-300"
            }`}
          >
            {r.hot && r.available && (
              <span className="absolute top-3 right-3 text-xs bg-amber-400 text-amber-900 px-2 rounded">
                需求多多
              </span>
            )}
            {!r.available && (
              <span className="absolute top-3 right-3 text-xs bg-slate-300 px-2 rounded">即将开放</span>
            )}
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">实训方向</div>
            <div className="flex items-center gap-2 mt-1">
              <HrRoleIcon role={r.id} size={36} className={!r.available ? "opacity-50" : ""} />
              <div className="font-bold text-lg">{r.name}</div>
            </div>
            <div className="text-[#006EFF] text-sm mt-1">{r.slogan}</div>
            {r.track_focus && <div className="text-xs text-slate-500 mt-1">{r.track_focus}</div>}
            <div className="text-xs text-slate-400 mt-2">{r.directions.join(" · ")}</div>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={() => {
          sessionStorage.setItem("onboarding_role", selected);
          nav("/onboarding/guide");
        }}
        className="mt-6 px-6 py-3 bg-[#006EFF] text-white rounded-lg disabled:opacity-50"
      >
        查看通关指南
      </button>
    </Layout>
  );
}
