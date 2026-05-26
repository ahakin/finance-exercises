import { useDroppable } from "@dnd-kit/core";

export default function DropZone({ id, label, droppedItem, position }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  const className = `drop-zone ${isOver ? "drop-zone-over" : ""} ${
    droppedItem ? "drop-zone-filled" : ""
  }`;

  return (
    <div
      ref={setNodeRef}
      className={className}
      aria-label={`${position} drop zone for ${label}. ${
        droppedItem ? `Contains: ${droppedItem.label}` : "Empty, drag an item here"
      }`}
      role="region"
    >
      {droppedItem ? (
        <span className="dropped-label">{droppedItem.value.toLocaleString()}</span>
      ) : (
        <span className="placeholder">Drop {position} here</span>
      )}
    </div>
  );
}
