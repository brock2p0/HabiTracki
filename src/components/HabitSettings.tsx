import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, X } from 'lucide-react';
import type { Habit } from '../types';

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
      type: 'goal'
    };
    const newHabits = [...editingHabits, newHabit];
    setEditingHabits(newHabits);
    onUpdateHabits(newHabits);
  };

  const updateHabit = (index: number, field: keyof Habit, value: string) => {
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

  const moveHabit = (fromIndex: number, toIndex: number) => {
    const newHabits = [...editingHabits];
    const [movedHabit] = newHabits.splice(fromIndex, 1);
    newHabits.splice(toIndex, 0, movedHabit);
    setEditingHabits(newHabits);
    onUpdateHabits(newHabits);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'goal': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'avoid': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6" role="dialog" aria-labelledby="settings-heading" aria-modal="false">
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

      <div className="space-y-3 mb-6" role="list" aria-label="Habit configuration list">
        {editingHabits.map((habit, index) => (
          <div key={habit.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg" role="listitem">
            <button className="text-slate-400 hover:text-slate-600 cursor-grab" aria-label={`Reorder ${habit.name} habit`}>
              <GripVertical className="w-4 h-4" />
            </button>
            
            <input
              type="text"
              value={habit.name}
              onChange={(e) => updateHabit(index, 'name', e.target.value.toUpperCase())}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Habit name..."
              aria-label={`Habit ${index + 1} name`}
            />
            
            <select
              value={habit.type}
              onChange={(e) => updateHabit(index, 'type', e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${getTypeColor(habit.type)}`}
              aria-label={`Habit ${index + 1} type`}
            >
              <option value="critical">Critical</option>
              <option value="goal">Goal</option>
              <option value="avoid">Avoid</option>
            </select>
            
            <button
              onClick={() => deleteHabit(index)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={`Delete ${habit.name} habit`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addHabit}
        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors"
        aria-label="Add new habit"
      >
        <Plus className="w-4 h-4" />
        Add New Habit
      </button>

      <div className="mt-6 p-4 bg-slate-50 rounded-lg" role="region" aria-labelledby="habit-types-info">
        <h3 id="habit-types-info" className="text-sm font-medium text-slate-700 mb-2">Habit Types</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span><strong>Critical:</strong> Essential daily habits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
            <span><strong>Goal:</strong> Positive habits to build</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span><strong>Avoid:</strong> Habits to minimize</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HabitSettings;