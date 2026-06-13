import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";
import PromptRadar from "../components/PromptRadar";
import { loadSave } from "../store/save";
import { buildAdminStatsFromSave, type AdminStatsData } from "../utils/adminStatsFromSave";

const PROMPT_RUBRIC = [
  { id: "structure", name: "结构清晰", max: 20 },
  { id: "specificity", name: "具体明确", max: 25 },
  { id: "constraints", name: "约束完整", max: 20 },
  { id: "style_language", name: "风格语言", max: 15 },
  { id: "iteration", name: "迭代优化", max: 20 },
];

export default function Admin() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [notice, setNotice] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api
      .getAdminStats()
      .then((data) => {
        setStats(data);
        setErr("");
      })
      .catch(() => {
        const local = buildAdminStatsFromSave(loadSave());
        if (local) {
          setStats(local);
          setNotice("后端 admin 接口暂不可用，已显示本机浏览器存档中的提交数据。请重启后端以查看全量统计。");
          setErr("");
        } else {
          setErr("无法连接管理看板 API。请确认后端已启动（python main.py），并访问 http://127.0.0.1:5070/api/admin/stats");
        }
      });
  }, []);

  return (
    <Layout title="管理看板">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">HR 模拟场 · 管理看板</h1>
          <p className="text-sm text-slate-500 mt-1">实训提交、通过率与 Prompt 维度汇总</p>
        </div>
        <Link to="/" className="text-sm text-[#006EFF]">
          ← 返回首页
        </Link>
      </div>

      {notice && (
        <p className="text-amber-800 text-sm mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">{notice}</p>
      )}
      {err && <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">{err}</p>}
      {!stats && !err && <p className="text-slate-500">加载中…</p>}

      {stats && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "总提交", value: stats.totals.submissions },
              { label: "通过率", value: `${stats.totals.pass_rate}%` },
              { label: "平均分", value: stats.totals.avg_overall_score },
              { label: "反馈数", value: stats.totals.feedback_count },
            ].map((c) => (
              <div key={c.label} className="tx-card p-4 text-center">
                <div className="text-2xl font-bold text-[#006EFF]">{c.value}</div>
                <div className="text-xs text-slate-500 mt-1">{c.label}</div>
              </div>
            ))}
          </div>

          <div className="tx-card p-5">
            <h3 className="font-bold mb-2">混元接入</h3>
            <p className="text-sm text-slate-600">
              {stats.ai_config.chat_configured
                ? `已接入 · ${stats.ai_config.chat_provider}`
                : stats.ai_config.chat_provider === "local"
                  ? "本机存档模式（后端未连接）"
                  : "演示模式（未配置 API Key）"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="tx-card p-5">
              <h3 className="font-bold mb-3">按实训方向</h3>
              {Object.keys(stats.by_role).length === 0 && (
                <p className="text-sm text-slate-400">暂无提交记录</p>
              )}
              {Object.entries(stats.by_role).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1 border-b border-slate-50">
                  <span>{k === "creative" ? "创意型" : k === "comm" ? "沟通型" : k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="tx-card p-5">
              <h3 className="font-bold mb-3">按关卡 Day</h3>
              {Object.keys(stats.by_day).length === 0 && (
                <p className="text-sm text-slate-400">暂无提交记录</p>
              )}
              {Object.entries(stats.by_day)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm py-1 border-b border-slate-50">
                    <span>Day {k}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
            </div>
          </div>

          {Object.keys(stats.prompt_dimension_avg).length > 0 && (
            <div className="tx-card p-5">
              <h3 className="font-bold mb-4 text-center">Prompt 维度均分（雷达）</h3>
              <PromptRadar items={PROMPT_RUBRIC} dimensions={stats.prompt_dimension_avg} size={260} />
            </div>
          )}

          <div className="tx-card p-5">
            <h3 className="font-bold mb-3">最近提交</h3>
            {stats.recent_submissions.length === 0 ? (
              <p className="text-sm text-slate-400">完成关卡并提交后，数据会出现在这里。</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs">
                      <th className="pb-2">Day</th>
                      <th className="pb-2">方向</th>
                      <th className="pb-2">得分</th>
                      <th className="pb-2">结果</th>
                      <th className="pb-2">任务</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_submissions.map((r) => (
                      <tr key={r.submission_id} className="border-t border-slate-50">
                        <td className="py-2">D{r.day}</td>
                        <td>{r.role === "creative" ? "创意型" : r.role === "comm" ? "沟通型" : r.role}</td>
                        <td className="font-medium">{r.overall}</td>
                        <td>{r.passed ? "✓" : "—"}</td>
                        <td className="text-xs text-slate-400 truncate max-w-[120px]">{r.task_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
