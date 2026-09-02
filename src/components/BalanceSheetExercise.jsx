import { useDraggable, useDroppable } from "@dnd-kit/core";
import { financialStatements } from "../data/financialData";
import { itemExplanations } from "../data/itemExplanations";

function formatAmount(value) {
  return value < 0
    ? `(${Math.abs(value).toLocaleString()})`
    : value.toLocaleString();
}

function DraggableBalanceItem({ item, placed }) {
  const temporaryQualifier = {
    marketable_securities_current: "short-term",
    marketable_securities_noncurrent: "long-term",
    term_debt_current: "short-term",
    term_debt_noncurrent: "long-term",
  }[item.id];
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `balance-item-${item.id}`,
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
      <span>
        {item.label}
        {temporaryQualifier && (
          <span className="balance-temporary-qualifier"> ({temporaryQualifier})</span>
        )}
      </span>
      <span className="income-exercise-value">{formatAmount(item.value)}</span>
    </div>
  );
}

function BalanceDropSlot({ index, droppedItem, hasError }) {
  const { setNodeRef, isOver } = useDroppable({ id: `balance-slot-${index}` });

  return (
    <div
      ref={setNodeRef}
      className={`income-drop-slot ${isOver ? "is-over" : ""} ${droppedItem ? "is-correct" : ""} ${hasError ? "is-incorrect" : ""}`}
      aria-label={`Balance sheet position ${index + 1}`}
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

export default function BalanceSheetExercise({ drops, errors, onReset }) {
  const allBalanceItems = financialStatements.balanceSheet.items;
  const items = allBalanceItems.filter((item) => item.value !== undefined);
  const liabilitiesStart = allBalanceItems.findIndex(
    (item) => item.id === "liabilities_equity_heading"
  );
  const equityStart = allBalanceItems.findIndex(
    (item) => item.id === "shareholders_equity_heading"
  );
  const itemGroups = [
    {
      title: "Assets",
      items: allBalanceItems.slice(0, liabilitiesStart),
    },
    {
      title: "Liabilities",
      items: allBalanceItems.slice(liabilitiesStart + 1, equityStart),
    },
    {
      title: "Shareholders' Equity",
      items: allBalanceItems.slice(equityStart + 1),
    },
  ].map((group) => ({
    ...group,
    items: group.items.filter((item) => item.value !== undefined),
  }));
  const placedIds = new Set(Object.values(drops));
  const completed = items.every((item, index) => drops[index] === item.id);
  const fixedHeadings = {
    assets_heading: "Assets",
    current_assets_heading: "Current Assets",
    noncurrent_assets_heading: "Non-current Assets",
    liabilities_equity_heading: "Liabilities",
    current_liabilities_heading: "Current Liabilities",
    noncurrent_liabilities_heading: "Non-current Liabilities",
    shareholders_equity_heading: "Shareholders' Equity",
  };

  return (
    <div className="income-ordering-exercise balance-ordering-exercise">
      <section className="income-exercise-column income-exercise-target">
        <div className="income-exercise-statement-header">
          <h2>{financialStatements.company}</h2>
          <p className="statement-main-title">CONSOLIDATED BALANCE SHEET</p>
          <p className="statement-units">(in millions of U.S. dollars)</p>
          <div className="income-exercise-period balance-exercise-period">
            <span>As of</span>
            <span>September 27, 2025</span>
          </div>
        </div>
        <div className="income-drop-list">
          {allBalanceItems.map((item) => {
            if (item.value === undefined) {
              const isMainHeading =
                item.id === "assets_heading" ||
                item.id === "liabilities_equity_heading" ||
                item.id === "shareholders_equity_heading";
              return (
                <h3
                  className={`balance-target-section-title ${isMainHeading ? "main-section" : "subsection"}`}
                  key={item.id}
                >
                  {fixedHeadings[item.id]}
                </h3>
              );
            }

            const index = items.findIndex((entry) => entry.id === item.id);
            return (
              <BalanceDropSlot
                key={item.id}
                index={index}
                droppedItem={items.find((entry) => entry.id === drops[index])}
                hasError={Boolean(errors[index])}
              />
            );
          })}
        </div>
        {completed && <p className="income-complete-message">Balance sheet completed correctly!</p>}
      </section>

      <section className="income-exercise-column income-item-bank">
        <div className="income-bank-header">
          <h2>2025 Items and Values</h2>
          <p>Drag each pair into its correct position on the left.</p>
          <button type="button" className="income-reset-button" onClick={onReset}>
            Reset exercise
          </button>
        </div>
        <div className="income-bank-list">
          {itemGroups.map((group) => (
            <div className="balance-bank-group" key={group.title}>
              <h3 className="balance-bank-section-title">{group.title}</h3>
              {[...group.items]
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((item) => (
                  <DraggableBalanceItem
                    key={item.id}
                    item={item}
                    placed={placedIds.has(item.id)}
                  />
                ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
