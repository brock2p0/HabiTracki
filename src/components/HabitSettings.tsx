import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import type { Habit, HabitType } from '../types';
import { HABIT_TYPE_EMOJIS } from '../types';

interface HabitSettingsProps {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
  onClose: () => void;
}

const HabitSettings: React.FC<HabitSettingsProps> = ({ habits, onUpdateHabits, onClose }) => {
  const [editingHabits, setEditingHabits] = useState([...habits]);

  const addHabit = () => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: 'NEW HABIT',
      type: 'goal',
      color: '#3B82F6', // Default blue color
    };
    const newHabits = [...editingHabits, newHabit];
    setEditingHabits(newHabits);
    onUpdateHabits(newHabits);
  };

  const updateHabit = (index: number, field: keyof Habit, value: string | HabitType) => {
    const newHabits = [...editingHabits];
    newHabits[index] = { ...newHabits[index], [field]: value };
    setEditingHabits(newHabits);
    onUpdateHabits(newHabits);
  };

  const deleteHabit = (index: number) => {
    const newHabits = editingHabits.filter((_, i) => i !== index);
    setEditingHabits(newHabits);
    onUpdateHabits(newHabits);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newHabits = [...editingHabits];
    const [reorderedItem] = newHabits.splice(result.source.index, 1);
    newHabits.splice(result.destination.index, 0, reorderedItem);
    setEditingHabits(newHabits);
    onUpdateHabits(newHabits);
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6" role="dialog" aria-labelledby="settings-heading" aria-modal="true">
      <div className="flex items-center justify-between mb-6">
        <h2 id="settings-heading" className="text-xl font-semibold text-slate-800">Customize Habits</h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close habit settings"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="habits">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 mb-6" role="list" aria-label="Habit configuration list">
              {editingHabits.map((habit, index) => (
                <Draggable key={habit.id} draggableId={habit.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center gap-3 p-3 bg-slate-50 rounded-lg transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      role="listitem"
                    >
                      <div className="text-slate-400 hover:text-slate-600 cursor-grab" aria-label={`Reorder ${habit.name} habit`}>
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <input
                        type="color"
                        value={habit.color}
                        onChange={(e) => updateHabit(index, 'color', e.target.value)}
                        className="p-1 h-10 w-10 border border-slate-300 rounded-lg cursor-pointer"
                        aria-label={`Color for ${habit.name}`}
                      />

                      <input
                        type="text"
                        value={habit.name}
                        onChange={(e) => updateHabit(index, 'name', e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Habit name..."
                        aria-label={`Name for habit ${index + 1}`}
                      />

                      <div className="relative">
                        <select
                          value={habit.type}
                          onChange={(e) => updateHabit(index, 'type', e.target.value as HabitType)}
                          className="appearance-none w-full bg-white px-3 py-2 pr-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          aria-label={`Type for habit ${index + 1}`}
                        >
                          {Object.keys(HABIT_TYPE_EMOJIS).map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {HABIT_TYPE_EMOJIS[habit.type]}
                        </span>
                      </div>

                      <button
                        onClick={() => deleteHabit(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label={`Delete ${habit.name} habit`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button
        onClick={addHabit}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors"
        aria-label="Add new habit"
      >
        <Plus className="w-4 h-4" />
        Add New Habit
      </button>
    </section>
  );
};

export default HabitSettings;