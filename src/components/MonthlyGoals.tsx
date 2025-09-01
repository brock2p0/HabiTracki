import React, { useState } from 'react';
import { Target, Check } from 'lucide-react';

interface MonthlyGoalsProps {
  goals: string[];
  onUpdateGoals: (goals: string[]) => void;
}

const MonthlyGoals: React.FC<MonthlyGoalsProps> = ({ goals, onUpdateGoals }) => {
  const [editingGoals, setEditingGoals] = useState(goals);
  const [completedGoals, setCompletedGoals] = useState<boolean[]>([false, false, false]);

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...editingGoals];
    newGoals[index] = value;
    setEditingGoals(newGoals);
    onUpdateGoals(newGoals);
  };

  const toggleGoalCompletion = (index: number) => {
    const newCompleted = [...completedGoals];
    newCompleted[index] = !newCompleted[index];
    setCompletedGoals(newCompleted);
  };

  return (
    <section className="bg-secondary-bg rounded-2xl shadow-sm border border-slate-200 p-6" aria-labelledby="goals-heading">
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5 text-indigo-600" />
        <h2 id="goals-heading" className="text-xl font-semibold text-slate-800">Monthly Goals</h2>
      </div>

      <div className="space-y-4" role="list" aria-label="Monthly goals list">
        {[0, 1, 2].map(index => (
          <div key={index} className="flex items-center gap-3" role="listitem">
            <button
              onClick={() => toggleGoalCompletion(index)}
              className={`
                w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
                ${completedGoals[index]
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 hover:border-slate-400'
                }
              `}
              aria-label={`Mark goal ${index + 1} as ${completedGoals[index] ? 'incomplete' : 'complete'}`}
              aria-pressed={completedGoals[index]}
            >
              {completedGoals[index] && <Check className="w-4 h-4" />}
            </button>
            
            <input
              type="text"
              value={editingGoals[index] || ''}
              onChange={(e) => handleGoalChange(index, e.target.value)}
              placeholder={`Goal ${index + 1}...`}
              className={`
                flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all
                ${completedGoals[index] ? 'line-through text-slate-500 bg-slate-50' : ''}
              `}
              maxLength={100}
              aria-label={`Goal ${index + 1} text input`}
            />
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 pt-4 border-t border-slate-200" role="region" aria-labelledby="goals-progress">
        <div className="flex items-center justify-between text-sm">
          <span id="goals-progress" className="text-slate-600">Progress</span>
          <span className="font-medium text-slate-800">
            {completedGoals.filter(Boolean).length}/3 goals completed
          </span>
        </div>
        <div className="mt-2 w-full bg-slate-200 rounded-full h-2" role="progressbar" aria-valuenow={(completedGoals.filter(Boolean).length / 3) * 100} aria-valuemin={0} aria-valuemax={100} aria-label="Overall goals completion progress">
          <div 
            className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedGoals.filter(Boolean).length / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default MonthlyGoals;