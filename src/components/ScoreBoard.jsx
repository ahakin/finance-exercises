export default function ScoreBoard({ score, total, attempts }) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="scoreboard" role="status" aria-live="polite">
      <div className="score-item">
        <span className="score-label">Score</span>
        <span className="score-value">
          {score}/{total}
        </span>
      </div>
      <div className="score-item">
        <span className="score-label">Accuracy</span>
        <span className="score-value">{percentage}%</span>
      </div>
      <div className="score-item">
        <span className="score-label">Attempts</span>
        <span className="score-value">{attempts}</span>
      </div>
    </div>
  );
}
