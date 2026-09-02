import { useDraggable, useDroppable } from "@dnd-kit/core";
import { financialStatements } from "../data/financialData";
import { itemExplanations } from "../data/itemExplanations";

function formatAmount(value) {
  return value < 0
    ? `(${Math.abs(value).toLocaleString()})`
    : value.toLocaleString();
}

function DraggableIncomeItem({ item, placed }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `income-item-${item.id}`,
    data: { item },
  });

  return (
    <div
      ref={setNodeRef}
      className={`income-bank-item ${isDragging ? "is-dragging" : ""} ${placed ? "is-placed" : ""}`}
      title={itemExplanations[item.id]}
      aria-label={`${item.label}: ${itemExplanations[item.id]}`}
      {...listeners}
      {...attributes}
    >
      <span>{item.label}</span>
      <span className="income-exercise-value">{formatAmount(item.value)}</span>
    </div>
  );
}

function IncomeDropSlot({ index, expectedItem, droppedItem, hasError }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `income-slot-${index}`,
  });
  const isCorrect = droppedItem?.id === expectedItem.id;

  return (
    <div
      ref={setNodeRef}
      className={`income-drop-slot ${isOver ? "is-over" : ""} ${isCorrect ? "is-correct" : ""} ${hasError ? "is-incorrect" : ""}`}
      aria-label={`Income statement position ${index + 1}`}
    >
      {droppedItem ? (
        <>
          <span>{droppedItem.label}</span>
          <span className="income-exercise-value">{formatAmount(droppedItem.value)}</span>
        </>
      ) : hasError ? (
        <span className="income-slot-feedback">Try again</span>
      ) : (
        <span className="income-slot-placeholder">Drop item and value here</span>
      )}
    </div>
  );
}

function IncomeStatementHeader() {
  return (
    <div className="income-exercise-statement-header">
      <h2>{financialStatements.company}</h2>
      <p className="statement-main-title">CONSOLIDATED INCOME STATEMENT</p>
      <p className="statement-units">(in millions of U.S. dollars)</p>
      <div className="income-exercise-period">
        <span>Year Ended</span>
        <span>Sept. 27, 2025</span>
      </div>
    </div>
  );
}

export default function IncomeStatementExercise({ drops, errors, onReset }) {
  const items = financialStatements.incomeStatement.items;
  const sortedItems = [...items].sort((a, b) => a.label.localeCompare(b.label));
  const placedIds = new Set(Object.values(drops));
  const completed = items.every((item, index) => drops[index] === item.id);

  return (
    <div className="income-ordering-exercise">
      <section className="income-exercise-column income-exercise-target">
        <IncomeStatementHeader />
        <div className="income-drop-list">
          {items.map((item, index) => (
            <IncomeDropSlot
              key={index}
              index={index}
              expectedItem={item}
              droppedItem={items.find((entry) => entry.id === drops[index])}
              hasError={Boolean(errors[index])}
            />
          ))}
        </div>
        {completed && <p className="income-complete-message">Income statement completed correctly!</p>}
      </section>

      <section className="income-exercise-column income-item-bank">
        <div className="income-bank-header">
          <h2>Items and Values</h2>
          <p>Drag each pair into its correct position on the left.</p>
          <button type="button" className="income-reset-button" onClick={onReset}>
            Reset exercise
          </button>
        </div>
        <div className="income-bank-list">
          {sortedItems.map((item) => (
            <DraggableIncomeItem
              key={item.id}
              item={item}
              placed={placedIds.has(item.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
