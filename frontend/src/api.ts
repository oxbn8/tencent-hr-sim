import type { SubmitResult, TaskDetail, TaskSummary } from "./types";

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || res.statusText);
  }
  return res.json();
}

export const api = {
  getOrg: () => json<{ business_groups: unknown[]; teams: unknown[]; levels: unknown[] }>("/api/config/org"),
  getRoles: () => json<{ roles: unknown[]; tcamp_url: string }>("/api/config/roles"),
  getAiModel: () =>
    json<{
      chat: { provider: string; model: string; configured: boolean; upgradeable: boolean; description: string };
      image: { provider: string; model: string; configured: boolean; upgradeable?: boolean };
      setup_hint?: string;
    }>("/api/config/ai-model"),
  getMentorTips: () => json<Record<string, string[]>>("/api/admin/mentor-tips"),
  getAdminStats: async () => {
    const paths = ["/api/admin/stats", "/api/config/admin-stats"];
    let lastErr: Error | null = null;
    for (const path of paths) {
      try {
        return await json<{
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
        }>(path);
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
      }
    }
    throw lastErr ?? new Error("无法加载管理看板");
  },
  getTasks: (role: string, ctx?: Record<string, string>) => {
    const q = new URLSearchParams({ role, ...ctx }).toString();
    return json<TaskSummary[]>(`/api/config/tasks?${q}`);
  },
  getTask: (id: string, ctx: Record<string, string>) => {
    const q = new URLSearchParams(ctx).toString();
    return json<TaskDetail>(`/api/config/task/${id}?${q}`);
  },
  createChatSession: (task_id: string, context: Record<string, string>) =>
    json<{
      session_id: string;
      chat_mode: string;
      prompt_tips: string[];
      ai_model?: { provider: string; model: string; description?: string };
      image_model?: { provider: string; model: string; configured?: boolean };
      image_tool_enabled?: boolean;
      initial_messages?: { role: string; content: string; id?: string; images?: string[] }[];
      dialogue_choices?: { id: string; label: string }[];
      dialogue_opening?: string;
    }>("/api/chat/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id, context }),
    }),
  sendChat: (session_id: string, content: string, choice_id?: string, force_image?: boolean) =>
    json<{
      messages: unknown[];
      assistant_text: string;
      images: { url: string; message_id: string; prompt?: string }[];
      action?: "text" | "image_gen" | "dialogue";
      dialogue_choices?: { id: string; label: string }[];
      dialogue_terminal?: boolean;
      mentor_note?: string;
    }>("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id,
        content,
        choice_id: choice_id || "",
        force_image: force_image ?? false,
      }),
    }),
  submit: (body: unknown) =>
    json<SubmitResult>("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  getSubmission: (id: string) => json<SubmitResult & { passed: boolean }>(`/api/submission/${id}`),
  analyzePersonality: (role: string, submissions: unknown[]) =>
    json<{
      work_style: string;
      traits: string[];
      strengths: string[];
      weaknesses: string[];
      role_fit: string;
      analysis_summary: string;
    }>("/api/analyze-personality", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, submissions }),
    }),
  sendFeedback: (body: { player_name: string; role: string; rating: number; comment: string; meta?: unknown }) =>
    json<{ ok: boolean }>("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};
