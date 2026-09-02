import { useDraggable } from "@dnd-kit/core";
import { financialStatements, draggableItems } from "../data/financialData";

function formatAmount(value) {
  return value < 0
    ? `(${Math.abs(value).toLocaleString()})`
    : value.toLocaleString();
}

function AmountCell({ value, dragItem, staticId }) {
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({ id: dragItem?.id ?? staticId, disabled: !dragItem });

  const style = {
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <td
      ref={dragItem ? setNodeRef : undefined}
      style={style}
      {...(dragItem ? listeners : {})}
      {...(dragItem ? attributes : {})}
      className={`amount ${dragItem ? "draggable-value-cell" : ""}`}
      aria-label={
        dragItem
          ? `Draggable: ${dragItem.label}, value: ${dragItem.value.toLocaleString()}`
          : undefined
      }
    >
      <span className="amount-value">{formatAmount(value)}</span>
    </td>
  );
}

function DraggableRow({ item }) {
  const currentDragItem = draggableItems.find((entry) => entry.id === item.id);
  const previousDragItem = draggableItems.find(
    (entry) => entry.id === `${item.id}_beginning`
  );

  return (
    <tr
      className={`${item.isTotal ? "total-row" : ""} ${item.emphasize ? "emphasized-row" : ""} ${item.underline ? "value-underline" : ""}`}
    >
      <td style={{ paddingLeft: `${10 + (item.indent ?? 0) * 14}px` }}>
        {item.label}
      </td>
      <AmountCell
        value={item.value}
        dragItem={currentDragItem}
        staticId={`${item.id}-current`}
      />
      {item.previousValue !== undefined && (
        <AmountCell
          value={item.previousValue}
          dragItem={previousDragItem}
          staticId={`${item.id}-previous`}
        />
      )}
    </tr>
  );
}

function StatementRow({ item, columnCount = 2 }) {
  if (item.isStatementHeading) {
    return (
      <tr className={`statement-title-row ${item.unshaded ? "unshaded-row" : ""}`}>
        <th colSpan={columnCount} scope="rowgroup">{item.label}</th>
      </tr>
    );
  }

  if (item.isSectionHeader) {
    return (
      <tr className="statement-group-row">
        <td colSpan={columnCount}>{item.label}</td>
      </tr>
    );
  }

  return <DraggableRow item={item} />;
}

export default function FinancialDataPanel({
  incomeOnly = false,
  hideHeader = false,
  sortIncomeItems = false,
  hideValueLines = false,
}) {
  const incomeItems = sortIncomeItems
    ? [...financialStatements.incomeStatement.items].sort((a, b) =>
        a.label.localeCompare(b.label)
      )
    : financialStatements.incomeStatement.items;

  return (
    <div className={`financial-data-panel ${hideValueLines ? "no-value-lines" : ""}`}>
      <div
        className={`financial-sticky-header ${hideHeader ? "hidden-copy-header" : ""}`}
        aria-hidden={hideHeader || undefined}
      >
        <h2>{financialStatements.company}</h2>
        <p className="statement-main-title">CONSOLIDATED FINANCIAL STATEMENTS</p>
        <p className="statement-units">(in millions of U.S. dollars)</p>

      </div>

      <div className={`statements-grid ${incomeOnly ? "income-only" : ""}`}>
        <div className="statement-section">
          <div className="statement-column-heading">
            <h3>Income Statement</h3>
            <div className="income-period-heading">
              <span className="period-heading">Year Ended</span>
              <span className="date-heading">Sept. 27, 2025</span>
            </div>
          </div>
          <table className="financial-table" aria-label="Income Statement">
            <colgroup>
              <col className="income-name-col" />
              <col className="income-value-col" />
            </colgroup>
            <thead className="sr-only">
              <tr>
                <th scope="col">Account</th>
                <th scope="col">September 27, 2025, in millions of dollars</th>
              </tr>
            </thead>
            <tbody>
              {incomeItems.map((item) => (
                <StatementRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>

        {!incomeOnly && (
          <div className="statement-section balance-sheet-section">
            <div className="statement-column-heading">
              <h3>Balance Sheet</h3>
              <div className="balance-period-heading">
                <span className="period-heading">Year Ended</span>
                <span className="balance-date-pair">
                  <span className="date-heading">
                    <span>Sept. 27,</span>
                    <span>2025</span>
                  </span>
                  <span className="date-heading">
                    <span>Sept. 28,</span>
                    <span>2024</span>
                  </span>
                </span>
              </div>
            </div>
            <table className="financial-table balance-sheet-table" aria-label="Comparative Balance Sheet">
            <colgroup>
              <col className="balance-name-col" />
              <col className="balance-current-col" />
              <col className="balance-prior-col" />
            </colgroup>
            <thead className="sr-only">
              <tr>
                <th scope="col">Account</th>
                <th scope="col">September 27, 2025, in millions of dollars</th>
                <th scope="col">September 28, 2024, in millions of dollars</th>
              </tr>
            </thead>
            <tbody>
              {financialStatements.balanceSheet.items.map((item) => (
                <StatementRow key={item.id} item={item} columnCount={3} />
              ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="financial-source">
        Source:{" "}
        <a
          href="https://www.sec.gov/Archives/edgar/data/320193/000032019325000079/aapl-20250927.htm"
          target="_blank"
          rel="noreferrer"
        >
          Apple Inc. 2025 Form 10-K
        </a>
        . Amounts are in millions of U.S. dollars.
      </p>
    </div>
  );
}
