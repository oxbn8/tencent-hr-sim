import PromptRadar from "./PromptRadar";

interface RubricItem {
  id: string;
  name: string;
  max: number;
}

interface Props {
  passed: boolean;
  scores: { overall: number; deliverable?: number; prompt?: number };
  dimensions?: {
    deliverable?: Record<string, number>;
    prompt?: Record<string, number>;
    comm?: Record<string, number>;
  };
  rubric?: {
    deliverable?: RubricItem[];
    prompt?: RubricItem[];
    comm?: RubricItem[];
  };
  feedback: {
    deliverable: string[];
    prompt: string[];
    suggested_prompt?: string;
    human_edit_score?: number;
  };
  polished_version?: {
    summary: string;
    content: Record<string, string>;
  };
  onRetry?: () => void;
  onNext?: () => void;
}

function DimensionBars({
  items,
  dimensions,
}: {
  items: RubricItem[];
  dimensions: Record<string, number>;
}) {
  return (
    <div className="space-y-2 mt-3">
      {items.map((r) => {
        const val = dimensions[r.id] ?? 0;
        const pct = Math.min(100, (val / r.max) * 100);
        return (
          <div key={r.id}>
            <div className="flex justify-between text-xs mb-0.5">
              <span>{r.name}</span>
              <span>
                {val}/{r.max}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#006EFF] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ScorePanel({
  passed,
  scores,
  dimensions,
  rubric,
  feedback,
  polished_version,
  onRetry,
  onNext,
}: Props) {
  return (
    <div className="tx-card p-6 mt-6 border-2 border-[#006EFF]/20 animate-in fade-in">
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-[#006EFF]">{scores.overall}</div>
        <div className="text-sm text-slate-500 mt-1">综合得分</div>
        <span
          className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-medium ${
            passed ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {passed ? "通关" : "未通关 — 可修改后重试（第二次 ×0.9）"}
        </span>
      </div>

      <div className={`grid gap-4 ${scores.prompt != null ? "md:grid-cols-2" : ""}`}>
        <div className="bg-slate-50 rounded-xl p-4">
          <h4 className="font-bold text-sm mb-1">成稿得分 · {scores.deliverable ?? scores.overall}</h4>
          {rubric?.deliverable && dimensions?.deliverable && (
            <DimensionBars items={rubric.deliverable} dimensions={dimensions.deliverable} />
          )}
          {rubric?.comm && dimensions?.comm && (
            <DimensionBars
              items={rubric.comm.map((c) => ({ ...c, max: 100 }))}
              dimensions={dimensions.comm}
            />
          )}
          <ul className="mt-3 text-xs space-y-1 text-slate-600">
            {feedback.deliverable.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </div>

        {scores.prompt != null && (
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="font-bold text-sm mb-1">提示词得分 · {scores.prompt}</h4>
            {rubric?.prompt && dimensions?.prompt && (
              <>
                <PromptRadar items={rubric.prompt} dimensions={dimensions.prompt} size={220} />
                <DimensionBars items={rubric.prompt} dimensions={dimensions.prompt} />
              </>
            )}
            <ul className="mt-3 text-xs space-y-1 text-slate-600">
              {feedback.prompt.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {feedback.human_edit_score != null && (
        <p className="text-sm text-center mt-4 text-slate-600">
          人工改写度：<strong>{feedback.human_edit_score}%</strong>
        </p>
      )}

      {polished_version && (
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <h4 className="font-bold text-[#006EFF] mb-2">✨ Polished Version（推荐成稿）</h4>
          <p className="text-xs text-slate-600 mb-3">{polished_version.summary}</p>
          <div className="text-sm space-y-2 bg-white/80 rounded-lg p-3">
            {Object.entries(polished_version.content).map(([k, v]) => (
              <div key={k}>
                <span className="text-xs text-slate-400 uppercase">{k}</span>
                <pre className="whitespace-pre-wrap font-sans text-slate-800">{v}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {feedback.suggested_prompt && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs">
          <span className="font-medium">推荐 Prompt：</span> {feedback.suggested_prompt}
        </div>
      )}

      <div className="flex gap-3 justify-center mt-6 flex-wrap">
        {!passed && onRetry && (
          <button type="button" onClick={onRetry} className="tx-btn-outline">
            修改后重试
          </button>
        )}
        {passed && onNext && (
          <button type="button" onClick={onNext} className="tx-btn-primary">
            下一天 →
          </button>
        )}
      </div>
    </div>
  );
}
