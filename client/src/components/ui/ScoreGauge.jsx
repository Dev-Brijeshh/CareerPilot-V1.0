const scoreColor = (score) => {
  if (score >= 75) return "#059669"; // emerald-600
  if (score >= 50) return "#d97706"; // amber-600
  return "#e11d48"; // rose-600
};

/**
 * Renders a circular progress gauge for any 0-100 score (ATS score,
 * interview score, etc). Pure SVG so it needs no charting library and
 * is trivial to unit test (radius/circumference math is deterministic).
 */
const ScoreGauge = ({ score = 0, size = 120, strokeWidth = 10, label = "ATS Score" }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${clamped} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-900">{clamped}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;
