import { useDraggable } from "@dnd-kit/core";
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
  const canDragResult = isCorrect === true && Boolean(ratio.resultItemId);
  const resultDrag = useDraggable({
    id: ratio.resultItemId ?? `${ratio.id}-result`,
    disabled: !canDragResult,
  });
  const displayedResult =
    ratio.calculation === "average"
      ? result?.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : `${(result * 100).toFixed(2)}%`;

  return (
    <div className={`ratio-card ratio-${ratio.id} ${isCorrect === true ? "correct" : ""} ${isCorrect === false ? "incorrect" : ""}`}>
      <div className="ratio-header">
        {ratio.calculation === "average" ? (
          <h3>
            {ratio.name}
            <span className="ratio-formula-label">
              {` = (${ratio.numeratorLabel} + ${ratio.denominatorLabel}) / 2`}
            </span>
          </h3>
        ) : ratio.displayAsFraction && ratio.id !== "roe" && ratio.id !== "roa" ? (
          <h3 className="average-formula-title">
            <span>{ratio.name} =</span>
            <span className="formula-fraction">
              <span className="formula-fraction-top">{ratio.numeratorLabel}</span>
              <span className="formula-fraction-bottom">{ratio.denominatorLabel}</span>
            </span>
          </h3>
        ) : (
          <h3>
            {ratio.name}
            <span className="ratio-formula-label">
              {ratio.id === "roe"
                ? " = Net income / Average shareholders' equity"
                : ` = ${ratio.formula}`}
            </span>
          </h3>
        )}
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
        {ratio.calculation === "average" && (
          <span className="formula-parenthesis" aria-hidden="true">(</span>
        )}
        <DropZone
          id={`${ratio.id}-numerator`}
          label={ratio.name}
          droppedItem={numeratorDrop}
          position="numerator"
          placeholder={ratio.numeratorPrompt}
        />
        <div className="divider-line" aria-hidden="true">
          {ratio.calculation === "average" ? "+" : "÷"}
        </div>
        <DropZone
          id={`${ratio.id}-denominator`}
          label={ratio.name}
          droppedItem={denominatorDrop}
          position="denominator"
          placeholder={ratio.denominatorPrompt}
        />
        {ratio.calculation === "average" && (
          <>
            <span className="formula-parenthesis" aria-hidden="true">)</span>
            <span className="average-divisor" aria-hidden="true">÷ 2</span>
          </>
        )}
      </div>

      {(hasResult || isCorrect === false) && (
        <div className="ratio-result" role="status" aria-live="polite">
          {hasResult && (
            <span className="result-calculation">
              <span
                ref={canDragResult ? resultDrag.setNodeRef : undefined}
                {...(canDragResult ? resultDrag.listeners : {})}
                {...(canDragResult ? resultDrag.attributes : {})}
                className={`result-value ${canDragResult ? "draggable-result" : ""}`}
                aria-label={canDragResult ? `Draggable: ${ratio.name}, value: ${displayedResult}` : undefined}
              >
                {displayedResult}
              </span>
            </span>
          )}
          {isCorrect === true && (
            <span className="result-feedback correct-feedback">✓ Correct!</span>
          )}
          {isCorrect === false && (
            <span className="result-feedback incorrect-feedback">
              ✗ Try again.
            </span>
          )}
        </div>
      )}

      {!hasResult && null}
    </div>
  );
}
