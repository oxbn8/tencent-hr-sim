import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { api } from "../api";

import AiStatusBadge from "../components/AiStatusBadge";

import Layout from "../components/Layout";

import MapPath from "../components/MapPath";
import PenguinMascot from "../components/PenguinMascot";
import BgIcon from "../components/icons/BgIcon";
import HrRoleIcon from "../components/icons/HrRoleIcon";

import { getContext, loadSave, refreshHints, writeSave } from "../store/save";

import LevelRecapModal from "../components/LevelRecapModal";
import MentorPenguin from "../components/MentorPenguin";
import { useMentorTips } from "../hooks/useMentorTips";
import type { SaveGameV1, TaskSummary } from "../types";



const ROLE_LABEL: Record<string, string> = {

  creative: "创意型 HR",

  comm: "沟通型 HR",

};



interface BgInfo {

  id: string;

  name_cn: string;

  intro?: string;

  culture_summary?: string;

  highlights?: string[];

}

interface TeamInfo {

  id: string;

  name: string;

  description?: string;

  focus?: string;

  hr_note?: string;

}



export default function Game() {

  const nav = useNavigate();

  const [save, setSave] = useState<SaveGameV1 | null>(null);

  const [tasks, setTasks] = useState<TaskSummary[]>([]);

  const [bgInfo, setBgInfo] = useState<BgInfo | null>(null);

  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [recapDay, setRecapDay] = useState<number | null>(null);
  const [recapTaskId, setRecapTaskId] = useState("");
  const { tip, pick, dismiss, scheduleRandom } = useMentorTips(save?.role || "creative");



  useEffect(() => {

    let s = loadSave();

    if (!s) {

      nav("/");

      return;

    }

    s = refreshHints(s);

    writeSave(s);

    setSave(s);

    api.getTasks(s.role, {
      bg_name: s.org.bg_name,
      team_name: s.org.team_name,
      player_name: s.player_name,
    }).then((list) => setTasks(list.sort((a, b) => a.day - b.day)));

    api.getOrg().then((org) => {

      const bg = (org.business_groups as BgInfo[]).find((b) => b.id === s!.org.bg_id);

      const team = (org.teams as TeamInfo[]).find((t) => t.id === s!.org.team_id);

      setBgInfo(bg || null);

      setTeamInfo(team || null);

    });

  }, [nav]);

  useEffect(() => {
    if (!save) return;
    pick("general");
    const stop = scheduleRandom(60000);
    return stop;
  }, [save, pick, scheduleRandom]);

  if (!save) return null;



  const ctx = getContext(save);

  const allDone = save.progress.cleared_days.length >= 7;

  const todayTask = tasks.find((x) => x.day === save.progress.current_day);



  return (

    <Layout title={`Day ${save.progress.current_day}`}>

      <div className="text-center mb-6">

        <div className="flex justify-center items-center gap-3 mb-2">
          <BgIcon bgId={save.org.bg_id} size={48} />
          <HrRoleIcon role={save.role} size={48} />
          <PenguinMascot size={48} pose={allDone ? "celebrate" : "stand"} />
        </div>

        <p className="text-sm text-[#006EFF] font-medium">S3 职能线 · HR 与管理线</p>

        <h1 className="text-2xl font-bold mt-1">

          {save.org.bg_name} · {save.org.team_name}

        </h1>

        <p className="text-slate-500 text-sm mt-2">

          {ROLE_LABEL[save.role]} · 培训生 · {save.player_name}

        </p>

        <div className="mt-3 flex justify-center">

          <AiStatusBadge variant="light" />

        </div>

      </div>



      {(bgInfo || teamInfo) && (

        <div className="tx-card p-4 mb-6 text-sm">

          <h3 className="font-bold text-slate-700 mb-2">📖 所属组织介绍</h3>

          {bgInfo?.culture_summary && (
            <p className="text-[#006EFF] font-medium text-xs mb-2">文化概括：{bgInfo.culture_summary}</p>
          )}

          {bgInfo?.intro && <p className="text-slate-600 leading-relaxed mb-2">{bgInfo.intro}</p>}

          {teamInfo?.description && (

            <p className="text-slate-500 text-xs mb-1">

              <span className="font-medium text-slate-600">{teamInfo.name}：</span>

              {teamInfo.description}

            </p>

          )}

          {teamInfo?.focus && (

            <p className="text-xs text-slate-400">业务重点 · {teamInfo.focus}</p>

          )}

          {teamInfo?.hr_note && (

            <p className="text-xs text-[#006EFF]/80 mt-2 bg-blue-50 rounded-lg p-2">{teamInfo.hr_note}</p>

          )}

        </div>

      )}



      <MapPath
        tasks={tasks}
        role={save.role}
        currentDay={save.progress.current_day}
        clearedDays={save.progress.cleared_days}
        submissions={save.submissions}
        onSelectDay={(_day, taskId) => nav(`/game/challenge/${taskId}`)}
        onRecap={(day, taskId) => {
          setRecapDay(day);
          setRecapTaskId(taskId);
        }}
      />

      <LevelRecapModal
        open={recapDay != null}
        onClose={() => {
          setRecapDay(null);
          setRecapTaskId("");
        }}
        day={recapDay || 1}
        title={tasks.find((t) => t.id === recapTaskId)?.title_rendered || ""}
        submission={save.submissions[recapTaskId] || null}
      />

      <MentorPenguin tip={tip} onDismiss={dismiss} />



      <div className="tx-card p-6 mt-6 text-center">

        {allDone ? (

          <>

            <h3 className="text-xl font-bold text-green-700">🎉 恭喜通关本周实训！</h3>

            <p className="text-sm text-slate-600 mt-2 mb-4">查看性格分析与工作特点报告</p>

            <Link to="/game/report" className="tx-btn-primary">

              成长报告 & 反馈

            </Link>

          </>

        ) : todayTask ? (

          <>

            <p className="text-xs text-slate-500 mb-2">当前关卡</p>

            <h2 className="text-lg font-bold mb-2">

              {todayTask.title.replace("{team_name}", ctx.team_name)}

            </h2>

            <p className="text-sm text-slate-500 mb-4">

              限时 {Math.round(todayTask.time_limit_seconds / 60)} 分钟

              {todayTask.scoring_mode === "dual" && " · 成稿 + 提示词双维评分"}

            </p>

            <button

              type="button"

              onClick={() => nav(`/game/challenge/${todayTask.id}`)}

              className="tx-btn-primary"

            >

              开始 Day {todayTask.day} 挑战

            </button>

          </>

        ) : (

          <p>加载中…</p>

        )}

        <p className="text-xs text-slate-400 mt-4">导师提示剩余 {save.resources.hints_left_today} 次</p>
        <Link to="/admin" className="text-xs text-slate-300 hover:text-[#006EFF] mt-2 inline-block">
          管理看板 →
        </Link>
      </div>

    </Layout>

  );

}

