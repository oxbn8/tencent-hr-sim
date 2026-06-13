import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import Layout from "../components/Layout";
import PenguinMascot from "../components/PenguinMascot";
import ScorePanel from "../components/ScorePanel";
import MentorPenguin from "../components/MentorPenguin";
import LevelCongratsModal from "../components/LevelCongratsModal";
import { useMentorTips } from "../hooks/useMentorTips";
import { formatChatContent } from "../utils/formatChat";
import { getContext, loadSave, writeSave } from "../store/save";
import type { SubmitResult, TaskDetail } from "../types";

interface ChatMsg {
  role: string;
  content: string;
  id?: string;
  images?: string[];
}

export default function Challenge() {
  const { taskId } = useParams<{ taskId: string }>();
  const nav = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState("");
  const [imageToolEnabled, setImageToolEnabled] = useState(false);
  const [imageConfigured, setImageConfigured] = useState(false);
  const [chatError, setChatError] = useState("");
  const [aiModel, setAiModel] = useState<{ provider: string; model: string; description?: string } | null>(null);
  const [deliverable, setDeliverable] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHint, setLoadingHint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [dialogueChoices, setDialogueChoices] = useState<{ id: string; label: string }[]>([]);
  const [dialogueTerminal, setDialogueTerminal] = useState(false);
  const startTime = useRef(Date.now());
  const [secondsLeft, setSecondsLeft] = useState(0);

  const save0 = loadSave();
  const { tip, pick, dismiss, showTip } = useMentorTips(save0?.role || "creative");

  useEffect(() => {
    const save = loadSave();
    if (!save || !taskId) {
      nav("/");
      return;
    }
    const ctx = getContext(save);
    api.getTask(taskId, {
      bg_name: ctx.bg_name,
      team_name: ctx.team_name,
      player_name: ctx.player_name,
    }).then(async (t) => {
      setTask(t);
      setSecondsLeft(t.time_limit_seconds);

      const aiCfg = await api.getAiModel().catch(() => null);
      const imgReady = !!aiCfg?.image?.configured;
      setImageConfigured(imgReady);
      setImageToolEnabled(imgReady && t.chat.enabled);

      if (t.chat.enabled) {
        const sess = await api.createChatSession(taskId, ctx);
        setSessionId(sess.session_id);
        setChatMode(sess.chat_mode);
        if (sess.image_tool_enabled || imgReady) setImageToolEnabled(true);
        setTips(sess.prompt_tips || []);
        if (sess.ai_model) setAiModel(sess.ai_model);
        if (sess.image_model?.configured) setImageConfigured(true);
        if (sess.initial_messages?.length) setMessages(sess.initial_messages as ChatMsg[]);
        if (sess.dialogue_choices?.length) setDialogueChoices(sess.dialogue_choices);
        setTimeout(() => pick("general"), 4000);
      }
    });
  }, [taskId, nav, pick]);

  useEffect(() => {
    if (!task) return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      setSecondsLeft(Math.max(0, task.time_limit_seconds - elapsed));
    }, 1000);
    return () => clearInterval(timer);
  }, [task]);

  const send = async (choiceId?: string, forceImage = false) => {
    if ((!input.trim() && !choiceId) || !sessionId) return;
    const userText = input.trim();
    const willGenImage = forceImage && imageToolEnabled;
    setChatError("");
    setLoading(true);
    setLoadingHint(willGenImage ? "混元 HY-Image V3.0 生图中，约需 15–30 秒…" : "混元思考中…");
    if (userText && !choiceId) {
      setMessages((prev) => [...prev, { role: "user", content: userText, id: `tmp-${Date.now()}` }]);
      setInput("");
    }
    try {
      const res = await api.sendChat(sessionId, userText, choiceId, willGenImage);
      setMessages(res.messages as ChatMsg[]);
      if (res.dialogue_choices) setDialogueChoices(res.dialogue_choices);
      if (res.dialogue_terminal) setDialogueTerminal(true);
      if (res.mentor_note) showTip(res.mentor_note);
      if (res.images?.[0]?.url) {
        setSelectedImage(res.images[0].url);
        setDeliverable((d) => ({ ...d, image_url: res.images[0].url }));
      } else if (willGenImage && res.action !== "image_gen") {
        setChatError("未返回图片，请确认 backend/.env 中 IMAGE_PROVIDER=hunyuan 并已重启后端。");
      }
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "发送失败，请检查后端是否运行");
    } finally {
      setLoading(false);
      setLoadingHint("");
    }
  };

  const submit = async () => {
    const save = loadSave();
    if (!save || !task) return;
    setSubmitting(true);
    const attempt = (save.progress.task_attempts[task.id] || 0) + 1;
    const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
    try {
      const res = await api.submit({
        task_id: task.id,
        deliverable: { ...deliverable, image_url: selectedImage || deliverable.image_url },
        chat_session_id: sessionId,
        elapsed_seconds: elapsed,
        attempt,
        context: getContext(save),
      });
      save.progress.task_attempts[task.id] = attempt;
      save.submissions[task.id] = {
        submission_id: res.submission_id,
        task_id: task.id,
        submitted_at: new Date().toISOString(),
        scores: { ...res.scores, passed: res.passed },
        dimensions: res.dimensions,
        rubric: res.rubric,
        polished_version: res.polished_version,
        feedback: {
          deliverable: res.feedback.deliverable,
          prompt: res.feedback.prompt,
          suggested_prompt: res.feedback.suggested_prompt,
        },
        deliverable: { ...deliverable },
        chat_log: messages.filter((m) => m.role !== "system"),
      };
      if (res.passed) {
        if (!save.progress.cleared_days.includes(task.day)) {
          save.progress.cleared_days.push(task.day);
        }
        save.progress.current_day = Math.max(
          save.progress.current_day,
          res.unlocked_next_day || task.day + 1
        );
        if (save.progress.cleared_days.length >= 7) {
          save.badges.push("trainee_graduate");
        }
      }
      writeSave(save);
      setResult(res);
      if (res.passed) {
        setShowCongrats(true);
      } else {
        setShowCongrats(false);
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
      pick(res.passed ? "on_pass" : "on_fail");
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return <Layout>加载任务…</Layout>;

  const fmt = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const isPoster = task.type === "aigc_poster";
  const isComm = task.role === "comm";
  const showImageTool = imageConfigured && task.chat.enabled;

  return (
    <Layout title={`Day ${task.day}`}>
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">{task.title_rendered}</h1>
        <span className={`font-mono text-sm ${secondsLeft < 60 ? "text-red-600" : "text-slate-500"}`}>
          ⏱ {fmt}
        </span>
      </div>

      <div className="tx-card p-5 mb-4 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
        {task.brief_rendered}
      </div>

      {!result && (
        <div className="space-y-4">
          <div className="tx-card p-5">
            <h3 className="font-bold mb-3 text-center">成稿提交</h3>
            {task.submit_schema.map((f) =>
              f.type === "image_pick" ? (
                <div key={f.key} className="mb-3">
                  <label className="text-sm font-medium">{f.label}</label>
                  {selectedImage && (
                    <img src={selectedImage} alt="poster" className="mt-2 rounded-xl max-h-48 mx-auto border" />
                  )}
                </div>
              ) : (
                <div key={f.key} className="mb-3">
                  <label className="text-sm font-medium">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-100 focus:border-[#006EFF]"
                      value={deliverable[f.key] || ""}
                      onChange={(e) => setDeliverable({ ...deliverable, [f.key]: e.target.value })}
                    />
                  ) : (
                    <input
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1 text-sm focus:ring-2 focus:ring-blue-100 focus:border-[#006EFF]"
                      value={deliverable[f.key] || ""}
                      onChange={(e) => setDeliverable({ ...deliverable, [f.key]: e.target.value })}
                    />
                  )}
                </div>
              )
            )}
          </div>

          {task.chat.enabled && (
            <div className="tx-card p-5">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-2 min-w-0">
                  <PenguinMascot size={44} pose="think" badge="ai" className="shrink-0 -mt-1" />
                  <div>
                    <h3 className="font-bold">AI Chat · AIGC</h3>
                    <p className="text-xs text-slate-400 mt-0.5">请输入提示词</p>
                  </div>
                </div>
                {aiModel && (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        aiModel.provider === "hunyuan"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                      title={aiModel.description}
                    >
                      {aiModel.provider === "hunyuan" ? "混元" : "演示"} · {aiModel.model}
                    </span>
                    {showImageTool && (
                      <span className="text-[10px] text-emerald-600">AIGC 生图已就绪</span>
                    )}
                  </div>
                )}
              </div>
              {tips.length > 0 && (
                <div className="text-xs bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
                  <div className="font-medium mb-1">Prompt 技巧 Checklist</div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                    {tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-2 mb-3 max-h-56 overflow-y-auto text-sm">
                {messages
                  .filter((m) => m.role !== "system")
                  .map((m) => (
                    <div
                      key={m.id || m.content.slice(0, 20)}
                      className={`p-3 rounded-xl ${m.role === "user" ? "bg-blue-50 ml-6" : "bg-slate-50 mr-6"}`}
                    >
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        {m.role === "user" ? (
                          "你"
                        ) : (
                          <>
                            <PenguinMascot size={20} pose="stand" className="inline" />
                            AI 助手
                          </>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed">{formatChatContent(m.content)}</div>
                      {m.images?.map((url) => (
                        <div key={url} className="mt-2 text-center">
                          <img src={url} alt="gen" className="rounded-lg max-h-64 mx-auto border shadow-sm" />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(url);
                              setDeliverable((d) => ({ ...d, image_url: url }));
                            }}
                            className="block mx-auto text-xs text-[#006EFF] mt-1"
                          >
                            选为提交海报
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                {loading && (
                  <div className="p-3 rounded-xl bg-slate-50 mr-6 text-sm text-slate-500 flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-[#006EFF] border-t-transparent rounded-full animate-spin" />
                    {loadingHint || "处理中…"}
                  </div>
                )}
              </div>
              {chatMode === "dialogue_sim" && dialogueChoices.length > 0 && !dialogueTerminal && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs font-bold text-amber-900 mb-2">🌳 分支对话 · 选择你的回应</p>
                  <div className="flex flex-col gap-2">
                    {dialogueChoices.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        disabled={loading}
                        onClick={() => send(c.id)}
                        className="text-left text-xs px-3 py-2 rounded-lg border border-amber-200 bg-white hover:border-[#006EFF] hover:bg-blue-50 transition"
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {dialogueTerminal && (
                <p className="text-xs text-green-700 bg-green-50 rounded-lg p-2 mb-3">
                  对话分支已到达终点，请完善成稿后提交。
                </p>
              )}
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:border-[#006EFF]"
                  placeholder="请输入提示词"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && (showImageTool ? send(undefined, true) : send())
                  }
                />
                {showImageTool ? (
                  <>
                    <button
                      type="button"
                      disabled={loading || !input.trim()}
                      onClick={() => send(undefined, true)}
                      className="px-4 py-2 bg-[#006EFF] text-white rounded-full text-sm disabled:opacity-50 shrink-0"
                    >
                      {loading ? "…" : "生图"}
                    </button>
                    <button
                      type="button"
                      disabled={loading || !input.trim()}
                      onClick={() => send(undefined, false)}
                      className="px-4 py-2 border border-slate-200 text-slate-600 rounded-full text-sm disabled:opacity-50 shrink-0"
                    >
                      文字
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={loading || !input.trim()}
                    onClick={() => send()}
                    className="px-5 py-2 bg-[#006EFF] text-white rounded-full text-sm disabled:opacity-50 min-w-[72px]"
                  >
                    {loading ? "…" : "发送"}
                  </button>
                )}
              </div>
              {!showImageTool && task.chat.enabled && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">
                  混元生图未配置：请检查 backend/.env 中 IMAGE_PROVIDER=hunyuan 与 HUNYUAN_API_KEY，并重启后端。
                </p>
              )}
              {chatError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg p-2 mb-3">{chatError}</p>
              )}
              {isComm && messages.some((m) => m.role === "assistant") && (
                <button
                  type="button"
                  className="text-xs text-[#006EFF] mt-2"
                  onClick={() => {
                    const last = [...messages].reverse().find((m) => m.role === "assistant");
                    if (last) setDeliverable({ ...deliverable, reply: last.content });
                  }}
                >
                  插入 AI 草稿到回复区（请人工修改）
                </button>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="tx-btn-primary w-full disabled:opacity-50"
          >
            {submitting ? "评分中…" : "提交并查看评分"}
          </button>
        </div>
      )}

      {result && !showCongrats && (
        <div className="relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <PenguinMascot size={64} pose={result.passed ? "celebrate" : "think"} badge="none" />
          </div>
          <ScorePanel
          passed={result.passed}
          scores={result.scores}
          dimensions={result.dimensions}
          rubric={result.rubric}
          feedback={result.feedback}
          polished_version={result.polished_version}
          onRetry={() => {
            setResult(null);
            setShowCongrats(false);
          }}
          onNext={() => nav("/game")}
        />
        </div>
      )}

      <LevelCongratsModal
        open={showCongrats && !!result?.passed}
        day={task.day}
        title={task.title_rendered}
        onContinue={() => {
          setShowCongrats(false);
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }}
      />
      <MentorPenguin tip={tip} onDismiss={dismiss} />
    </Layout>
  );
}
