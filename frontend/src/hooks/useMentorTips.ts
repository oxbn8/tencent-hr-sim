import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";

type TipPool = Record<string, string[]>;

export function useMentorTips(role: string) {
  const [tip, setTip] = useState<string | null>(null);
  const poolRef = useRef<TipPool>({});

  useEffect(() => {
    api.getMentorTips().then((d) => {
      poolRef.current = d as TipPool;
    });
  }, []);

  const pick = useCallback(
    (category: "general" | "creative" | "comm" | "on_pass" | "on_fail") => {
      const pool = poolRef.current;
      const roleTips = pool[role] || [];
      const catTips = pool[category] || [];
      const general = pool.general || [];
      const merged = category === "general" ? [...general, ...roleTips] : [...catTips, ...roleTips, ...general];
      if (!merged.length) return;
      setTip(merged[Math.floor(Math.random() * merged.length)]);
    },
    [role]
  );

  const dismiss = useCallback(() => setTip(null), []);

  const showTip = useCallback((text: string) => setTip(text), []);

  const scheduleRandom = useCallback(
    (intervalMs = 55000) => {
      const id = setInterval(() => pick("general"), intervalMs);
      return () => clearInterval(id);
    },
    [pick]
  );

  return { tip, pick, dismiss, showTip, scheduleRandom };
}
