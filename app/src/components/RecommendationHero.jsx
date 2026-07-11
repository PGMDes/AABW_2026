import { formatLabel } from "./formatLabel"
import { StatusBadge } from "./StatusBadge"

export function RecommendationHero({ recommendation, selectedOption }) {
  const path = recommendation.recommendedPath
  return <section className={`decision-hero decision-hero--${path} p-5 text-white`}><p className="text-sm font-medium text-cyan-100">Recommended route</p><div className="mt-3 flex flex-wrap items-center gap-3"><h2 className="decision-path-title">{formatLabel(path)} recommendation</h2><StatusBadge value={path} label={`${recommendation.confidence}% confidence`} /></div><p className="mt-4 max-w-2xl text-slate-200">This decision uses the current task analysis, fit scores, and governance rules.</p>{path === "hybrid" && selectedOption ? <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-lg bg-white/10 p-3"><dt className="font-semibold text-white">Agent responsibility</dt><dd className="mt-1 text-slate-200">Agent prepares the first draft</dd></div><div className="rounded-lg bg-white/10 p-3"><dt className="font-semibold text-white">Human responsibility</dt><dd className="mt-1 text-slate-200">Human reviewer validates the draft</dd></div></dl> : null}</section>
}
