import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, X, Download, Upload } from 'lucide-react';
import type { Habit } from '../types';

interface HabitSettingsProps {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
  data: any;
  onUpdateData: (data: any) => void;
  onClose: () => void;
}

const HabitSettings: React.FC<HabitSettingsProps> = ({ habits, onUpdateHabits, data, onUpdateData, onClose }) => {
  const [editingHabits, setEditingHabits] = useState([...habits]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addHabit = () => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: 'NEW HABIT',
      type: 'goal',
      description: ''
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

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class after a small delay to avoid flickering
    setTimeout(() => {
      const element = e.target as HTMLElement;
      element.classList.add('dragging');
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const element = e.currentTarget as HTMLElement;
    element.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('drag-over');
    
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex !== dropIndex && draggedIndex !== null) {
      moveHabit(dragIndex, dropIndex);
    }
    
    setDraggedIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const element = e.target as HTMLElement;
    element.classList.remove('dragging');
    setDraggedIndex(null);
    
    // Clean up any remaining drag-over classes
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-habit-critical-50 text-habit-critical-700 border-habit-critical-200';
      case 'goal': return 'bg-habit-goal-50 text-habit-goal-800 border-habit-goal-200';
      case 'avoid': return 'bg-habit-avoid-50 text-habit-avoid-800 border-habit-avoid-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const exportData = () => {
    const exportObject = {
      habits: editingHabits,
      data: data,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `habitracker_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.habits && importedData.data) {
          setEditingHabits(importedData.habits);
          onUpdateHabits(importedData.habits);
          onUpdateData(importedData.data);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format. Please select a valid HabiTracki export file.');
        }
      } catch (error) {
        alert('Error reading file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be imported again
    event.target.value = '';
  };
  return (
    <section className="bg-secondary-bg rounded-2xl shadow-sm border border-slate-200 p-6 mb-6" role="dialog" aria-labelledby="settings-heading" aria-modal="false">
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
          <div
            key={habit.id} 
            className="p-3 bg-white rounded-lg transition-all duration-200" 
            role="listitem"
            draggable="true"
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="flex items-center gap-3 mb-3">
              <button className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing" aria-label={`Reorder ${habit.name} habit`}>
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
            
            <textarea
              value={habit.description || ''}
              onChange={(e) => updateHabit(index, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-y"
              placeholder="Describe what this habit means to you and how you define completion..."
              rows={2}
              maxLength={300}
              aria-label={`Description for ${habit.name} habit`}
            />
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

      {/* Import/Export Section */}
      <div className="mt-6 pt-6 border-t border-slate-200" role="region" aria-labelledby="data-management">
        <h3 id="data-management" className="text-sm font-medium text-slate-700 mb-4">Data Management</h3>
        <div className="flex gap-3">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            aria-label="Export all habit data"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              aria-label="Import habit data from file"
            />
          </label>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Export your data to backup or transfer to another device. Import previously exported data to restore your habits and progress.
        </p>
      </div>
      <div className="mt-6 p-4 bg-slate-50 rounded-lg" role="region" aria-labelledby="habit-types-info">
        <h3 id="habit-types-info" className="text-sm font-medium text-slate-700 mb-2">Habit Types</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-habit-critical-500 rounded-full"></div>
            <span><strong>Critical:</strong> Essential daily habits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-habit-goal-500 rounded-full"></div>
            <span><strong>Goal:</strong> Positive habits to build</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-habit-avoid-500 rounded-full"></div>
            <span><strong>Avoid:</strong> Habits to minimize</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HabitSettings;