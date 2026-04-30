interface ProgressBarProps {
  value: number;
  tone?: "default" | "warning" | "danger";
}

export function ProgressBar({ value, tone = "default" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClass =
    tone === "danger"
      ? "bg-rose-500"
      : tone === "warning"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className={`h-full rounded-full transition-all ${toneClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
