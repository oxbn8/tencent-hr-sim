import type { SaveGameV1 } from "../types";

export interface AdminStatsData {
  generated_at?: string;
  totals: {
    submissions: number;
    passed: number;
    pass_rate: number;
    avg_overall_score: number;
    feedback_count: number;
  };
  by_role: Record<string, number>;
  by_day: Record<string, number>;
  prompt_dimension_avg: Record<string, number>;
  deliverable_dimension_avg: Record<string, number>;
  ai_config: { chat_provider: string; chat_configured: boolean };
  recent_submissions: {
    submission_id: string;
    task_id: string;
    day: number;
    role: string;
    passed: boolean;
    overall: number;
    submitted_at?: string;
  }[];
  recent_feedback: { player_name: string; rating: number; comment: string }[];
}

export function buildAdminStatsFromSave(save: SaveGameV1 | null): AdminStatsData | null {
  if (!save) return null;

  const subs = Object.values(save.submissions);
  const passed = subs.filter((s) => s.scores.passed).length;
  const overallScores = subs.map((s) => s.scores.overall).filter((n) => typeof n === "number");

  const byRole: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  const promptDims: Record<string, number[]> = {};

  for (const s of subs) {
    const role = save.role;
    byRole[role] = (byRole[role] || 0) + 1;
    const day = s.task_id.match(/d(\d+)/)?.[1] || "?";
    byDay[day] = (byDay[day] || 0) + 1;
    const pd = s.dimensions?.prompt;
    if (pd) {
      for (const [k, v] of Object.entries(pd)) {
        promptDims[k] = promptDims[k] || [];
        promptDims[k].push(Number(v));
      }
    }
  }

  return {
    generated_at: new Date().toISOString(),
    totals: {
      submissions: subs.length,
      passed,
      pass_rate: subs.length ? Math.round((passed / subs.length) * 1000) / 10 : 0,
      avg_overall_score: overallScores.length
        ? Math.round((overallScores.reduce((a, b) => a + b, 0) / overallScores.length) * 10) / 10
        : 0,
      feedback_count: 0,
    },
    by_role: byRole,
    by_day: byDay,
    prompt_dimension_avg: Object.fromEntries(
      Object.entries(promptDims).map(([k, vals]) => [
        k,
        Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
      ])
    ),
    deliverable_dimension_avg: {},
    ai_config: { chat_provider: "local", chat_configured: false },
    recent_submissions: subs
      .slice()
      .sort((a, b) => (b.submitted_at || "").localeCompare(a.submitted_at || ""))
      .slice(0, 15)
      .map((s) => ({
        submission_id: s.submission_id,
        task_id: s.task_id,
        day: Number(s.task_id.match(/d(\d+)/)?.[1] || 0),
        role: save.role,
        passed: s.scores.passed,
        overall: s.scores.overall,
        submitted_at: s.submitted_at,
      })),
    recent_feedback: [],
  };
}
