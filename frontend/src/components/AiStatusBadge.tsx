import { useEffect, useState } from "react";
import { api } from "../api";

interface Props {
  variant?: "hero" | "light";
}

export default function AiStatusBadge({ variant = "hero" }: Props) {
  const [status, setStatus] = useState<{
    configured: boolean;
    provider: string;
    model: string;
    hint?: string;
  } | null>(null);

  useEffect(() => {
    api.getAiModel().then((d) =>
      setStatus({
        configured: d.chat.configured,
        provider: d.chat.provider,
        model: d.chat.model,
        hint: d.setup_hint,
      })
    );
  }, []);

  if (!status) return null;

  const connected = status.configured && status.provider === "hunyuan";
  const onLight = variant === "light";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
        connected
          ? onLight
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40"
          : onLight
            ? "bg-amber-50 text-amber-800 border border-amber-200"
            : "bg-amber-500/20 text-amber-100 border border-amber-400/40"
      }`}
      title={status.hint || undefined}
    >
      <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
      {connected ? `混元已接入 · ${status.model}` : "混元未接通 · 演示模式"}
    </div>
  );
}
