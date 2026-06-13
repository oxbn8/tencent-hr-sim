import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { api } from "../api";

import Layout from "../components/Layout";
import OnboardingStepNav from "../components/OnboardingStepNav";
import PenguinMascot from "../components/PenguinMascot";
import BgIcon from "../components/icons/BgIcon";



interface BG {

  id: string;

  name: string;

  name_cn: string;

  description: string;

  intro?: string;

  culture_summary?: string;

  highlights?: string[];

}

interface Team {

  id: string;

  bg_id: string;

  name: string;

  description?: string;

  focus?: string;

  hr_note?: string;

}



export default function OnboardingOrg() {

  const nav = useNavigate();

  const [bgs, setBgs] = useState<BG[]>([]);

  const [teams, setTeams] = useState<Team[]>([]);

  const [step, setStep] = useState(1);

  const [bgId, setBgId] = useState("");

  const [teamId, setTeamId] = useState("");

  const [playerName, setPlayerName] = useState("");



  useEffect(() => {

    api.getOrg().then((d) => {

      setBgs(d.business_groups as BG[]);

      setTeams(d.teams as Team[]);

    });

  }, []);



  const filteredTeams = teams.filter((t) => t.bg_id === bgId);

  const selectedBg = bgs.find((b) => b.id === bgId);

  const selectedTeam = teams.find((t) => t.id === teamId);



  const confirm = () => {

    const team = teams.find((t) => t.id === teamId);

    if (!selectedBg || !team || !playerName.trim()) return;

    sessionStorage.setItem(

      "onboarding_org",

      JSON.stringify({

        bg_id: selectedBg.id,

        bg_name: selectedBg.name_cn,

        team_id: team.id,

        team_name: team.name,

        player_name: playerName.trim(),

      })

    );

    nav("/onboarding/role");

  };



  return (

    <Layout title="组织选择">

      <OnboardingStepNav current="org" />

      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100">

        <PenguinMascot size={48} pose="guide" />

        <p className="text-sm text-slate-600">

          先了解腾讯六大事业群与产品小组，选择你即将加入的组织。

        </p>

      </div>



      <div className="mb-6 flex gap-2 text-sm">

        {[1, 2, 3].map((s) => {

          const label = s === 1 ? "事业群" : s === 2 ? "产品小组" : "职级";

          if (step === s) {

            return (

              <span

                key={s}

                className="px-3 py-1 rounded-full bg-[#006EFF] text-white font-medium"

              >

                {label}

              </span>

            );

          }

          if (s < step) {

            return (

              <button

                key={s}

                type="button"

                onClick={() => {

                  setStep(s);

                  if (s === 1) {

                    setTeamId("");

                  }

                }}

                className="px-3 py-1 rounded-full bg-white border border-[#006EFF]/30 text-[#006EFF] hover:bg-blue-50 transition cursor-pointer"

              >

                ← {label}

              </button>

            );

          }

          return (

            <span key={s} className="px-3 py-1 rounded-full bg-slate-100 text-slate-400">

              {label}

            </span>

          );

        })}

      </div>



      {step === 1 && (

        <div>

          <h2 className="text-xl font-bold mb-2">选择事业群</h2>

          <p className="text-sm text-slate-500 mb-4">腾讯按事业群（BG）组织业务，每个 BG 有独特的文化与 HR 侧重点。</p>

          <div className="grid sm:grid-cols-2 gap-3">

            {bgs.map((bg) => (

              <button

                key={bg.id}

                type="button"

                onClick={() => {

                  setBgId(bg.id);

                  setTeamId("");

                  setStep(2);

                }}

                className={`text-left p-4 rounded-xl border-2 transition ${

                  bgId === bg.id ? "border-[#006EFF] bg-blue-50" : "border-slate-200 hover:border-blue-300"

                }`}

              >

                <div className="flex items-start gap-3">
                  <BgIcon bgId={bg.id} size={44} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                <div className="font-bold">

                  {bg.name} · {bg.name_cn}

                </div>

                <div className="text-sm text-slate-600 mt-1">{bg.description}</div>

                {bg.culture_summary && (
                  <p className="text-xs text-[#006EFF] font-medium mt-2 leading-relaxed">
                    文化概括：{bg.culture_summary}
                  </p>
                )}

                {bg.intro && (

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{bg.intro}</p>

                )}

                {bg.highlights && (

                  <div className="flex flex-wrap gap-1 mt-2">

                    {bg.highlights.map((h) => (

                      <span key={h} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">

                        {h}

                      </span>

                    ))}

                  </div>

                )}

                  </div>
                </div>

              </button>

            ))}

          </div>

        </div>

      )}



      {step === 2 && (

        <div>

          <button type="button" className="text-sm text-[#006EFF] mb-3" onClick={() => setStep(1)}>

            ← 返回事业群

          </button>



          {selectedBg && (

            <div className="tx-card p-4 mb-4 bg-gradient-to-r from-blue-50 to-white">

              <h3 className="font-bold text-[#006EFF]">

                {selectedBg.name} · {selectedBg.name_cn}

              </h3>

              {selectedBg.culture_summary && (
                <p className="text-sm text-[#006EFF] font-medium mt-2 leading-relaxed">
                  文化概括：{selectedBg.culture_summary}
                </p>
              )}

              {selectedBg.intro && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{selectedBg.intro}</p>}

              {selectedBg.highlights && (

                <ul className="text-xs text-slate-500 mt-2 list-disc pl-4 space-y-0.5">

                  {selectedBg.highlights.map((h) => (

                    <li key={h}>{h}</li>

                  ))}

                </ul>

              )}

            </div>

          )}



          <h2 className="text-xl font-bold mb-4">选择产品小组</h2>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">

            {filteredTeams.map((t) => (

              <button

                key={t.id}

                type="button"

                onClick={() => setTeamId(t.id)}

                className={`text-left p-4 rounded-xl border-2 transition ${

                  teamId === t.id ? "border-[#006EFF] bg-blue-50" : "border-slate-200 hover:border-blue-200"

                }`}

              >

                <div className="font-bold">{t.name}</div>

                {t.description && <p className="text-sm text-slate-600 mt-1">{t.description}</p>}

                {t.focus && (

                  <p className="text-xs text-slate-400 mt-1">

                    业务重点：{t.focus}

                  </p>

                )}

              </button>

            ))}

          </div>



          {selectedTeam?.hr_note && (

            <div className="flex gap-2 items-start p-3 mb-4 rounded-xl bg-amber-50 border border-amber-100 text-sm">

              <PenguinMascot size={32} pose="think" badge="none" />

              <div>

                <div className="font-medium text-amber-900 text-xs mb-1">HR 实训提示</div>

                <p className="text-amber-800/80 text-xs leading-relaxed">{selectedTeam.hr_note}</p>

              </div>

            </div>

          )}



          <label className="block text-sm font-medium mb-1">你的姓名（用于 Brief）</label>

          <input

            className="w-full border rounded-lg px-3 py-2 mb-4"

            value={playerName}

            onChange={(e) => setPlayerName(e.target.value)}

            placeholder="例如：张明"

          />

          <button

            type="button"

            disabled={!teamId || !playerName.trim()}

            onClick={() => setStep(3)}

            className="px-5 py-2 bg-[#006EFF] text-white rounded-lg disabled:opacity-50"

          >

            下一步

          </button>

        </div>

      )}



      {step === 3 && (

        <div>

          <button type="button" className="text-sm text-[#006EFF] mb-3" onClick={() => setStep(2)}>

            ← 返回

          </button>

          <h2 className="text-xl font-bold mb-4">职级起点</h2>

          <button

            type="button"

            onClick={confirm}

            className="w-full text-left p-4 rounded-xl border-2 border-[#006EFF] bg-blue-50 mb-3"

          >

            <span className="text-xs bg-[#006EFF] text-white px-2 py-0.5 rounded">推荐</span>

            <div className="font-bold mt-2">培训生</div>

            <div className="text-sm text-slate-600">HR Star 选拔通过，下一步选择实训方向</div>

          </button>

          <div className="p-4 rounded-xl border border-slate-200 opacity-50">

            <div className="font-bold">实习生</div>

            <div className="text-sm">即将开放</div>

          </div>

        </div>

      )}

    </Layout>

  );

}

