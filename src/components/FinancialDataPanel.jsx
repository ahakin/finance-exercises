import { useDraggable } from "@dnd-kit/core";
import { financialStatements, draggableItems } from "../data/financialData";

function DraggableRow({ item }) {
  const isDraggableItem = draggableItems.some((d) => d.id === item.id);
  const { attributes, listeners, setNodeRef, isDragging } =
    useDraggable({ id: item.id, disabled: !isDraggableItem });

  // Don't apply transform — let DragOverlay handle the visual movement
  const style = {
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr
      ref={isDraggableItem ? setNodeRef : undefined}
      style={style}
      {...(isDraggableItem ? listeners : {})}
      {...(isDraggableItem ? attributes : {})}
      className={`${item.isTotal ? "total-row" : ""} ${isDraggableItem ? "draggable-row" : ""}`}
      aria-label={
        isDraggableItem
          ? `Draggable: ${item.label}, value: ${item.value.toLocaleString()}`
          : undefined
      }
    >
      <td>
        {isDraggableItem && <span className="drag-icon">⠿</span>}
        {item.label}
      </td>
      <td className="amount">{item.value.toLocaleString()}</td>
    </tr>
  );
}

export default function FinancialDataPanel() {
  return (
    <div className="financial-data-panel">
      <h2>Financial Statements</h2>
      <p className="panel-subtitle">
        {financialStatements.company} — {financialStatements.period} (ended{" "}
        {financialStatements.fiscalYearEnd})
      </p>
      <p className="panel-drag-hint">
        Drag highlighted rows into the ratio formulas →
      </p>

      <div className="statements-grid">
        <div className="statement-section">
          <h3>Income Statement</h3>
          <table className="financial-table" aria-label="Income Statement">
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount ($M)</th>
              </tr>
            </thead>
            <tbody>
              {financialStatements.incomeStatement.items.map((item) => (
                <DraggableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="statement-section">
          <h3>Balance Sheet — Assets</h3>
          <table className="financial-table" aria-label="Balance Sheet Assets">
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount ($M)</th>
              </tr>
            </thead>
            <tbody>
              {financialStatements.balanceSheet.assets.map((item) => (
                <DraggableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>

          <h3 className="sub-section-header">Balance Sheet — Equity</h3>
          <table className="financial-table" aria-label="Balance Sheet Equity">
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount ($M)</th>
              </tr>
            </thead>
            <tbody>
              {financialStatements.balanceSheet.equity.map((item) => (
                <DraggableRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
