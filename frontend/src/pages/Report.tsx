import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";
import { loadSave } from "../store/save";
import type { SaveGameV1 } from "../types";

interface Personality {
  work_style: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  role_fit: string;
  analysis_summary: string;
  avg_score?: number;
}

export default function Report() {
  const nav = useNavigate();
  const [save, setSave] = useState<SaveGameV1 | null>(null);
  const [personality, setPersonality] = useState<Personality | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [tcamp, setTcamp] = useState("");

  useEffect(() => {
    const s = loadSave();
    if (!s) {
      nav("/");
      return;
    }
    setSave(s);
    api.getRoles().then((d) => setTcamp(d.tcamp_url));

    const subs = Object.values(s.submissions).map((sub) => ({
      deliverable: sub.deliverable || {},
      scores: sub.scores,
      feedback: sub.feedback,
      chat_log: sub.chat_log || [],
    }));
    if (subs.length > 0) {
      api.analyzePersonality(s.role, subs).then(setPersonality);
    }
  }, [nav]);

  const sendFeedback = async () => {
    if (!save) return;
    await api.sendFeedback({
      player_name: save.player_name,
      role: save.role,
      rating,
      comment,
      meta: { cleared_days: save.progress.cleared_days.length },
    });
    setFeedbackSent(true);
  };

  if (!save) return null;

  const subs = Object.values(save.submissions);

  return (
    <Layout title="成长报告">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">培训生 · 第一周实训报告</h2>
        <p className="text-slate-500 text-sm mt-2">
          {save.player_name} · {save.org.bg_name} · {save.org.team_name}
        </p>
      </div>

      {personality && (
        <div className="tx-card p-6 mb-6">
          <h3 className="font-bold text-lg text-center mb-4">🧭 性格与工作特点分析</h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-4">{personality.analysis_summary}</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 text-sm mb-2">优点</h4>
              <ul className="text-sm space-y-1 text-green-900">
                {personality.strengths.map((s) => (
                  <li key={s}>✓ {s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 text-sm mb-2">待提升</h4>
              <ul className="text-sm space-y-1 text-amber-900">
                {personality.weaknesses.map((w) => (
                  <li key={w}>→ {w}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-sm space-y-2 bg-slate-50 rounded-xl p-4">
            <p>
              <span className="text-slate-500">工作风格：</span>
              {personality.work_style}
            </p>
            <p>
              <span className="text-slate-500">角色契合：</span>
              {personality.role_fit}
            </p>
            {personality.traits.length > 0 && (
              <p>
                <span className="text-slate-500">标签：</span>
                {personality.traits.join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="tx-card p-6 mb-6">
        <h3 className="font-bold mb-3 text-center">每日得分</h3>
        <div className="space-y-2">
          {subs.map((s) => (
            <div key={s.task_id} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
              <span>{s.task_id}</span>
              <span className="text-[#006EFF] font-medium">
                {s.scores.overall}
                {s.scores.prompt != null && ` · 提示词 ${s.scores.prompt}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="tx-card p-6 mb-6">
        <h3 className="font-bold mb-4 text-center">📝 实训反馈</h3>
        {feedbackSent ? (
          <p className="text-center text-green-600 text-sm">感谢你的反馈！</p>
        ) : (
          <>
            <label className="block text-sm mb-2">整体满意度（1-5）</label>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`w-10 h-10 rounded-full border-2 font-medium ${
                    rating >= n ? "bg-[#006EFF] text-white border-[#006EFF]" : "border-slate-200"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded-xl p-3 text-sm min-h-[80px] mb-3"
              placeholder="对模拟场、AI Chat、评分系统的建议…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button type="button" onClick={sendFeedback} className="tx-btn-primary w-full">
              提交反馈
            </button>
          </>
        )}
      </div>

      {tcamp && (
        <p className="text-center">
          <a href={tcamp} target="_blank" rel="noreferrer" className="text-[#006EFF] text-sm underline">
            TCamp AI-HR 岗位介绍 →
          </a>
        </p>
      )}

      <p className="text-center mt-6">
        <Link to="/" className="text-sm text-slate-400">
          返回首页
        </Link>
      </p>
    </Layout>
  );
}
