import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import HabitCard from './HabitCard';
import { Habit } from '../App';

interface HabitsDndGridProps {
  habits: Habit[];
  onReorder: (newHabits: Habit[]) => void;
  onToggle: (habitId: number) => void;
  onSelect: (habitId: number) => void;
}

interface SortableHabitCardProps {
  habit: Habit;
  idx: number;
  onToggle: (id: number) => void;
  onSelect: (id: number) => void;
}

function isTouchDevice() {
  if (typeof window !== 'undefined') {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.userAgent.toLowerCase().includes('mobi')
    );
  }
  return false;
}

function SortableHabitCard({ habit, idx, onToggle, onSelect }: SortableHabitCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.85 : 1,
        zIndex: isDragging ? 50 : 'auto',
        userSelect: isDragging ? 'none' : undefined,
        position: 'relative',
      }}
      {...attributes}
      className="group"
    >
      <HabitCard
        habit={habit}
        onToggle={() => onToggle(habit.id)}
        onSelect={() => onSelect(habit.id)}
        order={idx}
        dragHandleProps={{
          ...listeners,
          onTouchStart: () => { if (typeof document !== 'undefined') document.body.style.userSelect = 'none'; },
          onTouchEnd: () => { if (typeof document !== 'undefined') document.body.style.userSelect = ''; },
          onTouchCancel: () => { if (typeof document !== 'undefined') document.body.style.userSelect = ''; },
        }}
      />

    </div>
  );
}

const HabitsDndGrid: React.FC<HabitsDndGridProps> = ({ habits, onReorder, onToggle, onSelect }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = habits.findIndex(h => h.id === active.id);
      const newIndex = habits.findIndex(h => h.id === over.id);
      onReorder(arrayMove(habits, oldIndex, newIndex));
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={habits.map(h => h.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 grid-cols-2 gap-4">
          {habits.map((habit, idx) => (
            <SortableHabitCard
              key={habit.id}
              habit={habit}
              idx={idx}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default HabitsDndGrid;
