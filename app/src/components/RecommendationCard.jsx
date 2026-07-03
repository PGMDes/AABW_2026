import { SectionCard } from "./SectionCard"
import { formatLabel } from "./formatLabel"
import { StatusBadge } from "./StatusBadge"

function ScoreBar({ label, score }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{score}</span>
      </div>
      <div
        aria-label={`${label} score`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={score}
        className="h-2 rounded-full bg-slate-100"
        role="progressbar"
      >
        <div
          className="h-2 rounded-full bg-cyan-600"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export function RecommendationCard({ recommendation, explanation }) {
  return (
    <SectionCard title="Recommendation result">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-lg bg-slate-950 p-5 text-white">
          <p className="text-sm font-medium text-cyan-200">Recommended path</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-4xl font-semibold">
              {formatLabel(recommendation.recommendedPath)}
            </p>
            <StatusBadge
              value={recommendation.recommendedPath}
              label={`${recommendation.confidence}% confidence`}
            />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            This recommendation is based on task clarity, sensitivity, risk,
            speed pressure, and capability fit.
          </p>
        </div>
        <div className="space-y-4">
          <ScoreBar label="Human fit" score={recommendation.humanFitScore} />
          <ScoreBar label="Agent fit" score={recommendation.agentFitScore} />
          <ScoreBar label="Hybrid fit" score={recommendation.hybridFitScore} />
        </div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-normal text-slate-500">
            Why this path fits
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {explanation.topReasons.map((reason) => (
              <li key={reason} className="rounded-md bg-slate-50 px-3 py-2">
                {reason}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-normal text-slate-500">
            Alternatives
          </h3>
          <div className="mt-3 space-y-3">
            {explanation.alternatives.map((alternative) => (
              <div
                key={alternative.path}
                className="rounded-md border border-slate-200 p-3"
              >
                <p className="font-medium text-slate-900">
                  {formatLabel(alternative.path)}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {alternative.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
