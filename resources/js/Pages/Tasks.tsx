import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "@/Components/SortableItem";

type ColumnType = {
  [key: string]: string[];
};

export default function Tasks() {
  const [columns, setColumns] = useState<ColumnType>({
    todo: ["Task 1", "Task 2"],
    inProgress: ["Task 3"],
    done: ["Task 4"],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const updated = { ...columns };

    for (const key in updated) {
      if (updated[key].includes(active.id as string)) {
        const oldIndex = updated[key].indexOf(active.id as string);
        updated[key].splice(oldIndex, 1);
      }
    }

    for (const key in updated) {
      if (updated[key].includes(over.id as string)) {
        const newIndex = updated[key].indexOf(over.id as string);
        updated[key].splice(newIndex, 0, active.id as string);
      }
    }

    setColumns(updated);
  };

  return (
    <AuthenticatedLayout header="Tasks">
      <div className="p-6 bg-white min-h-screen">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(columns).map(([key, items]) => (
              <div key={key} className="bg-gray-100 p-4 rounded shadow">
                <h2 className="font-bold capitalize mb-4">{key}</h2>
                <SortableContext items={items} strategy={verticalListSortingStrategy}>
                  {items.map((item) => (
                    <SortableItem key={item} id={item} />
                  ))}
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </AuthenticatedLayout>
  );
}
