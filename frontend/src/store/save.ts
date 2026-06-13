const SAVE_KEY = "hr_sim_save_v1";

import type { SaveGameV1 } from "../types";

export function loadSave(): SaveGameV1 | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveGameV1;
  } catch {
    return null;
  }
}

export function writeSave(save: SaveGameV1): void {
  save.updated_at = new Date().toISOString();
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function createNewSave(params: {
  player_name: string;
  bg_id: string;
  bg_name: string;
  team_id: string;
  team_name: string;
  role: SaveGameV1["role"];
}): SaveGameV1 {
  const today = new Date().toISOString().slice(0, 10);
  return {
    version: 1,
    player_name: params.player_name,
    org: {
      bg_id: params.bg_id,
      bg_name: params.bg_name,
      team_id: params.team_id,
      team_name: params.team_name,
      level_start: "trainee",
    },
    role: params.role,
    progress: { current_day: 1, cleared_days: [], task_attempts: {} },
    resources: { hints_left_today: 3, last_play_date: today },
    submissions: {},
    badges: [],
    updated_at: new Date().toISOString(),
  };
}

export function refreshHints(save: SaveGameV1): SaveGameV1 {
  const today = new Date().toISOString().slice(0, 10);
  if (save.resources.last_play_date !== today) {
    save.resources.hints_left_today = 3;
    save.resources.last_play_date = today;
  }
  return save;
}

export function getContext(save: SaveGameV1) {
  return {
    bg_name: save.org.bg_name,
    team_name: save.org.team_name,
    player_name: save.player_name,
    bg_id: save.org.bg_id,
    team_id: save.org.team_id,
    role: save.role,
  };
}
