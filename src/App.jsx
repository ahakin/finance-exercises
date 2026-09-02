import { useState, useCallback, useEffect } from "react";
import { DndContext, DragOverlay, KeyboardSensor, MeasuringStrategy, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import RatioCard from "./components/RatioCard";
import FinancialDataPanel from "./components/FinancialDataPanel";
import IncomeStatementExercise from "./components/IncomeStatementExercise";
import BalanceSheetExercise from "./components/BalanceSheetExercise";
import HomePage from "./components/HomePage";
import { financialStatements, profitabilityRatios, draggableItems } from "./data/financialData";
import "./App.css";

function App() {
  const [route, setRoute] = useState(
    window.location.hash ||
      (window.location.pathname === "/income-statement" ||
      window.location.pathname === "/balance-sheet"
        ? `#${window.location.pathname}`
        : "#/")
  );
  const incomeStatementOnly = route === "#/income-statement";
  const balanceSheetOnly = route === "#/balance-sheet";
  const homePage = route === "#/";
  const [drops, setDrops] = useState({});
  const [results, setResults] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [ratiosVisible, setRatiosVisible] = useState(false);
  const [incomeDrops, setIncomeDrops] = useState({});
  const [incomeErrors, setIncomeErrors] = useState({});
  const [balanceDrops, setBalanceDrops] = useState({});
  const [balanceErrors, setBalanceErrors] = useState({});

  useEffect(() => {
    const handleRouteChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleAccountPlacement = useCallback(
    (ratioId, position, itemId) => {
      const selectedItem = draggableItems.find((item) => item.id === itemId);
      const ratio = profitabilityRatios.find((item) => item.id === ratioId);
      if (!selectedItem || !ratio) return;

      if (selectedItem.id !== ratio[position]) {
        setResults((prev) => ({ ...prev, [ratioId]: false }));
        return;
      }

      const dropZoneId = `${ratioId}-${position}`;
      const newDrops = { ...drops, [dropZoneId]: selectedItem };
      setDrops(newDrops);

      const numerator = newDrops[`${ratioId}-numerator`];
      const denominator = newDrops[`${ratioId}-denominator`];
      setResults((prev) => {
        const updated = { ...prev };
        if (numerator && denominator) updated[ratioId] = true;
        else delete updated[ratioId];
        return updated;
      });
    },
    [drops]
  );

  const handleDragEnd = useCallback(
    (event) => {
      setActiveId(null);
      const { active, over } = event;
      let resolvedOverId = over?.id;

      if (!resolvedOverId && event.activatorEvent && event.delta) {
        const startX = event.activatorEvent.clientX;
        const startY = event.activatorEvent.clientY;
        if (Number.isFinite(startX) && Number.isFinite(startY)) {
          const elementAtDrop = document.elementFromPoint(
            startX + event.delta.x,
            startY + event.delta.y
          );
          const dropZone = elementAtDrop?.closest("[data-drop-zone-id]");
          if (dropZone?.dataset.dropZoneId) {
            resolvedOverId = dropZone.dataset.dropZoneId;
          }
        }
      }

      if (!resolvedOverId) return;

      if (
        String(active.id).startsWith("income-item-") &&
        String(resolvedOverId).startsWith("income-slot-")
      ) {
        const itemId = String(active.id).replace("income-item-", "");
        const slotIndex = Number(String(resolvedOverId).replace("income-slot-", ""));
        const expectedItem = financialStatements.incomeStatement.items[slotIndex];

        if (itemId !== expectedItem?.id) {
          setIncomeErrors((previous) => ({ ...previous, [slotIndex]: true }));
          return;
        }

        setIncomeDrops((previous) => {
          const updated = Object.fromEntries(
            Object.entries(previous).filter(([, placedId]) => placedId !== itemId)
          );
          updated[slotIndex] = itemId;
          return updated;
        });
        setIncomeErrors((previous) => {
          const updated = { ...previous };
          delete updated[slotIndex];
          return updated;
        });
        return;
      }

      if (
        String(active.id).startsWith("balance-item-") &&
        String(resolvedOverId).startsWith("balance-slot-")
      ) {
        const itemId = String(active.id).replace("balance-item-", "");
        const slotIndex = Number(String(resolvedOverId).replace("balance-slot-", ""));
        const balanceItems = financialStatements.balanceSheet.items.filter(
          (item) => item.value !== undefined
        );

        if (itemId !== balanceItems[slotIndex]?.id) {
          setBalanceErrors((previous) => ({ ...previous, [slotIndex]: true }));
          return;
        }

        setBalanceDrops((previous) => {
          const updated = Object.fromEntries(
            Object.entries(previous).filter(([, placedId]) => placedId !== itemId)
          );
          updated[slotIndex] = itemId;
          return updated;
        });
        setBalanceErrors((previous) => {
          const updated = { ...previous };
          delete updated[slotIndex];
          return updated;
        });
        return;
      }

      const draggedItemId = active.id;
      const dropZoneId = resolvedOverId;

      const targetRatio = profitabilityRatios.find((ratio) =>
        [`${ratio.id}-numerator`, `${ratio.id}-denominator`].includes(
          String(dropZoneId)
        )
      );

      if (targetRatio) {
        const position =
          draggedItemId === targetRatio.numerator
            ? "numerator"
            : draggedItemId === targetRatio.denominator
              ? "denominator"
              : null;

        if (position) {
          handleAccountPlacement(targetRatio.id, position, draggedItemId);
        } else {
          setResults((previous) => ({ ...previous, [targetRatio.id]: false }));
        }
        return;
      }

      // Parse drop zone: "ratioId-numerator" or "ratioId-denominator"
      const parts = dropZoneId.split("-");
      const position = parts.pop(); // "numerator" or "denominator"
      const ratioId = parts.join("-");

      handleAccountPlacement(ratioId, position, draggedItemId);
    },
    [handleAccountPlacement]
  );

  const handleClear = useCallback(
    (ratioId) => {
      const newDrops = { ...drops };
      delete newDrops[`${ratioId}-numerator`];
      delete newDrops[`${ratioId}-denominator`];
      setDrops(newDrops);
      setResults((prev) => {
        const updated = { ...prev };
        delete updated[ratioId];
        return updated;
      });
    },
    [drops]
  );

  const activeItem = activeId
    ? String(activeId).startsWith("income-item-")
      ? financialStatements.incomeStatement.items.find(
          (item) => item.id === String(activeId).replace("income-item-", "")
        )
      : String(activeId).startsWith("balance-item-")
        ? financialStatements.balanceSheet.items.find(
            (item) => item.id === String(activeId).replace("balance-item-", "")
          )
        : draggableItems.find((item) => item.id === activeId)
    : null;

  const renderRatioCard = (ratio) => {
    const numeratorDrop = drops[`${ratio.id}-numerator`];
    const denominatorDrop = drops[`${ratio.id}-denominator`];
    const result =
      numeratorDrop && denominatorDrop
        ? ratio.calculation === "average"
          ? (numeratorDrop.value + denominatorDrop.value) / 2
          : numeratorDrop.value / denominatorDrop.value
        : null;

    return (
      <RatioCard
        key={ratio.id}
        ratio={ratio}
        numeratorDrop={numeratorDrop}
        denominatorDrop={denominatorDrop}
        result={result}
        isCorrect={results[ratio.id] ?? null}
        onClear={() => handleClear(ratio.id)}
      />
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`app ${homePage ? "home-route-app" : ""} ${incomeStatementOnly ? "income-route-app" : ""}`}
      >
        {homePage ? (
          <HomePage />
        ) : (
        <>
        <header className="app-header">
          <h1>{incomeStatementOnly ? "Income Statement" : balanceSheetOnly ? "Balance Sheet" : "Financial Ratios: Drag and Drop Exercises"}</h1>
          {incomeStatementOnly && (
            <p className="exercise-page-instruction">
              Build the income statement by dragging each item and value into the correct order.
            </p>
          )}
          {balanceSheetOnly && (
            <p className="exercise-page-instruction">
              Build the balance sheet by dragging each item and value into the appropriate section and correct order.
            </p>
          )}
          {incomeStatementOnly || balanceSheetOnly ? (
            <a className="page-link" href="#/">Return to Homepage</a>
          ) : (
            <>
              <p className="app-subtitle">
                <strong className="instructions-label">Instructions:</strong> Drag from
                the financial statements and drop it to the formulas to calculate the
                ratios.
              </p>
              <a className="page-link" href="#/">Return to Homepage</a>
            </>
          )}
        </header>

        {incomeStatementOnly ? (
          <main className="income-statement-page">
            <IncomeStatementExercise
              drops={incomeDrops}
              errors={incomeErrors}
              onReset={() => {
                setIncomeDrops({});
                setIncomeErrors({});
              }}
            />
          </main>
        ) : balanceSheetOnly ? (
          <main className="income-statement-page balance-sheet-page">
            <BalanceSheetExercise
              drops={balanceDrops}
              errors={balanceErrors}
              onReset={() => {
                setBalanceDrops({});
                setBalanceErrors({});
              }}
            />
          </main>
        ) : (
        <div className="main-layout">
          {/* Left Panel: Financial Statements (draggable source) */}
          <aside className="left-panel">
            <FinancialDataPanel />
          </aside>

          {/* Right Panel: Ratio Cards (drop targets) */}
          <section className="right-panel">
            <h2>
              <button
                type="button"
                className="ratios-toggle"
                onClick={() => setRatiosVisible((visible) => !visible)}
                aria-expanded={ratiosVisible}
                aria-controls="profitability-ratio-content"
              >
                <span>Profitability Ratios</span>
                <span className="toggle-icon" aria-hidden="true">
                  {ratiosVisible ? "▾" : "▸"}
                </span>
              </button>
            </h2>
            {ratiosVisible && (
              <div id="profitability-ratio-content">
                <p className="panel-instruction">
                  Drag the numerator and denominator values into each formula.
                </p>
                <div className="ratio-cards">
                  {profitabilityRatios.map((ratio) => {
                    if (ratio.id === "roa" || ratio.id === "roe") return null;

                    if (
                      ratio.id === "average_total_assets" ||
                      ratio.id === "average_shareholders_equity"
                    ) {
                      const companionId =
                        ratio.id === "average_total_assets" ? "roa" : "roe";
                      const returnRatio = profitabilityRatios.find(
                        (item) => item.id === companionId
                      );

                      return (
                        <div
                          className={`average-ratio-group ${companionId}-ratio-group`}
                          key={`${companionId}-ratio-group`}
                        >
                          {renderRatioCard(ratio)}
                          {renderRatioCard(returnRatio)}
                        </div>
                      );
                    }

                    return renderRatioCard(ratio);
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
        )}
        <footer className="exercise-source-note">
          Source: Apple Inc., 2025 Form 10-K. This independent educational exercise is
          not affiliated with or endorsed by Apple Inc.
        </footer>
        </>
        )}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="drag-overlay-item">
            <span className="item-label">{activeItem.label}</span>
            <span className="item-value">
              ${activeItem.value.toLocaleString()}M
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
