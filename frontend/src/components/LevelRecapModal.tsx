import PenguinMascot from "./PenguinMascot";
import type { SubmissionRecord } from "../types";

interface Props {
  open: boolean;
  onClose: () => void;
  day: number;
  title: string;
  submission: SubmissionRecord | null;
}

export default function LevelRecapModal({ open, onClose, day, title, submission }: Props) {
  if (!open || !submission) return null;

  const passed = submission.scores.passed;
  const polished = submission.polished_version;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`px-5 py-4 rounded-t-2xl ${passed ? "bg-[#006EFF] text-white" : "bg-slate-100 text-slate-800"}`}>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1">
              <p className="text-xs opacity-80">关卡复盘 · D{day}</p>
              <h3 className="font-bold text-lg mt-0.5">{title}</h3>
            </div>
            <PenguinMascot size={56} pose={passed ? "celebrate" : "think"} badge="none" />
            <button type="button" onClick={onClose} className="text-xl leading-none opacity-70 hover:opacity-100 absolute top-4 right-4">
              ×
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl font-bold">{submission.scores.overall}</span>
            <span className="text-sm px-2 py-0.5 rounded-full bg-white/20">{passed ? "已通关" : "未通关"}</span>
          </div>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {submission.scores.deliverable != null && (
            <p className="text-slate-600">
              成稿 {submission.scores.deliverable}
              {submission.scores.prompt != null && ` · Prompt ${submission.scores.prompt}`}
            </p>
          )}

          {submission.feedback.deliverable.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-700 mb-1">评分反馈</h4>
              <ul className="text-xs text-slate-600 space-y-1">
                {submission.feedback.deliverable.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
                {submission.feedback.prompt.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          )}

          {submission.deliverable && Object.keys(submission.deliverable).length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3">
              <h4 className="font-bold text-slate-700 mb-2">你的提交</h4>
              {Object.entries(submission.deliverable).map(([k, v]) =>
                k === "image_url" && v ? (
                  <img key={k} src={v} alt="poster" className="rounded-lg max-h-32 mx-auto border" />
                ) : (
                  <div key={k} className="mb-2">
                    <span className="text-xs text-slate-400">{k}</span>
                    <pre className="whitespace-pre-wrap text-xs text-slate-700 mt-0.5">{v}</pre>
                  </div>
                )
              )}
            </div>
          )}

          {polished && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <h4 className="font-bold text-[#006EFF] mb-1">✨ Polished Version</h4>
              <p className="text-xs text-slate-600 mb-2">{polished.summary}</p>
              {Object.entries(polished.content).map(([k, v]) => (
                <pre key={k} className="whitespace-pre-wrap text-xs text-slate-800 mb-1">
                  {v}
                </pre>
              ))}
            </div>
          )}

          <p className="text-[10px] text-slate-400">
            提交于 {new Date(submission.submitted_at).toLocaleString("zh-CN")}
          </p>
        </div>
      </div>
    </div>
  );
}
