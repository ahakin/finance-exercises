import DropZone from "./DropZone";

export default function RatioCard({
  ratio,
  numeratorDrop,
  denominatorDrop,
  result,
  isCorrect,
  onClear,
}) {
  const hasResult = numeratorDrop && denominatorDrop;

  return (
    <div className={`ratio-card ${isCorrect === true ? "correct" : ""} ${isCorrect === false ? "incorrect" : ""}`}>
      <div className="ratio-header">
        <h3>
          {ratio.name}
          <span className="ratio-formula-label"> = {ratio.formula}</span>
        </h3>
        {hasResult && (
          <button
            className="clear-btn"
            onClick={onClear}
            aria-label={`Clear answers for ${ratio.name}`}
          >
            ✕
          </button>
        )}
      </div>

      <div className="ratio-formula-area">
        <DropZone
          id={`${ratio.id}-numerator`}
          label={ratio.name}
          droppedItem={numeratorDrop}
          position="numerator"
        />
        <div className="divider-line" aria-hidden="true">
          ÷
        </div>
        <DropZone
          id={`${ratio.id}-denominator`}
          label={ratio.name}
          droppedItem={denominatorDrop}
          position="denominator"
        />
      </div>

      {hasResult && (
        <div className="ratio-result">
          <span className="result-calculation">
            <span className="result-value">{(result * 100).toFixed(2)}%</span>
          </span>
          {isCorrect === true && (
            <span className="result-feedback correct-feedback">✓ Correct!</span>
          )}
          {isCorrect === false && (
            <span className="result-feedback incorrect-feedback">
              ✗ Try again
            </span>
          )}
        </div>
      )}

      {!hasResult && null}
    </div>
  );
}
