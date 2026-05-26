import { useState, useCallback } from "react";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import RatioCard from "./components/RatioCard";
import ScoreBoard from "./components/ScoreBoard";
import FinancialDataPanel from "./components/FinancialDataPanel";
import { profitabilityRatios, draggableItems } from "./data/financialData";
import "./App.css";

function App() {
  const [drops, setDrops] = useState({});
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [results, setResults] = useState({});
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const draggedItemId = active.id;
      const dropZoneId = over.id;

      // Parse drop zone: "ratioId-numerator" or "ratioId-denominator"
      const parts = dropZoneId.split("-");
      const position = parts.pop(); // "numerator" or "denominator"
      const ratioId = parts.join("-");

      const draggedItem = draggableItems.find((item) => item.id === draggedItemId);
      if (!draggedItem) return;

      const newDrops = {
        ...drops,
        [dropZoneId]: draggedItem,
      };
      setDrops(newDrops);

      // Check if both numerator and denominator are filled
      const numeratorKey = `${ratioId}-numerator`;
      const denominatorKey = `${ratioId}-denominator`;
      const numerator = position === "numerator" ? draggedItem : newDrops[numeratorKey];
      const denominator = position === "denominator" ? draggedItem : newDrops[denominatorKey];

      if (numerator && denominator) {
        const ratio = profitabilityRatios.find((r) => r.id === ratioId);
        if (!ratio) return;

        const isCorrect =
          numerator.id === ratio.numerator && denominator.id === ratio.denominator;

        setAttempts((prev) => prev + 1);
        if (isCorrect && !results[ratioId]) {
          setScore((prev) => prev + 1);
        }
        setResults((prev) => ({ ...prev, [ratioId]: isCorrect }));
      }
    },
    [drops, results]
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
    ? draggableItems.find((item) => item.id === activeId)
    : null;

  const completedCount = Object.values(results).filter(Boolean).length;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="app-header">
          <h1>📊 Financial Ratios — Interactive Learning</h1>
          <p className="app-subtitle">
            Drag items directly from the financial statements into each ratio
            formula to calculate profitability ratios.
          </p>
        </header>

        <ScoreBoard
          score={completedCount}
          total={profitabilityRatios.length}
          attempts={attempts}
        />

        <div className="main-layout">
          {/* Left Panel: Financial Statements (draggable source) */}
          <aside className="left-panel">
            <FinancialDataPanel />
          </aside>

          {/* Right Panel: Ratio Cards (drop targets) */}
          <section className="right-panel">
            <h2>Profitability Ratios</h2>
            <p className="panel-instruction">
              Drop the numerator and denominator for each ratio
            </p>
            <div className="ratio-cards">
              {profitabilityRatios.map((ratio) => {
                const numeratorDrop = drops[`${ratio.id}-numerator`];
                const denominatorDrop = drops[`${ratio.id}-denominator`];
                const result =
                  numeratorDrop && denominatorDrop
                    ? numeratorDrop.value / denominatorDrop.value
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
              })}
            </div>
          </section>
        </div>
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
