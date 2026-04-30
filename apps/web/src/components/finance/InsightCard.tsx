interface InsightCardProps {
  title: string;
  description: string;
  tone?: "default" | "success" | "warning";
}

export function InsightCard({ title, description, tone = "default" }: InsightCardProps) {
  const toneClass =
    tone === "success"
      ? "border-emerald-100 bg-emerald-50"
      : tone === "warning"
        ? "border-amber-100 bg-amber-50"
        : "border-slate-200 bg-white";

  return (
    <article className={`rounded-xl border p-4 shadow-sm ${toneClass}`}>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </article>
  );
}
