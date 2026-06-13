import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import GuideAncientMap from "../components/GuideAncientMap";
import ScrollInkSection from "../components/ScrollInkSection";
import Layout from "../components/Layout";
import OnboardingStepNav from "../components/OnboardingStepNav";
import ScrollGuideBook from "../components/ScrollGuideBook";
import AbilityIcon from "../components/icons/AbilityIcon";
import EquipmentIcon from "../components/icons/EquipmentIcon";
import { createNewSave, writeSave } from "../store/save";
import type { RoleId } from "../types";

interface RoleDetail {
  id: string;
  name: string;
  slogan: string;
  abilities: string[];
  equipment: { id: string; name: string; desc: string }[];
  guide_preview: string[];
}

export default function OnboardingGuide() {
  const nav = useNavigate();
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [tcamp, setTcamp] = useState("");

  useEffect(() => {
    const orgRaw = sessionStorage.getItem("onboarding_org");
    const roleId = sessionStorage.getItem("onboarding_role") as RoleId | null;
    if (!orgRaw || !roleId) {
      nav("/onboarding/org");
      return;
    }
    api.getRoles().then((d) => {
      setTcamp(d.tcamp_url);
      const r = (d.roles as RoleDetail[]).find((x) => x.id === roleId);
      setRole(r || null);
    });
  }, [nav]);

  const start = () => {
    const orgRaw = sessionStorage.getItem("onboarding_org");
    const roleId = sessionStorage.getItem("onboarding_role") as RoleId;
    if (!orgRaw || !roleId) return;
    const org = JSON.parse(orgRaw);
    const save = createNewSave({
      player_name: org.player_name,
      bg_id: org.bg_id,
      bg_name: org.bg_name,
      team_id: org.team_id,
      team_name: org.team_name,
      role: roleId,
    });
    writeSave(save);
    sessionStorage.removeItem("onboarding_org");
    sessionStorage.removeItem("onboarding_role");
    nav("/game");
  };

  if (!role) return <Layout>加载中…</Layout>;

  return (
    <Layout title="通关指南">
      <OnboardingStepNav current="guide" />

      <ScrollGuideBook title="通关指南">
        <p className="text-xs text-slate-500 mb-2">S3 职能线 · HR 与管理线 · 实训体验</p>
        <h2 className="text-2xl font-bold text-slate-800">{role.name}</h2>
        <p className="text-[#006EFF] mt-1 font-medium">{role.slogan}</p>
        <p className="text-xs text-slate-600 mt-3 p-3 bg-[#f0f6fc] rounded-lg leading-relaxed border border-[#c5d9eb]">
          你选择的实训方向仅影响本周期任务内容。正式校招以「事业群 × 职能族 × 部门」三维匹配为准，不等于最终定岗。
        </p>

        {role.abilities.length > 0 && (
          <section className="mt-6">
            <h3 className="scroll-section-title">能力模型</h3>
            <div className="ability-row">
              {role.abilities.map((a) => (
                <div key={a} className="ability-chip">
                  <div className="ability-chip-icon">
                    <AbilityIcon name={a} size={36} />
                  </div>
                  <span className="ability-chip-label">{a}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <ScrollInkSection className="mt-6">
          <h3 className="scroll-section-title scroll-ink-section-title">7 日挑战预览</h3>
          <GuideAncientMap items={role.guide_preview} />
        </ScrollInkSection>

        <section className="mt-6">
          <h3 className="scroll-section-title">必备装备</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {role.equipment.map((e) => (
              <div
                key={e.id}
                className="equipment-card flex items-start gap-3 rounded-xl px-3 py-3"
              >
                <div className="equipment-card-icon shrink-0 rounded-lg bg-blue-50/80 p-1.5 border border-blue-100">
                  <EquipmentIcon id={e.id} size={40} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800 text-sm">{e.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{e.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {tcamp && (
          <a
            href={tcamp}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-5 text-sm text-[#006EFF] underline"
          >
            观看 TCamp 岗位介绍视频 →
          </a>
        )}
      </ScrollGuideBook>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={start}
          className="px-8 py-3 bg-[#006EFF] text-white rounded-lg font-medium shadow-md hover:brightness-105 transition"
        >
          入职
        </button>
      </div>
    </Layout>
  );
}
