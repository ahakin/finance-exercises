import { useCallback, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import IncomeStatementExercise from "./components/IncomeStatementExercise";
import { financialStatements } from "./data/financialData";
import "./App.css";

export default function IncomeStandalone() {
  const [drops, setDrops] = useState({});
  const [errors, setErrors] = useState({});
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback((event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || !String(over.id).startsWith("income-slot-")) return;

    const itemId = String(active.id).replace("income-item-", "");
    const slotIndex = Number(String(over.id).replace("income-slot-", ""));
    const expectedItem = financialStatements.incomeStatement.items[slotIndex];

    if (itemId !== expectedItem?.id) {
      setErrors((previous) => ({ ...previous, [slotIndex]: true }));
      return;
    }

    setDrops((previous) => ({ ...previous, [slotIndex]: itemId }));
    setErrors((previous) => {
      const updated = { ...previous };
      delete updated[slotIndex];
      return updated;
    });
  }, []);

  const activeItem = activeId
    ? financialStatements.incomeStatement.items.find(
        (item) => item.id === String(activeId).replace("income-item-", "")
      )
    : null;

  const resetExercise = () => {
    setDrops({});
    setErrors({});
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={(event) => setActiveId(event.active.id)}
      onDragEnd={handleDragEnd}
    >
      <div className="app standalone-income-app">
        <header className="app-header standalone-income-header">
          <h1>Income Statement Drag and Drop Exercise</h1>
          <p className="app-subtitle">
            Drag each item and value into the correct position on the income statement.
          </p>
        </header>
        <main className="income-statement-page standalone-income-page">
          <IncomeStatementExercise drops={drops} errors={errors} onReset={resetExercise} />
        </main>
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="drag-overlay-item">
            <span className="item-label">{activeItem.label}</span>
            <span className="item-value">{activeItem.value.toLocaleString()}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
