export type RoleId = "creative" | "comm";

export interface SaveGameV1 {
  version: 1;
  player_name: string;
  org: {
    bg_id: string;
    bg_name: string;
    team_id: string;
    team_name: string;
    level_start: "trainee";
  };
  role: RoleId;
  progress: {
    current_day: number;
    cleared_days: number[];
    task_attempts: Record<string, number>;
  };
  resources: {
    hints_left_today: number;
    last_play_date: string;
  };
  submissions: Record<string, SubmissionRecord>;
  badges: string[];
  updated_at: string;
}

export interface SubmissionRecord {
  submission_id: string;
  task_id: string;
  submitted_at: string;
  deliverable?: Record<string, string>;
  chat_log?: { role: string; content: string }[];
  scores: {
    overall: number;
    deliverable?: number;
    prompt?: number;
    passed: boolean;
  };
  dimensions?: {
    deliverable?: Record<string, number>;
    prompt?: Record<string, number>;
    comm?: Record<string, number>;
  };
  rubric?: {
    deliverable?: { id: string; name: string; max: number }[];
    prompt?: { id: string; name: string; max: number }[];
    comm?: { id: string; name: string; max: number }[];
  };
  polished_version?: {
    summary: string;
    content: Record<string, string>;
  };
  feedback: {
    deliverable: string[];
    prompt: string[];
    suggested_prompt?: string;
  };
}

export interface TaskSummary {
  id: string;
  day: number;
  title: string;
  title_rendered?: string;
  map_brief?: string;
  type: string;
  time_limit_seconds: number;
  scoring_mode: string;
}

export interface TaskDetail extends TaskSummary {
  role: string;
  brief_rendered: string;
  title_rendered: string;
  submit_schema: { key: string; label: string; type: string; required: boolean }[];
  chat: { enabled: boolean; mode: string; prompt_tips_checklist: string[] };
  hints: string[];
  scoring: { mode: string; pass_score: number };
}

export interface SubmitResult {
  submission_id: string;
  passed: boolean;
  scores: { overall: number; deliverable?: number; prompt?: number };
  dimensions?: {
    deliverable?: Record<string, number>;
    prompt?: Record<string, number>;
    comm?: Record<string, number>;
  };
  rubric?: {
    deliverable?: { id: string; name: string; max: number }[];
    prompt?: { id: string; name: string; max: number }[];
    comm?: { id: string; name: string; max: number; weight?: number }[];
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
  unlocked_next_day?: number;
}
